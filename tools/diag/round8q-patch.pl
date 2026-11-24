use strict; use warnings; local $/;
my $root = '/c/RainbowUnity/UnityProject/Assets/Rainbow';
sub slurp { my $p = shift; open(my $f, '<', $p) or die "$p: $!"; my $t = <$f>; close $f; $t =~ s/\r\n/\n/g; return $t; }
sub spew { my ($p, $t) = @_; die "tiny file $p" if length($t) < 500; open(my $f, '>', $p) or die "$p: $!"; binmode $f; print $f $t; close $f; }
my $b = slurp("$root/Water/Scripts/FoamBank.cs");
$b =~ s/float r = \(k < 2 \? rng\.Range\(0\.045f, 0\.1f\) \* \(0\.6f \+ 0\.7f \* cl\) : rng\.Range\(0\.012f, 0\.04f\)\)/float r = (k < 2 ? rng.Range(0.022f, 0.052f) * (0.6f + 0.6f * cl) : rng.Range(0.008f, 0.024f))/ or die 'r';
spew("$root/Water/Scripts/FoamBank.cs", $b);
my $t = slurp("$root/Tuning/screen05_tuning.txt");
my %set = (
 'RainbowFoam05.mat:_Brightness:f' => '0.96', 'RainbowWakeFoam05.mat:_Brightness:f' => '1',
 'RainbowSplashLace05.mat:_Alpha:f' => '0.9', 'RainbowSplashLace05.mat:_Len:f' => '1.35', 'RainbowSplashLace05.mat:_Web:v0' => '0.3', 'RainbowSplashLace05.mat:_Web:v1' => '0.63',
 'RainbowSplashLace05.mat:_Web:v3' => '0.5', 'RainbowSplashLace05.mat:_Shape:v0' => '0.3', 'RainbowRiver05.mat:_LatherLook:v0' => '1.5', 'RainbowRiver05.mat:_SheenLook:v1' => '0.68' );
for my $k (keys %set) { my $q = quotemeta $k; $t =~ s/($q\|)[-0-9.]+/$1$set{$k}/ or print "missing $k\n"; }
spew("$root/Tuning/screen05_tuning.txt", $t); print "ok\n";
