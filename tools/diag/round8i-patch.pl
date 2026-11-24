use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
my $h = slurp("$root/Water/Shaders/RainbowRiver.hlsl");
$h =~ s/(    c5 = max\(c5 - _GlintLook\.w, 0\.0\);[^\n]*\n)/$1    float pkF = smoothstep(0.95, 1.3, abs(qe)) * (1.0 - smoothstep(1.95, 2.35, abs(qe)));\n    c5 *= lerp(float3(1.0, 1.0, 1.0), float3(1.1, 0.98, 0.86), pkF);   \/\/ hot pink, not violet-pink (measured: approved (247,84,234), was (227,84,241))\n/ unless $h =~ /pkF/;
$h =~ s/exp\(-\(tS - 1\.75\) \* \(tS - 1\.75\) \* 3\.2\)/exp(-(tS - 2.5) * (tS - 2.5) * 1.6)/;
$h =~ s/latherW \* 0\.72/latherW * 0.8/;
$h =~ s/float Yc = 0\.13 \+/float Yc = 0.09 +/;
spew("$root/Water/Shaders/RainbowRiver.hlsl", $h);
my $b = slurp("$root/Water/Scripts/FoamBank.cs");
$b =~ s/float dl = 0\.42f \+ 0\.52f \* b \+ \(rng\.Next\(\) \+ rng\.Next\(\) - 1f\) \* 0\.2f \* \(0\.5f \+ 0\.5f \* grow\);/float dl = 0.6f + 0.52f * b + (rng.Next() + rng.Next() - 1f) * 0.22f * (0.5f + 0.5f * grow);/;
$b =~ s/float r = \(k < 2 \? rng\.Range\(0\.03f, 0\.07f\) \* \(0\.6f \+ 0\.7f \* cl\) : rng\.Range\(0\.011f, 0\.032f\)\)/float r = (k < 2 ? rng.Range(0.045f, 0.1f) * (0.6f + 0.7f * cl) : rng.Range(0.012f, 0.04f))/;
$b =~ s/for \(float b = 0\.75f; b < 2\.3f; b \+= 0\.085f\)/for (float b = 0.6f; b < 2.3f; b += 0.07f)/;
spew("$root/Water/Scripts/FoamBank.cs", $b);
my $w = slurp("$root/Water/Editor/WaterBuilder.cs");
$w =~ s/lace\.SetVector\("_Web", new Vector4\([^)]*\)\);/lace.SetVector("_Web", new Vector4(0.2f, 0.6f, 0.13f, 0.44f));/;
$w =~ s/lace\.SetFloat\("_Len", 1\.55f\);/lace.SetFloat("_Len", 1.45f);/;
spew("$root/Water/Editor/WaterBuilder.cs", $w);
print "ok\n";
