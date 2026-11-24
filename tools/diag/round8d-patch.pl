use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
# (a) far coins of the long course fade in by distance
my $c = slurp("$root/Gameplay/Scripts/CoinTrail.cs");
unless ($c =~ /FarScale/) {
  $c =~ s/(                float scale = slots\[i\]\.scale > 0\.01f \? slots\[i\]\.scale : CoinScale;\n)/$1                scale *= FarScale(slots[i].s, Screen05Events.BennyS);\n/ or die 'coin scale';
  $c =~ s/(        \/\/\/ <summary>The far approved coins hang higher)/        \/\/\/ <summary>Coins of the long course (not part of the approved picture) grow in far ahead, where they are a few pixels.<\/summary>\n        static float FarScale(float s, float bennyS)\n        {\n            if (s < 125f) return 1f;\n            return 1f - Mathf.SmoothStep(0f, 1f, Mathf.InverseLerp(72f, 100f, s - bennyS));\n        }\n\n$1/ or die 'coin fn';
  spew("$root/Gameplay/Scripts/CoinTrail.cs", $c); print "coins ok\n";
}
# (b) far puffs shrink away (the flat lather of the river shader stays)
my $f = slurp("$root/Water/Shaders/RainbowFoam.hlsl");
unless ($f =~ /104\.0, 135\.0/) {
  $f =~ s/(    k = lerp\(k, 1\.0, wakePuff\);\n)/    k *= 1.0 - smoothstep(104.0, 135.0, distance(_WorldSpaceCameraPos, c));\n$1/ or die 'foam far';
  spew("$root/Water/Shaders/RainbowFoam.hlsl", $f); print "foam ok\n";
}
# (c) (d) (e) (j) river
my $s = slurp("$root/Water/Shaders/RainbowRiver.shader");
$s =~ s/outCol = MixFog\(outCol, i\.fogFactor\);/outCol = lerp(outCol, MixFog(outCol, i.fogFactor), 0.4);   \/\/ round 8: the far river stays saturated up to the throat/;
spew("$root/Water/Shaders/RainbowRiver.shader", $s);
my $h = slurp("$root/Water/Shaders/RainbowRiver.hlsl");
$h =~ s/(    float broad = SAMPLE_TEXTURE2D_LOD\(_RiverSheen, sampler_RiverSheen, shv, 0\)\.r;)/$1\n    broad = clamp(broad, 0.1, 0.5);/ unless $h =~ /clamp\(broad/;
$h =~ s/    \/\/ the sweeps run up to his flanks.*?    float qw = [^\n]*\n/    \/\/ the two pink sweeps: soft, streaky, feathered into violet and blue (no hard fins)\n    float gk = saturate(wm.g * (0.5 + 0.95 * T));\n    float qw = lerp(0.15, 1.5, smoothstep(0.12, 0.8, gk));\n/s or die 'sweep';
$h =~ s/    Y = lerp\(Y, 0\.3 \+ \(wm\.r - 0\.3\) \* 1\.2 \+ \(row - 0\.333\) \* _SheenLook\.z, wakeA\);/    float arcP = frac((bk - 0.8 * dlW * dlW - 1.42) \/ 0.52 + 0.5) - 0.5;\n    float arcN = smoothstep(0.1, 0.5, RBW_VNoise(float2(dlW * 3.1 + 9.0, floor((bk - 0.8 * dlW * dlW - 1.42) \/ 0.52 + 0.5) * 3.7)));\n    float arcLine = exp(-arcP * arcP * 160.0) * (0.25 + 0.75 * arcN) * smoothstep(1.2, 1.55, bk) * (1.0 - wm.g);\n    float Yw = lerp(0.3 + (min(wm.r, 0.62) - 0.3) * 1.15, 0.28, 3.2 * gk * (1.0 - gk) * 0.6) + (row - 0.333) * _SheenLook.z + arcLine * 0.22;\n    Y = lerp(Y, Yw, wakeA);/ or die 'Yw';
spew("$root/Water/Shaders/RainbowRiver.hlsl", $h); print "river ok\n";
# (k) wake glints a little longer again
my $g = slurp("$root/Water/Shaders/RainbowRiverGlints.shader");
$g =~ s/float fs = 0\.8 \+ \(cls < 0\.5/float fs = (cls > 2.5 ? 1.1 : 0.85) + (cls < 0.5/;
spew("$root/Water/Shaders/RainbowRiverGlints.shader", $g);
# (f) feet
my $b = slurp("$root/Gameplay/Editor/BennyRigBuilder.cs");
$b =~ s/FlatFluff\("Benny_Feet", new Color\(0\.93f, 0\.52f, 0\.72f, 1f\)\);/FlatFluff("Benny_Feet", new Color(0.97f, 0.40f, 0.68f, 1f));\n            if (m.HasProperty("_FurTint")) m.SetVector("_FurTint", new Vector4(1f, 1f, 1f, 0f));/;
spew("$root/Gameplay/Editor/BennyRigBuilder.cs", $b);
# (g) landing: no double step
my $bc = slurp("$root/Benny/Scripts/BennyController.cs");
unless ($bc =~ /rideDt/) {
  $bc =~ s/(            \/\/ ---- jump\n)/            float rideDt = dt;\n$1/ or die 'ridedt';
  $bc =~ s/                    ride \+= Mathf\.Max\(height, -0\.3f\);\n/                    rideDt = Mathf.Clamp(-height \/ Mathf.Max(0.5f, -vy), 0f, dt);   \/\/ the part of this frame after he touched the water\n/ or die 'land';
  $bc =~ s/float h = dt \/ sub;/float h = rideDt \/ sub;/ or die 'h';
  spew("$root/Benny/Scripts/BennyController.cs", $bc); print "landing ok\n";
}
# (h) wall rows
my $p = slurp("$root/Environment/Shaders/RainbowPolish05.hlsl");
$p =~ s/max\(p \/ \(0\.2 \* max\(dist, 4\.0\)\), 1e-3\)/max(p \/ (0.125 * max(dist, 5.0)), 1e-3)/;
spew("$root/Environment/Shaders/RainbowPolish05.hlsl", $p); print "done\n";
