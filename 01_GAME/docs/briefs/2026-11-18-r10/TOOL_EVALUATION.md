# Round 10 — tool evaluation for reproducing the approved screens 04–08 (lead, 2026-11-18 ~10:40 UTC)

Facts checked this session (web sources + this container). Nothing below is tested on the Rainbow art yet unless it says
"TESTED". This container: 4 CPUs, 15 GB RAM, **no GPU**; Hugging Face + PyTorch download hosts blocked until the user
approves `PENDING_ENVIRONMENT_REQUEST.md`.

## Root cause the tools must address (measured, `qa/review_c10/2026-11-18/README.md`)
Each approved picture is ONE painted viewpoint. At that viewpoint the game already matches 79–89 % of the whole frame
(94–99 % of the scenery). While Benny swims, the camera sees places the picture never shows (04: the inside of the washer
opening, ~80 % of the stage; 07: the plunge, 68 %; 06: the straight run + turn). Those parts are where every screen fails.
No tool can copy what the picture does not contain; the best possible is a FAITHFUL CONTINUATION of the painted design.

| # | Tool (exact name) | Exists / type | Usable here now? | Cost | What it could fix | Verdict |
|---|---|---|---|---|---|---|
| 1 | **Depth Anything 3** (ByteDance Seed) | yes; open-source model (GitHub + Hugging Face weights; licence varies by checkpoint: Apache-2.0 / CC BY-NC) | after host approval; CPU inference (slow, fine for stills) | free | MEASURE the painted architecture: depth + camera field of view from one picture → exact proportions of 04's opening and inner funnel, 06's bent tunnel / S-loop, 07's tube. Does not invent unseen parts. Unknown on stylized art. | **Test first (free).** |
| 2 | **MoGe-3** (Microsoft) on fal `microsoft/moge-3` | yes; hosted API on the user's existing fal account | yes (fal key works) | paid, small per image (quote before use) | same role as #1 (point map, depth, normals, FOV, optional GLB) | fallback for #1 |
| 3 | **Depth/edge-guided image generation** (ControlNet in ComfyUI; hosted equivalents on fal) | yes; ComfyUI needs an NVIDIA GPU (none here) → fal hosted endpoints | via fal | paid per image (quote before use) | the CONTINUATION problem: images of the approved design from viewpoints the picture does not show, locked to OUR geometry's depth/edges, each reviewed by the user before use, then projected like the 08 method | **most promising for unseen areas**; needs approval + user review of every view |
| 4 | **TRELLIS.2** (Microsoft, MIT, 4B) | yes; needs ≥ 24 GB NVIDIA GPU; also on fal `fal-ai/trellis-2` | via fal only | paid | single OBJECTS with PBR maps → GLB (08 spout cups, washer door, paddles). Not tunnels, water or whole environments. | low value: these props are simple shapes Blender builds exactly from the picture |
| 5 | **Hunyuan3D v3 / v3.1** (Tencent) on fal | yes; hosted | via fal | paid | same as #4 | low value, same reason |
| 6 | **Scenario YVO3D Retexture** (`model_yvo3d-retexture`) | yes; Scenario platform (GLB in, optional reference image, AI textures up to 8K) | no (needs a Scenario account) | paid compute units (per-run price not published) | re-textures existing GLBs | **not recommended**: generates NEW textures "guided" by the picture (reinterpretation); the projection / tiles already use the user's exact pixels |
| 7 | **Adobe Substance 3D Sampler** (Image to Material) | yes; desktop app (Windows 11, macOS 13+, RHEL Linux only) | no (no desktop here; user's own computer) | Texturing plan $24.99/month | flat photo → tileable PBR material. Our walls are curved and in perspective, so they must first be unwrapped (our scripts already do that); Sampler would then add relief / roughness | optional, modest gain; Blender/Python can derive normal/roughness from the unwrapped tile |
| 8 | **Differentiable rendering** — PyTorch3D (GPU-oriented), nvdiffrast (CUDA only), **Mitsuba 3** (CPU via LLVM, on PyPI) | yes; open-source | Mitsuba 3 installable now | free | automatic fitting of geometry / texture parameters to the approved picture instead of hand-tuning | useful later for precise parametric fits (ring spacing, radius, river curve); does not solve unseen areas |
| 9 | **Hugging Face connector** (claude.ai connector directory) | yes; MCP connector, not connected | user connects it on claude.ai | free quota; paid Pro raises it | runs DA3 / TRELLIS.2 demo Spaces on Hugging Face GPUs without this container's network | alternative path to #1 |
| 10 | World Labs Marble | have (key works, 5,420 credits) | yes | paid credits | — | user: no more Marble generations; agreed |
| — | Claude plugin directory / MCP registry (searched: 3D, image-to-3D, Blender, texture, splat, depth, Meshy, Tripo, Rodin, Hunyuan3D, World Labs, fal, ComfyUI, Scenario, Substance, Adobe) | — | — | — | nothing that reconstructs a painting into matching 3D; Adobe's plugin has no Substance 3D; no Blender connector (Blender 5.3 already runs headless here) | — |

## Problem → tool map
| Screen | Problem (by eye) | Class | Best tool / method |
|---|---|---|---|
| 04 | inside the opening becomes a long orange corridor + rows of foam balls | A + E | DA3/MoGe-3 to measure the painted inner funnel (visible through the opening) → rebuild as real geometry + painted tiles; guided views (#3) for what the picture never shows |
| 05 | river tears / stretches, foam banks missing, walls smear | B + C | existing pipeline (continuous river surface, world-anchored painted design, foam clusters); no new tool needed — specialist running |
| 06 | centred bullseye + straight ribbon instead of the off-centre bent tunnel and S-loop | A | DA3/MoGe-3 to measure the bend and loop; Mitsuba fit for ring layout |
| 07 | plunge (68 % of the stage) never shown in the picture | E | guided views (#3) or a human environment artist; course/camera change only with the user's OK |
| 08 | arch lost when moving, top seam, smeared near water, big coins | A/B/C | existing pipeline — specialist running |
