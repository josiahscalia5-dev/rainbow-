// Rainbow Screen 05 - purple washer-drum tunnel wall (Agent 2, environment).
// Shader Graph Custom Function (File mode, name "RainbowDrumWall"): RainbowDrumWall_float / RainbowDrumWall_half.
// Also #included by RainbowDrumWall.shader (hand-written URP shader that renders immediately).
//
// Port of src/world/materials.ts perforatedMetal(wall05) + withTubeStrips(strips05) + withFarGlow(glowT05) and the
// pink floor sheet of environment.ts pinkFlowMaterial. Slots are procedural, measured in METRES on the wall:
// WallUV.x = arc length round the tube (0 at 12 o'clock, + toward the rider's right), WallUV.y = s along the tunnel.
// So the grid never stretches along the tube; anti-aliased with fwidth and settling to the mean slot coverage once a
// slot cell becomes sub-pixel (no shimmer / moire down the tunnel).
//
// Expected properties (declared by the including shader / Shader Graph blackboard, same reference names):
//   everything listed in RainbowEnvCommon.hlsl, plus
//   float4 _BaseColor;      metal F0 (lavender '#dc9ef0' -> reflections of the magenta pano read violet-magenta)
//   float4 _HoleColor;      slot interior ('#0c0014')
//   float4 _EmissionColor;  float _EmissionStrength;     ('#3c0848' x 0.16)
//   float  _Metallic, _Roughness;                        (0.92, 0.07)
//   float4 _SlotPitch;      (arc pitch m, tube pitch m, row offset in cells, stagger 0..0.5)
//   float4 _SlotSize;       (half length along the arc m, half width along the tube m, mean hole coverage, lip glow)
//   float4 _RimColor;       slot lip highlight colour
//   float4 _FloorSheet;     (sheet top world y, blend height m, flow speed m/s, strength 0..1)
//   float4 _FloorColorA, _FloorColorB;                   pink flow sheet colours ('#c81f9c', '#ff4fc0')
//   float  _Exposure;
//   float4 _WallFar;        (fade start m, fade end m, strip light kept far away, panorama reflection kept far away)
//   float4 _SlotWarp;       (s0 m, row pitch at s0 m, pitch growth per m, hole half length along the tube / local pitch);
//                           y <= 0 = plain metric rows of _SlotPitch.y
//   float4 _WallGlow;       land glow (rgb colour, a strength)
//   float4 _SlotArc;        (holes round the drum, ceiling density boost a (cells per radian ~ 1 + a cos phi), hole half
//                           length along the arc / local arc pitch, wall radius m); x <= 0 = plain metric _SlotPitch.x
//   float4 _SlotShape;      (hole half width / row pitch at the waterline (the ceiling uses _SlotWarp.w), lit lip width in
//                           pixels, brushed line strength, brushed lines per metre along the tube)
#ifndef RAINBOW_DRUM_WALL_INCLUDED
#define RAINBOW_DRUM_WALL_INCLUDED

#include "RainbowEnvCommon.hlsl"

// Inputs: world position, world normal (pointing into the tunnel), direction surface -> camera, WallUV (metres),
// time (s), ambient light (e.g. SampleSH(N) or Shader Graph "Baked GI"/ambient). Outputs: Color = full image-based
// result (env reflection + strips + glow + emissive; add direct lights on top), plus Albedo/Metallic/Smoothness/
// Emission for a Lit master.
void RainbowDrumWall_float(float3 PositionWS, float3 NormalWS, float3 ViewDirWS, float2 WallUV, float Time, float3 Ambient,
    out float3 Color, out float3 Albedo, out float Metallic, out float Smoothness, out float3 Emission)
{
    float3 N = normalize(NormalWS);
    float3 V = normalize(ViewDirWS);
    float dist = length(_WorldSpaceCameraPos.xyz - PositionWS);

    // ---- slot grid (metres) ----
    float2 pitch = max(_SlotPitch.xy, float2(1e-3, 1e-3));
    float2 g = WallUV / pitch;
    float2 hs = _SlotSize.xy;
    // Tunnel round 2026-11-23: the approved wall shows NEAT CONCENTRIC ROWS of dark oval holes whose row pitch grows with
    // the depth like a forced perspective (measured on references/05_flow_into_the_current.png with the gameplay camera:
    // ~1.5 m on the near left wall, ~2.4 m between rings A / B, ~3.4 m between rings B / C, 6-9 rows per ring bay), 44
    // holes round the drum in brick rows. _SlotWarp = (s0, pitch at s0 m, pitch growth per m, hole half length along the
    // tube as a fraction of the local pitch): pitch(s) = p0 + k (s - s0), row coordinate = integral of ds / pitch(s).
    // World-fixed (s0 is a constant), so the pattern never slides while Benny swims, steers or jumps.
    float localPitch = pitch.y;
    float arcPitch = pitch.x;
    float lower = 0.0;
    // Tunnel round 3 (2026-11-23): the approved holes are SMALL and DENSE over the ceiling and the upper walls (short dark
    // dashes, ~20 px, in tight rows) and big fat ovals only on the lower side walls next to the foam. The arc coordinate
    // is warped round the drum (cells per radian ~ 1 + a cos phi: dense on top, coarse toward the waterline); it still
    // closes exactly round the tube (sin is periodic), so the rows stay neat concentric rings.
    if (_SlotArc.x > 0.0)
    {
        float Rw = max(_SlotArc.w, 0.1);
        float phi = WallUV.x / Rw;                                    // 0 = top, + = rider's right, +-pi = bottom
        float a = _SlotArc.y;
        g.x = _SlotArc.x / RB_TWO_PI * (phi + a * sin(phi));
        arcPitch = Rw * RB_TWO_PI / (_SlotArc.x * max(1.0 + a * cos(phi), 0.2));
        hs.x = _SlotArc.z * arcPitch;
        lower = saturate(-cos(phi) * 1.5);                            // 0 on the upper half ... 1 at the waterline
    }
    if (_SlotWarp.y > 0.0)
    {
        float ds = WallUV.y - _SlotWarp.x;
        float p0 = _SlotWarp.y;
        float k = max(_SlotWarp.z, 1e-4);
        float dsp = max(ds, 0.0);
        g.y = ds >= 0.0 ? log(1.0 + k * dsp / p0) / k : ds / p0;
        localPitch = p0 + k * dsp;
        float wl = _SlotShape.x > 0.0 ? _SlotShape.x : _SlotWarp.w;
        hs.y = lerp(_SlotWarp.w, wl, lower) * localPitch;            // fatter ovals on the lower side walls
    }
    g.y += _SlotPitch.z;
    g.x += frac(floor(g.y) * 0.5) * 2.0 * _SlotPitch.w;          // optional stagger of every other row
    float2 f = (frac(g) - 0.5) * float2(arcPitch, localPitch);  // metres from the cell centre
    float rr = min(hs.x, hs.y);
    float2 q = abs(f) - hs + rr;
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - rr; // capsule SDF in metres (< 0 inside)
    float fwd = fwidth(d) + 1e-5;                                // metres per pixel on the wall
    float aa = fwd * 1.2 + 1e-4;
    float hole = 1.0 - smoothstep(-aa, aa, d);
    float cpx = length(fwidth(g));                               // slot cells per pixel
    float holeMean = _SlotSize.z;
    hole = lerp(hole, holeMean, smoothstep(0.3, 0.85, cpx));     // sub-pixel: settle to the mean coverage
    float lipFade = (1.0 - hole) * (1.0 - smoothstep(0.2, 0.6, cpx));
    // the lit lip is a fixed number of PIXELS wide (approved: a crisp pink-white rim round every hole, brightest on the
    // side away from the camera); the old 1.2 cm lip was sub-pixel beyond ~10 m and never showed
    float lw = max(0.012, fwd * max(_SlotShape.y, 0.5));
    float lipDark = (1.0 - smoothstep(0.0, lw * 2.5, d)) * lipFade;                     // bevel shade round the slot
    float lipLight = exp(-RbSq((d - lw) / lw)) * (0.45 + 0.55 * step(0.0, f.y)) * lipFade; // lit lip
    // brushed / lathe-turned metal: fine concentric lines of slightly different brightness (approved: the lands read as
    // polished metal with fine streaks running round the drum), faded out once a line gets thinner than ~1.5 px
    float bx = WallUV.y * _SlotShape.w;
    float bi = floor(bx);
    float bh0 = frac(sin(bi * 12.9898) * 43758.5453);
    float bh1 = frac(sin((bi + 1.0) * 12.9898) * 43758.5453);
    float bn = lerp(bh0, bh1, smoothstep(0.0, 1.0, frac(bx))) - 0.5;
    float brushed = 1.0 + 2.0 * _SlotShape.z * bn * (1.0 - smoothstep(0.35, 0.8, fwidth(bx)));

    // ---- below the water line: glossy magenta flow sheet lining the tube floor (pink banks) ----
    float sheet = (1.0 - smoothstep(_FloorSheet.x - _FloorSheet.y, _FloorSheet.x, PositionWS.y)) * _FloorSheet.w;
    hole *= 1.0 - sheet;
    lipDark *= 1.0 - sheet;
    lipLight *= 1.0 - sheet;
    float sol = 1.0 - hole;

    float flowZ = PositionWS.z - Time * _FloorSheet.z;
    float sx = PositionWS.x;
    float3 sheetCol = lerp(_FloorColorA.rgb, _FloorColorB.rgb, 0.5 + 0.5 * sin(sx * 1.3 + flowZ * 0.15));
    float st1 = pow(saturate(0.5 + 0.5 * sin(sx * 7.0 + 2.0 * sin(flowZ * 0.45) + flowZ * 0.05)), 16.0);
    float st2 = pow(saturate(0.5 + 0.5 * sin(sx * 4.3 - flowZ * 0.21 + 1.7 * sin(flowZ * 0.3))), 22.0);
    sheetCol += float3(1.0, 0.75, 0.94) * st1 * 0.5 + float3(0.47, 0.9, 1.0) * st2 * 0.35;

    // ---- metal colour: violet mid-tunnel tint, warm far glow (materials.ts FAR_GLOW_APPLY) ----
    float3 base = _BaseColor.rgb;
    float mt = RainbowMidTintK(dist) * sol;
    base = lerp(base, _MidTint.rgb, mt);
    float fg = RainbowFarGlowK(dist);
    base = lerp(base, _FarGlowColor.rgb, min(1.0, fg * 0.5) * sol);
    base *= 1.0 - 0.5 * lipDark;
    float metal = _Metallic;
    float rough = _Roughness;
    base = lerp(base, _HoleColor.rgb, hole);
    metal *= 1.0 - hole;
    rough = lerp(rough, 0.9, hole);
    base = lerp(base, sheetCol, sheet);
    metal = lerp(metal, 0.2, sheet);
    rough = lerp(rough, 0.12, sheet);

    // ---- image-based lighting: Marble 05 pano + analytic strip lights ----
    float3 diffuse = base * (1.0 - metal);
    float3 F0 = lerp(float3(0.04, 0.04, 0.04), base, metal);
    float ndv = saturate(dot(N, V));
    float3 F = F0 + (max((1.0 - rough).xxx, F0) - F0) * pow(1.0 - ndv, 5.0);
    // Light round 2026-11-23: deeper in the tunnel the lengthwise strip reflections converged into long white radial
    // spokes round the throat (approved: the far walls are violet with dark slot rows, the spokes only faint), so the
    // strips and the panorama reflection are faded with view distance (_WallFar: start m, end m, strips kept, env kept).
    float farK = smoothstep(_WallFar.x, _WallFar.y, dist);
    float3 env = RainbowSamplePano(reflect(-V, N), _EnvBlur + rough * 7.0) * _EnvIntensity * lerp(1.0, _WallFar.w, farK);
    env += RainbowTubeStripRadiance(V, N, rough) * (1.0 - 0.5 * sheet) * lerp(1.0, _WallFar.z, farK);
    float3 spec = env * F * (1.0 - 0.9 * hole) * lerp(1.0, brushed, sol * (1.0 - sheet));

    float3 emission = _EmissionColor.rgb * _EmissionStrength * sol * (1.0 - mt * 0.5);
    // light round: with the far reflection dimmed the deep walls went dark plum (~(120,39,100)); the approved deep walls
    // are bright violet (~(150,50,200)): the violet mid tint also glows there (_MidRange.w = strength, deep walls only)
    emission += _MidTint.rgb * mt * _MidRange.w * farK * sol;
    // tunnel round: the approved metal between the holes is bright magenta-pink (~(200-230, 60-75, 180-205), only the
    // holes dark: 16-25 % of the wall below L 80; Unity's dark violet lands were 60-78 %): a magenta land glow that fades
    // into the violet mid tint with the depth (_WallGlow rgb = colour, a = strength)
    // tunnel round 3: the land glow is now deep VIOLET (the approved metal is violet-purple with pink-white reflections,
    // not hot magenta) and follows the brushed lines
    emission += _WallGlow.rgb * _WallGlow.a * sol * (1.0 - sheet) * (1.0 - 0.45 * farK) * lerp(1.0, brushed, 0.6);
    emission += _FarGlowColor.rgb * fg * lerp(0.35, 1.0, sol);
    emission += _RimColor.rgb * lipLight * _SlotSize.w;
    emission += sheetCol * 0.35 * sheet;

    Color = (diffuse * Ambient + spec + emission) * _Exposure;
    Albedo = base;
    Metallic = metal;
    Smoothness = 1.0 - rough;
    Emission = emission * _Exposure;
}

void RainbowDrumWall_half(half3 PositionWS, half3 NormalWS, half3 ViewDirWS, half2 WallUV, half Time, half3 Ambient,
    out half3 Color, out half3 Albedo, out half Metallic, out half Smoothness, out half3 Emission)
{
    float3 c, a, e;
    float m, s;
    RainbowDrumWall_float((float3)PositionWS, (float3)NormalWS, (float3)ViewDirWS, (float2)WallUV, (float)Time, (float3)Ambient, c, a, m, s, e);
    Color = (half3)c;
    Albedo = (half3)a;
    Metallic = (half)m;
    Smoothness = (half)s;
    Emission = (half3)e;
}

#endif // RAINBOW_DRUM_WALL_INCLUDED
