// Benny's plush material for URP 17 (hand-written so it renders immediately; the math lives in RainbowFluff.hlsl, which the
// coordinator can also wrap in a Shader Graph Custom Function node). Works on MeshRenderer and SkinnedMeshRenderer.
Shader "Rainbow/Benny/Fluff"
{
    Properties
    {
        [MainTexture] _BaseMap ("Baked Radiance (benny31 bake.png)", 2D) = "white" {}
        [MainColor] _BaseColor ("Tint", Color) = (1, 1, 1, 1)
        _BakeGain ("Bake Gain (benny31.ts K = 4)", Float) = 4
        _LightInfluence ("Scene Light Influence", Range(0, 1)) = 0.35
        _Wrap ("Wrap Lighting", Range(0, 1)) = 0.6
        _FuzzColor ("Fuzz Rim Colour", Color) = (1, 0.82, 0.93, 1)
        _FuzzPower ("Fuzz Rim Power", Range(0.5, 8)) = 2.6
        _FuzzStrength ("Fuzz Rim Strength", Range(0, 2)) = 0.35
        _NoiseScale ("Fur Noise Scale", Float) = 70
        _NoiseStrength ("Fur Noise Strength", Range(0, 0.5)) = 0.07
    }

    SubShader
    {
        Tags { "RenderType" = "Opaque" "Queue" = "Geometry" "RenderPipeline" = "UniversalPipeline" }

        HLSLINCLUDE
        #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

        TEXTURE2D(_BaseMap);
        SAMPLER(sampler_BaseMap);

        CBUFFER_START(UnityPerMaterial)
            float4 _BaseMap_ST;
            half4 _BaseColor;
            half _BakeGain;
            half _LightInfluence;
            half _Wrap;
            half4 _FuzzColor;
            half _FuzzPower;
            half _FuzzStrength;
            float _NoiseScale;
            half _NoiseStrength;
        CBUFFER_END
        ENDHLSL

        Pass
        {
            Name "ForwardLit"
            Tags { "LightMode" = "UniversalForward" }
            Cull Back
            ZWrite On

            HLSLPROGRAM
            #pragma target 3.0
            #pragma vertex vert
            #pragma fragment frag
            #pragma multi_compile_fog
            #pragma multi_compile_instancing
            #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE _MAIN_LIGHT_SHADOWS_SCREEN

            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
            #include "RainbowFluff.hlsl"

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
                float2 uv : TEXCOORD0;
                float3 positionWS : TEXCOORD1;
                float3 normalWS : TEXCOORD2;
                float3 positionOS : TEXCOORD3;
                half fogFactor : TEXCOORD4;
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };

            Varyings vert(Attributes v)
            {
                Varyings o = (Varyings)0;
                UNITY_SETUP_INSTANCE_ID(v);
                UNITY_TRANSFER_INSTANCE_ID(v, o);
                VertexPositionInputs p = GetVertexPositionInputs(v.positionOS.xyz);
                VertexNormalInputs n = GetVertexNormalInputs(v.normalOS);
                o.positionCS = p.positionCS;
                o.positionWS = p.positionWS;
                o.normalWS = n.normalWS;
                o.positionOS = v.positionOS.xyz;
                o.uv = TRANSFORM_TEX(v.uv, _BaseMap);
                o.fogFactor = ComputeFogFactor(p.positionCS.z);
                return o;
            }

            half4 frag(Varyings i) : SV_Target
            {
                UNITY_SETUP_INSTANCE_ID(i);
                half4 tex = SAMPLE_TEXTURE2D(_BaseMap, sampler_BaseMap, i.uv) * _BaseColor;
                float4 shadowCoord = TransformWorldToShadowCoord(i.positionWS);
                Light mainLight = GetMainLight(shadowCoord);
                float3 N = normalize(i.normalWS);
                float3 V = GetWorldSpaceNormalizeViewDir(i.positionWS);
                float3 ambient = SampleSH(N);
                float3 col;
                RainbowFluff_float(tex.rgb, _BakeGain, N, V, mainLight.direction, mainLight.color,
                    mainLight.shadowAttenuation * mainLight.distanceAttenuation, ambient, _LightInfluence, _Wrap,
                    _FuzzColor.rgb, _FuzzPower, _FuzzStrength, i.positionOS * _NoiseScale, _NoiseStrength, col);
                col = MixFog(col, i.fogFactor);
                return half4(col, 1.0);
            }
            ENDHLSL
        }

        // depth for the camera depth texture (water / foam soft edges depth-test against Benny)
        Pass
        {
            Name "DepthOnly"
            Tags { "LightMode" = "DepthOnly" }
            ZWrite On
            ColorMask R
            Cull Back

            HLSLPROGRAM
            #pragma target 3.0
            #pragma vertex dvert
            #pragma fragment dfrag
            #pragma multi_compile_instancing

            struct DAttributes
            {
                float4 positionOS : POSITION;
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };

            struct DVaryings
            {
                float4 positionCS : SV_POSITION;
            };

            DVaryings dvert(DAttributes v)
            {
                DVaryings o;
                UNITY_SETUP_INSTANCE_ID(v);
                o.positionCS = TransformObjectToHClip(v.positionOS.xyz);
                return o;
            }

            half dfrag(DVaryings i) : SV_Target
            {
                return i.positionCS.z;
            }
            ENDHLSL
        }
    }
    FallBack Off
}
