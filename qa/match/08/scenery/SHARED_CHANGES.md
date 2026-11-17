# SHARED_CHANGES (s08 scenery r1)
* `src/world/match08.ts`: new switches `m08bw`, `m08lane`, `m08dbg` (match08 only; off = unchanged).
* `tools/match08/motion08.mjs`: optional `M08_SHOTS=full` extra frames; new `tools/match08/lane08.mjs`, `tools/match08/sheet08.py`.

# Round 5 (account 5, branch claude/rainbow-s08-scenery-c5)
* **`src/world/course.ts` (shared file, guarded by `match08` / `matchall`)**: `buildRoute(no08 = false)` parameter; under
  the switch the frame table keeps the DEFAULT build's sample spacing (`ds`), computed from a second default route.
  Reason: the 08 river path changes the course's total length, and `ds = length / (N − 1)` shifted every sample on
  03–07 slightly (04 ≈ 510k px, 07 ≈ 570k px changed). Default build: unchanged (0 px all 11 screens).
* `src/world/match08.ts`: new switch `m08fill` (fill shader path, uniforms `uFill*`, `uDrum`); `m08bw` kept; `m08lane` NOT kept (left in code, off).
* New `assets/textures/match08/fill_drum.png` + `.json`, `tools/match08/unwrap08.py`; `motion08.mjs` adds the `f20_forward20u` shot.

# Round 6 (branch claude/rainbow-s08-scenery-c6)
* `src/world/course.ts`: the round-5 08-only spacing guard (`buildRoute(no08)`) RESTORED (lost by autosave 48af969b).
* `src/world/match08.ts`: m08fill RESTORED; new switches `m08arch` (+`m08archk`), `m08swim` (+`m08swimw`), `m08seam` (+`m08seamk`, untested).
* `tools/lead_r6/motion_audit.mjs` copied from the lead branch (unchanged).
