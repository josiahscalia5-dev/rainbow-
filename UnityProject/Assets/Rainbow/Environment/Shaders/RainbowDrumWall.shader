// Rainbow Screen 05 - purple washer-drum tunnel wall (Agent 2). Hand-written URP 17 shader around RainbowDrumWall.hlsl
// (the same .hlsl is the Shader Graph Custom Function). Mesh: DrumMeshes05.BuildWall (UV0 = arc metres, s metres;
// normals point into the tunnel). Opaque, no shadow caster (the closed tube must not shadow the scene's key light).
Shader "Rainbow/Screen05/DrumWall"
{
    Properties
    {
        _BaseColor ("Metal F0 (lavender)", Color) = (0.863, 0.620, 0.941, 1)
        _HoleColor ("Slot interior", Color) = (0.047, 0.0, 0.078, 1)
        _EmissionColor ("Emission colour", Color) = (0.235, 0.031, 0.282, 1)
        _EmissionStrength ("Emission strength", Float) = 0.16
        _Metallic ("Metallic", Range(0, 1)) = 0.92
        _Roughness ("Roughness", Range(0.02, 1)) = 0.07
        [NoScaleOffset] _EnvPano ("Reflection panorama (equirect)", 2D) = "grey" {}
        _EnvIntensity ("Reflection intensity", Float) = 0.9
        _EnvBlur ("Reflection extra blur (mip)", Float) = 0.6
        _StripColor ("Strip light colour", Color) = (1.0, 0.851, 0.965, 1)
        _StripIntensity ("Strip light intensity", Float) = 4.4
        _StripParams ("Strips (count, half width rad, -, alt)", Vector) = (28, 0.017, 0, 0.8)
        _MidTint ("Mid-tunnel tint", Color) = (0.541, 0.188, 0.824, 1)
        _MidRange ("Mid tint (near, far, amount, deep violet glow)", Vector) = (8, 50, 0.45, 0)
        _FarGlowColor ("Far glow colour", Color) = (1.0, 0.612, 0.353, 1)
        _FarGlowRange ("Far glow (near, far, strength, -)", Vector) = (80, 260, 1.6, 0)
        _SlotPitch ("Slot pitch (arc m, tube m, row offset, stagger)", Vector) = (0.7461, 1.4, 0, 0)
        _SlotSize ("Slot (half length m, half width m, coverage, lip glow)", Vector) = (0.23, 0.095, 0.076, 0.5)
        _RimColor ("Slot lip highlight", Color) = (1.0, 0.55, 0.92, 1)
        _FloorSheet ("Floor sheet (top y, blend, flow speed, strength)", Vector) = (0.06, 0.35, 0.9, 1)
        _FloorColorA ("Floor sheet colour A", Color) = (0.784, 0.122, 0.612, 1)
        _FloorColorB ("Floor sheet colour B", Color) = (1.0, 0.310, 0.753, 1)
        _Exposure ("Exposure", Float) = 1
        _LightInfluence ("Direct light influence", Float) = 1
        _WallFar ("Far wall (fade start m, fade end m, strips kept, reflection kept)", Vector) = (30, 100, 0.35, 0.8)
        _SlotWarp ("Slot rows (s0, pitch at s0, pitch growth /m, hole half length / pitch)", Vector) = (0, 0, 0, 0.2)
        _WallGlow ("Land glow (linear rgb, strength)", Vector) = (0, 0, 0, 0)
    }

    SubShader
    {
        Tags { "RenderType" = "Opaque" "RenderPipeline" = "UniversalPipeline" "Queue" = "Geometry" "IgnoreProjector" = "True" }
        Cull Off

        HLSLINCLUDE
        #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

        CBUFFER_START(UnityPerMaterial)
            float4 _BaseColor;
            float4 _HoleColor;
            float4 _EmissionColor;
            float _EmissionStrength;
            float _Metallic;
            float _Roughness;
            float _EnvIntensity;
            float _EnvBlur;
            float4 _StripColor;
            float _StripIntensity;
            float4 _StripParams;
            float4 _MidTint;
            float4 _MidRange;
            float4 _FarGlowColor;
            float4 _FarGlowRange;
            float4 _SlotPitch;
            float4 _SlotSize;
            float4 _RimColor;
            float4 _FloorSheet;
            float4 _FloorColorA;
            float4 _FloorColorB;
            float _Exposure;
            float _LightInfluence;
            float4 _WallFar;
            float4 _SlotWarp;
            float4 _WallGlow;
        CBUFFER_END

        // shared animation clock (Rainbow.Screen05.Screen05Clock; game time, reset by the test hold)
        float _RainbowTime;

        TEXTURE2D(_EnvPano);
        SAMPLER(sampler_EnvPano);
        ENDHLSL

        Pass
        {
            Name "ForwardLit"
            Tags { "LightMode" = "UniversalForward" }
            ZWrite On
            ZTest LEqual

            HLSLPROGRAM
            #pragma target 3.0
            #pragma vertex WallVert
            #pragma fragment WallFrag
            #pragma multi_compile _ _ADDITIONAL_LIGHTS_VERTEX _ADDITIONAL_LIGHTS
            #pragma multi_compile _ _CLUSTER_LIGHT_LOOP
            #pragma multi_compile_instancing
            #include_with_pragmas "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Fog.hlsl"

            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
            #include "RainbowDrumWall.hlsl"
            #include "RainbowEnvLighting.hlsl"

            struct Attributes
            {
                float4 positionOS : POSITION;
                float3 normalOS : NORMAL;
                float2 uv : TEXCOORD0;
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float3 positionWS : TEXCOORD0;
                float3 normalWS : TEXCOORD1;
                float2 uv : TEXCOORD2;
                float fogFactor : TEXCOORD3;
                UNITY_VERTEX_OUTPUT_STEREO
            };

            Varyings WallVert(Attributes input)
            {
                Varyings o = (Varyings)0;
                UNITY_SETUP_INSTANCE_ID(input);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
                VertexPositionInputs p = GetVertexPositionInputs(input.positionOS.xyz);
                o.positionCS = p.positionCS;
                o.positionWS = p.positionWS;
                o.normalWS = TransformObjectToWorldNormal(input.normalOS);
                o.uv = input.uv;
                o.fogFactor = RainbowFogFactor(p.positionCS);
                return o;
            }

            half4 WallFrag(Varyings input) : SV_Target
            {
                float3 N = normalize(input.normalWS);
                float3 V = GetWorldSpaceNormalizeViewDir(input.positionWS);
                float3 ambient = SampleSH(N);
                float3 color, albedo, emission;
                float metallic, smoothness;
                RainbowDrumWall_float(input.positionWS, N, V, input.uv, _Time.y, ambient, color, albedo, metallic, smoothness, emission);
                color += RainbowDirectLights(input.positionWS, input.positionCS, N, V, albedo, metallic, 1.0 - smoothness) * _LightInfluence * _Exposure;
                color = MixFog(color, input.fogFactor);
                return half4(color, 1.0);
            }
            ENDHLSL
        }

        Pass
        {
            Name "DepthOnly"
            Tags { "LightMode" = "DepthOnly" }
            ZWrite On
            ColorMask R

            HLSLPROGRAM
            #pragma target 3.0
            #pragma vertex DepthVert
            #pragma fragment DepthFrag
            #pragma multi_compile_instancing

            struct DAttributes { float4 positionOS : POSITION; UNITY_VERTEX_INPUT_INSTANCE_ID };
            struct DVaryings { float4 positionCS : SV_POSITION; UNITY_VERTEX_OUTPUT_STEREO };

            DVaryings DepthVert(DAttributes input)
            {
                DVaryings o = (DVaryings)0;
                UNITY_SETUP_INSTANCE_ID(input);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
                o.positionCS = TransformObjectToHClip(input.positionOS.xyz);
                return o;
            }

            half DepthFrag(DVaryings input) : SV_Target
            {
                return input.positionCS.z;
            }
            ENDHLSL
        }

        Pass
        {
            Name "DepthNormals"
            Tags { "LightMode" = "DepthNormals" }
            ZWrite On

            HLSLPROGRAM
            #pragma target 3.0
            #pragma vertex DNVert
            #pragma fragment DNFrag
            #pragma multi_compile_instancing
            #pragma multi_compile_fragment _ _GBUFFER_NORMALS_OCT

            struct NAttributes { float4 positionOS : POSITION; float3 normalOS : NORMAL; UNITY_VERTEX_INPUT_INSTANCE_ID };
            struct NVaryings { float4 positionCS : SV_POSITION; float3 normalWS : TEXCOORD0; UNITY_VERTEX_OUTPUT_STEREO };

            NVaryings DNVert(NAttributes input)
            {
                NVaryings o = (NVaryings)0;
                UNITY_SETUP_INSTANCE_ID(input);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
                o.positionCS = TransformObjectToHClip(input.positionOS.xyz);
                o.normalWS = TransformObjectToWorldNormal(input.normalOS);
                return o;
            }

            half4 DNFrag(NVaryings input) : SV_Target
            {
                float3 n = normalize(input.normalWS);
            #if defined(_GBUFFER_NORMALS_OCT)
                float2 octNormalWS = PackNormalOctQuadEncode(n);
                float2 remapped = saturate(octNormalWS * 0.5 + 0.5);
                return half4(PackFloat2To888(remapped), 0.0);
            #else
                return half4(n, 0.0);
            #endif
            }
            ENDHLSL
        }
    }
    FallBack Off
}
