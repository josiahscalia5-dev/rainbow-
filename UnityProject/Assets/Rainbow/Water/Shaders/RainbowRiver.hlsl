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
float4 _S6Arc;    // (splash6) live deltas (0 in the game): x broad-band mix, y band half width (periods), z satin gain
float4 _R7Floor;  // (coordinator round 7) live deltas of the purple floor beyond the foam rope (0 = builder look): x base lift, y slot lightening, z near-rope lightening, w pink shift
float4 _R5Arc;    // (river5) live deltas: x arc period, y arc glow gain, z arc line gain, w arc phase (m)
float4 _R5Sw;     // (river5) live deltas: x wake sweep lighten, y every pink band lighten
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

// ---- round 8: silk texture + measured colour ramp (WaterTextureFactory.cs) ----
TEXTURE2D(_SilkTex); SAMPLER(sampler_SilkTex);
TEXTURE2D(_RiverRamp); SAMPLER(sampler_RiverRamp);
TEXTURE2D(_RiverSheen); SAMPLER(sampler_RiverSheen);
TEXTURE2D(_WakeSheen); SAMPLER(sampler_WakeSheen);
#ifndef RBW_HAS_LOOK
#define _SilkLook float4(0.3, 0.25, 0.35, 0.3)
#define _GlintLook float4(0.75, 0.9, 0.0, 0.0)
#define _SheenLook float4(0.85, 0.75, 0.5, 1.0)
#endif

// p = (X across in m, v along the flow in m); tile 13.2 x 26 m at 9 m view distance, doubling with it (cross-faded octaves)
float4 RBW_Silk(float2 p, float dist, float2 offs)
{
    float l = clamp(log2(dist / 9.0), -1.0, 4.0);
    float k0 = min(floor(l), 3.0);
    float f = smoothstep(0.15, 0.85, l - k0);
    float2 dx = ddx(p), dy = ddy(p);
    float2 ka = float2(exp2(-k0) / 13.2, exp2(-1.25 * k0) / 26.0), kb = ka * float2(0.5, 0.4204);
    float4 a = SAMPLE_TEXTURE2D_GRAD(_SilkTex, sampler_SilkTex, p * ka + offs + k0 * float2(0.37, 0.61), dx * ka, dy * ka);
    float4 b = SAMPLE_TEXTURE2D_GRAD(_SilkTex, sampler_SilkTex, p * kb + offs + (k0 + 1.0) * float2(0.37, 0.61), dx * kb, dy * kb);
    return lerp(a, b, f);
}

// scene-linear water colour at streamline coordinate q and silk value t (a brightness quantile), zone 0 near .. 1 mid / far
float3 RBW_RampY(float q, float row, float zone)
{
    float y = clamp(row, 0.5 / 16.0, 15.5 / 16.0) * 0.5;
    float u = clamp((q + 3.0) / 6.0, 0.006, 0.994);
    float3 a = SAMPLE_TEXTURE2D_LOD(_RiverRamp, sampler_RiverRamp, float2(u, y), 0).rgb;
    float3 b = SAMPLE_TEXTURE2D_LOD(_RiverRamp, sampler_RiverRamp, float2(u, y + 0.5), 0).rgb;
    return lerp(a, b, zone);
}

float3 RBW_Ramp(float q, float t, float zone)
{
    return RBW_RampY(q, 1.0 - sqrt(saturate(1.0 - t)), zone);
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
    X += 0.12 * sin(v5 * 0.21 + X * 1.1) + 0.05 * sin(v5 * 0.53 - X * 2.3 + time * 0.7);

    // ---- flowing silk (round 8, master direction 2026-11-24): tileable streak / glint / ripple texture stretched along the current,
    // advected with it; the octave is chosen by the view distance (cross-faded), so the streaks stay fine and crisp at every distance ----
    float distV = max(length(_WorldSpaceCameraPos - PositionWS), 1.0);
    float4 sk = RBW_Silk(float2(X, v5), distV, float2(0.0, 0.0));
    float4 sk2 = RBW_Silk(float2(X * 1.37 + 3.1, v5 * 1.21 - time * 1.3), distV, float2(0.31, 0.17));   // second layer, other speed: ripples cross
    float2 rip = (sk.ba - 0.5) * 1.15 + (sk2.ba - 0.5) * 0.85;                                          // ripple slope (across, along)
    float sheen = RBW_VNoise(float2(X * 0.42 + 3.1, v5 * 0.045 + 0.03 * time)) - 0.5;                     // slow changes of reflection intensity
    float T = sk.r + (sk2.r - 0.5) * 0.16 + sheen * 0.16 - _GlintLook.z;
    T = saturate(T + dot(rip, float2(0.05, 0.1)));
    float glint = sk.g;

    // ---- diagonal pink wake sweeps behind Benny ----
    float cW = 0.21 + _R5Tune.x + 0.5 * back;
    float wW = (0.16 + _R5Tune.y + 0.06 * back) * smoothstep(0.8, 1.3, back) * wk * (1.0 - smoothstep(2.15, 2.7, back));
    float tW5 = (abs(dlW) - cW) / max(wW, 1e-3);   // -1 inner edge .. 0 middle .. +1 outer edge
    float wakeZ = bOn * wk * smoothstep(0.75, 1.2, back) * (1.0 - smoothstep(3.2, 4.2, back));
    float inW = wakeZ * (1.0 - smoothstep(-0.12, 0.08, abs(dlW) - (cW - wW)));                           // his smooth wake water

    // streaky, smoothly blending band edges: the silk itself pushes the colour boundary to and fro
    float qe = q + (T - 0.5) * _SilkLook.x + sheen * _SilkLook.y;
    float zone = smoothstep(9.0, 14.5, distV);

    // broad sheen (large soft reflections; they stay with the view distance while the ripples run through them) + streak detail
    float row = 1.0 - sqrt(saturate(1.0 - T));
    float bt = time - 1.5;
    float2 shv = float2((q + 3.0) / 6.0, log2(distV / 3.5) / 5.5) + float2(0.012 * sin(bt * 0.62 + q * 1.7), 0.01 * sin(bt * 0.47 + distV * 0.2));
    float broad = SAMPLE_TEXTURE2D_LOD(_RiverSheen, sampler_RiverSheen, shv, 0).r;
    broad = clamp(broad, 0.1, 0.5);
    float Y = lerp(0.333, broad, _SheenLook.x) + (row - 0.333) * _SheenLook.y;

    // Benny's wake: the standing wake in his frame (broad luminous arcs bowed over his track, two pink sweeps), streaks run through it
    float bk = back + 0.02 * sin(bt * 2.2 + dlW * 4.0 - back * 1.5) + 0.012 * sin(bt * 3.7 + back * 5.0);
    float2 wuv = float2((dlW + 0.012 * sin(bt * 2.9 + back * 6.0) + 2.2) / 4.4, (bk - 0.2) / 3.6);
    float3 wm = SAMPLE_TEXTURE2D_LOD(_WakeSheen, sampler_WakeSheen, wuv, 0).rgb;
    float wakeA = bOn * wk * smoothstep(0.8, 1.2, back) * (1.0 - smoothstep(3.2, 3.7, back)) * (1.0 - smoothstep(1.75, 2.1, abs(dlW))) * saturate(wm.b * 1.4);
    // the two pink sweeps: soft, streaky, feathered into violet and blue (no hard fins)
    float gk = saturate(wm.g * (0.5 + 0.95 * T));
    float qw = lerp(0.15, 1.5, smoothstep(0.12, 0.8, gk));
    qe = lerp(qe, qw + (T - 0.5) * 0.3, wakeA);
    float arcP = frac((bk - 0.8 * dlW * dlW - 1.42) / 0.52 + 0.5) - 0.5;
    float arcN = smoothstep(0.1, 0.5, RBW_VNoise(float2(dlW * 3.1 + 9.0, floor((bk - 0.8 * dlW * dlW - 1.42) / 0.52 + 0.5) * 3.7)));
    float arcLine = exp(-arcP * arcP * 160.0) * (0.25 + 0.75 * arcN) * smoothstep(1.2, 1.55, bk) * (1.0 - wm.g);
    float Yw = lerp(0.3 + (min(wm.r, 0.62) - 0.3) * 1.15, 0.28, 3.2 * gk * (1.0 - gk) * 0.6) + (row - 0.333) * _SheenLook.z + arcLine * 0.22;
    Y = lerp(Y, Yw, wakeA);

    float3 c5 = RBW_RampY(qe, Y, zone);
    c5 = max(c5 - _GlintLook.w, 0.0);                  // the bloom veil of the bright scene would grey the deep saturated colours

    // ---- surface: ripples catch the light (emboss), slivers of light burn a little, gloss from the swell normal ----
    float3 N0 = normalize(NormalWS);
    float3 V = normalize(ViewDirWS);
    float3 N5 = normalize(N0 + float3(rip.x * _SilkLook.z, 0.0, rip.y * _SilkLook.z));
    float emboss = dot(rip, float2(0.35, 1.0));
    c5 *= 1.0 + emboss * _SilkLook.w;
    float tw = 0.72 + 0.28 * sin(time * 3.3 + X * 5.0 + v5 * 1.7);
    float gl = saturate((glint - 0.34) * 1.7) * tw * (1.0 - 0.5 * wakeA);
    c5 = lerp(c5, float3(1.0, 1.03, 1.05), gl * _GlintLook.x);
    c5 *= 1.0 + gl * gl * _GlintLook.y;
    float pk5 = smoothstep(0.95, 1.35, abs(qe)) * (1.0 - smoothstep(2.1, 2.6, abs(qe)));   // pink weight (tints the reflections)
    float fr = 1.0 - saturate(dot(N5, V));
    float3 R5 = reflect(-V, N5);

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
            float3 pfA = float3(0.3, 0.06, 0.5) + _R7Floor.x * float3(0.25, 0.06, 0.18) + _R7Floor.w * float3(0.2, 0.04, 0.0);
            float3 pfB = float3(0.68, 0.2, 0.8) + _R7Floor.w * float3(0.15, 0.03, 0.0);
            float3 pf = lerp(pfA, pfB, saturate(sheen * 0.8 + 0.12 * ox));
            pf = lerp(pf, float3(0.04, 0.008, 0.1), slot * saturate(0.85 - _R7Floor.y));
            pf *= lerp(saturate(0.55 + _R7Floor.z), 1.0, smoothstep(0.0, 0.6, ox));
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
                     * (1.0 - smoothstep(0.02, max(0.35 + _W4Tune.y, 0.05), e));   // (splash6 t4: 0.6 -> 0.35, approved y 1230-1270 is bright)
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
