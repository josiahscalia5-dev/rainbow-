using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using Unity.Collections;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;

namespace Rainbow.Screen05.EditorTools
{
    /// <summary>
    /// Round 4 (2026-11-24) AUTOMATIC LOOK FITTER (editor test tool, never part of the game): while the Editor is paused at the approved view it
    /// renders the real gameplay camera (Screen05FrameGrabber, HUD included once), measures the still against the approved image with the same maths
    /// as tools/screen05-measure.ps1 (blurs done at 1/4 size for speed, differences ~0.1 point) and improves a list of look parameters one by one
    /// (pattern search). It only changes values that exist in materials / lights / post-processing / transforms; the winning values are written as
    /// Assets/Rainbow/Tuning/screen05_tuning.txt lines (Screen05Tuning applies that file at the end of every scene build).
    /// Parameter file lines:  key | min | max | step      (# comment)
    ///   key = mat:Assets/..../X.mat:_Prop:f          float property
    ///         mat:Assets/..../X.mat:_Prop:v0..v3     vector component        :c0..c3 colour component (sRGB as stored)
    ///         light:&lt;object name&gt;:intensity|r|g|b     vol:&lt;Component&gt;:&lt;field&gt; (float volume parameter, e.g. vol:Bloom:intensity)
    ///         tf:&lt;scene path&gt;:px|py|pz|rx|ry|rz|s    local transform of a scene object
    /// </summary>
    public static class Screen05AutoFit
    {
        const int W = 864, H = 1536, QW = 216, QH = 384;
        const string ApprovedPath = "../references/05_flow_into_the_current.png";

        sealed class Par { public string key; public float min, max, step, value, start; public Action<float> set; public Func<float> get; }

        // ------------------------------------------------------------------ measure
        sealed class Img { public float[] q; public float[] l16, l8; public float[][] lab32, lab16; public double[] hist; public float[] edges; }
        static float[] linLut, fLut;

        static void Luts()
        {
            if (linLut != null) return;
            linLut = new float[1025];
            for (int i = 0; i <= 1024; i++) { double c = i / 1024.0; linLut[i] = (float)(c <= 0.04045 ? c / 12.92 : Math.Pow((c + 0.055) / 1.055, 2.4)); }
            fLut = new float[4097];
            for (int i = 0; i <= 4096; i++) { double t = i / 4096.0 * 1.1; fLut[i] = (float)(t > 0.008856 ? Math.Pow(t, 1.0 / 3.0) : 7.787 * t + 16.0 / 116.0); }
        }
        static float Lin(float c255) { float x = c255 / 255f * 1024f; int i = (int)x; if (i >= 1024) return linLut[1024]; return linLut[i] + (linLut[i + 1] - linLut[i]) * (x - i); }
        static float F(float t) { float x = t / 1.1f * 4096f; if (x <= 0f) return fLut[0]; int i = (int)x; if (i >= 4096) return fLut[4096]; return fLut[i] + (fLut[i + 1] - fLut[i]) * (x - i); }

        static float[] Blur(float[] a, int w, int h, int ch, double sigma)
        {
            int rad = (int)Math.Ceiling(sigma * 3);
            var k = new float[2 * rad + 1]; double s = 0;
            for (int i = -rad; i <= rad; i++) { double v = Math.Exp(-(i * i) / (2 * sigma * sigma)); k[i + rad] = (float)v; s += v; }
            for (int i = 0; i < k.Length; i++) k[i] = (float)(k[i] / s);
            var t = new float[a.Length]; var o = new float[a.Length];
            for (int y = 0; y < h; y++)
                for (int x = 0; x < w; x++)
                    for (int c = 0; c < ch; c++)
                    {
                        float acc = 0f;
                        for (int i = -rad; i <= rad; i++) { int xx = x + i; if (xx < 0) xx = 0; else if (xx >= w) xx = w - 1; acc += k[i + rad] * a[(y * w + xx) * ch + c]; }
                        t[(y * w + x) * ch + c] = acc;
                    }
            for (int y = 0; y < h; y++)
                for (int x = 0; x < w; x++)
                    for (int c = 0; c < ch; c++)
                    {
                        float acc = 0f;
                        for (int i = -rad; i <= rad; i++) { int yy = y + i; if (yy < 0) yy = 0; else if (yy >= h) yy = h - 1; acc += k[i + rad] * t[(yy * w + x) * ch + c]; }
                        o[(y * w + x) * ch + c] = acc;
                    }
            return o;
        }

        static float[] Down(float[] rgb, int w, int h, int f)
        {
            int ow = w / f, oh = h / f; var o = new float[ow * oh * 3]; float n = f * f;
            for (int y = 0; y < oh; y++)
                for (int x = 0; x < ow; x++)
                {
                    float r = 0, g = 0, b = 0;
                    for (int yy = 0; yy < f; yy++) for (int xx = 0; xx < f; xx++) { int i = ((y * f + yy) * w + x * f + xx) * 3; r += rgb[i]; g += rgb[i + 1]; b += rgb[i + 2]; }
                    int j = (y * ow + x) * 3; o[j] = r / n; o[j + 1] = g / n; o[j + 2] = b / n;
                }
            return o;
        }
        static float[] Luma(float[] rgb) { int n = rgb.Length / 3; var o = new float[n]; for (int i = 0; i < n; i++) o[i] = 0.299f * rgb[i * 3] + 0.587f * rgb[i * 3 + 1] + 0.114f * rgb[i * 3 + 2]; return o; }
        static float[][] Lab(float[] rgb)
        {
            int n = rgb.Length / 3; var o = new[] { new float[n], new float[n], new float[n] };
            for (int i = 0; i < n; i++)
            {
                float r = Lin(rgb[i * 3]), g = Lin(rgb[i * 3 + 1]), b = Lin(rgb[i * 3 + 2]);
                float fx = F((0.4124f * r + 0.3576f * g + 0.1805f * b) / 0.95047f), fy = F(0.2126f * r + 0.7152f * g + 0.0722f * b), fz = F((0.0193f * r + 0.1192f * g + 0.9505f * b) / 1.08883f);
                o[0][i] = 116f * fy - 16f; o[1][i] = 500f * (fx - fy); o[2][i] = 200f * (fy - fz);
            }
            return o;
        }
        static int Bin(float v, float lo, float hi) { int b = (int)((v - lo) / (hi - lo) * 8f); return b < 0 ? 0 : (b > 7 ? 7 : b); }
        static double[] Hist(float[][] lab)
        {
            var h = new double[512]; int n = lab[0].Length;
            for (int i = 0; i < n; i++) h[Bin(lab[0][i], 0, 100) * 64 + Bin(lab[1][i], -90, 90) * 8 + Bin(lab[2][i], -90, 90)] += 1;
            var s = new double[512]; double tot = 0;
            for (int l = 0; l < 8; l++) for (int a = 0; a < 8; a++) for (int b = 0; b < 8; b++)
            {
                double acc = 0;
                for (int dl = -1; dl <= 1; dl++) for (int da = -1; da <= 1; da++) for (int db = -1; db <= 1; db++)
                {
                    int L = l + dl, A = a + da, B = b + db; if (L < 0 || L > 7 || A < 0 || A > 7 || B < 0 || B > 7) continue;
                    acc += (dl == 0 ? 2 : 1) * (da == 0 ? 2 : 1) * (db == 0 ? 2 : 1) * h[L * 64 + A * 8 + B];
                }
                s[l * 64 + a * 8 + b] = acc; tot += acc;
            }
            if (tot > 0) for (int i = 0; i < 512; i++) s[i] /= tot;
            return s;
        }
        static float[] Sobel(float[] a, int w, int h)
        {
            var g = new float[w * h];
            for (int y = 1; y < h - 1; y++) for (int x = 1; x < w - 1; x++)
            {
                float gx = -a[(y - 1) * w + x - 1] - 2 * a[y * w + x - 1] - a[(y + 1) * w + x - 1] + a[(y - 1) * w + x + 1] + 2 * a[y * w + x + 1] + a[(y + 1) * w + x + 1];
                float gy = -a[(y - 1) * w + x - 1] - 2 * a[(y - 1) * w + x] - a[(y - 1) * w + x + 1] + a[(y + 1) * w + x - 1] + 2 * a[(y + 1) * w + x] + a[(y + 1) * w + x + 1];
                g[y * w + x] = Mathf.Sqrt(gx * gx + gy * gy);
            }
            return g;
        }
        static double SsimMean(float[] a, float[] b, int w, int h)
        {
            int n = w * h; var aa = new float[n]; var bb = new float[n]; var ab = new float[n];
            for (int i = 0; i < n; i++) { aa[i] = a[i] * a[i]; bb[i] = b[i] * b[i]; ab[i] = a[i] * b[i]; }
            float[] ma = Blur(a, w, h, 1, 1.5), mb = Blur(b, w, h, 1, 1.5), saa = Blur(aa, w, h, 1, 1.5), sbb = Blur(bb, w, h, 1, 1.5), sab = Blur(ab, w, h, 1, 1.5);
            const double C1 = 6.5025, C2 = 58.5225; double sum = 0;
            for (int i = 0; i < n; i++)
            {
                double m1 = ma[i], m2 = mb[i], v1 = saa[i] - m1 * m1, v2 = sbb[i] - m2 * m2, cv = sab[i] - m1 * m2;
                sum += ((2 * m1 * m2 + C1) * (2 * cv + C2)) / ((m1 * m1 + m2 * m2 + C1) * (v1 + v2 + C2));
            }
            return sum / n;
        }
        static Img Prepare(float[] quarter)
        {
            var im = new Img { q = quarter };
            float[] bl = Blur(quarter, QW, QH, 3, 2.0);
            im.l16 = Luma(Down(bl, QW, QH, 4));
            im.lab32 = Lab(Down(bl, QW, QH, 8)); for (int c = 0; c < 3; c++) im.lab32[c] = Blur(im.lab32[c], QW / 8, QH / 8, 1, 1.0);
            im.hist = Hist(Lab(quarter));
            im.l8 = Luma(Down(quarter, QW, QH, 2));
            im.edges = Blur(Sobel(im.l8, QW / 2, QH / 2), QW / 2, QH / 2, 1, 1.5);
            im.lab16 = Lab(Down(quarter, QW, QH, 4)); for (int c = 0; c < 3; c++) im.lab16[c] = Blur(im.lab16[c], QW / 4, QH / 4, 1, 1.0);
            return im;
        }
        static double DE(float[][] a, float[][] b) { int n = a[0].Length; double s = 0; for (int i = 0; i < n; i++) { float x = a[0][i] - b[0][i], y = a[1][i] - b[1][i], z = a[2][i] - b[2][i]; s += Mathf.Sqrt(x * x + y * y + z * z); } return s / n; }
        static void Scores(Img A, Img U, out double visual, out double layout)
        {
            double sh = SsimMean(A.l16, U.l16, QW / 4, QH / 4), de = DE(A.lab32, U.lab32), hi = 0;
            for (int i = 0; i < 512; i++) hi += Math.Min(A.hist[i], U.hist[i]);
            visual = 100.0 * (Math.Max(0, sh) + Math.Max(0, 1 - de / 50) + hi) / 3;
            double ls = SsimMean(A.l8, U.l8, QW / 2, QH / 2), lde = DE(A.lab16, U.lab16);
            double sa = 0, su = 0, saa = 0, suu = 0, sau = 0; int n = A.edges.Length;
            for (int i = 0; i < n; i++) { double p = A.edges[i], q = U.edges[i]; sa += p; su += q; saa += p * p; suu += q * q; sau += p * q; }
            double cov = sau / n - sa / n * (su / n), va = saa / n - sa / n * (sa / n), vu = suu / n - su / n * (su / n);
            double corr = va > 1e-9 && vu > 1e-9 ? cov / Math.Sqrt(va * vu) : 0;
            layout = 100.0 * (Math.Max(0, ls) + Math.Max(0, 1 - lde / 50) + Math.Max(0, corr)) / 3;
        }
        /// <summary>Screen texture (row 0 = bottom) -> 216x384 top-down averages; HUD pixels come from hud (full still) where hudMask is set.</summary>
        static float[] Quarter(NativeArray<Color32> px, Color32[] hud, bool[] hudMask)
        {
            var o = new float[QW * QH * 3];
            for (int y = 0; y < QH; y++)
                for (int x = 0; x < QW; x++)
                {
                    int r = 0, g = 0, b = 0;
                    for (int yy = 0; yy < 4; yy++)
                    {
                        int row = (H - 1 - (y * 4 + yy)) * W + x * 4;
                        for (int xx = 0; xx < 4; xx++) { Color32 c = hudMask != null && hudMask[row + xx] ? hud[row + xx] : px[row + xx]; r += c.r; g += c.g; b += c.b; }
                    }
                    int j = (y * QW + x) * 3; o[j] = r / 16f; o[j + 1] = g / 16f; o[j + 2] = b / 16f;
                }
            return o;
        }

        // ------------------------------------------------------------------ parameters
        static string Inv(float v) => v.ToString("0.#####", CultureInfo.InvariantCulture);
        static float Num(string s) => float.Parse(s.Trim(), CultureInfo.InvariantCulture);

        static bool Bind(Par p, StringBuilder log)
        {
            string[] k = p.key.Split(':');
            if (k[0] == "mat")
            {
                var m = AssetDatabase.LoadAssetAtPath<Material>(k[1]); string prop = k[2], kind = k[3];
                if (m == null || !m.HasProperty(prop)) { log.AppendLine("no " + p.key); return false; }
                if (kind == "f") { p.get = () => m.GetFloat(prop); p.set = v => m.SetFloat(prop, v); }
                else
                {
                    int c = kind[1] - '0';
                    if (kind[0] == 'c') { p.get = () => m.GetColor(prop)[c]; p.set = v => { Color q = m.GetColor(prop); q[c] = v; m.SetColor(prop, q); }; }
                    else { p.get = () => m.GetVector(prop)[c]; p.set = v => { Vector4 q = m.GetVector(prop); q[c] = v; m.SetVector(prop, q); }; }
                }
                return true;
            }
            if (k[0] == "light")
            {
                var go = GameObject.Find(k[1]); var l = go != null ? go.GetComponent<Light>() : null; if (l == null) { log.AppendLine("no " + p.key); return false; }
                if (k[2] == "intensity") { p.get = () => l.intensity; p.set = v => l.intensity = v; }
                else { int c = "rgb".IndexOf(k[2], StringComparison.Ordinal); p.get = () => l.color[c]; p.set = v => { Color q = l.color; q[c] = v; l.color = q; }; }
                return true;
            }
            if (k[0] == "vol")
            {
                foreach (Volume vol in UnityEngine.Object.FindObjectsByType<Volume>(FindObjectsSortMode.None))
                {
                    VolumeProfile prof = vol.sharedProfile; if (prof == null) continue;
                    foreach (VolumeComponent vc in prof.components)
                    {
                        if (vc.GetType().Name != k[1]) continue;
                        var f = vc.GetType().GetField(k[2]); var par = f != null ? f.GetValue(vc) as VolumeParameter<float> : null; if (par == null) continue;
                        p.get = () => par.value; p.set = v => { par.overrideState = true; par.value = v; };
                        return true;
                    }
                }
                log.AppendLine("no " + p.key); return false;
            }
            if (k[0] == "tf")
            {
                var go = GameObject.Find(k[1]); if (go == null) { log.AppendLine("no " + p.key); return false; }
                Transform t = go.transform; string f = k[2];
                Vector3 P() => t.localPosition; Vector3 E() => t.localEulerAngles;
                if (f[0] == 'p') { int c = "xyz".IndexOf(f[1]); p.get = () => P()[c]; p.set = v => { Vector3 q = P(); q[c] = v; t.localPosition = q; }; }
                else if (f[0] == 'r') { int c = "xyz".IndexOf(f[1]); p.get = () => { float a = E()[c]; return a > 180f ? a - 360f : a; }; p.set = v => { Vector3 q = E(); q[c] = v; t.localEulerAngles = q; }; }
                else { p.get = () => t.localScale.x; p.set = v => t.localScale = Vector3.one * v; }
                return true;
            }
            log.AppendLine("unknown key " + p.key); return false;
        }

        /// <summary>Fits the parameters of paramFile for at most `seconds`; writes the changed values to outFile (tuning lines) and returns a log.</summary>
        public static string Run(string paramFile, string outFile, float seconds, float layoutWeight = 0.25f, bool keep = true)
        {
            Luts();
            var log = new StringBuilder();
            Camera cam = Camera.main; if (cam == null) return "no camera (Play mode, paused at the hold)";
            var pars = new List<Par>();
            foreach (string line in File.ReadAllLines(paramFile))
            {
                string l = line.Trim(); if (l.Length == 0 || l[0] == '#') continue;
                string[] a = l.Split('|'); if (a.Length < 4) continue;
                var p = new Par { key = a[0].Trim(), min = Num(a[1]), max = Num(a[2]), step = Num(a[3]) };
                if (Bind(p, log)) { p.value = p.start = p.get(); pars.Add(p); }
            }
            if (pars.Count == 0) return "no parameters\n" + log;
            var approved = new Texture2D(2, 2, TextureFormat.RGBA32, false); approved.LoadImage(File.ReadAllBytes(ApprovedPath));
            if (approved.width != W || approved.height != H) return "approved image size " + approved.width + "x" + approved.height;
            Img A = Prepare(Quarter(new NativeArray<Color32>(approved.GetPixels32(), Allocator.Temp), null, null));
            UnityEngine.Object.DestroyImmediate(approved);
            var grab = new Screen05FrameGrabber(W, H);
            int evals = 0; double best = 0, bv = 0, bl = 0, sv = 0, slay = 0;
            try
            {
                // HUD once: full still, mask = pixels the HUD changes
                grab.Grab(cam, false); Color32[] noHud = grab.Frame.GetPixels32();
                grab.Grab(cam, true); Color32[] hud = grab.Frame.GetPixels32();
                var mask = new bool[W * H];
                for (int i = 0; i < mask.Length; i++) mask[i] = Math.Abs(hud[i].r - noHud[i].r) + Math.Abs(hud[i].g - noHud[i].g) + Math.Abs(hud[i].b - noHud[i].b) > 6;
                double Eval()
                {
                    grab.Grab(cam, false); evals++;
                    Img U = Prepare(Quarter(grab.Frame.GetRawTextureData<Color32>(), hud, mask));
                    Scores(A, U, out bv, out bl);
                    return bv + layoutWeight * bl;
                }
                var sw = System.Diagnostics.Stopwatch.StartNew();
                best = Eval(); sv = bv; slay = bl; double keepV = bv, keepL = bl;
                log.AppendLine("start visual " + bv.ToString("0.00") + " layout " + bl.ToString("0.00") + " (" + pars.Count + " parameters, first eval " + sw.ElapsedMilliseconds + " ms)");
                var rnd = new System.Random(5); int sweep = 0;
                while (sw.Elapsed.TotalSeconds < seconds)
                {
                    sweep++; double before = best; int active = 0;
                    for (int n = 0; n < pars.Count; n++) { int j = rnd.Next(n, pars.Count); var tmp = pars[n]; pars[n] = pars[j]; pars[j] = tmp; }
                    foreach (Par p in pars)
                    {
                        if (sw.Elapsed.TotalSeconds > seconds) break;
                        if (Math.Abs(p.step) < (p.max - p.min) * 0.004f) continue;
                        active++;
                        bool ok = false; float v0 = p.value;
                        for (int d = 0; d < 2 && !ok; d++)
                        {
                            float v = Mathf.Clamp(v0 + (d == 0 ? p.step : -p.step), p.min, p.max);
                            if (Mathf.Abs(v - v0) < 1e-6f) continue;
                            p.set(v); double s = Eval();
                            if (s > best + 1e-4) { best = s; p.value = v; keepV = bv; keepL = bl; ok = true; if (d == 1) p.step = -p.step; p.step *= 1.35f; }
                        }
                        if (!ok) { p.set(v0); p.step *= 0.5f; }
                    }
                    log.AppendLine("sweep " + sweep + " visual " + keepV.ToString("0.00") + " layout " + keepL.ToString("0.00") + " evals " + evals + " t " + sw.Elapsed.TotalSeconds.ToString("0") + " s");
                    if (active == 0 || best - before < 0.003) break;
                }
                log.AppendLine("RESULT visual " + sv.ToString("0.00") + " -> " + keepV.ToString("0.00") + " | layout " + slay.ToString("0.00") + " -> " + keepL.ToString("0.00") + " | evals " + evals);
            }
            finally { grab.Dispose(); }
            pars.Sort((a, b) => string.CompareOrdinal(a.key, b.key));
            var outL = new List<string>();
            foreach (Par p in pars)
            {
                if (Mathf.Abs(p.value - p.start) < 1e-5f) continue;
                log.AppendLine("  " + p.key + " : " + Inv(p.start) + " -> " + Inv(p.value));
                outL.Add(p.key + "|" + Inv(p.value));
            }
            Directory.CreateDirectory(Path.GetDirectoryName(outFile));
            File.WriteAllLines(outFile, outL);
            if (!keep) foreach (Par p in pars) p.set(p.start);
            return log.ToString();
        }
    }
}
