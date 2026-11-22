// Round 44 — join audit: how each area's EXIT meets the next area's ENTRANCE in the built app (dist/, the files the APK carries),
// 412 x 915 portrait, same camera as the game. Captures 2 frames before and 2 after every join of the route
//   04 -> A Bubble Dash -> B Sock Rescue -> 05 -> 06 -> 07 -> 08 -> 09 -> 10
// (A+B = public/section page, 06 kit = public/screen06 page; both are still separate page loads = the seams to remove).
//   node tools/world/join_audit.cjs <dist folder> <out folder>
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
(async () => {
  const [dist, out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const port = 9800 + Math.floor(Math.random() * 150);
  const srv = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: dist, stdio: 'ignore' }); await new Promise((r) => setTimeout(r, 1200));
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const res = { frames: [], errors: [] };
  const ctxOpts = { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 };
  const shot = async (page, name, meta) => { await page.screenshot({ path: path.join(out, name + '.png') }); res.frames.push({ name, ...meta }); };
  try {
    // ---- main game (04, 05, 06 old, 07, 08, 09, 10) ----
    const ctx = await browser.newContext(ctxOpts); const page = await ctx.newPage();
    page.on('pageerror', (e) => res.errors.push('game: ' + String(e).slice(0, 200)));
    await page.goto(`http://127.0.0.1:${port}/index.html?qa=1`); await page.waitForFunction(() => window.__rainbow?.ready === true, null, { timeout: 600000 });
    const S = await page.evaluate(() => Object.fromEntries(['04', '05', '06', '07', '08', '09', '10'].map((k) => [k, [window.__rainbow.course.stage(k).s0, window.__rainbow.course.stage(k).s1]])));
    res.stages = S;
    const at = async (name, s, meta) => { await page.evaluate((v) => window.__rainbow.gotoS(v), s); await page.waitForTimeout(400); await shot(page, name, { s, ...meta, state: await page.evaluate(() => window.__rainbow.state()) }); };
    await at('J1_04_exit_a', S['05'][0] - 6, { area: '04', join: '04>A' }); await at('J1_04_exit_b', S['05'][0] - 2, { area: '04', join: '04>A' });
    await at('J3_05_entrance_a', S['05'][0] + 1, { area: '05', join: 'B>05' }); await at('J3_05_entrance_b', S['05'][0] + 5, { area: '05', join: 'B>05' });
    for (const [k, n, j] of [['06', 'J4', '05>06'], ['07', 'J5', '06>07'], ['08', 'J6', '07>08'], ['09', 'J7', '08>09'], ['10', 'J8', '09>10']]) {
      const s0 = S[k][0], prev = j.slice(0, 2);
      await at(`${n}_${prev}_exit_a`, s0 - 6, { area: prev, join: j }); await at(`${n}_${prev}_exit_b`, s0 - 2, { area: prev, join: j });
      await at(`${n}_${k}_entrance_a`, s0 + 2, { area: k, join: j }); await at(`${n}_${k}_entrance_b`, s0 + 6, { area: k, join: j });
    }
    await ctx.close();
    // ---- section A + B (separate page today) ----
    const c2 = await browser.newContext(ctxOpts); const p2 = await c2.newPage(); p2.on('pageerror', (e) => res.errors.push('section: ' + String(e).slice(0, 200)));
    const sec = async (name, s0, meta) => { await p2.goto(`http://127.0.0.1:${port}/section/index.html?bonus=1&s0=${s0}`); await p2.waitForFunction(() => window.ready === true, null, { timeout: 600000 }); await p2.waitForTimeout(500); await shot(p2, name, { s: s0, ...meta }); };
    await sec('J1_A_entrance_a', 0, { area: 'A', join: '04>A' });
    const info = await p2.evaluate(() => window.sectionInfo()); res.section = info;
    await sec('J1_A_entrance_b', 4, { area: 'A', join: '04>A' });
    await sec('J2_A_exit_b', info.S_SOCK - 2, { area: 'A', join: 'A>B' }); await sec('J2_B_entrance_a', info.S_SOCK + 2, { area: 'B', join: 'A>B' });
    await sec('J3_B_exit_a', info.LEVEL - 6, { area: 'B', join: 'B>05' }); await sec('J3_B_exit_b', info.LEVEL - 1, { area: 'B', join: 'B>05' });
    await c2.close();
    // ---- kit Screen 06 (separate page today) ----
    const c3 = await browser.newContext(ctxOpts); const p3 = await c3.newPage(); p3.on('pageerror', (e) => res.errors.push('kit06: ' + String(e).slice(0, 200)));
    const k6 = async (name, s0, meta) => { await p3.goto(`http://127.0.0.1:${port}/screen06/index.html?kit06=1${s0 === null ? '' : '&s0=' + s0}`); await p3.waitForFunction(() => window.ready === true, null, { timeout: 600000 }); await p3.waitForTimeout(500); await shot(p3, name, { s: s0, ...meta }); };
    await k6('K6_kit06_entrance_picture', null, { area: '06kit', join: '05>06kit' });
    const i6 = await p3.evaluate(() => window.sectionInfo()); res.kit06 = i6;
    await k6('K6_kit06_exit_a', i6.LEVEL - 6, { area: '06kit', join: '06kit>07' }); await k6('K6_kit06_exit_b', i6.LEVEL - 1, { area: '06kit', join: '06kit>07' });
    await c3.close();
  } catch (e) { res.errors.push('FAILED ' + String(e).slice(0, 300)); } finally { await browser.close(); srv.kill(); }
  fs.writeFileSync(path.join(out, 'join_audit.json'), JSON.stringify(res, null, 1)); console.log(JSON.stringify({ frames: res.frames.length, errors: res.errors, stages: res.stages, section: res.section, kit06: res.kit06 }, null, 1));
})();
