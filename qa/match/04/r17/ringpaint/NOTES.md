# Screen 04 — painted-ring test `&m04rpaint` (round 17, continues the cut-off round-16 worker)

Brief: `docs/briefs/2026-11-18-r15/S04B_RINGTEX_LAUNCH.md` + `docs/briefs/2026-11-18-r17/RESUME_R17.md` ("s04tex").
Branch `claude/rainbow-s04-ringtex-c17` (= `-c16` tip `3fdcbc0b` + the account-16 unfinished step-5 edit). Steps 1–4 and their
pictures: `qa/match/04/r16/ringpaint/NOTES.md`.

Kept set now (K3) = L4 (`docs/briefs/2026-11-18-r15/S04_LAUNCH.md` "Kept set now") +
`&m04rpaint=1&m04rpsoft=1&m04rpj=0.35&m04rplu=3.95&m04rpgu=4.28` (r16 step 3, GOOD IMPROVEMENT for ring shape / surface).
BEFORE for every r17 step = K3 = `qa/match/04/r16/ringpaint/step3_lip/3_NEW_<shot>.png` (same build: r17 code is off by default).
`1_APPROVED.png` (this folder) = `references/04_through_the_five_arrows.png`, byte copy.

## Step 5 — painted light dots on every ring lip: K3 + `&m04rpdots=1` (20:50–21:20 UTC)
What it does (GOLD_FRAG, painted-ring path only, default off): small light dots on the painted bright lip line of every inner
ring — yellow-white core, soft orange halo, a little longer along the lip than across, ~16 cells per ring with ~70 % lit, irregular
angles (per-ring offset + per-dot jitter), sizes varying 0.6–1.4× (`m04rpds` = 0.06 u core). World-anchored on the ring (angle /
position inside the 4.6 u period), so they stay put while Benny swims; far dots shrink to about one pixel and dim instead of
vanishing or flickering. Sub-switches: `m04rpdn` (cells per ring, 16), `m04rpdf` (fraction lit, 0.7), `m04rpds` (core size).
The account-16 edit was the right step but drew thin dashed lines down the whole tunnel at every dot-cell border (its minimum dot
size used `fwidth()` of a value that jumps at each cell border); fixed with the wrap-free angle derivatives, separate size along /
across the lip.

Pictures: NEW `step5_dots/3_NEW_<shot>.png` for a00, f03, f06, f10, f20, t66, t95, s_left_hard, s_right_hard (motion log
`step5_dots/motion.json`); BEFORE = `../r16/ringpaint/step3_lip/3_NEW_<shot>.png`; APPROVED = `1_APPROVED.png`.
Check: approved start view unchanged — frozen `scripts/capture.mjs 04` K3 vs K3 + `m04rpdots=1`, Pixelmatch rows 180–1536:
**0 differing pixels** (`step5_dots/start_view_pixeldiff_BEFORE_vs_NEW.png`). Coins / Benny / water / HUD untouched (no code
outside the ring shader's painted-ring branch).

Verdict: **GOOD IMPROVEMENT (small, ring detail)** — every ring lip now sparkles with a row of small bright yellow-white light dots
with orange glows, at irregular angles and getting smaller deeper in the tunnel, like the painted ring lips; in step 3 the lips
had only a few broad soft glows. Visible at every swimming position (f03 → t95, hard left / right); nothing else changes.
Still different: the painted dots are a little larger and softer on the nearest rings.
Clip (half size 432×768, 3.6 s straight / left / right / straight, real gameplay): `step5_dots/clip_NEW_swim.mp4`; BEFORE clip =
`../r16/ringpaint/step3_lip/clip_NEW_swim.mp4`. The dots stay on their ring lips while swimming; no popping or sparkle noise seen.
Most visible remaining ring difference: the painted rings are brighter and more polished, with a soft pink-violet sheen and
violet (left) / pink (right) reflections of the water on the lower walls; the game rings are a plainer, dimmer copper there
(the straightened painted ring is a median over depth, which dropped most of that sheen).
