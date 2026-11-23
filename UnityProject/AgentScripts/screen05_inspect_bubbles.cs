// READ-ONLY (Play mode). Reports the bubble field's live state: renderer, material, render queue, mesh and a sample of
// bubble positions / alpha in view space, to explain why bubbles are (not) visible.
var bf = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.BubbleField>();
if (bf == null) return "no BubbleField in the scene";
var sb = new System.Text.StringBuilder();
var mr = bf.GetComponent<MeshRenderer>();
var mf = bf.GetComponent<MeshFilter>();
sb.AppendLine("go active=" + bf.gameObject.activeInHierarchy + " enabled=" + bf.enabled + " layer=" + LayerMask.LayerToName(bf.gameObject.layer)
    + " renderer=" + (mr != null && mr.enabled) + " visible=" + (mr != null && mr.isVisible) + " pos=" + bf.transform.position);
if (mr != null && mr.sharedMaterial != null)
    sb.AppendLine("material=" + mr.sharedMaterial.name + " shader=" + mr.sharedMaterial.shader.name + " supported=" + mr.sharedMaterial.shader.isSupported + " queue=" + mr.sharedMaterial.renderQueue + " passes=" + mr.sharedMaterial.passCount);
var mesh = mf != null ? mf.sharedMesh : null;
sb.AppendLine("mesh=" + (mesh != null ? mesh.name + " verts=" + mesh.vertexCount : "none"));
var cam = Camera.main;
sb.AppendLine("camera=" + cam.transform.position + " cullingMask has layer=" + ((cam.cullingMask & (1 << bf.gameObject.layer)) != 0) + " far=" + cam.farClipPlane);
if (mesh != null)
{
    var v = mesh.vertices; var c = mesh.colors32; var uv = new System.Collections.Generic.List<Vector4>(); mesh.GetUVs(0, uv);
    int shown = 0, inView = 0, visibleAlpha = 0;
    for (int i = 0; i < v.Length; i += 4)
    {
        var w = bf.transform.TransformPoint(v[i]);
        var vp = cam.WorldToViewportPoint(w);
        bool iv = vp.z > 0 && vp.x > 0 && vp.x < 1 && vp.y > 0 && vp.y < 1;
        if (iv) inView++;
        if (c[i].a > 10) visibleAlpha++;
        if (shown < 12) { sb.AppendLine("  bubble " + (i / 4) + " world=" + w.ToString("0.00") + " r=" + uv[i].z.ToString("0.00") + " alpha=" + c[i].a + " viewport=" + vp.ToString("0.00")); shown++; }
    }
    sb.AppendLine("bubbles=" + (v.Length / 4) + " inView=" + inView + " alpha>10=" + visibleAlpha);
}
return sb.ToString();
