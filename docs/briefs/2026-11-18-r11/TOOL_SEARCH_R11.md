# Round 11 — tool search (lead, 2026-11-18 ~12:10 UTC). Adds to `docs/briefs/2026-11-18-r10/TOOL_EVALUATION.md` (read that first).

Searched: Claude plugin directory (`SearchPlugins`: blender, 3d reconstruction, three.js, image to 3d, texture projection,
gaussian splatting, photogrammetry, game development) and the MCP connector registry (`SearchMcpRegistry`: blender, 3d model
generation, image to 3d, hugging face, comfyui, texture material, three.js, gaussian splat). Hugging Face checked with free API reads.

| Capability | Exists / verified | Verdict |
|---|---|---|
| Plugin `parallax-threejs` (Anthropic Directory, community) | yes — Three.js/GLSL debugging + SHA-indexed visual regression (chrome-devtools, playwright, spector, threejs-devtools MCPs) | REJECT: debugging only; Playwright + Chrome DevTools MCP already cover it; reconstructs nothing |
| Connector "Three.js 3D Viewer" | yes — demo viewer | REJECT |
| Nothing in the plugin directory or connector registry reconstructs a painting into matching 3D, fits scenes to a reference image, or automates Blender (Blender 5.3 already runs headless here) | — | — |
| **Connector "Hugging Face"** (Hub + Gradio Spaces on HF GPUs; not installed; needs the user's HF account) | yes | **CANDIDATE** — only route here to GPU-only models (no GPU in this container) |
| **Stable Virtual Camera** (Stability AI; Space `stabilityai/stable-virtual-camera`, 511 likes; model `stabilityai/stable-virtual-camera` GATED, licence "other" = Stability AI Community Licence, accept on HF) | yes | **CANDIDATE**: one picture (+ a camera path) → a CONSISTENT sequence of novel views along that path. Directly targets the unseen 77–86 % of stages 04/06/07: views of the approved design along the GAME's own camera path, reviewed by the user, then camera-projected onto real geometry (multi-view 08 method). Unknown on stylised art; invents what the picture hides. NOT YET PROVEN. |
| **ViewCrafter** (Space `Doubiiu/ViewCrafter`, model `Drexubery/ViewCrafter_25`, Apache-2.0) | yes | CANDIDATE (same role; point-cloud guided) |
| Depth Anything 3 | installed + tested (`DA3_TEST.md`) | keep: measures the large shapes of each approved / approved-supplemental view |
| World Labs Marble, fal nano-banana-2/edit | working (keys re-entered) | keep; paid jobs only with the user's approval; user: no new Marble worlds |
| TRELLIS.2, Hunyuan3D, Scenario YVO3D, Substance Sampler, Mitsuba 3 | see TOOL_EVALUATION.md | unchanged verdicts |

Next step needing the user's OK: connect the Hugging Face connector (free account tier) + accept the Stable Virtual Camera
licence on HF, then a free test: approved 04 (or 06) clean plate + the game camera path → 8 views → compare by eye.
