using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Round 4b (2026-11-24) meshes of the Screen 05 drum: reflective wall bays with lengthwise light lines and slot rows,
    /// polished ring bands with their own lamps, and the thick D-shaped half-moon paddles. All numbers were measured on
    /// references/05_flow_into_the_current.png unwrapped with the gameplay camera of the approved view (s = 14). Pure
    /// functions; EnvironmentBuilder saves the results as .asset files. Shading: RainbowPolish05.hlsl.
    /// </summary>
    public static class DrumPolish05
    {
        // ------------------------------------------------------------------ light lines / lamps (degrees, 0 = 12 o'clock, + right)
        public sealed class WallBay
        {
            public float s0, s1, rows;
            public float[] a, b, k;     // line azimuth at s0 / at s1, strength
            public WallBay(float s0, float s1, float rows, float[] a, float[] b, float[] k) { this.s0 = s0; this.s1 = s1; this.rows = rows; this.a = a; this.b = b; this.k = k; }
        }

        static readonly float[] NA0 = { -128, -101, -79, -50, -44, -31, -14, 3, 20, 36.5f, 49.5f, 67, 88, 101, 118 };
        static readonly float[] NA1 = { -132, -116, -89.5f, -63, -55, -36.5f, -15, 4, 22.5f, 42.5f, 58, 75, 97, 107, 122 };
        static readonly float[] NAk = { 0.3f, 0.5f, 0.9f, 1f, 0.6f, 0.9f, 0.8f, 0.6f, 0.8f, 1f, 1f, 0.9f, 0.3f, 0.5f, 0.3f };
        static readonly float[] AB0 = { -118, -106, -94, -60.5f, -37.8f, -13.5f, 4, 22.5f, 45, 72, 91, 103, 120 };
        static readonly float[] AB1 = { -121, -110, -100, -66, -39.5f, -13, 5, 22.5f, 49, 75, 95, 106, 122 };
        static readonly float[] ABk = { 0.3f, 0.3f, 0.7f, 1f, 1f, 1f, 0.25f, 1f, 1f, 0.8f, 0.4f, 0.5f, 0.3f };
        static readonly float[] BC0 = { -117, -95, -67, -39.5f, -12, 22, 49, 77, 105, 122 };
        static readonly float[] BC1 = { -119, -98, -68, -38.5f, -9, 24.5f, 53.5f, 83, 108, 124 };
        static readonly float[] BCk = { 0.3f, 0.7f, 0.9f, 1f, 0.9f, 0.9f, 1f, 0.6f, 0.6f, 0.3f };
        static readonly float[] CD0 = { -122, -101, -68, -38.5f, -9, 24, 53.5f, 83, 107, 125 };
        static readonly float[] CD1 = { -122, -102, -69.5f, -38.5f, -9, 23, 54, 86, 107, 125 };
        static readonly float[] CDk = { 0.3f, 0.5f, 0.8f, 0.9f, 0.8f, 0.8f, 0.9f, 0.6f, 0.6f, 0.3f };

        /// <summary>Wall bays ring to ring (s0, s1, slot rows, light lines).</summary>
        public static List<WallBay> Bays()
        {
            return new List<WallBay>
            {
                new WallBay(DrumLayout05.TunnelStart, 5.6f, Mathf.Max(3f, Mathf.Round((5.6f - DrumLayout05.TunnelStart) / 1.7f)), NA0, NA0, NAk),
                new WallBay(5.6f, 25.6f, 18f, NA0, NA0, NAk),
                new WallBay(25.6f, 46f, 8f, NA0, NA1, NAk),     // round 5: 8 rows (approved ~25 px apart near the left wall; 6 gave ~32)
                new WallBay(46f, 82f, 6f, AB0, AB1, ABk),
                new WallBay(82f, 105.8f, 8f, BC0, BC1, BCk),
                new WallBay(105.8f, 159.4f, 9f, CD0, CD1, CDk),
                new WallBay(159.4f, 283f, 10f, CD1, CD1, CDk),
                new WallBay(283f, DrumLayout05.ThroatS, 8f, CD1, CD1, CDk),
            };
        }

        static readonly float[] LampN = { -122, -97, -71.5f, -49.3f, -28, -8, 13, 30, 47.2f, 66, 92, 114 };
        static readonly float[] LampA = { -113, -89.5f, -58.4f, -36.5f, -13.7f, 5, 23.3f, 44, 71, 100, 122 };
        static readonly float[] LampB = { -120, -93.3f, -65.5f, -39, -11.7f, 23.3f, 49.4f, 78, 106.5f, 127 };
        static readonly float[] LampC = { -125, -97, -68, -38.5f, -9, 24, 53.5f, 83, 107, 128 };
        static readonly float[] LampD = { -126, -100, -69, -38.5f, -9, 23.5f, 54, 85.5f, 107, 128 };

        public static float[] LampsFor(float s) => s < 30f ? LampN : (s < 60f ? LampA : (s < 95f ? LampB : (s < 130f ? LampC : LampD)));

        /// <summary>Continuous line coordinate (integer on every line) and the local pitch (rad) at azimuth phi (deg).</summary>
        static void LineCoord(float[] t, float phi, out float u, out float pitch, float[] k, out float strength)
        {
            int n = t.Length;
            strength = 1f;
            if (phi <= t[0]) { pitch = 28f; u = (phi - t[0]) / 28f; if (k != null) strength = k[0]; }
            else if (phi >= t[n - 1]) { pitch = 28f; u = n - 1 + (phi - t[n - 1]) / 28f; if (k != null) strength = k[n - 1]; }
            else
            {
                int i = 0;
                while (phi > t[i + 1]) i++;
                pitch = t[i + 1] - t[i];
                float f = (phi - t[i]) / pitch;
                u = i + f;
                if (k != null) strength = Mathf.Lerp(k[i], k[i + 1], Mathf.SmoothStep(0f, 1f, Mathf.Clamp01((f - 0.3f) / 0.4f)));
            }
            pitch *= Mathf.Deg2Rad;
        }

        sealed class Md
        {
            public readonly List<Vector3> p = new List<Vector3>(), n = new List<Vector3>();
            public readonly List<Vector2> uv0 = new List<Vector2>();
            public readonly List<Vector4> uv1 = new List<Vector4>();
            public readonly List<int> t = new List<int>();
            public bool twoComp;
            public int Add(Vector3 pos, Vector3 nor, Vector2 u0, Vector4 u1) { p.Add(pos); n.Add(nor); uv0.Add(u0); uv1.Add(u1); return p.Count - 1; }
            void Tri(int a, int b, int d)
            {
                Vector3 g = Vector3.Cross(p[b] - p[a], p[d] - p[a]);
                if (g.sqrMagnitude < 1e-14f) return;
                if (Vector3.Dot(g, n[a] + n[b] + n[d]) < 0f) { t.Add(a); t.Add(d); t.Add(b); } else { t.Add(a); t.Add(b); t.Add(d); }
            }
            public void Quad(int a, int b, int d, int e) { Tri(a, b, d); Tri(a, d, e); }
            public Mesh ToMesh(string name)
            {
                var m = new Mesh { name = name, indexFormat = p.Count > 65000 ? IndexFormat.UInt32 : IndexFormat.UInt16 };
                m.SetVertices(p); m.SetNormals(n); m.SetUVs(0, uv0);
                if (twoComp) { var l = new List<Vector2>(); foreach (var v in uv1) l.Add(new Vector2(v.x, v.y)); m.SetUVs(1, l); }
                else m.SetUVs(1, uv1);
                m.SetTriangles(t, 0, true); m.RecalculateBounds();
                return m;
            }
        }

        /// <summary>One wall bay; UV0 = (arc m from 12 o'clock, s), UV1 = (line coordinate, slot row, line pitch rad, strength).
        /// Slot rows are evenly spaced in ln(s - s_eye), i.e. evenly spaced on screen like the approved rows.</summary>
        public static Mesh BuildWallBay(WallBay bay, int radial, string name)
        {
            const float eye = 7.48f;
            float R = DrumLayout05.Radius;
            bool log = bay.s0 > 20f;
            var md = new Md();
            // the tunnel bends gently after s 262: short steps there, so the light lines stay smooth curves when he swims past
            int steps = Mathf.Clamp(Mathf.CeilToInt((bay.s1 - bay.s0) / (bay.s1 < 60f ? 1f : (bay.s1 < 120f ? 1.6f : (bay.s1 < 262f ? 4f : 1.8f)))), 4, bay.s1 < 262f ? 48 : 110);
            int cols = radial + 1;
            for (int i = 0; i <= steps; i++)
            {
                float f = i / (float)steps;
                float s = log ? eye + (bay.s0 - eye) * Mathf.Pow((bay.s1 - eye) / (bay.s0 - eye), f) : Mathf.Lerp(bay.s0, bay.s1, f);
                float row = (f * 1.10f - 0.05f) * bay.rows;      // ring margins: the first / last row stands clear of the rings
                int nl = bay.a.Length;
                var tab = new float[nl];
                for (int q = 0; q < nl; q++) tab[q] = Mathf.Lerp(bay.a[q], bay.b[q], f);
                for (int j = 0; j <= radial; j++)
                {
                    float phi = -Mathf.PI + 2f * Mathf.PI * j / radial;
                    Vector3 pos = DrumMeshes05.WallPoint(phi, s);
                    const float ep = 0.004f, es = 0.05f;
                    Vector3 nn = Vector3.Cross(DrumMeshes05.WallPoint(phi + ep, s) - DrumMeshes05.WallPoint(phi - ep, s),
                        DrumMeshes05.WallPoint(phi, s + es) - DrumMeshes05.WallPoint(phi, s - es)).normalized;
                    Vector3 inward = DrumLayout05.Centre(s) - pos;
                    if (Vector3.Dot(nn, inward) < 0f) nn = -nn;
                    LineCoord(tab, phi * Mathf.Rad2Deg, out float u, out float pitch, bay.k, out float st);
                    md.Add(pos, nn, new Vector2(R * phi, s), new Vector4(u, row + 100f, pitch, st));
                }
            }
            for (int i = 0; i < steps; i++)
                for (int j = 0; j < radial; j++)
                {
                    int a = i * cols + j, b = a + cols;
                    md.Quad(a, b, b + 1, a + 1);
                }
            return md.ToMesh(name);
        }

        /// <summary>The approved bands are slightly wavy (measured fraction of the band height): the near ring sits further in on the
        /// left and further out on the right, rings A / B bulge inward at the upper left.</summary>
        static float Wave(float s, float deg)
        {
            float G(float c, float w) => Mathf.Exp(-(deg - c) * (deg - c) / (w * w));
            if (s < 30f) return deg < 0f ? 0.1f * G(-54f, 16f) - 0.06f * G(-95f, 22f) : -0.22f * Mathf.Sin(deg * Mathf.Deg2Rad);
            if (s < 60f) return 0.2f * G(-28f, 26f) - 0.06f * G(45f, 25f) + 0.05f * G(75f, 18f);
            if (s < 95f) return 0.1f * G(-38f, 28f);
            return 0f;
        }

        /// <summary>Polished ring band (fraction t 0 wall .. 1 crest over band.height, facing the rider): UV0 = (k, t),
        /// UV1 = (lamp coordinate, lamp pitch rad). Centred on the ring centre, lathe round local Z.</summary>
        public static Mesh BuildRing(DrumLayout05.BandProfile b, float radius, int segments, float[] lamps, string name, float s = 1000f)
        {
            const float w = 0.2f;
            float[] ts = { -0.12f, 0f, 0.1f, 0.17f, 0.205f, 0.25f, 0.3f, 0.46f, 0.6f, 0.65f, 0.7f, 0.8f, 0.89f, 0.95f, 1f, 1f, 0f };
            float[] zs = { -w, -w, -w * 0.9f, -w * 0.7f, -w * 0.3f, -w * 0.8f, -w, -w * 0.7f, -w * 0.5f, -w * 0.55f, 0f, 0.05f, 0.1f, 0.12f, 0.14f, 0.16f, 0.16f };
            var md = new Md { twoComp = true };
            int ring = segments + 1, np = ts.Length;
            for (int i = 0; i < np; i++)
            {
                int i0 = Mathf.Max(0, i - 1), i1 = Mathf.Min(np - 1, i + 1);
                float dr = -(ts[i1] - ts[i0]) * b.height * radius, dz = zs[i1] - zs[i0];
                var n2 = new Vector2(-dz, dr).normalized;          // (radial, axial): toward the rider (-z)
                if (n2.y > 0f) n2 = -n2;
                for (int k = 0; k <= segments; k++)
                {
                    float deg = -180f + 360f * k / segments, ph = deg * Mathf.Deg2Rad;
                    float sn = Mathf.Sin(ph), cs = Mathf.Cos(ph);
                    float r = radius * (1f - b.height * (ts[i] + Wave(s, deg)));
                    LineCoord(lamps, deg, out float u, out float pitch, null, out _);
                    md.Add(new Vector3(r * sn, r * cs, zs[i]), new Vector3(n2.x * sn, n2.x * cs, n2.y), new Vector2(k / (float)segments, ts[i]), new Vector4(u, pitch, 0f, 0f));
                }
            }
            for (int i = 0; i < np - 1; i++)
                for (int k = 0; k < segments; k++)
                {
                    int p0 = i * ring + k, p1 = p0 + ring;
                    md.Quad(p0, p1, p1 + 1, p0 + 1);
                }
            return md.ToMesh(name);
        }

        // ------------------------------------------------------------------ half-moon paddles
        /// <summary>
        /// One paddle as measured outlines (approved px, 12 columns from the wall root to the tip): top rim, bottom edge of the
        /// curved band that faces the rider, outer edge of the visible underside. The builder places the outlines as REAL 3D
        /// curves: the band stands at the distance where the root's sight line meets the drum wall (bulging toward the rider),
        /// the underside's outer edge lies deeper in the tunnel, so the paddle is a thick D-shaped shelf on the wall.
        /// </summary>
        public sealed class PaddleOutline
        {
            public string name; public float[] tx, ty, bx, by, ux, uy;
            public PaddleOutline(string name, float[] t, float[] b, float[] u)
            {
                this.name = name; Split(t, out tx, out ty); Split(b, out bx, out by); Split(u, out ux, out uy);
            }
            static void Split(float[] v, out float[] x, out float[] y)
            {
                int n = v.Length / 2; x = new float[n]; y = new float[n];
                for (int i = 0; i < n; i++) { x[i] = v[2 * i]; y[i] = v[2 * i + 1]; }
            }
        }

        public static List<PaddleOutline> Paddles()
        {
            return new List<PaddleOutline>
            {
                new PaddleOutline("Paddle_L_big",
                    new float[] { 63,357, 68,342, 80,328, 95,319, 110,315, 130,317, 150,325, 170,337, 188,353, 202,369, 210,386, 214,408 },
                    new float[] { 63,359, 70,358, 82,357, 95,357, 110,359, 128,365, 146,372, 163,379, 180,388, 195,397, 206,405, 214,411 },
                    new float[] { 63,360, 67,367, 78,375, 92,382, 108,389, 126,397, 144,405, 162,412, 178,418, 193,420, 206,418, 214,412 }),
                new PaddleOutline("Paddle_R_big",
                    new float[] { 905,428, 903,415, 895,402, 880,397, 855,399, 835,405, 815,414, 790,428, 765,445, 742,464, 729,482, 719,510 },
                    new float[] { 905,500, 903,495, 895,488, 880,482, 862,477, 838,470, 815,474, 790,483, 765,492, 742,500, 729,506, 719,511 },
                    new float[] { 905,505, 903,508, 895,505, 878,500, 862,497, 838,502, 815,508, 790,514, 765,520, 745,526, 732,526, 719,512 }),
                new PaddleOutline("Paddle_L_mid",
                    new float[] { 248,447, 250,436, 255,426, 262,420, 270,418, 279,419, 290,422, 302,428, 314,436, 324,445, 330,454, 333,463 },
                    new float[] { 248,448, 252,447, 258,445, 265,444, 275,444, 285,446, 295,448, 305,452, 314,455, 322,459, 328,462, 333,464 },
                    new float[] { 248,449, 251,453, 257,456, 264,458, 274,461, 284,464, 295,467, 305,469, 314,471, 323,471, 329,468, 333,464 }),
                new PaddleOutline("Paddle_R_mid",
                    new float[] { 694,433, 693,420, 690,408, 687,399, 684,394, 677,397, 668,402, 658,408, 648,415, 640,424, 634,434, 630,443 },
                    new float[] { 694,434, 692,432, 689,429, 685,427, 680,425, 672,425, 664,427, 656,430, 648,434, 641,438, 635,441, 630,445 },
                    new float[] { 694,435, 692,437, 688,438, 684,439, 678,441, 671,443, 664,445, 656,448, 650,450, 643,450, 636,448, 630,445 }),
                new PaddleOutline("Paddle_L_small",
                    new float[] { 372,469, 373,463, 376,459, 380,457, 384,456.5f, 388,457, 391,458, 394,460, 396,462, 398,465, 400,468, 401,471 },
                    new float[] { 372,470, 374,469.5f, 377,469, 380,468.5f, 384,468.5f, 388,469, 391,469.5f, 394,470, 396,470.5f, 398,471, 400,472, 401,473 },
                    new float[] { 372,471, 374,472, 377,473, 381,474, 385,475, 388,476, 392,477, 394,477, 396,477, 398,476, 400,475, 401,473 }),
                new PaddleOutline("Paddle_R_small",
                    new float[] { 621,449, 621,443, 619,439, 616,436, 612,434, 607,434, 602,437, 597,440, 592,444, 587,448, 584,452, 581,456 },
                    new float[] { 621,450, 620,449.5f, 618,449, 615,448, 611,447, 607,447, 602,448, 597,449, 592,451, 588,453, 584,455, 581,456.5f },
                    new float[] { 621,451, 620,452, 618,453, 615,453, 611,454, 607,454.5f, 602,455, 597,456, 592,457, 588,458, 585,458, 581,457 }),
                new PaddleOutline("Paddle_L_tiny",
                    new float[] { 412,468, 412,464, 414,462, 417,460, 420,460, 424,461, 427,462, 430,464, 433,466, 436,468, 438,470, 440,472 },
                    new float[] { 412,468.5f, 413,469, 415,469, 418,469, 421,469, 424,470, 427,470, 430,471, 433,471.5f, 436,472, 438,472.5f, 440,472.5f },
                    new float[] { 412,470, 413,471, 415,472, 418,473, 421,473, 424,474, 427,474, 430,475, 433,475, 436,475, 438,474, 440,473 }),
                new PaddleOutline("Paddle_R_tiny",
                    new float[] { 577,455, 577,452, 575,451, 573,451, 571,452, 568,453, 566,454, 564,456, 562,458, 560,459, 558,461, 557,463 },
                    new float[] { 577,456, 577,456, 575,457, 573,457, 571,458, 568,459, 566,459, 564,460, 562,461, 560,461.5f, 558,462, 557,463 },
                    new float[] { 577,457, 576,459, 575,460, 573,460, 571,461, 568,462, 566,462, 564,463, 562,464, 560,464, 558,464, 557,463.5f }),
            };
        }

        // gameplay camera of the approved view (Benny s = 14): the outlines were traced with it
        static readonly Vector3 CamPos = new Vector3(-0.06f, 3.40f, 7.48f);
        static readonly Quaternion CamRot = Quaternion.Euler(12.78f, -2.80f, 0f);
        const float FocalPx = 1278.2f;

        /// <summary>World point on the sight line of approved pixel (x, y) at tunnel distance s.</summary>
        public static Vector3 OnSight(float x, float y, float s)
        {
            Vector3 d = CamRot * new Vector3((x - 432f) / FocalPx, (768f - y) / FocalPx, 1f);
            return CamPos + d * ((s - CamPos.z) / d.z);
        }

        static float WallHit(float x, float y)
        {
            for (float s = 10f; s < 300f; s += 0.1f)
            {
                Vector3 p = OnSight(x, y, s), c = DrumLayout05.Centre(s);
                float dx = p.x - c.x, dy = p.y - c.y, r = DrumLayout05.RadiusAt(s);
                if (dx * dx + dy * dy >= r * r) return s;
            }
            return 300f;
        }

        static float Cr(float[] a, float x)
        {
            int n = a.Length;
            x = Mathf.Clamp(x, 0f, n - 1);
            int i = Mathf.Min(n - 2, (int)x);
            float t = x - i, p0 = a[Mathf.Max(0, i - 1)], p1 = a[i], p2 = a[i + 1], p3 = a[Mathf.Min(n - 1, i + 2)];
            return 0.5f * (2f * p1 + (p2 - p0) * t + (2f * p0 - 5f * p1 + 4f * p2 - p3) * t * t + (3f * p1 - p0 - 3f * p2 + p3) * t * t * t);
        }

        /// <summary>Mesh relative to <paramref name="pivot"/> (world). UV0 = (u, v), UV1.x = region (0 band, 1 underside, 2 top).</summary>
        public static Mesh BuildPaddle(PaddleOutline o, string name, out Vector3 pivot)
        {
            float sRoot = WallHit(o.tx[0], 0.5f * (o.ty[0] + o.uy[0]));
            float len = new Vector2(o.tx[0] - o.tx[11], o.ty[0] - o.ty[11]).magnitude * (sRoot - CamPos.z) / FocalPx;
            float s0 = sRoot - 0.12f * len, bulge = 0.16f * len, deep = 0.42f * len;
            Vector3 pv = OnSight(o.bx[6], o.by[6], s0);
            pivot = pv;
            const int cols = 36, vr = 8;
            var md = new Md { twoComp = true };
            float Band(float u) => s0 - bulge * Mathf.Sin(Mathf.PI * Mathf.Pow(u, 0.8f));
            Vector3 Pt(float[] xs, float[] ys, float u, float s) => OnSight(Cr(xs, u * 11f), Cr(ys, u * 11f), s) - pv;
            int b0 = md.p.Count;
            for (int i = 0; i <= cols; i++)
            {
                float u = i / (float)cols;
                for (int j = 0; j <= vr; j++)
                {
                    float v = j / (float)vr;
                    float x = Mathf.Lerp(Cr(o.tx, u * 11f), Cr(o.bx, u * 11f), v), y = Mathf.Lerp(Cr(o.ty, u * 11f), Cr(o.by, u * 11f), v);
                    float round = 0.05f * len * Mathf.Pow(Mathf.Abs(2f * v - 1f), 6f);      // rounded rims
                    md.Add(OnSight(x, y, Band(u) + round) - pv, Vector3.back, new Vector2(u, v), Vector4.zero);
                }
            }
            for (int i = 0; i < cols; i++)
                for (int j = 0; j < vr; j++)
                {
                    int a = b0 + i * (vr + 1) + j, b = a + vr + 1;
                    md.Quad(a, b, b + 1, a + 1);
                }
            // underside: band bottom edge -> outer edge deeper in the tunnel
            int u0 = md.p.Count;
            for (int i = 0; i <= cols; i++)
            {
                float u = i / (float)cols;
                for (int j = 0; j <= 3; j++)
                {
                    float v = j / 3f;
                    Vector3 p = Vector3.Lerp(Pt(o.bx, o.by, u, Band(u) + 0.05f * len), Pt(o.ux, o.uy, u, s0 + deep), v);
                    md.Add(p, Vector3.down + Vector3.back * 0.3f, new Vector2(u, v), new Vector4(1f, 0f, 0f, 0f));
                }
            }
            for (int i = 0; i < cols; i++)
                for (int j = 0; j < 3; j++)
                {
                    int a = u0 + i * 4 + j, b = a + 4;
                    md.Quad(a, b, b + 1, a + 1);
                }
            // top: top rim -> back edge (hidden from the rider's height, seen when jumping past)
            float mx = o.bx[6], my = o.by[6];
            int t0 = md.p.Count;
            for (int i = 0; i <= cols; i++)
            {
                float u = i / (float)cols;
                float x = Cr(o.tx, u * 11f), y = Cr(o.ty, u * 11f);
                md.Add(OnSight(x, y, Band(u) + 0.05f * len) - pv, Vector3.up, new Vector2(u, 0f), new Vector4(2f, 0f, 0f, 0f));
                md.Add(OnSight(Mathf.Lerp(x, mx, 0.12f), Mathf.Lerp(y, my, 0.12f), s0 + deep) - pv, Vector3.up, new Vector2(u, 1f), new Vector4(2f, 0f, 0f, 0f));
            }
            for (int i = 0; i < cols; i++) { int a = t0 + i * 2; md.Quad(a, a + 2, a + 3, a + 1); }
            return md.ToMesh(name);
        }
    }
}
