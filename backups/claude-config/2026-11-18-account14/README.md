# Account 14 (2026-11-18) — Claude setup snapshot (NO secrets)
Restore on a new account: start the cloud session on the lead branch named at the top of `backups/START_NEW_CLAUDE_ACCOUNT.md`
(`ccr-6c7564b1-fmlt1w`); the SessionStart hook (`.claude/settings.json`) runs `scripts/claude-bootstrap.sh` (tools, plugins, autosave).

* **Agents (10, in git):** `.claude/agents/` (unchanged SHA-256). Running in account 14: water-fx-specialist (Screen 05,
  `claude/rainbow-s05-match-c14`, worktree /home/user/wt/s05) and washer-environment-modeler (Screen 08,
  `claude/rainbow-s08-scenery-c14`, /home/user/wt/s08); lead = Screen 04 (`claude/rainbow-s04-match-c14`, /home/user/wt/s04).
  Restart steps: `backups/AGENTS_STATUS.json` → `round14_account14`. Unfinished edits snapshotted every 5 min in `backups/wip/`.
* **Chat history:** every autosave exports this lead conversation and every specialist conversation (sanitized: no hidden
  reasoning, no image bytes, secrets redacted) to `backups/claude-sessions/8ca76314-247f-58db-ab0f-3465514af18e/` (+ `subagents/`);
  index `backups/CONVERSATION_INDEX.md`. A live conversation itself cannot be transferred.
* **Plugins:** `installed_plugins.json` = worldlabs@worldlabs 0.2.2 (= github worldlabsai/skills HEAD 6cdb6b9: skills atlas-blender,
  atlas-splats, atlas-flythrough, worldlabs-cli); `known_marketplaces.json`; the bootstrap also reports playwright + typescript-lsp.
* **MCP servers / connectors this session (verified by a real call):** GitHub (claude.ai connector: list_branches OK), Playwright
  (plugin: navigate OK), **World Labs Atlas** (claude.ai connector `https://api.atlas.worldlabs.ai/mcp`, connected by the user
  ~17:10 UTC: list_projects → project "My project" `proj_ad4fdb076f4a4c80934406cfefc4d30b`, credits available), claude-code-remote,
  Claude_Docs. Needs sign-in, not used: the plugin's own `worldlabs` MCP server. Project template: `.mcp.json.template`.
  A new account must reconnect the claude.ai connectors (GitHub + Claude GitHub App, World Labs Atlas) itself.
* **Services (keys NOT in git):** World Labs Marble `api.worldlabs.ai` (`WLT-Api-Key`) and fal `queue.fal.run` (`Authorization: Key …`)
  are proxy-injected by this account's environment (verified 16:30 UTC: 5,420 credits, 08 world 200; fal 01a1ea70 COMPLETED).
  Atlas REST `api.atlas.worldlabs.ai` has NO key here (401) — the connector is used instead. New account: secure credential form only.
* **Local tools:** Blender 5.3.0, Android SDK 34 + build-tools 34.0.0, Java 21, Node 22, Playwright Chromium (WebGL2), ffmpeg,
  ImageMagick, Python cv2/scipy (all verified by the bootstrap 16:27 UTC). DA3 depth maps: `qa/da3/2026-11-18/depth_npz/`.
* `user-settings.json` = ~/.claude/settings.json of this account (checked: no secrets).
