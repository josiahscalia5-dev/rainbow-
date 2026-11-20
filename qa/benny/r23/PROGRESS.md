# Benny round 23 — progress (worktree `/home/user/wt/benny`, local branch `claude/rainbow-benny-c24` = `-c23` @ `734efb6`; not committed / pushed by Benny — the lead's autosave snapshots the worktree)

## (r28) WHERE I STOPPED / NEXT — 2026-11-20 ~16:55 UTC (new account; worktree `/home/user/wt/benny`, LOCAL branch `claude/rainbow-benny-c29`, port 5279, temp `/home/user/scratch/benny/`)

**STEP 2 VERDICT — hat crown `&b20crown=1`: GOOD IMPROVEMENT (hat shape; not approved).** The r27 proof run had finished before the
stop: all 15 NEW shots `qa/benny/r27/s5_crown/0N/new/` (same s / steer as BEFORE `qa/benny/r23/s3_star/0N/new/`, same query + tool),
NEW clip `qa/benny/r27/s5_crown/clip/swim04_crown_NEW_{full,benny}_{1x,0.5x}.mp4` (4.5 s / 9.0 s; BEFORE =
`qa/benny/r25/s4_silk/clip/swim04_silk_BEFORE_*`, same schedule: straight 0–1.5 s, LEFT 1.5–3, RIGHT 3–4.5), gameplay
`qa/benny/r27/s5_crown/gameplay_crown.json` = 8/8 checks, 91 coins (1,330 → 2,240), victory, no errors, query ends `…&b20star=1&b20crown=1`.
r28 added the labelled full-size crops `qa/benny/r27/s5_crown/COMPARE/0N_{a_start,c_middle,f_hard_left}/{1_ORIGINAL_APPROVED,2_BEFORE,3_NEW}.png`
(15 shots; BEFORE and NEW cut with ONE common rectangle per shot = union of both Benny boxes, so Benny is the same size; `CROP.json`
per folder; approved = `0N/approved_benny_fullhat.png`, 04 = `r23/s3_star/04/approved_benny.png`; script `/home/user/scratch/benny/crown/compare.py`).
Closer: the crown is now the approved taller beanie with steep sides instead of a wide low dome, and above the thick ribbed cuff it
carries five thinner alternating cream / violet bands like the approved (BEFORE: 3–4 thick bands) — visible on 04–08 at start,
middle and hard left, and it holds while swimming and steering in the clip (pompom stays seated, no popping or gaps).
Still different: the approved crown narrows toward the top into a rounded dome with the pompom sitting high as an almost full ball;
ours keeps nearly vertical walls up to a broad top (slightly drum-like at 06 start / 08) and the crown hides the lower part of the
pompom. New problem: none seen. Fur grain unchanged (separate open item).
**Best query now (unapproved):** `&benny20=1&b20expo=1&b20ppw=0.45&b20tuft=1&b20knit=1&b20star=1&b20crown=1`.
**Next:** step 3 = 06 start star leaning amber vs the approved lighter yellow (`b20sx06`); later: crown taper toward the top + pompom higher.

## (r27) WHERE I STOPPED / NEXT — 2026-11-20 ~15:30 UTC (new account; worktree `/home/user/wt/benny`, LOCAL branch `claude/rainbow-benny-c28`, port 5279, temp `/home/user/scratch/benny/`)

**STEP 1 VERDICT — combed silk fur `&b20silk=2`: NOT AN IMPROVEMENT (keep the switch, do NOT add it to the best query).**
Evidence: gameplay `qa/benny/r25/s4_silk/gameplay_silk.json` = 8/8 checks, 91 coins (1,330 → 2,240), victory, no errors.
Labelled full-size crops `qa/benny/r25/s4_silk/COMPARE/{04_a_start,04_c_middle,05..08_c_middle}/{1_ORIGINAL_APPROVED,2_BEFORE,3_NEW}.png`
(all 15 NEW shots in `0N/new/`, BEFORE = `qa/benny/r23/s3_star/0N/new/`, same query + tool). Clips (same tool, schedule straight
0–1.5 s, LEFT 1.5–3, RIGHT 3–4.5, speed on every frame): `qa/benny/r25/s4_silk/clip/swim04_silk_{BEFORE,NEW}_{full,benny}_{1x,0.5x}.mp4`.
Measured: fur colour unchanged (median within ≤ 5 levels of BEFORE on all 15 shots — dusty rose kept); high-frequency detail on the
body +5–14 % vs BEFORE (not softer); shimmer in motion unchanged (body frame-to-frame change 23.2 vs 23.6).
Closer: on native-size close crops the pile now runs downward like the approved combed fur (04, 05, 08). Still different: at phone
size and in motion it looks the same as BEFORE — a dense pixel-fine pile with dark speckles, not the approved smooth silky tufts with
soft lighter tips. New problem: none. Next for fur (later): soften the per-pixel grain itself (bigger soft-edged strands / filtered
strand alpha), not the strand direction.

**Step 2 (hat crown) in progress:** approved crown on 04–08 = steep, almost vertical sides rounding off under a high pompom, with
FIVE thinner bands above the thick cuff (cream, violet, cream, violet, cream); ours = a wide hemisphere with 3–4 thick bands.
Probe 1 (`/home/user/scratch/benny/crown/p04|p05`, crown lathe reshaped live + pompom lifted): taller conical v2/v3 = lampshade,
not the approved shape. Probe 2 (`q04|q05`): steep superellipse walls exp 3.5, height ×1.25, taper 0.12 + five-band map = closest
(w5 no extra height = squat; w3 = cone). Implemented `&b20crown=1` in `benny20.ts` (`CROWN20`, overrides `&b20chk/cta/cp/cpl=`;
rebuilds the crown lathe, lifts the pompom with the apex; with b20knit=1 uses `assets/textures/benny20/crown5{,_n}.png` from
`tools/benny23/knit_r27_crown5.json`); `npx tsc --noEmit` OK. Proof running (`/home/user/scratch/benny/crown/proof.sh`) →
`qa/benny/r27/s5_crown/0N/new/` (BEFORE = `qa/benny/r23/s3_star/0N/new/`), NEW clip 04 (BEFORE clip = `qa/benny/r25/s4_silk/clip/swim04_silk_BEFORE_*`,
same query), gameplay `gameplay_crown.json`. NEW crops must use BEFORE's Benny boxes (taller hat grows the box).
**Next:** (3) 06 start star amber.

## (r26) WHERE I STOPPED / NEXT — 2026-11-20 ~14:00 UTC (new account; worktree `/home/user/wt/benny`, LOCAL branch `claude/rainbow-benny-c27`, port 5279)

**Done:** BEFORE swim clip 06 re-rendered (same tool + schedule as NEW) and encoded `qa/benny/r23/s3_star/clip/swim06_star_BEFORE_*`.
**Star 06 fix (r26):** measured inside the star window — 04 NEW ≈ approved (255/201/69 vs 251/197/73, orange stitched rim share
0.26 vs 0.22; BEFORE 0.06) = closer; 06 middle r25 NEW was CLIPPED green-lemon (250/255/55, relief flattened) = NOT closer
(agrees with the user's review). Probe x0–x5 → `b20sx06` default now `0.9,1.2,0.55` (middle 255/229/55, g/r .90 vs approved
.89, relief p10/50/90 169/216/235 vs approved 167/211/228; start leans amber g/r .65 vs approved .89). Old NEW kept:
`06/new_r25_lemon/`, `clip/old_r25_lemon_swim06_star_NEW_*`. 06 `new/` + NEW clip re-rendered with it (13:48–13:55).
**STEP 1 VERDICT — felt star `&b20star=1` (+ r26 06 colour): GOOD IMPROVEMENT (star).** Proof `qa/benny/r23/s3_star/0N/`
(`approved_benny.png`, `before/`, `new/`; 06 r25 lemon kept in `new_r25_lemon/`), clips `clip/swim06_star_{BEFORE,NEW}_{full,benny}_{1x,0.5x}.mp4`
(same tool, schedule 0–1.5 s straight, LEFT 1.5–3, RIGHT 3–4.5, straight; 06 ends at ≈ 4 s so the last 2 s are 07; speed on every frame),
gameplay `gameplay_star.json` 8/8, 91 coins (r24, same switches; 06 colour is a material-colour change only).
Closer: warm golden-yellow felt star with an orange stitched rim on every screen (04 measured ≈ approved), no olive / bronze
cast (BEFORE on 05–08 hard-left and in the clip), 06 middle hue ≈ approved with its relief back. Still different: the
approved star is a glossy puffy enamel-like star with a soft highlight; ours is matte felt with lighter stitch dots; 06 start
leans orange-gold vs the approved lighter yellow. No new problem seen (clip: Benny hidden at 2.5–3.3 s by a passing orange
ring band of this branch's older 06 scenery, identical in BEFORE). Captures use this branch's own (older) screen environments,
not the latest combined state.

**Silk:** `&b20silk=1` (lock cones) = spiky shards, hotter pink → rejected. NEW `&b20silk=2` (fur.ts `B20COMB`, benny20.ts `COMB20`,
overrides `&b20q<key>=`): soft b20tuft pile with strands stretched vertically → downward combed fibres, no spikes, same rose.
Defaults = probe c8 (qsq .3, qst .06, qlen .12, qcx .9, qgr .07); clumpier d3/d5 read darker + shaggy → not used. Proof running:
`/home/user/scratch/benny/silk/run_proof.sh` → `qa/benny/r25/s4_silk/0N/new/` (BEFORE = `qa/benny/r23/s3_star/0N/new/`, same
query + tool), clip 04 BEFORE/NEW, gameplay `gameplay_silk.json`. Key clash fixed: soft-edge width now `&b20gew=`.
**Next:** star verdict from the new 06 crops + clips; silk verdict; then step 3 (hat crown taller / pompom softer).

## (r25) WHERE I STOPPED / NEXT — 2026-11-20 ~12:10 UTC (new account; worktree `/home/user/wt/benny`, LOCAL branch `claude/rainbow-benny-c26`, port 5279)

**Doing now:** (1) finishing the felt-star step `&b20star=1`: the 04–08 APPROVED / BEFORE / NEW crops in `qa/benny/r23/s3_star/` are
complete (06 NEW re-rendered in r24 after the lime fix); gameplay 8/8 + 91 coins done in r24 (`gameplay_star.json`). Missing: the
swim clip (06, BEFORE + NEW, speed on every frame, new tools `tools/benny25/swim_clip_c.mjs` + `label_clip_c.py`) and the verdict.
**Next:** (2) silky combed fur `&b20silk=1` (shader in `fur.ts` `#ifdef B20SILK` + `SILK20` in `benny20.ts`, typecheck passed in r24;
probe variants lost with the r24 scratchpad) → proof `qa/benny/r25/s4_silk/`; (3) hat crown shape vs the approved taller beanie, or
06 cream leaning yellow (`&b20kw06=`). Do NOT scale Benny. Heavy renders through `tools/lead25/render_slot.sh`, one at a time.

## (r24) summary — 2026-11-20 10:30–11:12 UTC (stopped by the user at 11:12 to switch accounts; not a rejection)
* Star step `&b20star=1`: the 06 hard-left / middle star came out neon lemon-lime (`STARX20['06']` green 2.1). Probe A–D
  (`qa/benny/r23/s3_star/06/probe_r24/`) → D chosen: `b20sx06` default `0.9,1.55,0.62` (warm gold at the start, clean yellow in the
  middle). Old NEW kept as `06/new_r23_lime/`, 06 `new/` re-rendered. Gameplay with the NEW switches 8/8, 91 coins (1,330 → 2,240),
  victory, no errors; `tsc` OK. The swim clips were rendering when the user stopped the session (lost).
* Silky fur `&b20silk=1` started: `fur.ts` `B20SILK` (smooth streaks along each lock converging into a pointed tip instead of
  per-strand dots, taper exponent, crease width, centre sheen; uniforms `uSilk` / `uSilk2`), `benny20.ts` `SILK20` + `&b20g*`
  overrides. Two probe rounds on 04 (g0–g5, h1–h6): bigger locks read blotchy; fine/short variants close to the step-1 look; no
  variant chosen yet.

## (r23) WHERE I STOPPED / NEXT — 2026-11-20 ~09:55 UTC (new account, in-process Benny)

**Done this session:** step 2 knit beanie `&b20knit=1` (chain mode, cream stripes, vertical rib cuff, violet not bluer,
per-yarn exposure on 05–08) — GOOD IMPROVEMENT (hat), proof `qa/benny/r23/s2_knit/`, gameplay 8/8 + 91 coins.
**Best Benny query now:** `&benny20=1&b20expo=1&b20ppw=0.45&b20tuft=1&b20knit=1` (all opt-in; default build unchanged).
**In progress (~10:15 UTC):** (3) stitched felt star `&b20star=1` — maps `assets/textures/benny20/star_felt{,_n}.png`
(`knit.py` `star_mode: felt`, params `tools/benny23/star_r23.json`), per-screen `STARX20` (with `b20expo=1`); proof renders
`qa/benny/r23/s3_star/` running (machine load ~30 → renders one at a time, 600 s screenshot timeout). Then (4) fur:
longer silky combed tufts (not grainy). Do NOT scale Benny. Max 2 parallel renders.
**Open on the hat (not this step):** crown dome rounder / flatter than the approved taller beanie; on 06 middle the cream
leans a little yellow (`&b20kw06=` tunable).

Worktree edits (uncommitted, for the lead's autosave): `tools/benny20/knit.py` (+ `knit_mode: chain`, `--nostar`),
`tools/benny23/knit_r23.json` (map params), `tools/benny23/knitprobe.mjs` (one-load map/exposure probe),
`assets/textures/benny20/{crown,crown_n,brim,brim_n}.png` + `knit_params.json` (regenerated), `src/characters/benny/benny20.ts`
(neutral knit factors, `KNITX20` per-yarn exposure via a small `onBeforeCompile` on the two knit materials).

## Log

### Step 2 (lead order) — knit beanie `&b20knit=1` — GOOD IMPROVEMENT (hat)
* Started from the unfinished `734efb6` edits (rendered as `cur`: cream stripes, but V-stitch crown with violet specks in
  the gaps, cuff a horizontal-banded V grid, violet clipped electric blue-violet).
* `tools/benny20/knit.py` new `knit_mode: chain` (`chain_field`, `shade2`): every column a round rib cord made of small
  V stitches with a continuous dark groove — the vertical ribbing of the approved cuff AND crown; stripe colour follows
  the stitch row (no wrong-colour specks); two-tone yarn (cool groove shadow → lit stitch top, lilac sheen on violet rib
  tops). Measured on the approved 04 hat: cuff ribs ≈ 7–9 px, crown columns ≈ 8 px → crown 100 × 36 rows, cuff 108 × 14.
  Colours solved through the live 04 light + post chain (map probe `tools/benny23/knitprobe.mjs`, 10 variants):
  04 violet median (106,17,219) vs approved (108,18,210); light stripes cream (~(240,215,212) at the 04 start) instead
  of the r22 lavender-pink (255,222,255, clipped).
* `benny20.ts`: knit factors neutral `[1,1,1]`, normal strength 2.0 / 2.0; new `KNITX20` per-screen exposure for the two
  yarns separately (violet `v`, cream `w`; the knit shader tells them apart by the map texel's g/b) — 05–08 paint the hat
  ≈ 1.5× brighter than the game lights it; one multiplier for both yarns turned the cream lavender or the violet electric.
  Only with `b20knit=1&b20expo=1`; `&b20kv0N=` / `&b20kw0N=` overrides. 08 / 06 re-tuned after the first pass (08 blown
  out, 06 middle yellow).
* Proof `/home/user/rainbow-/qa/benny/r23/s2_knit/0N/` (N = 04..08): `approved_benny.png`, `before/` = step-1 best query
  (no knit; reused from `qa/benny/r23/s1_tuft/0N/new/` — re-render check on 04: Benny pixel-identical, only the HUD band
  differs), `new/` = + `&b20knit=1`; `a_start / c_middle / f_hard_left` full frames + `*_crop.png`; queries
  `QUERY_BEFORE_0N.txt` / `QUERY_NEW_0N.txt` (lead r21 `QUERY_0N.txt` + Benny switches; the newer 04 K23 / 06 / 07 / part
  of 05 match code is not on this branch, so those screen switches are ignored — this branch's build of each screen;
  Benny's look is what is judged). Swim clip `swim05_knit_NEW.mp4` (BEFORE `swim05_BEFORE.mp4`), frames `swim05_frames/`.
  Gameplay `gameplay_knit.json`: 8/8 checks, 91 coins, victory, with the NEW switches.
* Verdict by eye: the beanie now reads as a real chunky hand-knit hat like the approved — clean vertical ribs on the cuff,
  ribbed stitch columns on the crown, CREAM light stripes and the approved purple violet (no smeared streaks, no lavender,
  no electric blue) — on 04–08, start / middle / hard left and while swimming. Still different: the approved painting's
  light stripes read whiter-lilac (cream chosen per the lead order), the knit is more regular than the painted one, and
  the crown dome is rounder / flatter than the approved taller beanie (geometry, not this step).


### Step 1 — `&b20tuft=1` soft fluffy plush volume — GOOD IMPROVEMENT (partial)
* `fur.ts`: new BENNY20-only uniforms `uTipCol` (colour the uPile.w tips fade to; pompom keeps its pale lavender) and `uVol`
  (x highlight on up-facing fur, y darker underside). `benny20.ts`: `TUFT` block (body + arms): bigger locks (30 / arms 36),
  fur length 0.08, softer strands (cell 180), lighter tips (shade y .65, pile w .55 toward pale rose 1/.42/.92), rounder
  tuft shading, upper-body highlight .35, underside .1. All `&b20t<key>=` overridable.
* Tried on 04 first: v1 (darker, grainy) and v2/v3 (long hanging tiers + ragged hem again) rejected; v5 kept, tip colour
  then made pinker (salmon tint on 05).
* Folder `qa/benny/r23/s1_tuft/0N/{before,new}/` — BEFORE = `&benny20=1&b20expo=1&b20ppw=0.45`, NEW = + `&b20tuft=1`;
  `a_start / c_middle / f_hard_left` full frames + `*_crop.png` centred on Benny (every shot now shows him). Swim clip
  `qa/benny/r23/s1_tuft/swim05_tuft.mp4`. Gameplay 8/8 with the switches.
* Verdict by eye: the body now shows soft tuft clusters with lighter rose tips and a little volume instead of flat
  velvet; outline stays round with a soft fuzzy edge; colour stays the step-2 dusty rose. Still finer / grainier than the
  approved's long silky combed tufts, and the difference is small at gameplay size on 05–08.
