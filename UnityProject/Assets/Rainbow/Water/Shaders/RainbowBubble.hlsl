// Rainbow Screen 05 - iridescent soap bubbles (Agent 3). Shader Graph Custom Function file.
// Port of src/vfx/bubbles.ts BIG_FRAG / PT_FRAG, re-tuned against the approved 05 bubbles (bubbles round 3, zoomed crops of
// the approved image): each bubble is a clear thin-film sphere - a milky blue-cyan lens interior with bright cyan refraction
// spots at the top and bottom centre, a thin swirling film tint (magenta / violet / cyan, a little gold) toward the rim, a
// ring of ~9 soft pink-white lamp reflections just inside the rim (brightest on top), a crisp bright white-lavender outline
// (brighter up-left), a soft specular glint up-left and a small secondary glint down-right. Camera-facing quads built by
// BubbleField.cs.
//   P    = quad coordinate (-1..1, +y = screen up)      Seed = per-bubble random 0..1
//   Px   = on-screen radius in device pixels (> 0)      Fade = spawn / near-camera / soft-depth fade 0..1
//   L0   = big: (rim gain, blob gain, lens alpha, film mix)
//   L1   = big: (cyan spot gain, glint gain, rim half width in reference px, blob ring radius)
//   LS   = small: (ring gain, dot gain, body alpha, glint gain)
#ifndef RAINBOW_BUBBLE_INCLUDED
#define RAINBOW_BUBBLE_INCLUDED

#include "Assets/Rainbow/Water/Shaders/RainbowWaterCommon.hlsl"

void RainbowBubble_float(float2 P, float Seed, float Px, float Fade, float Time, float4 L0, float4 L1, out float3 Color, out float Alpha)
{
    Px = abs(Px);
    float pxK = RBW_PxScale();
    float pxR = max(Px / pxK, 1.0);                         // radius in reference px
    float d2 = dot(P, P);
    float d = sqrt(min(d2, 1.0));
    float z = sqrt(max(1.0 - d2, 0.0));
    float f = 1.0 - z;                                      // 0 centre -> 1 silhouette
    // thin film: the approved film swirls through pink / magenta / violet / blue / cyan only (no green / orange bands)
    float sw = RBW_VNoise(P * 2.2 + float2(Time * 0.3 + Seed * 13.0, Seed * 7.0));
    float hue = f * 0.85 + sw * 0.75 + P.x * 0.25 - P.y * 0.2 + Seed;
    float3 film = RBW_Iridescent(0.02 + 0.5 * (0.5 + 0.5 * sin(6.28318 * hue)));
    film = float3(film.r, film.g * 0.55 + 0.1, min(1.0, film.b * 1.1 + 0.1));

    // 1. lens: milky blue glass with bright cyan refraction spots (top and bottom centre), also in front of the magenta
    //    water and the violet walls (approved: the bubbles' insides always read blue-cyan, never just see-through)
    float2 c1 = P - float2(0.04, -0.42);
    float2 c2 = P - float2(-0.05, 0.42);
    float spots = saturate((exp(-dot(c1, c1) * 6.0) + 0.75 * exp(-dot(c2, c2) * 8.0)) * L1.x);
    float3 col = lerp(float3(0.14, 0.34, 0.95), float3(0.45, 0.93, 1.0), spots);
    float a = L0.z * (0.85 + 0.45 * spots);

    // 2. thin-film tint toward the silhouette (a soft pink / violet / cyan halo inside the rim)
    float filmK = smoothstep(0.42, 0.96, d) * L0.w;
    col = lerp(col, film * 0.95 + 0.12, filmK);
    a = lerp(a, max(a, 0.5), filmK);

    // 3. ring of soft pink-white lamp reflections just inside the rim (approved: ~9 rounded spots, whiter on top, pinker
    //    below); on tiny bubbles they merge into the rim
    float ang = atan2(P.y, P.x + 1e-6);
    float dr = (d - L1.w) / 0.1;
    float lobe = pow(saturate(0.5 + 0.5 * cos(9.0 * ang + Seed * 31.0)), 1.6);
    float tiny = 1.0 - smoothstep(9.0, 18.0, pxR);
    float blob = saturate(lobe * exp(-dr * dr) * (0.78 + 0.3 * P.y) * L0.y * (1.0 - 0.6 * tiny));
    float3 blobCol = lerp(float3(1.0, 0.6, 0.97), float3(1.0, 0.94, 1.0), saturate(0.55 + 0.6 * P.y));
    col = lerp(col, blobCol * 1.3, blob);
    a = max(a, blob * 0.92);

    // 4. crisp bright rim: white-lavender outline about 2-3 reference px wide, brighter up-left
    float rimW = clamp(L1.z / pxR, 0.035, 0.3);             // half width in quad units
    float rq = (d - (1.0 - rimW)) / rimW;
    float rimLit = 0.78 + 0.32 * dot(P / max(d, 1e-3), float2(-0.6, 0.8));
    float rim = saturate(exp(-rq * rq) * L0.x * rimLit);
    col = lerp(col, float3(1.0, 0.93, 1.0) * 1.35, rim);
    a = max(a, rim * 0.95);

    // 5. specular glint up-left + a small secondary glint down-right
    float2 q1 = (P - float2(-0.40, 0.47)) * float2(2.6, 3.4);
    float2 q2 = P - float2(0.44, -0.48);
    float hl = saturate((exp(-dot(q1, q1) * 3.0) + 0.65 * exp(-dot(q2, q2) * 60.0)) * L1.y);
    col = lerp(col, float3(1.0, 1.0, 1.0) * 1.5, hl);
    a = max(a, hl * 0.95);

    float aa = 1.0 - smoothstep(1.0 - 1.5 / max(Px, 1.5), 1.0, sqrt(d2));   // anti-aliased silhouette
    Color = col;
    Alpha = saturate(a) * aa * saturate(Fade);
}

// bubbles.ts PT_FRAG: tiny ring-sprite bubbles. Approved 05 small bubbles: a crisp white ring with a faint film tint, a few
// white dots just inside it and a clear blue-tinted centre; the very smallest fade out so they never read as solid white
// dots. P as above (gl_PointCoord has y down: c = (P.x, -P.y) / 2), Px = on-screen radius in device px.
void RainbowBubbleSmall_float(float2 P, float Seed, float Px, float Fade, float4 LS, out float3 Color, out float Alpha)
{
    Px = abs(Px);
    float pxR = max(Px / RBW_PxScale(), 0.5);
    float2 c = float2(P.x, -P.y) * 0.5;
    float d = length(c) * 2.0;
    float rw = clamp(1.3 / pxR, 0.12, 0.38);                // ring half width (radius units) ~1.3 reference px
    float rq = (d - (1.0 - rw)) / rw;
    float ring = saturate(exp(-rq * rq) * LS.x);
    float h = d * 0.7 + Seed + atan2(c.y, c.x + 1e-6) * 0.12;
    float3 irid = RBW_Iridescent(0.02 + 0.5 * (0.5 + 0.5 * sin(6.28318 * h)));
    irid = float3(irid.r, irid.g * 0.55 + 0.1, irid.b);
    float3 ringCol = lerp(float3(1.0, 0.97, 1.0), irid, 0.3) * 1.25;
    float ang = atan2(P.y, P.x + 1e-6);
    float dq = (d - 0.6) / 0.14;
    float dots = saturate(pow(saturate(0.5 + 0.5 * cos(5.0 * ang + Seed * 23.0)), 3.0) * exp(-dq * dq)
               * smoothstep(4.0, 8.0, pxR) * LS.y);
    float hl = saturate(RBW_SS(0.15, 0.0, length(c - float2(-0.16, -0.17))) * LS.w);
    float3 col = float3(0.3, 0.62, 1.0);                    // clear blue-tinted body
    float a = LS.z;
    col = lerp(col, float3(1.0, 0.95, 1.0) * 1.2, dots);
    a = max(a, dots * 0.85);
    col = lerp(col, ringCol, ring);
    a = max(a, ring * 0.92);
    col = lerp(col, float3(1.0, 1.0, 1.0) * 1.4, hl);
    a = max(a, hl * 0.9);
    float aa = 1.0 - smoothstep(1.0 - 1.2 / max(Px, 1.2), 1.0, d);
    float diam = 2.0 * Px;                                  // gl_PointSize (device px)
    Color = col;
    Alpha = saturate(a) * aa * (0.35 + 0.65 * smoothstep(3.0, 8.0, diam)) * saturate(Fade);
}

void RainbowBubble_half(half2 P, half Seed, half Px, half Fade, half Time, out half3 Color, out half Alpha)
{
    float3 c;
    float a;
    RainbowBubble_float((float2)P, (float)Seed, (float)Px, (float)Fade, (float)Time,
                        float4(1.0, 1.0, 0.3, 0.5), float4(1.0, 0.6, 2.2, 0.76), c, a);
    Color = (half3)c;
    Alpha = (half)a;
}

#endif // RAINBOW_BUBBLE_INCLUDED
