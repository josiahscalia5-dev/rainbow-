# Round 43 — the user's orders (2026-11-22 ~12:45 UTC, verbatim; binding)

> Claudia, I want to speed up the reconstruction of all my approved Rainbow gameplay screens without lowering their visual quality.
>
> Please use the existing Rainbow project and the reconstruction tools we've already built.
>
> My goal is to recreate Screens 04–10 as closely as possible to their individual original approved screenshots, targeting approximately 90–95% measured visual likeness, while keeping them fully playable in real 3D.
>
> Screens 01, 02, 03 and 11 are my Google Flow video scenes. Do not spend time rebuilding those.
>
> NEW TASK — GENERALIZE OUR EXISTING RAINBOW SCREEN BUILDER
>
> Start by inspecting:
> - ".claude/skills/rainbow-screen-builder/SKILL.md"
> - ".claude/skills/rainbow-screen-builder/screens.json"
> - "tools/reflock/"
> - "tools/kit05/"
> - Our original approved images in "references/"
>
> I want the existing reference-matching and Blender-building systems converted into a reusable process that works with each screen's OWN approved artwork.
>
> 1. Use Blender Geometry Nodes where useful
> Create reusable procedural components for washer tunnels, curved river channels, gold rings, metallic walls, foam banks and machinery.
> Each screen should have its own measured geometry, colors, camera and scene configuration.
> Do not make every screen look like a copy of Screen 05.
>
> 2. Improve artwork extraction
> Evaluate Meta Segment Anything 2 for accurately separating water, foam, rings and machinery from my original references.
> Evaluate Depth Anything V2 only as an optional guide to estimating scene depth.
> Check compatibility and available resources before using either. Do not spend credits or install additional services without approval.
> Only adopt these tools if a controlled comparison shows they improve results over our existing OpenCV and texture-baking workflow.
>
> 3. Preserve the original approved artwork
> Bake the actual approved artwork onto properly modeled world-space 3D geometry.
> Do not use moving image backgrounds, flat picture placeholders, or painted character layers in the finished interactive gameplay.
> Keep the textures sharp as the camera moves.
>
> 4. Reuse our proven game systems
> Use the same Benny model, responsive swipe controls, camera-follow system, water effects and collision mechanics throughout the entire game.
> Preserve the successful Bubble Dash scenery reconstruction and other verified improvements.
>
> 5. Speed up testing
> Run short automated visual and real-touch gameplay tests while iterating.
> Use the full gameplay recording and Android validation only when a candidate is ready for final acceptance.
> Compare the ORIGINAL approved picture, the PREVIOUS version and the NEW version at identical camera positions.
> Do not change similarity thresholds just to report higher numbers.
>
> 6. Prepare the remaining screens
> Analyze all original approved Screens 04–10 and identify what can be reused and what needs its own geometry.
> Reconcile the Screen Builder's current approval gates with our latest approved work. Do not silently override my approval requirements.
> Continue finishing the current Screen 06 camera and scenery fixes before advancing to the next unfinished section.
> Ensure the two newer Bubble Dash and Sock Rescue scenes connect properly with the original numbered screens, without duplicate titles or repeated levels.
>
> 7. Deliver actual improvements
> I want an implemented reusable system, actual 3D source files, comparison screenshots, a continuous steering video, and an Android test build.
> Save successful changes to my existing GitHub repository and preserve the five-minute autosave system.
>
> Do not start a new game. Do not redesign my approved screens.
>
> My priority is to make Rainbow look extremely close to my original artwork while Benny swims through real, stable, beautiful 3D scenery. Speed up the construction process, not by lowering quality, but by removing repetitive manual work.

Earlier in the same session (round 42 prompt, verbatim excerpt): "Finish Screen 06 before any other section." and the round-42 order
"Finish the current Screen 06 gameplay, steering, camera and ring-obstruction fixes before moving on to another unfinished section."
