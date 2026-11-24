use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
my $c = slurp("$root/Gameplay/Shaders/RainbowCoin.shader");
unless ($c =~ /_FaceTint/) {
  $c =~ s/(        _EnvStrength \("Reflection Strength", Float\) = 0\.9\n)/$1        _FaceTint ("Face colour match", Vector) = (1.0, 1.5, 1.2, 0)\n/ or die 'p';
  $c =~ s/(            half _EnvStrength;\n)/$1            float4 _FaceTint;\n/ or die 'c';
  $c =~ s/float3 art = lerp\(edgeArt, faceArt, saturate\(i\.face\)\);/float3 art = lerp(edgeArt, faceArt * _FaceTint.rgb, saturate(i.face));/ or die 'a';
  spew("$root/Gameplay/Shaders/RainbowCoin.shader", $c); print "coin ok\n";
}
my $f = slurp("$root/Water/Shaders/RainbowFoam.hlsl");
$f =~ s/float t = -0\.04 \+ 0\.94 \* smoothstep\(0\.12, 1\.04, lit\)/float t = -0.14 + 1.0 * smoothstep(0.16, 1.06, lit)/ and print "foam ok\n";
spew("$root/Water/Shaders/RainbowFoam.hlsl", $f);
