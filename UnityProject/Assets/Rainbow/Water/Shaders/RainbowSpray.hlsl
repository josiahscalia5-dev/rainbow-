// Rainbow Screen 05 - Benny's splash spray droplets (Agent 3). Shader Graph Custom Function file.
// Each droplet is a small quad stretched a little along its motion (SplashWake.cs): P.x = along the motion (-1 .. +1),
// P.y = across (-1..1). Output is PREMULTIPLIED (blend One OneMinusSrcAlpha).
// (splash round 2026-11-23) port of the spray.ts water bead (approved 05 droplets): translucent cyan body, brighter rim,
// a white glint - never a solid white disc or a white streak.
#ifndef RAINBOW_SPRAY_INCLUDED
#define RAINBOW_SPRAY_INCLUDED

void RainbowSpray_float(float2 P, float Alpha, out float3 Color, out float OutAlpha)
{
    float d = length(P);
    float body = 1.0 - smoothstep(0.7, 1.0, d);
    float rim = smoothstep(0.45, 0.85, d) * body;
    float hl = 1.0 - smoothstep(0.0, 0.32, length(P * 0.5 - float2(0.14, 0.14)));
    float3 c = lerp(float3(0.5, 0.88, 1.0), float3(1.15, 1.18, 1.2), saturate(rim * 0.6 + hl));
    float a = saturate((body * 0.38 + rim * 0.3 + hl * 0.5) * saturate(Alpha));
    Color = c * a;
    OutAlpha = a;
}

void RainbowSpray_half(half2 P, half Alpha, out half3 Color, out half OutAlpha)
{
    float3 c;
    float a;
    RainbowSpray_float((float2)P, (float)Alpha, c, a);
    Color = (half3)c;
    OutAlpha = (half)a;
}

#endif // RAINBOW_SPRAY_INCLUDED
