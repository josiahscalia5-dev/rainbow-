// Rainbow Screen 05 - Benny's white splash spray droplets (Agent 3). Shader Graph Custom Function file.
// Each droplet is a velocity-aligned streak quad (SplashWake.cs): P.x = along the motion (-1 tail .. +1 head),
// P.y = across (-1..1). Output is PREMULTIPLIED (blend One OneMinusSrcAlpha).
#ifndef RAINBOW_SPRAY_INCLUDED
#define RAINBOW_SPRAY_INCLUDED

void RainbowSpray_float(float2 P, float Alpha, out float3 Color, out float OutAlpha)
{
    float across = saturate(1.0 - abs(P.y));
    across = across * across * (3.0 - 2.0 * across);
    float along = smoothstep(-1.0, -0.1, P.x) * (1.0 - smoothstep(0.55, 1.0, P.x));
    float head = exp(-(P.x - 0.45) * (P.x - 0.45) * 6.0);    // brighter droplet head
    float a = saturate(across * along * (0.55 + 0.45 * head)) * saturate(Alpha);
    float3 c = lerp(float3(0.78, 0.92, 1.05), float3(1.25, 1.3, 1.35), head * across);   // white with a cyan cast
    Color = c * a;
    OutAlpha = a * 0.9;
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
