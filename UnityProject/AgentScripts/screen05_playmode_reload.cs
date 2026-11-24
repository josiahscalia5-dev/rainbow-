// Coordinator: restore Enter Play Mode to the default "Reload Domain and Scene". Fast mode: screen05_playmode_fast.cs
UnityEditor.EditorSettings.enterPlayModeOptionsEnabled = true;
UnityEditor.EditorSettings.enterPlayModeOptions = UnityEditor.EnterPlayModeOptions.None;
UnityEditor.AssetDatabase.SaveAssets();
return "enterPlayModeOptionsEnabled=" + UnityEditor.EditorSettings.enterPlayModeOptionsEnabled + " options=" + UnityEditor.EditorSettings.enterPlayModeOptions;
