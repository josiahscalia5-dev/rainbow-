# Account 12 (2026-11-18) — Claude setup snapshot (NO secrets)
Restore on a new account: start the cloud session on the lead branch named in `backups/START_NEW_CLAUDE_ACCOUNT.md`;
the SessionStart hook (`.claude/settings.json`) runs `scripts/claude-bootstrap.sh`, which reinstalls tools and plugins.

* **Agents (10, in git):** `.claude/agents/` — android-build-performance, animation-and-gameplay-engineer, benny-character-artist,
  cartoon-girl-character-artist, foam-bubbles-particles, path-camera-transition-engineer, playwright-visual-qa,
  reference-match-director, washer-environment-modeler, water-fx-specialist. Running state + restart steps: `backups/AGENTS_STATUS.json`
  (round12_account12), worktrees /home/user/wt/s04, s05, s08; unfinished edits snapshotted every 5 min in `backups/wip/`.
* **Plugins:** `installed_plugins.json` (worldlabs@worldlabs) + `known_marketplaces.json`; the session also had superpowers,
  feature-dev, code-review, frontend-design, claude-code-setup, rv-tools, unity, playwright, context7 (context7 needs sign-in; unused).
* **MCP servers seen this session:** playwright (plugin, connected), github (claude.ai connector), claude-code-remote,
  Claude_Docs, context7 (needs auth). Project template: `.mcp.json.template`.
* **Services (keys are NOT in git):** World Labs `api.worldlabs.ai` header `WLT-Api-Key` and fal `queue.fal.run`
  `Authorization: Key …` were proxy-injected by this account's environment (verified 12:40 UTC: 5,420 credits, 08 world 200;
  fal 01a1ea70 COMPLETED). A new account re-enters them only via the secure credential form.
* **Local tools (reinstalled by the bootstrap / docs):** Blender 5.3.0, Android SDK 34, Node 22, Playwright Chromium,
  ffmpeg, ImageMagick, Python cv2/scipy; Depth Anything 3 at /home/user/da3 (steps: `docs/briefs/2026-11-18-r11/DA3_TEST.md`).
* `user-settings.json` = ~/.claude/settings.json of this account (checked: no secrets).
