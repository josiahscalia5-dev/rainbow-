// Read-only Editor state check (coordinator, 2026-11-24): play / pause / compile state, open scene and whether it is dirty.
// Changes nothing.
var scene = UnityEngine.SceneManagement.SceneManager.GetActiveScene();
return "playing=" + EditorApplication.isPlaying + " paused=" + EditorApplication.isPaused + " compiling=" + EditorApplication.isCompiling +
       " scene=" + scene.path + " dirty=" + scene.isDirty + " roots=" + scene.rootCount;
