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
| 00:58 | `worlds:generate` **marble-1.1** (full quality) → world `c0c9dc57-afa3-4330-b2f0-9c6d4dddfef9`, operation `12a08430-f687-4a09-bdc7-3a469c76363d` | done in ≈5 min | 6,770 → **5,190** | **1,810** |
| 01:06 | `worlds/c0c9dc57…:export` splats PLY 500k | 200 (free) | 5,190 → 5,190 | 1,810 |

| 01:35 | `GET /credits` (transfer session `94cf04e3`; key saved by the user via the secure credential form on this account's Default environment) | 200, **5,190** | 5,190 → 5,190 | 1,810 |
| 01:35 | `GET /worlds/5fd3d7a7…`, `GET /worlds/c0c9dc57…` (free reads) → `*/world_refresh_2026-11-16.json` | 200, both worlds present, assets unchanged except the draft now lists a pano | 5,190 → 5,190 | 1,810 |
| 01:36 | CDN download of the draft pano → `draft/pano.png` (2304×1152, sha256 `e524cf6c…98d5`) | 200 (free) | 5,190 → 5,190 | 1,810 |

| 17:00–17:35 | Screen 05 feasibility test on the two EXISTING worlds (local files only: splats, pano; `qa/pilot05/marble_feas/`) — no API call (the API host was refused by this session's network policy anyway) | local | 5,190 (last verified 01:35) → unchanged | 1,810 |

**Balance reported by the API at hand-off: 5,190 credits (re-read 01:35 UTC by the transfer session). Spent 1,810 of the 6,250-credit (US$5) cap.
Remaining approved budget: 4,440 credits.** Not yet bought: HQ mesh export (3,500 credits, US$2.80) — only if
it materially helps the playable game; ask the user first.

## Assets saved in git (large files in Git LFS; signed URLs stripped from the saved responses)
| World | Folder | Files |
|---|---|---|
| draft `5fd3d7a7-21ae-45c7-a3fe-b7ed47bdd13f` (op `4a549a9d-3de2-424b-8324-db24a8d1b9bd`, `marble-1.0-draft`) | `draft/` | `collider.glb`, `splats_100k.spz`, `splats_500k.spz`, `splats_full_res.spz` (26 MB), `splats_500k.ply` (free export), `thumbnail.{webp,png}`, `world.json`, `operation_response.sanitized.json`; no pano for drafts; Blender `import/draft05.blend` + `draft05_underlay.glb` + preview + `draft05_measure.json`; `analysis/` (splat_measure.json, wall_unrolled.png, bay_unrolled.png, bay_measure.json) |
| full `c0c9dc57-afa3-4330-b2f0-9c6d4dddfef9` (op `12a08430-f687-4a09-bdc7-3a469c76363d`, `marble-1.1`) | `full/` | `collider.glb`, `splats_100k.spz`, `splats_150k.spz`, `splats_500k.spz`, `splats_full_res.spz` (30 MB), `splats_500k.ply`, `pano.png` (4608×2304) + `pano_preview_2048.jpg`, `thumbnail.{webp,png}`, `operation_response.sanitized.json`; Blender `import/full05.blend` + underlay + preview; `analysis/` |

Recovery if a file is ever missing: `git lfs pull`; otherwise with a World API key for the SAME platform
account: `python3 -I tools/worldlabs/marble_pilot.py world <world_id> out.json` (fresh signed URLs, free read),
PLY via `… export_ply <world_id> 500k out.json` (free). Both worlds are private to that API account.
Web viewer: `https://marble.worldlabs.ai/world/<world_id>`.

## Full-quality result (`full/analysis/`)
* Wall radius 1.66; clean ring gaps 1.58 / 1.52 → **ring spacing ≈ 0.93 × radius** (double ring lips show as
  extra close peaks); river width ≈ **0.73 × diameter**; wall mean rgb(178,62,160); ring bands ≈ 6–8 % of the
  spacing on the well-covered rings. Splats cover only ≈ 8.4 units of tunnel near the camera (the far tunnel is
  sparse): use it as a near-field modelling/texture reference, not as a whole-level mesh.
* Scripts (no secrets; key injected by the proxy): `tools/worldlabs/marble_pilot.py`, `analyze_splats.py`,
  `bay_texture.py`.

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

| UTC (2026-11-17) | Call | Result | Credits before → after | Spent (this key/account) |
|---|---|---|---:|---:|
| 12:54 | `GET /credits` (new key, user-saved via secure form on the `rainbow-` environment) | 200 | 7,000 | 0 |
| 12:54 | `worlds:generate` **marble-1.1**, Screen 08 environment-only clean plate (Image-Blaster test, user-approved) → world `32b5b2f4-32bc-4fa5-80a5-861129a528c8`, op `0de603c2-c44f-47d1-b3c6-be4c05506dce` | done ≈5.5 min; files in `qa/imageblaster/08/world/` | 7,000 → **5,420** | **1,580** |

## Round 32 (2026-11-21, session branch `claude/screen-05-3d-geometry-9yu7pu`) — user: "I want to use my existing 5,420 World Labs Marble credits … not agreeing to pay $5 cash or purchase additional credits"
Atlas (separate product, own account + credits at atlas.worldlabs.ai) is NOT usable with these credits: no Atlas job, no purchase.
| UTC | Call | Result | Credits before → after |
|---|---|---|---:|
| 03:5x | `GET /credits` | 200 | 5,420 |
| 03:5x | upload `qa/worldlabs/05/r32/input_05_clean.png` (approved 05 plate, Benny / coins / HUD removed, full frame 1080×1920) | 200 (free), asset `0d12279c-9d49-4cef-9cdd-9f9d16ae7307` | 5,420 |
| 03:5x | `worlds:generate` **marble-1.0-draft**, operation `6682dee2-3162-4b75-9c2e-62d6f4ed191b` | started | 5,420 → (230 expected) |
| 03:4x | draft done: world `f3226155-5633-4e41-bbd5-f58a3f584c26` (splats 100k / 500k / full, collider) | 200 | 5,420 → **5,190** (230) |
| 04:0x | user: "U can use 1580 for full quality from my credits" → `worlds:generate` **marble-1.1**, operation `b03e1e8d-f200-4a8d-b16a-91128a11643d` | started | 5,190 → (1,580 expected → 3,610) |
| 04:14 | full done: world `8bb4cf11-9615-4879-8f2f-8a1cb6002ff7` (splats 100k / 500k / full, collider, pano) | 200 | 5,190 → **3,610** (1,580) |
| 10:16 | user: "Yes, run the Marble 1.1 Plus test" → `worlds:generate` **marble-1.1-plus** (same clean input + prompt), operation `0f1d7a46-40f9-4134-8db4-8d4c3fc5f9fc` | started | 3,610 → (1,580–3,080) |
| 10:22 | plus done: world `3657fa05-d90a-4ad9-acdb-70f0145d5796` (splats 100k / 150k / 500k / full) | 200 | 3,610 → **2,030** (1,580) |
