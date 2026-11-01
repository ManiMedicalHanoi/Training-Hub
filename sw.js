/* MMH Training Hub — service worker (v6.4, 01/11/2026). Cho phép CÀI app (PWA) và mở nhanh hơn.
   Nguyên tắc: KHÔNG BAO GIỜ giữ dữ liệu cũ.
   · Trang (index.html), *.json, updates/notes.js: lấy từ mạng trước; mất mạng mới dùng bản đã lưu.
   · Ảnh / logo / icon cùng trang: trả bản đã lưu cho nhanh RỒI tải bản mới về thay (lần mở sau thấy ảnh mới).
   · Máy chủ Apps Script, video, Google Drive, mọi tên miền khác: không đụng tới (đi thẳng ra mạng).
   Gỡ khẩn cấp: thay toàn bộ file này bằng 1 dòng
     self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(self.registration.unregister()));
*/
const V = 'mmh-th-6.4';
const SCOPE = new URL(self.registration.scope).pathname;
const SHELL = [SCOPE, SCOPE + 'manifest.webmanifest', SCOPE + 'media/app/icon-192.png', SCOPE + 'media/app/apple-touch-icon.png'];

self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).catch(() => {})); });
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('mmh-th-') && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())
));

const fresh = req => fetch(req).then(res => {
  if (res && res.ok && res.type === 'basic') { const c = res.clone(); caches.open(V).then(ca => ca.put(req, c)); }
  return res;
});

self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || !u.pathname.startsWith(SCOPE)) return;   // Apps Script, font, CDN: không xử lý
  if (r.headers.has('range') || /\.(mp4|webm|mov|m4v|mp3)$/i.test(u.pathname)) return;                 // video phát từng đoạn: để trình duyệt tự lo
  if (r.mode === 'navigate' || /\.(json|webmanifest)$/i.test(u.pathname) || /\/updates\/notes\.js$/.test(u.pathname)) {
    // mạng trước; hết mạng ⇒ bản đã lưu (trang chủ cho mọi đường dẫn trong app)
    e.respondWith(fresh(r).catch(() => caches.match(r, {ignoreSearch: true}).then(m => m || (r.mode === 'navigate' ? caches.match(SCOPE) : undefined)).then(m => m || Response.error())));
    return;
  }
  if (/\.(png|jpe?g|webp|gif|svg|ico|woff2?)$/i.test(u.pathname)) {
    // ảnh: trả bản đã lưu ngay, đồng thời tải bản mới về thay
    const net = fresh(r);
    e.waitUntil(net.then(() => {}, () => {}));
    e.respondWith(caches.match(r).then(m => m || net));
  }
});
