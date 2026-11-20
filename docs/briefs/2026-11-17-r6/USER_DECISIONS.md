# The user's order — 2026-11-17 ~21:45 UTC (account 6, "URGENT: GET ALL FIVE RAINBOW GAME SCREENS TO AT LEAST 8.5/10")

Binding for every workstream; extends the r5 and r4 USER_DECISIONS (still valid). Nothing is approved until the user says so.

1. **Target:** at least **8.5/10 visual quality, ideally 9–9.5/10**, of the actual playable 3D game against the ORIGINAL
   approved images — **throughout gameplay, not just a still screenshot.** No redesign, no different scenery.
2. **Only the five playable screens:** 04 Through the Five Arrows · 05 Flow Into the Current · 06 Crest the Rinse Arch ·
   07 Dive the Washer Tube · 08 Final Spin Chamber. Screens 01–03 and 09–11 are the user's Google Flow videos: no
   development time, no Marble credits on them.
3. **World Labs Marble:** verify the connection with free checks only; no new worlds, no credits. Earlier Marble tests got
   colours/materials but changed depth, architecture and layout. Use existing Marble splats / meshes / panoramas /
   materials only as a supporting asset resource where useful — never as the authority for the game design; stop trying
   the same method if it cannot reproduce the approved layouts.
4. **The real problem = visuals breaking during movement** (forward and turning): stretched/smeared water, repeated or
   mirrored scenery, jagged seams, duplicated river surfaces, flat-looking water, gold rings or washer walls blocking the
   camera, incorrect tunnel curvature, missing scenery, floating/overlapping geometry, camera clipping, inconsistent
   lighting and reflections, wrong foam and bubble placement. Do not solve it with a flat picture in front of the camera:
   fitted real 3D geometry, UV-mapped textures, depth-aware materials, camera-consistent projection, matching textures
   for surfaces that become visible while Benny moves.
5. **Match the approved details:** composition and proportions, tunnel architecture, purple and gold metal, bright
   cyan-and-magenta water, glossy highlights and reflections, lighting and depth, foam/bubbles/splashes, gold rings and
   fixtures, coin placement, Benny (pink fur, round body, knitted hat, pom-pom, star, splash), camera position and
   perspective. No unnecessary decorations.
6. **Per screen (user's words, abridged):**
   * 04 — gold tunnel, glowing blue arrows, water thickness, foam, moving-camera textures.
   * 05 — keep the approved S-shaped river, purple washer walls, gold rings, lighting and water effects while Benny moves.
   * **06 — MAJOR PRIORITY:** fix the oversized flat-looking blue water, repeated streaks, missing tunnel architecture and
     camera movement; the whole environment must keep the beautiful curved 3D look of the approved image.
   * 07 — close-up walls, distorted gold rings, mirrored water, foam, and the transition into Screen 08.
   * 08 — keep the successful reconstruction; fix moving-camera seams, duplicated river surfaces, gold-band clipping,
     coin spacing and Benny's appearance.
7. **Specialists:** continue their existing work from the newest saved branches; separate workstreams as usage allows;
   never restart successful reconstructions, overwrite work or merge unfinished branches. **Priority: Screen 06 moving
   scenery and Screen 08's remaining issues**, while making sure 04, 05 and 07 are also completed.
8. **Measure moving gameplay** for every screen: approved image, game at the matching camera, forward, steering left,
   steering right, and the whole screen — at several positions along the real path; keep subjective ratings separate
   from measured pixel similarity.
9. Tools: Blender, Three.js/WebGL, approved artwork, Image-Blaster + fal.ai (controlled clean-up, only with approval for
   paid runs), Marble existing assets, camera-fitting and comparison scripts, Playwright, Android tools. If projection
   cannot solve a moving-camera problem, investigate better geometry, UV mapping, depth-aware projection and additional
   approved-style texture views BEFORE recommending paid generations. **No purchases, no paid Marble or fal jobs
   without approval.**
10. Save everything (scripts, assets, textures, camera settings, tests, APKs) to GitHub, separate branches, verified
   backups. Show each improved screen separately at full portrait size (approved vs new + moving views) with a realistic
   rating per screen.
