"""Private CurioCircle administration: only fixed reports and explicit moderation."""
import csv, hashlib, html, json, os, pathlib, re, urllib.request, urllib.error
if os.environ.get("GITHUB_REPOSITORY","").lower()!="marcsenges/curiocircle-admin":
    raise SystemExit("Refusing to export outside the dedicated private repository")
event=json.loads(pathlib.Path(os.environ["GITHUB_EVENT_PATH"]).read_text())
if event.get("repository",{}).get("private") is not True:
    raise SystemExit("Repository must be private")
token=os.environ.get("CF_TOKEN")
if not token: raise SystemExit("Missing CLOUDFlARE_API_TOKEN secret")
def digest(x): return hashlib.sha256(str(x).encode()).hexdigest()
def api(path,data=None):
    request=urllib.request.Request("https://api.cloudflare.com/client/v4/"+path,data=None if data is None else json.dumps(data).encode(),headers={"Authorization":"Bearer "+token,"Content-Type":"application/json","Accept":"application/json"})
    try:
        with urllib.request.urlopen(request,timeout=30) as res: value=json.load(res)
    except urllib.error.HTTPError as exc: raise SystemExit("Cloudflare HTTP "+str(exc.code))
    if value.get("success") is not True: raise SystemExit("Cloudflare API error")
    return value["result"]
accounts=[a["id"] for a in api("accounts?per_page=50") if digest(a["id"])=="9b6fe543e9ae22689f9bbf55e6f594eb0906fdefb30841529db43fdfee69d8d1"]
if len(accounts)!=1: raise SystemExit("Expected account not found")
base="accounts/"+accounts[0]
dbs=[d["uuid"] for d in api(base+"/d1/database?name=curiocircle-db&per_page=100") if d["name"]=="curiocircle-db" and digest(d["uuid"])=="fe7fbe8c89a60bde00261597b8069c911c7e3299724adc602591827db19dfa88"]
if len(dbs)!=1: raise SystemExit("Expected database not found")
path=base+"/d1/database/"+dbs[0]
if api(path).get("jurisdiction")!="eu": raise SystemExit("Expected EU jurisdiction")
def query(sql,params=()):
    result=api(path+"/query",{"sql":sql,"params":list(params)})
    if len(result)!=1 or not result[0].get("success"):raise SystemExit("D1 query failed")
    return result[0]["results"]
request=json.loads(pathlib.Path("admin-request.json").read_text())
action=request.get("action")
if action=="moderate":
    if set(request)!={"action","id","status","request_id"} or not re.fullmatch("[a-f0-9]{64}",request.get("id","")) or request.get("status") not in ("pending","approved","rejected"):raise SystemExit("Invalid moderation request")
    rows=query("UPDATE cc_suggestion SET status=?,reviewed_day=date('now') WHERE receipt_hash=? RETURNING status",(request["status"],request["id"]))
    if len(rows)!=1:raise SystemExit("Proposal not found")
elif action!="report" or set(request)!={"action","request_id"}:
    raise SystemExit("Unsupported request")
votes=query("""SELECT q.id AS question_id,q.category,v.language,count(*) AS total,sum(CASE WHEN v.vote=1 THEN 1 ELSE 0 END) AS positive,sum(CASE WHEN v.vote=-1 THEN 1 ELSE 0 END) AS negative FROM cc_vote v JOIN cc_question q ON q.id=v.question_id WHERE v.vote IS NOT NULL GROUP BY q.id,q.category,v.language ORDER BY q.id,v.language""")
suggestions=[]
cursor=""
while True:
    page=query("SELECT receipt_hash AS id,text,language,status,submitted_day,reviewed_day FROM cc_suggestion WHERE receipt_hash>? ORDER BY receipt_hash LIMIT 100",(cursor,))
    suggestions.extend(page)
    if len(page)<100:break
    cursor=page[-1]["id"]
    if len(suggestions)>=10000:raise SystemExit("Report size exceeds configured limit")
out=pathlib.Path("private-report");out.mkdir(exist_ok=True)
def csv_safe(value):
    if value is None:return ""
    if isinstance(value,str) and value.lstrip("\ufeff \t\r\n").startswith(("=","+","-","@")):return "'"+value
    return value
def write_csv(name,rows,columns):
    with (out/name).open("w",encoding="utf-8-sig",newline="") as f:
        w=csv.DictWriter(f,fieldnames=columns);w.writeheader()
        for row in rows:w.writerow({k:csv_safe(row.get(k)) for k in columns})
vc=["question_id","category","language","total","positive","negative"]
sc=["id","text","language","status","submitted_day","reviewed_day"]
write_csv("bewertungen.csv",votes,vc);write_csv("fragenvorschlaege.csv",suggestions,sc)
(out/"report.json").write_text(json.dumps({"votes":votes,"suggestions":suggestions},ensure_ascii=False,indent=2),encoding="utf-8")
def table(rows,cols):
    return "<table><thead><tr>"+"".join("<th>"+html.escape(k)+"</th>" for k in cols)+"</tr></thead><tbody>"+"".join("<tr>"+"".join("<td>"+html.escape(str(row.get(k) if row.get(k) is not None else ""))+"</td>" for k in cols)+"</tr>" for row in rows)+"</tbody></table>"
total=sum(r["total"] for r in votes);positive=sum(r["positive"] for r in votes)
byq={}
for r in votes:
    q=byq.setdefault(r["question_id"],{"question_id":r["question_id"],"category":r["category"],"total":0,"positive":0,"negative":0})
    for k in ("total","positive","negative"):q[k]+=r[k]
review=sorted((dict(r,positive_pct=round(100*r["positive"]/r["total"],1)) for r in byq.values() if r["total"]>=30),key=lambda r:r["positive_pct"])
page='<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CurioCircle Administration</title><style>body{font:16px system-ui;background:#203d36;color:#fff8e9;padding:16px;max-width:1200px;margin:auto}h1,h2{color:#e8c886}table{border-collapse:collapse;width:100%;font-size:14px}th,td{border-bottom:1px solid #ffffff30;padding:9px;text-align:left;overflow-wrap:anywhere}section{overflow:auto}a{color:#e8c886}</style><h1>CurioCircle Administration</h1><p>Privater Bericht · Keine automatische Veröffentlichung.</p>'
page+=f'<p><strong>{total}</strong> Bewertungen · <strong>{positive}</strong> positiv · <strong>{len(suggestions)}</strong> Vorschläge · <strong>{sum(s["status"]=="pending" for s in suggestions)}</strong> offen</p>'
page+='<p><a href="bewertungen.csv">Bewertungen (CSV)</a> · <a href="fragenvorschlaege.csv">Vorschläge (CSV)</a></p><h2>Prüfbedarf ab 30 Bewertungen</h2><section>'+table(review,["question_id","category","total","positive","negative","positive_pct"])+'</section><h2>Nach Sprache</h2><section>'+table(votes,vc)+'</section><h2>Vorschläge</h2><section>'+table(suggestions,sc)+'</section></html>'
(out/"dashboard.html").write_text(page,encoding="utf-8")
print("Private report generated; no submission text or receipts printed.")
