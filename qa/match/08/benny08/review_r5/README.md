# Round 5 — Benny variant review set (Screen 08, `?match08=1`), 2026-11-17

Separate full-size files, no collages. Per variant: `*_08_approved_view.png` (864×1536, the approved picture's own size),
`*_closeup.png` (same crop as `../closeup_APPROVED.png`: x 250–610, y 845–1225, 3×), `*_move_forward.png` (6 u ahead),
`*_move_steer_left.png`, `*_move_steer_right.png`. `1_APPROVED_*` = the approved picture (byte copy / crop).

| Variant | Exact URL (add to the game URL) | Benny + splash ≤20 | SSIM | whole ≤20 | scenery ≤20 |
|---|---|---|---|---|---|
| r2 | `?match08=1&b08r3=0` | 65.7 % | 0.602 | 85.4 % | 97.3 % |
| r3b | `?match08=1&b08hi=0&b08pom=0&b08shape=0` | 65.3 % | 0.595 | 85.4 % | 97.3 % |
| r4 | `?match08=1&b08shape=0` | 65.4 % | 0.594 | 85.4 % | 97.3 % |
| **r5 NEW** (current `match08=1`) | `?match08=1` | 62.0 % | 0.544 | 84.9 % | 97.3 % |

Reproduced in this round (fresh captures): r4 == round-4 `r4/new/08.png` on Benny and scenery; the only differing pixels are
the title banner (animated) and faint coin shading (≤19 levels, coin spin phase). Tool: `../work/review08.py`.

**5_r5_NEW** (added after step 1): round-5 body shape — the pink body is as wide as the brim right under it and slimmer
toward the water (tapered like the painting instead of a ball), the stubby arms sit higher, right under the brim.
Chosen visually: the strict number is LOWER (Benny+splash 65.4 → 62.0 %, body part 75 → 58 %), because the painted
fur texels no longer line up pixel-for-pixel with the new outline. Nothing is approved until the user says so.
(The r3b / r4 URLs gained `&b08shape=0` when r5 became the `match08=1` default; r2's `b08r3=0` already turns it off.)

## Round 5b (user decisions 19:00 UTC) — `final/`
`final/1_APPROVED_*`, `final/2_BEFORE_r3b_*`, `final/3_NEW_*`: approved view, close-up, moving forward / steer left / steer right.
NEW = r3b + fuller rounder body wider than the brim, slightly smaller beanie, stubby arms high (`?match08=1`; Benny+splash 62.2 %,
r3b 65.3 % — a visual choice, the number is lower). Current URLs: r3b `?match08=1&b08full=0`, r4 `?match08=1&b08hi=1&b08pom=1&b08full=0`,
r5 taper `?match08=1&b08hi=1&b08pom=1&b08shape=1`, r2 `?match08=1&b08r3=0` (the table above predates 5b).
