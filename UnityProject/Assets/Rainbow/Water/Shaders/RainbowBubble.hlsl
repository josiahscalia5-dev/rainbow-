// Rainbow Screen 05 - iridescent soap bubbles (Agent 3). Shader Graph Custom Function file.
// Port of src/vfx/bubbles.ts BIG_FRAG: swirling thin-film (magenta / violet / cyan, a little gold), crisp outline,
// tinted interior, white window highlights, sparkle dots on the rim. Camera-facing quads built by BubbleField.cs.
//   P    = quad coordinate (-1..1, +y = screen up)      Seed = per-bubble random 0..1
//   Px   = on-screen radius in device pixels             Fade = spawn / near-camera / soft-depth fade 0..1
#ifndef RAINBOW_BUBBLE_INCLUDED
#define RAINBOW_BUBBLE_INCLUDED

#include "Assets/Rainbow/Water/Shaders/RainbowWaterCommon.hlsl"

void RainbowBubble_float(float2 P, float Seed, float Px, float Fade, float Time, out float3 Color, out float Alpha)
{
    float pxK = RBW_PxScale();
    float pxR = Px / pxK;                                   // radius in reference px
    float d2 = dot(P, P);
    float d = sqrt(min(d2, 1.0));
    float z = sqrt(max(1.0 - d2, 0.0));
    float f = 1.0 - z;                                      // 0 centre -> 1 silhouette
    float sw = RBW_VNoise(P * 2.2 + float2(Time * 0.3 + Seed * 13.0, Seed * 7.0));
    float hue = f * 0.85 + sw * 0.75 + P.x * 0.25 - P.y * 0.2 + Seed;
    float3 film = RBW_Iridescent(hue);
    film = float3(film.r, film.g * 0.55 + 0.1, min(1.0, film.b * 1.1 + 0.1));   // less green
    film *= 0.74;                                           // stay saturated under the grade
    float rim = smoothstep(0.5, 0.97, d);
    float edge = smoothstep(0.88, 0.97, d) * (1.0 - smoothstep(0.975, 1.0, d));
    float2 q1 = (P - float2(-0.36, 0.42)) * float2(2.2, 3.0);
    float hl = exp(-dot(q1, q1) * 2.2) * 1.2;               // soft window pane up-left
    float2 q2 = P - float2(0.42, -0.45);
    hl += exp(-dot(q2, q2) * 55.0) * 0.7;                   // small one down-right
    float ang = atan2(P.y, P.x);
    hl += smoothstep(0.8, 0.93, d) * (1.0 - smoothstep(0.95, 1.0, d)) * pow(max(sin(ang * 4.0 + Seed * 31.0), 1e-4), 30.0) * 0.9;
    float small = 1.0 - smoothstep(10.0, 22.0, pxR);
    hl *= 1.0 - 0.5 * small;
    Color = film * (0.55 + 0.75 * rim) + float3(1.0, 1.0, 1.0) * edge * 0.45 + float3(1.05, 1.05, 1.05) * hl;
    float a = clamp(0.14 + 0.1 * sw + rim * 0.6 + edge * 0.35 + hl, 0.0, 0.95);
    float aa = 1.0 - smoothstep(1.0 - 1.5 / max(Px, 1.5), 1.0, sqrt(d2));   // anti-aliased silhouette
    Alpha = a * aa * saturate(Fade);
}

void RainbowBubble_half(half2 P, half Seed, half Px, half Fade, half Time, out half3 Color, out half Alpha)
{
    float3 c;
    float a;
    RainbowBubble_float((float2)P, (float)Seed, (float)Px, (float)Fade, (float)Time, c, a);
    Color = (half3)c;
    Alpha = (half)a;
}

#endif // RAINBOW_BUBBLE_INCLUDED
