// Rainbow Screen 05 - bright warm white-gold far THROAT (Agent 2, environment).
// Shader Graph Custom Function (File mode, name "RainbowThroatGlow"): RainbowThroatGlow_float / _half.
// Also #included by RainbowThroatGlow.shader.
// Port of src/world/materials.ts tunnelEndGlowMaterial (wave 8 palette: white core -> pale yellow -> yellow-orange ->
// orange -> red-orange rim, HDR core so it blooms) on the opaque end cap of the real tunnel, plus soft slow light rays.
//
// Expected properties: float _ThroatIntensity; float4 _ThroatParams (ray strength, ray count, ray speed, radius scale);
// float4 _ThroatRings (painted deep ring 1 radius, ring 2 radius (cap radii), ring half width, glow inside ring 1 0..1);
// x <= 0 = the plain glow disc.
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
    // tunnel round 2026-11-23: the bloomed core read as a white disc r ~10 px (approved: white only to r ~6, pale yellow
    // to ~12, gold to ~18): a softer core blooms less (bloom threshold 1.2)
    const float3 CORE = float3(1.45, 1.36, 1.05);
    const float3 PALE = float3(1.08, 0.88, 0.5);        // display ~(252,225,150)
    const float3 GOLD = float3(1.0, 0.56, 0.27);        // display ~(252,175,90)
    const float3 WARM = float3(0.97, 0.43, 0.17);       // display ~(250,150,75)
    const float3 RIM  = float3(0.9, 0.32, 0.12);        // display ~(245,128,65) orange, no pink
    float r = length(UV) * _ThroatParams.w;
    float ang = atan2(UV.y, UV.x);
    float3 c;
    if (_ThroatRings.x > 0.0)
    {
        // Tunnel round 3 (2026-11-23): the cap (r ~20 px at the approved camera, 1 px ~ 0.052 cap radii) continues the
        // approved DENSE stack of deep rings: two thin gold rings with warm bulbs at r ~9 / ~15 px, dark warm-rose gaps,
        // and only a SMALL white-yellow core (white to ~5 px, pale yellow to ~8 px) instead of one big orange disc.
        // tunnel round 4 (2026-11-24): measured straight up from the approved vanishing point the deep throat glows
        // warm orange BETWEEN its rings too ((237,98,63) .. (248,162,78) at r 13-28 px) and is pale gold-white inside
        // r ~10-13 px ((249,212,120)); the dark warm-rose gaps read as a dark ring round a tiny core. _ThroatLook.x blends
        // the gaps to glowing gold-orange, .y / .z = outer radius of the pale-yellow / white core (cap radii).
        const float3 GAP0 = float3(0.42, 0.1, 0.12);
        float3 GAP = lerp(GAP0, lerp(GOLD, WARM, smoothstep(0.35, 1.0, r)) * 0.9, saturate(_ThroatLook.x));
        float hw = _ThroatRings.z;
        float fw = fwidth(r) + 1e-4;
        c = lerp(GAP, RIM, smoothstep(0.86, 1.0, r) * 0.6);
        float bulbs = pow(saturate(0.5 + 0.5 * cos(ang * 16.0)), 8.0);
        float ring1 = 1.0 - smoothstep(hw - fw, hw + fw, abs(r - _ThroatRings.x));
        float ring2 = 1.0 - smoothstep(hw - fw, hw + fw, abs(r - _ThroatRings.y));
        c = lerp(c, lerp(WARM, PALE, 0.35 * bulbs), ring2);
        c = lerp(c, lerp(GOLD, PALE, 0.5 * bulbs), ring1);
        c = lerp(c, lerp(GOLD, WARM, 0.4), (1.0 - smoothstep(_ThroatRings.x - hw * 3.0, _ThroatRings.x - hw, r)) * _ThroatRings.w);
        float pr = max(_ThroatLook.y, 0.4), cr = max(_ThroatLook.z, 0.24);
        c = lerp(c, PALE, 1.0 - smoothstep(pr * 0.5, pr, r));
        c = lerp(c, CORE, 1.0 - smoothstep(cr * 0.33, cr, r));
    }
    else
    {
        // radii measured at the approved camera (cap ~35 px): white to ~10 px, pale yellow to ~17, gold to ~27
        c = lerp(RIM, WARM, 1.0 - smoothstep(0.76, 0.95, r));
        c = lerp(c, GOLD, 1.0 - smoothstep(0.55, 0.76, r));
        c = lerp(c, PALE, 1.0 - smoothstep(0.36, 0.55, r));
        c = lerp(c, CORE, 1.0 - smoothstep(0.12, 0.3, r));
    }
    float rays = pow(saturate(0.5 + 0.5 * sin(ang * _ThroatParams.y + 1.3 * sin(ang * 3.0 + Time * _ThroatParams.z))), 6.0);
    c += PALE * rays * _ThroatParams.x * smoothstep(0.15, 0.35, r) * (1.0 - smoothstep(0.55, 0.95, r));
    // round 4b: one seamless golden glow (display palette of RainbowPolish05.hlsl): white core, pale gold, gold, orange rim
    float3 g = lerp(float3(255, 232, 140), float3(255, 206, 104), smoothstep(0.4, 0.85, r));
    g = lerp(g, float3(255, 190, 92), smoothstep(0.7, 1.0, r));
    g = lerp(g, float3(255, 190, 96), exp(-pow((r - 0.78) / 0.05, 2.0)) * 0.7);
    g = lerp(g, float3(255, 250, 224), 1.0 - smoothstep(0.2, 0.62, r));
    Color = RbDisp(g) * (1.0 + 1.2 * (1.0 - smoothstep(0.2, 0.75, r))) * _ThroatIntensity;
}

void RainbowThroatGlow_half(half2 UV, half Time, out half3 Color)
{
    float3 c;
    RainbowThroatGlow_float((float2)UV, (float)Time, c);
    Color = (half3)c;
}

#endif // RAINBOW_THROAT_GLOW_INCLUDED
