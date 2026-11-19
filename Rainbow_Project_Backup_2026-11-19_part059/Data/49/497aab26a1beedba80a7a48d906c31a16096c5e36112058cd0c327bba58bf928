# Screen 07 Image2Blender experiment

**Verdict.** Image2Blender reconstructed an editable section of both magenta banks and nearby foam. The revised playable preview improved bank width during forward travel. Both hard turns still expose a straight pink strip beneath Benny. The test is rejected for promotion into gameplay. Claudia’s existing implementation remains the gameplay baseline. Owner review is pending.

## Source and scope

The base is Claudia’s `claude/rainbow-s07-match-c17` at `8651edf92525a9aab82b02fad9aa44621216708a`. The change since the earlier audit was a saved gameplay clip and its capture script. All experiment-specific files live under `experiments/image2blender/s07-magenta-bank-shape/` on the isolated `codex/s07-magenta-bank-shape` branch.

The approved reference is `references/07_dive_the_washer_tube.png`, SHA-256 `75782e387240d79436808c3b1c642040eda75fd5b58dbb76192035c7c60f78c9`. Its native bytes are JPEG despite the repository filename. The separate `comparison/APPROVED.jpg` preserves those exact bytes. The direct comparison files are full-size 864 × 1536 images. The approved artwork shows the locked checkpoint. Every gameplay BEFORE and TEST pair shares its own exact camera matrix, simulation state, steering and shader clock.

## What was tested

The native Codex CLI marketplace installed Image2Blender 0.1.0 from upstream commit `03fca53c1f44619550b25593834ac8c57fee5746` into a temporary profile. The skill and helpers matched upstream byte for byte. The profile was configured for the official Blender Lab MCP v1.0.3, pinned to `2cea8d566dde07fbac28a61d698909d69724e853`. One local bridge served Blender 5.3.0. The reconstruction used Image2Blender’s image probe, strict spec validator, scene build passes, two render angles per pass and recorded reviews. All modeling passes were sent through the official MCP tool.

The two bank meshes have editable cross-sections and thickness modifiers. Two Bézier guides preserve the curves. The two foam meshes contain clusters of low intersecting lobes. Claudia’s original near-bank and foam textures are packed in the Blender file and embedded in the glTF. The saved camera and water plane establish scale and placement. Bank height and edges obscured by Benny, foam or cropping are inferred from one image. The guide curves document the loft. Editing a guide alone does not regenerate the mesh.

A temporary Playwright adapter loaded the exported GLB using Three.js’s GLTFLoader. It attached the two real bank meshes to Screen 07’s existing scenery group and sampled their cross-sections to align the painted water. It reused Claudia’s water shader and textures. The adapter changes only the in-memory preview of the level stretch. The two editable foam meshes are demonstrated in the Blender renders. The playable preview keeps Claudia’s foam, character, coins, course, collisions and controls.

## Evidence

| View | Finding |
|---|---|
| Locked opening | 0 changed pixels out of 1,327,104. Both versions measured 80.0458% on the previously defined whole-frame within-20 RGB test against the approved image. |
| Forward 6, 10 and 18 game units | The new bands cover more of the foreground. The improvement is clearest at +18. The cyan lane stays open and the hot-pink side strips read more like banks. The near reflections still repeat and the broad painted S does not wrap all the way around Benny. |
| Hard left and hard right at +12 | Both banks read as widened, nearly straight strips and crowd the nearby cyan channel. The first tuning also projected a gold stripe onto a pink face on hard right. The revised adapter removed the stripe and limited camera-derived widths. |
| 66% from the checkpoint to the inlet | 0 changed pixels. The experiment has no visible effect on this sampled plunge image. |
| Standalone geometry | On 11 scanlines of the visible foreground left bank, the modeled inner edge differed from the approved image by a median of 9 pixels and a maximum of 19 pixels at native resolution. This measures one visible edge at the camera used to fit it. |

The separate `comparison/runtime.json` and `comparison/measurements.json` preserve the camera matrices, steering, frame counts, exact pixel counts, colour masks and scanline results. The foreground magenta occupancy is a colour-coverage diagnostic. Distinct camera positions have no matching second approved image from which to derive a whole-ride percentage.

Claudia’s eight gameplay assertions ran against both versions on Chromium WebGL. Both passed 8/8, collected 91 coins, went from 1,330 to 2,240, reached the ending, and preserved the 61.14-unit plunge. Both reported zero runtime or resource errors. This was a desktop cloud test. Android device performance was not measured.

## Recovery and reuse

The `model/` folder contains the reopened, verified Blender source and its glTF 2.0 export. The `run/` folder contains the validated specification, reviews, source edge measurements, reconstruction inputs, rendered angles and verification records. The `reproduce/` folder contains the modeling and preview code. See `reproduce/REPLAY.md` for the temporary layout and pinned inputs. The first superseded hard-right photograph is saved under `rejected-tuning/`.

The model can be used as a reference for future authoring. The reviewed visual result does not warrant game integration. A future session can fetch the branch and reopen the saved Blender file. A fresh cloud environment requires the pinned plugin, a compatible Blender executable and one official local bridge. All other screens need their own approved reference, camera, component specification and motion reviews. No paid APIs were used.
