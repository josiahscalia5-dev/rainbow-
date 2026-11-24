using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// CPU mirror of the river surface drawn by Rainbow/Water/River (Agent 3). Ported from src/vfx/waterRibbon.ts
    /// (ribbonWave, EDGE_LIFT, AMP '05', coreLateral, sbend05, coreShiftW10) and src/world/course.ts (widthAt for 05).
    /// Frame: RiverPath (world x = lateral, world z = s, water plane y = RiverPath.WaterY).
    /// Benny / coins may use HeightAt() so they ride exactly on the animated surface.
    /// Keep SOffset / CoreSwing / WaveAmp equal to the River material's _SOffset / _CoreSwing / _WaveAmp.
    /// </summary>
    public static class RiverSurface
    {
        /// <summary>Three.js master arc length = s + SOffset (Benny's approved view: master s 132.4 at u 15.7).</summary>
        public const float SOffset = 116.7f;
        /// <summary>The cyan core swings CoreSwing x the course meander beyond it (waterRibbon.ts CORE_SWING).</summary>
        public const float CoreSwing = 0.9f;
        /// <summary>Raised stream edges (units at |u| = 1, cubic).</summary>
        public const float EdgeLift = 0.18f;   // river round 4b: 0.28 -> 0.18 (flat wide river; = RBW_FoamBaseHeight)
        /// <summary>Swell amplitude of stage 05 (AMP['05']).</summary>
        public const float WaveAmp = 0.1f;
        /// <summary>Advection speed of the river pattern: stage speed 11 x FLOW05 1.3.</summary>
        public const float FlowSpeed = 6.5f;   // master direction 2026-11-24: he swims (11 u/s) through a current of 6.5 u/s; 14.3 made the pattern run away from him
        /// <summary>Gentle rise of the foam shelf between the stream edge and the wall.</summary>
        public const float ShelfRise = 0f;
        /// <summary>How far the water / foam shelf mesh reaches sideways (hidden inside the wall beyond the chord).</summary>
        public const float MeshHalfWidth = 8.9f;   // round 4: the barrel drum is wider at s 40-100 (was 6.9)

        /// <summary>Stream centre x (the course centreline = RiverPath.Meander).</summary>
        public static float StreamCentre(float s) => RiverPath.Meander(s);

        /// <summary>Stream half width (course.ts widthAt in 05: extent - smooth |offset|).</summary>
        public static float StreamHalfWidth(float s)
        {
            float d = RiverPath.Meander(s) - RiverPath.Bend(s);
            return RiverPath.StreamExtent - Mathf.Sqrt(d * d + 0.09f);
        }

        /// <summary>The band S of the 05 river (waterRibbon.ts sbend05), argument = Three.js master s.
        /// (water4 2026-11-24) damped beyond the stage like RBW_SBend (RainbowRiver.hlsl): keep both identical.</summary>
        public static float SBend(float masterS) =>
            (1.05f * Mathf.Sin(masterS * 0.31f - 0.834f) + 0.18f * Mathf.Sin(masterS * 0.62f + 0.6f))
            * (1f - 0.75f * Smooth(186f, 198f, masterS));

        static float Smooth(float a, float b, float x)
        {
            float t = Mathf.Clamp01((x - a) / (b - a));
            return t * t * (3f - 2f * t);
        }

        /// <summary>W10 exit-bend hold (waterRibbon.ts coreShiftW10): extra lateral shift of the core + band pair.</summary>
        public static float CoreShift(float s)
        {
            float ms = s + SOffset;
            float w = Smooth(171f, 175f, ms) * (1f - Smooth(182f, 189f, ms));
            if (w <= 0f) return 0f;
            float d = RiverPath.Meander(s);
            float visible = d + (CoreSwing * d + SBend(ms));
            float target = -0.67f + 0.37f * Smooth(172f, 180f, ms);
            return w * (target - visible);
        }

        /// <summary>World x of the electric-cyan core centre (bands sit at +-0.62 half widths around core + SBend).</summary>
        public static float CoreX(float s)
        {
            float d = RiverPath.Meander(s);
            return d + CoreSwing * d + CoreShift(s);
        }

        /// <summary>Static shape: raised stream edges + foam shelf rise (baked into the mesh).</summary>
        public static float BaseHeight(float x, float s)
        {
            float d = RiverPath.Meander(s);
            float hw = Mathf.Max(StreamHalfWidth(s), 0.5f);
            float lr = Mathf.Abs(x - d);
            float u = Mathf.Min(lr / hw, 1f);
            float shelf = Mathf.Clamp01((lr - hw) / 1.2f);
            shelf = shelf * shelf * (3f - 2f * shelf);
            return EdgeLift * u * u * u + ShelfRise * shelf;
        }

        /// <summary>Animated swell (same formula as RBW_RiverWave in RainbowRiver.hlsl).</summary>
        public static float WaveHeight(float x, float s, float time)
        {
            float d = RiverPath.Meander(s);
            float hw = Mathf.Max(StreamHalfWidth(s), 0.5f);
            float u = (x - d) / hw;
            float uc = Mathf.Clamp(u, -1f, 1f);
            float sm = s + SOffset;
            float mask = 1f - Smooth(0.92f, 1.08f, Mathf.Abs(u));
            return WaveAmp * mask * (0.6f * Mathf.Sin(sm * 0.9f - time * 2.4f + uc * 1.7f)
                                   + 0.4f * Mathf.Sin(sm * 0.41f + time * 1.5f - uc * 2.3f));
        }

        /// <summary>World height of the water surface at (x, s) and shader time (use Screen05Clock.Time = _RainbowTime).</summary>
        public static float HeightAt(float x, float s, float time) =>
            RiverPath.WaterY + BaseHeight(x, s) + WaveHeight(x, s, time);

        /// <summary>Height at the current frame's shader time.</summary>
        public static float HeightAt(float x, float s) => HeightAt(x, s, Screen05Clock.Time);

        /// <summary>True when (x, s) is on the open stream (not on the foam shelf).</summary>
        public static bool OnStream(float x, float s, float margin = 0f) =>
            Mathf.Abs(x - RiverPath.Meander(s)) <= StreamHalfWidth(s) - margin;
    }
}
