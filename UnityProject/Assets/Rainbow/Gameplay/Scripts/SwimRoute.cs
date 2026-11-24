using Unity.Mathematics;
using UnityEngine;
using UnityEngine.Splines;

namespace Rainbow.Screen05
{
    /// <summary>
    /// The "SwimRoute": a Unity SplineContainer through RiverPath.CorePoint(s) (knots every KnotStep u from
    /// RiverPath.TunnelStart to RiverPath.StageLength, TangentMode.AutoSmooth, y = WaterY), i.e. Benny's lateral-0 line
    /// (the Three.js course centreline of stage 05 = tunnel line + meander05).
    /// Benny advances along it by arc-length distance (normalized t = distance / length, which Unity Splines maps by
    /// length); a lookup table converts between t and s (= world Z = RiverPath distance) for TeleportTo and the coins.
    /// Outside the spline's s range the route continues straight along the tunnel line (Meander = 0 there).
    /// </summary>
    [RequireComponent(typeof(SplineContainer))]
    public class SwimRoute : MonoBehaviour
    {
        public const float KnotStep = 2f;
        const int LutSize = 2049;

        public static SwimRoute Instance { get; private set; }

        SplineContainer container;
        float length;
        float sMin, sMax;
        readonly float[] lutS = new float[LutSize];
        bool ready;

        public SplineContainer Container { get { EnsureReady(); return container; } }
        /// <summary>Arc length of the route spline (world units).</summary>
        public float Length { get { EnsureReady(); return length; } }
        public float MinS { get { EnsureReady(); return sMin; } }
        public float MaxS { get { EnsureReady(); return sMax; } }

        void Awake()
        {
            Instance = this;
            EnsureReady();
        }

        void OnEnable() { if (Instance == null) Instance = this; }
        void OnDisable() { if (Instance == this) Instance = null; }

        /// <summary>(Re)builds the knots from RiverPath. Used by the editor builder and as a runtime fallback.</summary>
        public static void BuildKnots(SplineContainer c)
        {
            if (c == null) return;
            if (c.Spline == null) c.Splines = new[] { new Spline() };
            Spline spline = c.Spline;
            spline.Clear();
            spline.Closed = false;
            for (float s = RiverPath.TunnelStart; s <= RiverPath.FinishS + 60f; s += KnotStep)
            {
                Vector3 p = SwimLine05.Point(s);
                spline.Add(new float3(p.x, p.y, p.z), TangentMode.AutoSmooth);
            }
        }

        public void EnsureReady()
        {
            if (ready && container != null) return;
            container = GetComponent<SplineContainer>();
            if (container.Spline == null || container.Spline.Count < 2) BuildKnots(container);
            length = Mathf.Max(1e-3f, container.CalculateLength());
            for (int i = 0; i < LutSize; i++)
            {
                float t = i / (float)(LutSize - 1);
                lutS[i] = ((Vector3)container.EvaluatePosition(t)).z;
            }
            // keep the table monotonic (it is: the route always heads +Z)
            for (int i = 1; i < LutSize; i++) if (lutS[i] < lutS[i - 1]) lutS[i] = lutS[i - 1];
            sMin = lutS[0];
            sMax = lutS[LutSize - 1];
            ready = true;
        }

        /// <summary>Normalized spline t of the route point whose world Z is s (clamped to the spline).</summary>
        public float TAtS(float s)
        {
            EnsureReady();
            if (s <= sMin) return 0f;
            if (s >= sMax) return 1f;
            int lo = 0, hi = LutSize - 1;
            while (hi - lo > 1)
            {
                int mid = (lo + hi) >> 1;
                if (lutS[mid] <= s) lo = mid; else hi = mid;
            }
            float span = lutS[hi] - lutS[lo];
            float f = span > 1e-6f ? (s - lutS[lo]) / span : 0f;
            return (lo + f) / (LutSize - 1);
        }

        /// <summary>Arc-length distance along the spline for world Z = s (may run past the ends: straight extension).</summary>
        public float DistanceAtS(float s)
        {
            EnsureReady();
            if (s < sMin) return s - sMin;
            if (s > sMax) return length + (s - sMax);
            return TAtS(s) * length;
        }

        /// <summary>World Z (= RiverPath s) of the route point at arc-length distance d.</summary>
        public float SAtDistance(float d)
        {
            EnsureReady();
            if (d <= 0f) return sMin + d;
            if (d >= length) return sMax + (d - length);
            return ((Vector3)container.EvaluatePosition(d / length)).z;
        }

        /// <summary>Route point, horizontal forward and right at arc-length distance d.</summary>
        public void SampleAtDistance(float d, out Vector3 pos, out Vector3 forward, out Vector3 right)
        {
            EnsureReady();
            if (d <= 0f || d >= length)
            {
                float s = SAtDistance(d);
                pos = SwimLine05.Point(s);
                forward = new Vector3(SwimLine05.SlopeAhead(s, -0.1f, 0.1f), 0f, 1f).normalized;
                right = Vector3.Cross(Vector3.up, forward).normalized;
                return;
            }
            float t = d / length;
            pos = container.EvaluatePosition(t);
            Vector3 tan = container.EvaluateTangent(t);
            tan.y = 0f;
            forward = tan.sqrMagnitude > 1e-8f ? tan.normalized : Vector3.forward;
            right = Vector3.Cross(Vector3.up, forward).normalized;
        }

        /// <summary>Route point, forward and right at world Z = s.</summary>
        public void SampleAtS(float s, out Vector3 pos, out Vector3 forward, out Vector3 right)
        {
            SampleAtDistance(DistanceAtS(s), out pos, out forward, out right);
        }

        /// <summary>
        /// s of the first meander crest (the Three.js '05_crest' checkpoint = Benny's approved spot): the minimum of
        /// RiverPath.Meander over u in [4, UCrest + Lambda / 4], searched like course.ts. ~15.5 (not UCrest = 14) because the
        /// crest amplitude grows past UCrest.
        /// </summary>
        public static float ApprovedCrestS()
        {
            float best = RiverPath.UCrest, dMin = float.MaxValue;
            float sEnd = RiverPath.UCrest + RiverPath.Lambda / 4f;
            for (float s = 4f; s < sEnd; s += 0.01f)
            {
                float d = RiverPath.Meander(s);
                if (d < dMin) { dMin = d; best = s; }
            }
            return best;
        }
    }
}
