# one-time helper (2026-11-24, round 8): lace texture, lace splash mesh + drawing, softer foam
use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow/Water';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }

# ---- texture factory: the lace
my $tf = slurp("$root/Editor/WaterTextureFactory.cs");
unless ($tf =~ /MakeLace/) {
  my $lace = <<'END';
        // ------------------------------------------------------------------ foam lace
        public const string LacePath = "Assets/Rainbow/Water/Textures/RainbowLace05.png";

        /// <summary>Tileable soap lace (512 x 512): R = normalised distance to the nearest bubble hole (0 hole centre, 0.5 hole rim, 1 far from holes: the
        /// web between them) of a coarse bubble raft, G = the same for a fine raft, B = smooth noise (strand breakup).</summary>
        public static string MakeLace()
        {
            const int L = 512;
            var rnd = new System.Random(7177);
            float[] Raft(int count, float rMin, float rMax, float pow)
            {
                var cx = new float[count]; var cy = new float[count]; var cr = new float[count];
                int n = 0, tries = 0;
                // relaxed random packing: big holes first, small ones in the gaps
                while (n < count && tries < count * 60)
                {
                    tries++;
                    float f = n / (float)count, r = Mathf.Lerp(rMax, rMin, Mathf.Pow(f, pow)) * (0.85f + 0.3f * (float)rnd.NextDouble());
                    float x = (float)rnd.NextDouble(), y = (float)rnd.NextDouble();
                    bool ok = true;
                    for (int k = 0; k < n && ok; k++)
                    {
                        float dx = Mathf.Abs(x - cx[k]), dy = Mathf.Abs(y - cy[k]);
                        dx = Mathf.Min(dx, 1f - dx); dy = Mathf.Min(dy, 1f - dy);
                        float need = (r + cr[k]) * 0.93f;
                        if (dx * dx + dy * dy < need * need) ok = false;
                    }
                    if (!ok) continue;
                    cx[n] = x; cy[n] = y; cr[n] = r; n++;
                }
                var o = new float[L * L];
                for (int y = 0; y < L; y++)
                    for (int x = 0; x < L; x++)
                    {
                        float u = (x + 0.5f) / L, v = (y + 0.5f) / L, best = 9f;
                        for (int k = 0; k < n; k++)
                        {
                            float dx = Mathf.Abs(u - cx[k]), dy = Mathf.Abs(v - cy[k]);
                            if (dx > 0.5f) dx = 1f - dx;
                            if (dy > 0.5f) dy = 1f - dy;
                            if (dx > cr[k] * 2.2f || dy > cr[k] * 2.2f) continue;
                            float d = Mathf.Sqrt(dx * dx + dy * dy) / cr[k];
                            if (d < best) best = d;
                        }
                        o[y * L + x] = Mathf.Clamp01(best * 0.5f);      // 0.5 = the rim of a hole
                    }
                return o;
            }
            float[] a = Raft(230, 0.012f, 0.062f, 0.55f), b = Raft(760, 0.008f, 0.03f, 0.5f);
            var px = new Color32[L * L];
            for (int y = 0; y < L; y++)
                for (int x = 0; x < L; x++)
                {
                    float u = x / (float)L, v = y / (float)L;
                    float s = 0.55f * PNoise(u * 9f, v * 2f, 9, 2, 71) + 0.3f * PNoise(u * 19f, v * 3f, 19, 3, 72) + 0.15f * PNoise(u * 37f, v * 5f, 37, 5, 73);
                    s = Mathf.Clamp01((s - 0.5f) * 1.9f + 0.5f);
                    int k = y * L + x;
                    px[k] = new Color32((byte)(a[k] * 255f), (byte)(b[k] * 255f), (byte)(s * 255f), 255);
                }
            var tex = new Texture2D(L, L, TextureFormat.RGBA32, false, true);
            tex.SetPixels32(px);
            File.WriteAllBytes(LacePath, tex.EncodeToPNG());
            UnityEngine.Object.DestroyImmediate(tex);
            AssetDatabase.ImportAsset(LacePath, ImportAssetOptions.ForceSynchronousImport);
            var imp = AssetImporter.GetAtPath(LacePath) as TextureImporter;
            if (imp != null)
            {
                imp.sRGBTexture = false; imp.mipmapEnabled = true; imp.wrapMode = TextureWrapMode.Repeat; imp.filterMode = FilterMode.Trilinear;
                imp.anisoLevel = 4; imp.maxTextureSize = 512; imp.textureCompression = TextureImporterCompression.CompressedHQ; imp.SaveAndReimport();
            }
            return "lace " + new FileInfo(LacePath).Length / 1024 + " KB";
        }

        // ------------------------------------------------------------------ ramp
END
  $tf =~ s/        \/\/ -+ ramp\n/$lace/ or die 'lace marker';
  spew("$root/Editor/WaterTextureFactory.cs", $tf); print "factory ok\n";
}

# ---- splash wake: lace mesh, drawing, steering, burst
my $sw = slurp("$root/Scripts/SplashWake.cs");
unless ($sw =~ /BuildLaceMesh/) {
  my $mesh = <<'END';
        // ---- lacy splash sheets (master direction 2026-11-24): two fans, three layers, shaped on the GPU by Rainbow/Water/SplashLace ----
        static Mesh BuildLaceMesh()
        {
            const int NT = 14, NA = 20, NL = 3;
            var vt = new System.Collections.Generic.List<Vector3>(); var uv = new System.Collections.Generic.List<Vector4>(); var tr = new System.Collections.Generic.List<int>();
            for (int layer = NL - 1; layer >= 0; layer--)
                foreach (float side in new[] { -1f, 1f })
                {
                    int b = vt.Count;
                    for (int j = 0; j <= NA; j++)
                        for (int i = 0; i <= NT; i++) { vt.Add(Vector3.zero); uv.Add(new Vector4(i / (float)NT, j / (float)NA, side, layer)); }
                    for (int j = 0; j < NA; j++)
                        for (int i = 0; i < NT; i++)
                        {
                            int p = b + j * (NT + 1) + i, q = p + NT + 1;
                            tr.Add(p); tr.Add(q); tr.Add(p + 1); tr.Add(p + 1); tr.Add(q); tr.Add(q + 1);
                        }
                }
            var m = new Mesh { name = "SplashLace05" };
            m.hideFlags = HideFlags.DontSave;
            m.SetVertices(vt); m.SetUVs(0, uv); m.SetTriangles(tr, 0);
            m.bounds = new Bounds(Vector3.zero, new Vector3(8f, 4f, 8f));
            return m;
        }

        Mesh laceMesh;
        Material laceMaterial;
        bool laceTried;
        MaterialPropertyBlock laceProps;
        float steerSm, burstSm;

        void DrawLace(Vector3 c, float rw, float strength, float dt)
        {
            BennyController bc = BennyController.Instance;
            float st = bc != null ? bc.SteerVisual : 0f;
            steerSm += (st - steerSm) * (1f - Mathf.Exp(-dt * 6f));
            burstSm += ((splashAge < 0.45f ? splashStrength * (1f - splashAge / 0.45f) : 0f) - burstSm) * (1f - Mathf.Exp(-dt * 14f));
            if (strength < 0.02f) return;
            if (!laceTried) { laceTried = true; laceMaterial = Resources.Load<Material>("RainbowSplashLace05"); }
            if (laceMaterial == null) return;
            if (laceMesh == null) laceMesh = BuildLaceMesh();
            if (laceProps == null) laceProps = new MaterialPropertyBlock();
            laceProps.SetVector(StateId, new Vector4(rw, strength, steerSm, burstSm));
            var rp = new RenderParams(laceMaterial)
            {
                layer = gameObject.layer,
                shadowCastingMode = ShadowCastingMode.Off,
                receiveShadows = false,
                worldBounds = new Bounds(c, new Vector3(8f, 4f, 8f)),
                matProps = laceProps,
            };
            Graphics.RenderMesh(rp, laceMesh, 0, Matrix4x4.TRS(c, Quaternion.LookRotation(fwd, Vector3.up), Vector3.one));
        }

        void DrawFans(Vector3 c, float rw, float strength)
END
  chomp $mesh;
  $sw =~ s/        void DrawFans\(Vector3 c, float rw, float strength\)/$mesh/ or die 'fans';
  $sw =~ s/            DrawFans\(c, rw, wake\);\n/            if (drawOldFans) DrawFans(c, rw, wake);\n            DrawLace(c, rw, wake, dt);\n/ or die 'call';
  $sw =~ s/(        \[Tooltip\("How fast the wake follows SetIntensity)/        [Tooltip("the old thin white ropes \/ jets (Rainbow\/Water\/Splash); replaced by the lace sheets")]\n        public bool drawOldFans = false;\n$1/ or die 'tip';
  $sw =~ s/(            Release\(fanMesh\);\n)/$1            Release(laceMesh);\n            laceMesh = null;\n/ or die 'rel';
  # droplets: finer and fewer
  $sw =~ s/public float sprayRate = 360f;/public float sprayRate = 300f;/;
  $sw =~ s/d\.halfWidth = 0\.5f \* Rnd\(0\.012f, 0\.04f\);/d.halfWidth = 0.5f * Rnd(0.009f, 0.028f);/ or die 'drop';
  $sw =~ s/d\.halfWidth = 0\.5f \* Rnd\(0\.06f, 0\.16f\);/d.halfWidth = 0.5f * Rnd(0.02f, 0.085f);/ or die 'bdrop';
  # wake foam turns with his heading
  $sw =~ s/Graphics\.RenderMesh\(rp, wakeFoamMesh, 0, Matrix4x4\.Translate\(c\)\);/Graphics.RenderMesh(rp, wakeFoamMesh, 0, Matrix4x4.TRS(c, Quaternion.LookRotation(fwd, Vector3.up), Vector3.one));/ or die 'wf';
  spew("$root/Scripts/SplashWake.cs", $sw); print "wake ok\n";
}

# ---- builder: lace material
my $wb = slurp("$root/Editor/WaterBuilder.cs");
unless ($wb =~ /RainbowSplashLace05/) {
  my $lm = <<'END';
            // round 8: the lacy splash sheets
            AssetDatabase.ImportAsset(Dir + "/Shaders/RainbowSplashLace.shader", ImportAssetOptions.ForceSynchronousImport);
            Material lace = GetOrCreateMaterial(ResDir + "/RainbowSplashLace05.mat", "Rainbow/Water/SplashLace");
            lace.SetTexture("_LaceTex", AssetDatabase.LoadAssetAtPath<Texture2D>(WaterTextureFactory.LacePath));
            lace.SetFloat("_Len", 1.25f);
            lace.SetFloat("_Height", 0.16f);
            lace.SetFloat("_Alpha", 1f);
            lace.SetFloat("_Bright", 1f);
            lace.SetVector("_Shape", new Vector4(0.16f, 1.82f, 0.9f, 0.1f));
            lace.SetVector("_Web", new Vector4(0.3f, 0.6f, 0.12f, 0.35f));
            lace.SetVector("_Tile", new Vector4(2.6f, 0.95f, 2.4f, 0.45f));
            EditorUtility.SetDirty(lace);

            // (splash round 2026-11-23) make sure the fan shader
END
  chomp $lm;
  $wb =~ s/            \/\/ \(splash round 2026-11-23\) make sure the fan shader/$lm/ or die 'lace builder';
  spew("$root/Editor/WaterBuilder.cs", $wb); print "builder ok\n";
}
