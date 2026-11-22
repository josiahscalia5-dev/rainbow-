# Round 33 — can a new tool or agent bring Screen 05 closer to the approved picture? (2026-11-21)

Session branch `ccr-81d66c17-i0ooo8` (continues `ccr-c0679182-krbfci` / `claude/screen-05-3d-geometry-9yu7pu`, round 32).
**Nothing was installed, no account was created, no credits or money were spent, no approved artwork was uploaded anywhere.**
Only public web pages and the npm package listing were read.

The user asked for: Cuberta, SceneSim, Scenario YVO3D (first request), then AI Game Developer (ai-game.dev), and onGame /
Thrixel Build World only as alternatives. Rule from the user: recommend adopting a tool only after it has shown it does better than
the current Screen 05 approach. The approved picture is the target (`references/05_flow_into_the_current.png`); no AI re-design.

## What we already have (the bar a new tool must beat)
* Screen 05 build (round 32, merged in `backups/wip/screen05-agents/merged/`, workspace `docs/briefs/2026-11-21-r32/setup_r32.sh`):
  real 3D splat world reconstructed from the approved picture (Marble), ring-to-ring track, Benny GLB, swipe controls
  (lanes / leap / dive, camera springs), flowing water.
* Inspection and play-testing that already runs here (Linux, headless):
  - real finger swipes sent as touch events (Chrome DevTools `Input.dispatchTouchEvent`) on a 412×915 Android-portrait emulation;
  - a screenshot of every frame + mp4; per-frame game state (Benny's lane, side position, height, camera position and roll,
    coins, level progress) read straight from the running game;
  - automatic checks with fixed limits (`tools/marble05/viewer/final_acceptance.cjs`, `visual_check.py`, `acceptance_verdict.py`):
    teleports, freezes, every swipe answered, Benny inside the river, tilt / camera roll, dark patches, flicker, sharpness and
    colour likeness **measured against the approved picture**.

## Findings per tool

| Tool | What it really is | Fits our Three.js + splat game? | Reproduces the ORIGINAL art? | Cost / privacy | Verdict |
|---|---|---|---|---|---|
| **AI Game Developer** (ai-game.dev, Modalith) | Desktop app (Win/Mac/Linux x64) + CLI `@baizor/gamedev` 0.30.0, which is built on the Claude Agent SDK (the same Claude agent), + hosted MCP endpoint. Engine plugins for Unity / Unreal / Godot | Three.js support announced 2026-11-15, documented only for NEW projects from its own starters (Vite + TypeScript). Opening an existing project: one marketing line, no docs. No Three.js tool list. Gaussian splats / Spark: not mentioned | It adds no art source: it is a coding / testing harness | Free plan needs an account sign-in; paid $25–199/month. Its relay logs tool calls; its terms warn agents can delete files irreversibly | **Do not adopt.** Its claimed Three.js abilities (screenshots, scene tree, touch input, step frames, PASS/FAIL playtests) are what we already run, and it does not claim to compare against a reference picture |
| **Thrixel Build World** | AI 3D generation (part-structured models) + an agent that writes game code; exports to Three.js | Yes (GLB) | No: it GENERATES new 3D (a new AI interpretation) | Account sign-in; tested once in round 19 with the user's sign-in (Screen 04 foam, `qa/match/04/r19_thrixel/view_*.png`): **not an improvement** | **Do not adopt** |
| **onGame** | Not found under this name (closest: open-source AI game makers like OpenGame / OhMyGame that create new games) | — | — | — | Needs the exact link |
| **Cuberta** (Wandy3D) | Free desktop 3D editor, Windows / macOS only, driven by an AI agent over MCP; builds roads, buildings, terrain, interiors from its own kit | Exports GLB / FBX (loadable), but cannot run in this Linux cloud machine; needs the user's computer | No: kit pieces; custom curved tube, own image textures, GLB/image import are not stated | Wandy3D terms: free outputs belong to Wandy3D, non-commercial (unclear for Cuberta scenes); AI training on uploads ON by default | **Wrong kind of tool** |
| **Scenario YVO3D** | Image-to-3D (single objects, clean background) + Retexture (NEW textures generated from a reference image, "creativity" slider) | GLB output (loadable) | No: Retexture repaints with AI; Image-to-3D is for props, not a tunnel | Credits (free tier 50; per-job price not published); self-serve content may be used to improve their models, no opt-out stated; free outputs for personal / evaluation use only | **Do not upload the approved art** |
| **SceneSim** | Not found (closest: SceneSmith, a research tool for indoor robot-simulation scenes) | — | — | — | Needs the exact link |

## Why none of them fixes the real problem
The approved Screen 05 is ONE painted picture from ONE viewpoint. A playable level has to show things the picture never shows:
walls Benny swims past, the river beyond the next bend, the sides when he moves left or right. Every tool above fills those gaps either
by generating new art with AI (a new interpretation, which the user forbids) or with its own kit pieces. Inspection, touch input and
play-testing are not the bottleneck; we already measure those every frame.

## What can actually get closer (in order)
1. **Finish the current round-32 build** (free, running now): pass the fixed-limit acceptance with real swipes, fix what fails.
   Short-section baseline run: `/tmp/rainbow_r32/runs/merged_short/` (results added to this file when it finishes).
2. **A game-ready modular tunnel kit made from the ORIGINAL pixels**: one ring segment, the perforated purple wall panel, the gold
   ring, the S-river as a spline mesh, foam banks; textures cut and tiled from the approved painting itself (no AI repaint), so the
   tunnel stays sharp for the whole level and is far lighter on Android than ~0.8 M splats.
   * Free route: our `washer-environment-modeler` specialist in Blender 5.3 (installed here).
   * Paid route: a human 3D environment artist (needs a quote and the user's OK; nothing spent).
