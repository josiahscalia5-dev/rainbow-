# Screen 05 — Flow Into the Current

Inspect the final S-bend between 5.4 and 6.7 seconds. Watch the length of highlights in the cyan channel and the sharpness of the nearby purple wall. The rejected highlight trial leaves uneven blue streaks.

## Start with these full-size pictures

1. [APPROVED | Original artwork](APPROVED_ORIGINAL.jpg)
2. [CLAUDIA BEFORE | Retained opening](CLAUDIA_RETAINED/opening.webp)
3. [CODEX NEW | rejected opening](CODEX_REJECTED_Final_Bend_Highlights/opening.webp)

Open each picture individually at its native resolution. The films below are from the playable Three.js renderer.

## Watch the complete swim

- [Claudia retained swim](CLAUDIA_RETAINED/ride.mp4)
- [Codex rejected swim](CODEX_REJECTED_Final_Bend_Highlights/ride.mp4)

## Inspect movement

| Matched camera view | Claudia retained | Codex test |
| --- | --- | --- |
| Inlet | [Before](CLAUDIA_RETAINED/inlet.avif) | [New](CODEX_REJECTED_Final_Bend_Highlights/inlet.avif) |
| Forward +3 | [Before](CLAUDIA_RETAINED/forward-03.avif) | [New](CODEX_REJECTED_Final_Bend_Highlights/forward-03.avif) |
| Forward +6 | [Before](CLAUDIA_RETAINED/forward-06.avif) | [New](CODEX_REJECTED_Final_Bend_Highlights/forward-06.avif) |
| Forward +10 | [Before](CLAUDIA_RETAINED/forward-10.avif) | [New](CODEX_REJECTED_Final_Bend_Highlights/forward-10.avif) |
| Forward +20 | [Before](CLAUDIA_RETAINED/forward-20.avif) | [New](CODEX_REJECTED_Final_Bend_Highlights/forward-20.avif) |
| Middle | [Before](CLAUDIA_RETAINED/middle.avif) | [New](CODEX_REJECTED_Final_Bend_Highlights/middle.avif) |
| Hard-left steering | [Before](CLAUDIA_RETAINED/hard-left.avif) | [New](CODEX_REJECTED_Final_Bend_Highlights/hard-left.avif) |
| Hard-right steering | [Before](CLAUDIA_RETAINED/hard-right.avif) | [New](CODEX_REJECTED_Final_Bend_Highlights/hard-right.avif) |
| Last left bend | [Before](CLAUDIA_RETAINED/last-left-bend.avif) | [New](CODEX_REJECTED_Final_Bend_Highlights/last-left-bend.avif) |
| Last right bend | [Before](CLAUDIA_RETAINED/last-right-bend.webp) | [New](CODEX_REJECTED_Final_Bend_Highlights/last-right-bend.webp) |
| Deep | [Before](CLAUDIA_RETAINED/deep.avif) | [New](CODEX_REJECTED_Final_Bend_Highlights/deep.avif) |
| Final approach | [Before](CLAUDIA_RETAINED/last-in-stage.avif) | [New](CODEX_REJECTED_Final_Bend_Highlights/last-in-stage.avif) |
| Stage transition | [Before](CLAUDIA_RETAINED/across-transition.avif) | [New](CODEX_REJECTED_Final_Bend_Highlights/across-transition.avif) |

## How the opening was measured

89.44% of pixels in Claudia’s opening have a mean absolute RGB difference of 20 or less on a 0–255 scale against the original at 864 × 1536. This statistic describes the approved camera position. For hidden parts of the course, inspect shape, depth, materials, occlusion and continuity in motion. The detailed report includes Pixelmatch results and camera checks. [Native measurements](../../05_REVIEW_RECORDS/Screen_05/Final_Bend_Highlights/measurements/matched-gameplay-and-opening.json)

## Saved experiments

### Final Bend Highlights · rejected

The last S-bend still smears and the new shading breaks up the blue water unevenly.

Branch codex/s05-anchored-bend-highlights at 3c8e9812b6ce3b3895a8616ec338999469ffbed2. Claudia’s baseline for this comparison is claude/rainbow-s05-match-c17 at f033f7cc895752907621f82fb9d6bee4899ac0e0.

Compare the last-left-bend and last-right-bend images and the 5.4–6.7 second section of the ride. The blue near water, the right-side foam and the far water past the turn are visible together here.

[Original](APPROVED_ORIGINAL.jpg) · [Claudia opening](CLAUDIA_RETAINED/opening.webp) · [Codex opening](CODEX_REJECTED_Final_Bend_Highlights/opening.webp)

[Claudia complete swim](CLAUDIA_RETAINED/ride.mp4) · [Codex complete swim](CODEX_REJECTED_Final_Bend_Highlights/ride.mp4)

- Last right bend — [Claudia](CLAUDIA_RETAINED/last-right-bend.webp) · [Codex](CODEX_REJECTED_Final_Bend_Highlights/last-right-bend.webp)

[Experiment report](../../05_REVIEW_RECORDS/Screen_05/Final_Bend_Highlights/REPORT.md)

### Earlier final bend river uv · rejected

REJECTED as the final-bend correction. Keep Claudia’s retained water and the earlier wall candidate.

Branch codex/s05-final-bend-river-uv at 232f0272f4cab935fee5365f88cbee9a5c9a55b1. Claudia’s baseline for this comparison is claude/rainbow-s05-match-c17 at f033f7cc895752907621f82fb9d6bee4899ac0e0.

[Original](APPROVED_ORIGINAL.jpg) · [Claudia opening](CLAUDIA_RETAINED/opening.webp) · [Codex opening](Earlier/Previous_s05-final-bend-river-uv/CODEX_NEW/opening.webp)

[Claudia complete swim](CLAUDIA_RETAINED/ride.mp4) · [Codex complete swim](Earlier/Previous_s05-final-bend-river-uv/CODEX_NEW/ride.mp4)

- Last right bend — [Claudia](CLAUDIA_RETAINED/last-right-bend.webp) · [Codex](Earlier/Previous_s05-final-bend-river-uv/CODEX_NEW/last-right-bend.avif)
- Hard-left steering — [Claudia](CLAUDIA_RETAINED/hard-left.avif) · [Codex](Earlier/Previous_s05-final-bend-river-uv/CODEX_NEW/hard-left.avif)
- Hard-right steering — [Claudia](CLAUDIA_RETAINED/hard-right.avif) · [Codex](Earlier/Previous_s05-final-bend-river-uv/CODEX_NEW/hard-right.avif)

[Experiment report](../../05_REVIEW_RECORDS/Screen_05/Previous_s05-final-bend-river-uv/REPORT.md)

Earlier studies and additional camera positions appear in the complete [media index](../../05_REVIEW_RECORDS/MEDIA_INDEX.csv). Each row identifies the source commit and disposition. The original artwork is the approved target. Moving views shown here await the owner’s judgment.
