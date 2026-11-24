# Merges the automatic fitter's result (Recordings/Screen05/work/autofit_result.txt) into the tuning file: replaces keys that exist, appends new ones.
# perl tools/diag/tuning-merge.pl "comment line"
use strict; use warnings;
my $t = '/c/RainbowUnity/UnityProject/Assets/Rainbow/Tuning/screen05_tuning.txt';
my $r = '/c/RainbowUnity/UnityProject/Recordings/Screen05/work/autofit_result.txt';
my %new; my @order;
open(my $f, '<', $r) or die; while (<$f>) { s/\r?\n//; next unless /^(.+)\|(-?[0-9.]+)$/; push @order, $1 unless exists $new{$1}; $new{$1} = $2; } close $f;
open(my $g, '<', $t) or die; my @lines = <$g>; close $g;
my %done;
for (@lines) { s/\r?\n//; if (/^([^#|]+)\|/ && exists $new{$1}) { my $k = $1; $_ = "$k|$new{$k}"; $done{$k} = 1; } }
my @add = grep { !$done{$_} } @order;
push @lines, '', '# ' . ($ARGV[0] // 'fitter'), map { "$_|$new{$_}" } @add if @add;
open(my $o, '>', $t) or die; binmode $o; print $o join("\n", @lines), "\n"; close $o;
print scalar(keys %done) . " replaced, " . scalar(@add) . " added\n";
