"""Deploy only CurioCircle's verified EU D1 and disabled-by-default Worker."""
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
    assert isinstance(c,int) and 0<=c<=5
    rows.append((i,c))
schema=(ROOT/"backend/schema.sql").read_text()
# Test schema and constraints against a disposable SQLite database before touching D1.
with sqlite3.connect(":memory:") as test:
    test.executescript(schema)
    test.executemany("INSERT INTO cc_question(id,category) VALUES(?,?)",rows)
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
for part in schema.split(";"):
    if part.strip(): sql(part)
for start in range(0,len(rows),40):
    batch=rows[start:start+40]
    sql("INSERT INTO cc_question(id,category) VALUES "+",".join("(?,?)" for _ in batch)+" ON CONFLICT(id) DO UPDATE SET category=excluded.category",[x for row in batch for x in row])
actual=sql("SELECT COUNT(*) AS n FROM cc_question")[0]["results"][0]["n"]
if actual!=len(rows): raise SystemExit("Catalogue row count mismatch; no deletion attempted")
print("OK: D1 schema and catalogue written, "+str(actual)+" questions; no feedback rows inserted",flush=True)
# Preserve existing admin secret on future deploys. Always keep public feedback disabled.
metadata={"main_module":"worker.mjs","compatibility_date":"2026-01-01","bindings":[{"type":"d1","name":"DB","id":db_id},{"type":"plain_text","name":"FEEDBACK_ENABLED","text":"false"}],"keep_bindings":["secret_text"],"observability":{"enabled":False},"logpush":False}
boundary="cc-"+secrets.token_hex(20)
parts=[]
def part(name,ctype,data,filename=None):
    disposition='Content-Disposition: form-data; name="'+name+'"'
    if filename: disposition+='; filename="'+filename+'"'
    parts.append(("--"+boundary+"\r\n"+disposition+"\r\nContent-Type: "+ctype+"\r\n\r\n").encode()+data+b"\r\n")
part("metadata","application/json",json.dumps(metadata).encode())
part("worker.mjs","application/javascript+module",(ROOT/"backend/worker.mjs").read_bytes(),"worker.mjs")
payload=b"".join(parts)+("--"+boundary+"--\r\n").encode()
script=base+"/workers/scripts/"+NAME
api(script,"PUT",payload,"multipart/form-data; boundary="+boundary)
print("OK: Worker uploaded with public feedback disabled and observability off",flush=True)
# Do not invent or reserve an account subdomain. Ask owner if not already configured.
sub=api(base+"/workers/subdomain").get("subdomain")
if not isinstance(sub,str) or not re.fullmatch(r"[a-z0-9-]+",sub):
    raise SystemExit("Worker uploaded; owner needs to configure workers.dev subdomain")
api(script+"/subdomain","POST",{"enabled":True,"previews_enabled":False})
url="https://"+NAME+"."+sub+".workers.dev"
print("Worker URL: "+url,flush=True)
def get(path,origin=None,post=None):
    headers={"Accept":"application/json"}
    if origin: headers["Origin"]=origin
    if post is not None: headers["Content-Type"]="application/json"
    req=urllib.request.Request(url+path,headers=headers,data=post)
    try:
        with urllib.request.urlopen(req,timeout=15) as res:return res.status,json.load(res)
    except urllib.error.HTTPError as e:return e.code,json.load(e)
for _ in range(6):
    try:
        status,health=get("/health")
        if status==200 and health.get("ok") and health.get("catalogue_count")==len(rows) and health.get("feedback_enabled") is False: break
    except Exception: pass
    time.sleep(5)
else: raise SystemExit("Worker uploaded but remote health check not yet successful")
status,_=get("/admin/api/votes")
assert status==401,"Unauthenticated admin must be denied"
status,_=get("/v1/vote","https://marcsenges.github.io",b"{}")
assert status==503,"Public writes must be disabled"
print("OK: live health, admin denial, feedback gate; no real votes collected",flush=True)
