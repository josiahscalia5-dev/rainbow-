use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow/UI/Scripts';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
my $u = slurp("$root/UISpriteFactory.cs");
$u =~ s/if \(hudGold\) c = new Color\(Mathf\.Min\(1f, c\.r \* 1\.06f\), Mathf\.Min\(1f, c\.g \* 1\.34f\), Mathf\.Min\(1f, c\.b \* 1\.25f\), c\.a\);/if (hudGold) c = new Color(Mathf.Min(1f, c.r * 1.05f), Mathf.Min(1f, c.g * 1.12f), Mathf.Min(1f, c.b * 0.95f), c.a);/ or die 'gold';
# heart
$u =~ s/Color top = Hex\("#ff5cb0"\), bottom = Hex\("#f01a74"\), rim = Hex\("#d01058"\);/Color top = Hex("#ff58a0"), bottom = Hex("#ee1562"), rim = Hex("#c80a4c");/ or die 'heartcol';
$u =~ s/Color edge = new Color\(c\.r \* 0\.78f, c\.g \* 0\.7f, c\.b \* 0\.78f, 1f\);/Color edge = new Color(c.r * 0.9f, c.g * 0.55f, c.b * 0.72f, 1f);/ or die 'edge';
$u =~ s/                    c = Over\(c, Color\.white, hl \* 0\.45f \* coverInner\);\n/                    c = Over(c, new Color(1f, 0.86f, 0.93f), hl * 0.5f * coverInner);\n/ or die 'hl';
$u =~ s/float spec = Mathf\.SmoothStep\(0f, 1f, Mathf\.Clamp01\(1\.4f \* \(1f - Mathf\.Sqrt\(qx \* qx \* 3f \+ qy \* qy \* 6f\) \/ 0\.16f\)\)\);[^\n]*\n/float qr = qx * 0.82f + qy * 0.57f, qs = -qx * 0.57f + qy * 0.82f;                   \/\/ round 8: a bigger slanted window highlight on the left lobe\n                    float spec = Mathf.SmoothStep(0f, 1f, Mathf.Clamp01(1.5f * (1f - Mathf.Sqrt(qr * qr * 2.2f + qs * qs * 7f) \/ 0.2f)));\n/ or die 'spec';
$u =~ s/c = Over\(c, new Color\(1f, 0\.72f, 0\.86f\), rimL \* rimDir \* 0\.7f\);/c = Over(c, new Color(1f, 0.66f, 0.78f), rimL * rimDir * 0.85f);/ or die 'rim';
# pause ring
$u =~ s/float ring = size \* 0\.048f;/float ring = size * 0.034f;/ or die 'ring';
$u =~ s/(                    c = Over\(c, white, Mathf\.Clamp01\(0\.5f - rd\)\);\n)/$1                    \/\/ round 8: glassy inner line and a soft light on the lower left of the rim\n                    float rd2 = Mathf.Abs(d + ring * 2.7f) - ring * 0.28f;\n                    c = Over(c, new Color(0.82f, 0.62f, 0.96f, 0.55f), Mathf.Clamp01(0.5f - rd2));\n/ or die 'ring2';
spew("$root/UISpriteFactory.cs", $u);
my $h = slurp("$root/Screen05Hud.cs");
$h =~ s/bt, bb, 3\.2f, new Color\(232 \/ 255f, 160 \/ 255f, 246 \/ 255f, 0\.95f\), 0f\), bt, bb,\n.*?\);/bt, bb, 2.6f, new Color(238 \/ 255f, 186 \/ 255f, 250 \/ 255f, 0.95f), 0f), bt, bb,\n                new Vector4(0f, 118f, 8f, 150f), new Vector4(0.08f, 96f, 3f, 131f), new Vector4(0.5f, 94f, 3f, 130f), new Vector4(0.78f, 99f, 4f, 134f),\n                new Vector4(0.86f, 132f, 11f, 152f), new Vector4(0.93f, 164f, 15f, 186f), new Vector4(1f, 178f, 44f, 198f));/s or die 'bar';
spew("$root/Screen05Hud.cs", $h);
my $g = slurp("$root/HudGlyphText.cs");
$g =~ s/const float Thin = 0\.022f;/const float Thin = 0.006f;/ or die 'thin';
spew("$root/HudGlyphText.cs", $g);
print "ok\n";
