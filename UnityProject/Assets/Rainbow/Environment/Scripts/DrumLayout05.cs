using System.Collections.Generic;
using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Screen 05 washer-drum tunnel layout (Agent 2, environment), ported from the Three.js source and VERIFIED there:
    ///  * radius 7.6 ........ src/world/course.ts  def('05', { tube: 7.6 })
    ///  * floor depth 3.3 ... course.ts straight 05->06 { floorDepth: 3.3 } = depth of the tube BOTTOM below the water
    ///                        (tube.ts TubePath.depth "distance from the water point on the axis down to the tube bottom"),
    ///                        so the tube AXIS is Radius - FloorDepth = 4.3 above the water (not 3.3).
    ///  * near floor +2 ..... environment.ts NEAR_FLOOR05 (promoted test T2): the tunnel up to ring A sits 2 u lower.
    ///  * bays of 14 ........ environment.ts bay05 = 14 (ringSpacing 9 belongs to stages 06/07), anchored at the
    ///                        checkpoint eye: sF05 = eye + 54, ring A moved to eye + 20 (test T1, promoted).
    ///  * far rings ......... environment.ts ringDv = [59, 97, 161, 222] (virtual depths of the forced-perspective far
    ///                        block, calibrated to the approved ring radii) built here as REAL rings in a long tunnel.
    ///  * paddles ........... lid05 { angle 8, droop -34, size 2.2, thickness 0.36, stretch 1, sink 0.1 },
    ///                        one pair 2.7 u camera-side of every ring slot.
    /// Frame: RiverPath (tunnel line along +Z at x = 0, +X = rider's right, water plane y = 0). s = distance along +Z.
    ///
    /// FRAME ROUND 2026-11-23 (fitted to references/05_flow_into_the_current.png with the real gameplay camera at s = 14:
    /// camera (x, 3.40, 7.48), pitch 12.78 deg, yaw 2.78 deg left, vFOV 62 = vanishing point (496, 478) of 864x1536):
    ///  * cross-section: radius 7.6 -> 6.8, axis 4.3 -> 4.25 above the water (FloorDepth 2.55). The approved purple walls
    ///    come down right behind the narrow foam rims (wall / foam junction ~(220, 600), (120, 700) left, (690, 600),
    ///    (850, 700) right) while the ring centres sit only ~0.12 r above the vanishing point (axis ~0.85 m above the camera):
    ///    with Benny's fixed size that is a tube of r ~6.3-6.8 m. 7.6 m put the walls at x = +-6.27 (+-7.24 near the camera)
    ///    = the wide flat foam fields; now x = +-5.31 at the water / +-5.67 at the foam top (+-6.2 near the camera).
    ///  * near floor 2 -> 1 m: the approved near ring (left crown ~(10, 480), foot on the foam ~(90, 700)) is centred on
    ///    the vanishing-point height, i.e. the near axis is ~level with the camera (3.25 m); 2 m put it 67 px below and
    ///    widened the near floor to +-7.24 m (0.7 m was tried in frame_t6: no gain).
    ///  * rings: real rings at the depths whose crowns match the approved crowns measured straight up from the vanishing
    ///    point (y 210, 308, 378, 415, 434, 448, 456 = r 268, 170, 100, 63, 44, 30, 22 px) + the near ring: see
    ///    RingPositions(). The approved deep rings are spaced ever wider (forced perspective), so the tunnel now runs to
    ///    the throat cap at s 470 (cap r ~19 px = the small bright point) and the rider camera's far clip is 520 m.
    ///  * paddles: placed one by one on the approved trays (big left nearer than big right): see PaddleSlots().
    /// </summary>
    public static class DrumLayout05
    {
        public const float Radius = 6.8f;
        public const float FloorDepth = 2.55f;
        public const float NearFloorExtra = 1.0f;
        /// <summary>
        /// World x of the tunnel axis. The approved drum is slightly asymmetric about the vanishing point (ring crowns
        /// left / right at x 219 / 712, 338 / 632, 402 / 580); a -0.6 m shift was tried in the frame round (cycle frame_t5)
        /// and REJECTED: it widened the left foam field again and cut the right foam bank with the near ring (OVERALL
        /// 52.9 -> 51.7). Kept as a parameter (walls, rings, paddles, throat and BubbleField.WallHalfWidth honour it).
        /// </summary>
        public const float AxisX = 0f;
        /// <summary>Screen05CameraRig.back: the approved-view camera sits 6.52 m behind Benny's start.</summary>
        public const float EyeBack = 6.52f;
        /// <summary>s of the locked approved-view camera (sCam05).</summary>
        public const float EyeS = RiverPath.StartS - EyeBack;
        public const float Bay = 14f;
        public const float RingInset = 0.02f;
        /// <summary>
        /// Real tunnel end: the far throat cap (frame round 2026-11-23: 290 -> 470, behind the approved 22 px ring at s 450;
        /// the cap spans r ~19 px = the approved small bright point; camera far clip 520 m, the camera never sits behind
        /// s ~3, so the cap is never clipped).
        /// </summary>
        public const float ThroatS = 470f;
        public const float TunnelStart = RiverPath.TunnelStart;
        /// <summary>The playable river (Agent 3) ends here; the far river chord (far throat) continues it.</summary>
        public const float FarRiverStart = RiverPath.TunnelLength;

        // wall slots, metres: 64 round the tube, 10 rows per 14 u bay (environment.ts wall05 repeatU 64, slotPitch05 = bay05 / 10)
        public const int SlotsRound = 64;
        public const float SlotRowPitch = Bay / 10f;
        public const float SlotHalfLength = 0.23f;
        public const float SlotHalfWidth = 0.095f;

        // paddles (environment.ts lid05)
        public const float PaddleAngleDeg = 8f;
        public const float PaddleDroopDeg = -34f;
        public const float PaddleSize = 2.2f;
        public const float PaddleThickness = 0.36f;
        public const float PaddleStretch = 1.0f;
        public const float PaddleSink = 0.1f;

        public struct BandProfile
        {
            public float height, width, lipHeight, lipWidth, groove;
            /// <summary>Tunnel round 3: optional middle strand (0 width = none) and the groove floor above the wall.</summary>
            public float midHeight, midWidth, baseHeight;
            public BandProfile(float height, float width, float lipHeight, float lipWidth, float groove)
            {
                this.height = height; this.width = width; this.lipHeight = lipHeight; this.lipWidth = lipWidth; this.groove = groove;
                midHeight = 0f; midWidth = 0f; baseHeight = 0f;
            }
            public BandProfile(float height, float width, float midHeight, float midWidth, float lipHeight, float lipWidth,
                float groove, float baseHeight)
            {
                this.height = height; this.width = width; this.lipHeight = lipHeight; this.lipWidth = lipWidth; this.groove = groove;
                this.midHeight = midHeight; this.midWidth = midWidth; this.baseHeight = baseHeight;
            }
            /// <summary>Half the total axial width (main strand + grooves + middle strand + lip).</summary>
            public float HalfWidth => (width + groove + lipWidth + (midWidth > 0f ? midWidth + groove : 0f)) * 0.5f;
            /// <summary>Shader vector _BandG: (main band centre z, main half width, lip centre z, lip half width) in metres.</summary>
            public Vector4 ShaderBandG
            {
                get
                {
                    float w = HalfWidth;
                    return new Vector4(w - width * 0.5f, width * 0.5f, -w + lipWidth * 0.5f, lipWidth * 0.5f);
                }
            }
        }

        /// <summary>
        /// environment.ts band05near (the thick near rings). Frame round 2026-11-23: the approved ring A / B bands are ~40 / 22
        /// px thick (~0.15-0.17 of the radius, Unity ~24 / 14 px), but 0.17 / far 0.13 (cycles frame_t5 / t6) turned the
        /// throat into a thick orange target (throat 67.9 -> 64.1) and was REJECTED: thickness stays a gold-look task.
        /// </summary>
        // Tunnel round 3 (2026-11-23): the approved rings are bundles of rounded polished strands (a fat main strand, a
        // middle strand and a thin lip, narrow dark grooves between them): main 0.135 r / 0.6 m, middle 0.105 r / 0.36 m,
        // lip 0.075 r / 0.26 m, grooves 0.05 m sitting 0.035 r above the wall (was one band 0.13 r / 0.8 m + lip).
        public static readonly BandProfile NearBand = new BandProfile(0.138f, 0.6f, 0.107f, 0.36f, 0.077f, 0.26f, 0.05f, 0.035f);
        /// <summary>environment.ts band05 (the thinner far rings); tunnel round 3: three strands like the near rings.</summary>
        public static readonly BandProfile FarBand = new BandProfile(0.1f, 0.58f, 0.08f, 0.3f, 0.06f, 0.22f, 0.04f, 0.025f);
        /// <summary>Rings with s above this use FarBand.</summary>
        public const float FarBandFromS = 170f;   // round 4 fit: rings C / D are 0.133-0.144 r thick like A / B (was 80)
        /// <summary>
        /// Tunnel round 4 (2026-11-24): the NEAR ring (s 24.3; and the start ring 5.6) is a thin copper band hugging the
        /// frame edge in the approved image (left side at y 470: copper only from x 0 to ~20, its inner edge on the
        /// ~(10, 480) crown); with the ring-A profile (0.135 r) the Unity band reached x 58 as a 50-60 px wide bright bar
        /// down the left edge and over the top-left corner. Inner crest at r ~6.28 m = 0.074 r.
        /// </summary>
        // (round 4 geometry fit: with the ring on the approved circle its band is 0.134 r - the thin 0.074 band only compensated the wrong place)
        public static readonly BandProfile NearestBand = new BandProfile(0.130f, 0.6f, 0.106f, 0.36f, 0.076f, 0.26f, 0.05f, 0.035f);
        /// <summary>Rings with s below this use NearestBand.</summary>
        public const float NearestBandBelowS = 30f;

        // Frame round 2026-11-23: real rings at the depths whose crowns (0.94 r) project onto the approved crowns measured
        // straight up from the approved vanishing point (496, 478): y 210, 308, 378, 415, 434, 448, 456 (r 268 .. 22 px; the
        // deep ones were missing or hidden in the glow disc), plus the near ring whose left crown runs down the left frame
        // edge (~(10, 480)) and stands on the foam at ~(90, 700) (in the 1 m near-floor drop, i.e. centred on the
        // vanishing-point height). 5.6 only shows for camera s < 5. Replaces the light round's eye + [59 .. 272] set.
        // Tunnel round 3: + a ring at s 283 (r ~37 px): the approved deep throat is a DENSE stack of rings (r 63, 44, 37, 30,
        // 22 px measured on a 4x crop; the two smaller ones at r ~15 / 9 px are painted on the throat cap).
        // Round 4 geometry fit 2026-11-24 (tools/diag/fit-rings.ps1): near ring 24.3 -> 25.6, ring A 45.5 -> 41.5, C 106.5 -> 105.8,
        // D 163.6 -> 159.4, together with the fitted drum axis (AxisS / AxisXs / AxisYs): every ring's wall edge + inner crest now
        // projects onto the approved circle within 0.5-2.6 px rms (before: ring A's left side was 45 px too far right).
        static readonly float[] ApprovedRingS = { 5.6f, 25.6f, 46.0f, 82.0f, 105.8f, 159.4f, 230.1f, 283.0f, 333.0f, 450.4f };   // A 41.5 -> 46.0, B 66.4 -> 82.0: barrel radius below

        /// <summary>One wall paddle: s of the tray centre, wall side (-1 left, +1 right), height of its wall mount (m).</summary>
        public struct PaddleSlot
        {
            public float s; public int side; public float mountY;
            public PaddleSlot(float s, int side, float mountY) { this.s = s; this.side = side; this.mountY = mountY; }
        }

        // Frame round 2026-11-23: trays placed on the approved ones. Tray centres measured on the approved image (big
        // (150, 425) / (790, 460), mid (290, 445) / (665, 425), small (385, 462) / (600, 450), tiny (438, 466) / (553, 457))
        // and placed with the gameplay camera on this drum; checked in the real Game view (cycle frame_t3: big trays at
        // ~(80-260, 390-450) / (720-860, 410-490), mid ones at (250-330, 430-480) / (640-700, 400-440) = on the approved
        // ones). The tray is tilted from its mount angle like lid05 (angle + droop -34 deg). A lower-mount refit (frame_t5
        // / t6) showed the trays as steep slabs instead of trays seen from below and was REJECTED.
        // Tunnel round 4 (2026-11-24): the round-4 shelves (DrumMeshes05.BuildPaddleShelf, Shelf* proportions below) seen
        // from below sit 1.5 m deeper and lower on the wall (left 0.3 m, right 0.8 m) than the round-3 trays: live variant
        // pS3 of cycle tunnel_t2 (walls 57.0 -> 58.9, throat 67.2 -> 69.0; the big right tray at y ~400-490 like the
        // approved 400-521 instead of 349-457). Was L 29.5 / 5.2, 44 / 5.2, 75 / 5.1, 125 / 5.3, 190 / 5.3;
        // R 34 / 4.7, 55 / 6.0, 82 / 5.8, 118 / 5.5, 180 / 5.5.
        static readonly PaddleSlot[] ApprovedPaddles =
        {
            new PaddleSlot(30.5f, -1, 5.1f), new PaddleSlot(36.5f, 1, 3.5f),   // cycle tunnel_t3 variants pL1 / pR1
            new PaddleSlot(45.5f, -1, 4.9f), new PaddleSlot(56.5f, 1, 5.2f),
            new PaddleSlot(76.5f, -1, 4.8f), new PaddleSlot(83.5f, 1, 5.0f),
            new PaddleSlot(126.5f, -1, 5.0f), new PaddleSlot(119.5f, 1, 4.7f),
            new PaddleSlot(191.5f, -1, 5.0f), new PaddleSlot(181.5f, 1, 4.7f),
        };
        /// <summary>Round-4 shelf proportions: inward extent, thickness and length along the tunnel, as factors of
        /// PaddleSize (approved trays: long shallow half-moons, ~1.4 x 0.6 of the round-3 half disc).</summary>
        public const float ShelfInward = 0.6f, ShelfThick = 1.15f, ShelfStretch = 1.4f;

        static float Smooth(float e0, float e1, float x)
        {
            float t = Mathf.Clamp01((x - e0) / (e1 - e0));
            return t * t * (3f - 2f * t);
        }

        static float Smoother(float e0, float e1, float x)
        {
            float t = Mathf.Clamp01((x - e0) / (e1 - e0));
            return t * t * t * (t * (t * 6f - 15f) + 10f);
        }

        /// <summary>environment.ts floorExtra05 (T2): extra floor depth near the start view.</summary>
        public static float FloorExtra(float s)
        {
            return NearFloorExtra * (1f - Smoother(EyeS + 28f, EyeS + 38f, s)) * Smooth(2f, 10f, s);
        }

        // Round 4 geometry fit 2026-11-24: the drum AXIS as a table (s, world x, height above the water), solved with the real
        // gameplay camera (tools/diag/fit-rings.ps1, radius 6.8) so the near ring and rings A-D land on the circles measured on
        // the approved image: centres (453, 485), (468, 455), (486, 453), (490, 460), (496.5, 469) px, wall radii 492 / 265 /
        // 153.5 / 92 / 59.5 px. The axis runs ~0.8 m left of the course line near the camera and comes back to it in the depth;
        // it is lowest at the near ring (2.79 m above the water) and highest at ring C (4.59 m).
        // BARREL RADIUS (same fit, scale k = R / 6.8 about the camera, so the rings stay on the same pixels): the approved river's
        // LEFT waterline, unprojected row by row (staging/round4-river/river_targets.csv), runs at x -7.1 .. -8.0 m for s 42-76,
        // i.e. outside a 6.8 m drum (wall at -6.6 .. -5.7); with 7.7 m at ring A and 8.6 m at ring B the wall stands right behind
        // the foam rope there (wall at the water: A -7.7 / +5.8 m, B -8.0 / +6.6 m) and back to 6.8 m at ring C.
        static readonly float[] AxisS = { -12f, 8f, 25.6f, 46.0f, 82.0f, 105.8f, 159.4f, 230f, 470f };
        static readonly float[] AxisXs = { -0.70f, -0.72f, -0.76f, -0.97f, -0.70f, -0.55f, -0.04f, 0f, 0f };
        static readonly float[] AxisYs = { 3.05f, 2.95f, 2.79f, 3.66f, 4.51f, 4.59f, 4.34f, 4.25f, 4.25f };
        static readonly float[] AxisRs = { 6.8f, 6.8f, 6.8f, 7.7f, 8.6f, 6.8f, 6.8f, 6.8f, 6.8f };

        /// <summary>Drum radius at s (round 4 barrel fit; Radius = 6.8 m at the near ring and from ring C on).</summary>
        public static float RadiusAt(float s) => Table(AxisS, AxisRs, s);

        /// <summary>Monotone cubic (Fritsch-Carlson) interpolation of a table: smooth, no overshoot between the knots.</summary>
        static float Table(float[] xs, float[] ys, float x)
        {
            int n = xs.Length;
            if (x <= xs[0]) return ys[0];
            if (x >= xs[n - 1]) return ys[n - 1];
            int i = 0;
            while (x > xs[i + 1]) i++;
            float Slope(int k) => (ys[k + 1] - ys[k]) / (xs[k + 1] - xs[k]);
            float Tan(int k)
            {
                if (k == 0 || k == n - 1) return 0f;
                float a = Slope(k - 1), b = Slope(k);
                if (a * b <= 0f) return 0f;
                float w1 = 2f * (xs[k + 1] - xs[k]) + (xs[k] - xs[k - 1]), w2 = (xs[k + 1] - xs[k]) + 2f * (xs[k] - xs[k - 1]);
                return (w1 + w2) / (w1 / a + w2 / b);
            }
            float h = xs[i + 1] - xs[i], t = (x - xs[i]) / h, t2 = t * t, t3 = t2 * t;
            return (2f * t3 - 3f * t2 + 1f) * ys[i] + (t3 - 2f * t2 + t) * h * Tan(i)
                 + (-2f * t3 + 3f * t2) * ys[i + 1] + (t3 - t2) * h * Tan(i + 1);
        }

        /// <summary>World x of the drum axis at s (round 4 fit).</summary>
        public static float AxisXAt(float s) => AxisX + Table(AxisS, AxisXs, s) + RiverPath.Bend(s);

        /// <summary>Depth of the tube bottom below the water at s.</summary>
        public static float Depth(float s) => RadiusAt(s) - (CentreY(s) - RiverPath.WaterY);

        /// <summary>Height of the tube axis at s (world y).</summary>
        public static float CentreY(float s) => RiverPath.WaterY + Table(AxisS, AxisYs, s);

        /// <summary>d CentreY / d s (the near-floor blend tilts the walls slightly).</summary>
        public static float CentreSlope(float s)
        {
            const float e = 0.01f;
            return (CentreY(s + e) - CentreY(s - e)) / (2f * e);
        }

        public static Vector3 Centre(float s) => new Vector3(AxisXAt(s), CentreY(s), s);

        /// <summary>Half chord of the tube at the water plane (where the wall meets the water).</summary>
        public static float WaterChord(float s)
        {
            float h = CentreY(s) - RiverPath.WaterY, r = RadiusAt(s);
            return Mathf.Sqrt(Mathf.Max(0f, r * r - h * h));
        }

        /// <summary>World x of the drum wall at height y on one side (-1 left, +1 right); round 4: the axis is off the course line.</summary>
        public static float WallXAt(float s, int side, float y = RiverPath.WaterY)
        {
            float h = CentreY(s) - y, r = RadiusAt(s);
            return AxisXAt(s) + side * Mathf.Sqrt(Mathf.Max(0f, r * r - h * h));
        }

        /// <summary>
        /// Geometry round 2026-11-24: the RIGHT lower wall beside the near bend comes inward. Approved: the purple slotted
        /// wall stands right behind the narrow right foam rope (wall at x 800-864, y 750-880; rope from (840, 640) to
        /// (700, 850)); the circular drum put that wall foot ~2 m further out (x 5.97 m = off-screen), so a wide foam heap
        /// filled the corner. Depth (m) the right wall foot moves toward the axis: full at / below the water, fading out 2.2 m
        /// above it (the ring crowns, paddles and upper framing are untouched), only for s 16-29. Kept at 1.3 m so Benny's
        /// widest steer (|x| 4.2 m, body radius 0.8 m) does not enter the wall. 0 = off.
        /// TESTED 2026-11-24 (cycle geometry_t2, 1.3 m): the dented foot only reaches the screen edge at y 700-740 and
        /// stays hidden behind the right foam rope - no visible gain; the approved spot needs the foot at ~3.6-4 m (2+ m
        /// in), which Benny's steering range (RiverPath.ClampLateral, |x| 4.2 m) would clip into. OFF until that range
        /// is narrowed beside the near bend.
        /// </summary>
        public static readonly float RightFootDent = 0f;

        /// <summary>Horizontal shift (m, toward the axis) of the wall at s, wall side (-1 / +1) and world height y.</summary>
        public static float FootDent(float s, int side, float y)
        {
            if (side <= 0 || RightFootDent <= 0f) return 0f;
            float w = Smooth(15.5f, 19.5f, s) * (1f - Smooth(24f, 29f, s));
            if (w <= 0f) return 0f;
            return RightFootDent * w * (1f - Smooth(0f, 2.2f, y - RiverPath.WaterY));
        }

        /// <summary>Ring slots every bay, anchored at sF05 = eye + 54 (environment.ts ringSlots05).</summary>
        public static List<float> RingSlots()
        {
            var list = new List<float>();
            for (float s = EyeS + 54f; s >= 2f - 1e-4f; s -= Bay) list.Insert(0, s);
            return list;
        }

        /// <summary>
        /// All real gold rings, ascending s (frame round 2026-11-23, fitted to the approved ring crowns: see
        /// ApprovedRingS): 5.6, 24.3, 45.5, 66.4, 106.5, 163.6, 230.1, 333.0, 450.4.
        /// </summary>
        public static List<float> RingPositions()
        {
            var list = new List<float>();
            foreach (float s in ApprovedRingS) if (s < ThroatS - 1f) list.Add(s);
            list.Sort();
            return list;
        }

        public static BandProfile BandFor(float s) => s > FarBandFromS ? FarBand : (s < NearestBandBelowS ? NearestBand : NearBand);

        /// <summary>Paddle size in metres (frame round: no longer shrunk with the narrower tube - the approved trays are big).</summary>
        public static float PaddleScaledSize => PaddleSize;

        /// <summary>All wall paddles (frame round 2026-11-23: one by one on the approved trays, see ApprovedPaddles).</summary>
        public static List<PaddleSlot> PaddleSlots()
        {
            var list = new List<PaddleSlot>();
            foreach (PaddleSlot p in ApprovedPaddles) if (p.s > 4f && p.s < ThroatS - 6f) list.Add(p);
            list.Sort((a, b) => a.s.CompareTo(b.s));
            return list;
        }

        /// <summary>Distinct s of all paddles (kept for the Environment05Root marker).</summary>
        public static List<float> PaddlePositions()
        {
            var list = new List<float>();
            foreach (PaddleSlot p in PaddleSlots()) if (!list.Contains(p.s)) list.Add(p.s);
            return list;
        }

        /// <summary>
        /// Pose of one paddle (tube.ts wallLidBasis / wallLidMatrix): side +1 = right wall, -1 = left wall. Local +X points
        /// inward (drooped), local +Y is the tray's back (toward the wall above), local +Z runs along the tube.
        /// mountY &lt;= 0: lid05 angle 8 deg above the axis; otherwise the wall mount sits at that world height.
        /// </summary>
        public static void PaddlePose(float s, int side, out Vector3 position, out Quaternion rotation, float mountY = -1f)
        {
            float ang = PaddleAngleDeg * Mathf.Deg2Rad;
            if (mountY > 0f) ang = Mathf.Asin(Mathf.Clamp((mountY - CentreY(s)) / RadiusAt(s), -0.9f, 0.9f));
            float tilt = ang + PaddleDroopDeg * Mathf.Deg2Rad;
            Vector3 right = Vector3.right, up = Vector3.up;
            Vector3 dir = (right * (Mathf.Cos(ang) * side) + up * Mathf.Sin(ang)).normalized;
            Vector3 X = (right * (-Mathf.Cos(tilt) * side) + up * (-Mathf.Sin(tilt))).normalized;
            Vector3 Y = (right * (-Mathf.Sin(tilt) * side) + up * Mathf.Cos(tilt)).normalized;
            Vector3 Z = Vector3.Cross(X, Y).normalized;
            float size = PaddleScaledSize;
            position = Centre(s) + dir * (RadiusAt(s) - size * PaddleSink);
            rotation = Quaternion.LookRotation(Z, Y);
        }

        /// <summary>Shader slot row offset (cells) so every ring slot lies exactly between two slot rows.</summary>
        public static float SlotRowOffset()
        {
            float first = RingSlots()[0];
            float f = (first + SlotRowPitch * 0.5f) / SlotRowPitch;
            f -= Mathf.Floor(f);
            return 0.5f - f;
        }

        public static float SlotArcPitch => 2f * Mathf.PI * Radius / SlotsRound;

        /// <summary>Mean slot coverage of one cell (distant walls settle to this instead of shimmering).</summary>
        public static float SlotCoverage()
        {
            float r = Mathf.Min(SlotHalfLength, SlotHalfWidth);
            float area = 4f * SlotHalfLength * SlotHalfWidth - (4f - Mathf.PI) * r * r;
            return Mathf.Clamp01(area / (SlotArcPitch * SlotRowPitch));
        }
    }
}
