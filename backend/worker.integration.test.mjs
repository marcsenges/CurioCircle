// Isolated real SQLite integration test; never contacts Cloudflare.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import worker from './worker.mjs';
const db=new DatabaseSync(':memory:');
db.exec(readFileSync(new URL('./schema.sql',import.meta.url),'utf8'));
db.exec('PRAGMA foreign_keys=ON; INSERT INTO cc_question(id,category) VALUES(0,0),(1,2);');
const DB={prepare(sql){return {bind(...params){const statement=db.prepare(sql);return {first:async()=>statement.get(...params)||null,all:async()=>({results:statement.all(...params)}),run:async()=>({meta:{changes:Number(statement.run(...params).changes)}})}},first:async()=>db.prepare(sql).get()||null,all:async()=>({results:db.prepare(sql).all()})}}};
const ORIGIN='https://marcsenges.github.io',fakeToken='local-unit-test-not-a-real-secret-000000000';
const env={DB,FEEDBACK_ENABLED:'true',ADMIN_TOKEN:fakeToken};
async function send(path,payload,admin=false,environment=env,origin=ORIGIN){
 const headers={Origin:admin?'https://local.test':origin,'Content-Type':'application/json'};
 if(admin)headers.Authorization='Bearer '+fakeToken;
 const response=await worker.fetch(new Request('https://local.test'+path,{method:payload===undefined?'GET':'POST',headers,...(payload===undefined?{}:{body:JSON.stringify(payload)})}),environment);
 const text=await response.text();
 return {status:response.status,headers:response.headers,text,json:()=>JSON.parse(text)};
}
const appVersion=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/const APP_VERSION="([^"]+)";/)?.[1];
assert.ok(appVersion,'Read actual app version from entry point');
const base={question_id:0,receipt:'a'.repeat(64),revision:1,vote:1,language:'de',app_version:appVersion};
for(const version of ['0.9.6 (Beta)','0.9.8.4.2 (Beta)','0.9.8.5 (Beta)','1.0.3','0.9.8.4.2.1 (Beta)','bad']){
 const result=await send('/v1/vote',{...base,question_id:1,receipt:'e'.repeat(64),app_version:version});
 assert.equal(result.status,['0.9.8.4.2.1 (Beta)','bad'].includes(version)?400:200,version);
}
db.prepare('DELETE FROM cc_vote WHERE question_id=1').run();
assert.equal((await send('/v1/vote',base,false,{...env,FEEDBACK_ENABLED:'false'})).status,503);
assert.equal((await send('/v1/vote',base,false,env,'https://other.example')).status,403);
assert.equal((await send('/v1/vote',{...base,question_id:99})).status,400);
assert.equal((await send('/v1/vote',{...base,name:'synthetic'})).status,400);
assert.equal((await send('/v1/vote',base)).json().vote,1);
assert.equal((await send('/v1/vote',base)).json().revision,1);
assert.equal((await send('/v1/vote',{...base,revision:2,vote:-1})).json().vote,-1);
assert.equal((await send('/v1/vote',base)).json().vote,-1);
assert.equal(db.prepare('SELECT COUNT(*) AS n FROM cc_vote').get().n,1);
assert.equal((await send('/admin/api/votes')).status,401);
let stats=(await send('/admin/api/votes',undefined,true)).json().rows;
assert.equal(stats[0].total,1);assert.equal(stats[0].negative,1);
assert.match((await send('/admin/api/votes.csv',undefined,true)).text,/question_id,category,language,total,positive,negative/);
assert.equal((await send('/v1/vote',{...base,revision:3,vote:null})).json().vote,null);
assert.equal((await send('/v1/vote',base)).json().vote,null);
assert.equal((await send('/admin/api/votes',undefined,true)).json().rows.length,0);
const proposal={receipt:'b'.repeat(64),language:'de',text:'= Welche Erfindung wäre im Alltag besonders praktisch?'};
assert.equal((await send('/v1/suggestion',proposal)).json().status,'received');
assert.equal((await send('/v1/suggestion',proposal)).json().status,'received');
assert.equal((await send('/v1/suggestion',{...proposal,receipt:'c'.repeat(64)})).json().status,'duplicate');
assert.equal((await send('/v1/suggestion',{...proposal,text:'synthetic@example.invalid als Test'})).status,400);
const row=(await send('/admin/api/suggestions',undefined,true)).json().rows[0];
assert.equal(row.status,'pending');
assert.equal((await send('/admin/api/moderate',{id:row.id,status:'approved'},true)).status,200);
assert.equal((await send('/admin/api/suggestions',undefined,true)).json().rows[0].status,'approved');
assert.match((await send('/admin/api/suggestions.csv',undefined,true)).text,/"'= Welche Erfindung/);
assert.equal((await send('/admin/api/moderate',{id:row.id,status:'rejected'},true)).status,200);
assert.equal((await send('/admin/api/suggestions',undefined,true)).json().rows[0].status,'rejected');

const fb={receipt:'d'.repeat(64),language:'es',text:'El formulario resulta sencillo.',app_version:appVersion};
assert.equal((await send('/v1/feedback',fb,false,{...env,FEEDBACK_ENABLED:'false'})).status,503);
assert.equal((await send('/v1/feedback',fb,false,env,'https://other.example')).status,403);
assert.equal((await send('/v1/feedback',{...fb,email:'test@example.invalid'})).status,400);
assert.equal((await send('/v1/feedback',{...fb,text:'x'})).status,400);
assert.equal((await send('/v1/feedback',fb)).json().status,'received');
assert.equal((await send('/v1/feedback',fb)).json().status,'received');
assert.equal(db.prepare('SELECT COUNT(*) AS n FROM cc_feedback').get().n,1);
assert.equal(db.prepare('SELECT language FROM cc_feedback').get().language,'es');

// Aggregated analytics: no identifiers, no text or arbitrary dimensions.
const u={event:'app_open',dimension:''};
assert.equal((await send('/v1/usage',u,false,{...env,FEEDBACK_ENABLED:'false'})).status,503);
assert.equal((await send('/v1/usage',u,false,env,'https://other.example')).status,403);
for(const bad of [{...u,user_id:'abc'},{...u,dimension:'de'},{event:'language',dimension:'unknown'},{event:'category',dimension:'8'},{event:'other',dimension:''}])assert.equal((await send('/v1/usage',bad)).status,400);
assert.equal((await send('/v1/usage',u)).status,200);
assert.equal((await send('/v1/usage',u)).status,200);
assert.equal((await send('/v1/usage',{event:'qr_open',dimension:''})).status,200);
assert.equal((await send('/v1/usage',{event:'language',dimension:'de'})).status,200);
assert.equal((await send('/v1/usage',{event:'category',dimension:'7'})).status,200);
assert.equal(db.prepare("SELECT count FROM cc_usage_daily WHERE event='app_open'").get().count,2);
assert.equal(db.prepare("SELECT COUNT(*) AS n FROM cc_usage_daily").get().n,4);
assert.deepEqual(db.prepare("PRAGMA table_info(cc_usage_daily)").all().map(x=>x.name),['day','event','dimension','count']);
assert.equal((await send('/admin/api/usage')).status,401);
db.close();
console.log('OK: isolated SQL, Worker validation, vote lifecycle, idempotency, aggregation, moderation, CSV and auth');
