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
