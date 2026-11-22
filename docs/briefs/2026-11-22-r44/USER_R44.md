# Round 44 — the user's orders (verbatim, 2026-11-22 ~15:30 UTC)

Attached: `USER_LEVEL_FLOW_PREVIEW_R44.png` ("RAINBOW Level Flow Preview – Continuous Journey", 1672 × 941) — **transition concepts only**.

> Claudia, I've attached new visual previews showing how I want my Rainbow game levels to connect.
>
> These are transition concepts only. My 11 original approved screens remain the official visual blueprints. Do not replace or redesign them.
>
> Use the previews to improve the physical connections between the approved areas.
>
> My gameplay route is:
>
> 04 → Bubble Dash Chamber → Sock Rescue Tunnel → 05 → 06 → 07 → 08 → 09 → 10.
>
> Benny must naturally swim forward through one connected 3D washing-machine world.
>
> Make sure each area's exit physically connects with the next area's entrance. The water must flow continuously, with consistent tunnel
> dimensions, lighting, colors, scenery and Benny proportions.
>
> Pay particular attention to the 04 → Bubble Dash → Sock Rescue → 05 sequence and the 07 → 08 transition.
>
> Do not create repeated tunnel entrances, disconnected water, sudden camera jumps or teleporting between scenes.
>
> Preserve Benny's natural swimming, touch controls, collectibles and water interaction.
>
> Screens 01–03 and 11 remain Google Flow videos.
>
> Please use my original approved artwork for visual accuracy and these new previews only to guide the connections. I want everything to look
> like one beautiful, continuous, real 3D mobile game. AES for the World App keys, the secure form.

(Last sentence read as "and yes for the World Labs keys, the secure form" — the user's answer to the lead's question about entering the OLD
World Labs / Marble key through the secure credential form.)

## The preview's transition captions (what each join should look like)
| join | caption on the preview |
|---|---|
| 01 → 02 | Washer opens into whirlpool. (video) |
| 02 → 03 | Whirlpool tightens into spiral flow. (video) |
| 03 → 04 | Spiral straightens toward the arrow tunnel. (video → gameplay hand-over) |
| 04 → A | Arrows lead directly into the Bubble Dash chamber. |
| A → B | Chamber current flows into the sock tunnel. |
| B → 05 | Sock tunnel curves into the winding current. |
| 06 → 07 | Crest drops into the washer tube. |
| 07 → 08 | Tube opens into the spin chamber. |
| 08 → 09 | Chamber current builds into the final wave. |
| 09 → 10 | Wave carries Benny to the hiding spot. |
| 10 → 11 | Benny hides in the towel, leading to the final victory. (gameplay → video hand-over) |
(05 → 06 has no caption on the sheet.) Footer: "A Natural, Continuous Path — consistent style & colors, clear scene-to-scene flow, Benny always
moves forward, both new scenes fit naturally, a cohesive, attractive game world."

## Binding interpretation
* Authority for each AREA's look = its own approved picture in `references/` (+ the two new designs for A / B). The preview sheet is NOT a
  likeness target; it only says how one area's exit meets the next area's entrance.
* Priorities named by the user: 04 → A → B → 05, and 07 → 08.
* Forbidden: repeated tunnel entrances, disconnected water, sudden camera jumps, teleporting / page loads between areas.
* Keep: Benny's swimming + water contact, swipe controls, coins / collectibles, the water; Bubble Dash 90.7 %, Screen 06 88.5 % at its picture camera.

## User decision (2026-11-22 ~16:00 UTC, answer to the lead's question with the join audit sheet)
**"Rebuild in one world (Recommended)"**: one scene built with the screen kit — Bubble Dash / Sock Rescue and the rebuilt 06 as they are;
04, 05, 07, 08, 09, 10 rebuilt from the approved pictures (baked pixels on real geometry); connectors from the preview. Order: 04 + 05 first
(for 04 → A → B → 05), then 07 + 08. The current game stays unchanged until the world is ready. Plan: `PLAN_R44_CONNECTED_WORLD.md`.

## User clarification (2026-11-22 ~16:30 UTC, verbatim summary of the binding points — full text in the session transcript)
1. **Blender 5.3 + Geometry Nodes are the primary builders** of the real playable environments: washer tunnels and metallic drum walls, golden
   rings and machinery, curved rainbow water channels and slides, foam banks / obstacles / physical boundaries, entrances, exits and transitions,
   collision surfaces matching what players see. Approved images = visual blueprints; preserve the original designs and colours. Real, complete,
   connected 3D worlds — "not flat images or backgrounds that only look correct from one camera position".
2. **World Labs Atlas is optional**, never the main builder; never replace the Blender-built playable environments with generated splat scenes.
   Before any Atlas use: explain the specific task, expected benefit, output format and credit cost, get approval before paid generation; verify
   a generated asset's geometry / textures / collisions and integrate it into the Blender / Three.js world. Never the old, rejected Marble worlds.
3. **Three.js for real gameplay**: Benny swims through the actual 3D environment; body follows slope + banking, partly immersed, fully visible;
   splashes, steering, collisions, camera, coin pickups respond to his real position. No flat moving backgrounds, camera-following scenery
   pictures, missing geometry or distorted image textures.
4. **One continuous connected world** 04 → Bubble Dash → Sock Rescue → 05 → 06 → 07 → 08 → 09 → 10; each exit physically meets the next
   entrance; **reconcile the scale** (old game units ≈ 3× the newer scenes): Benny, tunnels, river widths, camera, collision geometry. No page
   loads, teleports, camera jumps or visual discontinuities.
5. **Use the restored debugging tools**: Three.js DevTools + Spector.js for rendering problems; Playwright for real left / right swipes, forward
   swimming, jumping, coins and transitions; plain materials first (missing geometry), then the approved textures; compare beginning, middle and
   end of each playable section, not only the approved starting camera.
6. **Preserve everything working**: no restart, no needless rebuild of completed sections; keep the Screen 06 immersion / movement / camera /
   scenery improvements; preserve approved images, Flow videos, controls, GitHub backups (five-minute autosave). Original approved screens = the
   visual targets; the preview images guide the transitions only unless the user approves a redesigned screen.

## User message 2026-11-22 ~17:10 UTC — visual connection guides (verbatim essentials)
Attached: `GUIDE_AUTHORITATIVE_04_A_B_05.png` and `GUIDE_AUTHORITATIVE_05_to_10.png` (made from the user's ORIGINAL artwork = **authoritative**),
`GUIDE_CONCEPT_level_flow_infographic.png` and `GUIDE_CONCEPT_04_A_B_05_connection_preview.png` (illustrated concepts = optional inspiration
for the connecting sections only).
> I want to improve my level-to-level flow, visual consistency and overall quality toward 9/10 or better. Please preserve my original approved
> screens and the existing 3D reconstruction progress. Use Blender 5.3 and Geometry Nodes to build the physical connections between each level,
> and Three.js for real gameplay. Make sure: Benny swims continuously through each environment with the same model, scale and natural water
> immersion. Every tunnel exit connects physically to the next area. Water direction, river width, metallic surfaces, gold rings, foam and
> lighting transition naturally. The camera follows Benny without jumps, clipping, sudden size changes or loading flashes. Screen 07 has a
> genuine descending route into Screen 08. The scenery remains fully modeled and playable in 3D, not flat image backgrounds. The original
> approved camera compositions remain recognizable. Screens 01–03 and 11 remain Google Flow videos. Please create and test actual transition
> geometry. Show me uninterrupted gameplay recordings across the connections, not just beautiful still pictures. Do not replace my approved
> artwork, restart completed work or spend paid credits without my approval. Continue saving successful changes to GitHub.

Authoritative join captions (on the guides made from the original artwork):
| join | caption |
|---|---|
| 04 → A | 04 exit: glowing chute widens into A; keep forward motion and scale. |
| A → B | A exit: large chamber narrows into B, with the same water channel. |
| B → 05 | B exit: laundry tunnel curves into Screen 05 S-shaped current. |
| 05 → 06 | S-curve climbs seamlessly into the raised banked crest. |
| 06 → 07 | crest flows down into the deeper descending washer tube. |
| 07 → 08 | tube physically opens into the larger final spin room. |
| 08 → 09 | chamber current grows into the strong final wave. |
| 09 → 10 | wave carries Benny toward the same purple towel. |
Each panel: "Keep approved composition. Build real 3D joins outside view." Guide header: "Exact user-supplied reference art. Only ADD 3D join
geometry between these frames; do not replace the approved artwork." / "Same Benny model, scale, waterline, gold-ring language and camera. Video
ending begins after Screen 10."
