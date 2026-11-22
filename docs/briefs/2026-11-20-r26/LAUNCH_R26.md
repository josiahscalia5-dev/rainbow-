# Round 26 — relaunch of four specialists (lead session branch `ccr-08ece3a6-xcwyls`, new Claude account, 2026-11-20 from ~13:00 UTC)

Round 25 (lead `ccr-a9235d04-90cw28`) stopped at 12:36–12:45 UTC: the old account hit its 5-hour limit and all four workers died mid-step
(NOT a rejection of their work). Its last daemon save `a2261d5` (12:51) holds the **12:52:06 snapshots** `backups/wip/*-c26/`. This session
started from `a2261d5`; every worktree was recreated by `docs/briefs/2026-11-20-r25/setup_worker_r26.sh` (base commit + 12:52 snapshot) on
NEW LOCAL branches **`-c27`** (same paths and ports; patch content verified identical to each snapshot). **Scratch folders of round 25
(`/home/user/scratch/*`, dev servers, combined builds) are gone** — re-create only what is missing; everything under `qa/` survived.

## Common (all workers) — read in this order
1. `/home/user/rainbow-/CLAUDE.md`.
2. **`docs/briefs/2026-11-20-r26/USER_VISUAL_BRIEF_R26.md`** — the user's NEW detailed visual brief (binding; §2 moving views, §3 water,
   §4 scenery, §5 Benny, §6 your screen, §8 evidence). Plus `docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md`.
3. `docs/briefs/2026-11-20-r25/LAUNCH_R25.md` (Common + your section) and the user's round-25 note in `docs/briefs/2026-11-20-r25/COORDINATION.md`
   ("~12:20 USER (verbatim)": clean, neat, professional in motion, 90–95 %).
4. Your PROGRESS.md "(r25) WHERE I STOPPED / NEXT" block and the END (last ~150 lines) of your round-25 transcript (table below).
* VISUALS ONLY; judge in motion. Proof per step: ORIGINAL APPROVED / BEFORE / NEW as separate full-size pictures + an uninterrupted clip
  with the playback speed printed on every frame (1.0x first, then 0.5x) + gameplay 8/8, 91 coins + `npx tsc --noEmit` + continuity where
  the route changes. BEFORE and NEW under the SAME conditions (stage position, camera, steering schedule, speed). Start view 0 px unless the
  step is meant to change it. Every change behind its own URL switch; default build unchanged. Verdicts in plain visual words: GOOD
  IMPROVEMENT / NOT AN IMPROVEMENT / NOT YET PROVEN, and for each: what got closer, what still differs, any new problem, what is next.
  Never claim an unmeasured likeness percentage. Nothing is approved until the USER says so.
* Reject anything that adds mess: smears, torn / stretched textures, speckled bands, hard seams, spiky sparkles, cut-out holes, floating /
  overlapping pieces, brighter detached patches.
* TRAP: the game reads the FIRST occurrence of a URL switch — `node /home/user/rainbow-/tools/lead23/setq.mjs "<query>" "a=1&b=2"`.
* Pixel tool: `/home/user/tools-pixelmatch/pixeldiff.mjs` (rebuilt; game renders only — use qa copies like `1_APPROVED.png`, not `references/*.png`).
* **Machine: 4 CPUs shared by four workers.** Wrap EVERY heavy job (Playwright shots / clips / gameplay, Blender, long ffmpeg) in
  `bash /home/user/rainbow-/tools/lead25/render_slot.sh <command…>` (2 machine-wide slots). Long jobs in the background with a log; poll
  with `until …; do sleep 10; done` loops of ≤ 9 min; Playwright timeouts 600 s. Temp files ONLY in `/home/user/scratch/<slug>/` (exists).
* No commits / pushes; never run git in `/home/user/rainbow-`; no paid jobs (ask the lead with job + cost). Only your own worktree
  (s07 may READ `/home/user/wt/s08`).
* Usage: the previous account ran out after ~45 min of four workers. Be economical: do not re-read big files you already know, do not view
  more images than needed to judge, prefer contact sheets at reduced size for your own checks.
* Keep "(r26) WHERE I STOPPED / NEXT" at the TOP of your PROGRESS.md, updated after every finished sub-step (the lead's autosave saves your
  worktree + qa files every 5 minutes; the account can stop at any moment).
* At most 3 finished steps, then stop and report: steps, switches, verdicts, folders, clips (1.0x + 0.5x paths), the candidate query, the most
  visible remaining difference vs the approved picture.

| Worker | Agent | Worktree / LOCAL branch | Port(s) | Round-25 transcript (end = where you stopped) |
|---|---|---|---|---|
| s07 | water-fx-specialist | `/home/user/wt/s07` `claude/rainbow-s07-match-c27` | 5277 (+5280/5281) | `backups/claude-sessions/1de16074-a1ea-5d78-8ed3-5aa46f86005c/subagents/agent-a6d73b58ae32de7ef.md` |
| s06 | path-camera-transition-engineer | `/home/user/wt/s06` `claude/rainbow-s06-match-c27` | 5276 (+5282/5283) | `…/1de16074-…/subagents/agent-a3a1fee2ee8638b6e.md` |
| s04 | washer-environment-modeler | `/home/user/wt/s04` `claude/rainbow-s04-match-c27` | 5273 (+5274/5275) | `…/1de16074-…/subagents/agent-aadb120f8f34ac332.md` |
| Benny | benny-character-artist | `/home/user/wt/benny` `claude/rainbow-benny-c27` | 5279 | `…/1de16074-…/subagents/agent-a37295c79004f16e1.md` |
| s08 | — FINISHED (K23-3, `qa/match/08/r23/QUERY_CANDIDATE_K23-3.txt`, unapproved) | `/home/user/wt/s08` `claude/rainbow-s08-scenery-c27` | — | read-only source for s07 |
| s05 | — queued (end section + hard-left; check right steering too) | `/home/user/wt/s05` `claude/rainbow-s05-match-c27` | 5275 | — |

---

## s07 — Screen 07 (FIRST PRIORITY) — resume
Done in r25 (in `qa/match/07/r24/`): s08 snapshot K23-3 verified (08 approved view 0 px); step-1 shots `s1_swing/BEFORE|NEW`; continuity of
`match07=1&m07sbend=1&m07swing=1` OK (joins gap 0, drop 61.02 u); **labelled clips BEFORE (r23 candidate & K23-3) and STEP 1 NEW (`m07swing`
& K23-3), each 1x + 0.5x, in `clips/`**. Code written, NOT proven: step 2 `&m07look=1` (lip camera), step 3 `&m07join=1` (painted river + round
foam clouds run on along the 08 floor, no dithered band; Game.ts + match07.ts, tsc 0).
Lost with the scratch: the combined build `/home/user/scratch/s07/combo` (+ `combo2`). Rebuild it with `qa/match/07/r24/combo/mkcombo.py`
from `/home/user/wt/s08` (READ-ONLY; recreated = 3c0fa97 + the same snapshot) and check its file hashes against
`combo/s08snap_SHA256SUMS_r25.txt` (must match; if not, stop and tell the lead).
Steps: (1) step-1 verdict from the two existing clips + the approved picture — the user's words: the WHOLE river (cyan, pink edges, both foam
banks, coin trail) in broad S-bends through middle AND end, not "a straight slide with a wavy coloured strip"; go broader if it still reads
as a strip; (2) prove `m07look` (route ahead visible while steering at t 2.5–3.5 s, purple wall no longer dominating; start view 0 px);
(3) prove `m07join` (water + foam banks continuous into K23-3, the speckled band and abrupt change gone). Then the SAME labelled swim +
steering sequence (`tools/lead23/screen_clip.mjs` + `tools/lead23/label_clip.py`, entrance → both steering directions → ending → into 08,
1.0x + 0.5x): NEW = full candidate & K23-3; BEFORE = the existing `clips/SCREEN07_BEFORE_r23cand_K23-3_*` (same schedule — reuse, do not
re-render). Gameplay 8/8 + 91 coins with the full candidate. Keep `m07cloud` (fuller foam) and `m07satin`.

## s06 — Screen 06 (the user's opening "blue cone" — comparison OWED) — resume
Done in r25: step 1 `&m06hole=1` BUILT (cut-out hole + pinned painted ring filled with the approved picture's own painted water carried along
its streaks, Poisson blend; `tools/match06/make_hole06.py` method `flow`; `assets/textures/match06/tile_hole06*.png`, `hole06.json`;
`src/world/match06.ts`; tsc clean). Proof shots complete: `qa/match/06/r25/step1_hole/{CURRENT,NEW,WDBG_NEW}/` (a_start, o1_003, o2_007,
o3_012); start view NEW vs CURRENT = **0 px** (lead check). `step1_hole/clip.sh` written, not run.
Steps: (1) judge the existing shots (APPROVED / CURRENT / NEW, full size) — cone gone? any edge / brighter patch / ring left? shallow ripple
round Benny's contact? — then run the opening clip (CURRENT and NEW, 1.0x + 0.5x) + gameplay 8/8, 91 coins, verdict. If NEW is not clean,
fix and re-shoot only what changed. This is the comparison the user is owed: name the files `1_ORIGINAL_APPROVED`, `2_WHAT_YOU_SAW`,
`3_NEW` per shot. (2)–(3) the curling crest, the winding river and the curved coin trail after the opening (biggest visible difference
first; you had started looking at the river tile `tile_river6.png` vs the painted river). Keep `m06view=1&m06vs=0` as the user's unapproved
camera candidate. Log `qa/match/06/r25/PROGRESS.md` (add the r26 block on top).

## s04 — Screen 04 — resume
Done in r25: step 0 — **labelled uninterrupted whole-04 clips** `qa/match/04/r25/clip/` (BEFORE K23-1 vs NEW K23-S3, 1.0x + 0.5x + side by
side; arrow log per frame in `frames_*.json`). Code written, NOT proven: step 1 `&m04lgc=1` short curved crescent glints near the camera
(uniforms `uLG5` / `uLG6` in `match04.ts`); probe script `qa/match/04/r23/s04_tools/probe_wl.mjs` (wall-lean probe was running).
Steps: (0′) first write the step-0 verdict and state plainly HOW MANY ARROWS are visible / swum through in each clip (the user asked for
EXACTLY five arrows, neatly arranged, Benny passing all five naturally — the frame logs list more chevron entries than five: explain what
the player actually sees; if the game shows more or fewer than five arrows in 04, that is the first thing to fix, behind a switch);
(1) finish `m04lgc` (painted short crescents, no long scratches or spikes); (2) far foam rows → soft cloud banks (not bead walls / unrelated
bubbles); richer cyan / pink ribbon contrast round Benny; lower clean pink edges with the gold visible; (3) projection of the three
user-approved views `&m04mp=1` (`docs/briefs/2026-11-20-r23/LAUNCH_S04_R23.md` task 3). Proof `qa/match/04/r26/<step>/`; keep the r26 block at
the top of `qa/match/04/r23/PROGRESS.md`. Check every proof shot by eye (foam / tunnel may not have finished loading under load).

## Benny — resume
Done in r25: felt star `&b20star=1` crops on 04–08 (`qa/benny/r23/s3_star/`), gameplay 8/8 + 91 (r24), **NEW swim clip 06**
(`qa/benny/r23/s3_star/clip/swim06_star_NEW_{full,benny}_{1x,0.5x}.mp4`). Lost: the BEFORE swim clip frames (rendered, not encoded).
Steps: (1) re-render ONLY the BEFORE swim clip (same tool `tools/benny25/swim_clip_c.mjs` + `label_clip_c.py`, same schedule as NEW), then
write the star verdict (APPROVED / BEFORE / NEW + both clips) in the r26 block of `qa/benny/r23/PROGRESS.md`; (2) silky combed fur
`&b20silk=1` (shader `B20SILK` in `fur.ts`, `SILK20` in `benny20.ts`; earlier probes: big locks blotchy, fine/short ≈ step-1 look) — soft,
fluffy at phone size, not grainy / spiky, colour unchanged dusty rose; proof on 04–08 + clip + gameplay in `qa/benny/r25/s4_silk/`;
(3) next most visible difference (hat crown dome vs the approved taller beanie; 06 cream leaning yellow `&b20kw06=`). Do NOT scale Benny.
Best query so far `&benny20=1&b20expo=1&b20ppw=0.45&b20tuft=1&b20knit=1` (+ `&b20star=1` pending verdict) — not approved.
