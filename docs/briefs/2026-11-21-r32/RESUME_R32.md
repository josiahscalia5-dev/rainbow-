# RESUME — round 32 (2026-11-21), lead branch `claude/screen-05-3d-geometry-9yu7pu`, draft PR #28 (never merge without the user's OK)

## Where we are (Screen 05 only — the user forbids other screens and new credits until Screen 05 is approved)
* Approach that works: a REAL 3D splat world reconstructed from the approved Screen 05 picture (Marble full world `qa/worldlabs/05/r32/full_500k.spz`,
  World Labs world `8bb4cf11-…`), rendered with Spark 2.4.0 on three.js 0.180 in a standalone page (`tools/marble05/viewer/play3.html`), the improved
  3D Benny (`assets/models/benny31.glb` + bake + paddling shader), a follow camera that starts EXACTLY at the approved picture's camera.
* Full-length level = `tools/marble05/build_track.py`: start piece + copies of the sharp ring-to-ring section placed ring-on-ring (3D ring centres
  `tools/marble05/viewer/rings.json`), ONLY the river mirrored in alternate copies (S-bends alternate; mirroring the walls gave dark gaps), water
  cross-faded at each ring, light copies far away, the world's own tunnel end. Splat budget ~0.8 M visible (Spark's Android budget 1–2 M).
* Tested alternatives (proofs in `qa/`): painted picture (`?paint=1`, still), zoom loop (`?paintfly=1`), Marble 1.1 Plus (`qa/worldlabs/05/r32`,
  ~3 s usable), SpAItial Echo-2 (`qa/spaitial/05`, same ~2–3 s usable). One generated world alone is sharp for only ~2–3 s of swimming; the
  ring-to-ring track is the only way found to keep the whole level sharp.
* Two specialists were running when this account ran out (briefs `AGENT_A_CONTROLS.md`, `AGENT_B_WATER.md`; their newest work is saved every 5 min
  to `backups/wip/screen05-agents/agentA|agentB` — check `LAST_SYNC_UTC`):
  - A (animation-and-gameplay-engineer): swipe controls — lanes / leap / dive / air coins / camera — `controls.js`, test log showed smooth lane
    change (left lane reached in ~0.25 s with lean, camera following); see its `CONTROLS_NOTES.md`.
  - B (water-fx-specialist): flowing water (`waterflow.js`) + removal of the dark gaps at the water/wall edges + far-end fix (`track_w/`,
    `out_water/before|after`).
* Known defects before their work: dark patches 650–2,557 px in every frame of the first ~1 s (rule above), far end reads as a narrower tube,
  static water, Benny ~10 % larger than the painted Benny (fixed in play3.html: 0.9 × size, 22 % under the water).

## Next steps (in order)
1. `bash docs/briefs/2026-11-21-r32/setup_r32.sh` → workspace with base + both specialists' newest saved work.
2. If a specialist's notes say it was unfinished, relaunch it with its brief (same subagent_type), workdir from step 1; do not interrupt running ones.
3. Merge: start from agentB's play3.html + track (visuals) and add agentA's `controls.js` + `// [controls]` hooks (or the reverse) into a merged folder.
4. Acceptance: `node tools/marble05/viewer/final_acceptance.cjs <merged> <out>` (whole level, 7.6 s at 1.4 u/s, 30 fps, REAL CDP touch swipes on a
   412×915 isMobile/hasTouch Android-portrait emulation; logs lanes/height/coins, checks freezes / teleports) + `visual_check.py` (dark patches,
   sharpness, flicker, colour look vs approved). Fix and re-run until EVERYTHING passes.
5. Only then send the user the video + test results + push. If something cannot be fixed, say exactly what and why — never present it as finished.
6. Limits to state honestly: no physical Android device / real emulator here (browser Android emulation with real touch events); splat world is
   softer than the painting; repeated ring sections (walls) by design (user allowed rings/structures to repeat, not the river every second).

## Keys (never in git): World Labs Marble API key (host `api.worldlabs.ai`, header `WLT-Api-Key`) and SpAItial API key (host `api.spaitial.ai`,
`Authorization: Bearer`) were saved as environment network secrets on the old account — on a new account check with free reads first
(`python3 -I scripts/verify-assets.py worldlabs`; `curl https://api.spaitial.ai/v1/models`), then the secure credential form only on 401/403.
Credits: Marble 2,030 left (ledger `qa/worldlabs/05/pilot/LEDGER.md`), SpAItial 640 free this month (`qa/spaitial/05/LEDGER.md`).
