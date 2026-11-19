# Marble World API pilot — credit ledger (user-approved cap: US$5 = 6,250 credits; no auto-recharge)

Key: new key saved by the user through the secure credential form (host `api.worldlabs.ai`, header
`WLT-Api-Key`), injected by the session proxy. It is not in git, transcripts or source files. The exposed
account-7 key was not reused.

| UTC (2026-11-16) | Call | Result | Credits before → after | Spent total |
|---|---|---|---:|---:|
| 00:52 | `GET /credits` (authentication test) | 200 | 7,000 | 0 |
| 00:53 | `POST /worlds:list` | 200, **0 worlds** (lists API-created worlds only) | 7,000 → 7,000 | 0 |
| 00:54 | `GET /worlds/f0be2178-4291-4f90-848f-6506b53cc87d` (user's web-app world "Vibrant Tunnel of Fortune") | **404 "World not found"** → website world NOT accessible to this API account | 7,000 → 7,000 | 0 |
| 00:55 | `media-assets:prepare_upload` ×3 + PUT (input image) | 200 (free) | 7,000 | 0 |
| 00:55 | `worlds:generate` **marble-1.0-draft** → world `5fd3d7a7-21ae-45c7-a3fe-b7ed47bdd13f` | done in ≈30 s | 7,000 → **6,770** | **230** |
| 00:56 | `worlds/5fd3d7a7…:export` splats PLY 500k | 200 (free) | 6,770 → 6,770 | 230 |
| 00:58 | `worlds:generate` **marble-1.1** (full quality) | running | 6,770 → … | … |

Input for both worlds: `qa/worldlabs/05/geometry_ref/2_geometry_reference_05.png` (approved 05 image rows
197–767, real pixels only) + `prompt_05.txt`.

## Draft result (`draft/`)
* Files: `collider.glb` (35,795 tris), `splats_100k.spz`, `splats_500k.spz`, `splats_500k.ply` (free export),
  `thumbnail.png`. Blender import: `draft/import/draft05.blend`, underlay GLB, preview.
* Reads as the approved tunnel (thumbnail): purple slotted walls, receding gold rings with spot lights,
  copper-gold fittings, winding cyan/pink river with foam into a warm VP.
* Splat measurements (`draft/analysis/splat_measure.json`): wall radius 1.71; ring spacing median 1.49
  (gaps 1.43/1.61/1.49/1.53) → **spacing/radius ≈ 0.87**; river width ≈ **0.71 × diameter**; wall mean
  rgb(184,71,160). Unrolled wall: `draft/analysis/wall_unrolled.png`.
