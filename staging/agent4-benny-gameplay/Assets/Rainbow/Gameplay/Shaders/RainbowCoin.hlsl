// Rainbow Screen 05 - gold $ coin shading (Shader Graph Custom Function file + used by RainbowCoin.shader).
// Port of src/gameplay/coins.ts: the gold is carried mostly by EMISSIVE art (face texture / milled edge, emissive x1.15) so the
// candy environment and tone mapping cannot wash it to pale peach; a dark-gold metal base (#7a5200, metalness 0.7,
// roughness 0.3) keeps a reflective sheen and hot specular glints on top (those feed the bloom).
#ifndef RAINBOW_COIN_INCLUDED
#define RAINBOW_COIN_INCLUDED

// Milled (ridged) rim: alternating bright / dark gold stripes around the edge. U = angle around the coin (0..1).
void RainbowCoinEdge_float(float U, float3 Bright, float3 Dark, float Count, out float3 Color)
{
    float x = frac(U * Count);
    float w = fwidth(U * Count) + 1e-4;
    float stripe = smoothstep(0.5 - w, 0.5 + w, x) * (1.0 - smoothstep(1.0 - w, 1.0, x));
    Color = lerp(Bright, Dark, stripe);
}

void RainbowCoinEdge_half(half U, half3 Bright, half3 Dark, half Count, out half3 Color)
{
    float3 c;
    RainbowCoinEdge_float((float)U, (float3)Bright, (float3)Dark, (float)Count, c);
    Color = (half3)c;
}

void RainbowCoin_float(float3 Art, float3 NormalWS, float3 ViewDirWS, float3 LightDirWS, float3 LightColor,
    float3 Ambient, float3 EnvReflection, float3 MetalColor, float Emission, float SpecPower, float SpecStrength,
    float EnvStrength, out float3 Color)
{
    float3 N = normalize(NormalWS);
    float3 V = normalize(ViewDirWS);
    float3 L = normalize(LightDirWS);
    float3 H = normalize(L + V);
    float ndl = saturate(dot(N, L));
    float spec = pow(saturate(dot(N, H)), max(1.0, SpecPower)) * SpecStrength;
    float fres = pow(1.0 - saturate(dot(N, V)), 4.0);
    float3 metalTint = lerp(MetalColor * 2.2, float3(1.0, 1.0, 1.0), fres * 0.5);
    float3 diffuse = MetalColor * (Ambient + LightColor * ndl) * 0.35;
    float3 env = EnvReflection * metalTint * EnvStrength * (0.6 + 0.4 * fres);
    float3 glint = LightColor * spec * lerp(float3(1.0, 0.85, 0.45), float3(1.0, 1.0, 1.0), 0.5);
    Color = Art * Emission + diffuse + env + glint;
}

void RainbowCoin_half(half3 Art, half3 NormalWS, half3 ViewDirWS, half3 LightDirWS, half3 LightColor,
    half3 Ambient, half3 EnvReflection, half3 MetalColor, half Emission, half SpecPower, half SpecStrength,
    half EnvStrength, out half3 Color)
{
    float3 c;
    RainbowCoin_float((float3)Art, (float3)NormalWS, (float3)ViewDirWS, (float3)LightDirWS, (float3)LightColor,
        (float3)Ambient, (float3)EnvReflection, (float3)MetalColor, (float)Emission, (float)SpecPower,
        (float)SpecStrength, (float)EnvStrength, c);
    Color = (half3)c;
}

#endif // RAINBOW_COIN_INCLUDED
