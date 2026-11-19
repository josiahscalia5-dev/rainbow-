# Round 19 → next session: where every worker stopped (2026-11-19 ~20:15 UTC) — HANDOFF

Lead `ccr-d00ac5ec-gabdsh` (this account, started 19:05 UTC from the r18 lead's 18:56 save). User order ~19:40 UTC: let the
04 / 05 workers finish their current batch, save + verify everything, write this note, continue in a FRESH session. All three
workers finished their step, wrote a "(r19) WHERE I STOPPED / NEXT" block in their own log, pushed, and stopped cleanly
(no unfinished code anywhere). Screen 06 + 07 were not restarted this round (usage); Screen 08 stays PAUSED by the user.

## How to resume (fresh session on branch `ccr-d00ac5ec-gabdsh`)
1. Bootstrap runs automatically (CLAUDE.md §1). Check `python3 -I scripts/autosave-status.py` → AUTOSAVE OK (match).
2. Same account / connectors: continue each `-c19` branch on a NEW `-c20` branch from its tip below
   (`docs/briefs/2026-11-19-r19/setup_worker.sh`: change `-c18` → `-c19`, `-c19` → `-c20`, and `L=` to the newest lead save
   that holds `backups/wip/*-c19`). Fetch named branches only (`git fetch --depth=50 origin +<b>:refs/remotes/origin/<b>`); a
   full all-branch fetch takes > 6 min in this shallow clone.
3. Launch prompts: reuse the r19 prompts (same structure as the r18 ones in this lead's transcript,
   `backups/claude-sessions/5a5ce369-70d3-55d6-bc0b-9aeb236f0927/`): role, worktree, branch, READ FIRST (COORDINATION.md,
   RESUME_R19.md, own log + "(r19) WHERE I STOPPED / NEXT" block, launch brief `docs/briefs/2026-11-18-r15/S0N_LAUNCH.md`,
   binding rules), RULES (URL switch only, start view 0 px, coins 91 / 2,240, no paid jobs), PROOF + REPORTING.
4. Pixelmatch tool: rebuild `/home/user/tools-pixelmatch/` (copy `docs/briefs/2026-11-18-r16/pixeldiff.mjs`, `npm i pixelmatch@7 pngjs@7`).

## Workers
| Worker | Branch (pushed, remote = HEAD) | Kept set | Next tasks (in order) |
|---|---|---|---|
| **s04 water / foam** (foam-bubbles-particles) | `claude/rainbow-s04-match-c19` @ `97fcb8b6` (step 5 `88a6b837`) | K18-5 = K18-4 + `&m04nwq=2&m04nwr=3.2` — full query in `qa/match/04/r18/PROGRESS.md` ("Kept set K18-5 (r19)" + handoff block) | 1 prove or reject `&m04sswirl=1` (pink/magenta swirls curving UP the tunnel sides instead of the river ending in a straight edge against the gold wall; code in, unproven); 2 pink / cyan-tinted low foam banks; 3 steering glitch sweep on the 4 s clip |
| **s04tex rings** (washer-environment-modeler) | `claude/rainbow-s04-ringtex-c19` @ `1cff16f2` (step 9 `8d3d6c39`) | K9 = K8 + `&m04rpcr=1` — full query in `qa/match/04/r18/ringpaint/NOTES.md` handoff block (and `step9_crisp/motion.json`) | 1 steering check at hard left / right + the soft pink-mauve haze on the nearest ring's upper-left wall (painted: crisp polished gold); 2 the top third at f10 / t66 = near ring band seen from inside (painted: gold washer rim + pink room) — the biggest ring difference left |
| **s05** (water-fx-specialist) | `claude/rainbow-s05-match-c19` @ `eb7233e3` | `qa/match/05/r18/KEPT_STEP2.txt` (= r17 kept set + `&m05wcrisp=1&m05pink=1`; `m05lidf` REJECTED: doubled far paddles) | 1 the flat cut-off gold paddle chunk at hard left in the kink (k81L) — Blender far paddle L3 / R3 static while the far block moves; 2 plain cyan near water at the end of 05 → painted water; then brief tasks 3–4. 30 extra step-2 renders left untracked on purpose (8 key positions per set are committed) |
| s06 | `claude/rainbow-s06-match-c18` @ `c649fcbc` + WIP rank-3 (`backups/wip/claude__rainbow-s06-match-c18/`) | `&m06gold=1` v2 + `&m06fclu=1` | not restarted since r18 (see RESUME_R18.md "s06") |
| s07 | `claude/rainbow-s07-match-c18` @ `8accdad0` | `K&m07foam=1&m07coinsz=1&m07nearw=1&m07foamb=1&m07band=1` | not restarted since r18: real 3D puffy foam clouds at hard left / right; thin sliver across a gold paddle at f10 |
| s08 | PAUSED by the user | `claude/rainbow-s08-scenery-c17` @ `3c0fa970` | resume only when the user asks |

## Lead tasks still open
* **Screen 04 combined preview v3** (promised to the user): new branch from the user-approved v2
  `claude/rainbow-s04-preview-c18` @ `c338978b` merging the newest s04 (`97fcb8b6`) + s04tex (`1cff16f2`) tips (both edit
  `src/world/match04m4.ts`, different regions; v2 merged cleanly), then refit `m04end` (with `m04rfew` the end disc moves and
  shrinks). Show ONE set: APPROVED / BEFORE (v2) / NOW at a00, f03, f10, t66, hard left / right + a half-size swim clip.
* **Thrixel test — DONE, NOT AN IMPROVEMENT** (`qa/match/04/r19_thrixel/NOTES.md` on `claude/rainbow-s04-thrixel-c19` @ `1bf28be4`; review set for the user:
  `qa/review_r19/thrixel_foam/` on the lead):
  one sculpt (8 cubes of 250, 1 of 4 free sculpt runs; 242 cubes + 3 sculpt runs left until 2026-12-01). The model is a thin
  bubble relief, reads as a flat cut-out sheet with jagged edges in the game; the existing 3D foam is closer. Further Thrixel
  assets only with the user's OK; a better input (one clean isolated round heap) is suggested there.
* **Blender bank-foam heap test — PROMISING** (user ~20:05: "maybe use Blender"; `qa/match/04/r19_blendfoam/NOTES.md` on
  `claude/rainbow-s04-blendfoam-c19` @ `41ea03d1`, switch `&m04bfoam=1` + `CANDIDATE_QUERY_ADD.txt`; review set
  `qa/review_r19/blender_foam/`): a free, deterministic Blender heap of 46 big glossy separate bubbles reads like the painted
  heap while swimming (much better than the Thrixel model) but mixes with the cloud-style bank foam. Suggested next (user's
  OK): the s04 worker gives the WHOLE bank foam this bubble-heap look behind a new switch.
* fal: one TRELLIS request (`01a1f54f…`) rejected at input validation (no model, normally not billed); nothing else.

## Services (verified this round, free reads)
GitHub MCP + named fetch / push OK · World Labs Marble connector (`list_projects` "My project", credits available) + key
(5,420 credits) · fal (`queue.fal.run`) · Hugging Face · Playwright MCP · **Thrixel** connector (signed in by the user ~19:55 UTC;
it loaded mid-session after a first "connect incomplete" state). Context7 (docs plugin) needs a sign-in; not used by the game.
