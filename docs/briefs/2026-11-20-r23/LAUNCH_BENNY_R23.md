# Round 23 — Benny (in-process `benny-character-artist`)

Full brief: `/home/user/rainbow-/docs/briefs/2026-11-20-r21/BENNY_R21.md` + `/home/user/rainbow-/docs/briefs/2026-11-20-r22/LAUNCH_BENNY.md`.
This file overrides:
* The r22/r23 Benny cloud session ran on the OLD account and is treated as STOPPED (last push 04:05). You continue in worktree
  `/home/user/wt/benny`, LOCAL branch **`claude/rainbow-benny-c24`** = `claude/rainbow-benny-c23` @ `734efb6`. NEVER write `-c23`. Do NOT
  commit / push from the worktree (the lead's autosave snapshots it); never run git in `/home/user/rainbow-`. Port 5279 (5284–5285 free).
* Where it stopped: `qa/benny/r23/PROGRESS.md` in the worktree — step 1 `&b20tuft=1` worker GOOD (partial). Best Benny query
  `&benny20=1&b20expo=1&b20ppw=0.45&b20tuft=1` (all opt-in). The last autosave `734efb6` (after commit `b9c91d0`) holds UNFINISHED step 2
  edits: `assets/textures/benny20/{brim,brim_n,crown}.png`, `knit_params.json`, `src/characters/benny/benny20.ts` — inspect them
  (`git -C /home/user/wt/benny diff b9c91d0 734efb6 -- src assets tools`) and continue from there; nothing there is accepted yet.
* Step 1 verdict so far = the worker's own (soft tufts + lighter rose tips instead of flat velvet = closer; still finer / grainier than
  the approved long silky combed tufts); lead review still pending.
* TRAP: the game reads the FIRST occurrence of a URL switch — replace values in place with
  `node /home/user/rainbow-/tools/lead23/setq.mjs "<query>" "a=1&b=2"`. Pixel tool `/home/user/tools-pixelmatch/pixeldiff.mjs`.
* Write r23 proof to `/home/user/rainbow-/qa/benny/r23/<step>/` + `/home/user/rainbow-/qa/benny/r23/PROGRESS.md` (copy the worktree's r23
  block in first so the history stays in one place; start with "(r23) WHERE I STOPPED / NEXT").

## Steps (lead order 03:45, unchanged)
1. Knit (`tools/benny20/knit.py`, `&b20knit=1`): CREAM (not lavender) light stripes, vertical cuff ribs, violet not bluer.
2. Stitched felt star.
3. Fur: longer silky combed tufts (not grainy) if time remains.
Do NOT scale Benny (06 size belongs to the 06 specialist). Proof on 04–08 (each screen's kept query: `qa/review_r21/audit/QUERY_0N.txt`
in the lead checkout; for 04 use `qa/match/04/r23/QUERY_K23-1.txt` if the code is on your branch, else the screen's default build — say
which), Benny-centred crops (`tools/benny23/`), APPROVED `/home/user/wt/benny/qa/benny/r22/approved/0N_benny.png` / BEFORE / NEW, swim clip, gameplay 8/8 +
91 coins. Up to 3 finished steps, then stop and report. No paid jobs (ask the lead).
