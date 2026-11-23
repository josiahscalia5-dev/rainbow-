// Rainbow screen kit - RIBBON WATER (round 45, URL test switch ?water=ribbon; default unchanged). The user: "my water looks messy. Just because it
// matches the same color doesn't mean it matches my water." The painted 05 water is CLEAN: long smooth S-shaped ribbons - a wide cyan channel with
// fine white streaks along the flow, a broad hot-pink ribbon on each side with fine lighter streaks like brushed silk, soft edges between the bands,
// outer cyan toward the foam, a glossy sheen and a few star glints. A stretched copy of the painting (the swatches) smears and repeats; this draws
// that STRUCTURE live, resolution-free, so it is just as clean 10 cm in front of the camera as far away.
// Measured on references/05_flow_into_the_current.png (rows 560-1150): cyan dark / mid / bright (4,139,234) (10,168,250) (42,220,249), pink
// (204,32,159) (244,60,215) (248,110,236), white streaks (247,243,252); band layout from the painted river (pink edge to pink edge = river width).
// Coordinates: the area's own x / z (vL), lateral = distance from the river centre line (Benny's route, a 1-D texture of route x by z), along = -z.
export const RIBBON_GLSL = `
uniform sampler2D uRouteX; uniform vec4 uRouteZ; uniform float uRibbon; uniform float uRStyle; uniform vec4 uRUv; vec4 gRUv = vec4(0.0);   /* gRUv: set by the material before ribbonWater (x 1 = 06: normalised lateral + route distance; x 2 = r46 connector strip: lateral in m + along distance) */ uniform sampler2D uDetC, uDetP; uniform vec4 uDetCM, uDetPM; uniform float uDetS, uDetOn; uniform float uRich; uniform float uRainbow;
float rbSq(float x){ return x * x; }   /* r46: rbSq(x) is undefined for x < 0 in GLSL (NaN on some GPUs) */
float rbH(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float rbN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(rbH(i), rbH(i + vec2(1, 0)), f.x), mix(rbH(i + vec2(0, 1)), rbH(i + vec2(1, 1)), f.x), f.y); }
// 06 style (uRStyle 1): the rising crest = a bright cyan sheet with white streaks and RAINBOW edges (green, yellow, orange, pink, purple),
// measured order from the approved 06 picture; on the banked crest the lateral coordinate comes from the ribbon's own UV (uRUv.x = 1: exact
// across the banked surface, uRUv.y = half width, uRUv.z = route distance) instead of the flat x / z
vec3 rainbowEdge(float an){ vec3 c0 = vec3(0.05, 0.72, 1.0), c1 = vec3(0.35, 0.95, 0.55), c2 = vec3(1.0, 0.93, 0.35), c3 = vec3(1.0, 0.62, 0.3), c4 = vec3(1.0, 0.36, 0.78), c5 = vec3(0.62, 0.32, 0.95);
  float k = clamp((an - 0.58) / 0.4, 0.0, 1.0) * 5.0; vec3 c = mix(c0, c1, clamp(k, 0.0, 1.0)); c = mix(c, c2, clamp(k - 1.0, 0.0, 1.0)); c = mix(c, c3, clamp(k - 2.0, 0.0, 1.0)); c = mix(c, c4, clamp(k - 3.0, 0.0, 1.0)); return mix(c, c5, clamp(k - 4.0, 0.0, 1.0)); }
vec3 ribbonWater(vec3 L, float t, float flow, vec3 vWv){
  if (uRStyle > 0.5) { float lat = gRUv.x > 1.5 ? gRUv.y / uRouteZ.z : gRUv.x > 0.5 ? gRUv.y : (L.x - texture2D(uRouteX, vec2(clamp((L.z - uRouteZ.x) / (uRouteZ.y - uRouteZ.x), 0.0, 1.0), 0.5)).r) / uRouteZ.z, d = (gRUv.x > 0.5 ? gRUv.z : -L.z) + t * flow, an = abs(lat) + 0.03 * sin(d * 1.3);
    vec3 cyM = vec3(10.0, 168.0, 250.0) / 255.0, cyB = vec3(90.0, 226.0, 255.0) / 255.0;
    vec3 col = mix(cyB, cyM, smoothstep(0.0, 0.55, an)); float eb = smoothstep(0.55, 0.62, an); col = mix(col, rainbowEdge(an), eb);
    float w = an * 40.0 + 0.6 * sin(d * 0.8 + an * 3.0) + 1.0 * rbN(vec2(an * 4.0, d * 0.4)), fw = max(fwidth(w), 1e-4), f = abs(fract(w) - 0.5) * 2.0;
    float line = (1.0 - smoothstep(0.0, max(0.3, 1.8 * fw), f)) * smoothstep(0.45, 0.85, rbN(vec2(floor(w) * 1.3, d * 1.5))) * (1.0 - smoothstep(0.25, 0.7, fw));
    col = mix(col, vec3(0.96, 1.0, 1.0), 0.55 * line * (1.0 - 0.6 * eb));
    vec2 g = vec2(an * 6.0, d * 1.6); vec2 cell = floor(g); float hh = rbH(cell + 0.37);
    if (hh < 0.25) { vec2 q = (g - cell - 0.5) / vec2(6.0, 1.6); float tw = 0.4 + 0.6 * rbSq(0.5 + 0.5 * sin(t * 3.0 + hh * 60.0));
      float star = exp(-dot(q, q) / 0.00012) + exp(-abs(q.x) / 0.03) * exp(-q.y * q.y / 0.00003) + 0.7 * exp(-abs(q.y) / 0.03) * exp(-q.x * q.x / 0.00003); col = mix(col, vec3(1.0), clamp(star * tw, 0.0, 1.0)); }
    return clamp(col, 0.0, 1.0); }
  float zt = clamp((L.z - uRouteZ.x) / (uRouteZ.y - uRouteZ.x), 0.0, 1.0), e = 0.03 / max(1e-3, uRouteZ.y - uRouteZ.x);
  float rx = texture2D(uRouteX, vec2(zt, 0.5)).r, sl = (texture2D(uRouteX, vec2(min(1.0, zt + e), 0.5)).r - texture2D(uRouteX, vec2(max(0.0, zt - e), 0.5)).r) / 0.06;
  float lat = (L.x - rx) / sqrt(1.0 + sl * sl), d = -L.z + t * flow, hw = uRouteZ.z;
  if (gRUv.x > 1.5) { lat = gRUv.y; d = gRUv.z + t * flow; }   /* r46: a world connector strip gives the exact lateral (m) + the area's along distance */
  // the whole band pattern swings across the river in S-curves (the painting's pink ribbons sweep from side to side)
  float n = lat / hw + 0.42 * sin(d * 0.95 + 0.6) + 0.14 * sin(d * 2.2 + 2.0), an = abs(n) + 0.05 * sin(d * 2.6 + n * 2.5);   // stronger, tighter S-swing (painting)
  if (uRich > 0.5) { n += 0.07 * sin(d * 1.9 + lat * 5.0 - t * 0.7); an = abs(n) + 0.05 * sin(d * 2.6 + n * 2.5); }   /* r46: the ribbons swirl a little as they flow */
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
  // r46 Screen 06 (layout water_rainbow): the outer ribbon becomes the painting's RAINBOW band - colours measured across the approved 06 crest edge
  // (row 900: cyan 0,227,250 -> mint 119,227,175 -> yellow 249,227,141 -> salmon 250,162,152 -> magenta 255,139,255 -> hot pink 238,78,226)
  if (uRainbow > 0.5) { float k = clamp((an - 1.18) / 0.46, 0.0, 1.0) * 5.0; vec3 r0 = vec3(0.0, 227.0, 250.0) / 255.0, r1 = vec3(119.0, 227.0, 175.0) / 255.0, r2 = vec3(249.0, 227.0, 141.0) / 255.0,
      r3 = vec3(250.0, 162.0, 152.0) / 255.0, r4 = vec3(255.0, 139.0, 255.0) / 255.0, r5 = vec3(238.0, 78.0, 226.0) / 255.0;
    vec3 rb = mix(r0, r1, clamp(k, 0.0, 1.0)); rb = mix(rb, r2, clamp(k - 1.0, 0.0, 1.0)); rb = mix(rb, r3, clamp(k - 2.0, 0.0, 1.0)); rb = mix(rb, r4, clamp(k - 3.0, 0.0, 1.0)); rb = mix(rb, r5, clamp(k - 4.0, 0.0, 1.0));
    float rbw = smoothstep(1.13 - ea, 1.19 + ea, an) * (1.0 - smoothstep(1.62 - ea, 1.68 + ea, an)); col = mix(col, rb, 0.92 * rbw); }
  // r46 (user: "the water becomes too plain and streaky"; layout water_rich): the painting's DEPTH inside the bands - deep-blue troughs in the cyan,
  // thin deep-blue seams along every pink ribbon edge, a glossy white-pink silk highlight inside each pink ribbon, a pale crest along the cyan centre
  if (uRich > 0.5) { float tr = rbN(vec2(lat * 2.2 + 0.6 * sin(d * 0.8), d * 0.55));
    col = mix(col, mix(cyD * 0.86, cyM, 0.4), 0.25 * smoothstep(0.5, 0.85, tr) * (1.0 - pinkW));   /* r46b measured: strong dark troughs moved the colours away from the painting */
    float eg = min(min(abs(an - 0.5), abs(an - 0.85)), min(abs(an - 1.24), abs(an - 1.57))), ew = max(0.022, 1.2 * fwidth(an));
    col = mix(col, vec3(0.0, 0.5, 0.93), 0.3 * (1.0 - smoothstep(0.0, ew, eg)));
    float hl = min(abs(an - 0.73), abs(an - 1.46)), hb = smoothstep(0.3, 0.7, rbN(vec2(an * 9.0, d * 0.9)));
    col = mix(col, vec3(1.0, 0.86, 0.98), 0.72 * hb * (1.0 - smoothstep(0.0, max(0.02, 1.2 * fwidth(an)), hl)) * pinkW);
    float gp = max(exp(-rbSq((an - 0.68) / 0.09)), exp(-rbSq((an - 1.41) / 0.09)));   /* the painting's glowing pink ribbon cores */
    col = mix(col, vec3(1.0, 0.55, 0.93), 0.55 * gp * pinkW); col = mix(col, vec3(1.0, 0.84, 0.98), 0.3 * pow(gp, 4.0) * pinkW);
    float halo = max(exp(-rbSq((an - 0.42) / 0.07)) + exp(-rbSq((an - 0.93) / 0.07)), exp(-rbSq((an - 1.16) / 0.07)) + exp(-rbSq((an - 1.66) / 0.07)));
    col = mix(col, mix(cyB, pkB, 0.35), 0.0 * halo * (1.0 - pinkW));   /* r46b: the violet glow is not in the painting's water (measured) - off */
    float cc = abs(an - 0.12 - 0.06 * sin(d * 1.4)), cb2 = smoothstep(0.35, 0.8, rbN(vec2(3.0, d * 0.8)));
    col = mix(col, vec3(0.85, 1.0, 1.0), 0.5 * cb2 * (1.0 - smoothstep(0.0, max(0.03, 1.2 * fwidth(an)), cc)) * (1.0 - pinkW)); }
  // the painting's OWN detail inside each band (water_detail.py: seamless cyan / pink tiles cut from the flattened picture, fixed size in the
  // world -> never smeared): luminance + colour variation relative to the tile's mean, on top of the clean band colour
  if (uDetOn > 0.5) { vec2 tu = vec2(lat, d) / uDetS; vec3 dc = texture2D(uDetC, tu).rgb / max(uDetCM.rgb, vec3(0.06)), dp = texture2D(uDetP, tu * vec2(1.0, 0.85) + 0.37).rgb / max(uDetPM.rgb, vec3(0.06));
    col = mix(col, clamp(col * mix(dc, dp, pinkW), 0.0, 1.0), 0.85); }
  // brushed silk: soft fine streaks along the flow, short and irregular (not ruled lines)
  float w = lat * 34.0 + 0.6 * sin(d * 0.7 + lat * 2.4) + 1.1 * rbN(vec2(lat * 3.0, d * 0.3)), fw = max(fwidth(w), 1e-4);
  float f = abs(fract(w) - 0.5) * 2.0, line = 1.0 - smoothstep(0.0, max(0.3, 1.8 * fw), f);
  float seg = smoothstep(0.5, 0.85, rbN(vec2(floor(w) * 1.37, d * 1.7))) * (0.55 + 0.45 * rbN(vec2(floor(w) * 0.71, d * 0.5)));
  float vis = (1.0 - smoothstep(0.25, 0.7, fw)) * (uRich > 0.5 ? mix(0.3, 1.0, smoothstep(0.03, 0.14, fw)) : 1.0);   /* r46: soft, not ruled, close to the camera */
  vec3 lineCol = mix(vec3(0.92, 0.99, 1.0), vec3(1.0, 0.76, 0.96), pinkW);
  col = mix(col, lineCol, clamp(line * seg * vis, 0.0, 1.0) * mix(0.5, 0.45, pinkW));
  // the painting's silky glow: a second, finer streak layer everywhere (dense, soft, bright) + luminous band centres
  float w3 = lat * 80.0 + 0.8 * sin(d * 0.9 + lat * 3.0) + 1.4 * rbN(vec2(lat * 6.0, d * 0.5)), fw3 = max(fwidth(w3), 1e-4), f3 = abs(fract(w3) - 0.5) * 2.0;
  float l3 = (1.0 - smoothstep(0.0, max(0.35, 1.8 * fw3), f3)) * (0.35 + 0.65 * rbN(vec2(floor(w3) * 0.9, d * 2.4))) * (1.0 - smoothstep(0.3, 0.8, fw3)) * (uRich > 0.5 ? mix(0.35, 1.0, smoothstep(0.06, 0.25, fw3)) : 1.0);
  col = mix(col, mix(vec3(0.75, 0.97, 1.0), vec3(1.0, 0.7, 0.95), pinkW), 0.32 * l3);
  col = mix(col, col * 1.12 + 0.04, 0.6 * (1.0 - smoothstep(0.0, 0.3, an)) + 0.5 * smoothstep(0.6, 1.0, pc) * pinkW);   // glow in the cyan centre and along each pink ribbon
  // the painting's bright white DASHES: short, thick-ish, along the flow, many in the cyan, some on the pink
  vec2 gd = vec2(lat * 7.0, d * 1.25); vec2 cd = floor(gd); float hd = rbH(cd + 7.7);
  if (hd < 0.16) { vec2 o = (gd - cd - vec2(0.5 + 0.3 * (rbH(cd + 2.2) - 0.5), 0.5)) / vec2(7.0, 1.25); float lenD = 0.07 + 0.12 * rbH(cd + 5.5), wid = 0.003 + 0.004 * rbH(cd + 9.1);
    float dsh = exp(-rbSq(o.x / max(wid, 0.8 * fwidth(lat)))) * (1.0 - smoothstep(lenD * 0.4, lenD * 0.5, abs(o.y))) * (1.0 - smoothstep(0.3, 1.0, fwidth(gd.y)));
    col = mix(col, vec3(0.97, 1.0, 1.0), clamp(dsh, 0.0, 1.0) * mix(0.55, 0.35, pinkW)); }
  // glossy sheen
  col += 0.08 * smoothstep(0.35, 0.95, rbN(vec2(lat * 0.9, d * 0.35 - t * 0.1))) * (1.0 - 0.5 * pinkW);
  // r46: glossy ripple ARCS close to the camera (the painting's curved light bands across the flow) + a second, finer sparkle layer with long
  // horizontal flares (the painting is covered in small white sparkles) - both fade out where they would be smaller than a pixel
  if (uRich > 0.5) { float ra = d * 8.5 - an * an * 3.4 + 1.6 * rbN(vec2(lat * 1.5, d * 0.7)), rf = fwidth(ra);
    float arc = pow(0.5 + 0.5 * sin(ra), 9.0) * (1.0 - smoothstep(0.3, 1.1, rf)) * smoothstep(0.3, 0.7, rbN(vec2(floor(ra / 6.2832) * 2.1, lat * 2.0)));
    float core = pow(0.5 + 0.5 * sin(ra), 40.0) * (1.0 - smoothstep(0.2, 0.7, rf));
    col = mix(col, mix(vec3(0.6, 0.97, 1.0), vec3(1.0, 0.75, 0.97), pinkW), 0.45 * arc); col = mix(col, vec3(0.97, 1.0, 1.0), 0.6 * core * smoothstep(0.3, 0.7, rbN(vec2(floor(ra / 6.2832) * 2.1, lat * 2.0))));
    vec2 g2 = vec2(lat * 7.0, d * 3.2); vec2 c2 = floor(g2); float h2 = rbH(c2 + 4.37);
    if (h2 < 0.22) { vec2 p2c = c2 + vec2(0.2 + 0.6 * rbH(c2 + 1.1), 0.2 + 0.6 * rbH(c2 + 2.9)); vec2 q2 = (g2 - p2c) / vec2(7.0, 3.2);
      float tw2 = 0.5 + 0.5 * sin(t * 4.0 + h2 * 90.0), s2 = max(fwidth(g2.x), fwidth(g2.y)), pfx = max(fwidth(lat), 1e-5), pfy = max(fwidth(d), 1e-5);
      /* each sparkle keeps at least ~2 px core and ~6 px horizontal ray on screen (the painting's sparkles stay visible far down the river) */
      vec2 cs = vec2(max(0.006, 1.4 * pfx), max(0.006, 1.4 * pfy));
      float st2 = exp(-dot(q2 / cs, q2 / cs)) + exp(-abs(q2.x) / max(0.03, 6.0 * pfx)) * exp(-rbSq(q2.y / max(0.0028, 0.7 * pfy))) + 0.5 * exp(-abs(q2.y) / max(0.012, 3.0 * pfy)) * exp(-rbSq(q2.x / max(0.0028, 0.7 * pfx)));
      col = mix(col, vec3(1.0), clamp(st2 * (0.4 + 0.6 * tw2) * (1.0 - smoothstep(0.18, 0.45, s2)), 0.0, 1.0)); } }
  // star glints
  vec2 g = vec2(lat * 3.2, d * 1.6); vec2 cell = floor(g); float hh = rbH(cell + 0.37);
  if (hh < (uRich > 0.5 ? 0.42 : 0.3)) { vec2 pc2 = cell + vec2(0.25 + 0.5 * rbH(cell + 1.7), 0.25 + 0.5 * rbH(cell + 4.1)); vec2 q = (g - pc2) / vec2(3.2, 1.6);
    float tw = 0.5 + 0.5 * sin(t * 3.0 + hh * 60.0); tw = 0.35 + 0.65 * tw * tw; float sz = 1.0 + 0.8 * rbH(cell + 3.3), s = max(fwidth(g.x), fwidth(g.y));
    float rk = uRich > 0.5 ? 1.9 : 1.0;   /* r46: the painting's flares are long and horizontal */
    float star = exp(-dot(q, q) / (0.00016 * sz * rk)) + exp(-abs(q.x) / (0.035 * sz * rk)) * exp(-q.y * q.y / (0.00003 * rk)) + 0.7 * exp(-abs(q.y) / (0.035 * sz)) * exp(-q.x * q.x / 0.00003);
    col = mix(col, vec3(1.0), clamp(star * tw * (1.0 - smoothstep(0.05, 0.3, s)), 0.0, 1.0)); }
  return clamp(col, 0.0, 1.0); }`;

// route centre line x by z (area-local) as a float texture (nearest, 4096 samples) + the uniforms the materials need
// r46: a second (third ...) copy of the ribbon code with renamed uniforms / functions, so one material can draw two areas' ribbons (connectors)
export const ribbonCopy = (sfx) => RIBBON_GLSL.replace(/\b(uRouteX|uRouteZ|uRibbon|uRStyle|uRUv|gRUv|uDetC|uDetP|uDetCM|uDetPM|uDetS|uDetOn|uRich|uRainbow|rbSq|rbH|rbN|rainbowEdge|ribbonWater)\b/g, '$1' + sfx);
export const ribbonUniformsAs = (U, sfx) => Object.fromEntries(Object.entries(U).map(([k, v]) => [k + sfx, v]));
export function routeUniforms(THREE, LAY) {
  const P = LAY.route.points; let z0 = Infinity, z1 = -Infinity; for (const p of P) { z0 = Math.min(z0, p[2]); z1 = Math.max(z1, p[2]); }
  const N = 4096, data = new Float32Array(N); let j = P.length - 1;   // route z decreases along s: walk from the far end
  const byZ = [...P].sort((a, b) => a[2] - b[2]);
  for (let i = 0, k = 0; i < N; i++) { const z = z0 + (z1 - z0) * i / (N - 1); while (k < byZ.length - 2 && byZ[k + 1][2] < z) k++; const a = byZ[k], b = byZ[k + 1] ?? a, f = b[2] > a[2] ? (z - a[2]) / (b[2] - a[2]) : 0; data[i] = a[0] + (b[0] - a[0]) * Math.min(1, Math.max(0, f)); }
  void j;
  const tex = new THREE.DataTexture(data, N, 1, THREE.RedFormat, THREE.FloatType); tex.minFilter = tex.magFilter = THREE.NearestFilter; tex.needsUpdate = true;
  return { uRouteX: { value: tex }, uRouteZ: { value: new THREE.Vector4(z0, z1, (LAY.river_width ?? LAY.route.width) / 2, 1) },
    uRStyle: { value: LAY.water_style === 'ribbon06' ? 1 : 0 }, uRich: { value: LAY.water_rich ?? 0 }, uRainbow: { value: LAY.water_rainbow ?? 0 },   /* r46: richer painted water (layout water_rich) */
    uDetC: { value: null }, uDetP: { value: null }, uDetCM: { value: new THREE.Vector4(1, 1, 1, 1) }, uDetPM: { value: new THREE.Vector4(1, 1, 1, 1) }, uDetS: { value: 0.64 }, uDetOn: { value: 0 } };
}
// the painted detail tiles of an area (baked/detail_*.jpg + manifest.water_detail) -> the ribbon uniforms (shared by all its water materials)
export async function loadDetail(THREE, tl, base, MANI, U) {
  const D = MANI?.water_detail; if (!D || !U) return false;
  const ld = async (f) => { const t = await tl.loadAsync(base + f); t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t; };
  U.uDetC.value = await ld('detail_cyan.jpg'); U.uDetP.value = await ld('detail_pink.jpg'); U.uDetCM.value.set(...D.cyan_mean, 1); U.uDetPM.value.set(...D.pink_mean, 1); U.uDetS.value = D.tile_m; U.uDetOn.value = 1; return true;
}

// ---------------------------------------------------------------------------------------------------------------------------------------------
// r47 ONE continuous river material (tools/screenkit/water_strip.py): every water texel of an area samples the same flow-space texture at
// (lat, d) - lat = sideways distance from Benny's route, d = distance along it - with EXACTLY the bake's inverse mapping (route x by z, slope
// over +-0.03 u, arc length by z, straight extensions beyond the route's ends). The texture is the approved painting re-mapped along the river,
// continued by quilting its sharp stretch, so there is no painted patch, no switch to generated water, no seam between surfaces.
// Flow: two samples offset along d, cross-faded (anchored to the painted layout, never drifting away from it).
export const STRIP_GLSL = `
uniform sampler2D uStrip, uStripR, uStripD; uniform vec4 uStripP; uniform vec4 uStripZ; uniform vec4 uStripE;
float stripTex1(sampler2D tx, float z){ float x = clamp((z - uStripZ.x) / (uStripZ.y - uStripZ.x), 0.0, 1.0) * (uStripE.y - 1.0), i = floor(x), f = x - i;
  return mix(texture2D(tx, vec2((i + 0.5) / uStripE.y, 0.5)).r, texture2D(tx, vec2((min(i + 1.0, uStripE.y - 1.0) + 0.5) / uStripE.y, 0.5)).r, f); }
vec2 stripLD(vec3 L){ float z = L.z, rx = stripTex1(uStripR, z), sl = (stripTex1(uStripR, z + 0.03) - stripTex1(uStripR, z - 0.03)) / 0.06;
  float d = z > uStripZ.y ? -(z - uStripZ.y) : z < uStripZ.x ? uStripE.x + (uStripZ.x - z) : stripTex1(uStripD, z);
  return vec2((L.x - rx) / sqrt(1.0 + sl * sl), d); }
vec3 stripWater(vec3 L, float t){ vec2 ld = stripLD(L); float p = fract(t * 0.35), w1 = 1.0 - abs(2.0 * p - 1.0);
  float u = (ld.x + uStripP.x) / (2.0 * uStripP.x), v1 = (ld.y + (p - 0.5) * uStripP.w - uStripP.y) / uStripP.z, v2 = (ld.y + (fract(p + 0.5) - 0.5) * uStripP.w - uStripP.y) / uStripP.z;
  vec3 col = mix(texture2D(uStrip, vec2(u, v2)).rgb, texture2D(uStrip, vec2(u, v1)).rgb, w1);
  // r47b the painting's BROKEN WHITE REFLECTIONS the texture is too coarse to hold close up: thin white streaks along the flow (broken into
  // dashes, stronger on bright cyan, fading where they would be sub-pixel) + twinkling star glints that keep >= ~2 px on screen
  float lat = ld.x, d = ld.y + 0.12 * t, lum = dot(col, vec3(0.299, 0.587, 0.114)), cy = clamp((col.b - col.r) * 2.0, 0.0, 1.0);
  float wv = lat * 46.0 + 0.7 * sin(d * 0.9 + lat * 3.0), fw = max(fwidth(wv), 1e-4), fl = abs(fract(wv) - 0.5) * 2.0;
  float seg = smoothstep(0.78, 0.95, fract(sin(dot(vec2(floor(wv), floor(d * 1.6 + 0.37 * floor(wv))), vec2(12.9898, 78.233))) * 43758.5453));
  float streak = (1.0 - smoothstep(0.0, max(0.25, 1.6 * fw), fl)) * seg * (1.0 - smoothstep(0.2, 0.6, fw)) * smoothstep(0.35, 0.75, lum);
  col = mix(col, vec3(0.95, 1.0, 1.0), 0.6 * streak * (0.5 + 0.5 * cy));
  vec2 g = vec2(lat * 6.0, ld.y * 2.6); vec2 c = floor(g); float h = fract(sin(dot(c, vec2(41.3, 289.1))) * 43758.5453);
  if (h < 0.2) { vec2 pc = c + vec2(0.2 + 0.6 * fract(h * 17.0), 0.2 + 0.6 * fract(h * 31.0)); vec2 q = (g - pc) / vec2(6.0, 2.6);
    float pfx = max(fwidth(lat), 1e-5), pfy = max(fwidth(ld.y), 1e-5), tw = 0.45 + 0.55 * pow(0.5 + 0.5 * sin(t * 3.3 + h * 70.0), 2.0);
    vec2 cs = vec2(max(0.006, 1.3 * pfx), max(0.006, 1.3 * pfy));
    float st = exp(-dot(q / cs, q / cs)) + exp(-abs(q.x) / max(0.035, 6.0 * pfx)) * exp(-(q.y * q.y) / (max(0.003, 0.7 * pfy) * max(0.003, 0.7 * pfy)))
             + 0.6 * exp(-abs(q.y) / max(0.014, 3.0 * pfy)) * exp(-(q.x * q.x) / (max(0.003, 0.7 * pfx) * max(0.003, 0.7 * pfx)));
    col = mix(col, vec3(1.0), clamp(st * tw * smoothstep(0.3, 0.6, lum), 0.0, 1.0) * (1.0 - smoothstep(0.25, 0.6, max(fwidth(g.x), fwidth(g.y))))); }
  return col; }`;
export const stripCopy = (sfx) => STRIP_GLSL.replace(/\b(uStripR|uStripD|uStripP|uStripZ|uStripE|uStrip|stripTex1|stripLD|stripWater)\b/g, '$1' + sfx);   // (local names lat, d, g ... are function-scoped)
// uniforms of an area's strip: the route x by z and arc length by z (float, 4096 samples), the strip texture, its ranges
export function stripUniforms(THREE, LAY, meta, tex) {
  const P = LAY.route.points, ds = LAY.route.ds, N = 4096, zA = P[0][2], zB = P[P.length - 1][2], dEnd = (P.length - 1) * ds;
  const rx = new Float32Array(N), dz = new Float32Array(N); let k = P.length - 1;   // z ascending from zB (route end) to zA (route start)
  for (let i = 0; i < N; i++) { const z = zB + (zA - zB) * i / (N - 1); while (k > 0 && P[k - 1][2] <= z) k--; const j = Math.max(1, Math.min(P.length - 1, k)), a = P[j - 1], b = P[j];
    const f = b[2] !== a[2] ? Math.min(1, Math.max(0, (z - a[2]) / (b[2] - a[2]))) : 0; rx[i] = a[0] + (b[0] - a[0]) * f; dz[i] = ((j - 1) + f) * ds; }
  const mk = (data) => { const t = new THREE.DataTexture(data, N, 1, THREE.RedFormat, THREE.FloatType); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; };
  tex.colorSpace = THREE.NoColorSpace; tex.anisotropy = 8; tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return { uStrip: { value: tex }, uStripR: { value: mk(rx) }, uStripD: { value: mk(dz) }, uStripP: { value: new THREE.Vector4(meta.lat, meta.d0, meta.d1 - meta.d0, LAY.water_strip?.flow ?? 0.3) },
    uStripZ: { value: new THREE.Vector4(zB, zA, 0, 0) }, uStripE: { value: new THREE.Vector4(dEnd, N, 0, 0) } };
}
