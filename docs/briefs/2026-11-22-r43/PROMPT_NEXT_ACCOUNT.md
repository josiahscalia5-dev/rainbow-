# Full prompt for the next Claude account (round 43b, 2026-11-22 ~14:10 UTC)
Start the cloud session on repository `josiahscalia5-dev/rainbow-`, branch **`ccr-80cdb162-4sqz1a`** if offered, then paste everything in the box.

```
Continue my Rainbow game exactly where my last Claude account stopped. Do not start over, do not delete work.

STEP 1 — Get onto the right branch (the GitHub default branch is an OLD version):
If the current branch is not ccr-80cdb162-4sqz1a, run:
  git fetch origin ccr-80cdb162-4sqz1a && git checkout -B ccr-80cdb162-4sqz1a FETCH_HEAD && git lfs pull
Then confirm `git rev-parse HEAD` matches `git ls-remote origin refs/heads/ccr-80cdb162-4sqz1a`.
(If this session must push to a differently named branch of its own, merge this branch into it first and say so.)

STEP 2 — Read before doing anything:
1. CLAUDE.md (permanent rules).
2. docs/briefs/2026-11-22-r43/RESUME_R43.md (section 0 = newest: round 43b) and qa/reflock/r43b/RESULT_R43b.md: what is done, measured and still open.
3. docs/briefs/2026-11-22-r43/USER_R43.md: my orders for the reusable Screen Builder (verbatim).
4. tools/screenkit/README.md: the reusable screen kit (fit -> SAM 2 masks -> Blender Geometry Nodes -> game page) and how to rebuild Screen 06.
5. The recent chat history: backups/claude-sessions/e7ead6f9-80f4-50b9-a0f2-74e81333401a/transcript.md (read the last part first).
6. docs/briefs/2026-11-22-r42/REFERENCE_INVENTORY.md: my 13 images and their gameplay order.

STEP 3 — Restore the five-minute GitHub autosave and verify it:
Run `python3 -I scripts/autosave-status.py` and make sure it says AUTOSAVE OK … (match). Save everything to my GitHub every 5 minutes (code, assets,
tools, plugin / MCP server lists, AND the chat history — backups/autosave.config.json has transcripts_on_public_repo = true at my request), after
every kept improvement and before ending, and verify GitHub matches the local commit each time. Re-create the private redaction list
~/.rainbow-autosave.private-terms (my e-mail address and its local part, one per line — take them from your own account context, never commit
that file). Run `bash tools/screenkit/get_models.sh` once (free SAM 2.1 tiny + Depth Anything V2 small, no credits).

MY RULES (binding):
- My approved artwork is the authority. Never change, overwrite or renumber my approved images or stages without asking me.
- My 13 images in gameplay order: Screen 04 → Bubble Dash Chamber → Sock Rescue Tunnel → Screen 05 → 06 → 07 → 08 → 09 → 10.
  Screens 01, 02, 03 and 11 are my Google Flow videos; do not rebuild them.
- Real connected 3D scenery that Benny truly swims through: no flat pictures, image placeholders, camera-facing planes, live projections or fake
  perspective. My approved pixels are BAKED onto real geometry. Scenery sharp, connected and stable while he moves; no holes, no floating objects;
  Benny never cut off the screen.
- Benny physically rides the real water surface: posture follows the slope and banking, lower body partly immersed, whole fluffy body visible,
  splash / swim effects follow his real movement. Never fix his look by floating him above the water or moving a picture.
- "My approved screen" means the same look WHILE Benny swims, not only at the start view. Target 90–95 % likeness (prefer 95 %), reported only as
  measured numbers with the unchanged thresholds; compare ORIGINAL / PREVIOUS / NEW at identical camera positions.
- Preserve what works: the water, Benny's improved swipe controls, the Bubble Dash reconstruction (90.7 %).
- Use Blender and the existing screen kit; do not repeat the SAM / depth experiments without a specific reason; no new tools unless they solve a
  specific problem (Three.js DevTools MCP is installed but not needed so far).
- Do not spend any Marble, fal.ai or other paid AI credits and do not install paid services without asking me first.
- Do not merge branches or pull requests without my OK (draft PR #32 stays unmerged; never merge codex/* or chatgpt/* branches).
- Never commit or print API keys. If a key check fails with 401/403 and the work needs that key, use the secure credential form.

WHERE WE ARE (round 43b):
- Screen 06 rebuilt with the kit: 88.5 % of scenery pixels within 20 levels at my picture's camera position (old game 06: 3.6 %); Benny 12 %
  immersed on the real water; plain-gray geometry run + textured run over the whole level: 0 holes, Benny on screen every frame, 14/14 real
  swipes, smooth camera. NOT finished: in motion the look drifts from my painting (colour look ~0.3–0.4 vs 0.996 at the start view).

WHAT TO DO NOW, in this order:
1. Finish Screen 06 before any other screen: make the look WHILE swimming match my approved 06 (close-up water from my painted water, foam where
   I painted foam without lowering the start view, walls / rings), keep the start view ≥ 88.5 % and aim for ≥ 90 %. Test one change at a time on
   fixed stills (start view + moving positions), then the gray and textured whole-level real-touch runs (tools/screenkit/kit_run.cjs). Ask me to
   judge the crest's banked turn and camera tilt.
2. Show me: my approved 06 beside the game (full-size pictures, measured numbers), the gray geometry run and one uninterrupted textured gameplay
   recording with real swipes. Save them in qa/reflock/ and push.
3. Only after my OK on 06: the next screen with the kit (04 or 07, see qa/reflock/r43/REUSE_MATRIX_04_10.md), then Sock Rescue toward 90 %
   without lowering Bubble Dash, and seamless single-scene hand-overs (today each section is a page load).
4. Android: rebuild the test APK (VITE_RAINBOW_BONUS=1 VITE_RAINBOW_KIT06=1 npm run android:debug) at acceptance; with no device or emulator, say
   it is unverified on a device.

Do not tell me a screen is finished until you show it in continuous gameplay.
```
