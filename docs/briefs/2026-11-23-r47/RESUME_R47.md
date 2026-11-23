# Round 47 — resume here (2026-11-23, session branch `ccr-6deca498-03lhkc`, continues round 46 `claude/rainbow-screens-05-06-10w5xd` @ 32d5da4)

## User order (binding, verbatim in `USER_R47.md`)
Keep the approved Screen 05 look; the new preview (`USER_PREVIEW_R47_05_layout.png`) only guides a small LAYOUT adjustment. Build it from a small
set of reusable parts (one gentle river route, reusable tunnel sections, repeated gold rings + paddles, a few foam clusters, repeating wall
textures, one continuous water material), reuse Benny + gameplay, build a SHORT playable section first, show it while Benny swims and steers,
and EXPLAIN THE VISUAL COMPROMISES before extending the approach to other screens.

## State
* Built: `tools/mod05/` (README of results + compromises: `qa/mod47/README.md`). A new, separate test page; the default game, the round-46
  world (`tools/world/`), the screen kit and every earlier switch are untouched.
* Evidence: `qa/mod47/` (start / swimming / steering / before-vs-new sheets, separate full-size stills, the real-touch gameplay clip + checks).
* Phone build (private artifact): https://claude.ai/artifact/SqRksN3PVEvvYHpmkav7wa (rebuild: `bash tools/mod05/build_phone.sh <ws>/game <out>`).
* WAITING FOR THE USER: their verdict on the look + the compromises list. Do not extend the modular method to 04 / 06 / 07 / 08 / 09 / 10, and do
  not wire it into the app, before the user has decided.

## Rebuild / check
```
bash tools/mod05/setup_mod05.sh /tmp/ws47                       # tiles (~30 s once) + runnable folder
NODE_PATH=$(npm root -g) node tools/reflock/section_run.cjs /tmp/ws47/game /tmp/st47 stills 1.35,8,16 0 'sentinel=1'
TOUCH=1 NODE_PATH=$(npm root -g) node tools/reflock/section_run.cjs /tmp/ws47/game /tmp/run47 run end '<plan json>' 'sentinel=1'
python3 -I tools/reflock/encode_run.py /tmp/run47 <out> <name>
python3 -I tools/screenkit/segment.py references/05_flow_into_the_current.png tools/screenkit/screens/05/segment05.json /tmp/seg05   # SAM 2 mask (bash tools/screenkit/get_models.sh once)
python3 -I tools/screenkit/compare_screen.py 05 <frame> /tmp/seg05/mask.png <out>
```
Look values live in `tools/mod05/mod05.json` → `look` (A/B per URL: `?L_wall_glow=0.9&L_ring_glow=0.5`); fog = depth fade toward the measured
far-tunnel magenta (`fog`, URL `fogc / fogn / fogf`).

## Lessons this round (three.js 0.170)
* `scene.environment` IGNORES `material.envMapIntensity` (scene.environmentIntensity is used): set `material.envMap` explicitly or every
  metal / wall reflects at full strength (washed-out pale walls).
* LatheGeometry faces point to the right of the profile's direction: a profile drawn outer -> inner -> along the drum made the front face of
  every ring face AWAY from the camera (culled; the plain back face showed through). Reverse the profile.
* `fwidth()` inside a per-cell `if` is undefined (GLSL): it drew big light rectangles in the water. Compute derivatives once, outside branches.
* Never put a `//` comment inside a one-line statement list (it hung the page; round-45 rule again) — use `/* */`.
* Real perspective packs far rings together (ring face / gap ratio grows with distance): the painting draws them thin — a depth fade toward the
  far-tunnel colour keeps that look.
