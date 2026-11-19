# Can Claude reach the user's existing Marble world "Vibrant Tunnel of Fortune"? (2026-11-16, account 8)

Nothing generated, nothing spent, no key used. Sources: official docs read 2026-11-16
(docs.worldlabs.ai/api, …/reference/worlds/get.md, …/worlds/list.md, …/worlds/export.md, …/api/pricing.md,
…/api/faq.md, …/marble/support/account-billing.md, docs.worldlabs.ai/llms-full.txt).

## Findings
| Route | Can it read a website-made world? | Evidence |
|---|---|---|
| claude.ai **World Labs Atlas** connector (connected; `list_projects` OK → "My project", credits available) | **No.** Atlas is a different product: its 11 tools generate images/depth/splats/meshes; none lists or opens Marble worlds | tool list in this session |
| **Marble World API** `GET https://api.worldlabs.ai/marble/v1/worlds/{world_id}` (header `WLT-Api-Key`) | **Unconfirmed.** Docs: "Only the world owner or users with access to public worlds can retrieve them." But the World endpoints "start generation jobs and manage worlds created through the API", and `worlds:list` "Returns worlds created through the API". Nothing says web-app worlds are included or excluded | get.md, list.md, llms-full.txt |
| Marble web-app export (marble.worldlabs.ai) | Yes, but **Free plan cannot export**; splats (SPZ/PLY) + collider mesh need Standard; HQ textured GLB needs Pro | marble export docs + pricing pages |
| Third-party "worldlabs-mcp" servers (e.g. github.com/sandraschi/worldlabs-mcp, glama listings) | Add no access: unofficial wrappers around the same World API, needing the same API key. Not installed | search 2026-11-16 |
| Pulling the splat files out of the web viewer's network traffic | Not done: it would bypass the export restriction | user rule |

## What a test would need (only with the user's go-ahead)
1. The world's ID (the part after `marble.worldlabs.ai/world/` in its URL).
2. A NEW World API key from platform.worldlabs.ai (signed in with the Marble login), given through the secure
   credential form for host `api.worldlabs.ai`, header `WLT-Api-Key` (never in chat or git). The account-7 key
   was exposed and must never be reused. The quickstart says to add a payment method and buy credits "to get
   started" (minimum US$5 = 6,250 credits); whether a key works for free read-only calls without a purchase is
   not stated. API billing is separate from the Marble subscription; Marble app credits cannot be used.
3. One `GET /marble/v1/worlds/{id}` (a read; not listed as a credit cost). If it returns the world, its
   `assets.splats.spz_urls` + `assets.mesh.collider_mesh_url` are already-generated files; PLY export is free
   (`POST …/worlds/{id}:export {"asset_type":"splats","format":"ply"}`); HQ mesh export = 3,500 credits (US$2.80),
   needs approval. If it returns 403/404, web-app worlds are not reachable by the API for this account.
4. Import with the existing credit-free tool `tools/blender/import_world_asset.py` (see `MARBLE_MANUAL.md`).

## Meanwhile
The user's screenshot of the world is stored as a secondary reference:
`qa/worldlabs/05/marble_user_world/vibrant_tunnel_of_fortune_screenshot.{webp,png}` (1366×555; original webp
SHA-256 `9f03860a…2a75`). The approved `references/05_flow_into_the_current.png` always takes priority.
