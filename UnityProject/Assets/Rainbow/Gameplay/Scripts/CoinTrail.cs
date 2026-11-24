using System.Collections.Generic;
using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Gold $ coins of Screen 05 (port of src/gameplay/coins.ts C05 layout):
    /// first coin C05.first = 5.7 u after the first meander crest ('05_crest'), gaps 5.0 + k * 1.5 (max 8) until the stage
    /// end - 3, height 1.2 above the water, size 0.9, leaning back 0.8 rad so the face reads as a slightly flattened disc
    /// with the rim showing underneath, on the cyan core: lateral = latK 0.7 * CORE_SWING 0.9 * meander from the route
    /// centre line (= 1.63 x RiverPath.Meander from the tunnel line). Beyond the stage a straight decorative trail
    /// (?tun05 06 coins: every 6.5 u on the axis) continues toward the vanishing point.
    /// Slow wobble (0.18 rad) and bob (0.08 u); pickup when |ds| &lt; 1 and |dx| &lt; 1.25 (coins.ts) and within jump reach;
    /// pop (grow 1.8x, rise 1.6 u, shrink away in 0.35 s) + sparkle burst; Screen05Events.CoinCollected.
    /// </summary>
    public class CoinTrail : MonoBehaviour
    {
        public const float First = 5.7f, Gap0 = 5.0f, GapGrow = 1.5f, GapMax = 8f;
        public const float CoinHeight = 1.2f, CoinScale = 0.9f, CoinTilt = 0.88f, LatK = 0.7f, CoreSwing = 0.9f;
        public const float FarGap = 6.5f;

        public static CoinTrail Instance { get; private set; }

        [System.Serializable]
        public struct Slot
        {
            public Transform coin;
            public float s;
            public float lateral; // world x of the coin (round 4; before: offset from the route centre line)
            public float height;  // coin centre above the water (m)
            public float scale;   // mesh scale (visible diameter = 0.906 x scale)
        }

        /// <summary>
        /// Round 4 (2026-11-24): the approved coin trail. Coin centres and widths measured on the approved image - (474,729) 96 px,
        /// (549,661) 72, (482,612) 57, (431,576) 43, (465,545) 30, (496,533) 22, (518,523) 17, (533,517) 16, (538,509) 12, (540,502) 10,
        /// (533,496) 9, (522,491) 8, (510,488) 7 - unprojected with the gameplay camera of the approved view at playable distances.
        /// x = s, y = world x, z = height of the coin centre above the water, w = visible diameter (m). The first seven are
        /// collectable (s &lt; FinishS), the rest lead into the throat.
        /// </summary>
        static readonly Vector4[] ApprovedCoins =
        {
            new Vector4(21.5f, -0.28f, 0.67f, 1.07f), new Vector4(26.8f, 0.77f, 0.69f, 1.09f), new Vector4(33.0f, -0.31f, 0.80f, 1.13f),
            new Vector4(41.0f, -1.66f, 0.92f, 1.12f), new Vector4(51.5f, -1.09f, 1.18f, 1.02f), new Vector4(60.5f, -0.03f, 1.21f, 0.90f),
            new Vector4(67.0f, 0.97f, 1.40f, 0.80f), new Vector4(78.0f, 1.97f, 1.35f, 0.87f), new Vector4(86.0f, 2.50f, 1.59f, 0.72f),
            new Vector4(94.0f, 2.88f, 1.86f, 0.66f), new Vector4(102.0f, 2.63f, 2.14f, 0.65f), new Vector4(110.0f, 2.00f, 2.40f, 0.63f),
            new Vector4(118.0f, 1.14f, 2.60f, 0.60f),
        };

        /// <summary>World x of the coin line at s (piecewise linear through the trail).</summary>
        public static float LineX(float s)
        {
            var c = ApprovedCoins;
            if (s <= c[0].x) return Mathf.Lerp(RiverPath.Meander(s), c[0].y, Mathf.Clamp01((s - (c[0].x - 7f)) / 7f));
            for (int i = 0; i + 1 < c.Length; i++)
                if (s <= c[i + 1].x) return Mathf.Lerp(c[i].y, c[i + 1].y, (s - c[i].x) / (c[i + 1].x - c[i].x));
            return c[c.Length - 1].y;
        }

        public SwimRoute route;
        public List<Slot> slots = new List<Slot>();
        public ParticleSystem sparkles;
        public float pickupAlong = 1.0f, pickupSide = 1.25f, pickupVertical = 1.7f;

        public int CollectedCount { get; private set; }
        /// <summary>Coins Benny can reach in the playable section (s below RiverPath.FinishS).</summary>
        public int PlayableCount { get; private set; }

        Vector3[] basePos;
        Quaternion[] baseRot;
        bool[] collected;
        float[] popT;

        void Awake()
        {
            Instance = this;
            if (route == null) route = SwimRoute.Instance != null ? SwimRoute.Instance : FindAnyObjectByType<SwimRoute>();
            Cache();
        }

        void OnEnable() { if (Instance == null) Instance = this; }
        void OnDisable() { if (Instance == this) Instance = null; }

        /// <summary>The coin trail: x = s, y = world x, z = height above the water, w = visible diameter (round 4, approved coins).</summary>
        public static void ComputeLayout(List<Vector4> outSl)
        {
            outSl.Clear();
            foreach (Vector4 c in ApprovedCoins) if (c.x < RiverPath.TunnelLength - 1f) outSl.Add(c);
        }

        /// <summary>Rest position / orientation of a coin (also used by the editor builder).</summary>
        public static void RestPose(SwimRoute r, float s, float worldX, float height, out Vector3 pos, out Quaternion rot)
        {
            Vector3 p, fwd, right;
            if (r != null) r.SampleAtS(s, out p, out fwd, out right);
            else { p = RiverPath.CorePoint(s); fwd = RiverPath.Forward(s); right = RiverPath.Right(s); }
            pos = new Vector3(worldX, RiverPath.WaterY + height, s);
            // face toward the camera behind Benny (mesh face normal is -Z), leaning back by CoinTilt (top away from the camera);
            // round 4: facing straight down the river (the approved coins face the rider, not the local bend)
            fwd = Vector3.Slerp(fwd, Vector3.forward, 0.8f).normalized;
            rot = Quaternion.LookRotation(fwd, Vector3.up);
        }
        void Cache()
        {
            int n = slots.Count;
            basePos = new Vector3[n];
            baseRot = new Quaternion[n];
            collected = new bool[n];
            popT = new float[n];
            PlayableCount = 0;
            for (int i = 0; i < n; i++)
            {
                RestPose(route, slots[i].s, slots[i].lateral, slots[i].height, out basePos[i], out baseRot[i]);
                popT[i] = -1f;
                if (slots[i].s < RiverPath.FinishS) PlayableCount++;
            }
            PlaceAll(0f);
        }

        /// <summary>Coins before s count as collected (hidden), the rest are restored. Resets the run counter.</summary>
        public void ResetUntil(float s)
        {
            if (collected == null || collected.Length != slots.Count) Cache();
            CollectedCount = 0;
            for (int i = 0; i < slots.Count; i++)
            {
                collected[i] = slots[i].s < s;
                popT[i] = -1f;
                if (slots[i].coin != null) slots[i].coin.gameObject.SetActive(!collected[i]);
            }
            PlaceAll(Screen05Clock.Time);
        }

        void Update()
        {
            if (collected == null || collected.Length != slots.Count) Cache();
            float time = Screen05Clock.Time;
            BennyController b = BennyController.Instance;
            if (b != null)
            {
                float bs = b.S, bx = b.LateralX, by = b.BodyCenter.y;
                for (int i = 0; i < slots.Count; i++)
                {
                    if (collected[i]) continue;
                    float ds = slots[i].s - bs;
                    if (ds < -2f || ds > 2f) continue;
                    Vector3 cp = basePos[i];
                    if (Mathf.Abs(ds) < pickupAlong && Mathf.Abs(cp.x - bx) < pickupSide && Mathf.Abs(cp.y - by) < pickupVertical)
                        Collect(i, time);
                }
            }
            PlaceAll(time);
        }

        void Collect(int i, float time)
        {
            collected[i] = true;
            popT[i] = time;
            CollectedCount++;
            Vector3 p = basePos[i];
            EmitSparkles(p);
            Screen05Events.RaiseCoinCollected(p);
        }

        void EmitSparkles(Vector3 p)
        {
            if (sparkles == null) return;
            ParticleSystem.EmitParams ep = new ParticleSystem.EmitParams();
            ep.applyShapeToPosition = false;
            Color gold = new Color(1f, 0.85f, 0.3f, 1f);
            for (int k = 0; k < 16; k++)
            {
                ep.position = p + Random.insideUnitSphere * 0.25f;
                ep.velocity = Random.insideUnitSphere * 3.0f + Vector3.up * 1.8f;
                ep.startSize = Random.Range(0.12f, 0.32f);
                ep.startLifetime = Random.Range(0.35f, 0.65f);
                ep.startColor = Color.Lerp(gold, Color.white, Random.value * 0.7f);
                sparkles.Emit(ep, 1);
            }
        }

        void PlaceAll(float time)
        {
            if (basePos == null) return;
            for (int i = 0; i < slots.Count; i++)
            {
                Transform t = slots[i].coin;
                if (t == null) continue;
                float scale = slots[i].scale > 0.01f ? slots[i].scale : CoinScale;
                Vector3 pos = basePos[i];
                if (collected[i])
                {
                    if (popT[i] < 0f) { if (t.gameObject.activeSelf) t.gameObject.SetActive(false); continue; }
                    float k = Mathf.Clamp01((time - popT[i]) / 0.35f);
                    if (k >= 1f) { popT[i] = -1f; t.gameObject.SetActive(false); continue; }
                    scale *= (1f + k * 0.8f) * (1f - k);
                    pos += Vector3.up * (k * 1.6f);
                }
                else
                {
                    pos += Vector3.up * (0.08f * Mathf.Sin(time * 3f + i));
                }
                float wobble = 0.18f * Mathf.Sin(time * 2.2f + i * 0.7f) * Mathf.Rad2Deg;
                Quaternion rot = baseRot[i] * Quaternion.Euler(0f, wobble, 0f) * Quaternion.Euler(CoinTilt * Mathf.Rad2Deg, 0f, 0f);
                t.SetPositionAndRotation(pos, rot);
                t.localScale = new Vector3(scale, scale, scale);
            }
        }

        /// <summary>Editor helper: place every coin at its rest pose (no animation).</summary>
        public void PlaceInEditor()
        {
            for (int i = 0; i < slots.Count; i++)
            {
                if (slots[i].coin == null) continue;
                Vector3 p; Quaternion r;
                RestPose(route, slots[i].s, slots[i].lateral, slots[i].height, out p, out r);
                slots[i].coin.SetPositionAndRotation(p, r * Quaternion.Euler(CoinTilt * Mathf.Rad2Deg, 0f, 0f));
                slots[i].coin.localScale = Vector3.one * (slots[i].scale > 0.01f ? slots[i].scale : CoinScale);
            }
        }
    }
}
