// Rainbow Screen 05 - light streaks and star flares on the river (river round 4b, RiverGlints.cs). One draw call, no textures but the
// tiny layout LUT (RiverLayout05.BuildLut) sampled in the vertex shader.
Shader "Rainbow/Water/RiverGlints"
{
    Properties
    {
        [NoScaleOffset] _RiverLut ("River layout LUT", 2D) = "black" {}
        _LutRange ("LUT s range", Vector) = (-12, 160, 0, 0)
        _HoldTime ("Clock value at which the glints sit on their authored places", Float) = 1.5
        _Drift ("Drift speed m/s", Float) = 7.5
        _Streak ("Streak strength", Float) = 1
        _Flare ("Flare strength", Float) = 1
    }
    SubShader
    {
        Tags { "RenderType" = "Transparent" "Queue" = "Transparent-20" "RenderPipeline" = "UniversalPipeline" "IgnoreProjector" = "True" }
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
            #pragma vertex Vert
            #pragma fragment Frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            TEXTURE2D(_RiverLut); SAMPLER(sampler_RiverLut);
            CBUFFER_START(UnityPerMaterial)
                float4 _LutRange;
                float _HoldTime, _Drift, _Streak, _Flare;
            CBUFFER_END
            float _RainbowTime;
            float4 _RainbowBenny;
            float4 _R5Glint;   // (river5) live flare size deltas (0 in the game): x near / wake, y mid / far

            struct A { float4 positionOS : POSITION; float4 uv0 : TEXCOORD0; float4 uv1 : TEXCOORD1; float4 uv2 : TEXCOORD2; float4 uv3 : TEXCOORD3; };
            struct V { float4 positionCS : SV_POSITION; float3 uvk : TEXCOORD0; float4 col : TEXCOORD1; };

            float MapQ(float q, float s)
            {
                float u = (s - _LutRange.x) / (_LutRange.y - _LutRange.x);
                float4 e = SAMPLE_TEXTURE2D_LOD(_RiverLut, sampler_RiverLut, float2(u, 0.25), 0);   // WL LO LI RI
                float4 f = SAMPLE_TEXTURE2D_LOD(_RiverLut, sampler_RiverLut, float2(u, 0.75), 0);   // RO WR
                if (q < -2.0) return lerp(e.y, e.x, -2.0 - q);
                if (q < -1.0) return lerp(e.z, e.y, -1.0 - q);
                if (q < 1.0) return lerp(e.z, e.w, 0.5 * (q + 1.0));
                if (q < 2.0) return lerp(e.w, f.x, q - 1.0);
                return lerp(f.x, f.y, q - 2.0);
            }

            V Vert(A v)
            {
                V o = (V)0;
                float kind = v.uv0.z, cls = v.uv0.w;
                float len = v.uv1.z, wid = v.uv1.w, fade = 1.0;
                float camS = _WorldSpaceCameraPos.z;
                float3 p; float2 T;                                   // point and tangent (x, z)
                float along = kind < 0.5 ? v.uv0.y * len : 0.0;
                if (cls > 2.5)
                {
                    float dl = v.uv1.x + along;                       // along the wake arcs (bowed over Benny's track)
                    float back = v.uv1.y + 0.8 * (dl * dl - v.uv1.x * v.uv1.x);
                    bool sweep = v.uv2.x > 0.9 && v.uv2.y < 0.8 && kind < 0.5;
                    if (sweep) { dl = v.uv1.x + along * 0.4 * sign(v.uv1.x); back = v.uv1.y + along; }
                    p = float3(_RainbowBenny.y + dl, 0.05, _RainbowBenny.x - back);
                    T = sweep ? float2(0.4 * sign(v.uv1.x), -1.0) : float2(1.0, -1.6 * dl);
                    fade = saturate(_RainbowBenny.z) * step(0.001, _RainbowBenny.w);
                }
                else
                {
                    float P = cls < 0.5 ? 8.0 : cls < 1.5 ? 26.0 : 76.0;
                    float d0 = v.uv1.y + _Drift * (_RainbowTime - _HoldTime) - camS;
                    float s0 = camS + (d0 - P * floor(d0 / P)) + P * v.uv3.x;
                    float dist = s0 - camS;
                    fade = cls < 0.5 ? smoothstep(2.0, 3.5, dist) * (1.0 - smoothstep(11.5, 15.0, dist))
                         : cls < 1.5 ? smoothstep(8.0, 10.5, dist) * (1.0 - smoothstep(29.0, 40.0, dist))
                         : smoothstep(25.0, 28.5, dist) * (1.0 - smoothstep(95.0, 120.0, dist));
                    fade *= 1.0 - smoothstep(112.0, 118.0, s0);
                    float s = s0 + along;
                    float x = MapQ(v.uv1.x, s);
                    float xb = MapQ(v.uv1.x, s + 0.15);
                    p = float3(x, 0.06, s);
                    T = float2((xb - x) / 0.15, 1.0);
                }
                T = normalize(T);
                float3 pv;
                if (kind < 0.5)
                {
                    p.xz += float2(T.y, -T.x) * (v.uv0.x * wid);
                    pv = TransformWorldToView(p);
                }
                else
                {
                    pv = TransformWorldToView(p);
                    float3 pv2 = TransformWorldToView(p + float3(T.x, 0.0, T.y) * 0.2);   // the flow direction as seen on screen
                    float2 a = pv2.xy / max(-pv2.z, 0.1) - pv.xy / max(-pv.z, 0.1);
                    a *= 1.0 / max(length(a), 1e-6);
                    a = normalize(a + float2(1e-5, 0.0));
                    float fs = 1.0 + (cls < 0.5 || cls > 2.5 ? _R5Glint.x : _R5Glint.y);
                    pv.xy += (a * (v.uv0.y * len) + float2(-a.y, a.x) * (v.uv0.x * wid)) * fs;
                }
                // same pixel, a little nearer (the swell never hides the glints)
                o.positionCS = TransformWViewToHClip(pv);
                float4 nearer = TransformWViewToHClip(pv * (1.0 - 0.3 / max(-pv.z, 1.0)));
                o.positionCS.z = nearer.z / nearer.w * o.positionCS.w;
                float tw = 0.88 + 0.12 * sin((_RainbowTime - _HoldTime) * 4.0 + 1.5 + v.uv3.y * 6.28 * step(0.0001, abs(_RainbowTime - _HoldTime)));
                o.uvk = float3(v.uv0.xy, kind);
                o.col = float4(v.uv2.rgb, v.uv2.w * fade * tw * (kind < 0.5 ? _Streak : _Flare));
                return o;
            }

            half4 Frag(V i) : SV_Target
            {
                float x = abs(i.uvk.x), y = abs(i.uvk.y);
                float a;
                if (i.uvk.z < 0.5)
                {
                    float body = 1.0 - y * y;
                    a = exp(-x * x * 4.0 / max(body, 0.05)) * body * (1.0 - x * x);
                }
                else
                {
                    float ay = saturate(1.0 - y), ax = saturate(1.0 - x);
                    float arm1 = saturate(1.25 - x / (0.2 * ay * ay + 0.004)) * step(y, 0.999);
                    float arm2 = saturate(1.25 - y / (0.1 * ax * ax + 0.004)) * step(x, 0.999);
                    float r2 = x * x * 0.4 + y * y;
                    a = saturate(max(arm1, arm2) + exp(-r2 * 34.0) + 0.45 * exp(-r2 * 6.0) * ax * ay);
                }
                a = saturate(a * i.col.a);
                return half4(i.col.rgb * a, a);
            }
            ENDHLSL
        }
    }
    FallBack Off
}