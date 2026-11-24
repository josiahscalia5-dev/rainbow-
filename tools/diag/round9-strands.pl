use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
my $w = slurp("$root/Water/Editor/WaterTextureFactory.cs");
unless ($w =~ /MakeStrands/) {
  my $new = <<'CS';
        // ------------------------------------------------------------------ splash strands
        public const string StrandPath = "Assets/Rainbow/Water/Textures/RainbowStrands05.png";

        /// <summary>Tileable splash web (512 x 512, v = along the strands): R = distance to the nearest thread of a web whose cells are long along the
        /// flow (0 on a thread .. 1 in the middle of a cell, rounded holes), G = the same of a finer web, B = strand noise, A = droplets.</summary>
        public static string MakeStrands()
        {
            const int L = 512;
            float[] Web(int nu, int nv, int seed, float warp, float round)
            {
                var rnd = new System.Random(seed);
                var px0 = new float[nu * nv]; var py0 = new float[nu * nv];
                for (int j = 0; j < nv; j++)
                    for (int i = 0; i < nu; i++)
                    {
                        px0[j * nu + i] = i + 0.5f + ((j & 1) == 0 ? 0.25f : -0.25f) + 0.8f * ((float)rnd.NextDouble() - 0.5f);
                        py0[j * nu + i] = j + 0.5f + 0.85f * ((float)rnd.NextDouble() - 0.5f);
                    }
                var o = new float[L * L];
                for (int y = 0; y < L; y++)
                    for (int x = 0; x < L; x++)
                    {
                        float u = (x + 0.5f) / L, v = (y + 0.5f) / L;
                        float uu = u + warp * (PNoise(u * 5f, v * 4f, 5, 4, seed + 1) - 0.5f) + 0.5f * warp * (PNoise(u * 13f, v * 9f, 13, 9, seed + 2) - 0.5f);
                        float vv = v + 0.6f * warp * (PNoise(u * 4f, v * 4f, 4, 4, seed + 3) - 0.5f);
                        float fx = uu * nu, fy = vv * nv;
                        int ix = Mathf.FloorToInt(fx), iy = Mathf.FloorToInt(fy);
                        float b1 = 1e9f, sx = 0f, sy = 0f;
                        for (int dj = -2; dj <= 2; dj++)
                            for (int di = -2; di <= 2; di++)
                            {
                                int ci = ((ix + di) % nu + nu) % nu, cj = ((iy + dj) % nv + nv) % nv;
                                float qx = px0[cj * nu + ci] + (ix + di - ci), qy = py0[cj * nu + ci] + (iy + dj - cj);
                                float d = (qx - fx) * (qx - fx) + (qy - fy) * (qy - fy);
                                if (d < b1) { b1 = d; sx = qx; sy = qy; }
                            }
                        float acc = 0f, best = 1e9f;      // smooth minimum of the border distances = round holes, thick knots
                        for (int dj = -2; dj <= 2; dj++)
                            for (int di = -2; di <= 2; di++)
                            {
                                int ci = ((ix + di) % nu + nu) % nu, cj = ((iy + dj) % nv + nv) % nv;
                                float qx = px0[cj * nu + ci] + (ix + di - ci), qy = py0[cj * nu + ci] + (iy + dj - cj);
                                float ex = qx - sx, ey = qy - sy, el = Mathf.Sqrt(ex * ex + ey * ey);
                                if (el < 1e-4f) continue;
                                float bd = ((0.5f * (sx + qx) - fx) * ex + (0.5f * (sy + qy) - fy) * ey) / el;
                                if (bd < best) best = bd;
                                acc += Mathf.Exp(-bd * round);
                            }
                        float sm = -Mathf.Log(Mathf.Max(acc, 1e-9f)) / round;
                        o[y * L + x] = Mathf.Clamp01(Mathf.Max(0f, Mathf.Lerp(best, sm, 0.75f)) / 0.46f);
                    }
                return o;
            }
            float[] a = Web(15, 6, 4211, 0.055f, 11f), b = Web(34, 15, 4391, 0.03f, 11f);
            var dr = new float[L * L];
            var rd = new System.Random(993);
            for (int k = 0; k < 210; k++)
            {
                float cx = (float)rd.NextDouble() * L, cy = (float)rd.NextDouble() * L, r = Mathf.Lerp(1.6f, 6.5f, Mathf.Pow((float)rd.NextDouble(), 2.2f)), st = 1f + 0.9f * (float)rd.NextDouble();
                int R = Mathf.CeilToInt(r * st) + 1;
                for (int dy = -R; dy <= R; dy++)
                    for (int dx = -R; dx <= R; dx++)
                    {
                        float q = 1f - Mathf.Sqrt(dx * dx + (dy / st) * (dy / st)) / r;
                        if (q <= 0f) continue;
                        int xx = ((int)cx + dx + L) % L, yy = ((int)cy + dy + L) % L;
                        dr[yy * L + xx] = Mathf.Max(dr[yy * L + xx], Mathf.Min(1f, q * 1.6f));
                    }
            }
            var px = new Color32[L * L];
            for (int y = 0; y < L; y++)
                for (int x = 0; x < L; x++)
                {
                    float u = x / (float)L, v = y / (float)L;
                    float s = 0.55f * PNoise(u * 11f, v * 2f, 11, 2, 81) + 0.3f * PNoise(u * 23f, v * 3f, 23, 3, 82) + 0.15f * PNoise(u * 41f, v * 5f, 41, 5, 83);
                    s = Mathf.Clamp01((s - 0.5f) * 1.9f + 0.5f);
                    int k = y * L + x;
                    px[k] = new Color32((byte)(a[k] * 255f), (byte)(b[k] * 255f), (byte)(s * 255f), (byte)(dr[k] * 255f));
                }
            var tex = new Texture2D(L, L, TextureFormat.RGBA32, false, true);
            tex.SetPixels32(px);
            File.WriteAllBytes(StrandPath, tex.EncodeToPNG());
            UnityEngine.Object.DestroyImmediate(tex);
            AssetDatabase.ImportAsset(StrandPath, ImportAssetOptions.ForceSynchronousImport);
            var imp = AssetImporter.GetAtPath(StrandPath) as TextureImporter;
            if (imp != null)
            {
                imp.sRGBTexture = false; imp.mipmapEnabled = true; imp.wrapMode = TextureWrapMode.Repeat; imp.filterMode = FilterMode.Trilinear;
                imp.anisoLevel = 4; imp.maxTextureSize = 512; imp.textureCompression = TextureImporterCompression.CompressedHQ; imp.SaveAndReimport();
            }
            return "strands " + new FileInfo(StrandPath).Length / 1024 + " KB";
        }

        // ------------------------------------------------------------------ ramp
CS
  $w =~ s/        \/\/ -+ ramp\n/$new/ or die 'ramp';
  spew("$root/Water/Editor/WaterTextureFactory.cs", $w); print "factory ok\n";
}
