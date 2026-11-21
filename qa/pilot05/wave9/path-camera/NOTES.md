# Screen 05 wave 9 — path-camera-transition-engineer (continues wave 8, session 01Kbt6BV)

Wave-8 log recovered first (qa/pilot05/wave8/path-camera/NOTES.md: it01/it02 entry written from the evidence).

## State at start (measured on the recovered code, baseline qa/pilot05/wave9/baseline/05.png)
* Far ring depths ON and correct: env dropped the real sF05 ring (`realSeamRing` = false), far rings at virtual
  D = 59/97/161/222/322. Gold runs along the VP rays (150°): live 31/45/60/99/163 px vs ref 31/45/62/104/170 px. Done;
  only change again if the environment adopts an oval aspect (coordinator FYI) → then give the far rings/walls the same.
* Coins: live 05 trail ends with coin 26 (s 181.64, just past the seam sF05 180.04) at (555,541) — a jump RIGHT off
  the ref trail; ref trail (465,545) → (494,531) → (518,522) → (531,516) → (536,507) → (526,498) → (515,493) →
  (506,489) → (497,486) → (490,484), widths 28/20/16/13/12/9/7/6/5/4 px.
* Far river (forced section): broad flat sheet, big pink blobs, no foam on the right (body hugs the wall,
  EXTENT_FAR 6.25 of a 6.53 chord), pale flat lavender strip on the left; ref = narrower winding cyan/pink stream
  with bubbly white-lavender foam banks on both sides and the purple wall above them.
* farRiverMaterial lives in materials.ts (environment-owned since wave 9) → I move my far-river shader into far05.ts
  (`farRiverMaterial05`) and switch only my far-block call; materials.ts untouched (old function left for env to drop).

## Plan
1. it01 FAR COINS: 7 far coins in the virtual tunnel (ft.point / ft.matrix) on the far core at virtual D ≈ 70…370
   (ref y-fit with the real coin height C05.h), same coin geometry/materials as the real ones (shared
   `coinVisuals()` in coins.ts, pure refactor), size ×1→1.5 toward the VP (ref far coins are larger than physical).
   They shrink away while the far section opens (camera 34→18 u before the seam) → no pop, never a double coin, not
   pickups. Real coin 26 (beyond the seam, in the forced region) moves onto the visible trail (axis-lateral ≈ −0.2,
   ref (494,531)); count/pickup logic unchanged.
2. it02 FAR RIVER LOOK: own material in far05.ts with water-fx seam colours (#06A5F9 core, bands #BC16A8 → #F73DEA →
   #FA9EF2, band ±0.62·hw, half width 0.19·hw, thin light flow lines), narrower body (room for foam on the outer
   bank), raised foam banks with the foam look (#FAF3FE tops, #ABB8FA body, #758FF7 → #6B65EA lower half, scalloped
   top, bubble cells), shrinking into the VP.
3. it03+: VP throat / ring aspect follow-ups (REQUESTS.md), refinements; revert anything not closer.
4. End: tsc, test:continuity, ride check 04→06, gameplay-test, regression 03 04 06 07 08.

## Log
* **it01** (far coins + seam coin + OVAL far section, env request 02:32). Changes: `coinVisuals()` shared (coins.ts, pure
  refactor), seam coin 26 → axis-lateral −0.2 (`C05.seamAxisLat`, `farSeam05()`), `farCoins05` (far05.ts: 7 coins at
  virtual D 70/83/106/150/205/280/370 on C05.latK × far core, ×1→1.5 size, shrink away while the section opens),
  ForcedTunnel `{ aspect, floorY }` (tube.ts) fed by env `oval05(sF05)`/`floor05(sF05)`: oval far walls (+ bank floor),
  far rings x × K, far lids on the oval, far river chord × K, end glow disc x × K (else the 06 hall showed through).
  - Probe (live camera): coins (470,550) → seam coin (500,534) 22 px [ref (494,531) 20] → far (516,525) 16 [ref
    (518,522) 16] · (538,518) 12 [531,516 13] · (542,509) 10 [536,507 12] · (535,500) 8 [526,498 9] · (527,495) 8
    [515,493 7] · (509,490) 6 [506,489 6] · (493,488) 4 [497,486 5]. Far rings along 180°: live 51/73/100/165/272 px,
    ref ≈58/98/161/280 (ovals now match).
  - Report vs wave-9 baseline: mad 50.6 → 51.6, hue_corr 0.875 → 0.833, edge_corr 0.195 → 0.201, tunnel+VP 58.6 → 59.9,
    river mid 47.6 → 47.4, Benny+near 46.5 → 48.3. 89 calls / 567,799 tris. NB the env oval (K 1.7) of the NEAR tunnel
    + other owners' parallel edits are in this frame too (near field changed a lot), so these deltas are mostly not
    mine; the far region itself: coin trail now reaches the light like the ref (kept).
  - Look: far bank = flat pale-lavender foam strip + flat slotted bank floor → reads as a platform; ref = lumpy foam
    banks with the violet wall down to them. Far cyan too dark/saturated (far 490–545 × 400–620: live cyan median
    #00A8FF vs ref #4DC2F9). Next: it02 far river look.
