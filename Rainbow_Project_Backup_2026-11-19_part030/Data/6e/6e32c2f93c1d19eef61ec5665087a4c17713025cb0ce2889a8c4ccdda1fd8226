#!/usr/bin/env node
// Per-frame (60 Hz) camera trace of the real game from app start: camera position / forward / up, Benny, stage, and
// for Screen 08 the deviation from the approved (locked) 08 camera (assets/textures/match08/cam08_locked.json):
// position error (u), view-direction error (deg), roll error (deg).
// Usage: node tools/camclear/camtrace.mjs --q=match08=1 --t0=43 --t1=47 [--every=1] [--steerplan=t:v,...] --out=FILE
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const arg = (k, d = '') => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const q = arg('q'), t0 = Number(arg('t0', '43')), t1 = Number(arg('t1', '47')), every = Number(arg('every', '1'));
const out = arg('out', 'qa/gameplay_video/camtrace.json');
const steerPlan = arg('steerplan') ? arg('steerplan').split(',').map((p) => p.split(':').map(Number)) : [];
const lock = JSON.parse(readFileSync('assets/textures/match08/cam08_locked.json', 'utf8'));
const { chromium } = loadPlaywright();
const vite = await startVite(5238);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const page = await browser.newPage({ viewport: { width: 90, height: 160 } });
await page.goto(`${vite.url}/?qa=1&dpr=1&bloom=0${q ? '&' + q : ''}`);
await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
const rows = await page.evaluate(({ t0, t1, every, steerPlan, lock }) => {
  const api = window.__rainbow;
  const { camera, scene } = api.qa3d();
  const V3 = camera.position.constructor;
  const benny = scene.getObjectByName('Benny');
  const lc = new V3(...lock.cam), lf = new V3(...lock.fwd).normalize();
  const lup = new V3().setFromMatrixColumn({ elements: lock.mw }, 1).normalize();
  const steerAt = (t) => { let v = null; for (const [a, b] of steerPlan) if (t >= a) v = b; return v; };
  const rows = [];
  const n0 = Math.round(t0 * 60), n1 = Math.round(t1 * 60);
  for (let i = 1; i <= n1; i++) {
    api.setSteer(steerAt(i / 60));
    const st = api.step(1, 1 / 60);
    if (i < n0 || (i - n0) % every) continue;
    camera.updateMatrixWorld();
    const f = camera.getWorldDirection(new V3());
    const up = new V3().setFromMatrixColumn(camera.matrixWorld, 1).normalize();
    const b = (benny.children[0] ?? benny).getWorldPosition(new V3());
    // roll: angle between the camera up and world up, measured around the view axis
    const upFlat = new V3(0, 1, 0).addScaledVector(f, -f.y).normalize();
    const roll = Math.atan2(new V3().crossVectors(upFlat, up).dot(f), upFlat.dot(up)) * 180 / Math.PI;
    const r = { t: +(i / 60).toFixed(3), stage: st.stage, s: st.s, lat: st.lat, hearts: st.hearts, cam: camera.position.toArray().map((v) => +v.toFixed(3)), fwd: f.toArray().map((v) => +v.toFixed(4)), roll: +roll.toFixed(2), benny: b.toArray().map((v) => +v.toFixed(3)), fov: +camera.fov.toFixed(2) };
    if (st.stage === '08' || st.stage === '07' || st.stage === '09') {
      r.d08pos = +camera.position.distanceTo(lc).toFixed(3);
      r.d08dir = +(Math.acos(Math.min(1, f.dot(lf))) * 180 / Math.PI).toFixed(2);
      r.d08up = +(Math.acos(Math.min(1, up.dot(lup))) * 180 / Math.PI).toFixed(2);
    }
    rows.push(r);
  }
  return rows;
}, { t0, t1, every, steerPlan, lock });
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ q, t0, t1, steerPlan, lock: { cam: lock.cam, fwd: lock.fwd, s: lock.st.s }, rows }, null, 1));
console.log(out, rows.length, 'rows');
await browser.close();
await vite.close();
