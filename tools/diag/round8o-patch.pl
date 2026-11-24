use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow/Water';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
my $h = slurp("$root/Shaders/RainbowRiver.hlsl");
$h =~ s/        float2 luv = wl5 \? float2\(dlW \* 0\.75 \+ 0\.1 \* sin\(backS \* 2\.0 \+ bt \* 0\.7\), backS \* 0\.6 - bt \* 0\.55\) : float2\(lat \* 0\.55, v5 \* 0\.4\);\n/        \/\/ strands radiate from his body (polar web, long along the rays) and stream outward\n        float rB = length(float2(dlW - 0.03, backS - 0.1));\n        float2 luv = wl5 ? float2(atan2(dlW - 0.03, backS + 0.35) * 1.15 + 0.06 * sin(rB * 4.0 + bt * 0.8), rB * 0.42 - bt * 0.5) : float2(lat * 0.55, v5 * 0.4);\n/ or die 'luv';
$h =~ s/float lk = wl5 \? latherW \* \(0\.75 \+ 0\.5 \* lc\.b\) :/float lk = wl5 ? latherW * _LatherLook.x * (0.7 + 0.6 * lc.b) :/ or die 'lk';
$h =~ s/float thr = lerp\(0\.86, 0\.05, saturate\(lk\)\);/float thr = lerp(_LatherLook.y, _LatherLook.z, saturate(lk));/ or die 'thr';
$h =~ s/float la = smoothstep\(thr, thr \+ 0\.22, lh\) \* saturate\(lk \* 2\.6\);/float la = smoothstep(thr, thr + 0.2, lh) * saturate(lk * _LatherLook.w);/ or die 'la';
$h =~ s/(#define _SheenLook float4\(0\.85, 0\.75, 0\.5, 1\.0\)\n)/$1#define _LatherLook float4(1.1, 0.8, 0.1, 2.6)\n/ or die 'def';
spew("$root/Shaders/RainbowRiver.hlsl", $h);
my $s = slurp("$root/Shaders/RainbowRiver.shader");
$s =~ s/(        _SheenLook \("Sheen strength[^\n]*\n)/$1        _LatherLook ("Wake lather: amount, web threshold at 0, at 1, opacity", Vector) = (1.1, 0.8, 0.1, 2.6)\n/ or die 'p';
$s =~ s/(            float4 _SheenLook;\n)/$1            float4 _LatherLook;\n/ or die 'c';
spew("$root/Shaders/RainbowRiver.shader", $s);
my $w = slurp("$root/Editor/WaterBuilder.cs");
$w =~ s/(            mat\.SetVector\("_SheenLook", SheenLook\);\n)/$1            mat.SetVector("_LatherLook", new Vector4(1.1f, 0.8f, 0.1f, 2.6f));\n/ or die 'w';
spew("$root/Editor/WaterBuilder.cs", $w);
print "ok\n";
