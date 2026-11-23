// Rainbow Screen 05 - river surface shading (Agent 3). Shader Graph Custom Function file:
//   RainbowRiver_float / RainbowRiver_half            -> body colour, reflection direction / tint / weight
//   RainbowRiverReflect_float / RainbowRiverReflect_half -> adds the mirrored tunnel highlights (env sample)
//   RainbowRiverWave_float / RainbowRiverWave_half    -> vertex swell height (world y offset)
// Port of src/vfx/waterRibbon.ts, Screen 05 path W10 (?water05) + W12 silk05 + W11 foam shelf (puff05):
// electric-cyan core between two hot-pink satin S-bands that follow the course meander (+ the band S `sbend05`),
// hue ramp pink -> violet -> periwinkle -> cyan across each band edge, flow-aligned brushed satin, long silk streaks,
// swell highlights, glossy glints toward the bright tunnel end, flares carried by the current, near-field swells and
// lightning flares behind Benny, diagonal pink wake sweeps, and Benny's white waterline wake (collar + spray fans).
// Everything is procedural in world (x, s): one continuous material along the whole course, no textures, no seams.
//
// Inputs (all world space; the river mesh sits at the identity transform):
//   Stream  x = stream centre x (RiverPath.Meander(s)), y = stream half width (6 - sqrt(d^2 + 0.09)),
//           z = extra core shift (W10 exit-bend hold), w = unused         [mesh UV1, see RiverMeshGenerator.cs]
//   Benny   x = Benny s (world z), y = Benny world x, z = wake strength 0..1 (0 = no Benny / airborne), w = waterline radius
//   Splash  x = world x, y = world z, z = age (s), w = strength           [global _RainbowSplash, set by SplashWake]
//   Params  x = Three.js master-s offset, y = core swing, z = flow speed (u/s), w = time (s)
#ifndef RAINBOW_RIVER_INCLUDED
#define RAINBOW_RIVER_INCLUDED

#include "Assets/Rainbow/Water/Shaders/RainbowWaterCommon.hlsl"

// ---- W10/W12 palette (shader-linear values solved through exposure 0.86 -> Neutral -> sRGB -> grade sat 1.36 / con 1.15)
static const float3 RBW_CDEEP   = float3(0.058, 0.197, 0.379);   // #0068AD
static const float3 RBW_CDEEP2  = float3(0.062, 0.290, 0.572);   // #0086D8
static const float3 RBW_CMID    = float3(0.066, 0.424, 0.747);   // #00A8F5
static const float3 RBW_CBRIGHT = float3(0.088, 0.567, 0.825);   // #00C4FB
static const float3 RBW_CAQUA   = float3(0.03, 0.78, 0.9);       // W12 red-free aqua
static const float3 RBW_CAQUAW  = float3(0.2, 0.93, 0.97);
static const float3 RBW_PDEEP   = float3(0.465, 0.086, 0.376);   // #C81CAE
static const float3 RBW_PBODY   = float3(0.698, 0.112, 0.545);   // #F72BD4
static const float3 RBW_PLIGHT  = float3(0.779, 0.204, 0.769);   // #FB57F9
static const float3 RBW_PPALE   = float3(0.835, 0.534, 0.872);   // #F0AFF7
static const float3 RBW_PWHITE  = float3(0.945, 0.767, 0.974);   // #F8D7FD
static const float3 RBW_VIN     = float3(0.372, 0.170, 0.625);   // violet, core side
static const float3 RBW_VPERI   = float3(0.311, 0.252, 0.740);   // periwinkle
static const float3 RBW_VBLUE   = float3(0.07, 0.40, 0.82);      // W12 blue into the cyan core
static const float3 RBW_VOUT    = float3(0.381, 0.185, 0.674);   // violet, bank side
static const float3 RBW_OBLUE   = float3(0.211, 0.256, 0.715);   // blue-violet outer water
static const float3 RBW_ODEEP   = float3(0.161, 0.316, 0.700);   // deep blue outer water
static const float3 RBW_FOAM    = float3(1.0, 1.0, 1.0);         // PALETTE.foam
static const float3 RBW_FOAMLAV = float3(0.863, 0.761, 1.0);     // PALETTE.foamLav #efe2ff (linear)

// the 05 band S on top of the course meander (waterRibbon.ts sbend05), in Three.js master arc length
float RBW_SBend(float sm)
{
    return 1.05 * sin(sm * 0.31 - 0.834) + 0.18 * sin(sm * 0.62 + 0.6);
}

// vertex swell (waterRibbon.ts VERT, AMP 05 = 0.1), stream only (no swell on the foam shelf)
float RBW_RiverWave(float x, float s, float d, float hw, float sOffset, float amp, float time)
{
    float u = (x - d) / max(hw, 0.5);
    float uc = clamp(u, -1.0, 1.0);
    float sm = s + sOffset;
    float mask = 1.0 - smoothstep(0.92, 1.08, abs(u));
    return amp * mask * (0.6 * sin(sm * 0.9 - time * 2.4 + uc * 1.7) + 0.4 * sin(sm * 0.41 + time * 1.5 - uc * 2.3));
}

void RainbowRiverWave_float(float3 PositionWS, float4 Stream, float SOffset, float Amp, float Time, out float Offset)
{
    Offset = RBW_RiverWave(PositionWS.x, PositionWS.z, Stream.x, Stream.y, SOffset, Amp, Time);
}

void RainbowRiverWave_half(half3 PositionWS, half4 Stream, half SOffset, half Amp, half Time, out half Offset)
{
    float o;
    RainbowRiverWave_float((float3)PositionWS, (float4)Stream, (float)SOffset, (float)Amp, (float)Time, o);
    Offset = (half)o;
}

void RainbowRiver_float(float3 PositionWS, float3 NormalWS, float3 ViewDirWS,
                        float4 Stream, float4 Benny, float4 Splash, float4 Params, float3 LightDirWS,
                        out float3 Color, out float3 ReflDir, out float3 ReflTint, out float ReflWeight)
{
    float time = Params.w;
    float pxK = RBW_PxScale();
    float lat = PositionWS.x;
    float s = PositionWS.z;
    float sm = s + Params.x;                       // Three.js master arc length
    float d = Stream.x;
    float hw = max(Stream.y, 0.5);
    float latR = lat - d;                          // lateral in the stream frame (Three.js `lat`)
    float M = Params.y * d + Stream.z;             // cyan-core centre relative to the stream centre (coreLateral)
    float x = latR - M;
    float sbend = RBW_SBend(sm);
    float xb = x - sbend;                          // band frame

    // ---- screen derivatives, all in uniform control flow ----
    float fws = fwidth(s);
    float fwsR = fws * pxK;                        // units per reference pixel
    float fwLat = fwidth(lat);
    float fl2 = fwLat * pxK + 1e-4;

    // ---- Benny ----
    float bOn = step(0.001, Benny.z);
    float wk = saturate(Benny.z);
    float rbw = Benny.w > 0.01 ? Benny.w : 0.75;
    float db = s - Benny.x;                        // + = ahead of Benny
    float back = max(-db, 0.0) * bOn;
    float dlB = lat - Benny.y;

    // ---- band layout (05: vStyle = [1, 0.62, 0.19, 0]) ----
    float hwc = min(hw, 4.5);
    float gate = lerp(1.0, 0.75 + 0.25 * smoothstep(1.0, 20.0, db), bOn);
    float near05 = lerp(1.0, 0.8 + 0.2 * smoothstep(2.0, 14.0, db), bOn);
    float flow = Params.z;
    float v5 = sm - time * flow;                   // advected arc length (one constant speed: no shear)
    float pert = (RBW_VNoise(float2(x * 0.9, v5 * 0.12 + 3.0)) - 0.5) * 0.3 * hwc * 0.22;
    float tv = sm - time * 11.0 * 0.3;             // slow travelling wobble of the band shapes (stage speed 11)
    float offL = hw * (0.62 * near05 + 0.03 * sin(sm * 0.13 + 1.7)) + hwc * 0.05 * sin(tv * 0.42 + 1.1);
    float offR = hw * (0.62 * near05 + 0.03 * sin(sm * 0.11 + 4.2)) + hwc * 0.05 * sin(tv * 0.37 + 3.9);
    float wL = hw * 0.19 * (1.0 + 0.15 * sin(sm * 0.19 + 0.4) + 0.08 * hwc * sin(tv * 0.6)) * gate;
    float wR = hw * 0.19 * (1.0 + 0.15 * sin(sm * 0.17 + 2.9) + 0.08 * hwc * sin(tv * 0.55 + 2.0)) * gate;
    // wave-7 channel shape fitted to the approved image (stationary in master s)
    float fR = -0.3 * smoothstep(133.0, 136.0, sm) * (1.0 - smoothstep(139.5, 142.0, sm))
             + 1.9 * smoothstep(146.5, 154.0, sm) * (1.0 - smoothstep(160.0, 168.0, sm))
             - 0.9 * smoothstep(165.0, 170.0, sm) * (1.0 - smoothstep(174.0, 180.0, sm));
    float fL = -0.5 * smoothstep(143.0, 147.0, sm) * (1.0 - smoothstep(151.0, 155.0, sm))
             + 1.0 * smoothstep(154.0, 158.0, sm) * (1.0 - smoothstep(168.0, 176.0, sm));
    offL += fL;
    offR += fR;
    // approaching Benny the two S-bands swing out to the banks (behind him only the wake sweeps carry pink)
    offL += bOn * 2.0 * RBW_SS(7.0, 2.5, db);
    offR += bOn * 1.6 * RBW_SS(2.6, 0.4, db);
    float Mb = M + sbend;
    float roomL = Mb + hw - 0.5 - offL;
    float roomR = hw - 0.5 - Mb - offR;
    wL = RBW_SMin(wL, max(roomL, 0.6 * wL), 0.5);
    wR = RBW_SMin(wR, max(roomR, 0.6 * wR), 0.5);
    offL = RBW_SMin(offL, Mb + hw - wL - 0.5, 1.2);
    offR = RBW_SMin(offR, hw - wR - 0.5 - Mb, 1.2);
    float sdL = xb + offL + pert;
    float sdR = xb - offR + pert;

    // ---- streamline coordinate X: follows the S-band midline ahead, fans out from Benny's track behind him ----
    float cLc = -offL - pert;
    float cRc = offR - pert;
    float hS = max(0.5 * (cRc - cLc), 0.6);
    float nearW = bOn * RBW_SS(5.0, 0.5, db);
    float bLatR = Benny.y - d;
    float X = (latR - lerp(M + sbend + 0.5 * (cLc + cRc), bLatR, nearW)) * lerp(3.0 / hS, 1.0, nearW) / (1.0 + 0.7 * back);
    X += 0.05 * sin(v5 * 0.21 + X * 1.1);
    float fwX5 = fwidth(X);

    // ---- near-field / mid-field split (Three.js tuned in px of the 864x1536 frame) ----
    float near5 = 1.0 - smoothstep(0.006, 0.024, fwsR);
    float mid5 = 1.0 - near5;

    // ---- brushed satin + broad swells ----
    float4 B5 = RBW_Brush(X, v5, fwX5 * pxK, fwsR, time * 0.35);
    float br = lerp(B5.y, 0.5 + (B5.y - 0.5) * 0.3, near5);
    br = 0.5 + (br - 0.5) * 0.45;
    float bcore = B5.z * 0.3 * (1.0 - 0.8 * near5);
    float bglow = B5.w * (1.0 - 0.8 * near5);
    float lane5 = B5.x * (1.0 - 0.6 * near5);
    float tq = saturate(abs(x) / hw);
    float turb = 0.85 * smoothstep(0.55, 1.0, tq);
    float3 rp = RBW_Ripple(float2(X * 0.3, (sm - time * flow * 0.8) * 0.011));
    lane5 += (rp.x - 0.5) * (0.8 + 0.2 * turb) * (1.0 - 0.3 * near5);
    float silkHi = smoothstep(0.7, 0.96, rp.x) * (1.0 - 0.5 * near5);
    bglow = max(bglow, silkHi * 0.85);
    float rpA = smoothstep(0.66, 0.9, rp.x);
    bcore = max(bcore, rpA * rpA * 0.22 * (1.0 - 0.7 * near5));

    // ---- diagonal pink wake sweeps behind Benny ----
    float cW = 0.2 + 0.55 * back + 0.05 * sin(v5 * 1.7 + (dlB >= 0.0 ? 1.9 : -1.9)) * back;
    float wW = (0.12 + 0.07 * back) * smoothstep(0.7, 1.4, back) * wk * (1.0 - smoothstep(7.0, 10.0, back));

    // ---- band coordinate of the nearer band: -1 bank-side edge .. +1 core-side edge ----
    float tL5 = sdL / max(wL, 1e-3);
    float tR5 = -sdR / max(wR, 1e-3);
    float tb = abs(tL5) < abs(tR5) ? tL5 : tR5;
    float tW5 = (cW - abs(dlB)) / max(wW, 1e-3);
    float sweep = (wW > 0.001 && abs(tW5) < abs(tb)) ? 1.0 : 0.0;
    tb = lerp(tb, tW5, sweep);
    tb += (br - 0.5) * 0.34 * mid5;
    float at = abs(tb);

    // ---- electric cyan ----
    float h5 = saturate(0.5 + lane5 * 0.8 + (br - 0.5) * 0.7);
    float3 cy = lerp(RBW_CDEEP, RBW_CDEEP2, smoothstep(0.0, 0.22, h5));
    cy = lerp(cy, RBW_CMID, smoothstep(0.22, 0.45, h5));
    cy = lerp(cy, RBW_CBRIGHT, smoothstep(0.5, 0.76, h5) * 0.85);
    cy = lerp(cy, RBW_CAQUA, bglow * 0.6);
    cy = lerp(cy, RBW_CAQUA, bcore * 0.8);
    cy += float3(0.5, 0.9, 0.9) * bcore * bcore * bcore * 0.8;

    // near field: thick glossy swells rolling past Benny, bowed around his track
    float ph = v5 * 12.0 + 9.0 * dlB * dlB / (1.0 + 0.25 * back) + 0.9 * RBW_VNoise(float2(dlB * 0.9 + 3.0, v5 * 0.6));
    float sv = 0.5 + 0.5 * sin(ph);
    float3 nb = lerp(lerp(RBW_CDEEP, RBW_CDEEP2, 0.5), RBW_CDEEP2, smoothstep(0.0, 0.25, sv));
    nb = lerp(nb, RBW_CMID, smoothstep(0.25, 0.6, sv));
    nb = lerp(nb, RBW_CBRIGHT, smoothstep(0.7, 1.0, sv) * 0.8);
    float segN = smoothstep(0.3, 0.58, RBW_VNoise(float2(dlB * 1.4 + 9.0, v5 * 1.3)));
    float sp = max(sin(ph + 1.0), 1e-4);
    float crestN = (pow(sp, 36.0) + 0.5 * pow(sp, 7.0)) * segN;
    nb = lerp(nb, RBW_CAQUA, saturate(0.65 * pow(sp, 5.0) * segN));
    nb = lerp(nb, RBW_CAQUAW, saturate(pow(sp, 22.0) * segN) * 0.5);
    cy = lerp(cy, nb, near5);

    // deep blue / blue-violet water between a band and its bank
    float3 ow = lerp(RBW_ODEEP * 0.82, RBW_OBLUE, smoothstep(0.3, 0.75, h5));
    ow = lerp(ow, RBW_CAQUA, bcore * 0.35);

    // hot-pink satin
    float hp = saturate(0.5 + lane5 * 0.5 + (br - 0.5) * 0.8);
    float3 pk = lerp(RBW_PDEEP, RBW_PBODY, smoothstep(0.1, 0.45, hp));
    float hlq = (tb - 0.45) / 0.18;
    float hl = exp(-hlq * hlq);
    pk = lerp(pk, RBW_PLIGHT, saturate(bglow * 0.6 + hl * 0.3));
    float pc = saturate(bcore + sweep * B5.z * 0.5);
    pk = lerp(pk, RBW_PPALE, pc * 0.75);
    pk = lerp(pk, RBW_PWHITE, pc * pc * 0.85);
    pk += float3(0.9, 0.6, 0.9) * pc * pc * pc * 0.6;
    pk = lerp(pk, RBW_PDEEP, RBW_SS(-0.2, -0.85, tb) * 0.35);

    // hue ramp across each band edge (pink -> violet -> periwinkle -> blue -> cyan)
    float3 cIn = lerp(pk, RBW_VIN, smoothstep(0.8, 1.0, at));
    cIn = lerp(cIn, RBW_VPERI, smoothstep(0.98, 1.1, at));
    cIn = lerp(cIn, RBW_VBLUE, smoothstep(1.08, 1.2, at));
    cIn = lerp(cIn, cy, smoothstep(1.17, 1.35, at));
    float3 cOut = lerp(pk, RBW_VOUT, smoothstep(0.8, 1.0, at));
    cOut = lerp(cOut, lerp(RBW_OBLUE, RBW_VBLUE, sweep), smoothstep(1.0, 1.15, at));
    cOut = lerp(cOut, lerp(ow, cy, sweep), smoothstep(1.12, 1.3, at));
    float3 c5 = tb >= 0.0 ? cIn : cOut;
    float pk5 = 1.0 - smoothstep(0.85, 1.25, at);  // pink weight (tints the highlights)

    // ---- glossy lighting from the swell normal ----
    float3 N0 = normalize(NormalWS);
    float3 V = normalize(ViewDirWS);
    float3 T = float3(0.0, 0.0, 1.0);              // downstream (Three.js -Z)
    float3 Rw = normalize(cross(N0, T));            // rider's right (+X)
    float3 N5 = normalize(N0 + (Rw * rp.y + T * (rp.z * 0.04)) * 0.38);
    float3 L = normalize(LightDirWS);
    float3 Hv = normalize(L + V);
    float nv5 = saturate(dot(N5, V));
    float fr = 1.0 - nv5;
    float3 R5 = reflect(-V, N5);
    float3 glintC = lerp(float3(0.08, 1.05, 1.35), float3(1.4, 0.55, 1.3), pk5);
    c5 = lerp(c5, lerp(RBW_CBRIGHT, RBW_PLIGHT, pk5), fr * fr * fr * 0.05);
    c5 += glintC * pow(saturate(dot(N5, Hv)), 90.0) * 0.6;
    float3 Lg = normalize(T + N0 * 0.1);            // the bright tunnel end, far downstream
    float gl5 = pow(saturate(dot(R5, Lg)), 90.0);
    float H5 = saturate(h5 * 0.7 + bcore * 0.3);
    c5 += glintC * gl5 * (smoothstep(0.6, 0.92, H5) * 0.5 + bcore * 0.6);

    // long smooth satin sheen + long glossy streaks along the current (mid field)
    c5 = lerp(c5, lerp(lerp(RBW_CBRIGHT, RBW_CAQUA, 0.5), RBW_PLIGHT, pk5), silkHi * mid5 * 0.32);
    float kS5 = mid5 * (1.0 - smoothstep(0.3, 0.8, fwsR));
    float2 sS5 = max(RBW_SilkStreak(X, v5, 2.2, 0.0, 0.4, pxK), RBW_SilkStreak(X, v5, 3.7, 5.3, 0.3, pxK) * 0.7) * kS5;
    c5 = lerp(c5, lerp(RBW_CAQUA, RBW_PLIGHT, pk5), sS5.y * 0.4);
    c5 += lerp(float3(1.4, 1.9, 2.0), float3(2.0, 1.5, 2.0), pk5) * sS5.x * 1.1;

    // flares carried by the current (mid: along the flow; near: across it, on the swell crests) + lightning flares
    float flA = RBW_FlowGlint(float2(X * 1.6, v5 * 0.12), 0.8, 48.0, 4.6, 0.0, time, pxK);
    float flB = RBW_FlowGlint(float2(X * 1.6, v5 * 1.4 + 0.5 + 1.3 * sin(X * 4.1 + 0.6)), 0.8, 56.0, 5.0, 0.85, time + 2.7, pxK);
    float gC = (ph - 0.571) / 6.2832 + 0.5;
    float2 bz = RBW_Bolt(float2(X * 2.4 + 0.3 * sin(gC * 2.1), gC), 0.7, 64.0, 6.5, 4.17, pxK);
    float boltN = near5 * (1.0 - pk5);
    c5 = lerp(c5, RBW_CAQUA, saturate(bz.y * 0.55) * boltN);
    c5 += float3(2.0, 2.3, 2.4) * bz.x * boltN;
    c5 += lerp(float3(1.7, 2.1, 2.2), float3(2.2, 1.7, 2.2), pk5)
        * (flA * mid5 * (1.0 - smoothstep(0.3, 0.8, fwsR)) + flB * near5 * (0.5 + 0.8 * smoothstep(0.2, 0.8, crestN)));

    float3 col = c5;
    float foamK = 0.0;

    // ---- W11/W12 foam shelf between the stream edge and the wall: soap puffs, lavender-blue creases,
    //      scalloped bubbly waterline and a soft blue contact shade on the water beside it ----
    float eC = abs(latR) - hw;                      // > 0 beyond the stream edge
    float sgn = latR >= 0.0 ? 1.0 : -1.0;
    float wl = (RBW_VNoise(float2(sm * 0.5, sgn * 7.0)) - 0.5) * 0.7;
    float e2 = eC + wl * 0.8;
    [branch] if (e2 > -1.0)
    {
        float2 pcc = float2(lat * 1.6 + 1.7, sm * 0.36);
        float c1 = RBW_Cells(pcc);
        float c1u = RBW_Cells(pcc + float2(0.0, 0.16));
        float c2 = RBW_Cells(float2(lat * 4.6 + 5.3, sm * 1.05));
        float f1 = 1.0 - smoothstep(0.1, 0.3, fl2 * 1.6);
        float f2 = 1.0 - smoothstep(0.1, 0.3, fl2 * 4.6);
        float2 pc0 = pcc * 0.42 + 3.1;               // puff05: coarser mounds where the puffs get too small
        float c0 = RBW_Cells(pc0);
        float c0u = RBW_Cells(pc0 + float2(0.0, 0.16));
        c1 = lerp(c0, c1, f1);
        c1u = lerp(c0u, c1u, f1);
        f1 = max(f1, 1.0 - smoothstep(0.1, 0.3, fl2 * 0.67));
        float shelf = smoothstep(-0.1, 0.08, e2 + (0.5 - c1) * 0.55 * f1);
        float dome = 1.0 - smoothstep(0.15, 0.78, c1);
        float lit = saturate((c1u - c1) * 3.2 + 0.55);
        float3 fo = lerp(RBW_FOAMLAV * 0.7, RBW_FOAM * 1.14, lerp(0.62, dome * (0.45 + 0.55 * lit) + 0.25 * lit, f1));
        fo = lerp(fo, float3(0.5, 0.56, 1.05), (1.0 - smoothstep(0.03, 0.2, c2)) * f2 * 0.22);
        float cb = RBW_Cells(float2(lat * 3.4 + 0.7, sm * 0.8));
        float fb = 1.0 - smoothstep(0.1, 0.3, fl2 * 3.4);
        fo = lerp(fo, lerp(RBW_FOAM * 1.2, RBW_FOAMLAV * 0.72, smoothstep(0.2, 0.8, cb)) * (0.8 + 0.3 * lit), fb * 0.7);
        fo = lerp(fo, float3(0.36, 0.42, 0.98), (1.0 - smoothstep(0.0, 0.3, e2)) * 0.4);
        col = lerp(col, col * float3(0.55, 0.6, 0.9), (1.0 - smoothstep(0.0, 0.5, -e2)) * 0.5 * (1.0 - shelf));
        col = lerp(col, fo, shelf);
        foamK = shelf;
    }

    // ---- Benny's wake at the waterline (driven by SplashWake through _RainbowBenny) ----
    float2 dB = float2(dlB, db);
    float distB = length(dB);
    float behindB = max(-db, 0.0);
    float aF = dlB / (rbw * 0.9 + behindB * 0.75);  // fanning ray coordinate
    float rayP = aF * 7.0;
    float fwRay = max(fwidth(rayP) * pxK, 1e-4);
    float wakeK = 0.0;
    [branch] if (wk > 0.001 && distB < rbw * 8.0)
    {
        // broken bubbly foam collar hugging the waterline (wider at his sides and behind him)
        float rOut = rbw * (1.35 + 0.45 * saturate(behindB * 0.8));
        float collar = smoothstep(rbw * 0.82, rbw * 0.98, distB) * (1.0 - smoothstep(rbw * 1.0, rOut, distB));
        float cc = RBW_Cells(dB * 5.5 + float2(0.0, time * 1.3));
        float cc2 = RBW_Cells(dB * 11.0 + float2(3.1, time * 2.1));
        float bubbly = saturate(1.0 - cc * 1.15) * 0.65 + saturate(1.0 - cc2 * 1.2) * 0.35;
        float foamW = collar * smoothstep(0.15, 0.55, bubbly + collar * 0.25);
        // white spray fans streaming back and out from his sides (approved: radiating white streaks)
        float sideA = abs(aF);
        float fanMask = smoothstep(0.55, 0.8, sideA) * (1.0 - smoothstep(1.25, 1.6, sideA))
                      * smoothstep(0.15, 0.6, behindB) * exp(-behindB * 0.5);
        float rid = floor(rayP);
        float rh = RBW_Hash12(float2(rid, 3.7));
        float dpx = abs(frac(rayP) - (0.3 + 0.4 * rh)) / fwRay;
        float rayLine = 1.0 - smoothstep(0.8, 2.6, dpx);
        float raySeg = smoothstep(0.35, 0.75, RBW_VNoise(float2(rid * 2.3, behindB * 2.4 + time * 7.0)));
        float rays = rayLine * raySeg * fanMask;
        // short churned trail right behind him
        float trail = exp(-behindB * 1.1) * (1.0 - smoothstep(rbw * 0.5, rbw * 1.25, abs(dlB)))
                    * step(db, 0.0) * smoothstep(0.35, 0.65, bubbly) * 0.6;
        float wakeF = saturate(max(max(foamW, rays), trail)) * wk;
        float3 foamCol = lerp(float3(0.78, 0.86, 1.0), float3(1.25, 1.28, 1.32), saturate(bubbly * 1.2));
        col = lerp(col, foamCol, wakeF);
        wakeK = wakeF;
    }
    // landing splash: an expanding broken foam ring
    [branch] if (Splash.w > 0.001 && Splash.z < 1.2)
    {
        float age = Splash.z;
        float2 dS = float2(lat - Splash.x, s - Splash.y);
        float dr = length(dS);
        float ringR = rbw + age * 3.0;
        float ringW = 0.18 + age * 0.35;
        float ring = 1.0 - smoothstep(0.0, ringW, abs(dr - ringR));
        float inner = (1.0 - smoothstep(rbw * 0.9, ringR, dr)) * 0.5;
        float cr = RBW_Cells(dS * 6.0 + age * 2.0);
        float burst = saturate((ring + inner) * RBW_SS(0.75, 0.2, cr)) * (1.0 - age / 1.2) * saturate(Splash.w);
        col = lerp(col, float3(1.2, 1.25, 1.3), burst);
        wakeK = max(wakeK, burst);
    }

    Color = col;
    ReflDir = R5;
    ReflTint = lerp(RBW_CAQUA, RBW_PLIGHT, pk5);
    ReflWeight = (0.06 + 0.94 * pow(max(fr, 1e-4), 5.0)) * (1.0 - saturate(foamK + wakeK));
}

void RainbowRiver_half(half3 PositionWS, half3 NormalWS, half3 ViewDirWS,
                       half4 Stream, half4 Benny, half4 Splash, half4 Params, half3 LightDirWS,
                       out half3 Color, out half3 ReflDir, out half3 ReflTint, out half ReflWeight)
{
    float3 c, rd, rt;
    float rw;
    RainbowRiver_float((float3)PositionWS, (float3)NormalWS, (float3)ViewDirWS, (float4)Stream, (float4)Benny,
                       (float4)Splash, (float4)Params, (float3)LightDirWS, c, rd, rt, rw);
    Color = (half3)c;
    ReflDir = (half3)rd;
    ReflTint = (half3)rt;
    ReflWeight = (half)rw;
}

// the tunnel mirrored in the ripples (W12): only the bright part of the environment (ring lamps, gold, the throat)
// is added, in the water's own hue; only the brightest burn white. Env = linear colour sampled along ReflDir.
void RainbowRiverReflect_float(float3 Color, float3 Env, float3 ReflTint, float ReflWeight, float Strength, out float3 Result)
{
    float plum = max(Env.r, max(Env.g, Env.b));
    float3 reflHue = ReflTint * plum * 1.35;
    Result = Color + lerp(reflHue, float3(plum, plum, plum), smoothstep(0.9, 1.0, plum) * 0.6)
                   * smoothstep(0.62, 0.97, plum) * ReflWeight * Strength;
}

void RainbowRiverReflect_half(half3 Color, half3 Env, half3 ReflTint, half ReflWeight, half Strength, out half3 Result)
{
    float3 r;
    RainbowRiverReflect_float((float3)Color, (float3)Env, (float3)ReflTint, (float)ReflWeight, (float)Strength, r);
    Result = (half3)r;
}

#endif // RAINBOW_RIVER_INCLUDED
