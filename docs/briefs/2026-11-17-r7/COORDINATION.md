# Round 7 (account 7) — coordination of the five playable screens (VISUALS ONLY)

User order 2026-11-17 ~23:55 UTC: all five playable screens 04–08 must look like their ORIGINAL approved images
(≥ 8.5/10, ideally 9–9.5) while Benny swims — scenery, tunnel architecture, gold rings, water, foam, lighting, Benny,
coins, HUD. No work on 01–03 / 09–11 (Google Flow videos). No APK / infrastructure work unless needed for visuals.
No paid jobs without approval. Nothing is approved until the user says so. Max TWO specialist sessions at a time.

## Lead rating of the newest saved state (account 7, from the r6 audit frames + r7 renders) — approved view / swimming
04 ~8 / ~3.5 · 05 ~8.5 / ~4–6.5 · 06 ~8 / ~3.5–4 (r7 NEW ~5.5) · 07 ~8 / ~2–6 (plunge ~2) · 08 ~8.5 / ~7.
Pictures for the user: `qa/review_r7/` (separate full-size APPROVED / CURRENT / NEW files).

## Slots and rotation
| Slot | Now | Next when it reports |
|---|---|---|
| Lead (not a specialist slot) | 06 on `claude/rainbow-s06-match-c7` (m06cam + m06tun; fix the VP disc; real 3D gold rings + crisp wall) | shared ring-tunnel kit → 05 / 07 / 04 |
| Specialist A | 08 scenery `claude/rainbow-s08-scenery-c7`, session `session_01KS3bZvdzt2da5S21x21PqW` (running, pushed 26b7acac) | 05 line B M3 (`claude/rainbow-s05-match-c7` from `-c5` @ ebaf6cac) |
| Specialist B | 07 M3 `claude/rainbow-s07-match-c7`, session `session_01KS3bZthTRh6CTfK1fvM3r6` (brief re-sent 23:58; setup) | 04 M4 (`claude/rainbow-s04-match-c7` from `-c5` @ d1e422fa) |
Then: 08 Benny (`-c5` @ ae7abe5b, r6 variants await the user's verdict) and 08 camera (`-c5` @ 18687513) only if needed.

## Shared finding (lead, 06): the two structural causes of "looks right only at the start"
1. match camera tilting with the local slope (06: −11° → −73° by +30 u) → camera frame aimed along the river ahead;
2. proxy tunnel built around the river path → straight ring cylinder along the painted vanishing-point ray.
Then the remaining gap is material quality: the painted rings / perforated walls are unwrapped from small distant
pixels (blurry, flat stripes up close). Next shared step: real modeled gold rings (glossy, with the amber bulb rows) +
a crisp tileable perforated purple wall, sized/spaced from the approved pictures — usable on 04, 05, 06 and 07.

## Keys / services (verified 2026-11-17 ~23:45 UTC, free reads only)
World Labs key = the 5,420-credit Screen 08 account (world 32b5b2f4 → 200; Screen 05 pilot worlds now 404 — their
outputs are in Git LFS). Marble CDN reachable (environment network unrestricted). Atlas connector responds (separate).
fal.ai key reconnected: request 01a1ea70 → COMPLETED (same purchased account). Git LFS: 75 objects / 9 tips, fsck OK.

## Update 2026-11-18 ~00:20 UTC
* 06 (lead): `&m06ring=1` real modeled gold rings kept on `claude/rainbow-s06-match-c7` @ `99a4a3ad` (approved view
  unchanged, 76.4 % → 76.4 %); lead moving rating ≈ 6.5/10 (BEFORE ≈ 3.5–4). Next: ring highlights/bulbs, thinner far
  rings, crisp perforated wall, foam clouds + bubbles.
* 08 scenery: milestone DONE `claude/rainbow-s08-scenery-c7` @ `dafa3752` (m08seam, m08sill, m08towel kept; ≈ 7.5/10
  straight ahead); session idle. Next 08 round: sharper near water while steering.
* 07: session `session_01KS3bZthTRh6CTfK1fvM3r6` RUNNING (was blocked on a send_message permission prompt — interrupted,
  told to report via commits only).
* 05: session `session_01KS3bZvfAKmzbAswSRdAaqD` RUNNING (BEFORE audit done).
* 04: brief `S04.md` + branch `claude/rainbow-s04-match-c7` (= d1e422fa) ready; launch when 05 or 07 stops.
* Specialists must NOT use send_message (permission prompt blocks them); they report via STATUS.md commits.

## Update 2026-11-18 ~00:50 UTC (after the user's feedback `USER_FEEDBACK_R7B.md`)
* 05: M3 step 2 DONE `claude/rainbow-s05-match-c7` @ 92c8c5e9+ (`m05far=1`: own tunnel + S-river to ~90 % of the stage;
  two-thirds through ~4 → ~6). Session idle. NEXT (queued): the user's 05 list (stretched water, disconnected edges,
  Benny's placement vs water/tunnel) + its own next step (crisp wall tile, modeled far rings, far-water seam).
* 07: specialist RUNNING; user's 07 list sent (plunge orange-gold surface hiding Benny = MAJOR; triangular wall seams,
  disconnected machinery, distorted textures, oversized coins).
* 08: specialist session restarted for ROUND 8 (rectangular seams around towel/window/walls/sections; oversized
  foreground coins + coins covering Benny; coin LOOK only).
* Active specialists: 07 + 08. Queue: 05 (user's list) → 04 (M4). Lead: 06.
