// Rainbow screen kit - RIBBON WATER (round 45, URL test switch ?water=ribbon; default unchanged). The user: "my water looks messy. Just because it
// matches the same color doesn't mean it matches my water." The painted 05 water is CLEAN: long smooth S-shaped ribbons - a wide cyan channel with
// fine white streaks along the flow, a broad hot-pink ribbon on each side with fine lighter streaks like brushed silk, soft edges between the bands,
// outer cyan toward the foam, a glossy sheen and a few star glints. A stretched copy of the painting (the swatches) smears and repeats; this draws
// that STRUCTURE live, resolution-free, so it is just as clean 10 cm in front of the camera as far away.
// Measured on references/05_flow_into_the_current.png (rows 560-1150): cyan dark / mid / bright (4,139,234) (10,168,250) (42,220,249), pink
// (204,32,159) (244,60,215) (248,110,236), white streaks (247,243,252); band layout from the painted river (pink edge to pink edge = river width).
// Coordinates: the area's own x / z (vL), lateral = distance from the river centre line (Benny's route, a 1-D texture of route x by z), along = -z.
export const RIBBON_GLSL = `
uniform sampler2D uRouteX; uniform vec4 uRouteZ; uniform float uRibbon; uniform float uRStyle; uniform vec4 uRUv; vec4 gRUv = vec4(0.0);   /* gRUv: set by the material before ribbonWater (06: exact lateral + route distance) */ uniform sampler2D uDetC, uDetP; uniform vec4 uDetCM, uDetPM; uniform float uDetS, uDetOn;
float rbH(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float rbN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(rbH(i), rbH(i + vec2(1, 0)), f.x), mix(rbH(i + vec2(0, 1)), rbH(i + vec2(1, 1)), f.x), f.y); }
// 06 style (uRStyle 1): the rising crest = a bright cyan sheet with white streaks and RAINBOW edges (green, yellow, orange, pink, purple),
// measured order from the approved 06 picture; on the banked crest the lateral coordinate comes from the ribbon's own UV (uRUv.x = 1: exact
// across the banked surface, uRUv.y = half width, uRUv.z = route distance) instead of the flat x / z
vec3 rainbowEdge(float an){ vec3 c0 = vec3(0.05, 0.72, 1.0), c1 = vec3(0.35, 0.95, 0.55), c2 = vec3(1.0, 0.93, 0.35), c3 = vec3(1.0, 0.62, 0.3), c4 = vec3(1.0, 0.36, 0.78), c5 = vec3(0.62, 0.32, 0.95);
  float k = clamp((an - 0.58) / 0.4, 0.0, 1.0) * 5.0; vec3 c = mix(c0, c1, clamp(k, 0.0, 1.0)); c = mix(c, c2, clamp(k - 1.0, 0.0, 1.0)); c = mix(c, c3, clamp(k - 2.0, 0.0, 1.0)); c = mix(c, c4, clamp(k - 3.0, 0.0, 1.0)); return mix(c, c5, clamp(k - 4.0, 0.0, 1.0)); }
vec3 ribbonWater(vec3 L, float t, float flow, vec3 vWv){
  if (uRStyle > 0.5) { float lat = gRUv.x > 0.5 ? gRUv.y : (L.x - texture2D(uRouteX, vec2(clamp((L.z - uRouteZ.x) / (uRouteZ.y - uRouteZ.x), 0.0, 1.0), 0.5)).r) / uRouteZ.z, d = (gRUv.x > 0.5 ? gRUv.z : -L.z) + t * flow, an = abs(lat) + 0.03 * sin(d * 1.3);
    vec3 cyM = vec3(10.0, 168.0, 250.0) / 255.0, cyB = vec3(90.0, 226.0, 255.0) / 255.0;
    vec3 col = mix(cyB, cyM, smoothstep(0.0, 0.55, an)); float eb = smoothstep(0.55, 0.62, an); col = mix(col, rainbowEdge(an), eb);
    float w = an * 40.0 + 0.6 * sin(d * 0.8 + an * 3.0) + 1.0 * rbN(vec2(an * 4.0, d * 0.4)), fw = max(fwidth(w), 1e-4), f = abs(fract(w) - 0.5) * 2.0;
    float line = (1.0 - smoothstep(0.0, max(0.3, 1.8 * fw), f)) * smoothstep(0.45, 0.85, rbN(vec2(floor(w) * 1.3, d * 1.5))) * (1.0 - smoothstep(0.25, 0.7, fw));
    col = mix(col, vec3(0.96, 1.0, 1.0), 0.55 * line * (1.0 - 0.6 * eb));
    vec2 g = vec2(an * 6.0, d * 1.6); vec2 cell = floor(g); float hh = rbH(cell + 0.37);
    if (hh < 0.25) { vec2 q = (g - cell - 0.5) / vec2(6.0, 1.6); float tw = 0.4 + 0.6 * pow(0.5 + 0.5 * sin(t * 3.0 + hh * 60.0), 2.0);
      float star = exp(-dot(q, q) / 0.00012) + exp(-abs(q.x) / 0.03) * exp(-q.y * q.y / 0.00003) + 0.7 * exp(-abs(q.y) / 0.03) * exp(-q.x * q.x / 0.00003); col = mix(col, vec3(1.0), clamp(star * tw, 0.0, 1.0)); }
    return clamp(col, 0.0, 1.0); }
  float zt = clamp((L.z - uRouteZ.x) / (uRouteZ.y - uRouteZ.x), 0.0, 1.0), e = 0.03 / max(1e-3, uRouteZ.y - uRouteZ.x);
  float rx = texture2D(uRouteX, vec2(zt, 0.5)).r, sl = (texture2D(uRouteX, vec2(min(1.0, zt + e), 0.5)).r - texture2D(uRouteX, vec2(max(0.0, zt - e), 0.5)).r) / 0.06;
  float lat = (L.x - rx) / sqrt(1.0 + sl * sl), d = -L.z + t * flow, hw = uRouteZ.z;
  // the whole band pattern swings across the river in S-curves (the painting's pink ribbons sweep from side to side)
  float n = lat / hw + 0.42 * sin(d * 0.95 + 0.6) + 0.14 * sin(d * 2.2 + 2.0), an = abs(n) + 0.05 * sin(d * 2.6 + n * 2.5);   // stronger, tighter S-swing (painting)
  vec3 cyD = vec3(4.0, 139.0, 234.0) / 255.0, cyM = vec3(10.0, 168.0, 250.0) / 255.0, cyB = vec3(42.0, 220.0, 249.0) / 255.0;
  vec3 pkD = vec3(204.0, 32.0, 159.0) / 255.0, pkM = vec3(244.0, 60.0, 215.0) / 255.0, pkB = vec3(248.0, 110.0, 236.0) / 255.0;
  float ea = max(0.04, 1.5 * fwidth(an));
  // two pink ribbons per side (the painting: about as much pink as cyan): inner 0.42-0.95, outer 1.25-1.75
  float p1 = smoothstep(0.46 - ea, 0.54 + ea, an) * (1.0 - smoothstep(0.8 - ea, 0.9 + ea, an));   // narrower pink ribbons
  float p2 = smoothstep(1.2 - ea, 1.28 + ea, an) * (1.0 - smoothstep(1.52 - ea, 1.62 + ea, an));
  float pinkW = max(p1, p2);
  vec3 cyan = mix(cyM, cyB, 0.7 * (1.0 - smoothstep(0.0, 0.42, an)));
  cyan = mix(cyan, mix(cyM, cyB, 0.35), smoothstep(1.0, 1.15, an) * (1.0 - smoothstep(1.2, 1.3, an)));   // the bright cyan seam between the pinks
  cyan = mix(cyan, mix(cyD, cyM, 0.6), smoothstep(1.75, 2.1, an));
  float pc = max(1.0 - clamp(abs(an - 0.67) / 0.18, 0.0, 1.0), 1.0 - clamp(abs(an - 1.4) / 0.18, 0.0, 1.0));
  vec3 pink = mix(pkD, pkM, smoothstep(0.0, 0.6, pc)); pink = mix(pink, pkB, 0.6 * smoothstep(0.55, 1.0, pc));
  vec3 col = mix(cyan, pink, pinkW);
  // the painting's OWN detail inside each band (water_detail.py: seamless cyan / pink tiles cut from the flattened picture, fixed size in the
  // world -> never smeared): luminance + colour variation relative to the tile's mean, on top of the clean band colour
  if (uDetOn > 0.5) { vec2 tu = vec2(lat, d) / uDetS; vec3 dc = texture2D(uDetC, tu).rgb / max(uDetCM.rgb, vec3(0.06)), dp = texture2D(uDetP, tu * vec2(1.0, 0.85) + 0.37).rgb / max(uDetPM.rgb, vec3(0.06));
    col = mix(col, clamp(col * mix(dc, dp, pinkW), 0.0, 1.0), 0.85); }
  // brushed silk: soft fine streaks along the flow, short and irregular (not ruled lines)
  float w = lat * 34.0 + 0.6 * sin(d * 0.7 + lat * 2.4) + 1.1 * rbN(vec2(lat * 3.0, d * 0.3)), fw = max(fwidth(w), 1e-4);
  float f = abs(fract(w) - 0.5) * 2.0, line = 1.0 - smoothstep(0.0, max(0.3, 1.8 * fw), f);
  float seg = smoothstep(0.5, 0.85, rbN(vec2(floor(w) * 1.37, d * 1.7))) * (0.55 + 0.45 * rbN(vec2(floor(w) * 0.71, d * 0.5)));
  float vis = 1.0 - smoothstep(0.25, 0.7, fw);
  vec3 lineCol = mix(vec3(0.92, 0.99, 1.0), vec3(1.0, 0.76, 0.96), pinkW);
  col = mix(col, lineCol, clamp(line * seg * vis, 0.0, 1.0) * mix(0.5, 0.45, pinkW));
  // the painting's silky glow: a second, finer streak layer everywhere (dense, soft, bright) + luminous band centres
  float w3 = lat * 80.0 + 0.8 * sin(d * 0.9 + lat * 3.0) + 1.4 * rbN(vec2(lat * 6.0, d * 0.5)), fw3 = max(fwidth(w3), 1e-4), f3 = abs(fract(w3) - 0.5) * 2.0;
  float l3 = (1.0 - smoothstep(0.0, max(0.35, 1.8 * fw3), f3)) * (0.35 + 0.65 * rbN(vec2(floor(w3) * 0.9, d * 2.4))) * (1.0 - smoothstep(0.3, 0.8, fw3));
  col = mix(col, mix(vec3(0.75, 0.97, 1.0), vec3(1.0, 0.7, 0.95), pinkW), 0.32 * l3);
  col = mix(col, col * 1.12 + 0.04, 0.6 * (1.0 - smoothstep(0.0, 0.3, an)) + 0.5 * smoothstep(0.6, 1.0, pc) * pinkW);   // glow in the cyan centre and along each pink ribbon
  // the painting's bright white DASHES: short, thick-ish, along the flow, many in the cyan, some on the pink
  vec2 gd = vec2(lat * 7.0, d * 1.25); vec2 cd = floor(gd); float hd = rbH(cd + 7.7);
  if (hd < 0.16) { vec2 o = (gd - cd - vec2(0.5 + 0.3 * (rbH(cd + 2.2) - 0.5), 0.5)) / vec2(7.0, 1.25); float lenD = 0.07 + 0.12 * rbH(cd + 5.5), wid = 0.003 + 0.004 * rbH(cd + 9.1);
    float dsh = exp(-pow(o.x / max(wid, 0.8 * fwidth(lat)), 2.0)) * (1.0 - smoothstep(lenD * 0.4, lenD * 0.5, abs(o.y))) * (1.0 - smoothstep(0.3, 1.0, fwidth(gd.y)));
    col = mix(col, vec3(0.97, 1.0, 1.0), clamp(dsh, 0.0, 1.0) * mix(0.55, 0.35, pinkW)); }
  // glossy sheen
  col += 0.08 * smoothstep(0.35, 0.95, rbN(vec2(lat * 0.9, d * 0.35 - t * 0.1))) * (1.0 - 0.5 * pinkW);
  // star glints
  vec2 g = vec2(lat * 3.2, d * 1.6); vec2 cell = floor(g); float hh = rbH(cell + 0.37);
  if (hh < 0.3) { vec2 pc2 = cell + vec2(0.25 + 0.5 * rbH(cell + 1.7), 0.25 + 0.5 * rbH(cell + 4.1)); vec2 q = (g - pc2) / vec2(3.2, 1.6);
    float tw = 0.5 + 0.5 * sin(t * 3.0 + hh * 60.0); tw = 0.35 + 0.65 * tw * tw; float sz = 1.0 + 0.8 * rbH(cell + 3.3), s = max(fwidth(g.x), fwidth(g.y));
    float star = exp(-dot(q, q) / (0.00016 * sz)) + exp(-abs(q.x) / (0.035 * sz)) * exp(-q.y * q.y / 0.00003) + 0.7 * exp(-abs(q.y) / (0.035 * sz)) * exp(-q.x * q.x / 0.00003);
    col = mix(col, vec3(1.0), clamp(star * tw * (1.0 - smoothstep(0.05, 0.3, s)), 0.0, 1.0)); }
  return clamp(col, 0.0, 1.0); }`;

// route centre line x by z (area-local) as a float texture (nearest, 4096 samples) + the uniforms the materials need
export function routeUniforms(THREE, LAY) {
  const P = LAY.route.points; let z0 = Infinity, z1 = -Infinity; for (const p of P) { z0 = Math.min(z0, p[2]); z1 = Math.max(z1, p[2]); }
  const N = 4096, data = new Float32Array(N); let j = P.length - 1;   // route z decreases along s: walk from the far end
  const byZ = [...P].sort((a, b) => a[2] - b[2]);
  for (let i = 0, k = 0; i < N; i++) { const z = z0 + (z1 - z0) * i / (N - 1); while (k < byZ.length - 2 && byZ[k + 1][2] < z) k++; const a = byZ[k], b = byZ[k + 1] ?? a, f = b[2] > a[2] ? (z - a[2]) / (b[2] - a[2]) : 0; data[i] = a[0] + (b[0] - a[0]) * Math.min(1, Math.max(0, f)); }
  void j;
  const tex = new THREE.DataTexture(data, N, 1, THREE.RedFormat, THREE.FloatType); tex.minFilter = tex.magFilter = THREE.NearestFilter; tex.needsUpdate = true;
  return { uRouteX: { value: tex }, uRouteZ: { value: new THREE.Vector4(z0, z1, (LAY.river_width ?? LAY.route.width) / 2, 1) },
    uRStyle: { value: LAY.water_style === 'ribbon06' ? 1 : 0 },
    uDetC: { value: null }, uDetP: { value: null }, uDetCM: { value: new THREE.Vector4(1, 1, 1, 1) }, uDetPM: { value: new THREE.Vector4(1, 1, 1, 1) }, uDetS: { value: 0.64 }, uDetOn: { value: 0 } };
}
// the painted detail tiles of an area (baked/detail_*.jpg + manifest.water_detail) -> the ribbon uniforms (shared by all its water materials)
export async function loadDetail(THREE, tl, base, MANI, U) {
  const D = MANI?.water_detail; if (!D || !U) return false;
  const ld = async (f) => { const t = await tl.loadAsync(base + f); t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t; };
  U.uDetC.value = await ld('detail_cyan.jpg'); U.uDetP.value = await ld('detail_pink.jpg'); U.uDetCM.value.set(...D.cyan_mean, 1); U.uDetPM.value.set(...D.pink_mean, 1); U.uDetS.value = D.tile_m; U.uDetOn.value = 1; return true;
}
