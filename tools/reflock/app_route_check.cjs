// Round 40: checks the section INSIDE the built Rainbow app (dist/, the same files the Android APK carries) at 412x915 portrait:
//   1. the main game with ?bonus=1 rides from the end of Screen 04 and hands over to dist/section/ (coins carried)
//   2. the section loads its pre-baked textures, Benny swims it (game logic stepped to the exit), and hands back to the game
//   3. the game resumes at the Screen 05 checkpoint with the coins collected in the section
//   node app_route_check.cjs <dist folder> <out folder>
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
(async () => {
  const [dist, out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const port = 9800 + Math.floor(Math.random() * 150); const srv = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: dist, stdio: 'ignore' }); await new Promise((r) => setTimeout(r, 1200));
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const res = { steps: [], errors: [] };
  try {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }); const page = await ctx.newPage();
    page.on('pageerror', (e) => res.errors.push(String(e).slice(0, 300)));
    await page.goto(`http://127.0.0.1:${port}/index.html?bonus=1&qa=1`); await page.waitForFunction(() => window.__rainbow?.ready === true, null, { timeout: 600000 });
    const s05 = await page.evaluate(() => window.__rainbow.course.stage('05').s0);
    await page.evaluate((s) => window.__rainbow.gotoS(s - 3.0), s05); await page.screenshot({ path: path.join(out, '1_game_end_of_04.png') });
    res.steps.push({ step: 'game at the end of 04', state: await page.evaluate(() => window.__rainbow.state()) });
    const nav = page.waitForURL(/section\/index\.html/, { timeout: 120000 });
    await page.evaluate(() => { for (let i = 0; i < 400 && !document.hidden; i++) window.__rainbow.step(1, 1 / 30); });
    await nav; res.steps.push({ step: 'handed over to the section', url: page.url() });
    await page.waitForFunction(() => window.ready === true, null, { timeout: 600000 });
    res.steps.push({ step: 'section loaded', info: await page.evaluate(() => ({ ...window.sectionInfo(), bake: window.bakeStats()._prebaked })) });
    await page.screenshot({ path: path.join(out, '2_section_start.png') });
    const back = page.waitForURL(/index\.html\?resume=05/, { timeout: 300000 });
    await page.evaluate(() => { const L = window.sectionInfo().LEVEL; let t = 0; for (let i = 0; i < 2000; i++) { const o = window.step(t, 1 / 30, 0, 2.2); t += 1 / 30; if (o.s >= L) break; } });
    await back; res.steps.push({ step: 'handed back to the game', url: page.url() });
    await page.waitForFunction(() => window.__rainbow?.ready === true, null, { timeout: 600000 }); await page.waitForTimeout(1500);
    res.steps.push({ step: 'game resumed', state: await page.evaluate(() => window.__rainbow.state()) });
    await page.screenshot({ path: path.join(out, '3_game_resumed_05.png') });
  } catch (e) { res.errors.push('FAILED ' + String(e).slice(0, 300)); } finally { await browser.close(); srv.kill(); }
  fs.writeFileSync(path.join(out, 'route_check.json'), JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1));
})();
