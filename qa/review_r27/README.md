# Round 27 lead preview — every playable screen in motion vs its approved picture (2026-11-20 15:28–15:45 UTC)

Page for the user: https://claude.ai/artifact/WVqynQ46W6j3yZSGAqV3qA (private to the owner) — source `index.html`, images `web/`.
User (r27, mid-turn): screens **01, 02, 03 and 11 are the user's Google Flow videos — do not build or rate them** (kept as video slots, nothing removed).
09 and 10: listed as Flow videos on 11-17; the user did not mention them on 11-20 → question asked (playable or video?).

## Method
`tools/lead21/audit_screen.mjs` (deterministic sim steps, frozen shader clock, 864×1536, Chromium 157 SwiftShader) at a_start / b_early 12 % /
c_middle 35 % / d_late 60 % / e_end 85 % / f_hard_left + g_hard_right at 35 %. Each screen's NEWEST candidate frozen from the 15:03 snapshots
(read-only copies `/home/user/wt/view04|view06|view07` on LOCAL `lead/view0N-c28`; s05 and s08 worktrees idle). Queries: `QUERY_NN.txt`.
09 / 10 = default lead build start views (`scripts/capture.mjs 09 10`). Individual candidates — NOT a combined build, NOT Android.

## Ratings (lead's visual judgement by eye, 1–10 vs the approved picture; not measured percentages)
| Screen | Candidate | Start | Swimming | Overall |
|---|---|---|---|---|
| 04 | K23-S3 + `m04a5=2` (five arrows) | 8 | 6 | 6.5 |
| 05 | r18/r19 kept set (`m05wcrisp`, `m05pink`) | 9.5 | 7.5 | 7.5 |
| 06 | NEW3 (`m06hole=2&m06fade=1&m06spl=1`) | 8.5 | 5 | 5.5 |
| 07 | r26 full (`m07sbend&m07swing&m07look&m07join`) + K23-3 | 9 | 4.5 | 5 |
| 08 | K23-3 | 9 | 7.5 | 7.5 |
| 09 / 10 | default stand-ins (not worked on) | 3 | — | 3 |

Common cause: start views are the camera-projected approved artwork; once Benny moves, the unpainted 3D shows — straight chutes, uniform
bead-row foam, rings / walls dominating, the painted S-river / crest lost. New defect found: 07 `e_end` flat over-bright magenta perforated wall
panel upper right (sent to s07 at ~15:44).

## Plan to ≥ 8.5 (same for every screen)
1. Hold the approved picture's viewpoint while swimming. 2. Carry each painted river shape (S-curves, width, crest, coin trail) through the whole
stage. 3. Approved continuation views per screen (as the three approved 04 views, fal ≈ $0.20/view) camera-projected onto walls / water along
the route — needs the user's OK per screen with job + cost. 4. Per-screen soft foam clusters. 5. One combined build with the approved Benny →
Android APK.
