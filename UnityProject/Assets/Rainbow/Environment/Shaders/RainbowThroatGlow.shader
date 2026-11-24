// Rainbow Screen 05 - far throat end cap (Agent 2). Unlit, opaque, HDR core for bloom. Mesh: DrumMeshes05.BuildThroatCap
// (UV0 = position in tube radii). No fog: the throat must stay bright at the vanishing point.
Shader "Rainbow/Screen05/ThroatGlow"
{
    Properties
    {
        _ThroatIntensity ("Intensity", Float) = 1
        _ThroatParams ("Rays (strength, count, speed, radius scale)", Vector) = (0.25, 9, 0.15, 0.8)
        _ThroatRings ("Deep rings (r1, r2, half width, inner glow)", Vector) = (0, 0, 0.04, 0.5)
        _ThroatLook ("Round 4 (warm gaps 0..1, pale radius, core radius, -)", Vector) = (0, 0.4, 0.24, 0)
    }

    SubShader
    {
        Tags { "RenderType" = "Opaque" "RenderPipeline" = "UniversalPipeline" "Queue" = "Geometry" "IgnoreProjector" = "True" }
        Cull Off

        HLSLINCLUDE
        #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

        CBUFFER_START(UnityPerMaterial)
            float _ThroatIntensity;
            float4 _ThroatParams;
            float4 _ThroatRings;
            float4 _ThroatLook;
        CBUFFER_END

        // shared animation clock (Rainbow.Screen05.Screen05Clock; game time, reset by the test hold)
        float _RainbowTime;
        ENDHLSL

        Pass
        {
            Name "Unlit"
            Tags { "LightMode" = "UniversalForward" }
            ZWrite On

            HLSLPROGRAM
            #pragma target 3.0
            #pragma vertex ThroatVert
            #pragma fragment ThroatFrag
            #pragma multi_compile_instancing
            #include "RainbowThroatGlow.hlsl"

            struct Attributes
            {
                float4 positionOS : POSITION;
                float2 uv : TEXCOORD0;
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float2 uv : TEXCOORD0;
                UNITY_VERTEX_OUTPUT_STEREO
            };

            Varyings ThroatVert(Attributes input)
            {
                Varyings o = (Varyings)0;
                UNITY_SETUP_INSTANCE_ID(input);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
                o.positionCS = TransformObjectToHClip(input.positionOS.xyz);
                o.uv = input.uv;
                return o;
            }

            half4 ThroatFrag(Varyings input) : SV_Target
            {
                float3 color;
                RainbowThroatGlow_float(input.uv, _RainbowTime, color);
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
