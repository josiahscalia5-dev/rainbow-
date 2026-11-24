using System.Collections.Generic;
using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Round 4 (2026-11-24): a small rounded stroke typeface for the Screen 05 HUD, generated in code (no font file): the approved
    /// HUD uses fat round-ended letters (stroke ~0.27 of the capital height). Glyphs are polylines in a box of height 1 (y up);
    /// a glyph pixel is inside when it is closer than Stroke / 2 to a segment.
    /// </summary>
    public static class HudGlyphs
    {
        public const float Stroke = 0.27f;

        public sealed class Glyph
        {
            public float width;
            public readonly List<Vector4> segs = new List<Vector4>();   // x0, y0, x1, y1
        }

        static Dictionary<char, Glyph> map;

        static Glyph New(char c, float w)
        {
            var g = new Glyph { width = w };
            map[c] = g;
            return g;
        }

        static void L(Glyph g, float x0, float y0, float x1, float y1) => g.segs.Add(new Vector4(x0, y0, x1, y1));

        static void Arc(Glyph g, float cx, float cy, float rx, float ry, float a0, float a1, int n = 16)
        {
            for (int i = 0; i < n; i++)
            {
                float a = Mathf.Lerp(a0, a1, i / (float)n) * Mathf.Deg2Rad, b = Mathf.Lerp(a0, a1, (i + 1) / (float)n) * Mathf.Deg2Rad;
                L(g, cx + rx * Mathf.Cos(a), cy + ry * Mathf.Sin(a), cx + rx * Mathf.Cos(b), cy + ry * Mathf.Sin(b));
            }
        }

        public static Glyph Get(char c)
        {
            if (map == null) Build();
            return map.TryGetValue(c, out Glyph g) ? g : map[' '];
        }

        static void Build()
        {
            map = new Dictionary<char, Glyph>();
            const float h = Stroke * 0.5f, t = 1f - h;
            Glyph g;
            New(' ', 0.36f);
            g = New('0', 0.80f); Arc(g, 0.40f, 0.5f, 0.40f - h, 0.5f - h, 0f, 360f, 28);
            g = New('1', 0.46f); L(g, h, 0.74f, 0.29f, t); L(g, 0.29f, t, 0.29f, h);
            g = New('2', 0.74f); Arc(g, 0.37f, 0.635f, 0.37f - h, t - 0.635f, 165f, -38f); L(g, 0.555f, 0.49f, h, h); L(g, h, h, 0.74f - h, h);
            g = New('3', 0.72f); Arc(g, 0.35f, 0.69f, 0.205f, t - 0.69f, 150f, -90f); Arc(g, 0.35f, 0.32f, 0.235f, 0.32f - h, 90f, -150f);
            g = New('4', 0.80f); L(g, 0.50f, t, h, 0.36f); L(g, h, 0.36f, 0.80f - h, 0.36f); L(g, 0.56f, 0.60f, 0.56f, h);
            g = New('5', 0.74f); L(g, 0.60f, t, 0.21f, t); L(g, 0.21f, t, 0.18f, 0.57f); Arc(g, 0.36f, 0.385f, 0.245f, 0.385f - h, 130f, -145f, 18);
            g = New('6', 0.76f); Arc(g, 0.38f, 0.36f, 0.38f - h, 0.36f - h, 0f, 360f, 22); Arc(g, 0.60f, 0.36f, 0.60f - h, t - 0.36f, 100f, 180f, 10);
            g = New('7', 0.72f); L(g, h, t, 0.72f - h, t); L(g, 0.72f - h, t, 0.30f, h);
            g = New('8', 0.74f); Arc(g, 0.37f, 0.69f, 0.20f, t - 0.69f, 0f, 360f, 20); Arc(g, 0.37f, 0.32f, 0.37f - h, 0.32f - h, 0f, 360f, 22);
            g = New('9', 0.76f); Arc(g, 0.38f, 0.64f, 0.38f - h, t - 0.64f, 0f, 360f, 22); Arc(g, 0.16f, 0.64f, 0.60f - h, 0.64f - h, -80f, 0f, 10);
            g = New(',', 0.30f); L(g, 0.17f, 0.08f, 0.10f, -0.10f);
            g = New('.', 0.28f); L(g, 0.14f, h, 0.14f, h);
            g = New('/', 0.52f); L(g, 0.44f, 1.03f, 0.10f, -0.06f);
            g = New('+', 1f); L(g, 0.5f, h, 0.5f, t); L(g, h, 0.5f, t, 0.5f);
            g = New('•', 0.44f); Arc(g, 0.22f, 0.5f, 0.06f, 0.06f, 0f, 360f, 12);
            g = New('F', 0.66f); L(g, h, h, h, t); L(g, h, t, 0.66f - h, t); L(g, h, 0.52f, 0.50f, 0.52f);
            g = New('L', 0.64f); L(g, h, t, h, h); L(g, h, h, 0.64f - h, h);
            g = New('O', 0.98f); Arc(g, 0.49f, 0.5f, 0.49f - h, 0.5f - h, 0f, 360f, 30);
            g = New('W', 1.24f); L(g, h, t, 0.37f, h); L(g, 0.37f, h, 0.62f, 0.78f); L(g, 0.62f, 0.78f, 0.87f, h); L(g, 0.87f, h, 1.24f - h, t);
            g = New('I', 0.27f); L(g, h, h, h, t);
            g = New('N', 0.84f); L(g, h, h, h, t); L(g, h, t, 0.84f - h, h); L(g, 0.84f - h, h, 0.84f - h, t);
            g = New('T', 0.78f); L(g, h, t, 0.78f - h, t); L(g, 0.39f, t, 0.39f, h);
            g = New('H', 0.84f); L(g, h, h, h, t); L(g, 0.84f - h, h, 0.84f - h, t); L(g, h, 0.5f, 0.84f - h, 0.5f);
            g = New('E', 0.68f); L(g, h, h, h, t); L(g, h, t, 0.68f - h, t); L(g, h, 0.5f, 0.58f - h, 0.5f); L(g, h, h, 0.68f - h, h);
            g = New('C', 0.90f); Arc(g, 0.49f, 0.5f, 0.49f - h, 0.5f - h, 46f, 314f, 24);
            g = New('U', 0.84f); L(g, h, t, h, 0.42f); Arc(g, 0.42f, 0.42f, 0.42f - h, 0.42f - h, 180f, 360f, 16); L(g, 0.84f - h, 0.42f, 0.84f - h, t);
            g = New('R', 0.78f); L(g, h, h, h, t); L(g, h, t, 0.40f, t); Arc(g, 0.40f, 0.685f, 0.23f, t - 0.685f, 90f, -90f, 14); L(g, 0.40f, 0.505f, h, 0.505f); L(g, 0.42f, 0.505f, 0.78f - h, h);
        }

        /// <summary>Width of a text in capital heights (spacing = extra gap between glyphs).</summary>
        public static float Measure(string s, float spacing)
        {
            float w = 0f;
            for (int i = 0; i < s.Length; i++) w += Get(s[i]).width + (i > 0 ? spacing : 0f);
            return w;
        }

        static float SegDist(float px, float py, Vector4 s)
        {
            float dx = s.z - s.x, dy = s.w - s.y;
            float l2 = dx * dx + dy * dy;
            float u = l2 > 1e-9f ? Mathf.Clamp01(((px - s.x) * dx + (py - s.y) * dy) / l2) : 0f;
            float ex = px - s.x - dx * u, ey = py - s.y - dy * u;
            return Mathf.Sqrt(ex * ex + ey * ey);
        }

        /// <summary>Signed distance (capital heights, &lt; 0 inside) of a point to a glyph.</summary>
        public static float Sdf(Glyph g, float x, float y)
        {
            float d = 9f;
            foreach (Vector4 s in g.segs) d = Mathf.Min(d, SegDist(x, y, s));
            return d - Stroke * 0.5f;
        }

        /// <summary>
        /// One-line text as a texture (title banner): capital height capPx, italic shear, vertical colour gradient, soft dark
        /// outline / drop shadow. Texture padding = pad px on every side; width from the text.
        /// </summary>
        public static Texture2D TextTexture(string name, string text, float capPx, float spacing, float shear, Color top, Color bottom,
            Color shadow, float shadowPx, int pad)
        {
            int w = Mathf.CeilToInt((Measure(text, spacing) + shear) * capPx) + 2 * pad, hgt = Mathf.CeilToInt(capPx) + 2 * pad;
            var px = new Color[w * hgt];
            for (int i = 0; i < px.Length; i++) px[i] = new Color(shadow.r, shadow.g, shadow.b, 0f);
            float pen = 0f;
            foreach (char c in text)
            {
                Glyph g = Get(c);
                if (g.segs.Count > 0)
                {
                    int x0 = Mathf.Max(0, Mathf.FloorToInt(pad + (pen - 0.3f) * capPx)), x1 = Mathf.Min(w - 1, Mathf.CeilToInt(pad + (pen + g.width + shear + 0.3f) * capPx));
                    for (int y = 0; y < hgt; y++)
                        for (int x = x0; x <= x1; x++)
                        {
                            float gy = (y + 0.5f - pad) / capPx;
                            float gx = (x + 0.5f - pad) / capPx - pen - shear * gy;
                            float d = Sdf(g, gx, gy) * capPx;
                            float dsh = Sdf(g, gx - 0.02f, gy + shadowPx / capPx) * capPx;      // shadow falls down
                            float a = Mathf.Clamp01(0.5f - d);
                            float sh = Mathf.Max(Mathf.Clamp01(0.5f - (dsh - 1.2f) * 0.5f), Mathf.Clamp01(0.5f - (d - 1.5f) * 0.5f)) * shadow.a;
                            Color face = Color.Lerp(bottom, top, Mathf.Clamp01(gy));
                            float outA = a + sh * (1f - a);
                            Color o = px[y * w + x];
                            if (outA <= o.a) continue;
                            Color col = (face * a + shadow * (sh * (1f - a))) / Mathf.Max(outA, 1e-4f);
                            col.a = outA;
                            px[y * w + x] = col;
                        }
                }
                pen += g.width + spacing;
            }
            var t = new Texture2D(w, hgt, TextureFormat.RGBA32, false) { name = name, wrapMode = TextureWrapMode.Clamp, filterMode = FilterMode.Bilinear };
            t.SetPixels(px);
            t.Apply(false, false);
            return t;
        }
    }
}
