// Rainbow Screen 05 - polished gold / copper (Agent 2): ring bands, wall paddles, near frame.
// Hand-written URP 17 shader around RainbowGoldMetal.hlsl (the same .hlsl holds the Shader Graph Custom Functions).
// Mode keyword per material (set by EnvironmentBuilder): _GOLD_RING, _GOLD_PADDLE or _GOLD_FRAME.
Shader "Rainbow/Screen05/GoldMetal"
{
    Properties
    {
        [KeywordEnum(Ring, Paddle, Frame)] _Gold ("Mode", Float) = 0
        _GoldMode ("Mode (Shader Graph dispatcher)", Float) = 0
        _BandG ("Ring profile (main z, main half w, lip z, lip half w)", Vector) = (0.21, 0.4, -0.45, 0.16)
        _BandS ("Marquee spots (per turn, half width, strength, -)", Vector) = (20, 0.055, 1.6, 0)
        _BandF ("Deep fade (near, far, -, -)", Vector) = (44, 110, 0, 0)
        _PaddleParams ("Paddle (env highlight, streaks, contour, -)", Vector) = (0.55, 0.12, 1, 0)
        _FrameParams ("Frame (glint strength, glint frequency, -, -)", Vector) = (0.3, 0.06, 0, 0)
        [NoScaleOffset] _EnvPano ("Reflection panorama (equirect)", 2D) = "grey" {}
        _EnvIntensity ("Reflection intensity", Float) = 1.15
        _EnvBlur ("Reflection extra blur (mip)", Float) = 1.0
        _StripColor ("Strip light colour", Color) = (1.0, 0.941, 0.784, 1)
        _StripIntensity ("Strip light intensity", Float) = 2.4
        _StripParams ("Strips (count, half width rad, -, alt)", Vector) = (28, 0.022, 0, 0.65)
        _MidTint ("Mid tint (unused by gold)", Color) = (0.541, 0.188, 0.824, 1)
        _MidRange ("Mid tint range (unused by gold)", Vector) = (8, 50, 0, 0)
        _FarGlowColor ("Far glow colour", Color) = (1.0, 0.612, 0.353, 1)
        _FarGlowRange ("Far glow (near, far, strength, -)", Vector) = (80, 260, 1.6, 0)
        _Exposure ("Exposure", Float) = 1
        _LightInfluence ("Direct light influence", Float) = 0.25
        _GoldTone ("Ring tone curve (exponents r, g, b, amount)", Vector) = (1, 1, 1, 0)
        _RingLook ("Polished ring (key highlight, sharpness, reflection, cavity dark)", Vector) = (0, 40, 0.5, 0.6)
        _RingLook2 ("Copper ring round 4 (crest strength, bulb halo, brightness, palette 0 old / 1 copper)", Vector) = (0.8, 0.5, 1, 0)
        _FrameLook ("Near frame round 4 (palette 0 old / 1 copper bands, glare, vignette comp, -)", Vector) = (0, 1, 1.08, 0)
    }

    SubShader
    {
        Tags { "RenderType" = "Opaque" "RenderPipeline" = "UniversalPipeline" "Queue" = "Geometry" "IgnoreProjector" = "True" }
        Cull Off

        HLSLINCLUDE
        #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

        CBUFFER_START(UnityPerMaterial)
            float _Gold;
            float _GoldMode;
            float4 _BandG;
            float4 _BandS;
            float4 _BandF;
            float4 _PaddleParams;
            float4 _FrameParams;
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
            float _LightInfluence;
            float4 _GoldTone;
            float4 _RingLook;
            float4 _RingLook2;
            float4 _FrameLook;
        CBUFFER_END

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
            #pragma vertex GoldVert
            #pragma fragment GoldFrag
            #pragma shader_feature_local _GOLD_RING _GOLD_PADDLE _GOLD_FRAME
            #pragma multi_compile _ _ADDITIONAL_LIGHTS_VERTEX _ADDITIONAL_LIGHTS
            #pragma multi_compile _ _CLUSTER_LIGHT_LOOP
            #pragma multi_compile_instancing
            #include_with_pragmas "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Fog.hlsl"

            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
            #include "RainbowGoldMetal.hlsl"
            #include "RainbowEnvLighting.hlsl"

            struct Attributes
            {
                float4 positionOS : POSITION;
                float3 normalOS : NORMAL;
                float4 color : COLOR;
                float2 uv0 : TEXCOORD0;
                float2 uv1 : TEXCOORD1;
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float3 positionWS : TEXCOORD0;
                float3 normalWS : TEXCOORD1;
                float3 positionOS : TEXCOORD2;
                float3 axisWS : TEXCOORD3;
                float4 color : TEXCOORD4;
                float4 uv : TEXCOORD5;
                float fogFactor : TEXCOORD6;
                UNITY_VERTEX_OUTPUT_STEREO
            };

            Varyings GoldVert(Attributes input)
            {
                Varyings o = (Varyings)0;
                UNITY_SETUP_INSTANCE_ID(input);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
                VertexPositionInputs p = GetVertexPositionInputs(input.positionOS.xyz);
                o.positionCS = p.positionCS;
                o.positionWS = p.positionWS;
                o.normalWS = TransformObjectToWorldNormal(input.normalOS);
                o.positionOS = input.positionOS.xyz;
                o.axisWS = TransformObjectToWorldDir(float3(0.0, 0.0, 1.0));
                o.color = input.color;
                o.uv = float4(input.uv0, input.uv1);
                o.fogFactor = RainbowFogFactor(p.positionCS);
                return o;
            }

            half4 GoldFrag(Varyings input) : SV_Target
            {
                float3 N = normalize(input.normalWS);
                float3 V = GetWorldSpaceNormalizeViewDir(input.positionWS);
                float3 color;
            #if defined(_GOLD_PADDLE)
                RainbowGoldPaddle_float(input.positionWS, N, V, input.color, color);
            #elif defined(_GOLD_FRAME)
                RainbowGoldFrameSide(N, V, input.uv.xy, input.uv.z, input.uv.w, color);
            #else
                RainbowGoldRing_float(input.positionWS, N, V, input.positionOS, input.axisWS, input.color, color);
            #endif
            #if !defined(_GOLD_FRAME)
                // a little live specular from the scene's lights (the stylised palette carries the look)
                float3 Nf = N * sign(dot(N, V) + 1e-4);
                color += RainbowDirectLights(input.positionWS, input.positionCS, Nf, V, saturate(color), 1.0, 0.22) * _LightInfluence * _Exposure;
                color = MixFog(color, input.fogFactor);
            #endif
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
