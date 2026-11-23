using System;
using System.Globalization;
using System.IO;
using System.Text;
using UnityEngine;

namespace Rainbow.Screen05.EditorTools
{
    /// <summary>
    /// Evidence image for "approved vs Game view": writes one PNG with three panels side by side -
    /// [approved reference | capture | absolute difference x3] - all at the reference size (864x1536), and a JSON file
    /// with measured numbers: mean colour of both images and their mean absolute RGB difference (0..255, lower = closer)
    /// for the whole frame and for a 3 x 4 grid of regions (row 0 = top of the picture). These are plain pixel
    /// statistics, NOT a likeness percentage - never quote them as one.
    /// </summary>
    public static class Screen05SideBySide
    {
        const int GridColumns = 3;
        const int GridRows = 4;

        /// <summary>
        /// capturePng: a still (absolute or project-relative). outPng: default "&lt;capture&gt;_vs_approved.png".
        /// referencePng: default C:\RainbowUnity\references\05_flow_into_the_current.png.
        /// Returns the output PNG path (JSON next to it) or "ERROR: ...".
        /// </summary>
        public static string Compose(string capturePng, string outPng = null, string referencePng = null)
        {
            if (string.IsNullOrEmpty(capturePng)) return "ERROR: no capture PNG given";
            string capturePath = Screen05CaptureUtil.ResolvePath(capturePng);
            string referencePath = string.IsNullOrEmpty(referencePng)
                ? Screen05CaptureUtil.ReferencePngPath
                : Screen05CaptureUtil.ResolvePath(referencePng);
            if (!File.Exists(capturePath)) return "ERROR: capture not found: " + capturePath;
            if (!File.Exists(referencePath)) return "ERROR: reference not found: " + referencePath;

            string outPath = string.IsNullOrEmpty(outPng)
                ? Path.Combine(Path.GetDirectoryName(capturePath) ?? "", Path.GetFileNameWithoutExtension(capturePath) + "_vs_approved.png")
                : Screen05CaptureUtil.ResolvePath(outPng);

            Texture2D reference = Load(referencePath);
            Texture2D capture = Load(capturePath);
            Texture2D captureSized = null;
            Texture2D sheet = null;
            try
            {
                int w = reference.width;
                int h = reference.height;
                captureSized = capture.width == w && capture.height == h ? capture : Resize(capture, w, h);

                Color32[] a = reference.GetPixels32();
                Color32[] b = captureSized.GetPixels32();
                var panel = new Color32[w * 3 * h];

                var sumA = new double[GridColumns * GridRows, 3];
                var sumB = new double[GridColumns * GridRows, 3];
                var sumDiff = new double[GridColumns * GridRows];
                var counts = new int[GridColumns * GridRows];
                double totalDiff = 0;

                for (int y = 0; y < h; y++)
                {
                    int row = Mathf.Min(GridRows - 1, (h - 1 - y) * GridRows / h);   // row 0 = top of the picture
                    for (int x = 0; x < w; x++)
                    {
                        int column = Mathf.Min(GridColumns - 1, x * GridColumns / w);
                        int cell = row * GridColumns + column;
                        Color32 ca = a[y * w + x];
                        Color32 cb = b[y * w + x];
                        int dr = Math.Abs(ca.r - cb.r), dg = Math.Abs(ca.g - cb.g), db = Math.Abs(ca.b - cb.b);
                        double d = (dr + dg + db) / 3.0;

                        sumA[cell, 0] += ca.r; sumA[cell, 1] += ca.g; sumA[cell, 2] += ca.b;
                        sumB[cell, 0] += cb.r; sumB[cell, 1] += cb.g; sumB[cell, 2] += cb.b;
                        sumDiff[cell] += d;
                        counts[cell]++;
                        totalDiff += d;

                        int o = y * w * 3;
                        panel[o + x] = new Color32(ca.r, ca.g, ca.b, 255);
                        panel[o + w + x] = new Color32(cb.r, cb.g, cb.b, 255);
                        panel[o + 2 * w + x] = new Color32((byte)Mathf.Min(255, dr * 3), (byte)Mathf.Min(255, dg * 3), (byte)Mathf.Min(255, db * 3), 255);
                    }
                }

                sheet = new Texture2D(w * 3, h, TextureFormat.RGBA32, false);
                sheet.SetPixels32(panel);
                Screen05CaptureUtil.EnsureParentFolder(outPath);
                File.WriteAllBytes(outPath, sheet.EncodeToPNG());

                var json = new StringBuilder();
                json.Append("{\n  \"reference\": ").Append(Quote(referencePath))
                    .Append(",\n  \"capture\": ").Append(Quote(capturePath))
                    .Append(",\n  \"sheet\": ").Append(Quote(outPath))
                    .Append(",\n  \"layout\": \"left = approved, middle = capture (scaled to the reference size), right = |difference| x3\"")
                    .Append(",\n  \"captureOriginalSize\": \"").Append(capture.width).Append('x').Append(capture.height).Append('"')
                    .Append(",\n  \"meanAbsRgbDifference_0to255\": ").Append(Num(totalDiff / (w * (double)h)))
                    .Append(",\n  \"note\": \"pixel statistics only, lower = closer; not a likeness percentage\"")
                    .Append(",\n  \"regions\": [");
                for (int cell = 0; cell < GridColumns * GridRows; cell++)
                {
                    double n = Math.Max(1, counts[cell]);
                    json.Append(cell == 0 ? "\n" : ",\n")
                        .Append("    {\"row\": ").Append(cell / GridColumns)
                        .Append(", \"column\": ").Append(cell % GridColumns)
                        .Append(", \"approvedMeanRgb\": [").Append(Num(sumA[cell, 0] / n)).Append(", ").Append(Num(sumA[cell, 1] / n)).Append(", ").Append(Num(sumA[cell, 2] / n)).Append(']')
                        .Append(", \"captureMeanRgb\": [").Append(Num(sumB[cell, 0] / n)).Append(", ").Append(Num(sumB[cell, 1] / n)).Append(", ").Append(Num(sumB[cell, 2] / n)).Append(']')
                        .Append(", \"meanAbsRgbDifference\": ").Append(Num(sumDiff[cell] / n)).Append('}');
                }
                json.Append("\n  ]\n}\n");
                File.WriteAllText(Path.ChangeExtension(outPath, ".json"), json.ToString());

                Screen05Capture.LastOutput = outPath;
                return outPath;
            }
            finally
            {
                if (captureSized != null && captureSized != capture) UnityEngine.Object.DestroyImmediate(captureSized);
                if (sheet != null) UnityEngine.Object.DestroyImmediate(sheet);
                UnityEngine.Object.DestroyImmediate(capture);
                UnityEngine.Object.DestroyImmediate(reference);
            }
        }

        static Texture2D Load(string path)
        {
            var texture = new Texture2D(2, 2, TextureFormat.RGBA32, false);
            texture.LoadImage(File.ReadAllBytes(path), false);
            return texture;
        }

        static Texture2D Resize(Texture2D source, int w, int h)
        {
            RenderTexture rt = RenderTexture.GetTemporary(w, h, 0, RenderTextureFormat.ARGB32, RenderTextureReadWrite.sRGB);
            Graphics.Blit(source, rt);
            RenderTexture previous = RenderTexture.active;
            RenderTexture.active = rt;
            var result = new Texture2D(w, h, TextureFormat.RGBA32, false);
            result.ReadPixels(new Rect(0, 0, w, h), 0, 0, false);
            RenderTexture.active = previous;
            RenderTexture.ReleaseTemporary(rt);
            return result;
        }

        static string Num(double v) => v.ToString("0.##", CultureInfo.InvariantCulture);

        static string Quote(string s) => "\"" + s.Replace("\\", "\\\\").Replace("\"", "\\\"") + "\"";
    }
}
