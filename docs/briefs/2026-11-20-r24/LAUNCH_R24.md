# Round 24 — relaunch of the four specialists (lead session branch `ccr-5be1062a-0ffyej`, 2026-11-20 from ~10:30 UTC)

Round 23 (lead `claude/rainbow-r22-restore-ut3m39`) hit the account's 5-hour limit at **10:19 UTC**; all four in-process workers
stopped mid-step (HTTP 429). Its last save `a735ec7` (10:25) is merged into this session branch. Every worktree was recreated by
`docs/briefs/2026-11-20-r24/setup_worker_r24.sh` = the r23 base commit + the 10:25:53 snapshot `backups/wip/<branch-c24>/`
(file counts verified identical). Same worktree paths and ports as r23; NEW LOCAL branch names `-c25` (never pushed; the lead's
autosave snapshots them to `backups/wip/`). **Renders, monitors and dev servers that were running at 10:19 are gone** — check which
outputs are complete, re-render only what is missing.

Common (all workers):
* Read `/home/user/rainbow-/CLAUDE.md`, your r23 brief, your own r23 `PROGRESS.md`, and the END of your own r23 transcript (path below;
  read only the last ~200 lines — it is long) to see exactly where you stopped.
* VISUALS ONLY; judge in motion (user's permanent order: "my approved screen" = the same look WHILE Benny swims / steers).
  APPROVED / BEFORE / NEW as separate full-size pictures + uninterrupted clip (state playback speed) + gameplay 8/8, 91 coins +
  `npx tsc --noEmit`. Start view 0 px unless the step is meant to change it. Every change behind its own URL switch.
* TRAP: the game reads the FIRST occurrence of a URL switch — `node /home/user/rainbow-/tools/lead23/setq.mjs "<query>" "a=1&b=2"`.
* Pixel tool rebuilt: `/home/user/tools-pixelmatch/pixeldiff.mjs`. Playwright: use 600 s timeouts (four workers share the machine).
* No commits / pushes; never run git in `/home/user/rainbow-`; no paid jobs (ask the lead). Never touch another worker's worktree.
* Write proof to `/home/user/rainbow-/qa/...` as in r23 and keep "(r24) WHERE I STOPPED / NEXT" at the top of your PROGRESS.md.

| Worker | Agent | Worktree / LOCAL branch | Port | r23 brief | r23 transcript (end = where you stopped) |
|---|---|---|---|---|---|
| s07 | water-fx-specialist | `/home/user/wt/s07` `claude/rainbow-s07-match-c25` | 5277 (+5280/5281) | `docs/briefs/2026-11-20-r23/LAUNCH_S07_R23.md` | `backups/claude-sessions/1dee9937-64f8-543d-ae44-7cf9955b39b3/subagents/agent-ad506edb73ba1c3d9.md` |
| s04 | washer-environment-modeler | `/home/user/wt/s04` `claude/rainbow-s04-match-c25` | 5273 | `docs/briefs/2026-11-20-r23/LAUNCH_S04_R23.md` | `.../subagents/agent-aea6c441ae094e112.md` |
| s08 | washer-environment-modeler | `/home/user/wt/s08` `claude/rainbow-s08-scenery-c25` | 5278 | `docs/briefs/2026-11-20-r23/LAUNCH_S08_R23.md` | `.../subagents/agent-aba3e2bc1d154bfe3.md` |
| Benny | benny-character-artist | `/home/user/wt/benny` `claude/rainbow-benny-c25` | 5279 | `docs/briefs/2026-11-20-r23/LAUNCH_BENNY_R23.md` | `.../subagents/agent-ad6745221c2fe7d06.md` |
| s06 | (finished 3 steps in r23; remaining crest / river / coin trail = next free slot) | `/home/user/wt/s06` `claude/rainbow-s06-match-c25` | 5276 | `LAUNCH_S06_R23.md` | `.../subagents/agent-a41fb9aa89c21a5e2.md` |
| s05 | queued | `/home/user/wt/s05` `claude/rainbow-s05-match-c25` | 5275 | r22 RESUME table | — |
| lead07 | lead's clip worktree (= K7c + `m07satin`) | `/home/user/wt/lead07` (detached `8accdad0` + patch) | — | — | — |

---

## s07 — Screen 07 (FIRST PRIORITY of this round)

**USER (~10:35 UTC, verbatim), after reviewing the lead's complete labelled clip
`qa/match/07/r23/lead_clip/SCREEN07_swim_candidate_{1x,0.5x}.mp4` (query `qa/match/07/r23/lead_clip/QUERY.txt`):**

> Thank you—this is the complete labelled Screen 07 review clip I needed. It shows the entrance, both steering directions, the end
> and the transition into Screen 08.
> I have reviewed the recording, but I am not approving Screen 07's appearance yet. Please continue the authorized work with these
> priorities:
> 1. Make the whole river follow the broad S-shaped bends in my approved screen. The cyan water, pink edges, foam banks and coin trail
> must curve together. The current middle and end still look mostly like a straight slide with a wavy coloured strip inside it. Keep
> Benny's movement and the collisions aligned with the revised channel.
> 2. Correct the view during steering. Around t = 2.5–3.5 seconds, the purple wall dominates the screen and I lose sight of the
> upcoming river. Keep the route ahead visible while preserving natural movement.
> 3. Fix the visible water connection near t = 7.25–8 seconds. The detailed swirling water changes abruptly into smoother striped
> water, with a speckled band across the join. Make the water and foam banks connect consistently through the exit.
> Please also check that the transition uses the latest Screen 08 version and its existing improvements.
> Keep the fuller foam candidate and preserve the completed work. After these corrections, show the same labelled swim and steering
> sequence so I can compare it fairly.

Lead notes:
* Clip timing (1.0x, 8.7 s): 0–2.4 s entrance (straight) · 2.5–4.0 s middle steering LEFT · 4.1–5.7 s middle steering RIGHT ·
  5.7–8.1 s end (straight, the drop) · 8.1–8.7 s entering 08. So priority 2 = the start of the LEFT steer; priority 3 = the last
  ~0.8 s of the drop and the hand-over into 08.
* **The lead's clip used ONLY Screen 07 switches — no `match08=1` — so its Screen 08 entry showed the OLD default 08.** The latest
  Screen 08 = K16 (`qa/review_r21/audit/QUERY_08.txt`, includes the user's preferred `coins08px=1`) + the newest kept 08 step
  `m08gl=1` (s08 r23 step 1, GOOD small, not user-approved; `qa/match/08/r23/step1_m08gl/QUERY_NEW.txt`). From now on every 07 clip /
  join check uses `07 candidate & K16 & m08gl=1` (check that 07 + 08 switches coexist in one query and that the 08 part matches the
  s08 worker's own renders). Re-examine the 7.25–8 s join with the latest 08 FIRST — part of the abrupt change may be the old default 08.
* Your unfinished step 2 `&m07sbend=1` (route S ±1.45 u / wavelength 28 u inside a STRAIGHT tube, bands / foam / coins sweeping inside it)
  was designed before this note. Finish its proof, then judge it honestly against the user's words "still look mostly like a straight
  slide with a wavy coloured strip inside it": the VISIBLE river boundaries — cyan water, pink edges, foam banks and coin trail — must
  sweep together as broad bends across the frame like the painting, through the middle AND the end. If ±1.45 u inside a straight tube
  still reads as a wavy strip, go bigger (bend the visible channel edges / band / foam-bank geometry with a larger, broader sweep; bend
  the tube where needed), keeping Benny's route, steering bounds, collision, coins and game water aligned with the revised channel
  (continuity test, 07→08 drop, gameplay 8/8 + 91 coins).
* Priority 2 is a viewing fix the user explicitly asked for: keep the upcoming river in view while steering (e.g. limit how far the
  camera swings / leans toward the wall, keep the aim on the river ahead, or move the wall so it does not fill the frame) — natural
  movement preserved, start view 0 px, own switch.
* Keep `m07cloud` (user: fuller foam = candidate) and `m07satin`. Old step 3 (foam natural size / spacing variation) stays open AFTER
  these three.

Steps: (1) S-bends, (2) steering view, (3) 07→08 water + foam-bank join with the latest 08 — each its own switch, proof per step. Then
the **same labelled swim + steering sequence** as the lead's clip (`tools/lead23/screen_clip.mjs` + `tools/lead23/label_clip.py`, same
sections / timing, entrance → exit into 08, real speed 1.0x + half speed 0.5x, speed printed on every frame): NEW = full new candidate
& latest 08; BEFORE = the r23 candidate (`lead_clip/QUERY.txt`) & the SAME latest 08, so the comparison is fair. Folder
`qa/match/07/r24/`. Then stop and report (steps, switches, verdicts, folders, clips, candidate query, most visible remaining difference).

## s04 — Screen 04 (resume)
Where you stopped (10:19): step 2 clip (2.9 s real speed, 5.8 s half speed) + gameplay (8/8, 91 coins, 1,330 → 2,240) DONE; next was
comparing step 1 vs step 2 clip frames, then the step-3 shader patch (you had prepared it as a script — check `qa/match/04/r23/`).
User direction (~09:55, unchanged): "continue with the cleaner, lower pink edges. Keep the gold visible, the blue water clear, and show
Benny travelling naturally through all five arrows." Base candidate K23-1 (`qa/match/04/r23/QUERY_K23-1.txt`). Finish steps 2–3 per
your r23 brief, then stop and report.

## s08 — Screen 08 polish (resume)
Where you stopped (10:19): step 1 `m08gl` KEPT (GOOD small; its swim clips were rendering — check / label them); step 2 `&m08coinsz=1`
code written, NEW set was rendering (verdict pending); step 3 render had "reported done" — check all 12 shots. Note: the s07 worker now
uses K16 & `m08gl=1` as "the latest Screen 08" for the 07→08 join; tell the lead (in your report) if a step changes the first second of 08.

## Benny (resume)
Where you stopped (10:19): star step — 08 felt star measured (251,210,33) vs approved (250,213,30); the 05–07 renders (monitored) were
running and are gone — re-render what is missing (`qa/benny/r23/s3_star/`), then the verdict and the next item of your brief (cream knit
stripes / ribbed cuff, stitched felt star, longer silky combed fur). Best query so far `&benny20=1&b20expo=1&b20ppw=0.45&b20tuft=1`.
