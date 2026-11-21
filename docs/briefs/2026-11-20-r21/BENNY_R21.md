# Round 21 — Benny specialist (cloud session; act as `benny-character-artist`)

You work ONLY on Benny's LOOK (fur, colour, hat, pompom, star, proportions / size on screen) on all five playable screens 04–08.
Read `.claude/agents/benny-character-artist.md` and follow it.

## User orders (binding)
2026-11-20 ~02:20 UTC: "Keep all five screens on the completion checklist, including a consistent approved Benny throughout ...
Keep Benny's established gameplay speed and controls intact." 2026-11-19 ~23:50 UTC: "Make sure Benny looks a lot more like the
approved screen's Benny pink character ... Like the fur, the pink texture, like the color of the texture ... I want it to look like
the 100% everything about the pink character from my approved screen ... All of this states as well" (start, swimming, steering,
every screen). Approved Benny = dusty-rose plush fur (short, dense, soft plush, smooth round outline, darker rose underside / creases
→ bright tips), chunky hand-knit cream / violet striped beanie with a soft LIGHTER yarn pompom, stitched yellow felt star, small pink
paws — exactly as in `references/04…png` … `references/08…png`, same size relative to the scenery as painted.

## Where you work
* This cloud session, branch `claude/rainbow-benny-c22` (started from `claude/rainbow-benny-c21` @ `bade5941` = your round-20 step 1:
  `&benny20=1`, colour GOOD, texture not yet). Your session's five-minute autosave saves to this branch; push ONLY it. Never merge,
  rebase, force-push or write any other branch.
* FIRST restore your round-20 unfinished edits (`benny20.ts`, `fur.ts`, `tools/benny20/furstat.py`, `knit.py`):
  `git fetch --depth=20 origin ccr-68d26c2d-gwegce && git show FETCH_HEAD:backups/wip/claude__rainbow-benny-c21/tracked.patch > /tmp/wipb.patch && git apply --binary /tmp/wipb.patch`
  (`assets/textures/benny20/crown_n.png` was not snapshotted: regenerate with `tools/benny20/knit.py`), and the lead's audit tool:
  `mkdir -p tools/lead21 && git show FETCH_HEAD:tools/lead21/audit_screen.mjs > tools/lead21/audit_screen.mjs`.
  Lead overview of every screen today: `git show FETCH_HEAD:qa/review_r21/audit/OVERVIEW_0N.png` (N = 4..8).
* Your logs: `qa/benny/r19b/PROGRESS.md` (r19b / r20 entries), `qa/benny/r20/`. No paid jobs without telling the lead; never print
  secrets; do not reinstall tools.

## Lead measurements (r20) — the target
Approved fur (04 start close-up, body below the cuff, HSV): mean RGB (200,70,146), hue ~324°, saturation median 0.66, brightness
p10 / 50 / 90 = 0.57 / 0.80 / 0.98. Game v3: (255,92,179), brightness 1.00 / 1.00 / 1.00 (clipped, no shading) = the neon look.
Your step 1 (`benny20=1`): colour ≈ approved on 04, but the fur reads as long stiff hanging tiers / a shaggy fringe with a jagged hem
(approved: short dense soft plush, smooth round outline); pompom a dark koosh (approved: lighter soft yarn); cuff smeared; on 05 / 06 /
07 Benny is too dark (per-screen exposure). Stiff petal-like probes were rejected.

## Tasks (in order)
1. Plush fur texture: very fine, dense, silky strands combed softly downward in overlapping layers, smooth round silhouette, the
   approved brightness spread (deep rose creases / underside → bright tips), saturation ≤ approved — on all five screens, start,
   swimming, hard left / right.
2. Per-screen exposure so Benny reads the same dusty rose on 04, 05, 06, 07, 08 (each screen's lighting differs).
3. Pompom (lighter soft yarn), cuff (clean chunky knit ribs), star (stitched felt), proportions / size vs the painted Benny.
Benny's animation, speed, steering, collisions and the water contact stay unchanged. Every change behind `benny20` switches; default
build unchanged.

## Proof (every finished step — the user accepts only the REAL game)
For each screen N in 04..08 (each screen's own kept query is in the lead's `qa/review_r21/audit/QUERY_0N.txt` on
`ccr-68d26c2d-gwegce` — Benny switches must work on top of every screen's switches; if a screen's code is not on your branch, use the
default build of that screen for the Benny proof and say so): `node tools/lead21/audit_screen.mjs <out> 0N "<query>"` with
`AUDIT_SHOTS='[["a_start",0,null],["c_middle",0.35,null],["f_hard_left",0.35,-1]]'`, BEFORE / NEW + close-up crops of Benny next to the
approved Benny crop, separate pictures under `qa/benny/r21/<step>/`; one swim clip (`node tools/lead_r13/swim_clip.mjs 05 <outdir> 3.6
"<query>"`). Gameplay `node scripts/gameplay-test.mjs` → 8/8. 3–5 line verdict in plain visual words (GOOD IMPROVEMENT / NOT AN
IMPROVEMENT / NOT YET PROVEN). No colour-percentage claims as proof (measurements may support, never replace, the by-eye verdict).

## Reporting
Log every step in `qa/benny/r21/PROGRESS.md` and push. After each finished step send a short message to the lead session
`session_018Sg3AS52AWzs9dteBtUpsM` (send_message): step + switch, commit SHA, verdict, folder, next. Continue without waiting.
