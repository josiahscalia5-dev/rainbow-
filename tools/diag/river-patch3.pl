# one-time helper (2026-11-24, round 8): sheen maps + ramp rows + vignette compensation in the river shader
use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow/Water';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }

my $h = slurp("$root/Shaders/RainbowRiver.hlsl");
unless ($h =~ /_RiverSheen/) {
  $h =~ s/(TEXTURE2D\(_RiverRamp\); SAMPLER\(sampler_RiverRamp\);\n)/$1TEXTURE2D(_RiverSheen); SAMPLER(sampler_RiverSheen);\nTEXTURE2D(_WakeSheen); SAMPLER(sampler_WakeSheen);\n/ or die 'a';
  $h =~ s/(#define _GlintLook float4\(0\.75, 0\.9, 0\.0, 0\.0\)\n)/$1#define _SheenLook float4(0.85, 0.75, 0.5, 1.0)\n/ or die 'b';
  $h =~ s/float3 RBW_Ramp\(float q, float t, float zone\)\n\{\n    float y = clamp\(1\.0 - sqrt\(saturate\(1\.0 - t\)\), 0\.5 \/ 16\.0, 15\.5 \/ 16\.0\) \* 0\.5;/float3 RBW_RampY(float q, float row, float zone)\n{\n    float y = clamp(row, 0.5 \/ 16.0, 15.5 \/ 16.0) * 0.5;/ or die 'c';
  $h =~ s/(    return lerp\(a, b, zone\);\n\}\n)/$1\nfloat3 RBW_Ramp(float q, float t, float zone)\n{\n    return RBW_RampY(q, 1.0 - sqrt(saturate(1.0 - t)), zone);\n}\n/ or die 'd';
  # sheen + wake block: from the arcs to the ramp lookup
  my $new = <<'END';
    // broad sheen (large soft reflections; they stay with the view distance while the ripples run through them) + streak detail
    float row = 1.0 - sqrt(saturate(1.0 - T));
    float bt = time - 1.5;
    float2 shv = float2((q + 3.0) / 6.0, log2(distV / 3.5) / 5.5) + float2(0.012 * sin(bt * 0.62 + q * 1.7), 0.01 * sin(bt * 0.47 + distV * 0.2));
    float broad = SAMPLE_TEXTURE2D_LOD(_RiverSheen, sampler_RiverSheen, shv, 0).r;
    float Y = lerp(0.333, broad, _SheenLook.x) + (row - 0.333) * _SheenLook.y;

    // Benny's wake: the standing wake in his frame (broad luminous arcs bowed over his track, two pink sweeps), streaks run through it
    float bk = back + 0.02 * sin(bt * 2.2 + dlW * 4.0 - back * 1.5) + 0.012 * sin(bt * 3.7 + back * 5.0);
    float2 wuv = float2((dlW + 0.012 * sin(bt * 2.9 + back * 6.0) + 2.2) / 4.4, (bk - 0.2) / 3.6);
    float3 wm = SAMPLE_TEXTURE2D_LOD(_WakeSheen, sampler_WakeSheen, wuv, 0).rgb;
    float wakeA = bOn * wk * smoothstep(0.8, 1.2, back) * (1.0 - smoothstep(3.2, 3.7, back)) * (1.0 - smoothstep(1.75, 2.1, abs(dlW))) * saturate(wm.b * 1.4);
    float qw = wm.g < 0.5 ? lerp(0.12, 1.0, wm.g * 2.0) : lerp(1.0, 1.55, wm.g * 2.0 - 1.0);
    qe = lerp(qe, qw + (T - 0.5) * 0.3, wakeA);
    Y = lerp(Y, wm.r + (row - 0.333) * _SheenLook.z, wakeA);

    float3 c5 = RBW_RampY(qe, Y, zone);
END
  $h =~ s/    \/\/ his wake water: broad luminous cyan arcs.*?float3 c5 = RBW_Ramp\(qe, T, zone\);\n/$new/s or die 'e';
  $h =~ s/    float qw = 1\.45 \+ 0\.6 \* clamp\(tW5, -1\.4, 1\.2\) - 0\.14;[^\n]*\n    qe = lerp\(qe, \(T - 0\.5\) \* 0\.3, inW\);\n    qe = lerp\(qe, qw \+ \(T - 0\.5\) \* 0\.3, sweepW\);\n// or die 'f';
  $h =~ s/    float sweepW = [^\n]*\n// or die 'g';
  $h =~ s/float gl = saturate\(\(glint - 0\.34\) \* 1\.7\) \* tw \* \(1\.0 - 0\.5 \* inW\);/float gl = saturate((glint - 0.34) * 1.7) * tw * (1.0 - 0.5 * wakeA);/ or die 'h';
  spew("$root/Shaders/RainbowRiver.hlsl", $h); print "hlsl ok\n";
}
my $s = slurp("$root/Shaders/RainbowRiver.shader");
unless ($s =~ /_RiverSheen/) {
  $s =~ s/(        _GlintLook \("Glint mix[^\n]*\n)/$1        [NoScaleOffset] _RiverSheen ("Broad sheen (q, log distance)", 2D) = "gray" {}\n        [NoScaleOffset] _WakeSheen ("Standing wake (dl, back)", 2D) = "black" {}\n        _SheenLook ("Sheen strength, streak detail, wake streak detail, vignette compensation", Vector) = (0.85, 0.75, 0.5, 1)\n/ or die 'i';
  $s =~ s/(            float4 _GlintLook;\n)/$1            float4 _SheenLook;\n/ or die 'j';
  $s =~ s/(                outCol = MixFog\(outCol, i\.fogFactor\);)/                \/\/ round 8: the scene vignette would dim the measured water colours (the approved water is as bright at the edges)\n                float2 vd = abs(i.positionCS.xy \/ _ScaledScreenParams.xy - 0.5) * 0.57;\n                float vf = saturate(1.0 - dot(vd, vd));\n                outCol \/= lerp(1.0, max(vf * vf, 0.6), _SheenLook.w);\n$1/ or die 'k';
  spew("$root/Shaders/RainbowRiver.shader", $s); print "shader ok\n";
}
my $w = slurp("$root/Editor/WaterBuilder.cs");
unless ($w =~ /SheenLook/) {
  $w =~ s/GlintLook = new Vector4\(0\.7f, 0\.35f, 0\.1f, 0f\)/GlintLook = new Vector4(0.7f, 0.35f, 0f, 0f), SheenLook = new Vector4(0.85f, 0.75f, 0.5f, 1f)/ or die 'l';
  $w =~ s/(            mat\.SetVector\("_GlintLook", GlintLook\);\n)/$1            mat.SetTexture("_RiverSheen", AssetDatabase.LoadAssetAtPath<Texture2D>(WaterSheenFactory.SheenPath));\n            mat.SetTexture("_WakeSheen", AssetDatabase.LoadAssetAtPath<Texture2D>(WaterSheenFactory.WakePath));\n            mat.SetVector("_SheenLook", SheenLook);\n/ or die 'm';
  spew("$root/Editor/WaterBuilder.cs", $w); print "builder ok\n";
}
