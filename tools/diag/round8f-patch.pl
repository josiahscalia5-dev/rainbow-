use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
my $h = slurp("$root/Water/Shaders/RainbowRiver.hlsl");
$h =~ s/float sw = exp\(-tS \* tS \* 1\.05\) \* smoothstep\(1\.05, 1\.5, back\) \* \(1\.0 - smoothstep\(2\.9, 3\.5, back\)\);/float sw = exp(-tS * tS * 0.85) * smoothstep(0.95, 1.65, back) * (1.0 - smoothstep(2.3, 3.1, back));/;
$h =~ s/float qw = lerp\(0\.1, 1\.5, smoothstep\(0\.1, 0\.72, gk\)\);/float qw = lerp(0.35, 1.5, smoothstep(0.06, 0.85, gk));/;
$h =~ s/    Yw = lerp\(Yw, 0\.24 \+ \(row - 0\.333\) \* 0\.95, smoothstep\(0\.12, 0\.6, gk\)\);\n/    float midW = 1.0 - smoothstep(-1.5, -0.6, tS);                          \/\/ 1 inside, between the two sweeps\n    Yw = lerp(0.27 + (row - 0.333) * 0.8, Yw, midW);\n    Yw = lerp(Yw, 0.26 + (row - 0.333) * 1.0, smoothstep(0.1, 0.7, gk));\n/ unless $h =~ /midW/;
$h =~ s/qe = lerp\(qe, qw \+ \(T - 0\.5\) \* 0\.3, wakeA\);/qe = lerp(qe, lerp(qe, qw + (T - 0.5) * 0.3, max(smoothstep(0.03, 0.3, gk), 1.0 - smoothstep(-1.2, -0.2, tS))), wakeA);/;
$h =~ s/col \+= float3\(0\.25, 0\.5, 0\.55\) \* glow \* wk \* 0\.4;/col += float3(0.15, 0.4, 0.5) * glow * wk * 0.16;/;
$h =~ s/col = lerp\(col, foamCol, wakeF\);/col = lerp(col, foamCol, wakeF * 0.45);/;
spew("$root/Water/Shaders/RainbowRiver.hlsl", $h);
my $w = slurp("$root/Water/Editor/WaterBuilder.cs");
$w =~ s/lace\.SetVector\("_Web", new Vector4\([^)]*\)\);/lace.SetVector("_Web", new Vector4(0.27f, 0.62f, 0.12f, 0.46f));/;
spew("$root/Water/Editor/WaterBuilder.cs", $w);
my $l = slurp("$root/Water/Shaders/RainbowSplashLace.shader");
print "ok\n";
