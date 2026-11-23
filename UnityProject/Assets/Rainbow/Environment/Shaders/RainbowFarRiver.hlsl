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

// Lateral (+X) offset of the far cyan core: straight where Agent 3's river ends (RiverPath.Meander = 0 beyond 72 u),
// then a gentle swing right and back left into the vanishing point (far05.ts FAR05_CORE: right swing, back left).
float RainbowFarRiverCoreX(float s)
{
    return 2.2 * smoothstep(125.0, 175.0, s) * (1.0 - smoothstep(185.0, 245.0, s)) - 0.8 * smoothstep(215.0, 250.0, s);
}

// RiverUV = (lateral x metres from the tunnel line, s metres along the tunnel).
void RainbowFarRiver_float(float3 PositionWS, float3 NormalWS, float3 ViewDirWS, float2 RiverUV, float Time, out float3 Color)
{
    float x = RiverUV.x;
    float s = RiverUV.y;
    float hw = _RiverParams.x;
    float dx = x - RainbowFarRiverCoreX(s);
    float bandOff = hw * _RiverParams.z;
    float bw = hw * _RiverParams.w;
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
    c += RainbowSamplePano(reflect(-V, N), _EnvBlur) * _EnvIntensity * fres * (1.0 - foam);
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
