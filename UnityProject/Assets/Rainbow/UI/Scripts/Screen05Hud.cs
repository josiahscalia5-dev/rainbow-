using System.Globalization;
using UnityEngine;
using UnityEngine.UI;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Portrait uGUI HUD of Screen 05 (port of src/ui/hud.ts; 1080 x 1920 reference, 1 hud unit u = 19.2 px):
    /// glossy dark-purple pill bar (heart "5/5 +", gold coin + counter that counts up, round pause button),
    /// the gold-bordered purple banner "05 • FLOW INTO THE CURRENT", a hint line, a hurt flash, a pause overlay and the
    /// finish panel ("Great swimming!", coins collected, Restart). Built by Create() (editor builder or runtime fallback).
    /// </summary>
    public class Screen05Hud : MonoBehaviour
    {
        public const string Title = "05 • FLOW INTO THE CURRENT";

        [System.Serializable]
        public class Sprites
        {
            public Sprite bar, banner, heart, coin, pause, panel, button, white, pill, title;
        }

        public Sprites sprites = new Sprites();

        [Header("Widgets")]
        public RectTransform safeArea;
        public Image barImage, bannerImage, heartImage, coinImage, flashImage, dimImage, panelImage, buttonImage;
        public Button pauseButton, restartButton;
        public Text heartsText, plusText, coinsText, bannerText, hintText, pausedText;
        [Tooltip("Round 4: rounded numerals (HudGlyphText); the legacy Text fields stay null.")]
        public HudGlyphText heartsGlyph, coinsGlyph;
        public Image pillImage, titleImage;
        public Text finishTitle, finishCoins, finishTotal, restartLabel;
        public GameObject finishPanel, pausedOverlay;

        int coinsTarget, coinsShown;
        float coinsAnim;
        float hintUntil = -1f, flash;
        Rect lastSafe;
        Vector2Int lastScreen;

        void Awake()
        {
            FillMissingSprites();
            if (finishPanel != null) finishPanel.SetActive(false);
            if (pausedOverlay != null) pausedOverlay.SetActive(false);
            if (flashImage != null) flashImage.color = new Color(1f, 0.1f, 0.25f, 0f);
        }

        /// <summary>Generate any sprite that was not assigned (e.g. the PNG assets were not imported).</summary>
        public void FillMissingSprites()
        {
            if (sprites == null) sprites = new Sprites();
            if (sprites.bar == null) sprites.bar = UISpriteFactory.ToSprite(BarTexture());
            if (sprites.banner == null) sprites.banner = UISpriteFactory.ToSprite(BannerTexture());
            if (sprites.heart == null) sprites.heart = UISpriteFactory.ToSprite(UISpriteFactory.Heart("hud_heart", 128));
            if (sprites.coin == null) sprites.coin = UISpriteFactory.ToSprite(UISpriteFactory.CoinFace("hud_coin", 128, true));
            if (sprites.pause == null) sprites.pause = UISpriteFactory.ToSprite(UISpriteFactory.PauseButton("hud_pause", 128));
            if (sprites.panel == null) sprites.panel = UISpriteFactory.ToSprite(PanelTexture());
            if (sprites.button == null) sprites.button = UISpriteFactory.ToSprite(ButtonTexture());
            if (sprites.white == null) sprites.white = UISpriteFactory.ToSprite(UISpriteFactory.Solid("hud_white", 8, Color.white));
            if (sprites.pill == null) sprites.pill = UISpriteFactory.ToSprite(PillTexture());
            if (sprites.title == null) sprites.title = UISpriteFactory.ToSprite(TitleTexture());
            Assign(pillImage, sprites.pill);
            Assign(titleImage, sprites.title);
            Assign(barImage, sprites.bar);
            Assign(bannerImage, sprites.banner);
            Assign(heartImage, sprites.heart);
            Assign(coinImage, sprites.coin);
            if (pauseButton != null) Assign(pauseButton.GetComponent<Image>(), sprites.pause);
            Assign(panelImage, sprites.panel);
            Assign(buttonImage, sprites.button);
            Assign(flashImage, sprites.white);
            Assign(dimImage, sprites.white);
        }

        static void Assign(Image img, Sprite s)
        {
            if (img != null && img.sprite == null) img.sprite = s;
        }

        // ---- textures (hud.ts CSS) ----------------------------------------------------------------------------------
        public static Texture2D BarTexture()
        {
            // .bar: linear-gradient(rgba(150,60,200,.72), rgba(92,22,150,.78)), border .22u rgba(255,220,255,.55), radius 2.8u
            // coordinator round 3 (2026-11-23): the approved bar is a DARK magenta-purple glass (pill median luminance ~57,
            // mean ~(160,56,147) with the icons); Unity's 0.80-alpha lavender bar let the walls through (median ~110)
            // round 4 (2026-11-24), sampled on the approved image: deep purple glass (97,3,131) top .. (92,2,128) bottom, thin lilac
            // rim (230,172,243) .. (198,91,237); the old 0.9 white gloss washed it out to lavender
            // round 8: glossy glass - a bright magenta reflection under the top rim (measured (165,12,190) at y 25, (150,16,155) at y 30), deep violet body
            Color bt = new Color(101 / 255f, 3 / 255f, 134 / 255f, 1f), bb = new Color(91 / 255f, 2 / 255f, 127 / 255f, 1f);
            return UISpriteFactory.GlassRows(UISpriteFactory.Pill("hud_bar", 992, 109, 54f, bt, bb, 3.2f, new Color(232 / 255f, 160 / 255f, 246 / 255f, 0.95f), 0f), bt, bb,
                new Vector4(0f, 112f, 4f, 142f), new Vector4(0.12f, 96f, 3f, 131f), new Vector4(0.5f, 95f, 3f, 130f), new Vector4(0.7f, 112f, 6f, 141f),
                new Vector4(0.83f, 148f, 13f, 162f), new Vector4(0.93f, 168f, 16f, 190f), new Vector4(1f, 176f, 40f, 196f));
        }

        /// <summary>Round 4: the left "hearts" pill inside the bar (outline only).</summary>
        public static Texture2D PillTexture()
        {
            return UISpriteFactory.Pill("hud_pill", 372, 106, 53f, new Color(88 / 255f, 2 / 255f, 124 / 255f, 0.6f),
                new Color(80 / 255f, 2 / 255f, 120 / 255f, 0.6f), 2.6f, new Color(215 / 255f, 150 / 255f, 240 / 255f, 0.75f), 0.02f);
        }

        /// <summary>Round 4: the title lettering (rounded italic capitals, cream-gold, dark drop shadow) as one texture.</summary>
        public static Texture2D TitleTexture()
        {
            return HudGlyphs.TextTexture("hud_title", Title, 54f, 0.125f, 0.21f, UISpriteFactory.Hex("#fff0c8"), UISpriteFactory.Hex("#ffd27a"),
                new Color(0.16f, 0f, 0.22f, 0.85f), 3f, 14);
        }

        public static Texture2D BannerTexture()
        {
            // .banner: linear-gradient(#7a2bb0, #4f1489), border .22u #ffd36b, radius 2.1u
            // round 4: sampled on the approved image: fill (97,2,140), pale gold rim (229,170,110)
            return UISpriteFactory.Pill("hud_banner", 784, 84, 42f, new Color(98 / 255f, 2 / 255f, 142 / 255f, 1f),
                new Color(96 / 255f, 2 / 255f, 140 / 255f, 1f), 4.4f, UISpriteFactory.Hex("#f5b964"), 0.02f);
        }

        public static Texture2D PanelTexture()
        {
            // .victory .pill: linear-gradient(#8b34c4, #4d128a), border .45u #ffcd5a, radius 5u
            return UISpriteFactory.Pill("hud_panel", 880, 640, 96f, UISpriteFactory.Hex("#8b34c4", 0.96f), UISpriteFactory.Hex("#4d128a", 0.96f),
                9f, UISpriteFactory.Hex("#ffcd5a"), 0.6f);
        }

        public static Texture2D ButtonTexture()
        {
            return UISpriteFactory.Pill("hud_button", 440, 124, 62f, UISpriteFactory.Hex("#ffe08a"), UISpriteFactory.Hex("#f0a21c"),
                5f, UISpriteFactory.Hex("#fff4c8"), 0.8f);
        }

        // ---- runtime API ---------------------------------------------------------------------------------------------
        public void SetHearts(int hearts, int max)
        {
            if (heartsText != null) heartsText.text = hearts + "/" + max;
            if (heartsGlyph != null) heartsGlyph.Content = hearts + "/" + max;
        }

        /// <summary>Show a coin total; animate = count up from the shown value.</summary>
        public void SetCoins(int value, bool animate)
        {
            coinsTarget = value;
            if (!animate) { coinsShown = value; coinsAnim = value; WriteCoins(); }
        }

        void WriteCoins()
        {
            if (coinsText != null) coinsText.text = coinsShown.ToString("N0", CultureInfo.InvariantCulture);
            if (coinsGlyph != null) coinsGlyph.Content = coinsShown.ToString("N0", CultureInfo.InvariantCulture);
        }

        public void ShowHint(string text, float seconds)
        {
            if (hintText == null) return;
            hintText.text = text;
            hintText.gameObject.SetActive(!string.IsNullOrEmpty(text));
            hintUntil = Time.unscaledTime + seconds;
        }

        public void FlashHurt() { flash = 0.45f; }

        public void SetPaused(bool paused)
        {
            if (pausedOverlay != null) pausedOverlay.SetActive(paused);
        }

        public void ShowFinish(int collected, int total, int score)
        {
            if (finishPanel == null) return;
            finishPanel.SetActive(true);
            if (finishTitle != null) finishTitle.text = "Great swimming!";
            if (finishCoins != null) finishCoins.text = "Coins collected: " + collected + " / " + total;
            if (finishTotal != null) finishTotal.text = "Total  " + score.ToString("N0", CultureInfo.InvariantCulture);
        }

        public void HideFinish()
        {
            if (finishPanel != null) finishPanel.SetActive(false);
        }

        void Update()
        {
            float dt = Time.unscaledDeltaTime;
            if (coinsShown != coinsTarget)
            {
                float rate = Mathf.Max(60f, Mathf.Abs(coinsTarget - coinsAnim) * 6f);
                coinsAnim = Mathf.MoveTowards(coinsAnim, coinsTarget, rate * dt);
                coinsShown = Mathf.RoundToInt(coinsAnim);
                WriteCoins();
            }
            if (hintText != null && hintText.gameObject.activeSelf && hintUntil > 0f && Time.unscaledTime > hintUntil)
                hintText.gameObject.SetActive(false);
            if (flashImage != null)
            {
                flash = Mathf.Max(0f, flash - dt);
                flashImage.color = new Color(1f, 0.1f, 0.25f, flash * 0.6f);
            }
            ApplySafeArea();
        }

        void ApplySafeArea()
        {
            if (safeArea == null) return;
            Rect sa = Screen.safeArea;
            Vector2Int scr = new Vector2Int(Screen.width, Screen.height);
            if (sa == lastSafe && scr == lastScreen) return;
            lastSafe = sa; lastScreen = scr;
            if (scr.x <= 0 || scr.y <= 0) return;
            safeArea.anchorMin = new Vector2(sa.xMin / scr.x, sa.yMin / scr.y);
            safeArea.anchorMax = new Vector2(sa.xMax / scr.x, sa.yMax / scr.y);
            safeArea.offsetMin = Vector2.zero;
            safeArea.offsetMax = Vector2.zero;
        }

        // ---- hierarchy -----------------------------------------------------------------------------------------------
        static Font font;
        static Font HudFont()
        {
            if (font == null) font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            return font;
        }

        static RectTransform MakeRect(string name, Transform parent, Vector2 anchor, Vector2 pivot, Vector2 pos, Vector2 size)
        {
            GameObject go = new GameObject(name, typeof(RectTransform));
            go.layer = 5; // UI
            RectTransform rt = go.GetComponent<RectTransform>();
            rt.SetParent(parent, false);
            rt.anchorMin = anchor; rt.anchorMax = anchor; rt.pivot = pivot;
            rt.anchoredPosition = pos; rt.sizeDelta = size;
            return rt;
        }

        static void Stretch(RectTransform rt)
        {
            rt.anchorMin = Vector2.zero; rt.anchorMax = Vector2.one;
            rt.offsetMin = Vector2.zero; rt.offsetMax = Vector2.zero;
            rt.pivot = new Vector2(0.5f, 0.5f);
        }

        static Image Img(RectTransform rt, Sprite s, bool raycast)
        {
            Image img = rt.gameObject.AddComponent<Image>();
            img.sprite = s;
            img.raycastTarget = raycast;
            img.preserveAspect = false;
            return img;
        }

        static Text Txt(RectTransform rt, string text, int size, Color col, FontStyle style, TextAnchor align)
        {
            Text t = rt.gameObject.AddComponent<Text>();
            t.font = HudFont();
            t.text = text;
            t.fontSize = size;
            t.fontStyle = style;
            t.color = col;
            t.alignment = align;
            t.raycastTarget = false;
            t.horizontalOverflow = HorizontalWrapMode.Overflow;
            t.verticalOverflow = VerticalWrapMode.Overflow;
            return t;
        }

        static void Shade(Text t, Color col, Vector2 dist)
        {
            Shadow sh = t.gameObject.AddComponent<Shadow>();
            sh.effectColor = col;
            sh.effectDistance = dist;
        }

        static void ShadeGraphic(Graphic g, Color col, Vector2 dist)
        {
            Shadow sh = g.gameObject.AddComponent<Shadow>();
            sh.effectColor = col;
            sh.effectDistance = dist;
        }

        /// <summary>Builds the whole HUD canvas under parent and returns its controller.</summary>
        public static Screen05Hud Create(Transform parent, Sprites spr)
        {
            if (spr == null) spr = new Sprites();
            GameObject canvasGo = new GameObject("HUD", typeof(RectTransform), typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            canvasGo.layer = 5;
            if (parent != null) canvasGo.transform.SetParent(parent, false);
            Canvas canvas = canvasGo.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 10;
            CanvasScaler scaler = canvasGo.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1080f, 1920f);
            scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
            scaler.matchWidthOrHeight = 0.5f;

            Screen05Hud hud = canvasGo.AddComponent<Screen05Hud>();
            hud.sprites = spr;
            Transform root = canvasGo.transform;
            Color white = Color.white;
            Color gold = UISpriteFactory.Hex("#ffe9a8");
            Color textShadow = new Color(60 / 255f, 0f, 100 / 255f, 0.5f);

            // hurt flash (full screen, under everything else)
            RectTransform flash = MakeRect("HurtFlash", root, Vector2.zero, new Vector2(0.5f, 0.5f), Vector2.zero, Vector2.zero);
            Stretch(flash);
            hud.flashImage = Img(flash, spr.white, false);
            hud.flashImage.color = new Color(1f, 0.1f, 0.25f, 0f);

            RectTransform safe = MakeRect("SafeArea", root, Vector2.zero, new Vector2(0.5f, 0.5f), Vector2.zero, Vector2.zero);
            Stretch(safe);
            hud.safeArea = safe;

            Vector2 top = new Vector2(0.5f, 1f);
            // ---- top bar. Round 4 (2026-11-24): every element measured on the approved 864x1536 image (px * 1.25 = reference units)
            //      bar x 33-826 / y 14-101, hearts pill x 33-330, heart x 67-146 / y 26-88, numerals 35 px capitals (y 36-70),
            //      plus (281.5, 55.5), dividers x 344 / 707, coin (420, 57) r 40.5, pause ring (773, 55.5) r 45
            RectTransform bar = MakeRect("TopBar", safe, top, top, new Vector2(-3.1f, -17.5f), new Vector2(992f, 109f));
            hud.barImage = Img(bar, spr.bar, false);
            Vector2 left = new Vector2(0f, 0.5f);
            RectTransform pill = MakeRect("HeartsPill", bar, left, new Vector2(0f, 0.5f), new Vector2(0.5f, 0f), new Vector2(371f, 106f));
            hud.pillImage = Img(pill, spr.pill, false);
            RectTransform heart = MakeRect("Heart", bar, left, new Vector2(0.5f, 0.5f), new Vector2(92f, 4.5f), new Vector2(112f, 91f));
            hud.heartImage = Img(heart, spr.heart, false);
            RectTransform hearts = MakeRect("HeartsText", bar, left, new Vector2(0.5f, 0.5f), new Vector2(210f, 5.7f), new Vector2(150f, 90f));
            hud.heartsGlyph = hearts.gameObject.AddComponent<HudGlyphText>();
            hud.heartsGlyph.Setup("5/5", 43.5f, 0.05f);
            ShadeGraphic(hud.heartsGlyph, new Color(40 / 255f, 0f, 70 / 255f, 0.7f), new Vector2(1.5f, -3f));
            RectTransform plus = MakeRect("Plus", bar, left, new Vector2(0.5f, 0.5f), new Vector2(310.6f, 2.6f), new Vector2(70f, 90f));
            HudGlyphText plusG = plus.gameObject.AddComponent<HudGlyphText>();
            plusG.Setup("+", 56f, 0f);
            ShadeGraphic(plusG, new Color(40 / 255f, 0f, 70 / 255f, 0.7f), new Vector2(1.5f, -3f));
            RectTransform div1 = MakeRect("Divider1", bar, left, new Vector2(0.5f, 0.5f), new Vector2(388.7f, 1.4f), new Vector2(2.2f, 71f));
            Img(div1, spr.white, false).color = new Color(0.86f, 0.6f, 0.95f, 0.45f);
            RectTransform div2 = MakeRect("Divider2", bar, left, new Vector2(0.5f, 0.5f), new Vector2(842.5f, 1.4f), new Vector2(2.2f, 71f));
            Img(div2, spr.white, false).color = new Color(0.86f, 0.6f, 0.95f, 0.45f);
            RectTransform coin = MakeRect("CoinIcon", bar, left, new Vector2(0.5f, 0.5f), new Vector2(483.7f, 0.7f), new Vector2(102f, 102f));
            hud.coinImage = Img(coin, spr.coin, false);
            RectTransform coins = MakeRect("CoinsText", bar, left, new Vector2(0.5f, 0.5f), new Vector2(656.5f, 5.7f), new Vector2(280f, 90f));
            hud.coinsGlyph = coins.gameObject.AddComponent<HudGlyphText>();
            hud.coinsGlyph.Setup("1,420", 43.5f, 0.07f);
            ShadeGraphic(hud.coinsGlyph, new Color(40 / 255f, 0f, 70 / 255f, 0.7f), new Vector2(1.5f, -3f));
            RectTransform pause = MakeRect("PauseButton", bar, left, new Vector2(0.5f, 0.5f), new Vector2(925f, 2.6f), new Vector2(113f, 113f));
            Image pauseImg = Img(pause, spr.pause, true);
            hud.pauseButton = pause.gameObject.AddComponent<Button>();
            hud.pauseButton.targetGraphic = pauseImg;

            // ---- title banner (approved x 119-746 / y 114-181; lettering x 147-722, capitals y 132-160)
            RectTransform banner = MakeRect("TitleBanner", safe, top, top, new Vector2(0.6f, -142.5f), new Vector2(784f, 84f));
            hud.bannerImage = Img(banner, spr.banner, false);
            RectTransform titleRt = MakeRect("TitleLettering", banner, new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), new Vector2(2.5f, 1.9f), new Vector2(100f, 100f));
            hud.titleImage = Img(titleRt, spr.title, false);
            if (spr.title != null && spr.title.texture != null)
            {
                // 14 px padding and 54 px capitals in the texture -> 35 reference px capitals, width fitted to 575 px * 1.25
                float tw = spr.title.texture.width, th = spr.title.texture.height;
                float kY = 35f / 54f, kX = 719f / Mathf.Max(1f, tw - 28f);
                titleRt.sizeDelta = new Vector2(tw * kX, th * kY);
            }
            // ---- hint (bottom, 1.8u)
            RectTransform hint = MakeRect("Hint", safe, new Vector2(0.5f, 0f), new Vector2(0.5f, 0f), new Vector2(0f, 77f), new Vector2(1000f, 60f));
            hud.hintText = Txt(hint, "", 35, new Color(1f, 1f, 1f, 0.85f), FontStyle.Bold, TextAnchor.MiddleCenter);
            Shade(hud.hintText, new Color(0.3f, 0f, 0.4f, 0.6f), new Vector2(0f, -2f));
            hint.gameObject.SetActive(false);

            // ---- pause overlay
            RectTransform paused = MakeRect("PausedOverlay", root, Vector2.zero, new Vector2(0.5f, 0.5f), Vector2.zero, Vector2.zero);
            Stretch(paused);
            hud.dimImage = Img(paused, spr.white, false);
            hud.dimImage.color = new Color(0.12f, 0.02f, 0.2f, 0.45f);
            RectTransform pausedT = MakeRect("PausedText", paused, new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), Vector2.zero, new Vector2(900f, 120f));
            hud.pausedText = Txt(pausedT, "PAUSED", 77, white, FontStyle.Bold, TextAnchor.MiddleCenter);
            Shade(hud.pausedText, UISpriteFactory.Hex("#b04ad8", 0.9f), new Vector2(0f, -4f));
            hud.pausedOverlay = paused.gameObject;
            paused.gameObject.SetActive(false); // the dim layer is not a raycast target: the pause button stays clickable

            // ---- finish panel
            RectTransform fin = MakeRect("FinishPanel", root, new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), new Vector2(0f, 40f), new Vector2(880f, 640f));
            hud.panelImage = Img(fin, spr.panel, true);
            hud.finishPanel = fin.gameObject;
            RectTransform ft = MakeRect("FinishTitle", fin, top, top, new Vector2(0f, -70f), new Vector2(840f, 110f));
            hud.finishTitle = Txt(ft, "Great swimming!", 80, gold, FontStyle.BoldAndItalic, TextAnchor.MiddleCenter);
            Shade(hud.finishTitle, new Color(0.35f, 0.08f, 0.45f, 0.8f), new Vector2(0f, -4f));
            RectTransform fc = MakeRect("FinishCoins", fin, top, top, new Vector2(0f, -215f), new Vector2(840f, 80f));
            hud.finishCoins = Txt(fc, "Coins collected: 0 / 0", 50, white, FontStyle.Bold, TextAnchor.MiddleCenter);
            Shade(hud.finishCoins, textShadow, new Vector2(0f, -3f));
            RectTransform ftot = MakeRect("FinishTotal", fin, top, top, new Vector2(0f, -305f), new Vector2(840f, 70f));
            hud.finishTotal = Txt(ftot, "Total  1,420", 44, gold, FontStyle.Bold, TextAnchor.MiddleCenter);
            Shade(hud.finishTotal, textShadow, new Vector2(0f, -3f));
            RectTransform btn = MakeRect("RestartButton", fin, new Vector2(0.5f, 0f), new Vector2(0.5f, 0f), new Vector2(0f, 70f), new Vector2(440f, 124f));
            hud.buttonImage = Img(btn, spr.button, true);
            hud.restartButton = btn.gameObject.AddComponent<Button>();
            hud.restartButton.targetGraphic = hud.buttonImage;
            RectTransform bl = MakeRect("Label", btn, new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), new Vector2(0f, 2f), new Vector2(420f, 110f));
            hud.restartLabel = Txt(bl, "RESTART", 56, UISpriteFactory.Hex("#5a168f"), FontStyle.Bold, TextAnchor.MiddleCenter);
            fin.gameObject.SetActive(false);

            hud.SetCoins(1420, false);
            return hud;
        }
    }
}
