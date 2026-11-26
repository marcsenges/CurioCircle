import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://127.0.0.1'),name=u.pathname==='/'?'index.html':u.pathname.slice(1),file=path.resolve(name);if(!file.startsWith(process.cwd()+path.sep))throw Error();const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.css':'text/css','.webmanifest':'application/manifest+json'};res.writeHead(200,{'Content-Type':types[path.extname(file)]||'text/plain'});res.end(await readFile(file))}catch{res.writeHead(404);res.end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true, args:['--no-sandbox']});
try{
const context=await browser.newContext({viewport:{width:375,height:812},serviceWorkers:'block',isMobile:true,hasTouch:true});
const page=await context.newPage(),errors=[],sent=[],dialogs=[];
let holdVote=false,releaseVote=null,notifyHeld=null,failVoteId=null;
page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>{dialogs.push(d.message());void d.dismiss()});
await context.route('https://curiocircle-api.*.workers.dev/**',async route=>{
const req=route.request(),url=new URL(req.url()),headers={'Access-Control-Allow-Origin':base,'Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET, POST, OPTIONS'};
if(req.method()==='OPTIONS')return route.fulfill({status:204,headers});
if(url.pathname==='/health')return route.fulfill({json:{ok:true,feedback_enabled:true,catalogue_count:307},headers});
const p=req.postDataJSON();sent.push({path:url.pathname,payload:p});
if(url.pathname==='/v1/vote'&&p.question_id===failVoteId)return route.fulfill({status:400,json:{ok:false,error:'invalid_vote'},headers});
if(holdVote&&url.pathname==='/v1/vote'){holdVote=false;await new Promise(resolve=>{releaseVote=resolve;notifyHeld?.()})}
return route.fulfill({json:{ok:true,status:'received',vote:p.vote,revision:p.revision},headers});
});
async function openSettings(group){const settings=page.locator('details.settings');if(!await settings.evaluate(e=>e.open))await page.locator('#settingsJump').click();const panel=page.locator('#'+group+'Group');if(!await panel.evaluate(e=>e.open))await panel.locator(':scope > summary').click();await page.waitForFunction(g=>document.querySelectorAll('.settingsModule[open]').length===1&&document.getElementById(g+'Group').open,group)}
await page.goto(base);await page.locator('#appDialog').waitFor({state:'visible'});
assert.equal(sent.length,0);
assert.equal(await page.locator('#dialogOK').textContent(),'Yes');
assert.equal(await page.locator('#dialogCancel').textContent(),'No');
assert.equal(await page.locator('#dialogOK').evaluate(e=>getComputedStyle(e).backgroundColor),await page.locator('#dialogCancel').evaluate(e=>getComputedStyle(e).backgroundColor));
assert.equal(await page.locator('#dialogCancel').evaluate(e=>e===document.activeElement),true);
await page.locator('#dialogCancel').click();await page.waitForFunction(()=>CCUsage.decided()&&!CCUsage.enabled());
assert.equal(await page.evaluate(()=>localStorage.getItem('curiocircle-usage-choice-v1')),'no');
await page.reload();await page.locator('.cc-thumb').first().waitFor({state:'visible'});
assert.equal(await page.locator('#appDialog').isVisible(),false);
assert.equal(sent.length,0);
assert.equal(await page.locator('#answer').textContent(),'Answered');
for(const [src,size] of [['icon-192.png',192],['icon-512.png',512],['icon-1024.png',1024],['icon-maskable-512.png',512]]){
 const dimensions=await page.evaluate(src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve([img.naturalWidth,img.naturalHeight]);img.onerror=reject;img.src='./'+src}),src);
 assert.deepEqual(dimensions,[size,size]);
}
await openSettings('play');assert.equal(await page.locator('.settingsModule').count(),5);
for(const group of ['questions','achievement','app','privacy','play'])await openSettings(group);
await page.locator('#settingsJump').click();

for(const lang of ['en','de','es','fr','pt','it']){
 await page.locator('#lang').selectOption(lang);
 for(const width of [320,375,430,812]){
  await page.setViewportSize({width,height:width===812?375:812});
  assert.equal(await page.locator('.cc-thumb').count(),2);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  assert.equal(overflow,false,'horizontal overflow '+lang+' '+width);
  assert.ok((await page.locator('.cc-thumb').first().boundingBox()).width>=44);
  const alignment=await page.evaluate(()=>{const boxes=[...document.querySelectorAll('#heart,.cc-thumb')].map(e=>e.getBoundingClientRect()),tools=document.querySelector('.cardTools').getBoundingClientRect(),share=document.querySelector('#shareTitle'),panel=document.querySelector('#sharePanel').getBoundingClientRect(),title=share.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(share);const label=range.getBoundingClientRect();return {sizes:boxes.map(b=>[b.width,b.height]),tops:boxes.map(b=>b.top),gaps:[boxes[1].left-boxes[0].right,boxes[2].left-boxes[1].right],centerDelta:Math.abs((boxes[0].left+boxes[2].right)/2-(tools.left+tools.right)/2),sharePanelDelta:Math.abs((panel.top+panel.bottom-title.top-title.bottom)/2),shareTextDelta:Math.abs((title.top+title.bottom-label.top-label.bottom)/2),shareDisplay:getComputedStyle(share).display}});
  assert.deepEqual(alignment.sizes,[[44,44],[44,44],[44,44]],'equal touch targets '+lang+' '+width);
  assert.ok(Math.max(...alignment.tops)-Math.min(...alignment.tops)<=1,'same icon row '+lang+' '+width);
  assert.ok(alignment.gaps.every(n=>Math.abs(n-8)<=1)&&alignment.centerDelta<=1,'compact centred controls '+lang+' '+width);
  assert.equal(alignment.shareDisplay,'flex');assert.ok(alignment.sharePanelDelta<=1&&alignment.shareTextDelta<=2,'vertically centred share heading '+lang+' '+width);
 }
}
await page.setViewportSize({width:375,height:812});await page.locator('#lang').selectOption('es');
await page.locator('.cc-thumb').first().click();await page.waitForFunction(()=>document.querySelector('.cc-thumb')?.getAttribute('aria-pressed')==='true');
await page.waitForTimeout(200);assert.equal(sent.filter(x=>x.path==='/v1/vote').length,1);
await page.waitForFunction(()=>CCCommunity.summary().positive===1&&CCCommunity.summary().pending===0);
await page.locator('.cc-thumb').last().click();await page.waitForFunction(()=>CCCommunity.summary().negative===1&&CCCommunity.summary().pending===0);assert.equal(sent.filter(x=>x.path==='/v1/vote').at(-1).payload.vote,-1);
await page.locator('.cc-thumb').last().click();await page.waitForFunction(()=>CCCommunity.summary().rated===0&&CCCommunity.summary().pending===0);assert.equal(sent.filter(x=>x.path==='/v1/vote').at(-1).payload.vote,null);
await openSettings('privacy');await page.locator('#communitySettings > details > summary').click();
const proposal=page.locator('#communitySettings textarea');await proposal.fill('¿Qué invento te gustaría crear?');
assert.equal(await page.locator('.cc-pending-actions').isVisible(),false);
await page.locator('.cc-submit').click();await page.waitForTimeout(200);assert.equal(sent.filter(x=>x.path==='/v1/suggestion').at(-1).payload.language,'es');assert.equal(await proposal.inputValue(),'');
// Question reporting is deliberate, separate from a dislike, and has no analytics opt-in requirement.
const reportedId=await page.evaluate(()=>deck[pos]);
const beforeReport=sent.length;
await page.locator('#reportQuestion').click();await page.locator('#dialogCancel').click();await page.waitForFunction(()=>dialogResolver===null&&!reportBusy);
assert.equal(sent.length,beforeReport);
await page.locator('#reportQuestion').click();await page.locator('#dialogOK').click();await page.waitForFunction(()=>!reportBusy);
assert.equal(sent.filter(x=>x.path==='/v1/feedback').at(-1).payload.text,'Question report #'+reportedId);
assert.equal(sent.filter(x=>x.path==='/v1/usage').length,0);
await page.locator('#heart').click();
await openSettings('questions');await page.locator('#favTitle').click();
assert.equal(await page.locator('.favRemove').count(),1);await page.locator('.favRemove').click();assert.equal(await page.locator('.favRemove').count(),0);
await openSettings('privacy');await page.locator('#feedbackTitle').click();await page.locator('#feedbackText').fill('Me gusta la nueva interfaz.');await page.locator('#feedbackCopy').click();await page.waitForTimeout(200);assert.equal(sent.filter(x=>x.path==='/v1/feedback').at(-1).payload.text,'Me gusta la nueva interfaz.');assert.equal(await page.locator('#feedbackText').inputValue(),'');
for(const width of [320,375,430,812]){
 await page.setViewportSize({width,height:width===812?375:812});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'settings overflow '+width);
}
await page.setViewportSize({width:375,height:812});
await openSettings('play');assert.equal(await page.locator('#categoryChoices input').count(),8);
assert.equal(await page.locator('#allCategories').isChecked(),true);
await page.locator('#allCategories').uncheck();
assert.equal(await page.locator('#applyCategories').isDisabled(),true);
for(const c of ['0','3','7'])await page.locator('#categoryChoices input[value="'+c+'"]').check();
assert.equal(await page.locator('#allCategories').evaluate(e=>e.indeterminate),true);
await page.locator('#applyCategories').click();
let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('curiocircle-v1')));
assert.deepEqual(saved.categories,[0,3,7]);assert.equal(new Set(saved.deck).size,saved.deck.length);
assert.ok(await page.evaluate(()=>deck.every(id=>[0,3,7].includes(categoryOf(id)))));
await page.reload();
await page.locator('.cc-thumb').first().waitFor({state:'visible'});
assert.deepEqual(await page.evaluate(()=>selectedCategories()),[0,3,7]);
await openSettings('play');
assert.equal(await page.locator('#categoryChoices input:checked').count(),3);
await page.locator('#allCategories').check();
await page.locator('#applyCategories').click();
assert.deepEqual(await page.evaluate(()=>selectedCategories()),[0,1,2,3,4,5,6,7]);
assert.equal(await page.evaluate(()=>deck.length),307);
// Confirmed ratings survive reset in the retained receipt store, but not the visible statistics.
await page.locator('.cc-thumb').first().click();
await page.waitForFunction(()=>CCCommunity.summary().positive>=1&&CCCommunity.summary().pending===0);
await page.evaluate(()=>{state.players=['Test A','Test B'];state.fav=[0,1];state.counts={0:2};state.custom=[{id:100000,en:'Test local question',es:'Pregunta de prueba'}];state.mode='rotate';state.turn=1;save();render()});
await openSettings('app');
if(!await page.locator('#dataTitle').evaluate(e=>e.parentElement.open))await page.locator('#dataTitle').click();
for(const lang of ['en','de','es','fr','pt','it']){
 await page.locator('#lang').selectOption(lang);
 await page.locator('#resetData').click();
 assert.equal(await page.locator('#appDialog').isVisible(),true);
 assert.equal(await page.locator('#dialogTitle').textContent(),await page.evaluate(()=>({de:'Bist du dir sicher?',en:'Are you sure?',es:'¿Seguro que quieres hacerlo?',fr:'Tu es sûr de vouloir continuer ?',pt:'Tem certeza?',it:'Sei sicuro di voler continuare?'}[state.lang])));
 await page.locator('#dialogCancel').click();
 await page.waitForFunction(()=>!document.querySelector('#appDialog').open);
 assert.equal(await page.evaluate(()=>state.players.length),2);
}
await page.locator('#lang').selectOption('es');
const oldCommunity=await page.evaluate(()=>localStorage.getItem('curiocircle-community-v1'));
const oldRated=Object.entries(JSON.parse(oldCommunity).votes).find(([id,r])=>r.confirmed?.vote===1);
assert.ok(oldRated);
function retainedCommunity(raw){const x=JSON.parse(raw);for(const r of Object.values(x.votes))delete r.hidden;return x}
async function readCommunity(){return page.evaluate(()=>localStorage.getItem('curiocircle-community-v1'))}
async function showQuestion(id){await page.evaluate(id=>{const index=deck.indexOf(Number(id));if(index<0)throw Error('Question missing');pos=index;save();render()},id)}
async function assertNoVisibleRating(){assert.equal(await page.locator('.cc-thumb[aria-pressed=true]').count(),0);assert.equal(await page.evaluate(()=>CCCommunity.summary().rated),0)}

const sentBeforeReset=sent.length;
await page.locator('#resetData').click();await page.locator('#dialogOK').click();
await page.waitForFunction(()=>state.players.length===0&&state.custom.length===0);
const resetCommunity=await readCommunity();
assert.deepEqual(retainedCommunity(resetCommunity),retainedCommunity(oldCommunity));
assert.ok(Object.values(JSON.parse(resetCommunity).votes).every(r=>r.hidden===true));
assert.equal(sent.length,sentBeforeReset);
await assertNoVisibleRating();
assert.deepEqual(await page.evaluate(()=>({players:state.players,custom:state.custom,fav:state.fav,counts:state.counts,mode:state.mode,pos})),{players:[],custom:[],fav:[],counts:{},mode:'free',pos:0});
assert.equal(await page.locator('#players').inputValue(),'');
await page.reload();await page.locator('.cc-thumb').first().waitFor({state:'visible'});
assert.equal(await readCommunity(),resetCommunity);await showQuestion(oldRated[0]);await assertNoVisibleRating();
assert.equal(await page.evaluate(()=>state.players.length),0);
assert.ok(await page.evaluate(()=>Object.keys(state.counts).length===0&&state.fav.length===0&&state.achievements.unlocked.length===0));
assert.equal(await page.locator('#count').textContent(),await page.evaluate(()=>quickText[state.lang][6]));
// Same thumb after a display reset must keep the vote, not withdraw it or issue a new receipt.
await page.locator('.cc-thumb').first().click();
await page.waitForFunction(()=>CCCommunity.summary().positive===1&&CCCommunity.summary().pending===0);
let repeat=sent.filter(x=>x.path==='/v1/vote').at(-1).payload;
assert.equal(repeat.question_id,Number(oldRated[0]));assert.equal(repeat.receipt,oldRated[1].receipt);assert.equal(repeat.revision,oldRated[1].revision+1);assert.equal(repeat.vote,1);
await page.locator('.cc-thumb').last().click();await page.waitForFunction(()=>CCCommunity.summary().negative===1&&CCCommunity.summary().pending===0);
let changed=sent.filter(x=>x.path==='/v1/vote').at(-1).payload;assert.equal(changed.receipt,repeat.receipt);assert.equal(changed.revision,repeat.revision+1);assert.equal(changed.vote,-1);
await openSettings('app');if(!await page.locator('#dataTitle').evaluate(e=>e.parentElement.open))await page.locator('#dataTitle').click();await page.locator('#resetData').click();await page.locator('#dialogOK').click();await page.waitForFunction(()=>CCCommunity.summary().rated===0);
await openSettings('privacy');await page.locator('#showPreviousRatings').click();await page.waitForFunction(()=>CCCommunity.summary().negative===1);
await showQuestion(oldRated[0]);assert.equal(await page.locator('.cc-thumb').last().getAttribute('aria-pressed'),'true');
await page.locator('.cc-thumb').last().click();await page.waitForFunction(()=>CCCommunity.summary().rated===0&&CCCommunity.summary().pending===0);
const withdrawn=sent.filter(x=>x.path==='/v1/vote').at(-1).payload;assert.equal(withdrawn.receipt,repeat.receipt);assert.equal(withdrawn.vote,null);
// A response arriving after reset must not restore a hidden thumb or visible count.
const held=new Promise(resolve=>{notifyHeld=resolve});holdVote=true;
await page.locator('.cc-thumb').first().click();await held;
try{
 await openSettings('app');if(!await page.locator('#dataTitle').evaluate(e=>e.parentElement.open))await page.locator('#dataTitle').click();
 await page.locator('#resetData').click();await page.locator('#dialogOK').click();
 await page.waitForFunction(()=>Object.values(JSON.parse(localStorage.getItem('curiocircle-community-v1')).votes).every(r=>r.hidden===true));
 await showQuestion(oldRated[0]);await assertNoVisibleRating();
}finally{releaseVote?.();notifyHeld=null}
await page.waitForFunction(()=>CCCommunity.summary().pending===0);
await assertNoVisibleRating();
assert.equal(await page.locator('#communityRating [role=status]').textContent(),'');
const finalRecord=JSON.parse(await readCommunity()).votes[oldRated[0]];
assert.equal(finalRecord.confirmed.vote,1);assert.equal(finalRecord.receipt,repeat.receipt);assert.equal(finalRecord.hidden,true);
const afterWithdraw=await readCommunity();
// Import cancellation and confirmed import preserve community data.
await openSettings('app');if(!await page.locator('#dataTitle').evaluate(e=>e.parentElement.open))await page.locator('#dataTitle').click();
const backup={format:1,state:{lang:'es',fav:[2],counts:{2:1},players:['Uno','Dos'],mode:'free',custom:[]}};
await page.locator('#importFile').setInputFiles({name:'test.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
await page.locator('#dialogCancel').click();await page.waitForFunction(()=>!document.querySelector('#appDialog').open&&dialogResolver===null&&document.querySelector('#importFile').value==='');assert.equal(await page.evaluate(()=>state.fav.length),0);
await page.locator('#importFile').setInputFiles({name:'test.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
await page.locator('#dialogOK').click();await page.waitForFunction(()=>state.fav.includes(2));
assert.equal(await readCommunity(),afterWithdraw);
// Clipboard failure uses a selectable text box in the app, not window.prompt.
await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('clipboard unavailable')}}});Object.defineProperty(navigator,'share',{configurable:true,value:undefined})});
await page.locator('#shareJump').click();
await page.locator('#copyLink').click();assert.equal(await page.locator('#appDialog').isVisible(),true);assert.ok((await page.locator('#dialogCopy').inputValue()).includes('https://'));await page.locator('#dialogCancel').click();await page.waitForFunction(()=>dialogResolver===null);
await page.locator('#shareQuestion').click();assert.equal(await page.locator('#appDialog').isVisible(),true);assert.ok((await page.locator('#dialogCopy').inputValue()).includes('https://'));await page.locator('#dialogCancel').click();
// Analytics stays off until opt-in, then counts only allowed anonymous actions.
assert.equal(sent.filter(x=>x.path==='/v1/usage').length,0);
// Simulate an already installed copy that never made a choice.
await page.evaluate(()=>localStorage.removeItem('curiocircle-usage-choice-v1'));
await page.goto(base+'/?src=qr');await page.locator('#appDialog').waitFor({state:'visible'});
assert.equal(sent.filter(x=>x.path==='/v1/usage').length,0);
assert.equal(await page.evaluate(()=>CCUsage.decided()),false);
await page.locator('#dialogOK').click();
await page.waitForFunction(()=>CCUsage.decided()&&CCUsage.enabled());
assert.equal(await page.evaluate(()=>localStorage.getItem('curiocircle-usage-choice-v1')),'yes');
await openSettings('privacy');
assert.equal(await page.locator('#usageConsent').isChecked(),true);
await page.waitForFunction(()=>CCUsage.enabled());
await page.waitForTimeout(400);
let usage=()=>sent.filter(x=>x.path==='/v1/usage').map(x=>x.payload);
assert.ok(usage().some(x=>x.event==='qr_open'));
assert.ok(usage().some(x=>x.event==='app_open'));
await page.locator('#skip').click();await page.waitForTimeout(450);
await page.locator('#answer').click();await page.waitForTimeout(400);
assert.ok(usage().some(x=>x.event==='round_start'));assert.ok(usage().some(x=>x.event==='skip'));assert.ok(usage().some(x=>x.event==='answer'));
await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{}}});window.open=()=>null});
await page.locator('#shareJump').click();await page.locator('#copyLink').click();await page.locator('#whatsapp').click();await page.waitForTimeout(400);
assert.ok(usage().some(x=>x.event==='link_copy'));assert.ok(usage().some(x=>x.event==='whatsapp_click'));
assert.ok(usage().every(x=>Object.keys(x).sort().join(',')==='dimension,event'));
await openSettings('privacy');await page.locator('#usageConsent').uncheck();const before=usage().length;
await page.locator('#skip').click();await page.waitForTimeout(400);assert.equal(usage().length,before);
await page.reload();await page.locator('.cc-thumb').first().waitFor({state:'visible'});assert.equal(await page.evaluate(()=>CCUsage.enabled()),false);assert.equal(usage().length,before);
// Local achievements are independent of optional usage analytics.
const usageBeforeAchievements=usage().length;
await openSettings('achievement');
assert.equal(await page.locator('#achievementGroups details').count(),7);
assert.equal(await page.locator('#achievementOverview .achievementMetric').count(),4);
const beforeShares=await page.evaluate(()=>state.achievements.shares);
await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{}}});window.open=()=>null});
await page.locator('#shareJump').click();await page.locator('#copyLink').click();
await page.waitForFunction(n=>state.achievements.shares===n+1,beforeShares);assert.equal(await page.locator('#shareGoalProgress').evaluate(e=>e.value),Math.min(beforeShares+1,10));
await page.locator('#copyLink').click();
assert.equal(await page.evaluate(()=>state.achievements.shares),beforeShares+1);
await page.waitForTimeout(1100);await page.locator('#whatsapp').click();
assert.equal(await page.evaluate(()=>state.achievements.shares),beforeShares+2);
await page.locator('#answer').click();await page.waitForTimeout(400);
assert.ok(await page.evaluate(()=>state.achievements.days.length>=1&&state.achievements.languages.includes(state.lang)));
assert.equal(usage().length,usageBeforeAchievements);
const snapshot=await page.evaluate(()=>JSON.stringify(state.achievements));
await page.reload();await page.locator('.cc-thumb').first().waitFor({state:'visible'});
assert.equal(await page.evaluate(()=>JSON.stringify(state.achievements)),snapshot);
assert.equal(await page.locator('#achievementNotice').isVisible(),false);
await openSettings('achievement');
for(const lang of ['de','en','es','fr','pt','it']){
 await page.locator('#lang').selectOption(lang);
 for(const width of [320,375,812]){
  await page.setViewportSize({width,height:width===812?375:812});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'achievements overflow '+lang+' '+width);
 }
}
await page.setViewportSize({width:375,height:812});await page.locator('#achievementEffects').uncheck();
assert.equal(await page.evaluate(()=>state.achievements.effects),false);
const backed=await page.evaluate(()=>JSON.parse(JSON.stringify({format:1,state})));
await openSettings('app');if(!await page.locator('#dataTitle').evaluate(e=>e.parentElement.open))await page.locator('#dataTitle').click();
const communityBeforeAchievementReset=await page.evaluate(()=>localStorage.getItem('curiocircle-community-v1'));
await page.locator('#resetData').click();await page.locator('#appDialog').waitFor({state:'visible'});
assert.equal(await page.locator('#dialogOK').textContent(),await page.evaluate(()=>CCUsage.consentCopy(state.lang)[2]));
assert.equal(await page.locator('#dialogCancel').textContent(),await page.evaluate(()=>CCUsage.consentCopy(state.lang)[3]));
await page.locator('#dialogCancel').click();await page.waitForFunction(()=>dialogResolver===null);
assert.equal(await page.evaluate(()=>state.achievements.shares),backed.state.achievements.shares);
await page.locator('#resetData').click();await page.locator('#dialogOK').click();
await page.waitForFunction(()=>state.achievements.unlocked.length===0&&state.achievements.shares===0);
assert.equal(await page.evaluate(()=>localStorage.getItem('curiocircle-usage-choice-v1')),'no');
assert.deepEqual(retainedCommunity(await readCommunity()),retainedCommunity(communityBeforeAchievementReset));assert.ok(Object.values(JSON.parse(await readCommunity()).votes).every(r=>r.hidden===true));
await page.locator('#importFile').setInputFiles({name:'achievements.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backed))});
await page.locator('#dialogOK').click();await page.waitForFunction(n=>state.achievements.shares===n,backed.state.achievements.shares);
assert.equal(await page.evaluate(()=>state.achievements.effects),false);
assert.equal(usage().length,usageBeforeAchievements);
// Existing explicit opt-in survives an update without a new prompt.
await page.evaluate(()=>localStorage.setItem('curiocircle-usage-choice-v1','yes'));
await page.reload();await page.locator('.cc-thumb').first().waitFor({state:'visible'});
assert.equal(await page.evaluate(()=>CCUsage.decided()&&CCUsage.enabled()),true);
assert.equal(await page.locator('#appDialog').isVisible(),false);
// A permanent error on one record must not block the next valid rating.
const queueIds=await page.evaluate(()=>{const votes=JSON.parse(localStorage.getItem('curiocircle-community-v1')||'{"votes":{}}').votes;const ids=qs.map((_,i)=>i).filter(i=>!votes[i]).slice(0,2);deck=ids;pos=0;save();render();return ids});
assert.equal(queueIds.length,2);failVoteId=queueIds[0];
await page.locator('.cc-thumb').first().click();
await page.waitForFunction(id=>JSON.parse(localStorage.getItem('curiocircle-community-v1')).votes[id]?.blocked===true,queueIds[0]);
await page.evaluate(()=>{pos=1;render()});
await page.locator('.cc-thumb').first().click();
await page.waitForFunction(id=>JSON.parse(localStorage.getItem('curiocircle-community-v1')).votes[id]?.pending===false,queueIds[1]);
assert.equal(await page.evaluate(id=>JSON.parse(localStorage.getItem('curiocircle-community-v1')).votes[id].pending,queueIds[0]),true);
failVoteId=null;await page.evaluate(()=>{pos=0;render()});await page.locator('.cc-thumb').first().click();
await page.waitForFunction(id=>JSON.parse(localStorage.getItem('curiocircle-community-v1')).votes[id]?.pending===false,queueIds[0]);
assert.deepEqual(dialogs,[]);assert.deepEqual(errors,[]);
console.log('OK: six languages, four viewport widths, thumbs and withdrawal, proposal, favourite removal, feedback sending, no dialogs or page errors');
await context.close();
// Independent service-worker context: real cached app shell, not mocked offline.
const offlineContext=await browser.newContext({serviceWorkers:'allow',viewport:{width:375,height:812}});
const offlinePage=await offlineContext.newPage();
await offlinePage.goto(base);
await offlinePage.locator('#dialogCancel').click();
await offlinePage.waitForFunction(()=>navigator.serviceWorker.controller!==null);
const original=await offlinePage.evaluate(()=>APP_VERSION);
await offlineContext.setOffline(true);
await offlinePage.goto(base+'/?src=link');
await offlinePage.locator('#answer').waitFor({state:'visible'});
assert.equal(await offlinePage.evaluate(()=>APP_VERSION),original);
assert.equal(await offlinePage.evaluate(()=>qs.length),307);
await offlinePage.goto(base+'/legal.html#de-privacy');
assert.equal(await offlinePage.locator('#de-privacy').textContent(),'Datenschutz');
const cached=await offlinePage.evaluate(async()=>{const keys=await caches.keys(),out=[];for(const k of keys)for(const r of await (await caches.open(k)).keys())out.push(r.url);return out});
assert.ok(cached.every(url=>!url.includes('?src=')));
await offlineContext.close();
console.log('OK: permanent vote rejection isolation and real offline app/legal cache');
}finally{await browser.close();server.close()}
