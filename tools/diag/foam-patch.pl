# one-time helper (2026-11-24, round 8): soft white soap foam (shading + puff layout), wake foam without balls
use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow/Water';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }

my $cm = slurp("$root/Shaders/RainbowWaterCommon.hlsl");
unless ($cm =~ /RBW_Disp/) {
  my $d = <<'END';
// scene-linear radiance that the scene grade (exposure -0.2337, contrast 20.35 in LogC, saturation 41.84, no tone mapping) shows as this
// display sRGB colour (0-255): palettes written as measured picture colours (round 8; same as WaterTextureFactory.SceneFromDisplay)
float3 RBW_Disp(float3 srgb255)
{
    float3 y = pow(saturate(srgb255 / 255.0), 2.2);
    float l = dot(y, float3(0.2126729, 0.7151522, 0.0721750));
    float3 x = max(l + (y - l) / 1.4184, 0.0);
    x = (pow(5.555556 * x + 0.047996, 0.830910) * 1.04491 - 0.047996) / 5.555556;
    return max(x, 0.0) / 0.85045;
}

// the scene vignette (intensity 0.19, smoothness 0.4) at a pixel: surfaces whose colours were measured on the picture divide by it
float RBW_VignetteAt(float2 positionCSxy)
{
    float2 vd = abs(positionCSxy / _ScaledScreenParams.xy - 0.5) * 0.57;
    float vf = saturate(1.0 - dot(vd, vd));
    return max(vf * vf, 0.6);
}

// cheap cellular "soap foam" pattern
END
  chomp $d;
  $cm =~ s/\/\/ cheap cellular "soap foam" pattern/$d/ or die 'common';
  spew("$root/Shaders/RainbowWaterCommon.hlsl", $cm); print "common ok\n";
}

my $fb = slurp("$root/Shaders/RainbowFoamBank.hlsl");
unless ($fb =~ /RBW_Disp/) {
  my $ramp = <<'END';
float3 RBW_Soap05(float t)
{
    // round 8 (2026-11-24): approved foam = soft WHITE lumps with light-blue shade (measured: caps (254,251,255), bodies (226,232,254), lower sides
    // (176,198,251), crevices (112,146,240)), not lavender
    t = saturate(t) * 4.0;
    float3 c = lerp(RBW_Disp(float3(96, 128, 234)), RBW_Disp(float3(146, 174, 247)), saturate(t));
    c = lerp(c, RBW_Disp(float3(192, 208, 252)), saturate(t - 1.0));
    c = lerp(c, RBW_Disp(float3(230, 234, 254)), saturate(t - 2.0));
    return lerp(c, RBW_Disp(float3(255, 252, 255)), saturate(t - 3.0));
}
END
  $fb =~ s/float3 RBW_Soap05\(float t\)\n\{.*?\n\}\n/$ramp/s or die 'soap';
  $fb =~ s/(#define RAINBOW_FOAM_BANK_INCLUDED\n)/$1\n#include "Assets\/Rainbow\/Water\/Shaders\/RainbowWaterCommon.hlsl"\n/ or die 'inc';
  spew("$root/Shaders/RainbowFoamBank.hlsl", $fb); print "bank ok\n";
}

my $f = slurp("$root/Shaders/RainbowFoam.hlsl");
unless ($f =~ /round 8/) {
  my $col = <<'END';
float3 RBW_FoamColor(float3 Nv, float px, float seed, float ao, float tint, float3 lightDirWS)
{
    // round 8 (2026-11-24, user: soft white-blue soap clusters, no lavender balls): the puffs of a heap share one soft light from above (normals
    // pulled toward world up), so they read as one cauliflower cloud; translucent bright edges; small blue bubble holes toward the lower side
    float2 q = Nv.xy;
    float z = saturate(Nv.z);
    float d = length(q);
    float3 upV = normalize(mul((float3x3)UNITY_MATRIX_V, float3(0.0, 1.0, 0.0)));
    float3 Ns = normalize(Nv + upV * 0.42);
    float up = dot(Ns, upV);
    float lit = saturate(0.52 + 0.5 * up - 0.07 * Ns.x);
    float big = smoothstep(14.0, 34.0, px);
    float t = 0.16 + 0.96 * smoothstep(0.08, 0.98, lit) - (1.0 - ao) * 0.62;
    t -= pow(1.0 - z, 2.0) * 0.28 * saturate(0.35 - q.y);                       // soft crease shade under the lump only
    // fine open bubbles: many small blue holes on the lower half and at the flanks, few on the lit cap
    float2 mp = q * (1.0 + 0.5 * (1.0 - z)) * clamp(px / 6.5, 1.4, 11.0) + seed * 37.0;
    float dens = clamp(0.1 + 0.75 * RBW_SS(0.3, -0.65, q.y) + 0.22 * (1.0 - z) - 0.12 * big, 0.0, 0.8);
    float4 mf = RBW_MicroFoam(mp, dens);
    float kf = (1.0 - smoothstep(0.5, 0.9, fwidth(mp.x) + fwidth(mp.y))) * smoothstep(9.0, 18.0, px);
    t += (mf.z - 0.6) * 0.1 * dens * kf + mf.y * 0.2 * kf;
    float3 col = RBW_Soap05(t + 0.03 * tint);
    col = lerp(col, RBW_Disp(float3(74, 132, 238)), mf.x * kf * 0.62 * (1.0 - 0.6 * lit));
    // thin-film / subsurface: bright soft silhouettes on the lit side, a breath of pink and aqua
    float fres = pow(1.0 - z, 2.4);
    col = lerp(col, RBW_Disp(float3(252, 248, 255)), fres * saturate(up * 0.9 + 0.35) * 0.6);
    col += (RBW_Iridescent(fres * 1.2 + seed * 0.7 + 0.15) - 0.35) * fres * 0.1;
    col = lerp(col, col * float3(1.03, 0.96, 1.03), 0.5 + 0.5 * tint);
    // glossy wet highlight
    float3 Lv = TransformWorldToViewDir(lightDirWS, true);
    float rl = max(dot(reflect(float3(0.0, 0.0, -1.0), Nv), Lv), 0.0);
    col += pow(rl, 30.0) * 0.22 * big + mf.w * 0.2 * kf;
    // tiny bubbles: clear white beads with a light-blue rim
    float tiny = 1.0 - smoothstep(7.0, 13.0, px);
    float2 qs = q - float2(-0.3, 0.35);
    float3 cb = lerp(RBW_Soap05(0.95), RBW_Soap05(0.35), smoothstep(0.45, 0.98, d) * 0.8) + exp(-dot(qs, qs) * 12.0) * 0.3;
    return lerp(col, cb, tiny);
}

#endif // RAINBOW_FOAM_INCLUDED
END
  $f =~ s/float3 RBW_FoamColor\(float3 Nv.*\z/$col/s or die 'foamcolor';
  spew("$root/Shaders/RainbowFoam.hlsl", $f); print "foam hlsl ok\n";
}
my $fs = slurp("$root/Shaders/RainbowFoam.shader");
unless ($fs =~ /RBW_VignetteAt/) {
  $fs =~ s/(                col \*= _Brightness;\n)/                col *= _Brightness \/ lerp(1.0, RBW_VignetteAt(i.positionCS.xy), 0.85);\n/ or die 'foam shader';
  spew("$root/Shaders/RainbowFoam.shader", $fs); print "foam shader ok\n";
}

my $b = slurp("$root/Scripts/FoamBank.cs");
unless ($b =~ /round 8/) {
  # waterline: fewer, finer beads
  $b =~ s/int nLace = Mathf\.RoundToInt\(\(4 \+ rng\.Next\(\) \* 2f\) \* dens\);/int nLace = Mathf.RoundToInt((3 + rng.Next() * 2f) * dens);   \/\/ round 8: finer, fewer beads/ or die 'lace n';
  $b =~ s/float r = 0\.03f \+ 0\.055f \* u \* u;/float r = 0.016f + 0.05f * u * u * u;/ or die 'lace r';
  # bigger soft lumps sunk into each other
  $b =~ s/float r = rng\.Range\(0\.13f, 0\.23f\) \* \(0\.8f \+ 0\.5f \* lump\) \* rs;/float r = rng.Range(0.14f, 0.27f) * (0.8f + 0.5f * lump) * rs;/ or die 'big r';
  $b =~ s/float y = RiverPath\.WaterY \+ RiverSurface\.BaseHeight\(x, z\) \+ Mathf\.Max\(surf - 0\.75f \* r, -0\.3f \* r\);/float y = RiverPath.WaterY + RiverSurface.BaseHeight(x, z) + Mathf.Max(surf - 0.82f * r, -0.35f * r);/ or die 'big y';
  # no beads on the crest
  $b =~ s/int nCrest = Mathf\.FloorToInt\(0\.4f \+ 0\.9f \* cl \+ rng\.Next\(\)\);/int nCrest = rng.Next() < 0.25f ? 1 : 0;/ or die 'crest';
  # wake: thin soft clumps only
  my $wake = <<'END';
        public static Mesh BuildWakeMesh(uint seed = 0x0511u)
        {
            // round 8 (2026-11-24, user: "remove the bulky lavender foam balls beside his wake"): only small soft clumps along the outer edge of the
            // sweeps, tapering backward; the lacy water itself is drawn by the splash sheets (SplashLace)
            var list = new List<Puff>(300);
            var rng = new Rng(seed);
            for (int side = -1; side <= 1; side += 2)
            {
                for (float b = 0.75f; b < 2.3f; b += 0.085f)
                {
                    float grow = SS(0.7f, 1.5f, b), taper = 1f - 0.55f * SS(1.7f, 2.3f, b);
                    int n = rng.Next() < 0.7f ? 3 : 2;
                    float cl = ClusterNoise(b * 4f + 3f * side, side);
                    for (int k = 0; k < n; k++)
                    {
                        float r = (k == 0 ? rng.Range(0.04f, 0.085f) * (0.6f + 0.7f * cl) : rng.Range(0.012f, 0.03f)) * (0.5f + 0.5f * grow) * taper;
                        float dl = 0.6f + 0.46f * b + rng.Range(-0.1f, 0.1f) * (0.5f + 0.5f * grow);
                        AddWake(list, rng, side, dl, b + rng.Range(-0.05f, 0.05f), k == 0 ? -0.25f * r : 0.01f + 0.04f * grow * rng.Next(), r, rng.Range(0.86f, 1f));
                    }
                }
            }
            return BuildMesh(list, "WakeFoam05");
        }

        static void AddWake
END
  chomp $wake;
  $b =~ s/        public static Mesh BuildWakeMesh\(uint seed = 0x0511u\)\n        \{.*?        static void AddWake/$wake/s or die 'wake mesh';
  spew("$root/Scripts/FoamBank.cs", $b); print "bank cs ok\n";
}
my $tn = slurp("$root/../Tuning/screen05_tuning.txt");
$tn =~ s/(RainbowFoam05\.mat:_Brightness:f\|)[0-9.]+/${1}1/;
$tn =~ s/(RainbowWakeFoam05\.mat:_Brightness:f\|)[0-9.]+/${1}1/;
spew("$root/../Tuning/screen05_tuning.txt", $tn); print "tuning ok\n";
