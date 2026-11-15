# Rainbow — Claude conversation index

Sanitized copies of every Claude Code session transcript that is **accessible in this
environment** for the Rainbow project (`~/.claude/projects/-home-user-rainbow-*`).
Hidden model reasoning and base64 image payloads are omitted; secrets/e-mails are redacted.
Conversations from other computers, accounts or claude.ai chats are NOT accessible here and
are therefore not included.

Search tip: `grep -ril "07" backups/claude-sessions/*/transcript.md`

| Session | Title | Branch | First event (UTC) | Last event (UTC) | User msgs | Claude msgs | Subagents | Topics | Files |
|---|---|---|---|---|---|---|---|---|---|
| `515c677b-ab06-5e2e-a8b1-8f1fec6cb7a1` | Rainbow 3D mobile game project | `ccr-6f431adf-7h0m8y` | 2026-11-15T16:32:33.845Z | 2026-11-15T17:52:06.808Z | 1 | 413 | 3 | benny, girl, water, 07, 08, plunge, autosave, backup, android, playwright, blender, meshy, screens, towel, hud, coin, shader, agents | [md](claude-sessions/515c677b-ab06-5e2e-a8b1-8f1fec6cb7a1/transcript.md) · [jsonl](claude-sessions/515c677b-ab06-5e2e-a8b1-8f1fec6cb7a1/transcript.sanitized.jsonl) |

## Restore / resume

* Read `transcript.md` for the human-readable history; `transcript.sanitized.jsonl` keeps the
  structured events (tool calls/results) for tooling.
* A Git snapshot cannot revive a live in-memory Claude session. To continue, open the repo in
  Claude Code and point it at `backups/CURRENT_STATE.md` plus the latest transcript.md.
