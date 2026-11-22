# Round 44 — one connected 3D world: measured starting point + plan (2026-11-22 ~15:55 UTC)

User's orders: `USER_R44.md` (verbatim) + `USER_LEVEL_FLOW_PREVIEW_R44.png` (transition concepts only; each area's look = its own approved picture).

## 1. Where the joins are today (BEFORE) — `qa/world/r44/join_audit_BEFORE/`
Built app (`dist/` = the APK's files, `VITE_RAINBOW_BONUS=1 VITE_RAINBOW_KIT06=1`), 412 × 915, 2 frames before + 2 after every join
(`tools/world/join_audit.cjs`, sheet + numbers `tools/world/join_sheet.py`; dE = mean-colour difference across the join, ~2 barely visible, >10 obvious).

| join | today | colour jump scenery / water (dE) | what the frames show |
|---|---|---|---|
| 04 → A Bubble Dash | **page load (hard cut)** | **33.1** / 18.3 | warm-gold ring slide → huge purple chamber; Benny drawn larger and lower; no physical opening between them |
| A → B Sock Rescue | same page | 7.5 / 13.4 | chamber current → arch → sock tunnel (already one piece of geometry) |
| B → 05 | **page load (hard cut)** | 19.3 / 13.6 | narrow lilac sock tube with rings → wide gold-ring 05 current |
| 05 → 06 (rebuilt 06) | **page load (hard cut)** | 27.3 / 3.8 | 05 current → rebuilt 06 drum at its picture camera |
| 06 (rebuilt) → 07 | **page load (hard cut)** | 30.8 / 11.4 | rebuilt 06 drum end → old 07 tube |
| 07 → 08 | same scene (old game) | 19.3 / 6.4 | continuous 61 u plunge; the 08 porthole is already visible from 07 |
| 08 → 09 | same scene | 1.6 / 7.0 | same chamber |
| 09 → 10 | same scene | 8.1 / 8.2 | same chamber |

Units differ between the three engines (Benny ≈ 0.47 u in the section, 0.57 u in the kit 06, ≈ 1.6–2 u in the old game; tube radius / Benny:
sock tube 2.1, 04 pipe ≈ 2.7, 05 ≈ 4.2, 06 drum 4.9, 07 ≈ 4) — every connector has to change the tunnel size gradually, and Benny must be
the same size on screen across each join.

## 2. Two ways to make it one world
**(Recommended) One world built with the screen kit.** A world container loads the areas in route order and places each one so its
entrance sits exactly on the previous exit (position, direction, water level, tunnel size); one route, one Benny, one camera, one set of swipe
controls, no page loads. Short Blender Geometry-Nodes connectors are built between areas from the preview's captions (04's arrow pipe opening
into the Bubble Dash chamber; the sock tunnel curving and widening into the 05 current; the 06 crest dropping into the 07 tube; the 07 tube
opening into the 08 spin chamber), coloured as a blend of the two areas' measured palettes. Areas: A + B (built, 90.7 %) and 06 (built,
88.5 %) as they are; 04, 05, 07, 08, 09, 10 rebuilt with the kit from their own approved pictures (baked pixels on real geometry — the method
the user's rules require; several old-game screens still use camera projection), in this order: 04 + 05 (for 04 → A → B → 05), then 07 + 08
(for 07 → 08), then 09, 10. The app switches to the world when it is complete; until then the current game stays unchanged.
**Alternative (faster, partial): splice A + B and the rebuilt 06 into the current game.** Removes the page loads sooner, but keeps the older
04 / 05 / 07–10 (built with methods since ruled out) and would be redone when those screens are rebuilt.

## 3. Rules for every join (checked by `join_audit.cjs` on the world, AFTER vs BEFORE)
No page load / scene swap; the water surface continuous (no gap, no step) and flowing the same way; tunnel size changing gradually; no
repeated entrances (each opening seen once); camera without jumps (step / turn per frame limits as in the kit runs); Benny the same size on
screen across the join; colour jump across each join small (target dE < 10) while each area keeps its own measured likeness.
