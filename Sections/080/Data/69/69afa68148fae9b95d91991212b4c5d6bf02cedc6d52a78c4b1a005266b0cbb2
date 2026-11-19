# Screen 05 · Flow into the Current

**Candidate for owner review.** The perforations read more clearly in close steered views. Their positions and the surrounding reflections stay in place.

A texture extracted from the retained washer wall records the dark inner edge and bright bevel of its photographed slots. During magnification the shader reads those details at Claudia’s existing bay coordinates.

At +3, the slot interiors have a darker edge against the purple metal. On a hard left, the same rows and highlights follow the curved wall. The earlier mirrored patch repeated a bubble and displaced several holes. That pass is archived as rejected.

Near the last bend the water still draws into long streaks, and the transition into the next specialist’s environment remains abrupt. This is a wall-detail improvement.

**Interpretation for review.** The unpictured close wall keeps the spacing of Claudia’s projected slot rows. The edge strength is bounded to 21 display-channel levels in the source atlas.

RGB agreement at the approved pose was 89.442% before and 89.442% in the experiment. Pixelmatch counted 119,454 and 119,454 mismatches respectively over 1,327,104 pixels. The independent opening repeat changed 0 pixels. The before and new openings differed at 0 pixels.

The RGB agreement counts full-frame pixels whose mean absolute RGB difference is at most 20 on an 8-bit scale. Pixelmatch 7.1.0 uses a threshold of 0.1 and excludes antialias mismatches. Each moving pair uses the same game state, camera, steering and shader clock. The moving views have no photographed reference score.

The before image reproduces the retained specialist tip on the same renderer as the experiment. Claudia’s original archived captures and their paths are included separately. Claudia’s retained transition pass saved end-of-stage views. Its matched opening was recaptured from that commit.

Both complete rides retained five hearts through the 05 to 06 handoff. Each clip spans 84 encoded frames at 12 fps. Both variants passed all eight existing gameplay assertions, collected 91 coins and advanced the total from 1,330 to 2,240. Hard-steer collision diagnostics are separate from the successful rides. Android phone frame times and thermal behavior still require a device test.

**Checkpoint** `claude/rainbow-s05-match-c17` at `f033f7cc895752907621f82fb9d6bee4899ac0e0`. The isolated experimental source is `c631d602ec63c3a5eefca6473cdfeff7613acf14` on `codex/s05-perforated-wall-bays`.

## Reproduce

Use this branch in an isolated checkout with its locked game dependencies. Start its Vite server on loopback with its usual project config. Run from the project root with Playwright 1.57 and a compatible Chromium executable available to Node. Set `RAINBOW_BASE_URL` to the local game URL and `RAINBOW_CHROMIUM` to the browser executable. The capture scripts write into their own evidence folder. A system FFmpeg is needed for H.264 clips.

```sh
node experiments/codex/05/reproduce/capture.cjs stills 05:BEFORE 05:NEW
node experiments/codex/05/reproduce/capture.cjs repeat 05:BEFORE
node experiments/codex/05/reproduce/capture.cjs ride 05:BEFORE 05:NEW
python3 experiments/codex/05/reproduce/analyze.py 05
```

The approved original, native opening and movement images, continuous clips, gameplay assertions, per-frame journey logs, GPU counts, comparison metrics and archived specialist evidence are in this directory.
