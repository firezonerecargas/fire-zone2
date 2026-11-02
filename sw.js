const V = 'fz-v1';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  if (u.hostname === 'cdn.jsdelivr.net') { // librería pesada: caché primero (carga instantánea)
    e.respondWith(caches.open(V).then(async c => { const hit = await c.match(r); if (hit) return hit; const res = await fetch(r); if (res.ok) c.put(r, res.clone()); return res; }));
  } else if (u.origin === location.origin) { // tu web: red primero, caché si no hay internet
    e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; }).catch(() => caches.match(r)));
  }
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => l.length ? l[0].focus() : clients.openWindow('./')));
});
// Notificaciones push reales (se activan cuando se conecte el servidor de push)
self.addEventListener('push', e => {
  let d = {}; try { d = e.data.json(); } catch (x) {}
  e.waitUntil(self.registration.showNotification(d.title || 'Fire Zone', { body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', vibrate: [200, 100, 200] }));
});
