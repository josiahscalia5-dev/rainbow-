# Benny round 23 — progress (worktree `/home/user/wt/benny`, local branch `claude/rainbow-benny-c24` = `-c23` @ `734efb6`; not committed / pushed by Benny — the lead's autosave snapshots the worktree)

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
