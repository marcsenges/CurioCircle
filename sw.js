// A coherent, bounded app shell. Catalogue/version checks bypass the service worker.
const CACHE='curiocircle-0985-draft-2';
const assets=['./','./index.html','./legal.html','./questions.json','./localisation.js','./usage.js?v=0984','./achievements.js','./diversity.js','./mix.js','./storage.js?v=0985','./backend/community-client.js?v=0985','./app.css?v=0985','./design.css?v=09841','./design.js?v=0984','./icon.svg','./icon-maskable.svg','./icon-maskable-512.png','./icon-192.png','./icon-512.png','./icon-1024.png','./qr.svg','./manifest.webmanifest'];
const absolute=path=>new URL(path,self.registration.scope).href;
const allowed=new Set(assets.map(absolute));
const app=absolute('./'),index=absolute('./index.html'),legal=absolute('./legal.html');
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 await cache.addAll(assets.map(path=>new Request(absolute(path),{cache:'reload'})));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith('curiocircle-')&&name!==CACHE)await caches.delete(name);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||!url.href.startsWith(self.registration.scope)||url.searchParams.has('version-check'))return;
 let key=url.href;
 if(request.mode==='navigate'){
  const path=new URL(url.href);path.search='';path.hash='';
  if(path.href===app||path.href===index)key=index;
  else if(path.href===legal)key=legal;
 }
 if(!allowed.has(key))return;
 // Do not mix assets from a newer network release into this version's cache.
 // Install of the next service worker precaches its complete release before activation.
 event.respondWith((async()=>{const cache=await caches.open(CACHE);return (await cache.match(key))||fetch(request)})());
});
