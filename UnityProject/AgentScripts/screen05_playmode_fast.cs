// Coordinator: switch Enter Play Mode to "Reload Scene only" (no domain reload). Revert: screen05_playmode_reload.cs
UnityEditor.EditorSettings.enterPlayModeOptionsEnabled = true;
UnityEditor.EditorSettings.enterPlayModeOptions = UnityEditor.EnterPlayModeOptions.DisableDomainReload;
UnityEditor.AssetDatabase.SaveAssets();
return "enterPlayModeOptionsEnabled=" + UnityEditor.EditorSettings.enterPlayModeOptionsEnabled + " options=" + UnityEditor.EditorSettings.enterPlayModeOptions;
