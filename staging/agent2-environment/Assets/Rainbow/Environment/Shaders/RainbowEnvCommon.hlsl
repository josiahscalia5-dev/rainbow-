// Rainbow Screen 05 - shared environment helpers (Agent 2, environment).
// Used by RainbowDrumWall.hlsl, RainbowGoldMetal.hlsl and RainbowFarRiver.hlsl (hand-written .shader files AND
// Shader Graph Custom Function nodes). This file declares NO properties: the including shader (or the Shader Graph
// blackboard, same reference names) must declare:
//   TEXTURE2D(_EnvPano); SAMPLER(sampler_EnvPano);      Marble 05 equirect panorama (marble05_env_1024.jpg, sRGB)
//   float  _EnvIntensity, _EnvBlur;                       reflection strength, extra mip blur
//   float4 _FarGlowColor; float4 _FarGlowRange;           warm throat colour; (near, far, strength) in view metres
//   float4 _MidTint;      float4 _MidRange;               violet mid-tunnel tint; (near, far, amount)
//   float4 _StripColor;   float  _StripIntensity;         analytic strip lights (colour, intensity)
//   float4 _StripParams;                                  (count, half-width rad, unused, alt-strip brightness)
// Ported from the Three.js game: src/world/materials.ts (withFarGlow, withTubeStrips, marblePano05 lookup).
#ifndef RAINBOW_ENV_COMMON_INCLUDED
#define RAINBOW_ENV_COMMON_INCLUDED

#define RB_PI 3.14159265
#define RB_TWO_PI 6.2831853

float RbSq(float x) { return x * x; }

// Marble 05 panorama lookup (materials.ts marblePanoLookup05). The pano's vanishing point (three equirect uv 0.514, 0.542)
// is put on the tunnel direction (+Z in Unity), pano up on world up, rider's right (+X) on the pano's right.
float2 RainbowPanoUV(float3 dirWS)
{
    const float3 P  = float3(0.98747, 0.13157, 0.08709);     // pano direction of the vanishing point
    const float3 Up = float3(-0.13106, 0.99131, -0.011558);  // pano up orthogonalised against P
    const float3 Rt = float3(-0.087854, 0.0, 0.996133);      // P x Up (three's rider-right axis)
    float3 L = normalize(dirWS.z * P + dirWS.y * Up + dirWS.x * Rt);
    float u = atan2(L.z, L.x) / RB_TWO_PI + 0.5;
    float v = asin(clamp(L.y, -1.0, 1.0)) / RB_PI + 0.5;
    return float2(u, v);
}

// Explicit LOD: the equirect seam (u 0/1) never produces a derivative spike.
float3 RainbowSamplePano(float3 dirWS, float lod)
{
    float2 uv = RainbowPanoUV(dirWS);
    return SAMPLE_TEXTURE2D_LOD(_EnvPano, sampler_EnvPano, uv, lod).rgb;
}

// materials.ts FAR_GLOW_PARS: warm "light at the end of the tunnel", grows with the view distance.
float RainbowFarGlowK(float dist)
{
    float k = smoothstep(_FarGlowRange.x, _FarGlowRange.y, dist);
    return _FarGlowRange.z * k * k;
}

float RainbowMidTintK(float dist)
{
    return _MidRange.z * smoothstep(_MidRange.x, _MidRange.y, dist);
}

// materials.ts withTubeStrips: narrow light strips running the full tunnel length at evenly spaced angles round the
// tube axis (+Z). Radiance depends only on the azimuth of the reflected view ray round the axis, so the lengthwise
// white-pink streaks on the walls and the marquee spots on the gold stay crisp at any distance (no cube-map pinching).
float3 RainbowTubeStripRadiance(float3 V, float3 N, float rough)
{
    float3 R = reflect(-V, N);
    const float3 A = float3(0.0, 0.0, 1.0);
    const float3 E1 = float3(0.0, 1.0, 0.0);
    const float3 E2 = float3(-1.0, 0.0, 0.0);
    float3 P = R - A * dot(R, A);
    float pl = length(P);
    float count = _StripParams.x;
    float t = atan2(dot(P, E2), dot(P, E1)) * count / RB_TWO_PI;
    float fw = min(fwidth(t), fwidth(frac(t + 0.5)));
    float w0 = _StripParams.y * count / RB_TWO_PI;
    float w = w0 + rough * rough * 1.5 + fw * 0.6;
    float dA = frac(t + 0.5) - 0.5;
    float k = exp(-dA * dA / (w * w)) * lerp(1.0, w0 / w, 0.75);
    k *= (fmod(abs(floor(t + 0.5)), 2.0) > 0.5) ? _StripParams.w : 1.0;
    return _StripColor.rgb * _StripIntensity * k * smoothstep(0.02, 0.12, pl);
}

#endif // RAINBOW_ENV_COMMON_INCLUDED
