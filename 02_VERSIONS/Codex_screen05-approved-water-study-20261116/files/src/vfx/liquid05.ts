/**
 * Opt-in Screen 05 liquid study. Shared by the traversable ribbon and the distant river.
 * All features are evaluated in river coordinates and animated in the game's clock. No images,
 * render targets, per-frame allocations, or fine noise layers are added.
 */
export const LIQUID05_GLSL = /* glsl */ `
float liquid05Hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Finite reflections, smoothly tapered at both ends. River anchoring preserves motion;
// screen-footprint caps keep foreground perspective from stretching them into solid stripes.
vec2 liquid05Lens(vec2 p, float seed) {
  vec2 g = p * vec2(1.4, 0.32) + vec2(seed, seed * 0.37);
  vec2 footprint = max(fwidth(g), vec2(0.0001));
  vec2 cell = floor(g);
  float h = liquid05Hash(cell + seed);
  vec2 q = fract(g) - vec2(0.32 + h * 0.36, 0.5);
  float lengthY = min(0.38, footprint.y * (22.0 + h * 22.0));
  float along = q.y / max(lengthY, 0.0001);
  float end = max(0.0, 1.0 - along * along);
  float taper = end * end;
  // A gentle curved spine reads as a reflection on a swell instead of a straight dash.
  float d = abs(q.x + footprint.x * 1.4 * sin(along * 2.4 + h * 6.283));
  float width = min(0.075 + 0.045 * h, footprint.x * (2.0 + 2.0 * h)) * taper;
  float core = 1.0 - smoothstep(max(0.0, width * 0.3 - footprint.x * 0.5), width + footprint.x, d);
  float haloWidth = max(footprint.x * 2.0, width * 3.2);
  float halo = exp(-d * d / (haloWidth * haloWidth)) * taper;
  float select = smoothstep(0.6, 0.76, h);
  float detail = 1.0 - smoothstep(0.12, 0.3, max(footprint.x, footprint.y));
  return vec2(core * taper, halo) * select * detail;
}

// x = across-flow position, s = continuous longitudinal distance. Three broad harmonics
// travel at slightly different speeds; no noise octaves or cellular grain in the liquid body.
// Returns height, saturated reflection sheet, selected white reflection, and lateral slope.
vec4 liquid05Field(float x, float s, float time, float speed) {
  float v = s - time * speed;
  float a = x * 2.5 + 0.8 * sin(v * 0.11);
  float b = x * 7.4 + 0.55 * sin(v * 0.23) - (s - time * speed * 0.83) * 0.11 + 1.8;
  float c = x * 15.7 + 0.45 * sin(x * 1.6 + v * 0.12) - (s - time * speed * 1.12) * 0.27;
  float fine = 1.0 - smoothstep(0.6, 1.6, fwidth(c));
  float h = clamp(0.48 + 0.18 * sin(a) + 0.14 * sin(b) + 0.07 * sin(c) * fine, 0.0, 1.0);
  float sheet = pow(max(0.0, sin(b + 0.55)), 5.0) * 0.65
              + pow(max(0.0, sin(c + 0.4)), 9.0) * fine * 0.23;
  vec2 glint = max(liquid05Lens(vec2(x, v), 0.0),
                  liquid05Lens(vec2(x + 0.37, v * 0.86 + 5.4), 7.13) * 0.65);
  float slope = 0.18 * 2.5 * cos(a) + 0.14 * 7.4 * cos(b) + 0.07 * 15.7 * cos(c) * fine;
  return vec4(h, max(sheet, glint.y * 0.8), glint.x, slope);
}

// Signed nearest-band coordinate: + is toward the cyan core, - toward the bank.
// Rich body colours carry most of the surface; only the selected reflection peaks burn white.
vec3 liquid05Color(float band, vec4 field) {
  vec3 deep = vec3(0.012, 0.16, 0.5);
  vec3 cyan = mix(deep, vec3(0.025, 0.5, 1.0), smoothstep(0.08, 0.87, field.x));
  cyan = mix(cyan, vec3(0.035, 0.86, 1.1), field.y * 0.88);
  vec3 pink = mix(vec3(0.36, 0.025, 0.3), vec3(0.86, 0.095, 0.7), smoothstep(0.08, 0.9, field.x));
  pink = mix(pink, vec3(1.12, 0.32, 0.98), field.y * 0.8);
  pink *= 1.0 - 0.12 * smoothstep(0.15, 0.95, -band);
  float ab = abs(band);
  vec3 violet = vec3(0.23, 0.075, 0.57);
  vec3 col = mix(pink, violet, smoothstep(0.8, 1.04, ab));
  col = mix(col, cyan, smoothstep(1.01, 1.3, ab));
  float pinkWeight = 1.0 - smoothstep(0.85, 1.25, ab);
  vec3 white = mix(vec3(1.85, 2.15, 2.2), vec3(2.2, 1.85, 2.15), pinkWeight);
  return col + white * field.z * 1.7;
}
`;
