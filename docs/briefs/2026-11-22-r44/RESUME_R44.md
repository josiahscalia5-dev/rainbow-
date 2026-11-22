# Round 44 — resume here (2026-11-22, session branch `ccr-0bbd5b9d-js1cpg`, continues `ccr-80cdb162-4sqz1a` round 43b)

New Claude account (restore report `backups/TOOL_RESTORE_REPORT_2026-11-22.md`; plugins re-enabled, standalone Spector.js MCP `spectorjs`
installed by the bootstrap). Never merge branches / PR #32 without the user's OK. World Labs: only the CURRENT account (old 2026-11-16 worlds
marked do_not_use); any Atlas / Marble job needs the user's OK with task, benefit, format and credits named first.

## User orders this round (binding, in `USER_R44.md`)
One connected 3D world 04 → A → B → 05 → 06 → 07 → 08 → 09 → 10 (01–03 + 11 = Flow videos), user decision **"Rebuild in one world"** with the
screen kit (Blender 5.3 + Geometry Nodes builds the scenery and the connectors; Three.js plays it; approved pixels baked on real geometry); the
authoritative join captions are on `GUIDE_AUTHORITATIVE_04_A_B_05.png` / `GUIDE_AUTHORITATIVE_05_to_10.png` (each picture's composition kept,
real 3D joins OUTSIDE the views). Show uninterrupted real-swipe gameplay recordings across the joins; gray geometry first, then textures.

## Done
1. Join audit BEFORE (`qa/world/r44/join_audit_BEFORE/`): 4 joins were page loads (04→A dE 33, B→05, 05→06kit, 06kit→07).
2. Screen 04 rebuilt with the kit (`tools/screenkit/screens/04/`, new kit components funnel / wall / pool_front / mouth ring / 3D arrows; 06 byte-
   identical): 87.3 % at the picture camera (live bake), 0 holes in the gray test — `qa/world/r44/04/`.
3. World v1 (`tools/world/`: `setup_world.sh`, `world_layout.py`, `blender_connectors.py`, `world.html`): 04 → doorway → Bubble Dash → Sock Rescue
   in ONE scene; picture views unchanged by the join (04 83.8 / A 87.4 / B 81.3 % in the world vs 83.7 / 87.8 / 78.6 % on their own pre-baked
   pages) — `qa/world/r44/world_v1/`. Real-touch gray + textured runs: `qa/world/r44/run/` (see its README when present).

## Next, in order
1. Screen 05 with the kit (`screens/05/fit05.py`; reuse the 04 fit pattern: ring RANSAC → VP + camera offset, water line, S-river through the
   painted coins) → join B → 05 ("laundry tunnel curves into Screen 05 S-shaped current": Blender connector tube from the sock tube r 0.99 to 05's
   radius, curving).
2. Add 06 (kit, round 43b) to the world: scale 0.468 / 0.574 = 0.815 so Benny is one size; join 05 → 06 ("S-curve climbs into the raised banked crest").
3. 07 + 08 with the kit: genuine descending route 07 → 08 ("tube physically opens into the larger final spin room"), then 09, 10.
4. Fix the pre-baked export loss (3–4 points vs the live bake), 04 → ≥ 90 %, kit pool water code look closer to the painted water in motion.
5. App: the world replaces the per-section page loads behind a build switch (default game unchanged until the user approves).
