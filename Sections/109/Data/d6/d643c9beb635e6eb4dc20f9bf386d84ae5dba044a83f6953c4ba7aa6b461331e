# Rainbow — recovery guide

How to restore the RAINBOW 11-screen 3D game on another computer or another Claude Code account.

## 1. Where the backup lives

| Item | Value |
|---|---|
| Repository | https://github.com/josiahscalia5-dev/rainbow- (**private**) |
| Backup branch | `ccr-6f431adf-7h0m8y` (the first branch ever pushed → it is also the repo's default branch) |
| Live status | `backups/BACKUP_STATUS.json` (last run, last verified remote SHA) |
| Run history | `backups/BACKUP_LOG.md` |
| Where the project stands | `backups/CURRENT_STATE.md` |
| Claude conversations | `backups/CONVERSATION_INDEX.md` → `backups/claude-sessions/<session-id>/` |
| Specialist agents | `.claude/agents/*.md` + roster/status `backups/AGENTS_STATUS.md` |
| Tool/MCP reconnection | `backups/MCP_SETUP.md`, `.mcp.json.template` (no secrets) |
| Original upload package | `backups/source-package/` (kit ZIP via Git LFS + the two prompt files) |
| File checksums | `backups/MANIFEST.json` |

## 2. Clone

```bash
# Git LFS is required for the kit ZIP and any .glb/.blend/.apk assets
git lfs install
git clone https://github.com/josiahscalia5-dev/rainbow-.git rainbow
cd rainbow
git checkout ccr-6f431adf-7h0m8y
git lfs pull            # downloads LFS objects (GLB models, kit ZIP, builds)
```

Verify the locked references were not altered:

```bash
sha256sum -c <(grep -oE '`[0-9a-f]{64}`' REFERENCE_ORDER.md | tr -d '`' | paste - <(ls references/*.png; echo character_references/official_cartoon_girl_original.jpg) -d '  ')
# or simply compare against the SHA-256 table in REFERENCE_ORDER.md
```

## 3. Install & run the game

```bash
npm ci                   # Node 20+ (tested with Node 22)
npm run dev              # http://localhost:5173 — portrait game in the browser
npm run build            # production web build into dist/
npm run test:continuity  # route/altitude continuity test (07 plunge → 08 inlet)
npm run qa:capture       # Playwright: screenshots/01.png … 11.png + qa/ comparisons
```

Android (Capacitor): see `docs/BUILD_ANDROID.md`.

## 4. Re-enable the five-minute autosave on the new machine

```bash
bash scripts/install-autosave-scheduler.sh   # cron */5 (Linux) or loop-daemon fallback
python3 scripts/rainbow-autosave.py --reason manual   # one immediate backup + verification
```

* macOS: replace cron with a launchd agent that runs `scripts/autosave-cron.sh` every 300 s.
* Windows: Task Scheduler → "every 5 minutes" → `bash scripts/autosave-cron.sh` (Git Bash/WSL).
* Edit `backups/autosave.config.json` if the repo URL or branch changes — the script refuses to push
  anywhere that does not match it.
* Claude Code hooks (`.claude/settings.json`) re-arm the scheduler at every SessionStart and snapshot at
  PreCompact / Stop / SessionEnd automatically once the repo is opened in Claude Code.

## 5. Restore the specialists and tools

* The 10 specialists are plain files in `.claude/agents/`. Open the repo in Claude Code and they load as
  project subagents (check with `/agents`).
* Reconnect MCP servers with the commands in `backups/MCP_SETUP.md`. Add API keys only through each
  tool's sign-in flow or your local environment — never commit them.

## 6. Resume the Claude conversation

* A Git snapshot **cannot** revive a live in-memory Claude session or its hidden state.
* To continue: open the repo in Claude Code and say *"Read backups/CURRENT_STATE.md and the latest
  backups/claude-sessions/*/transcript.md, then continue Rainbow from the next task listed."*
* The sanitized transcripts omit hidden model reasoning and image payloads (the images are in
  `references/` and `screenshots/`), and redact e-mail addresses/secrets.

## 7. Limits you should know

* The current development machine is an **ephemeral cloud container**. Its cron job runs only while the
  container is alive; when the session is idle long enough the container is reclaimed and the schedule
  stops. Everything up to the last 5-minute push is safe on GitHub; the SessionStart hook re-arms the
  schedule the next time a session opens this repo.
* Nothing is ever force-pushed; if the remote diverges the script merges non-destructively or stops and
  logs the conflict, keeping the local commit.
