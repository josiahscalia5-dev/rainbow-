# Screen 04 — single foam-cluster 3D-model test (round 19, 2026-11-19 ~19:30 UTC) — PREPARED, NOT RUN

Goal (user): one rounded foam cluster that closely follows the approved Screen 04 foam (shape + soft look), inspect the model
before adding detail, import it into a SEPARATE candidate (URL switch) with the existing camera and lighting, then show
APPROVED / in-game result from the same camera + a short moving view, and report whether it improved the match + credits used.
Benny, route, water behaviour, controls and all completed work stay untouched. First test = is the tool useful before
spending on more assets.

## Reference picked
Right-bank foam heap beside Benny in `references/04_through_the_five_arrows.png`, frame x 600–864, y 980–1200
(soft pearly lilac-white rounded bubbles on the cyan water). Files here:
* `cropR.png` (2× crop), `cropL.png` / `cropB.png` (other candidates: left bank heap, bottom-right heap)
* `mask_viz4.png` (cutout check) and **`input_foamR_rgba.png`** = the model input: the cluster cut out onto transparency,
  1024 × 1024 (GrabCut upper edge + hand-traced waterline; the bottom edge sits under the water in game anyway).

## Tool attempts
* **Thrixel** (user's choice, FREE allocation only; custom connector `https://api.thrixel.com/mcp`): at 19:40 UTC the
  connector is listed on the account but `installState: connect_incomplete`, not connected, not loaded in session
  `ccr-d00ac5ec-gabdsh` (connectors load at session start). → run the test in a FRESH session after the user completes the
  Thrixel sign-in at claude.ai/customize/connectors. Check the free allowance first; use only the free allocation.
* **fal.ai TRELLIS** (`fal-ai/trellis`, $0.02 / generation, user OK "Fal.ai but whatever u think is the best one"):
  request `01a1f54f-23af-7380-9e10-67737d651233` REJECTED on input (`texture_size` must be the number 1024, not the
  string "1024"); no model produced; a request rejected at input validation is normally not billed (balance not readable
  from this environment). Stopped there when the user switched to Thrixel. If the user wants fal again: same payload
  with `"texture_size": 1024` (integer), seed 42, `mesh_simplify` 0.95 → `model_mesh.url` (GLB). Higher detail later only
  if the cheap model looks promising (TRELLIS-2 $0.25–0.35, Hunyuan3D v2 $0.16).

## Candidate base for the integration
Approved combined Screen 04 preview v2 = `claude/rainbow-s04-preview-c18` @ `c338978b`, query
`qa/match/04/r18/PREVIEW_QUERY_v2.txt` (shots + motion recipe in `qa/match/04/r18/preview_v2/NEW/`). Put the model behind a
new switch (e.g. `&m04glbfoam=1`) on a new branch from that commit; place it on the right bank where the painted heap sits
(at the approved view it must sit over the painted heap; while swimming it must stay a solid 3D heap). Compare APPROVED /
BEFORE (v2 query) / NEW (+ switch) at a00, f03, f06, f10 + a half-size swim clip; start view must stay 0 px elsewhere.
