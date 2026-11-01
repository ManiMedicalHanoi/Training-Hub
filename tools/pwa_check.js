// Kiểm tra Training Hub cài được như ứng dụng (PWA): manifest, biểu tượng, service worker, dùng khi mất mạng,
// mục "Cài ứng dụng" trong menu và hướng dẫn iPhone. Chạy cùng máy chủ http + máy chủ giả lập như tools/shots.js:
//   python3 -m http.server 8765 --bind 127.0.0.1   (trong thư mục repo)
//   node tools/pwa_check.js <thư mục ảnh ra>
const {chromium, devices} = require('playwright');
const fs = require('fs');
const BASE = process.env.APP_BASE || 'http://127.0.0.1:8765/';
const OUT = process.argv[2] || 'pwa-shots'; fs.mkdirSync(OUT, {recursive: true});
const BE = process.env.TH_BACKEND || '/home/user/manimedicalhanoi/mmh-backend';
const FX = (() => {   // dữ liệu giả của kho mmh-backend (module ES ⇒ chép sang .cjs), giống tools/shots.js
  const src = BE + '/ifu/capture/th/', tmp = require('os').tmpdir() + '/th-fixtures/'; fs.mkdirSync(tmp, {recursive: true});
  fs.writeFileSync(tmp + 'gasvm.cjs', fs.readFileSync(src + 'gasvm.js', 'utf8').replace(/const SRC = '[^']*';/, 'const SRC = ' + JSON.stringify(BE + '/backends/training/Backend Training Hub.gs') + ';'));
  fs.writeFileSync(tmp + 'fixtures.cjs', fs.readFileSync(src + 'fixtures.js', 'utf8').replace("require('./gasvm')", "require('./gasvm.cjs')"));
  return require(tmp + 'fixtures.cjs');
})();
let fails = 0;
const check = (ok, what, extra) => { console.log((ok ? '  ✓ ' : '  ✗ ') + what + (extra ? '  ' + extra : '')); if (!ok) fails++; };

async function ctxFor(b, opts, user) {
  const ctx = await b.newContext(Object.assign({locale: 'vi-VN', timezoneId: 'Asia/Ho_Chi_Minh'}, opts));
  const srv = FX.createServer({user});
  await ctx.addInitScript(([u]) => { try { localStorage.setItem('mmh_hub_token', 'tok-' + u); localStorage.setItem('mmh_hub_email', u + '@example.com'); } catch (e) {} }, [user]);
  await ctx.route(/script\.google\.com/, async r => {
    const req = r.request(), q = Object.fromEntries(new URL(req.url()).searchParams);
    const pd = req.postData(); if (pd && req.method() === 'POST') { new URLSearchParams(pd).forEach((v, k) => q[k] = v); if (q.payload) { try { Object.assign(q, JSON.parse(q.payload)); } catch (e) {} } }
    let body; try { body = srv.handle(q.action || 'ping', q); } catch (e) { body = {ok: false, error: e.message}; }
    if (body && body._v) body._v = '9.99';
    const t = JSON.stringify(body);
    await r.fulfill({status: 200, contentType: q.callback ? 'application/javascript' : 'application/json', body: q.callback ? `${q.callback}(${t})` : t});
  });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com/, r => r.abort());
  return ctx;
}
const ready = p => p.waitForFunction(() => document.querySelector('#nav .nv') && /Cập nhật/.test((document.getElementById('syncTxt') || {}).textContent || ''), null, {timeout: 20000});
const closeAll = p => p.evaluate(() => { if (typeof UPD !== 'undefined') UPD.close(); if (typeof Modal !== 'undefined') Modal.stack.slice().forEach(m => Modal.close(m)); });

(async () => {
  const b = await chromium.launch();
  /* 1. máy tính: manifest, biểu tượng, cài được, service worker, mất mạng */
  console.log('Máy tính (Chrome)');
  const ctx = await ctxFor(b, {viewport: {width: 1440, height: 900}}, 'giang');
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE + 'index.html'); await ready(p);
  const man = await p.evaluate(async () => { const l = document.querySelector('link[rel=manifest]'); const r = await fetch(l.href); return r.ok ? r.json() : null; });
  check(man && man.name && man.start_url && man.display === 'standalone', 'manifest đọc được', man ? man.name + ' · ' + man.display : '');
  for (const ic of (man ? man.icons : [])) { const r = await p.request.get(BASE + ic.src); check(r.ok() && /png/.test(r.headers()['content-type'] || ''), 'biểu tượng ' + ic.sizes + ' ' + ic.purpose); }
  await p.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.ready.then(() => true), null, {timeout: 15000});
  await p.reload(); await ready(p);
  check(await p.evaluate(() => !!navigator.serviceWorker.controller), 'service worker đang điều khiển trang');
  const cdp = await ctx.newCDPSession(p);
  const inst = await cdp.send('Page.getInstallabilityErrors').catch(e => ({installabilityErrors: [{errorId: 'cdp: ' + e.message}]}));
  check(!inst.installabilityErrors.length, 'Chrome xác nhận CÀI ĐƯỢC', inst.installabilityErrors.map(e => e.errorId).join(', '));
  /* menu tài khoản: mục Cài ứng dụng */
  await closeAll(p); await p.waitForTimeout(400);
  await p.click('.v4-me'); await p.waitForTimeout(500);
  check(!!(await p.$('[data-v64-install]')), 'menu tài khoản có "Cài ứng dụng lên máy này"');
  await p.screenshot({path: OUT + '/menu.png'});
  await p.click('[data-v64-install]'); await p.waitForTimeout(700);
  check(await p.evaluate(() => /Chrome|Edge/.test(document.querySelector('.ov.on .modal, .modal') ? document.body.innerText : '')), 'bấm ⇒ hiện hướng dẫn cài (không có hộp cài của trình duyệt trong môi trường thử)');
  await p.screenshot({path: OUT + '/desktop_guide.png'});
  /* dữ liệu không bị giữ bản cũ: notes.js và trang đi qua mạng */
  const cached = await p.evaluate(async () => { const ks = await caches.keys(); const out = []; for (const k of ks) { const c = await caches.open(k); (await c.keys()).forEach(r => out.push(new URL(r.url).pathname)); } return out; });
  check(!cached.some(u => /script\.google/.test(u)), 'không lưu đệm phản hồi máy chủ Apps Script', cached.length + ' mục trong bộ đệm');
  /* mất mạng: trang vẫn mở được (khung app), không trắng màn hình */
  await ctx.setOffline(true);
  const off = await p.reload().then(() => true, () => false);
  await p.waitForTimeout(1200);
  check(off && await p.evaluate(() => !!document.querySelector('.top, #nav, #authCard')), 'mất mạng: vẫn mở được khung app từ bộ đệm');
  await ctx.setOffline(false);
  check(!errs.length, 'không lỗi JS', errs.slice(0, 2).join(' | '));
  await ctx.close();

  /* 2. iPhone: hướng dẫn Safari ▸ Chia sẻ ▸ Thêm vào MH chính */
  console.log('iPhone (giả lập)');
  const ictx = await ctxFor(b, Object.assign({}, devices['iPhone 13']), 'khang');
  const ip = await ictx.newPage(); const ierr = []; ip.on('pageerror', e => ierr.push(e.message));
  await ip.goto(BASE + 'index.html'); await ready(ip); await closeAll(ip); await ip.waitForTimeout(400);
  await ip.click('#tabbar [data-a="v4Menu"]'); await ip.waitForTimeout(500);
  await ip.screenshot({path: OUT + '/ios_menu.png'});
  await ip.click('[data-v64-install]'); await ip.waitForTimeout(700);
  const t = await ip.evaluate(() => document.body.innerText);
  check(/Thêm vào MH chính/.test(t) && /Safari/.test(t), 'iPhone: hướng dẫn Safari ▸ Chia sẻ ▸ Thêm vào MH chính');
  await ip.screenshot({path: OUT + '/ios.png'});
  check(await ip.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'iPhone: không tràn ngang');
  check(!ierr.length, 'iPhone: không lỗi JS', ierr.slice(0, 2).join(' | '));
  await ictx.close(); await b.close();
  console.log(fails ? `\n${fails} mục KHÔNG đạt` : '\nTất cả đạt');
  process.exit(fails ? 1 : 0);
})();
