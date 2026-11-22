# Round 25 — relaunch of four specialists (lead session branch `ccr-a9235d04-90cw28`, new Claude account, 2026-11-20 from ~11:54 UTC)

Round 24 (lead `ccr-5be1062a-0ffyej`) ended after its last daemon save `36bc533` (11:43 UTC). Its lead conversation was saved to 11:17:57 UTC;
the user interrupted the s07, s04 and Benny workers at 11:12 UTC (the user stopped them to save credits before switching accounts — NOT a
rejection of their work). This session started from `ccr-5be1062a-0ffyej` @ `36bc533` (verified = GitHub). Every worktree was recreated by
`docs/briefs/2026-11-20-r24/setup_worker_r25.sh` = the worker base commit + the **11:43:21 snapshot** `backups/wip/<branch-c25>/`
(modified-file counts identical to each INFO.json). Same worktree paths and ports; NEW LOCAL branch names **`-c26`** (never pushed; the lead's
five-minute autosave snapshots them into `backups/wip/`). **Renders, dev servers and scratch files of round 24 are gone** (its scratchpad
`/tmp/claude-0/…/b7c4382b…/scratchpad` does not exist here) — check which outputs in `qa/` are complete, re-render only what is missing.

## Common (all workers)
* Read `/home/user/rainbow-/CLAUDE.md`, `docs/briefs/2026-11-20-r24/LAUNCH_R24.md` (Common + your section — the user's notes verbatim),
  your own PROGRESS.md and the END (last ~200 lines) of your round-24 transcript (paths below) to see exactly where you stopped.
* VISUALS ONLY; judge in motion (user's permanent order: "my approved screen" = the same look WHILE Benny swims / steers). Proof per step:
  ORIGINAL APPROVED / BEFORE / NEW as separate full-size pictures + an uninterrupted clip with the playback speed printed on every frame
  (real speed 1.0x + half speed 0.5x) + gameplay 8/8, 91 coins + `npx tsc --noEmit` + continuity where the route changes. Start view 0 px
  unless the step is meant to change it. Every change behind its own URL switch; the default build unchanged. Verdicts in plain visual
  words: GOOD IMPROVEMENT / NOT AN IMPROVEMENT / NOT YET PROVEN. Nothing is approved until the USER says so.
* TRAP: the game reads the FIRST occurrence of a URL switch — `node /home/user/rainbow-/tools/lead23/setq.mjs "<query>" "a=1&b=2"`.
* Pixel tool rebuilt: `/home/user/tools-pixelmatch/pixeldiff.mjs` (pixelmatch 5.3.0; game renders only — `references/*.png` carry
  trailing bytes pngjs rejects, use the copies in the qa folders such as `1_APPROVED.png`).
* **Machine: 4 CPUs shared by four workers.** Run at most ONE heavy render job at a time, and wrap every heavy job (Playwright shots /
  clips / gameplay, Blender, ffmpeg encodes of long clips) in the shared slot helper:
  `bash /home/user/rainbow-/tools/lead25/render_slot.sh <command…>` (2 machine-wide slots; it waits for a free one). Run long jobs in the
  background with a log and poll; Playwright timeouts 600 s. Temp files: `/home/user/scratch/<your slug>/` (create it), never in `/tmp/claude-0`.
* No commits / pushes; never run git in `/home/user/rainbow-`; no paid jobs (ask the lead with job + cost). Never touch another worker's
  worktree (`/home/user/wt/{s04,s06,s07,s08,benny,s05,lead06,lead07}` — only your own; s07 may READ s08, see below).
* Keep "(r25) WHERE I STOPPED / NEXT" at the top of your PROGRESS.md, updated after every finished sub-step (the account can stop at any
  moment; the lead's autosave saves your worktree + qa files every 5 minutes).
* At most 3 finished steps, then stop and report: steps, switches, verdicts, folders, clips, the candidate query, the most visible remaining
  difference vs the approved picture.

| Worker | Agent | Worktree / LOCAL branch | Port(s) | Your round-24 transcript (end = where you stopped) |
|---|---|---|---|---|
| s07 | water-fx-specialist | `/home/user/wt/s07` `claude/rainbow-s07-match-c26` | 5277 (+5280/5281) | `backups/claude-sessions/b7c4382b-2da4-50a2-b6ce-d02dd77f8fb1/subagents/agent-a9747714b21c05873.md` |
| s06 | path-camera-transition-engineer | `/home/user/wt/s06` `claude/rainbow-s06-match-c26` | 5276 (+5282/5283) | r23: `backups/claude-sessions/1dee9937-64f8-543d-ae44-7cf9955b39b3/subagents/agent-a41fb9aa89c21a5e2.md`; r24 lead test: `qa/match/06/r24/lead_rip/NOTES.md` |
| s04 | washer-environment-modeler | `/home/user/wt/s04` `claude/rainbow-s04-match-c26` | 5273 (+5274/5275) | `…/b7c4382b-…/subagents/agent-ab7b5fbb29a298129.md` |
| Benny | benny-character-artist | `/home/user/wt/benny` `claude/rainbow-benny-c26` | 5279 | `…/b7c4382b-…/subagents/agent-ac1083e0b64cccb26.md` |
| s08 | — FINISHED in r24 (candidate K23-3, `qa/match/08/r23/QUERY_CANDIDATE_K23-3.txt`) | `/home/user/wt/s08` `claude/rainbow-s08-scenery-c26` | — | `…/agent-a91d7572ef092d7f9.md` |
| s05 | — queued | `/home/user/wt/s05` `claude/rainbow-s05-match-c26` | 5275 | — |
| lead06 / lead07 | lead's r24 test worktrees (detached, preserved, not used by workers) | `/home/user/wt/lead06`, `/home/user/wt/lead07` | — | — |

---

## s07 — Screen 07 (FIRST PRIORITY)
User note ~10:35 (verbatim in `LAUNCH_R24.md` § s07): (1) the WHOLE river in broad S-bends — cyan water, pink edges, foam banks and coin
trail curving together, Benny + collisions aligned; (2) keep the upcoming river visible while steering (t = 2.5–3.5 s, purple wall
dominates); (3) water + foam banks connect consistently through the exit into 08 (t = 7.25–8 s), using the LATEST Screen 08 and its
improvements; keep the fuller foam (`m07cloud`) and `m07satin`; then the SAME labelled swim + steering sequence for a fair comparison.

Where you stopped (11:12, `qa/match/07/r24/PROGRESS.md`): step 1 `&m07swing=1` code in the worktree, diag renders good (river sweeps across
the tube floor in broad S-bends through middle AND end, foam banks + coins follow), proof NOT done; step 2 `&m07look=1` (lip camera) code
written, its first segment render was running; the BEFORE clip (r23 candidate & latest 08) was rendering on 5281 — check `qa/match/07/r24/`.

**The latest Screen 08 is now K23-3** (= K16 & `m08gl=1&m08coinsz=1&m08towelm=1&m08towelv=1`, `qa/match/07/r24/QUERY_08_latest_K23-3.txt`).
Your combined render build (`qa/match/07/r24/combo/mkcombo.py`) used a READ-ONLY s08 snapshot from the round-24 scratchpad, which is gone.
Rebuild it: copy (read-only — never write in it) the needed files from `/home/user/wt/s08` (= s08 base `3c0fa97` + the 11:43 snapshot, i.e.
all three K23-3 steps incl. `src/gameplay/coins.ts` step 2 and `src/world/match08.ts` step 3) into `/home/user/scratch/s07/s08snap`, record
their sha256 in `qa/match/07/r24/combo/s08snap_SHA256SUMS_r25.txt`, then check that the combined build with K23-3 reproduces the s08
worker's own K23-3 renders (`qa/match/08/r23/step3_m08towelm/3_NEW_a00_approved_view.png` 0 px; moving shots: scenery identical, Benny's
fur shading may vary — check by eye). Use `07 candidate & K23-3` for every 07→08 check and both labelled clips.

Steps: (1) finish `m07swing` proof and judge it honestly against the user's words "still look mostly like a straight slide with a wavy
coloured strip inside it" (compare with `m07sbend`; go broader if it still reads as a strip); (2) steering view `m07look` (route ahead
visible, natural movement, start view 0 px); (3) 07→08 water + foam-bank join with K23-3. Then the **same labelled swim + steering
sequence** as the lead's r23 clip (`tools/lead23/screen_clip.mjs` + `tools/lead23/label_clip.py`, same sections and timing, entrance →
exit into 08, 1.0x + 0.5x, speed on every frame): NEW = full new candidate & K23-3; BEFORE = `qa/match/07/r24/QUERY_BEFORE_r23cand_latest08.txt`
re-based on K23-3 (the r23 candidate & the SAME latest 08). Folder `qa/match/07/r24/` (continue there). Then stop and report.

## s06 — Screen 06 (the user's opening "blue cone" — comparison OWED to the user)
User (~10:10, verbatim): "at the opening, the new ripple effect looks like a raised blue cone underneath Benny. My approved picture shows a
shallow ripple immediately around his contact with the water. Please make that opening effect sit naturally on the water surface and blend
into his wake. Preserve the successful surrounding work."

Lead diagnosis (`qa/match/06/r24/lead_rip/NOTES.md` — read it fully): the cone is NOT the ripple effect; it is the hole where the painted
Benny was cut out of the projected painting, filled with the river's own brighter water with a hard Benny-shaped edge, plus the painting's
lacy ripple ring left pinned at the checkpoint. The lead's test `&m06ripz=1` (needs `m06rip=1`) removed the left-behind ring but NOT the
hole; `&m06wdbg=1` = plate-weight debug view. **Both switches are already ported into your worktree** (`src/world/match06.ts` copied from the
lead's test worktree `/home/user/wt/lead06`, which is otherwise identical to yours; do not use lead06). Lead render scripts:
`qa/match/06/r24/lead_rip/render.sh`, `render_lead06.sh` (point them at YOUR worktree / port); shots o1_003 / o2_007 / o3_012 (3 / 7 / 12 %
into 06, water clock pinned `AUDIT_PIN=1000`); base query `qa/match/06/r24/lead_rip/QUERY_RIP.txt` (= the version the user saw).

Steps: (1) make the opening effect sit naturally on the water: blend the cut-out hole into the surrounding painted water (wider soft-edged
hand-over zone covering the whole hole incl. ahead of the approved Benny, or match the fill's colour / streaks to the painted water around
it), keep only the shallow rings travelling with Benny at his contact; start view 0 px. Proof = ORIGINAL APPROVED / CURRENT (`QUERY_RIP`)
/ NEW at start, o1, o2, o3 + an uninterrupted clip of the opening (1.0x + 0.5x) + gameplay 8/8, 91 coins. This is the comparison the user
is owed — finish it first. (2)–(3) the curling crest, the winding river and the curved coin trail must stay recognizable AFTER the opening
(today the rings drift back to a centred target and the river reads as a straight streaky chute) — biggest visible difference first. Keep
`m06view=1&m06vs=0` as the user's unapproved camera candidate (never promote it). Proof folder `qa/match/06/r25/<step>/`, log
`qa/match/06/r25/PROGRESS.md` (copy the r23 WHERE-I-STOPPED block in from `qa/match/06/r23/PROGRESS.md`).

## s04 — Screen 04 (resume)
User (~09:55, unchanged): "continue with the cleaner, lower pink edges. Keep the gold visible, the blue water clear, and show Benny travelling
naturally through all five arrows." Where you stopped (`qa/match/04/r23/PROGRESS.md`, r24 block): steps 2 (K23-S2) and 3 (K23-S3 glossy
clean lane water, `s3_glossy/QUERY_K23-S3.txt`) DONE, worker verdict GOOD — not yet reviewed by the lead or the user.
Steps: (0) a labelled uninterrupted swim clip of the WHOLE of 04 with K23-S3 vs the version the user last saw (K23-1), same timing, 1.0x +
0.5x, showing Benny travelling through all five arrows (chevrons clearly ahead of him, never at his hat), into `qa/match/04/r25/clip/`;
(1)–(3) your NEXT list, biggest visible difference first: near-camera glints shorter (painted short crescents), richer cyan / pink ribbon
contrast round Benny, far foam rows as cloud banks (no giant foam walls), then the projection of the three user-accepted views (`&m04mp=1`,
`docs/briefs/2026-11-20-r23/LAUNCH_S04_R23.md` task 3). Proof folder `qa/match/04/r25/<step>/`; keep the r25 block at the top of
`qa/match/04/r23/PROGRESS.md`. Under heavy load a shot can be taken before the foam meshes / tunnel finish loading — check every proof
shot by eye.

## Benny (resume) — the approved Benny on every screen
Approved look: dusty-rose plush fur, chunky hand-knit cream / violet hat with cream stripes and ribbed cuff, soft yarn pompom, stitched felt
star; same size / proportions; swimming naturally IN the water. Do NOT scale Benny. Best query so far
`&benny20=1&b20expo=1&b20ppw=0.45&b20tuft=1&b20knit=1` (not approved).
Where you stopped (11:12): (3) felt star `&b20star=1` — 06 hard-left neon-lime star fixed with the per-screen star exposure (06 NEW matched
probe D), gameplay 8/8 + 91 coins (1,330 → 2,240) and `tsc` passed; the swim clips were rendering (gone) and the verdict was not written.
(4) silky combed fur `&b20silk=1` (+ `&b20g*` overrides) — shader code started in `fur.ts` / `benny20.ts` (typecheck passed); the probe
variants lived in the old scratchpad (gone).
Steps: (1) finish the star step: re-render only the missing proof (`qa/benny/r23/s3_star/` APPROVED / BEFORE / NEW full-size crops on
04–08 + one short swim clip with speed stated), write the verdict into `qa/benny/r23/PROGRESS.md` (new "(r25) WHERE I STOPPED / NEXT"
block at the top); (2) silky combed fur — longer, softer, combed locks, not grainy / spiky, fur colour unchanged (dusty rose); proof on
04–08 + clip + gameplay, folder `qa/benny/r25/s4_silk/`; (3) next most visible Benny difference (hat crown dome shape vs the approved
taller beanie, 06 cream leaning yellow `&b20kw06=`).
