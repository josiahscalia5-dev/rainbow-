// Rainbow Screen 05 - pearly soap-foam puffs along the river banks (Agent 3). Shader Graph Custom Function file:
//   RainbowFoamVertex_float / _half : breathing + slow wobble of each puff about its own centre (world space)
//   RainbowFoam_float / _half       : soap colour (port of src/vfx/foam.ts SOAP05_GLSL soap05()/soapT() + berm/puff
//                                     shading: white bubble tops, periwinkle bodies, blue-violet crevices, pores,
//                                     soap-film iridescent rim, soft spec)
// Per-vertex data from FoamBank.cs: UV0 = (seed, ambient occlusion), UV1 = (puff centre xyz, radius).
#ifndef RAINBOW_FOAM_INCLUDED
#define RAINBOW_FOAM_INCLUDED

#include "Assets/Rainbow/Water/Shaders/RainbowWaterCommon.hlsl"

static const float3 RBW_SOAP_CREV = float3(0.23, 0.22, 0.66);

float3 RBW_Soap05(float t)
{
    t = saturate(t) * 5.0;
    float3 c = lerp(RBW_SOAP_CREV, float3(0.26, 0.38, 0.84), saturate(t));
    c = lerp(c, float3(0.38, 0.54, 0.97), saturate(t - 1.0));
    c = lerp(c, float3(0.56, 0.63, 0.96), saturate(t - 2.0));
    c = lerp(c, float3(0.78, 0.79, 0.98), saturate(t - 3.0));
    return lerp(c, float3(1.05, 1.03, 1.08), saturate(t - 4.0));
}

// Nv = VIEW-space normal (x right, y up, z toward the camera - the same convention as three.js)
float RBW_SoapT(float3 Nv)
{
    float3 Lv = normalize(float3(-0.35, 0.8, 0.5));
    float wrap = saturate(dot(Nv, Lv) * 0.55 + 0.5);
    float up = saturate(Nv.y * 0.5 + 0.5);
    return smoothstep(0.1, 0.8, wrap * 0.6 + up * 0.4);
}

// bubble cells on the puff surface: side band uses (azimuth, height) with the seam on the far (+Z) side,
// the cap uses a top projection; both in world units so bubbles keep one size on every puff
float RBW_FoamCells(float3 n, float r, float k, float seed)
{
    float az = atan2(n.x, -n.z);                       // seam faces +Z (away from the riding camera)
    float2 pSide = float2(az * r * 0.9, asin(clamp(n.y, -1.0, 1.0)) * r) * k + seed * 17.3;
    float2 pTop = n.xz * r * k + seed * 9.1 + 31.0;
    float wTop = smoothstep(0.62, 0.86, n.y);
    return lerp(RBW_Cells(pSide), RBW_Cells(pTop), wTop);
}

void RainbowFoamVertex_float(float3 PositionWS, float4 CentreRadius, float Seed, float Time, out float3 OutPositionWS)
{
    float3 c = CentreRadius.xyz;
    float br = 1.0 + 0.035 * sin(Time * 1.7 + Seed * 40.0);     // gentle breathing of the lather (foam.ts)
    float wob = 0.03 * sin(Time * 0.9 + Seed * 17.0);             // slow soft squash
    float3 off = PositionWS - c;
    off.y *= 1.0 + wob;
    off.xz *= 1.0 - wob * 0.5;
    OutPositionWS = c + off * br;
}

void RainbowFoamVertex_half(half3 PositionWS, half4 CentreRadius, half Seed, half Time, out half3 OutPositionWS)
{
    float3 p;
    RainbowFoamVertex_float((float3)PositionWS, (float4)CentreRadius, (float)Seed, (float)Time, p);
    OutPositionWS = (half3)p;
}

void RainbowFoam_float(float3 PositionWS, float4 CentreRadius, float Seed, float AO, float3 ViewDirWS, float3 LightDirWS,
                       out float3 Color)
{
    float pxK = RBW_PxScale();
    float r = max(CentreRadius.w, 0.02);
    float3 n = normalize(PositionWS - CentreRadius.xyz);         // perfectly round shading whatever the tessellation
    float fw = max(fwidth(PositionWS.x), max(fwidth(PositionWS.y), fwidth(PositionWS.z))) * pxK;   // units per ref px
    float k1 = 1.0 - smoothstep(0.12, 0.3, fw * 3.0);           // detail fade (cells per pixel)
    float k2 = 1.0 - smoothstep(0.12, 0.3, fw * 7.0);
    float c1 = lerp(0.45, RBW_FoamCells(n, r, 3.0, Seed), k1);
    float c2 = lerp(0.45, RBW_FoamCells(n, r, 7.0, Seed + 0.37), k2);
    float bub = (1.0 - c1 * c1) * 0.6 + (1.0 - c2 * c2) * 0.4;   // bubble domes, deep crevices
    float3 N = RBW_BumpNormal(PositionWS, n, bub * 0.06);
    float3 V = normalize(ViewDirWS);
    float3 L = normalize(LightDirWS);
    float3 Nv = TransformWorldToViewDir(N, true);
    float t5 = RBW_SoapT(Nv) * 0.55 + 0.45 * lerp(0.55, bub, max(k1, 0.3)) - 0.1;
    t5 -= smoothstep(0.55, 0.95, c1) * 0.45 * k1 + smoothstep(0.62, 0.95, c2) * 0.25 * k2;
    float3 col = RBW_Soap05(t5 + 0.12);
    // tiny pores (open bubbles)
    float2 pp = float2(atan2(n.x, -n.z) * r, n.y * r) * 7.0 + 5.0 + Seed * 3.1;
    float pc = RBW_Cells(pp);
    float kp = 1.0 - smoothstep(0.1, 0.25, fw * 7.0);
    col = lerp(col, RBW_SOAP_CREV, (1.0 - smoothstep(0.1, 0.2, pc)) * step(0.62, RBW_Hash12(floor(pp))) * 0.6 * kp);
    // soft spec + soap-film rim
    float spec = pow(saturate(dot(reflect(-V, N), L)), 28.0);
    float fres = pow(1.0 - saturate(dot(N, V)), 3.0);
    col += float3(1.0, 1.0, 1.0) * spec * 0.3 + RBW_Iridescent(fres * 1.4 + c1 * 0.6) * fres * 0.18;
    // contact shade toward the water line + per-puff occlusion and tint variety
    col *= lerp(0.8, 1.0, saturate(n.y * 0.6 + 0.6)) * lerp(0.78, 1.0, saturate(AO));
    float tint = RBW_Hash12(float2(Seed * 91.7, 3.3)) - 0.5;
    col *= float3(1.0 + 0.03 * tint, 1.0 - 0.02 * abs(tint), 1.0 + 0.02 * tint);
    Color = col;
}

void RainbowFoam_half(half3 PositionWS, half4 CentreRadius, half Seed, half AO, half3 ViewDirWS, half3 LightDirWS,
                      out half3 Color)
{
    float3 c;
    RainbowFoam_float((float3)PositionWS, (float4)CentreRadius, (float)Seed, (float)AO, (float3)ViewDirWS, (float3)LightDirWS, c);
    Color = (half3)c;
}

#endif // RAINBOW_FOAM_INCLUDED
