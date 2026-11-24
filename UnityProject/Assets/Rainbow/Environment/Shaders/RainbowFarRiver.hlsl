// Rainbow Screen 05 - far river inside the throat (Agent 2, environment; port of src/world/far05.ts + farRiverMaterial).
// The playable river (Agent 3) ends at RiverPath.TunnelLength (120 u). Beyond it the real tunnel runs on to the far
// throat (DrumLayout05.ThroatS), so this cheap unlit chord continues the river into the vanishing point: cyan core,
// hot-pink satin bands, white foam lips at the walls, flowing glints, warming into the throat glow with distance.
// Shader Graph Custom Function (File mode, name "RainbowFarRiver"): RainbowFarRiver_float / _half.
//
// Expected properties: everything in RainbowEnvCommon.hlsl, plus
//   float4 _RiverCore, _RiverBand, _RiverFoam;   linear colours (RIVER05_PAL of src/vfx/waterRibbon.ts)
//   float4 _RiverParams;                          (half width m, flow speed m/s, band offset (fraction of hw), band half width (fraction))
//   float  _Exposure;
#ifndef RAINBOW_FAR_RIVER_INCLUDED
#define RAINBOW_FAR_RIVER_INCLUDED

#include "RainbowEnvCommon.hlsl"

// Lateral (+X) offset of the far band pair / cyan core.
// (water4 2026-11-24) continues the playable river's far S: RiverPath.FarSwing bends the course right beyond the stage
// (stream centre +1.0 m at s 108+, so the river's band pair sits at ~+1.7 m where it ends at s 120); the approved river
// keeps bending right just before the throat and then runs back toward the middle into the vanishing point.
float RainbowFarRiverCoreX(float s)
{
    return 1.7 + 0.3 * smoothstep(120.0, 170.0, s) - 1.6 * smoothstep(210.0, 400.0, s);
}

// RiverUV = (lateral x metres from the tunnel line, s metres along the tunnel).
void RainbowFarRiver_float(float3 PositionWS, float3 NormalWS, float3 ViewDirWS, float2 RiverUV, float Time, out float3 Color)
{
    float x = RiverUV.x;
    float s = RiverUV.y;
    float hw = _RiverParams.x;
    float dx = x - RainbowFarRiverCoreX(s);
    // (water4 2026-11-24) the band pair a little closer and broader, so both bands stay clear of the foam lips with the
    // core bent right (approved: two clear pink bands either side of the coins right up to the throat)
    float bandOff = hw * _RiverParams.z * 0.75;
    float bw = hw * _RiverParams.w * 1.2;
    float fw = fwidth(x) + 1e-3;
    float dL = abs(dx + bandOff);
    float dR = abs(dx - bandOff);
    float bands = max(1.0 - smoothstep(bw - fw, bw + fw, dL), 1.0 - smoothstep(bw - fw, bw + fw, dR));
    float soft = exp(-RbSq(dL / (bw * 1.6))) + exp(-RbSq(dR / (bw * 1.6)));
    float3 c = lerp(_RiverCore.rgb, _RiverBand.rgb, saturate(bands * 0.85 + soft * 0.25));

    float foam = smoothstep(-0.1, 0.35, abs(x) - (hw - 0.7));
    float flowS = s - Time * _RiverParams.y;
    float gl = pow(saturate(0.5 + 0.5 * sin(dx * 5.0 + 1.5 * sin(flowS * 0.35))), 14.0)
             * pow(saturate(0.5 + 0.5 * sin(flowS * 0.9 + dx * 2.0)), 4.0);
    c += float3(1.0, 1.0, 1.0) * gl * 0.6 * (1.0 - foam);

    float3 V = normalize(ViewDirWS);
    float3 N = normalize(NormalWS);
    float ndv = saturate(dot(N, V));
    float fres = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);
    // (water4 2026-11-24) x0.35: at this grazing angle the full Fresnel mirror washed the far river out to a pale strip
    // (approved: saturated cyan and pink right up to the throat glow)
    c += RainbowSamplePano(reflect(-V, N), _EnvBlur) * _EnvIntensity * fres * (1.0 - foam) * 0.35;
    c = lerp(c, _RiverFoam.rgb, foam);

    float dist = length(_WorldSpaceCameraPos.xyz - PositionWS);
    float fg = RainbowFarGlowK(dist);
    c = lerp(c, _FarGlowColor.rgb, min(0.85, fg * 0.5)) + _FarGlowColor.rgb * fg * 0.3;
    Color = c * _Exposure;
}

void RainbowFarRiver_half(half3 PositionWS, half3 NormalWS, half3 ViewDirWS, half2 RiverUV, half Time, out half3 Color)
{
    float3 c;
    RainbowFarRiver_float((float3)PositionWS, (float3)NormalWS, (float3)ViewDirWS, (float2)RiverUV, (float)Time, c);
    Color = (half3)c;
}

#endif // RAINBOW_FAR_RIVER_INCLUDED
