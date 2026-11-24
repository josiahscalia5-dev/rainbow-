use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
my $s = slurp("$root/Benny/Shaders/RainbowFluff.shader");
unless ($s =~ /round 8/) {
  my $new = <<'END';
                // round 8 (2026-11-24): colour match of the approved fur under this grade (measured: approved (247,88,179), Unity (253,61,213) =
                // too magenta); pale tips on the arms and speckles on the body become pink fur
                {
                    float mx = max(col.r, max(col.g, col.b)), mn = min(col.r, min(col.g, col.b));
                    float pinkW = smoothstep(0.02, 0.22, (col.r - col.b) / max(col.r, 1e-3)) * (1.0 - smoothstep(0.38, 0.6, col.g / max(col.r, 1e-3)));
                    col = lerp(col, col * _FurTint.rgb, pinkW * _FurTint.a);
                    float hB = i.positionWS.y - _RainbowBennyWater.x;
                    float dxB = abs(i.positionWS.x - _RainbowBenny.y);
                    float bodyZone = (1.0 - smoothstep(0.60, 0.72, hB)) * _RainbowBennyWater.w;
                    float armZone = smoothstep(0.72, 0.82, dxB) * (1.0 - smoothstep(0.82, 0.95, hB)) * _RainbowBennyWater.w;
                    float pale = smoothstep(0.28, 0.62, mn / max(mx, 1e-3));
                    float lum = dot(col, float3(0.3, 0.5, 0.2));
                    col = lerp(col, float3(0.84, 0.21, 0.48) * (0.62 + 0.55 * lum), pale * armZone * 0.85);
                    col = lerp(col, float3(0.95, 0.33, 0.6) * (0.5 + 0.6 * lum), pale * bodyZone * (1.0 - armZone) * 0.6);
                }
END
  $s =~ s/(                \/\/ \(splash6\) he sits IN the water: the fur darkens)/$new$1/ or die 'frag';
  $s =~ s/(        _WaterBand \("See-through azure waterline band[^\n]*\n)/$1        _FurTint ("Pink fur colour match (rgb multiplier, strength)", Vector) = (0.96, 1.27, 0.76, 1)\n/ or die 'prop';
  $s =~ s/(CBUFFER_START\(UnityPerMaterial\)\n)/$1            float4 _FurTint;\n/ or die 'cb';
  $s =~ s/(CBUFFER_END\n)/$1        float4 _RainbowBenny;\n/ unless $s =~ /float4 _RainbowBenny;/;
  spew("$root/Benny/Shaders/RainbowFluff.shader", $s); print "fluff ok\n";
}
my $b = slurp("$root/Gameplay/Editor/BennyRigBuilder.cs");
$b =~ s/m\.SetFloat\("_FuzzStrength", 0\.15f\);/m.SetFloat("_FuzzStrength", 0.05f);/;
spew("$root/Gameplay/Editor/BennyRigBuilder.cs", $b);
my $h = slurp("$root/Water/Shaders/RainbowRiver.hlsl");
$h =~ s/    Y = lerp\(Y, wm\.r \+ \(row - 0\.333\) \* _SheenLook\.z, wakeA\);/    Y = lerp(Y, 0.3 + (wm.r - 0.3) * 1.2 + (row - 0.333) * _SheenLook.z, wakeA);/;
spew("$root/Water/Shaders/RainbowRiver.hlsl", $h);
my $w = slurp("$root/Water/Editor/WaterBuilder.cs");
$w =~ s/SheenLook = new Vector4\(0\.85f, 0\.75f, 0\.5f, 1f\)/SheenLook = new Vector4(0.9f, 0.8f, 0.3f, 1f)/;
spew("$root/Water/Editor/WaterBuilder.cs", $w);
print "ok\n";
