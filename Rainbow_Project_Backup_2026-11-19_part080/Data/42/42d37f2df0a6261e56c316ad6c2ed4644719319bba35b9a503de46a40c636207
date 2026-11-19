# Screen 07 · Dive the Washer Tube

**Candidate for owner review.** The third gold paddle now reads as a rounded metal piece during steering. Its photographed front and shaded underside stay on the same solid.

An editable 604-triangle paddle was fitted to the approved silhouette at Claudia’s existing wall station. Its left end meets the retained tube, and its surface uses the original painted gold and berry colours. When the new body exposed a second gold edge on the wall, a small patch from the same photographed washer bay supplied the missing wall surface.

At +10 the gold face stays continuous. During hard-right steering, Claudia’s larger block showed perforated wall marks across its face. The fitted object keeps its curved lip and darker underside. The archived material-only passes and the object-hidden diagnostic show where the earlier attempts failed. The saved plunge-lip, halfway, two-thirds, bottom and handoff frames are byte-identical to the retained build.

The magenta banks still straighten during steering and white sides still dominate parts of the plunge. Those changes overlap Claudia’s unfinished bank and plunge work. A small amber transition near the back of the paddle is easiest to inspect at +10.

**Interpretation for review.** The artwork establishes the visible paddle outline and highlights. Its hidden rear thickness of about 1.16 game units and the covered washer slots were reconstructed from the existing paddle station and neighbouring wall bay.

RGB agreement at the approved pose was 80.046% before and 80.046% in the experiment. Pixelmatch counted 249,370 and 249,372 mismatches respectively over 1,327,104 pixels. The independent opening repeat changed 0 pixels. The before and new openings differed at 1,348 pixels.

The RGB agreement counts full-frame pixels whose mean absolute RGB difference is at most 20 on an 8-bit scale. Pixelmatch 7.1.0 uses a threshold of 0.1 and excludes antialias mismatches. Each moving pair uses the same game state, camera, steering and shader clock. The moving views have no photographed reference score.

The before image reproduces the retained specialist tip on the same renderer as the experiment. Claudia’s original archived captures and their paths are included separately. Claudia’s archived opening and the fresh before differed at 1,316,055 decoded pixels.

Both complete rides retained five hearts through the 07 to 08 handoff. Each clip spans 147 encoded frames at 12 fps. Both variants passed all eight existing gameplay assertions, collected 91 coins and advanced the total from 1,330 to 2,240. Hard-steer collision diagnostics are separate from the successful rides. Android phone frame times and thermal behavior still require a device test.

**Checkpoint** `claude/rainbow-s07-match-c17` at `8651edf92525a9aab82b02fad9aa44621216708a`. The isolated experimental source is `851bf53f1ae7b21175c7d8fe727760b18a3f82ca` on `codex/s07-painted-paddle-face`.

## Reproduce

Use this branch in an isolated checkout with its locked game dependencies. Start its Vite server on loopback with its usual project config. Run from the project root with Playwright 1.57 and a compatible Chromium executable available to Node. Set `RAINBOW_BASE_URL` to the local game URL and `RAINBOW_CHROMIUM` to the browser executable. The capture scripts write into their own evidence folder. A system FFmpeg is needed for H.264 clips.

```sh
node experiments/codex/07/reproduce/capture.cjs stills 07:BEFORE 07:NEW
node experiments/codex/07/reproduce/capture.cjs repeat 07:BEFORE
node experiments/codex/07/reproduce/capture.cjs ride 07:BEFORE 07:NEW
python3 experiments/codex/07/reproduce/analyze.py 07
```

The approved original, native opening and movement images, continuous clips, gameplay assertions, per-frame journey logs, GPU counts, comparison metrics and archived specialist evidence are in this directory.
