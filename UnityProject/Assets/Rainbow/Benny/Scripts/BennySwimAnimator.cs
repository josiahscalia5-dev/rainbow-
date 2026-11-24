using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Benny's swimming motion (master direction 2026-11-24: arms, feet and body move together, lean when steering, jump and land
    /// without pose resets). Replaces the Animator state machine, whose Jump / Fall / Land states restarted the swim clip: here ONE
    /// continuous stroke phase runs all the time and every pose is a smooth blend on top of it. The phase is tied to the distance he
    /// swims (one stroke = StrokeLength), so at the approved view (s = 14) it is exactly the approved pose: body phase 7 pi / 4, arms level.
    /// Bones (BennyRigBuilder): Lean / Bob / Model / Squash / ArmL, ArmR; feet = two small hidden nubs under the body that kick and show
    /// only while he jumps. BennyController drives the inputs every frame.
    /// </summary>
    public class BennySwimAnimator : MonoBehaviour
    {
        public Transform lean, bob, squash, armL, armR, footL, footR;

        [Header("Stroke (BennyRigBuilder swim clip)")]
        public float strokeLength = 9.218f;          // 11 u/s x 0.838 s
        public float bobHeight = 0.04f;
        public float bodyRoll = 0.05f;
        public float armStroke = 0.34f;
        public float armRest = 0.30f;
        public float armFore = 0.10f;
        [Header("Steering")]
        public float leanRoll = 0.27f;
        public float leanYaw = 0.10f;

        const float BodyPhaseAt14 = 5.498f, RollZero = 5.498f;
        Vector3 armScale = Vector3.one;
        Quaternion footLRest = Quaternion.identity, footRRest = Quaternion.identity;
        float phase, air, steer, squashV, squashY = 1f, effort;
        bool ready;

        void Awake() { Init(); }

        void Init()
        {
            if (ready) return;
            ready = true;
            if (armL != null) armScale = armL.localScale;
            if (footL != null) footLRest = footL.localRotation;
            if (footR != null) footRRest = footR.localRotation;
        }

        /// <summary>Teleport / restart: the stroke phase that belongs to this place of the course, no motion left over.</summary>
        public void ResetAt(float s)
        {
            Init();
            phase = BodyPhaseAt14 + 2f * Mathf.PI * (s - RiverPath.StartS) / strokeLength;
            air = 0f; steer = 0f; squashV = 0f; squashY = 1f; effort = 0f;
            Pose(0f, 0f, 0f);
        }

        /// <summary>speed01 = speed / swim speed, turn = -1..1 smoothed steering, airborne 0/1, vy = vertical speed, ride = water dip spring (m).</summary>
        public void Tick(float dt, float speed01, float turn, bool airborne, float vy, float ride, float rideV)
        {
            Init();
            phase += 2f * Mathf.PI * dt * Mathf.Lerp(0.5f, 1f, speed01) * 11f / strokeLength;
            air += ((airborne ? 1f : 0f) - air) * (1f - Mathf.Exp(-dt * (airborne ? 14f : 9f)));
            steer += (turn - steer) * (1f - Mathf.Exp(-dt * 7f));
            effort += (Mathf.Abs(turn) - effort) * (1f - Mathf.Exp(-dt * 4f));
            // squash & stretch: a spring pulled by the vertical speed in the air and by the water when he dips in
            float target = 1f + Mathf.Clamp(vy * 0.011f, -0.05f, 0.1f) * air + Mathf.Clamp(ride * 0.55f + rideV * 0.02f, -0.16f, 0.06f) * (1f - air);
            squashV += ((target - squashY) * 220f - squashV * 20f) * dt;
            squashY += squashV * dt;
            Pose(vy, ride, dt);
        }

        static Quaternion Rad(float x, float y, float z) => Quaternion.Euler(x * Mathf.Rad2Deg, y * Mathf.Rad2Deg, z * Mathf.Rad2Deg);

        void Pose(float vy, float ride, float dt)
        {
            float ph = phase, ap = phase - BodyPhaseAt14;          // arms level (phase 0) where the body phase is 7 pi / 4
            float water = 1f - air;
            if (lean != null) lean.localRotation = Rad(0f, steer * leanYaw, -steer * leanRoll * Mathf.Lerp(1f, 0.6f, air));
            if (bob != null)
            {
                bob.localPosition = new Vector3(0f, (Mathf.Abs(Mathf.Sin(ph)) * bobHeight - 0.01f) * water, 0f);
                bob.localRotation = Rad(Mathf.Sin(ph * 2f) * 0.03f * water - Mathf.Clamp(vy * 0.028f, -0.2f, 0.16f) * air, 0f,
                                        Mathf.Sin(ph - RollZero) * bodyRoll * Mathf.Lerp(0.5f, 1f, water));
            }
            if (squash != null)
            {
                float sq = (1f + 0.03f * Mathf.Sin(2f * ph) * water) * squashY;
                float xz = 1f / Mathf.Sqrt(Mathf.Max(0.3f, sq));
                squash.localScale = new Vector3(xz, sq, xz);
            }
            if (armR != null) armR.localRotation = Arm(true, ap);
            if (armL != null) armL.localRotation = Arm(false, ap);
            // feet: flutter kick under the water, dangling and paddling in the air
            float kick = Mathf.Lerp(0.5f, 0.75f, air), rate = 2f;
            if (footL != null) footL.localRotation = footLRest * Rad(Mathf.Sin(ap * rate) * kick, 0f, 0f);
            if (footR != null) footR.localRotation = footRRest * Rad(Mathf.Sin(ap * rate + Mathf.PI) * kick, 0f, 0f);
        }

        /// <summary>Doggy-paddle stroke (mesh space: X mirrored): reach out, pull back; the outer arm pulls harder in a turn; spread in the air.</summary>
        Quaternion Arm(bool hisRight, float ap)
        {
            float side = hisRight ? 1f : -1f;
            float p = ap + (hisRight ? 0f : Mathf.PI);
            float outer = Mathf.Clamp(-side * steer, -1f, 1f);               // + = the arm on the outside of the turn
            float amp = armStroke * (1f + 0.45f * outer + 0.15f * effort);
            float z = -side * amp * Mathf.Sin(p) * (1f - air);
            float y = -side * (armFore * Mathf.Cos(p) + 0.22f * Mathf.Sin(p) * Mathf.Sin(p) * 0.5f) * (1f - air);
            float raise = armRest + air * (0.42f + 0.14f * Mathf.Sin(p * 1.5f)) + 0.1f * outer * (1f - air);
            return Quaternion.AngleAxis((hisRight ? -raise : raise) * Mathf.Rad2Deg, Vector3.forward)
                 * Quaternion.AngleAxis(y * Mathf.Rad2Deg, Vector3.up) * Quaternion.AngleAxis(z * Mathf.Rad2Deg, Vector3.forward);
        }
    }
}
