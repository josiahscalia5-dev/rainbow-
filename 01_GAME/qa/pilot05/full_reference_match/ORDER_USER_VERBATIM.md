# The user's FINAL MASTER EXECUTION ORDER for Screen 05 (received 2026-11-16 ~19:40 UTC) — verbatim, as received

NOTE: the message arrived CUT OFF in the middle of Part 14 (last words: "For the tunnel, rings, a"). Everything up to
that point is below, word for word. When the user resends the remainder, append it here.

---

CLAUDIA — FINAL MASTER EXECUTION ORDER

RAINBOW — SCREEN 05: FLOW INTO THE CURRENT

COMPLETE, PIXEL-REFERENCED VISUAL RECONSTRUCTION

READ THIS ENTIRE INSTRUCTION BEFORE MAKING CHANGES. THIS IS AN IMPLEMENTATION ORDER, NOT A REQUEST FOR ANOTHER PLAN, FEASIBILITY DISCUSSION, OR GENERIC STATUS REPORT.

I have spent extensive time attempting to make Screen 05 match my approved artwork. I am no longer accepting endless experiments that improve one small feature while leaving the overall scene visibly different.

MY ONE PRIMARY OBJECTIVE: MAKE THE ENTIRE REAL, PLAYABLE 3D SCREEN 05 LOOK AS CLOSE AS TECHNICALLY POSSIBLE TO MY EXACT ORIGINAL APPROVED IMAGE.

The complete approved image is the authority. Not previous interpretations, not Marble, not another AI-generated image, and not your opinion of what looks better.

The objective is a 95–100% visual match where technically achievable, with truthful measurements and no false claims of perfection. You must actively implement and refine the scene, not merely recommend improvements.

---

PART 1 — AUTHORITATIVE REFERENCE AND EXISTING WORK

Read and inspect these project files before doing anything:

- "CLAUDE.md"
- "references/05_flow_into_the_current.png"
- "references/water/05_water_isolated_original.png"
- "qa/pilot05/proj/NOTES.md"
- "qa/pilot05/proj/BRIEF_NEXT.md"
- "qa/pilot05/current_default_05.png"
- "qa/pilot05/wave9/baseline/05.png"
- The latest full-size Screen 05 capture with "?proj05=1"
- The latest GitHub branch and commit containing the finished water-projection work

My original approved Screen 05 is 864 × 1536 pixels.

The recent water-projection work was saved on branch "ccr-e546a360-cxmton", with the last reported commit "d8dbc560e173d78345c5c19cfd3b6f6ffb2a3452". Verify the current GitHub state before changing anything. Do not assume this is still the latest branch if newer work exists.

My protected working version is separate. Preserve it.

The "?proj05=1" water experiment already achieved a reported 93.4% of approved water/foam pixels within 20 RGB levels, or 96.8% when the front ring obstruction is excluded.

THAT IS NOT 93.4% OR 96.8% SIMILARITY OF MY COMPLETE SCREEN. DO NOT PRESENT IT AS SUCH.

Keep the improvements already made. Do not start water development from scratch.

Use the existing Three.js game, Blender 5.3, shader code, artwork, screenshots, saved specialists, and Playwright tools.

Do not create another Marble reconstruction. Do not buy software, spend credits, access another paid account, or request API keys without a specific justification and my explicit approval.

---

PART 2 — NON-NEGOTIABLE VISUAL RULE

Every visible part of my approved image must be accounted for.

Do not skip something because it seems small. Small details collectively make the image look premium.

Do not use vague judgments such as "similar," "close enough," or "looks pretty good."

Instead, inspect each feature in my approved image and the corresponding feature in the actual game capture.

For every mismatch, establish:

1. What the approved image shows.
2. What the current game shows.
3. The precise visual difference.
4. Which mesh, texture, material, light, camera setting, shader, object, or HUD element causes it.
5. The specific change required.
6. Whether the updated result is objectively closer.

Create a detailed audit file under "qa/pilot05/full_reference_match/".

Do not silently skip difficult items.

---

PART 3 — EXACT CAMERA AND COMPOSITION

The approved screenshot must be treated as a precise composition, not merely an artistic inspiration.

Match the following:

- Portrait 9:16 framing.
- The golden light at the far end of the tunnel.
- The tunnel's vanishing point.
- Circular tunnel alignment and apparent diameter.
- Relative sizes of the front, middle, and distant rings.
- How much purple wall is visible on each side.
- The exact perspective and visual depth of the water.
- Benny's location in the lower central area.
- The gap between Benny and the nearest coin.
- How the water widens toward the foreground.
- How the front gold ring frames the bottom corners.
- The positions and apparent sizes of all HUD components.

The approved image's approximate tunnel vanishing point is near x=495, y=480 at 864 × 1536. Measure it accurately rather than treating that estimate as an immutable coordinate.

Use the existing calibrated Screen 05 camera as your starting point.

Do not casually change the camera's FOV, position, yaw, pitch, roll, or smoothing. If a camera change is genuinely necessary, prove that it improves the ENTIRE composition and doesn't harm gameplay or transitions. Test it reversibly first.

Do not enlarge the tunnel into the previously rejected oval or big-tunnel version.

---

PART 4 — GOLDEN METALLIC RINGS: MAJOR PRIORITY

One of the most obvious differences is that my approved tunnel has rich, glowing, polished golden-yellow metallic rings.

My current game often renders them as peach, pale orange, copper, or washed-out gold.

That is wrong.

Match the approved ring material in all of these respects:

- Gold hue, with rich yellow-orange metal rather than pinkish peach.
- Bright gold and almost white-gold specular highlights.
- Darker amber-gold areas that create depth.
- Realistic polished metallic reflections.
- Distinct bright and shadowed surfaces.
- Ring thickness.
- Inner and outer edge bevels.
- Curvature.
- Ring width in screen pixels.
- Placement relative to the tunnel walls.
- Spacing and shrinking perspective as the rings recede.
- Brightness and glow falloff with distance.
- Correct relationship to the dark purple metallic walls.
- Correct overlap with the water, foam, and side fittings.

Inspect the entire series of rings, not just the closest one.

The near foreground ring is particularly important.

The current ring covers portions of the approved water in the two lower corners. The latest report measured this obstruction at approximately 16,912 pixels.

You have permission to test a Screen-05-only correction to the front ring's visible placement, silhouette, thickness, and material.

However:

- Do not move the whole tunnel.
- Do not casually alter the gameplay camera.
- Do not modify gameplay collision geometry.
- Do not hide errors behind a fake metric.
- Do not sacrifice a visually correct ring just to expose more water pixels.

Compare the actual ring outline against my original image. Use whichever tested configuration makes the entire image closer.

Investigate "src/world/environment.ts", "src/world/tube.ts", "src/world/materials.ts", and the relevant rendering setup.

If ordinary PBR gold materials cannot reproduce my approved appearance, test camera-calibrated texture projection or baked reflection/detail maps from my ORIGINAL approved artwork, with correct depth on real 3D geometry.

No generic gold replacement.

---

PART 5 — PURPLE WASHING-MACHINE TUNNEL

My approved tunnel is richly metallic, reflective, dimensional and glossy.

The current game is often too uniformly pink, overly magenta, flat, or differently lit.

Reconstruct the approved background precisely.

Inspect and match:

Metallic purple surface

- Deep electric-violet base.
- Rich purple and hot-magenta reflective areas.
- Dark recesses between bright bands.
- Sharp pale-pink and white metallic reflections.
- Directional light streaks and glossy glints.
- Correct color transitions around the circumference.
- Darker shading as the tunnel recedes.
- Correct contrast against gold.

Perforated washer-metal pattern

- Exact appearance of black oblong openings.
- Hole orientation.
- Hole dimensions.
- Spacing within rows.
- Staggering where visible.
- Changes in apparent size due to perspective.
- Edge brightness.
- Darkness inside the slots.
- Correct surface pattern density.

Tunnel structure

- Correct apparent cylindrical proportions.
- Correct concentric rings.
- Correct interior depth.
- Correct curved metal panels.
- Correct gold-to-purple junctions.
- No unexpected gaps.
- No transparent wall patches.
- No repeated-looking low-quality tiling.
- No obvious texture stretching.
- No broken geometry at distant sections.

The goal is not to make a new purple tunnel. It is to reproduce the particular tunnel in my approved Screen 05.

Where necessary, derive material textures from my approved image rather than approximating everything with procedural colors.

---

PART 6 — GOLD SIDE FITTINGS AND WASHER MECHANISMS

My approved tunnel has specific golden side protrusions and rounded metallic fittings.

They must be compared individually.

Check:

- Number of visible fittings.
- Position on the left and right walls.
- Their apparent size.
- Their shape and thickness.
- How far each protrudes toward the center.
- Their rounded ends.
- Their gold brightness and reflections.
- Their alignment with surrounding rings.
- Their depth perspective.
- Which objects overlap others.

Some current fittings appear at different heights or project differently than my approved image.

Fix these as actual 3D objects or camera-matched textured surfaces.

Do not add extra machinery for decoration.

Do not remove approved machinery because it is difficult to model.

---

PART 7 — THE EXACT APPROVED WATER

PRESERVE THE EXISTING "?proj05=1" PROJECTION WORK. DO NOT THROW IT AWAY.

My approved water has a very specific shape and visual treatment:

- Bright saturated electric-cyan liquid.
- Deep, luminous blue within the current.
- Broad, glossy hot-pink and magenta S-curves.
- Smooth, long flowing ribbons rather than jagged stripes.
- Brilliant white reflections.
- Elongated white highlights that follow the water.
- Natural glowing streaks and fine sparkles.
- Curving light patterns near the foreground.
- Consistent blue and pink balance.
- A recognizable, continuous winding river.
- Clearly defined water edges.
- Convincing thickness and glossy visual depth.

Keep the approved S-curve shapes and placements.

Do not replace them with straight pink lanes, random noise, overly repetitive line patterns, or a generic water shader.

Do not oversaturate cyan until it loses tonal detail.

Do not let pink bloom contaminate the pure blue areas.

Do not blur the original artwork unnecessarily.

Keep the white highlights crisp.

Avoid all of the previous artifacts:

- Blocky texture patches.
- Visible joins between source images.
- Rectangular seams.
- Repeated bubble outlines.
- Ghosted coins or Benny silhouettes.
- Stretched ribbons.
- Torn texture edges.
- Disappearing river segments.
- Blank patches under Benny.
- Mismatched far-water tiles.
- Excessive softness near the camera.
- Repetitive artificial shimmer.

Continue to use proper world-anchored river UV coordinates, not a full-screen wallpaper or video masquerading as gameplay.

The existing river must remain playable and capable of flowing toward the camera.

Do not change the established swimming route or collision path merely to alter the picture.

---

PART 8 — FOAM BANKS, WATER EDGES AND SPLASHING

My approved image contains thick, fluffy, pearly white-blue foam along both edges of the river.

Inspect:

- The left-bank and right-bank outlines.
- Their curvature.
- Foam thickness at each distance.
- Foam size and cluster structure.
- White, pale-blue, and lavender shading.
- The way foam catches light from the surrounding water.
- Where foam touches the tunnel walls.
- Where the foam hides parts of the river.
- Soft transitions between foam and liquid.
- Density variation from foreground to distance.

The current foam must not appear like randomly scattered balls, a thin artificial outline, a polygonal strip, or a completely different material.

Keep and refine the recent visual-only bank-strip solution where it improves the reference match.

Remove clipping, hard edges, bright diagnostic patches, incorrect wall overlap, and blurry texture transitions.

The foam must be exactly where it belongs visually, while preserving gameplay collisions.

Benny's wake

The approved splash is an important component of the image.

Match the white-blue spray around Benny:

- The location of the splash relative to his body.
- Left and right symmetry or asymmetry shown in the approved frame.
- The fan-shaped outward flow.
- Fine white droplets.
- Curved liquid filaments.
- Water lifting around the sides.
- Clear separation of wet foam and pink fur.
- Bright blue reflections under the body.

The current splash often looks like exaggerated straight, spiky white streaks.

Replace that appearance with a more faithful reconstruction of the approved splash.

Keep the splash animated and correctly attached to Benny.

---

PART 9 — BENNY: EXACT APPROVED CHARACTER

Benny must match my original approved Screen 05.

Do not reinterpret, replace, redesign, or simplify him.

Body

- Exact rounded silhouette.
- Correct proportions.
- Correct pink fur hue.
- Dense, soft, fine fluffy texture.
- Detailed fibers rather than coarse spikes.
- Appropriate natural-looking shading.
- Correct body width and height.
- Correct depth of visible fur.
- Correct ear shapes and left/right positioning.
- Correct position relative to the water surface.

Purple-and-white beanie

- Exact hat proportions.
- Exact knitted appearance.
- Correct alternating purple and white stripes.
- Correct number and thickness of visible stripe bands.
- Correct knit texture and ribbing.
- Correct curvature around his head.
- Correct lower purple cuff.
- Correct pom-pom shape, scale, density and position.
- Correct purple shades.
- Correct soft highlights and shadows.

Gold star

- Exactly on the appropriate side of the hat.
- Same yellow-gold appearance.
- Correct size.
- Correct shape.
- Correct bevel and reflective highlight.
- Correct angle and placement.

Camera-facing appearance

This is a behind-the-character gameplay screenshot.

Do not substitute his front view or accidentally expose his eyes or face when he should be seen from behind.

Placement

Compare his body and hat against my approved picture at the locked checkpoint.

Measure his screen-space bounding box, center, width and height.

Fix visible differences in proportions before claiming the character is matched.

Keep the existing character identity and gameplay animation system. Update visual assets and visual offsets as necessary without breaking his movement.

---

PART 10 — GOLD DOLLAR COINS

The approved coins are specific objects, not generic yellow circles.

Match:

- Number of coins visible at the approved checkpoint.
- Exact route through the center of the current.
- Screen-space position of each visible coin.
- Size progression toward the vanishing point.
- The nearest coin's location relative to Benny.
- Spacing between the closest coins.
- Gold-yellow color.
- Rim thickness.
- Ridged metallic edges.
- Embossed dollar symbol.
- Face angle and perspective.
- Metallic reflections and highlights.
- Coin shadows and contact with surrounding light.
- How distant coins become smaller.

The closest approved coin is around x=474, y=725 in the original 864 × 1536 image, but measure all locations directly rather than relying on this estimate.

Some game frames show oversized coins blocking Benny or appearing in positions different from the approved layout.

Fix Screen 05's visible coin arrangement and rendering so the approved locked frame matches.

Coins must still be actual collectible game objects. Preserve collection behavior, point increments and collisions.

The coin counter must continue updating dynamically during gameplay.

Investigate "src/gameplay/coins.ts".

---

PART 11 — EVERY BUBBLE

The approved image has transparent iridescent bubbles, ranging from tiny highlights to large glossy spheres.

Match:

- Bubble sizes.
- Bubble count.
- Exact positions in the locked approved frame.
- Distribution on both sides of the river.
- Their transparent interiors.
- Pink, cyan, lavender and white iridescent reflections.
- Bright curved highlights.
- Rim thickness.
- Opacity.
- Light refraction appearance.
- Size changes with depth.
- Their positions in front of or behind other objects.

The recent projection experiment includes approved bubble artwork and suppresses the game's additional bubbles.

Retain this where it improves the locked view.

However, ensure that bubbles do not become obviously painted onto the water during movement. If needed, use actual transparent 3D bubbles or camera-facing sprites matched to the same reference locations, while removing duplicates from the textured layer.

No doubled bubbles, floating ghost images, or obviously mismatched placement.

Other stages must remain unchanged.

---

PART 12 — LIGHTING, SHINE AND COLOR ACCURACY

This is a premium, highly polished, glossy fantasy 3D game scene.

The approved artwork uses intense, carefully balanced lighting.

Match each major lighting component separately:

Gold

Warm, bright, polished yellow-gold with white-gold reflections.

Purple

Deep violet and rich electric-purple metallic highlights.

Pink

Hot-magenta reflections without flooding the entire tunnel with flat pink light.

Blue

Bright electric-cyan water with strong internal tonal detail.

White

Brilliant but controlled highlights, glossy glints and sparkling reflections.

Distant light

The warm golden-white bright point at the tunnel's far end.

Contrast

Maintain both rich dark metal and brilliant glowing surfaces.

Rendering pipeline

Inspect the complete chain:

- Environment reflections.
- PBR materials.
- Directional and point lighting.
- Emissive components.
- Bloom.
- Tone mapping.
- Exposure.
- Color grading.
- Saturation.
- Contrast.
- Fog.
- Vignette.
- sRGB output.

Relevant code includes "src/render/env.ts", "src/render/grade.ts", "src/game/Game.ts" and "src/world/materials.ts".

The current postprocessing can wash gold toward peach, shift cyan toward pink, and overexpose some materials.

Correct these effects based on actual approved pixels.

Keep any experimental correction specific to Screen 05 whenever possible.

Do not globally change how every level looks.

Do not apply more bloom merely because the result looks shiny. Only keep it if it is demonstrably closer to my approved image.

---

PART 13 — TOP HUD AND LEVEL BANNER

The entire interface also counts toward the visual match.

Compare the approved and playable HUD:

- Heart icon shape.
- Heart gloss and color.
- Heart location and scale.
- The "5/5" display.
- The white plus symbol.
- Coin icon.
- Gold coin border and dollar sign.
- Coin icon size and position.
- Counter formatting ("1,420" in the approved checkpoint).
- Top-bar height.
- Width.
- Rounded corners.
- Purple transparency and gradient.
- Borders and white reflective edges.
- Divider positions.
- Pause icon size and shape.
- Pause button's circular outline.
- Relative padding and spacing.

Level banner

The approved heading is:

05 · FLOW INTO THE CURRENT

Match the precise text, character spacing, font appearance, italic angle, size, golden tint, dark purple background, rounded shape, gold outline, shadow and vertical position.

The level banner must not be too large, too narrow, too low, or differently proportioned.

The approved screenshot should show the correct saved coin count at the locked reference checkpoint, but do not hard-code the number during gameplay.

Investigate "src/ui/hud.ts".

---

PART 14 — EXACT ARTWORK MATCHING TECHNIQUE

Stop relying on subjective shader tuning.

Use reference-driven reconstruction.

For each approved surface:

1. Identify its exact mask in the original screenshot.
2. Identify the corresponding mesh or screen-space UI element.
3. Capture the matching pixels from the actual running game.
4. Compare them at identical resolution and framing.
5. Identify color, shape, alignment, shading and occlusion errors separately.
6. Fix the actual mesh, texture, material, lighting, or rendering code causing the error.
7. Render again.
8. Keep only changes that improve the complete approved-image match.

For the tunnel, rings, a

[— the message ends here: cut off in transmission —]
