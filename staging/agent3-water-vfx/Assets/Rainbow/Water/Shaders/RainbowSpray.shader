// Rainbow Screen 05 - splash spray streaks (Agent 3). One dynamic mesh from SplashWake.cs:
// position = droplet (world), UV0 = (corner along, corner across, half length, half width), UV1 = (velocity xyz, alpha).
// Depth-tested (never drawn through Benny), soft-faded where it meets the water.
Shader "Rainbow/Water/Spray"
{
    Properties
    {
        _SoftDepth ("Soft intersection depth (units)", Float) = 0.12
        _Intensity ("Intensity", Range(0.2, 2)) = 1.0
    }

    SubShader
    {
        Tags { "RenderType" = "Transparent" "Queue" = "Transparent+10" "RenderPipeline" = "UniversalPipeline" "IgnoreProjector" = "True" }
        LOD 200

        Pass
        {
            Name "ForwardLit"
            Tags { "LightMode" = "UniversalForward" }
            Blend One OneMinusSrcAlpha
            ZWrite Off
            ZTest LEqual
            Cull Off

            HLSLPROGRAM
            #pragma target 3.0
            #pragma vertex SprayVert
            #pragma fragment SprayFrag
            #pragma multi_compile_fog

            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareDepthTexture.hlsl"

            CBUFFER_START(UnityPerMaterial)
                float _SoftDepth;
                float _Intensity;
            CBUFFER_END

            #include "Assets/Rainbow/Water/Shaders/RainbowSpray.hlsl"

            struct Attributes
            {
                float4 positionOS : POSITION;
                float4 uv0        : TEXCOORD0;   // corner along, corner across, half length, half width
                float4 uv1        : TEXCOORD1;   // velocity xyz (world), alpha
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float4 quad       : TEXCOORD0;   // corner xy, alpha, eye depth
                float  fogFactor  : TEXCOORD1;
                UNITY_VERTEX_OUTPUT_STEREO
            };

            Varyings SprayVert(Attributes v)
            {
                Varyings o = (Varyings)0;
                UNITY_SETUP_INSTANCE_ID(v);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
                float3 pW = TransformObjectToWorld(v.positionOS.xyz);
                float3 cV = TransformWorldToView(pW);
                float3 velV = TransformWorldToViewDir(v.uv1.xyz, false);
                float2 dir = velV.xy;
                float len = length(dir);
                dir = len > 1e-4 ? dir / len : float2(0.0, 1.0);
                float2 perp = float2(-dir.y, dir.x);
                float3 pV = cV + float3(dir * (v.uv0.x * v.uv0.z) + perp * (v.uv0.y * v.uv0.w), 0.0);
                o.positionCS = TransformWViewToHClip(pV);
                o.quad = float4(v.uv0.xy, v.uv1.w, -pV.z);
                o.fogFactor = ComputeFogFactor(o.positionCS.z);
                return o;
            }

            half4 SprayFrag(Varyings i) : SV_Target
            {
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);
                float2 suv = GetNormalizedScreenSpaceUV(i.positionCS);
                float sceneEye = LinearEyeDepth(SampleSceneDepth(suv), _ZBufferParams);
                float soft = saturate((sceneEye - i.quad.w) / max(_SoftDepth, 1e-3));
                float3 col;
                float a;
                RainbowSpray_float(i.quad.xy, i.quad.z * soft, col, a);
                col *= _Intensity;
                float3 fogPremul = (float3)unity_FogColor.rgb * a;
                col = MixFogColor(col, fogPremul, (float)i.fogFactor);   // premultiplied fog
                return half4(col, a);
            }
            ENDHLSL
        }
    }
    FallBack Off
}
