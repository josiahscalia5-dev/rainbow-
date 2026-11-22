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

4. World v2 (`setup_world.sh` now also builds 05): Sock Rescue is cut at a tube boundary (z -57.11) and an S-curve widening connector tube
   (Blender: 9 u, +1.6 u sideways, r 0.99 → 1.36, gold rings, water strip) leads into Screen 05 (kit, 83.5 % live / 80.6 % in the world vs
   81.2 % on its own pre-baked page). Route 158.3 u: 04 0–25.15, A+B 25.15–87.3, 05 87.3–158.3. Recordings `qa/world/r44/run/` (README there):
   04→A→B gray + textured 1083 frames, 17/17 swipes, 0 hole pixels; B→05 first take: 10/10 swipes, a tube-seam crack (20 frames ≤ 31 px) and a
   fast camera turn in 05's S-river (1.77°/frame) → fixed (connector overlap 0.2 u, camera heading window ±1.6 u), re-recorded as `_v2`.
5. User's rating question answered (judgment from the measured numbers, out of 10, at the picture view / while swimming): 04 8 / 5, A 9 / 7,
   B 8 / 5, 05 8 / 5, 06 8.5 / 4, 07–10 not rebuilt ~3 while swimming. The in-motion look is the main gap to the 9/10 target.

## Next, in order
1. Add 06 (kit, round 43b) to the world: scale 0.468 / 0.574 = 0.815 so Benny is one size (or rebuild 06's fit at the world's Benny height);
   join 05 → 06 ("S-curve climbs seamlessly into the raised banked crest": a rising connector channel into 06's crest start).
2. 07 + 08 with the kit: genuine descending route 07 → 08 ("tube physically opens into the larger final spin room"), then 09, 10 (09 → 10 wave to
   the towel); 10 hands over to the 11 Flow video.
3. The in-motion look (the main gap): code materials sampled from the painted walls / rings / water of each picture instead of drawn ones; keep
   more painted detail close up; fix the pre-baked export loss (3–4 points vs the live bake); 04 → ≥ 90 %.
4. Flip the section's surfaces that face away (they show orange in the gray test; double-sided, so the game looks the same).
5. App: the world replaces the per-section page loads behind a build switch (default game unchanged until the user approves); APK at acceptance.
