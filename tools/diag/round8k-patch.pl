use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
my $s = slurp("$root/Benny/Shaders/RainbowFluff.shader");
unless ($s =~ /hatZone/) {
  $s =~ s/(                    col = lerp\(col, float3\(0\.95, 0\.33, 0\.6\) \* \(0\.5 \+ 0\.6 \* lum\), pale \* bodyZone \* \(1\.0 - armZone\) \* 0\.6\);\n)/$1                    \/\/ beanie and pompom: the pale blown silhouette becomes lilac wool (approved rims (166,101,232) \/ (194,71,245), Unity (223,190,243))\n                    float hatZone = smoothstep(0.70, 0.80, hB) * _RainbowBennyWater.w;\n                    float rimH = pow(1.0 - saturate(dot(N, V)), 1.3);\n                    col = lerp(col, float3(0.40, 0.17, 0.86) * (0.45 + 0.62 * lum), saturate(pale * rimH * 1.15) * hatZone * 0.75 * (1.0 - smoothstep(0.5, 0.9, (col.r - col.b) * 4.0)));\n/ or die 'hat';
  spew("$root/Benny/Shaders/RainbowFluff.shader", $s); print "hat ok\n";
}
my $h = slurp("$root/Water/Shaders/RainbowRiver.hlsl");
unless ($h =~ /drum wall metal/) {
  $h =~ s/            float3 pfA = .*?            fo = lerp\(fo, pf, fl\);\n/            \/\/ round 8: the same polished magenta-violet drum wall metal as the walls behind it: lengthwise pink light lines, dark slots with a lit lip\n            float3 pf = lerp(RBW_Disp(float3(112, 24, 160)), RBW_Disp(float3(176, 40, 200)), saturate(sheen * 0.9 + 0.1 * ox));\n            float ll = abs(frac(ox * 0.62 + 0.18) - 0.5) \/ 0.62;\n            pf = lerp(pf, RBW_Disp(float3(246, 84, 226)), exp(-pow((0.5 \/ 0.62 - ll) \/ 0.17, 2.0)) * 0.75);\n            pf = lerp(pf, RBW_Disp(float3(255, 214, 250)), exp(-pow((0.5 \/ 0.62 - ll) \/ 0.05, 2.0)) * 0.6);\n            float lipF = (1.0 - smoothstep(1.0, 1.5, length(gf \/ float2(0.2, 0.34)))) * (1.0 - slot) * (1.0 - smoothstep(0.25, 0.7, fgw));\n            pf = lerp(pf, RBW_Disp(float3(232, 96, 220)), lipF * 0.4);\n            pf = lerp(pf, RBW_Disp(float3(44, 6, 52)), slot * 0.9);\n            pf *= lerp(0.6, 1.0, smoothstep(0.0, 0.5, ox));\n            fo = lerp(fo, pf, fl);\n/s or die 'floor';
  spew("$root/Water/Shaders/RainbowRiver.hlsl", $h); print "floor ok\n";
}
