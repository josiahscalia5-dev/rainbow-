# Screen 06 candidate: scoped bounds and tunnel-wall crop

Status: implementation and mathematical checks complete; visual and gameplay review pending. This is an opt-in candidate, not an approved replacement.

## Candidate switches

`CANDIDATE_QUERY.txt` contains the restored round-29 `QUERY_NEW_FINAL` parameters plus:

- `m06bounds=1`: use the existing rendered water's width for steering limits through Screen 06.
- `m06wallcrop=0.48,0.76`: sample a narrower region of the existing tunnel-wall tile, with repeat density compensation.
- `m06pad=1`: enable the existing modeled wall paddles. No paddle geometry was added or extended.

Neither new switch is enabled by default. The review harness's default query has not been changed.

## What changed

`src/world/course.ts` adds `playableWidthAt(s)`. It leaves `widthAt(s)`, the course spline, frames, stage positions and geometry builders unchanged. The new helper is active only with `m06bounds=1`, a Screen 06 match enabled, `m06geo=1`, and without legacy `m06v=2`. The target width comes from `2 * proj06.tiles.r6.Wc`, currently 4.6 units. Cubic smoothstep blends from the existing width over the final 6 units of Screen 05, holds the target throughout Screen 06, and releases it over the first 6 units of Screen 07. It never widens a narrower existing channel.

`src/game/Game.ts` uses that helper for the existing steering limits. Steering acceleration, the 0.55-unit center clamp margin, the 0.75-unit edge margin, collision response and coin logic are unchanged. Inside Screen 06, the center clamp is therefore ±1.75 units and the existing edge threshold is ±1.55 units.

`src/world/match06.ts` adds a validated `m06wallcrop=lo,hi` parser and an optional wall-material uniform. Only the existing tunnel mesh receives the enabled uniform. Floors, rings, paddles and the end cap keep the uniform disabled. The existing `m06tswap=1` or `2` crop path must also be active; the supplied query retains `m06tswap=2`. UV orientation, projection, texture files, lighting, haze and color processing are unchanged.

The default sampling expression remains in the disabled branch. For a valid crop the repeat multiplier is `0.70 / (hi - lo)`, so the local texture-coordinate slope remains 0.70, preserving the previous slot-detail density away from mirrored repeat folds. The proposed 0.48–0.76 crop uses a multiplier of approximately 2.5. Missing or invalid values fall back to disabled behavior. Valid inputs require exactly two finite nonempty values, `0 <= lo < hi <= 1`, and a span of at least 0.05, allowing floating-point rounding at that boundary.

## Checks completed

- `npm run typecheck` passed.
- A pre-edit snapshot of the restored baseline's course, legacy widths, stage data, marks and 91 coin definitions was compared with the same data after the edits. All 4,131 sampled positions and their position/tangent/up/right vectors matched exactly. The serialized snapshot SHA-256 is `e021525da58e045af6779e6c2ac3f97e87e17b5bebaf08d557587ebf25c761fa` before and after. Enabling the new bounds flag also leaves this original geometry and coin snapshot identical.
- With the flag absent or `m06bounds=0`, the new helper exactly returned `widthAt(s)` at every sampled position. It also did so with `m06geo` absent, legacy `m06v=2`, or the Screen 06 match absent.
- With the candidate bounds enabled, the helper returned 4.6 units throughout sampled Screen 06 positions and the exact original width outside the two transition regions. All sampled widths were positive, finite and no larger than the original width.
- Entry and exit blend endpoints were checked at ±0.0001 units. The maximum difference between the two one-sided numerical slopes was approximately 0.0000671; the cubic blend has zero derivative at its endpoints. Screen 06 spans `s = 188.90987977543344` through `312.7276395545496` in this baseline.
- All 18 Screen 06 coin centers remain inside the new lateral clamp. Their lateral range is approximately −1.594721 to +0.4 units, including the three pre-checkpoint coins. The closest permitted lateral position has zero gap to each coin center, so the existing 1.25-unit lateral pickup threshold remains sufficient mathematically. No coin positions were changed.
- The actual crop parser passed 13 missing/invalid-input cases and three valid-range cases. Each valid range preserved `(hi - lo) * repeat = 0.70` to floating-point tolerance.

The numerical audit was run with Vite Node, without a browser or renderer. Temporary audit inputs and JSON results are in the parent scratch directory, outside the game repository.

## Limits and required review

These checks establish the bounds formula, the parameter guards and unchanged baseline geometry. They do not demonstrate an improved picture, pixel-identical disabled rendering, comfortable steering, all 91 coins collected in gameplay, shader compilation on a GPU, or uninterrupted passage into Screen 07. No new gameplay captures were produced for this change.

The width blend deliberately affects gameplay bounds in the final 6 units of Screen 05 and the first 6 units of Screen 07; it does not change the scenery there. Hard steering still uses the existing edge-contact behavior. That contact must be reviewed in real gameplay.

The wall crop uses existing pixels. It does not restore missing views, add the approved water swirls, change the slide route, adjust the camera, improve Benny, or guarantee removal of every gold-colored wall pixel. The mirrored repetition and material appearance must be judged in a rendered moving view. The unchanged projection may conceal the crop near the original approved viewpoint.

The next review should use the candidate query and the preserved baseline at matching positions, including the crest, middle, late section, held left/right steering and the real Screen 06-to-07 crossing. Keep or revise the candidate based on that visible result. No visual match percentage has been assigned.
