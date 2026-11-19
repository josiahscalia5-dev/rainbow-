// Screen 05 round 9: heights where the near river (water_ribbon) meets the far tunnel's river (tube05_far_river) at
// the sliding seam, for one audit shot (same stepping as r8_shots.mjs). Prints, for the far river's first rows, each
// vertex's offset along the tunnel up axis from the ribbon's static surface (course pos + trough) at the same lateral.
//   node tools/match05/r9_seam_probe.mjs <shot> "<query>" [port]
import { pathToFileURL } from 'node:url';
import { realpathSync } from 'node:fs';
const { loadPlaywright, CHROMIUM_ARGS } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [SHOT = 't66_through_screen', Q = '', PORT = '5294'] = process.argv.slice(2);
const ALL = {
  a00_approved_view: [0, null], f03_forward3u: [3, null], f06_forward6u: [6, null], f10_forward10u: [10, null], f20_forward20u: [20, null],
  s_left_steer: [6, -1], s_right_steer: [6, 1], s_left_hard: [12, -1], s_right_hard: [12, 1],
  t33_through_screen: ['t0.33', null], t66_through_screen: ['t0.66', null], t95_through_screen: ['t0.95', null],
};
const { createServer } = await import('vite');
const server = await createServer({ server: { port: Number(PORT), strictPort: false, host: '127.0.0.1', hmr: false, watch: { ignored: ['**/*'] }, fs: { allow: [process.cwd(), realpathSync(`${process.cwd()}/node_modules`)] } }, logLevel: 'error' });
await server.listen();
const url = (server.resolvedUrls?.local?.[0] ?? `http://127.0.0.1:${PORT}/`).replace(/\/$/, '');
const { chromium } = loadPlaywright();
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  const [dist, steer] = ALL[SHOT];
  const out = await page.evaluate(async ([id, dist, steer]) => {
    const r = window.__rainbow; r.goto(id);
    const s0 = r.state().s;
    const stg = r.course.stage(id);
    const s1 = stg.s1 ?? (stg.s0 + (stg.length ?? 0));
    const target = typeof dist === 'string' ? s0 + Number(dist.slice(1)) * Math.max(0, s1 - s0) : s0 + dist;
    r.setSteer(steer);
    let n = 0; while (r.state().s < target - 1e-3 && n < 4000) { r.step(1); n++; }
    r.setSteer(null);
    r.run(true); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); r.run(false);
    const { far05Debug } = await import('/src/world/far05.ts');
    const ft = far05Debug.ft;
    const { scene } = r.qa3d();
    let river = null;
    scene.traverse((o) => { if (o.name === 'tube05_far_river') river = o; });
    const pa = river.geometry.getAttribute('position');
    const Zb = river.geometry.getAttribute('aRivB');
    const per = pa.count / 121;
    const rows = [];
    for (const i of [0, 1, 2, 4, 8]) {
      const row = [];
      for (let j = 0; j < per; j += 2) {
        const k = i * per + j;
        const P = { x: pa.getX(k), y: pa.getY(k), z: pa.getZ(k) };
        const Z = Zb.getW(k);
        // nearest course sample along the axis
        let best = 1e9, bs = 0;
        for (let s = 170; s < 200; s += 0.05) { const f = r.course.sample(s); const d = (P.x - f.pos.x) * ft.T.x + (P.y - f.pos.y) * ft.T.y + (P.z - f.pos.z) * ft.T.z; if (Math.abs(d) < best) { best = Math.abs(d); bs = s; } }
        const f = r.course.sample(bs);
        const hw = r.course.widthAt(bs) / 2;
        const v = { x: P.x - f.pos.x, y: P.y - f.pos.y, z: P.z - f.pos.z };
        const lat = v.x * f.right.x + v.y * f.right.y + v.z * f.right.z;
        const up = v.x * f.up.x + v.y * f.up.y + v.z * f.up.z;
        const u = Math.min(1, Math.abs(lat / hw));
        row.push({ j, Z: +Z.toFixed(2), s: +bs.toFixed(2), lat: +lat.toFixed(2), up: +up.toFixed(3), ribbon: +(0.28 * u * u * u).toFixed(3), d: +(up - 0.28 * u * u * u).toFixed(3) });
      }
      rows.push({ i, row });
    }
    return { state: r.state(), rows };
  }, ['05', dist, steer]);
  console.log(JSON.stringify(out.state));
  for (const r of out.rows) console.log('row', r.i, r.row.map((q) => `j${q.j} Z${q.Z} s${q.s} lat${q.lat} d${q.d}`).join(' | '));
} finally {
  await browser.close(); await server.close();
}
