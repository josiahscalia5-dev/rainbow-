# Round 21 → next account: where everything stopped (2026-11-20 ~02:45 UTC) — HANDOFF

Lead session `session_018Sg3AS52AWzs9dteBtUpsM`, branch **`ccr-68d26c2d-gwegce`** (start the next account's session on THIS branch).
The user is moving to another Claude account (credits). Nothing was merged into any other branch this round.

## User decisions / authorizations this round (binding — verbatim parts in the transcript `backups/claude-sessions/5a3a0996-c88f-53c3-8888-e587e3601a8b/`)
1. Goal (02:00): ALL five playable screens 04–08 must look like the approved pictures WHILE Benny swims (opening, deeper, bends,
   hard left / right, exit) — 8.5–9/10 in the actual playable game; ORIGINAL APPROVED / BEFORE / NEW images + uninterrupted
   gameplay clips; honest reports.
2. **Paid artwork APPROVED (02:20, "item 4")**: use paid image credits / project resources whenever a better approach needs them; no
   per-job permission; report jobs + credit costs + results. Generate extra views ONLY for scenery the originals do not show, guided
   by the originals + the game's real camera positions and geometry; same architecture / water / colours / lighting / foam /
   materials. **Show proposals for visual approval before treating them as accepted references.** Originals stay unchanged and
   clearly separated from generated views. Other work continues while the user reviews.
3. **Up to FOUR specialists at once (02:20, "item 5")**, separate responsibilities, coordinated; save often (incl. unfinished edits
   + continuation notes). "Faster" = faster development; Benny's gameplay speed and controls unchanged.
4. **Screens 06 + 07: camera-framing TESTS approved** to preserve the approved composition while swimming — must keep real forward
   movement, steering, depth, route visibility; show actual gameplay before keeping a candidate.
5. **Screen 08: RESUMED** — remaining polish incl. the coin sizing; build on the saved successful version (`3c0fa970`, K16).
6. A consistent approved Benny throughout, all five screens on the completion checklist.

## Done this round (all on `ccr-68d26c2d-gwegce` unless noted)
* Screen 04 rings: `&m04rsoft=1` + `&msaa=4` — cause + numbers `qa/match/04/r21_rings/NOTES.md` (patch vs `70e5595` there).
* Audit of the best build of every screen in motion: `qa/review_r21/audit/` (OVERVIEW_0N.png, QUERY_0N.txt) — lead by eye
  (start / swimming): 04 ~9 / ~6.5 · 05 ~9 / ~8 · 06 ~8.5 / ~5 · 07 ~9 / ~5 · 08 ~9 / ~8.5.
* Screen 04 preview **V4** = `34cb4941` + rings `70e5595` + r21 (`QUERY_04.txt`).
* Tools: `tools/lead21/audit_screen.mjs` (deterministic start/early/middle/late/end/hard L/R), `tools/lead21/clean_frame.mjs`
  (same, scenery only: no HUD / Benny / coins), `tools/lead21/fal_view.py` (one paid fal `nano-banana-2/edit` job, logged).
* **Generated artwork (paid, $0.60 so far — `qa/review_r21/artwork/LEDGER.md`)**: Screen 04 continuation views at the game's own
  middle / late / end cameras (clean frame = structure, `plate04_hybrid_fal.png` = style): proposals `c_middle_p2_v1`,
  `d_late_p3_v1`, `e_end_p2_v1` in `qa/review_r21/artwork/04/proposals/`; labelled approval sheets `FOR_APPROVAL_04_*.png`
  (shown to the user ~02:45, **verdict pending**). Earlier tries kept for the record (`c_middle_v1`, `d_late_p2` = too many dots).
  Clean structure frames already rendered for 07 (`artwork/07/game_frames/` b_early … e_end) and 05 (`artwork/05/game_frames/`
  d_late, e_end) — no jobs run for them yet. Prompt template: `artwork/04/prompt_04*.txt`.

## Workers — where each stopped and how to resume
| Worker | State | Code | Next |
|---|---|---|---|
| **s04 water / foam / arrows** (foam-bubbles-particles, brief `S04_R21.md`) | STOPPED (account switch) after step 1 **`&m04wgl=1` GOOD IMPROVEMENT** (glossy pink / magenta ribbons with highlight lines up the tunnel walls, crisp edge vs gold; 0 px start, 8/8, 91 coins). Kept **K21-1 = V4 + `&m04wgl=1`** | base `34cb4941` + `qa/match/04/r21/code_at_stop_full.patch` (V4 rings + r20 unfinished `m04farsm/m04endfit/m04bbx` + `m04wgl`); untracked tools in `qa/match/04/r21/untracked_tools/`; log `qa/match/04/r21/PROGRESS.md` | task 2 foam banks deeper into the tunnel (+ `m04bbx`), task 3 chevrons / Benny through them neatly, then `m04farsm` / `m04endfit`; near river behind Benny still a soft marbled tile; once the user approves the 04 proposals: project them (below) |
| **s07** (water-fx-specialist, brief `S07_R21.md`) | STOPPED after step 1 **`&m07end=1` GOOD IMPROVEMENT** (the end's pale streaky waterfall → glossy cyan river with thick magenta banks in the ring tube; 0 px start, 8/8, continuity OK). Kept **K7&m07end=1** | base `8accdad0` + `qa/match/07/r21/code_at_stop_full.patch`; tools `qa/match/07/r21/untracked_tools/`; log `qa/match/07/r21/PROGRESS.md` | flat pale foam sheets → puffy clouds; the middle (view faces the close bend wall) — the user APPROVED a framing test (`&m07view=1`, show gameplay first); faint 2.4 u ripple repeat on the bands |
| **s06** (cloud session `session_018Sg3ATJADxqD5ATsNChkL5`, brief `S06_R21.md`) | started ~02:34 but NEVER began its task (idle since 02:40; its branch `claude/rainbow-s06-match-c22` holds only 3 bootstrap autosaves `ccde6d9` / `e3a7359` / `3cdd53b` on top of `c649fcbc`) — nothing lost | start from `c649fcbc` (+ the r18 WIP in `backups/wip/claude__rainbow-s06-match-c18/`) | relaunch with `S06_R21.md`: `&m06view=1` composition test (user-approved), rank-3 WIP, foam walls |
| **Benny** (cloud session `session_018Sg3ASkM3eaYYiggDeDayi`, brief `BENNY_R21.md`) | started ~02:34 but NEVER began its task (idle since 02:40; no `claude/rainbow-benny-c22` on GitHub) — nothing lost | `claude/rainbow-benny-c21` @ `bade5941` + `backups/wip/claude__rainbow-benny-c21/` | relaunch with `BENNY_R21.md`: plush fur → per-screen exposure → pompom / cuff / star / size |
| s08 polish | QUEUED (user resumed 08) | `claude/rainbow-s08-scenery-c17` @ `3c0fa970` (K16 in `qa/review_r21/audit/QUERY_08.txt`) | coin sizing (coins look larger than painted), verdict on the unfinished `m08gl` near-water glints, towel double |
| s05 polish | QUEUED | `claude/rainbow-s05-match-c19` @ `eb7233e3` (`QUERY_05.txt`) | end of 05 (smeared walls, bunched coins), hard left (foam column, streaked wall) |
| Lead | | | show the user the 04 proposals → on approval: **multi-plate projection** (each accepted view projected from its own game camera onto the 04 geometry, blended by distance along the route, world-anchored) as a URL switch; then the same pipeline for 07 (frames ready), 05 end, 06 (after its framing test settles) |

## How to resume on the new account (step by step)
1. Start a Claude Code cloud session on `josiahscalia5-dev/rainbow-`, branch **`ccr-68d26c2d-gwegce`**. The bootstrap runs; check
   `python3 -I scripts/autosave-status.py` → AUTOSAVE OK. Reconnect (user, in claude.ai): GitHub + Claude GitHub App, connectors
   **World Labs Atlas** and **Hugging Face**; keys **World Labs** (`api.worldlabs.ai`, header `WLT-Api-Key`) and **fal**
   (`queue.fal.run`, `Authorization: Key`) only via the secure form, and only if the free checks fail; the environment must allow
   `v3.fal.media`, `v3b.fal.media`, `cdn.marble.worldlabs.ai`. Context7 is optional.
2. Recreate the worker worktrees: `bash docs/briefs/2026-11-20-r21/setup_worker_r22.sh` (s04, s07 from the saved patches on NEW
   `-c23` branches; s06 / Benny from their pushed `-c22` tips on `-c23` branches; 08 / 05 from their tips). On the new account the
   workers MAY push their own `-c23` branches (normal rule: only their own branch).
3. Relaunch up to four specialists (user-approved): s04 (`S04_R21.md`, continue at task 2, kept K21-1), s07 (`S07_R21.md`, continue
   at task 2 + the framing test, kept K7&m07end=1), s06 (`S06_R21.md`, resume from its PROGRESS), Benny (`BENNY_R21.md`, resume from
   its PROGRESS) — and 08 / 05 polish when a slot frees. Check first whether the OLD account's cloud sessions are still running
   (`list_sessions` won't show them on a new account — read their branches); never write `-c22` branches from the new account.
4. Lead: ask the user for the verdict on `qa/review_r21/artwork/04/FOR_APPROVAL_04_*.png`, then continue the artwork pipeline.
