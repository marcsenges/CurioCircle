const ORIGIN = 'https://marcsenges.github.io';
const LANG = new Set(['de','en','es','fr','pt','it']);
const headers = {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const today = () => new Date().toISOString().slice(0,10);
const feedbackOpen=env=>env.FEEDBACK_ENABLED==='true'&&(!env.BETA_UNTIL||Number(env.BETA_UNTIL)>Date.now()/1000);
const reply=(data,status=200,cors=false)=>new Response(JSON.stringify(data),{status,headers:{...headers,'Content-Type':'application/json; charset=utf-8',...(cors?{'Access-Control-Allow-Origin':ORIGIN,'Vary':'Origin'}:{})}});
const fail=(code,status,cors=false)=>reply({ok:false,error:code},status,cors);
const hex=bytes=>Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');
const hash=async s=>hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
const validReceipt=s=>typeof s==='string'&&/^[0-9a-f]{64}$/.test(s);
const validVersion=s=>typeof s==='string'&&/^\d+(?:\.\d+){2,4}(?: \(Beta\))?$/.test(s)&&s.length<=32;
function fields(o,allowed){return o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).every(k=>allowed.includes(k))&&allowed.every(k=>Object.hasOwn(o,k))}
async function body(request,limit=2048){
 if(!/^application\/json(?:;|$)/i.test(request.headers.get('content-type')||''))throw new Error('body');
 const reader=request.body?.getReader();if(!reader)throw new Error('body');
 let n=0;const parts=[];
 while(true){const {done,value}=await reader.read();if(done)break;n+=value.length;if(n>limit){await reader.cancel();throw new Error('body')}parts.push(value)}
 const all=new Uint8Array(n);let offset=0;for(const p of parts){all.set(p,offset);offset+=p.length}
 return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(all));
}
async function authorized(request,env){
 if(typeof env.ADMIN_TOKEN!=='string'||env.ADMIN_TOKEN.length<32)return false;
 const auth=request.headers.get('Authorization')||'';
 if(!auth.startsWith('Bearer ')||auth.length>512)return false;
 const a=await hash(auth.slice(7)),b=await hash(env.ADMIN_TOKEN);
 let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);
 return diff===0;
}
// Global hourly write caps; deliberately no stored IP or device identifiers.
// This is a circuit breaker, not proof of unique people or a complete anti-bot defence.
async function allow(db,kind,max){
 const bucket=kind+':'+new Date().toISOString().slice(0,13);
 const r=await db.prepare('INSERT INTO cc_rate(bucket,count) VALUES(?,1) ON CONFLICT(bucket) DO UPDATE SET count=count+1 WHERE count<? RETURNING count').bind(bucket,max).first();
 return !!r;
}
async function vote(request,env){
 let o;try{o=await body(request)}catch{return fail('invalid_body',400,true)}
 if(!fields(o,['question_id','receipt','revision','vote','language','app_version'])||!Number.isSafeInteger(o.question_id)||o.question_id<0||!validReceipt(o.receipt)||!Number.isSafeInteger(o.revision)||o.revision<1||o.revision>100000||![-1,1,null].includes(o.vote)||!LANG.has(o.language)||!validVersion(o.app_version))return fail('invalid_vote',400,true);
 const db=env.DB;
 if(!await db.prepare('SELECT id FROM cc_question WHERE id=?').bind(o.question_id).first())return fail('unknown_question',400,true);
 const receipt=await hash('vote:'+o.question_id+':'+o.receipt);
 const old=await db.prepare('SELECT revision,vote FROM cc_vote WHERE question_id=? AND receipt_hash=?').bind(o.question_id,receipt).first();
 if(old&&old.revision>=o.revision)return reply({ok:true,revision:old.revision,vote:old.vote},200,true);
 if(!await allow(db,'vote',1000))return fail('rate_limited',429,true);
 await db.prepare('INSERT INTO cc_vote(question_id,receipt_hash,revision,vote,language,app_version,updated_day) VALUES(?,?,?,?,?,?,?) ON CONFLICT(question_id,receipt_hash) DO UPDATE SET revision=excluded.revision,vote=excluded.vote,language=excluded.language,app_version=excluded.app_version,updated_day=excluded.updated_day WHERE excluded.revision>cc_vote.revision').bind(o.question_id,receipt,o.revision,o.vote,o.language,o.app_version,today()).run();
 const stored=await db.prepare('SELECT revision,vote FROM cc_vote WHERE question_id=? AND receipt_hash=?').bind(o.question_id,receipt).first();
 return reply({ok:true,revision:stored.revision,vote:stored.vote},200,true);
}
async function suggest(request,env){
 let o;try{o=await body(request)}catch{return fail('invalid_body',400,true)}
 if(!fields(o,['receipt','language','text'])||!validReceipt(o.receipt)||!LANG.has(o.language)||typeof o.text!=='string')return fail('invalid_suggestion',400,true);
 const text=o.text.normalize('NFC').trim().replace(/\s+/g,' ');
 if(text.length<12||text.length>240||/[\p{Cc}\p{Cf}]/u.test(text)||/https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\d{7,}/i.test(text))return fail('invalid_suggestion',400,true);
 const receipt=await hash('suggestion:'+o.receipt),dedup=await hash(o.language+':'+text.toLocaleLowerCase(o.language));
 const db=env.DB;
 if(await db.prepare('SELECT receipt_hash FROM cc_suggestion WHERE receipt_hash=?').bind(receipt).first())return reply({ok:true,status:'received'},200,true);
 if(!await allow(db,'suggestion',50))return fail('rate_limited',429,true);
 const result=await db.prepare('INSERT OR IGNORE INTO cc_suggestion(receipt_hash,text,language,text_hash,submitted_day) VALUES(?,?,?,?,?)').bind(receipt,text,o.language,dedup,today()).run();
 return reply({ok:true,status:result.meta.changes?'received':'duplicate'},200,true);
}
async function feedback(request,env){
 let o;try{o=await body(request,8192)}catch{return fail('invalid_body',400,true)}
 if(!fields(o,['receipt','language','text','app_version'])||!validReceipt(o.receipt)||!LANG.has(o.language)||!validVersion(o.app_version)||typeof o.text!=='string')return fail('invalid_feedback',400,true);
 const text=o.text.normalize('NFC').trim().replace(/\s+/g,' ');
 if(text.length<5||text.length>1000||/[\p{Cc}\p{Cf}]/u.test(text)||/[\w.+-]+@[\w.-]+\.[a-z]{2,}|\d{7,}/i.test(text))return fail('invalid_feedback',400,true);
 const receipt=await hash('feedback:'+o.receipt),db=env.DB;
 if(await db.prepare('SELECT receipt_hash FROM cc_feedback WHERE receipt_hash=?').bind(receipt).first())return reply({ok:true,status:'received'},200,true);
 if(!await allow(db,'feedback',50))return fail('rate_limited',429,true);
 await db.prepare('INSERT OR IGNORE INTO cc_feedback(receipt_hash,text,language,app_version,submitted_day) VALUES(?,?,?,?,?)').bind(receipt,text,o.language,o.app_version,today()).run();
 return reply({ok:true,status:'received'},200,true);
}
const usageEvents=new Set(['app_open','round_start','answer','skip','qr_open','whatsapp_open','link_open','share_open','whatsapp_click','link_copy','share_success','install','language','category']);
async function usage(request,env){
 let o;try{o=await body(request,256)}catch{return fail('invalid_body',400,true)}
 if(!fields(o,['event','dimension'])||!usageEvents.has(o.event)||typeof o.dimension!=='string')return fail('invalid_usage',400,true);
 if(o.event==='language'?!LANG.has(o.dimension):o.event==='category'?!/^[0-7]$/.test(o.dimension):o.dimension!=='')return fail('invalid_usage',400,true);
 const db=env.DB;
 if(!await allow(db,'usage',3000))return fail('rate_limited',429,true);
 await db.prepare('INSERT INTO cc_usage_daily(day,event,dimension,count) VALUES(?,?,?,1) ON CONFLICT(day,event,dimension) DO UPDATE SET count=count+1').bind(today(),o.event,o.dimension).run();
 // Remove old aggregates on new traffic. No individual event records or identifiers.
 await db.prepare("DELETE FROM cc_usage_daily WHERE day < date(?,'-365 days')").bind(today()).run();
 return reply({ok:true},200,true);
}
const statsSQL='SELECT q.id AS question_id,COALESCE(qc.category,q.category) AS category,v.language,COUNT(*) AS total,SUM(CASE WHEN v.vote=1 THEN 1 ELSE 0 END) AS positive,SUM(CASE WHEN v.vote=-1 THEN 1 ELSE 0 END) AS negative FROM cc_vote v JOIN cc_question q ON q.id=v.question_id LEFT JOIN cc_question_category qc ON qc.question_id=q.id WHERE v.vote IS NOT NULL GROUP BY q.id,COALESCE(qc.category,q.category),v.language ORDER BY q.id,v.language';
const suggestionsSQL='SELECT receipt_hash AS id,text,language,status,submitted_day,reviewed_day FROM cc_suggestion ORDER BY submitted_day DESC,receipt_hash LIMIT 500';
const csvCell=v=>'"'+String(v??'').replace(/^[\s\uFEFF]*[=+\-@\t\r]/,m=>"'"+m).replace(/"/g,'""')+'"';
function csv(rows,keys){return [keys.join(','),...rows.map(r=>keys.map(k=>csvCell(r[k])).join(','))].join('\r\n')+'\r\n'}
const adminPage=String.raw`<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CurioCircle Administration</title><style>body{font:16px system-ui;background:#203d36;color:#fff8e9;max-width:960px;margin:auto;padding:20px}button,input,select{font:inherit;padding:10px;margin:4px;border-radius:8px;max-width:100%}article{border:1px solid #e8c88666;padding:12px;margin:8px 0;border-radius:10px;overflow-wrap:anywhere}h1,h2{color:#e8c886}#status{min-height:24px}label{display:block}button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #e8c886;outline-offset:3px}</style><h1>CurioCircle Administration</h1><p>Geschützter Moderationsbereich. Keine automatische Veröffentlichung.</p><label>Admin-Schlüssel <input id="key" type="password" autocomplete="off"></label><button id="load">Daten laden</button><button id="logout">Schliessen</button><p id="status" role="status"></p><section id="content" hidden><h2>Bewertungen</h2><p>Ab 30 Bewertungen genauer prüfen. Keine automatische Löschung.</p><button id="csvVotes">CSV Bewertungen</button><button id="csvSuggestions">CSV Vorschläge</button><div id="votes"></div><h2>Fragenvorschläge</h2><div id="suggestions"></div></section><script nonce="NONCE"><!--
const $=id=>document.getElementById(id);let token='';
async function api(path,opts={}){const res=await fetch('/admin/api/'+path,{...opts,cache:'no-store',headers:{Authorization:'Bearer '+token,...(opts.body?{'Content-Type':'application/json'}:{})}});if(!res.ok)throw Error('HTTP '+res.status);return res}
function card(parent,text){const a=document.createElement('article');const p=document.createElement('p');p.textContent=text;a.append(p);parent.append(a);return a}
async function load(){try{const [v,s]=await Promise.all([api('votes').then(r=>r.json()),api('suggestions').then(r=>r.json())]);$('votes').replaceChildren();$('suggestions').replaceChildren();for(const r of v.rows)card($('votes'),'#'+r.question_id+' · Kategorie '+r.category+' · '+r.language+' · 👍 '+r.positive+' / 👎 '+r.negative+' · '+r.total+' Bewertungen');for(const r of s.rows){const a=card($('suggestions'),r.language+' · '+r.status+' · '+r.text);for(const [status,label] of [['approved','Freigeben'],['rejected','Ablehnen'],['pending','Zurückstellen']]){const b=document.createElement('button');b.textContent=label;b.disabled=r.status===status;b.onclick=async()=>{try{await api('moderate',{method:'POST',body:JSON.stringify({id:r.id,status})});await load()}catch(e){$('status').textContent=e.message}};a.append(b)}}$('content').hidden=false;$('status').textContent='Daten geladen'}catch(e){$('status').textContent='Zugriff nicht möglich: '+e.message;$('content').hidden=true}}
$('load').onclick=()=>{token=$('key').value;$('key').value='';load()};$('logout').onclick=()=>{token='';$('key').value='';$('content').hidden=true;$('votes').replaceChildren();$('suggestions').replaceChildren();$('status').textContent='Abgemeldet'};
async function exportCsv(kind){try{const r=await api(kind+'.csv');const url=URL.createObjectURL(await r.blob());const a=document.createElement('a');a.href=url;a.download='curiocircle-'+kind+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(e){$('status').textContent=e.message}}
$('csvVotes').onclick=()=>exportCsv('votes');$('csvSuggestions').onclick=()=>exportCsv('suggestions');
//--></script></html>`;
async function handle(request,env){
 const url=new URL(request.url),path=url.pathname,method=request.method,origin=request.headers.get('Origin'),cors=origin===ORIGIN;
 if(path==='/health'&&method==='GET'){
  const row=await env.DB.prepare('SELECT COUNT(*) AS n FROM cc_question').first();
  return reply({ok:true,feedback_enabled:feedbackOpen(env),catalogue_count:row.n,analytics_enabled:feedbackOpen(env)},200,cors);
 }
 if(path==='/admin'&&method==='GET'){
  const nonce=hex(crypto.getRandomValues(new Uint8Array(16)));
  return new Response(adminPage.replace('NONCE',nonce),{headers:{...headers,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none'; script-src 'nonce-"+nonce+"'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"}});
 }
 if(path.startsWith('/admin/api/')){
  if(!await authorized(request,env))return fail('unauthorized',401);
  if(origin&&origin!==url.origin)return fail('forbidden',403);
  const route=path.slice('/admin/api/'.length);
  if(method==='GET'&&['votes','suggestions','votes.csv','suggestions.csv'].includes(route)){
   const isVotes=route.startsWith('votes');
   const rows=(await env.DB.prepare(isVotes?statsSQL:suggestionsSQL).all()).results;
   if(route.endsWith('.csv'))return new Response(csv(rows,isVotes?['question_id','category','language','total','positive','negative']:['id','text','language','status','submitted_day','reviewed_day']),{headers:{...headers,'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="curiocircle.csv"'}});
   return reply({ok:true,rows});
  }
  if(method==='POST'&&route==='moderate'){
   let o;try{o=await body(request)}catch{return fail('invalid_body',400)}
   if(!fields(o,['id','status'])||!validReceipt(o.id)||!['pending','approved','rejected'].includes(o.status))return fail('invalid_status',400);
   const result=await env.DB.prepare('UPDATE cc_suggestion SET status=?,reviewed_day=? WHERE receipt_hash=?').bind(o.status,today(),o.id).run();
   return result.meta.changes?reply({ok:true}):fail('not_found',404);
  }
  return fail('not_found',404);
 }
 if(!['/v1/vote','/v1/suggestion','/v1/feedback','/v1/usage'].includes(path))return fail('not_found',404,cors);
 if(!cors)return fail('forbidden',403);
 if(method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600','Vary':'Origin'}});
 if(method!=='POST')return fail('method',405,true);
 if(!feedbackOpen(env))return fail('feedback_disabled',503,true);
 return path==='/v1/vote'?vote(request,env):path==='/v1/suggestion'?suggest(request,env):path==='/v1/feedback'?feedback(request,env):usage(request,env);
}
export default {async fetch(request,env){try{return await handle(request,env)}catch{return fail('temporarily_unavailable',503,request.headers.get('Origin')===ORIGIN)}}};
