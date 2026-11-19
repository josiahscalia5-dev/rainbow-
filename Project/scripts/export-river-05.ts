/**
 * Export the game's OWN Screen 05 river + tunnel layout for Blender (read-only use of the game code).
 *   npx vite-node scripts/export-river-05.ts [-- --cam=x,y,z --look=x,y,z --fov=62]
 * Writes qa/worldlabs/05/blender/river05_layout.json, consumed by tools/blender/build_05_river_scene.py.
 *
 * Contents (world units, Three.js axes: +Y up, the 05 tunnel runs toward −Z):
 *   river[]  every 0.25 u of stage 05 (plus 6 u of 04 and 06 on either side): centre, right, up,
 *            water width (Course.widthAt) and the cyan-core lateral (waterRibbon.coreLateral)
 *   tunnel   the straight 05 tunnel line a→b, radius (stage 'tube' prop) and the water depth below the axis
 *   checkpoint  the 05 gameplay checkpoint (s, Benny's water position) and, if given, the camera
 * The Blender scene built from this is the alignment base for a Marble/Atlas tunnel export; the near
 * river comes from this real game geometry, not from an invented image fill.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { Course } from '../src/world/course';
import { coreLateral } from '../src/vfx/waterRibbon';

const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
  const [k, ...r] = a.slice(2).split('=');
  return [k, r.join('=')];
}));
const vec = (s?: string) => (s ? s.split(',').map(Number) : null);

const c = new Course();
const st = c.stage('05');
const r3 = (v: { x: number; y: number; z: number }) => [+v.x.toFixed(4), +v.y.toFixed(4), +v.z.toFixed(4)];
const river: unknown[] = [];
for (let s = st.s0 - 6; s <= st.s1 + 6 + 1e-6; s += 0.25) {
  const f = c.sample(s);
  river.push({ s: +s.toFixed(3), pos: r3(f.pos), right: r3(f.right), up: r3(f.up), width: +c.widthAt(s).toFixed(4), core: +coreLateral(c, s).toFixed(4) });
}
const ax = c.straightAxes.find((a) => a.s0 >= st.s0 - 1 && a.s0 <= st.s0 + 1);
const cpS = c.marks['05_crest'];
const out = {
  generated: new Date().toISOString(),
  units: 'game units (1 u ≈ 5 cm at Benny scale); +Y up; 05 tunnel toward −Z',
  stage05: { s0: st.s0, s1: st.s1, width: st.width, tube: st.tube },
  tunnel: ax ? { a: r3(ax.a), b: r3(ax.b), radius: st.tube, floorDepth: ax.floorDepth, s0: ax.s0, s1: ax.s1 } : null,
  checkpoint: { s: cpS, benny: r3(c.pointAt(cpS)), camera: vec(opt.cam), look: vec(opt.look), fov: opt.fov ? +opt.fov : null },
  river,
};
mkdirSync('qa/worldlabs/05/blender', { recursive: true });
writeFileSync('qa/worldlabs/05/blender/river05_layout.json', JSON.stringify(out));
console.log('river samples', river.length, '| tunnel', JSON.stringify(out.tunnel), '| checkpoint s', cpS.toFixed(2));
