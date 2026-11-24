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
        _UnderShade ("Underside shade where he sits in the water (splash6, 0 = off)", Range(0, 1)) = 0
        _UnderHeight ("Underside shade height above the water (units)", Float) = 0.28
        _UnderColor ("Underside shade multiply colour", Color) = (0.62, 0.36, 0.78, 1)
        _WaterBand ("See-through azure waterline band (0 = off)", Range(0, 1)) = 0
        _FurTint ("Pink fur colour match (rgb multiplier, strength)", Vector) = (0.96, 1.27, 0.76, 1)
    }

    SubShader
    {
        Tags { "RenderType" = "Opaque" "Queue" = "Geometry" "RenderPipeline" = "UniversalPipeline" }

        HLSLINCLUDE
        #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

        TEXTURE2D(_BaseMap);
        SAMPLER(sampler_BaseMap);

        CBUFFER_START(UnityPerMaterial)
            float4 _FurTint;
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
            half _UnderShade;
            float _UnderHeight;
            half4 _UnderColor;
            half _WaterBand;
        CBUFFER_END
        float4 _RainbowBenny;
        // (splash6) set by SplashWake every frame: x = water height under Benny, y = contact 0..1, w = 1 when present
        float4 _RainbowBennyWater;
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
                // round 8 (2026-11-24): colour match of the approved fur under this grade (measured: approved (247,88,179), Unity (253,61,213) =
                // too magenta); pale tips on the arms and speckles on the body become pink fur
                {
                    float mx = max(col.r, max(col.g, col.b)), mn = min(col.r, min(col.g, col.b));
                    float pinkW = smoothstep(0.02, 0.22, (col.r - col.b) / max(col.r, 1e-3)) * (1.0 - smoothstep(0.38, 0.6, col.g / max(col.r, 1e-3)));
                    col = lerp(col, col * _FurTint.rgb, pinkW * _FurTint.a);
                    float hB = i.positionWS.y - _RainbowBennyWater.x;
                    float dxB = abs(i.positionWS.x - _RainbowBenny.y);
                    float bodyZone = (1.0 - smoothstep(0.60, 0.72, hB)) * _RainbowBennyWater.w;
                    float armZone = smoothstep(0.72, 0.82, dxB) * (1.0 - smoothstep(0.82, 0.95, hB)) * _RainbowBennyWater.w;
                    float pale = smoothstep(0.28, 0.62, mn / max(mx, 1e-3));
                    float lum = dot(col, float3(0.3, 0.5, 0.2));
                    col = lerp(col, float3(0.84, 0.21, 0.48) * (0.62 + 0.55 * lum), pale * armZone * 0.85);
                    col = lerp(col, float3(0.95, 0.33, 0.6) * (0.5 + 0.6 * lum), pale * bodyZone * (1.0 - armZone) * 0.6);
                }
                // (splash6) he sits IN the water: the fur darkens toward the waterline (soft, no hard edge) and a thin
                // see-through azure band right at the water
                float wOn = _RainbowBennyWater.w * saturate(_RainbowBennyWater.y);
                float hW = i.positionWS.y - _RainbowBennyWater.x;
                float under = (1.0 - smoothstep(-0.02, max(_UnderHeight, 0.01), hW)) * wOn;
                col = lerp(col, col * _UnderColor.rgb, under * _UnderShade);
                float band = (1.0 - smoothstep(0.0, 0.06, abs(hW - 0.015))) * wOn;
                col = lerp(col, float3(0.08, 0.42, 0.82), band * _WaterBand);
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
