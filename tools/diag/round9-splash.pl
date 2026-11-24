use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
# --- builder: strand texture on the splash + river materials
my $b = slurp("$root/Water/Editor/WaterBuilder.cs");
unless ($b =~ /StrandPath/) {
  $b =~ s/lace\.SetTexture\("_LaceTex", AssetDatabase\.LoadAssetAtPath<Texture2D>\(WaterTextureFactory\.LacePath\)\);/lace.SetTexture("_StrandTex", AssetDatabase.LoadAssetAtPath<Texture2D>(WaterTextureFactory.StrandPath));/ or die 'lace';
  $b =~ s/lace\.SetFloat\("_Len", 1\.45f\);/lace.SetFloat("_Len", 1.3f);/ or die 'len';
  $b =~ s/lace\.SetFloat\("_Height", 0\.16f\);/lace.SetFloat("_Height", 0.14f);/ or die 'h';
  $b =~ s/lace\.SetFloat\("_Bright", 0\.94f\);/lace.SetFloat("_Bright", 1f);/ or die 'br';
  $b =~ s/lace\.SetVector\("_Shape", new Vector4\(0\.16f, 1\.82f, 0\.9f, 0\.1f\)\);/lace.SetVector("_Shape", new Vector4(0.3f, 1.9f, 0.95f, 0.1f));/ or die 'shape';
  $b =~ s/lace\.SetVector\("_Web", new Vector4\([^)]*\)\);/lace.SetVector("_Thread", new Vector4(0.46f, 0.13f, 0.12f, 0.16f));\n            lace.SetVector("_Reach", new Vector4(1.15f, 0.5f, 0.56f, 1f));/ or die 'web';
  $b =~ s/lace\.SetVector\("_Tile", new Vector4\([^)]*\)\);/lace.SetVector("_Tile", new Vector4(2.1f, 1.25f, 2.4f, 1f));/ or die 'tile';
  $b =~ s/(            mat\.SetTexture\("_LaceTex", [^\n]+\n)/$1            mat.SetTexture("_StrandTex", AssetDatabase.LoadAssetAtPath<Texture2D>(WaterTextureFactory.StrandPath));\n            mat.SetVector("_StrandLook", new Vector4(0.5f, 0.12f, 1.0f, 0.75f));\n            mat.SetVector("_SweepLook", new Vector4(1f, 1f, 1f, 0.7f));\n/ or die 'mat';
  spew("$root/Water/Editor/WaterBuilder.cs", $b); print "builder ok\n";
}
my $s = slurp("$root/Water/Shaders/RainbowRiver.shader");
unless ($s =~ /_StrandTex/) {
  $s =~ s/(        \[NoScaleOffset\] _LaceTex [^\n]+\n)/$1        [NoScaleOffset] _StrandTex ("Splash strands", 2D) = "white" {}\n        _StrandLook ("Wake lather: thread half width, softness, tiles round him, tiles along", Vector) = (0.5, 0.12, 1.0, 0.75)\n        _SweepLook ("Pink wake sweeps: width, softness, light, lather on the pink", Vector) = (1, 1, 1, 0.7)\n/ or die 'prop';
  $s =~ s/(            float4 _LatherLook;\n)/$1            float4 _StrandLook, _SweepLook;\n/ or die 'cb';
  spew("$root/Water/Shaders/RainbowRiver.shader", $s); print "river.shader ok\n";
}
my $h = slurp("$root/Water/Shaders/RainbowRiver.hlsl");
unless ($h =~ /_StrandTex/) {
  $h =~ s/(TEXTURE2D\(_LaceTex\); SAMPLER\(sampler_LaceTex\);\n)/$1TEXTURE2D(_StrandTex); SAMPLER(sampler_StrandTex);\n/ or die 'tex';
  $h =~ s/(#define _LatherLook [^\n]+\n)/$1#define _StrandLook float4(0.5, 0.12, 1.0, 0.75)\n#define _SweepLook float4(1.0, 1.0, 1.0, 0.7)\n/ or die 'def';
  # wider, softer sweeps
  $h =~ s/float tS = \(abs\(dlS\) - \(0\.21 \+ 0\.5 \* back\) - 0\.03 \* sin\(v5 \* 1\.3 \+ dlS \* 3\.0\)\) \/ \(0\.20 \+ 0\.07 \* back\);/float tS = (abs(dlS) - (0.21 + 0.5 * back) - 0.03 * sin(v5 * 1.3 + dlS * 3.0)) \/ ((0.20 + 0.07 * back) * _SweepLook.x);/ or die 'tS';
  $h =~ s/float gk = saturate\(sw \* \(0\.6 \+ 0\.8 \* T\)\);/float gk = saturate(sw * (0.78 + 0.44 * T));/ or die 'gk';
  # colour: cyan -> periwinkle -> violet -> hot pink satin, blended as colours (no hard edge from the ramp)
  my $satin = <<'HL';
    qe = lerp(qe, 0.1 + (T - 0.5) * 0.3, wakeA * max(smoothstep(0.04, 0.3, gk), mid));

    float3 c5 = RBW_RampY(qe, Y, zone);
    float swK = 0.0;
    [branch] if (wakeA * gk > 0.004)
    {
        float Ys = clamp(Y * _SweepLook.z, 0.05, 0.75);
        float3 cP = RBW_RampY(1.5 + (T - 0.5) * 0.3, Ys, zone) * float3(1.07, 0.99, 0.93);
        float3 cV = lerp(RBW_Disp(float3(72, 70, 226)), RBW_Disp(float3(176, 132, 255)), saturate((Ys - 0.15) * 2.2));
        float w1 = smoothstep(0.02, 0.02 + 0.42 * _SweepLook.y, gk), w2 = smoothstep(0.28, 0.28 + 0.55 * _SweepLook.y, gk);
        swK = wakeA * w2;
        c5 = lerp(c5, cV, wakeA * w1 * 0.9);
        c5 = lerp(c5, cP, swK);
    }
HL
  $h =~ s/    float qw = lerp\(0\.1, 1\.5, smoothstep\(0\.06, 0\.85, gk\)\);\n    qe = lerp\(qe, qw \+ \(T - 0\.5\) \* 0\.3, wakeA \* max\(smoothstep\(0\.04, 0\.3, gk\), mid\)\);\n\n    float3 c5 = RBW_RampY\(qe, Y, zone\);\n/$satin/ or die 'qw';
  # less lather on the pink satin
  $h =~ s/(    float latherW = wakeFoam;\n)/    float latherW = wakeFoam * (1.0 - _SweepLook.w * swK);\n/ or die 'latherW';
  # strand web for the wake lather
  my $lather = <<'HL';
        float la;
        if (wl5)
        {
            luv = float2(atan2(dlW - 0.03, backS + 0.35) * 1.15 * _StrandLook.z + 0.05 * sin(rB * 4.0 + bt * 0.8), rB * _StrandLook.w - bt * 0.5);
            float lod = clamp(log2(distV / 5.0), 0.0, 5.0);
            float4 st0 = SAMPLE_TEXTURE2D_LOD(_StrandTex, sampler_StrandTex, luv, lod);
            float4 st1 = SAMPLE_TEXTURE2D_LOD(_StrandTex, sampler_StrandTex, luv * float2(1.7, 1.4) + 0.31, lod);
            float lk = latherW * _LatherLook.x * (0.65 + 0.7 * st1.b);
            float thick = lerp(0.03, _StrandLook.x, saturate(lk));
            float e5 = lerp(st0.r, st0.g, smoothstep(0.55, 0.9, lk));
            la = (1.0 - smoothstep(thick - 0.5 * _StrandLook.y, thick + _StrandLook.y, e5)) * saturate(lk * _LatherLook.w);
        }
        else
        {
            float4 lc = SAMPLE_TEXTURE2D_LOD(_LaceTex, sampler_LaceTex, luv, clamp(log2(distV / 6.0), 0.0, 5.0));
            float4 lc2 = SAMPLE_TEXTURE2D_LOD(_LaceTex, sampler_LaceTex, luv * 2.3 + 0.31, clamp(log2(distV / 3.0), 0.0, 5.0));
            float lh = saturate(min(max(lc.r, lc2.g * 0.8), lc2.r * 1.5 + 0.2));
            float lk = latherB * 0.6 * (0.55 + 0.8 * lc.b);
            float thr = lerp(_LatherLook.y, _LatherLook.z, saturate(lk));
            la = smoothstep(thr, thr + 0.2, lh) * saturate(lk * _LatherLook.w);
        }
HL
  $h =~ s/        float4 lc = SAMPLE_TEXTURE2D_LOD\(_LaceTex.*?float la = smoothstep\(thr, thr \+ 0\.2, lh\) \* saturate\(lk \* _LatherLook\.w\);\n/$lather/s or die 'lather';
  $h =~ s/float pk5 = smoothstep\(0\.95, 1\.35, abs\(qe\)\) \* \(1\.0 - smoothstep\(2\.1, 2\.6, abs\(qe\)\)\);/float pk5 = max(swK, smoothstep(0.95, 1.35, abs(qe)) * (1.0 - smoothstep(2.1, 2.6, abs(qe))));/ or die 'pk5';
  spew("$root/Water/Shaders/RainbowRiver.hlsl", $h); print "river.hlsl ok\n";
}
# --- glints: thicker slivers, no dotted tips
my $g = slurp("$root/Water/Shaders/RainbowRiverGlints.shader");
unless ($g =~ /round 9/) {
  my $arm = <<'HL';
                    // round 9: fuller slivers; never thinner than a pixel (fading instead), so the tips do not break into dots
                    float wx = max(fwidth(i.uvk.x), 1e-4), wy = max(fwidth(i.uvk.y), 1e-4);
                    float ax2 = saturate(1.0 - x / 0.6);
                    float t1 = 0.21 * ay * ay + 0.002, t2 = 0.075 * ax2 * ax2 + 0.002;
                    float arm1 = saturate(1.2 - x / max(t1, 0.8 * wx)) * saturate(t1 / (0.8 * wx)) * step(y, 0.999);       // the long sliver along the flow
                    float arm2 = 0.6 * saturate(1.1 - y / max(t2, 0.8 * wy)) * saturate(t2 / (0.8 * wy)) * step(x, 0.6);   // a short faint cross
HL
  $g =~ s/                    float arm1 = saturate\(1\.2 - x[^\n]*\n                    float ax2 = [^\n]*\n                    float arm2 = [^\n]*\n/$arm/ or die 'arm';
  spew("$root/Water/Shaders/RainbowRiverGlints.shader", $g); print "glints ok\n";
}
# --- wake foam: fewer, softer, slightly bigger clumps
my $f = slurp("$root/Water/Scripts/FoamBank.cs");
unless ($f =~ /round 9 wake/) {
  $f =~ s/                    int n = 9;\n/                    int n = 7;                                  \/\/ round 9 wake: soft overlapping clumps with a few small bubbles\n/ or die 'n';
  $f =~ s/float r = \(k < 2 \? rng\.Range\(0\.022f, 0\.052f\) \* \(0\.6f \+ 0\.6f \* cl\) : rng\.Range\(0\.008f, 0\.024f\)\)/float r = (k < 2 ? rng.Range(0.034f, 0.075f) * (0.55f + 0.65f * cl) : rng.Range(0.010f, 0.026f))/ or die 'r';
  $f =~ s/k < 2 \? -0\.3f \* r : 0\.0f \+ 0\.04f \* grow \* rng\.Next\(\)/k < 2 ? -0.45f * r : 0.0f + 0.04f * grow * rng.Next()/ or die 'y';
  spew("$root/Water/Scripts/FoamBank.cs", $f); print "wake foam ok\n";
}
# --- tuning file: the old lace thresholds no longer exist
my $t = slurp("$root/Tuning/screen05_tuning.txt");
if ($t =~ /^mat:.*RainbowSplashLace05\.mat:_Web/m) {
  $t =~ s/^(mat:.*RainbowSplashLace05\.mat:_Web[^\n]*\n)//mg;
  spew("$root/Tuning/screen05_tuning.txt", $t); print "tuning ok\n";
}
