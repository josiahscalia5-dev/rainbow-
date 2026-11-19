# Screen 08 · Final Spin Chamber

**Candidate for owner review.** The foreground current now turns under Benny while the door, towel, platform and spouts hold their positions.

The near-water texture follows the heading of Claudia’s retained river and sweeps within its existing width. The outside water contacts, physical floor and chamber objects keep their recorded positions.

At +6 and +10, and especially on hard left, the broad magenta bank curves back around Benny. Claudia’s retained foreground showed a straighter strip. The chamber opening is pixel-identical.

Glossy cyan still stretches at +3, and the near pink bank can dominate the lower frame. The two full-steer collision poses each cost one heart in both builds. The successful inlet-to-exit rides retain all five.

**Interpretation for review.** The reference fixes the chamber layout and river at the opening. The shorter interior water bends downstream were inferred from the existing traced channel.

RGB agreement at the approved pose was 84.086% before and 84.086% in the experiment. Pixelmatch counted 197,021 and 197,021 mismatches respectively over 1,327,104 pixels. The independent opening repeat changed 0 pixels. The before and new openings differed at 0 pixels.

The RGB agreement counts full-frame pixels whose mean absolute RGB difference is at most 20 on an 8-bit scale. Pixelmatch 7.1.0 uses a threshold of 0.1 and excludes antialias mismatches. Each moving pair uses the same game state, camera, steering and shader clock. The moving views have no photographed reference score.

The before image reproduces the retained specialist tip on the same renderer as the experiment. Claudia’s original archived captures and their paths are included separately. Claudia’s archived opening and the fresh before differed at 140,600 decoded pixels.

Both complete rides retained five hearts through the 08 to 09 handoff. Each clip spans 22 encoded frames at 12 fps. Both variants passed all eight existing gameplay assertions, collected 91 coins and advanced the total from 1,330 to 2,240. Hard-steer collision diagnostics are separate from the successful rides. Android phone frame times and thermal behavior still require a device test.

**Checkpoint** `claude/rainbow-s08-scenery-c17` at `3c0fa97090afb2c0fca41898774db7247e23e522`. The isolated experimental source is `4e68fa16d3e3cdf3350f0c3f561cbe705375a55e` on `codex/s08-curved-chamber-current`.

## Reproduce

Use this branch in an isolated checkout with its locked game dependencies. Start its Vite server on loopback with its usual project config. Run from the project root with Playwright 1.57 and a compatible Chromium executable available to Node. Set `RAINBOW_BASE_URL` to the local game URL and `RAINBOW_CHROMIUM` to the browser executable. The capture scripts write into their own evidence folder. A system FFmpeg is needed for H.264 clips.

```sh
node experiments/codex/08/reproduce/capture.cjs stills 08:BEFORE 08:NEW
node experiments/codex/08/reproduce/capture.cjs repeat 08:BEFORE
node experiments/codex/08/reproduce/capture.cjs ride 08:BEFORE 08:NEW
python3 experiments/codex/08/reproduce/analyze.py 08
```

The approved original, native opening and movement images, continuous clips, gameplay assertions, per-frame journey logs, GPU counts, comparison metrics and archived specialist evidence are in this directory.
