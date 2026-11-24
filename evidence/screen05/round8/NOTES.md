# Screen 05 round 8 (2026-11-24, session da8aeec6, coordinator only) - evidence notes

- Stills: real Unity Game View, 864x1536, normal gameplay camera, Benny at s = 14.00, full rebuild, nothing shifted, cropped, rescaled or retouched.
- Scores (tools/screen05-measure.ps1, unchanged method; 100 = the same picture at identical pixel positions): see the table in the handoff.
- The recording is one continuous, unedited run of the real game (autopilot input through SwimInputOverride: coin line, hard left / right, jumps), HUD included.

What is measured from the approved picture (and how it is used): colour statistics of the water per streamline (colour ramp), its broad light pattern (low
resolution sheen, ~17 px) and the amount of foam in Benny's wake. The picture itself is NOT pasted anywhere: streaks, ripples, glints, lace, foam lumps,
bubbles, rings, walls, paddles, coins and Benny are real 3D geometry / procedural, moving textures in world space.

Motion check (AgentScripts/screen05_motion_strip.cs, 30 fps steps, hard left / right + jumps): largest single-frame changes
| | before round 8 | round 8 |
|---|---|---|
| playable stretch | s 14 -> 68 (5 s, then the run ended) | s 14 -> 466 (~41 s) |
| heading step per frame | 6.8 deg | ~3.1 deg |
| lean step per frame | 5.0 deg | ~1.9 deg |
| camera yaw step per frame | 0.38 deg | ~0.32 deg |
| swimming over foam / dry floor | yes (hard right) | no (river-bank limits) |
| end of a run | stops after 5 s | finish panel at s 466 |

Known limits (honest): Benny's model is painted for the rear view (no legs, plain front), so turns stay within about 22 degrees; two small feet were added (hidden
under water, visible in jumps). ~26-30 fps at 1080x1920 in the Editor on this Intel N150 laptop (GPU-bound; adaptive resolution helps). The far end of the
river (last ~20 px before the throat) does not follow the painted, physically impossible swing exactly.
