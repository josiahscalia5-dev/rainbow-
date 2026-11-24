// Rainbow Screen 05 - soap colour ramp + foam swell helpers shared by the river and the foam puffs.
#ifndef RAINBOW_FOAM_BANK_INCLUDED
#define RAINBOW_FOAM_BANK_INCLUDED

float RBW_FB_SS(float a, float b, float x)
{
    float t = saturate((x - a) / (b - a));
    return t * t * (3.0 - 2.0 * t);
}

float RBW_FB_SMin(float a, float b, float k)
{
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
}

// (river round 4b) the band / waterline layout comes from the table RiverLayout05 (mesh UV2 / UV3), no formulas here.

// foam.ts SOAP05_GLSL soap05(): approved soap colour ramp, t = 0 blue-violet crevice -> blue -> periwinkle ->
// lavender-white -> 1 white top cap (shared by the 3D bubbles and the river's flat lather between them)
static const float3 RBW_SOAP_CREV = float3(0.23, 0.22, 0.66);

float3 RBW_Soap05(float t)
{
    t = saturate(t) * 5.0;
    // (water round 3v: mid tones a little more lavender, less green - approved bank foam p40 #B6C0F9 / p60 #D8D4FA vs
    //  Unity #A1C1FD / #D4DBFD)
    float3 c = lerp(RBW_SOAP_CREV, float3(0.30, 0.36, 0.84), saturate(t));
    c = lerp(c, float3(0.44, 0.50, 0.96), saturate(t - 1.0));
    c = lerp(c, float3(0.63, 0.61, 0.95), saturate(t - 2.0));
    c = lerp(c, float3(0.85, 0.80, 0.97), saturate(t - 3.0));
    return lerp(c, float3(1.05, 1.03, 1.08), saturate(t - 4.0));
}

// the river swell of RainbowRiver.hlsl (RBW_RiverWave) at a foam puff, so puffs on the stream ride the water
float RBW_FoamBob(float x, float s, float d, float hw, float sOffset, float amp, float time)
{
    float u = (x - d) / max(hw, 0.5);
    float uc = clamp(u, -1.0, 1.0);
    float sm = s + sOffset;
    float mask = 1.0 - RBW_FB_SS(0.92, 1.08, abs(u));
    return amp * mask * (0.6 * sin(sm * 0.9 - time * 2.4 + uc * 1.7) + 0.4 * sin(sm * 0.41 + time * 1.5 - uc * 2.3));
}

#endif // RAINBOW_FOAM_BANK_INCLUDED
