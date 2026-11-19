# Screen 06 crest geometry

The original is `references/06_crest_the_rinse_arch.png`. Its native size is 864 × 1536. Its SHA-256 is `3946058c0893e97a99dd5015f3197901859475cd7ef55e09d982d232951441fe`. The project uses its fixed 62° camera. The artwork shows a cyan and magenta arm curling over purple slots and then descending toward the gold-ringed right passage. The game camera, simulation route and character were held fixed in this experimental branch.

## Donor geometry

Blender ray intersections identified the central mismatch in the previous arched washer candidate. At original pixel (390,650), the nearest opaque mesh was the water at 9.2 units. The slotted return was 21.4 units away. At (492,672), water was at 8.8 units and the washer metal at 82.9. Material-painted pixels on the nearer mesh produced the purple opening. At (360,525), where the artwork shows the upper water arm, the nearest mesh was the drum 68.4 units away. No corresponding water arm existed on that ray. The accompanying `donor-ray-intersections.txt` covers the approved opening, +1.1, +3 and +6. The original capture protocol and source layout are in the previous Codex arched passage branch.

## Rejected foreground cut

Trial 1 modeled an actual recessed purple liner behind a wet surface where the native rays hit the foreground water. The curve registered at the original camera. At +3 it read as a small lavender wedge at Benny's right elbow. By +6 it showed a large lavender metal patch beneath his wake. The standalone archived cut implementation remains in `rejected-foreground-cut/openCrest06.ts` for recovery. Its geometry is excluded from the final trial.

## Outboard folded water arm

The second trial retains the entire wet floor. `src/world/openCrest06.ts` builds the missing outward returning arm and the perforated casing immediately beneath it. The survey registers the far and near edges on the original artwork then converts the two traces to independent world splines at metric depths along the left washer shoulder. The run extends downstream toward the gold passage. A rounded cross section and distance-based UVs give the wet upper arm volume and flowing highlights. The casing descends behind the rolled edge. The central ride surface has a smooth depression of at most 0.27 units that tapers to zero outside the first crest. The cut and its liner were removed completely.

Real renderer IDs are `m06_crest_upper_water`, `m06_crest_outer_soffit` and `m06_arched_water`. The active flags include `cx06ArchedPassage=1&cx06OpenCrest=1` alongside Claudia’s Screen 06 specialist flags. Geometry, UVs and bounds stay in world coordinates at all viewing angles. The donor’s locked original texture registration is retained. New hidden surface depths are proposals for the owner to judge from the moving images. The unchanged character and gameplay path provide a control when comparing experiments.
