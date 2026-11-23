using System;
using System.Collections.Generic;
using System.IO;
using Unity.Collections;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using UnityEngine.UI;

namespace Rainbow.Screen05.EditorTools
{
    /// <summary>
    /// Renders a camera - its full URP stack with post-processing - into an exact Width x Height RGBA32 texture,
    /// independent of the Game view's size, aspect or focus, and optionally adds the Screen Space - Overlay HUD.
    ///
    /// Why the HUD needs extra work: URP draws Screen Space - Overlay canvases only for a camera that renders to
    /// the screen, never into a RenderTexture (UniversalCameraData.rendersOverlayUI requires targetTexture == null).
    /// So for the HUD pass every active overlay canvas is switched for a moment to Screen Space - Camera on a
    /// hidden UI-only camera that renders into its own Width x Height texture (CanvasScaler maths re-done for that
    /// size), drawn twice - over black and over white - and the two results give the exact HUD colour and
    /// coverage (difference matte, done in linear space). The HUD is then composited over the 3D image, so it is
    /// NOT post-processed (same as in the game). The canvases are restored in the same frame.
    ///
    /// One grabber owns its textures; reuse it for many frames and Dispose() it at the end.
    /// </summary>
    public sealed class Screen05FrameGrabber : IDisposable
    {
        public readonly int Width;
        public readonly int Height;

        /// <summary>The last grabbed frame (CPU readable, sRGB bytes as shown on screen, row 0 = bottom).</summary>
        public Texture2D Frame { get; private set; }

        /// <summary>Number of overlay canvases composited into the last frame.</summary>
        public int LastHudCanvasCount { get; private set; }

        /// <summary>When true (default), post-processing is switched on for the captured camera during the render.</summary>
        public bool ForcePostProcessing = true;

        RenderTexture m_SceneRT;
        RenderTexture m_UiRT;
        Texture2D m_UiOverBlack;
        Texture2D m_UiOverWhite;
        Camera m_UiCamera;

        readonly List<Canvas> m_Canvases = new List<Canvas>();
        readonly List<Camera> m_PrevWorldCameras = new List<Camera>();
        readonly List<float> m_PrevPlaneDistances = new List<float>();
        readonly List<float> m_PrevScaleFactors = new List<float>();

        const int LinearLutSize = 4096;
        static float[] s_SrgbToLinear;
        static byte[] s_LinearToSrgb;

        public Screen05FrameGrabber(int width, int height)
        {
            Width = Mathf.Clamp(width, 16, 8192);
            Height = Mathf.Clamp(height, 16, 8192);
            m_SceneRT = CreateTarget("Screen05Capture_Scene");
            Frame = CreateReadback("Screen05Capture_Frame");
        }

        /// <summary>Renders cam (+ HUD) into Frame. Returns null on success, otherwise an error message.</summary>
        public string Grab(Camera cam, bool includeHud)
        {
            LastHudCanvasCount = 0;
            if (Frame == null) return "grabber was disposed";
            if (cam == null) return "no camera to capture (Camera.main is null)";

            UniversalAdditionalCameraData cameraData = null;
            bool restorePost = false;
            if (ForcePostProcessing && cam.TryGetComponent(out cameraData) && !cameraData.renderPostProcessing)
            {
                cameraData.renderPostProcessing = true;
                restorePost = true;
            }

            try
            {
                cam.aspect = (float)Width / Height;
                RenderCamera(cam, m_SceneRT);
            }
            finally
            {
                cam.ResetAspect();
                if (restorePost && cameraData != null) cameraData.renderPostProcessing = false;
            }

            ReadInto(m_SceneRT, Frame);
            ForceOpaque(Frame);
            if (includeHud) GrabHud();
            return null;
        }

        /// <summary>URP may leave any value in the alpha channel; PNG / H.264 frames must be fully opaque.</summary>
        static void ForceOpaque(Texture2D texture)
        {
            NativeArray<Color32> data = texture.GetRawTextureData<Color32>();
            for (int i = 0; i < data.Length; i++)
            {
                Color32 c = data[i];
                if (c.a == 255) continue;
                c.a = 255;
                data[i] = c;
            }
        }

        /// <summary>Writes Frame as a PNG (creates the folder).</summary>
        public void SavePng(string absolutePath)
        {
            Screen05CaptureUtil.EnsureParentFolder(absolutePath);
            File.WriteAllBytes(absolutePath, Frame.EncodeToPNG());
        }

        /// <summary>Flips Frame upside down in place (only needed if a video player shows the clip upside down).</summary>
        public void FlipVertical()
        {
            NativeArray<Color32> data = Frame.GetRawTextureData<Color32>();
            for (int y = 0; y < Height / 2; y++)
            {
                int a = y * Width;
                int b = (Height - 1 - y) * Width;
                for (int x = 0; x < Width; x++)
                {
                    Color32 t = data[a + x];
                    data[a + x] = data[b + x];
                    data[b + x] = t;
                }
            }
        }

        public void Dispose()
        {
            if (m_UiCamera != null)
            {
                m_UiCamera.targetTexture = null;
                UnityEngine.Object.DestroyImmediate(m_UiCamera.gameObject);
                m_UiCamera = null;
            }
            ReleaseTarget(ref m_SceneRT);
            ReleaseTarget(ref m_UiRT);
            DestroyTexture(m_UiOverBlack);
            DestroyTexture(m_UiOverWhite);
            DestroyTexture(Frame);
            m_UiOverBlack = null;
            m_UiOverWhite = null;
            Frame = null;
        }

        // ---------------------------------------------------------------------------------------------

        /// <summary>Renders cam into rt through the SRP render-request API (full camera stack, post-processing).</summary>
        public static void RenderCamera(Camera cam, RenderTexture rt)
        {
            var request = new RenderPipeline.StandardRequest();
            if (GraphicsSettings.currentRenderPipeline != null && RenderPipeline.SupportsRenderRequest(cam, request))
            {
                request.destination = rt;
                RenderPipeline.SubmitRenderRequest(cam, request);
                return;
            }

            RenderTexture previous = cam.targetTexture;
            cam.targetTexture = rt;
            try { cam.Render(); }
            finally { cam.targetTexture = previous; }
        }

        static void ReadInto(RenderTexture rt, Texture2D texture)
        {
            RenderTexture previous = RenderTexture.active;
            RenderTexture.active = rt;
            texture.ReadPixels(new Rect(0, 0, rt.width, rt.height), 0, 0, false);
            RenderTexture.active = previous;
        }

        RenderTexture CreateTarget(string name)
        {
            var rt = new RenderTexture(Width, Height, 24, RenderTextureFormat.ARGB32, RenderTextureReadWrite.sRGB)
            {
                name = name,
                antiAliasing = 1,
                hideFlags = HideFlags.HideAndDontSave,
            };
            rt.Create();
            return rt;
        }

        Texture2D CreateReadback(string name)
        {
            return new Texture2D(Width, Height, TextureFormat.RGBA32, false, false)
            {
                name = name,
                hideFlags = HideFlags.HideAndDontSave,
            };
        }

        static void ReleaseTarget(ref RenderTexture rt)
        {
            if (rt == null) return;
            if (RenderTexture.active == rt) RenderTexture.active = null;
            rt.Release();
            UnityEngine.Object.DestroyImmediate(rt);
            rt = null;
        }

        static void DestroyTexture(Texture2D texture)
        {
            if (texture != null) UnityEngine.Object.DestroyImmediate(texture);
        }

        // ---- HUD pass ---------------------------------------------------------------------------------

        void GrabHud()
        {
            m_Canvases.Clear();
            m_PrevWorldCameras.Clear();
            m_PrevPlaneDistances.Clear();
            m_PrevScaleFactors.Clear();

            int layerMask = 0;
            Canvas[] canvases = UnityEngine.Object.FindObjectsByType<Canvas>(FindObjectsSortMode.None);
            foreach (Canvas canvas in canvases)
            {
                if (canvas == null || !canvas.isActiveAndEnabled || !canvas.isRootCanvas) continue;
                if (canvas.renderMode != RenderMode.ScreenSpaceOverlay) continue;
                m_Canvases.Add(canvas);
                m_PrevWorldCameras.Add(canvas.worldCamera);
                m_PrevPlaneDistances.Add(canvas.planeDistance);
                m_PrevScaleFactors.Add(canvas.scaleFactor);
                layerMask |= 1 << canvas.gameObject.layer;
            }

            LastHudCanvasCount = m_Canvases.Count;
            if (m_Canvases.Count == 0) return;

            EnsureUiResources();
            m_UiCamera.cullingMask = layerMask;

            try
            {
                for (int i = 0; i < m_Canvases.Count; i++)
                {
                    Canvas canvas = m_Canvases[i];
                    float scale = ScaleFactorFor(canvas, Width, Height);
                    canvas.renderMode = RenderMode.ScreenSpaceCamera;
                    canvas.worldCamera = m_UiCamera;
                    canvas.planeDistance = 1f;
                    canvas.scaleFactor = scale;
                }
                Canvas.ForceUpdateCanvases();

                m_UiCamera.backgroundColor = new Color(0f, 0f, 0f, 0f);
                RenderCamera(m_UiCamera, m_UiRT);
                ReadInto(m_UiRT, m_UiOverBlack);

                m_UiCamera.backgroundColor = new Color(1f, 1f, 1f, 0f);
                RenderCamera(m_UiCamera, m_UiRT);
                ReadInto(m_UiRT, m_UiOverWhite);
            }
            finally
            {
                for (int i = 0; i < m_Canvases.Count; i++)
                {
                    Canvas canvas = m_Canvases[i];
                    if (canvas == null) continue;
                    canvas.renderMode = RenderMode.ScreenSpaceOverlay;
                    canvas.worldCamera = m_PrevWorldCameras[i];
                    canvas.planeDistance = m_PrevPlaneDistances[i];
                    canvas.scaleFactor = m_PrevScaleFactors[i];
                }
                Canvas.ForceUpdateCanvases();
            }

            CompositeHud();
        }

        void EnsureUiResources()
        {
            if (m_UiRT == null) m_UiRT = CreateTarget("Screen05Capture_HUD");
            if (m_UiOverBlack == null) m_UiOverBlack = CreateReadback("Screen05Capture_HUD_OverBlack");
            if (m_UiOverWhite == null) m_UiOverWhite = CreateReadback("Screen05Capture_HUD_OverWhite");
            if (m_UiCamera != null) return;

            var go = new GameObject("Screen05Capture_HUDCamera") { hideFlags = HideFlags.HideAndDontSave };
            go.transform.SetPositionAndRotation(new Vector3(0f, -10000f, 0f), Quaternion.identity);
            m_UiCamera = go.AddComponent<Camera>();
            m_UiCamera.enabled = false;
            m_UiCamera.clearFlags = CameraClearFlags.SolidColor;
            m_UiCamera.orthographic = true;
            m_UiCamera.orthographicSize = 1f;
            m_UiCamera.nearClipPlane = 0.01f;
            m_UiCamera.farClipPlane = 10f;
            m_UiCamera.allowHDR = false;
            m_UiCamera.allowMSAA = false;
            m_UiCamera.useOcclusionCulling = false;
            // Keep the target assigned permanently: a Screen Space - Camera canvas takes its size from the camera's
            // pixel rect, which must be Width x Height when the canvases are laid out.
            m_UiCamera.targetTexture = m_UiRT;

            UniversalAdditionalCameraData data = m_UiCamera.GetUniversalAdditionalCameraData();
            data.renderPostProcessing = false;
            data.antialiasing = AntialiasingMode.None;
            data.renderShadows = false;
            data.requiresColorOption = CameraOverrideOption.Off;
            data.requiresDepthOption = CameraOverrideOption.Off;
        }

        /// <summary>The CanvasScaler formula (uGUI 2.0 CanvasScaler.Handle*) evaluated for a w x h target.</summary>
        static float ScaleFactorFor(Canvas canvas, int w, int h)
        {
            CanvasScaler scaler = canvas.GetComponent<CanvasScaler>();
            if (scaler == null || !scaler.enabled) return canvas.scaleFactor;

            switch (scaler.uiScaleMode)
            {
                case CanvasScaler.ScaleMode.ScaleWithScreenSize:
                {
                    Vector2 reference = scaler.referenceResolution;
                    if (reference.x <= 0f || reference.y <= 0f) return canvas.scaleFactor;
                    switch (scaler.screenMatchMode)
                    {
                        case CanvasScaler.ScreenMatchMode.Expand:
                            return Mathf.Min(w / reference.x, h / reference.y);
                        case CanvasScaler.ScreenMatchMode.Shrink:
                            return Mathf.Max(w / reference.x, h / reference.y);
                        default:
                            float logWidth = Mathf.Log(w / reference.x, 2f);
                            float logHeight = Mathf.Log(h / reference.y, 2f);
                            return Mathf.Pow(2f, Mathf.Lerp(logWidth, logHeight, scaler.matchWidthOrHeight));
                    }
                }
                case CanvasScaler.ScaleMode.ConstantPixelSize:
                    return scaler.scaleFactor;
                default:
                    return canvas.scaleFactor;
            }
        }

        static void EnsureLuts()
        {
            if (s_SrgbToLinear != null) return;
            s_SrgbToLinear = new float[256];
            for (int i = 0; i < 256; i++) s_SrgbToLinear[i] = Mathf.GammaToLinearSpace(i / 255f);
            s_LinearToSrgb = new byte[LinearLutSize + 1];
            for (int i = 0; i <= LinearLutSize; i++)
                s_LinearToSrgb[i] = (byte)Mathf.Clamp(Mathf.RoundToInt(Mathf.LinearToGammaSpace(i / (float)LinearLutSize) * 255f), 0, 255);
        }

        static byte EncodeLinear(float v)
        {
            int index = (int)(v * LinearLutSize + 0.5f);
            if (index < 0) index = 0;
            else if (index > LinearLutSize) index = LinearLutSize;
            return s_LinearToSrgb[index];
        }

        /// <summary>out = HUDoverBlack + scene * (1 - coverage), coverage = 1 - (HUDoverWhite - HUDoverBlack).</summary>
        void CompositeHud()
        {
            EnsureLuts();
            bool linear = QualitySettings.activeColorSpace == ColorSpace.Linear;
            NativeArray<Color32> scene = Frame.GetRawTextureData<Color32>();
            NativeArray<Color32> overBlack = m_UiOverBlack.GetRawTextureData<Color32>();
            NativeArray<Color32> overWhite = m_UiOverWhite.GetRawTextureData<Color32>();
            int count = Mathf.Min(scene.Length, Mathf.Min(overBlack.Length, overWhite.Length));

            for (int i = 0; i < count; i++)
            {
                Color32 b = overBlack[i];
                Color32 w = overWhite[i];
                if (b.r == 0 && b.g == 0 && b.b == 0 && w.r == 255 && w.g == 255 && w.b == 255) continue; // no HUD here

                Color32 d = scene[i];
                if (linear)
                {
                    float br = s_SrgbToLinear[b.r], bg = s_SrgbToLinear[b.g], bb = s_SrgbToLinear[b.b];
                    float transmit = ((s_SrgbToLinear[w.r] - br) + (s_SrgbToLinear[w.g] - bg) + (s_SrgbToLinear[w.b] - bb)) / 3f;
                    transmit = Mathf.Clamp01(transmit);
                    d.r = EncodeLinear(br + s_SrgbToLinear[d.r] * transmit);
                    d.g = EncodeLinear(bg + s_SrgbToLinear[d.g] * transmit);
                    d.b = EncodeLinear(bb + s_SrgbToLinear[d.b] * transmit);
                }
                else
                {
                    float transmit = Mathf.Clamp01(((w.r - b.r) + (w.g - b.g) + (w.b - b.b)) / (3f * 255f));
                    d.r = (byte)Mathf.Clamp(Mathf.RoundToInt(b.r + d.r * transmit), 0, 255);
                    d.g = (byte)Mathf.Clamp(Mathf.RoundToInt(b.g + d.g * transmit), 0, 255);
                    d.b = (byte)Mathf.Clamp(Mathf.RoundToInt(b.b + d.b * transmit), 0, 255);
                }
                d.a = 255;
                scene[i] = d;
            }
        }
    }
}
