using System;
using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Benny's swim controller (port of the Three.js ride: src/game/Game.ts rideUpdate + src/characters/benny/runtime.ts):
    /// auto-swims along the SwimRoute spline at the stage-05 speed, continuous left/right steering into a sideways speed
    /// (Game.ts QA steering: steer eased x10/s, side speed eased toward steer * 7.5 at x8/s), clamped with
    /// RiverPath.ClampLateral, a jump with gravity and a landing splash, the ride height on the water (root = water +
    /// radius * 0.55, model lifted 0.12 and leaned 0.22 rad into the current) and the procedural pom-pom spring.
    /// Clip motion (paddling, bob, roll, lean into steering, jump / fall / land squash) comes from the generated
    /// AnimatorController, driven through the parameters Steer, SwimSpeed, Grounded, Jump, VerticalSpeed.
    ///
    /// Contract API: Instance, S (= RiverPath s of his route point = world Z), LateralX (world X = offset from the tunnel
    /// line, the value RiverPath.ClampLateral works on), TeleportTo(s, lateralX).
    /// </summary>
    [DefaultExecutionOrder(-50)]
    public class BennyController : MonoBehaviour
    {
        /// <summary>Benny body radius (runtime.ts radius 0.8).</summary>
        public const float BodyRadius = 0.8f;
        /// <summary>Root height above the water (Game.ts bennyPose: radius * 0.55).</summary>
        public const float RootRide = BodyRadius * 0.55f;

        public static BennyController Instance { get; private set; }

        [Header("Course")]
        public SwimRoute route;
        [Tooltip("s where a run starts (contract RiverPath.StartS; the Three.js '05_crest' approved spot is SwimRoute.ApprovedCrestS() = ~15.5)")]
        public float startS = RiverPath.StartS;
        [Tooltip("course.ts stage 05 speed (units / s)")]
        public float swimSpeed = 11f;
        public bool startSwimmingOnPlay = true;

        [Header("Steering (Game.ts continuous steering)")]
        public float maxSideSpeed = 7.5f;
        public float steerResponse = 10f;
        public float sideResponse = 8f;
        [Tooltip("distance kept from the foam banks (RiverPath.ClampLateral bankMargin)")]
        public float bankMargin = 1.0f;
        [Tooltip("seconds pushing against a bank before it bumps Benny back (Game.ts edgeTime)")]
        public float bankBumpTime = 0.6f;

        [Header("Jump")]
        public float jumpVelocity = 9f;
        public float gravity = 30f;

        [Header("Ride pose (runtime.ts)")]
        public float rideLift = 0.12f;
        public float ridePitchRad = 0.22f;

        [Header("Rig (set by GameplayBuilder)")]
        public Transform visual;
        public Animator animator;
        public Transform pom;
        public Screen05CameraRig cameraRig;
        public BennyInput input;
        public SplashWake wake;

        public float S { get; private set; }
        public float LateralX { get; private set; }
        public float Height { get { return height; } }
        public float Speed { get { return speed; } }
        public bool IsSwimming { get { return swimming; } }
        public bool IsGrounded { get { return grounded; } }
        /// <summary>Visual steering amount (-1..1) from his real sideways speed.</summary>
        public float SteerVisual { get { return visSteer; } }
        /// <summary>Centre of the plush ball (the old model's body origin).</summary>
        public Vector3 BodyCenter { get { return visual != null ? visual.position : transform.position; } }

        /// <summary>Raised when Benny bumps a foam bank (the game flow takes a heart).</summary>
        public event Action BankBumped;

        static readonly int SteerId = Animator.StringToHash("Steer");
        static readonly int SwimSpeedId = Animator.StringToHash("SwimSpeed");
        static readonly int GroundedId = Animator.StringToHash("Grounded");
        static readonly int JumpId = Animator.StringToHash("Jump");
        static readonly int VerticalSpeedId = Animator.StringToHash("VerticalSpeed");

        float distance, speed, vLat, steerSmoothed, visSteer;
        float height, vy;
        bool grounded = true, swimming, placed;
        float lift, pitch;
        float edgeTime, bumpCooldown;
        // pom-pom spring (runtime.ts)
        float pomAngX, pomVelX, pomAngZ, pomVelZ, lastY, lastVy;
        Quaternion pomRest = Quaternion.identity;
        bool hasAnimator;

        void Awake()
        {
            Instance = this;
            if (route == null) route = SwimRoute.Instance != null ? SwimRoute.Instance : FindAnyObjectByType<SwimRoute>();
            if (input == null) input = GetComponent<BennyInput>();
            if (input == null) input = gameObject.AddComponent<BennyInput>();
            if (wake == null) wake = GetComponent<SplashWake>();
            if (wake == null) wake = gameObject.AddComponent<SplashWake>();
            if (cameraRig == null) cameraRig = FindAnyObjectByType<Screen05CameraRig>();
            if (animator == null) animator = GetComponentInChildren<Animator>();
            hasAnimator = animator != null && animator.runtimeAnimatorController != null;
            if (pom != null) pomRest = pom.localRotation;
        }

        void OnEnable() { if (Instance == null) Instance = this; }
        void OnDisable() { if (Instance == this) Instance = null; }

        void Start()
        {
            if (!placed) TeleportTo(startS, RiverPath.Meander(startS));
            swimming = startSwimmingOnPlay;
            speed = swimming ? swimSpeed : 0f;
        }

        /// <summary>Start (or restart) a run at s on the route's centre line.</summary>
        public void BeginRun(float s)
        {
            TeleportTo(s, RiverPath.Meander(s));
            swimming = true;
            speed = swimSpeed;
        }

        /// <summary>Stop the auto-swim (finish): Benny glides to a halt and keeps paddling gently.</summary>
        public void StopSwimming()
        {
            swimming = false;
        }

        /// <summary>
        /// Contract: places Benny on the water at (s, lateralX), resets velocities and the jump, settles the ride pose and
        /// snaps the camera. Coins before s count as already collected, coins after s are restored (deterministic captures).
        /// </summary>
        public void TeleportTo(float s, float lateralX)
        {
            if (route != null) route.EnsureReady();
            distance = route != null ? route.DistanceAtS(s) : s - RiverPath.TunnelStart;
            LateralX = RiverPath.ClampLateral(lateralX, BodyRadius, bankMargin);
            vLat = 0f; steerSmoothed = 0f; visSteer = 0f;
            height = 0f; vy = 0f; grounded = true;
            edgeTime = 0f; bumpCooldown = 0f;
            lift = rideLift; pitch = ridePitchRad;
            pomAngX = pomVelX = pomAngZ = pomVelZ = 0f;
            placed = true;
            Place();
            lastY = transform.position.y; lastVy = 0f;
            if (hasAnimator)
            {
                animator.ResetTrigger(JumpId);
                animator.SetBool(GroundedId, true);
                animator.SetFloat(SteerId, 0f);
                animator.SetFloat(VerticalSpeedId, 0f);
            }
            if (cameraRig != null)
            {
                cameraRig.Apply(S, LateralX, 0f);
                cameraRig.Snap();
            }
            if (CoinTrail.Instance != null) CoinTrail.Instance.ResetUntil(S);
            Screen05Events.BennyS = S;
        }

        void Update()
        {
            float dt = Mathf.Min(Time.deltaTime, 0.05f);
            if (dt <= 0f) return; // paused (timeScale 0)
            if (!placed) TeleportTo(startS, RiverPath.Meander(startS));

            // ---- input
            float steerIn = 0f;
            bool jumpIn = false;
            if (SwimInputOverride.Active)
            {
                steerIn = Mathf.Clamp(SwimInputOverride.Steer, -1f, 1f);
                jumpIn = SwimInputOverride.ConsumeJump();
            }
            else if (input != null)
            {
                steerIn = input.Steer;
                jumpIn = input.ConsumeJump();
            }
            if (!swimming) { steerIn = 0f; jumpIn = false; }

            // ---- forward along the spline
            speed = Mathf.MoveTowards(speed, swimming ? swimSpeed : 0f, (swimming ? 30f : 9f) * dt);
            distance += speed * dt;

            // ---- steering (Game.ts override branch, continuous)
            steerSmoothed += (steerIn - steerSmoothed) * Mathf.Min(1f, dt * steerResponse);
            vLat += (steerSmoothed * maxSideSpeed - vLat) * Mathf.Min(1f, dt * sideResponse);
            float x = LateralX + vLat * dt;
            float lim = RiverPath.ClampLateral(1e6f, BodyRadius, bankMargin);
            bool atEdge = false;
            if (x > lim) { x = lim; if (vLat > 0f) vLat = 0f; atEdge = true; }
            else if (x < -lim) { x = -lim; if (vLat < 0f) vLat = 0f; atEdge = true; }
            LateralX = x;

            // ---- foam-bank bump (Game.ts: hugging the wall > 0.6 s costs a heart and bounces him back)
            bumpCooldown -= dt;
            bool pushing = atEdge && Mathf.Abs(steerIn) > 0.3f && Mathf.Sign(steerIn) == Mathf.Sign(x);
            edgeTime = pushing ? edgeTime + dt : 0f;
            if (edgeTime > bankBumpTime && bumpCooldown <= 0f)
            {
                edgeTime = 0f;
                bumpCooldown = 1.6f;
                vLat = -Mathf.Sign(x) * 9f;
                steerSmoothed = 0f;
                if (wake != null) wake.Burst(0.7f);
                if (BankBumped != null) BankBumped();
            }

            // ---- jump
            if (jumpIn && grounded)
            {
                grounded = false;
                vy = jumpVelocity;
                if (wake != null) wake.Burst(0.35f);
                if (hasAnimator)
                {
                    animator.SetBool(GroundedId, false);
                    animator.SetTrigger(JumpId);
                }
            }
            if (!grounded)
            {
                vy -= gravity * dt;
                height += vy * dt;
                if (height <= 0f)
                {
                    float impact = Mathf.Clamp01(-vy / Mathf.Max(0.01f, jumpVelocity));
                    height = 0f;
                    vy = 0f;
                    grounded = true;
                    if (wake != null) wake.Burst(Mathf.Lerp(0.5f, 1f, impact));
                    if (hasAnimator) animator.SetBool(GroundedId, true);
                }
            }

            // ---- ride pose (lift + lean into the current), eased like runtime.ts
            float ease = 1f - Mathf.Exp(-dt * 7f);
            float liftTarget = rideLift * (speed > 0.5f ? 1f : 0.7f);
            float pitchTarget = grounded ? ridePitchRad : ridePitchRad * 0.35f;
            lift += (liftTarget - lift) * ease;
            pitch += (pitchTarget - pitch) * ease;

            Place();

            // ---- animation parameters
            visSteer = Mathf.Clamp(vLat / Mathf.Max(0.01f, maxSideSpeed), -1f, 1f);
            if (hasAnimator)
            {
                animator.SetFloat(SteerId, visSteer, 0.08f, dt);
                animator.SetFloat(SwimSpeedId, Mathf.Lerp(0.55f, 1f, speed / Mathf.Max(0.01f, swimSpeed)));
                animator.SetFloat(VerticalSpeedId, vy);
            }

            // ---- splash wake at the waterline
            if (wake != null)
            {
                float swimW = Mathf.Clamp01(1f - height / 0.6f);
                wake.SetIntensity(swimW * Mathf.Lerp(0.35f, 1f, speed / Mathf.Max(0.01f, swimSpeed)));
            }

            if (cameraRig != null) cameraRig.Apply(S, LateralX, height);
            Screen05Events.BennyS = S;
        }

        void Place()
        {
            Vector3 p, fwd, right;
            if (route != null) route.SampleAtDistance(distance, out p, out fwd, out right);
            else
            {
                float s = RiverPath.TunnelStart + distance;
                p = RiverPath.CorePoint(s); fwd = RiverPath.Forward(s); right = RiverPath.Right(s);
            }
            S = p.z;
            transform.SetPositionAndRotation(
                new Vector3(LateralX, RiverPath.WaterY + RootRide + height, S),
                Quaternion.LookRotation(fwd, Vector3.up));
            if (visual != null)
            {
                visual.localPosition = new Vector3(0f, lift, 0f);
                visual.localRotation = Quaternion.Euler(pitch * Mathf.Rad2Deg, 0f, 0f);
            }
        }

        void LateUpdate()
        {
            // pom-pom spring (runtime.ts): vertical acceleration, speed jitter and the steering lean; runs after the
            // Animator so it rides on top of the clip pose.
            float dt = Mathf.Min(Time.deltaTime, 0.05f);
            if (dt <= 0f || pom == null) return;
            float y = transform.position.y;
            float vyW = (y - lastY) / Mathf.Max(dt, 1e-3f);
            float ay = Mathf.Clamp((vyW - lastVy) / Mathf.Max(dt, 1e-3f), -80f, 80f);
            lastY = y; lastVy = vyW;
            const float k = 120f, c = 9f;
            float targetX = -ay * 0.004f + Mathf.Sin(Time.time * 11f) * 0.03f * Mathf.Min(1f, speed / 12f);
            float targetZ = visSteer * 0.28f * 0.9f;
            pomVelX += (k * (targetX - pomAngX) - c * pomVelX) * dt;
            pomAngX += pomVelX * dt;
            pomVelZ += (k * (targetZ - pomAngZ) - c * pomVelZ) * dt;
            pomAngZ += pomVelZ * dt;
            // angles in Benny's frame (x = nod forward, z = swing outward of the turn), x2.2 like benny31.ts uPom
            float nod = Mathf.Clamp(Mathf.Clamp(pomAngX, -0.6f, 0.6f) * 2.2f, -0.6f, 0.6f) * Mathf.Rad2Deg;
            float swing = Mathf.Clamp(Mathf.Clamp(pomAngZ, -0.6f, 0.6f) * 2.2f, -0.6f, 0.6f) * Mathf.Rad2Deg;
            Quaternion qBenny = Quaternion.Euler(nod, 0f, swing);
            // the model is turned 180 deg inside Benny (its rear faces the camera): express the rotation in model space
            Quaternion turn = Quaternion.Euler(0f, 180f, 0f);
            pom.localRotation = pomRest * (Quaternion.Inverse(turn) * qBenny * turn);
        }
    }
}
