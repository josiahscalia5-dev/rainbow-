# Screen 04 — proposed reference views, pilot (PAID, user-approved 2026-11-18 ~11:00 UTC: "Pilot 04 first", cap 8 images)

Spend: **8 images** of the 8-image cap (fal `fal-ai/nano-banana-2/edit`, 2K, ≈ $0.12 each ≈ $0.96). All results came back inline
(`sync_mode`), so the fal download hosts are NOT needed. Script `tools/lead_r10/refviews.py`; plans `plan_pilot.json`, `plan_retry.json`.

| View | Request | Status | Candidate files | Lead verdict |
|---|---|---|---|---|
| V04-1 | `01a1ee48-b1c0-7fa1-bba0-028096685268` | COMPLETED | `qa/match/04/r10/refviews/pilot/V04-1_cand1.png` | PASS (shown) |
| V04-1 | `01a1ee48-b1c0-7fa1-bba0-028096685268` | COMPLETED | `qa/match/04/r10/refviews/pilot/V04-1_cand2.png` | PASS (near-duplicate of cand1, not shown) |
| V04-2 | `01a1ee49-2fee-70b1-8890-17899932c08b` | COMPLETED | `qa/match/04/r10/refviews/pilot/V04-2_cand1.png` | REJECT: repeats the approved outside view (room, porthole, towels) |
| V04-2 | `01a1ee49-2fee-70b1-8890-17899932c08b` | COMPLETED | `qa/match/04/r10/refviews/pilot/V04-2_cand2.png` | PASS (shown) |
| V04-3 | `01a1ee49-99da-74f2-9572-bbeb98c966e5` | COMPLETED | `qa/match/04/r10/refviews/pilot/V04-3_cand1.png` | REJECT: Benny tiny and far away |
| V04-3 | `01a1ee49-99da-74f2-9572-bbeb98c966e5` | COMPLETED | `qa/match/04/r10/refviews/pilot/V04-3_cand2.png` | REJECT: outside view again + tiny Benny |
| V04-3r | `01a1ee4a-5f5b-7042-9ab4-d1f85e014779` | COMPLETED | `qa/match/04/r10/refviews/pilot_retry/V04-3r_cand1.png` | PASS (shown as V04-3a) |
| V04-3r | `01a1ee4a-5f5b-7042-9ab4-d1f85e014779` | COMPLETED | `qa/match/04/r10/refviews/pilot_retry/V04-3r_cand2.png` | PASS (shown as V04-3b, opening rim visible) |

Honest note: the accepted interior views look almost alike — the model gives ONE consistent interior design (rounded
glossy gold rings converging to a warm glow, cyan lane with five chevron arrows, pink-magenta swirl water, soft foam clouds,
bubbles, coins) rather than clearly different positions. Usable as the design target for the whole interior.
Shown to the user (full size): `qa/review_c10/2026-11-18/04_proposed_views/`. NOT approved yet; nothing built from them.
After approval: copy the approved PNGs to `references/proposed/04/` (originals in `references/` stay byte-identical).
