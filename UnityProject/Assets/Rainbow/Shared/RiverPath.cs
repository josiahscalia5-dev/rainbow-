using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// SHARED COURSE CONTRACT for Screen 05 "Flow into the Current" (owned by the coordinator).
    /// Specialists code against this API and never edit this file; propose value changes in their report.
    ///
    /// Port of the Three.js course (src/world/course.ts: S05, meander05). Units = Three.js units (~metres).
    /// Unity frame: the straight tunnel line runs along +Z at x = 0; +X = rider's right; +Y up.
    /// The water surface is the plane y = WaterY. The tunnel axis sits FloorDepth above the water,
    /// so the water fills the tube floor chord x in [-WaterHalfWidth, +WaterHalfWidth].
    /// s = distance along the tunnel line (Three.js `u` of S05). The playable test runs StartS -> FinishS.
    /// Meander(s) = lateral offset of the stream's cyan core / coin line from the tunnel line (the S-curve).
    /// </summary>
    public static class RiverPath
    {
        // ---- course (course.ts S05) -------------------------------------------------------------
        /// <summary>Length of stage 05's straight tunnel line (S05.L).</summary>
        public const float StageLength = 72f;
        /// <summary>Tunnel geometry continues beyond the stage so the bright far throat stays deep in view.</summary>
        public const float TunnelLength = 120f;
        /// <summary>Tunnel geometry also starts a little behind 0 so the camera never sees an open end.</summary>
        public const float TunnelStart = -12f;
        public const float Lambda = 32f;
        public const float UCrest = 14f;
        public const float A0 = 0.45f;
        public const float A1 = 1.85f;
        /// <summary>Half extent of the stream (|offset| + half width): the water fills the tube floor.</summary>
        public const float StreamExtent = 6.0f;
        /// <summary>Tunnel axis height above the water surface (course.ts straight 05->06 floorDepth).</summary>
        public const float FloorDepth = 3.3f;
        /// <summary>Gold ring band spacing along the tunnel (environment.ts ringSpacing).</summary>
        public const float RingSpacing = 9f;
        public const float WaterY = 0f;

        // ---- playable test section ----------------------------------------------------------------
        /// <summary>Benny's start: the approved Screen 05 view (first crest).</summary>
        public const float StartS = UCrest;
        /// <summary>End of the short playable test (~10 s at the default swim speed).</summary>
        public const float FinishS = 68f;

        /// <summary>PROVISIONAL tube radius: chord at the water = StreamExtent. Environment specialist verifies against tube.ts.</summary>
        public static readonly float TunnelRadius = Mathf.Sqrt(StreamExtent * StreamExtent + FloorDepth * FloorDepth);
        /// <summary>Half width of the water surface (the floor chord), measured from the tunnel line x = 0.</summary>
        public static readonly float WaterHalfWidth = StreamExtent;

        // ---- meander05 (verbatim port) ------------------------------------------------------------
        const float UKeep = UCrest + Lambda / 4f;   // U05_KEEP = 22
        const float UTail = 67f;                     // U05_TAIL
        const float ExitU0 = 56f, ExitU1 = UTail, ExitAmp = 1.353668f; // EXIT05_BEND
        static readonly float[] KnotU = { UKeep, 26.3f, 32.2f, 43f, 55.5f, UTail };
        static readonly float[] KnotV = new float[6];
        static readonly float SlopeKeep, SlopeTail;

        static RiverPath()
        {
            KnotV[0] = MeanderSine(UKeep);
            KnotV[1] = 0.37f; KnotV[2] = -0.23f; KnotV[3] = -1.14f; KnotV[4] = -0.79f;
            KnotV[5] = MeanderSine(UTail);
            SlopeKeep = SlopeOf(UKeep);
            SlopeTail = SlopeOf(UTail);
        }

        static float Smooth(float e0, float e1, float x)
        {
            float t = Mathf.Clamp01((x - e0) / (e1 - e0));
            return t * t * (3f - 2f * t);
        }

        static float MeanderSine(float u)
        {
            float grow = Mathf.Clamp01((u - UCrest) / (1.5f * Lambda));
            float amp = (A0 + (A1 - A0) * grow) * Smooth(0f, 10f, u) * (1f - Smooth(StageLength - 12f, StageLength, u));
            return -amp * Mathf.Cos(2f * Mathf.PI * (u - UCrest) / Lambda);
        }

        static float SlopeOf(float u) => (MeanderSine(u + 1e-3f) - MeanderSine(u - 1e-3f)) / 2e-3f;

        static float HermiteKnots(float u)
        {
            int n = KnotU.Length;
            if (u >= KnotU[n - 1]) return KnotV[n - 1];
            int i = 0;
            while (u > KnotU[i + 1]) i++;
            float Tan(int j) => j == 0 ? SlopeKeep : j == n - 1 ? SlopeTail
                : (KnotV[j + 1] - KnotV[j - 1]) / (KnotU[j + 1] - KnotU[j - 1]);
            float u0 = KnotU[i], p0 = KnotV[i], u1 = KnotU[i + 1], p1 = KnotV[i + 1];
            float h = u1 - u0, t = (u - u0) / h, t2 = t * t, t3 = t2 * t;
            return (2f * t3 - 3f * t2 + 1f) * p0 + (t3 - 2f * t2 + t) * h * Tan(i)
                 + (-2f * t3 + 3f * t2) * p1 + (t3 - t2) * h * Tan(i + 1);
        }

        /// <summary>
        /// (water4 2026-11-24) the far S toward the throat: beyond the stage the course bends right (approved image: the
        /// river and the far coins swing right of the vanishing point before they run into the throat; band pair traced at
        /// y 520-540 = 20-30 px right of Unity's straight far river). 0 up to the stage end, so nothing playable changes.
        /// The far river shader (Environment/Shaders/RainbowFarRiver.hlsl) continues it beyond TunnelLength.
        /// </summary>
        public const float FarAmp = 1.0f;
        public static float FarSwing(float s) => FarAmp * Smooth(StageLength, StageLength + 36f, s);

        /// <summary>Lateral (+X = right) offset of the cyan core / coin line at distance s. 0 before the stage, the far
        /// swing (FarSwing) beyond it.</summary>
        public static float Meander(float s)
        {
            if (s <= 0f) return 0f;
            if (s >= StageLength) return FarSwing(s);
            if (s <= UKeep || s >= UTail) return MeanderSine(s);
            float bend = (s > ExitU0 && s < ExitU1)
                ? ExitAmp * Mathf.Pow(Mathf.Sin(Mathf.PI * (s - ExitU0) / (ExitU1 - ExitU0)), 2f)
                : 0f;
            return HermiteKnots(s) + bend;
        }

        /// <summary>Point on the cyan core line at the water surface.</summary>
        public static Vector3 CorePoint(float s) => new Vector3(Meander(s), WaterY, s);

        /// <summary>Unit tangent of the core line (mostly +Z).</summary>
        public static Vector3 Forward(float s)
        {
            const float d = 0.05f;
            float dx = Meander(s + d) - Meander(s - d);
            return new Vector3(dx, 0f, 2f * d).normalized;
        }

        /// <summary>Unit horizontal right vector of the core line.</summary>
        public static Vector3 Right(float s) => Vector3.Cross(Vector3.up, Forward(s)).normalized;

        /// <summary>Point on the tunnel axis (straight line).</summary>
        public static Vector3 AxisPoint(float s) => new Vector3(0f, WaterY + FloorDepth, s);

        /// <summary>Clamp a lateral world X so a body of the given radius stays on the water inside the foam banks.</summary>
        public static float ClampLateral(float x, float bodyRadius, float bankMargin = 1.0f)
        {
            float lim = WaterHalfWidth - bankMargin - bodyRadius;
            return Mathf.Clamp(x, -lim, lim);
        }
    }
}
