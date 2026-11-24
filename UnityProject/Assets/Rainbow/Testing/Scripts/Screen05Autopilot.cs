using System;
using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// TEST AUTOPILOT for Screen 05 (visual evidence recordings). While enabled it drives
    /// Rainbow.Screen05.SwimInputOverride (CONTRACT.md) instead of the keyboard / touch:
    ///  * follows the coin line - target x = RiverPath.Meander(s + lookAhead) with a small PD controller,
    ///  * makes deliberate hard-left and hard-right excursions (Steer = -1 / +1) on given stretches,
    ///  * requests jumps when Benny crosses the given s values,
    /// so one ~12 s recording shows swimming through several gold rings, steering both ways, jumping and
    /// collecting coins. The program is keyed to course distance s (= Benny's world Z), so it is identical
    /// whatever the frame rate. Disable the component to hand control back to the player.
    /// Benny's position is read from BennyController.Instance.transform (world x / z), so the autopilot
    /// does not depend on how LateralX is defined.
    /// </summary>
    [DefaultExecutionOrder(-500)]
    [DisallowMultipleComponent]
    [AddComponentMenu("Rainbow/Testing/Screen05 Autopilot")]
    public class Screen05Autopilot : MonoBehaviour
    {
        [Header("Coin-line following")]
        [Tooltip("Look-ahead (units) for the target x = RiverPath.Meander(s + lookAhead).")]
        public float lookAhead = 3f;
        [Tooltip("Steer per unit of lateral error (1 = full steer at 1 unit off the coin line).")]
        public float steerGain = 0.9f;
        [Tooltip("Steer reduction per unit/s of lateral speed (damps oscillation).")]
        public float steerDamping = 0.25f;

        [Header("Program (keyed to course distance s = Benny's world Z)")]
        public Screen05AutopilotSegment[] program = DefaultProgram();
        [Tooltip("Request a jump when Benny crosses each of these s values.")]
        public float[] jumpAtS = { 55f, 92f, 143f, 186f, 212f, 254f, 300f, 338f, 376f, 430f };
        [Tooltip("After this s the autopilot only steers straight (Steer 0), still overriding input. 0 = never.")]
        public float straightAfterS = RiverPath.FinishS + 2f;

        /// <summary>Statistics of the current run (reset every time the component is enabled).</summary>
        public Screen05AutopilotStats Stats { get; private set; } = new Screen05AutopilotStats();
        public bool HooksAvailable { get; private set; }
        public float CurrentSteer { get; private set; }
        public Screen05AutopilotMode CurrentMode { get; private set; }

        float m_PrevZ;
        float m_PrevX;
        bool m_HasPrev;
        int m_NextJump;
        bool m_WarnedNoBenny;
        Action<Vector3> m_OnCoin;
        Action m_OnFinished;

        /// <summary>Default ~12 s program from StartS (14) to FinishS (68).</summary>
        public static Screen05AutopilotSegment[] DefaultProgram()
        {
            // master direction 2026-11-24: the whole long course (s 14 .. 466): coin line, hard left / right excursions
            return new[]
            {
                new Screen05AutopilotSegment(0f, Screen05AutopilotMode.CoinLine),
                new Screen05AutopilotSegment(36f, Screen05AutopilotMode.HardLeft),
                new Screen05AutopilotSegment(42f, Screen05AutopilotMode.CoinLine),
                new Screen05AutopilotSegment(70f, Screen05AutopilotMode.HardRight),
                new Screen05AutopilotSegment(76f, Screen05AutopilotMode.CoinLine),
                new Screen05AutopilotSegment(121f, Screen05AutopilotMode.HardRight),
                new Screen05AutopilotSegment(127f, Screen05AutopilotMode.CoinLine),
                new Screen05AutopilotSegment(164f, Screen05AutopilotMode.HardLeft),
                new Screen05AutopilotSegment(170f, Screen05AutopilotMode.CoinLine),
                new Screen05AutopilotSegment(226f, Screen05AutopilotMode.HardRight),
                new Screen05AutopilotSegment(233f, Screen05AutopilotMode.CoinLine),
                new Screen05AutopilotSegment(287f, Screen05AutopilotMode.HardLeft),
                new Screen05AutopilotSegment(294f, Screen05AutopilotMode.CoinLine),
                new Screen05AutopilotSegment(352f, Screen05AutopilotMode.HardRight),
                new Screen05AutopilotSegment(359f, Screen05AutopilotMode.CoinLine),
                new Screen05AutopilotSegment(412f, Screen05AutopilotMode.HardLeft),
                new Screen05AutopilotSegment(418f, Screen05AutopilotMode.CoinLine),
            };
        }

        void OnEnable()
        {
            Stats = new Screen05AutopilotStats();
            Stats.hooks = Screen05TestBridge.Describe();
            HooksAvailable = Screen05TestBridge.HasInputOverride;
            if (!HooksAvailable)
                Debug.LogWarning("[Screen05Autopilot] SwimInputOverride not found - the autopilot cannot steer. " + Stats.hooks);

            if (program != null) Array.Sort(program, (a, b) => a.fromS.CompareTo(b.fromS));
            if (jumpAtS != null) Array.Sort(jumpAtS);

            m_OnCoin = OnCoinCollected;
            m_OnFinished = OnFinished;
            Screen05TestBridge.AddCoinCollectedHandler(m_OnCoin);
            Screen05TestBridge.AddFinishedHandler(m_OnFinished);

            m_HasPrev = false;
            m_NextJump = 0;
            m_WarnedNoBenny = false;
            CurrentSteer = 0f;
            CurrentMode = Screen05AutopilotMode.CoinLine;
            Screen05TestBridge.SetOverride(true, 0f);
        }

        void OnDisable()
        {
            Screen05TestBridge.RemoveCoinCollectedHandler(m_OnCoin);
            Screen05TestBridge.RemoveFinishedHandler(m_OnFinished);
            Screen05TestBridge.ReleaseOverride();
            CurrentSteer = 0f;
        }

        void OnCoinCollected(Vector3 position) => Stats.coinsCollected++;

        void OnFinished() => Stats.finishedEvent = true;

        void Update()
        {
            Component bennyComponent = Screen05TestBridge.GetBenny();
            if (bennyComponent == null)
            {
                if (!m_WarnedNoBenny)
                {
                    m_WarnedNoBenny = true;
                    Debug.LogWarning("[Screen05Autopilot] BennyController.Instance not found yet - holding Steer 0.");
                }
                Screen05TestBridge.SetOverride(true, 0f);
                return;
            }

            Vector3 p = bennyComponent.transform.position;
            float s = p.z;
            float x = p.x;
            float dt = Mathf.Max(Time.deltaTime, 1e-4f);
            float vx = m_HasPrev ? (x - m_PrevX) / dt : 0f;

            // Jumps: fire once when Benny crosses the s value (values already behind him at enable time are skipped).
            if (jumpAtS != null)
            {
                while (m_NextJump < jumpAtS.Length && s >= jumpAtS[m_NextJump])
                {
                    if (m_HasPrev && m_PrevZ < jumpAtS[m_NextJump] && Screen05TestBridge.RequestJump())
                        Stats.jumpsRequested++;
                    m_NextJump++;
                }
            }

            float steer;
            if (straightAfterS > 0f && s >= straightAfterS)
            {
                CurrentMode = Screen05AutopilotMode.CoinLine;
                steer = 0f;
            }
            else
            {
                CurrentMode = ModeAt(s);
                switch (CurrentMode)
                {
                    case Screen05AutopilotMode.HardLeft:
                        steer = -1f;
                        Stats.hardLeftFrames++;
                        break;
                    case Screen05AutopilotMode.HardRight:
                        steer = 1f;
                        Stats.hardRightFrames++;
                        break;
                    default:
                        float target = CoinTrail.LineX(s + lookAhead);
                        steer = Mathf.Clamp((target - x) * steerGain - vx * steerDamping, -1f, 1f);
                        break;
                }
            }

            CurrentSteer = steer;
            Screen05TestBridge.SetOverride(true, steer);
            Stats.Sample(s, x, Time.deltaTime);

            m_PrevZ = s;
            m_PrevX = x;
            m_HasPrev = true;
        }

        Screen05AutopilotMode ModeAt(float s)
        {
            Screen05AutopilotMode mode = Screen05AutopilotMode.CoinLine;
            if (program == null) return mode;
            for (int i = 0; i < program.Length; i++)
            {
                if (s >= program[i].fromS) mode = program[i].mode;
                else break;
            }
            return mode;
        }
    }
}
