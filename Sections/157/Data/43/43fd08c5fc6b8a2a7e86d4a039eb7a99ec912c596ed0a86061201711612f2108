# Screen 05: World Labs status and the manual Marble route

Checked 2026-11-15 ~20:10 UTC from the Rainbow cloud session (branch `ccr-d4bb0ad3-8ycajb`). Nothing was
generated and **no credits were spent**.

## 1. Atlas (claude.ai connector): connected, but the account is not active

| Check | Result |
|---|---|
| Connector tools present in this session | yes: `list_projects`, `create_image_upload`, `import_image`, `images2PosedRGBD`, `atlasGenerate`, `atlasTextToImage`, `atlasChisel`, `posedImages2Splats`, `splats2Mesh`, `get_asset`, `get_operation` |
| `list_projects` (free, run first as required) | **error:** `this sign-in has no active Atlas account. Ask the user to open https://atlas.worldlabs.ai and finish signing up, then try again` |
| Claude Code plugin `worldlabs@worldlabs` 0.2.2 | installed in this container (skills `atlas-blender`, `atlas-splats`, `atlas-flythrough`, `worldlabs-cli`); its MCP endpoint is `https://api.atlas.worldlabs.ai/mcp` |

**What is missing:** the World Labs identity that the claude.ai connector signs in with has no Atlas account
yet. To fix it:
1. Open https://atlas.worldlabs.ai with the same World Labs login you used when connecting the connector
   in claude.ai, and finish the sign-up (accept the terms, create the organisation/project if asked).
2. In Atlas Settings → Developer Platform, add credits or a payment method and (recommended) a monthly
   spend limit. Without credits, `list_projects` may work but the task tools will be refused.
3. Tell me, and I will run `list_projects` again (free) and show you the exact project, tools and the
   price of each step in `PILOT_PLAN.md` before anything is run.

Until then I cannot call `images2PosedRGBD`, `atlasGenerate`, `posedImages2Splats` or `splats2Mesh`, so
Screen 05 is being corrected with the manual Three.js/Blender method (see `qa/pilot05/COORDINATION_WAVE3.md`).

## 2. Marble: no official integration in this environment

The World Labs plugin and connector cover **Atlas only**; neither has a Marble tool, and Marble app credits
cannot be used through the Atlas API. So Marble is **not** connected to Claude here. You can use it
yourself in the browser at https://marble.worldlabs.ai and give me the export.

### Input image for Marble (prepared, original untouched)

| File | Use |
|---|---|
| `05_env_clean_plate_cropped.png` (864×1339) | **Recommended upload.** The approved image without the HUD rows (cropped at row 197, so the top needs no invented pixels), with Benny, the splash and the coin trail filled with water copied from the reference itself |
| `05_env_clean_plate.png` (864×1536) | Same at full frame; the HUD rows are filled by rotating real wall pixels about the vanishing point |
| `05_env_fill_mask.png` | White = pixels that were **invented** by the fill (33.7% of the full frame). Use this to judge anything Marble builds there |
| `05_env_plate_review.png` | original \| clean plate \| invented pixels tinted green |
| `05_env_mask.png`, `05_env_only_preview.png` | the earlier keep/remove mask and grey-block preview |

Made with `python3 -I tools/make_env_plate.py references/05_flow_into_the_current.png qa/worldlabs/05/05_env_mask.png qa/worldlabs/05 --vp 498,479`.
The fill is approximate: the centre of the river behind where Benny stood is a patchwork of real water
pieces and has a soft grey smear at its lower edge. Treat what Marble builds there as invented. A cleaner
plate needs a generative fill (Atlas `atlasChisel`, paid, or an image editor you use yourself).
`references/05_flow_into_the_current.png` is unchanged (SHA-256 `d3f339d4…`, 12/12 references verified).

### Prompt to paste into Marble (image + text)

> Reconstruct exactly the environment in this image, without redesigning it. It is the inside of a long, straight,
> cylindrical washing-machine drum tunnel seen from inside, looking straight down its axis to one bright warm-golden
> vanishing point. The walls are deep glossy metallic magenta and violet with long white-pink specular streaks running
> along the tunnel, and regular rows of dark capsule-shaped perforation slots laid around the circumference between
> the rings. About ten evenly spaced, identical, circular, polished reflective yellow-gold ring bands (flat bands with a
> double lip) divide the tunnel into equal bays, shrinking evenly toward the vanishing point. One small copper-gold
> half-dome fitting sits on each side wall in every bay, just above the water. The tunnel floor is filled wall to wall
> by one broad, thick, glossy electric-cyan river with hot-pink swirling bands that winds in smooth S-bends toward the
> vanishing point, with white-blue reflections and star-shaped glints. Banks of soft white foam line both sides of the
> river, with transparent iridescent soap bubbles. Keep the same proportions, perspective and colours as the image.
> No people, no characters, no coins, no text, no other rooms, no openings, no waterfalls, no extra machinery.

### Export and hand-over

1. In Marble, export the world as a **mesh (.glb)** and, if offered, the **splats (.ply)**.
2. Upload them to this chat (or put them in `qa/worldlabs/05/import/`).
3. I run the saved, credit-free import tool:
   `blender -b --python tools/blender/import_world_asset.py -- --in <world.glb> [--ply <splats.ply>] --name marble05 --target-radius 7.6 --out-dir qa/worldlabs/05/import`
   It aligns the tunnel to the Screen 05 course axis, scales it to the game's tube radius, measures radius, ring
   spacing and cross-sections (`marble05_measure.json`), saves `marble05.blend` and a decimated underlay GLB.
4. The environment modeler uses those numbers and the underlay to correct the game's tube, rings and fittings in
   Blender/Three.js. The playable scene stays real-time geometry with the animated water shader. The Marble world
   is a modelling reference, never a static backdrop in gameplay.
