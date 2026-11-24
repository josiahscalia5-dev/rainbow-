// Rainbow Screen 05 - far river chord inside the throat (Agent 2). Unlit opaque. Mesh: DrumMeshes05.BuildFarRiver
// (UV0 = (lateral x m, s m), y just under the water plane so Agent 3's river wins where both overlap).
Shader "Rainbow/Screen05/FarRiver"
{
    Properties
    {
        _RiverCore ("Core colour (linear)", Vector) = (0.08, 0.6, 1.3, 1)
        _RiverBand ("Band colour (linear)", Vector) = (0.75, 0.1, 0.66, 1)
        _RiverFoam ("Foam colour (linear)", Vector) = (0.95, 0.92, 1.0, 1)
        _RiverParams ("River (half width, flow speed, band offset, band half width)", Vector) = (6.27, 11, 0.55, 0.11)
        [NoScaleOffset] _EnvPano ("Reflection panorama (equirect)", 2D) = "grey" {}
        _EnvIntensity ("Reflection intensity", Float) = 0.6
        _EnvBlur ("Reflection extra blur (mip)", Float) = 1.5
        _StripColor ("Strip colour (unused)", Color) = (1, 1, 1, 1)
        _StripIntensity ("Strip intensity (unused)", Float) = 0
        _StripParams ("Strips (unused)", Vector) = (28, 0.02, 0, 0.8)
        _MidTint ("Mid tint (unused)", Color) = (0.541, 0.188, 0.824, 1)
        _MidRange ("Mid range (unused)", Vector) = (8, 50, 0, 0)
        _FarGlowColor ("Far glow colour", Color) = (1.0, 0.612, 0.353, 1)
        _FarGlowRange ("Far glow (near, far, strength, -)", Vector) = (80, 260, 1.6, 0)
        _Exposure ("Exposure", Float) = 1
    }

    SubShader
    {
        Tags { "RenderType" = "Opaque" "RenderPipeline" = "UniversalPipeline" "Queue" = "Geometry" "IgnoreProjector" = "True" }
        Cull Off

        HLSLINCLUDE
        #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

        CBUFFER_START(UnityPerMaterial)
            float4 _RiverCore;
            float4 _RiverBand;
            float4 _RiverFoam;
            float4 _RiverParams;
            float _EnvIntensity;
            float _EnvBlur;
            float4 _StripColor;
            float _StripIntensity;
            float4 _StripParams;
            float4 _MidTint;
            float4 _MidRange;
            float4 _FarGlowColor;
            float4 _FarGlowRange;
            float _Exposure;
        CBUFFER_END

        // shared animation clock (Rainbow.Screen05.Screen05Clock; game time, reset by the test hold)
        float _RainbowTime;

        TEXTURE2D(_EnvPano);
        SAMPLER(sampler_EnvPano);
        ENDHLSL

        Pass
        {
            Name "Unlit"
            Tags { "LightMode" = "UniversalForward" }
            ZWrite On

            HLSLPROGRAM
            #pragma target 3.0
            #pragma vertex RiverVert
            #pragma fragment RiverFrag
            #pragma multi_compile_instancing
            #include "RainbowFarRiver.hlsl"

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
                UNITY_VERTEX_OUTPUT_STEREO
            };

            Varyings RiverVert(Attributes input)
            {
                Varyings o = (Varyings)0;
                UNITY_SETUP_INSTANCE_ID(input);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
                VertexPositionInputs p = GetVertexPositionInputs(input.positionOS.xyz);
                o.positionCS = p.positionCS;
                o.positionWS = p.positionWS;
                o.normalWS = TransformObjectToWorldNormal(input.normalOS);
                o.uv = input.uv;
                return o;
            }

            half4 RiverFrag(Varyings input) : SV_Target
            {
                float3 V = GetWorldSpaceNormalizeViewDir(input.positionWS);
                float3 color;
                RainbowFarRiver_float(input.positionWS, input.normalWS, V, input.uv, _RainbowTime, color);
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
    }
    FallBack Off
}
