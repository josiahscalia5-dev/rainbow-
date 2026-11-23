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
    /// </summary>
    public static class DrumLayout05
    {
        public const float Radius = 7.6f;
        public const float FloorDepth = 3.3f;
        public const float NearFloorExtra = 2.0f;
        /// <summary>STAGE_CAM['05'].back: the checkpoint camera sits 6.4 u behind Benny's start.</summary>
        public const float EyeBack = 6.4f;
        /// <summary>s of the locked approved-view camera (sCam05).</summary>
        public const float EyeS = RiverPath.StartS - EyeBack;
        public const float Bay = 14f;
        public const float RingInset = 0.02f;
        /// <summary>Real tunnel end: the far throat cap. Far ring at eye + 222 is inside it.</summary>
        public const float ThroatS = 250f;
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

        static readonly float[] FarRingDepths = { 59f, 97f, 161f, 222f };

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
        /// All real gold rings, ascending s. Near: the slots minus the anchor slot (replaced by the first far ring), the
        /// slot 26 u ahead of the eye moved to eye + 20 (ring A). Far: eye + [59, 97, 161, 222].
        /// Default: 5.6, 19.6, 27.6, 47.6, 66.6, 104.6, 168.6, 229.6.
        /// </summary>
        public static List<float> RingPositions()
        {
            float anchor = EyeS + 54f;
            var list = new List<float>();
            foreach (float slot in RingSlots())
            {
                if (Mathf.Abs(slot - anchor) < 0.5f) continue;
                list.Add(Mathf.Abs(slot - EyeS - 26f) < 3f ? EyeS + 20f : slot);
            }
            foreach (float d in FarRingDepths)
            {
                float s = EyeS + d;
                if (s < ThroatS - 1f) list.Add(s);
            }
            list.Sort();
            return list;
        }

        public static BandProfile BandFor(float s) => s > FarBandFromS ? FarBand : NearBand;

        /// <summary>
        /// Paddle pair positions (centre s of the half disc): 2.7 u camera-side of every ring slot and of every far ring
        /// (environment.ts lids05 = slot - band05.width / 2 - lid05.size * 1.05), s > 4, pairs closer than 6 u merged.
        /// Default: 16.9, 30.9, 44.9, 58.9, 101.9, 165.9, 226.9.
        /// </summary>
        public static List<float> PaddlePositions()
        {
            float back = FarBand.width * 0.5f + PaddleSize * 1.05f;
            var cand = new List<float>();
            foreach (float slot in RingSlots()) cand.Add(slot - back);
            foreach (float d in FarRingDepths) cand.Add(EyeS + d - back);
            cand.Sort();
            var list = new List<float>();
            foreach (float s in cand)
            {
                if (s <= 4f || s >= ThroatS - 6f) continue;
                if (list.Count > 0 && s - list[list.Count - 1] < 6f) continue;
                list.Add(s);
            }
            return list;
        }

        /// <summary>
        /// Pose of one paddle (tube.ts wallLidBasis / wallLidMatrix): side +1 = right wall, -1 = left wall. Local +X points
        /// inward (drooped), local +Y is the tray's back (toward the wall above), local +Z runs along the tube.
        /// </summary>
        public static void PaddlePose(float s, int side, out Vector3 position, out Quaternion rotation)
        {
            float ang = PaddleAngleDeg * Mathf.Deg2Rad;
            float tilt = ang + PaddleDroopDeg * Mathf.Deg2Rad;
            Vector3 right = Vector3.right, up = Vector3.up;
            Vector3 dir = (right * (Mathf.Cos(ang) * side) + up * Mathf.Sin(ang)).normalized;
            Vector3 X = (right * (-Mathf.Cos(tilt) * side) + up * (-Mathf.Sin(tilt))).normalized;
            Vector3 Y = (right * (-Mathf.Sin(tilt) * side) + up * Mathf.Cos(tilt)).normalized;
            Vector3 Z = Vector3.Cross(X, Y).normalized;
            float size = PaddleSize * Mathf.Min(1.4f, Radius / 7.6f);
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
