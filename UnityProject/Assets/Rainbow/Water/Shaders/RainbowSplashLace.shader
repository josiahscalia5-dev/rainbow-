// Rainbow Screen 05 - Benny's splash (master direction 2026-11-24; round 9: strands). The water parts round his body and runs off as thin branching
// threads: long strands along the inner edge of the pink wake sweeps, short ones over the pink, a lacy flank that breaks into droplets. Real 3D sheets
// built by SplashWake.BuildLaceMesh: two fans (left / right), three layers each, rooted at his waterline. Everything is shaped and animated here: the
// sheets stream outward / backward, thin out from a soap web to separate threads, grow with his speed, lean with his steering and shrink in the air.
// UV0 = (t 0 root .. 1 tip, a 0 straight back .. 1 beside him, side -1 / +1, layer 0..2). Strand texture (WaterTextureFactory.MakeStrands): R = distance
// to the nearest thread (cells long along the flow), G = the same of a finer web, B = strand noise, A = droplets.
Shader "Rainbow/Water/SplashLace"
{
    Properties
    {
        [NoScaleOffset] _StrandTex ("Splash strands", 2D) = "white" {}
        _Len ("Strand length (m)", Float) = 1.3
        _Height ("Rise at his flanks (m)", Float) = 0.14
        _Alpha ("Opacity", Range(0, 1.5)) = 1
        _Bright ("Brightness", Float) = 1
        _Shape ("Root angle back, root angle side (rad), spread, curl", Vector) = (0.3, 1.9, 0.95, 0.1)
        _Thread ("Thread half width at root, at tip, softness, film", Vector) = (0.46, 0.13, 0.12, 0.16)
        _Tile ("Tiles across the fan, along (per m), flow speed (m/s), droplets", Vector) = (2.1, 1.25, 2.4, 1)
        _Reach ("Length: ribbon, over the pink, flank, waterline radius", Vector) = (1.15, 0.5, 0.56, 1)
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

            TEXTURE2D(_StrandTex); SAMPLER(sampler_StrandTex);
            CBUFFER_START(UnityPerMaterial)
                float _Len, _Height, _Alpha, _Bright;
                float4 _Shape, _Thread, _Tile, _Reach;
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
                float outer = 1.0 + 0.4 * saturate(-steer * side);                         // the side he leans away from sprays more
                float th = lerp(_Shape.x, _Shape.y, a);
                float wob = 0.05 * sin(_RainbowTime * 3.1 + a * 11.0 + layer * 2.1) + 0.03 * sin(_RainbowTime * 5.3 + a * 23.0 - layer);
                float thO = th * _Shape.z + 0.04 + wob * t;
                float r0 = max(_SplashState.x, 0.5) * (0.99 + 0.16 * saturate(cos(th))) * _Reach.w - 0.05;
                // long ribbons along the inner edge of the pink sweeps, short threads over the pink, medium on his flanks
                float ribbon = exp(-pow((th - 0.40) / 0.15, 2.0)), over = exp(-pow((th - 0.70) / 0.2, 2.0));
                float len = _Len * max(lerp(_Reach.z, _Reach.x, ribbon) * (1.0 - (1.0 - _Reach.y) * over), 0.12)
                          * (0.9 + 0.2 * sin(a * 9.0 + layer * 1.9 + 1.0) * a) * (1.0 - 0.12 * layer)
                          * lerp(0.35, 1.0, str) * outer * (1.0 + 0.35 * burst);
                float tc = t - _Shape.w * t * t;
                float2 d0 = float2(sin(th) * side, -cos(th)), d1 = float2(sin(thO) * side, -cos(thO));
                float2 p = d0 * r0 + d1 * (len * tc);
                // flat on the water behind him (nothing hides his fur), rising in an arc on his flanks
                float lift = smoothstep(0.62, 1.2, th);
                float rise = sin(3.14159 * pow(saturate(t), 0.7)) * (1.0 - 0.45 * t);
                float h = _Height * (1.0 - 0.27 * layer) * rise * lift * lerp(0.9, 1.2, a) * str * outer * (1.0 + 0.8 * burst)
                        + 0.01 * sin(_RainbowTime * 7.0 + a * 25.0 + t * 8.0 + layer * 2.0) * t * lift + 0.012 + 0.008 * layer;
                float3 pw = TransformObjectToWorld(float3(p.x, h, p.y));
                o.positionCS = TransformWorldToHClip(pw);
                o.uv = float4(a * _Tile.x + layer * 0.37 + (side > 0.0 ? 0.43 : 0.0), t * len * _Tile.y - _RainbowTime * _Tile.z * _Tile.y * 0.5 + layer * 0.61, t, a);
                o.k = float4(str, layer, side, th);
                return o;
            }

            half4 Frag(V i) : SV_Target
            {
                float t = i.uv.z, a = i.uv.w, layer = i.k.y;
                float2 uv = i.uv.xy;
                uv.x += 0.03 * sin(uv.y * 5.0 + layer * 2.0);
                float4 w0 = SAMPLE_TEXTURE2D(_StrandTex, sampler_StrandTex, uv);
                float4 w1 = SAMPLE_TEXTURE2D(_StrandTex, sampler_StrandTex, uv * float2(1.63, 1.31) + float2(0.37, 0.11));
                float lane = SAMPLE_TEXTURE2D(_StrandTex, sampler_StrandTex, float2(a * 1.7 + layer * 0.31 + (i.k.z > 0.0 ? 0.23 : 0.0), 0.17 + uv.y * 0.03)).b;
                float tMax = lerp(0.42, 1.04, lane) * (1.0 - 0.12 * layer);
                float f = saturate(t / max(tMax, 0.05));
                float e = lerp(w0.g, w0.r, smoothstep(0.04, 0.42, f));
                float thick = lerp(_Thread.x, _Thread.y, smoothstep(0.0, 0.8, f)) * (0.6 + 0.8 * w1.b);
                float soft = max(_Thread.z, fwidth(e) * 0.8);
                float web = 1.0 - smoothstep(thick - 0.5 * soft, thick + soft, e);
                float ends = 1.0 - smoothstep(0.72, 1.0, f);
                float edge = smoothstep(0.0, 0.06, a) * (1.0 - smoothstep(0.9, 1.0, a));
                float film = _Thread.w * (1.0 - smoothstep(0.0, 0.5, f));
                float drops = smoothstep(0.05, 0.4, max(w0.a, w1.a * step(0.5, layer))) * smoothstep(0.55, 0.85, f) * (1.0 - smoothstep(0.9, 1.0, t)) * _Tile.w;
                float root = smoothstep(0.0, 0.05, t);
                float al = saturate(max(max(web * ends, film * ends), drops) * edge * root * _Alpha * saturate(i.k.x * 1.5));
                // colour: bright white threads, blue where the water film is thin
                float core = saturate(1.0 - e / max(thick, 0.02));
                float3 c = lerp(float3(0.36, 0.64, 1.0), float3(0.95, 0.97, 1.03), saturate(max(core * 1.7, drops)));
                c = lerp(c, float3(0.50, 0.72, 1.02), saturate(film * 2.0) * (1.0 - web));
                return half4(c * _Bright * al, al);
            }
            ENDHLSL
        }
    }
    FallBack Off
}
