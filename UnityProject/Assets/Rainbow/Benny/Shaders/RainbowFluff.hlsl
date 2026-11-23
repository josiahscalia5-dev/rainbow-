// Rainbow Screen 05 - Benny plush / velvet shading (Shader Graph Custom Function file + used by RainbowFluff.shader).
// Benny's texture (benny31 bake.png) holds the APPROVED Benny's linear radiance / 4 (benny31.ts: unlit map x K = 4 shows the
// approved pixels after tone mapping + grade). So the base is baked radiance x BakeGain; on top of it:
//   * a gentle wrap-lit modulation (LightInfluence) so he reacts to the scene's key light / ambient while steering and rolling,
//   * a soft fresnel "fuzz" rim (fur seen edge-on scatters light: the plush silhouette glow),
//   * low-contrast fur-clump noise in object space (stays glued to him, no screen-space shimmer).
// Shader Graph: Custom Function node, File mode, name "RainbowFluff" (precision float or half).
#ifndef RAINBOW_FLUFF_INCLUDED
#define RAINBOW_FLUFF_INCLUDED

float RainbowFluff_Hash(float3 p)
{
    p = frac(p * 0.3183099 + 0.1);
    p *= 17.0;
    return frac(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float RainbowFluff_ValueNoise(float3 x)
{
    float3 i = floor(x);
    float3 f = frac(x);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = RainbowFluff_Hash(i + float3(0, 0, 0));
    float n100 = RainbowFluff_Hash(i + float3(1, 0, 0));
    float n010 = RainbowFluff_Hash(i + float3(0, 1, 0));
    float n110 = RainbowFluff_Hash(i + float3(1, 1, 0));
    float n001 = RainbowFluff_Hash(i + float3(0, 0, 1));
    float n101 = RainbowFluff_Hash(i + float3(1, 0, 1));
    float n011 = RainbowFluff_Hash(i + float3(0, 1, 1));
    float n111 = RainbowFluff_Hash(i + float3(1, 1, 1));
    float nx00 = lerp(n000, n100, f.x);
    float nx10 = lerp(n010, n110, f.x);
    float nx01 = lerp(n001, n101, f.x);
    float nx11 = lerp(n011, n111, f.x);
    return lerp(lerp(nx00, nx10, f.y), lerp(nx01, nx11, f.y), f.z);
}

void RainbowFluff_float(float3 BaseColor, float BakeGain, float3 NormalWS, float3 ViewDirWS, float3 LightDirWS,
    float3 LightColor, float LightAtten, float3 Ambient, float LightInfluence, float Wrap,
    float3 FuzzColor, float FuzzPower, float FuzzStrength, float3 NoisePos, float NoiseStrength,
    out float3 Color)
{
    float3 N = normalize(NormalWS);
    float3 V = normalize(ViewDirWS);
    float3 L = normalize(LightDirWS);
    float3 baked = BaseColor * BakeGain;

    // wrap diffuse, normalised by the total light so the approved baked brightness stays the average
    float wrapD = saturate((dot(N, L) + Wrap) / (1.0 + Wrap));
    const float3 lum = float3(0.2126, 0.7152, 0.0722);
    float lumL = dot(LightColor, lum);
    float lumA = dot(Ambient, lum);
    float3 light = LightColor * (wrapD * LightAtten) + Ambient;
    float3 rel = light / max(1e-3, lumL + lumA);
    float3 shade = lerp(float3(1.0, 1.0, 1.0), 0.6 + 0.6 * rel, saturate(LightInfluence));

    // fur clumps
    float n = RainbowFluff_ValueNoise(NoisePos) * 0.6 + RainbowFluff_ValueNoise(NoisePos * 2.7) * 0.4;
    float fur = 1.0 + (n - 0.5) * 2.0 * NoiseStrength;

    // soft fuzz rim
    float rim = pow(1.0 - saturate(dot(N, V)), max(0.5, FuzzPower)) * FuzzStrength;
    float3 fuzz = FuzzColor * rim * (0.55 + 0.45 * saturate(dot(rel, lum)));

    Color = baked * shade * fur + fuzz;
}

void RainbowFluff_half(half3 BaseColor, half BakeGain, half3 NormalWS, half3 ViewDirWS, half3 LightDirWS,
    half3 LightColor, half LightAtten, half3 Ambient, half LightInfluence, half Wrap,
    half3 FuzzColor, half FuzzPower, half FuzzStrength, half3 NoisePos, half NoiseStrength,
    out half3 Color)
{
    float3 c;
    RainbowFluff_float((float3)BaseColor, (float)BakeGain, (float3)NormalWS, (float3)ViewDirWS, (float3)LightDirWS,
        (float3)LightColor, (float)LightAtten, (float3)Ambient, (float)LightInfluence, (float)Wrap,
        (float3)FuzzColor, (float)FuzzPower, (float)FuzzStrength, (float3)NoisePos, (float)NoiseStrength, c);
    Color = (half3)c;
}

#endif // RAINBOW_FLUFF_INCLUDED
