// Screen 05 round 15: layer probe through the 05 -> 06 hand-over (read-only). Same stepping as r8_shots.mjs; at each
// position runs window.__rainbow.probe on a grid (optionally after PRE_JS) and prints the first hits + camera / far state.
//   node tools/match05/r15_probe.mjs "<query>" x97,t98 [port]
import { pathToFileURL } from 'node:url';
import { realpathSync } from 'node:fs';
const { loadPlaywright, CHROMIUM_ARGS } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [Q = '', ONLY = 'x97', PORT = '5275'] = process.argv.slice(2);
const PRE = process.env.PRE_JS || '';
const EXTRA = process.env.EXTRA_JS || ''; // async expression evaluated after the render (printed)
const GRID = (process.env.GRID || '0,0.6;0,0.3;0,0;0,-0.3;0,-0.6;-0.6,0.3;0.6,0.3;-0.8,-0.3;0.8,-0.3;-0.6,0.7;0.6,0.7').split(';').map((p) => p.split(',').map(Number));
const { chromium } = loadPlaywright();
const { createServer } = await import('vite');
const server = await createServer({ server: { port: Number(PORT), strictPort: false, host: '127.0.0.1', hmr: false, watch: { ignored: ['**/*'] }, fs: { allow: [process.cwd(), realpathSync(`${process.cwd()}/node_modules`)] } }, logLevel: 'error' });
await server.listen();
const url = (server.resolvedUrls?.local?.[0] ?? `http://127.0.0.1:${PORT}/`).replace(/\/$/, '');
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  for (const name of ONLY.split(',')) {
    const m = name.match(/^[xt](\d+)([LR]?)/);
    const frac = Number(m[1]) / 100, steer = m[2] === 'L' ? -1 : m[2] === 'R' ? 1 : null;
    const res = await page.evaluate(async ([frac, steer, PRE, GRID, EXTRA]) => {
      const r = window.__rainbow; r.goto('05');
      const s0 = r.state().s, stg = r.course.stage('05');
      const s1 = stg.s1 ?? (stg.s0 + (stg.length ?? 0));
      const target = s0 + frac * (s1 - s0);
      r.setSteer(steer);
      let n = 0; while (r.state().s < target - 1e-3 && n < 4000) { r.step(1); n++; }
      r.setSteer(null);
      r.run(true); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); r.run(false);
      if (PRE) { eval(PRE); r.run(true); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); r.run(false); }
      const { scene, camera } = r.qa3d();
      let open = null;
      scene.traverse((o) => { if (o.name === 'tube05_far_wall' && o.morphTargetInfluences) open = o.morphTargetInfluences[0]; });
      const cam = camera.position.toArray().map((v) => +v.toFixed(2));
      const hits = GRID.map(([x, y]) => ({ at: [x, y], h: r.probe(x, y).slice(0, 3) }));
      const extra = EXTRA ? await eval(EXTRA) : null;
      return { s: r.state().s, stage: r.state().stage, cam, open, hits, extra };
    }, [frac, steer, PRE, GRID, EXTRA]);
    if (process.env.SHOT_DIR) await page.screenshot({ path: `${process.env.SHOT_DIR}/${name}.png` });
    console.log(`== ${name} s ${res.s} stage ${res.stage} cam ${res.cam} far-open ${res.open} extra ${JSON.stringify(res.extra)}`);
    for (const h of res.hits) console.log('  ', h.at.join(','), h.h.map((x) => `${x.obj} d${x.d}`).join(' | '));
  }
} finally { await browser.close(); await server.close(); }
