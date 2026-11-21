# Screen 04 generated continuation views — USER VERDICT

**2026-11-20 ~03:42 UTC, user (verbatim): "Yes, approve the Screen 04 proposals, keep going"**

Accepted as GENERATED reference views for Screen 04 (they extend the approved world beyond what the original shows; the user's
original `references/04_through_the_five_arrows.png` stays the master and is unchanged). Matched pixel-for-pixel to the sheets the
user approved (`FOR_APPROVAL_04_*.png`, mean abs diff 0.3 vs ≥ 21.9 for the other tries):

| View | Game camera (audit_screen.mjs, query = QUERY_04.txt V4) | Accepted file | sha256 |
|---|---|---|---|
| c_middle | frac 0.35, s = 90.48 u, lat 0, no steer | `accepted/04_gen_c_middle_p2_v1.png` | `f4b389aeb7430d1f…` |
| d_late | frac 0.60, s = 99.813 u, lat 0, no steer | `accepted/04_gen_d_late_p3_v1.png` | `e014beb41b16adad…` |
| e_end | frac 0.85, s = 109.146 u, lat 0, no steer | `accepted/04_gen_e_end_p2_v1.png` | `7e7d5861bd564d7e…` |

Structure frames (the exact game cameras): `game_frames/{c_middle,d_late,e_end}.png` + `game_frames/shots.json`.
Rejected tries kept for the record only: `c_middle_v1` (layout drift), `d_late_p2_v1` (too many dots).
Next (lead, round 22): multi-plate camera projection behind its own URL switch — `docs/briefs/2026-11-20-r22/LAUNCH_S04_PROJ.md`.
