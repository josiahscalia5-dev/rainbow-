var m = AssetDatabase.LoadAssetAtPath<Material>("Assets/Rainbow/Water/Resources/RainbowSplashLace05.mat");
var t = m.GetTexture("_StrandTex") as Texture2D;
var sb = new System.Text.StringBuilder();
sb.AppendLine("shader " + m.shader.name + " tex " + (t != null ? t.name + " " + t.width + " " + t.format + " mips " + t.mipmapCount : "NULL"));
sb.AppendLine("Thread " + m.GetVector("_Thread") + " Tile " + m.GetVector("_Tile") + " Reach " + m.GetVector("_Reach") + " Shape " + m.GetVector("_Shape") + " Len " + m.GetFloat("_Len") + " H " + m.GetFloat("_Height"));
var p = "Assets/Rainbow/Water/Textures/RainbowStrands05.png";
var tex = new Texture2D(2, 2, TextureFormat.RGBA32, false, true);
tex.LoadImage(System.IO.File.ReadAllBytes(p));
var px = tex.GetPixels32();
double r = 0, g = 0, b = 0, a = 0; int rl = 0, gl = 0, al = 0;
for (int i = 0; i < px.Length; i++) { r += px[i].r; g += px[i].g; b += px[i].b; a += px[i].a; if (px[i].r < 64) rl++; if (px[i].g < 64) gl++; if (px[i].a > 25) al++; }
sb.AppendLine("mean R " + (r / px.Length).ToString("0.0") + " G " + (g / px.Length).ToString("0.0") + " B " + (b / px.Length).ToString("0.0") + " A " + (a / px.Length).ToString("0.0") + " | R<64 " + (100f * rl / px.Length).ToString("0.0") + "% G<64 " + (100f * gl / px.Length).ToString("0.0") + "% A>25 " + (100f * al / px.Length).ToString("0.0") + "%");
UnityEngine.Object.DestroyImmediate(tex);
return sb.ToString();
