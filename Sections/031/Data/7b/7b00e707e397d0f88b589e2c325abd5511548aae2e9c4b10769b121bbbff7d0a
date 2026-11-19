# Screen 04 — round 9 progress (small steps; continues `qa/match/04/r8/PROGRESS.md`)

Kept query at the start of round 9 (r8 steps 1–3): `?match04=1&m04ring=1&m04river=1&m04foam=1&m04bub=1`.
BEFORE pictures of that query at the 12 audit positions: `/home/user/wt/s04/qa/match/04/r9/BEFORE/` (`metrics.txt`).
Every NEW set: `node tools/match04/audit04.mjs <dir> "<query>" <shots>` (same positions and names as BEFORE).
Approved-view check: deterministic `node scripts/capture.mjs 04 --q=<query>` + `tools/match04/metrics04.py`.

## Step 1 — `&m04mouth=1` — the approved gold washer opening with its glowing bulbs (kept)
* **What looks better while swimming:** the washer opening Benny swims toward is no longer a flat, matte orange
  "marquee" arch with a row of evenly spaced orange dots. It is now the painted opening itself: a thick POLISHED gold
  band with a thin bright outer lip and a bright inner lip, bright yellow-white glow at the top, warm vertical light
  glows across the band, the dark groove inside it, and its glowing bulbs sitting on the lips exactly where the
  approved picture paints its hot lights (warm white cores with soft amber halos, crisp at every distance). The ring
  keeps this look from the approved view all the way in (3 u, 6 u, steering left / right).
* **How:** `tools/match04/mouth04.py` unwraps the approved pixels of the mouth ring through the locked projector on the
  fitted mouth plane, straightens the painted (not perfectly round) band by aligning every angle to the centre's
  profile (continuous path, no jumps), removes the foam overlapping its outer lip, mirrors it past the painted arc
  (under the water line) → `assets/textures/match04/tile_mouth.png`; the 14 painted hot spots on the two lips →
  `mouth04.json` (+ mirrored ones). The modeled opening (new lathe profile, front face 0.15 u proud of the wall,
  rounded lips, inner lip curving into the tunnel) samples it through the projector (homothety onto the painted plane,
  so the approach continues the approved view); the bulbs are camera-facing glow sprites at the painted positions.
* **Approved view unchanged:** deterministic capture → whole frame 81.4 % within 20 levels (SSIM 0.815), scenery
  98.2 % (SSIM 0.974) — same as the kept query (≤ 3 levels on the ring itself; 180 px differ at the ring's water ends).
* **Measured** (`motion_metrics.py`, PALETTE BEFORE → NEW): f03 73.4 → 77.9 %, f06 69.0 → 74.1 %, s_left_steer
  70.3 → 75.8 %, s_right_steer 69.8 → 75.4 % (LAYOUT20 unchanged, 2.8–3.5 %).
* **Still wrong:** the tunnel interior behind the opening (thin, dense, streaky rings; a grey-violet patch and a seam
  on the first ring at the top; the far end is a big orange disc instead of a small bright glow); the laundry room
  above the opening smears when the camera gets close; rings too red-orange; arrows; water under the camera.
* BEFORE: `/home/user/wt/s04/qa/match/04/r9/BEFORE/f03_forward3u.png`, `.../BEFORE/f06_forward6u.png`,
  `.../BEFORE/s_left_steer.png`, `.../BEFORE/s_right_steer.png`
* NEW: `/home/user/wt/s04/qa/match/04/r9/step1_m04mouth/f03_forward3u.png`, `.../step1_m04mouth/f06_forward6u.png`,
  `.../step1_m04mouth/s_left_steer.png`, `.../step1_m04mouth/s_right_steer.png`
