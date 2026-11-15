# Screen 05 — World Labs Atlas pilot plan (NOT RUN — awaiting approval)

> **ATLAS ACTIVE — 2026-11-15 ~22:20 UTC (account 6):** after the user re-signed in, `list_projects` (free) answers:
> project **"My project"** (`proj_ad4fdb076f4a4c80934406cfefc4d30b`, workspace "Personal workspace"),
> `credits_available: true`, task tools `atlasChisel`, `atlasGenerate`, `atlasTextToImage`, `images2PosedRGBD`,
> `posedImages2Splats`, `splats2Mesh`. Still nothing run, nothing spent: every task tool uses credits and needs the
> user's explicit approval of the named step first.

> **Re-checked 2026-11-15 ~20:10 UTC (account 4):** `list_projects` still answers "no active Atlas account". Nothing run, nothing spent. What is missing, the Marble manual route, the clean environment plate and the Marble prompt: see `MARBLE_MANUAL.md`.

Status 2026-11-15: the claude.ai **World Labs Atlas** connector is attached to the Rainbow session and its
10 tools load, but `list_projects` answers "this sign-in has no active Atlas account". Nothing has been
submitted and **no credits have been spent**. Every step below that uses credits needs the user's
explicit approval with the cost shown first.

## Inputs (prepared, originals untouched)

| File | What |
|---|---|
| `references/05_flow_into_the_current.png` | approved original, 864×1536, SHA-256 `d3f339d4…` (verified unchanged) |
| `qa/worldlabs/05/05_env_mask.png` | 8-bit mask on the same grid: 255 = keep (tunnel, rings, lids, water, foam, bubbles), 0 = exclude (HUD bar + stage label, Benny + splash, coin trail). 67 % of pixels kept |
| `qa/worldlabs/05/05_env_only_preview.png` | review image: the original with excluded areas greyed |

## Goal and honest expectations

Atlas reconstructs a scene from images as **posed RGBD views → Gaussian splats → optional GLB mesh**.
For Rainbow its value is **measurement and reference**, not finished game geometry:
* recover the reference camera (FOV, height, pitch) and a depth map of the tunnel, so the procedural
  tube radius, ring spacing/thickness, lid positions and water width can be calibrated to the image;
* optionally a splat/mesh of the tunnel section to load in Blender as a modelling underlay.
The playable tube, rings and animated cyan/pink water stay real-time Three.js geometry/shaders owned
by the environment modeler and the Water FX specialist (CLAUDE.md: no static splat/video substitutes).
A single stylised painting has no real parallax, so new views beyond ±10–15° are invented by the model
and must be checked against the reference before use.

## Proposed steps (cheapest, most useful first)

| # | Atlas tool | Purpose | Credits (official docs) |
|---|---|---|---|
| 0 | `list_projects` | confirm account, project, allowed tools, paid-work flag | free |
| 1 | `create_image_upload` + PUT | upload the approved 05 image (and mask) to the project | free (asset upload does not consume credits) |
| 2 | `images2PosedRGBD` (1 frame) | camera intrinsics/pose + per-pixel depth of the reference → measure tunnel radius, ring spacing, vanishing point, camera FOV | **not published** — read the rate card under Settings → Developer Platform before approving |
| 3 | `atlasChisel` (optional) | inpaint the masked areas (Benny/HUD/coins) to get a clean environment-only plate | **not published** (rate card) |
| 4 | `atlasGenerate` 8–12 views along the tube axis | extra consistent views down the tunnel for reconstruction | **not published** (rate card) |
| 5a | `posedImages2Splats` draft (`refine:false`) | quick splat check, ~30 s | **500 credits = $0.50** |
| 5b | `posedImages2Splats` refined | final splats, ~15–21 min | **5,000 credits = $5.00** |
| 6 | `splats2Mesh` | GLB mesh of the tunnel for Blender underlay | **not published** (rate card) |

Atlas billing: 1,000 credits = US$1; credits do not expire; a monthly spend limit can be set per account
or project (Settings → Developer Platform). Source: docs.atlas.worldlabs.ai/billing.md and
docs.atlas.worldlabs.ai/posed-images-to-splats.md (read 2026-11-15).

**Recommendation:** approve step 2 alone first (one call). Its depth/camera output is enough to calibrate
the manual build. Decide on 3–6 only after comparing that result with the reference.

## After Atlas (no extra credits)

1. Blender 5.3 (headless, installed): import depth/camera (and splats/mesh if made), measure ring spacing,
   tube radius, lid angles; write the numbers into the environment/course parameters.
2. Re-capture 05 with Playwright at 864×1536, compare against the reference and the manual-only build
   (`qa/pilot05/*`), and record time spent and corrections needed for A (Atlas-assisted) vs B (manual).
3. Keep the 07→08 61-unit descent and `npm run test:continuity` green.
