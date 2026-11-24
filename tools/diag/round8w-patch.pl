use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
my $f = slurp("$root/Water/Shaders/RainbowFoam.hlsl");
$f =~ s/float3 Ns = normalize\(Nv \+ upV \* 0\.42\);/float3 Ns = normalize(Nv + upV * 0.24);/ or die 'ns';
$f =~ s/float t = -0\.14 \+ 1\.0 \* smoothstep\(0\.16, 1\.06, lit\) - \(1\.0 - ao\) \* 0\.6;/float t = -0.2 + 1.16 * smoothstep(0.1, 1.04, lit) - (1.0 - ao) * 0.62;/ or die 't';
$f =~ s/clamp\(px \/ 6\.5, 1\.4, 11\.0\) \+ seed \* 37\.0;\n    float dens = clamp\(0\.1 \+ 0\.75 \* RBW_SS\(0\.3, -0\.65, q\.y\) \+ 0\.22 \* \(1\.0 - z\) - 0\.12 \* big, 0\.0, 0\.8\);/clamp(px \/ 13.0, 1.0, 6.0) + seed * 37.0;\n    float dens = clamp(0.12 + 0.6 * RBW_SS(0.45, -0.6, q.y) + 0.15 * (1.0 - z), 0.0, 0.72);/ or die 'mp';
$f =~ s/mf\.x \* kf \* 0\.85 \* \(1\.0 - 0\.5 \* lit\)/mf.x * kf * 0.9 * (1.0 - 0.45 * lit)/ or die 'hole';
spew("$root/Water/Shaders/RainbowFoam.hlsl", $f);
my $h = slurp("$root/Water/Shaders/RainbowRiver.hlsl");
$h =~ s/c5 \*= lerp\(float3\(1\.0, 1\.0, 1\.0\), float3\(1\.1, 0\.98, 0\.86\), pkF\);/c5 *= lerp(float3(1.0, 1.0, 1.0), float3(1.07, 0.99, 0.93), pkF);/ or die 'pk';
$h =~ s/    float Y = lerp\(0\.333, broad, _SheenLook\.x\) \+ \(row - 0\.333\) \* _SheenLook\.y;/    float pkD = smoothstep(0.85, 1.25, abs(qe)) * (1.0 - smoothstep(2.0, 2.4, abs(qe)));      \/\/ the pink satin shows more streaks than the cyan core\n    float Y = lerp(0.333, broad, _SheenLook.x) + (row - 0.333) * (_SheenLook.y + 0.4 * pkD);/ or die 'Y';
spew("$root/Water/Shaders/RainbowRiver.hlsl", $h);
my $b = slurp("$root/Water/Scripts/FoamBank.cs");
$b =~ s/float r = rng\.Range\(0\.14f, 0\.27f\) \* \(0\.8f \+ 0\.5f \* lump\) \* rs;/float r = (rng.Next() < 0.4f ? rng.Range(0.18f, 0.28f) : rng.Range(0.09f, 0.18f)) * (0.8f + 0.5f * lump) * rs;/ or die 'big';
spew("$root/Water/Scripts/FoamBank.cs", $b);
print "ok\n";
