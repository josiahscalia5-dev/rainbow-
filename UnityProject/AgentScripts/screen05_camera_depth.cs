// Reports and turns on the main camera's Depth Texture (bubbles / spray soft edges read the scene depth).
var cam = Camera.main;
var d = UnityEngine.Rendering.Universal.CameraExtensions.GetUniversalAdditionalCameraData(cam);
string before = "depthOption=" + d.requiresDepthOption + " opaqueOption=" + d.requiresColorOption + " postFX=" + d.renderPostProcessing;
d.requiresDepthOption = UnityEngine.Rendering.Universal.CameraOverrideOption.On;
EditorUtility.SetDirty(d);
return before + " -> depthOption=" + d.requiresDepthOption + "; " + Rainbow.Screen05.EditorTools.Screen05Capture.CaptureStill(null, 864, 1536);
