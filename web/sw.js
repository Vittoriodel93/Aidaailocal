const CACHE='aida-08';const FILES=['./','./index.html','./style.css','./app.js','./skills.js','./icons/icon-192.png','./icons/icon-512.png','./manifest.webmanifest','./icons/aida.svg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)))});
self.addEventListener('activate',e=>e.waitUntil(Promise.all([caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))),self.clients.claim()])));
self.addEventListener('fetch',e=>{const p=new URL(e.request.url).pathname;if(e.request.method!=='GET'||p.startsWith('/.netlify/')||p.startsWith('/api/'))return;
e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request).then(x=>x||caches.match('./index.html'))))});
