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
        _W4Look ("Lane gain, core gain, broad streak, fine streak", Vector) = (0.75, 0.3, 0.55, 0.5)
        _W4Edge ("Streaky band edges", Float) = 1
        _W4Band ("Band edge scale, outer strip violet, grade highlight protection, -", Vector) = (0.87, 0.5, 0.8, 0)
        _RiverGrade ("Cyan water grade (rgb multiplier on the cyan/blue water, a = strength; 0 = off)", Vector) = (1, 1, 1, 0)
        [NoScaleOffset] _SilkTex ("Silk (R value, G glints, BA ripple normal)", 2D) = "gray" {}
        [NoScaleOffset] _RiverRamp ("Colour ramp (q, silk value)", 2D) = "white" {}
        _SilkLook ("Edge streakiness, edge drift, ripple normal, ripple emboss", Vector) = (0.3, 0.25, 0.35, 0.3)
        _GlintLook ("Glint mix, glint glow, -, -", Vector) = (0.75, 0.9, 0, 0)
        [NoScaleOffset] _RiverSheen ("Broad sheen (q, log distance)", 2D) = "gray" {}
        [NoScaleOffset] _WakeSheen ("Standing wake (dl, back)", 2D) = "black" {}
        [NoScaleOffset] _LaceTex ("Foam lace", 2D) = "black" {}
        _SheenLook ("Sheen strength, streak detail, wake streak detail, vignette compensation", Vector) = (0.85, 0.75, 0.5, 1)
        _LatherLook ("Wake lather: amount, web threshold at 0, at 1, opacity", Vector) = (1.1, 0.8, 0.1, 2.6)
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
            float4 _RiverGrade;
            float4 _W4Look;
            float _W4Edge;
            float4 _W4Band;
            float4 _SilkLook;
            float4 _GlintLook;
            float4 _SheenLook;
            float4 _LatherLook;
        CBUFFER_END
        #define RBW_HAS_LOOK

        // shared animation clock (Rainbow.Screen05.Screen05Clock; game time, reset by the test hold)
        float _RainbowTime;

        // globals written every frame by Rainbow.Screen05.SplashWake (zero = no Benny)
        float4 _RainbowBenny;     // x = s (world z), y = world x, z = wake strength 0..1, w = waterline radius (0 = no Benny)
        float4 _RainbowSplash;    // x = world x, y = world z, z = age (s), w = strength

        #include "Assets/Rainbow/Water/Shaders/RainbowRiver.hlsl"

        struct RiverAttributes
        {
            float4 positionOS : POSITION;
            float3 normalOS   : NORMAL;
            float4 uv1        : TEXCOORD1;
            float4 uv2        : TEXCOORD2;
            float4 uv3        : TEXCOORD3;
            UNITY_VERTEX_INPUT_INSTANCE_ID
        };

        float3 RiverWorldPosition(float3 positionOS, float4 stream)
        {
            float3 pw = TransformObjectToWorld(positionOS);
            pw.y += RBW_RiverWave(pw.x, pw.z, stream.x, stream.y, _SOffset, _WaveAmp, _RainbowTime);
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
                float4 edgeA      : TEXCOORD4;
                float4 edgeB      : TEXCOORD5;
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
                o.edgeA = v.uv2;
                o.edgeB = v.uv3;
                o.fogFactor = ComputeFogFactor(o.positionCS.z);
                return o;
            }

            half4 RiverFrag(Varyings i) : SV_Target
            {
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);
                float3 viewDir = GetWorldSpaceNormalizeViewDir(i.positionWS);
                float3 col, reflDir, reflTint;
                float reflW;
                RainbowRiver_float(i.positionWS, i.normalWS, viewDir, i.stream, i.edgeA, i.edgeB, _RainbowBenny, _RainbowSplash,
                                   float4(_SOffset, _CoreSwing, _FlowSpeed, _RainbowTime), _RiverLightDir.xyz,
                                   col, reflDir, reflTint, reflW);
                float2 puv = RBW_PanoUV(RBW_RotateY(reflDir, _EnvYaw));
                float3 env = SAMPLE_TEXTURE2D_LOD(_EnvPano, sampler_EnvPano, puv, _EnvLod).rgb;
                float3 outCol;
                RainbowRiverReflect_float(col, env, reflTint, reflW, _EnvStrength, outCol);
                // coordinator round 3 (2026-11-23): the approved water is a deeper AZURE blue (near water ~(60,162,235),
                // median luminance ~125) than the aqua Unity water (~(90,196,244), ~160). Grade only the cyan/blue water
                // (green and blue both well above red), never the pink currents, white foam lines or glints.
                float cyanK = saturate((min(outCol.g, outCol.b) - outCol.r) * 3.0) * saturate(1.5 - max(outCol.r, 0.0) * 1.5) * (1.0 - _W4Band.z * smoothstep(0.62, 0.95, outCol.g));
                outCol = lerp(outCol, outCol * _RiverGrade.rgb, cyanK * _RiverGrade.a);
                // round 8: the scene vignette would dim the measured water colours (the approved water is as bright at the edges)
                float2 vd = abs(i.positionCS.xy / _ScaledScreenParams.xy - 0.5) * 0.57;
                float vf = saturate(1.0 - dot(vd, vd));
                outCol /= lerp(1.0, max(vf * vf, 0.6), _SheenLook.w);
                outCol = lerp(outCol, MixFog(outCol, i.fogFactor), 0.4);   // round 8: the far river stays saturated up to the throat
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
