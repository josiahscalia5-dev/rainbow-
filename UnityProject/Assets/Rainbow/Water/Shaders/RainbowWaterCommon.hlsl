// Rainbow Screen 05 - shared water/VFX helpers (Agent 3).
// Port of src/vfx/glsl.ts (NOISE_GLSL + FRAG_FX_GLSL) and the 05 helpers of src/vfx/waterRibbon.ts.
// Everything is prefixed RBW_ so it never collides with other areas' includes.
// Needs _ScreenParams (URP Core.hlsl / Shader Graph both define it).
#ifndef RAINBOW_WATER_COMMON_INCLUDED
#define RAINBOW_WATER_COMMON_INCLUDED

// smoothstep that also accepts a > b (GLSL/HLSL smoothstep is undefined for reversed edges on some mobile GPUs)
float RBW_SS(float a, float b, float x)
{
    float t = saturate((x - a) / (b - a));
    return t * t * (3.0 - 2.0 * t);
}

float RBW_Hash12(float2 p)
{
    float3 p3 = frac(float3(p.x, p.y, p.x) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return frac((p3.x + p3.y) * p3.z);
}

float RBW_VNoise(float2 p)
{
    float2 i = floor(p);
    float2 f = frac(p);
    float2 u = f * f * (3.0 - 2.0 * f);
    return lerp(lerp(RBW_Hash12(i), RBW_Hash12(i + float2(1.0, 0.0)), u.x),
                lerp(RBW_Hash12(i + float2(0.0, 1.0)), RBW_Hash12(i + float2(1.0, 1.0)), u.x), u.y);
}

// scene-linear radiance that the scene grade (exposure -0.2337, contrast 20.35 in LogC, saturation 41.84, no tone mapping) shows as this
// display sRGB colour (0-255): palettes written as measured picture colours (round 8; same as WaterTextureFactory.SceneFromDisplay)
float3 RBW_Disp(float3 srgb255)
{
    float3 y = pow(saturate(srgb255 / 255.0), 2.2);
    float l = dot(y, float3(0.2126729, 0.7151522, 0.0721750));
    float3 x = max(l + (y - l) / 1.4184, 0.0);
    x = (pow(5.555556 * x + 0.047996, 0.830910) * 1.04491 - 0.047996) / 5.555556;
    return max(x, 0.0) / 0.85045;
}

// the scene vignette (intensity 0.19, smoothness 0.4) at a pixel: surfaces whose colours were measured on the picture divide by it
float RBW_VignetteAt(float2 positionCSxy)
{
    float2 vd = abs(positionCSxy / _ScaledScreenParams.xy - 0.5) * 0.57;
    float vf = saturate(1.0 - dot(vd, vd));
    return max(vf * vf, 0.6);
}

// cheap cellular "soap foam" pattern: 0 at cell centres -> ~1 at borders
float RBW_Cells(float2 p)
{
    float2 i = floor(p);
    float2 f = frac(p);
    float md = 8.0;
    [unroll] for (int yy = -1; yy <= 1; yy++)
    {
        [unroll] for (int xx = -1; xx <= 1; xx++)
        {
            float2 g = float2((float)xx, (float)yy);
            float2 o = float2(RBW_Hash12(i + g), RBW_Hash12(i + g + 19.7));
            float2 r = g + o - f;
            md = min(md, dot(r, r));
        }
    }
    return sqrt(md);
}

float3 RBW_Iridescent(float t)
{
    return 0.5 + 0.5 * cos(6.28318 * (t + float3(0.0, 0.33, 0.67)));
}

// polynomial smooth minimum (k = blend width)
float RBW_SMin(float a, float b, float k)
{
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
}

// The Three.js effects were tuned in pixels of the approved 864x1536 frame: 1 "reference px" = screen height / 1536
float RBW_PxScale()
{
    return max(_ScreenParams.y, 1.0) / 1536.0;
}

// rotate a direction about +Y (degrees)
float3 RBW_RotateY(float3 v, float deg)
{
    float a = radians(deg);
    float c = cos(a), s = sin(a);
    return float3(c * v.x + s * v.z, v.y, -s * v.x + c * v.z);
}

// equirect (lat-long) lookup: image centre (u = 0.5) = downstream +Z, top = up
float2 RBW_PanoUV(float3 dir)
{
    float3 d = normalize(dir);
    return float2(atan2(d.x, d.z) * 0.15915494 + 0.5, asin(clamp(d.y, -1.0, 1.0)) * 0.31830989 + 0.5);
}

// "bump mapping without tangents" from a scalar height field (glsl.ts bumpNormal)
float3 RBW_BumpNormal(float3 pos, float3 n, float h)
{
    float3 dpx = ddx(pos);
    float3 dpy = ddy(pos);
    float dhx = ddx(h);
    float dhy = ddy(h);
    float3 r1 = cross(dpy, n);
    float3 r2 = cross(n, dpx);
    float det = dot(dpx, r1);
    float3 grad = (det >= 0.0 ? 1.0 : -1.0) * (dhx * r1 + dhy * r2);
    return normalize(abs(det) * n - grad);
}

// 4-point flare on a FLOW-aligned, world-anchored cell grid g = (across, along). Sizes in reference px.
// (glsl.ts flowGlint) Derivatives are taken before any early-out. thick scales the arm thickness / core size (1 = glsl.ts).
float RBW_FlowGlintW(float2 g, float density, float L, float stretch, float horiz, float time, float pxK, float thick)
{
    float2 gx = ddx(g) * pxK;
    float2 gy = ddy(g) * pxK;
    float2 gi = floor(g);
    float hs = RBW_Hash12(gi + 7.31);
    float det = gx.x * gy.y - gy.x * gx.y;
    if (hs < 1.0 - density || abs(det) < 1e-12) return 0.0;
    float2 dg = frac(g) - (float2(RBW_Hash12(gi + 3.1), RBW_Hash12(gi + 5.7)) * 0.2 + 0.4);
    float2 p = float2(gy.y * dg.x - gy.x * dg.y, gx.x * dg.y - gx.y * dg.x) / det;   // reference px
    float2 f = float2(-gy.x, gx.x);
    f *= sign(f.x + 1e-6) / max(length(f), 1e-9);
    float2 a = normalize(lerp(f, float2(1.0, 0.0), horiz) + float2(1e-5, 0.0));
    float2 b = float2(-a.y, a.x);
    float pa = dot(p, a), pb = dot(p, b);
    float2 ca = a.x * gx + a.y * gy;
    float2 cb = b.x * gx + b.y * gy;
    float la = 0.38 / max(max(abs(ca.x), abs(ca.y)), 1e-6);
    float lb = 0.38 / max(max(abs(cb.x), abs(cb.y)), 1e-6);
    float l = L * (0.55 + 0.9 * frac(hs * 37.0));
    float it = 1.0 / max(thick, 0.25);
    float tA = max(0.0, 1.0 - abs(pa) / min(l * stretch, la));
    float armA = exp(-abs(pb) * 0.85 * it) * tA;
    float armB = exp(-abs(pa) * 0.85 * it) * max(0.0, 1.0 - abs(pb) / min(l, lb));
    float core = exp(-dot(p, p) * 0.22 * it * it) * 1.4;
    float glowA = exp(-abs(pb) * 0.2 * it) * tA * tA * 0.3;
    float tw = 0.55 + 0.45 * pow(0.5 + 0.5 * sin(time * 5.0 + hs * 60.0), 2.0);
    return ((armA * armA + armB * armB) * 1.6 + core + glowA) * tw;
}

float RBW_FlowGlint(float2 g, float density, float L, float stretch, float horiz, float time, float pxK)
{
    return RBW_FlowGlintW(g, density, L, stretch, horiz, time, pxK, 1.0);
}

// jagged white "lightning" flare lying along screen-horizontal (waterRibbon.ts bolt05). returns x = core, y = halo
float2 RBW_Bolt(float2 g, float density, float Lpx, float Tpx, float seed, float pxK)
{
    float2 gx = ddx(g) * pxK;
    float2 gy = ddy(g) * pxK;
    float2 gi = floor(g);
    float hs = RBW_Hash12(gi + seed);
    float det = gx.x * gy.y - gy.x * gx.y;
    if (hs < 1.0 - density || abs(det) < 1e-12) return float2(0.0, 0.0);
    float2 dg = frac(g) - (float2(RBW_Hash12(gi + seed + 2.3), RBW_Hash12(gi + seed + 6.9)) * 0.3 + 0.35);
    float2 p = float2(gy.y * dg.x - gy.x * dg.y, gx.x * dg.y - gx.y * dg.x) / det;
    float limx = 0.3 / max(abs(gx.x) + abs(gx.y), 1e-6);
    float limy = 0.3 / max(abs(gy.x) + abs(gy.y), 1e-6);
    float L = min(Lpx * (0.6 + 0.8 * frac(hs * 37.0)), limx);
    float T = min(Tpx * (0.7 + 0.6 * frac(hs * 53.0)), limy * 0.35);
    float ax = abs(p.x / L);
    if (ax > 1.0 && abs(p.y) > limy) return float2(0.0, 0.0);
    float k = 2.0 + 1.5 * frac(hs * 71.0);
    float zz = (abs(frac(p.x / L * k + hs * 3.0) - 0.5) * 2.0 - 0.5) * T * 1.3 * max(0.0, 1.0 - ax);
    float y = p.y - zz;
    float th = T * pow(max(0.0, 1.0 - ax * ax), 1.3);
    float core = (1.0 - smoothstep(th * 0.45, th + 0.8, abs(y))) * step(ax, 1.0);
    float spike = exp(-abs(p.x) * 0.9) * max(0.0, 1.0 - abs(p.y) / min(L * 0.3, limy));
    float halo = exp(-length(float2(p.x / (L * 0.75), y / (T * 2.5 + 5.0))) * 2.0) * max(0.0, 1.0 - abs(p.y) / limy);
    return float2(max(core, spike * 0.7), halo);
}

// long streak along the current (waterRibbon.ts silk05Streak): x = ~2 px core, y = ~8 px glow (reference px)
float2 RBW_SilkStreak(float X, float v, float k, float seed, float dens, float pxK)
{
    float g = X * k + seed;
    float fw = max(fwidth(g) * pxK, 1e-4);
    float i = floor(g);
    float h = RBW_Hash12(float2(i, seed + 1.7));
    float dpx = abs(frac(g) - (0.3 + 0.4 * h)) / fw;
    float seg = RBW_VNoise(float2(i * 1.7 + seed, v * (0.05 + 0.04 * h) + h * 9.0));
    float on = smoothstep(1.0 - dens, 1.0 - dens + 0.22, seg);
    return float2(1.0 - smoothstep(0.6, 2.0, dpx), 1.0 - smoothstep(1.5, 8.0, dpx)) * on;
}

// fine silky satin streak along the current (approved 05: dense, soft, low-contrast motion-blur streaks inside the cyan
// and pink, never crisp outlines): one soft line per lane (>= ~2 reference px half width), random lane offset / strength,
// broken into segments along v; fades out where the lanes come closer than ~4 reference px (no far-field shimmer).
// X = across-flow coordinate (caller may warp it so the lanes are not locked to the band edges), k = lanes per X unit.
// nearK (0..1): how much the streaks fade where the lanes are far apart on screen (> ~12 px), so close to the camera
// they never turn into dense crisp parallel hairlines.
float RBW_Satin(float X, float v, float k, float seed, float pxK, float nearK)
{
    float g = X * k + seed;
    float fw = max(fwidth(g) * pxK, 1e-4);           // lanes per reference px
    float i = floor(g);
    float h = RBW_Hash12(float2(i, seed + 3.3));
    float d = abs(frac(g) - (0.25 + 0.5 * h));       // lane units from this lane's line
    float w = max(0.2, fw * 2.2);
    float prof = saturate(1.0 - d / w);
    prof *= prof;
    float seg = RBW_VNoise(float2(i * 2.1 + seed, v * (0.1 + 0.12 * h) + h * 7.0));
    float on = smoothstep(0.35, 0.75, seg);
    float bp = lerp(1.0, 0.2 + 0.8 * smoothstep(0.05, 0.12, fw), nearK);
    return prof * on * (0.45 + 0.55 * frac(h * 13.0)) * (1.0 - smoothstep(0.18, 0.3, fw)) * bp;
}

// flow-aligned brushed satin (waterRibbon.ts brush05): x = coarse lane, y = brushed value, z = streak cores, w = glow lanes
// fwX / fwV = cells-per-reference-px derivatives taken by the caller.
float4 RBW_Brush(float X, float v, float fwX, float fwV, float drift)
{
    float lane = RBW_VNoise(float2(X * 1.1 + 2.3, v * 0.03 + 3.0)) - 0.5;
    float b = 0.0, wsum = 0.0, core = 0.0, glow = 0.0;
    float kx = 4.0, kv = 0.05, wt = 1.0;
    [unroll] for (int i = 0; i < 3; i++)
    {
        float fi = (float)i;
        float cpx = max(fwX * kx, fwV * kv * 2.0);
        float a = 1.0 - smoothstep(0.12, 0.28, cpx);
        float n = RBW_VNoise(float2(X * kx + fi * 7.13, (v - drift * fi) * kv + fi * 3.71));
        b += (n - 0.5) * a * wt;
        wsum += wt;
        if (i == 0) glow = smoothstep(0.6, 0.88, n) * a;
        else core = max(core, smoothstep(0.7, 0.88, n) * a);
        kx *= 2.2; kv *= 1.7; wt *= 0.8;
    }
    return float4(lane, saturate(0.5 + b / wsum * 1.9), core, glow);
}

// Procedural stand-in for flow05.ts rippleData05: a periodic sum of broad integer-frequency swells stretched along the
// flow (tile = 3.3 u across x 90 u along, as W12 silk05). p = (X * 0.3, v * 0.011) in tile units.
// returns x = height 0..1, yz = normal slope (across, along) like the ripple map's RG channels.
// one swell: w = (kx across, ky along, amplitude 1/|k|^1.3, phase)
void RBW_RippleWave(float4 w, float2 p, inout float h, inout float gx, inout float gy, inout float asum)
{
    const float TAU = 6.2831853;
    float th = TAU * (w.x * p.x + w.y * p.y) + w.w;
    float c = 0.5 + 0.5 * cos(th);
    float sn = sin(th);
    h += w.z * c * c;                         // narrow-ish crests, broad troughs
    float dc = -w.z * c * sn * TAU;           // d(c^2)/d(theta) * TAU
    gx += dc * w.x;
    gy += dc * w.y;
    asum += w.z;
}

float3 RBW_Ripple(float2 p)
{
    float h = 0.0, gx = 0.0, gy = 0.0, asum = 0.0;
    RBW_RippleWave(float4(3.0, 1.0, 0.2232, 0.4), p, h, gx, gy, asum);
    RBW_RippleWave(float4(-5.0, 2.0, 0.1065, 2.1), p, h, gx, gy, asum);
    RBW_RippleWave(float4(7.0, -1.0, 0.0786, 4.0), p, h, gx, gy, asum);
    RBW_RippleWave(float4(2.0, -3.0, 0.1888, 5.3), p, h, gx, gy, asum);
    RBW_RippleWave(float4(-4.0, -1.0, 0.1569, 1.2), p, h, gx, gy, asum);
    RBW_RippleWave(float4(6.0, 3.0, 0.0861, 3.3), p, h, gx, gy, asum);
    float hn = saturate((h / asum - 0.12) / 0.6);
    float2 n = -float2(gx, gy) / (asum * 0.6) * 0.07;
    float il = rsqrt(dot(n, n) + 1.0);
    return float3(hn, n * il);
}

#endif // RAINBOW_WATER_COMMON_INCLUDED
