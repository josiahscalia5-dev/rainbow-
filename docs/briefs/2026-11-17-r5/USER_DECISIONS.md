# The user's decisions — 2026-11-17 ~21:05 UTC (account 5, after the all-screens APPROVED vs NOW video)

Binding for every workstream; they extend `docs/briefs/2026-11-17-r4/USER_DECISIONS.md` (still valid). Nothing is
approved until the user says so.

0. **Goal (user's words):** "Make sure all my screens look exactly like my approved screens. Nothing different. I want it
   exactly 100% or 95% close to all my approved screens." Lead's honest framing given to the user: 100 % pixel-identical
   is impossible for real interactive 3D without pasting the picture (forbidden); the target is **≥ 95 % at the approved
   view for every playable screen, and the same approved look kept while Benny rides through the whole screen.**
   Evidence: `qa/screen_videos/2026-11-17/COMPARISON.md` + `rainbow_all_screens_APPROVED_vs_NOW.mp4`.
1. **Top bar: YES — copy Screen 05's matched HUD (`hud05`, line B) to all playable screens** as a test version (explicit
   OK for this line B → line A transfer). Default build unchanged until the user approves.
2. **Combine: YES — one NEW preview branch** combining each screen's best version (04, 05 line B, 06, 07, 08 scenery,
   08 Benny, 08 camera, `coins08px`) so every screen gets the matched top bar, the newest Benny and the right coins
   together. Explicit OK to combine line A and line B ON THAT PREVIEW BRANCH ONLY. Nothing existing is overwritten; no
   old branch is written; the normal game stays unchanged until the user approves; draft PRs are not merged.
3. **Screens 01–03 and 09–11: NO extra work** — the user's Google Flow videos replace their 3D stand-ins. All effort on
   the playable screens 04–08.
4. **Capacity: keep at most two specialist sessions at a time** (usage).
