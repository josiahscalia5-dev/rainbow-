// r23 s07 (read-only QA): dump the 07 route in the fitted tube's frame (lateral off the tube axis, height, along), the coins
// (s, lat → tube frame) and the camera, for a query.  node tools/match07/route_r23.mjs <out.json> "<query>"
import { writeFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [OUT, Q] = process.argv.slice(2);
const L = JSON.parse(readFileSync('assets/textures/match07/proj07.json', 'utf8'));
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.QA_PORT ?? 5277));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 216, height: 384 } });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  const res = await page.evaluate((L) => {
    const r = window.__rainbow, c = r.course;
    const st = c.stage('07'), m = c.marks;
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const tf = (p) => { const q = sub([p.x, p.y, p.z], L.water); return { lat: +(dot(q, L.X) - L.tube.ax).toFixed(3), up: +dot(q, L.U).toFixed(3), along: +dot(q, L.D).toFixed(3) }; };
    const route = [];
    for (let s = st.s0 - 4; s <= st.s1; s += 1) { const f = c.sample(s); route.push({ s: +s.toFixed(1), ...tf(f.pos), w: c.widthAt(s) }); }
    const coins = r.coinDefs().filter((d) => d.s >= st.s0 - 2 && d.s <= st.s1).map((d) => { const f = c.sample(d.s); const p = f.pos.clone().addScaledVector(f.right, d.lat); return { s: +d.s.toFixed(2), lat: +d.lat.toFixed(2), ...tf(p) }; });
    return { s0: st.s0, s1: st.s1, marks: { top: m['07_plunge_top'], bottom: m['07_plunge_bottom'], m08: c.stage('08').s0 }, route, coins };
  }, L);
  writeFileSync(OUT, JSON.stringify(res, null, 1));
  console.log('s0', res.s0, 's1', res.s1, 'marks', JSON.stringify(res.marks), 'coins', res.coins.length);
} finally { await browser.close(); await vite.close?.(); }
