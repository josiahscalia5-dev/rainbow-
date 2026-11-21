# Connectors, servers, keys and tools in use (round 22, 2026-11-20 ~04:00 UTC) — NAMES ONLY, no secrets

Logins, connector sign-ins, API keys and running processes belong to a Claude account / cloud environment and CANNOT travel through
GitHub. Everything else (code, assets, agents, briefs, transcripts, pictures, clips) is in this repository. Round-21 table:
`backups/CONVERSATION_INDEX.md` → `backups/CONNECTORS_AND_SERVICES_R21.md` (still valid); what changed in round 22:

| What | State on THIS account (checked 2026-11-20 ~03:20 UTC) | On the next account |
|---|---|---|
| GitHub (claude.ai connection + Claude GitHub App) | connected as `josiahscalia5-dev`; push to the session branch verified | connect GitHub, allow the Claude GitHub App on `josiahscalia5-dev/rainbow-` |
| World Labs API key (env network secret, host `api.worldlabs.ai`, header `WLT-Api-Key`) | was MISSING (HTTP 401) → re-entered by the user via the secure form ~03:19 → free read OK, 5,420 credits | free check `python3 -I scripts/verify-assets.py worldlabs`; secure form only on 401/403 |
| fal key (env network secret, host `queue.fal.run`, `Authorization: Key …`) | was MISSING → re-entered via the secure form ~03:19 → status read HTTP 200; 6 jobs run ($0.72) | free check = GET `https://queue.fal.run/fal-ai/nano-banana-2/requests/<ledger id>/status`; secure form only if it fails |
| World Labs Atlas / Marble connector (claude.ai, MCP `Marble_World_Labs`) | connected but "this sign-in has no active Atlas account" → the user must finish signing up at https://atlas.worldlabs.ai | add the connector, finish the Atlas sign-up; check with `list_projects` (free) |
| Hugging Face connector (claude.ai, MCP `Hugging_Face`) | authenticated as `josdois` | add + sign in; check with `hf_whoami` (free) |
| Playwright MCP + headless Chromium (WebGL2 SwiftShader) | OK (preinstalled; never `playwright install`) | automatic |
| Context7 / design plugins (Figma, Notion, Slack, Linear, Atlassian, Intercom, Asana) | need sign-in / not used by the game | optional |
| Cloud environment | "Default" personal, network UNRESTRICTED, network secrets: `api.worldlabs.ai`, `queue.fal.run` (no setup script; the repo's SessionStart bootstrap installs Blender 5.3.0, Android SDK 34, npm, Python QA libs) | same; on a limited network allow `v3.fal.media`, `v3b.fal.media`, `cdn.marble.worldlabs.ai` |
| Project specialists (10) | `.claude/agents/*.md`, SHA-256 unchanged | automatic; relaunch from `docs/briefs/2026-11-20-r22/` |
| Lead tools | `tools/lead21/{audit_screen,clean_frame}.mjs`, `tools/lead21/fal_view.py`, `tools/lead22/approval_sheet.py`, pinned-clock QA `qa/match/04/r22/tools/` | in the repo |
| Chat history | `backups/claude-sessions/2d0a4d78-4dbc-50ba-8522-05ed53372fe2/` (+ `subagents/`), round 21 `5a3a0996-…`, s06 r21 `84d7059c-…` (on its branch) | readable in the repo |
| Cloud worker sessions (this account) | s06 `session_0179kWgNZhiYHyDdV12Eaw6e` → `claude/rainbow-s06-match-c23`; Benny `session_0179kWgM7wtBDT3n5KLuLz7o` → `claude/rainbow-benny-c23` | not transferable — continue from their pushed branches |
