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
        public const float CoinHeight = 1.2f, CoinScale = 0.9f, CoinTilt = 0.8f, LatK = 0.7f, CoreSwing = 0.9f;
        public const float FarGap = 6.5f;

        public static CoinTrail Instance { get; private set; }

        [System.Serializable]
        public struct Slot
        {
            public Transform coin;
            public float s;
            public float lateral; // offset from the route centre line along the route's right vector
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

        /// <summary>The C05 trail: x = s, y = lateral offset from the route centre line.</summary>
        public static void ComputeLayout(List<Vector2> outSl)
        {
            outSl.Clear();
            float crest = SwimRoute.ApprovedCrestS();
            int k = 0;
            for (float s = crest + First; s < RiverPath.StageLength - 3f; k++)
            {
                outSl.Add(new Vector2(s, LatK * CoreSwing * RiverPath.Meander(s)));
                s += Mathf.Min(GapMax, Gap0 + k * GapGrow);
            }
            for (float s = RiverPath.StageLength + 5f; s < RiverPath.TunnelLength - 14f; s += FarGap)
                outSl.Add(new Vector2(s, 0f));
        }

        /// <summary>Rest position / orientation of a coin (also used by the editor builder).</summary>
        public static void RestPose(SwimRoute r, float s, float lateral, out Vector3 pos, out Quaternion rot)
        {
            Vector3 p, fwd, right;
            if (r != null) r.SampleAtS(s, out p, out fwd, out right);
            else { p = RiverPath.CorePoint(s); fwd = RiverPath.Forward(s); right = RiverPath.Right(s); }
            pos = p + right * lateral + Vector3.up * CoinHeight;
            // face toward the camera behind Benny (mesh face normal is -Z), leaning back by CoinTilt (top away from the camera)
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
                RestPose(route, slots[i].s, slots[i].lateral, out basePos[i], out baseRot[i]);
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
                float scale = CoinScale;
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
                RestPose(route, slots[i].s, slots[i].lateral, out p, out r);
                slots[i].coin.SetPositionAndRotation(p, r * Quaternion.Euler(CoinTilt * Mathf.Rad2Deg, 0f, 0f));
                slots[i].coin.localScale = new Vector3(CoinScale, CoinScale, CoinScale);
            }
        }
    }
}
