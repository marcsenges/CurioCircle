import {firefox,webkit} from 'playwright';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://127.0.0.1'),file=path.resolve(u.pathname==='/'?'index.html':u.pathname.slice(1));if(!file.startsWith(process.cwd()+path.sep))throw Error();res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'text/plain'});res.end(await readFile(file))}catch{res.writeHead(404);res.end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
try{
 for(const engine of [firefox,webkit]){
  const browser=await engine.launch();
  try{
   const ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',locale:'en-GB'});
   await ctx.route('https://curiocircle-api.*.workers.dev/**',route=>{
    const headers={'Access-Control-Allow-Origin':base,'Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET, POST, OPTIONS'};
    if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers});
    if(route.request().method()==='GET')return route.fulfill({json:{ok:true,feedback_enabled:true,catalogue_count:307},headers});
    const p=route.request().postDataJSON();return route.fulfill({json:{ok:true,status:'received',vote:p.vote,revision:p.revision},headers});
   });
   const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base);await page.locator('#dialogCancel').click();
   await page.locator('#answer').waitFor({state:'visible'});
   assert.equal(await page.evaluate(()=>qs.length),307);
   for(const lang of ['en','de','es','fr','pt','it']){
    await page.locator('#lang').selectOption(lang);
    for(const width of [320,390,812]){
     await page.setViewportSize({width,height:width===812?390:844});
     assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,engine.name()+' '+lang+' '+width);
     assert.ok(await page.locator('#question').textContent());
    }
   }
   await page.setViewportSize({width:390,height:844});
   const id=await page.evaluate(()=>deck[pos]);await page.locator('#heart').click();
   assert.ok(await page.evaluate(id=>state.fav.includes(id),id));
   await page.locator('#answer').click();assert.equal(await page.evaluate(id=>state.counts[id],id),1);
   await page.reload();assert.ok(await page.evaluate(id=>state.fav.includes(id)&&state.counts[id]===1,id));
   assert.equal(await page.locator('#appDialog').isVisible(),false);
   await page.goto(base+'/legal.html#de-privacy');
   assert.equal(await page.locator('#de-privacy').textContent(),'Datenschutz');
   assert.deepEqual(errors,[]);
   await ctx.close();
   console.log('OK: '+engine.name()+' six languages, viewport widths, answer, favourite, reload, consent and legal page');
  }finally{await browser.close()}
 }
}finally{server.close()}
