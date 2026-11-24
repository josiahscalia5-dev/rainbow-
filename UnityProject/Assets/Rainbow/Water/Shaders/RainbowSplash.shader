// Rainbow Screen 05 - Benny's splash at the waterline (splash round 2026-11-23). Port of src/vfx/riderSplash.ts
// createRiderSplash05 (wave 8, the default 05 fan layout = the approved V of whitewater fans), refitted to the approved
// image (screen05_splash_probe2: approved px -> water plane in Benny's frame):
//   type 0  splash strands lying on the water, leaving his flanks (~24..77 deg from straight back) and running back
//           toward the camera: a ragged white streak with clinging foam lumps, lace holes and droplets (never smooth hair)
//   type 1  a low crown of droplet jets thrown up beside the body (chains of small translucent beads)
//   type 2  bubbly suds piled on his flanks (big soft soap bubbles), never a ring straight behind him
// The water straight behind him gets a dark contact shadow instead (RainbowRiver.hlsl, wake section).
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
        _FootprintBack ("Extra root radius toward the camera (his lean bulges the fur back)", Float) = 0.14
        _RopeAlpha ("Strand opacity (water4: the approved strands are see-through droplet streams)", Range(0, 1.5)) = 1.0
        _Spread ("Extra outward fan angle of the strands (rad, water4: fanning toward the bottom corners)", Float) = 0.0
        _JetAlpha ("Crown droplet opacity (river5)", Float) = 1.0
        _StrandBack ("Extra turn of the strand roots toward his back only (river5, rad)", Float) = 0.0
        _RootBack ("Roots moved round toward straight back (rad, water4: the approved spray pours off his lower back, not his flanks)", Float) = 0.0
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
                float _RopeAlpha;
                float _Spread;
                float _RootBack;
                float _JetAlpha;
                float _StrandBack;
            CBUFFER_END

            // shared animation clock (Rainbow.Screen05.Screen05Clock; game time, reset by the test hold)
            float _RainbowTime;

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
                float2 d2         : TEXCOORD3;   // ribbon half width (view units), on-screen length of one unit along it
                UNITY_VERTEX_OUTPUT_STEREO
            };

            float SPL_Hs(float n) { return frac(sin(n * 91.345 + 3.17) * 43758.5453); }

            // his REAL waterline footprint (benny31 at the ride height, measured with screen05_splash_probe2:
            // ~0.91 u straight back toward the camera, ~0.88 at 45 deg, ~0.8 beside him; R = SplashWake waterline radius
            // ~0.68): the fans start just outside the fur, never under it, and never as a ring across his body
            float SPL_RootR(float th, float R)
            {
                return R * (1.18 + _FootprintBack * saturate(cos(th)));
            }

            // type 0: splash strand lying on the surface. (splash round 2026-11-23, fitted to the approved image through
            // the probe's approved-px -> water-plane mapping) roots on his flanks from ~77 deg round to ~24 deg from
            // straight back (the water straight behind him stays clear), running almost straight back toward the camera
            // and curling a little outward, ending ~1.6-1.9 u behind him (approved: the fans end at y ~1300 between
            // lat 0.45 and 1.25 on each side)
            float3 SPL_Rope(float u, float side, float a, float seed, float len, float R)
            {
                float thR = lerp(1.35, 0.42, a) * (1.0 - 0.35 * saturate(_RootBack)) - 0.2 * _RootBack - _StrandBack
                          + (SPL_Hs(seed * 3.1) - 0.5) * 0.16;
                float phi = lerp(0.3, 0.04, a) + (SPL_Hs(seed * 5.7) - 0.5) * 0.16 + 0.22 * u * u
                          + (SPL_Hs(seed * 6.1) - 0.5) * 0.4 * u                   // each strand curls its own way
                          + _Spread * (0.6 + 0.8 * u * u) * (0.7 + 0.6 * SPL_Hs(seed * 8.3));   // (water4) wider fan
                float2 root = float2(sin(thR), cos(thR)) * SPL_RootR(thR, R) * (1.03 + 0.08 * SPL_Hs(seed * 2.3));
                float2 q = root + float2(sin(phi), cos(phi)) * u * len
                         + float2(cos(phi), -sin(phi)) * (0.03 * u * sin(u * 8.0 + seed * 40.0));   // and wavers a little
                float y = 0.03 + 0.05 * SPL_Hs(seed * 9.1) * sin(3.14159 * min(u * 1.6, 1.0)) * (1.0 - u);
                return float3(side * q.x, y, -q.y);
            }

            // type 1: crown droplet jet (low arc thrown up and back-outward beside the body)
            float3 SPL_Jet(float tau, float side, float a, float seed, float R, float str)
            {
                float thR = lerp(1.6, 0.8, a) - 0.5 * _RootBack + (SPL_Hs(seed * 3.1) - 0.5) * 0.2;
                float phi = lerp(1.2, 0.45, a) + (SPL_Hs(seed * 5.7) - 0.5) * 0.35;
                float2 root = float2(sin(thR), cos(thR)) * SPL_RootR(thR, R) * 1.12;
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
                     + RBW_RiverWave(x, z, _SplashRiver.x, _SplashRiver.y, _SplashRiver.z, _SplashRiver.w, _RainbowTime);
            }

            Varyings SplashVert(Attributes v)
            {
                Varyings o = (Varyings)0;
                UNITY_SETUP_INSTANCE_ID(v);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
                float R = max(_SplashState.x, 0.5);
                float str = saturate(_SplashState.y);
                float t = _RainbowTime;
                float side = v.uv1.x, a = v.uv1.y, seed = v.uv1.w;
                float type = v.uv0.z;
                float u = v.uv0.x;
                float3 p, tg;
                float w;
                float len = 1.0;
                float tau = u;
                if (type < 0.5)
                {
                    // splash strand: fixed shape, breathing length; blobs, droplets and bubbles stream back along it in the
                    // fragment shader. Outer strands (a = 0) are the longest; the inner ones end ~1.9 u behind him.
                    len = _Len * lerp(1.1, 0.85, a) * (0.65 + 0.35 * SPL_Hs(seed * 7.3)) * (0.92 + 0.08 * sin(t * 2.3 + seed * 20.0))
                        * (0.6 + 0.4 * str);
                    p = SPL_Rope(u, side, a, seed, len, R);
                    tg = SPL_Rope(min(u + 0.04, 1.0), side, a, seed, len, R) - SPL_Rope(max(u - 0.04, 0.0), side, a, seed, len, R);
                    // wide enough to hold the blobs and the droplets beside them (the visible strand is carved by noise)
                    w = lerp(0.065, 0.022, pow(u, 0.6)) * (0.6 + 0.6 * SPL_Hs(seed * 19.1)) * _RopeWidth;
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
                    // bubbly suds piled on his FLANKS at the water (approved: soap-bubble masses beside his lower body,
                    // pushed outward-back), from beside him round to ~36 deg from straight back - never a ring behind him
                    // (approved masses: left centred ~(lat 0.9, back 0.6), right from (0.75, 0.3) out to (1.15, 1.0))
                    float th = lerp(1.32, 0.6, a) - 0.5 * _RootBack + (SPL_Hs(seed * 3.1) - 0.5) * 0.14;
                    float2 root = float2(sin(th), cos(th)) * SPL_RootR(th, R) * (0.98 + 0.1 * SPL_Hs(seed * 2.9));
                    float dA = th * 0.95 + (SPL_Hs(seed * 4.3) - 0.5) * 0.2;
                    float2 dir = float2(sin(dA), cos(dA));
                    len = 0.35 + 0.4 * SPL_Hs(seed * 7.3);
                    float2 q = root + dir * u * len;
                    p = float3(side * q.x, 0.04 + 0.07 * sin(3.14159 * u) * (0.6 + 0.4 * SPL_Hs(seed * 8.1)), -q.y);
                    tg = float3(side * dir.x, 0.0, -dir.y);
                    w = (0.07 + 0.06 * SPL_Hs(seed * 19.1)) * (1.0 - 0.3 * u);
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
                // on-screen length of one unit along the ribbon (strands lying on the water and running toward the
                // camera are foreshortened ~0.45x): the fragment shader scales its cells by it, so blobs and bubbles
                // come out ROUND on screen instead of squashed into streaks
                o.d2 = float2(w, tl2 / max(length(tw), 1e-5));
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
                float t = _RainbowTime;
                float ac = abs(uv.y);
                const float3 cyan = float3(0.45, 0.88, 1.0);
                const float3 white = float3(1.1, 1.12, 1.16);
                const float3 blue = float3(0.42, 0.6, 1.0);
                float3 col;
                float alpha;
                if (type < 0.5)
                {
                    // splash strand (splash round 2026-11-23; approved: white water breaking into blobs, droplets and
                    // small bubbles with the water showing between them - never smooth white hair). Round cells in WORLD
                    // units along / across the strand (~0.045 u blobs, ~0.035 u droplet cells), streaming back along it.
                    // A continuous white streak with a ragged, wandering width runs along most of the strand, lumps of
                    // foam cling to it (bubbly near the root), and a few droplets fly beside it and off its tail.
// (river round 4b) lacy stream: a web of white water between see-through cells, thick near the fur, breaking
                    // into strings of droplets toward its tail
                    float wv = max(i.d2.x, 1e-3);
                    float2 g = float2(uv.x * len * i.d2.y, uv.y * wv) * 21.0 + float2(-t * 2.6 + seed * 31.0, seed * 7.0);
                    g += 0.35 * (float2(RBW_VNoise(g * 0.7), RBW_VNoise(g * 0.7 + 5.1)) - 0.5);
                    float c1 = RBW_Cells(g);
                    float c2 = RBW_Cells(g * 2.1 + 4.7);
                    float web = smoothstep(0.36 + 0.16 * uv.x, 0.56 + 0.16 * uv.x, c1);
                    float solid = (1.0 - smoothstep(0.0, 0.22, uv.x)) * smoothstep(0.3, 0.6, c1) * 0.7;
                    float edge = 1.0 - smoothstep(0.45, 0.95, ac + (RBW_VNoise(float2(g.x * 0.6, seed * 13.0)) - 0.5) * 0.7 + 0.35 * uv.x);
                    float dots = 1.0 - smoothstep(0.16, 0.24, c2);
                    float bodyA = max(web, solid) * edge;
                    float tail = (1.0 - smoothstep(0.6, 1.0, uv.x)) * smoothstep(0.0, 0.04, uv.x);
                    alpha = max(bodyA * tail, dots * 0.85 * (1.0 - smoothstep(0.75, 1.0, uv.x + ac * 0.25)) * smoothstep(0.25, 0.6, uv.x)) * _RopeAlpha;
                    col = lerp(float3(0.62, 0.86, 1.05), white, saturate(0.35 + 0.8 * smoothstep(0.5, 0.8, c1) + dots * 0.5 - uv.x * 0.2));
                }                else if (type < 1.5)
                {
                    // crown droplets: small translucent water beads (cyan body, bright rim), fading in off the water and out
                    // as they fall back
                    float2 bq = float2((frac(uv.x * 3.0 + seed * 7.0) - 0.5) * 2.4, uv.y);
                    float bd = length(bq);
                    float bead = 1.0 - smoothstep(0.6, 0.9, bd);
                    float life = smoothstep(0.0, 0.12, tau) * (1.0 - smoothstep(0.75, 1.0, tau));
                    alpha = bead * life * (0.45 + 0.45 * smoothstep(0.3, 0.8, bd)) * _JetAlpha;
                    col = lerp(cyan, white, 0.35 + 0.6 * smoothstep(0.35, 0.8, bd));
                }
                else
                {
                    // bubbly suds on his flanks (approved: piled soap bubbles - lavender-white film, lit tops, blue-tinted
                    // round holes - with a lumpy outline), small + big bubble cells in world units
                    // big soft bubbles (~0.1 u, round on screen): white domes with lavender-blue rims, a bright glint
                    // each, small blue-tinted bubbles in the gaps between them; lumpy outline
                    float wv = max(i.d2.x, 1e-3);
                    float2 g = float2(uv.x * len * i.d2.y, uv.y * wv) * 24.0 + float2(-t * 0.3 + seed * 17.0, seed * 5.0);
                    float cB = RBW_Cells(g * 0.42 + 2.7);
                    float cb = RBW_Cells(g + 1.3);
                    float lumpy = (cB - 0.45) * 0.7;
                    float shape = (1.0 - smoothstep(0.45, 0.95, ac + lumpy)) * smoothstep(0.0, 0.16, uv.x)
                                * (1.0 - smoothstep(0.62, 1.0, uv.x + lumpy * 0.4));
                    float dome = 1.0 - smoothstep(0.1, 0.78, cB);
                    float3 film = lerp(float3(0.5, 0.54, 0.95), white, saturate(pow(dome, 1.4) * 1.05));
                    film += float3(0.2, 0.2, 0.22) * (1.0 - smoothstep(0.05, 0.14, cB));
                    float gap = 1.0 - smoothstep(0.3, 0.6, dome);
                    float hole = (1.0 - smoothstep(0.12, 0.26, cb)) * gap;
                    col = lerp(film, float3(0.3, 0.46, 1.0), hole * 0.8);
                    alpha = shape * lerp(0.94, 0.6, hole);
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
