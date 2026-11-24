// Rainbow Screen 05 - round 4b (2026-11-24) polished palettes: gold rings, half-moon paddles, near frame, reflective purple
// drum wall. Every palette colour is written as the DISPLAY sRGB colour measured on references/05_flow_into_the_current.png;
// RbDisp() converts it to scene-linear radiance with the analytic inverse of the scene grade (WaterBuilder.BuildPostFX:
// exposure 0.86, contrast +15 in LogC, saturation +36, no tone mapping), so the Game view shows exactly that colour.
// Highlights multiply the result above the bloom threshold (1.5 linear). No textures: procedural, cheap on an iGPU.
#ifndef RAINBOW_POLISH05_INCLUDED
#define RAINBOW_POLISH05_INCLUDED

#ifndef RB_TWO_PI
#define RB_TWO_PI 6.2831853
#endif

float3 RbDisp(float3 srgb255)
{
    float3 y = pow(saturate(srgb255 / 255.0), 2.2);
    float l = dot(y, float3(0.2126, 0.7152, 0.0722));
    float3 x = max(l + (y - l) / 1.36, 0.0);
    x = (pow(5.555556 * x + 0.047996, 0.869565) * 1.034473 - 0.047996) / 5.555556;
    return max(x, 0.0) / 0.86;
}

float RbLine(float x, float c, float w) { float d = (x - c) / w; return exp(-d * d); }
float RbStep(float x, float a, float w) { return smoothstep(a - w, a + w, x); }

// ------------------------------------------------------------------ gold rings
// T = fraction across the band (0 wall edge .. 1 crest), Lamp = (lamp coordinate: integer at every lamp, local lamp pitch rad),
// P = object-space position (rings stand unrotated), dist = view distance.
float3 RainbowRing4b(float3 P, float T, float2 Lamp, float dist)
{
    float phi = atan2(P.x, P.y);                                        // 0 = 12 o'clock, + = rider's right
    float side = smoothstep(0.75, 1.45, abs(phi));                      // rose crowns, orange sides
    T -= 0.1 * (1.0 - T);                                               // measured in the Game view: the outer lines sat too far out
    float fwT = fwidth(T) * 0.7 + 1e-3;
    float d = abs(frac(Lamp.x + 0.5) - 0.5) * Lamp.y * 57.2958;         // degrees from the nearest lamp
    float fwd = min(fwidth(d), 6.0);
    // band colours without lamps
    float3 flange = lerp(float3(182, 60, 100), float3(222, 106, 92), side);
    float3 body   = lerp(float3(216, 90, 88), float3(232, 110, 66), side);
    float3 inner  = lerp(float3(176, 66, 104), float3(230, 108, 60), side);
    float3 dark   = lerp(float3(120, 28, 60), float3(196, 70, 20), side);
    float3 edge   = lerp(float3(108, 22, 78), float3(150, 34, 90), side);
    // the near ring is one broad orange band with thin lines (measured: main and inner part equally bright, no dark edge)
    float nearK = 1.0 - smoothstep(22.0, 32.0, dist);
    flange = lerp(flange, float3(194, 78, 34), nearK);
    body = lerp(body, float3(234, 110, 46), nearK);
    inner = lerp(inner, float3(232, 108, 50), nearK);
    dark = lerp(dark, float3(196, 74, 8), nearK);
    edge = lerp(edge, float3(204, 74, 84), nearK);
    // far rings are broad and soft (measured B / C / D)
    float farK = smoothstep(55.0, 90.0, dist);
    flange = lerp(flange, float3(205, 84, 92), farK);
    body = lerp(body, lerp(float3(218, 106, 92), float3(204, 94, 96), smoothstep(80.0, 100.0, dist)), farK);
    inner = lerp(inner, float3(216, 116, 116), farK * 0.8);
    dark = lerp(dark, float3(190, 74, 84), farK);
    edge = lerp(edge, float3(172, 62, 120), farK);
    float glow = smoothstep(125.0, 270.0, dist);                        // throat light
    T -= 0.09 * nearK * (1.0 - T);
    body = lerp(body, lerp(float3(246, 138, 88), float3(255, 204, 108), smoothstep(230.0, 440.0, dist)), glow);
    flange = lerp(flange, float3(232, 110, 62), glow);
    inner = lerp(inner, float3(250, 160, 84), glow);
    dark = lerp(dark, float3(214, 84, 48), glow);
    edge = lerp(edge, float3(214, 90, 70), glow);
    // mainC band: slightly rounded metal (brighter centre)
    float3 mainC = body * (0.94 + 0.1 * RbLine(T, 0.46, 0.14));
    // lamps: broad orange glow, yellow, white core
    float g1 = exp(-pow(d / (4.6 + fwd * 0.5), 2.0));
    float g2 = exp(-pow(d / (2.9 + fwd * 0.5), 2.0));
    float g3 = exp(-pow(d / (1.55 + fwd * 0.5), 2.0));
    float wide = exp(-d / lerp(4.5, 6.5, farK));
    mainC = lerp(mainC, float3(250, 138, 72), saturate(wide * 0.7));
    mainC = lerp(mainC, float3(253, 164, 64), g1);
    mainC = lerp(mainC, float3(255, 214, 104), g2);
    mainC = lerp(mainC, float3(255, 252, 228), g3);
    float3 fl = lerp(flange, lerp(float3(252, 190, 140), float3(255, 216, 110), nearK), saturate(g2 * 0.95 + g1 * 0.25));
    float3 inn = lerp(inner, lerp(float3(252, 180, 132), float3(255, 206, 110), nearK), saturate(g2 * 0.95 + g1 * 0.25));
    float3 c = fl;
    c = lerp(c, dark, RbLine(T, 0.205, 0.045 + fwT) * (1.0 - 0.6 * g2));
    c = lerp(c, mainC, RbStep(T, 0.265, 0.02 + fwT));
    c = lerp(c, float3(255, 176, 104), RbLine(T, 0.29, 0.016 + fwT * 0.6) * 0.65 * (1.0 - farK * 0.7));
    c = lerp(c, inn, RbStep(T, 0.655, 0.02 + fwT));
    c = lerp(c, lerp(float3(250, 160, 100), float3(255, 182, 80), side), RbLine(T, 0.655, 0.026 + fwT * 0.6) * 0.95 * (1.0 - farK * 0.6));
    c = lerp(c, dark, RbLine(T, 0.70, 0.02 + fwT * 0.5) * 0.35 * (1.0 - g2));
    c = lerp(c, edge, RbStep(T, 0.885, 0.025 + fwT) * (1.0 - 0.6 * g1));
    c = lerp(c, dark * 0.75, RbLine(T, 0.0, 0.03 + fwT) * 0.8 * (1.0 - g1));
    float hot = (g3 + 0.35 * g2) * RbStep(T, 0.25, 0.03) * (1.0 - RbStep(T, 0.68, 0.04));
    return RbDisp(c) * (1.0 + float3(2.2, 1.7, 0.8) * hot + 0.2 * glow) * lerp(1.0, 1.08, nearK);
}

// ------------------------------------------------------------------ half-moon paddles
// UV = (u 0 wall root .. 1 tip, v 0 top rim .. 1 bottom rim of the band | 0 band edge .. 1 outer edge of the underside),
// Region 0 band, 1 underside, 2 top / back. camShift slides the polished highlights while the rider swims past.
float3 RainbowPaddle4b(float2 UV, float Region, float dist)
{
    float farK = smoothstep(40.0, 90.0, dist);
    float sh = clamp((_WorldSpaceCameraPos.z - 7.48) * 0.012, -0.12, 0.16);
    float u = UV.x - sh, v = UV.y;
    float3 c;
    float hot = 0.0;
    if (Region < 0.5)
    {
        c = lerp(float3(148, 44, 50), float3(214, 88, 40), smoothstep(0.1, 0.34, u));
        c = lerp(c, float3(252, 136, 56), smoothstep(0.3, 0.5, u));
        c = lerp(c, float3(242, 128, 104), smoothstep(0.6, 0.7, u));
        c = lerp(c, float3(255, 168, 70), RbLine(u, 0.27, 0.018) * 0.55);
        c = lerp(c, float3(255, 196, 96), RbLine(u, 0.43, 0.016) * 0.85);
        c = lerp(c, float3(255, 196, 92), RbLine(u, 0.55, 0.075));
        float st = RbLine(u, 0.55, 0.042);
        c = lerp(c, float3(255, 250, 224), st);
        float tip = RbLine(u, 0.86, 0.05);
        c = lerp(c, float3(255, 226, 190), tip * 0.8);
        c *= lerp(1.0, 0.95, smoothstep(0.55, 0.95, v) * (1.0 - st));
        // rounded top rim: rose, bright outer hair line, dark seam under it
        float3 rim = lerp(float3(206, 92, 78), float3(255, 178, 160), smoothstep(0.25, 0.75, u));
        c = lerp(c, rim, 1.0 - RbStep(v, 0.11, 0.015));
        c = lerp(c, float3(255, 236, 214), RbLine(v, 0.02, 0.035) * smoothstep(0.35, 0.65, u) * 0.9);
        c = lerp(c, float3(255, 170, 80), RbLine(v, 0.125, 0.018) * 0.8);
        c = lerp(c, float3(176, 66, 30), RbLine(v, 0.165, 0.02) * 0.55 * (1.0 - st));
        c = lerp(c, float3(255, 206, 120), RbLine(v, 0.965, 0.03) * 0.9);
        hot = st * 0.9 + tip * 0.2;
    }
    else if (Region < 1.5)
    {
        c = lerp(float3(150, 44, 78), float3(122, 30, 84), smoothstep(0.05, 0.8, v));
        c = lerp(c, float3(176, 74, 92), RbLine(u, 0.62, 0.16) * 0.5);
        c = lerp(c, float3(226, 110, 96), (1.0 - smoothstep(0.02, 0.14, v)) * 0.8);
        c = lerp(c, float3(92, 20, 60), smoothstep(0.86, 1.0, v) * 0.6);
    }
    else
    {
        c = float3(188, 84, 66);
    }
    c = lerp(c, float3(206, 104, 100), farK * 0.2);
    return RbDisp(c) * (1.0 + float3(2.0, 1.6, 0.8) * hot * (1.0 - 0.6 * farK));
}

// ------------------------------------------------------------------ near frame
// v = pixels from the edge toward the stream (approved 864x1536 px), u 0 screen edge .. 1 cut end of the corner piece.
float3 RainbowFrameCorner4b(float u, float vpx, float side)
{
    float v = vpx / lerp(1.22, 1.0, saturate(u));                       // the bevel lines converge toward the cut end
    float gu = side > 0.0 ? 0.69 : 0.668;
    float du = (u - gu) / 0.125;
    float g = exp(-du * du);
    float gw = exp(-abs(u - gu) / 0.17);
    float3 band1 = lerp(float3(238, 116, 40), float3(228, 112, 70), smoothstep(0.75, 0.95, u));
    float3 band2 = lerp(float3(210, 86, 22), float3(202, 88, 34), smoothstep(0.6, 0.95, u));
    float3 outer = lerp(float3(200, 84, 26), float3(160, 60, 30), smoothstep(110.0, 200.0, v));
    float3 amber = float3(255, 200, 66), white = float3(255, 252, 214);
    float3 c = lerp(band1, amber, saturate(gw * 0.9 - 0.1));
    float g1 = saturate(g * 1.15);
    c = lerp(c, white, g1 * smoothstep(0.35, 1.0, g));
    c = lerp(c, float3(255, 176, 74), RbLine(v, 19.5, 2.2) * 0.8);
    float3 b2 = lerp(band2, amber, saturate(gw * 0.85 - 0.12) * (0.55 + 0.45 * smoothstep(28.0, 60.0, v)));
    b2 = lerp(b2, white, g1 * smoothstep(0.45, 1.0, g));
    c = lerp(c, b2, RbStep(v, 30.0, 1.2));
    c = lerp(c, lerp(float3(146, 48, 6), float3(236, 150, 40), g * 0.7), RbLine(v, 26.0, 3.6));
    c = lerp(c, float3(255, 204, 92), RbLine(v, 33.0, 2.0) * 0.8);
    c = lerp(c, float3(255, 224, 112), RbLine(v, 68.0, 2.6));
    float3 dk = lerp(float3(204, 78, 14), float3(118, 30, 4), smoothstep(74.0, 93.0, v));
    dk = lerp(dk, float3(250, 170, 40), g * 0.65 * (1.0 - smoothstep(80.0, 95.0, v)));
    c = lerp(c, dk, RbStep(v, 71.5, 1.2));
    float3 o = lerp(outer, amber, saturate(gw * 0.7 - 0.2) * (1.0 - smoothstep(130.0, 190.0, v)));
    o = lerp(o, white, saturate(g * 1.3 - 0.25) * exp(-pow((v - 116.0) / 24.0, 2.0)) * smoothstep(0.3, 1.0, g));
    c = lerp(c, o, RbStep(v, 96.0, 1.2));
    c = lerp(c, float3(255, 208, 92), RbLine(v, 100.0, 2.2));
    c = lerp(c, float3(255, 246, 224), 1.0 - smoothstep(1.5, 4.5, v));
    // cut end: bright orange edge, then the grey-violet end face
    c = lerp(c, float3(255, 178, 80), RbLine(u, 0.94, 0.007) * 0.9);
    c = lerp(c, lerp(float3(138, 104, 118), float3(84, 60, 92), smoothstep(10.0, 110.0, v)), smoothstep(0.945, 0.952, u));
    float hot = g1 * smoothstep(0.45, 1.0, g) * (1.0 - RbStep(v, 71.5, 2.0)) + 0.5 * saturate(g * 1.3 - 0.4) * RbStep(v, 98.0, 2.0) * (1.0 - smoothstep(120.0, 150.0, v));
    return RbDisp(c) * 1.2 * (1.0 + float3(2.4, 1.9, 0.8) * saturate(hot));
}

float3 RainbowFrameLip4b(float u, float v)
{
    float g = exp(-pow((u - 0.392) / 0.028, 2.0)) + exp(-pow((u - 0.6625) / 0.021, 2.0));
    float gw = exp(-abs(u - 0.392) / 0.12) + exp(-abs(u - 0.6625) / 0.09);
    g = saturate(g); gw = saturate(gw);
    float ends = smoothstep(0.16, 0.36, abs(u - 0.5));
    float3 body = lerp(float3(236, 128, 84), float3(238, 122, 56), ends);
    float3 c = lerp(body, float3(255, 204, 92), gw * 0.9);
    c = lerp(c, float3(255, 252, 226), smoothstep(0.25, 0.95, g));
    c = lerp(float3(206, 176, 196), c, RbStep(v, 12.5, 1.0));
    c = lerp(c, float3(255, 250, 250), 1.0 - smoothstep(3.0, 6.0, v));
    c = lerp(c, lerp(float3(186, 78, 26), float3(255, 176, 60), g), RbLine(v, 13.0, 1.8));
    float3 dk = lerp(float3(150, 54, 22), float3(236, 140, 40), g * 0.6);
    c = lerp(c, dk, RbStep(v, 45.5, 1.0));
    c = lerp(c, float3(255, 200, 96), RbLine(v, 42.5, 2.4));
    float3 rose = lerp(float3(212, 92, 118), float3(255, 210, 160), g);
    c = lerp(c, rose, RbStep(v, 57.0, 1.2));
    c = lerp(c, float3(250, 160, 150), RbLine(v, 74.0, 1.6) * 0.8);
    float hot = smoothstep(0.4, 1.0, g) * RbStep(v, 14.0, 1.0) * (1.0 - RbStep(v, 44.0, 1.0));
    return RbDisp(c) * 1.16 * (1.0 + float3(1.8, 1.4, 0.6) * hot);
}

// ------------------------------------------------------------------ reflective purple drum wall
// Uv0 = (arc metres from 12 o'clock, s), Uv1 = (light-line coordinate: integer on every line, slot row coordinate, local line
// pitch rad, line strength). World-fixed. _Wall4b = (line strength, pink amount, slot strength, hot core).
// Round 5 (2026-11-24, user guide #3): look5 = (recessed groove depth along every slot row, lit lathe-line strength on the
// groove edges, near-bay light-line width scale, light-line strength kept on a slot row). Approved: DARK elongated recessed
// slots in neat rows, each row's groove edged by a narrow bright pink-white streak running round the drum; the lengthwise
// light lines continuous and narrow (no rows of short white dashes); violet metal between the lines.
float3 RainbowWall5(float3 posWS, float2 Uv0, float4 Uv1, float dist, float4 look, float4 look5);
float3 RainbowWall4b(float3 posWS, float2 Uv0, float4 Uv1, float dist, float4 look)
{
    return RainbowWall5(posWS, Uv0, Uv1, dist, look, float4(0.0, 0.0, 1.0, 0.55));
}
// (master direction 2026-11-24) while Benny swims on, the rows of the far bays (forced perspective: 6 - 23 m apart) come near: every row
// splits into three (the middle one keeps its place) whenever the rows are more than ~0.2 x the distance apart, cross-faded. At the
// approved view nothing splits (rows / distance <= 0.16). x = split level, y = blend to the next level.
float2 RbRowSplit(float row, float s, float dist)
{
    float dr = length(float2(ddx(row), ddy(row))), dsx = length(float2(ddx(s), ddy(s)));
    float p = dsx / max(dr, 1e-6);                               // metres between two rows
    float lv = max(log(max(p / (0.125 * max(dist, 5.0)), 1e-3)) / 1.0986, 0.0);
    float n = min(floor(lv), 3.0);
    return float2(pow(3.0, n), smoothstep(0.32, 0.72, lv - n));
}

float3 RainbowWall5Row(float3 posWS, float2 Uv0, float4 Uv1, float dist, float4 look, float4 look5, float fwPhiIn, float fwRowIn);
float3 RainbowWall5(float3 posWS, float2 Uv0, float4 Uv1, float dist, float4 look, float4 look5)
{
    float2 sp = RbRowSplit(Uv1.y, Uv0.y, dist);
    float4 a = Uv1, b = Uv1;
    a.y = (Uv1.y - 0.5) * sp.x + 0.5;
    b.y = (Uv1.y - 0.5) * sp.x * 3.0 + 0.5;
    float fwPhi = fwidth(Uv0.x) / 6.8, fwRow = fwidth(Uv1.y);
    float3 ca = RainbowWall5Row(posWS, Uv0, a, dist, look, look5, fwPhi, fwRow * sp.x);
    [branch] if (sp.y > 0.004) ca = lerp(ca, RainbowWall5Row(posWS, Uv0, b, dist, look, look5, fwPhi, fwRow * sp.x * 3.0), sp.y);
    return ca;
}

float3 RainbowWall5Row(float3 posWS, float2 Uv0, float4 Uv1, float dist, float4 look, float4 look5, float fwPhiIn, float fwRowIn)
{
    float s = Uv0.y;
    float phi = Uv0.x / 6.8;
    float ap = abs(phi) * 57.2958;
    float d = abs(frac(Uv1.x + 0.5) - 0.5) * Uv1.z * 57.2958;           // degrees from the nearest light line
    float fwp = fwPhiIn * 57.2958;
    float st = Uv1.w * look.x;
    float row = Uv1.y;
    float fy = frac(row) - 0.5;
    // (master direction 2026-11-24) near the camera the metal is hot magenta wherever he swims (the approved near bay), violet in the depth
    float bayNA = max(1.0 - smoothstep(45.0, 47.0, s), 1.0 - smoothstep(16.0, 38.5, dist));
    // base metal: violet, hot magenta on the upper walls of the near bay
    float3 violet = float3(128, 27, 178);
    float pink = bayNA * max(1.0 - smoothstep(62.0, 104.0, ap), 0.3) * look.y * lerp(0.6, 1.0, smoothstep(-0.7, 0.7, phi));
    float n = sin(phi * 11.0 + s * 0.35) * sin(phi * 5.0 - s * 0.11 + 1.7);
    float3 c = lerp(violet, float3(112, 30, 170), saturate(n * 0.8));
    c = lerp(c, lerp(float3(240, 48, 192), float3(152, 16, 118), 1.0 - smoothstep(24.0, 27.0, s)), pink);
    c = lerp(c, float3(160, 50, 226), saturate(-n) * 0.4 * (1.0 - pink));
    c = lerp(c, float3(154, 46, 160), smoothstep(90.0, 140.0, dist) * 0.8);
    // polished panels between the slot rows
    float pan = 0.5 - 0.5 * cos(RB_TWO_PI * row);                       // 1 on the slot row, 0 between two rows
    c *= 1.1 - 0.24 * pan;
    // light lines
    st *= lerp(1.0, 0.75, smoothstep(75.0, 120.0, dist));
    float halo = exp(-d / 4.2) * st;
    float halo2 = exp(-d / 1.7) * st;
    float w0 = lerp(0.72, 1.15 * look5.z, bayNA), w = w0 + fwp * 0.6;
    float core = exp(-d * d / (w * w)) * st * lerp(1.0, look5.w, pan * pan) * lerp(1.0, w0 / w, 0.7);
    c = lerp(c, float3(244, 46, 212), saturate(halo * 1.15));
    c = lerp(c, float3(253, 108, 234), saturate(halo2 * 0.85));
    c = lerp(c, float3(255, 226, 252), saturate(core * 1.15));
    // thin seam along every slot row
    float fwy = fwRowIn;
    float rowFade = 1.0 - smoothstep(0.25, 0.6, fwy);
    c *= 1.0 - 0.28 * exp(-pow(fy / (0.06 + fwy * 0.6), 2.0)) * rowFade;
    // round 5: recessed groove along the slot row + narrow lit lathe streaks on its edges (brighter near the light lines)
    if (look5.x + look5.y > 0.0)
    {
        float grooveK = exp(-pow(fy / 0.21, 2.0)) * rowFade;
        c *= 1.0 - look5.x * grooveK;
        float rh = frac(sin(floor(row) * 78.233) * 43758.5453);
        float streak = 0.55 + 0.45 * sin(phi * 9.0 + floor(row) * 2.1 + rh * 6.0);
        streak *= 0.6 + 0.4 * saturate(halo * 1.5);
        float lw5 = 0.035 + fwy * 0.5;
        float eTop = exp(-pow((fy - 0.27) / lw5, 2.0));
        float eBot = exp(-pow((fy + 0.27) / lw5, 2.0)) * 0.45;
        float e = saturate((eTop + eBot) * streak * look5.y * rowFade * lerp(0.8, 1.2, rh));
        c = lerp(c, lerp(float3(242, 96, 228), float3(255, 214, 250), saturate(halo2 + core)), e);
    }
    // slots: rounded dashes along the arc, 44 round, third-brick offset in the near bay
    float gx0 = phi * 44.0 / RB_TWO_PI;
    float gx = gx0 + floor(row) * 0.33 * bayNA;
    float fx = frac(gx) - 0.5;
    float2 h = float2(lerp(0.28, 0.265, bayNA), lerp(0.125, 0.14, bayNA));
    float2 q = float2(fx, fy) / h;
    q *= q; q *= q;
    float sd = pow(q.x + q.y, 0.25) - 1.0;
    float ad = max(fwPhiIn * 44.0 / RB_TWO_PI / h.x, fwy / h.y) * 0.55;
    float hole = 1.0 - smoothstep(-ad, ad, sd);
    float lost = smoothstep(0.7, 2.0, ad);
    hole = lerp(hole, 0.13, lost) * look.z;
    float lip = exp(-pow((sd - 0.22 - ad * 0.6) / (0.2 + ad * 0.5), 2.0)) * (1.0 - lost) * look.z;
    c = lerp(c, float3(236, 92, 220), lip * 0.4);
    c = lerp(c, float3(44, 4, 44), hole * 0.93);
    // throat light on the deep walls
    float glow = smoothstep(120.0, 270.0, dist);
    c = lerp(c, lerp(float3(216, 88, 84), float3(252, 160, 84), smoothstep(200.0, 430.0, dist)), glow * 0.9);
    float hot = saturate(core - 0.3) * (1.0 - hole);
    return RbDisp(c) * (1.0 + look.w * hot) * lerp(1.0, 1.07, bayNA);
}

#endif // RAINBOW_POLISH05_INCLUDED
