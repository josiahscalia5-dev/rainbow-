# Screen 06 — round 25 progress (worktree `/home/user/wt/s06`, LOCAL branch `claude/rainbow-s06-match-c26`, ports 5276 / 5282 / 5283)

## (r26) WHERE I STOPPED / NEXT
* ~13:15 UTC — relaunched (new account), worktree `/home/user/wt/s06` LOCAL branch `claude/rainbow-s06-match-c27` (r25 edits incl. m06hole).
* Step 1 judgement of the existing shots (`step1_hole/{CURRENT,NEW,WDBG_NEW}`): the bright hard-edged cone body is GONE in NEW (the cut-out
  now shows painted water continued from around it); start view 0 px. NOT yet clean: (a) at 3 % the painted lacy ring left at the
  checkpoint is still half visible (ring zone hands over slowly, `smoothstep(0.15, 0.9, dAp)`); (b) the fill is smooth combed stripes
  without the painted water's sparkle, so below Benny at 3-7 % it reads as a smoother, stretched patch. Fix = `&m06hole=2` (fast ring
  hand-over synced with the carried rings + the painted water's own fine sparkle carried into the fill). NOW: CURRENT opening clip
  rendering (`step1_hole/clip.sh CURRENT`), building m06hole=2.

## (r25) WHERE I STOPPED / NEXT
* ~12:05 UTC — started. Read CLAUDE.md, `docs/briefs/2026-11-20-r25/LAUNCH_R25.md` (s06), the lead's diagnosis
  `qa/match/06/r24/lead_rip/NOTES.md` (cone = the cut-out hole where the painted Benny was removed from the projected painting,
  filled with the river's own brighter water, hard Benny-shaped edge; `m06ripz` removed the left-behind ring only).
* Step 1 `&m06hole=1` (the user's opening effect — the cut-out hole + the pinned painted ring filled with the approved
  picture's own painted water continued from the water around it; keep only the carried shallow rings; start view 0 px):
  ~12:36 BUILT. Hole measured in the river's own coordinates (`tools/match06/r25_frames.mjs` = game course frames,
  `tools/match06/r25_unwrap06.py`: the painted Benny's cut-out spans ds -0.6..+3.6 u, up to 3.5 u wide). Fill tool
  `tools/match06/make_hole06.py` method `flow` (painted streaks carried across the hole along their own direction + Poisson blend,
  sources = painted water only; foam heaps and big painted bubbles kept; first try = patch fill REJECTED on sight: blocky mosaic,
  copied foam). Output `assets/textures/match06/tile_hole06.png`, `tile_hole06w.png`, `hole06.json`; shader + loader in
  `src/world/match06.ts` (`m06hole`; QA dump `m06holedump`); `tsc` clean. Floor-space before/after:
  `qa/match/06/r25/step1_hole/floorspace_*.png`. NOW: proof shots NEW / CURRENT / WDBG_NEW rendering (`step1_hole/render.sh`,
  waits for a render slot). NEXT: compare, clip 1.0x + 0.5x, gameplay 8/8 + 91, verdict.
* Note (user, ~12:20, via lead): judge by the MOVING views — clean continuous painted water round Benny in motion, no hard
  edges, no brighter patch, no left-behind rings.

CURRENT (what the user saw) = `qa/match/06/r24/lead_rip/QUERY_RIP.txt`:
`match06=1&m06geo=1&m06flow=1&m06cam=1&m06la=25&m06tun=1&m06ring=1&m06bub=1&m06foam=1&m06gold=1&m06fclu=1&m06st=1&m06fcl=1&m06view=1&m06vs=0&m06rip=1`

---
## (r23, copied from `qa/match/06/r23/PROGRESS.md`) WHERE I STOPPED / NEXT — STOPPED after 3 finished steps (final report sent to the lead, ~09:55 UTC)
* Step 1 `&m06fcl=1` (big white foam walls → low separate puffy heaps): **GOOD IMPROVEMENT** (moderate). Candidate for K6.
* Step 2 `&m06view=1&m06vs=0` (ring tunnel held off-centre right through the first second): **GOOD IMPROVEMENT** as a
  camera-framing TEST — the USER decides (show the clip); never in the kept set without the user's OK. No code change.
* Step 3 `&m06rip=1` (the painted ripple rings round Benny carried with him): **GOOD IMPROVEMENT (small)** — visible round
  Benny in the first ~0.7 s and up close; subtle later. Candidate for K6 (lead / user decide).
* Nothing committed / pushed from the worktree (lead autosave snapshots it). Uncommitted code: `src/world/match06.ts`
  (step 3), `src/game/Game.ts` (1 line, step 3); QA tools `tools/match06/r23_*.mjs`. Container restart ~09:40 UTC: worktree,
  proofs and all 5 clips intact (re-verified 09:49: `tsc` clean, step 3 `code.patch` == live diff, references 13/13 OK).
* Best combined query so far (each part still needs the lead's / user's OK):
  `match06=1&m06geo=1&m06flow=1&m06cam=1&m06la=25&m06tun=1&m06ring=1&m06bub=1&m06foam=1&m06gold=1&m06fclu=1&m06st=1&m06fcl=1&m06view=1&m06vs=0&m06rip=1`
* NEXT (most visible remaining differences, by eye): (1) after the crest top (~47 % on) the rings still drift back into a
  target near the top centre — the game river turns ~18° right / 12° down off the straight painted tunnel; framing cannot hold
  it, bend is banned, so only a route or approved-artwork decision by the user could; (2) at the crest top the river beyond is
  hidden for a moment with `m06vs=0`; (3) big near foam clouds in the lower right mid-stage and when steering hard right
  (they partly cover Benny); (4) hard steering early still cuts Benny at the screen edge (as K6); (5) coins along the crest.
* Lead note (all workers): worktrees whose `node_modules` is a symlink to `/home/user/rainbow-/node_modules` get the HUD fonts
  refused by Vite (fallback font in every shot). `tools/match06/r23_vite.mjs` (fs.allow incl. the real node_modules) fixes it;
  the river shader's wall clock also makes per-run water differ — pin `performance.now` around the draw for BEFORE / NEW.
