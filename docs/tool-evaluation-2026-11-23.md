# Tool evaluation for faster matching of Screen 05 (2026-11-23, ~18:00 New York time)

Requested by the user: evaluate Unity AI Material Generator, the free ShoreLine water package and Material Maker; test only the
most promising one on one small section; keep a change only if the real Unity Game view gets visibly closer to the approved
image during gameplay; conserve credits; avoid unnecessary installations.

Context: the measured gaps are mostly SHAPES / LAYOUT (camera framing, tunnel cross-section and ring spacing, river width and
curves, foam layout), not surface textures (`tools/screen05-measure.ps1`: look 52 / exact 33 overall; Benny 70 look is the
closest area). None of the three tools changes geometry or composition.

## 1. Unity AI Material Generator (https://unity.com/blog/unity-ai-material-generator)
* Makes tileable PBR materials (base colour, de-lit colour, normal, height, metallic, smoothness, AO, emission) from a text prompt,
  optionally guided by a "pattern reference" (tiling pattern) or an "image reference".
* Needs Unity 6, the `com.unity.ai.generators` package in the project, the project linked to Unity Cloud and the AI terms
  accepted (our project was created `--no-cloud`); the Unity CLI also offers a beta `ai` plugin (`unity plugin install ai`, not
  installed) that generates textures/PBR materials from the command line.
* Cost: Unity AI credits, managed in the Unity Cloud Dashboard (https://cloud.unity.com/home/ai/settings). The blog states no free
  allowance for Unity Personal (only a free trial). Credits could NOT be checked: the CLI is signed in but has no active
  organization, and the browser pane is not signed in to Unity (the user must sign in there themselves).
* Fit: could add surface detail (perforated metal plates, polished gold) but not the tunnel/ring/paddle shapes that dominate
  the gap. Using a crop of the approved painting as the "image reference" would send the user's art to the cloud, includes
  painted perspective and lighting (poor tiling source) and risks a redesigned look - prefer text prompts if ever used.
* Verdict: not now. Revisit for small surface-detail maps only if the user confirms credits and approves the install.

## 2. ShoreLine - Stylized Water for URP (Asset Store 432064)
* Free, 1.9 MB, publisher hardartcore, version 1.0 released 2026-11-19, no ratings yet, no feature description or documentation
  on the store page, compatibility listed only for Unity 6000.0.84 (we use 6000.3.29), URP only.
* Standard Unity Asset Store EULA: its source may not be redistributed, so it could not be pushed to the user's PUBLIC GitHub
  branch -> the GitHub copy of the project would be incomplete. Importing also means an Asset Store account action and an
  install/recompile in the project.
* Its likely techniques (depth-based shoreline / intersection foam, depth colour, refraction) are standard. Our URP asset already
  has the depth AND opaque textures on (PC_RPAsset), and our splash / spray / bubble shaders already read scene depth.
* Verdict: do not import. Borrow the water-contact idea in our own code instead (no install, no licence issue, saved to GitHub).

## 3. Material Maker (https://materialmaker.org/)
* Free (MIT), v1.8, 104 MB Windows zip, Godot-4 based (Vulkan; anecdotal crashes on Intel integrated GPUs), node-based
  procedural authoring, exports PNG maps + a Unity .mat (URP support unclear), headless export exists, no image-to-material.
* Verdict: skip. Our materials are procedural shaders written directly in code (resolution-free, already tuned to the
  original game); baked textures would add memory on the N150 and need a big download without closing the layout gaps.

## Decision: the one small test
Most promising = the ShoreLine-style WATER-CONTACT technique, implemented natively at Benny's waterline (the user's explicit
requirement: Benny must look naturally supported by the water). Current issue from the round-2 splash agent: Benny's round
bottom is cut flat by the opaque water at y ~1175 with a thin light line; the approved shows a round bottom that darkens into
the water with a bubbly contact. Test plan (after round 2 finishes, never while its agents run cycles): an analytic
"see-into-the-water" absorption + thin contact foam line around Benny's footprint in the wake section of `RainbowRiver.hlsl`
(Benny's position is already passed as `_RainbowBenny`), judged on the `splash` + `benny` crops, the measure tool and the
steer/jump checks; keep only if visibly closer during gameplay, otherwise revert the experiment.
