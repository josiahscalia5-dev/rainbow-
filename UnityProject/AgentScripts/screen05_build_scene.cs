// Builds and saves Assets/Rainbow/Scenes/Screen05.unity from the specialists' builders (coordinator's Screen05SceneBuilder).
// Returns one line per builder (OK / MISSING / FAILED). Changes the scene and assets - coordinator only.
// unity command script eval --project-path C:\RainbowUnity\UnityProject --timeout 600 -- --file AgentScripts/screen05_build_scene.cs --timeout 600
return Rainbow.Screen05.EditorTools.Screen05SceneBuilder.Build();
