use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
my $p = slurp("$root/Environment/Shaders/RainbowPolish05.hlsl");
unless ($p =~ /polished bevel/) {
  $p =~ s/    c = lerp\(c, lerp\(float3\(138, 104, 118\), float3\(84, 60, 92\), smoothstep\(10\.0, 110\.0, v\)\), smoothstep\(0\.945, 0\.952, u\)\);\n/    \/\/ round 8: the end is a polished bevel that mirrors the water (approved: copper -> rose grey -> azure toward the stream), not a dark plate\n    float te = saturate((u - 0.946) \/ 0.054);\n    float3 endC = lerp(float3(238, 152, 92), float3(188, 124, 112), smoothstep(0.0, 0.4, te));\n    endC = lerp(endC, float3(112, 116, 168), smoothstep(0.35, 0.75, te));\n    endC = lerp(endC, float3(44, 128, 214), smoothstep(0.72, 1.0, te));\n    endC *= lerp(1.06, 0.82, smoothstep(10.0, 130.0, v));\n    endC = lerp(endC, float3(255, 226, 190), RbLine(te, 0.12, 0.07) * 0.5);\n    c = lerp(c, endC, smoothstep(0.945, 0.952, u));\n/ or die 'end';
  $p =~ s/    c = lerp\(float3\(206, 176, 196\), c, RbStep\(v, 12\.5, 1\.0\)\);\n    c = lerp\(c, float3\(255, 250, 250\), 1\.0 - smoothstep\(3\.0, 6\.0, v\)\);\n/    c = lerp(lerp(float3(250, 198, 168), float3(226, 150, 128), smoothstep(3.0, 11.0, v)), c, RbStep(v, 11.0, 1.0));   \/\/ round 8: a warm rolled edge, only a thin white line\n    c = lerp(c, float3(255, 244, 236), 1.0 - smoothstep(1.2, 3.2, v));\n/ or die 'lip';
  spew("$root/Environment/Shaders/RainbowPolish05.hlsl", $p); print "frame ok\n";
}
my $g = slurp("$root/Water/Shaders/RainbowRiverGlints.shader");
unless ($g =~ /cyan halo/) {
  $g =~ s/float fs = \(cls > 2\.5 \? 1\.1 : 0\.85\)/float fs = (cls > 2.5 ? 1.3 : 0.9)/ or die 'fs';
  $g =~ s/                a = saturate\(a \* i\.col\.a\);\n                return half4\(i\.col\.rgb \* a, a\);/                \/\/ round 8: a soft cyan halo round the white sliver (approved glints glow)\n                float core = saturate(a * i.col.a);\n                float halo = i.uvk.z < 0.5 ? 0.0 : exp(-(x * x * 1.6 + y * y * 1.0) * 5.5) * saturate(1.0 - x) * saturate(1.0 - y) * 0.42 * i.col.a;\n                a = saturate(core + halo * (1.0 - core));\n                float3 rgb = lerp(float3(0.12, 0.78, 1.0), i.col.rgb, i.uvk.z < 0.5 ? 1.0 : saturate(core * 1.4));\n                return half4(rgb * a, a);/ or die 'halo';
  spew("$root/Water/Shaders/RainbowRiverGlints.shader", $g); print "glints ok\n";
}
my $h = slurp("$root/Water/Shaders/RainbowRiver.hlsl");
unless ($h =~ /0\.20 \+ 0\.07/) {
  $h =~ s/\/ \(0\.16 \+ 0\.05 \* back\);/\/ (0.20 + 0.07 * back);/ or die 'ww';
  $h =~ s/Yw = lerp\(Yw, 0\.37 \+ \(row - 0\.333\) \* 1\.1, smoothstep\(0\.1, 0\.7, gk\)\);/Yw = lerp(Yw, 0.42 + (row - 0.333) * 1.25, smoothstep(0.1, 0.7, gk));/ or die 'yp';
  $h =~ s/clamp\(wm\.r, 0\.06, 0\.6\) \+ \(row - 0\.333\) \* 0\.34 \+ arcL \* 0\.1, 0\.8/clamp(wm.r, 0.06, 0.6) + (row - 0.333) * 0.34 + (arcL * 0.3 + arcB * (0.05 + 0.07 * aSeg)) * mid, 0.8/ or die 'arc';
  spew("$root/Water/Shaders/RainbowRiver.hlsl", $h); print "river ok\n";
}
