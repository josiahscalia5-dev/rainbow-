// Rainbow Screen 05 - river surface shading (Agent 3). Shader Graph Custom Function file:
//   RainbowRiver_float / RainbowRiver_half            -> body colour, reflection direction / tint / weight
//   RainbowRiverReflect_float / RainbowRiverReflect_half -> adds the mirrored tunnel highlights (env sample)
//   RainbowRiverWave_float / RainbowRiverWave_half    -> vertex swell height (world y offset)
// Port of src/vfx/waterRibbon.ts, Screen 05 path W10 (?water05) + W12 silk05 + W11 foam shelf (puff05):
// electric-cyan core between two hot-pink satin S-bands that follow the course meander (+ the band S `sbend05`),
// hue ramp pink -> violet -> periwinkle -> cyan across each band edge, flow-aligned brushed satin, fine silky satin
// streaks (RBW_Satin, lanes warped so they never outline the bands), swell highlights, glossy glints toward the bright
// tunnel end, flares carried by the current, near-field ∩ swells with 4-point flares along the arcs behind Benny,
// curved pink wake sweeps, and Benny's white waterline wake (collar + spray fans).
// Everything is procedural in world (x, s): one continuous material along the whole course, no textures, no seams.
//
// Inputs (all world space; the river mesh sits at the identity transform):
//   Stream  x = stream centre x (RiverPath.Meander(s)), y = stream half width (6 - sqrt(d^2 + 0.09)),
//           z = extra core shift (W10 exit-bend hold), w = unused         [mesh UV1, see RiverMeshGenerator.cs]
//   Benny   x = Benny s (world z), y = Benny world x, z = wake strength 0..1 (0 = airborne), w = waterline radius (0 = no Benny)
//   Splash  x = world x, y = world z, z = age (s), w = strength           [global _RainbowSplash, set by SplashWake]
//   Params  x = Three.js master-s offset, y = core swing, z = flow speed (u/s), w = time (s)
#ifndef RAINBOW_RIVER_INCLUDED
#define RAINBOW_RIVER_INCLUDED

#include "Assets/Rainbow/Water/Shaders/RainbowWaterCommon.hlsl"
#include "Assets/Rainbow/Water/Shaders/RainbowFoamBank.hlsl"   // foam bank waterlines + soap ramp (foam area)

// (water4 2026-11-24) live-tuning hook of AgentScripts/screen05_water4_tune.cs (global vector, never set in the game = 0 =
// the baked look): x = contact shade strength delta, y = contact shade length delta, z = right band width delta (x),
// w = right band near-field shift delta (m); _W4Tune2: x = near arc highlight gain delta, y = pink sheen scale delta,
// z = band edge raggedness delta, w = near satin hairline fade delta
float4 _W4Tune;
float4 _W4Tune2;
float4 _W4LookD;   // live deltas on _W4Look (material property, RainbowRiver.shader)
#ifndef RBW_HAS_LOOK
#define _W4Edge 1.0
#define _W4Band float4(0.9, 0.65, 0.0, 0.6)
#define _W4Look float4(0.75, 0.3, 0.55, 0.5)
#endif
float4 _W4Dbg;
float4 _R5Arc;    // (river5) live deltas: x arc period, y arc glow gain, z arc line gain, w arc phase (m)
float4 _R5Tune;   // (river5) live deltas of AgentScripts/screen05_river_tune.cs (0 in the game): x sweep offset, y sweep width, z near base revert, w near lift   // x = brush / ripple streak cores, y = ripple normal, z = specular glint, w = env reflection (gain deltas)

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
static const float3 RBW_VPERI   = float3(0.24, 0.19, 0.800);   // periwinkle
static const float3 RBW_VBLUE   = float3(0.07, 0.40, 0.82);      // W12 blue into the cyan core
static const float3 RBW_VOUT    = float3(0.381, 0.185, 0.674);   // violet, bank side
static const float3 RBW_OBLUE   = float3(0.211, 0.256, 0.715);   // blue-violet outer water
static const float3 RBW_ODEEP   = float3(0.161, 0.316, 0.700);   // deep blue outer water
static const float3 RBW_FOAM    = float3(1.0, 1.0, 1.0);         // PALETTE.foam
static const float3 RBW_FOAMLAV = float3(0.863, 0.761, 1.0);     // PALETTE.foamLav #efe2ff (linear)

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

// (river round 4b 2026-11-24) E = (WL, LO, LI, RI), F = (RO, WR, rope width left, right): the layout table RiverLayout05 (mesh
// UV2 / UV3): world x of the foam waterlines and of the pink bands' edges. The band colours, the streamlines and the foam shelf
// all come from it.
void RainbowRiver_float(float3 PositionWS, float3 NormalWS, float3 ViewDirWS,
                        float4 Stream, float4 E, float4 F, float4 Benny, float4 Splash, float4 Params, float3 LightDirWS,
                        out float3 Color, out float3 ReflDir, out float3 ReflTint, out float ReflWeight)
{
    float time = Params.w;
    float pxK = RBW_PxScale();
    float lat = PositionWS.x;
    float s = PositionWS.z;
    float sm = s + Params.x;                       // Three.js master arc length
    float fwsR = fwidth(s) * pxK;                  // units per reference pixel

    // ---- Benny ---- (present = waterline radius > 0, so the layout never jumps while he is airborne)
    float bOn = step(0.001, Benny.w);
    float wk = saturate(Benny.z);
    float rbw = Benny.w > 0.01 ? Benny.w : 0.75;
    float db = s - Benny.x;                        // + = ahead of Benny
    float back = max(-db, 0.0) * bOn;
    float dlB = lat - Benny.y;
    float dlW = dlB - 0.1;                         // the wake's axis (seen from the camera straight behind)
    float flow = Params.z;
    float v5 = sm - time * flow;                   // advected arc length (one constant speed: no shear)

    // ---- the two pink S-bands from the table (a slow, small travelling breath of their edges) ----
    float tv = sm - time * 3.3;
    float wl = E.x, lo = E.y + 0.05 * sin(tv * 0.8 + 1.1), li = E.z + 0.05 * sin(tv * 0.7 + 2.0);
    float ri = E.w + 0.05 * sin(tv * 0.75 + 3.9), ro = F.x + 0.05 * sin(tv * 0.85 + 5.0), wr = F.y;
    float hL = max(0.5 * (li - lo), 0.06), hR = max(0.5 * (ro - ri), 0.06);
    float tL5 = (lat - 0.5 * (lo + li)) / hL;      // + = core side
    float tR5 = (0.5 * (ri + ro) - lat) / hR;
    float tb = abs(tL5) < abs(tR5) ? tL5 : tR5;
    float hB = abs(tL5) < abs(tR5) ? hL : hR;

    // ---- streamline coordinate q: -3 WL .. -2 LO .. -1 LI .. +1 RI .. +2 RO .. +3 WR ----
    float q = lat < lo ? -2.0 - (lo - lat) / max(lo - wl, 0.1)
            : lat < li ? -2.0 + (lat - lo) / (2.0 * hL)
            : lat < ri ? -1.0 + 2.0 * (lat - li) / max(ri - li, 0.3)
            : lat < ro ? 1.0 + (lat - ri) / (2.0 * hR)
            : 2.0 + (lat - ro) / max(wr - ro, 0.1);
    float nearW = bOn * RBW_SS(2.0, -0.8, db);     // beside / behind Benny the lanes fan out from his track
    nearW *= 1.0 - smoothstep(0.4, 1.1, abs(dlW) - (0.2 + 0.44 * back));
    float X = lerp(q * 2.2, dlW * 4.2 / (1.0 + 0.55 * back), nearW);
    X += 0.12 * sin(v5 * 0.21 + X * 1.1);
    float fwX = fwidth(X) * pxK;

    // ---- long satin lanes along the current ----
    float a1 = 1.0 - smoothstep(0.15, 0.45, fwX * 2.9);
    float a2 = 1.0 - smoothstep(0.15, 0.45, fwX * 7.0);
    float n0 = RBW_VNoise(float2(X * 0.75 + 2.3, v5 * 0.05 + 3.0));
    float n1 = RBW_VNoise(float2(X * 2.3 + 7.1 + 0.6 * n0, v5 * 0.085));
    float n2 = RBW_VNoise(float2(X * 5.6 + 1.7 + 0.8 * n0, v5 * 0.14 + 9.0));
    float a3 = 1.0 - smoothstep(0.15, 0.45, fwX * 13.0);
    float n3 = RBW_VNoise(float2(X * 11.5 + 4.3 + 1.1 * n0, v5 * 0.11 + 5.0));
    float a4 = 1.0 - smoothstep(0.15, 0.4, fwX * 30.0);
    float n4 = RBW_VNoise(float2(X * 27.0 + 8.7 + 2.5 * n0, v5 * 0.16 + 1.0));
    // fine silky hairlines in bundles along the current (approved: the satin is full of them)
    float silk = (smoothstep(0.5, 0.85, n3) * a3 * 0.6 + smoothstep(0.52, 0.82, n4) * a4) * smoothstep(0.34, 0.58, n2 * 0.5 + n1 * 0.5);
    float lane = (n0 - 0.5) * 0.75 + (n1 - 0.5) * 0.5 * a1 + (n2 - 0.5) * 0.36 * a2 + (n3 - 0.5) * 0.22 * a3;
    float stA = smoothstep(0.52, 0.85, n1 * 0.75 + n2 * 0.35) * a1;                   // broad light streaks
    float stB = smoothstep(0.62, 0.9, n2) * smoothstep(0.3, 0.65, n1) * a2;           // fine glossy streaks

    // ---- diagonal pink wake sweeps behind Benny ----
    // (river5) approved: the sweeps start ~0.11 m further out and splay a little wider (rowclass y 1240-1360: Unity ~25 px
    // inside on each side, ~15 % narrower)
    float cW = 0.21 + _R5Tune.x + 0.5 * back;
    float wW = (0.16 + _R5Tune.y + 0.06 * back) * smoothstep(0.8, 1.3, back) * wk * (1.0 - smoothstep(2.15, 2.7, back));
    float tW5 = (cW - abs(dlW)) / max(wW, 1e-3);
    float sweep = (wW > 0.001 && abs(tW5) < abs(tb)) ? 1.0 : 0.0;
    tb = lerp(tb, tW5, sweep);
    hB = lerp(hB, wW, sweep);
    tb += ((n1 - 0.5) * 0.45 * a1 + (n2 - 0.5) * 0.5 * a2 + (n3 - 0.5) * 0.25 * a3) * _W4Edge;   // streaky satin edges
    float at = abs(tb) * _W4Band.x * (tb < 0.0 ? lerp(0.82, 1.0, sweep) : 1.0);                // < 1 = broader pink inside the traced edges

    // ---- electric cyan ----
    float coreK = saturate(1.0 - q * q * 0.8);
    float h5 = saturate(0.47 + lane * _W4Look.x + (coreK - 0.5) * _W4Look.y);
    float3 cy = lerp(RBW_CDEEP2, RBW_CMID, smoothstep(0.05, 0.42, h5));
    cy = lerp(cy, RBW_CBRIGHT, smoothstep(0.42, 0.75, h5));
    cy = lerp(cy, RBW_CAQUA, saturate(stA * _W4Look.z + smoothstep(0.75, 1.0, h5) * 0.3));
    cy = lerp(cy, RBW_CAQUAW, saturate(stB * _W4Look.w + silk * _W4Band.w));

    // Benny's wake water: smooth azure with broad cyan arcs bowed over his track (standing waves in his frame)
    float inW = bOn * wk * smoothstep(0.75, 1.15, back) * (1.0 - smoothstep(-0.12, 0.08, abs(dlW) - (cW - wW)))
              * (1.0 - smoothstep(3.2, 4.2, back));
    float bk = back - 0.8 * dlW * dlW + 0.012 * sin(time * 2.2 + dlW * 5.0);
    float pha = (bk - 1.42 - _R5Arc.w) / (0.52 + _R5Arc.x);
    float ca = frac(pha + 0.5) - 0.5;
    float segN = smoothstep(0.1, 0.5, RBW_VNoise(float2(dlW * 3.1 + 9.0, floor(pha + 0.5) * 3.7)));
    float glowA = ca > 0.0 ? exp(-ca * 4.2) : exp(ca * 12.0);
    float lineA = exp(-ca * ca * 170.0) * (0.35 + 0.65 * segN);
    float ampA = smoothstep(1.2, 1.55, bk);
    // (river5 variants: the brighter azure base CMID..CBRIGHT scored 0.3 lower, kept the deep base; _R5Tune.z = live mix)
    float3 nb = lerp(lerp(lerp(RBW_CDEEP2, RBW_CMID, 0.55), lerp(RBW_CMID, RBW_CBRIGHT, 0.35), saturate(_R5Tune.z)), RBW_CBRIGHT, saturate(glowA * (0.9 + _R5Arc.y) * ampA + lane * 0.25));
    nb = lerp(nb, RBW_CAQUA, saturate(glowA * glowA * (0.75 + 0.8 * _R5Arc.y) * ampA));
    nb = lerp(nb, RBW_CAQUAW, saturate(lineA * ampA * (0.9 + _R5Arc.z)));
    cy = lerp(cy, nb, inW);
    // (river5) the open water beside the sweeps near Benny is as bright (approved ~#2EA9F2 at y 1340-1440 vs Unity #1D93E5)
    float nearL = bOn * smoothstep(0.6, 1.4, back) * (1.0 - smoothstep(4.0, 6.0, back)) * (1.0 - inW);
    cy = lerp(cy, max(cy, lerp(RBW_CMID, RBW_CBRIGHT, 0.3)), saturate(_R5Tune.w) * nearL);

    // between a band and its bank: cyan water a touch bluer than the core
    float3 ow = lerp(cy, float3(0.15, 0.17, 0.8), _W4Band.y);

    // ---- hot-pink satin ----
    float hp = saturate(0.45 + lane * 1.1);
    float3 pk = lerp(RBW_PDEEP, RBW_PBODY, smoothstep(0.1, 0.5, hp));
    pk = lerp(pk, RBW_PLIGHT, saturate(smoothstep(0.5, 0.9, hp) * 0.7 + stA * 0.6));
    float hlq = (tb - 0.35) / 0.22;
    pk = lerp(pk, RBW_PLIGHT, exp(-hlq * hlq) * 0.3);
    pk = lerp(pk, RBW_PPALE, saturate(stB * 0.7 + silk * _W4Band.w));
    pk = lerp(pk, RBW_PWHITE, saturate(stA * stB * 0.4)) * float3(1.12, 1.0, 1.05);

    // hue ramp across each band edge (pink -> violet -> periwinkle -> blue -> cyan)
    float3 cIn = lerp(pk, RBW_VIN, smoothstep(0.62, 0.95, at));
    cIn = lerp(cIn, RBW_VPERI, smoothstep(0.9, 1.1, at));
    cIn = lerp(cIn, lerp(RBW_VPERI, cy, 0.55), smoothstep(1.02, 1.22, at));
    cIn = lerp(cIn, cy, smoothstep(1.14, 1.42, at));
    float3 cOut = lerp(pk, RBW_VOUT, smoothstep(0.7, 0.98, at));
    cOut = lerp(cOut, lerp(lerp(RBW_VPERI, ow, 0.4), RBW_VBLUE, sweep), smoothstep(0.92, 1.1, at));
    cOut = lerp(cOut, lerp(ow, cy, sweep), smoothstep(1.02, 1.2, at));
    float3 c5 = tb >= 0.0 ? cIn : cOut;
    float pk5 = 1.0 - smoothstep(0.85, 1.3, at);   // pink weight (tints the highlights)

    // ---- gloss from the swell normal ----
    float3 N0 = normalize(NormalWS);
    float3 V = normalize(ViewDirWS);
    float3 N5 = normalize(N0 + float3(lane * 0.1, 0.0, 0.0));
    float fr = 1.0 - saturate(dot(N5, V));
    float3 R5 = reflect(-V, N5);
    c5 = lerp(c5, lerp(RBW_CBRIGHT, RBW_PLIGHT, pk5), fr * fr * fr * 0.06);

    float3 col = c5;
    float foamK = 0.0;

    // ---- outside the waterlines: a narrow strip of lather under the 3D puff rope, then the drum's purple perforated floor ----
    float eC = max(wl - lat, lat - wr);            // > 0 outside
    [branch] if (eC > -0.6)
    {
        float left = step(lat, 0.5 * (wl + wr));
        float ropeW = lerp(F.w, F.z, left);
        float cc1 = RBW_Cells(float2(lat * 3.4 + 0.7, s * 1.6));
        float e2 = eC + (0.5 - cc1) * 0.14;
        float shelf = smoothstep(-0.06, 0.05, e2);
        float3 fo = RBW_Soap05(lerp(0.75, 0.2, smoothstep(0.15, 0.75, cc1)) - 0.12 * smoothstep(0.3, 1.0, eC / ropeW));
        col = lerp(col, col * float3(0.6, 0.66, 0.92), exp(min(eC, 0.0) * 5.0) * 0.5 * (1.0 - shelf));
        float ox = eC - ropeW * 0.85;              // metres beyond the rope
        float fl = smoothstep(-0.1, 0.12, ox + (0.5 - cc1) * 0.2);
        [branch] if (fl > 0.001)
        {
            float2 g = float2(ox * 2.7, s * 0.65);
            g.y += 0.5 * frac(floor(g.x) * 0.5);
            float2 gf = frac(g) - 0.5;
            float fgw = max(fwidth(g.x), fwidth(g.y));
            float slot = (1.0 - smoothstep(0.75, 1.1, length(gf / float2(0.2, 0.34)))) * (1.0 - smoothstep(0.25, 0.7, fgw));
            float sheen = pow(saturate(0.5 + 0.5 * sin(s * 0.45 + 1.3 + ox * 0.4)), 5.0);
            float3 pf = lerp(float3(0.3, 0.06, 0.5), float3(0.68, 0.2, 0.8), saturate(sheen * 0.8 + 0.12 * ox));
            pf = lerp(pf, float3(0.04, 0.008, 0.1), slot * 0.85);
            pf *= lerp(0.55, 1.0, smoothstep(0.0, 0.6, ox));
            fo = lerp(fo, pf, fl);
        }
        col = lerp(col, fo, shelf);
        foamK = shelf;
    }
    // ---- Benny's wake at the waterline (driven by SplashWake through _RainbowBenny) ----
    // (splash round 2026-11-23) The splash strands, the bubbly suds on his flanks and the droplet crown are real 3D splash
    // (Rainbow/Water/Splash + spray beads, SplashWake.cs). The water only adds what lies flat on it, round his REAL
    // waterline footprint (benny31 at the ride height: ~0.91 u toward the camera, ~0.8 u beside him):
    //  * straight behind him a dark CONTACT SHADOW, no foam (approved, measured: under his bottom the water is dark navy
    //    #002b7e -> #0468c6 -> normal blue over ~0.5 u, in a narrow wedge |lat| < ~0.35; the white ring that sat there read
    //    as a hard cut edge, as if he sat on glass)
    //  * a broken bubbly rim + soft glow only on his flanks (> ~30 deg from straight back), where the splash leaves him
    //  * a faint wet sheen where the two fans pour onto the water
    float2 dB = float2(dlB, db);
    float distB = length(dB);
    float wakeK = 0.0;
    [branch] if (wk > 0.001 && distB < rbw * 4.0)
    {
        float cosB = clamp(-db / max(distB, 1e-3), -1.0, 1.0);    // 1 = straight back (toward the camera)
        float rF = rbw * 1.24 * (1.0 + 0.1 * saturate(cosB));    // his footprint radius in this direction
        float e = distB - rF;                                     // > 0 = water outside the fur
        float angB = acos(cosB);
        float flankK = RBW_SS(0.42, 0.7, angB) * (1.0 - RBW_SS(1.75, 2.2, angB));
        float cc = RBW_Cells(dB * 8.0 + float2(0.0, time * 1.3));
        float cc2 = RBW_Cells(dB * 17.0 + float2(3.1, time * 2.1));
        float bubbly = saturate(1.0 - cc * 1.15) * 0.65 + saturate(1.0 - cc2 * 1.2) * 0.35;
        // contact shade behind him (strongest at the fur, soft wedge edges)
        // (water4 2026-11-24) the approved water under his fur is a soft see-into-the-water deep AZURE (#03'59'B0 at y
        // 1192-1222 -> #018CE7 at y 1222-1252, measured), not a black-navy patch: shade toward the deep cyan of the
        // palette, start it under the fur (no bright glossy line between fur and shade), gone ~0.35 u out (was 0.75)
        float latK = 1.0 - smoothstep(0.2 + 0.1 * max(e, 0.0), 0.46 + 0.15 * max(e, 0.0), abs(dlB));
        float shadeK = latK * smoothstep(-0.1, 0.35, cosB) * smoothstep(-0.4, -0.25, e)
                     * (1.0 - smoothstep(0.02, max(0.6 + _W4Tune.y, 0.05), e));
        // his body blocks the reflected glare there too (no glossy arcs / flares inside the shadow)
        col = lerp(col, min(col, float3(0.1, 0.45, 0.85)), saturate(shadeK * wk * 1.5));
        col = lerp(col, RBW_CDEEP * float3(0.6, 0.85, 1.05), saturate(shadeK * (1.05 + _W4Tune.x) * wk));
        // broken bubbly rim hugging the waterline on his flanks only
        float rim = smoothstep(-0.08, -0.01, e) * (1.0 - smoothstep(0.04, 0.13, e)) * flankK;
        float foamW = rim * smoothstep(0.3, 0.65, bubbly + rim * 0.15);
        // soft bright contact glow on the flanks
        float glow = smoothstep(-0.12, 0.0, e) * exp(-max(e, 0.0) * 14.0) * flankK;
        // wet sheen where the fans pour onto the water: beside him round to his back flank (25..90 deg from straight back)
        float fanZ = RBW_SS(0.4, 0.65, angB) * (1.0 - RBW_SS(1.4, 1.65, angB)) * smoothstep(0.0, 0.06, e)
                   * (1.0 - smoothstep(0.08, 0.5, e));
        float wakeF = saturate(foamW) * wk;
        float3 foamCol = lerp(float3(0.78, 0.86, 1.0), float3(1.25, 1.28, 1.32), saturate(bubbly * 1.2));
        col = lerp(col, lerp(col, RBW_CAQUAW, 0.6), fanZ * wk * 0.35);
        col += float3(0.25, 0.5, 0.55) * glow * wk * 0.4;
        col = lerp(col, foamCol, wakeF);
        wakeK = max(max(wakeF, shadeK * 0.8 * wk), max(fanZ * 0.45, glow * 0.5) * wk);
    }
    // landing splash: an expanding broken ring of fine bubbly foam (starts at his footprint, not under the fur).
    // (splash round 2026-11-23) no filled disc any more: its coarse cells tiled the whole water behind him with a pale
    // honeycomb for a second after every landing
    [branch] if (Splash.w > 0.001 && Splash.z < 1.2)
    {
        float age = Splash.z;
        float2 dS = float2(lat - Splash.x, s - Splash.y);
        float dr = length(dS);
        float ringR = rbw * 1.25 + age * 2.2;
        float ringW = 0.1 + age * 0.18;
        float ring = 1.0 - smoothstep(0.0, ringW, abs(dr - ringR));
        float cr = RBW_Cells(dS * 14.0 + age * 3.0);
        float fade = 1.0 - age / 1.2;
        float burst = saturate(ring * RBW_SS(0.7, 0.25, cr)) * fade * fade * saturate(Splash.w);
        col = lerp(col, float3(1.2, 1.25, 1.3), burst);
        wakeK = max(wakeK, burst);
    }

    Color = col;
    ReflDir = R5;
    ReflTint = lerp(RBW_CAQUA, RBW_PLIGHT, pk5);
    ReflWeight = (0.06 + 0.94 * pow(max(fr, 1e-4), 5.0)) * (1.0 - saturate(foamK + wakeK));
}

void RainbowRiver_half(half3 PositionWS, half3 NormalWS, half3 ViewDirWS,
                       half4 Stream, half4 E, half4 F, half4 Benny, half4 Splash, half4 Params, half3 LightDirWS,
                       out half3 Color, out half3 ReflDir, out half3 ReflTint, out half ReflWeight)
{
    float3 c, rd, rt;
    float rw;
    RainbowRiver_float((float3)PositionWS, (float3)NormalWS, (float3)ViewDirWS, (float4)Stream, (float4)E, (float4)F, (float4)Benny,
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
