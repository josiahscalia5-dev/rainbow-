# Screen 05: wave 9b — BEFORE restored, controlled geometry tests (session `012NR93N`, branch `ccr-44f84024-ii5iih`)

2026-11-16, from ~09:50 UTC. Coordinator work in the main session (no specialists launched: the user asked to stop
wasting credits at 03:20 UTC, then "Continue" at 09:50).

## The user's decisions (2026-11-16 ~10:20 UTC) — these override earlier wave notes
1. **Google Flow videos cover the opening and the ending** (girl loads the washer with hidden Benny; girl retrieves
   the towel). Do NOT spend effort rebuilding 01 / 02 / 11 as detailed 3D artwork. Keep the video hand-over working
   (`docs/FLOW_VIDEO.md`); intro → gameplay and gameplay → ending must be seamless.
   **No video file is in the repo yet** (`public/video/` holds only the placeholder) — the user has to upload
   `intro.mp4` / `ending.mp4`; until then the real-time 3D cinematics play.
2. **Specialists focus on PLAYABLE gameplay, screens 03–09.** Screen 05 first ("as close as possible to the approved
   artwork, ideally 90–95 % if achievable"), then the screens that differ most: 03, 04, 06, 07, 08, 09.
   Use the existing Marble assets, Blender and Three.js. Keep the ten specialists, the five-minute autosave, all
   gameplay mechanics and the 07→08 descent.
3. **Screen 05 tunnel: the BEFORE picture (`qa/pilot05/wave9/baseline/05.png`) is the preferred baseline.**
   The user compared approved | BEFORE | "big tunnel test 1" and rejected the test: it stretches the gold rings
   horizontally and makes the tunnel flatter and more oval. "My approved tunnel is deep, beautifully rounded and
   cylindrical, with gold rings receding naturally into the distance."
   * Do not merge the big/oval tunnel. Do not simply enlarge the tunnel radius again.
   * Measure projected ring positions, widths, heights, spacing and the vanishing point against the approved image.
   * Correct geometry and perspective together, locked gameplay camera preserved wherever possible.
   * Keep the natural S-shaped river running into the golden light.
   * Controlled tests, ONE major geometric factor at a time; always show approved | BEFORE | NEW side by side.
   * Keep a test only if its visual structure is clearly closer to the approved image.

## What was done
* **BEFORE restored exactly.** `git checkout aa35c8a -- src` (aa35c8a = the code that produced the wave-9 baseline
  captures). A fresh `scripts/capture.mjs 05` is pixel-identical to `qa/pilot05/wave9/baseline/05.png`
  (max pixel difference 0; 86 calls / 567,415 tris).
* **Not merged, kept for reference:** `qa/pilot05/wave9b/not_merged/wave9_partial_and_coordinator_tests_vs_BEFORE.patch`
  = everything that was in `src/` on top of BEFORE: the unfinished wave-9 specialist work (environment oval K 1.7 +
  bank floor + shift + oval lids; path-camera it01 far coins + oval far section; water it01/it02; foam it01–it06) and
  the coordinator's tests of 09:50–10:20 (big tunnel b 10 / hc 8.6, round + ring A, wall tint). Also in git history
  (this branch up to ffcd7be; recovery branch `claude/rainbow-3d-account-recovery-xex5hc` 6faf1a2). Individual pieces
  may come back ONLY as their own controlled test (foam it06 and the far coin trail are the likely candidates).
* **Why the oval was wrong.** The wave-9 "ovals" (ring #1 490×270, #2 284×170, #3 184×102) each paired one ring's
  SIDES with the next ring's TOP: ring A's top is hidden behind the HUD/title, the gold arc under the title is ring
  B's top. Traced separately, the approved rings are round.

## Measurement (tools/qa/ring_fit05.py → `qa/pilot05/wave9b/rings/`; overlays there show the fitted circles)
Circle fit to the gold pixels of each ring's upper arc, 864×1536. Vanishing point ≈ (500, 470) in both pictures.
| ring | APPROVED centre | radius | band | BEFORE centre | radius | band | radius BEFORE vs approved |
|---|---|---|---|---|---|---|---|
| A (front, frames the picture) | (474, 529) | 492 | 64 | (505, 426) | 374 | 69 | **−24 %** |
| B | (477, 447) | 240 | 38 | (506, 440) | 228 | 42 | −5 % |
| C | (491, 458) | 150 | 23 | (502, 455) | 153 | 17 | +2 % |
| D | (493, 464) | 88 | 12 | (500, 470) | 96 | 10 | +9 % |
Radius ratios A/B, B/C, C/D: approved 2.06 / 1.60 / 1.69; BEFORE 1.64 / 1.49 / 1.59. (Rings E, F lie inside the
vanishing-point glow; the fit is unreliable there and is not used.)
Reading: BEFORE's round tunnel already has B, C, D right. Structural gaps, in order: (1) front ring A 24 % too small —
it floats inside the frame as an extra hoop instead of framing the picture; (2) A's centre is 44 px ABOVE the
vanishing point, the approved A is 59 px BELOW it (the near tunnel axis should run below the eye, not above);
(3) the approved ring centres sit 23–26 px (A, B) and 7–9 px (C, D) LEFT of the vanishing point, BEFORE's sit 0–6 px
right of it.

## Controlled tests (default build = BEFORE; each test is a URL switch until the user accepts it)
| Test | The one factor | Switch | Result | Status |
|---|---|---|---|---|
| T1 | depth of the front ring only: 26 u → 20 u ahead of the checkpoint eye (`RING_A05_DEPTH`, environment.ts) | `?ringa=20` | A radius 374 → 455–490 (approved 492), A/B 1.64 → 2.00 (approved 2.06); B, C, D, walls, river, camera pixel-identical to BEFORE; 86 calls / 567,415 tris | shown to the user 2026-11-16; **waiting for the user's yes/no** — evidence `qa/pilot05/wave9b/T1/` |
| T2 (next) | height of the near tunnel axis around ring A (≈2 u lower at ring A, back to BEFORE by ring B) | — | expected: A centre 78 px above → ≈60 px below the vanishing point; A's arc appears in the upper right corner like the approved | not run |
| T3 (next) | lateral offset of the tunnel axis ≈ −0.6 u | — | expected: ring centres 20–40 px further left (approved: 23–26 px left) | not run |
After the geometry: colour/gloss of rings, lids and walls, vanishing-point glow, water depth and flares, foam, the far
coin trail — each as its own test against BEFORE.

**Re-verified 2026-11-16 ~11:12 UTC (session `01Kbt6BT`, branch `ccr-251ed97c-ty2xvp`, after the recovery):** default
build capture pixel-identical to `qa/pilot05/wave9/baseline/05.png` (max diff 0, `claude-bootstrap.sh --full`); the
T1 capture (`--q=ringa=20`) pixel-identical to `qa/pilot05/wave9b/T1/05.png` (max diff 0). T1 was shown to the user
again (`qa/pilot05/wave9b/T1/05_approved_before_T1.jpg`). **T2 is planned ON TOP of T1** (its expected numbers start
from T1's ring A, 78 px above the vanishing point; BEFORE is 44 px above), so T2 waits for the user's T1 answer:
yes → T2 on top of T1; no → re-plan T2 against BEFORE (ring A at its BEFORE depth 26 u).

## T2 — tunnel height (2026-11-16 11:15–11:25 UTC, session `01Kbt6BT`) — ALL REJECTED, BEFORE kept
Measured the eye vs the 05 tunnel axis (`tools/qa/axis05.ts`): radius 7.6 u, floor 3.4 u under the stream, tunnel
centre 0.6 u (0.08 R) ABOVE the locked eye. Marble full world (`splat_measure.json`): approved eye ≈ 0.05 R above the
axis. Ring fits (`qa/pilot05/wave9b/T2/rings_*.json`, dy/r = centre below VP ÷ radius):
| version | A | B | C | D |
|---|---|---|---|---|
| APPROVED | +0.120 | −0.096 | −0.080 | −0.068 |
| BEFORE | −0.118 | −0.132 | −0.098 | 0.000 |
| whole tunnel +1.5 u | −0.023 | +0.098 | +0.090 | +0.138 |
| near tunnel only (to ring A) +1.2 / +1.6 / +2.0 u | −0.029 / +0.035 / +0.107 | −0.132 | −0.098 | 0.000 |
* Whole-tunnel lowering pushes B–D away from the approved → rejected on the numbers.
* Near-only lowering moves ring A's centre toward the approved while B–D, camera, water and gameplay stay identical
  — but ring A's top arc drops into the picture under the title (an extra hoop) instead of framing it like the
  approved (whose ring A is r 492, its top hidden behind the HUD). Not clearly closer → rejected by the user's rule.
  Position alone cannot give the approved front ring; it needs ring A's SIZE (T1, waiting for the user).
* Code removed from the game; patch `not_merged/T2_nearfloor05_REJECTED.patch`; full-size picture
  `T2/05_APPROVED_BEFORE_T2best_fullsize.png`. **User 2026-11-16 ~11:20: no more endless tunnel positioning.**

## T2 on top of T1 — PROMOTED to the default (2026-11-16 ~11:45 UTC, user: "keep T1 as a saved experiment …
## perform T2 … only promote T2 if it is genuinely closer")
T2 = T1 (ring A at 20 u) + the near tunnel lowered up to ring A (blends back before ring B), tested at 0 / 1.2 /
1.6 / 2.0 / 2.4 u (`T2b/rings.json`, `T2b/approved_before_T1_T2variants.jpg`, `T2b/upper_right_arc_comparison.jpg`):
| ring A | centre | r | top y | meets right edge at y |
|---|---|---|---|---|
| APPROVED | (474, 529) | 492 | 37 | 229 |
| BEFORE | (505, 426) | 374 | 52 | 321 |
| T1 | (486, 414) | 460 | −46 | 153 |
| **T2 2.0 u (promoted)** | (502, 478) | 433 | 45 | 241 |
| T2 2.4 u | (505, 503) | 430 | 73 | 266 |
Rings B, C, D identical to BEFORE in every variant; camera, river (course), Benny untouched; 06 and 07 captures
pixel-identical; 04 changes only 672 px (the 05 wall seen through the 04 exit); gameplay test 8/8 pass, plunge 61.41;
continuity OK. Default now = `RING_A05_DEPTH` 20 + `NEAR_FLOOR05` 2.0; **BEFORE = `?ringa=26&nearfloor05=0`, verified
pixel-identical to `wave9/baseline/05.png`**. Current default picture: `qa/pilot05/current_default_05.png`. Separate
full-size screenshots: `T2b/1_APPROVED_05.png`, `T2b/2_BEFORE_05.png`, `T2b/3_T2_05.png`. Remaining ring-A gap:
radius −12 %, centre 51 px above the approved. No further tunnel-position tests (user).

## Biggest visible differences (user priority order, measured by `tools/qa/diff05.py` → `wave9b/DIFF05_APPROVED_vs_BEFORE.md`)
1. Glossy gold rings + PURPLE-metallic tunnel: BEFORE walls too pink (tunnel band pink 50 % vs 37 %), too few white
   light streaks (0.9 % vs 3.8 %), gold packed around the vanishing point (11.7 % vs 4.6 % in the VP band).
2. Cyan-and-pink S-river into the golden light: BEFORE river ≈ 50 % too wide (cyan mid band 38.7 % vs 23.3 %, near
   49.1 % vs 32.1 %) and its S-swing 13–34 % smaller (far 152 vs 231 px). River width touches steering/foam-wall
   bumps → its own test with the gameplay test.
3. Reflections, lighting, foam, splashes: foam amount similar (white 8–10 %), look differs (fine bubbles vs clumps);
   candidate foam it06 (`not_merged/wave9_foam_it06.patch`).
Tests so far (URL switches, default = BEFORE, pixel-identical checked):
| Test | Factor | Result | Status |
|---|---|---|---|
| W1 `?wall05=1` (first values) | pale violet wall F0 + strong white streaks | washed-out lavender, pink 20 %, sat 0.50, slots and gold lost | rejected (values replaced by W2) |
| **W2 `?wall05=1`** | saturated violet wall F0 `#a878ff` / emissive `#300a66`, streaks ×1.27 | walls read purple like the approved (pink 50 → 22 %, sat 0.64 vs 0.70); white highlights unchanged 0.9 %, slots dark violet instead of black | **candidate — shown to the user, waiting for yes/no** (`W2/05_APPROVED_BEFORE_W2_fullsize.png`) |
Next, one at a time: (a) brighter white-pink highlights/marquee spots on walls + rings, (b) deeper yellow-gold rings,
(c) fewer/larger rings around the VP + golden light, (d) river width + S-swing (with gameplay test), (e) foam it06.

## Rules for whoever continues
* The default build must stay pixel-identical to the last picture the user accepted (now: BEFORE) until the user
  accepts a test. Check: capture 05, compare with `qa/pilot05/wave9/baseline/05.png`.
* One factor per test, a URL switch, `ring_fit05.py` numbers, and a full-size approved | BEFORE | NEW picture.
* Protected: locked STAGE_CAM['05'], Benny, HUD, gameplay, 05→06 join, 07→08 descent, the S-shaped river.
