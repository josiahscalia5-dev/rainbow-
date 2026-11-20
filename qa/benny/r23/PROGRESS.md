# Benny round 23 — progress (worktree `/home/user/wt/benny`, local branch `claude/rainbow-benny-c24` = `-c23` @ `734efb6`; not committed / pushed by Benny — the lead's autosave snapshots the worktree)

## (r23) WHERE I STOPPED / NEXT — 2026-11-20 (new account, in-process Benny)

**Working on:** step 2 of the lead order (= this session's step 1) — knit beanie `&b20knit=1`: cream light stripes, vertical
rib cuff, violet not bluer. New `knit_mode: chain` in `tools/benny20/knit.py` (params `tools/benny23/knit_r23.json`), maps
regenerated into `assets/textures/benny20/`, per-screen knit exposure `KNITX20` in `benny20.ts` (with `b20knit=1&b20expo=1`).
Proof pending. Then: stitched felt star; then fur (longer silky combed tufts).
Best Benny query (before this step): `&benny20=1&b20expo=1&b20ppw=0.45&b20tuft=1` (all opt-in; default build unchanged).

Note: the unfinished knit edits found in autosave `734efb6` (cream `[228,236,214]` + factors `[.78,.78,.7]` / `[.67,.75,.57]`,
cuff 96 cols with `brim_rib .5`) were rendered first (`cur`): light stripes cream but V-stitch crown with violet specks in the
gaps, cuff still a horizontal-banded V grid, violet clipped electric blue-violet → replaced by the chain mode below.

## Log

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
