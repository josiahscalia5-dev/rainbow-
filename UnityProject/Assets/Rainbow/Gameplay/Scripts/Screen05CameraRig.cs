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
    ///  * CinemachineFollow (world-space binding) keeps the camera at that point + (0, up 3.6, -back 6.4);
    ///  * CinemachineHardLookAt aims at lookTarget ("CamLookAhead", a look-ahead point down the route) placed so the view is
    ///    pitched atan2(up - lookUp, ahead + back) = 12.75 deg below the tunnel axis and yawed 2.96 deg left (vanishing
    ///    point right of centre, as in the approved picture), level (no roll), vertical FOV 62.
    /// Forward damping is 0 so the approved framing holds while swimming (the Three.js lerp lagged ~1.6 u behind at speed).
    /// BennyController calls Apply() every Update after moving Benny, and Snap() after a teleport.
    /// </summary>
    public class Screen05CameraRig : MonoBehaviour
    {
        [Header("Targets")]
        public Transform followTarget;
        public Transform lookTarget;
        public CinemachineCamera vcam;

        [Header("STAGE_CAM['05'] (cameraRig.ts)")]
        public float back = 6.4f;
        public float up = 3.6f;
        public float ahead = 18f;
        public float lookUp = -1.92f;
        public float verticalFov = 62f;
        [Tooltip("degrees the view is turned LEFT of the tunnel axis")]
        public float yawLeftDeg = 2.96f;
        public float latFollow = 0.85f;
        public float deadZone = 1.0f;

        [Header("Unity additions")]
        [Tooltip("share of Benny's jump height the camera follows (0 = horizon stays still)")]
        public float jumpFollow = 0.3f;
        public Vector3 positionDamping = new Vector3(0.6f, 0.35f, 0f);
        public float nearClip = 0.1f;
        public float farClip = 300f;

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
            float off = lateralX; // tunnel axis is x = 0, so Benny's lateral offset from it is his world X
            float follow = latFollow * (1f - Mathf.Exp(-(off * off) / Mathf.Max(1e-3f, deadZone * deadZone)));
            float camX = off * follow;
            float y = RiverPath.WaterY + jumpFollow * Mathf.Max(0f, jumpHeight);
            Vector3 anchor = new Vector3(camX, y, s);
            if (followTarget != null) followTarget.position = anchor;
            if (lookTarget != null) lookTarget.position = LookPoint(anchor);
        }

        /// <summary>Look-ahead point for a follow anchor: ideal camera + approved view direction * (ahead + back).</summary>
        public Vector3 LookPoint(Vector3 anchor)
        {
            Vector3 cam = anchor + new Vector3(0f, up, -back);
            float pitch = Mathf.Atan2(up - lookUp, ahead + back);
            float yaw = yawLeftDeg * Mathf.Deg2Rad;
            Vector3 look = new Vector3(-Mathf.Cos(pitch) * Mathf.Sin(yaw), -Mathf.Sin(pitch), Mathf.Cos(pitch) * Mathf.Cos(yaw));
            return cam + look * (ahead + back);
        }

        /// <summary>Next camera update jumps straight to the targets (no damping).</summary>
        public void Snap()
        {
            if (vcam != null) vcam.PreviousStateIsValid = false;
        }
    }
}
