# Screen 04 — round 17 (account 17, worker `foam-bubbles-particles` for the lead) — branch `claude/rainbow-s04-match-c17`

Start: `465e4c59` (r16 step 3 `m04sband`, KEPT) + the account-16 unfinished edit (+91 lines in `src/world/match04m4.ts` = r16
`&m04end=1`, the distant glowing opening), restored uncommitted. History: `qa/match/04/r16/PROGRESS.md`, `qa/match/04/r15/`.
Rules: VISUALS ONLY (`docs/briefs/2026-11-18-r15/USER_ORDER_R15_VISUAL.md`); this branch never edits the ring shader GOLD_FRAG
(s04tex worker owns the rings).

Kept set K17-0 (= r16 K16-1):
`match04=1&m04ring=1&m04river=1&m04bub=1&m04mouth=1&m04room=1&m04ry=0.8&m04rk=0.82&m04arr3d=1&m04a3k=66&m04a3w2=1&m04a3g=1.6&m04a3o=0.38&m04a3b=1&m04a3b0=3.0&m04a3b1=4.4&m04a3f0=25&m04a3f1=31&m04a3p=4.0&m04a3w=1.15&m04a3t=0.32&m04a3d=0.55&m04a3f=4&m04a3y=0.1&m04ringp=4.6&m04ringgw=1.2&m04tb=0.2&m04ts=0.22&m04paint=0.9&m04pink=1&m04pkl=2.15&m04pkw=0.9&m04a3hb=1&m04xf=2.6&m04lane=1&m04lanew=2.3&m04lanes=0.85&m04a3co=1.0&m04lane2=0.55&m04lgl=1.3&m04lsp=0.9&m04copper=1.3&m04edge=1&m04rf0=1.25&m04rf1=0.8&m04lbr=0.14&m04a3tex=1&m04bulge=0.18&m04lcd=1.0&m04lcw=1.7&m04a3fa=1.0&m04a3gb=0.16&m04a3tm=0.45&m04a3lum=1.1&m04a3rw=0.03&m04foam=1&m04foamr=2.5&m04foamn0=4.5&m04foamn1=6.5&m04fclu=1&m04sband=1`

## Step 1 — the distant glowing opening at the end of the tunnel — `&m04end=1` — GOOD IMPROVEMENT (moderate, far away)
Query (K17-1): K17-0 + `&m04end=1`
* Code (`src/world/match04m4.ts`): the far end disc (`m04_ring_glow`) gets its own material END_FRAG (the ring shader GOLD_FRAG is
  untouched; only the disc's material is swapped behind the switch). It paints the tunnel CONTINUING past the modelled rings: a
  telescoping series of copper-gold rings (broad band brightening to a hot lip, thin dark groove) shrinking toward a warm
  white-gold light just above the water, pink-violet reflections on the lower ring walls, and the river carried on across the disc
  floor, converging into the light (cyan centre, pink sides, lilac haze, flowing glints). At the approved view the projected
  approved pixels still win (same `uAway` blend as the rings). Tunables: `m04eg` -0.28 light height, `m04eq` 0.78 ring shrink,
  `m04ec` 0.14 core, `m04eh` 0.55 halo, `m04es` 1.25 strength, `m04el` 0.62 far lane width, `m04ek` 1 ring contrast.
* Start view: `node scripts/capture.mjs 04` K17-0 vs K17-1 → 0 px differ (pixelmatch 0 / 1,171,584, rows 180–1536).
* WHAT LOOKS CLOSER: forward 10 u, 20 u, t66 and the end t95 (and while steering hard left / right): the end of the tunnel is no
  longer a flat orange plate with a pale blob, where the river stopped in a straight horizontal edge; it is now a deep telescoping
  run of rings narrowing into a bright warm-white light, and the river runs on into that light, like the painted far throat.
* STILL WRONG: the far rings on the disc are plain orange-copper (the painted far rings carry more pink-violet sheen and light
  dots); the painted light is a softer, larger haze. Small: it sits far away, so the change is moderate on screen.
* Rejected tuning (scratch only): e1 = the account-16 defaults (light 0.09 core / 0.35 halo at -0.35 r): a small hard light
  low at the waterline, read as a pin-point; e2 (now the defaults) = bigger warm halo.
* Pictures: `qa/match/04/r17/s1_end/1_APPROVED.png`, `BEFORE/` (K17-0 = the r16 step-3 NEW set, same kept set; the m04end-off code
  path is unchanged), `NEW/` (K17-1, 12 shots). No swim clip (the change is at the far end only; no motion artefacts in the 12 shots).
