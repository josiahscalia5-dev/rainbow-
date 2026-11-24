use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
my $u = slurp("$root/UI/Scripts/UISpriteFactory.cs");
unless ($u =~ /hudGold/) {
  $u =~ s/public static Texture2D CoinFace\(string name, int size\)/public static Texture2D CoinFace(string name, int size, bool hudGold = false)/ or die 'sig';
  $u =~ s/(                    c = Over\(c, bevel, DollarCover\(q \+ new Vector2\(3f, 4f\), 13f\)\);\n)/$1                    \/\/ round 8: the HUD icon is drawn without the scene light: the approved icon is a brighter yellow gold\n                    if (hudGold) c = new Color(Mathf.Min(1f, c.r * 1.06f), Mathf.Min(1f, c.g * 1.34f), Mathf.Min(1f, c.b * 1.25f), c.a);\n/ or die 'px';
  # glossy bar gradient
  $u =~ s/(        \/\/\/ <summary>Round button: translucent dark fill)/        \/\/\/ <summary>Round 8: recolours a pill by rows (glass gloss): stops = (v 0 bottom .. 1 top, r, g, b 0-255); alpha, rim and edges stay.<\/summary>\n        public static Texture2D GlassRows(Texture2D t, Color baseTop, Color baseBottom, params Vector4[] stops)\n        {\n            int w = t.width, h = t.height;\n            Color[] px = t.GetPixels();\n            for (int y = 0; y < h; y++)\n            {\n                float v = y \/ (float)(h - 1);\n                int i = 0;\n                while (i + 2 < stops.Length && v > stops[i + 1].x) i++;\n                float k = Mathf.SmoothStep(0f, 1f, Mathf.InverseLerp(stops[i].x, stops[i + 1].x, v));\n                Vector4 s = Vector4.Lerp(stops[i], stops[i + 1], k);\n                Color want = new Color(s.y \/ 255f, s.z \/ 255f, s.w \/ 255f, 1f), was = Color.Lerp(baseBottom, baseTop, v);\n                for (int x = 0; x < w; x++)\n                {\n                    Color c = px[y * w + x];\n                    if (c.a <= 0f) continue;\n                    float isFill = 1f - Mathf.Clamp01((Mathf.Abs(c.r - was.r) + Mathf.Abs(c.g - was.g) + Mathf.Abs(c.b - was.b)) * 3f);\n                    px[y * w + x] = new Color(Mathf.Lerp(c.r, want.r, isFill), Mathf.Lerp(c.g, want.g, isFill), Mathf.Lerp(c.b, want.b, isFill), c.a);\n                }\n            }\n            t.SetPixels(px);\n            t.Apply(false, false);\n            return t;\n        }\n\n$1/ or die 'glass';
  spew("$root/UI/Scripts/UISpriteFactory.cs", $u); print "sprites ok\n";
}
my $h = slurp("$root/UI/Scripts/Screen05Hud.cs");
unless ($h =~ /GlassRows/) {
  $h =~ s/            return UISpriteFactory\.Pill\("hud_bar", 992, 109, 54f,\n\s*new Color\(101 \/ 255f, 3 \/ 255f, 134 \/ 255f, 1f\), new Color\(91 \/ 255f, 2 \/ 255f, 127 \/ 255f, 1f\),\n\s*3\.2f, new Color\(226 \/ 255f, 150 \/ 255f, 240 \/ 255f, 0\.9f\), 0\.03f\);/            \/\/ round 8: glossy glass - a bright magenta reflection under the top rim (measured (165,12,190) at y 25, (150,16,155) at y 30), deep violet body\n            Color bt = new Color(101 \/ 255f, 3 \/ 255f, 134 \/ 255f, 1f), bb = new Color(91 \/ 255f, 2 \/ 255f, 127 \/ 255f, 1f);\n            return UISpriteFactory.GlassRows(UISpriteFactory.Pill("hud_bar", 992, 109, 54f, bt, bb, 3.2f, new Color(232 \/ 255f, 160 \/ 255f, 246 \/ 255f, 0.95f), 0f), bt, bb,\n                new Vector4(0f, 112f, 4f, 142f), new Vector4(0.12f, 96f, 3f, 131f), new Vector4(0.5f, 95f, 3f, 130f), new Vector4(0.7f, 112f, 6f, 141f),\n                new Vector4(0.83f, 148f, 13f, 162f), new Vector4(0.93f, 168f, 16f, 190f), new Vector4(1f, 176f, 40f, 196f));/ or die 'bar';
  $h =~ s/UISpriteFactory\.CoinFace\("hud_coin", 128\)/UISpriteFactory.CoinFace("hud_coin", 128, true)/;
  spew("$root/UI/Scripts/Screen05Hud.cs", $h); print "bar ok\n";
}
my $g = slurp("$root/Gameplay/Editor/GameplayBuilder.cs");
$g =~ s/UISpriteFactory\.CoinFace\("Hud_Coin", (\d+)\)/UISpriteFactory.CoinFace("Hud_Coin", $1, true)/ and print "builder coin ok\n";
spew("$root/Gameplay/Editor/GameplayBuilder.cs", $g);
