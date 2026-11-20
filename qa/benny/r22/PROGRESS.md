# Benny round 22 — progress (branch `claude/rainbow-benny-c23`)

## (r22) WHERE I STOPPED / NEXT — 2026-11-20

**Done (3 steps, round stopped as briefed):** step 1 plush fur `&benny20=1` GOOD; step 2 per-screen exposure `&b20expo=1`
GOOD; step 3 pompom lighter yarn tips `&b20ppw=0.45` GOOD, knit maps `&b20knit=1` NOT YET PROVEN.
Best Benny query now: `&benny20=1&b20expo=1&b20ppw=0.45` (all opt-in; default build unchanged).
**Next — FIRST the lead's step-1/2 feedback (03:36 / 03:39 UTC):** the new pile reads as short flat velvet / terry, a bit
grainy and dull; approved = soft FLUFFY plush with visible volume (medium-short soft tufts, lighter rose tips, soft
highlights on upper body / cheeks, darker only in underside creases) → new switch `b20tuft` (tuft volume + light tips),
compare full size vs `qa/benny/r22/approved/0N_benny.png`. PROOF FIX: centre every crop on Benny's projected screen
position (start / middle / hard left) — the fixed box misses him on 05/06/07 middle and all hard-left shots.
**Then:** (a) knit maps: make the crown's light stripes CREAM (they come out lavender-pink — fix in `tools/benny20/knit.py`
stripe colour, not via `b20ccol`, which barely moves it), lighter less-blue violet, vertical cuff ribbing like the approved;
(b) deeper rose creases in the body fur at the brighter 05–08 exposure (shade `bsx/bsz`); (c) felt star stitching and
Benny's size vs the painted Benny (06 start: Benny far larger than painted — camera/framing, flag to lead).

Kept query per screen = lead `qa/review_r21/audit/QUERY_0N.txt` (lead branch `ccr-4742c19f-ez2mrs`) + Benny switches.
Note: this branch has only part of the screens' match code (no `match06` / most `m06*`, `m07*`, `m05pink` …), so the 06 / 07
(and partly 05) proofs show this branch's build of those screens with the unknown switches ignored — Benny's look is what
is judged. Default build unchanged (every change only under `benny20`).

## Log

### Step 1 — plush pile fur (`&benny20=1`, restored r20 edits) — GOOD IMPROVEMENT (texture); colour still too dark on 05–08
* `npx tsc --noEmit` clean; `tools/benny20/knit.py` re-run with scipy (maps only used with opt-in `b20knit=1`).
* BEFORE = `bade594` (r20 step 1), NEW = this branch. Folder `qa/benny/r22/t1/0N/{before,new}/` — full frames
  `a_start / c_middle / f_hard_left.png` + `*_crop.png` Benny close-ups; approved crops `qa/benny/r22/approved/0N_benny.png`.
  Swim clip `qa/benny/r22/t1/swim05_new.mp4`. Gameplay `scripts/gameplay-test.mjs` 8/8 (also with `--q=benny20=1&b20expo=1`).
* Verdict by eye: on all five screens the body fur is now short, dense and plush with a smooth round outline — the long
  stiff hanging tiers and the jagged shaggy hem of BEFORE are gone; closer to the approved Benny. Still different: on
  05 / 06 / 07 / 08 he is a darker, duller mauve-rose than the bright dusty rose painted there (→ step 2); pompom still a
  dark koosh; cuff texture smeared (→ step 3). The fixed crop box misses Benny on the hard-left shots (he is off to the
  side) — look at the full frames there.

### Step 2 — per-screen fur exposure (`&benny20=1&b20expo=1`) — GOOD IMPROVEMENT (colour on 05–08)
* `EXPO20` (src/characters/benny/benny20.ts) re-solved for the NEW plush fur in two shoot-measure passes against each
  approved Benny's body colour: 05 [2.08,1.54,1.68], 06 [1.73,1.62,1.5], 07 [2.33,1.59,1.75], NEW 08 [2.0,1.21,1.7]
  (linear multipliers; 04 keeps its own look). Still opt-in `b20expo=1`; overridable `&b20x0N=r,g,b`.
* BEFORE = step 1 NEW (`qa/benny/r22/t1/0N/new/`), NEW = `qa/benny/r22/t2/0N/new/` (full frames + crops). Gameplay 8/8 with
  `--q=benny20=1&b20expo=1`.
* Verdict by eye: Benny now reads the same bright dusty rose on 05, 06, 07 and 08 as painted (no more dark mauve), at the
  start, in the middle and steering hard left. Trade-off: at the brighter exposure the fur's strand shading is a bit flatter
  than the approved (which keeps deeper rose creases) — worth a later shade-depth pass. Pompom / cuff unchanged (step 3).

### Step 3 — pompom lighter soft yarn (`&b20ppw=0.45`) GOOD IMPROVEMENT; knit maps (`&b20knit=1`) NOT YET PROVEN
* New `uPile.w` in `fur.ts` (BENNY20 path only): outer strand ends fade toward a pale lavender of the same brightness;
  pompom `pile.w = b20ppw` (default 0 → nothing changes unless the switch is set). Darker / chunkier pompom variants
  (`b20pcol`, `plx`, `psx`) tried first: darker koosh → rejected.
* BEFORE = step 2 (`t2/0N/new`, 04: `t1/04/new`), NEW = `qa/benny/r22/t3/0N/new/` with
  `&benny20=1&b20expo=1&b20knit=1&b20ppw=0.45`. Gameplay 8/8 with these switches and with the default build.
* Verdict by eye: the pompom now reads as a lighter lilac yarn ball with pale tips and darker violet depth (closer to the
  approved; before it was a flat saturated violet koosh) — GOOD. The knit maps give clean, regular chunky cuff stitches
  instead of the smeared streaks — but the crown's light stripes turn lavender-pink instead of cream, the violet goes
  darker / bluer and the cuff shows V-stitches, not the approved vertical ribbing → NOT YET PROVEN, stays opt-in.
