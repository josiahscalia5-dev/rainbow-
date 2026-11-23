// Rainbow Screen 05 - direct (punctual) lights for the hand-written environment shaders (Agent 2).
// Include AFTER "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl".
// Main light + additional lights (forward and Forward+/cluster loop of URP 17.3). No shadows on purpose: the tunnel is
// a closed tube, a shadowed key light would black it out; the walls are lit by their own reflections and glow.
#ifndef RAINBOW_ENV_LIGHTING_INCLUDED
#define RAINBOW_ENV_LIGHTING_INCLUDED

// Fog depth cap for the tunnel surfaces (light round 2026-11-23). The scene keeps Game.ts FogExp2('#ffbde9', 0.0035), but
// in the Three.js game the deep 05 rings / walls were a forced-perspective block squeezed into the last ~6 real units at
// ~60 u from the eye, so that fog never touched them (~4 %). In this port the tunnel is REAL to ~290 m and the same fog
// washed the far rings and walls 40-55 % pale pink (the pink disc round the throat). Fog depth is capped at that distance.
#define RB_FOG_MAX_DEPTH 60.0
real RainbowFogFactor(float4 positionCS)
{
    float z = UNITY_Z_0_FAR_FROM_CLIPSPACE(positionCS.z);
    return ComputeFogFactorZ0ToFar(min(z, RB_FOG_MAX_DEPTH));
}

float3 RainbowBRDF(float3 L, float3 radiance, float3 N, float3 V, float3 diffuse, float3 F0, float rough)
{
    float ndl = saturate(dot(N, L));
    if (ndl <= 0.0) return float3(0.0, 0.0, 0.0);
    float3 H = SafeNormalize(L + V);
    float ndh = saturate(dot(N, H));
    float ldh = saturate(dot(L, H));
    float a = max(rough * rough, 0.002);
    float a2 = a * a;
    float dd = ndh * ndh * (a2 - 1.0) + 1.0;
    float D = a2 / (RB_PI * dd * dd + 1e-5);
    float vis = 1.0 / (4.0 * max(ldh * ldh, 0.1) * (rough + 0.5));   // URP's simplified visibility term
    float3 spec = min(F0 * D * vis, 64.0);
    return (diffuse + spec) * radiance * ndl;                        // diffuse uses URP's convention (no 1/pi)
}

float3 RainbowDirectLights(float3 positionWS, float4 positionCS, float3 N, float3 V, float3 albedo, float metallic, float rough)
{
    float3 diffuse = albedo * (1.0 - metallic);
    float3 F0 = lerp(float3(0.04, 0.04, 0.04), albedo, metallic);
    Light mainLight = GetMainLight();
    float3 c = RainbowBRDF(mainLight.direction, mainLight.color * mainLight.distanceAttenuation, N, V, diffuse, F0, rough);
#if defined(_ADDITIONAL_LIGHTS)
    InputData inputData = (InputData)0;
    inputData.positionWS = positionWS;
    inputData.normalWS = N;
    inputData.viewDirectionWS = V;
    inputData.normalizedScreenSpaceUV = GetNormalizedScreenSpaceUV(positionCS);
    uint lightCount = GetAdditionalLightsCount();
#if USE_CLUSTER_LIGHT_LOOP
    [loop] for (uint li = 0; li < min(URP_FP_DIRECTIONAL_LIGHTS_COUNT, MAX_VISIBLE_LIGHTS); li++)
    {
        Light dl = GetAdditionalLight(li, positionWS);
        c += RainbowBRDF(dl.direction, dl.color * dl.distanceAttenuation, N, V, diffuse, F0, rough);
    }
#endif
    LIGHT_LOOP_BEGIN(lightCount)
        Light al = GetAdditionalLight(lightIndex, positionWS);
        c += RainbowBRDF(al.direction, al.color * al.distanceAttenuation, N, V, diffuse, F0, rough);
    LIGHT_LOOP_END
#endif
    return c;
}

#endif // RAINBOW_ENV_LIGHTING_INCLUDED
