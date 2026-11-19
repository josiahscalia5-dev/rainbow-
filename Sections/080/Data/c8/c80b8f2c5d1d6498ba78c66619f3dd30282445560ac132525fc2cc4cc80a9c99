# Screen 06 · Crest the Rinse Arch

**Candidate for owner review.** The rings turn to the right with the tunnel as Benny leaves the crest. The distant passage is easier to follow during forward travel.

Two connected circular bends carry the wall, its painted rings and end cap together. The first tight trial pushed the passage out of frame at +10. The revised first bend follows the measured right-hand sight line before the farther section turns away.

At +10, +20 and both hard turns, the distant rings sweep toward the right-hand passage. Claudia’s straight tunnel showed their centers stacked directly ahead. By the final approach the wall still encloses the river and the 07 handoff is preserved.

The pale patch under Benny at crest release, long cyan streaks and foam overlapping his lower body still need attention. Some distant rings remain repetitive.

**Interpretation for review.** The approved image establishes the rightward recession. The hidden bend radii and the depth at which the second section turns are reconstructed from the retained tube scale and gameplay camera.

RGB agreement at the approved pose was 79.086% before and 79.092% in the experiment. Pixelmatch counted 262,246 and 262,179 mismatches respectively over 1,327,104 pixels. The independent opening repeat changed 0 pixels. The before and new openings differed at 57,830 pixels.

The RGB agreement counts full-frame pixels whose mean absolute RGB difference is at most 20 on an 8-bit scale. Pixelmatch 7.1.0 uses a threshold of 0.1 and excludes antialias mismatches. Each moving pair uses the same game state, camera, steering and shader clock. The moving views have no photographed reference score.

The before image reproduces the retained specialist tip on the same renderer as the experiment. Claudia’s original archived captures and their paths are included separately. Claudia’s archived opening and the fresh before differed at 143,177 decoded pixels.

Both complete rides retained five hearts through the 06 to 07 handoff. Each clip spans 63 encoded frames at 12 fps. Both variants passed all eight existing gameplay assertions, collected 91 coins and advanced the total from 1,330 to 2,240. Hard-steer collision diagnostics are separate from the successful rides. Android phone frame times and thermal behavior still require a device test.

**Checkpoint** `claude/rainbow-s06-match-c17` at `c649fcbc35780e11cefce83eb54684f1d55752a5`. The isolated experimental source is `8a80c70d19b72cfaa6432c9a98f821d5a521c815` on `codex/s06-curved-rinse-arch`.

## Reproduce

Use this branch in an isolated checkout with its locked game dependencies. Start its Vite server on loopback with its usual project config. Run from the project root with Playwright 1.57 and a compatible Chromium executable available to Node. Set `RAINBOW_BASE_URL` to the local game URL and `RAINBOW_CHROMIUM` to the browser executable. The capture scripts write into their own evidence folder. A system FFmpeg is needed for H.264 clips.

```sh
node experiments/codex/06/reproduce/capture.cjs stills 06:BEFORE 06:NEW
node experiments/codex/06/reproduce/capture.cjs repeat 06:BEFORE
node experiments/codex/06/reproduce/capture.cjs ride 06:BEFORE 06:NEW
python3 experiments/codex/06/reproduce/analyze.py 06
```

The approved original, native opening and movement images, continuous clips, gameplay assertions, per-frame journey logs, GPU counts, comparison metrics and archived specialist evidence are in this directory.
