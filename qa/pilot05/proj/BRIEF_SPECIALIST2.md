# Brief — SPECIALIST 2 (agent `water-fx-specialist`, role: Three.js water animation and flow-map engineer) — QUEUED

Not launched yet (2026-11-16 ~15:55 UTC). **Launch only after Specialist 1's static match has been shown to the user**
(`qa/pilot05/proj/NOTES.md`, `qa/pilot05/proj/compare/`). Branch `claude/rainbow-05-water-projection`.

## The user's words (2026-11-16 ~15:40 UTC) — keep exactly
> SPECIALIST 2: Three.js water animation and flow-map engineer.
> After the static water appearance is matched, animate that SAME design.
> The water must visibly flow down the S-curves toward the camera, with thick brilliant cyan liquid, sweeping glossy
> magenta ribbons, organic white reflections and natural flowing foam.
> Keep the approved color pattern and overall river layout anchored to the world while making the liquid details move.
> Do not replace the approved texture with a completely new procedural water shader.

Overall objective (user): "reproduce my original approved water's DESIGN FIRST, then make it move." No more rounds of
saturation / bloom / white-line changes. Show a short clip proving the water flows in the correct direction.

## Launch prompt (Agent tool, `subagent_type: water-fx-specialist`)
You are SPECIALIST 2 for the Rainbow game (repo /home/user/rainbow-, branch `claude/rainbow-05-water-projection`; stay
on it). Role: Three.js water animation and flow-map engineer for Screen 05. Read `CLAUDE.md`, then
`qa/pilot05/proj/NOTES.md` (Specialist 1's result and hand-over) and this file.

Task: animate the SAME projected design that Specialist 1 built behind `?proj05=1` (the user's original water artwork
`references/water/05_water_isolated_original.png`, target `references/05_flow_into_the_current.png`, baked onto the real
river mesh). Do NOT replace it with a new procedural water shader and do not add new streak / bloom / saturation looks.
* The colour pattern and river layout (cyan areas, magenta S-ribbons, foam banks) stay ANCHORED TO THE WORLD.
* The liquid DETAIL moves: the glossy white highlights / fine streaks flow down the S-curves TOWARD the camera
  (relative to the riding camera), following the river's own streamlines. Suggested method (measure, then choose):
  split the baked texture into a low-frequency base (anchored) and a high-frequency detail / highlight layer; advect only
  the detail layer along the flow with two-phase flow-map sampling (the flow map from the river's curves already exists:
  `src/vfx/flow05.ts` → `flowField05`, `FLOW05_GLSL`), small distortion amplitude so the design stays recognisable;
  foam banks get a gentle bobbing / drift of their own. Paused (time frozen at the locked checkpoint) the picture must
  stay the static match Specialist 1 demonstrated (state the residual vs the static picture).
* New switch `?projflow05=1` on top of `?proj05=1` (default build untouched; `q05` / `flag05` in
  `src/vfx/waterRibbon.ts`, `VITE_RAINBOW_Q05` for APKs).
* Proof of direction: a short clip (e.g. 3–4 s, portrait, MP4 via ffmpeg from a deterministic frame sequence) from the
  real game at Screen 05 + a measured optical-flow sign along the river (toward the camera), saved under
  `qa/pilot05/proj/flow/`. `window.__rainbow.step()` simulates without rendering — add a small QA-only render-on-demand
  hook if needed (no gameplay change).
* Protect: default == `qa/pilot05/current_default_05.png`, BEFORE `?ringa=26&nearfloor05=0` ==
  `qa/pilot05/wave9/baseline/05.png` (pixel-identical); gameplay `node scripts/gameplay-test.mjs --q='proj05=1&projflow05=1'
  --out=qa/pilot05/proj/tests/gameplay_projflow05.json` 8/8; `npm run test:continuity`; relative perf
  `scripts/perf05.mjs`; then an experiment APK (`VITE_RAINBOW_Q05='proj05=1&projflow05=1' npm run android:debug`,
  validate with `scripts/apk-web-check.mjs`; device fps stays UNVERIFIED without a phone — say so).
* Benny, camera, coins, steering, gameplay, 04→05 / 05→06 joins and the 07→08 descent must not change.
* Notes: `qa/pilot05/proj/flow/NOTES.md`. Honest numbers only; list what still differs from the approved image.
* Git: the five-minute autosave commits for you; never reset / rebase / force-push / switch branches; never edit
  `references/`, `backups/`, `CLAUDE.md`.
