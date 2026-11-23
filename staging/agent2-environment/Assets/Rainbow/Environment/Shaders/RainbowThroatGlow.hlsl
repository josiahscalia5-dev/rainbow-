// Rainbow Screen 05 - bright warm white-gold far THROAT (Agent 2, environment).
// Shader Graph Custom Function (File mode, name "RainbowThroatGlow"): RainbowThroatGlow_float / _half.
// Also #included by RainbowThroatGlow.shader.
// Port of src/world/materials.ts tunnelEndGlowMaterial (wave 8 palette: white core -> pale yellow -> yellow-orange ->
// orange -> red-orange rim, HDR core so it blooms) on the opaque end cap of the real tunnel, plus soft slow light rays.
//
// Expected properties: float _ThroatIntensity; float4 _ThroatParams (ray strength, ray count, ray speed, radius scale).
#ifndef RAINBOW_THROAT_GLOW_INCLUDED
#define RAINBOW_THROAT_GLOW_INCLUDED

// UV: cap coordinates in tube radii (0 = tunnel axis, 1 = wall). Time in seconds.
void RainbowThroatGlow_float(float2 UV, float Time, out float3 Color)
{
    const float3 CORE = float3(3.0, 2.75, 2.1);
    const float3 PALE = float3(0.95, 0.8, 0.45);        // (250,220,141)
    const float3 GOLD = float3(0.8587, 0.5199, 0.2695); // (248,175,97)
    const float3 WARM = float3(0.7872, 0.3634, 0.2143); // (244,140,83)
    const float3 RIM  = float3(0.6738, 0.2623, 0.2011); // (229,112,85)
    float r = length(UV) * _ThroatParams.w;
    float3 c = lerp(RIM, WARM, 1.0 - smoothstep(0.72, 0.95, r));
    c = lerp(c, GOLD, 1.0 - smoothstep(0.5, 0.72, r));
    c = lerp(c, PALE, 1.0 - smoothstep(0.32, 0.52, r));
    c = lerp(c, CORE, 1.0 - smoothstep(0.14, 0.34, r));
    float ang = atan2(UV.y, UV.x);
    float rays = pow(saturate(0.5 + 0.5 * sin(ang * _ThroatParams.y + 1.3 * sin(ang * 3.0 + Time * _ThroatParams.z))), 6.0);
    c += PALE * rays * _ThroatParams.x * smoothstep(0.15, 0.35, r) * (1.0 - smoothstep(0.55, 0.95, r));
    Color = c * _ThroatIntensity;
}

void RainbowThroatGlow_half(half2 UV, half Time, out half3 Color)
{
    float3 c;
    RainbowThroatGlow_float((float2)UV, (float)Time, c);
    Color = (half3)c;
}

#endif // RAINBOW_THROAT_GLOW_INCLUDED
