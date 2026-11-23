// Gold $ coin for URP 17. Mesh (GameplayBuilder): vertex colour R = 1 on the two faces, 0 on the rim; UV0 = face art on the
// faces, UV0.x = angle (0..1) around the rim. Math in RainbowCoin.hlsl (Shader Graph Custom Function file).
Shader "Rainbow/Gameplay/Coin"
{
    Properties
    {
        [MainTexture] _FaceMap ("Face Art ($ emboss)", 2D) = "white" {}
        _EdgeBright ("Rim Bright", Color) = (1, 0.878, 0.439, 1)
        _EdgeDark ("Rim Dark", Color) = (0.753, 0.502, 0, 1)
        _EdgeCount ("Rim Ridges", Float) = 64
        _MetalColor ("Metal Base", Color) = (0.478, 0.322, 0, 1)
        _Emission ("Art Emission", Float) = 1.15
        _SpecPower ("Specular Power", Float) = 48
        _SpecStrength ("Specular Strength", Float) = 2.2
        _EnvStrength ("Reflection Strength", Float) = 0.9
    }

    SubShader
    {
        Tags { "RenderType" = "Opaque" "Queue" = "Geometry" "RenderPipeline" = "UniversalPipeline" }

        HLSLINCLUDE
        #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

        TEXTURE2D(_FaceMap);
        SAMPLER(sampler_FaceMap);

        CBUFFER_START(UnityPerMaterial)
            float4 _FaceMap_ST;
            half4 _EdgeBright;
            half4 _EdgeDark;
            half _EdgeCount;
            half4 _MetalColor;
            half _Emission;
            half _SpecPower;
            half _SpecStrength;
            half _EnvStrength;
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

            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
            #include "RainbowCoin.hlsl"

            struct Attributes
            {
                float4 positionOS : POSITION;
                float3 normalOS : NORMAL;
                float2 uv : TEXCOORD0;
                half4 color : COLOR;
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float2 uv : TEXCOORD0;
                float3 positionWS : TEXCOORD1;
                float3 normalWS : TEXCOORD2;
                half face : TEXCOORD3;
                half fogFactor : TEXCOORD4;
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };

            Varyings vert(Attributes v)
            {
                Varyings o = (Varyings)0;
                UNITY_SETUP_INSTANCE_ID(v);
                UNITY_TRANSFER_INSTANCE_ID(v, o);
                VertexPositionInputs p = GetVertexPositionInputs(v.positionOS.xyz);
                o.positionCS = p.positionCS;
                o.positionWS = p.positionWS;
                o.normalWS = TransformObjectToWorldNormal(v.normalOS);
                o.uv = v.uv;
                o.face = v.color.r;
                o.fogFactor = ComputeFogFactor(p.positionCS.z);
                return o;
            }

            half4 frag(Varyings i) : SV_Target
            {
                UNITY_SETUP_INSTANCE_ID(i);
                float3 faceArt = SAMPLE_TEXTURE2D(_FaceMap, sampler_FaceMap, TRANSFORM_TEX(i.uv, _FaceMap)).rgb;
                float3 edgeArt;
                RainbowCoinEdge_float(i.uv.x, _EdgeBright.rgb, _EdgeDark.rgb, _EdgeCount, edgeArt);
                float3 art = lerp(edgeArt, faceArt, saturate(i.face));

                float3 N = normalize(i.normalWS);
                float3 V = GetWorldSpaceNormalizeViewDir(i.positionWS);
                Light mainLight = GetMainLight();
                float3 ambient = SampleSH(N);
                float3 env = GlossyEnvironmentReflection(reflect(-V, N), i.positionWS, 0.3, 1.0);
                float3 col;
                RainbowCoin_float(art, N, V, mainLight.direction, mainLight.color, ambient, env, _MetalColor.rgb,
                    _Emission, _SpecPower, _SpecStrength, _EnvStrength, col);
                col = MixFog(col, i.fogFactor);
                return half4(col, 1.0);
            }
            ENDHLSL
        }

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
