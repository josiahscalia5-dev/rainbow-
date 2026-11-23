// Rainbow Screen 05 - cyan-and-pink river (Agent 3). Hand-written URP wrapper around RainbowRiver.hlsl
// (the same .hlsl is the Shader Graph Custom Function source). Opaque, unlit-style stylised shading
// (the Three.js water was a ShaderMaterial with its own light vector), env reflection from the marble05 panorama,
// URP fog, DepthOnly + DepthNormals passes (depth texture / SSAO stay correct).
// Mesh: built by RiverMeshGenerator (UV0 = (x, s), UV1 = (stream centre, stream half width, core shift, 0)).
Shader "Rainbow/Water/River"
{
    Properties
    {
        _SOffset ("Three.js master-s offset (s + offset)", Float) = 116.7
        _CoreSwing ("Cyan core swing (x course meander)", Float) = 0.9
        _FlowSpeed ("Flow speed (units / s downstream)", Float) = 14.3
        _WaveAmp ("Swell amplitude (units)", Float) = 0.1
        _RiverLightDir ("Glint light direction (toward the light)", Vector) = (0.264, 0.88, -0.396, 0)
        [NoScaleOffset] _EnvPano ("Reflection panorama (marble05, lat-long)", 2D) = "black" {}
        _EnvStrength ("Reflection strength", Range(0, 2)) = 0.9
        _EnvYaw ("Reflection yaw (degrees)", Float) = 0
        _EnvLod ("Reflection blur (mip)", Range(0, 6)) = 1
    }

    SubShader
    {
        Tags { "RenderType" = "Opaque" "Queue" = "Geometry" "RenderPipeline" = "UniversalPipeline" "IgnoreProjector" = "True" }
        LOD 300

        HLSLINCLUDE
        #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

        CBUFFER_START(UnityPerMaterial)
            float _SOffset;
            float _CoreSwing;
            float _FlowSpeed;
            float _WaveAmp;
            float4 _RiverLightDir;
            float _EnvStrength;
            float _EnvYaw;
            float _EnvLod;
        CBUFFER_END

        // globals written every frame by Rainbow.Screen05.SplashWake (zero = no Benny)
        float4 _RainbowBenny;     // x = s (world z), y = world x, z = wake strength 0..1, w = waterline radius (0 = no Benny)
        float4 _RainbowSplash;    // x = world x, y = world z, z = age (s), w = strength

        #include "Assets/Rainbow/Water/Shaders/RainbowRiver.hlsl"

        struct RiverAttributes
        {
            float4 positionOS : POSITION;
            float3 normalOS   : NORMAL;
            float4 uv1        : TEXCOORD1;
            UNITY_VERTEX_INPUT_INSTANCE_ID
        };

        float3 RiverWorldPosition(float3 positionOS, float4 stream)
        {
            float3 pw = TransformObjectToWorld(positionOS);
            pw.y += RBW_RiverWave(pw.x, pw.z, stream.x, stream.y, _SOffset, _WaveAmp, _Time.y);
            return pw;
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
            #pragma vertex RiverVert
            #pragma fragment RiverFrag
            #pragma multi_compile_fog

            TEXTURE2D(_EnvPano);
            SAMPLER(sampler_EnvPano);

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float3 positionWS : TEXCOORD0;
                float3 normalWS   : TEXCOORD1;
                float4 stream     : TEXCOORD2;
                float  fogFactor  : TEXCOORD3;
                UNITY_VERTEX_OUTPUT_STEREO
            };

            Varyings RiverVert(RiverAttributes v)
            {
                Varyings o = (Varyings)0;
                UNITY_SETUP_INSTANCE_ID(v);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
                float3 pw = RiverWorldPosition(v.positionOS.xyz, v.uv1);
                o.positionWS = pw;
                o.positionCS = TransformWorldToHClip(pw);
                o.normalWS = TransformObjectToWorldNormal(v.normalOS);
                o.stream = v.uv1;
                o.fogFactor = ComputeFogFactor(o.positionCS.z);
                return o;
            }

            half4 RiverFrag(Varyings i) : SV_Target
            {
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);
                float3 viewDir = GetWorldSpaceNormalizeViewDir(i.positionWS);
                float3 col, reflDir, reflTint;
                float reflW;
                RainbowRiver_float(i.positionWS, i.normalWS, viewDir, i.stream, _RainbowBenny, _RainbowSplash,
                                   float4(_SOffset, _CoreSwing, _FlowSpeed, _Time.y), _RiverLightDir.xyz,
                                   col, reflDir, reflTint, reflW);
                float2 puv = RBW_PanoUV(RBW_RotateY(reflDir, _EnvYaw));
                float3 env = SAMPLE_TEXTURE2D_LOD(_EnvPano, sampler_EnvPano, puv, _EnvLod).rgb;
                float3 outCol;
                RainbowRiverReflect_float(col, env, reflTint, reflW, _EnvStrength, outCol);
                outCol = MixFog(outCol, i.fogFactor);
                return half4(outCol, 1.0);
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
            #pragma vertex DepthVert
            #pragma fragment DepthFrag

            struct DepthVaryings
            {
                float4 positionCS : SV_POSITION;
                UNITY_VERTEX_OUTPUT_STEREO
            };

            DepthVaryings DepthVert(RiverAttributes v)
            {
                DepthVaryings o = (DepthVaryings)0;
                UNITY_SETUP_INSTANCE_ID(v);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
                o.positionCS = TransformWorldToHClip(RiverWorldPosition(v.positionOS.xyz, v.uv1));
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
            Cull Off
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

            DNVaryings DepthNormalsVert(RiverAttributes v)
            {
                DNVaryings o = (DNVaryings)0;
                UNITY_SETUP_INSTANCE_ID(v);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
                o.positionCS = TransformWorldToHClip(RiverWorldPosition(v.positionOS.xyz, v.uv1));
                o.normalWS = TransformObjectToWorldNormal(v.normalOS);
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
