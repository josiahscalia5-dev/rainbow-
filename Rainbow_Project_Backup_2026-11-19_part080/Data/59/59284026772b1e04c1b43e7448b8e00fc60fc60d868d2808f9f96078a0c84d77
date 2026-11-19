# Screen 04 — round 15 (account 15, worker `foam-bubbles-particles` for the lead) — branch `claude/rainbow-s04-match-c15`

Start: `claude/rainbow-s04-match-c14` @ `fc28323a` (r14 L4). Kept set at start (K15-0 = r14 L4):
`match04=1&m04ring=1&m04river=1&m04bub=1&m04mouth=1&m04room=1&m04ry=0.8&m04rk=0.82&m04arr3d=1&m04a3k=66&m04a3w2=1&m04a3g=1.6&m04a3o=0.38&m04a3b=1&m04a3b0=3.0&m04a3b1=4.4&m04a3f0=25&m04a3f1=31&m04a3p=4.0&m04a3w=1.15&m04a3t=0.32&m04a3d=0.55&m04a3f=4&m04a3y=0.1&m04ringp=4.6&m04ringgw=1.2&m04tb=0.2&m04ts=0.22&m04paint=0.9&m04pink=1&m04pkl=2.15&m04pkw=0.9&m04a3hb=1&m04xf=2.6&m04lane=1&m04lanew=2.3&m04lanes=0.85&m04a3co=1.0&m04lane2=0.55&m04lgl=1.3&m04lsp=0.9&m04copper=1.3&m04edge=1&m04rf0=1.25&m04rf1=0.8&m04lbr=0.14&m04a3tex=1&m04bulge=0.18&m04lcd=1.0&m04lcw=1.7&m04a3fa=1.0&m04a3gb=0.16&m04a3tm=0.45&m04a3lum=1.1&m04a3rw=0.03&m04foam=1&m04foamr=2.5&m04foamn0=4.5&m04foamn1=6.5`

Lead note (r15): task 2 (interior rings) moved to `/home/user/wt/s04b` (`claude/rainbow-s04-ringtex-c15`, `&m04rpaint`); this
branch does not touch the ring shader GOLD_FRAG. Order here: 1 foam → 3 pink side swirls → 4 next biggest difference.

## Step 1 — foam as clusters of many small shiny bubbles — `&m04fclu=1` — GOOD IMPROVEMENT
Query (K15-1): K15-0 + `&m04fclu=1`
* Code (`src/world/match04m4.ts`): every kept L4 foam puff (same layout, same entrance-rim limit, same near fade window) becomes
  a low heap of 4–48 small bubbles (a few big, many medium / small; own random stream, so the floating bubbles and every other
  layout stay identical). New shader FOAMB_FRAG = a pearly lit bubble: white-lilac top-left, lilac middle, lavender-pink lower
  right, pink bounce light from the water, a faint pink / cyan rim light on the shadow side, a crisp white window highlight and a
  tiny second glint. Two passes of the same instances: opaque cores (depth-writing) + see-through rims blended on top. Near the
  camera the bubbles SHRINK away (no pale puff popping in the corners). Tunables (defaults used): `m04fch` 0.75 heap height,
  `m04fcs` 1.3 cluster size, `m04fcb` 1.25 bubble size, `m04fck` 1 count, `m04fcr` 0.035 smallest bubble, `m04fce` 0.5 rim
  see-through, `m04fcg` 1 highlight, `m04fcd` 1 lilac depth. 6,544 bubbles (console `[match04] m04fclu`), instanced, one draw call per pass; only near the entrance.
* Start view: `node scripts/capture.mjs 04` BEFORE vs NEW → 0 px differ (pixelmatch 0 / 1,327,104).
* WHAT LOOKS CLOSER: entering (f03) and just inside (f06) the foam round the entrance now reads as the painted foam — bubbly heaps
  of many glossy lilac-white bubbles with white highlights and soft light rims (BEFORE: smooth plain white balls). Hard left: the
  big pale semi-transparent puff across the bottom-left corner is gone; a bubbly foam heap shrinks away there instead. Farther
  inside / end: unchanged (no foam inside the tunnel, as before).
* STILL WRONG: painted foam bubbles are a little pinker / more saturated in the shadows and the biggest painted bubbles are larger;
  at hard right a few tiny shrinking bubbles linger in the bottom-right corner for a moment.
* Rejected tunings (scratch only): q1/q2 (bubbles too small and sparse: read as scattered beads), q4 (hard white outline rings:
  flat cartoon discs).
* Pictures: `qa/match/04/r15/s1_fclu/1_APPROVED.png`, `BEFORE/` (K15-0, 12 shots), `NEW/` (K15-1, 12 shots),
  `NEW_swim_clip.mp4` (real gameplay, 3.6 s straight → left → right).
