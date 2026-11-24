using System;
using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Benny's swim controller (port of the Three.js ride, reworked for the master direction of 2026-11-24: natural swimming).
    ///  * auto-swims along the SwimRoute spline (SwimLine05 = the visible current) at the stage-05 speed;
    ///  * continuous left / right steering as a sideways speed on top of the current; the foam banks of the S-shaped river
    ///    (SwimLine05.Limits) hold him softly, so he never swims over the foam or the drum floor;
    ///  * his body turns toward the direction he really travels and leans into the turn (smoothed, no snapping);
    ///  * he floats on the animated water (RiverSurface.HeightAt) on a damped spring: he bobs with the swell, a jump is a real
    ///    ballistic arc, and a landing dips him into the water and lets him float up again (no hard stop, no pose reset);
    ///  * BennySwimAnimator moves arms, feet and body with one continuous stroke phase; the pom-pom hangs on its own spring.
    ///
    /// Contract API: Instance, S (= RiverPath s = world Z), LateralX (world X), TeleportTo(s, lateralX). Without input he follows the route.
    /// </summary>
    [DefaultExecutionOrder(-50)]
    public class BennyController : MonoBehaviour
    {
        /// <summary>Benny body radius (runtime.ts radius 0.8).</summary>
        public const float BodyRadius = 0.8f;
        /// <summary>Root height above the water (Game.ts bennyPose: radius * 0.55).</summary>
        public const float RootRide = BodyRadius * 0.55f;
        /// <summary>Round 4: sideways nudge of the visible body (m, rider's right): his approved place (body centre px 424, star 517) was 11 px right of
        /// where the route centre put him; physics, pickup and steering are unchanged.</summary>
        public const float VisualShiftX = 0.055f;
        /// <summary>Smoothed water height under him at the approved view (so his approved place on screen stays the same).</summary>
        public const float RideRef = -0.0138f;

        public static BennyController Instance { get; private set; }

        [Header("Course")]
        public SwimRoute route;
        [Tooltip("s where a run starts (contract RiverPath.StartS; the Three.js '05_crest' approved spot is SwimRoute.ApprovedCrestS() = ~15.5)")]
        public float startS = RiverPath.StartS;
        [Tooltip("course.ts stage 05 speed (units / s)")]
        public float swimSpeed = 11f;
        public bool startSwimmingOnPlay = true;

        [Header("Steering (Game.ts continuous steering)")]
        public float maxSideSpeed = 6.2f;
        public float steerResponse = 9f;
        public float sideResponse = 5.5f;
        [Tooltip("width (m) of the soft zone in front of a foam bank")]
        public float bankSoft = 1.1f;
        [Tooltip("seconds pushing against a bank before it bumps Benny back (Game.ts edgeTime)")]
        public float bankBumpTime = 0.9f;

        [Header("Heading and lean")]
        public float headingFollow = 0.85f;
        public float maxHeadingDeg = 22f;
        public float headingResponse = 6f;

        [Header("Jump")]
        public float jumpVelocity = 8.6f;
        public float gravityUp = 23f;
        public float gravityDown = 27f;

        [Header("Floating (buoyancy spring)")]
        public float rideStiffness = 95f;
        public float rideDamping = 11.5f;
        [Tooltip("share of the swell height his body follows")]
        public float rideFollow = 0.85f;
        [Tooltip("share of the impact speed that pushes him under when he lands")]
        public float landingDip = 1.0f;
        [Tooltip("extra water drag (1/s) while he plunges after a landing")]
        public float plungeDrag = 24f;

        [Header("Ride pose (runtime.ts)")]
        public float rideLift = 0.12f;
        public float ridePitchRad = 0.22f;

        [Header("Rig (set by GameplayBuilder)")]
        public Transform visual;
        public Animator animator;
        public BennySwimAnimator swimAnimator;
        public Transform pom;
        public Screen05CameraRig cameraRig;
        public BennyInput input;
        public SplashWake wake;

        public float S { get; private set; }
        public float LateralX { get; private set; }
        /// <summary>Height above his floating position (jump), 0 on the water.</summary>
        public float Height { get { return height; } }
        public float Speed { get { return speed; } }
        public bool IsSwimming { get { return swimming; } }
        public bool IsGrounded { get { return grounded; } }
        /// <summary>Visual steering amount (-1..1) from his real sideways speed.</summary>
        public float SteerVisual { get { return visSteer; } }
        /// <summary>Sideways speed relative to the current (m/s, + = right).</summary>
        public float SideSpeed { get { return vLat; } }
        /// <summary>Horizontal unit vector of the direction he travels (smoothed).</summary>
        public Vector3 TravelDirection { get { return Quaternion.Euler(0f, heading, 0f) * Vector3.forward; } }
        public float HeadingDeg { get { return heading; } }
        /// <summary>How deep the last landing pushed him (m, negative = under his floating height).</summary>
        public float RideOffset { get { return ride; } }
        /// <summary>Centre of the plush ball (the old model's body origin).</summary>
        public Vector3 BodyCenter { get { return visual != null ? visual.position : transform.position; } }

        /// <summary>Raised when Benny bumps a foam bank (the game flow takes a heart).</summary>
        public event Action BankBumped;
        /// <summary>Raised on landing with the impact 0..1.</summary>
        public event Action<float> Landed;

        float distance, speed, vLat, steerSmoothed, visSteer, offset;
        float height, vy;                        // jump
        float ride, rideV, waterSm;              // floating spring (m around the floating height), smoothed water height
        bool grounded = true, swimming, placed;
        float lift, pitch, heading, lastX, lastRouteX;
        float edgeTime, bumpCooldown, limL, limR;
        // pom-pom spring (runtime.ts)
        float pomAngX, pomVelX, pomAngZ, pomVelZ, lastY, lastVy;
        Quaternion pomRest = Quaternion.identity;

        void Awake()
        {
            Instance = this;
            if (route == null) route = SwimRoute.Instance != null ? SwimRoute.Instance : FindAnyObjectByType<SwimRoute>();
            if (input == null) input = GetComponent<BennyInput>();
            if (input == null) input = gameObject.AddComponent<BennyInput>();
            if (wake == null) wake = GetComponent<SplashWake>();
            if (wake == null) wake = gameObject.AddComponent<SplashWake>();
            if (cameraRig == null) cameraRig = FindAnyObjectByType<Screen05CameraRig>();
            if (swimAnimator == null) swimAnimator = GetComponentInChildren<BennySwimAnimator>();
            if (animator == null) animator = GetComponentInChildren<Animator>();
            // the code-driven swimmer replaces the Animator states (they restarted the swim clip after every jump)
            if (swimAnimator != null && animator != null) { animator.enabled = false; animator = null; }
            if (pom != null) pomRest = pom.localRotation;
        }

        void OnEnable() { if (Instance == null) Instance = this; }
        void OnDisable() { if (Instance == this) Instance = null; }

        void Start()
        {
            if (!placed) TeleportTo(startS, SwimLine05.X(startS));
            swimming = startSwimmingOnPlay;
            speed = swimming ? swimSpeed : 0f;
        }

        /// <summary>Start (or restart) a run at s on the route's centre line.</summary>
        public void BeginRun(float s)
        {
            TeleportTo(s, SwimLine05.X(s));
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
            Vector3 rp, rf;
            SampleRoute(distance, out rp, out rf);
            Vector2 lim = SwimLine05.Limits(s);
            limL = lim.x; limR = lim.y;
            LateralX = Mathf.Clamp(lateralX, limL, limR);
            offset = LateralX - rp.x;
            vLat = 0f; steerSmoothed = 0f; visSteer = 0f;
            height = 0f; vy = 0f; grounded = true;
            ride = 0f; rideV = 0f;
            edgeTime = 0f; bumpCooldown = 0f;
            lift = rideLift; pitch = ridePitchRad;
            heading = Mathf.Atan2(rf.x, rf.z) * Mathf.Rad2Deg;
            pomAngX = pomVelX = pomAngZ = pomVelZ = 0f;
            placed = true;
            lastX = LateralX; lastRouteX = rp.x;
            waterSm = WaterUnder(LateralX, rp.z);
            Place(rp);
            lastY = transform.position.y; lastVy = 0f;
            if (swimAnimator != null) swimAnimator.ResetAt(S);
            if (cameraRig != null)
            {
                cameraRig.Apply(S, LateralX, 0f);
                cameraRig.Snap();
            }
            if (CoinTrail.Instance != null) CoinTrail.Instance.ResetUntil(S);
            Screen05Events.BennyS = S;
        }

        /// <summary>Animated water height under his footprint (three points along his body, so short ripples do not shake him).</summary>
        static float WaterUnder(float x, float s)
        {
            return (RiverSurface.HeightAt(x, s) + RiverSurface.HeightAt(x, s + 0.7f) + RiverSurface.HeightAt(x, s - 0.7f)) / 3f - RiverPath.WaterY;
        }

        void Update()
        {
            float dt = Mathf.Min(Time.deltaTime, 0.05f);
            if (dt <= 0f) return; // paused (timeScale 0)
            if (!placed) TeleportTo(startS, SwimLine05.X(startS));

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

            // ---- forward along the current
            speed = Mathf.MoveTowards(speed, swimming ? swimSpeed : 0f, (swimming ? 30f : 6f) * dt);
            distance += speed * dt;

            // ---- steering: sideways speed on top of the current
            Vector3 rp, rf;
            SampleRoute(distance, out rp, out rf);
            steerSmoothed += (steerIn - steerSmoothed) * (1f - Mathf.Exp(-dt * steerResponse));
            vLat += (steerSmoothed * maxSideSpeed - vLat) * (1f - Mathf.Exp(-dt * sideResponse));
            offset += vLat * dt;
            float x = rp.x + offset;

            // ---- foam banks: the swimmable channel of the S-shaped river (smoothed limits, soft cushion, then a firm edge)
            Vector2 lim = SwimLine05.Limits(rp.z);
            float lk = 1f - Mathf.Exp(-dt * 10f);
            limL = Mathf.Max(Mathf.Lerp(limL, lim.x, lk), lim.x - 0.25f);
            limR = Mathf.Min(Mathf.Lerp(limR, lim.y, lk), lim.y + 0.25f);
            float penR = Mathf.Clamp01((x - (limR - bankSoft)) / bankSoft), penL = Mathf.Clamp01(((limL + bankSoft) - x) / bankSoft);
            vLat += (penL * penL - penR * penR) * 34f * dt;
            if (penR > 0f && vLat > 0f) vLat *= Mathf.Exp(-dt * 7f * penR);
            if (penL > 0f && vLat < 0f) vLat *= Mathf.Exp(-dt * 7f * penL);
            if (x > limR) { offset += (limR - x) * (1f - Mathf.Exp(-dt * 16f)); if (vLat > 0f) vLat = 0f; }
            else if (x < limL) { offset += (limL - x) * (1f - Mathf.Exp(-dt * 16f)); if (vLat < 0f) vLat = 0f; }
            x = rp.x + offset;
            // without steering the current carries him gently back toward its middle
            if (Mathf.Abs(steerIn) < 0.05f) offset *= Mathf.Exp(-dt * 0.18f);
            LateralX = x;

            // ---- foam-bank bump (Game.ts: hugging the wall costs a heart and bounces him back)
            bumpCooldown -= dt;
            float side = penR > penL ? 1f : -1f;
            bool pushing = Mathf.Max(penL, penR) > 0.75f && Mathf.Abs(steerIn) > 0.3f && Mathf.Sign(steerIn) == side;
            edgeTime = pushing ? edgeTime + dt : 0f;
            if (edgeTime > bankBumpTime && bumpCooldown <= 0f)
            {
                edgeTime = 0f;
                bumpCooldown = 1.8f;
                vLat = -side * 5.5f;
                steerSmoothed = 0f;
                if (wake != null) wake.Burst(0.6f);
                if (BankBumped != null) BankBumped();
            }

            float rideDt = dt;
            // ---- jump
            if (jumpIn && grounded)
            {
                grounded = false;
                vy = jumpVelocity;
                if (wake != null) wake.Burst(0.4f);
            }
            if (!grounded)
            {
                vy -= (vy > 0f ? gravityUp : gravityDown) * dt;
                height += vy * dt;
                if (height <= 0f)
                {
                    // touch-down: the impact carries on into the water spring (he dips and floats up again)
                    float impact = Mathf.Clamp01(-vy / Mathf.Max(0.01f, jumpVelocity));
                    rideV += vy * landingDip;
                    rideDt = Mathf.Clamp(-height / Mathf.Max(0.5f, -vy), 0f, dt);   // the part of this frame after he touched the water
                    height = 0f;
                    vy = 0f;
                    grounded = true;
                    if (wake != null) wake.Burst(Mathf.Lerp(0.5f, 1f, impact));
                    if (Landed != null) Landed(impact);
                }
            }
            // ---- floating on the swell
            waterSm += (WaterUnder(x, rp.z) - waterSm) * (1f - Mathf.Exp(-dt * 9f));
            const int sub = 4;
            for (int i = 0; i < sub; i++)
            {
                float h = rideDt / sub;
                float c = rideV < 0f ? Mathf.Lerp(rideDamping, plungeDrag, Mathf.Clamp01(-rideV * 0.5f)) : rideDamping;
                rideV += (-rideStiffness * ride - c * rideV) * h;
                ride += rideV * h;
            }
            ride = Mathf.Clamp(ride, -0.5f, 0.25f);

            // ---- heading: toward where he really goes
            float vx = SwimLine05.SlopeAhead(rp.z, 0.2f, 2.4f) * speed + (x - lastX) / dt - (rp.x - lastRouteX) / dt;
            lastX = x;
            lastRouteX = rp.x;
            float want = Mathf.Clamp(Mathf.Atan2(vx * headingFollow, Mathf.Max(speed, 4f)) * Mathf.Rad2Deg, -maxHeadingDeg, maxHeadingDeg);
            heading += (want - heading) * (1f - Mathf.Exp(-dt * headingResponse));

            // ---- ride pose (lift + lean into the current), eased like runtime.ts
            float ease = 1f - Mathf.Exp(-dt * 7f);
            float liftTarget = rideLift * (speed > 0.5f ? 1f : 0.7f);
            float pitchTarget = grounded ? ridePitchRad : ridePitchRad * 0.45f;
            lift += (liftTarget - lift) * ease;
            pitch += (pitchTarget - pitch) * ease;

            Place(rp);

            // ---- limbs and body
            visSteer = Mathf.Clamp(vLat / Mathf.Max(0.01f, maxSideSpeed), -1f, 1f);
            if (swimAnimator != null) swimAnimator.Tick(dt, speed / Mathf.Max(0.01f, swimSpeed), visSteer, !grounded, vy, ride, rideV);

            // ---- splash wake at the waterline
            if (wake != null)
            {
                float swimW = Mathf.Clamp01(1f - height / 0.6f);
                wake.SetIntensity(swimW * Mathf.Lerp(0.3f, 1f, speed / Mathf.Max(0.01f, swimSpeed)));
            }

            if (cameraRig != null) cameraRig.Apply(S, LateralX, height);
            Screen05Events.BennyS = S;
        }

        /// <summary>Route centre-line point and horizontal forward at arc-length distance d.</summary>
        void SampleRoute(float d, out Vector3 p, out Vector3 fwd)
        {
            Vector3 right;
            if (route != null) route.SampleAtDistance(d, out p, out fwd, out right);
            else
            {
                float s = RiverPath.TunnelStart + d;
                p = SwimLine05.Point(s); fwd = new Vector3(SwimLine05.SlopeAhead(s, -0.1f, 0.1f), 0f, 1f).normalized;
            }
        }

        void Place(Vector3 p)
        {
            S = p.z;
            float float01 = Mathf.Clamp01(1f - height / 0.5f);       // in the air the swell lets go of him
            float y = RiverPath.WaterY + RootRide + height + ride + (waterSm * rideFollow - RideRef) * Mathf.Lerp(0.35f, 1f, float01);
            transform.SetPositionAndRotation(new Vector3(LateralX, y, S), Quaternion.Euler(0f, heading, 0f));
            if (visual != null)
            {
                visual.localPosition = new Vector3(VisualShiftX, lift, 0f);
                visual.localRotation = Quaternion.Euler(pitch * Mathf.Rad2Deg, 0f, 0f);
            }
        }

        void LateUpdate()
        {
            // pom-pom spring (runtime.ts): vertical acceleration, speed jitter and the steering lean; runs after the
            // body pose so it rides on top of it.
            float dt = Mathf.Min(Time.deltaTime, 0.05f);
            if (dt <= 0f || pom == null) return;
            float y = transform.position.y;
            float vyW = (y - lastY) / Mathf.Max(dt, 1e-3f);
            float ay = Mathf.Clamp((vyW - lastVy) / Mathf.Max(dt, 1e-3f), -45f, 45f);
            lastY = y; lastVy = vyW;
            const float k = 120f, c = 9f;
            float targetX = -ay * 0.004f + Mathf.Sin(Screen05Clock.Time * 11f) * 0.03f * Mathf.Min(1f, speed / 12f);
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
