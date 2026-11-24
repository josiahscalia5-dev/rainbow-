using System.Collections.Generic;
using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Procedural, anti-aliased HUD art (port of the src/ui/hud.ts CSS look) and the coin face (src/gameplay/coins.ts
    /// canvas drawing): glossy pills, the gold-bordered banner, heart, gold $ coin, pause button, sparkle.
    /// Used by the editor builder (saved as PNG assets) and at runtime as a fallback when a sprite is missing.
    /// </summary>
    public static class UISpriteFactory
    {
        public static Color Hex(string hex, float a = 1f)
        {
            Color c;
            if (!ColorUtility.TryParseHtmlString(hex.StartsWith("#") ? hex : "#" + hex, out c)) c = Color.magenta;
            c.a = a;
            return c;
        }

        public static Sprite ToSprite(Texture2D t)
        {
            return Sprite.Create(t, new Rect(0, 0, t.width, t.height), new Vector2(0.5f, 0.5f), 100f, 0, SpriteMeshType.FullRect);
        }

        static Texture2D NewTex(int w, int h, string name)
        {
            Texture2D t = new Texture2D(w, h, TextureFormat.RGBA32, false);
            t.name = name;
            t.wrapMode = TextureWrapMode.Clamp;
            t.filterMode = FilterMode.Bilinear;
            return t;
        }

        /// <summary>Fully opaque single-colour texture (dividers, overlays, hurt flash).</summary>
        public static Texture2D Solid(string name, int size, Color c)
        {
            Texture2D t = NewTex(size, size, name);
            Color[] px = new Color[size * size];
            for (int i = 0; i < px.Length; i++) px[i] = c;
            t.SetPixels(px);
            t.Apply(false, false);
            return t;
        }

        static float RoundedRectSdf(float px, float py, float hx, float hy, float r)
        {
            float qx = Mathf.Abs(px) - hx + r, qy = Mathf.Abs(py) - hy + r;
            float ox = Mathf.Max(qx, 0f), oy = Mathf.Max(qy, 0f);
            return Mathf.Sqrt(ox * ox + oy * oy) + Mathf.Min(Mathf.Max(qx, qy), 0f) - r;
        }

        static Color Over(Color dst, Color src, float cover)
        {
            float a = Mathf.Clamp01(src.a * cover);
            float outA = a + dst.a * (1f - a);
            if (outA < 1e-5f) return new Color(0f, 0f, 0f, 0f);
            Color c = (src * a + dst * dst.a * (1f - a)) / outA;
            c.a = outA;
            return c;
        }

        /// <summary>
        /// Glossy rounded rectangle: vertical gradient, border, soft top inner gloss.
        /// radius in px (use h/2 for a pill). Colours may be translucent.
        /// </summary>
        public static Texture2D Pill(string name, int w, int h, float radius, Color top, Color bottom, float border, Color borderCol, float gloss)
        {
            Texture2D t = NewTex(w, h, name);
            Color[] px = new Color[w * h];
            float hx = w * 0.5f - 1f, hy = h * 0.5f - 1f;
            radius = Mathf.Min(radius, Mathf.Min(hx, hy));
            for (int y = 0; y < h; y++)
            {
                float v = y / (float)(h - 1);
                for (int x = 0; x < w; x++)
                {
                    float d = RoundedRectSdf(x + 0.5f - w * 0.5f, y + 0.5f - h * 0.5f, hx, hy, radius);
                    float shape = Mathf.Clamp01(0.5f - d);
                    if (shape <= 0f) { px[y * w + x] = new Color(0f, 0f, 0f, 0f); continue; }
                    Color c = Color.Lerp(bottom, top, v);
                    // inner gloss: soft white band in the upper part, fading toward the edges
                    float inner = Mathf.Clamp01(-d / Mathf.Max(2f, h * 0.18f));
                    float g = gloss * Mathf.SmoothStep(0.5f, 0.92f, v) * inner;
                    c = Over(c, new Color(1f, 1f, 1f, 1f), g * 0.55f);
                    if (border > 0f)
                    {
                        float bd = Mathf.Abs(d + border * 0.5f) - border * 0.5f;
                        c = Over(c, borderCol, Mathf.Clamp01(0.5f - bd));
                    }
                    c.a *= shape;
                    px[y * w + x] = c;
                }
            }
            t.SetPixels(px);
            t.Apply(false, false);
            return t;
        }

        /// <summary>Round 8: recolours a pill by rows (glass gloss): stops = (v 0 bottom .. 1 top, r, g, b 0-255); alpha, rim and edges stay.</summary>
        public static Texture2D GlassRows(Texture2D t, Color baseTop, Color baseBottom, params Vector4[] stops)
        {
            int w = t.width, h = t.height;
            Color[] px = t.GetPixels();
            for (int y = 0; y < h; y++)
            {
                float v = y / (float)(h - 1);
                int i = 0;
                while (i + 2 < stops.Length && v > stops[i + 1].x) i++;
                float k = Mathf.SmoothStep(0f, 1f, Mathf.InverseLerp(stops[i].x, stops[i + 1].x, v));
                Vector4 s = Vector4.Lerp(stops[i], stops[i + 1], k);
                Color want = new Color(s.y / 255f, s.z / 255f, s.w / 255f, 1f), was = Color.Lerp(baseBottom, baseTop, v);
                for (int x = 0; x < w; x++)
                {
                    Color c = px[y * w + x];
                    if (c.a <= 0f) continue;
                    float isFill = 1f - Mathf.Clamp01((Mathf.Abs(c.r - was.r) + Mathf.Abs(c.g - was.g) + Mathf.Abs(c.b - was.b)) * 3f);
                    px[y * w + x] = new Color(Mathf.Lerp(c.r, want.r, isFill), Mathf.Lerp(c.g, want.g, isFill), Mathf.Lerp(c.b, want.b, isFill), c.a);
                }
            }
            t.SetPixels(px);
            t.Apply(false, false);
            return t;
        }

        /// <summary>Round button: translucent dark fill, white ring, two rounded pause bars (hud.ts .pbtn).</summary>
        public static Texture2D PauseButton(string name, int size)
        {
            Texture2D t = NewTex(size, size, name);
            Color[] px = new Color[size * size];
            float c0 = size * 0.5f, r = size * 0.5f - 1.5f;
            float ring = size * 0.034f;
            Color fill = new Color(74 / 255f, 2 / 255f, 120 / 255f, 0.96f), white = new Color(0.98f, 0.93f, 1f, 0.97f);   // round 4: dark like the approved
            float barW = size * 0.14f, barH = size * 0.45f, gap = size * 0.12f;
            for (int y = 0; y < size; y++)
                for (int x = 0; x < size; x++)
                {
                    float dx = x + 0.5f - c0, dy = y + 0.5f - c0;
                    float d = Mathf.Sqrt(dx * dx + dy * dy) - r;
                    float shape = Mathf.Clamp01(0.5f - d);
                    if (shape <= 0f) { px[y * size + x] = new Color(0f, 0f, 0f, 0f); continue; }
                    Color c = Color.Lerp(fill, new Color(96 / 255f, 10 / 255f, 138 / 255f, 0.96f), Mathf.Clamp01(dy / r * 0.5f + 0.5f));
                    float rd = Mathf.Abs(d + ring * 0.5f) - ring * 0.5f;
                    c = Over(c, white, Mathf.Clamp01(0.5f - rd));
                    // round 8: glassy inner line and a soft light on the lower left of the rim
                    float rd2 = Mathf.Abs(d + ring * 2.7f) - ring * 0.28f;
                    c = Over(c, new Color(0.82f, 0.62f, 0.96f, 0.55f), Mathf.Clamp01(0.5f - rd2));
                    float b1 = RoundedRectSdf(dx + gap * 0.5f + barW * 0.5f, dy, barW * 0.5f, barH * 0.5f, barW * 0.5f);
                    float b2 = RoundedRectSdf(dx - gap * 0.5f - barW * 0.5f, dy, barW * 0.5f, barH * 0.5f, barW * 0.5f);
                    c = Over(c, white, Mathf.Clamp01(0.5f - Mathf.Min(b1, b2)));
                    c.a *= shape;
                    px[y * size + x] = c;
                }
            t.SetPixels(px);
            t.Apply(false, false);
            return t;
        }

        /// <summary>Glossy red heart (3x3 supersampled implicit heart curve).</summary>
        public static Texture2D Heart(string name, int size)
        {
            Texture2D t = NewTex(size, size, name);
            Color[] px = new Color[size * size];
            Color top = Hex("#ff58a0"), bottom = Hex("#ee1562"), rim = Hex("#c80a4c");   // round 4: approved heart (251,113,200) .. (238,24,120)
            for (int y = 0; y < size; y++)
                for (int x = 0; x < size; x++)
                {
                    float cover = 0f, coverInner = 0f, depth = 0f;
                    for (int sy = 0; sy < 3; sy++)
                        for (int sx = 0; sx < 3; sx++)
                        {
                            float u = ((x + (sx + 0.5f) / 3f) / size - 0.5f) * 2.6f;
                            float v = ((y + (sy + 0.5f) / 3f) / size - 0.42f) * 2.6f;
                            if (HeartInside(u, v, 1f)) cover += 1f / 9f;
                            if (HeartInside(u, v, 0.94f)) coverInner += 1f / 9f;
                            for (int k = 1; k <= 5; k++) if (HeartInside(u, v, 1f - 0.06f * k)) depth += 1f / 45f;   // 0 at the outline .. 1 inside 0.70
                        }
                    if (cover <= 0f) { px[y * size + x] = new Color(0f, 0f, 0f, 0f); continue; }
                    float vy = y / (float)size;
                    // round 4: lit from the upper left like the approved heart (pink (251,113,200) -> hot red-pink (246,23,124))
                    float hk = Mathf.Clamp01(vy * 0.75f - (x / (float)size - 0.5f) * 0.9f + 0.12f);
                    Color c = Color.Lerp(rim, Color.Lerp(bottom, top, hk), coverInner);
                    // round 7 (user guide #7 "raised heart"): the edge band darkens toward the outline so the heart reads as a rounded,
                    // raised gem (approved heart luminance p10 68 / p90 176, Unity was 86 / 128)
                    Color edge = new Color(c.r * 0.9f, c.g * 0.55f, c.b * 0.72f, 1f);
                    c = Color.Lerp(edge, c, Mathf.SmoothStep(0f, 1f, depth));   // smooth rounding, no outline ring
                    // glossy sheen, upper left (round 7: broader 0.18 -> 0.24, softer) + a small crisp white specular spot
                    float hx = x / (float)size - 0.33f, hy = y / (float)size - 0.68f;
                    float hl = Mathf.Clamp01(1f - Mathf.Sqrt(hx * hx * 3.2f + hy * hy * 7f) / 0.24f);
                    c = Over(c, new Color(1f, 0.86f, 0.93f), hl * 0.5f * coverInner);
                    float qx = x / (float)size - 0.31f, qy = y / (float)size - 0.70f;
                    float qr = qx * 0.82f + qy * 0.57f, qs = -qx * 0.57f + qy * 0.82f;                   // round 8: a bigger slanted window highlight on the left lobe
                    float spec = Mathf.SmoothStep(0f, 1f, Mathf.Clamp01(1.5f * (1f - Mathf.Sqrt(qr * qr * 2.2f + qs * qs * 7f) / 0.2f)));
                    c = Over(c, Color.white, spec * 0.95f * coverInner);
                    // round 8: a thin bright glassy rim round the raised heart, strongest at the lower left (approved: pink-white edge light)
                    float rimL = Mathf.Clamp01((1f - depth) * 1.25f) * (1f - Mathf.SmoothStep(0.15f, 0.55f, depth));
                    float rimDir = Mathf.Clamp01(0.55f + 0.5f * (0.5f - vy) + 0.35f * (0.5f - x / (float)size));
                    c = Over(c, new Color(1f, 0.66f, 0.78f), rimL * rimDir * 0.85f);
                    c.a = cover;
                    px[y * size + x] = c;
                }
            t.SetPixels(px);
            t.Apply(false, false);
            return t;
        }

        static bool HeartInside(float x, float y, float k)
        {
            x /= k; y /= k;
            float a = x * x + y * y - 1f;
            return a * a * a - x * x * y * y * y <= 0f;
        }

        // ---- coin face (coins.ts canvas, 256 px design space, y down) -------------------------------------------------
        static List<Vector2> dollarPath;

        static void EnsureDollar()
        {
            if (dollarPath != null) return;
            dollarPath = new List<Vector2>();
            AddBezier(new Vector2(166, 90), new Vector2(150, 66), new Vector2(90, 64), new Vector2(90, 98));
            AddBezier(new Vector2(90, 98), new Vector2(90, 128), new Vector2(166, 124), new Vector2(166, 160));
            AddBezier(new Vector2(166, 160), new Vector2(166, 196), new Vector2(104, 198), new Vector2(88, 168));
        }

        static void AddBezier(Vector2 a, Vector2 b, Vector2 c, Vector2 d)
        {
            int start = dollarPath.Count == 0 ? 0 : 1;
            for (int i = start; i <= 24; i++)
            {
                float t = i / 24f, u = 1f - t;
                dollarPath.Add(u * u * u * a + 3f * u * u * t * b + 3f * u * t * t * c + t * t * t * d);
            }
        }

        static float SegDist(Vector2 p, Vector2 a, Vector2 b)
        {
            Vector2 ab = b - a;
            float tt = Mathf.Clamp01(Vector2.Dot(p - a, ab) / Mathf.Max(1e-6f, ab.sqrMagnitude));
            return (p - (a + ab * tt)).magnitude;
        }

        static float DollarCover(Vector2 p, float lw)
        {
            float dS = float.MaxValue;
            for (int i = 0; i + 1 < dollarPath.Count; i++) dS = Mathf.Min(dS, SegDist(p, dollarPath[i], dollarPath[i + 1]));
            float dV = Mathf.Min(SegDist(p, new Vector2(128, 48), new Vector2(128, 74)), SegDist(p, new Vector2(128, 182), new Vector2(128, 208)));   // round 8: short stubs above and below the S like the approved
            float cS = Mathf.Clamp01(lw * 0.5f - dS + 0.5f);
            float cV = Mathf.Clamp01(lw * 0.62f * 0.5f - dV + 0.5f);
            return Mathf.Max(cS, cV);
        }

        /// <summary>Gold coin face with raised rim and embossed $ (alpha = round mask). Also the HUD coin icon.</summary>
        public static Texture2D CoinFace(string name, int size, bool hudGold = false)
        {
            EnsureDollar();
            Texture2D t = NewTex(size, size, name);
            Color[] px = new Color[size * size];
            float k = 256f / size;
            // round 4 (2026-11-24): the approved coins are ORANGE-gold (face (244,132,1) .. (249,155,16), $ (253,226,83)) with a lighter
            // raised rim that carries cream tick marks and a fat embossed $; the old lemon palette bloomed to pale yellow
            Color g0 = new Color(1f, 0.745f, 0.20f), g1 = new Color(0.985f, 0.61f, 0.07f), g2 = new Color(0.90f, 0.43f, 0.0f);
            Color rimCol = new Color(1f, 0.70f, 0.16f), tick = new Color(1f, 0.93f, 0.70f);
            Color groove = new Color(0.78f, 0.36f, 0.0f), lip = new Color(1f, 0.86f, 0.42f);
            Color shadow = new Color(0.52f, 0.20f, 0.0f), outline = new Color(0.80f, 0.40f, 0.0f), glyph = new Color(1f, 0.84f, 0.30f), bevel = new Color(1f, 0.97f, 0.84f);
            for (int y = 0; y < size; y++)
                for (int x = 0; x < size; x++)
                {
                    // design-space point (y down like the canvas)
                    Vector2 p = new Vector2((x + 0.5f) * k, (size - 1 - y + 0.5f) * k);
                    float dc = (p - new Vector2(128f, 128f)).magnitude;
                    float shape = Mathf.Clamp01(128f - dc + 0.5f);
                    if (shape <= 0f) { px[y * size + x] = new Color(0f, 0f, 0f, 0f); continue; }
                    float gt = Mathf.Clamp01((p - new Vector2(256f * 0.38f, 256f * 0.32f)).magnitude / (256f * 0.6f));
                    Color c = gt < 0.45f ? Color.Lerp(g0, g1, gt / 0.45f) : Color.Lerp(g1, g2, (gt - 0.45f) / 0.55f);
                    c = Over(c, rimCol, Mathf.Clamp01(dc - 101f));
                    float ang = Mathf.Atan2(p.y - 128f, p.x - 128f) / (2f * Mathf.PI) * 16f;
                    float ta = Mathf.Abs(ang - Mathf.Round(ang)) / 16f * 2f * Mathf.PI * dc;                 // px across a tick
                    c = Over(c, tick, Mathf.Clamp01(3.2f - ta) * Mathf.Clamp01(dc - 107f) * Mathf.Clamp01(122f - dc) * 0.9f);
                    float rg = Mathf.Abs((p - new Vector2(130f, 130f)).magnitude - 256f * 0.385f);
                    c = Over(c, groove, Mathf.Clamp01(4.0f - rg + 0.5f));
                    float rl = Mathf.Abs((p - new Vector2(127f, 127f)).magnitude - 256f * 0.4f);
                    c = Over(c, lip, Mathf.Clamp01(3.0f - rl + 0.5f) * 0.9f);
                    Vector2 q = new Vector2(128f, 128f) + (p - new Vector2(128f, 128f)) / 1.06f;             // the $ 6 % larger
                    c = Over(c, shadow, DollarCover(q - new Vector2(4f, 6f), 42f) * 0.85f);
                    c = Over(c, outline, DollarCover(q, 40f));
                    c = Over(c, glyph, DollarCover(q, 31f));
                    c = Over(c, bevel, DollarCover(q + new Vector2(3f, 4f), 13f));
                    // round 8: the HUD icon is drawn without the scene light: the approved icon is a brighter yellow gold
                    if (hudGold) c = new Color(Mathf.Min(1f, c.r * 1.05f), Mathf.Min(1f, c.g * 1.12f), Mathf.Min(1f, c.b * 0.95f), c.a);
                    c.a = shape;
                    px[y * size + x] = c;
                }
            t.SetPixels(px);
            t.Apply(true, false);
            return t;
        }

        /// <summary>Soft four-point sparkle for the coin pop particles (white, alpha = intensity).</summary>
        public static Texture2D Sparkle(string name, int size)
        {
            Texture2D t = NewTex(size, size, name);
            Color[] px = new Color[size * size];
            for (int y = 0; y < size; y++)
                for (int x = 0; x < size; x++)
                {
                    float u = (x + 0.5f) / size * 2f - 1f, v = (y + 0.5f) / size * 2f - 1f;
                    float r = Mathf.Sqrt(u * u + v * v);
                    float glow = Mathf.Clamp01(1f - r);
                    glow = glow * glow * 0.7f;
                    float star = Mathf.Clamp01(1f - Mathf.Abs(u) * 14f) * Mathf.Clamp01(1f - Mathf.Abs(v)) + Mathf.Clamp01(1f - Mathf.Abs(v) * 14f) * Mathf.Clamp01(1f - Mathf.Abs(u));
                    float a = Mathf.Clamp01(glow + star);
                    px[y * size + x] = new Color(1f, 1f, 1f, a);
                }
            t.SetPixels(px);
            t.Apply(true, false);
            return t;
        }
    }
}
