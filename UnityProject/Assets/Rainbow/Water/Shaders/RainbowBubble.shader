// Rainbow Screen 05 - iridescent soap bubbles (Agent 3). Transparent camera-facing quads (one dynamic mesh from
// BubbleField.cs: position = bubble centre (world), UV0 = (corner x, corner y, radius, seed + 1 for the small ring bubbles),
// colour.a = fade). Port of src/vfx/bubbles.ts: BIG_VERT / BIG_FRAG (impostor spheres, on-screen size capped by uMaxPx) and
// PT_VERT / PT_FRAG (small ring sprites, capped at MAX_PX_SMALL).
// Depth-tested, soft-faded against the scene depth (needs "Depth Texture" on the URP asset; works without it too).
Shader "Rainbow/Water/Bubble"
{
    Properties
    {
        _NearFade ("Near-camera fade start (units)", Float) = 1.2
        _SoftDepth ("Soft intersection depth (units)", Float) = 0.3
        _Intensity ("Intensity", Range(0.2, 2)) = 1.0
        _MaxPx ("Max on-screen radius, big bubbles (px of the 864x1536 frame)", Float) = 33
        _MaxPxSmall ("Max on-screen radius, small bubbles (px of the 864x1536 frame)", Float) = 11
    }

    SubShader
    {
        Tags { "RenderType" = "Transparent" "Queue" = "Transparent" "RenderPipeline" = "UniversalPipeline" "IgnoreProjector" = "True" }
        LOD 200

        Pass
        {
            Name "ForwardLit"
            Tags { "LightMode" = "UniversalForward" }
            Blend SrcAlpha OneMinusSrcAlpha
            ZWrite Off
            ZTest LEqual
            Cull Off

            HLSLPROGRAM
            #pragma target 3.0
            #pragma vertex BubbleVert
            #pragma fragment BubbleFrag
            #pragma multi_compile_fog

            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareDepthTexture.hlsl"

            CBUFFER_START(UnityPerMaterial)
                float _NearFade;
                float _SoftDepth;
                float _Intensity;
                float _MaxPx;
                float _MaxPxSmall;
            CBUFFER_END

            // shared animation clock (Rainbow.Screen05.Screen05Clock; game time, reset by the test hold)
            float _RainbowTime;

            #include "Assets/Rainbow/Water/Shaders/RainbowBubble.hlsl"

            struct Attributes
            {
                float4 positionOS : POSITION;
                float4 uv0        : TEXCOORD0;   // corner xy, radius, seed (+1 = small ring bubble)
                float4 color      : COLOR;       // a = fade
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float4 quad       : TEXCOORD0;   // corner xy, seed (+1 = small), on-screen radius px
                float4 misc       : TEXCOORD1;   // x = fade, y = centre eye depth, z = radius, w = fog
                UNITY_VERTEX_OUTPUT_STEREO
            };

            Varyings BubbleVert(Attributes v)
            {
                Varyings o = (Varyings)0;
                UNITY_SETUP_INSTANCE_ID(v);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
                float3 cW = TransformObjectToWorld(v.positionOS.xyz);
                float3 cV = TransformWorldToView(cW);
                float r = v.uv0.z;
                float small = step(1.0, v.uv0.w);
                float depth = max(-cV.z, 1e-3);
                // on-screen radius in device px. abs(): URP draws the camera into a FLIPPED intermediate target on D3D, where
                // UNITY_MATRIX_P[1][1] is negative - a negative radius made the silhouette anti-aliasing erase the rim, the
                // edge and the highlights, so every bubble was an invisible faint smudge (round-2 root cause).
                float px = r * 0.5 * _ScreenParams.y * abs(UNITY_MATRIX_P[1][1]) / depth;
                // bubbles.ts uMaxPx / MAX_PX_SMALL: cap the on-screen size so a bubble never becomes a giant sphere close
                // to the camera (66 / 22 px diameters in the 864x1536 frame)
                float capPx = lerp(_MaxPx, _MaxPxSmall, small) * RBW_PxScale();
                float k = min(1.0, capPx / max(px, 1e-3));
                r *= k;
                px *= k;
                float3 pV = cV + float3(v.uv0.xy * r, 0.0);
                o.positionCS = TransformWViewToHClip(pV);
                float nearFade = smoothstep(_NearFade, _NearFade * 1.8, depth);
                o.quad = float4(v.uv0.xy, v.uv0.w, px);
                o.misc = float4(v.color.a * nearFade * step(0.0005, r), depth, r, ComputeFogFactor(o.positionCS.z));
                return o;
            }

            half4 BubbleFrag(Varyings i) : SV_Target
            {
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);
                float2 P = i.quad.xy;
                float d2 = dot(P, P);
                clip(1.0 - d2);
                // soft intersection with water / foam / walls (front surface of the sphere)
                float2 suv = GetNormalizedScreenSpaceUV(i.positionCS);
                float sceneEye = LinearEyeDepth(SampleSceneDepth(suv), _ZBufferParams);
                float fragEye = i.misc.y - sqrt(max(1.0 - d2, 0.0)) * i.misc.z;
                float soft = saturate((sceneEye - fragEye) / max(_SoftDepth, 1e-3));
                float3 col;
                float a;
                float seed = frac(i.quad.z);
                if (i.quad.z >= 1.0)
                    RainbowBubbleSmall_float(P, seed, i.quad.w, i.misc.x * soft, col, a);
                else
                    RainbowBubble_float(P, seed, i.quad.w, i.misc.x * soft, _RainbowTime, col, a);
                col *= _Intensity;
                col = MixFog(col, i.misc.w);
                return half4(col, a);
            }
            ENDHLSL
        }
    }
    FallBack Off
}
