use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow/UI/Scripts';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
my $g = slurp("$root/HudGlyphText.cs");
unless ($g =~ /Thin/) {
  $g =~ s/float a = Mathf\.Clamp01\(0\.5f - HudGlyphs\.Sdf\(g, gx \/ k, gy\) \* CapPx\);/float a = Mathf.Clamp01(0.5f - (HudGlyphs.Sdf(g, gx \/ k, gy) + Thin) * CapPx);/ or die 'sdf';
  $g =~ s/(    public sealed class HudGlyphText : MaskableGraphic\n    \{\n)/$1        \/\/\/ <summary>Round 8: the approved counters are a medium weight (stroke ~0.18 of the capital height), lighter than the banner.<\/summary>\n        const float Thin = 0.022f;\n\n/ or die 'cls';
  spew("$root/HudGlyphText.cs", $g); print "digits ok\n";
}
my $u = slurp("$root/UISpriteFactory.cs");
unless ($u =~ /round 8/) {
  $u =~ s/float dV = SegDist\(p, new Vector2\(128, 50\), new Vector2\(128, 206\)\);/float dV = Mathf.Min(SegDist(p, new Vector2(128, 48), new Vector2(128, 74)), SegDist(p, new Vector2(128, 182), new Vector2(128, 208)));   \/\/ round 8: short stubs above and below the S like the approved/ or die 'dollar';
  $u =~ s/(                    c = Over\(c, Color\.white, spec \* 0\.95f \* coverInner\);\n)/$1                    \/\/ round 8: a thin bright glassy rim round the raised heart, strongest at the lower left (approved: pink-white edge light)\n                    float rimL = Mathf.Clamp01((1f - depth) * 1.25f) * (1f - Mathf.SmoothStep(0.15f, 0.55f, depth));\n                    float rimDir = Mathf.Clamp01(0.55f + 0.5f * (0.5f - vy) + 0.35f * (0.5f - x \/ (float)size));\n                    c = Over(c, new Color(1f, 0.72f, 0.86f), rimL * rimDir * 0.7f);\n/ or die 'heart';
  spew("$root/UISpriteFactory.cs", $u); print "sprites ok\n";
}
