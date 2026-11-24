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

// ---- river round 2026-11-23: band layout fitted to the approved image with the current gameplay camera ----
// (frame round camera: (x, 3.40, 7.48), pitch 12.78, yaw -2.8, vFOV 62; approved band / foam edges traced row by row
//  and mapped onto the water plane). All terms are stationary in master s and zero for s < ~20 (Benny's near field).
// Wave-7 channel shape (offsets of the left / right band from the band-pair centre) + the river round's wider spread of
// the bands at s 33-48, where the approved river opens up between the walls.
float RBW_BandFL(float sm)
{
    // (water round 3v 2026-11-23: - the s 20-24 term: the approved left band runs ~0.45 m further right there, traced
    //  row by row at y 755-800 = centre X -3.1 .. -3.8; it also brings the near-left foam waterline in like the approved)
    return -0.5 * RBW_FB_SS(143.0, 147.0, sm) * (1.0 - RBW_FB_SS(151.0, 155.0, sm))
         + 1.0 * RBW_FB_SS(154.0, 158.0, sm) * (1.0 - RBW_FB_SS(168.0, 176.0, sm))
         + 1.5 * RBW_FB_SS(147.5, 151.5, sm) * (1.0 - RBW_FB_SS(158.0, 166.0, sm))
         - 0.45 * RBW_FB_SS(135.5, 137.5, sm) * (1.0 - RBW_FB_SS(140.0, 142.0, sm));
}

float RBW_BandFR(float sm)
{
    return -0.3 * RBW_FB_SS(133.0, 136.0, sm) * (1.0 - RBW_FB_SS(139.5, 142.0, sm))
         + 1.9 * RBW_FB_SS(146.5, 154.0, sm) * (1.0 - RBW_FB_SS(160.0, 168.0, sm))
         - 0.9 * RBW_FB_SS(165.0, 170.0, sm) * (1.0 - RBW_FB_SS(174.0, 180.0, sm))
         + 1.4 * RBW_FB_SS(152.0, 156.0, sm) * (1.0 - RBW_FB_SS(161.0, 168.0, sm));
}

// lateral shift of the whole band pair (added to the band S): the approved S swings right sooner (s 21-30) and further
// left past the crest (s 50-66)
float RBW_BandFitM(float sm)
{
    return 1.0 * RBW_FB_SS(137.2, 139.7, sm) * (1.0 - RBW_FB_SS(141.2, 147.2, sm))
         - 0.35 * RBW_FB_SS(147.7, 150.7, sm) * (1.0 - RBW_FB_SS(153.7, 158.7, sm))
         - 1.0 * RBW_FB_SS(166.7, 171.7, sm) * (1.0 - RBW_FB_SS(176.7, 182.7, sm));
}

// room of the band layout on each side, RELATIVE to d (both > 0): beyond Benny's near field the bands reach up to the
// real drum wall W (half chord at the water, river mesh UV1.w) minus the foam rim, not just the RiverPath stream half
// width (the approved bands run right beside the narrow foam rims under the walls)
float2 RBW_BandLimits(float d, float hw, float W, float sm)
{
    float k = RBW_FB_SS(136.2, 140.2, sm) * step(1.0, W);
    return float2(lerp(hw - 0.5, W + d - 0.6, k), lerp(hw - 0.5, W - d - 0.6, k));
}

// d = stream centre (world x), hw = stream half width, Mb = cyan-core offset + band S relative to d (RainbowRiver: M + sbend,
// incl. RBW_BandFitM), sm = Three.js master arc length (s + 116.7), W = half chord of the drum wall at the water (river
// mesh UV1.w / DrumLayout05.WaterChord). Returns the waterlines of the left / right foam bank RELATIVE to d (x < 0 < y):
// the open water lies between them, the foam from there to the wall.
// coordinator round 3: maximum foam width in front of the drum wall (m); keep equal to FoamBank.FoamRimCap (C#).
// 99 = OFF. Tested 1.3 on 2026-11-24 (cycle coord_e3): it only widened the open water toward the walls (foam_left 49.5 -> 46.0,
// foam_right 47.6 -> 43.9, water_mid 60.5 -> 57.7) - the real gap is the lower wall position, not the foam width.
static const float RBW_FOAM_CAP = 99.0;

float2 RBW_BankEdges(float d, float hw, float Mb, float sm, float W)
{
    hw = max(hw, 0.5);
    // ---- the pink S-bands far from Benny (RainbowRiver.hlsl band layout, water round 2026-11-23) ----
    float fR = RBW_BandFR(sm);
    float fL = RBW_BandFL(sm);
    float2 lim = RBW_BandLimits(d, hw, W, sm);
    float offL = hw * (0.62 + 0.03 * sin(sm * 0.13 + 1.7)) + fL;
    float offR = hw * (0.62 + 0.03 * sin(sm * 0.11 + 4.2)) + fR;
    float wL = hw * 0.205 * (1.0 + 0.15 * sin(sm * 0.19 + 0.4));
    float wR = hw * 0.205 * (1.0 + 0.15 * sin(sm * 0.17 + 2.9));
    float roomL = Mb + lim.x - offL;
    float roomR = lim.y - Mb - offR;
    wL = RBW_FB_SMin(wL, max(roomL, 0.6 * wL), 0.5);
    wR = RBW_FB_SMin(wR, max(roomR, 0.6 * wR), 0.5);
    offL = RBW_FB_SMin(offL, Mb + lim.x - wL, 1.2);
    offR = RBW_FB_SMin(offR, lim.y - wR - Mb, 1.2);
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
    // ---- river round 2026-11-23: NARROW foam rims hugging the drum walls (approved: the purple walls come down right
    //      behind a narrow bubbly rim; the wide flat foam fields between river and wall are gone). Foam width from the
    //      wall at the water, fitted row by row: left = the approved near-left bank (1.1 -> 2.8 -> 1.2 m at s 21-34),
    //      then a rim of 0.35-0.8 m; right = a 0.45-1.2 m rim at s 25-41, the approved big right bank (1.6 -> 3.9 m) at
    //      s 44-63, back to a rim beyond s 70. Off in Benny's near field (s < 20) ----
    float kW = RBW_FB_SS(136.2, 136.9, sm) * step(1.0, W);
    float wallL = -(W + d);                          // drum walls relative to d
    float wallR = W - d;
    // (water round 3v 2026-11-23: rims refitted to the approved foam waterlines traced row by row and mapped onto the
    //  water: left 1.4 -> 3.0 m at s 20-27, down to a 0.4 m rim by s 33 (the old 1.9-2.3 m at s 30-33 was the big left
    //  heap over the left band); right at least 2.0 -> 1.5 m at s 23-25, 0.6 m at s 27-34, widening to 1.5 m by s 41)
    // (geometry round 2026-11-24: the near-left bank is a narrow ROPE along the wall foot, the water reaching it - the
    //  approved foam waterline traced at x 50-175 / y 720-790 = rims ~1.0 / 1.1 / 1.2 m at s 21 / 23 / 24.5; the old
    //  2.4-2.95 m shelf at s 24-31 read as a wide flat lather carpet: now 1.0 -> 1.25 -> 1.85 -> 1.7 -> 0.35 m at
    //  s 21.2 / 24.3 / 26.8 / 30.3 / 34.8; a 1.0-1.3 m rope all along (cycle geometry_t3) left a wide cyan strip
    //  between the rope and the left pink band, which in the approved image runs right beside the rope)
    float rimL = 0.35 + 0.65 * RBW_FB_SS(136.9, 137.9, sm) + 0.25 * RBW_FB_SS(137.9, 141.0, sm)
               + 0.6 * RBW_FB_SS(141.0, 143.5, sm) - 0.15 * RBW_FB_SS(144.0, 147.0, sm)
               - 0.5 * RBW_FB_SS(147.0, 149.0, sm) - 0.85 * RBW_FB_SS(149.0, 151.5, sm);
    float rimLmin = lerp(rimL, 0.35, RBW_FB_SS(152.0, 154.0, sm));
    float rimRn = 0.62 + 0.9 * (1.0 - RBW_FB_SS(141.2, 143.2, sm)) + 0.5 * (1.0 - RBW_FB_SS(139.5, 141.0, sm))
                + 0.35 * RBW_FB_SS(151.5, 154.0, sm) + 0.5 * RBW_FB_SS(154.5, 157.5, sm);
    float rimR = 0.45 + 0.75 * (1.0 - RBW_FB_SS(141.5, 144.0, sm)) + 3.0 * (1.0 - RBW_FB_SS(140.0, 141.5, sm))
               + 1.15 * RBW_FB_SS(157.7, 160.7, sm) + 0.7 * RBW_FB_SS(160.7, 164.3, sm)
               + 0.5 * RBW_FB_SS(164.3, 168.3, sm) + 0.7 * RBW_FB_SS(168.3, 173.2, sm)
               + 0.4 * RBW_FB_SS(173.2, 179.3, sm) - 1.8 * RBW_FB_SS(179.3, 186.7, sm)
               - 1.5 * RBW_FB_SS(186.7, 196.7, sm);
    rimR = max(rimR, rimRn);
    float rimRmin = lerp(rimRn, rimR, RBW_FB_SS(156.5, 158.5, sm) * (1.0 - RBW_FB_SS(185.0, 189.0, sm)));
    eL = lerp(eL, clamp(eL, wallL + rimLmin, wallL + rimL), kW);
    eR = lerp(eR, clamp(eR, wallR - rimR, wallR - rimRmin), kW);
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
    float2 e = float2(max(eL, lerp(-hw, wallL, kW)), min(eR, lerp(hw, wallR, kW)));
    // ---- coordinator round 3 (2026-11-23): NARROW foam banks hugging the wall (user: "narrow, taller foam banks"):
    //      at most RBW_FOAM_CAP m of foam in front of the drum wall; the open water widens to meet it ----
    if (W >= 1.0)
    {
        e.x = min(e.x, wallL + RBW_FOAM_CAP);
        e.y = max(e.y, wallR - RBW_FOAM_CAP);
    }
    return e;
}

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
