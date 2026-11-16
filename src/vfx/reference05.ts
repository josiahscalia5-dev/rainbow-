/**
 * Approved-water study. Procedural surface coordinates on the playable spline, never a
 * projected reference image. Palette follows the approved cyan / magenta illustration.
 * The reference phase is t=12; positive phase advection moves highlights toward decreasing s
 * (toward the ride camera). The band silhouettes stay anchored to the real river.
 */
export const REFERENCE05_GLSL = /* glsl */ `
float ref05Hash(vec2 p) {
  vec3 a = fract(vec3(p.xyx) * 0.1031);
  a += dot(a, a.yzx + 33.33);
  return fract((a.x + a.y) * a.z);
}

// A finite curved reflection, with tapered tips and a soft cyan/pink shoulder.
// Random positions vary the spacing; derivatives integrate small distant highlights.
vec2 ref05Glints(vec2 p, float seed) {
  vec2 g = p * vec2(1.35, 0.17) + vec2(seed, seed * 0.43);
  vec2 fw = max(fwidth(g), vec2(0.00001));
  vec2 gx = dFdx(g), gy = dFdy(g);
  vec2 cell = floor(g);
  float h = ref05Hash(cell + seed);
  vec2 centre = vec2(0.26 + 0.48 * h, 0.32 + 0.36 * ref05Hash(cell + seed + 9.1));
  vec2 q = fract(g) - centre;
  float determinant = gx.x * gy.y - gy.x * gx.y;
  float safeDet = (determinant < 0.0 ? -1.0 : 1.0) * max(abs(determinant), 0.0000000001);
  vec2 px = vec2(gy.y * q.x - gy.x * q.y, gx.x * q.y - gx.y * q.x) / safeDet;
  vec2 alongFlow = normalize(vec2(-gy.x, gx.x) + vec2(0.000001, 0.0));
  vec2 acrossFlow = vec2(-alongFlow.y, alongFlow.x);
  vec2 cellRate = alongFlow.x * gx + alongFlow.y * gy;
  float lengthPx = min(22.0 + 36.0 * h, 0.26 / max(max(abs(cellRate.x), abs(cellRate.y)), 0.00001));
  float t = dot(px, alongFlow) / max(lengthPx, 0.01);
  float taper = max(0.0, 1.0 - t * t);
  // Screen Jacobian follows each S-bend. A broad centre splits into two curved tapered tips,
  // rather than turning into an evenly spaced row of luminous wires.
  float spine = dot(px, acrossFlow) + 5.0 * t * taper;
  float width = (2.1 + 2.1 * h) * taper * taper;
  float core = 1.0 - smoothstep(max(0.0, width - 0.65), width + 0.9, abs(spine));
  float shoulder = exp(-abs(spine) / (width * 2.5 + 1.0)) * taper;
  float visible = (1.0 - smoothstep(0.15, 0.35, max(fw.x, fw.y))) * smoothstep(0.38, 0.58, h);
  return vec2(core * taper, shoulder * 0.5) * visible;
}

vec3 reference05Color(float x, float s, float time, float speed, float band,
                     float wakeNear, float dl, float back) {
  float v = s + (time - 12.0) * speed * 0.48;
  // Broad smooth sheets, with progressively weaker fine reflections. No comb/grid grain.
  float warp = 0.72 * sin(v * 0.12 + x * 0.7) + 0.27 * sin(v * 0.29 - x * 1.4);
  float p = x * 3.6 + 0.42 * sin(v * 0.13 + x * 0.8);
  float a = p + 0.15 * sin(v * 0.29);
  float b = x * 9.1 + 1.8 * warp + v * 0.055;
  float c = x * 19.3 + 3.7 * warp + 0.65 * sin(v * 0.21 + x) - v * 0.09;
  float fine = 1.0 - smoothstep(0.35, 1.2, fwidth(c));
  float body = clamp(0.55 + 0.16 * sin(a) + 0.12 * sin(b) + 0.04 * sin(c) * fine, 0.0, 1.0);
  float sheen = pow(max(0.0, sin(b + 0.5)), 7.0) * 0.65
              + pow(max(0.0, sin(c + 0.4)), 12.0) * 0.22 * fine;
  vec2 highlights = ref05Glints(vec2(x, v), 0.0);
  highlights = max(highlights, ref05Glints(vec2(x + 0.32, v * 0.91 + 3.7), 11.7) * 0.6);

  // The reference's foreground contains broken bowed reflections, not a row of bars.
  // Keep the longitudinal sheen between them. Asymmetric crests have different spacing,
  // strength and lateral positions and move at a gentle rider-relative rate.
  float arc = -back * 15.0 + 0.8 * sin(back * 4.3) + 7.0 * dl * dl / (1.0 + back * 0.35)
              + 0.6 * dl * sin(back * 2.1) + (time - 12.0) * 1.6;
  float crest = 0.5 + 0.5 * sin(arc);
  float nearBody = 0.45 + 0.23 * sin(arc - 0.6) + 0.09 * sin(x * 4.6 + back);
  body = mix(body, nearBody, wakeNear * 0.8);
  sheen = mix(sheen, pow(crest, 8.0) * 0.64 + sheen * 0.32, wakeNear * 0.78);
  float cycle = (arc - 1.5707963) * 0.15915494;
  float id = floor(cycle + 0.5);
  float seed = ref05Hash(vec2(id, 7.13));
  float centre = (seed - 0.5) * 3.4;
  float lengthX = min(0.25 + 0.45 * ref05Hash(vec2(id, 21.4)), max(fwidth(dl), 0.0001) * (35.0 + seed * 25.0));
  float along = (dl - centre) / lengthX;
  float taper = max(0.0, 1.0 - along * along);
  float dpx = abs(fract(cycle + 0.5) - 0.5) / max(fwidth(cycle), 0.0001);
  float whiteArc = (1.0 - smoothstep(0.5 + taper * 2.2, 1.5 + taper * 2.2, dpx)) * taper;
  whiteArc *= smoothstep(0.1, 0.3, seed);
  float secondAlong = (dl + centre + 0.7) / (lengthX * 0.72);
  float secondTaper = max(0.0, 1.0 - secondAlong * secondAlong);
  whiteArc = max(whiteArc, (1.0 - smoothstep(0.5 + secondTaper * 1.8, 1.5 + secondTaper * 1.8, dpx))
    * secondTaper * smoothstep(0.4, 0.7, seed));
  highlights.x = mix(highlights.x, max(highlights.x * 0.12, whiteArc), wakeNear);

  // Inverse-post-chain samples: deep electric blue, saturated cyan, fuchsia and violet.
  vec3 cyan = mix(vec3(0.038, 0.16, 0.46), vec3(0.066, 0.47, 0.80), smoothstep(0.16, 0.78, body));
  cyan = mix(cyan, vec3(0.11, 0.84, 0.96), clamp(sheen * 0.88 + highlights.y * 0.2, 0.0, 1.0));
  float satinDistance = (band - 0.25) * 1.6;
  float satin = exp(-satinDistance * satinDistance);
  vec3 pink = mix(vec3(0.42, 0.045, 0.39), vec3(0.76, 0.115, 0.68),
                  clamp(body * 0.75 + satin * 0.35, 0.0, 1.0));
  pink = mix(pink, vec3(0.97, 0.31, 0.89), clamp(sheen * 0.9 + highlights.y * 0.4, 0.0, 1.0));
  float edge = abs(band);
  vec3 violet = mix(vec3(0.20, 0.15, 0.56), vec3(0.32, 0.22, 0.72), body);
  vec3 col = mix(pink, violet, smoothstep(0.70, 1.05, edge));
  col = mix(col, cyan, smoothstep(0.96, 1.38, edge));
  float pinkWeight = 1.0 - smoothstep(0.8, 1.2, edge);
  vec3 white = mix(vec3(1.7, 2.2, 2.3), vec3(2.2, 1.65, 2.15), pinkWeight);
  return col + white * highlights.x * 1.6;
}
`;
