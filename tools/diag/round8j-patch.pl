use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
my $h = slurp("$root/Water/Shaders/RainbowRiver.hlsl");
$h =~ s/float dlS = dlW - 0\.06;/float dlS = dlW - 0.03;/;
$h =~ s/\(abs\(dlS\) - \(0\.03 \+ 0\.475 \* back\) -/(abs(dlS) - (0.21 + 0.5 * back) -/ or die 'cw';
$h =~ s/    Yw = lerp\(Yw, 0\.37 \+ \(row - 0\.333\) \* 1\.1, smoothstep\(0\.1, 0\.7, gk\)\);\n/    Yw = lerp(Yw, 0.37 + (row - 0.333) * 1.1, smoothstep(0.1, 0.7, gk));\n    \/\/ the approved standing pattern (broad light only) between and on the sweeps; it breathes with the bow wobble\n    float2 wuv = float2((dlW + 0.012 * sin(bt * 2.9 + back * 6.0) + 2.2) \/ 4.4, (back + (bow - back + 0.8 * dlW * dlW) * 1.2 - 0.2) \/ 3.6);\n    float3 wm = SAMPLE_TEXTURE2D_LOD(_WakeSheen, sampler_WakeSheen, wuv, 0).rgb;\n    Yw = lerp(Yw, clamp(wm.r, 0.06, 0.6) + (row - 0.333) * 0.34 + arcL * 0.1, 0.8 * saturate(wm.b * 1.3 - 0.2) * max(mid, smoothstep(0.1, 0.6, gk)));\n/ unless $h =~ /approved standing pattern/;
spew("$root/Water/Shaders/RainbowRiver.hlsl", $h);
my $b = slurp("$root/Water/Scripts/FoamBank.cs");
$b =~ s/float dl = 0\.6f \+ 0\.52f \* b \+/float dl = 0.6f + 0.48f * b +/;
spew("$root/Water/Scripts/FoamBank.cs", $b);
my $c = slurp('/c/RainbowUnity/UnityProject/AgentScripts/screen05_sheen_calibrate.cs');
$c =~ s/, r2 = Apply\(Rainbow\.Screen05\.EditorTools\.WaterSheenFactory\.WakePath, acw, ww\);/, r2 = "wake map untouched";/;
spew('/c/RainbowUnity/UnityProject/AgentScripts/screen05_sheen_calibrate.cs', $c);
print "ok\n";
