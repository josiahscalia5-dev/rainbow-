using System;
using System.Globalization;
using System.IO;
using UnityEngine;

namespace Rainbow.Screen05.EditorTools
{
    /// <summary>Paths, timestamps and JSON helpers shared by the Screen 05 capture tools.</summary>
    public static class Screen05CaptureUtil
    {
        /// <summary>Default output folder, relative to the project root. "UnityProject/Recordings/" is already git-ignored.</summary>
        public const string DefaultFolder = "Recordings/Screen05";

        /// <summary>Benny body radius from CONTRACT.md (used for the hard-left / hard-right lateral limits).</summary>
        public const float BennyRadius = 0.8f;

        /// <summary>Absolute path of the Unity project (the folder that contains Assets/).</summary>
        public static string ProjectRoot => Path.GetFullPath(Path.Combine(Application.dataPath, ".."));

        /// <summary>The approved reference image: C:\RainbowUnity\references\05_flow_into_the_current.png (sibling of the project).</summary>
        public static string ReferencePngPath =>
            Path.GetFullPath(Path.Combine(ProjectRoot, "..", "references", "05_flow_into_the_current.png"));

        /// <summary>Absolute path: rooted paths are kept, relative ones resolve against the project root.</summary>
        public static string ResolvePath(string path)
        {
            if (string.IsNullOrEmpty(path)) path = DefaultFolder;
            path = path.Replace('/', Path.DirectorySeparatorChar);
            return Path.IsPathRooted(path)
                ? Path.GetFullPath(path)
                : Path.GetFullPath(Path.Combine(ProjectRoot, path));
        }

        public static void EnsureParentFolder(string filePath)
        {
            string folder = Path.GetDirectoryName(filePath);
            if (!string.IsNullOrEmpty(folder)) Directory.CreateDirectory(folder);
        }

        /// <summary>Returns path unchanged if no file exists there, else path with _2, _3 ... (never overwrites).</summary>
        public static string UniquePath(string path)
        {
            if (!File.Exists(path)) return path;
            string folder = Path.GetDirectoryName(path) ?? "";
            string name = Path.GetFileNameWithoutExtension(path);
            string ext = Path.GetExtension(path);
            for (int i = 2; i < 10000; i++)
            {
                string candidate = Path.Combine(folder, name + "_" + i + ext);
                if (!File.Exists(candidate)) return candidate;
            }
            return Path.Combine(folder, name + "_" + Timestamp() + ext);
        }

        public static string Timestamp() => DateTime.Now.ToString("yyyyMMdd_HHmmss", CultureInfo.InvariantCulture);

        public static string UtcNow() => DateTime.UtcNow.ToString("o", CultureInfo.InvariantCulture);

        public static void WriteJson(string path, object data)
        {
            EnsureParentFolder(path);
            File.WriteAllText(path, JsonUtility.ToJson(data, true));
        }

        public static string F(float v) => v.ToString("0.###", CultureInfo.InvariantCulture);
    }
}
