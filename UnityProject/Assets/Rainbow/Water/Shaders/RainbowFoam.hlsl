// Rainbow Screen 05 - pearly soap-foam bank bubbles (foam area, round 2 2026-11-23).
// Every puff of FoamBank.cs is a camera-facing sphere IMPOSTOR (4 vertices): the quad sits on the sphere's front tangent
// plane, the fragment ray-traces the sphere (exactly round at every distance) and writes the TRUE per-pixel sphere depth,
// so the bubbles sink into the water and into each other with curved creases (one merged foam mound, not stacked discs).
// Port of src/vfx/foam.ts BANK_BUB_VERT / BANK_BUB_FRAG (wave 8 fine-foam impostors): SOAP05_GLSL colour ramp (white lit
// caps, lavender-white bodies, periwinkle / blue-violet undersides and crevices), MICRO_GLSL fine open bubbles on the lower
// half and the flanks, the scalloped lower outline of the bigger lumps, glossy little bubbles with a thin blue rim for the
// tiny lace bubbles, plus a faint pearly soap-film sheen.
// Vertex data (FoamBank.BuildMesh): POSITION = puff centre (all 4 corners), UV0 = (corner x, corner y, radius, seed),
// UV1 = (ambient occlusion, tint -1..1, stream centre x, stream half width).
// Needs (from the .shader): _WorldSpaceCameraPos, UNITY_MATRIX_V / VP (URP Core.hlsl).
#ifndef RAINBOW_FOAM_INCLUDED
#define RAINBOW_FOAM_INCLUDED

#include "Assets/Rainbow/Water/Shaders/RainbowWaterCommon.hlsl"
#include "Assets/Rainbow/Water/Shaders/RainbowFoamBank.hlsl"

// (RBW_Soap05, the approved soap colour ramp, lives in RainbowFoamBank.hlsl: the river's flat lather uses it too)

// foam.ts microFoam(): fine soap-foam micro texture. p in cells, dens 0..1 = share of cells that are open bubbles.
// Returns (hole = blue open bubble, lip = its lit lower-right rim, dome = cell interior, speck = glossy speck).
float4 RBW_MicroFoam(float2 p, float dens)
{
    float2 i = floor(p);
    float2 f = frac(p);
    float d1 = 8.0, d2 = 8.0;
    float2 r1 = float2(0.0, 0.0);
    float2 g1 = float2(0.0, 0.0);
    [unroll] for (int yy = -1; yy <= 1; yy++)
    {
        [unroll] for (int xx = -1; xx <= 1; xx++)
        {
            float2 g = float2((float)xx, (float)yy);
            float2 o = float2(RBW_Hash12(i + g), RBW_Hash12(i + g + 19.7));
            float2 r = g + o - f;
            float dd = dot(r, r);
            bool nearer = dd < d1;
            d2 = nearer ? d1 : min(d2, dd);
            d1 = nearer ? dd : d1;
            r1 = nearer ? r : r1;
            g1 = nearer ? g : g1;
        }
    }
    float2 h1 = float2(RBW_Hash12(i + g1 + 7.3), RBW_Hash12(i + g1 + 3.1));
    d1 = sqrt(d1);
    d2 = sqrt(d2);
    float rad = 0.17 + 0.2 * h1.x;
    float on = step(h1.y, dens);
    float2 dir = -r1 / max(d1, 1e-4);
    float hole = (1.0 - smoothstep(rad * 0.68, rad, d1)) * on;
    float ring = smoothstep(rad * 0.7, rad, d1) * (1.0 - smoothstep(rad, rad * 1.55, d1));
    float lip = ring * on * saturate(dot(dir, float2(0.6, -0.8)) * 0.7 + 0.45);
    float dome = smoothstep(0.0, 0.32, d2 - d1);
    float speck = (1.0 - smoothstep(0.03, 0.08, length(-r1 - float2(-0.13, 0.15)))) * (1.0 - on) * step(0.55, h1.x);
    return float4(hole, lip, dome, speck);
}

// static river floor height (RiverSurface.BaseHeight: raised stream edges + foam shelf rise) at x for stream d / hw
float RBW_FoamBaseHeight(float x, float d, float hw)
{
    hw = max(hw, 0.5);
    float lr = abs(x - d);
    float u = min(lr / hw, 1.0);
    float sh = saturate((lr - hw) / 1.2);
    sh = sh * sh * (3.0 - 2.0 * sh);
    return 0.18 * u * u * u;   // = RiverSurface.EdgeLift (ShelfRise 0)
}

// Vertex: puff centre / radius after the river swell, the lather's breathing and Benny parting the foam, and the quad
// corner on the sphere's front tangent plane (half size = radius covers the whole silhouette from any view).
//   benny = _RainbowBenny (s, world x, wake, waterline radius; w = 0: no Benny)
void RBW_FoamVertex(float3 centreWS, float4 uv0, float4 uv1, float sOffset, float waveAmp, float4 benny, float time,
                    out float3 positionWS, out float4 centreRadius)
{
    float3 c = centreWS;
    float r = uv0.z;
    float seed = uv0.w;
    float wakePuff = step(9.5, seed);                                 // Benny's wake foam (FoamBank.BuildWakeMesh)
    // perspective size compensation (foam.ts rafts: "bubbles grow with distance so their on-screen size stays ~10-45 px",
    // approved: 30-60 px bubbles in the low clumps beside Benny, 20-40 px bubbles in the tall far banks): bubbles and
    // their pile heights scale smoothly about the river floor (WaterY = 0) with the distance to the camera
    float base = RBW_FoamBaseHeight(c.x, uv1.z, uv1.w);
    // (water round 3v 2026-11-23: 0.62 .. 1.45 -> 0.85 .. 1.0 - the approved suds keep their true size, ~6-15 px far away:
    //  growing them 1.45x turned the far rims into rows of 30-60 px cotton balls)
    float k = lerp(0.85, 1.0, smoothstep(6.0, 25.0, distance(_WorldSpaceCameraPos, c)));
    k = lerp(k, 1.0, wakePuff);
    c.y = base + (c.y - base) * k;
    r *= k;
    // the puffs float on the stream: they ride the same swell as the water (RBW_RiverWave)
    c.y += (1.0 - wakePuff) * RBW_FoamBob(c.x, c.z, uv1.z, uv1.w, sOffset, waveAmp, time);
    // gentle breathing of the lather (foam.ts)
    r *= 1.0 + 0.03 * sin(time * 1.7 + seed * 40.0);
    // Benny ploughs through the bank: puffs close to him part and shrink (smoothly, no popping)
    float2 dB = float2(c.x - benny.y, c.z - benny.x);
    float dl = length(dB);
    float rb = max(benny.w, 0.5);
    float part = (1.0 - wakePuff) * step(0.001, benny.w) * (1.0 - smoothstep(rb * 1.1, rb * 2.4, dl));
    c.xz += dB / max(dl, 1e-3) * (part * rb * 0.45);
    r *= 1.0 - 0.8 * part;
    r *= lerp(1.0, saturate(benny.z), wakePuff);                      // shrinks away while he is airborne
    c.xz += wakePuff * 0.02 * sin(time * float2(3.1, 2.3) + seed * 70.0);
    float3 toCam = _WorldSpaceCameraPos - c;
    float D = max(length(toCam), 1e-3);
    float3 f = toCam / D;                                          // toward the camera
    float3 rt = normalize(cross(float3(0.0, 1.0, 0.0), -f) + float3(1e-5, 0.0, 0.0));
    float3 up = cross(-f, rt);
    positionWS = c + f * min(r, D * 0.5) + (rt * uv0.x + up * uv0.y) * (r * 1.02);
    centreRadius = float4(c, r);
}

// Ray-traces the bubble through the fragment's quad position. Returns the hit point P (world), the unit normal N and
// h (< 0: the view ray misses the sphere -> discard). Computed relative to the quad (small numbers: exact far away too).
float RBW_FoamTrace(float3 positionWS, float4 centreRadius, out float3 P, out float3 N)
{
    float3 rd = normalize(positionWS - _WorldSpaceCameraPos);
    float3 oc = positionWS - centreRadius.xyz;
    float b = dot(oc, rd);
    float3 v = oc - b * rd;                                        // centre -> ray, perpendicular
    float r = max(centreRadius.w, 1e-4);
    float h = r * r - dot(v, v);
    float t = -b - sqrt(max(h, 0.0));
    P = positionWS + rd * t;
    N = (P - centreRadius.xyz) / r;
    return h;
}

// device depth of a world point (SV_Depth)
float RBW_FoamDepth(float3 P)
{
    float4 hc = TransformWorldToHClip(P);
#if UNITY_REVERSED_Z
    return hc.z / hc.w;
#else
    return hc.z / hc.w * 0.5 + 0.5;
#endif
}

// Silhouette test incl. the scalloped lower outline of the bigger lumps (foam.ts BANK_BUB_FRAG): > 0 keeps the pixel.
// q = view-space normal xy (0 centre .. 1 rim), px = on-screen diameter in reference px.
float RBW_FoamKeep(float h, float2 q, float px, float seed)
{
    float d = length(q);
    float ang = atan2(q.y, q.x);
    float nS = clamp(floor(px / 8.0), 5.0, 16.0);
    float sc = abs(sin(ang * nS * 0.5 + seed * 31.0));
    float amp = 0.11 * smoothstep(16.0, 34.0, px) * RBW_SS(0.45, -0.35, q.y / max(d, 1e-3));
    float R = 1.0 - amp * (1.0 - sc);
    return min(h, R - d);
}

// on-screen diameter of the impostor in reference px of the 864x1536 frame (corner runs -1..1 across the quad)
float RBW_FoamPx(float2 corner)
{
    return 2.0 / max(fwidth(corner.x) * RBW_PxScale(), 1e-4);
}

// Soap colour of one bubble pixel. Nv = VIEW-space normal (x right, y up, z toward the camera, as three.js),
// px = on-screen diameter (reference px), ao = ambient occlusion (inner / lower bubbles of a pile bluer), tint -1..1.
float3 RBW_FoamColor(float3 Nv, float px, float seed, float ao, float tint, float3 lightDirWS)
{
    // round 8 (2026-11-24, user: soft white-blue soap clusters, no lavender balls): the puffs of a heap share one soft light from above (normals
    // pulled toward world up), so they read as one cauliflower cloud; translucent bright edges; small blue bubble holes toward the lower side
    float2 q = Nv.xy;
    float z = saturate(Nv.z);
    float d = length(q);
    float3 upV = normalize(mul((float3x3)UNITY_MATRIX_V, float3(0.0, 1.0, 0.0)));
    float3 Ns = normalize(Nv + upV * 0.42);
    float up = dot(Ns, upV);
    float lit = saturate(0.52 + 0.5 * up - 0.07 * Ns.x);
    float big = smoothstep(14.0, 34.0, px);
    float t = -0.04 + 0.94 * smoothstep(0.12, 1.04, lit) - (1.0 - ao) * 0.6;
    t -= pow(1.0 - z, 2.0) * 0.28 * saturate(0.35 - q.y);                       // soft crease shade under the lump only
    // fine open bubbles: many small blue holes on the lower half and at the flanks, few on the lit cap
    float2 mp = q * (1.0 + 0.5 * (1.0 - z)) * clamp(px / 6.5, 1.4, 11.0) + seed * 37.0;
    float dens = clamp(0.1 + 0.75 * RBW_SS(0.3, -0.65, q.y) + 0.22 * (1.0 - z) - 0.12 * big, 0.0, 0.8);
    float4 mf = RBW_MicroFoam(mp, dens);
    float kf = (1.0 - smoothstep(0.5, 0.9, fwidth(mp.x) + fwidth(mp.y))) * smoothstep(9.0, 18.0, px);
    t += (mf.z - 0.6) * 0.1 * dens * kf + mf.y * 0.2 * kf;
    float3 col = RBW_Soap05(t + 0.03 * tint);
    col = lerp(col, RBW_Disp(float3(74, 132, 238)), mf.x * kf * 0.85 * (1.0 - 0.5 * lit));
    // thin-film / subsurface: bright soft silhouettes on the lit side, a breath of pink and aqua
    float fres = pow(1.0 - z, 2.4);
    col = lerp(col, RBW_Disp(float3(252, 248, 255)), fres * saturate(up * 0.9 + 0.3) * 0.38);
    col += (RBW_Iridescent(fres * 1.2 + seed * 0.7 + 0.15) - 0.35) * fres * 0.1;
    col = lerp(col, col * float3(1.03, 0.96, 1.03), 0.5 + 0.5 * tint);
    // glossy wet highlight
    float3 Lv = TransformWorldToViewDir(lightDirWS, true);
    float rl = max(dot(reflect(float3(0.0, 0.0, -1.0), Nv), Lv), 0.0);
    col += pow(rl, 30.0) * 0.22 * big + mf.w * 0.2 * kf;
    // tiny bubbles: clear white beads with a light-blue rim
    float tiny = 1.0 - smoothstep(7.0, 13.0, px);
    float2 qs = q - float2(-0.3, 0.35);
    float3 cb = lerp(RBW_Soap05(0.95), RBW_Soap05(0.35), smoothstep(0.45, 0.98, d) * 0.8) + exp(-dot(qs, qs) * 12.0) * 0.3;
    return lerp(col, cb, tiny);
}

#endif // RAINBOW_FOAM_INCLUDED
