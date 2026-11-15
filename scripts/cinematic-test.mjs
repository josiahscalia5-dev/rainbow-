#!/usr/bin/env node
// Verifies the optional Google Flow cinematic hand-off in the REAL game build (headless Chromium):
//   1. with an intro video: overlay plays, the live 3D intro is held underneath, the overlay fades out and
//      the game continues in real time from 01 into the 03 ride (no slideshow, no stuck state);
//   2. without a video: no overlay, the real-time 01 cinematic starts at t = 0 (fallback).
// Usage: node scripts/cinematic-test.mjs [path-to-test-video-under-project-root]
// Writes qa/cinematic_test.json. Chromium here has no H.264, so the default test clip is VP8 WebM.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';

const clip = process.argv[2] ?? 'node_modules/.rainbow-test/intro.webm';
if (!existsSync(clip)) {
  mkdirSync('node_modules/.rainbow-test', { recursive: true });
  execSync(`ffmpeg -hide_banner -loglevel error -y -f lavfi -i color=c=0x8a2be2:s=360x640:d=2.5 -c:v libvpx -b:v 300k -an ${clip}`);
}
const { chromium } = loadPlaywright();
const vite = await startVite(5203);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const out = { when: new Date().toISOString(), clip, withVideo: {}, withoutVideo: {}, errors: [] };
const ready = (page) => page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
try {
  // ---- 1. with intro video
  let page = await browser.newPage({ viewport: { width: 432, height: 768 } });
  page.on('pageerror', (e) => out.errors.push(`with: ${e.message}`));
  await page.goto(`${vite.url}/?seed=7&dpr=1&introVideo=/${clip}`);
  await ready(page);
  const overlayShown = await page.waitForSelector('[data-cinematic]', { timeout: 15000 }).then(() => true).catch(() => false);
  const during = await page.evaluate(() => window.__rainbow.state());
  await page.waitForSelector('[data-cinematic]', { state: 'detached', timeout: 30000 });
  const afterFade = await page.evaluate(() => window.__rainbow.state());
  // the live 3D intro must continue after the fade: 01 -> 02 tumble -> 03 ride (slow under software WebGL)
  const advanced = await page.waitForFunction(() => { const s = window.__rainbow.state(); return s.mode === 'ride' || s.stage !== '01'; }, null, { timeout: 180000 }).then(() => true).catch(() => false);
  const ride = await page.evaluate(() => window.__rainbow.state());
  out.withVideo = { overlayShown, during, afterFade, ride, advanced, pass: overlayShown && during.paused === true && afterFade.paused === false && advanced };
  await page.close();

  // ---- 2. without video (real-time fallback)
  page = await browser.newPage({ viewport: { width: 432, height: 768 } });
  page.on('pageerror', (e) => out.errors.push(`without: ${e.message}`));
  await page.goto(`${vite.url}/?seed=7&dpr=1&introVideo=/does-not-exist.mp4`);
  await ready(page);
  await page.waitForTimeout(1500);
  const overlay = await page.$('[data-cinematic]');
  const st = await page.evaluate(() => window.__rainbow.state());
  out.withoutVideo = { overlay: !!overlay, state: st, pass: !overlay && st.mode === 'intro' && st.paused === false };
  await page.close();

  // ---- 3. edge-to-edge fit on a 20:9 phone: portrait clip -> cover crop, landscape clip -> blurred fill
  const land = 'node_modules/.rainbow-test/intro_landscape.webm';
  const port = 'node_modules/.rainbow-test/intro_portrait_pattern.webm';
  for (const [f, s] of [[land, '640x360'], [port, '360x640']]) {
    if (!existsSync(f)) execSync(`ffmpeg -hide_banner -loglevel error -y -f lavfi -i testsrc2=s=${s}:d=3 -c:v libvpx -b:v 400k -an ${f}`);
  }
  out.fit = {};
  for (const [name, file, expect] of [['portrait', port, 'cover'], ['landscape', land, 'fill']]) {
    page = await browser.newPage({ viewport: { width: 412, height: 915 }, isMobile: true });
    page.on('pageerror', (e) => out.errors.push(`fit-${name}: ${e.message}`));
    await page.goto(`${vite.url}/?seed=7&dpr=1&introVideo=/${file}`);
    await ready(page);
    await page.waitForFunction(() => document.querySelector('[data-cinematic]')?.dataset.fit, null, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(500);
    const fit = await page.evaluate(() => { const w = document.querySelector('[data-cinematic]'); return w ? { fit: w.dataset.fit, keep: +w.dataset.keep } : null; });
    mkdirSync('qa/aspect', { recursive: true });
    const shot = await page.screenshot({ path: `qa/aspect/flow_video_${name}_412x915.png` });
    // flat (single-colour) top/bottom rows = letterbox bars
    const flat = await page.evaluate(async (src) => {
      const img = new Image(); img.src = src; await img.decode();
      const cv = new OffscreenCanvas(img.width, img.height); const g = cv.getContext('2d'); g.drawImage(img, 0, 0);
      const rowStd = (y) => { const d = g.getImageData(0, y, img.width, 1).data; let s = 0, q = 0, n = 0;
        for (let i = 0; i < d.length; i += 4) { const l = d[i] + d[i + 1] + d[i + 2]; s += l; q += l * l; n++; } return Math.sqrt(Math.max(0, q / n - (s / n) ** 2)); };
      // a test-pattern frame has strong variation; a bar would be ~0. Check rows 2% from top and bottom.
      return { top: rowStd(Math.round(img.height * 0.02)), bottom: rowStd(Math.round(img.height * 0.98)) };
    }, `data:image/png;base64,${shot.toString('base64')}`);
    out.fit[name] = { ...fit, expect, edgeRowStd: flat, pass: fit?.fit === expect && flat.top > 1.5 && flat.bottom > 1.5 };
    await page.close();
  }
} finally {
  const fitPass = out.fit ? Object.values(out.fit).every((f) => f.pass) : false;
  out.pass = !!(out.withVideo.pass && out.withoutVideo.pass && fitPass && out.errors.length === 0);
  writeFileSync('qa/cinematic_test.json', JSON.stringify(out, null, 2));
  await browser.close();
  await vite.close();
}
console.log(JSON.stringify({ pass: out.pass, withVideo: out.withVideo.pass, withoutVideo: out.withoutVideo.pass, fit: out.fit, errors: out.errors.slice(0, 5) }));
process.exit(out.pass ? 0 : 1);
