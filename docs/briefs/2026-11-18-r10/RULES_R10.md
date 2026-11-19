# Round 10 (account 10) — rules added to `docs/briefs/2026-11-18-r8/COMMON_RULES.md` (binding; read "-c8"/"r8" as "-c10"/"r10")

User, 2026-11-18 ~10:30 UTC (verbatim core):
"PLEASE STOP TREATING MATCHING COLORS AS MATCHING MY APPROVED SCREENS. A screen can have 90% similar colors and STILL look
completely different from my approved image. The exact visual design matters: the scenery, tunnel structures, water
formations, shapes, proportions, backgrounds, lighting, materials, and Benny." "Use my original approved image as the
visual authority. Where it doesn't show the rest of the level, build a FAITHFUL CONTINUATION of that design rather than
inventing a different environment." "I want to see actual visual improvements, not just measurements."
"DO NOT REMOVE SUCCESSFUL EXISTING WORK JUST BECAUSE IT USES ARTWORK PROJECTION OR AN IMAGE BACKDROP." "I do not want
flat-image tricks that visibly break or distort when Benny moves." "No redesigns. No paid jobs without approval."

## What this changes for every specialist
1. **Judge by eye against the approved picture, not by numbers.** PALETTE / LAYOUT / within-20-levels numbers may be logged,
   but never as evidence that a frame "looks like" the picture. A step is kept only if, looking at APPROVED and NEW side by
   side, the SHAPES (tunnel, rings, walls, river formation, foam, machinery) are visibly closer while swimming.
2. **Classify every defect before fixing it** and use the matching fix:
   - A. wrong 3D architecture (shape / proportion / layout differs) → rebuild that geometry first, no polishing on top;
   - B. wrong texture mapping (stretching, tearing, seams, blur) → repair the mapping (world-anchored tiles cut from the
     approved picture, better projection coverage, blending), keep the geometry;
   - C. missing detail (foam clusters, bubbles, arrows, paddles, spout cups) → model / add it;
   - D. successful projection or backdrop that already looks right → PRESERVE it untouched;
   - E. places the picture never shows → faithful CONTINUATION of the painted design (same ring profile and spacing, same
     wall pattern, same river formation, same foam style), never a different environment.
3. **Proof for every kept step:** separate full-size portrait images `1_APPROVED`, `2_BEFORE`, `3_NEW` (no collages) at the
   audit positions where the change shows, plus plain words: what now looks closer, what is still wrong.
4. BEFORE set already rendered for every screen (fresh, kept query of each `-c9` tip, 12 shots, 2026-11-18 ~10:30 UTC):
   `/tmp/claude-0/-home-user-rainbow-/0bf13d71-0f08-5420-86ab-4dcca5bc306c/scratchpad/audit_c10/<NN>/*.png`
   (positions in `motion.json` there; copies of the key frames in `qa/review_c10/2026-11-18/`). If that folder is gone,
   re-render it with `tools/lead_r6/motion_audit.mjs` on your start commit.
5. Logs go to `qa/match/<NN>/r10/` (PROGRESS.md, step folders). Branches `claude/rainbow-<sNN…>-c10`; never write `-c9`.
6. No downloads that need new network hosts (Hugging Face, PyTorch) until the user approves the pending environment
   request (`PENDING_ENVIRONMENT_REQUEST.md`). Do not retry blocked downloads.
