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

## Rules for whoever continues
* The default build must stay pixel-identical to the last picture the user accepted (now: BEFORE) until the user
  accepts a test. Check: capture 05, compare with `qa/pilot05/wave9/baseline/05.png`.
* One factor per test, a URL switch, `ring_fit05.py` numbers, and a full-size approved | BEFORE | NEW picture.
* Protected: locked STAGE_CAM['05'], Benny, HUD, gameplay, 05→06 join, 07→08 descent, the S-shaped river.
