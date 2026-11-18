# Screen 04 · Through the Five Arrows

**Candidate for owner review.** The pink banks now sweep across the existing trough as Benny passes the arrows.

The retained painted band and its underlying pink colour follow the same curve in the 3D trough. The outer contact with the metal mouth stays fixed.

At forward +10 and in the hard turns, the cyan lane widens on one side and narrows on the other. The pink edge now travels around Benny instead of following two parallel lines. The five arrows and the entrance retain their placement.

Farther down, the copper corridor and repeated arrows still have less variation than the painted entrance. The separate gold-ring specialist remains a distinct checkpoint.

**Interpretation for review.** The artwork shows the near swirl. Its downstream wavelength and width follow the scale of the retained trough and require the owner’s judgment.

RGB agreement at the approved pose was 81.840% before and 81.840% in the experiment. Pixelmatch counted 223,529 and 223,529 mismatches respectively over 1,327,104 pixels. The independent opening repeat changed 0 pixels. The before and new openings differed at 0 pixels.

The RGB agreement counts full-frame pixels whose mean absolute RGB difference is at most 20 on an 8-bit scale. Pixelmatch 7.1.0 uses a threshold of 0.1 and excludes antialias mismatches. Each moving pair uses the same game state, camera, steering and shader clock. The moving views have no photographed reference score.

The standard coin-seeking 03–11 suite took one heart in Screen 04 on the retained checkpoint and the experiment. A separate full-game ride with the same coin targets and 0.85 units of wall clearance collected all 91 coins and finished at 2,240 with five hearts on both variants. The logged collision and complete intact-heart rides are in each variant directory.

The before image reproduces the retained specialist tip on the same renderer as the experiment. Claudia’s original archived captures and their paths are included separately. The separate gold-ring specialist’s saved opening is also available in Claudia’s archive. The scenery experiment begins at the Screen 04 scenery specialist’s tip. Claudia’s archived opening and the fresh before differed at 1,308,012 decoded pixels.

Both complete rides retained five hearts through the 04 to 05 handoff. Each clip spans 42 encoded frames at 12 fps. Both variants passed all eight existing gameplay assertions, collected 91 coins and advanced the total from 1,330 to 2,240. Hard-steer collision diagnostics are separate from the successful rides. Android phone frame times and thermal behavior still require a device test.

**Checkpoint** `claude/rainbow-s04-match-c17` at `ad5fbac592444e90fd1b53d62e7fa0b62391c032`. The isolated experimental source is `4c8a9bf762fe3fe0a350cc00d417c67b54f0b623` on `codex/s04-sweeping-waterbands`.

## Reproduce

Use this branch in an isolated checkout with its locked game dependencies. Start its Vite server on loopback with its usual project config. Run from the project root with Playwright 1.57 and a compatible Chromium executable available to Node. Set `RAINBOW_BASE_URL` to the local game URL and `RAINBOW_CHROMIUM` to the browser executable. The capture scripts write into their own evidence folder. A system FFmpeg is needed for H.264 clips.

```sh
node experiments/codex/04/reproduce/capture.cjs stills 04:BEFORE 04:NEW
node experiments/codex/04/reproduce/capture.cjs repeat 04:BEFORE
node experiments/codex/04/reproduce/capture.cjs ride 04:BEFORE 04:NEW
node experiments/codex/04/reproduce/capture.cjs full-safe 04:BEFORE 04:NEW
python3 experiments/codex/04/reproduce/analyze.py 04
```

The approved original, native opening and movement images, continuous clips, gameplay assertions, per-frame journey logs, GPU counts, comparison metrics and archived specialist evidence are in this directory.
