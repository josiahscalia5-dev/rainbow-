# Screen 05: World Labs status and the manual Marble route

## ▶ Status on account 6 (2026-11-15 ~22:05 UTC, branch `claude/rainbow-3d-account-transfer-syorak`)
| Integration | State |
|---|---|
| claude.ai connector **World Labs Atlas** | installed, `connected`, enabled in this session; 11 tools load (`list_projects`, `create_image_upload`, `import_image`, `images2PosedRGBD`, `atlasGenerate`, `atlasTextToImage`, `atlasChisel`, `posedImages2Splats`, `splats2Mesh`, `get_asset`, `get_operation`). This is the ONE Atlas MCP integration |
| `list_projects` (free, read-only; run twice) | **error:** `this sign-in has no active Atlas account. Ask the user to open https://atlas.worldlabs.ai and finish signing up, then try again` → no projects or per-project tools can be listed yet |
| Plugin `worldlabs@worldlabs` 0.2.2 | installed (user scope) for its skills `atlas-blender`, `atlas-splats`, `atlas-flythrough`, `worldlabs-cli`. Its own copy of the Atlas MCP server (`plugin:worldlabs:worldlabs`) is **disabled for this project** so the tools are not duplicated (`scripts/setup-worldlabs-plugin.sh`, run by the environment setup script in every fresh container). Its skills load from the next session |
| Credits | nothing generated, nothing spent |
| Marble | not an API; the user builds the washer world at https://marble.worldlabs.ai and hands over the export (below). `.glb`, `.ply` and `.spz` are stored with Git LFS. The Blender import tool reads `.glb` (mesh) and `.ply` (splats); a `.spz`-only export needs a `.ply` or `.glb` export as well |

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

### Input image for Marble: NOT APPROVED YET

* The first clean plate (v1) was **rejected by the user** (rectangular patches, repeated textures, grey smear).
  It and a failed v2 are kept only as a record in `rejected/`; never upload them.
* Current candidate: **`geometry_ref/2_geometry_reference_05.png`**, a geometry-focused tunnel reference made of
  **real pixels only**: the approved image cropped to rows 197–767 (below the HUD, above Benny's pom-pom), pixel-identical
  to the original (`geometry_ref/check.json`), **0 invented pixels**. All attempts to invent the river behind Benny or
  under the coins left artifacts and were stopped (`rejected/README.md`). The coins stay in the image and are flagged in
  `geometry_ref/3_mask_05.png` for deletion after reconstruction. The near-camera river comes from the game's own 3D river
  geometry in Blender (`blender/screen05_layout.blend`), not from an image fill.
* Waiting for: the Reference Match Director's check against the original, then **your approval**. No upload and no
  credits before that.
* `references/05_flow_into_the_current.png` stays unchanged (SHA-256 `d3f339d4…`, 12/12 references verified).

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
2. Get them into the project, whichever works for the file size: attach them in the Claude chat if the app accepts
   the file; or add them to the repo in `qa/worldlabs/05/import/` (GitHub's web upload takes files up to 25 MB;
   larger files go up with `git` + Git LFS from a computer, already configured for `.glb/.ply/.spz`); or send a
   direct download link (I then ask your approval to allow that one host in the cloud environment).
3. I run the saved, credit-free import tool:
   `blender -b --python tools/blender/import_world_asset.py -- --in <world.glb> [--ply <splats.ply>] --name marble05 --target-radius 7.6 --out-dir qa/worldlabs/05/import`
   It aligns the tunnel to the Screen 05 course axis, scales it to the game's tube radius, measures radius, ring
   spacing and cross-sections (`marble05_measure.json`), saves `marble05.blend` and a decimated underlay GLB.
4. The environment modeler uses those numbers and the underlay to correct the game's tube, rings and fittings in
   Blender/Three.js. The playable scene stays real-time geometry with the animated water shader. The Marble world
   is a modelling reference, never a static backdrop in gameplay.
