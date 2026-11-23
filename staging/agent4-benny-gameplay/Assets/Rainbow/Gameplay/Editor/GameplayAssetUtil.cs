using System.IO;
using UnityEditor;
using UnityEngine;

namespace Rainbow.Screen05.EditorTools
{
    /// <summary>Small asset helpers for the Agent 4 builders (folders, PNG textures, meshes, materials, shaders).</summary>
    public static class GameplayAssetUtil
    {
        public static void EnsureFolder(string path)
        {
            path = path.Replace('\\', '/').TrimEnd('/');
            if (AssetDatabase.IsValidFolder(path)) return;
            int slash = path.LastIndexOf('/');
            if (slash <= 0) return;
            string parent = path.Substring(0, slash);
            string leaf = path.Substring(slash + 1);
            EnsureFolder(parent);
            AssetDatabase.CreateFolder(parent, leaf);
        }

        public static string FullPath(string assetPath)
        {
            string projectRoot = Path.GetDirectoryName(Application.dataPath);
            return Path.Combine(projectRoot, assetPath.Replace('/', Path.DirectorySeparatorChar));
        }

        /// <summary>Writes tex as a PNG asset and applies importer settings. Returns the imported Texture2D.</summary>
        public static Texture2D SavePng(Texture2D tex, string assetPath, bool asSprite, bool mipmaps)
        {
            EnsureFolder(Path.GetDirectoryName(assetPath).Replace('\\', '/'));
            File.WriteAllBytes(FullPath(assetPath), tex.EncodeToPNG());
            AssetDatabase.ImportAsset(assetPath, ImportAssetOptions.ForceUpdate);
            TextureImporter imp = AssetImporter.GetAtPath(assetPath) as TextureImporter;
            if (imp != null)
            {
                imp.textureType = asSprite ? TextureImporterType.Sprite : TextureImporterType.Default;
                if (asSprite) imp.spriteImportMode = SpriteImportMode.Single;
                imp.sRGBTexture = true;
                imp.alphaIsTransparency = true;
                imp.alphaSource = TextureImporterAlphaSource.FromInput;
                imp.mipmapEnabled = mipmaps;
                imp.wrapMode = TextureWrapMode.Clamp;
                imp.filterMode = FilterMode.Bilinear;
                imp.textureCompression = TextureImporterCompression.Uncompressed;
                imp.npotScale = TextureImporterNPOTScale.None;
                imp.SaveAndReimport();
            }
            return AssetDatabase.LoadAssetAtPath<Texture2D>(assetPath);
        }

        public static Sprite LoadSprite(string assetPath)
        {
            return AssetDatabase.LoadAssetAtPath<Sprite>(assetPath);
        }

        /// <summary>Existing mesh asset (cleared, so references stay valid) or a new one; call FinishMesh afterwards.</summary>
        public static Mesh LoadOrNewMesh(string assetPath, out bool isNew)
        {
            Mesh m = AssetDatabase.LoadAssetAtPath<Mesh>(assetPath);
            isNew = m == null;
            if (isNew) m = new Mesh();
            else m.Clear();
            m.name = Path.GetFileNameWithoutExtension(assetPath);
            return m;
        }

        public static void FinishMesh(Mesh m, string assetPath, bool isNew)
        {
            EnsureFolder(Path.GetDirectoryName(assetPath).Replace('\\', '/'));
            if (isNew) AssetDatabase.CreateAsset(m, assetPath);
            else EditorUtility.SetDirty(m);
        }

        public static Shader FindShader(string assetPath, string shaderName)
        {
            Shader s = AssetDatabase.LoadAssetAtPath<Shader>(assetPath);
            if (s == null) s = Shader.Find(shaderName);
            if (s == null)
            {
                Debug.LogWarning("[Rainbow Agent4] shader '" + shaderName + "' not found at " + assetPath + "; using URP Unlit.");
                s = Shader.Find("Universal Render Pipeline/Unlit");
            }
            return s;
        }

        public static Material LoadOrCreateMaterial(string assetPath, Shader shader)
        {
            EnsureFolder(Path.GetDirectoryName(assetPath).Replace('\\', '/'));
            Material m = AssetDatabase.LoadAssetAtPath<Material>(assetPath);
            if (m == null)
            {
                m = new Material(shader);
                m.name = Path.GetFileNameWithoutExtension(assetPath);
                AssetDatabase.CreateAsset(m, assetPath);
            }
            else if (m.shader != shader)
            {
                m.shader = shader;
            }
            m.enableInstancing = true;
            EditorUtility.SetDirty(m);
            return m;
        }

        public static void DeleteIfExists(string assetPath)
        {
            if (AssetDatabase.LoadAssetAtPath<Object>(assetPath) != null) AssetDatabase.DeleteAsset(assetPath);
        }

        public static GameObject Child(string name, Transform parent, Vector3 localPos)
        {
            GameObject go = new GameObject(name);
            go.transform.SetParent(parent, false);
            go.transform.localPosition = localPos;
            return go;
        }
    }
}
