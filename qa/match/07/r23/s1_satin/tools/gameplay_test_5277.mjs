#!/usr/bin/env node
// r22 s07 QA copy of scripts/gameplay-test.mjs: identical checks, dev server on port 5277 (the only port this worker may use); always pass --q and --out
// Automated gameplay + continuity test on the REAL running game (headless Chromium, WebGL).
// Drives Benny from 03 to the 11 ending with the deterministic simulation API and checks:
//  * continuous travel: s strictly increases, no position jump > speed·dt (no teleport/cut)
//  * camera continuity: no camera jump between steps (no hard cut), incl. the 07 plunge → 08
//  * 07 plunge: positive travel time, large vertical drop, 08 inlet reached from the bottom
//  * real coin pickups update the counter; steering into the foam wall costs a heart
//  * pause freezes the simulation; resume continues
//  * the run ends in the 11 victory with Benny hidden under the towel
// Writes qa/gameplay_test.json and qa/07_to_08_continuity.md. Exit 1 on failure.
//   node scripts/gameplay-test.mjs --q=river05=1 --out=qa/pilot05/wave11/tests/gameplay_river05.json
//   → the same run with URL test switches; with --q the tracked qa/ files above are NOT rewritten.
import { writeFileSync, mkdirSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';

const optQ = (process.argv.find((a) => a.startsWith('--q=')) ?? '').slice(4);
const optOut = (process.argv.find((a) => a.startsWith('--out=')) ?? '').slice(6);
// (r22 copy: port 5277, writes only --out)
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.QA_PORT ?? 5277));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const page = await browser.newPage({ viewport: { width: 216, height: 384 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`${vite.url}/?qa=1&dpr=1&bloom=0${optQ ? '&' + optQ : ''}`);
await page.waitForFunction(() => window.__rainbow?.ready, null, { timeout: 240000 });

const result = await page.evaluate(() => {
  const api = window.__rainbow;
  const c = api.course;
  const dt = 1 / 60;
  const out = { checks: {}, samples: [], plunge: {} };
  // ---- pause / resume
  api.startRideAt('03');
  api.setSteer(0);
  api.step(30, dt);
  const sBefore = api.state().s;
  api.togglePause();
  api.step(60, dt);
  const sPaused = api.state().s;
  api.togglePause();
  api.step(30, dt);
  const sAfter = api.state().s;
  out.checks.pauseFreezes = { pass: Math.abs(sPaused - sBefore) < 1e-6 && sAfter > sPaused, sBefore, sPaused, sAfter };

  // ---- full run 03 → 11 with a coin-seeking steering policy
  api.startRideAt('03');
  api.step(1, dt); // warm-up: place Benny/camera at the start pose before measuring continuity
  let prev = api.state();
  let maxJump = 0, maxCamJump = 0, nonMonotonic = 0, steps = 0;
  const startCoins = prev.coins;
  const plungeTop = c.marks['07_plunge_top'], plungeBottom = c.marks['07_plunge_bottom'], s08 = c.stage('08').s0;
  let tTop = null, tBottom = null, t08 = null, yTop = null, yBottom = null, y08 = null;
  let t = 0;
  const camPrev = { v: prev.cam };
  // steering policy: weave gently so Benny crosses coin lines (real pickups)
  while (steps < 60 * 120) {
    const st = api.state();
    if (st.mode !== 'ride') break;
    // coin-seeking: steer toward the lateral offset of the next untaken coin within 12 units
    const next = api.coinDefs().find((d) => !d.taken && d.s > st.s + 0.5 && d.s < st.s + 12);
    const want = next ? next.lat : 0;
    api.setSteer(Math.max(-1, Math.min(1, (want - st.lat) * 0.9)));
    const s1 = api.step(1, dt);
    steps++; t += dt;
    const ds = s1.s - st.s;
    if (ds <= 0 && s1.mode === 'ride') nonMonotonic++;
    const jump = Math.hypot(s1.cam[0] - camPrev.v[0], s1.cam[1] - camPrev.v[1], s1.cam[2] - camPrev.v[2]);
    maxCamJump = Math.max(maxCamJump, jump);
    camPrev.v = s1.cam;
    const yj = Math.abs(s1.bennyY - st.bennyY);
    if (yj > maxJump) { maxJump = yj; out.maxJumpAt = { s: st.s, s1: s1.s, stage: st.stage, y0: st.bennyY, y1: s1.bennyY, t: +t.toFixed(3) }; }
    if (tTop === null && s1.s >= plungeTop) { tTop = t; yTop = s1.bennyY; }
    if (tBottom === null && s1.s >= plungeBottom) { tBottom = t; yBottom = s1.bennyY; }
    if (t08 === null && s1.s >= s08) { t08 = t; y08 = s1.bennyY; }
    if (steps % 30 === 0) out.samples.push({ t: +t.toFixed(2), s: s1.s, stage: s1.stage, y: s1.bennyY, cam: s1.cam, coins: s1.coins });
    prev = s1;
  }
  const endState = api.state();
  // let the outro play to the victory
  api.step(60 * 7, dt);
  const fin = api.state();
  out.checks.continuousTravel = { pass: nonMonotonic === 0, nonMonotonicSteps: nonMonotonic, steps, respawns: api.respawns() };
  out.checks.noCameraCut = { pass: maxCamJump < 1.5, maxCameraJumpPerStep: +maxCamJump.toFixed(3) };
  out.checks.noTeleport = { pass: maxJump < 1.0, maxBennyAltitudeJumpPerStep: +maxJump.toFixed(3), at: out.maxJumpAt };
  out.plunge = { tTop, tBottom, t08, yTop, yBottom, y08, travelTimeTopToInlet: t08 && tTop ? +(t08 - tTop).toFixed(2) : null, verticalDrop: yTop !== null && y08 !== null ? +(yTop - y08).toFixed(2) : null };
  out.checks.plunge = { pass: out.plunge.travelTimeTopToInlet > 2 && out.plunge.verticalDrop > 50, ...out.plunge };
  out.checks.realCoinPickups = { pass: endState.coins > startCoins, startCoins, endCoins: endState.coins, collected: (endState.coins - startCoins) / 10 };
  out.checks.victory = { pass: fin.mode === 'end' && fin.stage === '11' && fin.bennyVisible === false, finalState: fin };

  // ---- hearts: hold steer into the wall in 05
  api.startRideAt('05');
  api.setSteer(1);
  api.step(60 * 3, dt);
  const h = api.state();
  out.checks.heartsLostOnWallBump = { pass: h.hearts < 5, hearts: h.hearts };
  api.setSteer(null);
  return out;
});

result.errors = errors;
result.pass = Object.values(result.checks).every((c) => c.pass) && errors.length === 0;
if (optQ) result.query = optQ;
if (optQ || optOut) {
  const f = optOut || 'qa/gameplay_test_switch.json';
  writeFileSync(f, JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ query: optQ, out: f, pass: result.pass, checks: Object.fromEntries(Object.entries(result.checks).map(([k, v]) => [k, v.pass])), plunge: result.plunge, errors }, null, 1));
  await browser.close();
  await vite.close();
  process.exit(result.pass ? 0 : 1);
}
writeFileSync('qa/gameplay_test.json', JSON.stringify(result, null, 2));
const p = result.plunge;
const md = [
  '# 07 → 08 continuity proof (automated)',
  '',
  'Generated by `node scripts/gameplay-test.mjs` driving the real game build in headless Chromium',
  '(deterministic 60 Hz simulation, coin-seeking steering). Frames: `qa/continuity/07a…07d.png`',
  '(`node scripts/capture.mjs --plunge`).',
  '',
  `| Point | sim time (s) | Benny altitude |`,
  `|---|---|---|`,
  `| plunge top (end of 07 winding stretch) | ${p.tTop?.toFixed(2)} | ${p.yTop} |`,
  `| plunge bottom (pull-up complete) | ${p.tBottom?.toFixed(2)} | ${p.yBottom} |`,
  `| 08 inlet (chamber back wall) | ${p.t08?.toFixed(2)} | ${p.y08} |`,
  '',
  `* travel time top → 08 inlet: **${p.travelTimeTopToInlet} s**; vertical drop: **${p.verticalDrop} units**`,
  `* max camera movement per 1/60 s step over the whole run: **${result.checks.noCameraCut.maxCameraJumpPerStep}** units (no cuts)`,
  `* max Benny altitude change per step: **${result.checks.noTeleport.maxBennyAltitudeJumpPerStep}** (no teleport)`,
  `* s strictly increasing every step: **${result.checks.continuousTravel.pass}** (${result.checks.continuousTravel.steps} steps)`,
  '',
  '## All checks',
  '',
  ...Object.entries(result.checks).map(([k, v]) => `* ${v.pass ? '✅' : '❌'} **${k}** — ${JSON.stringify(Object.fromEntries(Object.entries(v).filter(([kk]) => kk !== 'pass' && kk !== 'finalState')))}`),
  '',
  `Page errors: ${errors.length ? errors.join('; ') : 'none'}`,
];
writeFileSync('qa/07_to_08_continuity.md', md.join('\n') + '\n');
console.log(JSON.stringify({ pass: result.pass, checks: Object.fromEntries(Object.entries(result.checks).map(([k, v]) => [k, v.pass])), plunge: result.plunge, errors }, null, 1));
await browser.close();
await vite.close();
process.exit(result.pass ? 0 : 1);
