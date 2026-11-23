// Rainbow Screen 05 - foam bank LAYOUT (foam area, 2026-11-23 round 2). Shared by the river shader's foam shelf
// (RainbowRiver.hlsl) and mirrored on the CPU by FoamBank.BankEdges (FoamBank.cs places the 3D soap puffs with it):
// KEEP BOTH IDENTICAL.
// Approved Screen 05: thick soap-foam banks cover the outer water on BOTH sides, so the open river is narrower and winds
// with the pink S-bands: the foam waterline runs just outside the outer edge of each pink band (a thin cyan margin
// between), with slow natural mounds reaching into the river, and the approved-image fits around the checkpoint view.
// The band edges are the river shader's band layout FAR from Benny (no Benny / time terms), so the banks stay static.
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

// d = stream centre (world x), hw = stream half width, Mb = cyan-core offset + band S relative to d (RainbowRiver: M + sbend),
// sm = Three.js master arc length (s + 116.7). Returns the waterlines of the left / right foam bank RELATIVE to d
// (x < 0 < y): the open water lies between them, the foam from there to the wall.
float2 RBW_BankEdges(float d, float hw, float Mb, float sm)
{
    hw = max(hw, 0.5);
    // ---- the pink S-bands far from Benny (RainbowRiver.hlsl band layout, water round 2026-11-23) ----
    float fR = -0.3 * RBW_FB_SS(133.0, 136.0, sm) * (1.0 - RBW_FB_SS(139.5, 142.0, sm))
             + 1.9 * RBW_FB_SS(146.5, 154.0, sm) * (1.0 - RBW_FB_SS(160.0, 168.0, sm))
             - 0.9 * RBW_FB_SS(165.0, 170.0, sm) * (1.0 - RBW_FB_SS(174.0, 180.0, sm));
    float fL = -0.5 * RBW_FB_SS(143.0, 147.0, sm) * (1.0 - RBW_FB_SS(151.0, 155.0, sm))
             + 1.0 * RBW_FB_SS(154.0, 158.0, sm) * (1.0 - RBW_FB_SS(168.0, 176.0, sm));
    float offL = hw * (0.62 + 0.03 * sin(sm * 0.13 + 1.7)) + fL;
    float offR = hw * (0.62 + 0.03 * sin(sm * 0.11 + 4.2)) + fR;
    float wL = hw * 0.205 * (1.0 + 0.15 * sin(sm * 0.19 + 0.4));
    float wR = hw * 0.205 * (1.0 + 0.15 * sin(sm * 0.17 + 2.9));
    float roomL = Mb + hw - 0.5 - offL;
    float roomR = hw - 0.5 - Mb - offR;
    wL = RBW_FB_SMin(wL, max(roomL, 0.6 * wL), 0.5);
    wR = RBW_FB_SMin(wR, max(roomR, 0.6 * wR), 0.5);
    offL = RBW_FB_SMin(offL, Mb + hw - wL - 0.5, 1.2);
    offR = RBW_FB_SMin(offR, hw - wR - 0.5 - Mb, 1.2);
    float eL = Mb - offL - wL;
    float eR = Mb + offR + wR;
    // ---- thin cyan margin between band and foam (slowly varying) ----
    eL -= 0.26 + 0.12 * sin(sm * 0.37 + 1.3) + 0.07 * sin(sm * 0.91 + 0.4);
    eR += 0.26 + 0.12 * sin(sm * 0.41 + 4.1) + 0.07 * sin(sm * 0.87 + 2.2);
    // ---- natural mounds / point bars reaching into the river (quasi-random along the course) ----
    float pL = 0.6 * sin(sm * 0.173 + 0.6) + 0.4 * sin(sm * 0.419 + 2.3);
    float pR = 0.6 * sin(sm * 0.191 + 3.7) + 0.4 * sin(sm * 0.443 + 0.9);
    eL += 0.8 * RBW_FB_SS(0.3, 0.95, pL);
    eR -= 0.8 * RBW_FB_SS(0.3, 0.95, pR);
    // ---- approved Screen 05 around the checkpoint view (stationary in master s, Benny at s 14 = sm 130.7) ----
    // left: the clump beside Benny at the frame edge (ref x 0-130, y 1020-1110) and the lower-left clump behind him
    // (ref x 60-230, y 1220-1300); right: the bank right of the right band (ref x 700-860, y 760-950) and the
    // lower-right clump behind him (ref x 650-800, y 1230-1300)
    float kL1 = RBW_FB_SS(126.6, 127.6, sm) * (1.0 - RBW_FB_SS(129.0, 129.8, sm));
    float kL2 = RBW_FB_SS(129.0, 130.0, sm) * (1.0 - RBW_FB_SS(131.6, 132.6, sm));
    float kR1 = RBW_FB_SS(126.6, 127.6, sm) * (1.0 - RBW_FB_SS(128.9, 129.7, sm));
    float kR2 = RBW_FB_SS(130.6, 132.0, sm) * (1.0 - RBW_FB_SS(137.0, 139.5, sm));
    eL = lerp(eL, max(eL, -1.25), kL1);
    eL = lerp(eL, max(eL, -2.05), kL2);
    eR = lerp(eR, min(eR, 1.3), kR1);
    eR = lerp(eR, min(eR, 2.7), kR2);
    // ---- never over the coin line (coins: 0.63 x the meander from the route, CoinTrail.cs), never past the stream edge ----
    float coin = 0.63 * d;
    eL = min(eL, coin - 1.25);
    eR = max(eR, coin + 1.25);
    return float2(max(eL, -hw), min(eR, hw));
}

// foam.ts SOAP05_GLSL soap05(): approved soap colour ramp, t = 0 blue-violet crevice -> blue -> periwinkle ->
// lavender-white -> 1 white top cap (shared by the 3D bubbles and the river's flat lather between them)
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
