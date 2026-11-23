using System;
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEditor.Media;
using UnityEngine;

namespace Rainbow.Screen05.EditorTools
{
    /// <summary>
    /// Deterministic gameplay recording (Play mode): teleports Benny to the approved start (RiverPath.StartS on the
    /// coin line), enables Screen05Autopilot, sets Time.captureFramerate = fps (game time advances exactly 1/fps per
    /// frame, so the clip is smooth even on a slow laptop or an unfocused Editor), and in every player frame - after
    /// all LateUpdates, via Screen05CaptureFrameHook - renders Camera.main at Width x Height (URP post on, HUD
    /// composited), reads it into an RGBA32 Texture2D and appends it to UnityEditor.Media.MediaEncoder (H.264 .mp4).
    /// When done it restores Time.captureFramerate, hands input back and writes a JSON log next to the clip
    /// (coins collected, jumps, min/max lateral x, rings passed ...) plus PNGs of the first and last frame.
    /// </summary>
    public sealed class Screen05GameplayRecorder
    {
        public static Screen05GameplayRecorder Active { get; private set; }

        const double StallSeconds = 60.0;

        readonly string m_Mp4Path;
        readonly int m_Fps;
        readonly int m_TotalFrames;
        readonly bool m_Hud;
        readonly bool m_Flip;
        readonly bool m_TeleportToStart;
        readonly Screen05FrameGrabber m_Grabber;
        readonly Screen05RecordingLog m_Log = new Screen05RecordingLog();

        MediaEncoder m_Encoder;
        GameObject m_HookObject;
        Screen05Autopilot m_Autopilot;
        bool m_CreatedAutopilot;
        bool m_AutopilotWasEnabled;
        int m_PrevCaptureFramerate;
        int m_Written;
        double m_StartTime;
        double m_LastProgressTime;
        List<float> m_RingZs = new List<float>();

        Screen05GameplayRecorder(string mp4Path, int fps, int totalFrames, int width, int height, bool hud, bool flip, bool teleport)
        {
            m_Mp4Path = mp4Path;
            m_Fps = fps;
            m_TotalFrames = totalFrames;
            m_Hud = hud;
            m_Flip = flip;
            m_TeleportToStart = teleport;
            m_PrevCaptureFramerate = Time.captureFramerate;
            m_Grabber = new Screen05FrameGrabber(width, height);
        }

        public static string Start(string mp4Path, float seconds, int fps, int width, int height, bool includeHud, bool flipVertical, bool teleportToStart)
        {
            if (!EditorApplication.isPlaying)
                return "ERROR: RecordGameplay needs Play mode (unity command editor.playmode start).";
            if (Screen05Capture.IsBusy)
                return "ERROR: another capture is running: " + Screen05Capture.Status;
            if (Screen05Capture.FindCaptureCamera() == null)
                return "ERROR: no camera (Camera.main is null).";

            fps = Mathf.Clamp(fps, 1, 120);
            seconds = Mathf.Clamp(seconds, 0.5f, 600f);
            width = Mathf.Max(16, width & ~1);   // H.264 needs even sizes
            height = Mathf.Max(16, height & ~1);
            int totalFrames = Mathf.Max(1, Mathf.RoundToInt(seconds * fps));

            string path = Screen05CaptureUtil.ResolvePath(string.IsNullOrEmpty(mp4Path)
                ? Screen05CaptureUtil.DefaultFolder + "/gameplay_" + Screen05CaptureUtil.Timestamp() + ".mp4"
                : mp4Path);
            if (!path.EndsWith(".mp4", StringComparison.OrdinalIgnoreCase)) path += ".mp4";
            Screen05CaptureUtil.EnsureParentFolder(path);
            path = Screen05CaptureUtil.UniquePath(path);

            var recorder = new Screen05GameplayRecorder(path, fps, totalFrames, width, height, includeHud, flipVertical, teleportToStart);
            string error = recorder.Begin();
            if (error != null)
            {
                recorder.Cleanup();
                return "ERROR: " + error;
            }
            Active = recorder;
            Screen05Capture.Status = "busy: recording 0/" + totalFrames + " frames -> " + path;
            return "started: " + totalFrames + " frames (" + seconds + " s at " + fps + " fps, " + width + "x" + height + ") -> " + path
                + " (poll Screen05Capture.IsBusy; log = same name .json)";
        }

        string Begin()
        {
            m_StartTime = EditorApplication.timeSinceStartup;
            m_LastProgressTime = m_StartTime;
            m_Log.mp4 = m_Mp4Path;
            m_Log.width = m_Grabber.Width;
            m_Log.height = m_Grabber.Height;
            m_Log.fps = m_Fps;
            m_Log.framesPlanned = m_TotalFrames;
            m_Log.hudIncluded = m_Hud;
            m_Log.flipVertical = m_Flip;
            m_Log.startedUtc = Screen05CaptureUtil.UtcNow();
            m_Log.hooks = Screen05TestBridge.Describe();

            if (m_TeleportToStart && Screen05TestBridge.CanTeleport)
                m_Log.teleportedToStart = Screen05TestBridge.TeleportBenny(RiverPath.StartS, RiverPath.Meander(RiverPath.StartS));

            m_RingZs = FindRingPlanes();
            m_Log.ringObjectsFound = m_RingZs.Count;

            try
            {
                var video = new VideoTrackAttributes
                {
                    frameRate = new MediaRational(m_Fps),
                    width = (uint)m_Grabber.Width,
                    height = (uint)m_Grabber.Height,
                    includeAlpha = false,
                    bitRateMode = VideoBitrateMode.High,
                };
                m_Encoder = new MediaEncoder(m_Mp4Path, video);
            }
            catch (Exception e)
            {
                Debug.LogException(e);
                return "MediaEncoder could not open " + m_Mp4Path + ": " + e.Message;
            }

            m_Autopilot = UnityEngine.Object.FindAnyObjectByType<Screen05Autopilot>(FindObjectsInactive.Include);
            if (m_Autopilot == null)
            {
                var go = new GameObject("Screen05Autopilot (recording)");
                m_Autopilot = go.AddComponent<Screen05Autopilot>();   // OnEnable runs here and resets the stats
                m_CreatedAutopilot = true;
            }
            else
            {
                m_AutopilotWasEnabled = m_Autopilot.enabled && m_Autopilot.gameObject.activeInHierarchy;
                if (!m_Autopilot.gameObject.activeSelf) m_Autopilot.gameObject.SetActive(true);
                m_Autopilot.enabled = false;   // re-enable = fresh stats
                m_Autopilot.enabled = true;
            }

            m_HookObject = new GameObject("Screen05CaptureFrameHook (recording)") { hideFlags = HideFlags.HideInHierarchy };
            m_HookObject.AddComponent<Screen05CaptureFrameHook>();

            m_PrevCaptureFramerate = Time.captureFramerate;
            Time.captureFramerate = m_Fps;

            Screen05CaptureFrameHook.LateFrame += OnLateFrame;
            EditorApplication.playModeStateChanged += OnPlayModeChanged;
            EditorApplication.update += Watchdog;
            return null;
        }

        void OnLateFrame(int frame)
        {
            if (Active != this) return;
            try
            {
                Camera cam = Screen05Capture.FindCaptureCamera();
                string error = m_Grabber.Grab(cam, m_Hud);
                if (error != null)
                {
                    Finish("error: " + error);
                    return;
                }

                string basePath = Path.Combine(Path.GetDirectoryName(m_Mp4Path) ?? "", Path.GetFileNameWithoutExtension(m_Mp4Path));
                if (m_Written == 0)
                {
                    m_Log.firstFramePng = basePath + "_first.png";
                    m_Grabber.SavePng(m_Log.firstFramePng);
                }
                if (m_Written == m_TotalFrames - 1)
                {
                    m_Log.lastFramePng = basePath + "_last.png";
                    m_Grabber.SavePng(m_Log.lastFramePng);
                }

                if (m_Flip) m_Grabber.FlipVertical();
                m_Grabber.Frame.Apply(false);
                m_Encoder.AddFrame(m_Grabber.Frame);
                m_Written++;
                m_LastProgressTime = EditorApplication.timeSinceStartup;

                if (m_Written >= m_TotalFrames)
                    Finish("completed");
                else if (m_Written % m_Fps == 0)
                    Screen05Capture.Status = "busy: recording " + m_Written + "/" + m_TotalFrames + " frames -> " + m_Mp4Path;
            }
            catch (Exception e)
            {
                Debug.LogException(e);
                Finish("error: " + e.GetType().Name + ": " + e.Message);
            }
        }

        void Watchdog()
        {
            if (Active != this) return;
            if (!EditorApplication.isPlaying) { Finish("play mode stopped"); return; }
            if (EditorApplication.isPaused) { m_LastProgressTime = EditorApplication.timeSinceStartup; return; }
            if (EditorApplication.timeSinceStartup - m_LastProgressTime > StallSeconds)
                Finish("stalled: no game frame for 60 s (Editor unfocused? run: unity command editor set_auto_tick)");
        }

        void OnPlayModeChanged(PlayModeStateChange change)
        {
            if (change == PlayModeStateChange.ExitingPlayMode) Finish("play mode exited before the recording finished");
        }

        /// <summary>Stops recording, finalises the .mp4, restores the game state and writes the JSON log.</summary>
        public void Finish(string reason)
        {
            if (Active != this) return;
            Active = null;

            Screen05AutopilotStats stats = m_Autopilot != null ? m_Autopilot.Stats : null;
            Cleanup();

            m_Log.result = reason;
            m_Log.framesWritten = m_Written;
            m_Log.secondsRecorded = m_Written / (float)m_Fps;
            m_Log.finishedUtc = Screen05CaptureUtil.UtcNow();
            m_Log.wallSeconds = EditorApplication.timeSinceStartup - m_StartTime;
            if (stats != null)
            {
                m_Log.coinsCollected = stats.coinsCollected;
                m_Log.jumpsRequested = stats.jumpsRequested;
                m_Log.minLateralX = stats.minLateralX;
                m_Log.maxLateralX = stats.maxLateralX;
                m_Log.startS = stats.startS;
                m_Log.endS = stats.endS;
                m_Log.hardLeftFrames = stats.hardLeftFrames;
                m_Log.hardRightFrames = stats.hardRightFrames;
                m_Log.finishedEventFired = stats.finishedEvent;
                m_Log.ringsPassedBySpacing = RingsBySpacing(stats.startS, stats.endS);
                m_Log.ringsPassedSceneObjects = RingsFromScene(stats.startS, stats.endS);
            }
            m_Log.notes = "coinsCollected counts Screen05Events.CoinCollected while the autopilot ran. ringsPassedBySpacing assumes rings at "
                + "multiples of RiverPath.RingSpacing; ringsPassedSceneObjects counts renderers named *ring* that are thin in Z and wide in X "
                + "(0 when the rings are one combined mesh). Lateral values are Benny's world X. Check that the clip plays upright; "
                + "if not, record again with flipVertical = true.";

            string logPath = Path.ChangeExtension(m_Mp4Path, ".json");
            try { Screen05CaptureUtil.WriteJson(logPath, m_Log); }
            catch (Exception e) { Debug.LogException(e); }

            Screen05Capture.LastOutput = m_Mp4Path;
            Screen05Capture.Status = "idle: recording " + reason + " (" + m_Written + "/" + m_TotalFrames + " frames) -> " + m_Mp4Path
                + " ; log " + logPath;
            Debug.Log("[Screen05Capture] " + Screen05Capture.Status);
        }

        void Cleanup()
        {
            Screen05CaptureFrameHook.LateFrame -= OnLateFrame;
            EditorApplication.playModeStateChanged -= OnPlayModeChanged;
            EditorApplication.update -= Watchdog;
            Time.captureFramerate = m_PrevCaptureFramerate;

            if (m_Autopilot != null)
            {
                if (m_CreatedAutopilot) DestroyObject(m_Autopilot.gameObject);
                else m_Autopilot.enabled = m_AutopilotWasEnabled;
            }
            m_Autopilot = null;
            Screen05TestBridge.ReleaseOverride();

            if (m_Encoder != null)
            {
                try { m_Encoder.Dispose(); }
                catch (Exception e) { Debug.LogException(e); }
                m_Encoder = null;
            }
            if (m_HookObject != null) DestroyObject(m_HookObject);
            m_HookObject = null;
            m_Grabber.Dispose();
        }

        static void DestroyObject(GameObject go)
        {
            if (go == null) return;
            if (Application.isPlaying) UnityEngine.Object.Destroy(go);
            else UnityEngine.Object.DestroyImmediate(go);
        }

        static int RingsBySpacing(float fromS, float toS)
        {
            float spacing = RiverPath.RingSpacing;
            return Mathf.Max(0, Mathf.FloorToInt(toS / spacing) - Mathf.FloorToInt(fromS / spacing));
        }

        int RingsFromScene(float fromS, float toS)
        {
            int count = 0;
            foreach (float z in m_RingZs)
                if (z > fromS && z <= toS) count++;
            return count;
        }

        /// <summary>Z of every renderer whose name contains "ring" and that looks like a ring band (thin in Z, spans the tunnel).</summary>
        static List<float> FindRingPlanes()
        {
            var zs = new List<float>();
            Renderer[] renderers = UnityEngine.Object.FindObjectsByType<Renderer>(FindObjectsSortMode.None);
            foreach (Renderer r in renderers)
            {
                if (r == null || r.name.IndexOf("ring", StringComparison.OrdinalIgnoreCase) < 0) continue;
                Bounds b = r.bounds;
                if (b.size.z > 3f || b.size.x < 4f) continue;
                float z = Mathf.Round(b.center.z * 2f) * 0.5f;
                if (!zs.Contains(z)) zs.Add(z);
            }
            zs.Sort();
            return zs;
        }
    }
}
