// r25 (QA only, no browser): the 06 river frames (pos / up / right) from the game's own course.ts under the given query, for
// tools/match06/make_hole06.py.  cd /home/user/wt/s06 && npx vite-node tools/match06/r25_frames.mjs -- "<query>" <out.json> [sa] [sb] [ds]
import { writeFileSync } from 'node:fs';
const args = process.argv.slice(2).filter((a) => a !== '--');
const [Q, OUT, SA, SB, DS] = args;
globalThis.location = { search: '?' + Q, href: 'http://x/?' + Q, hostname: 'x' };
const { Course } = await import('../../src/world/course');
const c = new Course();
const sa = Number(SA ?? 186), sb = Number(SB ?? 236), ds = Number(DS ?? 0.05);
const rows = [];
for (let s = sa; s <= sb + 1e-9; s += ds) {
  const f = c.sample(s);
  rows.push([+s.toFixed(4), ...f.pos.toArray(), ...f.up.toArray(), ...f.right.toArray()]);
}
const g6 = c.stage('06');
writeFileSync(OUT, JSON.stringify({ query: Q, s06: [g6.s0, g6.s1], cols: 's px py pz ux uy uz rx ry rz', rows }));
console.log('frames', rows.length, 'stage06', g6.s0, g6.s1);
