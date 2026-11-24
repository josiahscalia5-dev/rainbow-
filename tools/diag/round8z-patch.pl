use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
my $p = slurp("$root/Environment/Shaders/RainbowPolish05.hlsl");
unless ($p =~ /float brick/) {
  $p =~ s/p \/ \(0\.125 \* max\(dist, 5\.0\)\)/p \/ (0.16 * max(dist, 10.0))/ or die 'split';
  $p =~ s/look, float4 look5, float fwPhiIn, float fwRowIn\);\nfloat3 RainbowWall5\(/look, float4 look5, float fwPhiIn, float fwRowIn, float brick);\nfloat3 RainbowWall5(/ or die 'decl';
  $p =~ s/float4 look, float4 look5, float fwPhiIn, float fwRowIn\)\n\{/float4 look, float4 look5, float fwPhiIn, float fwRowIn, float brick)\n{/ or die 'def';
  $p =~ s/    float fa = fwRow \* sp\.x, fb = fwRow \* sp\.x \* 3\.0, wb = sp\.y;\n/    float fa = fwRow * sp.x, fb = fwRow * sp.x * 3.0, wb = sp.y;\n    \/\/ third-brick offset of the slots: fixed in the world (never a function of the camera distance: that sheared the rows into ropes)\n    float brickA = 0.33 * (1.0 - smoothstep(45.0, 47.0, Uv0.y)), brickB = brickA;\n/ or die 'brick';
  $p =~ s/        bool nearB = dist < 46\.0;\n/        bool nearB = dist < 46.0;\n        brickA = nearB ? 0.3333333 : 0.0;\n        brickB = 0.0;\n/ or die 'nearB';
  $p =~ s/RainbowWall5Row\(posWS, Uv0, a, dist, look, look5, fwPhi, fa\)/RainbowWall5Row(posWS, Uv0, a, dist, look, look5, fwPhi, fa, brickA)/ or die 'a';
  $p =~ s/RainbowWall5Row\(posWS, Uv0, b, dist, look, look5, fwPhi, fb\)/RainbowWall5Row(posWS, Uv0, b, dist, look, look5, fwPhi, fb, brickB)/ or die 'b';
  $p =~ s/float gx = gx0 \+ floor\(row\) \* 0\.33 \* bayNA;/float gx = gx0 + floor(row) * brick;/ or die 'gx';
  spew("$root/Environment/Shaders/RainbowPolish05.hlsl", $p); print "walls ok\n";
}
my $d = slurp("$root/Environment/Scripts/DrumPolish05.cs");
unless ($d =~ /bends gently/) {
  $d =~ s/            int steps = Mathf\.Clamp\(Mathf\.CeilToInt\(\(bay\.s1 - bay\.s0\) \/ \(bay\.s1 < 60f \? 1f : \(bay\.s1 < 120f \? 1\.6f : 4f\)\)\), 4, 48\);/            \/\/ the tunnel bends gently after s 262: short steps there, so the light lines stay smooth curves when he swims past\n            int steps = Mathf.Clamp(Mathf.CeilToInt((bay.s1 - bay.s0) \/ (bay.s1 < 60f ? 1f : (bay.s1 < 120f ? 1.6f : (bay.s1 < 262f ? 4f : 1.8f)))), 4, bay.s1 < 262f ? 48 : 110);/ or die 'steps';
  spew("$root/Environment/Scripts/DrumPolish05.cs", $d); print "steps ok\n";
}
