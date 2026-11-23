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
    g.y += _SlotPitch.z;
    g.x += frac(floor(g.y) * 0.5) * 2.0 * _SlotPitch.w;          // optional stagger of every other row
    float2 f = (frac(g) - 0.5) * pitch;                          // metres from the cell centre
    float2 hs = _SlotSize.xy;
    float rr = min(hs.x, hs.y);
    float2 q = abs(f) - hs + rr;
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - rr; // capsule SDF in metres (< 0 inside)
    float aa = fwidth(d) * 1.2 + 1e-4;
    float hole = 1.0 - smoothstep(-aa, aa, d);
    float cpx = length(fwidth(g));                               // slot cells per pixel
    hole = lerp(hole, _SlotSize.z, smoothstep(0.3, 0.85, cpx));  // sub-pixel: settle to the mean coverage
    float lipFade = (1.0 - hole) * (1.0 - smoothstep(0.2, 0.6, cpx));
    float lipDark = (1.0 - smoothstep(0.0, 0.045, d)) * lipFade;                       // bevel shade round the slot
    float lipLight = exp(-RbSq((d - 0.012) / 0.012)) * (0.6 + 0.4 * step(0.0, f.y)) * lipFade; // lit lip

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
    base *= 1.0 - 0.35 * lipDark;
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
    float3 env = RainbowSamplePano(reflect(-V, N), _EnvBlur + rough * 7.0) * _EnvIntensity;
    env += RainbowTubeStripRadiance(V, N, rough) * (1.0 - 0.5 * sheet);
    float3 spec = env * F * (1.0 - 0.9 * hole);

    float3 emission = _EmissionColor.rgb * _EmissionStrength * sol * (1.0 - mt * 0.5);
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
