using System.Collections.Generic;
using System.Globalization;
using UnityEngine;
using UnityEngine.Rendering;

namespace Rainbow.Screen05
{
    /// <summary>
    /// River round 4b (2026-11-24): the glossy light on the river - soft light streaks lying along the streamlines and white 4-point
    /// star flares - as ONE static mesh animated on the GPU (Rainbow/Water/RiverGlints). Each authored glint has a place on the
    /// course (s, x -> streamline coordinate q); it drifts downstream with the current and repeats every period of its distance
    /// class, so the glitter is equally dense wherever Benny swims. The wake set (flares on the standing arcs behind Benny, streaks
    /// on the pink sweeps) lives in Benny's frame.
    /// Vertex data: UV0 = (corner x -1..1, corner y -1..1, kind 0 streak / 1 flare, class 0 near / 1 mid / 2 far / 3 Benny frame),
    /// UV1 = (q or dl, s or back, half length m, half width m), UV2 = (rgb, strength), UV3 = (copy, seed, 0, 0).
    /// </summary>
    public static class RiverGlints
    {
        // s, x, streak half length m, streak half width m, flare half size m, kind (W / P flare on cyan / pink, c / p / v streak)
        const string River = ""
            + "63.51,-3.10,4.00,0.312,1.289,c 59.71,1.38,4.00,0.129,0.381,c 54.33,-4.91,3.73,0.146,0.788,p "
            + "44.80,-0.75,4.00,0.279,1.607,c 46.59,-5.89,2.17,0.098,0.413,P 38.72,-2.49,2.16,0.098,0.529,W "
            + "40.60,1.34,0.57,0.082,0.278,c 36.67,-4.76,2.58,0.110,0.559,P 34.50,0.52,2.20,0.203,1.142,c "
            + "35.01,3.80,2.16,0.120,0.752,c 35.14,2.88,0.83,0.086,0.495,W 34.87,4.54,1.09,0.068,0.488,p "
            + "31.16,-2.76,3.32,0.135,0.505,P 30.60,-0.77,1.53,0.073,0.197,c 27.90,-0.53,2.91,0.233,1.091,c "
            + "29.55,4.81,1.48,0.069,0.325,p 29.08,4.37,1.45,0.054,0.205,p 28.22,1.80,1.89,0.078,0.308,c "
            + "25.80,2.24,1.36,0.104,0.429,W 26.42,-2.17,1.01,0.060,0.367,p 24.19,3.63,1.07,0.084,0.302,P "
            + "23.60,-3.10,0.53,0.052,0.315,p 22.85,2.63,0.67,0.049,0.461,p 22.15,0.71,1.44,0.075,0.634,W "
            + "21.10,1.29,0.89,0.087,0.324,P 23.26,-2.37,2.47,0.061,1.028,v 22.94,2.15,1.15,0.049,0.497,v "
            + "20.36,-3.07,1.39,0.042,0.539,v 19.67,-3.98,0.80,0.080,0.541,P 19.92,-4.62,0.41,0.041,0.221,p "
            + "19.64,1.41,1.50,0.078,0.370,P 19.85,1.93,0.23,0.032,0.161,p 19.34,1.90,0.30,0.031,0.129,c "
            + "18.72,-2.44,0.75,0.044,0.349,W 18.06,-3.25,0.57,0.035,0.248,W 17.85,-2.89,0.52,0.041,0.232,c "
            + "17.18,2.53,0.26,0.057,0.234,P 17.71,1.08,0.64,0.067,0.304,P 16.64,-3.71,0.39,0.049,0.208,P "
            + "16.31,-2.09,0.79,0.059,0.339,W 15.51,-2.44,0.51,0.054,0.256,W 16.13,2.09,0.49,0.034,0.326,p "
            + "15.81,1.57,0.36,0.066,0.334,P 15.15,1.22,0.27,0.036,0.155,W 14.69,2.01,0.40,0.048,0.275,P "
            + "14.63,0.91,0.27,0.029,0.146,W 14.18,1.81,0.19,0.027,0.136,P 13.89,-2.03,0.34,0.040,0.209,W "
            + "13.44,-2.30,0.22,0.025,0.155,W 13.62,1.32,0.38,0.042,0.281,W 13.56,1.53,0.29,0.025,0.181,W "
            + "15.15,-3.03,0.18,0.016,0.088,c 15.90,-3.12,0.62,0.045,0.288,c 17.28,-2.02,0.69,0.065,0.329,c "
            + "14.36,-1.88,0.38,0.038,0.207,c 13.99,0.88,0.26,0.035,0.164,c 14.12,1.12,0.34,0.045,0.227,c "
            + "13.11,1.53,0.18,0.031,0.130,c 38.37,-0.41,3.57,0.154,0.977,c 32.94,1.65,2.37,0.127,0.807,c "
            + "27.02,0.96,3.98,0.123,0.750,c 34.40,-1.63,3.56,0.118,0.742,c 23.96,1.60,2.25,0.094,0.530,c "
            + "20.59,-1.89,1.38,0.085,0.574,c 19.38,-2.32,1.15,0.070,0.526,c 17.72,-3.73,0.63,0.055,0.345,p "
            + "20.96,-3.49,1.07,0.079,0.504,p 16.97,1.48,0.55,0.056,0.314,p 15.26,1.67,0.45,0.046,0.296,p "
            + "15.45,2.36,0.26,0.042,0.177,p";
        // Benny frame: back, dl, ...
        const string Wake = ""
            + "1.78,-0.21,0.18,0.040,0.148,W 1.84,0.59,0.15,0.025,0.123,c 2.14,-0.22,0.24,0.052,0.202,W "
            + "2.12,0.36,0.23,0.061,0.191,W 2.47,-0.66,0.20,0.049,0.170,W 2.32,0.77,0.13,0.041,0.112,W "
            + "2.57,-0.14,0.17,0.039,0.146,W 2.60,0.38,0.15,0.034,0.125,W 2.75,-0.62,0.09,0.042,0.075,W "
            + "2.62,0.83,0.10,0.034,0.086,W 1.64,-1.11,0.11,0.042,0.094,P 1.60,-0.81,0.10,0.031,0.083,p "
            + "1.56,1.18,0.12,0.036,0.105,P 1.78,0.91,0.07,0.020,0.056,p 2.07,-1.14,0.12,0.034,0.098,P "
            + "1.96,1.15,0.10,0.029,0.087,p 2.02,0.04,0.26,0.029,0.217,c 2.52,0.09,0.26,0.026,0.216,c";

        public static readonly float[] Period = { 8f, 26f, 76f };
        static readonly int[] Copies = { 3, 2, 2 };

        static readonly Vector3 Aqua = new Vector3(0.55f, 1.05f, 1.1f), Pale = new Vector3(1.05f, 0.8f, 1.08f),
            Violet = new Vector3(0.36f, 0.3f, 0.85f), White = new Vector3(1.5f, 1.55f, 1.6f);

        public static Mesh Build()
        {
            var u0 = new List<Vector4>(); var u1 = new List<Vector4>(); var u2 = new List<Vector4>(); var u3 = new List<Vector4>();
            var tri = new List<int>();
            uint h = 7u;
            foreach (bool wake in new[] { false, true })
                foreach (string tok in (wake ? Wake : River).Split(new[] { ' ' }, System.StringSplitOptions.RemoveEmptyEntries))
                {
                    string[] p = tok.Split(',');
                    float s = F(p[0]), x = F(p[1]), len = F(p[2]), wid = F(p[3]), fl = F(p[4]);
                    char k = p[5][0];
                    int cls = wake ? 3 : s < 18.5f ? 0 : s < 36f ? 1 : 2;
                    float a = wake ? x : RiverLayout05.Q(s, x);
                    if (!wake && Mathf.Abs(a) > 2.95f) continue;
                    int n = wake ? 1 : Copies[cls];
                    for (int c = 0; c < n; c++)
                    {
                        h = h * 1664525u + 1013904223u;
                        float seed = (h >> 8) / 16777216f;
                        Vector3 sc = k == 'P' || k == 'p' ? Pale : k == 'v' ? Violet : Aqua;
                        float st = k == 'v' ? 0.75f : k == 'c' || k == 'p' ? 0.85f : 0.8f;
                        Strip(u0, u1, u2, u3, tri, 0f, cls, a, s, len * (cls == 0 ? 2f : cls == 3 ? 1f : 1.4f), wid * (cls == 0 ? 1.4f : cls == 3 ? 1.6f : 2f), sc, cls == 3 ? st * 0.7f : st, c, seed);
                        // (river5 live variants: shrinking the near / wake stars to 0.6x scored -0.5; 1.2x +0.1) original size kept
                        float fk = 1f;
                        if (k == 'W' || k == 'P') Strip(u0, u1, u2, u3, tri, 1f, cls, a, s, fl * fk, fl * 0.5f * fk, White, 1f, c, seed);
                    }
                }
            var m = new Mesh { name = "RiverGlints05", indexFormat = IndexFormat.UInt16 };
            m.vertices = new Vector3[u0.Count];
            m.SetUVs(0, u0); m.SetUVs(1, u1); m.SetUVs(2, u2); m.SetUVs(3, u3);
            m.SetTriangles(tri, 0);
            m.bounds = new Bounds(new Vector3(0f, 0f, 60f), new Vector3(30f, 6f, 400f));
            return m;
        }

        static float F(string s) => float.Parse(s, CultureInfo.InvariantCulture);

        static void Strip(List<Vector4> u0, List<Vector4> u1, List<Vector4> u2, List<Vector4> u3, List<int> tri, float kind, int cls,
                          float a, float s, float len, float wid, Vector3 col, float strength, int copy, float seed)
        {
            int seg = kind > 0.5f ? 1 : 6;
            int v0 = u0.Count;
            for (int i = 0; i <= seg; i++)
                for (int j = -1; j <= 1; j += 2)
                {
                    u0.Add(new Vector4(j, -1f + 2f * i / seg, kind, cls));
                    u1.Add(new Vector4(a, s, len, wid));
                    u2.Add(new Vector4(col.x, col.y, col.z, strength));
                    u3.Add(new Vector4(copy, seed, 0f, 0f));
                }
            for (int i = 0; i < seg; i++)
            {
                int b = v0 + i * 2;
                tri.Add(b); tri.Add(b + 2); tri.Add(b + 1);
                tri.Add(b + 1); tri.Add(b + 2); tri.Add(b + 3);
            }
        }
    }
}