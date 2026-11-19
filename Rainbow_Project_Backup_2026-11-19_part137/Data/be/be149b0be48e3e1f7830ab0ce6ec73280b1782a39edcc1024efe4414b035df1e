# Screen 08 scenery-in-motion — STATUS (round 1, STOPPED on lead's order 2026-11-17, usage running out)

* Branch `claude/rainbow-s08-scenery-c4`. **Start SHA `60c25025`** (lead's r4 commit). Final SHA: see `git log -1` / the lead message.
* State: **unfinished, safe checkpoint.** All new code is behind its own switch; with the switches off the default build
  and `?match08=1&coins08px=1` run exactly the old code path (tsc clean). Not yet verified 0 px with the frozen capture tool.
* Switches (all in `src/world/match08.ts`, active only with `?match08=1`):
  * `&m08bw=1` — chamber entrance wall flush behind the gold arch. **Visibly better** (removes the lower-left tear / second river copy at 6 u forward and when steering).
  * `&m08lane=1` (implies m08bw) — near pipe + gold arch scaled ×1.45 about the approved viewpoint, pipe's lower half squared off → wider swim lane. Geometry now correct (debug colours: Benny clear in all frames); real-texture frames NOT yet rendered after the last fix.
  * `&m08dbg=1` — QA only: each fitted surface in a flat colour.
* Tools: `tools/match08/motion08.mjs` (`M08_SHOTS=full` adds hard-steer frames), `tools/match08/lane08.mjs` (Benny/camera positions), `tools/match08/sheet08.py` (QA sheets, scratch only).
* Details + exact next task: `NOTES.md`.
