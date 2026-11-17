# Paste this into Claude Code on the next Claude account

**NEWEST (2026-11-17 ~14:30 UTC): use the one-message prompt in `docs/NEW_CLAUDE_ACCOUNT_HANDOFF.md` — it supersedes the prompt below.**

(Updated 2026-11-17 ~11:50 UTC, session 03b94f36. Replaces the 2026-11-16 version, whose hook description — "merges every
newer branch" — is no longer true: since 2026-11-17 NOTHING is merged automatically.)

## Before you paste (one-time, on the new account — these never travel through GitHub)
1. claude.ai → connect **GitHub** to the new Claude account and install the **Claude GitHub App** on the private repo
   `josiahscalia5-dev/rainbow-` (https://github.com/josiahscalia5-dev/rainbow-).
2. Start a Claude Code cloud session on `josiahscalia5-dev/rainbow-`, branch **`ccr-9c4a8ad6-xovgsx`**
   (or `ccr-61131b9d-uj0oqb` — same game files). Claude will offer to set up the cloud environment
   (Blender / Android downloads); approve it.
3. Optional only: the World Labs Atlas connector. Never paste any API key into the chat — Claude opens a secure form
   when a key is really needed for a job you approved.

## The prompt
> RAINBOW 3D — continue my EXISTING game. Do NOT start a new game, do NOT recreate anything, do NOT delete or overwrite
> any branch, do NOT merge or cherry-pick any branch without asking me first.
> Repository: `josiahscalia5-dev/rainbow-`, branch `ccr-9c4a8ad6-xovgsx`. My Screen 05 visual-matching work is on
> `ccr-b0757dec-dj6l1o` — a separate, unmerged line; leave it untouched until I decide.
> 1. Follow `CLAUDE.md`. Run `bash scripts/claude-bootstrap.sh --skip-resume` and `bash scripts/claude-bootstrap.sh --status`.
> 2. Read `backups/HANDOFF_2026-11-17_NEW_ACCOUNT.md` first (it wins over older notes), then `backups/AGENTS_STATUS.json`
>    and `backups/TOOL_MANIFEST.json`.
> 3. Give me the backup report from `CLAUDE.md` §4 and tell me what I must re-connect.
> 4. Keep the five-minute autosave running on your own session branch and verify remote SHA == local HEAD.
> 5. Show me my approved Screen 05 next to the Screen 05 of both branches as separate full-size pictures, and ask me
>    whether to combine the two branches (handoff §1 procedure). Do nothing to either branch before I answer.
> 6. Then work ONLY on the VISUAL part of my playable screens 04, 05, 06, 07, 08 — the scenery and the look, so each
>    matches my exact approved picture (at least 90 %). Do not talk to me about camera or movement; show me
>    APPROVED | BEFORE | NEW pictures and the whole-screen numbers. Videos 01, 02, 03, 09, 10, 11 stay videos: never
>    regenerate them, never spend paid credits without asking me first.

## What that makes the next session do (details for Claude)
1. The SessionStart hook fetches every branch and LISTS the ones not contained in HEAD (it never merges), restores the
   Git LFS binaries, re-arms the autosave and starts the full bootstrap in the background (tools only when missing:
   Blender 5.3.0, Android SDK 34, npm, Python libs, World Labs plugin; tests `tsc` + continuity). Any FAIL / GAP line
   goes to the user. `--resume` (old merge) only with the user's explicit OK. `codex/*` is never merged.
2. The autosave follows the new session branch by itself (`session_branch_patterns`) and fills the `Claude-Session:`
   trailer from the running session. Update `backups/autosave.config.json` → `branch` and the `Co-Authored-By` line
   of `commit_trailer` (from your attribution instructions); add the previous session branch to `protected_branches`
   once it is contained. `python3 -I scripts/autosave-status.py` must say `AUTOSAVE OK … (match)`.
3. Specialists: `backups/AGENTS_STATUS.json` + handoff §5 (10 definitions in `.claude/agents/`, never recreate or rename
   them). None is running; two line-B specialists (washer-environment-modeler, foam-bubbles-particles) were interrupted
   at ~03:10 UTC on 2026-11-17 and continue from their NOTES only on line B (or a merged branch the user approved).
4. Cloud environment on the new account: personal, network limited, package managers + MCP servers allowed, allowed
   hosts `download.blender.org`, `dl.google.com`, `lfs.github.com`, setup script = `scripts/cloud-env-setup.sh`.
   World Labs (`api.worldlabs.ai`, header `WLT-Api-Key`) only for a paid job the user approved, key via
   `request_credential` only.
