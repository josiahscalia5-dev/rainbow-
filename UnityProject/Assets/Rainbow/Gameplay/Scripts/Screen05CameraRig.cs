using Unity.Cinemachine;
using Unity.Cinemachine.TargetTracking;
using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// The approved Screen 05 ride camera (Three.js src/game/cameraRig.ts STAGE_CAM['05'] + the 05 tunnel branch of
    /// RideCamera.desired) expressed with Cinemachine 3:
    ///  * followTarget ("CamTarget", a child of Benny) is placed every frame on the water at Benny's s, laterally on the
    ///    tunnel axis while Benny is near it and easing toward him as he swings wide (Gaussian dead zone, latFollow 0.85);
    ///  * CinemachineFollow (world-space binding) keeps the camera at that point + (0, up, -back);
    ///  * CinemachineHardLookAt aims at lookTarget ("CamLookAhead", a look-ahead point down the route) placed so the view is
    ///    pitched pitchDeg below the tunnel axis and yawed yawLeftDeg left (vanishing point right of centre, as in the
    ///    approved picture), level (no roll), vertical FOV 62.
    /// Frame round 2026-11-23 (fitted to references/05_flow_into_the_current.png at 864x1536, s = 14): the approved
    /// vanishing point (river, rings and walls converge in the small bright point) sits at (496, 478). The old rig
    /// (STAGE_CAM back 6.4 / up 3.6 / lookUp -1.92 = 12.75 deg) reached the hold at (-0.06, 3.32, 7.44) / 12.0 deg because the
    /// 0.35 s vertical damping lagged 0.29 m below its target at swim speed: vanishing point (500, 496), 18 px low. Now the
    /// vertical / forward damping is 0 (the camera is exactly where these numbers say at every speed), the view is pitched
    /// 12.78 deg / yawed 2.78 deg (vanishing point (496, 478)) and the camera sits 0.09 m higher / 0.04 m closer, so Benny
    /// keeps his approved place and size on screen (body centre ~(420, 1010), 7.0 m from the camera).
    /// BennyController calls Apply() every Update after moving Benny, and Snap() after a teleport.
    /// </summary>
    public class Screen05CameraRig : MonoBehaviour
    {
        [Header("Targets")]
        public Transform followTarget;
        public Transform lookTarget;
        public CinemachineCamera vcam;

        [Header("Approved Screen 05 framing (frame round 2026-11-23)")]
        [Tooltip("camera distance behind Benny's s (m)")]
        public float back = 6.52f;
        [Tooltip("camera height above the water (m)")]
        public float up = 3.40f;
        [Tooltip("look-ahead distance in front of the camera (only the direction matters)")]
        public float ahead = 18f;
        [Tooltip("degrees the view is pitched DOWN from the tunnel axis (approved vanishing point y 478 of 1536)")]
        public float pitchDeg = 12.78f;
        public float verticalFov = 62f;
        [Tooltip("degrees the view is turned LEFT of the tunnel axis (approved vanishing point x 496 of 864)")]
        public float yawLeftDeg = 2.78f;
        public float latFollow = 0.85f;
        public float deadZone = 1.0f;

        [Header("Unity additions")]
        [Tooltip("share of Benny's jump height the camera follows (0 = horizon stays still)")]
        public float jumpFollow = 0.3f;
        [Tooltip("seconds the camera's jump share eases in / out (replaces the old vertical Cinemachine damping)")]
        public float jumpSmoothTime = 0.12f;
        [Tooltip("x = lateral ease while Benny steers; y / z stay 0 so the approved framing holds at every swim speed")]
        public Vector3 positionDamping = new Vector3(0.6f, 0f, 0f);
        public float nearClip = 0.1f;
        [Tooltip("far clip (m): the tunnel's far rings / throat reach s 470 (DrumLayout05.ThroatS)")]
        public float farClip = 520f;

        [Header("Follow the current (master direction 2026-11-24)")]
        [Tooltip("share of the course direction ahead that the view turns into (0 = fixed heading)")]
        public float yawFollow = 0.55f;
        [Tooltip("stretch of the course (m ahead of Benny) whose direction the view follows")]
        public Vector2 yawLook = new Vector2(2f, 20f);
        public float maxYawDeg = 8f;
        public float yawSmoothTime = 0.55f;
        [Tooltip("how far the camera stays inside the drum wall (m)")]
        public float wallGap = 1.6f;

        float yawNow, yawVel;

        float jumpShare, jumpShareVel;

        void Awake()
        {
            ConfigureCinemachine();
        }

        /// <summary>Push the serialized numbers into the Cinemachine components (also called by the editor builder).</summary>
        public void ConfigureCinemachine()
        {
            if (vcam == null) return;
            vcam.Target.TrackingTarget = followTarget;
            vcam.Target.LookAtTarget = lookTarget;
            vcam.Target.CustomLookAtTarget = true;
            LensSettings lens = vcam.Lens;
            lens.FieldOfView = verticalFov;
            lens.NearClipPlane = nearClip;
            lens.FarClipPlane = farClip;
            vcam.Lens = lens;

            CinemachineFollow follow = vcam.GetComponent<CinemachineFollow>();
            if (follow != null)
            {
                follow.FollowOffset = new Vector3(0f, up, -back);
                TrackerSettings ts = follow.TrackerSettings;
                ts.BindingMode = BindingMode.WorldSpace;
                ts.PositionDamping = positionDamping;
                follow.TrackerSettings = ts;
            }
        }

        /// <summary>Place the follow and look targets for Benny at (s, lateralX) with his current jump height.</summary>
        public void Apply(float s, float lateralX, float jumpHeight)
        {
            float bend = RiverPath.Bend(s - 3f);
            float off = lateralX - RiverPath.Bend(s); // Benny's offset from the tunnel axis (0 bend in the approved stretch)
            float follow = latFollow * (1f - Mathf.Exp(-(off * off) / Mathf.Max(1e-3f, deadZone * deadZone)));
            float camX = bend + off * follow;
            float wall = DrumLayout05.WaterChord(s - back) - wallGap;
            camX = Mathf.Clamp(camX, bend + DrumLayout05.AxisXAt(s) - RiverPath.Bend(s) - wall, bend + DrumLayout05.AxisXAt(s) - RiverPath.Bend(s) + wall);
            float jumpTarget = jumpFollow * Mathf.Max(0f, jumpHeight);
            float dt = Application.isPlaying ? Time.deltaTime : 0f;
            float yawWant = YawTarget(s);
            if (dt > 0f) yawNow = Mathf.SmoothDamp(yawNow, yawWant, ref yawVel, yawSmoothTime, 40f, dt);
            else if (!Application.isPlaying) { yawNow = yawWant; yawVel = 0f; }
            if (dt > 0f) jumpShare = Mathf.SmoothDamp(jumpShare, jumpTarget, ref jumpShareVel, Mathf.Max(1e-3f, jumpSmoothTime), Mathf.Infinity, dt);
            else if (!Application.isPlaying) { jumpShare = jumpTarget; jumpShareVel = 0f; }
            float y = RiverPath.WaterY + jumpShare;
            Vector3 anchor = new Vector3(camX, y, s);
            if (followTarget != null) followTarget.position = anchor;
            if (lookTarget != null) lookTarget.position = LookPoint(anchor);
        }

        /// <summary>View turn (deg, + = right) into the direction the current takes ahead; exactly 0 at the approved view (s = StartS).</summary>
        float YawTarget(float s)
        {
            float a = Mathf.Atan(SwimLine05.SlopeAhead(s, yawLook.x, yawLook.y)) * Mathf.Rad2Deg;
            float a0 = Mathf.Atan(SwimLine05.SlopeAhead(RiverPath.StartS, yawLook.x, yawLook.y)) * Mathf.Rad2Deg;
            float k = Mathf.Clamp01((s - RiverPath.StartS - 1f) / 24f);
            k = k * k * (3f - 2f * k);
            return Mathf.Clamp(yawFollow * (a - a0 * (1f - k)) * Mathf.Max(k, 0.0f), -maxYawDeg, maxYawDeg);
        }

        /// <summary>Look-ahead point for a follow anchor: ideal camera + approved view direction * (ahead + back).</summary>
        public Vector3 LookPoint(Vector3 anchor)
        {
            Vector3 cam = anchor + new Vector3(0f, up, -back);
            float pitch = pitchDeg * Mathf.Deg2Rad;
            float yaw = (yawLeftDeg - yawNow) * Mathf.Deg2Rad;
            Vector3 look = new Vector3(-Mathf.Cos(pitch) * Mathf.Sin(yaw), -Mathf.Sin(pitch), Mathf.Cos(pitch) * Mathf.Cos(yaw));
            return cam + look * (ahead + back);
        }

        /// <summary>Next camera update jumps straight to the targets (no damping).</summary>
        public void Snap()
        {
            jumpShare = 0f; jumpShareVel = 0f;   // teleports always put Benny on the water
            if (followTarget != null) { yawNow = YawTarget(followTarget.position.z); yawVel = 0f; }
            if (followTarget != null && lookTarget != null)
            {
                Vector3 a = followTarget.position;
                a.y = RiverPath.WaterY;
                followTarget.position = a;
                lookTarget.position = LookPoint(a);
            }
            if (vcam != null) vcam.PreviousStateIsValid = false;
        }
    }
}
