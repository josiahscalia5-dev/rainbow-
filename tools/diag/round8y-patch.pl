use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
my $p = slurp("$root/Environment/Shaders/RainbowPolish05.hlsl");
unless ($p =~ /uniform rows/) {
  $p =~ s/    float fwPhi = fwidth\(Uv0\.x\) \/ 6\.8, fwRow = fwidth\(Uv1\.y\);\n    float3 ca = RainbowWall5Row\(posWS, Uv0, a, dist, look, look5, fwPhi, fwRow \* sp\.x\);\n    \[branch\] if \(sp\.y > 0\.004\) ca = lerp\(ca, RainbowWall5Row\(posWS, Uv0, b, dist, look, look5, fwPhi, fwRow \* sp\.x \* 3\.0\), sp\.y\);/    float fwPhi = fwidth(Uv0.x) \/ 6.8, fwRow = fwidth(Uv1.y), fwS = fwidth(Uv0.y);
    float fa = fwRow * sp.x, fb = fwRow * sp.x * 3.0, wb = sp.y;
    \/\/ uniform rows on the long course (s > 106): 2 m apart near him, 6 m further on (every third one stays), the picture's forced-perspective rows only
    \/\/ far away (> 60-90 m, where the approved view sees these bays), cross-faded: the slots keep one size and place while he swims past
    if (Uv0.y > 106.0)
    {
        float fine = (Uv0.y - 105.8) \/ 2.0 + 0.5, coarse = (Uv0.y - 105.8) \/ 6.0 + 0.5;
        bool nearB = dist < 46.0;
        a.y = nearB ? fine : coarse;
        b.y = nearB ? coarse : Uv1.y;
        fa = nearB ? fwS * 0.5 : fwS \/ 6.0;
        fb = nearB ? fwS \/ 6.0 : fwRow;
        wb = nearB ? smoothstep(17.0, 30.0, dist) : smoothstep(62.0, 92.0, dist);
    }
    float3 ca = RainbowWall5Row(posWS, Uv0, a, dist, look, look5, fwPhi, fa);
    [branch] if (wb > 0.004) ca = lerp(ca, RainbowWall5Row(posWS, Uv0, b, dist, look, look5, fwPhi, fb), wb);/ or die 'uni';
  spew("$root/Environment/Shaders/RainbowPolish05.hlsl", $p); print "walls ok\n";
}
