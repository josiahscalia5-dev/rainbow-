# Screen 04 — round 23 (new account, lead session branch `claude/rainbow-r22-restore-ut3m39`) — lead log

## (r23) WHERE I STOPPED / NEXT
* Candidate **K23-1** = `QUERY_K23-1.txt` = K22-2 with `m04wup=0` (no pink water climbing the gold walls) + `m04nwhirl=0&m04nband=0`
  (no pink swirl wrapped round Benny) + `m04lane2=0.25` (calmer lane water). Lead verdict: GOOD IMPROVEMENT on the user's
  two complaints (pink walls by the gold, too much pink). Shown to the user ~04:35 UTC. Waiting for the user's eye.
* Next (s04 specialist, `docs/briefs/2026-11-20-r23/LAUNCH_S04_R23.md`): Benny going naturally THROUGH the five arrows (chevrons
  clearly ahead of him, not at hat height), the hard straight lilac edge where water meets gold → low bubbly foam bank, glossy long
  white streaks instead of the frosted ripple, then projection of the three approved generated views.

## User feedback driving this round (verbatim, 2026-11-20)
* ~03:58 (r22): "I don't want the water to look messy. I want it to look very clean ... like the original approved screen through
  the 5 arrows ... he's going naturally." Pink on the left and right "near the gold part" inside the tunnel.
* ~04:20 (r23): "my screen has like the pink around it, around the blue water. I don't want all that pink stuff ... it's mostly blue
  water, and there's a little bit pink on the sides. I think I have too much pink, like wet or water on the left and right side."

## Step 1 — pink walls off (`lead_t1/`)
BEFORE = K22-2 (`lead_t1/QUERY_BEFORE.txt`), NEW = K22-2 with `m04wup=0` (`lead_t1/QUERY_NEW.txt`). Pinned-clock audit (7 shots).
The tall wavy magenta walls are gone in every shot; the gold rings reach the water. Start view unchanged (0 px > 25 levels).
Left: a hard straight lilac edge where the water meets the gold; still a lot of pink ON the water near the camera.

## Step 2 — less pink on the water (`lead_t2/`)
* METHOD TRAP (fixed): the game reads the FIRST occurrence of a URL switch, and K22-2 already contains `m04lanew`, `m04nwhirl`,
  `m04pink` ... — appended overrides were ignored in the first sweep (P1–P3, Q1–Q3, deleted). Overrides must REPLACE the value in
  place (`URLSearchParams.set`; scratch helper copied to `tools/lead23/setq.mjs`).
* Diagnostic (c_middle): whirl/band round Benny off = mostly blue + thin pink bands at the edges (closest to the user's words);
  all bands off / lane 10 u = all blue (too far; the painting has pink side swirls).
* C1 = + `m04nwhirl=0&m04nband=0`; **C2 = C1 + `m04lane2=0.25`** (slightly calmer lane) → K23-1.
* Pictures `lead_t2/C2/` (7 shots), BEFORE `lead_t1/BEFORE/`, APPROVED `references/04_through_the_five_arrows.png`.
* Clips (pinned clock, real speed 2.4 s + half speed): `lead_t2/swim04_BEFORE_K22-2*.mp4`, `lead_t2/swim04_NEW_K23-1*.mp4`.
* Gameplay `gameplay_K23-1.json`: 8/8, 91 coins, 1,330 → 2,240. Start view 0 px > 25 levels vs BEFORE.
* Verdict GOOD IMPROVEMENT (pink walls gone, mostly blue water, thin pink edges, gold clean to the water). NOT yet like the painting:
  chevrons straddle Benny's hat (he does not read as swimming through the arrows), hard straight water/gold edge, frosted ripple
  texture instead of long glossy streaks, foam banks small.
