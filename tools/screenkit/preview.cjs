// Rainbow screen kit - AUTOMATED PREVIEW CHECK (round 45). Before any full gameplay recording: short stills of a level (or of one area of the
// connected world) at the approved picture view(s), the beginning, quarter, middle, three-quarter, the sharpest curves and the end, each in the
// LEFT / CENTRE / RIGHT swim lanes (steered with the game's own swipe input), textured with the approved artwork, plus the same places in the
// GEOMETRY TEST (?gray=1: plain gray 3D materials). The background is pure green (?sentinel=1), so any hole in the world shows as green pixels.
// Per still: Benny's whole model box inside the frame, his size on screen, camera clearance from all scenery (clipping), the gap between Benny's
// water point and the real water mesh (floating), his tilt vs the water surface, immersion, the bank angle. Then preview_sheet.py: hole pixels,
// colour look vs the approved picture, the likeness at the picture view(s) (compare_screen.py), a contact sheet and a PASS / WARN / FAIL verdict.
//   NODE_PATH=$(npm root -g) node tools/screenkit/preview.cjs <game folder> <out dir> [--screen NN] [--area ID] [--query k=v&..] [--s a,b,c] [--nogray]
// Works on a kit screen page (tools/screenkit/screen.html) and on the world page (tools/world/world.html, --area 05 / 06 ...).
const { chromium } = require('playwright'); const { spawn, spawnSync } = require('child_process'); const fs = require('fs'); const path = require('path');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; }, flag = (k) => process.argv.includes('--' + k);
(async () => {
  const [dir, out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true }); const T0 = Date.now();
  const W = 412, H = 915, fps = 30, speed = 2.2, screen = arg('screen', ''), area = arg('area', ''), extra = arg('query', '');
  const disk = fs.readFileSync(path.join(dir, 'play3.html'), 'utf8'); let port, srv;
  for (let i = 0; i < 20 && !srv; i++) { port = 9500 + Math.floor(Math.random() * 400); const s = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: dir, stdio: 'ignore' });
    await new Promise((r) => setTimeout(r, 900)); const got = await fetch(`http://127.0.0.1:${port}/play3.html`).then((r) => r.text()).catch(() => ''); if (got === disk) srv = s; else s.kill(); }
  if (!srv) throw new Error('no server for ' + dir);
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [], frames = []; let plan = null;
  const open = async (q) => { const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }); const page = await ctx.newPage();
    page.on('pageerror', (e) => errs.push(String(e).slice(0, 300))); page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
    const t = Date.now(); await page.goto(`http://127.0.0.1:${port}/play3.html?w=${W}&h=${H}&sentinel=1${q ? '&' + q : ''}${extra ? '&' + extra : ''}`);
    await page.waitForFunction(() => window.ready === true || window.__err, null, { timeout: 900000 }); return { page, ctx, loadS: (Date.now() - t) / 1000 }; };
  try {
    // ------------------------------------------------------------------ textured pass
    const { page, ctx, loadS } = await open('');
    const info = await page.evaluate(() => window.sectionInfo()); const s0page = await page.evaluate(() => window.state().s);
    if (!plan) {
      let a = info.S_REF ?? 0, b = info.LEVEL, pics = [s0page];
      if (area && info.areas) { const A = info.areas.find((x) => x.id === area); if (!A) throw new Error('no area ' + area); a = A.s0; b = A.s1; pics = (info.keys ?? []).filter((k) => k.area === area).map((k) => k.s); }
      // the sharpest turns of the route inside [a, b] (heading change over 1 u)
      const curves = await page.evaluate(([a, b]) => { const D = window.kitDebug ?? window.worldDebug, T = D.THREE, P = (s) => D.at(s, new T.Vector3()), hd = (s) => { const p = P(s + 0.5), q = P(s - 0.5); return Math.atan2(p.x - q.x, -(p.z - q.z)); };
        const L = []; for (let s = a + 1.5; s < b - 1.5; s += 0.25) { let d = hd(s + 0.5) - hd(s - 0.5); d = Math.atan2(Math.sin(d), Math.cos(d)); L.push([s, Math.abs(d) * 180 / Math.PI]); }
        L.sort((x, y) => y[1] - x[1]); const pick = []; for (const [s, d] of L) { if (d < 6) break; if (pick.every((p) => Math.abs(p[0] - s) > 3)) pick.push([s, d]); if (pick.length >= 2) break; } return pick; }, [a, b]);
      const lin = (f) => +(a + (b - a) * f).toFixed(2);
      const pos = [...pics.map((s) => ({ s: +s.toFixed(3), tag: 'picture', exact: true })), { s: +(a + Math.min(1.2, (b - a) * 0.05)).toFixed(2), tag: 'begin' }, { s: lin(0.25), tag: 'quarter' },
        { s: lin(0.5), tag: 'middle' }, { s: lin(0.75), tag: 'three_q' }, ...curves.map(([s, d]) => ({ s: +s.toFixed(2), tag: `curve_${Math.round(d)}deg` })), { s: +(b - 0.6).toFixed(2), tag: 'end' }];
      if (arg('s') === 'picture') pos.splice(0, pos.length, ...pos.filter((p) => p.tag === 'picture'));   // fast likeness check
      else if (arg('s')) pos.splice(0, pos.length, ...arg('s').split(',').map((x) => ({ s: +x, tag: 's' + x })));
      pos.sort((x, y) => x.s - y.s); plan = { range: [a, b], positions: pos, curves };
    }
    console.log('loaded', loadS.toFixed(1), 's; range', plan.range, 'positions', plan.positions.map((p) => p.tag + '@' + p.s).join(' '));
    const shoot = async (pg, name, meta) => { await pg.evaluate(() => window.renderNow(1)); const f = path.join(out, name + '.png'); await pg.screenshot({ path: f });
      const m = await pg.evaluate(() => ({ box: window.bennyBox(), qa: window.kitFrameQA ? window.kitFrameQA() : null, cam: window.camInfo(), st: window.state ? window.state() : null, bake: null }));
      frames.push({ file: path.basename(f), ...meta, ...m }); };
    const goTo = async (pg, target, exact) => {
      if (exact) { await pg.evaluate((s) => window.qaGoto(s), target); return; }
      let s = await pg.evaluate((s) => window.qaGoto(s), Math.max(plan.range[0], target - 1.0)); let i = 0;
      while (s < target - 1e-6 && i < 200) { const o = await pg.evaluate(([t, dt, sp]) => window.step(t, dt, 0, sp), [i / fps + 100, 1 / fps, Math.min(speed, (target - s) * fps)]); s = o.s; i++; } };
    const LANES = (arg('lanes', '0,-1,1')).split(',').map(Number); let lane = 0;
    for (const L of LANES) {
      while (lane !== L) { const dirn = L < lane ? 'left' : 'right'; await page.evaluate((d) => window.input.swipe(d), dirn); lane += L < lane ? -1 : 1; for (let i = 0; i < 12; i++) await page.evaluate(([t]) => window.step(t, 1 / 30, 0, 0.001), [200 + i / 30]); }
      for (const p of plan.positions) { if (p.exact && L !== 0) continue; await goTo(page, p.s, p.exact && L === 0); await shoot(page, `tex_${p.tag}_l${L}`, { mode: 'textured', tag: p.tag, s: p.s, lane: L }); }
    }
    await ctx.close();
    // ------------------------------------------------------------------ geometry pass (plain gray 3D materials)
    if (!flag('nogray')) {
      const g = await open('gray=1');
      for (const p of plan.positions) { await goTo(g.page, p.s, p.exact); await shoot(g.page, `gray_${p.tag}_l0`, { mode: 'gray', tag: p.tag, s: p.s, lane: 0 }); }
      await g.ctx.close();
    }
  } finally { await browser.close(); srv.kill(); }
  const rep = { dir, screen, area, plan, frames, errors: errs.slice(0, 20), seconds: (Date.now() - T0) / 1000 };
  fs.writeFileSync(path.join(out, 'preview_raw.json'), JSON.stringify(rep, null, 1));
  const r = spawnSync('python3', ['-I', path.join(__dirname, 'preview_sheet.py'), out, screen || '-', area || '-', dir], { encoding: 'utf8' });
  process.stdout.write(r.stdout || ''); if (r.status) { process.stdout.write(r.stderr || ''); process.exit(r.status); }
})().catch((e) => { console.error(e); process.exit(1); });
