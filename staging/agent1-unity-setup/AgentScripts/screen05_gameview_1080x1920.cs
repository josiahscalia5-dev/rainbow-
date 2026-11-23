// Sets the Game view to a fixed 1080x1920 portrait resolution (so the Game window, Cinemachine framing and
// `unity command capture game_view --source screen` all use the phone aspect). Changes an Editor view setting only.
// unity command script eval --project-path C:\RainbowUnity\UnityProject -- --file AgentScripts/screen05_gameview_1080x1920.cs
return Rainbow.Screen05.EditorTools.Screen05Capture.SetGameViewResolution(1080, 1920);
