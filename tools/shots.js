// Chụp ảnh THẬT của Training Hub với máy chủ GIẢ LẬP (dữ liệu giả, không gọi Google) — kiểm thử giao diện + ảnh cho thông báo cập nhật.
// Cần: kho ManiMedicalHanoi/mmh-backend (fixtures: ifu/capture/th/fixtures.js + gasvm.js) và một máy chủ http phục vụ thư mục repo:
//   python3 -m http.server 8765 --bind 127.0.0.1        (chạy trong thư mục repo)
//   cd tools && npm i @fontsource/be-vietnam-pro@5 @fontsource/lexend@5 pdfjs-dist@3.11.174   (một lần; playwright có sẵn)
//   TH_BACKEND=<thư mục kho mmh-backend> node tools/shots.js <thư mục ra> [cảnh ...]   (mặc định /home/user/manimedicalhanoi/mmh-backend)
// Mỗi dòng in ✓/✗ + lỗi JS + [TRÀN NGANG] nếu trang rộng hơn màn hình.
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path');
/* dữ liệu giả lấy từ kho mmh-backend (ifu/ là module ES) ⇒ chép sang thư mục tạm dạng .cjs, trỏ gasvm vào code backend thật */
const BE = process.env.TH_BACKEND || '/home/user/manimedicalhanoi/mmh-backend';
const FX = (() => {
  const src = BE + '/ifu/capture/th/', tmp = require('os').tmpdir() + '/th-fixtures/'; fs.mkdirSync(tmp, {recursive: true});
  fs.writeFileSync(tmp + 'gasvm.cjs', fs.readFileSync(src + 'gasvm.js', 'utf8').replace(/const SRC = '[^']*';/, 'const SRC = ' + JSON.stringify(BE + '/backends/training/Backend Training Hub.gs') + ';'));
  fs.writeFileSync(tmp + 'fixtures.cjs', fs.readFileSync(src + 'fixtures.js', 'utf8').replace("require('./gasvm')", "require('./gasvm.cjs')"));
  return require(tmp + 'fixtures.cjs');
})();
const APP = process.env.APP || 'http://127.0.0.1:8765/index.html';
const OUT = process.argv[2]; fs.mkdirSync(OUT, {recursive: true});
const ONLY = process.argv.slice(3);
const NM = __dirname + '/node_modules/';
const DESK = {width: 1440, height: 900}, MOB = {width: 390, height: 844};
const T0 = new Date('2026-10-12T09:00:00+07:00');
const fontCss = (pkg, ws) => ws.map(w => fs.readFileSync(NM + '@fontsource/' + pkg + '/' + w + '.css', 'utf8')).join('\n').replace(/\.\/files\//g, 'https://fonts.local/' + pkg + '/');

async function open(b, o) {
  o = Object.assign({user: 'giang', mobile: false, hash: '#/home'}, o || {});
  const ctx = await b.newContext({viewport: o.mobile ? MOB : DESK, deviceScaleFactor: 1, locale: 'vi-VN', timezoneId: 'Asia/Ho_Chi_Minh', isMobile: !!o.mobile, hasTouch: !!o.mobile, colorScheme: o.dark ? 'dark' : 'light'});
  const p = await ctx.newPage();
  const srv = FX.createServer(o);
  p.errors = [];
  p.on('pageerror', e => p.errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|favicon|ERR_FAILED/.test(m.text())) p.errors.push('console: ' + m.text().slice(0, 160)); });
  await p.clock.setFixedTime(o.time || T0);
  await p.addInitScript(([o, email]) => {
    try {
      if (!o.gate) localStorage.setItem('mmh_hub_token', 'tok-' + o.user);
      localStorage.setItem('mmh_hub_email', email);
      if (o.ls) Object.entries(o.ls).forEach(([k, v]) => localStorage.setItem(k, v));
    } catch (e) {}
  }, [{gate: o.gate, user: o.user, ls: o.ls}, o.user + '@example.com']);
  await p.route(/script\.google\.com/, async r => {
    const req = r.request(), u = new URL(req.url());
    const params = Object.fromEntries(u.searchParams);
    const pd = req.postData();
    if (pd && req.method() === 'POST') { const q = new URLSearchParams(pd); q.forEach((v, k) => params[k] = v); if (params.payload) { try { Object.assign(params, JSON.parse(params.payload)); } catch (e) {} } }
    const a = params.action || 'ping';
    let body; try { body = srv.handle(a, params); } catch (e) { body = {ok: false, error: 'mock: ' + e.message}; }
    if (body && body._v) body._v = '9.99';   // dữ liệu giả ghi bản máy chủ cũ ⇒ tránh dải cảnh báo "máy chủ cũ" trong ảnh
    const cb = params.callback, txt = JSON.stringify(body);
    await r.fulfill({status: 200, contentType: cb ? 'application/javascript' : 'application/json', body: cb ? `${cb}(${txt})` : txt});
  });
  await p.route(/fonts\.googleapis\.com/, r => r.fulfill({status: 200, contentType: 'text/css', body: /Lexend/.test(r.request().url()) ? fontCss('lexend', [300, 400, 500, 600, 700]) : fontCss('be-vietnam-pro', [400, 500, 600, 700, 800])}));
  await p.route(/fonts\.local\//, r => { const u = new URL(r.request().url()).pathname.split('/'); const f = NM + '@fontsource/' + u[1] + '/files/' + u[2]; return fs.existsSync(f) ? r.fulfill({status: 200, contentType: 'font/woff2', body: fs.readFileSync(f)}) : r.abort(); });
  await p.route(/fonts\.gstatic\.com/, r => r.abort());
  await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/pdf\.js/, r => r.fulfill({status: 200, contentType: 'application/javascript', body: fs.readFileSync(NM + 'pdfjs-dist/build/' + path.basename(new URL(r.request().url()).pathname).replace('.min', ''))}));
  await p.route(/drive\.google\.com|docs\.google\.com|lh3\.googleusercontent|teams\.example\.com/, r => r.fulfill({status: 200, contentType: 'text/html', body: '<html><body>Drive (giả lập)</body></html>'}));
  await p.goto(APP + o.hash);
  if (!o.gate) await p.waitForFunction(() => document.querySelector('#nav .nv') && /Cập nhật/.test((document.getElementById('syncTxt') || {}).textContent || ''), null, {timeout: 20000}).catch(() => p.errors.push('không thấy trạng thái Cập nhật'));
  else await p.waitForSelector('#authCard h2');
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  if (!o.keepPopup && !o.gate) { await p.evaluate(() => { if (typeof Modal !== 'undefined') Modal.stack.slice().forEach(m => Modal.close(m)); }); await p.waitForTimeout(350); }
  return p;
}
const go = async (p, hash, wait) => { await p.evaluate(h => { location.hash = h; }, hash); await p.waitForTimeout(wait || 1200); };
async function shot(p, id, full) {
  if (full) { const h = await p.evaluate(() => document.documentElement.scrollHeight); const vp = p.viewportSize(); await p.setViewportSize({width: vp.width, height: Math.min(Math.max(h, vp.height), 2600)}); await p.waitForTimeout(400); await p.screenshot({path: OUT + '/' + id + '.png'}); await p.setViewportSize(vp); }
  else await p.screenshot({path: OUT + '/' + id + '.png'});
  const hs = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  console.log((p.errors.length ? '  ✗ ' : '  ✓ ') + id + (hs ? '  [TRÀN NGANG]' : '') + (p.errors.length ? '  ' + p.errors.slice(0, 3).join(' | ') : ''));
}
const SC = {
  login: async b => { const p = await open(b, {gate: true, user: 'khang'}); await shot(p, 'login'); return p; },
  home: async b => { const p = await open(b, {user: 'giang'}); await shot(p, 'home', true); return p; },
  home_learner: async b => { const p = await open(b, {user: 'khang'}); await shot(p, 'home_learner', true); return p; },
  todo: async b => { const p = await open(b, {user: 'khang', keepPopup: true}); await p.waitForTimeout(800); await shot(p, 'todo_popup'); return p; },
  library: async b => { const p = await open(b, {user: 'khang', hash: '#/library'}); await p.waitForTimeout(800); await shot(p, 'library', true); return p; },
  calendar: async b => { const p = await open(b, {user: 'giang', hash: '#/calendar', ls: {mmh_hub_calview: 'month'}}); await p.waitForTimeout(800); await shot(p, 'calendar'); return p; },
  session: async b => { const p = await open(b, {user: 'khang'}); await go(p, '#/s/S107?tab=materials', 1600); await shot(p, 'session', true); return p; },
  session_trainer: async b => { const p = await open(b, {user: 'giang'}); await go(p, '#/s/S107?tab=learners', 1800); await shot(p, 'session_trainer', true); return p; },
  manage: async b => { const p = await open(b, {user: 'giang', hash: '#/manage'}); await p.waitForTimeout(1000); await shot(p, 'manage', true); return p; },
  certs: async b => { const p = await open(b, {user: 'khang', hash: '#/certs'}); await p.waitForTimeout(1000); await shot(p, 'certs'); return p; },
  quiz: async b => { const p = await open(b, {user: 'khang', matsDone: true}); await go(p, '#/s/S107', 1200); await p.evaluate(() => Quiz.intro('S107')); await p.waitForTimeout(800); await shot(p, 'quiz_intro'); return p; },
  upd: async b => { const p = await open(b, {user: 'khang', keepPopup: false, time: new Date('2026-11-02T09:00:00+07:00')}); await p.waitForSelector('#upd.show', {timeout: 15000}).catch(() => p.errors.push('không tự hiện thông báo')); await p.waitForTimeout(600); await shot(p, 'upd'); return p; },
  courses: async b => { const p = await open(b, {user: 'khang'}); const el = await p.$('.v4-wrap .v4-cc'); await el.scrollIntoViewIfNeeded(); await p.evaluate(() => scrollBy(0, -120)); await p.waitForTimeout(500); await shot(p, 'courses'); return p; },
  reader_btn: async b => { const p = await open(b, {user: 'khang', matsNone: true}); await go(p, '#/s/S107?tab=materials', 1500); const m = await p.$('.mat .nm[data-fid="F107_1"]'); if (m) { await m.click(); await p.waitForTimeout(2500); } await shot(p, 'reader'); return p; },
  m_menu: async b => { const p = await open(b, {user: 'khang', mobile: true}); await p.click('#tabbar [data-a="v4Menu"]'); await p.waitForTimeout(700); const ok = await p.evaluate(() => !!document.querySelector('[data-v63-menu] svg path')); if (!ok) p.errors.push('thiếu mục Có gì mới / icon'); await shot(p, 'm_menu'); await p.click('[data-v63-menu]'); await p.waitForSelector('#upd.show', {timeout: 5000}).catch(() => p.errors.push('không mở được thông báo từ menu')); await p.waitForTimeout(500); await shot(p, 'm_upd'); return p; },
  menu: async b => { const p = await open(b, {user: 'giang'}); await p.click('.v4-me'); await p.waitForTimeout(700); if (!(await p.$('[data-v63-menu]'))) p.errors.push('thiếu mục Có gì mới'); await shot(p, 'menu'); return p; },
  kn_session: async b => { const p = await open(b, {user: 'khang'}); const h = await p.evaluate(() => { const c = [...document.querySelectorAll('.v4-cc')].find(x => x.querySelector('.art.kn')); return c && c.dataset.h; }); if (h) await go(p, h, 1600); else p.errors.push('không thấy thẻ kn'); await shot(p, 'kn_session'); return p; },
  m_home: async b => { const p = await open(b, {user: 'khang', mobile: true}); await shot(p, 'm_home', true); return p; },
  m_session: async b => { const p = await open(b, {user: 'khang', mobile: true}); await go(p, '#/s/S107', 1600); await shot(p, 'm_session', true); return p; },
  m_library: async b => { const p = await open(b, {user: 'khang', mobile: true, hash: '#/library'}); await p.waitForTimeout(900); await shot(p, 'm_library'); return p; },
};
(async () => {
  const b = await chromium.launch();
  for (const [k, f] of Object.entries(SC)) {
    if (ONLY.length && !ONLY.includes(k)) continue;
    try { const p = await f(b); await p.context().close(); } catch (e) { console.log('  ✗ ' + k + ' LỖI: ' + e.message.split('\n')[0]); }
  }
  await b.close();
})();
