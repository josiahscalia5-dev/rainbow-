use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
my $h = slurp("$root/Water/Shaders/RainbowRiver.hlsl");
$h =~ s/\(abs\(dlS\) - \(0\.07 \+ 0\.44 \* back\) -/(abs(dlS) - (0.03 + 0.475 * back) -/;
$h =~ s/float sw = exp\(-tS \* tS \* 0\.95\) \* smoothstep\(1\.0, 1\.6, back\) \* \(1\.0 - smoothstep\(2\.4, 3\.2, back\)\);/float sw = exp(-tS * tS * 0.95) * smoothstep(1.0, 1.55, back) * (1.0 - smoothstep(2.15, 2.75, back));/;
$h =~ s/Yw = lerp\(Yw, 0\.27 \+ \(row - 0\.333\) \* 1\.15, smoothstep\(0\.1, 0\.7, gk\)\);/Yw = lerp(Yw, 0.37 + (row - 0.333) * 1.1, smoothstep(0.1, 0.7, gk));/;
$h =~ s/latherW \* 0\.52/latherW * 0.72/;
spew("$root/Water/Shaders/RainbowRiver.hlsl", $h);
my $b = slurp("$root/Water/Scripts/FoamBank.cs");
$b =~ s/int n = rng\.Next\(\) < 0\.6f \? 5 : 4;/int n = 9;/;
$b =~ s/float r = \(k < 2 \? rng\.Range\(0\.035f, 0\.09f\) \* \(0\.55f \+ 0\.75f \* cl\) : rng\.Range\(0\.014f, 0\.04f\)\)/float r = (k < 2 ? rng.Range(0.03f, 0.07f) * (0.6f + 0.7f * cl) : rng.Range(0.011f, 0.032f))/;
$b =~ s/float dl = 0\.44f \+ 0\.5f \* b \+ rng\.Range\(-0\.13f, 0\.12f\) \* \(0\.5f \+ 0\.5f \* grow\);/float dl = 0.42f + 0.52f * b + (rng.Next() + rng.Next() - 1f) * 0.2f * (0.5f + 0.5f * grow);/;
$b =~ s/k < 2 \? -0\.35f \* r : 0\.0f/k < 2 ? -0.3f * r : 0.0f/;
spew("$root/Water/Scripts/FoamBank.cs", $b);
my $l = slurp("$root/Water/Shaders/RainbowSplashLace.shader");
$l =~ s/th \+= \(1\.0 - edge\) \* 0\.5 \+ 0\.14 \* a \* a;/th += (1.0 - edge) * 0.5 + 0.14 * a * a - 0.07 * (1.0 - a);/;
spew("$root/Water/Shaders/RainbowSplashLace.shader", $l);
print "ok\n";
