# Round 22 — coordination (new account; lead session branch `ccr-4742c19f-ez2mrs`, 2026-11-20 from ~03:05 UTC)

Lead session `session_0179kWgNJzw5v4674DNtMpda`. Started from the round-21 lead `ccr-68d26c2d-gwegce`. Nothing merged anywhere.
User authorizations carried forward verbatim from round 21 (`docs/briefs/2026-11-20-r21/RESUME_R21.md` §"User decisions"): paid
artwork, up to FOUR specialists at once, 06 + 07 camera-framing TESTS, Screen 08 resumed, consistent approved Benny on 04–08.

## Restore audit (lead, ~03:10 UTC)
* Checkpoint `47bfbf8` (02:44) is an ancestor of this branch. Newer: `8c76568`, `6badff7`, `521cc82`, `c58faf2` (02:45–02:48,
  end-of-session saves, in this branch) and `e1b1311` (03:02, only on `ccr-68d26c2d-gwegce`: end-of-session metadata — cost state,
  last prompt, WIP INFO timestamps; no game work, no user verdict). Left on GitHub, not merged.
* Git LFS: 89 / 89 real files, 577.2 MB, 0 pointer stubs, 89 / 89 on GitHub LFS.
* s04 / s07 saved patches = byte-identical to the autosave WIP snapshots → applied ONCE in fresh worktrees (below); tsc OK.
* **Newer work found:** `claude/rainbow-s06-match-c22` @ `c7cac38` (02:50) — the round-21 06 session DID start after the handoff
  was written: `&m06view=1` built + tuned (defaults `m06vw=20,38`, `m06vx=0.85`, `src/game/cameraRig.ts`, `src/world/match06.ts`),
  BEFORE / NEW shots in `qa/match/06/r21/step1_m06view/`; it was recording the swim clip when it stopped; no verdict, no
  PROGRESS.md. The r18 rank-3 WIP is ALREADY applied there (do not re-apply). → s06 restarts from `c7cac38`, not from `c649fcbc`.
* Benny: `claude/rainbow-benny-c22` @ `70d3b83b` as recorded (restored r20 WIP, untested).

## Workers (four at once, user-approved)
| Worker | Agent / where | Branch / worktree | Port | Launch |
|---|---|---|---|---|
| s04 water / foam / arrows | in-process `foam-bubbles-particles` | LOCAL `claude/rainbow-s04-match-c23` in `/home/user/wt/s04` (`34cb4941` + r21 patch), uncommitted; WIP autosaved to `backups/wip/claude__rainbow-s04-match-c23/` | 5273 | `LAUNCH_S04.md` |
| s07 | in-process `water-fx-specialist` | LOCAL `claude/rainbow-s07-match-c23` in `/home/user/wt/s07` (`8accdad0` + r21 patch), uncommitted | 5277 | `LAUNCH_S07.md` |
| s06 | cloud session (path-camera + reference-match roles) | `claude/rainbow-s06-match-c23` from `c7cac38` (pushes its own branch) | 5276 | `LAUNCH_S06.md` |
| Benny | cloud session (benny-character-artist) | `claude/rainbow-benny-c23` from `70d3b83b` (pushes its own branch) | — | `LAUNCH_BENNY.md` |
| s08 polish | QUEUED (next free slot) | from `claude/rainbow-s08-scenery-c17` @ `3c0fa970` | 5278 | coin sizing, `m08gl` verdict, towel double |
| s05 polish | QUEUED | from `claude/rainbow-s05-match-c19` @ `eb7233e3` | 5275 | end of 05, hard left |
| Lead | this session | — | — | 04 artwork proposals await the user's verdict → multi-plate projection; keys |

### Launched ~03:17 UTC
* s04, s07: in-process background agents of this lead session (reports arrive here; logs `qa/match/0N/r22/PROGRESS.md`).
* s06: cloud session `session_0179kWgNZhiYHyDdV12Eaw6e` → `claude/rainbow-s06-match-c23`.
* Benny: cloud session `session_0179kWgM7wtBDT3n5KLuLz7o` → `claude/rainbow-benny-c23`.
Resume after an interruption: s04 / s07 = `git worktree add -b <branch> /home/user/wt/s0N <INFO.head>` + `git apply --binary
backups/wip/claude__rainbow-s0N-match-c23/tracked.patch`, then relaunch with `LAUNCH_S0N.md` (continue from r22 PROGRESS.md);
s06 / Benny = their pushed `-c23` tips + their r22 PROGRESS.md.

## Candidates (NOT accepted until the user approves in motion)
* 04: K21-1 = V4 + `&m04wgl=1` (r21 GOOD IMPROVEMENT by the worker; re-verified in r22 step 0).
* 07: K7 + `&m07end=1` (r21 GOOD IMPROVEMENT by the worker; re-verified in r22 step 0).
* 06: `&m06view=1` (NOT YET PROVEN).
* 04 artwork proposals `qa/review_r21/artwork/04/FOR_APPROVAL_04_*.png` — awaiting the user (shown again ~03:18).
* 07 artwork `qa/review_r21/artwork/07/FOR_APPROVAL_07_{d_late,e_end}.png` (swatch method p2) — awaiting the user.
* 05 artwork `qa/review_r21/artwork/05/FOR_APPROVAL_05_{d_late,e_end}.png` (swatch method p2) — awaiting the user.
  Lead note for the s05 polish slot: the proposals fix the smeared end walls but the painting has many CLOSE gold rings at the
  end of 05 — the game geometry has fewer there (scenery task, not artwork).
* Artwork method that keeps the game's geometry (round 22): IMAGE 1 = clean game frame, IMAGES 2.. = small material swatches cut
  from the original (never the whole original: the model then copies its layout). Ledger `qa/review_r21/artwork/LEDGER.md`
  (11 jobs, $1.32). Sheet tool `tools/lead22/approval_sheet.py`.

## Results log
* ~03:35 Benny step 1 `&benny20=1` (plush pile, `claude/rainbow-benny-c23` @ `d153ad2`; worker: GOOD IMPROVEMENT). Lead by eye
  (`qa/review_r22/benny_t1/`): outline smooth + round, shaggy tiers / hem gone = closer; fur now reads as flat velvet / terry, darker
  and duller than the approved fluffy plush = NOT YET. Feedback sent (tuft volume + lighter tips behind own switch; centre the middle
  crops on Benny — 05/06/07 middle crops missed him). Shown to the user: 04 start APPROVED / BEFORE / NEW (NOT YET PROVEN).
* ~03:40 s06 step 1 `&m06view=1` proof (`claude/rainbow-s06-match-c23` @ `fa509ac`; worker + lead: NOT YET PROVEN). Lead by eye
  (`qa/review_r22/s06_t1/`, clips smudged from LFS): Benny smaller / lower + more river ahead = closer; smooth, no snaps; but the
  centred bullseye rings + big foam walls still dominate, the off-centre tunnel / left crest is not held. Shown to the user:
  APPROVED / BEFORE / NEW early + both clips — the user decides on m06view. s06 asked to do task 3 (foam walls) before task 2.
* ~03:40 Benny step 2 `&benny20=1&b20expo=1` (per-screen exposure, `@ 438ffb9`; worker: GOOD IMPROVEMENT). Lead by eye
  (`qa/review_r22/benny_t2/`): colour now the same bright dusty rose on 05–08 = GOOD IMPROVEMENT (colour); fur still short velvet,
  less fluffy than approved (feedback from step 1 still open). Shown to the user: 08 start APPROVED / BEFORE / NEW.
* **~03:42 USER APPROVED the three Screen 04 generated views** ("Yes, approve the Screen 04 proposals, keep going"):
  `qa/review_r21/artwork/04/USER_VERDICT.md`, `accepted/04_gen_{c_middle_p2_v1,d_late_p3_v1,e_end_p2_v1}.png`. s04 foam worker asked
  to finish its current step and stop; then `washer-environment-modeler` takes the s04 worktree for the multi-plate projection
  `&m04mp=1` (`LAUNCH_S04_PROJ.md`). 07 + 05 proposals still await the user.
* ~03:45 Benny step 3 (`@ a3a9ff5`, 3rd of 3): pompom `&b20ppw=0.45` lighter soft yarn = GOOD (lead agrees, modest); `&b20knit=1`
  NOT YET (lavender-pink stripes, approved cream). Best Benny query: `&benny20=1&b20expo=1&b20ppw=0.45`. Branch history verified
  intact (all earlier commits are ancestors). Lead gave GO for round 23 in the same session: b20tuft (fluffy volume, centred crops)
  → knit cream stripes / vertical ribs → felt star; Benny size on 06 stays with the 06 specialist (framing), no Benny scaling.
* ~03:50 s04 foam worker STOPPED (lead asked): step 0 restore verified (code identical; water differs only because the river shader
  reads the real clock → pinned-clock QA tools `qa/match/04/r22/tools/`); step 2 `m04bbd` 3D foam heaps inside the tunnel — worker GOOD,
  lead: small improvement (patchy, smaller than painted) → candidate **K22-2** (`qa/match/04/r22/s2_bbd/QUERY_K22-2.txt`). Unfinished
  `m04a3sc` (chevrons vs Benny's hat) saved. Next in this worktree: projection `&m04mp=1` (`LAUNCH_S04_PROJ.md`).
* ~03:58 USER FEEDBACK Screen 04 (verbatim in `RESUME_R22.md`): water must look CLEAN, no messy pink walls near the gold inside the
  tunnel, Benny going naturally through the five arrows; clip speed = real game speed (not sped up). Relayed to the projection worker.
* ~04:00 the user stopped the in-process s07 + s04-projection workers and asked to save everything for the account switch →
  `RESUME_R22.md`, `setup_worker_r23.sh`, `backups/CONNECTORS_AND_SERVICES_R22.md`, START prompt + handoff + CLAUDE.md pointer updated.
