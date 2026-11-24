import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://127.0.0.1'),name=u.pathname==='/'?'index.html':u.pathname.slice(1),file=path.resolve(name);if(!file.startsWith(process.cwd()+path.sep))throw Error();const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};res.writeHead(200,{'Content-Type':types[path.extname(file)]||'text/plain'});res.end(await readFile(file))}catch{res.writeHead(404);res.end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true, args:['--no-sandbox']});
try{
const context=await browser.newContext({viewport:{width:375,height:812},serviceWorkers:'block',isMobile:true,hasTouch:true});
const page=await context.newPage(),errors=[],sent=[],dialogs=[];
page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>{dialogs.push(d.message());void d.dismiss()});
await context.route('https://curiocircle-api.*.workers.dev/**',async route=>{
const req=route.request(),url=new URL(req.url()),headers={'Access-Control-Allow-Origin':base,'Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET, POST, OPTIONS'};
if(req.method()==='OPTIONS')return route.fulfill({status:204,headers});
if(url.pathname==='/health')return route.fulfill({json:{ok:true,feedback_enabled:true,catalogue_count:305},headers});
const p=req.postDataJSON();sent.push({path:url.pathname,payload:p});
return route.fulfill({json:{ok:true,status:'received',vote:p.vote,revision:p.revision},headers});
});
await page.goto(base);await page.locator('.cc-thumb').first().waitFor({state:'visible'});
assert.equal(sent.length,0);
for(const lang of ['en','de','es','fr','pt','it']){
 await page.locator('#lang').selectOption(lang);
 for(const width of [320,375,430,812]){
  await page.setViewportSize({width,height:width===812?375:812});
  assert.equal(await page.locator('.cc-thumb').count(),2);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  assert.equal(overflow,false,'horizontal overflow '+lang+' '+width);
  assert.ok((await page.locator('.cc-thumb').first().boundingBox()).width>=44);
 }
}
await page.setViewportSize({width:375,height:812});await page.locator('#lang').selectOption('es');
await page.locator('.cc-thumb').first().click();await page.waitForFunction(()=>document.querySelector('.cc-thumb')?.getAttribute('aria-pressed')==='true');
await page.waitForTimeout(200);assert.equal(sent.filter(x=>x.path==='/v1/vote').length,1);
await page.locator('.cc-thumb').last().click();await page.waitForTimeout(200);assert.equal(sent.filter(x=>x.path==='/v1/vote').at(-1).payload.vote,-1);
await page.locator('.cc-thumb').last().click();await page.waitForTimeout(200);assert.equal(sent.filter(x=>x.path==='/v1/vote').at(-1).payload.vote,null);
await page.locator('#communitySettings > details > summary').click();
const proposal=page.locator('#communitySettings textarea');await proposal.fill('¿Qué invento te gustaría crear?');
assert.equal(await page.locator('.cc-pending-actions').isVisible(),false);
await page.locator('.cc-submit').click();await page.waitForTimeout(200);assert.equal(sent.filter(x=>x.path==='/v1/suggestion').at(-1).payload.language,'es');assert.equal(await proposal.inputValue(),'');
await page.locator('#heart').click();
await page.locator('#settingsJump').click();await page.locator('#extrasTitle').click();await page.locator('#favTitle').click();
assert.equal(await page.locator('.favRemove').count(),1);await page.locator('.favRemove').click();assert.equal(await page.locator('.favRemove').count(),0);
await page.locator('#feedbackTitle').click();await page.locator('#feedbackText').fill('Me gusta la nueva interfaz.');await page.locator('#feedbackCopy').click();await page.waitForTimeout(200);assert.equal(sent.filter(x=>x.path==='/v1/feedback').at(-1).payload.text,'Me gusta la nueva interfaz.');assert.equal(await page.locator('#feedbackText').inputValue(),'');
for(const width of [320,375,430,812]){
 await page.setViewportSize({width,height:width===812?375:812});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'settings overflow '+width);
}
await page.setViewportSize({width:375,height:812});
assert.equal(await page.locator('#categoryChoices input').count(),8);
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
await page.locator('#settingsJump').click();
assert.equal(await page.locator('#categoryChoices input:checked').count(),3);
await page.locator('#allCategories').check();
await page.locator('#applyCategories').click();
assert.deepEqual(await page.evaluate(()=>selectedCategories()),[0,1,2,3,4,5,6,7]);
assert.equal(await page.evaluate(()=>deck.length),305);
assert.deepEqual(dialogs,[]);assert.deepEqual(errors,[]);
console.log('OK: six languages, four viewport widths, thumbs and withdrawal, proposal, favourite removal, feedback sending, no dialogs or page errors');
await context.close();
}finally{await browser.close();server.close()}
