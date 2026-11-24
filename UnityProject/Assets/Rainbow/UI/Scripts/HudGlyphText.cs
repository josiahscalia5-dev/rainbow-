using UnityEngine;
using UnityEngine.UI;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Round 4 (2026-11-24): HUD number text ("5/5", "1,420") in the rounded stroke typeface (HudGlyphs). Draws one quad per character
    /// from a small atlas generated once (digits, comma, slash); white with a faint lilac foot like the approved numerals.
    /// </summary>
    [RequireComponent(typeof(CanvasRenderer))]
    public sealed class HudGlyphText : MaskableGraphic
    {
        /// <summary>Round 8: the approved counters are a medium weight (stroke ~0.18 of the capital height), lighter than the banner.</summary>
        const float Thin = 0.006f;

        const string Chars = "0123456789,/+";
        const int CellW = 72, CellH = 96, CapPx = 60, PadX = 8, PadY = 18;
        static Texture2D atlas;

        [SerializeField] string content = "";
        [SerializeField] float capHeight = 44f;
        [SerializeField] float spacing = 0.06f;

        public string Content
        {
            get => content;
            set { if (content != value) { content = value; SetVerticesDirty(); } }
        }

        public void Setup(string s, float cap, float gap)
        {
            content = s; capHeight = cap; spacing = gap;
            raycastTarget = false;
            SetAllDirty();
        }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
        static void ResetStatics() { atlas = null; }

        static Texture2D Atlas()
        {
            if (atlas != null) return atlas;
            int w = CellW * Chars.Length, h = CellH;
            var px = new Color[w * h];
            for (int c = 0; c < Chars.Length; c++)
            {
                HudGlyphs.Glyph g = HudGlyphs.Get(Chars[c]);
                float k = Chars[c] == '+' ? 0.9f : 1f;
                for (int y = 0; y < h; y++)
                    for (int x = 0; x < CellW; x++)
                    {
                        float gx = (x + 0.5f - PadX) / CapPx, gy = (y + 0.5f - PadY) / CapPx;
                        float a = Mathf.Clamp01(0.5f - (HudGlyphs.Sdf(g, gx / k, gy) + Thin) * CapPx);
                        Color col = Color.Lerp(new Color(0.96f, 0.80f, 0.98f, 1f), Color.white, Mathf.SmoothStep(0f, 1f, Mathf.Clamp01(gy * 1.8f)));
                        col.a = a;
                        px[y * w + c * CellW + x] = col;
                    }
            }
            atlas = new Texture2D(w, h, TextureFormat.RGBA32, true) { name = "HudGlyphAtlas", wrapMode = TextureWrapMode.Clamp, filterMode = FilterMode.Trilinear };
            atlas.SetPixels(px);
            atlas.Apply(true, false);
            return atlas;
        }

        public override Texture mainTexture => Atlas();

        protected override void OnPopulateMesh(VertexHelper vh)
        {
            vh.Clear();
            if (string.IsNullOrEmpty(content)) return;
            float unit = capHeight / CapPx;
            float total = HudGlyphs.Measure(content, spacing) * capHeight;
            Rect r = GetPixelAdjustedRect();
            float pen = r.center.x - total * 0.5f, baseY = r.center.y - capHeight * 0.5f;
            Color32 col = color;
            int v = 0;
            for (int i = 0; i < content.Length; i++)
            {
                int idx = Chars.IndexOf(content[i]);
                float gw = HudGlyphs.Get(content[i]).width * capHeight;
                if (idx >= 0)
                {
                    float x0 = pen - PadX * unit, x1 = x0 + CellW * unit, y0 = baseY - PadY * unit, y1 = y0 + CellH * unit;
                    float u0 = idx / (float)Chars.Length, u1 = (idx + 1) / (float)Chars.Length;
                    vh.AddVert(new Vector3(x0, y0), col, new Vector2(u0, 0f));
                    vh.AddVert(new Vector3(x0, y1), col, new Vector2(u0, 1f));
                    vh.AddVert(new Vector3(x1, y1), col, new Vector2(u1, 1f));
                    vh.AddVert(new Vector3(x1, y0), col, new Vector2(u1, 0f));
                    vh.AddTriangle(v, v + 1, v + 2);
                    vh.AddTriangle(v, v + 2, v + 3);
                    v += 4;
                }
                pen += gw + spacing * capHeight;
            }
        }
    }
}
