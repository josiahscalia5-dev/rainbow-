using UnityEngine;
using UnityEngine.Rendering;

namespace Rainbow.Screen05
{
    /// <summary>
    /// The near gold FRAME of the approved Screen 05 picture (two thick gold ring segments in the bottom corners, cut flat
    /// where they meet the stream, and the bottom lip the stream pours over). Port of src/world/environment.ts
    /// "05 near gold frame": real 3D bands (DrumMeshes05.BuildFrame*) held in front of the rider camera at depth 0.8 m,
    /// sized by the camera's vertical FOV so they keep the approved framing on any portrait screen. The corners hug the
    /// screen edges on aspects other than 9:16. Shown while the camera rides the 05 current; slides down out of view
    /// outside <see cref="fadeInCameraS"/> .. <see cref="fadeOutCameraS"/>.
    /// Placement runs in RenderPipelineManager.beginCameraRendering (after Cinemachine has moved the camera), only for
    /// the game camera tagged MainCamera, only in Play mode (in Edit mode it stays where the builder put it).
    /// </summary>
    [DisallowMultipleComponent]
    public class NearFrame05 : MonoBehaviour
    {
        [Tooltip("Left bottom corner piece (child).")] public Transform leftCorner;
        [Tooltip("Right bottom corner piece (child).")] public Transform rightCorner;
        [Tooltip("Bottom lip piece (child).")] public Transform bottomLip;
        [Tooltip("Distance in front of the camera (m).")] public float depth = 0.8f;
        [Tooltip("Camera z (= s) range over which the frame slides in.")] public Vector2 fadeInCameraS = new Vector2(0f, 6f);
        [Tooltip("Camera z (= s) range over which the frame slides out again.")] public Vector2 fadeOutCameraS = new Vector2(200f, 210f);
        [Tooltip("Hide when the camera is further than this from the tunnel line (m).")] public float maxLateral = DrumLayout05.Radius * 1.2f;
        [Tooltip("Only follow the camera tagged MainCamera.")] public bool onlyMainCamera = true;

        Renderer[] _renderers;
        bool _visible = true;

        void OnEnable()
        {
            _renderers = GetComponentsInChildren<Renderer>(true);
            RenderPipelineManager.beginCameraRendering += OnBeginCameraRendering;
        }

        void OnDisable()
        {
            RenderPipelineManager.beginCameraRendering -= OnBeginCameraRendering;
        }

        void OnBeginCameraRendering(ScriptableRenderContext context, Camera cam)
        {
            if (!Application.isPlaying || cam == null) return;
            if (cam.cameraType != CameraType.Game) return;
            if (onlyMainCamera && !cam.CompareTag("MainCamera")) return;
            Place(cam);
        }

        static float Smooth(float e0, float e1, float x)
        {
            float t = Mathf.Clamp01((x - e0) / Mathf.Max(1e-4f, e1 - e0));
            return t * t * (3f - 2f * t);
        }

        /// <summary>Puts the frame in front of <paramref name="cam"/> (also usable from editor capture tools).</summary>
        public void Place(Camera cam)
        {
            if (cam == null || cam.orthographic) { SetVisible(false); return; }
            Transform ct = cam.transform;
            Vector3 cp = ct.position;
            float k = Smooth(fadeInCameraS.x, fadeInCameraS.y, cp.z) * (1f - Smooth(fadeOutCameraS.x, fadeOutCameraS.y, cp.z));
            if (Mathf.Abs(cp.x) > maxLateral) k = 0f;
            if (k <= 1e-3f) { SetVisible(false); return; }
            SetVisible(true);

            float halfH = depth * Mathf.Tan(cam.fieldOfView * 0.5f * Mathf.Deg2Rad);
            float px = halfH / 768f;                                    // world metres per reference pixel at that depth
            float slide = -(1f - k) * 420f * px;
            transform.SetPositionAndRotation(cp + ct.rotation * new Vector3(0f, slide, depth), ct.rotation);
            float parentScale = transform.parent != null ? Mathf.Max(1e-6f, transform.parent.lossyScale.x) : 1f;
            transform.localScale = Vector3.one * (px / parentScale);

            // keep the corners on the screen edges when the screen is not 9:16 (reference half width = 432 px)
            float shift = 768f * cam.aspect - 432f;
            if (leftCorner != null) leftCorner.localPosition = new Vector3(-shift, 0f, 0f);
            if (rightCorner != null) rightCorner.localPosition = new Vector3(shift, 0f, 0f);
            if (bottomLip != null) bottomLip.localPosition = Vector3.zero;
        }

        void SetVisible(bool v)
        {
            if (v == _visible || _renderers == null) return;
            _visible = v;
            foreach (var r in _renderers) if (r != null) r.enabled = v;
        }
    }
}
