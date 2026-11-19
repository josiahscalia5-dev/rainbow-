# Screen 06 — Crest the Rinse Arch

Read [the experiment result](RESULT.md) for the visible changes, remaining problems and gameplay checks. This review compares Claudia’s retained game with an isolated branch. Owner approval is required for promotion.

## Three full-size opening images

1. [APPROVED — original Screen 06 artwork](APPROVED/SCREEN06_APPROVED.jpg)
2. [CLAUDIA BEFORE — retained playable opening](CLAUDIA_BEFORE/opening.png)
3. [CODEX NEW — experimental playable opening](CODEX_NEW/opening.png)

In the original, follow the foam around the left crest, the purple opening underneath the water, and the gold tunnel as it bends to the right. Use the moving images to judge whether these shapes remain physically connected as Benny swims.

| Position | Claudia before | Codex new |
| --- | --- | --- |
| Inlet | [Image](CLAUDIA_BEFORE/inlet.png) | [Image](CODEX_NEW/inlet.png) |
| Forward +3 | [Image](CLAUDIA_BEFORE/forward-03.png) | [Image](CODEX_NEW/forward-03.png) |
| Forward +6 | [Image](CLAUDIA_BEFORE/forward-06.png) | [Image](CODEX_NEW/forward-06.png) |
| Forward +10 | [Image](CLAUDIA_BEFORE/forward-10.png) | [Image](CODEX_NEW/forward-10.png) |
| Forward +20 | [Image](CLAUDIA_BEFORE/forward-20.png) | [Image](CODEX_NEW/forward-20.png) |
| Hard left | [Image](CLAUDIA_BEFORE/hard-left.png) | [Image](CODEX_NEW/hard-left.png) |
| Hard right | [Image](CLAUDIA_BEFORE/hard-right.png) | [Image](CODEX_NEW/hard-right.png) |
| Crest release | [Image](CLAUDIA_BEFORE/crest-release.png) | [Image](CODEX_NEW/crest-release.png) |
| Middle | [Image](CLAUDIA_BEFORE/middle.png) | [Image](CODEX_NEW/middle.png) |
| Deep tunnel | [Image](CLAUDIA_BEFORE/deep.png) | [Image](CODEX_NEW/deep.png) |
| Arch exit | [Image](CLAUDIA_BEFORE/arch-exit.png) | [Image](CODEX_NEW/arch-exit.png) |
| Final approach | [Image](CLAUDIA_BEFORE/last-in-stage.png) | [Image](CODEX_NEW/last-in-stage.png) |
| Across the stage transition | [Image](CLAUDIA_BEFORE/across-transition.png) | [Image](CODEX_NEW/across-transition.png) |
| Continuous swim | [MP4](CLAUDIA_BEFORE/ride.mp4) | [MP4](CODEX_NEW/ride.mp4) |

The opening reference is the original 864 × 1536 image. The full-size stills show the real Three.js renderer at 864 × 1536. The videos show continuous game updates at a fixed 60 ticks per game second, sampling 12 images per second at 648 × 1152. Frame times, controls and captured game state are saved beside the media. The approved original establishes the opening viewpoint. The owner can separately accept or reject the design of any moving view.

## Provenance and reproduction

Claudia’s retained scene is `claude/rainbow-s06-match-c18` at `c649fcbc35780e11cefce83eb54684f1d55752a5`. The experimental parent is `codex/s06-arched-washer-passage` at `94c36531af3cce486a252e56f75b81595536ad96`. The new branch is `codex/s06-open-crest-channel`. The reference image bytes match `references/06_crest_the_rinse_arch.png` and its entry in `scripts/reference.sha256`.

See [restore and capture instructions](RESTORE_AND_CAPTURE.md) to run the real game or [open the file inventory](SHA256.json) to verify the downloaded ZIP. The ZIP includes the source overlay at its original paths below `SOURCE_OVERLAY/`.

The final editable Blender scene and its registration checks are under [editable/](editable/README.md). A separate [record of the geometry tests](diagnostics/geometry-evidence.md) explains the first cut that failed. Its meshes and diagnostic renders stay in `rejected-foreground-cut/`. The signed Android review APK and self-contained playable web build are separate phone downloads in the [private playable folder](https://github.com/josiahscalia5-dev/rainbow-/tree/codex/s06-open-crest-channel/experiments/codex/s06-open-crest-channel/playable).
