# Round 8 — rules for every screen specialist (04–08), binding

The user (2026-11-18): "I AM NOT ASKING YOU TO INVENT A GAME. I ALREADY DESIGNED IT. The approved artwork is your
blueprint. Recreate it as accurately as technically possible in my existing playable 3D game." "If it doesn't look
like my approved screen, it is not finished." "Do not claim something matches just because it has similar colors."
Target: ≥ 8.5/10 (ideally 9–9.5) likeness to the screen's OWN approved picture `references/<NN>_*.png` WHILE BENNY
SWIMS — not only at the frozen approved viewpoint. No redesign, no generic tunnel, no substitute water formation.

## Where you work
* Your own git worktree `/home/user/wt/<sNN>` (cd there before EVERY command) on your own `-c8` branch. node_modules is a
  symlink to the lead checkout (never npm install). Push ONLY your branch; never force / merge / rebase / cherry-pick
  other branches; no PRs. Never edit /home/user/rainbow- (read docs there only).
* NEVER the claude-code-remote `send_message` tool. The in-process `SendMessage` tool to "main" is allowed, only for the
  short progress notes below (load it with ToolSearch "select:SendMessage"; skip it if it fails or prompts).

## How to work (fastest visible progress, no lowered quality)
1. Biggest visible difference first (each brief lists them in order). Look at the approved picture and your frames
   YOURSELF before and after every change. Each change behind its own `&m<NN>…=1` sub-switch of the screen's kept set;
   the default build stays untouched.
2. SMALL-STEP REPORTING: as soon as ONE change is visibly closer while swimming → (a) render NEW at the 2–4 audit
   positions where it shows best (same names/positions as the BEFORE set of `tools/lead_r6/motion_audit.mjs`, e.g.
   f10_forward10u, t33/t66_through_screen, s_left_hard/s_right_hard) into `qa/match/<NN>/r8/step<N>_<switch>/`;
   (b) append to `qa/match/<NN>/r8/PROGRESS.md`: step, kept query, WHAT LOOKS BETTER in plain visual words, what is
   still wrong, absolute BEFORE + NEW paths; (c) `npx tsc --noEmit -p .`, commit, push, verify
   `git ls-remote origin refs/heads/<branch>` == HEAD; (d) one short SendMessage to "main" with the same + SHA.
   Then continue at once. A change that does not look better is rejected (switch not kept) and never reported.
3. Reuse what already works (camera-projected approved pixels on fitted real 3D geometry, world-anchored tiles cut from
   the approved picture, real modeled gold rings — `&m06ring=1` on `claude/rainbow-s06-match-c7` can be read with
   `git show` and adapted into your own files). Stop a method after one honest try that shows no visible gain.
4. NO paid jobs (fal, World Labs / Marble, Meshy, Rodin, video) — use the plates and assets already in the repo.
   Never print secrets. No work on 01–03 / 09–11 (Google Flow videos) or the cartoon girl.
5. Preserve: 91 coins, score 2,240, coin positions and pickup rules (coin LOOK may change behind a switch: size toward
   the painted coins, fade while overlapping Benny); `references/*.png` byte-identical; `src/world/course.ts`; other
   screens' looks (switch-guarded hooks only); Benny files only behind your own switch (list them in SHARED_CHANGES.md).
6. End of round (≈ 2 h or when the list is done): full 12-shot NEW audit `qa/match/<NN>/r8/NEW/` +
   `tools/lead_r6/motion_metrics.py`; proofs: default build 0 px vs your start commit with the DETERMINISTIC
   `node scripts/capture.mjs <NN>` (start commit in a detached worktree); `node scripts/gameplay-test.mjs --q=<kept set>`
   8/8, 91 coins, 1,330 → 2,240; `npm run test:continuity`; STATUS.md + NOTES.md (kept set, HONEST moving rating
   separate from pixel numbers, exact next step); commit, push, verify, STOP.
7. CPU is shared (4 cores, two specialists + the lead): ONE browser render at a time, no videos. Commit messages end
   with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never commit node_modules, secrets, files > 49 MB
   outside Git LFS.
8. Final reply to the lead (short): kept query, final SHA (verified), best 3–5 NEW + matching BEFORE paths (absolute),
   metrics, honest ratings (approved view / swimming), what still looks wrong, next step.
