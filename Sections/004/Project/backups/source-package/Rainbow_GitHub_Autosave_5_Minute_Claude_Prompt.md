# RAINBOW — FIVE-MINUTE AUTOMATIC GITHUB BACKUP & RECOVERY

**PASTE THIS ENTIRE PROMPT INTO THE ACTIVE RAINBOW CLAUDE CODE SESSION.**

Claude, this is a standing instruction for my **RAINBOW** 11-screen 3D mobile game. I do not want to repeat it. Your first task is to **implement, start, test, and verify** a real automated backup system that snapshots my Rainbow work to the correct GitHub repository **every five minutes**, wherever the available development environment actually supports that. Then keep working on Rainbow.

## 1. VERIFY THE CORRECT GITHUB DESTINATION — DO NOT GUESS

I provided the identifier: **`ccr-6f431adf-7h0m8y`**.

That identifier may be a Git branch or session identifier, not a GitHub repository name. Before pushing:

- Inspect the Rainbow working directory, `git status`, `git remote -v`, `git branch -a`, and the current branch and commit SHA.
- If GitHub CLI is available, verify the repository's owner/name, URL, and privacy with `gh repo view`.
- Determine whether `ccr-6f431adf-7h0m8y` is the correct existing **branch** on the Rainbow GitHub repository. Check with the real remote, not an assumption.
- Use the verified Rainbow repository and intended existing branch. Do **not** create a similarly named repository, change to a different game, overwrite another branch, or push to an unrelated remote.
- Confirm the repository is **private before uploading any conversation archives**.
- If you cannot establish the repo URL or correct branch, ask me once for the GitHub owner/repository URL, but **begin local backups immediately** while waiting. Do not pretend GitHub backups succeeded.

## 2. SAVE THE ENTIRE RAINBOW PROJECT

Back up all available Rainbow-related work, not just the newest code:

- Source code, TypeScript, Three.js/WebGL game logic, gameplay state, HUD, mobile controls, project configuration, Android/Capacitor settings, and build scripts.
- All **11 approved reference screens**, the official cartoon girl reference, Benny character references, reference order, and original art; do not alter these approved originals.
- Blender `.blend` project files, modeling scripts, exported `.glb`/`.gltf` meshes, animations, rigs, shader code, water surfaces, foam/bubble particles, textures, audio if created, lighting, materials, and washer geometry.
- Water FX Specialist's custom cyan/pink water shaders, wave crest geometry, flow/spline settings, white foam, bubbles, and mobile performance settings.
- All scene transition and camera paths, especially the **full deep plunge from Screen 07 into Screen 08** and the ending at **11 — SAFELY HOME**.
- Playwright screenshots, visual reference comparisons, test fixtures, visual quality reports, checkpoints, and notes showing remaining mismatches.
- The master build instructions, `CLAUDE.md`, README, milestones, current tasks, decisions, TODOs, error reports, known issues, installation instructions, and exact restore steps.
- Project-level `.claude/agents/`, `.claude/skills/`, `.claude/rules/`, `.claude/commands/` (if present), safe hooks and settings, and relevant safe `.mcp.json` templates. Keep the actual enabled integrations documented so they can be restored. **Never commit API keys, access tokens, credentials, personal secrets, or live authentication files.**
- Any other project files needed to recreate the playable Rainbow game accurately.

**Do not import, mix, or back up unrelated games or other users' files.**

## 3. SAVE THE DESIGN SPECIALISTS, AGENTS, AND THEIR WORK

Preserve the real definitions, configuration, responsibilities, and available output logs of all Rainbow specialists:

1. Reference Match Director
2. Benny Character Artist
3. Cartoon Girl Character Artist
4. Washer Environment Modeler
5. Water FX Specialist
6. Foam and Bubble Specialist
7. Path and Camera Transition Engineer
8. Animation and Gameplay Engineer
9. Playwright Visual QA Specialist
10. Android Build and Performance Specialist

For each, keep its exact current instructions, project-specific agent configuration, output artifacts, completed tasks, work remaining, model/tool dependencies, and handoff notes. Preserve additional agents or skills used for Rainbow if they exist. Save reproducible non-secret MCP connection instructions for Blender, Meshy, Hyper3D Rodin, World Labs Marble/Atlas, Playwright, and GitHub, marking **tested connected / not tested / unavailable** truthfully.

## 4. PRESERVE OUR CLAUDE CONVERSATION HISTORY SAFELY

I want a recoverable history of **my conversations with Claude and the specialist agents** about Rainbow.

- Locate the current and other actually accessible Rainbow-related Claude Code session transcripts and subagent transcripts using supported session facilities and the session files available to this environment. Claude Code commonly stores local session JSONL files under its configured projects directory; do not assume other accounts, computers, or browser conversations are accessible.
- Preserve a sanitized, recoverable copy of accessible transcripts under `backups/claude-sessions/`, by session ID, and maintain `backups/CONVERSATION_INDEX.md` with date, session title/ID, branch, topics, and restore instructions. Where supported, save a readable export as well.
- Save a concise, up-to-date handoff summary in `backups/CURRENT_STATE.md`: what we built, all approved constraints, every recent decision, work in progress, next task, last completed test, and current issues. Preserve details about the cartoon girl replacing the old girl, Benny's unchanged design, all 11 levels, and Screen 07→08 geometry.
- Include accessible agent/subagent conversations or output files in the archive, labeled by agent and session. Do not invent missing past history, claim to have retrieved inaccessible conversations, or export hidden/private model reasoning.
- **Before uploading transcripts to GitHub, scan and redact credentials, secrets, tokens, private keys, sensitive local paths, and other private data.** Keep any raw unredacted archive only in appropriately secured local storage, not in GitHub, unless I explicitly approve that separate risk. Preserve the recoverable content without exposing secrets.
- Avoid creating a brand-new duplicate of a huge transcript at every interval: synchronize/update the per-session file so Git stores incremental changes.

## 5. IMPLEMENT A REAL FIVE-MINUTE AUTOMATION

Build an idempotent backup script inside the Rainbow project, for example `scripts/rainbow-autosave.py` or a robust platform-appropriate equivalent. Its behavior:

1. Run from the verified Rainbow repository only. Validate repository identity and current target branch on every run.
2. Use a lock to prevent overlapping backups or interference with an active git operation.
3. Capture/update the accessible project notes, safe conversation snapshot, agent configurations, and backup manifest.
4. Use an explicit safe allowlist or appropriately reviewed `.gitignore`, not blind submission of all files. Exclude dependencies, caches, temporary files, `.env`, secrets, credentials, authentication state, and unrelated data.
5. Use **Git LFS** for large binary art where appropriate, including large Blender, GLB, and texture files, subject to available quotas. Do not silently drop necessary assets. Report oversize/quota failures.
6. If there are changed approved files, create a timestamped commit such as `autosave: Rainbow 2026-11-15 11:30 ET`; push to the verified remote branch using normal authenticated Git. If nothing changed, record a successful no-change check without an empty commit.
7. Never force-push, hard-reset, delete files, overwrite conflicting work, rewrite history, or discard local changes to solve a problem.
8. If offline, unauthorized, or push is rejected, preserve the local commit and retry on the next run; log errors prominently. Do not claim a successful remote save unless the remote commit is verified.
9. Record each run in `backups/BACKUP_STATUS.json` and append concise results to `backups/BACKUP_LOG.md`: time, commit SHA, branch, remote, file counts, push verification, error (if any), and next attempt. Avoid recursive log-only commits on unchanged projects.
10. Make the script safe if it runs while Claude is editing. Prefer atomic copies/temporary snapshots and never stage unreviewed partial secret files.

Install **one** persistent five-minute scheduler matching the actual environment (e.g. user-level systemd timer or cron on Linux; launchd on macOS; Windows Task Scheduler; or a supported persistent Claude Desktop local scheduled task). Choose an option that really can access the working copy and remains active when the interactive Claude Code conversation closes. Have it run at `*/5 * * * *` or the equivalent. Make sure the machine/process must be awake and connected; if this is an ephemeral cloud environment that cannot keep a scheduler alive, state that limitation instead of promising impossible uptime.

Additionally, when supported, configure Claude Code hooks at **SessionStart, PreCompact, Stop, and SessionEnd** to run a safe snapshot/backup check at sensible times. Hooks complement but **do not replace** the five-minute schedule. If useful during the live session, configure `/loop 5m` to check the verified backup status; remember that a session loop is not independently persistent and may expire.

**This is a one-time setup request, not a request that I must repeat every five minutes.** Request any necessary initial permissions only once through the supported authorization flow. Never bypass permissions or store tokens in Git.

## 6. PERFORM AND VERIFY THE FIRST BACKUP NOW

Do not stop at writing a plan or script. When the destination and permissions are verified:

- Run an initial complete backup immediately.
- Verify the correct remote branch actually contains the pushed commit, backup manifest, project files, agent instructions, and sanitized transcript snapshots.
- Verify large LFS objects are present and downloadable where used.
- Demonstrate the installed recurring schedule and show a real test of a subsequent run (including no-change behavior).
- Include `backups/RECOVERY.md` documenting how to clone the repo, install dependencies, retrieve LFS assets, restore specialist instructions, access transcript exports, resume a Claude Code session where possible, and continue Rainbow from the last saved checkpoint. Explain that Git snapshots and conversation summaries help restore work but do not automatically restore live in-memory sessions or hidden state.
- Show me: **GitHub repository URL; repository privacy; target branch; latest verified remote SHA; latest successful backup time; next scheduled run; scheduler status; files/assets covered; transcript coverage; and any failures/limitations.**

## 7. CONTINUE THE GAME AFTER SETUP

Once the first verified backup succeeds, resume building the same **11-screen Rainbow game** and its official cartoon girl + Benny. Keep the approved images fixed. Never interrupt gameplay development unnecessarily just to repeat these backup instructions. The timer or scheduler must handle backups automatically.

**Priority order:** Correct repository → local emergency snapshot → private remote verification → safe transcript/agent backup → working five-minute scheduler → proof of success → resume development.
