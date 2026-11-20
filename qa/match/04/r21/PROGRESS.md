# Screen 04 — round 21 water / foam / chevrons (foam-bubbles-particles)

Worktree `/home/user/wt/s04` (local branch `claude/rainbow-s04-match-c22`, uncommitted edits only, dev port 5273).
BEFORE for every step = kept set V4 (`/home/user/rainbow-/qa/review_r21/audit/QUERY_04.txt`) rendered in THIS worktree:
`qa/match/04/r21/BEFORE_V4/` (deterministic `tools/lead21/audit_screen.mjs`: a_start, b_early, c_middle, d_late, e_end,
f_hard_left, g_hard_right). APPROVED = `references/04_through_the_five_arrows.png` (copied as `1_APPROVED.png` per step).

## Step 1 — the pink water on the tunnel walls is crisp glossy satin, not a soft magenta haze — `&m04wgl=1` — GOOD IMPROVEMENT
Query (K21-1): V4 + `&m04wgl=1`.
* Cause of the haze: the climbing wall water (`m04wup`) carried the 256 px painted band strip (`tile_side04.png`) magnified many
  times near the camera, plus a 0.6 u soft see-through top that tinted the gold above it pink.
* Code (`src/world/match04m4.ts`, river shader only, inside `m04wup`): on the climbing water (and blended in just below the
  old edge, no seam) procedural satin ribbons running along the tunnel, rising and dipping with each tongue and waving gently
  with the flow; painted hot pink / magenta (a few violet and pale lilac ribbons, a few cyan streaks low down), an off-centre
  satin sheen inside each ribbon, a soft crease where ribbons meet, thin bright white-pink highlight streaks broken into long
  dashes, twinkling white glints, a see-through lilac top and a bright glossy lip right under a CRISP anti-aliased top edge
  against the gold (softer only where the climb ramps in at the opening, so no cut "fin" there). Resolution independent
  (distance fields + fwidth), world-anchored, flowing with the current — nothing follows the camera, so no smear while steering.
  Tunables: `m04wgn` 2.2 ribbons per u, `m04wgh` 0.85 highlight streaks, `m04wgs` 0.8 glints, `m04wge` 0.04 edge width,
  `m04wgp` 0.7 lip, `m04wgt` 0.25 lilac top share, `m04wgc` 0.35 cyan streaks, `m04wga` / `m04wgw` 0.18 / 6 waviness,
  `m04wgk` 0.12 crease, `m04wgo` 0.85 top alpha.
* Start view: V4 vs K21-1 → 0 px differ (pixelmatch 0 / 1,171,584, rows 180–1536; `s1_wgl/start_pixeldiff.png`).
* Gameplay: `node scripts/gameplay-test.mjs --q=<K21-1>` → 8/8 pass, 91 coins, 1,330 → 2,240 (`s1_wgl/gameplay.json`).
  HUD coins identical to BEFORE in every shot (1,330; hard left 1,360 in both).
* WHAT LOOKS CLOSER (c_middle, d_late, e_end, hard left / right, swim clip): the blurry magenta fog on both tunnel sides is gone;
  the water climbing the walls is now defined glossy pink / magenta ribbons with bright white highlight lines and glints, like
  the painted wall swirls, and it meets the gold rings in a clean edge with a bright lip (no pink haze smeared over the gold).
  In the clip the ribbons stay sharp and flow down the tunnel while Benny steers left / right.
* STILL WRONG: the ribbons are more regular / opaque than the painting (painted: fewer, more translucent swirls with the gold
  showing through near the top); the near river behind Benny (bottom third) is still the magnified soft marbled tile (painted:
  crisp swirl bands with many white glint streaks) — tried a crisp glint / detail layer for it (`m04cgl`, scratch only): thin
  hairline arcs round Benny and an embossed grain, NOT closer → removed.
* Rejected tries (scratch only): 3.2 ribbons per u with strong creases and short waves (striped "layer cake" walls, zig-zag
  far away); 1.6 per u (plain broad rolls); a crisp edge also over the ramp-in at the opening (a hard cut "fin").
* Pictures: `s1_wgl/1_APPROVED.png`, BEFORE `BEFORE_V4/`, NEW `s1_wgl/NEW/` (7 shots), `s1_wgl/BEFORE_swim_clip_half.mp4` /
  `s1_wgl/NEW_swim_clip_half.mp4` (half size, 3.6 s straight / left / right / straight; Screen 04 = the first ≈ 2.2 s),
  frames `s1_wgl/clip_frames/` (0020, 0040 = Screen 04; 0055 / 0070 already Screen 05, identical), `s1_wgl/code.patch`.
