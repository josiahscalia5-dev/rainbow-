#!/usr/bin/env node
// Screen 06 r11 (lead): which stretch of the 06 river floor lands inside the PAINTED tunnel mouth at the approved view.
// The painted mouth (BLUEPRINT_06: outer ring centre (650,570) r 330, glow (700,690)) is deep tunnel in the approved
// picture (Depth Anything 3: ~10x the depth of the water under Benny), but the m06_floor proxy covers it (m06dbg).
// Prints, per course position s, the projected river centre + both floor edges (x, y px) at the approved camera.
//   node tools/match06/r11_mouth_probe.mjs --q='<kept set>' [--out=file.json]
import { writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';

const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, ...r] = a.slice(2).split('='); return [k, r.length ? r.join('=') : true]; }));
const Q = typeof opt.q === 'string' ? opt.q : 'match06=1';
const { chromium } = loadPlaywright();
const vite = await startVite(5263);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const rows = await page.evaluate(async () => {
    const R = window.__rainbow; R.goto('06');
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    const { camera } = R.qa3d();
    const THREE = await import('/node_modules/.vite/deps/three.js');
    const { Course } = await import('/src/world/course.ts');
    const c = new Course(); const st = c.stage('06');
    camera.updateMatrixWorld();
    const px = (v) => { const p = v.clone().project(camera); return [Math.round((p.x + 1) / 2 * 864), Math.round((1 - p.y) / 2 * 1536), +p.z.toFixed(4)]; };
    const out = [];
    for (let s = st.s0; s <= st.s1 + 20; s += 1) {
      const q = c.sample(s), up = new THREE.Vector3(0, 1, 0), right = new THREE.Vector3().crossVectors(q.tan, up).normalize();
      const hw = c.widthAt(s) / 2 + 1;
      out.push({ s: +s.toFixed(1), c: px(q.pos), l: px(q.pos.clone().addScaledVector(right, -hw)), r: px(q.pos.clone().addScaledVector(right, hw)),
        dist: +q.pos.distanceTo(camera.position).toFixed(1), y: +q.pos.y.toFixed(2) });
    }
    return { s0: st.s0, s1: st.s1, rows: out };
  });
  if (typeof opt.out === 'string') writeFileSync(opt.out, JSON.stringify(rows, null, 1));
  for (const r of rows.rows) console.log(`s ${r.s}\tdist ${r.dist}\ty ${r.y}\tcentre ${r.c[0]},${r.c[1]}\tleft ${r.l[0]},${r.l[1]}\tright ${r.r[0]},${r.r[1]}`);
} finally { await browser.close(); await vite.close?.(); vite.kill?.(); }
