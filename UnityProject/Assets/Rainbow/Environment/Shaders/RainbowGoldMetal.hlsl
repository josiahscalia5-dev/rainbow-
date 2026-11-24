// Rainbow Screen 05 - polished gold / copper (Agent 2, environment): ring bands, wall paddles, near frame.
// Shader Graph Custom Functions (File mode):
//   RainbowGoldRing_float / _half     ring bands  (needs Object-space position + world tube axis)
//   RainbowGoldPaddle_float / _half   paddles     (needs Vertex Color: rgb = region colour (linear), a = polish)
//   RainbowGoldFrame_float / _half    near frame  (needs UV0 + piece id from UV1.x)
//   RainbowGoldMetal_float / _half    dispatcher by the material float _GoldMode (0 ring, 1 paddle, 2 frame)
// Also #included by RainbowGoldMetal.shader (keywords _GOLD_RING / _GOLD_PADDLE / _GOLD_FRAME).
//
// Ports (src/world/materials.ts): withBandShading (stylised ring cross-section with marquee spots, palette solved
// against the approved image), withFarGlow (rings melt into the warm throat), nearFrameMaterial (frame palette).
// The paddle look follows the 4x study in src/vfx/proj05Tunnel.ts (trayLidGeometry: thick polished gold rim, lavender
// floor, thin bright lip) with the lid palette of withLidShading.
//
// Expected properties (including shader / Shader Graph blackboard): everything in RainbowEnvCommon.hlsl, plus
//   float  _GoldMode;
//   float4 _BandG;   ring profile in metres along the ring axis: (main band centre z, main half width, lip centre z, lip half width)
//   float4 _BandS;   marquee spots (spots per turn, half width as fraction of the pitch, strength, -)
//   float4 _BandF;   (view distance where rings start fading to rose-copper, distance where fully faded, -, -)
//   float4 _PaddleParams;  (env highlight strength, strip streak strength, contour darkness, -)
//   float4 _FrameParams;   (moving glint strength, glint frequency, -, -)
//   float4 _GoldTone;      ring band tone curve (exponents r, g, b, amount 0..1)
//   float4 _RingLook;      polished ring metal (key highlight, highlight sharpness, reflection, cavity darkness);
//                          x <= 0 = the old stylised band palette (RainbowBandShade)
//   float4 _RingLook2;     tunnel round 4 copper rings (crest strength, bulb halo, brightness, palette 0 old / 1 copper)
//   float4 _FrameLook;     tunnel round 4 near frame (palette 0 old / 1 copper bands, glare strength, vignette comp, -)
//   float  _Exposure;
#ifndef RAINBOW_GOLD_METAL_INCLUDED
#define RAINBOW_GOLD_METAL_INCLUDED

#include "RainbowEnvCommon.hlsl"

// linear radiance palette (materials.ts lin3 values; comment = target display sRGB of the approved image)
static const float3 BC_DARK   = float3(0.2934, 0.0886, 0.1533); // (150,35,85)
static const float3 BC_ROSE   = float3(0.5899, 0.2114, 0.2222); // (215,95,100)
static const float3 BC_ORANGE = float3(0.7352, 0.2871, 0.1269); // (240,120,40)
static const float3 BC_CROWN  = float3(0.6246, 0.2200, 0.1990); // (222,98,88)
static const float3 BC_PEAK   = float3(0.9077, 0.6020, 0.3465); // (252,190,120)
static const float3 BC_HALO   = float3(0.9439, 0.6846, 0.2725); // (255,205,90)
static const float3 BC_GROOVE = float3(0.5618, 0.1695, 0.1159); // (214,79,44)
static const float3 BC_SPOT   = float3(1.6, 1.5, 1.3);          // warm white, blooms
static const float3 BC_PALE   = float3(0.9310, 0.6926, 0.3911); // (252,206,130)
static const float3 BC_GOLD   = float3(0.8111, 0.4073, 0.1930); // (246,151,70)
static const float3 BC_LINE   = float3(0.6601, 0.1926, 0.0761); // (234,89,4)
static const float3 BC_LIPS   = float3(0.7599, 0.2745, 0.1948); // (245,115,80)

// withBandShading.bandShade: P = object-space position of the ring (x,y round the ring, z metres along the tube,
// lip on the camera side -z), N/V world space (V = surface -> camera), axisWS = ring axis (object +Z) in world space.
float3 RainbowBandShade(float deep, float3 N, float3 V, float3 P, float3 axisWS, out float topArcOut)
{
    float z = P.z;
    float m = (z - _BandG.x) / _BandG.y;          // main band: -1 camera side ... +1 far side
    float l = (z - _BandG.z) / _BandG.w;          // lip
    float fm = fwidth(m) + 1e-3;
    float fl = fwidth(l) + 1e-3;
    float nv = dot(N, V);
    float ndv = abs(nv);
    float3 ax = normalize(axisWS);
    ax *= sign(dot(ax, -V) + 1e-4);               // tube axis pointing away from the camera
    float nzv = dot(N * sign(nv + 1e-4), ax);     // -1 = flank facing the camera ... 0 = crown
    float phi = atan2(P.y, P.x);
    float topArc = (1.0 - smoothstep(0.52, 0.96, abs(phi - 1.5707963))) * (1.0 - deep);
    topArcOut = topArc;
    float3 body = lerp(lerp(BC_GOLD, BC_PALE, smoothstep(0.42, 0.62, ndv)), BC_CROWN, topArc);
    body = lerp(body, lerp(BC_ORANGE, BC_GOLD, 0.5), deep * 0.55);
    float3 c = lerp(BC_DARK, lerp(BC_LIPS, BC_ROSE, topArc), smoothstep(0.03, 0.12, ndv));
    c = lerp(c, BC_ORANGE, smoothstep(0.13, 0.22, ndv));
    c = lerp(c, body, smoothstep(0.26, 0.4, ndv));
    // light round: a broader, stronger pale crown highlight on the ring sides too (approved: rounded polished bands with
    // a bright warm line along every ring; was 0.07 wide and 35 % away from the top arc)
    float hl = exp(-RbSq((nzv + 0.8) / 0.09)) * smoothstep(0.3, 0.5, ndv);
    c = lerp(c, BC_PEAK, hl * (0.95 - 0.6 * deep) * (0.6 + 0.4 * topArc));
    c = lerp(c, lerp(BC_LINE, BC_GROOVE, topArc), exp(-RbSq((m + 0.84) / 0.07)) * 0.9);
    c = lerp(c, BC_DARK, smoothstep(0.9, 1.0, abs(m)) * 0.85);
    float3 cl = lerp(BC_DARK, lerp(BC_LIPS, lerp(BC_ROSE, BC_CROWN, 0.55), topArc), smoothstep(0.05, 0.3, ndv));
    cl = lerp(cl, BC_PEAK, exp(-RbSq((l + 0.3) / 0.22)) * 0.55 * smoothstep(0.3, 0.6, ndv));
    cl = lerp(cl, BC_DARK, smoothstep(0.86, 1.0, abs(l)) * 0.85);
    float inMain = smoothstep(-1.0 - fm, -1.0 + fm, m);
    float inLip = 1.0 - smoothstep(1.0 - fl, 1.0 + fl, l);
    float3 col = lerp(BC_GROOVE, cl, inLip);
    col = lerp(col, c, inMain);
    // marquee spots at fixed azimuths (12 o'clock = a spot): radial lines of spots into the vanishing point
    float t = (phi - 1.5707963) * _BandS.x / RB_TWO_PI;
    float ft = min(fwidth(t), fwidth(frac(t + 0.5)));
    float d = frac(t + 0.5) - 0.5;
    float sw = _BandS.y + ft * 0.7;
    float hw = _BandS.y * 2.2 + ft * 0.7;          // light round: tighter yellow halo (was 3x: broad pale patches)
    float sp = exp(-d * d / (sw * sw)) * lerp(1.0, _BandS.y / sw, 0.6);
    float halo = exp(-d * d / (hw * hw));
    // light round: the spot is a round bulb on the band's crown (approved: small warm dots), not a bar across the whole
    // band width (on the ring sides, seen edge-on, the bar became a 40 px clipped-white slab)
    float crown = exp(-RbSq(m / 0.5));
    float across = inMain * smoothstep(0.25, 0.5, ndv) * (1.0 - smoothstep(0.93, 0.99, abs(m))) * crown
                 + inLip * (1.0 - inMain) * 0.25 * smoothstep(0.2, 0.4, ndv);
    col = lerp(col, BC_HALO, halo * across * 0.65);
    col += BC_SPOT * sp * across * _BandS.z * (1.0 - 0.4 * deep);
    return col;
}

// materials.ts withBandShading `tone` (screen 05 test G1, measured on the approved image: ring gold mean (231,125,85),
// G/R 0.48, while the plain palette gave pale peach G/R 0.64): per-channel exponents deepen the mid-tones toward
// saturated orange-gold, highlights above 1 stay bright. _GoldTone = (exponents r, g, b, amount 0..1).
float3 RainbowGoldToneCurve(float3 c)
{
    float3 toned = pow(saturate(c), max(_GoldTone.xyz, 0.01)) + max(c - 1.0, 0.0);
    return lerp(c, toned, _GoldTone.w);
}

float3 RainbowApplyFarGlow(float3 c, float dist)
{
    float fg = RainbowFarGlowK(dist);
    return lerp(c, _FarGlowColor.rgb * 0.9, min(1.0, fg * 0.55)) + _FarGlowColor.rgb * fg * 0.25;
}

// Tunnel round 3 (2026-11-23): REALISTIC polished copper-gold for the ring bands. The approved rings are chunky bundles of
// rounded strands: a saturated orange-gold body that darkens to deep red-brown in the grooves and toward grazing angles,
// ONE crisp warm-white specular line along every strand, the purple walls / gold rings reflected in the metal, and small
// warm marquee bulbs on the main strand. The mesh (DrumMeshes05.BuildRing) carries per-vertex strand data:
// vertex colour r = cavity (1 crest .. 0.25 groove), g = crest (1 on the strand top), b = strand (0 main, 0.5 middle,
// 1 lip). _RingLook = (key highlight strength, highlight sharpness, reflection strength, cavity darkness).
// Tunnel round 4 (2026-11-24) copper palette, linear and PRE-SOLVED for the scene grade (post exposure 0.86, contrast
// +15, saturation +36, no tone mapping) so the display matches the approved rings measured on
// references/05_flow_into_the_current.png (comment = display sRGB): ring A crown (252,145,95) with rose edges
// (190,80,100), ring sides orange (248,120,40) with a broad yellow-orange line (254,200,92). The round-3 look reached
// the display as pale cream (254,250,210): broad white highlights + reflections clipped every channel.
static const float3 RM_SIDE_EDGE = float3(0.487, 0.144, 0.087);   // (200,85,40)
static const float3 RM_SIDE_BODY = float3(0.748, 0.256, 0.130);   // (248,120,40)
static const float3 RM_SIDE_HI   = float3(0.845, 0.590, 0.274);   // (254,200,92)
static const float3 RM_TOP_EDGE  = float3(0.442, 0.132, 0.168);   // (190,80,100)
static const float3 RM_TOP_BODY  = float3(0.645, 0.219, 0.155);   // (230,110,75)
static const float3 RM_TOP_CREST = float3(0.787, 0.344, 0.224);   // (252,145,95)
static const float3 RM_SPEC      = float3(1.15, 0.92, 0.66);      // (255,225,175), blooms a little

float3 RainbowRingCopper(float deep, float3 N, float3 V, float3 P, float4 vc, out float topArcOut)
{
    float nv = dot(N, V);
    float3 Nf = N * sign(nv + 1e-4);
    float ndv = saturate(abs(nv));
    float cav = vc.r;
    float crest = vc.g;
    float mainStrand = 1.0 - smoothstep(0.2, 0.3, vc.b);
    float phi = atan2(P.y, P.x);
    float topArc = (1.0 - smoothstep(0.52, 0.96, abs(phi - 1.5707963))) * (1.0 - deep);
    topArcOut = topArc;
    float3 inward = -normalize(float3(P.x, P.y, 0.0) + 1e-5);

    float3 edgeC = lerp(RM_SIDE_EDGE, RM_TOP_EDGE, topArc);
    float3 bodyC = lerp(RM_SIDE_BODY, RM_TOP_BODY, topArc);
    float3 hiC = lerp(RM_SIDE_HI, RM_TOP_CREST, topArc);
    // rounded strand: warm dark edges toward the silhouettes, saturated copper body facing the camera, a broad crest
    float3 c = lerp(edgeC, bodyC, smoothstep(0.06, 0.5, ndv));
    c = lerp(c, hiC, saturate(pow(saturate(crest), 0.6) * smoothstep(0.3, 0.75, ndv) * _RingLook2.x));
    c *= lerp(1.0 - _RingLook.w, 1.0, cav);
    // faint reflection of the violet walls and strip lights in the metal
    float3 R = reflect(-V, Nf);
    float3 env = RainbowSamplePano(R, _EnvBlur);
    c = lerp(c, c * 0.7 + env * float3(0.85, 0.5, 0.5) * 0.45, saturate(_RingLook.z * _EnvIntensity) * cav);
    c += RainbowTubeStripRadiance(V, Nf, 0.05) * float3(1.0, 0.62, 0.32) * 0.15 * cav;
    // key light just above / behind the camera: ONE narrow warm-white line along every strand
    float3 L = normalize(V + inward * 0.35);
    float3 H = normalize(L + V);
    float sp = pow(saturate(dot(Nf, H)), _RingLook.y);
    c += RM_SPEC * sp * _RingLook.x * cav * (1.0 - 0.5 * deep);
    c *= _RingLook2.z;
    // marquee bulbs on the main strand crest (12 o'clock = a bulb): small warm-white dots with a golden halo
    float t = (phi - 1.5707963) * _BandS.x / RB_TWO_PI;
    float ft = min(fwidth(t), fwidth(frac(t + 0.5)));
    float d = frac(t + 0.5) - 0.5;
    float sw = _BandS.y + ft * 0.7;
    float hw = _BandS.y * 2.6 + ft * 0.7;
    float spot = exp(-d * d / (sw * sw)) * lerp(1.0, _BandS.y / sw, 0.6);
    float halo = exp(-d * d / (hw * hw));
    float across = mainStrand * smoothstep(0.35, 0.85, crest) * smoothstep(0.2, 0.45, ndv);
    c = lerp(c, RM_SIDE_HI * 1.1, halo * across * _RingLook2.y);
    c += float3(1.5, 1.3, 1.0) * spot * across * _BandS.z;
    return c;
}

float3 RainbowRingMetal(float deep, float3 N, float3 V, float3 P, float3 axisWS, float4 vc, out float topArcOut)
{
    if (_RingLook2.w > 0.5) return RainbowRingCopper(deep, N, V, P, vc, topArcOut);
    float nv = dot(N, V);
    float3 Nf = N * sign(nv + 1e-4);
    float ndv = saturate(abs(nv));
    float cav = vc.r;
    float crest = vc.g;
    float mainStrand = 1.0 - smoothstep(0.2, 0.3, vc.b);
    float phi = atan2(P.y, P.x);
    float topArc = (1.0 - smoothstep(0.52, 0.96, abs(phi - 1.5707963))) * (1.0 - deep);
    topArcOut = topArc;
    float3 inward = -normalize(float3(P.x, P.y, 0.0) + 1e-5);   // rings are placed unrotated: object = world directions

    // body: saturated orange-gold facing the camera, red-brown toward the silhouettes, rose-salmon over the top arc
    float3 edge = float3(0.30, 0.055, 0.03);
    float3 body = lerp(lerp(BC_ORANGE, BC_GOLD, 0.45), BC_CROWN, topArc * 0.55);
    body = lerp(body, lerp(BC_ORANGE, BC_GOLD, 0.6), deep * 0.5);
    float3 c = lerp(edge, BC_GROOVE, smoothstep(0.02, 0.22, ndv));
    c = lerp(c, body, smoothstep(0.18, 0.6, ndv));
    c *= lerp(1.0 - _RingLook.w, 1.0, cav);

    // mirror reflection of the tunnel (purple walls, gold rings) tinted by the gold
    float3 R = reflect(-V, Nf);
    float3 env = RainbowSamplePano(R, _EnvBlur);
    float envL = dot(env, float3(0.3, 0.55, 0.15));
    float3 F0 = float3(1.0, 0.62, 0.30);
    c = lerp(c, c * 0.55 + env * F0 * 0.9, _RingLook.z * _EnvIntensity * (0.55 + 0.45 * cav));
    c += F0 * smoothstep(0.45, 1.0, envL) * 0.35 * _RingLook.z * cav;
    c += RainbowTubeStripRadiance(V, Nf, 0.05) * F0 * 0.45 * cav;

    // key highlight: a soft light just above / behind the camera -> one crisp warm-white line along every strand
    float3 L = normalize(V + inward * 0.35);
    float3 H = normalize(L + V);
    float sp = pow(saturate(dot(Nf, H)), _RingLook.y);
    float spWide = pow(saturate(dot(Nf, H)), _RingLook.y * 0.15);
    c += BC_PEAK * spWide * 0.35 * _RingLook.x * cav;
    c += float3(1.25, 1.05, 0.75) * sp * _RingLook.x * cav * (1.0 - 0.5 * deep);

    // marquee bulbs on the main strand crest (12 o'clock = a bulb): radial lines of spots into the vanishing point
    float t = (phi - 1.5707963) * _BandS.x / RB_TWO_PI;
    float ft = min(fwidth(t), fwidth(frac(t + 0.5)));
    float d = frac(t + 0.5) - 0.5;
    float sw = _BandS.y + ft * 0.7;
    float hw = _BandS.y * 2.2 + ft * 0.7;
    float spot = exp(-d * d / (sw * sw)) * lerp(1.0, _BandS.y / sw, 0.6);
    float halo = exp(-d * d / (hw * hw));
    float across = mainStrand * smoothstep(0.35, 0.85, crest) * smoothstep(0.2, 0.45, ndv);
    c = lerp(c, BC_HALO, halo * across * 0.5);
    c += BC_SPOT * spot * across * _BandS.z;
    return c;
}

void RainbowGoldRing_float(float3 PositionWS, float3 NormalWS, float3 ViewDirWS, float3 PositionOS, float3 AxisWS, float4 VertexColor, out float3 Color)
{
    float3 N = normalize(NormalWS);
    float3 V = normalize(ViewDirWS);
    float dist = length(_WorldSpaceCameraPos.xyz - PositionWS);
    float deep = smoothstep(_BandF.x, _BandF.y, dist);
    float topArc;
    float3 raw;
    if (_RingLook.x > 0.0)
    {
        raw = RainbowRingMetal(deep, N, V, PositionOS, AxisWS, VertexColor, topArc);
    }
    else
    {
        raw = RainbowBandShade(deep, N, V, PositionOS, AxisWS, topArc);
    }
    // tunnel round 2026-11-23: the approved ring crowns over the top are ROSE-SALMON (~(213, 92, 96) at ring A, measured
    // straight up from the vanishing point) and only the sides orange-gold (~(250, 150, 75)); the tone curve turned the
    // crown palette (222, 98, 88) deep red (190, 40, 30) in the scene grade, so the top arc keeps its plain palette
    float3 bc = lerp(RainbowGoldToneCurve(raw), raw, topArc);
    Color = RainbowApplyFarGlow(bc, dist) * _Exposure;
}

// Paddle (tray lid): region colour from the mesh (vertex colour rgb, linear), polish in alpha.
void RainbowGoldPaddle_float(float3 PositionWS, float3 NormalWS, float3 ViewDirWS, float4 VertexColor, out float3 Color)
{
    float3 V = normalize(ViewDirWS);
    float3 N = normalize(NormalWS);
    float nv = dot(N, V);
    N *= sign(nv + 1e-4);                         // shade the side that faces the camera
    float ndv = abs(nv);
    float dist = length(_WorldSpaceCameraPos.xyz - PositionWS);
    float3 base = VertexColor.rgb;
    float polish = VertexColor.a;
    float3 col = lerp(BC_DARK, base, lerp(1.0, smoothstep(0.03, 0.35, ndv), _PaddleParams.z)); // rose-dark contour
    col *= lerp(0.88, 1.08, smoothstep(0.35, 0.9, ndv));
    float3 env = RainbowSamplePano(reflect(-V, N), _EnvBlur + 1.0) * _EnvIntensity;
    float envL = dot(env, float3(0.3, 0.55, 0.15));
    float3 tint = lerp(base, float3(1.0, 0.86, 0.6), 0.45);
    col += tint * smoothstep(0.3, 1.0, envL) * polish * _PaddleParams.x;                        // reflected ring lights
    col += RainbowTubeStripRadiance(V, N, 0.15) * polish * _PaddleParams.y * lerp(base, float3(1.0, 1.0, 1.0), 0.5); // streaks
    // tunnel round 3: polished rim -> one crisp warm-white highlight line along the rounded rim and a broad soft sheen
    // (approved trays: thick rounded copper-gold rim with a bright line, the dish face a smooth rose-copper mirror)
    float3 L = normalize(V + float3(0.0, 0.5, 0.0));
    float3 H = normalize(L + V);
    float nh = saturate(dot(N, H));
    col += float3(1.25, 1.05, 0.75) * pow(nh, 60.0) * _PaddleParams.w * polish;
    col += BC_PEAK * pow(nh, 8.0) * 0.25 * _PaddleParams.w * polish;
    Color = RainbowApplyFarGlow(RainbowGoldToneCurve(col), dist) * _Exposure;
}

// Near frame (materials.ts nearFrameMaterial.frameShade). UV.x along the arc, UV.y across the band (0 = edge toward the
// stream); Piece 0 = bottom corner, 1 = bottom lip. A soft glint slides along the arcs with the camera's travel (+Z).
// Tunnel round 4 (2026-11-24): the approved bottom corners are COPPER-ORANGE bevelled brackets, not yellow: measured
// straight across the band (display sRGB, v = fraction of the 190 px band from the edge toward the stream): pale lip
// (235,240,225) at the edge, copper (235,120,50) to 0.13, dark groove (175,50,0) at 0.15, copper (222,102,37) brightening
// to (250,145,45) by 0.37, a yellow line (250,215,90) at 0.41, dark orange (190,62,5) 0.44-0.53, a groove at 0.555, a
// broad white-gold glare (253,250,190) 0.57-0.74 (strongest two thirds along the arc), then orange (252,140,47) fading
// to rust (168,67,35) at the outer edge. Linear values pre-solved for the scene grade (no tone curve), x _FrameLook.z
// against the vignette in the corners. Side: -1 left corner, +1 right corner (UV1.y), 0 unknown.
float3 RainbowFrameCorner(float u, float v, float side)
{
    const float3 LIP    = float3(0.82, 0.85, 0.74);
    const float3 COPA   = float3(0.677, 0.250, 0.132);   // (235,120,50)
    const float3 GROOVE = float3(0.311, 0.065, 0.041);   // (160,48,10)
    const float3 COPB   = float3(0.588, 0.187, 0.104);   // (220,100,40)
    const float3 COPHI  = float3(0.772, 0.323, 0.150);   // (250,140,45)
    const float3 HILINE = float3(0.837, 0.664, 0.287);   // (250,215,90)
    const float3 ODARK  = float3(0.434, 0.096, 0.056);   // (190,62,5)
    const float3 GLARE  = float3(1.04, 1.02, 0.71);      // (253,250,190)+
    const float3 RUST   = float3(0.346, 0.097, 0.063);   // (168,67,35)
    float3 c = lerp(COPA, COPB, smoothstep(0.12, 0.2, v));
    c = lerp(c, COPHI, smoothstep(0.22, 0.38, v));
    c = lerp(c, ODARK, smoothstep(0.42, 0.45, v));
    c = lerp(c, COPHI, smoothstep(0.72, 0.78, v));
    c = lerp(c, RUST, smoothstep(0.8, 1.0, v));
    c = lerp(c, GROOVE, exp(-RbSq((v - 0.15) / 0.018)));
    c = lerp(c, GROOVE * 1.3, exp(-RbSq((v - 0.555) / 0.012)));
    c = lerp(c, HILINE, exp(-RbSq((v - 0.41) / 0.02)));
    // view-locked glare: left corner around two thirds of the arc, right corner a little nearer the edge
    float gu = side > 0.0 ? 0.6 : 0.7;
    float glare = exp(-RbSq((v - 0.65) / 0.075)) * lerp(0.35, 1.0, exp(-RbSq((u - gu) / 0.22)));
    c = lerp(c, GLARE, saturate(glare * _FrameLook.y));
    c = lerp(c, LIP, 1.0 - smoothstep(0.004, 0.016, v));
    c = lerp(c, RUST * 0.8, smoothstep(0.97, 0.995, u));            // dark cut face at the arc end
    return c * _FrameLook.z;
}

void RainbowGoldFrame_float(float3 NormalWS, float3 ViewDirWS, float2 UV, float Piece, out float3 Color)
{
    float ndv = abs(dot(normalize(NormalWS), normalize(ViewDirWS)));
    float u = UV.x;
    float v = UV.y;
    float3 c;
    if (Piece < 0.5)
    {
        c = float3(0.7669, 0.3044, 0.1155);                                                         // (245,125,30)
        c = lerp(c, float3(0.9079, 0.6239, 0.2219), 1.0 - smoothstep(0.3, 0.42, v));                // (252,195,72)
        c = lerp(c, float3(0.8461, 0.4509, 0.0961), exp(-RbSq((v - 0.16) / 0.025)));               // thin orange line
        c = lerp(c, float3(1.2, 1.12, 0.98), 1.0 - smoothstep(0.025, 0.06, v));                     // thin white inner bevel (light round: was 0.07-0.13, a 35 px cream band)
        c = lerp(c, float3(1.0, 0.82, 0.5), exp(-RbSq((v - 0.62) / 0.035)) * 0.7);                 // pale striation
        c = lerp(c, float3(0.4522, 0.1464, 0.0954), smoothstep(0.93, 1.0, v));                      // outer contour
        c = lerp(c, float3(0.32, 0.09, 0.07), smoothstep(0.965, 0.995, u));                         // dark cut face
    }
    else
    {
        c = float3(0.5533, 0.2056, 0.2503);                                                         // (207,93,113) rose
        c = lerp(c, float3(0.4522, 0.1464, 0.0954), 1.0 - smoothstep(0.6, 0.68, v));                // dark amber
        c = lerp(c, float3(0.6941, 0.2626, 0.1093), 1.0 - smoothstep(0.5, 0.57, v));                // orange
        c = lerp(c, float3(0.8453, 0.3825, 0.2436), 1.0 - smoothstep(0.42, 0.48, v));               // salmon
        c = lerp(c, float3(0.6052, 0.1934, 0.0783), 1.0 - smoothstep(0.09, 0.13, v));               // dark orange line
        c = lerp(c, float3(1.0514, 0.9607, 0.8204), 1.0 - smoothstep(0.02, 0.05, v));               // pale top edge
        float sp = exp(-RbSq((u - 0.36) / 0.022)) + exp(-RbSq((u - 0.64) / 0.022));
        c += float3(1.3, 1.2, 1.0) * sp * smoothstep(0.1, 0.16, v) * (1.0 - smoothstep(0.36, 0.44, v));
    }
    float travel = _WorldSpaceCameraPos.z * _FrameParams.y;
    float gl = frac(u * 2.0 - travel) - 0.5;
    c += BC_SPOT * exp(-gl * gl / 0.0025) * _FrameParams.x * smoothstep(0.05, 0.2, v) * (1.0 - smoothstep(0.6, 0.85, v));
    Color = RainbowGoldToneCurve(c) * lerp(0.78, 1.0, ndv) * _Exposure;
}

// Hand-written shader entry: Side = UV1.y of the frame meshes (-1 left corner, +1 right corner, 0 bottom lip).
void RainbowGoldFrameSide(float3 NormalWS, float3 ViewDirWS, float2 UV, float Piece, float Side, out float3 Color)
{
    if (_FrameLook.x > 0.5 && Piece < 0.5)
    {
        Color = RainbowFrameCorner(UV.x, UV.y, Side) * _Exposure;
        return;
    }
    RainbowGoldFrame_float(NormalWS, ViewDirWS, UV, Piece, Color);
}

void RainbowGoldMetal_float(float3 PositionWS, float3 NormalWS, float3 ViewDirWS, float3 PositionOS, float3 AxisWS,
    float4 VertexColor, float4 UV, out float3 Color)
{
    float3 ring, paddle, frame;
    RainbowGoldRing_float(PositionWS, NormalWS, ViewDirWS, PositionOS, AxisWS, VertexColor, ring);
    RainbowGoldPaddle_float(PositionWS, NormalWS, ViewDirWS, VertexColor, paddle);
    RainbowGoldFrame_float(NormalWS, ViewDirWS, UV.xy, UV.z, frame);
    Color = _GoldMode < 0.5 ? ring : (_GoldMode < 1.5 ? paddle : frame);
}

// ---- half variants (Shader Graph half precision) ----
void RainbowGoldRing_half(half3 PositionWS, half3 NormalWS, half3 ViewDirWS, half3 PositionOS, half3 AxisWS, half4 VertexColor, out half3 Color)
{
    float3 c;
    RainbowGoldRing_float((float3)PositionWS, (float3)NormalWS, (float3)ViewDirWS, (float3)PositionOS, (float3)AxisWS, (float4)VertexColor, c);
    Color = (half3)c;
}

void RainbowGoldPaddle_half(half3 PositionWS, half3 NormalWS, half3 ViewDirWS, half4 VertexColor, out half3 Color)
{
    float3 c;
    RainbowGoldPaddle_float((float3)PositionWS, (float3)NormalWS, (float3)ViewDirWS, (float4)VertexColor, c);
    Color = (half3)c;
}

void RainbowGoldFrame_half(half3 NormalWS, half3 ViewDirWS, half2 UV, half Piece, out half3 Color)
{
    float3 c;
    RainbowGoldFrame_float((float3)NormalWS, (float3)ViewDirWS, (float2)UV, (float)Piece, c);
    Color = (half3)c;
}

void RainbowGoldMetal_half(half3 PositionWS, half3 NormalWS, half3 ViewDirWS, half3 PositionOS, half3 AxisWS,
    half4 VertexColor, half4 UV, out half3 Color)
{
    float3 c;
    RainbowGoldMetal_float((float3)PositionWS, (float3)NormalWS, (float3)ViewDirWS, (float3)PositionOS, (float3)AxisWS,
        (float4)VertexColor, (float4)UV, c);
    Color = (half3)c;
}

#endif // RAINBOW_GOLD_METAL_INCLUDED
