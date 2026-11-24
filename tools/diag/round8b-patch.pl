use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow/Water';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
my $f = slurp("$root/Shaders/RainbowFoam.hlsl");
$f =~ s/float t = 0\.16 \+ 0\.96 \* smoothstep\(0\.08, 0\.98, lit\) - \(1\.0 - ao\) \* 0\.62;/float t = -0.04 + 0.94 * smoothstep(0.12, 1.04, lit) - (1.0 - ao) * 0.6;/;
$f =~ s/mf\.x \* kf \* 0\.62 \* \(1\.0 - 0\.6 \* lit\)/mf.x * kf * 0.85 * (1.0 - 0.5 * lit)/;
$f =~ s/saturate\(up \* 0\.9 \+ 0\.35\) \* 0\.6\)/saturate(up * 0.9 + 0.3) * 0.38)/;
spew("$root/Shaders/RainbowFoam.hlsl", $f);
my $fs = slurp("$root/Shaders/RainbowFoam.shader");
$fs =~ s/RBW_VignetteAt\(i\.positionCS\.xy\), 0\.85\)/RBW_VignetteAt(i.positionCS.xy), 0.55)/;
spew("$root/Shaders/RainbowFoam.shader", $fs);
my $h = slurp("$root/Shaders/RainbowRiver.hlsl");
$h =~ s/    float qw = wm\.g < 0\.5 \?/    \/\/ the sweeps run up to his flanks and have streaky satin edges\n    float upK = smoothstep(0.85, 1.25, back) * (1.0 - smoothstep(1.35, 1.75, back)) * (1.0 - smoothstep(0.4, 1.15, abs(tW5)));\n    wm.g = saturate(max(wm.g, upK * 0.9) + (T - 0.5) * 0.55 * smoothstep(0.04, 0.3, wm.g));\n    float qw = wm.g < 0.5 ?/ unless $h =~ /upK/;
spew("$root/Shaders/RainbowRiver.hlsl", $h);
my $w = slurp("$root/Editor/WaterBuilder.cs");
$w =~ s/lace\.SetFloat\("_Len", 1\.25f\);/lace.SetFloat("_Len", 1.55f);/;
$w =~ s/lace\.SetVector\("_Web", new Vector4\(0\.3f, 0\.6f, 0\.12f, 0\.35f\)\);/lace.SetVector("_Web", new Vector4(0.2f, 0.62f, 0.1f, 0.42f));/;
$w =~ s/lace\.SetVector\("_Tile", new Vector4\(2\.6f, 0\.95f, 2\.4f, 0\.45f\)\);/lace.SetVector("_Tile", new Vector4(3.4f, 0.5f, 2.2f, 0.6f));/;
spew("$root/Editor/WaterBuilder.cs", $w);
print "ok\n";
