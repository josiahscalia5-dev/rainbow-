// Rainbow Screen 05 - soap-foam bank bubbles (foam area, round 2 2026-11-23). Hand-written URP wrapper around
// RainbowFoam.hlsl: camera-facing sphere IMPOSTORS with the true per-pixel sphere depth (all passes write SV_Depth, so
// the depth texture, soft particles and SSAO see round bubbles sunk into the water, not flat quads).
// Mesh: FoamBank chunks (POSITION = puff centre, UV0 = (corner x, corner y, radius, seed), UV1 = (ao, tint, stream
// centre, stream half width)); the object sits at the identity transform (world-space puffs).
Shader "Rainbow/Water/Foam"
{
    Properties
    {
        _FoamLightDir ("Spec light direction (toward the light)", Vector) = (0.264, 0.88, -0.396, 0)
        _Brightness ("Brightness", Range(0.5, 1.5)) = 1.0
        _SOffset ("Three.js master-s offset (s + offset)", Float) = 116.7
        _WaveAmp ("River swell amplitude (units)", Float) = 0.1
    }

    SubShader
    {
        Tags { "RenderType" = "Opaque" "Queue" = "Geometry" "RenderPipeline" = "UniversalPipeline" "IgnoreProjector" = "True" }
        LOD 300

        HLSLINCLUDE
        #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

        CBUFFER_START(UnityPerMaterial)
            float4 _FoamLightDir;
            float _Brightness;
            float _SOffset;
            float _WaveAmp;
        CBUFFER_END

        // shared animation clock (Rainbow.Screen05.Screen05Clock; game time, reset by the test hold)
        float _RainbowTime;

        // global written every frame by Rainbow.Screen05.SplashWake (zero = no Benny)
        float4 _RainbowBenny;     // x = s (world z), y = world x, z = wake strength, w = waterline radius

        #include "Assets/Rainbow/Water/Shaders/RainbowFoam.hlsl"

        struct FoamAttributes
        {
            float4 positionOS : POSITION;    // puff centre
            float4 uv0        : TEXCOORD0;   // corner x, corner y, radius, seed
            float4 uv1        : TEXCOORD1;   // ao, tint, stream centre x, stream half width
            UNITY_VERTEX_INPUT_INSTANCE_ID
        };

        struct FoamVaryings
        {
            float4 positionCS   : SV_POSITION;
            float3 positionWS   : TEXCOORD0;   // quad point on the sphere's front tangent plane
            float4 centreRadius : TEXCOORD1;
            float4 cornerSeed   : TEXCOORD2;   // corner xy, seed, ao
            float2 tintFog      : TEXCOORD3;   // tint, fog factor
            UNITY_VERTEX_OUTPUT_STEREO
        };

        FoamVaryings FoamVert(FoamAttributes v)
        {
            FoamVaryings o = (FoamVaryings)0;
            UNITY_SETUP_INSTANCE_ID(v);
            UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
            float3 pw;
            float4 cr;
            RBW_FoamVertex(TransformObjectToWorld(v.positionOS.xyz), v.uv0, v.uv1, _SOffset, _WaveAmp, _RainbowBenny,
                           _Time.y, pw, cr);
            o.positionWS = pw;
            o.centreRadius = cr;
            o.cornerSeed = float4(v.uv0.xy, v.uv0.w, v.uv1.x);
            o.positionCS = TransformWorldToHClip(pw);
            o.tintFog = float2(v.uv1.y, ComputeFogFactor(o.positionCS.z));
            return o;
        }
        ENDHLSL

        Pass
        {
            Name "ForwardLit"
            Tags { "LightMode" = "UniversalForward" }
            Cull Off
            ZWrite On
            ZTest LEqual

            HLSLPROGRAM
            #pragma target 3.0
            #pragma vertex FoamVert
            #pragma fragment FoamFrag
            #pragma multi_compile_fog

            half4 FoamFrag(FoamVaryings i, out float outDepth : SV_Depth) : SV_Target
            {
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);
                float px = RBW_FoamPx(i.cornerSeed.xy);
                float3 P, N;
                float h = RBW_FoamTrace(i.positionWS, i.centreRadius, P, N);
                float3 Nv = TransformWorldToViewDir(N, false);
                float3 col = RBW_FoamColor(Nv, px, i.cornerSeed.z, i.cornerSeed.w, i.tintFog.x, _FoamLightDir.xyz);
                clip(RBW_FoamKeep(h, Nv.xy, px, i.cornerSeed.z));
                outDepth = RBW_FoamDepth(P);
                col *= _Brightness;
                col = MixFog(col, i.tintFog.y);
                return half4(col, 1.0);
            }
            ENDHLSL
        }

        Pass
        {
            Name "DepthOnly"
            Tags { "LightMode" = "DepthOnly" }
            Cull Off
            ZWrite On
            ColorMask R

            HLSLPROGRAM
            #pragma target 3.0
            #pragma vertex FoamVert
            #pragma fragment DepthFrag

            half DepthFrag(FoamVaryings i, out float outDepth : SV_Depth) : SV_Target
            {
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);
                float px = RBW_FoamPx(i.cornerSeed.xy);
                float3 P, N;
                float h = RBW_FoamTrace(i.positionWS, i.centreRadius, P, N);
                float3 Nv = TransformWorldToViewDir(N, false);
                clip(RBW_FoamKeep(h, Nv.xy, px, i.cornerSeed.z));
                outDepth = RBW_FoamDepth(P);
                return outDepth;
            }
            ENDHLSL
        }

        Pass
        {
            Name "DepthNormals"
            Tags { "LightMode" = "DepthNormals" }
            Cull Off
            ZWrite On

            HLSLPROGRAM
            #pragma target 3.0
            #pragma vertex FoamVert
            #pragma fragment DepthNormalsFrag
            #pragma multi_compile_fragment _ _GBUFFER_NORMALS_OCT

            half4 DepthNormalsFrag(FoamVaryings i, out float outDepth : SV_Depth) : SV_Target
            {
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);
                float px = RBW_FoamPx(i.cornerSeed.xy);
                float3 P, N;
                float h = RBW_FoamTrace(i.positionWS, i.centreRadius, P, N);
                float3 Nv = TransformWorldToViewDir(N, false);
                clip(RBW_FoamKeep(h, Nv.xy, px, i.cornerSeed.z));
                outDepth = RBW_FoamDepth(P);
                float3 normalWS = normalize(N);
                #if defined(_GBUFFER_NORMALS_OCT)
                    float2 octNormalWS = PackNormalOctQuadEncode(normalWS);
                    float2 remapped = saturate(octNormalWS * 0.5 + 0.5);
                    return half4(half3(PackFloat2To888(remapped)), 0.0);
                #else
                    return half4(normalWS, 0.0);
                #endif
            }
            ENDHLSL
        }
    }
    FallBack Off
}
