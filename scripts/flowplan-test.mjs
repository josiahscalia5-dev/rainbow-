#!/usr/bin/env node
// `?flowplan=1` — the user's Google Flow production plan (videos 01–03 + 09–11, playable 3D 04–08), tested in the REAL
// game build (headless Chromium). Lead r3, 2026-11-17. Writes qa/flowplan/flowplan_test.json. Exit 1 on failure.
//   A. intro video + flowplan: the overlay plays while the ride is held PAUSED on the approved 04 view (04 checkpoint) underneath (03's coins
//      credited), then the cross-fade reveals 04 and the ride continues in real time.
//   B. ending video + flowplan: reaching the end of 08 starts the ending video (09–10 coins credited), then the
//      real-time 11 victory frame (Benny hidden, FINAL SPIN COMPLETE) follows.
//   C. flowplan WITHOUT videos: the real-time 01 opening plays exactly as before (fallback scenes preserved).
//   D. default game with an intro video and NO flowplan: unchanged (held at 01, continues into 02/03).
//   E. both videos + flowplan, full coin-seeking run 04–08: exactly 91 coins / 2,240 at the victory (account 4).
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';
const clip = 'node_modules/.rainbow-test/flow_test.webm';
if (!existsSync(clip)) {
  mkdirSync('node_modules/.rainbow-test', { recursive: true });
  execSync(`ffmpeg -hide_banner -loglevel error -y -f lavfi -i color=c=0x8a2be2:s=360x640:d=2.5 -c:v libvpx -b:v 300k -an ${clip}`);
}
mkdirSync('qa/flowplan', { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(5231);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const out = { when: new Date().toISOString(), clip, errors: [] };
const ready = (page) => page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
const open = async (q, tag) => {
  const page = await browser.newPage({ viewport: { width: 432, height: 768 } });
  page.on('pageerror', (e) => out.errors.push(`${tag}: ${e.message}`));
  await page.goto(`${vite.url}/?seed=7&dpr=1${q}`);
  await ready(page);
  return page;
};
const courseInfo = (page) => page.evaluate(() => {
  const a = window.__rainbow, c = a.course, d = a.coinDefs();
  return { s04: c.stage('04').s0 + 7.0, s09: c.stage('09').s0, total: d.length, before04: d.filter((x) => x.s < c.stage('04').s0 + 7.0).length, from09: d.filter((x) => x.s >= c.stage('09').s0).length };
});
try {
  // ---- A. intro video + flowplan
  let page = await open(`&flowplan=1&introVideo=/${clip}`, 'A');
  const shownA = await page.waitForSelector('[data-cinematic]', { timeout: 15000 }).then(() => true).catch(() => false);
  const infoA = await courseInfo(page);
  const duringA = await page.evaluate(() => window.__rainbow.state());
  await page.screenshot({ path: 'qa/flowplan/A_during_video.png' });
  await page.waitForSelector('[data-cinematic]', { state: 'detached', timeout: 30000 });
  const afterA = await page.evaluate(() => window.__rainbow.state());
  await page.screenshot({ path: 'qa/flowplan/A_after_fade_04.png' });
  const movesA = await page.waitForFunction((s0) => window.__rainbow.state().s > s0 + 0.5, afterA.s, { timeout: 120000 }).then(() => true).catch(() => false);
  out.A = { overlayShown: shownA, during: duringA, after: afterA, movesOn: movesA, info: infoA,
    pass: shownA && duringA.mode === 'ride' && duringA.stage === '04' && duringA.paused === true && Math.abs(duringA.s - infoA.s04) < 0.01
      && duringA.coins === 1330 + infoA.before04 * 10 && afterA.paused === false && movesA };
  await page.close();

  // ---- B. ending video + flowplan (no intro video: the real-time opening plays; jump to the end of 08 with the QA API)
  page = await open(`&flowplan=1&endingVideo=/${clip}`, 'B');
  const infoB = await courseInfo(page);
  await page.evaluate(() => { window.__rainbow.goto('08'); window.__rainbow.unfreeze(); });
  const beforeB = await page.evaluate(() => window.__rainbow.state());
  // advance the deterministic simulation until the hand-over fires (no rendering needed)
  const handB = await page.evaluate(() => { const a = window.__rainbow; for (let i = 0; i < 60 * 30; i++) { const s = a.step(1, 1 / 60); if (s.mode !== 'ride') return { steps: i, state: s }; } return null; });
  const shownB = await page.waitForSelector('[data-cinematic]', { timeout: 15000 }).then(() => true).catch(() => false);
  await page.waitForSelector('[data-cinematic]', { state: 'detached', timeout: 30000 });
  await page.evaluate(() => window.__rainbow.run(true));
  const endB = await page.waitForFunction(() => window.__rainbow.state().mode === 'end', null, { timeout: 120000 }).then(() => true).catch(() => false);
  const finB = await page.evaluate(() => window.__rainbow.state());
  await page.screenshot({ path: 'qa/flowplan/B_after_ending_video_11.png' });
  out.B = { info: infoB, before: beforeB, handOver: handB, overlayShown: shownB, reachedVictory: endB, final: finB,
    pass: !!handB && handB.state.stage === '11' && handB.state.paused === true && handB.state.s >= infoB.s09 - 0.05 && shownB && endB
      && finB.bennyVisible === false && handB.state.coins - beforeB.coins >= infoB.from09 * 10 };
  await page.close();

  // ---- C. flowplan without any video: real-time fallback opening
  page = await open(`&flowplan=1&introVideo=/does-not-exist.mp4&endingVideo=/does-not-exist.mp4`, 'C');
  await page.waitForTimeout(1500);
  const overlayC = !!(await page.$('[data-cinematic]'));
  const stC = await page.evaluate(() => window.__rainbow.state());
  out.C = { overlay: overlayC, state: stC, pass: !overlayC && stC.mode === 'intro' && stC.paused === false && stC.stage === '01' };
  await page.close();

  // ---- D. default game (no flowplan) with an intro video: unchanged behaviour (held at 01)
  // Race fix (account 4, 18:50 UTC): on a busy machine the read can land AFTER the 2.5 s clip has ended (overlay
  // fading, ride correctly released) — that observation says nothing about the hold, so re-open (max 3 tries).
  let shownD = false, duringD = null, seenD = null, triesD = 0;
  for (; triesD < 3; triesD++) {
    page = await open(`&introVideo=/${clip}`, 'D');
    shownD = await page.waitForSelector('[data-cinematic]', { timeout: 15000 }).then(() => true).catch(() => false);
    ({ st: duringD, seen: seenD } = await page.evaluate(() => {
      const v = document.querySelector('[data-cinematic] video');
      return { st: window.__rainbow.state(), seen: { videoEnded: !!v?.ended, t: v?.currentTime ?? null } };
    }));
    await page.close();
    if (!shownD || !seenD.videoEnded) break;
  }
  out.D = { overlayShown: shownD, during: duringD, observed: seenD, tries: triesD + 1,
    pass: shownD && !seenD.videoEnded && duringD.mode === 'intro' && duringD.paused === true };

  // ---- E. full run with BOTH videos + flowplan (account 4, 2026-11-17): intro -> held on 04 -> real coin-seeking ride
  //      04..08 (same steering rule as gameplay-test.mjs) -> ending video -> victory. Must end at exactly 91 / 2,240.
  //      (B's final number is not a run total: goto('08') shows the approved HUD value 2,040 and B rides straight.)
  //      The test takes control WHILE the video still covers the paused ride (run(false)), like a player who steers
  //      the moment 04 is revealed; otherwise ~0.75 s of the fade rides unsteered and can pass a coin (2,230 seen).
  page = await open(`&flowplan=1&introVideo=/${clip}&endingVideo=/${clip}`, 'E');
  await page.waitForSelector('[data-cinematic]', { timeout: 15000 });
  await page.evaluate(() => window.__rainbow.run(false));
  const introE = await page.evaluate(() => window.__rainbow.state());
  await page.waitForFunction(() => window.__rainbow.state().paused === false, null, { timeout: 30000 });
  const driveE = await page.evaluate(() => {
    const a = window.__rainbow, dt = 1 / 60;
    for (let i = 0; i < 60 * 120; i++) {
      const st = a.state();
      if (st.mode !== 'ride') return { steps: i, state: st, missed: a.coinDefs().filter((d) => !d.taken && d.s < a.course.stage('09').s0).map((d) => ({ s: +d.s.toFixed(2), lat: +d.lat.toFixed(2) })) };
      const next = a.coinDefs().find((d) => !d.taken && d.s > st.s + 0.5 && d.s < st.s + 12);
      a.setSteer(Math.max(-1, Math.min(1, ((next ? next.lat : 0) - st.lat) * 0.9)));
      a.step(1, dt);
    }
    return null;
  });
  const shownE = await page.waitForSelector('[data-cinematic]', { timeout: 15000 }).then(() => true).catch(() => false);
  await page.waitForSelector('[data-cinematic]', { state: 'detached', timeout: 30000 }).catch(() => {});
  await page.evaluate(() => { window.__rainbow.setSteer(null); window.__rainbow.run(true); });
  const endE = await page.waitForFunction(() => window.__rainbow.state().mode === 'end', null, { timeout: 120000 }).then(() => true).catch(() => false);
  const finE = await page.evaluate(() => window.__rainbow.state());
  const takenE = await page.evaluate(() => window.__rainbow.coinDefs().filter((d) => d.taken).length);
  out.E = { introHeld: introE, handOver: driveE, endingShown: shownE, reachedVictory: endE, final: finE, coinsTaken: takenE,
    pass: introE.stage === '04' && !!driveE && driveE.state.stage === '11' && driveE.missed.length === 0 && shownE && endE
      && finE.coins === 2240 && takenE === 91 && finE.bennyVisible === false };
  await page.close();
} finally {
  out.pass = !!(out.A?.pass && out.B?.pass && out.C?.pass && out.D?.pass && out.E?.pass && out.errors.length === 0);
  writeFileSync('qa/flowplan/flowplan_test.json', JSON.stringify(out, null, 2));
  await browser.close();
  await vite.close();
}
console.log(JSON.stringify({ pass: out.pass, A: out.A?.pass, B: out.B?.pass, C: out.C?.pass, D: out.D?.pass, E: out.E?.pass, finalE: out.E?.final?.coins, errors: out.errors.slice(0, 5) }));
process.exit(out.pass ? 0 : 1);
