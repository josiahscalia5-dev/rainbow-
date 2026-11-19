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
