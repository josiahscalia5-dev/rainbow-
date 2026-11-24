// PLAY MODE (paused is fine). Renders Benny alone from 4 sides (behind, side, front, below) into one sheet: read-only model check.
var benny = Rainbow.Screen05.BennyController.Instance;
if (benny == null) return "no Benny";
var smr = benny.GetComponentInChildren<SkinnedMeshRenderer>();
Vector3 c = benny.visual.position + Vector3.up * 0.25f;
int w = 360, h = 400;
var rt = new RenderTexture(w, h, 24, RenderTextureFormat.ARGB32);
var sheet = new Texture2D(w * 4, h, TextureFormat.RGB24, false);
var go = new GameObject("BennyViewCam"); var cam = go.AddComponent<Camera>();
cam.clearFlags = CameraClearFlags.SolidColor; cam.backgroundColor = new Color(0.1f, 0.2f, 0.35f); cam.fieldOfView = 30f; cam.nearClipPlane = 0.1f; cam.farClipPlane = 20f;
int layer = 31, old = smr.gameObject.layer; smr.gameObject.layer = layer; cam.cullingMask = 1 << layer;
Vector3 f = benny.transform.forward, r = benny.transform.right;
Vector3[] dirs = { -f + Vector3.up * 0.25f, r, f, -f * 0.5f - Vector3.up };
for (int i = 0; i < 4; i++)
{
    cam.transform.position = c + dirs[i].normalized * 5.2f;
    cam.transform.LookAt(c, i == 3 ? f : Vector3.up);
    Rainbow.Screen05.EditorTools.Screen05FrameGrabber.RenderCamera(cam, rt);
    var prev = RenderTexture.active; RenderTexture.active = rt;
    var t = new Texture2D(w, h, TextureFormat.RGB24, false); t.ReadPixels(new Rect(0, 0, w, h), 0, 0); t.Apply();
    RenderTexture.active = prev;
    sheet.SetPixels(i * w, 0, w, h, t.GetPixels()); UnityEngine.Object.DestroyImmediate(t);
}
smr.gameObject.layer = old;
sheet.Apply();
System.IO.File.WriteAllBytes("Recordings/Screen05/work/benny_views.jpg", sheet.EncodeToJPG(88));
UnityEngine.Object.DestroyImmediate(go); rt.Release();
return "mesh bounds " + smr.sharedMesh.bounds + " verts " + smr.sharedMesh.vertexCount + " -> Recordings/Screen05/work/benny_views.jpg";
