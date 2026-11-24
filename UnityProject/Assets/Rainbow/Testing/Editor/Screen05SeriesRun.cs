using System;
using System.IO;
using UnityEditor;
using UnityEngine;

namespace Rainbow.Screen05.EditorTools
{
    /// <summary>
    /// Moving-view still series (Play mode). For each (s, x): BennyController.Instance.TeleportTo(s - lead, x),
    /// let the game run SettleFrames frames (camera, wake and swim animation settle), capture an exact-size still,
    /// record where Benny and the camera really were. Driven frame by frame from EditorApplication.update - no
    /// blocking loops. "lead" compensates the distance Benny swims during the settle frames (measured on a
    /// warm-up teleport, then after every shot), so the still is taken close to the requested s.
    /// Input is held neutral (SwimInputOverride.Active = true, Steer = 0) and Time.captureFramerate is fixed
    /// during the series so the settle time is identical on a slow laptop.
    /// </summary>
    public sealed class Screen05SeriesRun
    {
        public static Screen05SeriesRun Active { get; private set; }

        // Faster Play Mode ("Reload Scene only", no domain reload): the domain reload used to drop a series left over
        // from an earlier Play session. Finish() normally clears it when Play mode exits; this is only the safety net.
        [InitializeOnEnterPlayMode]
        static void ResetStaticsOnEnterPlayMode()
        {
            Screen05SeriesRun stale = Active;
            Active = null;
            if (stale == null) return;
            EditorApplication.update -= stale.Tick;
            EditorApplication.playModeStateChanged -= stale.OnPlayModeChanged;
        }

        public const int SettleFrames = 10;
        public const int CaptureFramerate = 30;
        const double StallSeconds = 60.0;

        readonly string m_Folder;
        readonly float[] m_S;
        readonly float[] m_X;
        readonly string[] m_Labels;
        readonly bool m_Hud;
        readonly Screen05FrameGrabber m_Grabber;
        readonly Screen05CaptureIndex m_Index = new Screen05CaptureIndex();

        int m_Item = -1;          // -1 = warm-up teleport (measures the lead, no still)
        int m_Phase;              // 0 teleport, 1 settle, 2 capture
        int m_SettleUntilFrame;
        float m_Lead;
        float m_TeleportS;
        int m_PrevCaptureFramerate;
        Screen05Autopilot m_PausedAutopilot;
        int m_LastFrameSeen = -1;
        double m_LastProgressTime;

        Screen05SeriesRun(string folder, float[] s, float[] x, string[] labels, int width, int height, bool hud)
        {
            m_Folder = folder;
            m_S = s;
            m_X = x;
            m_Labels = labels;
            m_Hud = hud;
            m_Grabber = new Screen05FrameGrabber(width, height);
        }

        public static string Start(string folder, float[] s, float[] x, string[] labels, int width, int height, bool includeHud)
        {
            if (!EditorApplication.isPlaying)
                return "ERROR: CaptureSeries needs Play mode (unity command editor.playmode start).";
            if (Screen05Capture.IsBusy)
                return "ERROR: another capture is running: " + Screen05Capture.Status;
            if (s == null || s.Length == 0)
                return "ERROR: no s values given.";
            if (!Screen05TestBridge.CanTeleport)
                return "ERROR: BennyController.Instance / TeleportTo(float,float) not available - " + Screen05TestBridge.Describe();
            if (Screen05Capture.FindCaptureCamera() == null)
                return "ERROR: no camera (Camera.main is null).";

            string absoluteFolder = Screen05CaptureUtil.ResolvePath(folder);
            Directory.CreateDirectory(absoluteFolder);

            var run = new Screen05SeriesRun(absoluteFolder, s, x, labels, width, height, includeHud);
            Active = run;
            run.Begin();
            return "started: " + s.Length + " stills -> " + absoluteFolder + " (index.json when done; poll Screen05Capture.IsBusy)";
        }

        void Begin()
        {
            m_Index.folder = m_Folder;
            m_Index.width = m_Grabber.Width;
            m_Index.height = m_Grabber.Height;
            m_Index.hudIncluded = m_Hud;
            m_Index.settleFrames = SettleFrames;
            m_Index.captureFramerate = CaptureFramerate;
            m_Index.startedUtc = Screen05CaptureUtil.UtcNow();
            m_Index.hooks = Screen05TestBridge.Describe();
            m_Index.notes = "x values are lateral WORLD X (CONTRACT: ClampLateral clamps world X). s = distance along the tunnel line "
                + "(= world Z). bennyWorld* / camera* are the real values at capture time. Stills are exact-size camera renders "
                + "(URP stack + post) with the Screen Space - Overlay HUD composited on top.";

            Screen05Autopilot autopilot = UnityEngine.Object.FindAnyObjectByType<Screen05Autopilot>();
            if (autopilot != null && autopilot.enabled)
            {
                autopilot.enabled = false;
                m_PausedAutopilot = autopilot;
            }

            Screen05TestBridge.SetOverride(true, 0f);
            m_PrevCaptureFramerate = Time.captureFramerate;
            Time.captureFramerate = CaptureFramerate;
            m_LastProgressTime = EditorApplication.timeSinceStartup;

            EditorApplication.update += Tick;
            EditorApplication.playModeStateChanged += OnPlayModeChanged;
            Screen05Capture.Status = "busy: series warming up (" + m_S.Length + " stills)";
        }

        void OnPlayModeChanged(PlayModeStateChange change)
        {
            if (change == PlayModeStateChange.ExitingPlayMode) Finish("play mode exited before the series finished");
        }

        void Tick()
        {
            if (Active != this) return;
            if (!EditorApplication.isPlaying) { Finish("play mode stopped"); return; }
            if (EditorApplication.isPaused) { m_LastProgressTime = EditorApplication.timeSinceStartup; return; }

            if (Time.frameCount != m_LastFrameSeen)
            {
                m_LastFrameSeen = Time.frameCount;
                m_LastProgressTime = EditorApplication.timeSinceStartup;
            }
            else if (EditorApplication.timeSinceStartup - m_LastProgressTime > StallSeconds)
            {
                Finish("stalled: Time.frameCount did not advance for 60 s (Editor unfocused? run: unity command editor set_auto_tick)");
                return;
            }

            try { Step(); }
            catch (Exception e)
            {
                Debug.LogException(e);
                Finish("error: " + e.GetType().Name + ": " + e.Message);
            }
        }

        void Step()
        {
            Screen05TestBridge.SetOverride(true, 0f);
            switch (m_Phase)
            {
                case 0:
                {
                    int index = Mathf.Max(m_Item, 0);
                    m_TeleportS = m_S[index] - (m_Item < 0 ? 0f : m_Lead);
                    if (!Screen05TestBridge.TeleportBenny(m_TeleportS, LateralAt(index)))
                    {
                        Finish("TeleportTo failed - " + Screen05TestBridge.Describe());
                        return;
                    }
                    m_SettleUntilFrame = Time.frameCount + SettleFrames;
                    m_Phase = 1;
                    break;
                }
                case 1:
                    if (Time.frameCount >= m_SettleUntilFrame) m_Phase = 2;
                    break;
                default:
                {
                    Component benny = Screen05TestBridge.GetBenny();
                    if (benny != null) m_Lead = Mathf.Clamp(benny.transform.position.z - m_TeleportS, 0f, 8f);
                    if (m_Item >= 0) CaptureItem(m_Item, benny);
                    m_Item++;
                    if (m_Item >= m_S.Length)
                    {
                        Finish("completed");
                        return;
                    }
                    m_Phase = 0;
                    Screen05Capture.Status = "busy: series " + m_Item + "/" + m_S.Length;
                    break;
                }
            }
        }

        float LateralAt(int i)
        {
            if (m_X == null || i >= m_X.Length || float.IsNaN(m_X[i])) return RiverPath.Meander(m_S[i]);
            return m_X[i];
        }

        string LabelAt(int i)
        {
            string label = m_Labels != null && i < m_Labels.Length && !string.IsNullOrEmpty(m_Labels[i])
                ? m_Labels[i]
                : "s" + Screen05CaptureUtil.F(m_S[i]) + "_x" + Screen05CaptureUtil.F(LateralAt(i));
            foreach (char c in Path.GetInvalidFileNameChars()) label = label.Replace(c, '_');
            return label;
        }

        void CaptureItem(int i, Component benny)
        {
            Camera cam = Screen05Capture.FindCaptureCamera();
            string label = LabelAt(i);
            string file = i.ToString("00") + "_" + label + ".png";

            string error = m_Grabber.Grab(cam, m_Hud);
            if (error != null)
            {
                Debug.LogWarning("[Screen05Capture] series still " + file + " failed: " + error);
                return;
            }
            m_Grabber.SavePng(Path.Combine(m_Folder, file));

            var entry = new Screen05CaptureIndexEntry
            {
                file = file,
                label = label,
                sRequested = m_S[i],
                xRequested = LateralAt(i),
                sTeleported = m_TeleportS,
                frame = Time.frameCount,
                time = Time.time,
                utc = Screen05CaptureUtil.UtcNow(),
                hudCanvases = m_Grabber.LastHudCanvasCount,
            };
            if (benny != null)
            {
                Vector3 p = benny.transform.position;
                entry.bennyWorldX = p.x;
                entry.bennyWorldY = p.y;
                entry.bennyWorldZ = p.z;
            }
            if (Screen05TestBridge.TryGetBennyState(out float controllerS, out float controllerX))
            {
                entry.hasController = true;
                entry.controllerS = controllerS;
                entry.controllerLateralX = controllerX;
            }
            if (cam != null)
            {
                entry.cameraPosition = cam.transform.position;
                entry.cameraEuler = cam.transform.eulerAngles;
                entry.cameraFieldOfView = cam.fieldOfView;
            }
            m_Index.items.Add(entry);
        }

        /// <summary>Stops the series, restores input / frame rate / autopilot and writes index.json.</summary>
        public void Finish(string reason)
        {
            if (Active != this) return;
            Active = null;
            EditorApplication.update -= Tick;
            EditorApplication.playModeStateChanged -= OnPlayModeChanged;

            Time.captureFramerate = m_PrevCaptureFramerate;
            Screen05TestBridge.ReleaseOverride();
            if (m_PausedAutopilot != null) m_PausedAutopilot.enabled = true;

            m_Index.result = reason;
            m_Index.finishedUtc = Screen05CaptureUtil.UtcNow();
            string indexPath = Path.Combine(m_Folder, "index.json");
            try { Screen05CaptureUtil.WriteJson(indexPath, m_Index); }
            catch (Exception e) { Debug.LogException(e); }
            m_Grabber.Dispose();

            Screen05Capture.LastOutput = indexPath;
            Screen05Capture.Status = "idle: series " + reason + " (" + m_Index.items.Count + "/" + m_S.Length + " stills) -> " + indexPath;
            Debug.Log("[Screen05Capture] " + Screen05Capture.Status);
        }
    }
}
