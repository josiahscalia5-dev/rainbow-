# Benny round 21 — progress (branch `claude/rainbow-benny-c22`)

## (r21) WHERE I STOPPED / NEXT  — 2026-11-20

**State:** round-20 step 1 (`&benny20=1`, commit `bade594`: dusty-rose colour GOOD on 04, texture NOT yet) +
the round-20 unfinished edits restored from `backups/wip/claude__rainbow-benny-c21/tracked.patch` (lead branch
`ccr-68d26c2d-gwegce`) and committed here UNTESTED:
* `src/characters/benny/benny20.ts` — shorter, denser body fur (shells 24, length 0.075, gravity 0.05, lock 40/1.1/0.9/260,
  comb softened) + new per-part `pile` uniform (uPile) for the plush pile layer.
* `src/characters/benny/fur.ts` — the uPile shader path for the plush pile (short dense under-layer, smoother outline).
* `tools/benny20/furstat.py`, `tools/benny20/knit.py` — measurement / knit-map generator updates.
* `tools/lead21/audit_screen.mjs` — the lead's audit tool (copied from the lead branch).
* `assets/textures/benny20/crown_n.png` is the committed r20 one; the updated `knit.py` was NOT re-run yet
  (needs `scipy`: `pip install scipy`, then `python3 -I tools/benny20/knit.py assets/textures/benny20 --json assets/textures/benny20/knit_params.json`).

**Kept query:** each screen's own query (lead `qa/review_r21/audit/QUERY_0N.txt` on `ccr-68d26c2d-gwegce`) + `&benny20=1`.
Default build unchanged.

**Exact next steps (brief `docs/briefs/2026-11-20-r21/BENNY_R21.md` on the lead branch):**
1. `npm run build` / typecheck the restored uPile code; fix if it does not compile.
2. Task 1 plush fur: shoot 04–08 (start / middle / hard left) with
   `AUDIT_SHOTS='[["a_start",0,null],["c_middle",0.35,null],["f_hard_left",0.35,-1]]' node tools/lead21/audit_screen.mjs qa/benny/r21/t1/0N 0N "<query>&benny20=1"`
   BEFORE (without the restored edits = commit `bade594`) vs NEW; crop Benny next to the approved Benny; judge by eye
   (short dense soft plush, smooth round outline, no shaggy hem).
3. Task 2 per-screen exposure (opt-in `b20expo=1` already prepared in r20) for 05/06/07/08.
4. Task 3 pompom lighter yarn, clean cuff ribs (`b20knit=1`), felt star, size vs painted Benny.
5. Each step: `node scripts/gameplay-test.mjs` → 8/8, swim clip, log here, commit + push, send_message to the lead.

**How to resume:** check out `claude/rainbow-benny-c22`, run the bootstrap per CLAUDE.md, read this block, continue at step 1.

## Log
* 2026-11-20 — restored r20 WIP patch + lead audit tool, committed and pushed as a safe checkpoint (lead request: account
  running out of credits). Nothing tested yet in r21.
