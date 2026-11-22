# Round 45 — resume here (2026-11-22, session branch `ccr-c1b272d2-3ru7yx`, continues round 44 `ccr-0bbd5b9d-js1cpg`)

## User orders this round (binding, verbatim essentials)
1. "Finish Screen 05 and Screen 06 properly before continuing major reconstruction work on the others" — S-river with thick cyan/pink currents,
   purple walls, gold rings, bubbles, foam; beautiful while Benny swims/turns, also outside the original picture; a real 3D tunnel.
   06: Benny genuinely on the curved water (incline + banking), partly immersed, fully visible, splash/wake on his real position, camera without
   clipping / leaning / size jumps; 05 → 06 without stopping, teleporting, page load or scale change; gray test then artwork; recordings; APK.
2. (second message, binding) "upgrade our existing Blender Screen Builder into a faster, reusable, automated reconstruction pipeline … incremental
   … cache unchanged assets and texture bakes … automate visual checks before full recordings … previews of beginning, middle, curves and end incl.
   left and right steering … show before-and-after results, the actual time spent on each reconstruction step, and continuous playable gameplay".
3. (third) "add the measurements" — a way to know the scenery matches the approved screen WHILE Benny swims (see §3), "and do the recording and APK".
4. "While I'm waiting, can you do the other screens?" -> answered: 04 + 07 are rebuilt automatically by the world builder (new materials);
   08, 09, 10 need their own fit scripts first -> NEXT after the 05/06 deliverables.

## 1. What was built (all free tools; no credits)
| file | what |
|---|---|
| `tools/screenkit/build.py` | incremental cached builder per screen: depth -> fit -> layout -> segment -> gnlib -> geometry -> assemble -> bake -> preview, each step keyed on the SHA-256 of exactly its inputs (cache `~/.cache/rainbow-build`), timed (`build_report.md`) |
| `tools/screenkit/gn_assets.py` | the Geometry Nodes ASSET LIBRARY (`rainbow_gn_assets.blend`, marked as Blender assets): RB_PerforatedDrum, RB_WaterChannel, RB_ChannelBody, RB_Band, RB_GoldRing, RB_FoamBank v2 (cumulus clusters), RB_WallTray, RB_MachineryRow |
| `tools/screenkit/blender_kit.py` | now loads the asset library; `GEOM_KEYS` = the only layout keys that re-run Blender; new keys `machinery`, `foam_style`, `foam_banks`, `foam_pool_from` |
| `tools/screenkit/bake.js` | the bake moved out of screen.html (cache key) + ARTWORK-SAMPLED MATERIALS: ring / tray templates fused from every ring / tray the picture shows (best sample per texel via depth = 1 - quality), drum-wall PERIOD template phase-locked to the rings (gold/copper gate, unseen angles + rows mirrored from painted ones), flowing water / pool / flume SWATCHES (seamless along the flow) |
| `tools/screenkit/plate_clone.py` | the small holes of the clean plate (painted coins, bubbles) clone-filled from the same painting + Poisson blend (no ghost discs); mask value 128 = trusted |
| `tools/screenkit/preview.cjs` + `preview_sheet.py` | AUTOMATED PREVIEW CHECK: picture view(s) first, begin / quarter / middle / three-quarter / sharpest curves / end x left / centre / right lanes (real swipe input), gray geometry pass, green-sentinel holes, Benny in frame + size, camera clearance, water gap, likeness, contact sheet, PASS/WARN/FAIL |
| `tools/screenkit/qa.js` | QA views: `qaRepeatView(k)` (the approved camera k ring spacings further down: scored against the picture), `qaIdPass` (which pixel is wall / ring / water / foam / trays -> per-surface colour + detail match while swimming) |
| `tools/world/build_world.py` | cached ONE-world builder (04, 05, 06, 07 via build.py; section; layout; connectors cached; files; previews) |
| `tools/world/world.html` | templates on every kit area + connectors (wall period along connector tubes, ring band, river swatch); start buttons 04 / 05 / 06 in play mode; `?return=1` hands back to the game at 08 |
| `tools/world/build_world_app.sh` + `src/game/bonusRoute.ts` (WORLD_ROUTE) + `src/game/Game.ts` | the world in the app: `VITE_RAINBOW_WORLD=1` (or `?world=1`): opening videos -> world 04 -> A -> B -> 05 -> 06 -> 07 -> game at the 08 checkpoint. Default game unchanged |
| `tools/reflock/section_run.cjs` | `FRAMEQA=1`: camera clearance, water gap, immersion, tilt, Benny size per frame in the recording checks |
Fixed on the way: Blender 5 copies a node group's inputs into the modifier when it is CREATED (the old builder's first foam bank was one lump,
the first tray / ring got the previous sizes); three.js autoClear wiped every fused draw but the last; the export's wait was commented out.

## 2. Numbers (412 x 915, scenery px within 20 levels of the approved picture; HUD / Benny / coins masked out)
| | before (r44) | now (r45) |
|---|---|---|
| 05 picture view, own page | 81.2 % (pre-baked) | 81.7 % |
| 05 picture view, in the world | 80.6 % | 80.7 % |
| 06 picture view, in the world (scaled) | 82.0 % | 85.0 % |
While swimming (round 45 metrics, world, 18 stills each): surface style match 05 walls 84.7 / rings 63.3 / water 53.3 / foam 19.3 / trays 93.5;
06 walls 87.5 / rings 55.3 / water 55.3 / foam 19.9 / trays 94.2. Repeated approved camera (k = 1..12 rings further): 05 mean 23 %, 06 mean 16 %
(the water dominates: the river beyond the painted stretch is not the painted S yet). Holes: 05 5 px in one still, 06 0.
Build time: old method per rebuild 05 29.9 s, 06 44.4 s (everything re-ran); new: cold 05 ~66 s incl. templates + preview, cached no-change < 1 s,
a look-only change re-runs nothing heavy, a bake-code change re-runs only the bakes (world: 347 s for 4 areas + 2 previews).
Evidence: `qa/kit45/` (README when written).

## 3. Next, in order
1. Finish the deliverables: recordings `qa/kit45/run/` (textured + gray, 05 -> 06, real touch), APK, before/after sheets, timing table, README.
2. In-motion look (the measured gap): water beyond the painted stretch (painted S along the whole river, pink bands), foam banks matching the painted
   foam (style 19 %), ring template detail (55-63 %); 06 crest banking / camera lean review in the recording.
3. Then 08, 09, 10 with the kit (fit scripts from their approved pictures), 07 -> 08 descent.
Rebuild everything: `python3 -I tools/world/build_world.py <ws> --preview 05,06` (first run ~6 min, later runs reuse the cache).

## Round 45b (user: "keep going until my screens look almost very close to my approved screens, ~90 %; fix anything messy") — see qa/kit45/README.md
Done: ribbon water (05 default: layout water_style 'ribbon'; ?water=paint = old swatch), painted detail tiles, cam_axis camera (05), far glow, bubbly
foam, bank foam / bubbles beyond the painted stretch, 06 benny_bank 0.35 + cam_roll 0.15, hi-res paint source, max-quality bake export.
05 83.1 % / 06 84.8 % at the picture camera. NEXT: 06 rainbow crest edges along the whole level (ribbon variant with the 06 rainbow band order),
water richness close up, top-of-frame detail (bake resolution for the near tunnel segments), then 07 / 08 / 09 / 10 with the same pipeline.
RULE learned: never put a `//` comment in the middle of a one-line JS statement list (three bugs this round) - use /* */.
