# Full prompt for the next Claude account (round 42, 2026-11-22 ~12:30 UTC)
Start the cloud session on repository `josiahscalia5-dev/rainbow-`, branch **`ccr-50ff6f57-q5me82`** if offered, then paste everything in the box.

```
Continue my Rainbow game exactly where my last Claude account stopped. Do not start over, do not delete work.

STEP 1 — Get onto the right branch (the GitHub default branch is an OLD version):
If the current branch is not ccr-50ff6f57-q5me82, run:
  git fetch origin ccr-50ff6f57-q5me82 && git checkout -B ccr-50ff6f57-q5me82 FETCH_HEAD && git lfs pull
Then confirm `git rev-parse HEAD` matches `git ls-remote origin refs/heads/ccr-50ff6f57-q5me82`.

STEP 2 — Read before doing anything:
1. CLAUDE.md (permanent rules).
2. docs/briefs/2026-11-22-r42/RESUME_R42.md: my newest orders, what is done, what is NOT verified yet, next steps.
3. docs/briefs/2026-11-22-r42/REFERENCE_INVENTORY.md and STORYBOARD_13_in_gameplay_order.jpg: my 13 images.
4. The recent chat history: backups/claude-sessions/66fa0664-24cd-5101-b8d0-4255365ce070/transcript.md (read the last part first).
5. qa/reflock/r40/RESULT_R40.md (results of rounds 40 and 41).

STEP 3 — Restore the five-minute GitHub autosave and verify it:
Run `python3 -I scripts/autosave-status.py` and make sure it says AUTOSAVE OK … (match). Save everything to my GitHub every 5 minutes, after every kept improvement and before ending, and verify GitHub matches the local commit each time.

MY RULES (binding):
- My approved artwork is the authority, not earlier experimental designs. Never change, overwrite or renumber my approved images or stages without asking me.
- My 13 images in gameplay order: Screen 04 → Bubble Dash Chamber → Sock Rescue Tunnel → Screen 05 → 06 → 07 → 08 → 09 → 10. Screens 01, 02, 03 and 11 are my Google Flow videos; do not rebuild them.
- No repeated tunnels, duplicated sections, disconnected water, teleporting or loading interruptions.
- The game must be real connected 3D scenery that Benny truly swims through. No flat pictures, image placeholders, camera-facing planes, projections or fake perspective. Scenery must stay sharp, connected and stable while he moves; no holes, no floating objects, and Benny must never be cut off the screen.
- Target 90–95% likeness to each approved picture, reported only as measured numbers.
- Protect the successful Bubble Dash reconstruction (90.7%).
- Use Blender where geometry is needed; reuse the existing code and assets.
- Do not spend any Marble, fal.ai or other paid AI credits without asking me first.
- Do not merge branches or pull requests without my OK (draft PR #32 stays unmerged; never merge codex/* or chatgpt/* branches).
- Never commit or print API keys. If a key check fails with 401/403, use the secure credential form; never ask me to paste a key in chat.

WHAT TO DO NOW, in this order:
1. Finish Screen 06 before any other section. Rebuild (VITE_RAINBOW_BONUS=1 npm run build), then re-run the real-touch Screen 06 → 07 test with the exact command in RESUME_R42.md section 3. It was interrupted after the gold-ring orientation fix. Check: 11/11 swipes detected, Benny on screen in every frame, no gold bars across the river on the descent, no floating orange shapes in the 07 tube. Fix anything that fails and test again.
2. Show me, for Screen 06: my approved picture beside the game (full-size pictures, measured likeness number) and one uninterrupted gameplay recording with real swipes. Save them in qa/reflock/r42/ and push to GitHub.
3. Then continue with the next steps in RESUME_R42.md section 4: Sock Rescue toward 90–95% without lowering Bubble Dash, a seamless hand-over 04 → Bubble Dash → Sock Rescue → 05 without loading, then the other playable screens. Ask me before deciding the duplicated "05" title.
4. If I attach my ZIP of 13 images, compare its 11 approved images with references/*.png and report every difference before replacing anything.

Do not tell me a screen is finished until you show it in continuous gameplay. Test the Android build if possible; if no device or emulator is available, say it is unverified on a device.
```
