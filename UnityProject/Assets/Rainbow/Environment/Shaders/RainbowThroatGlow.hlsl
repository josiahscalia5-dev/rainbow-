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
// Light round 2026-11-23: the approved vanishing point (measured on references/05_flow_into_the_current.png straight up
// from (492,488)) is a SMALL white-yellow core (r < 10 px), pale yellow to r 17, gold (255,190,110) to r 27, then orange
// (255,139,73) melting into the last rings - no white starburst, no pink rim. The old HDR core (3.0) + bloom drew a white
// sun ~3x too big and the pink rim (229,112,85) read as a pink disc. Values are linear, pre-solved for the scene grade
// (post exposure 0.86, saturation +36): core blooms only a little (bloom threshold 1.2).
void RainbowThroatGlow_float(float2 UV, float Time, out float3 Color)
{
    const float3 CORE = float3(1.75, 1.6, 1.25);
    const float3 PALE = float3(1.08, 0.88, 0.5);        // display ~(252,225,150)
    const float3 GOLD = float3(1.0, 0.56, 0.27);        // display ~(252,175,90)
    const float3 WARM = float3(0.97, 0.43, 0.17);       // display ~(250,150,75)
    const float3 RIM  = float3(0.9, 0.32, 0.12);        // display ~(245,128,65) orange, no pink
    float r = length(UV) * _ThroatParams.w;
    float3 c = lerp(RIM, WARM, 1.0 - smoothstep(0.7, 0.92, r));
    c = lerp(c, GOLD, 1.0 - smoothstep(0.46, 0.66, r));
    c = lerp(c, PALE, 1.0 - smoothstep(0.26, 0.46, r));
    c = lerp(c, CORE, 1.0 - smoothstep(0.08, 0.26, r));
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
