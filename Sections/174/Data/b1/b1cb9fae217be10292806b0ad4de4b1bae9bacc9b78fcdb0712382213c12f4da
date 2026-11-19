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
  await page.waitForFunction(() => window.__rainbow.state().mode === 'ride', null, { timeout: 60000 });
  const ride = await page.evaluate(() => window.__rainbow.state());
  out.withVideo = { overlayShown, during, afterFade, ride, pass: overlayShown && during.paused === true && afterFade.paused === false && ride.mode === 'ride' };
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
} finally {
  out.pass = !!(out.withVideo.pass && out.withoutVideo.pass && out.errors.length === 0);
  writeFileSync('qa/cinematic_test.json', JSON.stringify(out, null, 2));
  await browser.close();
  await vite.close();
}
console.log(JSON.stringify({ pass: out.pass, withVideo: out.withVideo.pass, withoutVideo: out.withoutVideo.pass, errors: out.errors.slice(0, 5) }));
process.exit(out.pass ? 0 : 1);
