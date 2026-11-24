// Rainbow Screen 05 - Benny's lacy splash (master direction 2026-11-24: the water parts round his body and trails off behind him as thin
// webs of foam, strands and droplets - no solid white wings, no lavender balls). Real 3D sheets built by SplashWake.BuildLaceMesh: two fans
// (left / right), three layers each, rooted at his waterline. Everything is shaped and animated here: the sheets stream outward / backward, rise a
// little, thin out from dense soap lace to separate strands, grow with his speed, lean with his steering and shrink while he is in the air.
// UV0 = (t 0 root .. 1 tip, a 0 straight back .. 1 beside him, side -1 / +1, layer 0..2). Lace texture: R = coarse web (distance to the nearest
// bubble hole), G = fine web, B = strand noise (WaterTextureFactory.MakeLace).
Shader "Rainbow/Water/SplashLace"
{
    Properties
    {
        [NoScaleOffset] _LaceTex ("Foam lace", 2D) = "gray" {}
        _Len ("Strand length (m)", Float) = 1.25
        _Height ("Rise (m)", Float) = 0.16
        _Alpha ("Opacity", Range(0, 1.5)) = 1
        _Bright ("Brightness", Float) = 1
        _Shape ("Root angle back, root angle side (rad), spread, curl", Vector) = (0.16, 1.82, 0.9, 0.1)
        _Web ("Hole size at root, at tip, softness, strand breakup", Vector) = (0.3, 1.02, 0.2, 0.55)
        _Tile ("Lace tiles across, along (per m), flow speed (m/s), fine web amount", Vector) = (2.6, 0.95, 2.4, 0.45)
    }
    SubShader
    {
        Tags { "RenderType" = "Transparent" "Queue" = "Transparent-10" "RenderPipeline" = "UniversalPipeline" "IgnoreProjector" = "True" }
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
            #include "Assets/Rainbow/Water/Shaders/RainbowWaterCommon.hlsl"

            TEXTURE2D(_LaceTex); SAMPLER(sampler_LaceTex);
            CBUFFER_START(UnityPerMaterial)
                float _Len, _Height, _Alpha, _Bright;
                float4 _Shape, _Web, _Tile;
            CBUFFER_END
            float _RainbowTime;
            float4 _SplashState;    // x = waterline radius, y = strength 0..1, z = steering -1..1, w = landing burst 0..1

            struct A { float4 positionOS : POSITION; float4 uv0 : TEXCOORD0; };
            struct V { float4 positionCS : SV_POSITION; float4 uv : TEXCOORD0; float4 k : TEXCOORD1; };

            V Vert(A v)
            {
                V o;
                float t = v.uv0.x, a = v.uv0.y, side = v.uv0.z, layer = v.uv0.w;
                float str = _SplashState.y, steer = _SplashState.z, burst = _SplashState.w;
                float outer = saturate(1.0 - 0.45 * steer * side);                         // the side he leans away from sprays more
                outer = lerp(outer, 1.0 + 0.4 * saturate(-steer * side), 1.0);
                float th = lerp(_Shape.x, _Shape.y, a);
                float wob = 0.05 * sin(_RainbowTime * 3.1 + a * 11.0 + layer * 2.1) + 0.03 * sin(_RainbowTime * 5.3 + a * 23.0 - layer);
                float thO = th * _Shape.z + 0.05 + wob * t;
                float r0 = max(_SplashState.x, 0.5) * (0.99 + 0.16 * saturate(cos(th))) - 0.05;
                float len = _Len * lerp(1.12, 0.62, a) * (0.86 + 0.2 * sin(a * 8.0 + layer * 1.9 + 1.0) * (0.5 + 0.5 * a)) * (1.0 - 0.14 * layer)
                          * lerp(0.35, 1.0, str) * outer * (1.0 + 0.35 * burst);
                float tc = t - _Shape.w * t * t;
                float2 d0 = float2(sin(th) * side, -cos(th)), d1 = float2(sin(thO) * side, -cos(thO));
                float2 p = d0 * r0 + d1 * (len * tc);
                float rise = sin(3.14159 * pow(saturate(t), 0.7)) * (1.0 - 0.45 * t);
                float h = _Height * (1.0 - 0.27 * layer) * rise * lerp(0.75, 1.15, a) * str * outer * (1.0 + 0.8 * burst)
                        + 0.012 * sin(_RainbowTime * 7.0 + a * 25.0 + t * 8.0 + layer * 2.0) * t + 0.03 + 0.012 * layer;
                float3 pw = TransformObjectToWorld(float3(p.x, h, p.y));
                o.positionCS = TransformWorldToHClip(pw);
                float across = th * (r0 + 0.45 * len * t);
                o.uv = float4(a * 1.9 * _Tile.x + layer * 0.37 + (side > 0.0 ? 0.5 : 0.0), t * len * _Tile.y * 1.0 - _RainbowTime * _Tile.z * _Tile.y * 0.55 + layer * 0.61, t, a);
                o.k = float4(str, layer, side, len);
                return o;
            }

            half4 Frag(V i) : SV_Target
            {
                float t = i.uv.z, a = i.uv.w;
                float2 uv = i.uv.xy;
                uv.x += 0.05 * sin(uv.y * 6.0 + i.k.y * 2.0);
                float4 l0 = SAMPLE_TEXTURE2D(_LaceTex, sampler_LaceTex, uv * float2(0.5, 1.0));
                float4 l1 = SAMPLE_TEXTURE2D(_LaceTex, sampler_LaceTex, uv * float2(1.15, 1.7) + float2(0.37, _RainbowTime * 0.12));
                float strand = SAMPLE_TEXTURE2D(_LaceTex, sampler_LaceTex, float2(a * 1.35 + i.k.y * 0.31 + (i.k.z > 0.0 ? 0.23 : 0.0), 0.17 + i.uv.y * 0.04)).b;
                float H = lerp(l0.r, min(l0.r, l1.g * 1.15), _Tile.w);                         // 0 hole centre .. 1+ web
                float th = lerp(_Web.x, _Web.y, smoothstep(0.0, 0.95, t));
                th += (0.5 - strand) * _Web.w * smoothstep(0.08, 0.75, t);
                float edge = smoothstep(0.0, 0.1, a) * (1.0 - smoothstep(0.93, 1.0, a));       // soft fan borders
                th += (1.0 - edge) * 0.5 + 0.14 * a * a;
                float web = smoothstep(th, th + _Web.z, H);
                float fade = (1.0 - smoothstep(0.72, 1.0, t)) * smoothstep(0.0, 0.05, t);
                float al = web * fade * edge * _Alpha * saturate(i.k.x * 1.5);
                // colour: bright white threads, blue-lavender where the web is thin, sparkling nodes
                float body = saturate((H - th) / max(_Web.z * 2.2, 0.05));
                float3 c = lerp(float3(0.34, 0.60, 1.0), float3(0.93, 0.95, 1.02), smoothstep(0.1, 0.85, body));
                c = lerp(c, float3(0.80, 0.82, 1.0), 0.25 * (1.0 - l1.r) * (1.0 - t));
                c += 0.35 * smoothstep(0.8, 1.0, body) * smoothstep(0.55, 0.9, l1.g);
                al = saturate(al);
                return half4(c * _Bright * al, al);
            }
            ENDHLSL
        }
    }
    FallBack Off
}
