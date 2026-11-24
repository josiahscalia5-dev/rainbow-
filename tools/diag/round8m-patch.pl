use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow/Water';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
my $s = slurp("$root/Editor/WaterSheenFactory.cs");
unless ($s =~ /foam amount/) {
  $s =~ s/\/\/\/    R = ramp row, G = pink amount \(the two pink sweeps\), B = 1 where it was measured\./\/\/\/    R = ramp row, G = pink amount (the two pink sweeps), B = 1 where it was measured, A = foam amount (lacy splash water)./;
  $s =~ s/back \(0\.2 \.\. 3\.8 m\)/back (-0.7 .. 3.8 m)/;
  $s =~ s/            var ra = new float\[N \* N\];/            var fa = new float[N * N]; var fw = new float[N * N];\n            var ra = new float[N * N];/ or die 'a';
  $s =~ s/for \(int y = 1150; y < 1536; y\+\+\)/for (int y = 1062; y < 1536; y++)/ or die 'b';
  $s =~ s/                    if \(c\.b < 150 \|\| c\.r > c\.b \+ 25\) continue;                                    \/\/ frame copper, gold\n/                    if (c.b < 150 || c.r > c.b + 25) continue;                                    \/\/ frame copper, gold\n                    {\n                        Vector3 d0 = R * new Vector3((x + 0.5f - 432f) \/ F, (768f - y - 0.5f) \/ F, 1f);\n                        Vector3 p0 = C + d0 * (-C.y \/ d0.y);\n                        float dl0 = p0.x + 0.45f - 0.1f, back0 = 14f - p0.z;\n                        int iu0 = Mathf.RoundToInt((dl0 + 2.2f) \/ 4.4f * N - 0.5f), iv0 = Mathf.RoundToInt((back0 + 0.7f) \/ 4.5f * N - 0.5f);\n                        if (iu0 >= 0 && iv0 >= 0 && iu0 < N && iv0 < N)\n                        {\n                            \/\/ foam amount: white \/ pale pixels, but not the star glints and arc lines of the open wake water\n                            bool glintZone = back0 > 1.35f && Mathf.Abs(dl0 - 0.03f) < 0.2f + 0.36f * back0;\n                            float fo = glintZone ? 0f : Mathf.Clamp01((mn - 105f) \/ 110f);\n                            fa[iv0 * N + iu0] += fo; fw[iv0 * N + iu0] += 1f;\n                        }\n                    }\n                    if (y < 1150) continue;\n/ or die 'c';
  $s =~ s/v = \(back - 0\.2f\) \/ 3\.6f \* N - 0\.5f;/v = (back + 0.7f) \/ 4.5f * N - 0.5f;/ or die 'd';
  $s =~ s/wb = Fill\(Mask\(rw\), One\(\), 1\.2f, 0f\);/wb = Fill(Mask(rw), One(), 1.2f, 0f), wa = Fill(fa, fw, 0.8f, 0f);/ or die 'e';
  $s =~ s/px\[i\] = new Color\(wr\[i\], wg\[i\], wb\[i\], 1f\);/px[i] = new Color(wr[i], wg[i], wb[i], wa[i]);/ or die 'f';
  spew("$root/Editor/WaterSheenFactory.cs", $s); print "factory ok\n";
}
my $h = slurp("$root/Shaders/RainbowRiver.hlsl");
unless ($h =~ /wakeFoam/) {
  $h =~ s/    float2 wuv = float2\(\(dlW \+ 0\.012 \* sin\(bt \* 2\.9 \+ back \* 6\.0\) \+ 2\.2\) \/ 4\.4, \(back \+ \(bow - back \+ 0\.8 \* dlW \* dlW\) \* 1\.2 - 0\.2\) \/ 3\.6\);\n    float3 wm = SAMPLE_TEXTURE2D_LOD\(_WakeSheen, sampler_WakeSheen, wuv, 0\)\.rgb;\n/    float backS = -db;                                                         \/\/ signed: < 0 beside and ahead of him\n    float2 wuv = float2((dlW + 0.012 * sin(bt * 2.9 + backS * 6.0) + 2.2) \/ 4.4, (backS + (bow - back + 0.8 * dlW * dlW) * 1.2 + 0.7) \/ 4.5);\n    float4 wm = SAMPLE_TEXTURE2D_LOD(_WakeSheen, sampler_WakeSheen, wuv, 0);\n    float wakeFoam = wm.a * bOn * wk * smoothstep(-0.7, -0.45, backS) * (1.0 - smoothstep(3.2, 3.7, backS)) * (1.0 - smoothstep(1.8, 2.15, abs(dlW)));\n/ or die 'g';
  # lather from the measured foam amount, streaming backward in his frame
  $h =~ s/    float latherW = .*?\n/    float latherW = wakeFoam;\n/ or die 'h';
  $h =~ s/        float4 lc = SAMPLE_TEXTURE2D_LOD\(.*?\n        float lh = .*?\n        float lk = .*?\n        float la = .*?\n        c5 = lerp\(c5, .*?\n/        bool wl5 = latherW > latherB * 0.6;\n        float2 luv = wl5 ? float2(dlW * 0.75 + 0.1 * sin(backS * 2.0 + bt * 0.7), backS * 0.6 - bt * 0.55) : float2(lat * 0.55, v5 * 0.4);\n        float4 lc = SAMPLE_TEXTURE2D_LOD(_LaceTex, sampler_LaceTex, luv, clamp(log2(distV \/ 6.0), 0.0, 5.0));\n        float4 lc2 = SAMPLE_TEXTURE2D_LOD(_LaceTex, sampler_LaceTex, luv * 2.3 + 0.31, clamp(log2(distV \/ 3.0), 0.0, 5.0));\n        float lh = saturate(min(max(lc.r, lc2.g * 0.8), lc2.r * 1.5 + 0.2));\n        float lk = wl5 ? latherW * (0.75 + 0.5 * lc.b) : latherB * 0.6 * (0.55 + 0.8 * lc.b);\n        float thr = lerp(0.86, 0.05, saturate(lk));\n        float la = smoothstep(thr, thr + 0.22, lh) * saturate(lk * 2.6);\n        c5 = lerp(c5, lerp(RBW_Disp(float3(150, 190, 250)), RBW_Disp(float3(244, 246, 255)), smoothstep(0.15, 0.8, la)), la);\n/s or die 'i';
  spew("$root/Shaders/RainbowRiver.hlsl", $h); print "river ok\n";
}
my $c = slurp('/c/RainbowUnity/UnityProject/AgentScripts/screen05_sheen_calibrate.cs');
$c =~ s/\(back - 0\.2f\) \/ 3\.6f \* N - 0\.5f/(back + 0.7f) \/ 4.5f * N - 0.5f/;
spew('/c/RainbowUnity/UnityProject/AgentScripts/screen05_sheen_calibrate.cs', $c);
