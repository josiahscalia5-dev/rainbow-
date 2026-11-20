# Benny round 23 — progress (branch `claude/rainbow-benny-c23`)

## (r23) WHERE I STOPPED / NEXT — 2026-11-20

**Done:** step 1 `&b20tuft=1` (fluffy tuft volume, lighter rose tips) — GOOD IMPROVEMENT (partial), Benny-centred crops.
Best Benny query now: `&benny20=1&b20expo=1&b20ppw=0.45&b20tuft=1` (all opt-in; default build unchanged).
**Next (lead order 03:45 UTC):** (2) `tools/benny20/knit.py`: cream (not lavender) light stripes, vertical cuff ribs, violet
not bluer → re-test `b20knit=1`; (3) stitched felt star. Do NOT scale Benny (06 size = Screen 06 specialist).
Still open on the fur: finer and grainier than the approved long silky combed strands.

Proof tools (new): `tools/benny23/shots_c.mjs` (= lead audit tool + Benny's projected screen box per shot, from the QA-only
`__b20.screenBox`) and `tools/benny23/crop_c.py` (crop centred on Benny, 675x810 like `qa/benny/r22/approved/0N_benny.png`).

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
