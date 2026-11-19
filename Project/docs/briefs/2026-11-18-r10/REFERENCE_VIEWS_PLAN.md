# Round 10 — additional reference views for the parts of 04 / 06 / 07 the approved pictures do not show

User order 2026-11-18 ~10:55 UTC: "STOP GUESSING WHAT THE UNSEEN ENVIRONMENTS SHOULD LOOK LIKE. … identify the exact portions of
the existing course that are not visible in my approved pictures. Create additional visual reference views for those portions
using the original artwork's exact architecture, colors, water design, materials, and style. Show me these proposed views for my
approval BEFORE treating them as the designs to reconstruct. Do not alter or replace my original approved images." For those
portions, finished 3D renders are compared against the view the user personally approved.

## Unseen portions (fixed course, measured with `tools/lead_r6/motion_audit.mjs`, `qa/review_c10/2026-11-18/all_shots/*/motion.json`)
| Screen | Stage s0 → s1 (length) | Painted camera | Shown by the approved picture | NOT shown |
|---|---|---|---|---|
| 04 | 77.41 → 114.69 (37.3 u) | s 78.31 | the approach to the washer opening (opening ≈ 6–8 u ahead) | s ≈ 86 → 114.7: inside the opening to the 05 hand-over (≈ 29 u, 77 %) |
| 06 | 198.91 → 242.87 (44.0 u) | s 199.59 | ≈ first 6 u (BLUEPRINT_06: composition replaced from f06) | s ≈ 205.5 → 242.9: crest, straight run, 06→07 turn (≈ 37 u, 86 %) |
| 07 | 273.06 → 390.16 (117.1 u) | s 273.80 | the level stretch (approximately) up to the plunge top s ≈ 310.4 | s 310.4 → 389: the vertical plunge (79 u, 68 %) |

## Proposed viewpoints (11) — each = the live game camera at that course position (Benny where the game puts him)
| View | Course position | Current-game frame used as viewpoint guide (`scratchpad/audit_c10/<NN>/…`) |
|---|---|---|
| V04-1 just inside the opening | s 88.1 | 04/f10_forward10u.png |
| V04-2 middle of the interior | s 98.2 | 04/f20_forward20u.png |
| V04-3 end, before 05 | s 113.7 | 04/t95_through_screen.png |
| V06-1 after the painted view | s 209.6 | 06/f10_forward10u.png |
| V06-2 middle | s 219.6 | 06/f20_forward20u.png |
| V06-3 two-thirds | s 228.6 | 06/t66_through_screen.png |
| V06-4 turn into 07 | s 241.3 | 06/t95_through_screen.png |
| V07-1 end of the level stretch | s 293.7 | 07/f20_forward20u.png |
| V07-2 plunge top | s 312.5 | 07/t33_through_screen.png |
| V07-3 mid-plunge | s 351.1 | 07/t66_through_screen.png |
| V07-4 plunge bottom, entering 08 | s 385.1 | 07/t95_through_screen.png |

## Method (needs the user's approval: PAID)
* fal `fal-ai/nano-banana-2/edit` (the model that made the 04 and 08 plates), 2K, ≈ $0.12 per image (fal's published rate).
  Input image 1 = the screen's APPROVED picture (sole design authority, never modified); image 2 = the viewpoint guide
  (current game frame: only the camera position, tunnel / path direction, horizon and Benny's place are taken from it).
* Prompt core: "Image 1 is the approved design and the only authority. Show the view from image 2's camera position inside
  image 1's world: exactly image 1's architecture, gold rings, walls, machinery, materials, colours, lighting, water design,
  foam and bubbles, and painting style. Take ONLY the direction of the tunnel / water path, the horizon and Benny's position
  from image 2; ignore its colours, textures, foam and ring style. Benny identical to image 1. HUD bar and title exactly as
  image 1. No new objects, no redesign. Portrait 9:16."
* 2 candidates per view; the user picks or rejects each one; rejected views are never used. Approved views go to
  `references/proposed/<NN>/` (NEW folder; `references/*.png` and `scripts/reference.sha256` unchanged).
* Downloads: request `sync_mode` (image returned inside the result from `queue.fal.run`, which works now); if fal returns
  only links on `v3.fal.media` / `v3b.fal.media` (blocked here), the files wait until the user approves those hosts.
