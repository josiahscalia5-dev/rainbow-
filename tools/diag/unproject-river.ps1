# RIVER TARGETS (offline measurement aid): the approved river's curves traced row by row on references/05_flow_into_the_current.png
# (tools/diag/gridshapes.ps1 + staging/round4-recovery/rowclass.ps1), unprojected with the real gameplay camera of the approved view onto
# the water plane -> world (s, x) tables that code can use directly. Output: staging/round4-river/river_targets.csv (curve, py, px, s, x).
#   wl = left foam waterline (water -> foam), lo / li = left pink band outer / inner edge (half of the violet ramp),
#   ri / ro = right pink band inner / outer edge, wr = right foam waterline.
# Heights used: bands 0.10 m, waterlines 0.18 m above the water plane (RiverSurface.BaseHeight raises the edges).
$ErrorActionPreference = 'Stop'
$trace = @{
  wl = '510:485 515:457 520:440 525:425 530:404 535:378 540:348 545:334 550:322 555:314 560:306 565:290 570:278 580:262 590:248 600:235 610:222 620:213 630:213 640:218 650:240 660:264 670:272 680:286 690:290 700:272 710:242 720:205 730:165 740:130 750:110 760:90 770:72 780:55 790:36 800:10'
  lo = '510:504 520:462 530:420 540:428 550:398 560:358 570:324 580:288 590:268 600:257 610:246 620:239 630:240 640:248 650:268 660:297 670:310 680:318 690:313 700:302 710:285 720:262 730:241 740:211 750:188 760:150 770:118 780:92 790:75 800:46 810:28 820:10 830:-6'
  li = '510:521 520:497 530:470 540:456 550:434 560:404 570:378 580:353 590:335 600:326 610:320 620:326 630:342 640:368 650:386 660:400 670:409 680:408 690:404 700:394 710:381 720:369 730:341 740:316 750:297 760:278 770:260 780:231 790:214 800:198 810:185 820:170 830:160 840:147 850:139 860:128 870:118 880:105 890:88 900:70 920:56 940:38 960:18 980:2'
  ri = '510:556 520:562 530:562 540:551 550:522 560:500 570:495 580:507 590:534 600:567 610:602 620:636 630:660 640:681 650:700 660:717 670:731 680:738 690:746 700:749 710:748 720:742 730:732 740:718 750:698 760:675 770:651 780:623 790:602 800:590 810:578 820:571 830:565 840:562 850:561 860:563 870:567 880:571 890:578 900:583 920:602 940:625 960:648 980:672 1000:699 1020:737 1040:763 1060:789 1080:806 1100:820'
  ro = '510:568 520:583 530:588 540:580 550:558 560:531 570:530 580:554 590:590 600:633 610:672 620:708 630:738 640:758 650:776 660:792 670:808 680:815 690:817 700:815 710:812 720:815 730:816 740:812 750:805 760:795 770:793 780:772 790:747 800:729 810:712 820:702 830:688 840:683 850:678 860:680 870:683 880:691 890:705 900:718 920:758 940:805 960:840 980:872'
  wr = '510:596 520:598 530:598 540:597 545:590 550:577 555:560 560:547 570:551 580:560 585:578 590:617 600:660 610:700 620:735 630:765 640:785 650:805 660:816 670:825 680:829 690:832 700:836 710:838 720:838 730:835 740:828 750:814 760:800 770:792 780:775 790:762 800:747 810:733 820:715 830:702 840:695 850:692 860:693 870:701 880:711 890:722 900:736 910:752 920:772 930:795 940:820 950:848'
}
$focal = 1278.2; $Cx = -0.06; $Cy = 3.40; $Cz = 7.48
$p = 12.78 * [Math]::PI / 180; $yw = -2.80 * [Math]::PI / 180
$f = @(([Math]::Sin($yw) * [Math]::Cos($p)), (-[Math]::Sin($p)), ([Math]::Cos($yw) * [Math]::Cos($p)))
$r = @([Math]::Cos($yw), 0.0, (-[Math]::Sin($yw)))
$u = @(([Math]::Sin($yw) * [Math]::Sin($p)), [Math]::Cos($p), ([Math]::Cos($yw) * [Math]::Sin($p)))
$out = New-Object System.Collections.Generic.List[string]
$out.Add('curve,py,px,s,x')
foreach ($k in 'wl', 'lo', 'li', 'ri', 'ro', 'wr') {
  $h = 0.10; if ($k -eq 'wl' -or $k -eq 'wr') { $h = 0.18 }
  foreach ($tok in ($trace[$k] -split ' ')) {
    $a = $tok.Split(':'); $py = [double]$a[0]; $px = [double]$a[1]
    $vx = ($px - 432) / $focal; $vy = (768 - $py) / $focal
    $d = @(0, 0, 0); for ($i = 0; $i -lt 3; $i++) { $d[$i] = $f[$i] + $vx * $r[$i] + $vy * $u[$i] }
    if ($d[1] -ge -1e-4) { continue }
    $dist = ($h - $Cy) / $d[1]
    $out.Add(('{0},{1},{2},{3:F2},{4:F2}' -f $k, $py, $px, ($Cz + $dist * $d[2]), ($Cx + $dist * $d[0])))
  }
}
New-Item -ItemType Directory -Force 'C:\RainbowUnity\staging\round4-river' | Out-Null
[System.IO.File]::WriteAllLines('C:\RainbowUnity\staging\round4-river\river_targets.csv', $out)
$out
