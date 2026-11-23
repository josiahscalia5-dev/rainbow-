using System;
using System.Linq;
using System.Reflection;
using System.Text;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace Rainbow.Screen05.EditorTools
{
    /// <summary>
    /// Coordinator-owned: assembles the playable Screen 05 scene from the specialists' builders
    /// (EnvironmentBuilder → WaterBuilder → GameplayBuilder; see staging/shared/CONTRACT.md).
    /// Builders are found by reflection, so this file compiles even while a builder is missing.
    /// </summary>
    public static class Screen05SceneBuilder
    {
        public const string ScenePath = "Assets/Rainbow/Scenes/Screen05.unity";
        static readonly string[] BuilderNames = { "EnvironmentBuilder", "WaterBuilder", "GameplayBuilder" };

        [MenuItem("Rainbow/Build Screen 05 Scene")]
        static void BuildMenu() => Build();

        /// <summary>Builds and saves the scene; returns a short report (one line per builder).</summary>
        public static string Build()
        {
            var report = new StringBuilder();
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            var root = new GameObject("Screen05").transform;

            foreach (var name in BuilderNames)
            {
                var type = FindType("Rainbow.Screen05.EditorTools." + name);
                var build = type?.GetMethod("Build", BindingFlags.Public | BindingFlags.Static, null,
                    new[] { typeof(Transform) }, null);
                if (build == null) { report.AppendLine(name + ": MISSING"); continue; }
                try
                {
                    var go = build.Invoke(null, new object[] { root }) as GameObject;
                    report.AppendLine(name + ": OK -> " + (go != null ? go.name : "(no root returned)"));
                }
                catch (TargetInvocationException e)
                {
                    report.AppendLine(name + ": FAILED " + e.InnerException?.GetType().Name + ": " + e.InnerException?.Message);
                    Debug.LogException(e.InnerException ?? e);
                }
            }

            System.IO.Directory.CreateDirectory("Assets/Rainbow/Scenes");
            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };

            PlayerSettings.productName = "Rainbow";
            PlayerSettings.defaultInterfaceOrientation = UIOrientation.Portrait;
            PlayerSettings.runInBackground = true;
            AssetDatabase.SaveAssets();

            Debug.Log("[Screen05SceneBuilder]\n" + report);
            return report.ToString();
        }

        static Type FindType(string fullName) =>
            AppDomain.CurrentDomain.GetAssemblies()
                .Select(a => a.GetType(fullName, false))
                .FirstOrDefault(t => t != null);
    }
}
