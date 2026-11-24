use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
my $h = slurp("$root/Water/Shaders/RainbowRiver.hlsl");
unless ($h =~ /_LaceTex/) {
  $h =~ s/(TEXTURE2D\(_WakeSheen\); SAMPLER\(sampler_WakeSheen\);\n)/$1TEXTURE2D(_LaceTex); SAMPLER(sampler_LaceTex);\n/ or die 'lace decl';
  # sweeps measured on the approved picture (Benny frame): centre 0.07 + 0.44 back, half width ~0.2, axis 0.06 m right
  $h =~ s/    \/\/ the two pink sweeps: soft, streaky.*?    float qw = [^\n]*\n/    \/\/ the two pink sweeps (measured: middle at 0.07 + 0.44 x back from an axis 0.06 m right of him, half width ~0.2 m): soft, streaky, feathered\n    float dlS = dlW - 0.06;\n    float tS = (abs(dlS) - (0.07 + 0.44 * back) - 0.03 * sin(v5 * 1.3 + dlS * 3.0)) \/ (0.15 + 0.045 * back);\n    float sw = exp(-tS * tS * 1.05) * smoothstep(1.05, 1.5, back) * (1.0 - smoothstep(2.9, 3.5, back));\n    float gk = saturate(sw * (0.62 + 0.75 * T));\n    float qw = lerp(0.1, 1.5, smoothstep(0.1, 0.72, gk));\n/s or die 'sweep';
  $h =~ s/arcLine = (.*?) \* \(1\.0 - wm\.g\);/arcLine = $1 * (1.0 - gk);/ or die 'arc';
  $h =~ s/    float Yw = lerp\(.*?;\n/    float Yw = 0.3 + (clamp(wm.r, 0.08, 0.62) - 0.3) * 1.15 + (row - 0.333) * _SheenLook.z + arcLine * 0.22;\n    Yw = lerp(Yw, 0.24 + (row - 0.333) * 0.95, smoothstep(0.12, 0.6, gk));\n/ or die 'Yw';
  # lacy lather on the water: outside the sweeps and along the banks
  my $lace = <<'END';
    // soap lace lying on the water: a broken rope outside each wake sweep and a thin web along the foam waterlines
    float latherW = exp(-(tS - 1.75) * (tS - 1.75) * 3.2) * wakeA * smoothstep(0.85, 1.2, back) * (1.0 - smoothstep(2.5, 3.1, back));
    float latherB = exp(-(max(wl - lat, lat - wr) + 0.1) * (max(wl - lat, lat - wr) + 0.1) * 60.0) * (1.0 - smoothstep(22.0, 40.0, distV));
    [branch] if (latherW + latherB > 0.02)
    {
        float4 lc = SAMPLE_TEXTURE2D_LOD(_LaceTex, sampler_LaceTex, float2(lat * 0.55, (latherW > latherB ? s : v5) * 0.4), clamp(log2(distV / 6.0), 0.0, 5.0));
        float lh = max(lc.r, lc.g * 0.9);
        float lk = max(latherW * 0.8, latherB * 0.62) * (0.55 + 0.8 * lc.b);
        float la = smoothstep(1.02 - lk * 0.75, 1.2 - lk * 0.75, lh + 0.25);
        c5 = lerp(c5, lerp(float3(0.5, 0.72, 1.0), float3(0.95, 0.96, 1.02), la), saturate(la * saturate(lk * 1.6)));
    }

END
  $h =~ s/(    \/\/ ---- surface: ripples catch the light \(emboss\))/$lace$1/ or die 'lather';
  spew("$root/Water/Shaders/RainbowRiver.hlsl", $h); print "river ok\n";
}
my $s = slurp("$root/Water/Shaders/RainbowRiver.shader");
unless ($s =~ /_LaceTex/) {
  $s =~ s/(        \[NoScaleOffset\] _WakeSheen[^\n]*\n)/$1        [NoScaleOffset] _LaceTex ("Foam lace", 2D) = "black" {}\n/ or die 'prop';
  spew("$root/Water/Shaders/RainbowRiver.shader", $s); print "shader ok\n";
}
my $w = slurp("$root/Water/Editor/WaterBuilder.cs");
unless ($w =~ /mat\.SetTexture\("_LaceTex"/) {
  $w =~ s/(            mat\.SetVector\("_SheenLook", SheenLook\);\n)/$1            mat.SetTexture("_LaceTex", AssetDatabase.LoadAssetAtPath<Texture2D>(WaterTextureFactory.LacePath));\n/ or die 'b';
  $w =~ s/lace\.SetVector\("_Web", new Vector4\(0\.2f, 0\.62f, 0\.1f, 0\.42f\)\);/lace.SetVector("_Web", new Vector4(0.36f, 0.66f, 0.12f, 0.5f));/;
  $w =~ s/lace\.SetFloat\("_Bright", 1f\);/lace.SetFloat("_Bright", 0.94f);/;
  spew("$root/Water/Editor/WaterBuilder.cs", $w); print "builder ok\n";
}
my $l = slurp("$root/Water/Shaders/RainbowSplashLace.shader");
$l =~ s/th \+= \(1\.0 - edge\) \* 0\.5;/th += (1.0 - edge) * 0.5 + 0.14 * a * a;/ unless $l =~ /0\.14 \* a \* a/;
$l =~ s/float3 c = lerp\(float3\(0\.42, 0\.66, 1\.02\), float3\(0\.98, 1\.0, 1\.04\), smoothstep\(0\.1, 0\.75, body\)\);/float3 c = lerp(float3(0.34, 0.60, 1.0), float3(0.93, 0.95, 1.02), smoothstep(0.1, 0.85, body));/;
spew("$root/Water/Shaders/RainbowSplashLace.shader", $l);
my $b = slurp("$root/Water/Scripts/FoamBank.cs");
$b =~ s/int n = rng\.Next\(\) < 0\.7f \? 3 : 2;/int n = rng.Next() < 0.6f ? 5 : 4;/;
$b =~ s/float r = \(k == 0 \? rng\.Range\(0\.04f, 0\.085f\) \* \(0\.6f \+ 0\.7f \* cl\) : rng\.Range\(0\.012f, 0\.03f\)\)/float r = (k < 2 ? rng.Range(0.035f, 0.09f) * (0.55f + 0.75f * cl) : rng.Range(0.014f, 0.04f))/;
$b =~ s/float dl = 0\.6f \+ 0\.46f \* b \+ rng\.Range\(-0\.1f, 0\.1f\) \* \(0\.5f \+ 0\.5f \* grow\);/float dl = 0.44f + 0.5f * b + rng.Range(-0.13f, 0.12f) * (0.5f + 0.5f * grow);/;
$b =~ s/k == 0 \? -0\.25f \* r : 0\.01f/k < 2 ? -0.35f * r : 0.0f/;
spew("$root/Water/Scripts/FoamBank.cs", $b);
print "done\n";
