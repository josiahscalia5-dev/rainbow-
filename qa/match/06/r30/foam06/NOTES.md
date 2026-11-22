# Round 30b — foam06 (foam-bubbles-particles): Screen 06 foam, bubbles and splash ring WHILE Benny swims

Worktree `/home/user/wt/foam06`, LOCAL branch `claude/rainbow-s06-foam06-c32`; nothing committed, pushed or merged. `npx tsc --noEmit -p .` is clean.

## Query addition
**`&f30=1`** added to `qa/match/06/r30/QUERY_NEW_v2.txt` (= BEFORE). It switches on all three parts. Each part also has its own switch:
* `&f30bank=1`: bubbly foam heaps along both banks plus a soft froth strip over the floor's bank band. The old `m06fclu`/`m06foam` puffs are hidden while it is on.
* `&f30bub=1`: large iridescent soap bubbles. There are 30 big and 34 small ones along the slide, and 10 large ones in a short window right beside Benny.
* `&f30ring=1`: a lacy white crown ring around Benny with a beaded edge, two thin drifting ripple rings and flicking droplets.

Tuning knobs (defaults in brackets):
* Heaps: `f30bs` size [1], `f30bn` lobe density [1], `f30bg` gap chance [0.12], `f30bc`/`f30bl` heap/lobe on-screen caps [0.24/0.065], `f30strip=0` turns the froth strip off.
* Bubbles: `f30bbn`/`f30bsn`/`f30bnn` counts [30/34/10], `f30bbs` size [1], `f30bcap` on-screen radius cap [0.062 of the half-height, about 95 px diameter at 1536], `f30bw` window [46 u].
* Ring: `f30rr`/`f30rw` ring radius/width [0.66/0.26 u].

## Files changed (f30 only; patch `f30_foam06.patch`, file copy `m06foam30.ts.snapshot`)
* NEW `src/world/m06foam30.ts` (self-contained, 543 lines). Without an f30 switch, `buildFoam30()` returns null and nothing is built.
* `src/game/Game.ts`: 4 lines (an import, the build + `scene.add` after the m06 depth bake, and one `f30.update(...)` per sim step right after the m06 setAway/splash block). `match06.ts` is untouched.

## Measured
* **Approved START view is unchanged.** NEW `a_start` vs BEFORE `a_start`: 99.9986 % of pixels identical (18 of 1,327,104 pixels differ, probably the wall-clock-driven water). The f30 group is hidden until match06 `away() > 0.5` and then grows in.
* **Cost** at s 266 (SwiftShader, 432×768): 8,489 instanced foam lobes (one draw plus one soft-rim draw), a 7,632-vertex froth strip, 74 bubbles (one instanced draw), the ring and 44 droplets.
  * Triangles: 382k → 432k (+13 %).
  * Draw calls: about +6 (58 → ~64). The first measurement carried a one-time ~38-call artefact, so it showed 102.
  * Every heap is capped as one unit on screen (no giant occluding blobs). Lobes under about 1 px are dropped. Heaps beyond 55–75 u collapse. Bubbles are recycled from a fixed pool with no per-frame allocation, fade near the camera and never cover Benny.
* I made no likeness percentages; the pixel-change share between BEFORE and NEW is dominated by the river's wall-clock animation, so it is not used.

## Stills (`stills/`, full size, labelled) + overview
`stills/<pos>_1_APPROVED.png | _2_BEFORE_v2.png | _3_NEW_f30.png` for start, marked (214.86), 238, 266, 310 and 387. The APPROVED target is the approved picture for start/marked and storyboard panels 1–4 for 238/266/310/387. Overview sheet: `OVERVIEW_APPROVED_BEFORE_NEW.jpg`. Raw renders: `before_v2/`, `before_v2b/`, `new/`.

## Honest verdict
Clearly closer to the four panels for the foam and bubbles.
* **Banks:** where the v2 query had thick rows of separate white beads and ribbed lilac "foam walls", they are now continuous soft heaps of soap-bubble lobes in many sizes. The lobes are lavender with white tops, have glossy windows and defined rims, and carry a faint iridescent edge.
  * Diagnosis: the bead rows and ribbed walls were the floor's own bank band texture (`m06_floor`, tile_foam6, lateral 2.3–3.6 u) showing between the old puffs. The froth strip covers that band.
* **Bubbles:** large rainbow-rimmed bubbles now float beside Benny and along the slide, as in the panels.
* **Ring:** Benny now has a visible lacy white crown in the water, with ripple rings.

## What still differs
* **Near corners:** the panels' big foam clusters in the lower corners are not in frame. With the current camera the banks at Benny's depth sit just outside the frame edges, so this depends on the lead's framing. I did not put foam on the water to fake it.
* **Lobe shading:** the painted spheres are a little more translucent and glossy than mine. The froth strip's small cells foreshorten into flat ellipses at grazing angles.
* **Ring shape:** the panels show a crisper scalloped crown edge.
* **Approved view:** at the approved view the old m06 foam remains, but it is invisible there anyway because the projected picture covers it.
