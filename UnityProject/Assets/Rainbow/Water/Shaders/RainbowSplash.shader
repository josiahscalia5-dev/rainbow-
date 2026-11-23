// Rainbow Screen 05 - Benny's splash at the waterline (splash round 2026-11-23). Port of src/vfx/riderSplash.ts
// createRiderSplash05 (wave 8, the default 05 fan layout = the approved V of whitewater fans):
//   type 0  whitewater ropes lying on the water, poured back-outward from his flanks (bubbly lace, lumpy edges,
//           white root -> translucent cyan tail)
//   type 1  a low crown of droplet jets thrown up beside the body (chains of small translucent beads)
//   type 2  root froth: lace pads of fine bubbles hugging the fur at the waterline (the foam collar)
// One static mesh built once by SplashWake.cs (no per-frame CPU vertex work): every ribbon is shaped and animated here.
// Object space = Benny's waterline frame (origin on the water under his body centre, +x = his right, +z = forward).
// Every vertex is set onto the animated river surface (same swell formula as the river, RBW_RiverWave), so the splash
// rides the water, is depth-tested (hidden behind his fur) and fades softly where it touches the water or the fur.
// UV0 = (u 0 root .. 1 tail, across -1..1, type, 0), UV1 = (side -1/1, a 0 outer .. 1 inner, phase, seed).
Shader "Rainbow/Water/Splash"
{
    Properties
    {
        _SoftDepth ("Soft intersection depth (units)", Float) = 0.05
        _Intensity ("Intensity", Range(0.2, 2)) = 1.0
        _Len ("Rope length (riderSplash uLen, units)", Float) = 1.55
        _RopeWidth ("Rope width scale", Float) = 1.0
        _FootprintBack ("Extra root radius toward the camera (his lean bulges the fur back)", Float) = 0.1
    }

    SubShader
    {
        Tags { "RenderType" = "Transparent" "Queue" = "Transparent+5" "RenderPipeline" = "UniversalPipeline" "IgnoreProjector" = "True" }
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
            #pragma vertex SplashVert
            #pragma fragment SplashFrag
            #pragma multi_compile_fog

            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareDepthTexture.hlsl"

            CBUFFER_START(UnityPerMaterial)
                float _SoftDepth;
                float _Intensity;
                float _Len;
                float _RopeWidth;
                float _FootprintBack;
            CBUFFER_END

            // per frame from SplashWake (MaterialPropertyBlock)
            float4 _SplashState;   // x = waterline radius uR, y = strength 0..1, z = unused, w = unused
            float4 _SplashRiver;   // x = stream centre x at Benny, y = stream half width, z = master-s offset, w = swell amplitude
            float4 _SplashRiver2;  // x = water plane y, y = raised stream edge lift, z = unused, w = unused

            #include "Assets/Rainbow/Water/Shaders/RainbowRiver.hlsl"

            struct Attributes
            {
                float4 positionOS : POSITION;
                float4 uv0        : TEXCOORD0;
                float4 uv1        : TEXCOORD1;
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float4 d0         : TEXCOORD0;   // u, across, seed, type
                float4 d1         : TEXCOORD1;   // rope length, jet tau, eye depth, strength
                float  fogFactor  : TEXCOORD2;
                UNITY_VERTEX_OUTPUT_STEREO
            };

            float SPL_Hs(float n) { return frac(sin(n * 91.345 + 3.17) * 43758.5453); }

            // root circle: just outside the fur at the water; his ride lean pushes the fur a little further back (toward
            // the camera) than to the sides (measured footprint of the benny31 mesh: ~0.9 back, ~0.8 beside him)
            float SPL_RootR(float th, float R)
            {
                return R * (1.0 + _FootprintBack * saturate(cos(th)));
            }

            // type 0: whitewater rope on the surface (ropePos, 05 layout: roots from beside the body to its back flank,
            // directions measured from straight back, curling outward along the rope)
            float3 SPL_Rope(float u, float side, float a, float seed, float len, float R)
            {
                float thR = lerp(1.4, 0.5, a) + (SPL_Hs(seed * 3.1) - 0.5) * 0.18;
                float phi = lerp(0.62, 0.06, a) + (SPL_Hs(seed * 5.7) - 0.5) * 0.26 + 0.25 * u * u;
                float2 root = float2(sin(thR), cos(thR)) * SPL_RootR(thR, R) * (1.3 + 0.2 * SPL_Hs(seed * 2.3));
                float2 q = root + float2(sin(phi), cos(phi)) * u * len;
                float y = 0.035 + 0.06 * SPL_Hs(seed * 9.1) * sin(3.14159 * min(u * 1.6, 1.0)) * (1.0 - u);
                return float3(side * q.x, y, -q.y);
            }

            // type 1: crown droplet jet (low arc thrown up and back-outward beside the body)
            float3 SPL_Jet(float tau, float side, float a, float seed, float R, float str)
            {
                float thR = lerp(1.6, 0.8, a) + (SPL_Hs(seed * 3.1) - 0.5) * 0.2;
                float phi = lerp(1.2, 0.45, a) + (SPL_Hs(seed * 5.7) - 0.5) * 0.35;
                float2 root = float2(sin(thR), cos(thR)) * SPL_RootR(thR, R) * 1.4;
                float len = (0.3 + 0.5 * SPL_Hs(seed * 7.3)) * (0.55 + 0.45 * str);
                float2 q = root + float2(sin(phi), cos(phi)) * tau * len;
                float H = (0.12 + 0.3 * SPL_Hs(seed * 9.1)) * str;
                return float3(side * q.x, H * 4.0 * tau * (1.0 - tau) + 0.02, -q.y);
            }

            // water height at a world point near Benny (the river's own swell + raised stream edges)
            float SPL_WaterY(float x, float z)
            {
                float u = saturate(abs(x - _SplashRiver.x) / max(_SplashRiver.y, 0.5));
                return _SplashRiver2.x + _SplashRiver2.y * u * u * u
                     + RBW_RiverWave(x, z, _SplashRiver.x, _SplashRiver.y, _SplashRiver.z, _SplashRiver.w, _Time.y);
            }

            Varyings SplashVert(Attributes v)
            {
                Varyings o = (Varyings)0;
                UNITY_SETUP_INSTANCE_ID(v);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
                float R = max(_SplashState.x, 0.5);
                float str = saturate(_SplashState.y);
                float t = _Time.y;
                float side = v.uv1.x, a = v.uv1.y, seed = v.uv1.w;
                float type = v.uv0.z;
                float u = v.uv0.x;
                float3 p, tg;
                float w;
                float len = 1.0;
                float tau = u;
                if (type < 0.5)
                {
                    // rope: fixed shape, breathing length; the lace texture flows along it in the fragment shader
                    len = _Len * (0.35 + 0.65 * SPL_Hs(seed * 7.3)) * (0.9 + 0.1 * sin(t * 2.3 + seed * 20.0)) * (0.5 + 0.5 * str);
                    p = SPL_Rope(u, side, a, seed, len, R);
                    tg = SPL_Rope(min(u + 0.04, 1.0), side, a, seed, len, R) - SPL_Rope(max(u - 0.04, 0.0), side, a, seed, len, R);
                    w = lerp(0.034, 0.008, pow(u, 0.7)) * (0.5 + 0.7 * SPL_Hs(seed * 19.1)) * _RopeWidth;
                }
                else if (type < 1.5)
                {
                    // crown droplet jet: the head runs root -> landing, the jet is a short chain of beads
                    float rate = lerp(1.6, 2.6, SPL_Hs(seed * 11.3));
                    float cyc = frac(v.uv1.z + t * rate);
                    float tl = 0.3;
                    tau = clamp(cyc * (1.0 + tl) - (1.0 - u) * tl, 0.0, 1.0);
                    p = SPL_Jet(tau, side, a, seed, R, str);
                    tg = SPL_Jet(min(tau + 0.03, 1.0), side, a, seed, R, str) - SPL_Jet(max(tau - 0.03, 0.0), side, a, seed, R, str);
                    w = lerp(0.009, 0.018, SPL_Hs(seed * 23.3));
                }
                else
                {
                    // root froth: lace pads hugging the fur's silhouette at the water, from beside the body round to its back
                    float th = lerp(1.7, 0.3, a) + (SPL_Hs(seed * 3.1) - 0.5) * 0.12;
                    float2 root = float2(sin(th), cos(th)) * SPL_RootR(th, R) * (1.25 + 0.15 * SPL_Hs(seed * 2.9));
                    float2 dir = float2(sin(th + 0.35), cos(th + 0.35));
                    len = 0.2 + 0.18 * SPL_Hs(seed * 7.3);
                    float2 q = root + dir * u * len;
                    p = float3(side * q.x, 0.06 + 0.04 * sin(3.14159 * u), -q.y);
                    tg = float3(side * dir.x, 0.0, -dir.y);
                    w = (0.05 + 0.045 * SPL_Hs(seed * 19.1)) * (1.0 - 0.35 * u);
                }
                // onto the animated water: the local y is the height above the surface at that point
                float3 pw = TransformObjectToWorld(float3(p.x, 0.0, p.z));
                pw.y = SPL_WaterY(pw.x, pw.z) + p.y;
                float3 tw = TransformObjectToWorldDir(tg, false);
                float3 pv = TransformWorldToView(pw);
                float2 tv = TransformWorldToViewDir(tw, false).xy;
                float tl2 = length(tv);
                float2 nrm = tl2 > 1e-5 ? float2(-tv.y, tv.x) / tl2 : float2(0.0, 1.0);
                pv.xy += nrm * v.uv0.y * w * (0.7 + 0.3 * str);
                o.positionCS = TransformWViewToHClip(pv);
                o.d0 = float4(u, v.uv0.y, seed, type);
                o.d1 = float4(len, tau, -pv.z, str);
                o.fogFactor = ComputeFogFactor(o.positionCS.z);
                return o;
            }

            half4 SplashFrag(Varyings i) : SV_Target
            {
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);
                float2 uv = i.d0.xy;
                float seed = i.d0.z;
                float type = i.d0.w;
                float len = i.d1.x;
                float tau = i.d1.y;
                float t = _Time.y;
                float ac = abs(uv.y);
                const float3 cyan = float3(0.45, 0.88, 1.0);
                const float3 white = float3(1.1, 1.12, 1.16);
                const float3 blue = float3(0.42, 0.6, 1.0);
                float3 col;
                float alpha;
                if (type < 0.5)
                {
                    // whitewater rope: bubbly lace flowing back along it, lumpy edges, white root -> translucent cyan tail;
                    // a chain of foam lumps sets a lumpy outline and breaks into separate blobs further out
                    float2 lp = float2(uv.x * len * 7.0 - t * 2.6 + seed * 31.0, uv.y * 0.8 + seed * 7.0);
                    float lc = RBW_Cells(lp);
                    float lump = 1.0 - smoothstep(0.25, 0.75, lc);
                    float edge = 1.0 - smoothstep(0.25 + 0.6 * lump, 0.35 + 0.65 * lump, ac);
                    float tail = 1.0 - smoothstep(0.55, 1.0, uv.x);
                    float brk = lerp(1.0, smoothstep(0.3, 0.6, lump), smoothstep(0.2, 0.75, uv.x));
                    float hole = (1.0 - smoothstep(0.1, 0.2, RBW_Cells(lp * 2.7 + 3.0))) * (1.0 - smoothstep(0.6, 1.0, ac));
                    // white only in the rope core, translucent cyan edges / tail, so the water shows between the strands
                    alpha = edge * tail * brk * smoothstep(0.0, 0.04, uv.x) * lerp(0.9, 0.45, smoothstep(0.3, 1.0, ac + uv.x * 0.5));
                    col = lerp(cyan, white, saturate(1.2 - uv.x * 0.9 - ac * 0.9));
                    col = lerp(col, blue, hole * 0.55 * (1.0 - uv.x));
                }
                else if (type < 1.5)
                {
                    // crown droplets: small translucent water beads (cyan body, bright rim), fading in off the water and out
                    // as they fall back
                    float2 bq = float2((frac(uv.x * 3.0 + seed * 7.0) - 0.5) * 2.4, uv.y);
                    float bd = length(bq);
                    float bead = 1.0 - smoothstep(0.6, 0.9, bd);
                    float life = smoothstep(0.0, 0.12, tau) * (1.0 - smoothstep(0.75, 1.0, tau));
                    alpha = bead * life * (0.45 + 0.45 * smoothstep(0.3, 0.8, bd));
                    col = lerp(cyan, white, 0.35 + 0.6 * smoothstep(0.35, 0.8, bd));
                }
                else
                {
                    // froth collar: fine bubbles (white with blue open holes), soft all round
                    float2 lp = float2(uv.x * len * 14.0 - t * 1.2 + seed * 17.0, uv.y * 2.2 + seed * 5.0);
                    float lc = RBW_Cells(lp);
                    float hole = 1.0 - smoothstep(0.1, 0.22, lc);
                    float lace = 1.0 - smoothstep(0.45, 0.75, lc);
                    float soft = (1.0 - smoothstep(0.4, 1.0, ac)) * smoothstep(0.0, 0.2, uv.x) * (1.0 - smoothstep(0.6, 1.0, uv.x));
                    alpha = lace * soft * 0.9;
                    col = lerp(white, blue, hole * 0.7);
                }
                // soft where it touches the water or his fur (no hard intersection lines)
                float2 suv = GetNormalizedScreenSpaceUV(i.positionCS);
                float sceneEye = LinearEyeDepth(SampleSceneDepth(suv), _ZBufferParams);
                float soft = saturate((sceneEye - i.d1.z) / max(_SoftDepth, 1e-3));
                alpha = saturate(alpha * i.d1.w * soft);
                clip(alpha - 0.02);
                col *= _Intensity * alpha;                                       // premultiplied
                float3 fogPremul = (float3)unity_FogColor.rgb * alpha;
                col = MixFogColor(col, fogPremul, (float)i.fogFactor);
                return half4(col, alpha);
            }
            ENDHLSL
        }
    }
    FallBack Off
}
