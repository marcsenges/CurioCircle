"""Deploy verified EU D1; enable the invited beta test only after closed and live checks."""
import hashlib, json, os, pathlib, re, secrets, sqlite3, time
import urllib.request, urllib.error

ROOT=pathlib.Path(__file__).resolve().parent.parent
ACCOUNT_HASH="9b6fe543e9ae22689f9bbf55e6f594eb0906fdefb30841529db43fdfee69d8d1"
DATABASE_HASH="fe7fbe8c89a60bde00261597b8069c911c7e3299724adc602591827db19dfa88"
NAME="curiocircle-api"
API="https://api.cloudflare.com/client/v4/"
token=os.environ.get("CF_TOKEN")
if not token: raise SystemExit("Missing CLOUDFLARE_API_TOKEN")
def digest(value): return hashlib.sha256(str(value).encode()).hexdigest()
def api(path,method="GET",data=None,ctype="application/json"):
    payload=None if data is None else data if isinstance(data,bytes) else json.dumps(data).encode()
    req=urllib.request.Request(API+path,data=payload,method=method,headers={"Authorization":"Bearer "+token,"Accept":"application/json","Content-Type":ctype})
    try:
        with urllib.request.urlopen(req,timeout=30) as response: obj=json.load(response)
    except urllib.error.HTTPError as e:
        # Only status and numeric API error codes, never request or response secrets.
        try: codes=[x.get("code") for x in json.loads(e.read()).get("errors",[]) if isinstance(x.get("code"),int)]
        except Exception: codes=[]
        raise SystemExit("Cloudflare request failed: HTTP "+str(e.code)+" codes "+str(codes))
    if not obj.get("success"): raise SystemExit("Cloudflare returned unsuccessful response")
    return obj.get("result")
groups=[[0,2,6,9,13,17,19,35,38,40,44,47,62,67,71,84,88,98],[1,5,14,23,30,42,61,66,76,79,92],[3,8,11,15,20,25,29,32,34,37,45,49,53,57,60,73,77,81,87,90,96],[4,7,10,12,16,18,21,24,26,27,31,33,39,46,50,55,58,59,64,69,74,75,85,89,95,97],[36,43,48,51,54,56,63,65,72,80,83,86,93,94],[22,28,41,52,68,70,78,82,91,99]]
catalogue=json.loads((ROOT/"questions.json").read_text())
rows=[]
for i,q in enumerate(catalogue["questions"]):
    assert q["id"]==i
    c=q.get("category",next((j for j,g in enumerate(groups) if i in g),-1))
    assert isinstance(c,int) and 0<=c<=7
    rows.append((i,c))
schema=(ROOT/"backend/schema.sql").read_text()
# Test schema and constraints against a disposable SQLite database before touching D1.
with sqlite3.connect(":memory:") as test:
    test.executescript(schema)
    test.executemany("INSERT INTO cc_question(id,category) VALUES(?,?)",[(i,min(cat,5)) for i,cat in rows])
    test.executemany("INSERT INTO cc_question_category(question_id,category) VALUES(?,?)",rows)
    assert test.execute("SELECT COUNT(*) FROM cc_question_category").fetchone()[0]==len(rows)
    assert test.execute("SELECT COUNT(*) FROM cc_question").fetchone()[0]==len(rows)
    test.execute("INSERT INTO cc_vote VALUES(?,?,?,?,?,?,?)",(0,"a"*64,1,1,"de","0.9.6 (Beta)","2026-11-24"))
    try: test.execute("INSERT INTO cc_vote VALUES(?,?,?,?,?,?,?)",(0,"b"*64,1,9,"de","0.9.6 (Beta)","2026-11-24"))
    except sqlite3.IntegrityError: pass
    else: raise SystemExit("Vote constraint test failed")
print("OK: disposable schema and catalogue check",flush=True)
accounts=api("accounts?per_page=50")
matches=[a["id"] for a in accounts if digest(a.get("id"))==ACCOUNT_HASH]
if len(matches)!=1: raise SystemExit("Expected account not found")
base="accounts/"+matches[0]
databases=api(base+"/d1/database?name=curiocircle-db&per_page=100")
dbs=[d["uuid"] for d in databases if digest(d.get("uuid"))==DATABASE_HASH and d.get("name")=="curiocircle-db"]
if len(dbs)!=1: raise SystemExit("Expected database not found")
db_id=dbs[0]
dbpath=base+"/d1/database/"+db_id
if api(dbpath).get("jurisdiction")!="eu": raise SystemExit("EU jurisdiction not confirmed")
print("OK: correct account and EU database",flush=True)
def sql(statement,params=None):
    result=api(dbpath+"/query","POST",{"sql":statement,"params":params or []})
    if not isinstance(result,list) or not all(r.get("success") for r in result):
        raise SystemExit("D1 statement failed")
    return result
# Each statement is additive. No user rows created in remote smoke test.
statement=""
for line in schema.splitlines(keepends=True):
    statement+=line
    if sqlite3.complete_statement(statement):
        sql(statement)
        statement=""
if statement.strip(): raise SystemExit("Incomplete schema statement")
for start in range(0,len(rows),40):
    batch=rows[start:start+40]
    sql("INSERT INTO cc_question(id,category) VALUES "+",".join("(?,?)" for _ in batch)+" ON CONFLICT(id) DO UPDATE SET category=excluded.category",[x for i,cat in batch for x in (i,min(cat,5))])
    sql("INSERT INTO cc_question_category(question_id,category) VALUES "+",".join("(?,?)" for _ in batch)+" ON CONFLICT(question_id) DO UPDATE SET category=excluded.category",[x for row in batch for x in row])
actual=sql("SELECT COUNT(*) AS n FROM cc_question")[0]["results"][0]["n"]
if actual!=len(rows): raise SystemExit("Catalogue row count mismatch; no deletion attempted")
assert sql("SELECT COUNT(*) AS n FROM cc_question_category")[0]["results"][0]["n"]==len(rows)
assert sql("SELECT COUNT(*) AS n FROM cc_question_category WHERE category>=6")[0]["results"][0]["n"]==sum(cat>=6 for i,cat in rows)
print("OK: D1 schema and catalogue written, "+str(actual)+" questions; no feedback rows inserted",flush=True)
# Preserve existing admin secret on future deploys. Always keep public feedback disabled.
metadata={"main_module":"worker.mjs","compatibility_date":"2026-01-01","bindings":[{"type":"d1","name":"DB","id":db_id},{"type":"plain_text","name":"FEEDBACK_ENABLED","text":"false"}],"keep_bindings":["secret_text"],"observability":{"enabled":False},"logpush":False}
script=base+"/workers/scripts/"+NAME
def upload(enabled=False):
    metadata["bindings"][1]["text"]="true" if enabled else "false"
    metadata["bindings"]=[b for b in metadata["bindings"] if b["name"]!="BETA_UNTIL"]
    if enabled: metadata["bindings"].append({"type":"plain_text","name":"BETA_UNTIL","text":str(int(time.time())+14*86400)})
    boundary="cc-"+secrets.token_hex(20)
    parts=[]
    def part(name,ctype,data,filename=None):
        disposition='Content-Disposition: form-data; name="'+name+'"'
        if filename: disposition+='; filename="'+filename+'"'
        parts.append(("--"+boundary+"\r\n"+disposition+"\r\nContent-Type: "+ctype+"\r\n\r\n").encode()+data+b"\r\n")
    part("metadata","application/json",json.dumps(metadata).encode())
    part("worker.mjs","application/javascript+module",(ROOT/"backend/worker.mjs").read_bytes(),"worker.mjs")
    payload=b"".join(parts)+("--"+boundary+"--\r\n").encode()
    api(script,"PUT",payload,"multipart/form-data; boundary="+boundary)
upload(False)
print("OK: Worker uploaded with public feedback disabled and observability off",flush=True)
# Owner requested the free workers.dev setup; preserve any existing account subdomain.
try:
    sub=api(base+"/workers/subdomain").get("subdomain")
except SystemExit as exc:
    if str(exc)!="Cloudflare request failed: HTTP 404 codes [10007]":
        raise
    print("No workers.dev subdomain registered; creating requested CurioCircle subdomain",flush=True)
    sub=api(base+"/workers/subdomain","PUT",{"subdomain":"curiocircle"}).get("subdomain")
if not isinstance(sub,str) or not re.fullmatch(r"[a-z0-9-]+",sub):
    raise SystemExit("Worker uploaded; account workers.dev subdomain not confirmed")
print("OK: account workers.dev subdomain confirmed",flush=True)
api(script+"/subdomain","POST",{"enabled":True,"previews_enabled":False})
route=api(script+"/subdomain")
if route.get("enabled") is not True: raise SystemExit("Worker route not enabled")
print("OK: Worker route enabled",flush=True)
url="https://"+NAME+"."+sub+".workers.dev"
print("Worker URL: "+url,flush=True)
def get(path,origin=None,post=None):
    # Cloudflare's workers.dev Browser Integrity Check can reject Python's default UA.
    # Use an explicit browser-compatible HTTP test header on our own endpoint.
    headers={"Accept":"application/json","User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"}
    if origin: headers["Origin"]=origin
    if post is not None: headers["Content-Type"]="application/json"
    req=urllib.request.Request(url+path,headers=headers,data=post)
    try:
        with urllib.request.urlopen(req,timeout=10) as res:
            status=res.status
            raw=res.read(8192)
    except urllib.error.HTTPError as e:
        status=e.code
        raw=e.read(8192)
    try:
        data=json.loads(raw)
        if not isinstance(data,dict): data={}
    except (ValueError,UnicodeError):
        data={}
        match=re.search(rb"\b(1010|1101|1102|1016|1003)\b",raw)
        if match: data={"edge_error":match.group(1).decode()}
    return status,data
for attempt in range(12):
    try:
        status,health=get("/health")
        print("Health attempt "+str(attempt+1)+": HTTP "+str(status)+" "+str({k:health[k] for k in ("ok","feedback_enabled","catalogue_count","error","edge_error") if k in health}),flush=True)
        if status==200 and health.get("ok") and health.get("catalogue_count")==len(rows) and health.get("feedback_enabled") is False: break
    except Exception as e:
        print("Health attempt "+str(attempt+1)+": "+type(e).__name__,flush=True)
    time.sleep(5)
else: raise SystemExit("Worker uploaded but remote health check not successful; see HTTP diagnostics above")
status,denial=get("/admin/api/votes")
assert status==401 and denial.get("error")=="unauthorized","Unauthenticated admin must be denied"
status,gate=get("/v1/vote","https://marcsenges.github.io",b"{}")
assert status==503 and gate.get("error")=="feedback_disabled","Public writes must be disabled"
print("OK: live health, admin denial, feedback gate; no real votes collected",flush=True)

# Test real D1 write/update/withdrawal and suggestion moderation with synthetic fixtures only.
# Exact random fixture IDs guarantee cleanup cannot touch normal user rows.
fixture=hashlib.sha256(("curiocircle-synthetic-vote:"+secrets.token_hex(32)).encode()).hexdigest()
suggestion_fixture=hashlib.sha256(("curiocircle-synthetic-suggestion:"+secrets.token_hex(32)).encode()).hexdigest()
text_fixture="Synthetic CurioCircle database test "+suggestion_fixture
dedup=hashlib.sha256(text_fixture.encode()).hexdigest()
day=time.strftime("%Y-%m-%d",time.gmtime())
def scalar(statement,params=None):
    return sql(statement,params)[0]["results"][0]
try:
    sql("INSERT INTO cc_vote(question_id,receipt_hash,revision,vote,language,app_version,updated_day) VALUES(?,?,?,?,?,?,?)",[0,fixture,1,1,"de","0.9.6 (Beta)",day])
    assert scalar("SELECT vote,revision FROM cc_vote WHERE question_id=0 AND receipt_hash=?",[fixture])=={"vote":1,"revision":1}
    sql("UPDATE cc_vote SET vote=-1,revision=2 WHERE question_id=0 AND receipt_hash=? AND revision<2",[fixture])
    sql("UPDATE cc_vote SET vote=1,revision=1 WHERE question_id=0 AND receipt_hash=? AND revision<1",[fixture])
    assert scalar("SELECT vote,revision FROM cc_vote WHERE question_id=0 AND receipt_hash=?",[fixture])=={"vote":-1,"revision":2}
    sql("UPDATE cc_vote SET vote=NULL,revision=3 WHERE question_id=0 AND receipt_hash=?",[fixture])
    assert scalar("SELECT vote,revision FROM cc_vote WHERE question_id=0 AND receipt_hash=?",[fixture])=={"vote":None,"revision":3}
    sql("INSERT INTO cc_suggestion(receipt_hash,text,language,text_hash,submitted_day) VALUES(?,?,?,?,?)",[suggestion_fixture,text_fixture,"de",dedup,day])
    assert scalar("SELECT status FROM cc_suggestion WHERE receipt_hash=?",[suggestion_fixture])["status"]=="pending"
    sql("UPDATE cc_suggestion SET status='approved',reviewed_day=? WHERE receipt_hash=?",[day,suggestion_fixture])
    assert scalar("SELECT status FROM cc_suggestion WHERE receipt_hash=?",[suggestion_fixture])["status"]=="approved"
    sql("UPDATE cc_suggestion SET status='rejected',reviewed_day=? WHERE receipt_hash=?",[day,suggestion_fixture])
    assert scalar("SELECT status FROM cc_suggestion WHERE receipt_hash=?",[suggestion_fixture])["status"]=="rejected"
    print("OK: real D1 test writes, vote change/withdrawal, stale update protection and moderation",flush=True)
finally:
    sql("DELETE FROM cc_vote WHERE question_id=0 AND receipt_hash=?",[fixture])
    sql("DELETE FROM cc_suggestion WHERE receipt_hash=?",[suggestion_fixture])
    assert scalar("SELECT COUNT(*) AS n FROM cc_vote WHERE receipt_hash=?",[fixture])["n"]==0
    assert scalar("SELECT COUNT(*) AS n FROM cc_suggestion WHERE receipt_hash=?",[suggestion_fixture])["n"]==0
    print("OK: synthetic fixtures removed; public feedback remains disabled",flush=True)

# Explicit opt-in beta deployment. Default remains closed; a failed live check closes it again.
if os.environ.get("COMMUNITY_BETA")=="true":
    vote_receipt=secrets.token_hex(32)
    vote_hash=digest("vote:0:"+vote_receipt)
    proposal_receipt=secrets.token_hex(32)
    proposal_hash=digest("suggestion:"+proposal_receipt)
    feedback_receipt=secrets.token_hex(32)
    feedback_hash=digest("feedback:"+feedback_receipt)
    proposal={"receipt":proposal_receipt,"language":"de","text":"Synthetische CurioCircle Beta-Testfrage "+proposal_hash[:16].translate(str.maketrans("0123456789","ghijklmnop"))+"?"}
    payload={"question_id":0,"receipt":vote_receipt,"revision":1,"vote":1,"language":"de","app_version":"0.9.8.4.2 (Beta)"}
    def post(path,data):
        return get(path,"https://marcsenges.github.io",json.dumps(data).encode())
    passed=False
    try:
        upload(True)
        for attempt in range(12):
            try:
                status,health=get("/health")
                if status==200 and health.get("feedback_enabled") is True: break
            except Exception: pass
            time.sleep(5)
        else: raise SystemExit("Enabled beta health not confirmed")
        status,result=post("/v1/vote",payload)
        assert status==200 and result.get("vote")==1,"Live vote creation failed"
        status,result=post("/v1/vote",dict(payload,revision=2,vote=-1))
        assert status==200 and result.get("vote")==-1,"Live vote change failed"
        status,result=post("/v1/vote",payload)
        assert status==200 and result.get("revision")==2 and result.get("vote")==-1,"Live stale retry failed"
        status,result=post("/v1/vote",dict(payload,revision=3,vote=None))
        assert status==200 and result.get("revision")==3 and result.get("vote") is None,"Live withdrawal failed"
        status,result=post("/v1/suggestion",proposal)
        assert status==200 and result.get("status")=="received","Live suggestion failed: HTTP "+str(status)+" ("+str(result.get("error","unexpected response"))+")"
        assert scalar("SELECT status FROM cc_suggestion WHERE receipt_hash=?",[proposal_hash])["status"]=="pending"
        fb={"receipt":feedback_receipt,"language":"es","text":"Prueba sintetica de comentarios de CurioCircle","app_version":"0.9.8.4.2 (Beta)"}
        status,result=post("/v1/feedback",fb)
        assert status==200 and result.get("status")=="received","Live app feedback failed"
        assert scalar("SELECT COUNT(*) AS n FROM cc_feedback WHERE receipt_hash=?",[feedback_hash])["n"]==1
        status,result=get("/admin/api/votes")
        assert status==401,"Admin must stay private"
        passed=True
        print("OK: live API vote, change, stale retry, withdrawal, suggestion and admin denial",flush=True)
    finally:
        try:
            sql("DELETE FROM cc_vote WHERE question_id=0 AND receipt_hash=?",[vote_hash])
            sql("DELETE FROM cc_suggestion WHERE receipt_hash=?",[proposal_hash])
            sql("DELETE FROM cc_feedback WHERE receipt_hash=?",[feedback_hash])
            assert scalar("SELECT COUNT(*) AS n FROM cc_feedback WHERE receipt_hash=?",[feedback_hash])["n"]==0
            assert scalar("SELECT COUNT(*) AS n FROM cc_vote WHERE receipt_hash=?",[vote_hash])["n"]==0
            assert scalar("SELECT COUNT(*) AS n FROM cc_suggestion WHERE receipt_hash=?",[proposal_hash])["n"]==0
        except BaseException:
            passed=False
            raise
        finally:
            if not passed:
                upload(False)
                print("Beta disabled after unsuccessful verification",flush=True)
    print("OK: beta active; all synthetic feedback rows removed",flush=True)
