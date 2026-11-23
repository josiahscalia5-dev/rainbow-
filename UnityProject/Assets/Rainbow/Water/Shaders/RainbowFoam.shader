// Rainbow Screen 05 - soap-foam puffs (Agent 3). Hand-written URP wrapper around RainbowFoam.hlsl.
// Mesh: FoamBank chunks (UV0 = (seed, ao), UV1 = (puff centre xyz, radius), object = world at identity).
Shader "Rainbow/Water/Foam"
{
    Properties
    {
        _FoamLightDir ("Spec light direction (toward the light)", Vector) = (0.264, 0.88, -0.396, 0)
        _Brightness ("Brightness", Range(0.5, 1.5)) = 1.0
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
        CBUFFER_END

        #include "Assets/Rainbow/Water/Shaders/RainbowFoam.hlsl"

        struct FoamAttributes
        {
            float4 positionOS : POSITION;
            float3 normalOS   : NORMAL;
            float2 uv0        : TEXCOORD0;   // seed, ao
            float4 uv1        : TEXCOORD1;   // centre (object space), radius
            UNITY_VERTEX_INPUT_INSTANCE_ID
        };

        void FoamWorld(FoamAttributes v, out float3 positionWS, out float4 centreRadius)
        {
            float3 c = TransformObjectToWorld(v.uv1.xyz);
            float3 p = TransformObjectToWorld(v.positionOS.xyz);
            centreRadius = float4(c, v.uv1.w);
            RainbowFoamVertex_float(p, centreRadius, v.uv0.x, _Time.y, positionWS);
        }
        ENDHLSL

        Pass
        {
            Name "ForwardLit"
            Tags { "LightMode" = "UniversalForward" }
            Cull Back
            ZWrite On

            HLSLPROGRAM
            #pragma target 3.0
            #pragma vertex FoamVert
            #pragma fragment FoamFrag
            #pragma multi_compile_fog

            struct Varyings
            {
                float4 positionCS   : SV_POSITION;
                float3 positionWS   : TEXCOORD0;
                float4 centreRadius : TEXCOORD1;
                float2 seedAO       : TEXCOORD2;
                float  fogFactor    : TEXCOORD3;
                UNITY_VERTEX_OUTPUT_STEREO
            };

            Varyings FoamVert(FoamAttributes v)
            {
                Varyings o = (Varyings)0;
                UNITY_SETUP_INSTANCE_ID(v);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
                float3 pw;
                float4 cr;
                FoamWorld(v, pw, cr);
                o.positionWS = pw;
                o.centreRadius = cr;
                o.seedAO = v.uv0;
                o.positionCS = TransformWorldToHClip(pw);
                o.fogFactor = ComputeFogFactor(o.positionCS.z);
                return o;
            }

            half4 FoamFrag(Varyings i) : SV_Target
            {
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);
                float3 viewDir = GetWorldSpaceNormalizeViewDir(i.positionWS);
                float3 col;
                RainbowFoam_float(i.positionWS, i.centreRadius, i.seedAO.x, i.seedAO.y, viewDir, _FoamLightDir.xyz, col);
                col *= _Brightness;
                col = MixFog(col, i.fogFactor);
                return half4(col, 1.0);
            }
            ENDHLSL
        }

        Pass
        {
            Name "DepthOnly"
            Tags { "LightMode" = "DepthOnly" }
            Cull Back
            ZWrite On
            ColorMask R

            HLSLPROGRAM
            #pragma target 3.0
            #pragma vertex DepthVert
            #pragma fragment DepthFrag

            struct DepthVaryings
            {
                float4 positionCS : SV_POSITION;
                UNITY_VERTEX_OUTPUT_STEREO
            };

            DepthVaryings DepthVert(FoamAttributes v)
            {
                DepthVaryings o = (DepthVaryings)0;
                UNITY_SETUP_INSTANCE_ID(v);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
                float3 pw;
                float4 cr;
                FoamWorld(v, pw, cr);
                o.positionCS = TransformWorldToHClip(pw);
                return o;
            }

            half DepthFrag(DepthVaryings i) : SV_Target
            {
                return i.positionCS.z;
            }
            ENDHLSL
        }

        Pass
        {
            Name "DepthNormals"
            Tags { "LightMode" = "DepthNormals" }
            Cull Back
            ZWrite On

            HLSLPROGRAM
            #pragma target 3.0
            #pragma vertex DepthNormalsVert
            #pragma fragment DepthNormalsFrag
            #pragma multi_compile_fragment _ _GBUFFER_NORMALS_OCT

            struct DNVaryings
            {
                float4 positionCS : SV_POSITION;
                float3 normalWS   : TEXCOORD0;
                UNITY_VERTEX_OUTPUT_STEREO
            };

            DNVaryings DepthNormalsVert(FoamAttributes v)
            {
                DNVaryings o = (DNVaryings)0;
                UNITY_SETUP_INSTANCE_ID(v);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
                float3 pw;
                float4 cr;
                FoamWorld(v, pw, cr);
                o.positionCS = TransformWorldToHClip(pw);
                o.normalWS = normalize(pw - cr.xyz);
                return o;
            }

            half4 DepthNormalsFrag(DNVaryings i) : SV_Target
            {
                float3 normalWS = normalize(i.normalWS);
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
