# Image-Blaster × World Labs Marble — Screen 08 visual reconstruction TEST (controlled, one screen)

Started 2026-11-17 ~12:00 UTC, session 03b94f36, at the user's request. **Visual reconstruction test only: the Rainbow
game is NOT changed.** Approved image `references/08_final_spin_chamber.png` stays unchanged
(sha256 `ab7d0bc5…5e498e14`, listed in `scripts/reference.sha256`). Priority: the ENVIRONMENT, not Benny or gameplay.
**No paid generation has been run. Waiting for the user's approval of step 1 / step 2 below.**

## Setup (separate directory, outside the Rainbow repo)
* Tool: https://github.com/neilsonnn/image-blaster @ `4acb43ba126a12358f71838d1b1a05e856b10eaf` (license commit 2026-05-14),
  cloned to `/home/user/neilsonnn/image-blaster` (ephemeral container folder — NOT backed up; this file is the record).
  Re-create: `GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 https://github.com/neilsonnn/image-blaster /home/user/neilsonnn/image-blaster`,
  `cd /home/user/neilsonnn/image-blaster && bun install`, `.env` with placeholders only:
  `WORLD_LABS_API_KEY=proxy-injected` and `FAL_KEY=proxy-injected` (git-ignored; the real keys are injected by the
  session's network proxy), `cp /home/user/rainbow-/references/08_final_spin_chamber.png input/`,
  `node .claude/scripts/project/project-state.mjs --world rainbow-08-final-spin-chamber --stage-input`,
  then copy `image_analysis.json` (this folder) to `worlds/rainbow-08-final-spin-chamber/image.json` and
  `worlds/rainbow-08-final-spin-chamber/source/0-08-final-spin-chamber.json`.
* What it is: a Claude Code project (skills + sub-agents + Node scripts, only Node built-ins) plus a React/Three.js viewer
  (three 0.180, `@sparkjsdev/spark` for splats) on port 5173. Its README tells users to paste keys into chat — NOT done here.
* Models it calls: World Labs `marble-1.1` (`api.worldlabs.ai/marble/v1`, header `WLT-Api-Key`, downloads from
  `cdn.marble.worldlabs.ai`); fal.ai queue (`queue.fal.run`, header `Authorization: Key …`, downloads from
  `v3.fal.media` / `v3b.fal.media`): `fal-ai/nano-banana-2/edit` (clean plate, object reference images),
  `fal-ai/hunyuan3d-v3/image-to-3d` (3D objects, default 50k faces, PBR), `fal-ai/elevenlabs/sound-effects/v2` (SFX — not needed).

## Readiness checks (all run, 2026-11-17 ~12:00–12:10 UTC)
| Check | Result |
|---|---|
| Node / bun | v22.23.4 / 1.4.4 (preinstalled) |
| Viewer deps | `bun install` 342 packages; `tsc --noEmit` clean; `vitest` 13/13 (the 2 key tests pass with placeholders) |
| Viewer | `bun run dev` → http://localhost:5173/ HTTP 200 |
| Network BEFORE | proxy refused api.worldlabs.ai, cdn.marble.worldlabs.ai, queue.fal.run, fal.run, v3.fal.media (`CONNECT tunnel failed, 403`) |
| Network change (user-approved) | `rainbow-` environment allowed hosts + `cdn.marble.worldlabs.ai`, `v3.fal.media`, `v3b.fal.media` |
| Keys (user, secure form, never in chat/files) | `api.worldlabs.ai` (WLT-Api-Key) and `queue.fal.run` (Key prefix) saved as environment network secrets |
| World Labs key (free read) | `GET /marble/v1/credits` → 200, **7,000 credits** |
| fal key (free read) | `GET queue.fal.run/.../requests/<fake>/status` → 404 NOT_FOUND (authenticated; a bad key gives 401) |
| CDN reach | cdn.marble.worldlabs.ai answers itself (403 without signed URL = normal); fal CDN 404 at root = reachable |
| Input | staged as `worlds/rainbow-08-final-spin-chamber/source/0-08-final-spin-chamber.png`, sha256 identical to the original |
| Analysis (free) | `image_analysis.json` (Image-Blaster "uncover" format) |
| Not reachable | fal.ai / docs.worldlabs.ai web pages (pricing could not be read from this session) |

## Planned steps (each paid step waits for the user's OK)
**Step 1 — environment-only clean plate (PAID, fal `nano-banana-2/edit`, 1 image).** Removes overlay + non-environment
items so Marble does not rebuild them as blobs. Original stays untouched; the plate is a new derived file.
```
cd /home/user/neilsonnn/image-blaster
node .claude/scripts/image-edit/generate-edit.mjs \
  --image worlds/rainbow-08-final-spin-chamber/source/0-08-final-spin-chamber.png \
  --prompt "remove the following from the image: the game HUD bar at the top (heart counter, coin counter and pause button), the purple title banner reading 08 · FINAL SPIN CHAMBER, the pink fluffy character in the knitted hat and its white splash, all gold dollar coins, all floating soap bubbles" \
  --output-dir worlds/rainbow-08-final-spin-chamber/source --role plate \
  --output-slug 08-final-spin-chamber-plate --aspect-ratio 9:16 --resolution 2K
```
Then show APPROVED | PLATE as separate full-size pictures. The plate is AI-redrawn: if it changes the design (rings,
door, towel, spouts), reject it (retry once, or use the original image for step 2).

**Step 2 — Marble world (PAID, World Labs `marble-1.1`).** Measured cost on this API (ledger
`qa/worldlabs/05/pilot/LEDGER.md`, 2026-11-16): marble-1.1 = **1,580 credits** (≈ US$1.26 at 6,250 credits = US$5),
≈ 5 min; draft `marble-1.0-draft` = 230 credits (Image-Blaster hard-codes marble-1.1; draft would need a one-line local
change in the separate folder). Balance now 7,000.
```
node .claude/scripts/world/generate-world.mjs --world rainbow-08-final-spin-chamber --prompt "<WORLD PROMPT below>"
```
(uses the newest source image = the approved plate). WORLD PROMPT (empty environment, Image-Blaster rule):
> Stylized 3D cartoon game environment: the inside of a cylindrical washing-machine drum seen down its axis. Glossy
> magenta-purple metal walls and floor covered in rows of oblong perforation slots. A very large polished gold ring arch
> frames the foreground; gold ring bands and rounded gold rims recede into the chamber. At the far end a round silver
> chrome washer door with a thick rim, a hinge latch on its right and a glass porthole showing churning white foam and
> blue water. In front of the door a round perforated metal platform with a copper-gold rim on short gold legs, with a
> folded purple towel lying on it. Four copper-gold half-dome fixtures with perforated undersides protrude from the side
> walls, each pouring a thin clear water stream to the floor. A glossy winding channel of water with cyan and hot-pink
> streaks flows in an S-curve from the platform toward the viewer, bordered by low white foam banks. Bright warm golden
> highlights, strong specular reflections, cool cyan glow from the water and porthole, saturated high-key lighting,
> light water spray.

Outputs in `worlds/rainbow-08-final-spin-chamber/output/world/`: `N-world.json`, `N-world-plate.png`,
`N-world.glb` (collider mesh), `N-world-pano.png`, `N-world-thumbnail.webp`, `N-world-*.spz` (splats; the earlier
marble-1.1 world had 100k, 150k, 500k, full_res ≈ 30 MB).

**Step 3 — inspect + compare (free).** View in the Image-Blaster viewer; Playwright capture from the start view at the
approved framing; APPROVED | PLATE | MARBLE as separate full-size pictures + whole-frame numbers; copy the outputs
here (`qa/imageblaster/08/`, `.spz`/`.glb` go to Git LFS). Blender: import the collider GLB; splats need an add-on.

**Step 4 — optional 3D props (PAID, fal; ask first).** Per object: 1 `nano-banana-2/edit` reference image + 1
`hunyuan3d-v3/image-to-3d` model (GLB/OBJ, PBR textures). Candidates: folded towel, round platform, washer door,
half-dome spout fixture. Optional World Labs HQ textured mesh export of the whole world: 3,500 credits (≈ US$2.80,
ledger note) — not part of Image-Blaster.

## Meshes vs splats (what each output is)
* Editable meshes: the world's **collider GLB** (coarse, untextured whole-room geometry — the 05 draft collider had
  35,795 triangles; good for layout/scale/blocking in Blender, not for looks); **Hunyuan prop GLB/OBJ** (textured PBR
  single props, back sides invented, not placed/scaled in the scene); optional World Labs HQ mesh export.
* Gaussian splats: the **.spz** files carry the actual look (colours, gold, purple metal, water, foam, baked lighting).
  Viewable in Three.js with Spark and in the Image-Blaster viewer; NOT editable geometry; lighting is baked; they look
  closest from the original camera and degrade away from it; unseen areas are invented.
* **Panorama** PNG: 360° image, usable as an environment/reflection map. Thumbnail: preview only.
* Expectation from the 05 Marble test (`qa/pilot05/marble_feas/NOTES.md`): perspective from the input camera is right,
  exact geometry is not (far end collapses, unseen parts invented) — a reference/asset source, not a copy of the picture.

## Step 1 attempt (user approved ONE fal edit, 2026-11-17 ~12:15 UTC) — BLOCKED, nothing generated, nothing charged
* Prompt used (bubbles KEPT as scenery, per the user): remove the top HUD bar (5/5 hearts + plus, 2,040 coin counter,
  pause), the "08 · FINAL SPIN CHAMBER" banner, the pink fluffy character with knitted hat + the white splash directly
  around its body, all gold dollar coins; keep everything else exactly (composition, perspective, framing, colours,
  lighting, walls, gold rings, washer door, towel + platform, spouts + streams, water channel, foam banks, all soap
  bubbles); continue wall / ring / water / foam seamlessly. Flags: `--aspect-ratio 9:16 --resolution 2K`, 1 image.
* Attempt A: `fetch failed` — Node's built-in fetch ignores HTTPS_PROXY. FIX: run every Image-Blaster script with
  `NODE_USE_ENV_PROXY=1` (Node 22.23). Verified with free calls (fal status 404, World Labs credits 200 / 7,000).
* Attempt B/C: fal answered **403 `{"detail":"User is locked. Reason: Exhausted balance. Top up your balance at
  fal.ai/dashboard/billing."}`** — the fal account has no balance; the key itself is valid. No request id, no output.
* Local debug change (separate folder only): `.claude/scripts/asset-pipeline/fal-queue.mjs` submit error now includes
  fal's reply text.
* Next: the user tops up the fal balance (fal.ai → Dashboard → Billing), then the SAME single edit is re-run.
  World Labs untouched (7,000 credits).

## Step 1 DONE (2026-11-17 12:25 UTC, after the user topped up fal) — ONE paid fal edit, waiting for the user's review
* fal `fal-ai/nano-banana-2/edit`, request `01a1e977-fbf1-71c1-85c1-99f705c06551`, 26 s, 1 image, 2K, aspect 9:16 asked.
  Same prompt as above (bubbles kept). Output `1-08-final-spin-chamber-plate_fal_nano-banana-2_2K.png` 1536×2752
  (aspect 0.5581, not exactly 9:16 = 0.5625). Exact fal charge: see the fal dashboard (not returned by the API).
* Original `references/08_final_spin_chamber.png` unchanged (sha256 ab7d0bc5…, 13/13 references OK).
* Geometry (1,093 SIFT inliers on the kept scenery, median residual 0.39 px): uniform scale 0.992 (plate ≈0.8 %
  zoomed in), shift +3.3 px, rotation 0.006° → perspective and layout preserved, no warping.
  `08_plate_aligned_9x16_1536x2731.png` = the plate resampled once into the approved frame at 2K, exact 9:16
  (0.9 % of pixels, thin left/right edge strips, filled by edge replication). Recommended World Labs input.
* Numbers (`plate_vs_approved_08_metrics.json`, measures as tools/qa/screen_match.py), aligned plate vs approved:
  KEPT scenery (everything except HUD band y<190, Benny box, coins): mean |dRGB| 8.57, 92.7 % within 20 levels,
  73.1 % within 10, SSIM 0.901, blurred LAYOUT 100 % within 20. Bands: upper chamber 90.4 %, middle 87.8 %,
  sides of Benny rows 93.7 %, bottom 98.8 % within 20. Colour: kept-area mean RGB 172/104/163 → 177/102/166,
  saturation +2.9, brightness +3.3 (of 255). Whole frame incl. removed areas: 77.9 % within 20, SSIM 0.774.
* Seen in close-ups (`closeup_*`): door, porthole, hinge, towel, platform, spouts, streams, rings, walls, foam, bubbles
  = same design, fine detail re-rendered (porthole drops, towel terry pattern, perforation edges). HUD + banner area
  → continued slot rows + top of the gold ring (invented, consistent). Coins → river streaks continued (invented).
  Benny → river continued; a white splash crest stays across the river where his splash was (y ≈ 1060–1230) —
  not part of the approved environment.
* NEXT: user reviews; Step 2 (World Labs marble-1.1, ≈1,580 credits) only after the user's OK.

## Step 1b — splash-crest cleanup (user Option B, 2026-11-17 12:51 UTC) — ONE more paid fal edit
* Input = the reviewed plate aligned to exact 9:16 (`2-…-plate-aligned`). fal `nano-banana-2/edit` request
  `01a1e98f-f07f-7e42-ab22-c7e268dc85a3`, 32 s, 2K. Raw output `3-08-plate-nosplash_fal_edit2_raw.png` (again
  1536×2752, again ≈0.8 % zoom, and the WHOLE picture re-rendered: mean change 6.6 levels outside the crest).
* So only the crest area was taken from edit 2 (aligned by 1,573 SIFT inliers, 0.54 px): change > 25 levels inside the
  crest box, cleaned, widened 22 px, feathered 8 px (`08_clean_blend_mask.png`); 5.8 % of the frame blended, 2.6 % fully
  replaced; every other pixel is byte-identical to the reviewed plate (checked).
* RESULT `08_plate_CLEAN_aligned_9x16_1536x2731.png`: exact 9:16, aligned to the approved frame (scale 1.000, shift
  0.0 px, 1,130 inliers). Kept scenery 92.4 % within 20 levels, SSIM 0.896 (`clean_plate_vs_approved_08_metrics.json`).

## Step 2 — World Labs Marble world (user-approved, 2026-11-17 12:54–12:59 UTC)
* `generate-world.mjs` (marble-1.1), input = the CLEAN plate (PNG, base64 inline) + the empty-environment WORLD PROMPT
  above. World `32b5b2f4-32bc-4fa5-80a5-861129a528c8`, operation `0de603c2-c44f-47d1-b3c6-be4c05506dce`, ≈5.5 min.
  Credits 7,000 → **5,420 (1,580 spent)**. HQ / full-res mesh links: not included (collider mesh only).
* Saved `world/`: splats 100k / 150k / 500k / full_res (30 MB), collider `0-world.glb`, 360° pano (4608×2304),
  thumbnail, world JSON (signed URLs stripped).
* RESULT — composition NOT preserved. Marble rebuilt the chamber as a long deep tunnel: door + towel + platform tiny at
  the far end, river long and narrow, the four spout fixtures not in the forward view; invented extras around/behind the
  camera (more washer doors, more dome fixtures, extra gold ring loops, a second towel on a stool).
  Pano camera fit (`tools/imageblaster/pano_fit.py`): best NCC only 0.38 and at a WRONG view (yaw 23°); straight-ahead
  views 0.15–0.28 (`renders/pano_straight_ahead_views.png`). Real 3D splat render from the origin (Spark 0.1.10,
  `tools/imageblaster/render.html` + `render08.mjs`, 500k, f 450, pitch −8): vs approved FULL 6.4 % within 20 levels,
  SSIM 0.24, LAYOUT 7.5 % (`renders/marble08_vs_approved.json`); colours/materials similar (purple slotted metal, gold,
  cyan-pink water, foam). Moving the camera forward (z −2/−4/−6) does not recover the layout; splats smear, the camera
  enters the water (`renders/marble08_forward_z*.png`).
* Conclusion: Marble (via Image-Blaster) gives a stylistically similar but compositionally different world for 08 — far
  below the 90–95 % target. Same finding as the 05 Marble test. Usable: material/colour reference, distant backdrop,
  collider for scale. The CLEAN PLATE itself (92.4 % kept scenery, no Benny/HUD/coins) is the valuable output: the
  right source for camera-projecting the approved look onto the game's own 08 geometry (the 05 method).
