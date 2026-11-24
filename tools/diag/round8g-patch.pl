use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
my $h = slurp("$root/Water/Shaders/RainbowRiver.hlsl");
my $new = <<'END';
    // the wake behind him (standing waves in his frame): broad luminous cyan arcs bowed over his track with a bright broken line on each crest,
    // two soft pink sweeps (measured on the approved picture: middle at 0.07 + 0.44 x back from an axis 0.06 m right of him, half width ~0.2 m)
    float bow = back - 0.8 * dlW * dlW + 0.014 * sin(bt * 2.2 + dlW * 5.0) + 0.01 * sin(bt * 3.7 + dlW * 9.0);
    float wakeA = bOn * wk * smoothstep(0.8, 1.25, back) * (1.0 - smoothstep(3.3, 4.0, back)) * (1.0 - smoothstep(1.7, 2.15, abs(dlW)));
    float dlS = dlW - 0.06;
    float tS = (abs(dlS) - (0.07 + 0.44 * back) - 0.03 * sin(v5 * 1.3 + dlS * 3.0)) / (0.16 + 0.05 * back);
    float sw = exp(-tS * tS * 0.95) * smoothstep(1.0, 1.6, back) * (1.0 - smoothstep(2.4, 3.2, back));
    float gk = saturate(sw * (0.6 + 0.8 * T));
    float mid = 1.0 - smoothstep(-1.4, -0.5, tS);                               // 1 between the two sweeps
    float ph5 = (bow - 1.42) / 0.52;
    float ca = frac(ph5 + 0.5) - 0.5, cid = floor(ph5 + 0.5);
    float aSeg = smoothstep(0.12, 0.55, RBW_VNoise(float2(dlW * 2.6 + 9.0 + cid * 1.3, cid * 3.7 + bt * 0.15)));
    float arcOn = smoothstep(1.15, 1.6, bow);
    float arcB = exp(-ca * ca / (0.17 * 0.17)) * arcOn, arcL = exp(-ca * ca * 230.0) * aSeg * arcOn;
    float Yc = 0.13 + (row - 0.333) * _SheenLook.z * 1.1 + arcB * (0.14 + 0.16 * aSeg) + arcL * 0.4;
    float Yw = lerp(0.22 + (row - 0.333) * 0.75, Yc, mid);
    Yw = lerp(Yw, 0.27 + (row - 0.333) * 1.15, smoothstep(0.1, 0.7, gk));
    Y = lerp(Y, Yw, wakeA);
    float qw = lerp(0.1, 1.5, smoothstep(0.06, 0.85, gk));
    qe = lerp(qe, qw + (T - 0.5) * 0.3, wakeA * max(smoothstep(0.04, 0.3, gk), mid));

    float3 c5 = RBW_RampY(qe, Y, zone);
END
$h =~ s/    \/\/ Benny's wake: the standing wake in his frame.*?    float3 c5 = RBW_RampY\(qe, Y, zone\);\n/$new/s or die 'wake block';
$h =~ s/float lk = max\(latherW \* 0\.8, latherB \* 0\.62\)/float lk = max(latherW * 0.52, latherB * 0.6)/;
spew("$root/Water/Shaders/RainbowRiver.hlsl", $h); print "ok\n";
