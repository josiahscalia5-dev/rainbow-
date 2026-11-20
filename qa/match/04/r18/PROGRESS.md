# Screen 04 — round 18 (account 18, worker `foam-bubbles-particles` for the lead) — branch `claude/rainbow-s04-match-c18`

Start: `ad5fbac5` (r17 step 1 `m04end`, KEPT) + the account-17 unfinished edit (+33 lines in `src/world/match04m4.ts` = r17 step 2
`&m04nband=1`) and its stills / half-size clip, restored uncommitted. History: `qa/match/04/r17/PROGRESS.md`, `r16/`, `r15/`.
Rules: VISUALS ONLY (`docs/briefs/2026-11-18-r15/USER_ORDER_R15_VISUAL.md`); this branch never edits the ring shader GOLD_FRAG
(s04tex worker owns the rings).

Kept set K17-1 (= r17 step 1):
`match04=1&m04ring=1&m04river=1&m04bub=1&m04mouth=1&m04room=1&m04ry=0.8&m04rk=0.82&m04arr3d=1&m04a3k=66&m04a3w2=1&m04a3g=1.6&m04a3o=0.38&m04a3b=1&m04a3b0=3.0&m04a3b1=4.4&m04a3f0=25&m04a3f1=31&m04a3p=4.0&m04a3w=1.15&m04a3t=0.32&m04a3d=0.55&m04a3f=4&m04a3y=0.1&m04ringp=4.6&m04ringgw=1.2&m04tb=0.2&m04ts=0.22&m04paint=0.9&m04pink=1&m04pkl=2.15&m04pkw=0.9&m04a3hb=1&m04xf=2.6&m04lane=1&m04lanew=2.3&m04lanes=0.85&m04a3co=1.0&m04lane2=0.55&m04lgl=1.3&m04lsp=0.9&m04copper=1.3&m04edge=1&m04rf0=1.25&m04rf1=0.8&m04lbr=0.14&m04a3tex=1&m04bulge=0.18&m04lcd=1.0&m04lcw=1.7&m04a3fa=1.0&m04a3gb=0.16&m04a3tm=0.45&m04a3lum=1.1&m04a3rw=0.03&m04foam=1&m04foamr=2.5&m04foamn0=4.5&m04foamn1=6.5&m04fclu=1&m04sband=1&m04end=1`

## Step 2 (r17 step 2, finished in r18) — painted pink / cyan bands round Benny in the near water — `&m04nband=1` — GOOD IMPROVEMENT
Query (K18-2): K17-1 + `&m04nband=1` (defaults `m04nbh` 1.1, `m04nba` 4.2, `m04nbb` 0.04, `m04nbr` 0.9, `m04nbs` 0.7, `m04nbp` 0,
`m04nbf` 0; needs `m04sband`).
* Code (`src/world/match04m4.ts`, river shader only): the painted side bands (the r15 `m04sband` tile cut from references/04) no
  longer start at a fixed 2 u from the lane centre; at Benny's position and behind him toward the camera their inner edge hugs him
  (1.1 u) and curves back out to the normal width 4.2 u ahead of him, so the arrow lane ahead stays cyan. Near Benny the painted strip
  is walked back and forth (cyan → hot pink → cyan …, 0.9 u half stripes), so several alternating painted pink / cyan stripes curve
  round him. The band pixels stay world-anchored and flow with the current; only where they start follows Benny down the slide.
  Rings, foam, arrows, coins, Benny, camera untouched.
* Start view: `node scripts/capture.mjs 04` K17-1 vs K18-2 → 0 px differ (pixelmatch 0 / 1,171,584, rows 180–1536).
* WHAT LOOKS CLOSER (f03, f06, f10, f20, t33, t66, t95, steering and hard left / right): the water right round Benny was a plain
  cyan sheet with the pink only out at the far banks; it is now several glossy pink and cyan stripes sweeping in close round him on
  both sides, like the painted swirl bands that wrap round Benny in the approved picture. In the clip they stay on the water and
  flow (no tearing or sliding) while he steers left and right.
* STILL WRONG: the painted bands bend in big S-curves and also cross under Benny; in the game they run as long, nearly straight
  stripes beside him, and the water straight below / in front of the camera stays cyan.
* Pictures: `qa/match/04/r18/s2_nband/1_APPROVED.png`; `BEFORE/` (K17-1 = the r17 step-1 NEW set, 12 shots; the m04nband-off
  code path is unchanged); `NEW/` (K18-2, 12 shots: 10 rendered in r17 and restored, a00 + f03 re-rendered in r18,
  `motion_a00_f03_r18.json`); `NEW_swim_clip_half.mp4` (half size, 3.6 s straight / left / right / straight, rendered in r17 and
  restored from Git LFS). The restored stills moved from `qa/match/04/r17/s2_nband/` to here.

## Step 3 — the near bands WHIRL round Benny (S-curve sweep, crossing under him) — `&m04nwhirl=1` — GOOD IMPROVEMENT
Query (K18-3): K18-2 + `&m04nwhirl=1` (needs `m04nband`; defaults `m04nwk` 0.5, `m04nwe` 0.3, `m04nwt` 1, `m04nwm` 0.35,
`m04nwl` 7, and `m04nbr` 1.3 when the whirl is on).
* Code (`src/world/match04m4.ts`, river shader only): behind Benny (toward the camera) the band edge is no longer two lines opening
  outward but an ellipse centred on Benny (cyan pocket + splash round him); the pink / cyan stripes follow it and spiral: a stripe
  hugging his left side sweeps diagonally under him and comes out farther out on his right (one stripe period per half turn, so the
  bands ahead of him are not shifted). Broader stripes (1.3 u). Ahead of Benny the band edge swings in and out in gentle
  world-anchored S-curves (0.35 u, every 7 u, left / right in opposite phase). Inside the whirl the left / right tile offset and the
  lateral wander are shared, so there is no seam where the stripes cross. Rings, foam, arrows, coins, Benny, camera untouched.
* Start view: `node scripts/capture.mjs 04` K18-2 vs K18-3 → 0 px differ (pixelmatch 0 / 1,171,584, rows 180–1536).
* WHAT LOOKS CLOSER (f03, f06, t33, t66, t95, steering and hard left / right, clip): the near water was long straight pink / cyan
  stripes running past Benny and opening out toward the camera; now glossy pink and cyan bands swirl round him like the painted
  whirl — they curve in from both sides and sweep diagonally under him, with a cyan pocket and white splash right round him, and
  the bands beside the arrow lane wave gently instead of running as straight rails. In the clip the whirl stays wrapped round Benny
  as he steers (like his own wake) while its colours flow with the current; no seams or tearing.
* STILL WRONG: the swirl is more regular than the painting (even stripe widths, little sparkle inside the bands); the pink bands
  stay on the floor of the channel — the painted magenta swirls curve UP the tunnel sides; f03 foam heaps stand tall beside Benny.
* Rejected tries (scratch only): closed U rings (`m04nwt=0`, read like a target), mirror spiral (`m04nwt=-1`, wrong direction vs the
  painting), stripes 0.9 u / squash 0.7 (many thin rings); first try had a vertical seam and then a zigzag at the lane centre (fixed).
* Pictures: `qa/match/04/r18/s3_nwhirl/1_APPROVED.png`, `BEFORE/` (K18-2 = the step-2 NEW set), `NEW/` (K18-3, 12 shots),
  `NEW_swim_clip_half.mp4` (half size, 3.6 s straight / left / right / straight).

## Step 3b — cyan right round and straight below Benny (lead colour note on step 3) — `&m04nwc=1.3` — GOOD IMPROVEMENT (small)
Query (K18-3b): K18-3 + `&m04nwc=1.3` (soft edge `m04nwcs` 0.8; `m04nwc` 0 = the step-3 look).
* Code (`src/world/match04m4.ts`, river shader only, inside the whirl): behind Benny a soft cyan corridor 1.3 u either side of
  him; the whirl stripes still curve in from the sides but fade into the cyan water before they reach the middle.
* Start view: K18-3 vs K18-3b → 0 px differ (pixelmatch 0 / 1,171,584, rows 180–1536).
* WHAT LOOKS CLOSER (f06, f10, t33, t95, hard left / right): the big magenta pool under Benny at f06 / f10 is gone; as painted, the
  water right round and just below him is cyan with his white splash, and the pink sweeps in from the lower-left and lower-right.
* Rejected: `m04nwc=1.7` (too much plain cyan, the curving sweep mostly lost).
* Pictures: `qa/match/04/r18/s3b_nwc/1_APPROVED.png`, `BEFORE/` (K18-3, from the step-3 NEW set), `NEW/` (K18-3b: f03, f06, f10,
  t33, t95, hard left / right).

## Step 4 — LOW soft foam along the water edges instead of tall heaps beside Benny — `&m04flo=1` — GOOD IMPROVEMENT
Query (K18-4): K18-3b + `&m04flo=1` (needs `m04fclu`; defaults `m04floh` 0.25 heap height, `m04flov` 0.35 cluster dome height,
`m04flob` 0.6 big-bubble size, `m04flos` 0.55 bubble size, `m04flok` 2.4 bubble count, `m04flw` 1.5 cluster spread).
* Code (`src/world/match04m4.ts`, foam clusters only): same layout (the same random draws, so every clump stays where it was);
  each heap a quarter as tall, every cluster a flattened, wider bank of many smaller shiny bubbles with fewer big ones, no puffs heaped
  up the wall. 13,146 foam bubbles instead of 6,544, but much smaller (about three quarters of the old screen area to fill).
* Start view: K18-3b vs K18-4 → 0 px differ (the foam is hidden at the approved view).
* WHAT LOOKS CLOSER (f03, f06, steering, hard left / right, clip): the tall white cumulus heaps standing up beside Benny at f03 /
  f06 are gone; as painted, the foam now lies LOW along both water edges as banks of many small shiny bubbles; at hard left the pale
  puff in the bottom-left corner is now a small low bubble patch. In the clip the banks slide past world-anchored, no popping.
* STILL WRONG: the painted banks round the entrance rim are fuller (more, slightly larger bubbles in long continuous banks); here
  they are shorter separate patches.
* Rejected tries (scratch only): heights / domes only (`m04floh` 0.35, `m04flov` 0.45 with the old bubble size: still cloud heaps of
  big balls); `m04flos` 0.7 / `m04flok` 1.8 (coarser bubbles).
* Pictures: `qa/match/04/r18/s4_flo/1_APPROVED.png`, `BEFORE/` (K18-3b: f03, f06, f10, t33, t95, hard left / right), `NEW/`
  (K18-4, 12 shots), `NEW_swim_clip_half.mp4` (half size, 3.6 s).
* Note: this commit also carries the first, UNPROVEN code of the next step `&m04sswirl=1` (bank ribbons curving up the sides; off by default, not in any kept set yet).

## Step 5 — no smear while steering (lead: glitch seen in a real 4 s swim clip) — `&m04nwq=2&m04nwr=3.2` — GOOD IMPROVEMENT (glitch fix)
Query (K18-5): K18-4 + `&m04nwq=2&m04nwr=3.2` (both inside `m04nwhirl`; 0 = the step-3/4 behaviour).
* Cause (lead clip ≈1.0–2.0 s, reproduced with the same recipe `swim_clip.mjs 04 … 4`): while Benny steers to a side the camera
  falls farther behind him. (a) The whirl's cyan pocket / corridor follow Benny out of the clean centre lane and laid bare the raw
  painted river tile, magnified into big white-cyan cloud blobs; (b) far behind Benny the whirl's outer arcs grew into one broad
  stretched pink smear. The steady stills never show either.
* Code (`src/world/match04m4.ts`, river shader only): `m04nwr=3.2` the whirl reaches only 3.2 u round Benny (fading over 1 u),
  beyond it the bands run as the straight flowing stripes again; `m04nwq=2` the water the whirl leaves bare at / behind Benny shows
  the painted cyan streaks of the band strip's lane side (sampled across its cyan end with per-lane offsets so the streaks run with
  the flow side by side, not as bands straight across the river); the arrow lane ahead of Benny is untouched.
* Rejected tries (scratch only): `m04nwq=1` (clean lane water: still soft white blotches when seen close at a grazing angle); the
  painted cyan from one strip column (faint light bands straight across the corridor); a sample range reaching the violet part
  (the water under Benny turned pink-violet); a first version that also re-coloured the arrow lane ahead.
* Coin over Benny at ≈2.0 s (lead glitch 2): NOT scenery / water — the normal coin pickup: a collected coin pops at Benny's own
  position (rises 1.6 u, shrinks away in 0.35 s, `src/gameplay/coins.ts` 197–203), so for that moment it is really in front of him.
  Not changed here (coins are off-limits to this branch).
* (r19) Finished on `claude/rainbow-s04-match-c19` (the account ran out at 18:54 while the final renders ran; re-rendered here).
* Start view: `node scripts/capture.mjs 04` K18-4 vs K18-5 → 0 px differ (pixelmatch 0 / 1,171,584, rows 180–1536).
* WHAT LOOKS BETTER (clip 1.29 / 1.58 / 1.83 / 2.00 s, hard left / right): while Benny steers to the side, the big white-cyan
  cloud blobs in the water behind / beside him and the broad stretched pink smear far behind him are gone; that water now shows
  clean glossy cyan streaks flowing with the current, and the pink / cyan stripes beyond the whirl run on as long flowing bands.
  In the steady stills (f03–t95) the accepted whirl round Benny is unchanged (still sweeps in from both sides, cyan pocket +
  splash). HUD coin counts identical to BEFORE in every matching shot.
* STILL WRONG: the river is still a flat ribbon ending in a straight edge against the gold wall (painted: magenta / pink swirls
  curve UP the tunnel sides); the low foam banks are plain lilac-white (painted: pink- / cyan-tinted).
* Pictures: `qa/match/04/r18/s5_nwfix/1_APPROVED.png`, `BEFORE/` (K18-4: the step-4 NEW set + 4 clip frames), `NEW/` (K18-5,
  12 shots + clip frames `clip_1_29s` … `clip_2_00s`, `motion.json`), `BEFORE_swim_clip_half.mp4` / `NEW_swim_clip_half.mp4`
  (half size, first 55 frames ≈ 2.3 s = Screen 04 of the lead's 4 s straight / left / right recipe).

Kept set K18-5 (r19):
`match04=1&m04ring=1&m04river=1&m04bub=1&m04mouth=1&m04room=1&m04ry=0.8&m04rk=0.82&m04arr3d=1&m04a3k=66&m04a3w2=1&m04a3g=1.6&m04a3o=0.38&m04a3b=1&m04a3b0=3.0&m04a3b1=4.4&m04a3f0=25&m04a3f1=31&m04a3p=4.0&m04a3w=1.15&m04a3t=0.32&m04a3d=0.55&m04a3f=4&m04a3y=0.1&m04ringp=4.6&m04ringgw=1.2&m04tb=0.2&m04ts=0.22&m04paint=0.9&m04pink=1&m04pkl=2.15&m04pkw=0.9&m04a3hb=1&m04xf=2.6&m04lane=1&m04lanew=2.3&m04lanes=0.85&m04a3co=1.0&m04lane2=0.55&m04lgl=1.3&m04lsp=0.9&m04copper=1.3&m04edge=1&m04rf0=1.25&m04rf1=0.8&m04lbr=0.14&m04a3tex=1&m04bulge=0.18&m04lcd=1.0&m04lcw=1.7&m04a3fa=1.0&m04a3gb=0.16&m04a3tm=0.45&m04a3lum=1.1&m04a3rw=0.03&m04foam=1&m04foamr=2.5&m04foamn0=4.5&m04foamn1=6.5&m04fclu=1&m04sband=1&m04end=1&m04nband=1&m04nwhirl=1&m04nwc=1.3&m04flo=1&m04nwq=2&m04nwr=3.2`

## (r19) WHERE I STOPPED / NEXT — handoff to a fresh session (lead order 2026-11-19 ~19:40 UTC: finish the batch, then stop)
Stopped after step 5 (committed + pushed, `claude/rainbow-s04-match-c19` @ `88a6b837`). No unfinished edits, nothing uncommitted.
Next account: branch `claude/rainbow-s04-match-c20` from the newest `-c19` tip; worktree / port 5273 as before.
Kept set K18-5 (full query):
`match04=1&m04ring=1&m04river=1&m04bub=1&m04mouth=1&m04room=1&m04ry=0.8&m04rk=0.82&m04arr3d=1&m04a3k=66&m04a3w2=1&m04a3g=1.6&m04a3o=0.38&m04a3b=1&m04a3b0=3.0&m04a3b1=4.4&m04a3f0=25&m04a3f1=31&m04a3p=4.0&m04a3w=1.15&m04a3t=0.32&m04a3d=0.55&m04a3f=4&m04a3y=0.1&m04ringp=4.6&m04ringgw=1.2&m04tb=0.2&m04ts=0.22&m04paint=0.9&m04pink=1&m04pkl=2.15&m04pkw=0.9&m04a3hb=1&m04xf=2.6&m04lane=1&m04lanew=2.3&m04lanes=0.85&m04a3co=1.0&m04lane2=0.55&m04lgl=1.3&m04lsp=0.9&m04copper=1.3&m04edge=1&m04rf0=1.25&m04rf1=0.8&m04lbr=0.14&m04a3tex=1&m04bulge=0.18&m04lcd=1.0&m04lcw=1.7&m04a3fa=1.0&m04a3gb=0.16&m04a3tm=0.45&m04a3lum=1.1&m04a3rw=0.03&m04foam=1&m04foamr=2.5&m04foamn0=4.5&m04foamn1=6.5&m04fclu=1&m04sband=1&m04end=1&m04nband=1&m04nwhirl=1&m04nwc=1.3&m04flo=1&m04nwq=2&m04nwr=3.2`
Next tasks, in order (one URL switch per step, start view 0 px, coins unchanged, APPROVED / BEFORE / NEW + half-size clip):
1. `&m04sswirl=1` (code already in `match04m4.ts`, UNPROVEN, in no kept set; tunables `m04ssa` 0.45, `m04ssl` 6.5, `m04ssz` 0,
   `m04ssw` 3.2): the bank ribbons curve UP the tunnel sides like the painting instead of the water ending in a straight flat edge
   against the gold wall (most visible at hard right). Prove or reject; try `m04ssz` > 0 for a lapping top edge.
2. Colour up the low foam banks (`m04flo`) to the painted pink- / cyan-tinted foam (now plain lilac-white); make the entrance-rim
   banks fuller and more continuous.
3. Steering glitch sweep with the lead's 4 s clip recipe (first 55 frames = Screen 04): seams, popping, stretched textures.
Tools (recreate in the scratchpad): `tools/lead_r6/motion_audit.mjs` and `tools/lead_r13/swim_clip.mjs` copied with
`startVite(Number(process.env.PORT || 5273))`, an `ONLY=` shot filter and a `MAXF=` frame cap (see the r18 transcript). The ≈2.0 s
coin over Benny is the normal pickup pop: leave coins alone. Never edit the ring shader GOLD_FRAG (s04tex owns the rings).

## (r20) Round 20 — branch `claude/rainbow-s04-match-c21` (from preview v3 `09459079` = K18-5 water/foam + the rings worker's K9 rings)
BEFORE for every r20 step = the v3 query `qa/match/04/r19/PREVIEW_QUERY_v3.txt` (+ the r20 steps kept before it). Same real-game
shots (scratch copies of `tools/lead_r6/motion_audit.mjs` / `tools/lead_r13/swim_clip.mjs` on port 5273), coins identical in
every BEFORE / NEW pair. The r19b unfinished edit (`m04wup`, +98 lines) was restored and committed first (`dfeb60c`).

## (r20) Step 1 — the river CURVES UP the tunnel sides (no flat strip ending in a straight edge) — `&m04wup=1` — GOOD IMPROVEMENT
Query (K20-1): v3 + `&m04wup=1` (defaults: `m04wuh` 1.7 climb up the wall (u), `m04wul` 9 tongue wavelength, `m04wud` 0.35 tongue
depth, `m04wub` 0.6 band share at the old edge, `m04wut` 0.28 crest colour = hot-pink satin, `m04wus` 0.6 soft see-through top,
`m04wuw` 0.25 lilac lace on the crest, `m04wun0/1` 2 / 14 + `m04wuf` 0.3 lower far ahead, `m04wuv` 0.3 drift, `m04wug` 0.1).
`&m04sswirl=1` (r18, unproven) is NOT used: `m04wup` replaces it (sswirl only wiggled the band pattern inside the old flat strip).
* Code (`src/world/match04m4.ts`, river only): the trough edge now ends just in front of the flattened lower wall; from it a second
  see-through strip of the SAME river (same vertices / shader, `CLIMB` define) climbs up the wall circle 1.7 u, ramped in 1.4–4 u
  inside the opening. On it the painted band sequence continues: the violet / hot-pink satin part of the painted side band reaches
  the old edge, the rest climbs the wall, ending in long rounded tongues that lap up and down along the tunnel (higher round Benny,
  lower far ahead, drifting slowly with the current) and fade softly into the gold (no hard line, no white crest). World-anchored,
  shrinks with the K9 telescope rings, hidden in the approved view.
* r19b defaults rejected in r20 (scratch only): a lilac-white crest column + strong lace = snowy white "plateau" tops on the walls;
  short deep tongues (`m04wul` 6–7, `m04wud` 0.45–0.55) = pink flames. Kept: long gentle hot-pink sweeps with a soft top.
* Start view: `node scripts/capture.mjs 04` v3 vs K20-1 → 0 px differ (pixelmatch 0 / 1,171,584, rows 180–1536; 50 draw calls both).
* WHAT LOOKS CLOSER (f03, f06, f10, f20, steering and hard left / right, t33, t95, clip): the river was a flat cyan-pink strip whose
  sides stopped in a straight diagonal edge with bare gold wall beside and above it; now, as painted, the glossy hot-pink / magenta
  water sweeps UP both tunnel sides in long soft tongues and melts into the gold rings (pink-tinted gold above it), so the water
  fills the lower part of the tunnel like a half-pipe; while steering left / right the side Benny swims toward shows pink water
  rising up the wall beside him instead of a straight edge. Coins identical; nothing pops (the climb fades in with the 3D scene).
* STILL WRONG: the bank foam is small white cloud-puff clumps (painted: big glossy pearly bubble heaps) — next step; the climbing
  pink is plainer than the painted wall water (fewer cyan streaks / sparkles inside it).
* Pictures: `qa/match/04/r19b/s1_wup/1_APPROVED.png`, `BEFORE/` (v3), `NEW/` (K20-1): a00 start view, f03, f06, f10, f20,
  steering left / right, hard left / right, t33, t95; `BEFORE_swim_clip_half.mp4` / `NEW_swim_clip_half.mp4` (half size, 4 s
  straight / left / right / straight, the lead's recipe).
