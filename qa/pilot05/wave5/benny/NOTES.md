# Benny (benny-character-artist) — wave 5 NOTES

## Plan (written first, 22:0x UTC)
1. State found: `runtime.ts` BENNY_RIDE_LIFT = 0.22 (wave-4 lab sweep said 0.12 lands on ref; NOT applied yet).
   `assets/models/benny.glb` last committed 19:39 → wave-4 `build.ts` edits (round arm nubs, star/pom seat) never exported.
2. Re-export `node scripts/export-models.mjs benny`; verify GLB magic/size + turntable.
3. Capture 05 (it01), measure bbox / hat-body split / arms / body width vs ref; then lift 0.12 if the game agrees with the lab.
4. Fix remaining diffs in build.ts/runtime.ts (body skirt flare, arms), re-export, re-capture (max 5 captures).
5. One regression capture 02 03 10 vs screenshots/NN.png; tsc.

## Log
### 21:51 re-export (no code change)
`node scripts/export-models.mjs benny` → assets/models/benny.glb 1,128,212 B, magic `glTF`, LFS-tracked (cf83756b43),
27 meshes / 39 nodes / clips idle swim tumble peek. Turntable docs/characters/benny_turntable.png shows round arm nubs.

### it01 (21:53) — fresh GLB, game capture 05, lift 0.22 (code) and ?bennyLift=0.12; flat-ID mask measured
| | ref | baseline (old GLB) | it01 lift 0.22 | it01 lift 0.12 |
|---|---|---|---|---|
| bbox | x 230–612 y 767–1185 | arms ≈ x 235–610 wide wings | x 229–612 y 748–1178 | **x 231–612 y 766–1188** |
| hat incl pom / body | 62 / 38 % | – | – | 62.3 / 37.7 % (cuff bottom 1029) |
| pom | x 350–502 y 767–897 (152 px) | | | x 341–489 y 766–896 (149 px) |
| cuff | x 275–572, centre 982–1027 | | | x 273–563, centre 974–1029 |
| star centre | (519, 953) +0.64 cuff-hw | | | (500, 965) +0.57 cuff-hw |
| arms | round nubs, centres ≈(255,1043) (590,1040) | wide wings | round nubs | round nubs, rows 1029–1069 span x 237–608 |
| body width y≈1130/1150/1160/1170/1180 | 258/228/209/181/107, bottom ≈1181 | | | 242/199/169/131/61, bottom 1188 |
Crown centre column: ref white 903–921 / purple 923–955 / white 957–980 / cuff 982–1027; game white 889–914 / purple 916–943 / white 945–969 / cuff 970+.
→ Lift 0.12 confirmed in the real game. Left: lower body tapers too fast (16–50 px narrow in the bottom 60 px, 7 px low),
star 12 px low / 19 px too far in, top white stripe a bit tall vs the purple stripe.

### it02 (22:02) — code changes + re-export, live 05 capture
* runtime.ts `BENNY_RIDE_LIFT` 0.22 → 0.12 (it01 A/B above).
* build.ts `deformBody`/new `bottomGain`: fuller, flatter plush base (BENNY_DIMS flat 0 → 0.8, pear 0.13 → 0.10,
  stretch 0.10 → 0.03; new dims bulgeY/bulgeW/flatCap). Lab g05 sweep (scratch, no game capture) chose it.
* build.ts star: BENNY_DIMS starAng/starY/starR = 137° / +0.065 / 0.77 (was 143° / +0.015 / 0.79).
* textures.ts `knitCrownTextures`: stripes W 0–.30 / P .30–.58 / W .58–.73 / P .73–.92 / W (was P .30–.55, W .55–.76, P .76–.92).
* benny-lab.ts: `&dims=<json>` override for lab sweeps. GLB re-exported 1,128,440 B `glTF`.
| | ref | it01 (lift 0.12) | it02 |
|---|---|---|---|
| bbox | x 230–612 y 767–≈1185 | x 231–612 y 766–1188 | x 231–612 y 766–1196 |
| hat incl pom / body (bbox) | 62 / 38 % | 62.3 / 37.7 % | 61.0 / 38.7 % |
| star centre | (519, 953) +0.64 hw | (500, 965) +0.57 | (512, 955) +0.65 |
| body width y 1129/1149/1159/1169/1179 | 258/228/209/181/107 | 242/199/169/131/61 | 257/228/202/178/147 |
| pom | 152×130 | 149×131 | 149×131 |

### it03 (22:04) — hat colour A/B in the live game via new QA hook `?bennyTint=` (runtime.ts), no GLB change
Region medians (ref 05 → it02): cuff #6B0DEB L117 → #B248FF L167; purple stripe #740FF2 L124 → #8658FF L153;
white #F3CFE4 L225 → #FFD8FF L241; pom #8215ED L129 → #9425FF L147; body #F549A9 L162 → #FF46B3 L167 (ok).
Cuff factor #9888b8 → #7D13FF L132; **#7868a0 → #620BEE L118**; #605088 → #5007C9 L98. Crown factors only darken G
(R/B stay clipped at 255 → lavender). Refs 03/07 also show a deep-violet cuff → global factor is right.
Applied: build.ts brimMat color #7868a0, crownMat color #eae6d6 (mild warm; a full unclip would need a greenish
factor that would look wrong in neutral scenes); textures.ts crown yarn white #fff6f4 / shade #c8b2c4, purple stitch
highlight #8a2cff (was #9d55ff), pomTip #8530f2 (was #8f3cff).

### it04 (22:07) — re-export with hat colour factors + yarn colours
GLB 1,126,332 B `glTF`. Geometry unchanged vs it02 (bbox x 231–612 y 766–1196, star (512,955)). Scene had changed
under us (other specialists): 125 calls / 634,089 tris (it02: 121 / 608,313) — measurement scripts now use a Benny ROI.
| region | ref 05 | it02 | it04 |
|---|---|---|---|
| cuff | #6B0DEB L117 | #B248FF L167 | **#6611EC L121** |
| white stripes | #F3CFE4 L225 | #FFD8FF L241 | #FFD5EB L233 |
| purple stripe | #740FF2 L124 | #8658FF L153 | #7C49FF L149 |
| pom | #8215ED L129 | #9425FF L147 | #901AFF L142 |
| body | #F549A9 L162 | #FF46B3 L167 | #FF48B4 L169 |
Next (it05): crown purple yarn ≈ cuff effective albedo (#420cb6 / hi #5a1ccc / shade #1e0562), pomTip #7c28e8.

### it05 (22:08) — crown purple yarn #420cb6 + pomTip #7c28e8
Purple stripe median #624BC0 L135 (darker but greyer; centre-column avg (104,63,184) vs ref (95,14,234), dist ≈ 71;
it04 avg (132,63,253), dist ≈ 64). The green floor (~63) is scene light, not albedo → **reverted the crown yarn to
the it04 colours**; kept pomTip #7c28e8 (pom #8B14FF L137 vs it04 #901AFF L142, ref #8215ED L129).
Final GLB 22:10 = it04 crown/cuff + it05 pom (both measured in the live game; 5 capture iterations of 05 used, so this
exact combination has no separate 05 frame — regression capture below exercises the final GLB).

### Regression (22:10) — `capture.mjs 02 03 10 --out=qa/pilot05/wave5/benny/regress`, final GLB (1,126,892 B)
All three load `assets/models/benny.glb`, no console errors in the log. 02: dizzy face, swirl eyes, stripes, pom intact,
cuff now deep violet like ref 02. 03: front face/hat intact (a white spray streak beside him is VFX, not the model).
10 (rear ride, unchanged framing vs screenshots/10.png): hat purple median ref #6905E5 L115 / previous #913DFF L154 /
now #701DF3 L127; star now front-right on the white band above the cuff at (650, 1154) (previous (648, 1268), low on
the cuff side). The hide-under-towel sequence logic is untouched (lift/pitch are 0 in peek/tumble as before).
Triptychs: qa/pilot05/wave5/benny/triptych_it04.png (final crown colours), triptych_it05.png.

## Left / not done
* Crown purple stripe still lighter than ref (live #7C49FF L149 vs #740FF2 L124): the green floor is scene light +
  Neutral tone mapping desaturation, not albedo (a darker yarn only greyed it, it05).
* Cuff band ≈ 10 px taller than ref at the centre column (974–1029 vs 982–1027); bottom edge 1196 vs ref ≈1185
  (ref's base is cut by water/spray; ours shows the fur tips; the white spray streaks (foam owner) cover the lower sides).
* Ref fur reads as soft clumped plush; ours is finer shell fur (known shell-fur limitation, docs/characters/benny.md).
* Final GLB combination (it04 crown + it05 pom) has no separate 05 frame (5-capture budget used).
