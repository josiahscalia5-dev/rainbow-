# Screen 04 — round 16 (account 16, worker `foam-bubbles-particles` for the lead) — branch `claude/rainbow-s04-match-c16`

Start: `160ce059` (r15 step 1 `m04fclu`, KEPT, shown to the user: GOOD IMPROVEMENT) + the r15 worker's unfinished task-3 edits
(side-band shader path in `src/world/match04m4.ts`, `assets/textures/match04/tile_side04.png`, `tools/match04/sideband04.py`),
restored uncommitted. History: `qa/match/04/r15/PROGRESS.md`, `qa/match/04/r14/`, `qa/match/04/r13/`.
Rules: VISUALS ONLY (`docs/briefs/2026-11-18-r15/USER_ORDER_R15_VISUAL.md`); task 2 (interior rings) is SKIPPED here (s04b worker,
`&m04rpaint`); this branch never edits the ring shader GOLD_FRAG.

Kept set K16-0 (= r15 K15-1):
`match04=1&m04ring=1&m04river=1&m04bub=1&m04mouth=1&m04room=1&m04ry=0.8&m04rk=0.82&m04arr3d=1&m04a3k=66&m04a3w2=1&m04a3g=1.6&m04a3o=0.38&m04a3b=1&m04a3b0=3.0&m04a3b1=4.4&m04a3f0=25&m04a3f1=31&m04a3p=4.0&m04a3w=1.15&m04a3t=0.32&m04a3d=0.55&m04a3f=4&m04a3y=0.1&m04ringp=4.6&m04ringgw=1.2&m04tb=0.2&m04ts=0.22&m04paint=0.9&m04pink=1&m04pkl=2.15&m04pkw=0.9&m04a3hb=1&m04xf=2.6&m04lane=1&m04lanew=2.3&m04lanes=0.85&m04a3co=1.0&m04lane2=0.55&m04lgl=1.3&m04lsp=0.9&m04copper=1.3&m04edge=1&m04rf0=1.25&m04rf1=0.8&m04lbr=0.14&m04a3tex=1&m04bulge=0.18&m04lcd=1.0&m04lcw=1.7&m04a3fa=1.0&m04a3gb=0.16&m04a3tm=0.45&m04a3lum=1.1&m04a3rw=0.03&m04foam=1&m04foamr=2.5&m04foamn0=4.5&m04foamn1=6.5&m04fclu=1`

## Step 3 — painted pink-magenta swirl bands on the side water — `&m04sband=1` — GOOD IMPROVEMENT
Query (K16-1): K16-0 + `&m04sband=1`
* Code (`src/world/match04m4.ts`, river shader): the side water carries the PAINTED swirl bands, cut from the approved picture by
  `tools/match04/sideband04.py` (the bands left of Benny unwrapped along their spiral into straight stripes →
  `assets/textures/match04/tile_side04.png`, approved pixels unchanged). Mapped by arc length across the trough (from 2.0 u out to
  the water edge, the cyan → violet → hot-pink → lilac part of the strip) and by world position along it (10 u long satin stripes
  flowing with the current, a slow 0.5 u sideways wander so they curve), the lilac-white edge fringe kept on top. World-anchored;
  only the side water inside the tunnel changes. Tunables (defaults used): `m04sbs` 0.95, `m04sbi` 2.0, `m04sbu` 0.7, `m04sbl` 10,
  `m04sbn` 0.5, `m04sbw` 0.45, `m04sbf` 1, `m04sbd0/1` 0 (off).
* Start view: `node scripts/capture.mjs 04` BEFORE vs NEW → 0 px differ (pixelmatch 0 / 1,171,584, rows 180–1536).
* WHAT LOOKS CLOSER: entering (f03), middle (f06–f10), farther inside (f20, t33, t66) and the end (t95) the water climbing the
  tunnel sides is no longer a flat smooth pink sheet: it is streaked satin swirl bands — hot pink, magenta, violet and lilac ribbons
  with white light glints, flowing down the slide like the painted bands. Hard left / hard right: the bands stay put on the water and
  flow, no stretching or tearing.
* STILL WRONG: the painted bands also sweep round Benny in the near water (in the game the near water inside the tunnel stays cyan);
  the painted side bands carry more thin cyan streaks between the pink ribbons.
* Rejected tunings (scratch only): the r15 defaults (tile length 2.4 u, full strip) turned the banks cyan with a chain of repeated
  pink blobs ("beads"); A / C (7 u, no / narrow wander) were plainer long stripes; B (narrower, 0.85) less saturated than D.
* Pictures: `qa/match/04/r16/s3_sband/1_APPROVED.png`, `BEFORE/` (K16-0 = the r15 step-1 NEW set, same kept set and code path),
  `NEW/` (K16-1, 12 shots), `NEW_swim_clip.mp4` (real gameplay, 3.6 s straight → left → right).
