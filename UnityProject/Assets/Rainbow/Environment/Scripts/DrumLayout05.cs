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
    ///  * near floor 2 -> 1 m: the approved near ring (left crown ~(10, 480), foot on the foam ~(90, 700)) is centred on the
    ///    vanishing-point height, i.e. the near axis is ~level with the camera (3.25 m); 2 m put it 67 px below.
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
            public BandProfile(float height, float width, float lipHeight, float lipWidth, float groove)
            {
                this.height = height; this.width = width; this.lipHeight = lipHeight; this.lipWidth = lipWidth; this.groove = groove;
            }
            /// <summary>Half the total axial width (band + groove + lip).</summary>
            public float HalfWidth => (width + groove + lipWidth) * 0.5f;
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

        /// <summary>environment.ts band05near (the thick near rings).</summary>
        public static readonly BandProfile NearBand = new BandProfile(0.13f, 0.8f, 0.065f, 0.32f, 0.1f);
        /// <summary>environment.ts band05 (the thinner far rings).</summary>
        public static readonly BandProfile FarBand = new BandProfile(0.095f, 0.78f, 0.045f, 0.26f, 0.07f);
        /// <summary>Rings with s above this use FarBand.</summary>
        public const float FarBandFromS = 80f;

        // Frame round 2026-11-23: real rings at the depths whose crowns (0.94 r) project onto the approved crowns measured
        // straight up from the approved vanishing point (496, 478): y 210, 308, 378, 415, 434, 448, 456 (r 268 .. 22 px; the
        // deep ones were missing or hidden in the glow disc), plus the near ring whose left crown runs down the left frame
        // edge (~(10, 480)) and stands on the foam at ~(90, 700) (in the 1 m near-floor drop, i.e. centred on the
        // vanishing-point height). 5.6 only shows for camera s < 5. Replaces the light round's eye + [59 .. 272] set.
        static readonly float[] ApprovedRingS = { 5.6f, 24.3f, 45.5f, 66.4f, 106.5f, 163.6f, 230.1f, 333.0f, 450.4f };

        /// <summary>One wall paddle: s of the tray centre, wall side (-1 left, +1 right), height of its wall mount (m).</summary>
        public struct PaddleSlot
        {
            public float s; public int side; public float mountY;
            public PaddleSlot(float s, int side, float mountY) { this.s = s; this.side = side; this.mountY = mountY; }
        }

        // Frame round 2026-11-23: trays placed on the approved ones (screen centres measured on the approved image: big left
        // (150, 425), big right (790, 460) - nearer on the left -, mid (290, 445) / (665, 425), small (385, 462) / (600, 450),
        // tiny ones beside the throat), unprojected with the gameplay camera onto the wall; the mount height (not the angle)
        // is kept, so the trays stay at the approved height where the near floor drops.
        static readonly PaddleSlot[] ApprovedPaddles =
        {
            new PaddleSlot(29.5f, -1, 5.2f), new PaddleSlot(34f, 1, 4.7f),
            new PaddleSlot(44f, -1, 5.2f), new PaddleSlot(55f, 1, 6.0f),
            new PaddleSlot(75f, -1, 5.1f), new PaddleSlot(82f, 1, 5.8f),
            new PaddleSlot(125f, -1, 5.3f), new PaddleSlot(118f, 1, 5.5f),
            new PaddleSlot(190f, -1, 5.3f), new PaddleSlot(180f, 1, 5.5f),
        };

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

        /// <summary>Depth of the tube bottom below the water at s.</summary>
        public static float Depth(float s) => FloorDepth + FloorExtra(s);

        /// <summary>Height of the tube axis at s (world y).</summary>
        public static float CentreY(float s) => RiverPath.WaterY + Radius - Depth(s);

        /// <summary>d CentreY / d s (the near-floor blend tilts the walls slightly).</summary>
        public static float CentreSlope(float s)
        {
            const float e = 0.01f;
            return (CentreY(s + e) - CentreY(s - e)) / (2f * e);
        }

        public static Vector3 Centre(float s) => new Vector3(0f, CentreY(s), s);

        /// <summary>Half chord of the tube at the water plane (where the wall meets the water).</summary>
        public static float WaterChord(float s)
        {
            float h = CentreY(s) - RiverPath.WaterY;
            return Mathf.Sqrt(Mathf.Max(0f, Radius * Radius - h * h));
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

        public static BandProfile BandFor(float s) => s > FarBandFromS ? FarBand : NearBand;

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
            if (mountY > 0f) ang = Mathf.Asin(Mathf.Clamp((mountY - CentreY(s)) / Radius, -0.9f, 0.9f));
            float tilt = ang + PaddleDroopDeg * Mathf.Deg2Rad;
            Vector3 right = Vector3.right, up = Vector3.up;
            Vector3 dir = (right * (Mathf.Cos(ang) * side) + up * Mathf.Sin(ang)).normalized;
            Vector3 X = (right * (-Mathf.Cos(tilt) * side) + up * (-Mathf.Sin(tilt))).normalized;
            Vector3 Y = (right * (-Mathf.Sin(tilt) * side) + up * Mathf.Cos(tilt)).normalized;
            Vector3 Z = Vector3.Cross(X, Y).normalized;
            float size = PaddleScaledSize;
            position = Centre(s) + dir * (Radius - size * PaddleSink);
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
