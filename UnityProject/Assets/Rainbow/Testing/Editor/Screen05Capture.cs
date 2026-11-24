using System;
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;

namespace Rainbow.Screen05.EditorTools
{
    /// <summary>
    /// Screen 05 visual-evidence tools (Agent 1). Static entry points for `unity command script eval`
    /// plus the menu Rainbow > Capture. Relative paths resolve against the project root
    /// (C:\RainbowUnity\UnityProject); the default output folder is Recordings/Screen05 (git-ignored).
    ///
    ///   CaptureStill(png, 864, 1536)          exact-size still of Camera.main (URP post on, HUD composited), Edit or Play mode
    ///   CaptureDefaultSeries(folder)          Play mode: s = 10,14,20,28,40,55,66 on the coin line + hard left/right at s 14 and 30
    ///   CaptureSeries(folder, s[], x[])       Play mode: any (s, world x) list; x = NaN means "on the coin line"
    ///   RecordGameplay(mp4, 12, 30)           Play mode: autopilot run recorded to H.264 .mp4 + JSON log
    ///   IsBusy / Status / LastOutput          poll while a series or recording runs (they are asynchronous)
    ///   Cancel()                              stop a running series / recording (files written so far are kept)
    ///   SetGameViewResolution(1080, 1920)     fixed portrait Game view (for `unity command capture game_view --source screen`)
    ///   ToggleAutopilot()                     Play mode: switch the autopilot on/off for manual watching
    ///   Screen05SideBySide.Compose(png)       approved | capture | difference image + per-region numbers
    /// </summary>
    public static class Screen05Capture
    {
        public const int ApprovedWidth = 864;
        public const int ApprovedHeight = 1536;

        /// <summary>True while a series or a recording is running.</summary>
        public static bool IsBusy => Screen05SeriesRun.Active != null || Screen05GameplayRecorder.Active != null;

        /// <summary>Human-readable state: "idle: ..." or "busy: ...".</summary>
        public static string Status { get; internal set; } = "idle";

        /// <summary>Absolute path of the last file written (still PNG, series index.json or recording .mp4).</summary>
        public static string LastOutput { get; internal set; } = "";

        // Faster Play Mode ("Reload Scene only", no domain reload): reset both at every Play mode entry, exactly as the
        // domain reload used to (tools poll them while a series or recording runs).
        [InitializeOnEnterPlayMode]
        static void ResetStaticsOnEnterPlayMode()
        {
            Status = "idle";
            LastOutput = "";
        }

        // ---- stills -----------------------------------------------------------------------------------

        /// <summary>
        /// Renders Camera.main into a w x h RenderTexture (URP stack + post-processing) and saves a PNG, independent of
        /// the Game view's size or focus. Works in Edit and Play mode. Returns the absolute PNG path, or "ERROR: ...".
        /// pngPath null/empty = Recordings/Screen05/still_WxH_timestamp.png.
        /// </summary>
        public static string CaptureStill(string pngPath, int w = ApprovedWidth, int h = ApprovedHeight, bool includeHud = true)
        {
            string path = Screen05CaptureUtil.ResolvePath(string.IsNullOrEmpty(pngPath)
                ? Screen05CaptureUtil.DefaultFolder + "/still_" + w + "x" + h + "_" + Screen05CaptureUtil.Timestamp() + ".png"
                : pngPath);
            if (!path.EndsWith(".png", StringComparison.OrdinalIgnoreCase)) path += ".png";

            Camera cam = FindCaptureCamera();
            if (cam == null) return Error("CaptureStill: no camera (Camera.main is null - is the Screen05 scene open?)");

            using (var grabber = new Screen05FrameGrabber(w, h))
            {
                string error = grabber.Grab(cam, includeHud);
                if (error != null) return Error("CaptureStill: " + error);
                grabber.SavePng(path);
                LastOutput = path;
                if (!IsBusy) Status = "idle: still saved " + path + " (HUD canvases: " + grabber.LastHudCanvasCount + ")";
            }
            Debug.Log("[Screen05Capture] still " + w + "x" + h + " -> " + path);
            return path;
        }

        // ---- moving-view series -----------------------------------------------------------------------

        /// <summary>
        /// Play mode: for each pair TeleportTo(s, x), wait for the camera, capture a still (864x1536, HUD on) and write
        /// index.json. lateral = world X per item (null / shorter / NaN = on the coin line, RiverPath.Meander(s)).
        /// Asynchronous: returns "started: ..." at once; poll IsBusy / Status.
        /// </summary>
        public static string CaptureSeries(string folder, float[] sValues, float[] lateral)
        {
            return CaptureSeries(folder, sValues, lateral, null, ApprovedWidth, ApprovedHeight, true);
        }

        public static string CaptureSeries(string folder, float[] sValues, float[] lateral, string[] labels, int w, int h, bool includeHud)
        {
            if (string.IsNullOrEmpty(folder))
                folder = Screen05CaptureUtil.DefaultFolder + "/series_" + Screen05CaptureUtil.Timestamp();
            string result = Screen05SeriesRun.Start(folder, sValues, lateral, labels, w, h, includeHud);
            if (result.StartsWith("ERROR", StringComparison.Ordinal)) return Error(result.Substring(7));
            Debug.Log("[Screen05Capture] " + result);
            return result;
        }

        /// <summary>The user's moving-view set: s = 10, 14 (approved view), 20, 28, 40, 55, 66 on the coin line, plus hard-left and hard-right at s = 14 and s = 30.</summary>
        public static string CaptureDefaultSeries(string folder = null)
        {
            BuildDefaultSeries(out float[] s, out float[] x, out string[] labels);
            return CaptureSeries(folder, s, x, labels, ApprovedWidth, ApprovedHeight, true);
        }

        public static void BuildDefaultSeries(out float[] sValues, out float[] lateral, out string[] labels)
        {
            float hard = RiverPath.ClampLateral(100f, Screen05CaptureUtil.BennyRadius);
            var s = new List<float>();
            var x = new List<float>();
            var l = new List<string>();
            foreach (float sv in new[] { 10f, 14f, 20f, 28f, 40f, 55f, 66f })
            {
                s.Add(sv);
                x.Add(RiverPath.Meander(sv));
                l.Add(Mathf.Approximately(sv, RiverPath.StartS)
                    ? "s14_coinline_APPROVED_VIEW"
                    : "s" + Screen05CaptureUtil.F(sv) + "_coinline");
            }
            foreach (float sv in new[] { 14f, 30f })
            {
                s.Add(sv); x.Add(-hard); l.Add("s" + Screen05CaptureUtil.F(sv) + "_hard_left");
                s.Add(sv); x.Add(hard); l.Add("s" + Screen05CaptureUtil.F(sv) + "_hard_right");
            }
            sValues = s.ToArray();
            lateral = x.ToArray();
            labels = l.ToArray();
        }

        // ---- gameplay recording -----------------------------------------------------------------------

        /// <summary>
        /// Play mode: autopilot run from the approved start, recorded deterministically (Time.captureFramerate = fps) to an
        /// H.264 .mp4 at 864x1536 with a JSON log of coins / jumps / lateral range / rings. Asynchronous: returns at once.
        /// </summary>
        public static string RecordGameplay(string mp4Path, float seconds = 12f, int fps = 30)
        {
            return RecordGameplay(mp4Path, seconds, fps, ApprovedWidth, ApprovedHeight, true, false);
        }

        public static string RecordGameplay(string mp4Path, float seconds, int fps, int w, int h, bool includeHud, bool flipVertical)
        {
            string result = Screen05GameplayRecorder.Start(mp4Path, seconds, fps, w, h, includeHud, flipVertical, true);
            if (result.StartsWith("ERROR", StringComparison.Ordinal)) return Error(result.Substring(7));
            Debug.Log("[Screen05Capture] " + result);
            return result;
        }

        // ---- control ------------------------------------------------------------------------------------

        /// <summary>Stops a running series or recording (keeps what was written). Returns the new Status.</summary>
        public static string Cancel()
        {
            if (Screen05SeriesRun.Active != null) Screen05SeriesRun.Active.Finish("cancelled");
            if (Screen05GameplayRecorder.Active != null) Screen05GameplayRecorder.Active.Finish("cancelled");
            return Status;
        }

        /// <summary>Play mode: adds / toggles Screen05Autopilot so you can watch it steer. Returns the new state.</summary>
        public static string ToggleAutopilot()
        {
            if (!EditorApplication.isPlaying) return Error("ToggleAutopilot needs Play mode");
            Screen05Autopilot autopilot = UnityEngine.Object.FindAnyObjectByType<Screen05Autopilot>(FindObjectsInactive.Include);
            if (autopilot == null)
            {
                autopilot = new GameObject("Screen05Autopilot").AddComponent<Screen05Autopilot>();
                return "autopilot ON (" + Screen05TestBridge.Describe() + ")";
            }
            autopilot.enabled = !autopilot.enabled;
            return autopilot.enabled ? "autopilot ON" : "autopilot OFF (input back to keyboard / touch)";
        }

        /// <summary>Sets the Game view to a fixed w x h resolution (Unity 6 PlayModeWindow API).</summary>
        public static string SetGameViewResolution(int w = 1080, int h = 1920)
        {
            PlayModeWindow.SetCustomRenderingResolution((uint)w, (uint)h, "Rainbow " + w + "x" + h);
            PlayModeWindow.GetRenderingResolution(out uint rw, out uint rh);
            return "Game view resolution: " + rw + "x" + rh;
        }

        /// <summary>Camera.main if active, else the first enabled game camera that renders to the screen.</summary>
        public static Camera FindCaptureCamera()
        {
            Camera cam = Camera.main;
            if (cam != null && cam.isActiveAndEnabled) return cam;
            foreach (Camera c in Camera.allCameras)
                if (c != null && c.targetTexture == null && c.cameraType == CameraType.Game) return c;
            return cam;
        }

        static string Error(string message)
        {
            if (!IsBusy) Status = "idle: ERROR " + message;
            Debug.LogWarning("[Screen05Capture] " + message);
            return "ERROR: " + message;
        }

        // ---- menu: Rainbow > Capture --------------------------------------------------------------------

        [MenuItem("Rainbow/Capture/Still 864x1536 (approved size)", false, 200)]
        static void MenuStill864() => CaptureStill(null, ApprovedWidth, ApprovedHeight);

        [MenuItem("Rainbow/Capture/Still 1080x1920", false, 201)]
        static void MenuStill1080() => CaptureStill(null, 1080, 1920);

        [MenuItem("Rainbow/Capture/Side-by-side: last still vs approved", false, 202)]
        static void MenuSideBySide() => Debug.Log("[Screen05Capture] " + Screen05SideBySide.Compose(LastOutput));

        [MenuItem("Rainbow/Capture/Side-by-side: last still vs approved", true)]
        static bool MenuSideBySideValidate() => LastOutput.EndsWith(".png", StringComparison.OrdinalIgnoreCase) && File.Exists(LastOutput);

        [MenuItem("Rainbow/Capture/Moving-view Series (Play mode)", false, 220)]
        static void MenuSeries() => CaptureDefaultSeries();

        [MenuItem("Rainbow/Capture/Moving-view Series (Play mode)", true)]
        static bool MenuSeriesValidate() => EditorApplication.isPlaying && !IsBusy;

        [MenuItem("Rainbow/Capture/Record Gameplay 12 s (Play mode)", false, 221)]
        static void MenuRecord() => RecordGameplay(null);

        [MenuItem("Rainbow/Capture/Record Gameplay 12 s (Play mode)", true)]
        static bool MenuRecordValidate() => EditorApplication.isPlaying && !IsBusy;

        [MenuItem("Rainbow/Capture/Toggle Autopilot (Play mode)", false, 222)]
        static void MenuAutopilot() => Debug.Log("[Screen05Capture] " + ToggleAutopilot());

        [MenuItem("Rainbow/Capture/Toggle Autopilot (Play mode)", true)]
        static bool MenuAutopilotValidate() => EditorApplication.isPlaying && !IsBusy;

        [MenuItem("Rainbow/Capture/Cancel running capture", false, 240)]
        static void MenuCancel() => Debug.Log("[Screen05Capture] " + Cancel());

        [MenuItem("Rainbow/Capture/Cancel running capture", true)]
        static bool MenuCancelValidate() => IsBusy;

        [MenuItem("Rainbow/Capture/Set Game View 1080x1920", false, 260)]
        static void MenuGameView1080() => Debug.Log("[Screen05Capture] " + SetGameViewResolution(1080, 1920));

        [MenuItem("Rainbow/Capture/Set Game View 864x1536", false, 261)]
        static void MenuGameView864() => Debug.Log("[Screen05Capture] " + SetGameViewResolution(ApprovedWidth, ApprovedHeight));

        [MenuItem("Rainbow/Capture/Open output folder", false, 280)]
        static void MenuOpenFolder()
        {
            string folder = Screen05CaptureUtil.ResolvePath(Screen05CaptureUtil.DefaultFolder);
            Directory.CreateDirectory(folder);
            EditorUtility.RevealInFinder(folder);
        }
    }
}
