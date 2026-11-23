// Lets bubbles show closer to the camera (approved image has big bubbles near the bottom corners).
var m = AssetDatabase.LoadAssetAtPath<Material>("Assets/Rainbow/Water/Materials/RainbowBubble05.mat");
m.SetFloat("_NearFade", 1.5f);
m.SetFloat("_Intensity", 1.4f);
EditorUtility.SetDirty(m); AssetDatabase.SaveAssets();
return "bubble near fade 1.5, intensity 1.4";
