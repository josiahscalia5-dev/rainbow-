# Screen 04 — tunnel bands: rounded gold rims, narrow shaded grooves, no near-black / jagged edges (r21, 2026-11-20)

User (2026-11-20 ~00:55 UTC, marked close-ups — approved arrow upper-left of the front ring, game red loop on the left
wall bands): "softer, rounded gold rims, narrow shaded grooves, and copper surfaces with pink, violet, and blue
reflections. Correct the prominent near-black boundaries and visible jagged edges ... Inspect the surface joins and
shading to identify the cause. Keep the tunnel arrangement and gameplay intact. Preserve subtle groove shadows, and match
the reflections without simply increasing overall brightness or glow."

The user's "current" picture = the rings preview `70e5595` (`claude/rainbow-s04-ringtex-c21`, query
`qa/match/04/r19b/ringpaint/preview_r20/QUERY_preview.txt`) at f06 — 97.2 % of its pixels within 20 levels of that render.

## Cause (measured, not guessed)
Debug view `&m04dbg=1` (sub-bands red / blue with brightness = position inside the sub-band, lip part green, groove part
black) laid over the f06 render, plus a pixel trace across the marked bands:

1. **Hard shading cliffs inside the shader (main cause of both symptoms).** `m04rnear` splits each near band into
   sub-bands and grades every sub-band dark red-brown (luma 72–108) → yellow-white (≈248) along its length; the next one
   starts dark again. At every sub-band join the colour jumps ~160 levels inside ONE pixel, with no filtering → the
   stair-stepped edges; the dark third of each ramp sits right next to the hottest pixels of the next → reads as a
   near-black boundary. 502 of 891 hard steps (|ΔY| > 70) in the marked area lie on sub-band joins.
2. **The flattened lip + groove strip.** Since `m04rflat` the lip bead and groove are flush, so the 0.65 ring-unit
   strip at each ring end shows the painted ring's dark groove rows stretched wide (luma 60–80), pressed another 22 %
   darker by `m04rmat`'s mid-tone darkening, with a hard edge where the `m04rnear` treatment stops (`uu < uL`).
   562 of the 616 near-black pixels (luma < 55) in the marked area are on these strips.
3. **Small extras:** `fwidth()` of the wrapped ring coordinate jumps at every period end (bright dashed pixels on the
   seam); the near-band treatment switched off abruptly where the telescope rings start (`m04rfew`) → a hard
   yellow / dark-red edge further in.
4. **No anti-aliasing on 3D edges at all (whole game).** The scene is rendered into the EffectComposer's off-screen
   target, which has no multisampling, so `antialias: true` on the renderer never reaches the geometry (the washer rim's
   inner edge, the river's cut edge, coins are stair-stepped).

The approved rings have the SAME direction (near end of a band darker, bright rim at its far end) but: a ~70-level step
across a narrow groove (not 160 in 1 px), rims soft gold ~150–165 (not 248), body 100–135, grooves 63–90 and 2–4 px wide.

## Fix (URL switches; default build unchanged — verified pixel-identical in the tunnel, max diff 0)
* **`&m04rsoft=1`** (needs `m04rnear`; tunables `m04rsg` groove half-width 0.035, `m04rsr` rim roll-off 0.12,
  `m04rsh` painted hue kept 0.45) in `src/world/match04m4.ts`: every rib (each sub-band; the last one runs on over the
  flush lip to the period end) is ONE rounded profile in tones measured on the approved inner rings — copper near end →
  warm body brightening into the rim → a rounded soft-gold crest (hot in places) → rolls over (≥ 3.5 px) into a NARROW
  shaded groove (deep red-brown (146,52,34), never black). Both sides of every groove meet the same tone and every per-rib
  term (sheen, hot spots, reflections, machined lines, bulbs) is windowed to zero there, so nothing is discontinuous;
  groove and crest are pre-filtered by the pixel footprint (a groove thinner than a pixel fades to its average). The
  painted texel's own hue (rose / violet / yellow streaks) rides on it at the profile's luminance. Pink / violet / blue
  reflections are soft world-anchored patches at the SAME luminance as the copper under them (hue shift, no added glow);
  a soft polished highlight from the rib's rounded normal slides over each rib as Benny swims. `m04rmat` / `m04rpcr`
  apply only where the new treatment is not. The painted dots move onto the ring rim's crest. Fades out over the last
  corridor ring before the telescope (no hard edge there).
* **`&msaa=4`** in `src/game/Game.ts`: the composer's scene target is multisampled (smooth 3D edges). Affects the whole
  game and costs GPU time → check on the phone before making it default.

## Numbers (f06 = the user's camera, ring pixels; approved = its inner rings r 110–280 px, which match the near rings best)
| | approved inner rings | BEFORE (70e5595) | AFTER (`m04rsoft=1&msaa=4`) |
|---|---|---|---|
| luma p5 / p50 / p95 (marked area) | 81 / 105 / 167 | 75 / 127 / 230 | 85 / 120 / 177 |
| near-black px (luma < 60), marked area | — | 0.89 % | 0.04 % |
| hard steps (|ΔY| > 70), marked area | — | 761 | 112 |
| hard steps, whole tunnel | — | 1,936 | 295 |
| mean luma, whole tunnel | — | 129 | 121 (no overall brightening) |
Reflection hues in the marked area (S > 0.2): rose 8.5 % / magenta-pink 3.5 % / violet 2.6 % (approved inner rings
12.4 / 4.3 / 0.5; approved left walls incl. the washer rim 10.6 / 7.3 / 5.6).

Start view (f00, the approved camera) unchanged (the projector shows the approved pixels there): 0.03 % of tunnel pixels
differ by more than 8 levels. Gameplay, coins, camera, tunnel layout untouched (same course s / lat / coins in every shot).

## Files
`1_APPROVED.png`, `2_BEFORE_f06_your_camera.png`, `3_AFTER_f06_your_camera.png`, `zoom_*_x0-480_y380-860.png` (the
marked area, 2x), `frames/BEFORE_* / AFTER_*` (f00, f03, f10, f15, steer left / right), `clip_*` (moving view, BEFORE |
AFTER, Benny swimming + steering, 24 fps, slowed to inspect edges), `r21_rings_vs_70e5595.patch` (all code changes
against `70e5595`), `worker_wip_r20_unfinished.patch` (the r20 rings worker's unfinished sheen tune, set aside so BEFORE =
the user's picture), `rings21.mjs` (deterministic shot / clip tool: fixed sim steps + frozen clock, rings pixel-identical
run to run).

Query AFTER = preview query + `&m04rsoft=1&msaa=4`. Diagnosis view: `&m04dbg=1` (parts / sub-bands), `&m04dbg=2` (fade).
Code lives in worktree `/home/user/wt/s04b` (local branch `claude/rainbow-s04-ringtex-c22`, from `70e5595`, uncommitted —
snapshotted by the autosave into `backups/wip/claude__rainbow-s04-ringtex-c22/`); restore: check out `70e5595` and
`git apply r21_rings_vs_70e5595.patch`.
