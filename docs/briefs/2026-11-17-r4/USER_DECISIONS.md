# The user's decisions — 2026-11-17 ~19:00 UTC (account 4, after reviewing the Screen 08 pictures + restore report)

Binding for every workstream; they override older briefs where they differ. Nothing is approved until the user says so.

1. **Benny (Screen 08) — keep refining.** Round **3b** is the preferred starting point for now; compare it carefully with
   round 2, round 4 and the ORIGINAL approved Benny before any final choice. Body **rounder and fuller** like the
   approved picture (widest mid-body below the brim, full round bottom in the splash — NOT tapered/slimmer toward the
   water). Soft pink fur that looks **soft and natural, not sharp or spiky**; knitted purple-and-white beanie with ribbed
   cuff, pom-pom, gold star and the water splash as close to the original as technically possible. Preserve whichever
   details already match best; never discard successful improvements. Benny and Screen 08 are NOT approved.
2. **Screen 08 coins — `coins08px` approved as the preferred test version** (`?match08=1&coins08px=1`): coins follow
   the approved picture's positions with natural spacing along the S-shaped water; 91 coins / 2,240 kept. Verify their
   look and collectibility during actual gameplay before any final integration.
3. **Screen 07 — continue** its unfinished milestone once the Screen 08 specialists reach safe saved checkpoints and
   usage permits: water, foam, gold rings, coin positions and the moving-view problems; preserve the 07→08 transition.
4. **Screens 05, 06, 04 — continue all three, in that order of priority** (05 first, then 06, then 04). Every approved
   playable screen must be completed, not only 08. Run only as many parallel specialists as the account can safely
   support.
5. **Google Flow:** 01–03 opening videos, 04–08 playable 3D Android gameplay, 09–11 ending videos. Never generate
   videos or spend Flow credits; the user supplies them.
6. **Save everything:** every specialist's newest work on its own GitHub branch; keep backup docs, APKs, approved
   images, assets and notes. **Do not merge Draft PR #16 or any unfinished specialist branch without the user's approval.**
7. **Final quality = visual accuracy while moving.** Not just a good score on a still screenshot: the scenery must stay
   beautiful and accurate while Benny swims forward, steers and moves through each environment. Before asking for
   final approval show separate full-size APPROVED, BEFORE and NEW images plus moving-view comparisons.

Order of work (lead): 08 Benny + 08 camera (running) → 07 (finish M2) → **08 scenery-in-motion** (`S08_SCENERY.md`,
added 19:10 UTC: the lead found that Screen 08's projected scenery tears and duplicates once Benny moves forward 6 u
or steers — the user's #1 quality rule) → 05 → 06 → 04, never more sessions in parallel than the account's usage
allows (default: at most two at a time). The user may reorder.

## Lead verification of `coins08px` (19:05 UTC, decision 2)
* Current lead code: gameplay `--q="match08=1&coins08px=1"` **8/8**, 91 coins collected, 1,330 → 2,240, errors [].
* Real ride from 03 (scratch probe): all **9 painted coins are physically picked up** — with coin-seeking steering AND
  riding straight with no steering (12/12 coins from s 389 on). 7 of the 9 lie beyond the start of 09 on the course (the
  08 picture looks far down the S-river), so under `?flowplan=1` they are credited when the ending video starts, not
  swum through — a design point for the user's Flow plan, not a coin error.
* Appearance while moving (`qa/match/08/coins08px/motion_NEW/`): the coins ride the painted S-trail with natural spacing;
  the scenery around them breaks when moving (see `S08_SCENERY.md`).
