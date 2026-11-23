// Waits (without blocking the Editor's main thread) until the running series / recording has finished,
// then returns Screen05Capture.Status (it names the index.json / .mp4 / log that was written).
// Give both timeouts: the CLI's before the -- fence, the eval's after it (seconds):
// unity command script eval --project-path C:\RainbowUnity\UnityProject --timeout 960 -- --file AgentScripts/screen05_wait_capture.cs --timeout 900
await Wait.Until(() => !Rainbow.Screen05.EditorTools.Screen05Capture.IsBusy, timeoutMs: 880000,
    because: "the Screen 05 capture is still running (Editor unfocused? run: unity command editor set_auto_tick)");
return Rainbow.Screen05.EditorTools.Screen05Capture.Status;
