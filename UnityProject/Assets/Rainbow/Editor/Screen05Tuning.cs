using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;

namespace Rainbow.Screen05.EditorTools
{
    /// <summary>
    /// Round 4 (2026-11-24): fitted look values that override the builders' defaults. Screen05SceneBuilder applies
    /// Assets/Rainbow/Tuning/screen05_tuning.txt at the end of every scene build, so values found by the automatic fitter
    /// (Testing/Editor/Screen05AutoFit.cs) or by hand survive a rebuild and live in git. One line per value (# = comment):
    ///   mat:Assets/..../X.mat:_Prop:f|v0..v3|c0..c3 | value       light:Name:intensity|r|g|b | value
    ///   vol:Bloom:intensity | value                                tf:Scene/Path:px|py|pz|rx|ry|rz|s | value
    /// </summary>
    public static class Screen05Tuning
    {
        public const string FilePath = "Assets/Rainbow/Tuning/screen05_tuning.txt";

        public static string Apply()
        {
            if (!File.Exists(FilePath)) return "no tuning file";
            int ok = 0; var missing = new List<string>();
            foreach (string raw in File.ReadAllLines(FilePath))
            {
                string line = raw.Trim();
                if (line.Length == 0 || line[0] == '#') continue;
                int bar = line.LastIndexOf('|'); if (bar < 0) continue;
                string key = line.Substring(0, bar).Trim();
                if (!float.TryParse(line.Substring(bar + 1).Trim(), NumberStyles.Float, CultureInfo.InvariantCulture, out float v)) continue;
                if (Set(key, v)) ok++; else missing.Add(key);
            }
            AssetDatabase.SaveAssets();
            return ok + " value(s) applied" + (missing.Count > 0 ? ", not found: " + string.Join(", ", missing) : "");
        }

        static bool Set(string key, float v)
        {
            string[] k = key.Split(':');
            switch (k[0])
            {
                case "mat":
                {
                    var m = AssetDatabase.LoadAssetAtPath<Material>(k[1]);
                    if (m == null || k.Length < 4 || !m.HasProperty(k[2])) return false;
                    if (k[3] == "f") m.SetFloat(k[2], v);
                    else if (k[3][0] == 'c') { Color c = m.GetColor(k[2]); c[k[3][1] - '0'] = v; m.SetColor(k[2], c); }
                    else { Vector4 q = m.GetVector(k[2]); q[k[3][1] - '0'] = v; m.SetVector(k[2], q); }
                    EditorUtility.SetDirty(m);
                    return true;
                }
                case "light":
                {
                    var go = GameObject.Find(k[1]); var l = go != null ? go.GetComponent<Light>() : null; if (l == null) return false;
                    if (k[2] == "intensity") l.intensity = v;
                    else { Color c = l.color; c["rgb".IndexOf(k[2], StringComparison.Ordinal)] = v; l.color = c; }
                    return true;
                }
                case "vol":
                    foreach (Volume vol in UnityEngine.Object.FindObjectsByType<Volume>(FindObjectsSortMode.None))
                    {
                        VolumeProfile prof = vol.sharedProfile; if (prof == null) continue;
                        foreach (VolumeComponent vc in prof.components)
                        {
                            if (vc.GetType().Name != k[1]) continue;
                            var f = vc.GetType().GetField(k[2]); var par = f != null ? f.GetValue(vc) as VolumeParameter<float> : null; if (par == null) continue;
                            par.overrideState = true; par.value = v; EditorUtility.SetDirty(prof); EditorUtility.SetDirty(vc);
                            return true;
                        }
                    }
                    return false;
                case "tf":
                {
                    var go = GameObject.Find(k[1]); if (go == null) return false;
                    Transform t = go.transform; string f = k[2];
                    if (f[0] == 'p') { Vector3 q = t.localPosition; q["xyz".IndexOf(f[1])] = v; t.localPosition = q; }
                    else if (f[0] == 'r') { Vector3 q = t.localEulerAngles; q["xyz".IndexOf(f[1])] = v; t.localEulerAngles = q; }
                    else t.localScale = Vector3.one * v;
                    return true;
                }
            }
            return false;
        }
    }
}
