// Safe pause before closing the Editor (coordinator, 2026-11-23): leaves Play mode if needed (run twice: the exit
// happens on the next Editor update), then saves dirty assets and the open scene. Never builds or deletes anything.
var log = new System.Text.StringBuilder();
log.AppendLine("playing=" + EditorApplication.isPlaying + " paused=" + EditorApplication.isPaused + " compiling=" + EditorApplication.isCompiling);
if (EditorApplication.isPlaying)
{
    EditorApplication.isPaused = false;
    EditorApplication.isPlaying = false;
    log.AppendLine("requested exit from Play mode - run this script again to save");
    return log.ToString();
}
AssetDatabase.SaveAssets();
var scene = UnityEngine.SceneManagement.SceneManager.GetActiveScene();
log.AppendLine("scene=" + scene.path + " dirty=" + scene.isDirty);
if (scene.isDirty) log.AppendLine("saved scene: " + UnityEditor.SceneManagement.EditorSceneManager.SaveOpenScenes());
log.AppendLine("assets saved");
return log.ToString();
