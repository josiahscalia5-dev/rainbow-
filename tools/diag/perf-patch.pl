use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
# walls: derivatives once, second evaluation only inside a real branch
my $p = slurp("$root/Environment/Shaders/RainbowPolish05.hlsl");
unless ($p =~ /fwRowIn/) {
  $p =~ s/float3 RainbowWall5Row\(float3 posWS, float2 Uv0, float4 Uv1, float dist, float4 look, float4 look5\);/float3 RainbowWall5Row(float3 posWS, float2 Uv0, float4 Uv1, float dist, float4 look, float4 look5, float fwPhiIn, float fwRowIn);/ or die 'decl';
  $p =~ s/float3 RainbowWall5Row\(float3 posWS, float2 Uv0, float4 Uv1, float dist, float4 look, float4 look5\)\n/float3 RainbowWall5Row(float3 posWS, float2 Uv0, float4 Uv1, float dist, float4 look, float4 look5, float fwPhiIn, float fwRowIn)\n/ or die 'def';
  $p =~ s/    float3 ca = RainbowWall5Row\(posWS, Uv0, a, dist, look, look5\);\n    if \(sp\.y > 0\.002\) ca = lerp\(ca, RainbowWall5Row\(posWS, Uv0, b, dist, look, look5\), sp\.y\);/    float fwPhi = fwidth(Uv0.x) \/ 6.8, fwRow = fwidth(Uv1.y);\n    float3 ca = RainbowWall5Row(posWS, Uv0, a, dist, look, look5, fwPhi, fwRow * sp.x);\n    [branch] if (sp.y > 0.004) ca = lerp(ca, RainbowWall5Row(posWS, Uv0, b, dist, look, look5, fwPhi, fwRow * sp.x * 3.0), sp.y);/ or die 'call';
  $p =~ s/return float2\(pow\(3\.0, n\), smoothstep\(0\.2, 0\.8, lv - n\)\);/return float2(pow(3.0, n), smoothstep(0.32, 0.72, lv - n));/ or die 'blend';
  # inside the row function: use the passed derivatives
  my ($head, $body) = $p =~ /^(.*?float3 RainbowWall5Row\([^;{]*\)\n\{)(.*)\z/s or die 'split';
  $body =~ s/float fwp = fwidth\(phi\) \* 57\.2958;/float fwp = fwPhiIn * 57.2958;/ or die 'fwp';
  $body =~ s/float fwy = fwidth\(row\);/float fwy = fwRowIn;/ or die 'fwy';
  $body =~ s/float ad = max\(fwidth\(gx0\) \/ h\.x, fwy \/ h\.y\) \* 0\.55;/float ad = max(fwPhiIn * 44.0 \/ RB_TWO_PI \/ h.x, fwy \/ h.y) * 0.55;/ or die 'ad';
  spew("$root/Environment/Shaders/RainbowPolish05.hlsl", $head . $body); print "walls ok\n";
}
my $h = slurp("$root/Water/Shaders/RainbowRiver.hlsl");
unless ($h =~ /float2 dx, float2 dy, float dist/) {
  $h =~ s/float4 RBW_Silk\(float2 p, float dist, float2 offs\)/float4 RBW_Silk(float2 p, float2 dx, float2 dy, float dist, float2 offs)/ or die 'sig';
  $h =~ s/    float2 dx = ddx\(p\), dy = ddy\(p\);\n    float2 ka/    float2 ka/ or die 'dd';
  $h =~ s/    float4 sk = RBW_Silk\(float2\(X, v5\), distV, float2\(0\.0, 0\.0\)\);\n    float4 sk2 = RBW_Silk\(float2\(X \* 1\.37 \+ 3\.1, v5 \* 1\.21 - time \* 1\.3\), distV, float2\(0\.31, 0\.17\)\);[^\n]*\n/    float2 pS = float2(X, v5), dxS = ddx(pS), dyS = ddy(pS);\n    float4 sk = RBW_Silk(pS, dxS, dyS, distV, float2(0.0, 0.0));\n    float4 sk2 = float4(0.5, 0.0, 0.5, 0.5);\n    [branch] if (distV < 34.0)                                                                         \/\/ second layer, other speed: ripples cross (near only)\n    {\n        float2 k2 = float2(1.37, 1.21);\n        sk2 = lerp(RBW_Silk(float2(X * 1.37 + 3.1, v5 * 1.21 - time * 1.3), dxS * k2, dyS * k2, distV, float2(0.31, 0.17)), sk2, smoothstep(22.0, 34.0, distV));\n    }\n/ or die 'sk';
  $h =~ s/\(1\.0 - smoothstep\(1\.35, 1\.75, abs\(dlW\)\)\) \* \(1\.0 - smoothstep\(1\.75, 2\.45, backS\)\)/(1.0 - smoothstep(1.5, 1.9, abs(dlW))) * (1.0 - smoothstep(1.9, 2.6, backS))/;
  spew("$root/Water/Shaders/RainbowRiver.hlsl", $h); print "river ok\n";
}
my $t = slurp("$root/Water/Editor/WaterTextureFactory.cs");
$t =~ s/imp\.anisoLevel = 8;/imp.anisoLevel = 5;/;
spew("$root/Water/Editor/WaterTextureFactory.cs", $t);
my $m = slurp("$root/Water/Textures/RainbowSilk05.png.meta");
$m =~ s/aniso: 8/aniso: 5/; spew("$root/Water/Textures/RainbowSilk05.png.meta", $m);
print "done\n";
