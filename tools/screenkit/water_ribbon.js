// Rainbow screen kit - RIBBON WATER (round 45, URL test switch ?water=ribbon; default unchanged). The user: "my water looks messy. Just because it
// matches the same color doesn't mean it matches my water." The painted 05 water is CLEAN: long smooth S-shaped ribbons - a wide cyan channel with
// fine white streaks along the flow, a broad hot-pink ribbon on each side with fine lighter streaks like brushed silk, soft edges between the bands,
// outer cyan toward the foam, a glossy sheen and a few star glints. A stretched copy of the painting (the swatches) smears and repeats; this draws
// that STRUCTURE live, resolution-free, so it is just as clean 10 cm in front of the camera as far away.
// Measured on references/05_flow_into_the_current.png (rows 560-1150): cyan dark / mid / bright (4,139,234) (10,168,250) (42,220,249), pink
// (204,32,159) (244,60,215) (248,110,236), white streaks (247,243,252); band layout from the painted river (pink edge to pink edge = river width).
// Coordinates: the area's own x / z (vL), lateral = distance from the river centre line (Benny's route, a 1-D texture of route x by z), along = -z.
export const RIBBON_GLSL = `
uniform sampler2D uRouteX; uniform vec4 uRouteZ; uniform float uRibbon;
float rbH(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float rbN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(rbH(i), rbH(i + vec2(1, 0)), f.x), mix(rbH(i + vec2(0, 1)), rbH(i + vec2(1, 1)), f.x), f.y); }
vec3 ribbonWater(vec3 L, float t, float flow, vec3 vWv){
  float zt = clamp((L.z - uRouteZ.x) / (uRouteZ.y - uRouteZ.x), 0.0, 1.0), e = 0.03 / max(1e-3, uRouteZ.y - uRouteZ.x);
  float rx = texture2D(uRouteX, vec2(zt, 0.5)).r, sl = (texture2D(uRouteX, vec2(min(1.0, zt + e), 0.5)).r - texture2D(uRouteX, vec2(max(0.0, zt - e), 0.5)).r) / 0.06;
  float lat = (L.x - rx) / sqrt(1.0 + sl * sl), d = -L.z + t * flow, hw = uRouteZ.z;
  float n = lat / hw, an = abs(n) + 0.06 * sin(d * 0.85 + sign(n) * 1.7) + 0.035 * sin(d * 2.1 + n * 2.5);   // the bands breathe a little along the flow
  vec3 cyD = vec3(4.0, 139.0, 234.0) / 255.0, cyM = vec3(10.0, 168.0, 250.0) / 255.0, cyB = vec3(42.0, 220.0, 249.0) / 255.0;
  vec3 pkD = vec3(204.0, 32.0, 159.0) / 255.0, pkM = vec3(244.0, 60.0, 215.0) / 255.0, pkB = vec3(248.0, 110.0, 236.0) / 255.0;
  float ea = max(0.035, 1.5 * fwidth(an));                                     // soft but clean band edges, never aliased
  float pinkW = smoothstep(0.52 - ea, 0.62 + ea, an) * (1.0 - smoothstep(0.98 - ea, 1.1 + ea, an));
  // cyan channel: bright in the middle, deeper toward the pink; outer cyan (beyond the pink) a little deeper still
  vec3 cyan = mix(cyM, cyB, 0.75 * (1.0 - smoothstep(0.0, 0.5, an)));
  cyan = mix(cyan, mix(cyD, cyM, 0.55), smoothstep(1.1, 1.6, an));
  // pink ribbon: hot pink centre, magenta edges, a brighter sheen line along its middle
  float pc = 1.0 - clamp(abs(an - 0.8) / 0.2, 0.0, 1.0);
  vec3 pink = mix(pkD, pkM, smoothstep(0.0, 0.7, pc)); pink = mix(pink, pkB, 0.55 * smoothstep(0.55, 1.0, pc));
  vec3 col = mix(cyan, pink, pinkW);
  // fine silk streaks ALONG the flow (parallel lines that follow the S, broken into long segments that drift with the current)
  float w = lat * 30.0 + 0.5 * sin(d * 0.6 + lat * 2.2) + 0.9 * rbN(vec2(lat * 2.5, d * 0.22)), fw = max(fwidth(w), 1e-4);
  float f = abs(fract(w) - 0.5) * 2.0, line = 1.0 - smoothstep(0.0, max(0.18, 1.8 * fw), f);
  float seg = smoothstep(0.42, 0.8, rbN(vec2(floor(w) * 1.37, d * 0.75))), vis = 1.0 - smoothstep(0.25, 0.7, fw);
  vec3 lineCol = mix(vec3(0.94, 0.99, 1.0), vec3(1.0, 0.78, 0.97), pinkW);
  col = mix(col, lineCol, clamp(line * seg * vis, 0.0, 1.0) * mix(0.55, 0.42, pinkW));
  // a few longer, brighter white streaks in the cyan (the painting's bright flow lines)
  float w2 = lat * 7.0 + 0.4 * sin(d * 0.5 + lat), f2 = abs(fract(w2) - 0.5) * 2.0, fw2 = max(fwidth(w2), 1e-4);
  float l2 = (1.0 - smoothstep(0.0, max(0.07, 1.8 * fw2), f2)) * smoothstep(0.6, 0.9, rbN(vec2(floor(w2) * 2.1, d * 0.45))) * (1.0 - pinkW) * (1.0 - smoothstep(0.2, 0.6, fw2));
  col = mix(col, vec3(0.97, 1.0, 1.0), 0.8 * l2);
  // glossy sheen: a broad soft brightening that drifts slowly (the polished look of the painted water)
  col += 0.07 * smoothstep(0.35, 0.95, rbN(vec2(lat * 0.9, d * 0.35 - t * 0.1))) * (1.0 - 0.5 * pinkW);
  // star glints: sparse 4-point sparkles that twinkle and ride the current
  vec2 g = vec2(lat * 3.2, d * 1.6); vec2 cell = floor(g); float hh = rbH(cell + 0.37);
  if (hh < 0.18) { vec2 pc2 = cell + vec2(0.25 + 0.5 * rbH(cell + 1.7), 0.25 + 0.5 * rbH(cell + 4.1)); vec2 q = (g - pc2) / vec2(3.2, 1.6);
    float tw = 0.5 + 0.5 * sin(t * 3.0 + hh * 60.0); tw *= tw; float s = max(fwidth(g.x), fwidth(g.y));
    float star = exp(-dot(q, q) / 0.00012) + exp(-abs(q.x) / 0.03) * exp(-q.y * q.y / 0.00003) + 0.7 * exp(-abs(q.y) / 0.03) * exp(-q.x * q.x / 0.00003);
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
  return { uRouteX: { value: tex }, uRouteZ: { value: new THREE.Vector4(z0, z1, (LAY.river_width ?? LAY.route.width) / 2, 1) } };
}
