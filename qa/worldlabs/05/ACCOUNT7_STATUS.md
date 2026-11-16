# World Labs on account 7 (2026-11-15 ~23:15 UTC, branch `ccr-93add0fa-q17ey6`) — nothing generated, nothing spent

| Item | State | Evidence |
|---|---|---|
| **Marble** | **Not connected.** marble.worldlabs.ai is a browser app signed in with the user's own login; Claude has no Marble connector. The programmatic route is the **Marble World API** (`https://api.worldlabs.ai/marble/v1`, header `WLT-Api-Key`): available, but no API key is configured in this environment | docs.worldlabs.ai/api (read 23:05 UTC); no network secret on the environment |
| **Atlas** | **Not connected** on this Claude account: no "World Labs Atlas" claude.ai connector (`ListConnectors` shows only Context7); `api.atlas.worldlabs.ai/mcp` answers **401**; `list_projects` cannot run | curl 401; connector list |
| World Labs plugin | **Installed**: `worldlabs@worldlabs` 0.2.2 (skills atlas-blender, atlas-splats, atlas-flythrough, worldlabs-cli). Its own MCP copy `plugin:worldlabs:worldlabs` is disabled for this project on purpose (one Atlas integration only) | `claude plugin list`, `claude mcp list` |
| Blender import | **Ready**: Blender 5.3.0 headless; `tools/blender/import_world_asset.py` dry run on a synthetic tunnel GLB → IMPORT_OK, radius measured 3.0 (true 3.0), `.blend` + underlay GLB written. Reads `.glb` (mesh) and `.ply` (splats); `.spz` must be exported as `.ply` (free in the API) | scratch dry run 23:10 UTC |

## Prices (official docs, read 2026-11-15 23:05 UTC)
**Marble World API** (billing separate from Claude AND from the Marble web app; 1,250 credits = US$1; minimum
purchase US$5 = 6,250 credits at platform.worldlabs.ai/billing; overage is invoiced monthly):
| Step | Credits | US$ |
|---|---:|---:|
| Draft world from one image (`marble-1.0-draft`) | 230 | 0.18 |
| Standard world from one image (`marble-1.1`) — splats SPZ 100k/500k/full, collider mesh GLB, 360° pano included | 1,580 | 1.26 |
| PLY splat export | 0 | 0 |
| High-quality mesh GLB (≈600k tris textured + ≈1M vertex-coloured) | 3,500 | 2.80 |

**Atlas** (separate World Labs developer billing at atlas.worldlabs.ai, 1,000 credits = US$1):
`posedImages2Splats` draft 500 ($0.50) / refined 5,000 ($5.00); `images2PosedRGBD`, `atlasGenerate`,
`atlasChisel`, `splats2Mesh`: not published, see the rate card in Atlas Settings → Developer Platform.

**Marble web app**: Free plan = up to 4 generations but **no export**; export (collider mesh, splats) needs
Standard; high-quality textured GLB needs Pro. Plan prices: marble.worldlabs.ai/pricing (client-rendered,
not readable from here).

## Proposed single pilot (awaiting the user's approval — NOT run)
Input: `geometry_ref/2_geometry_reference_05.png` (real pixels of the approved image, rows 197–767; 0 invented
pixels) + the prompt in `MARBLE_MANUAL.md`.
1. Draft world (230 credits, $0.18) → look at the pano/splats; stop if it does not read as the tunnel.
2. Standard world (1,580 credits, $1.26) → PLY export (free) + collider GLB → Blender import, align with the
   locked 05 camera (`qa/pilot05/wave6/camera_lock/`), render from that camera, compare with the reference.
3. Optional HQ mesh (3,500 credits, $2.80) only if step 2 shows the geometry is useful.
Total $1.44 for steps 1–2 ($4.24 with 3); the platform's minimum purchase is $5.
