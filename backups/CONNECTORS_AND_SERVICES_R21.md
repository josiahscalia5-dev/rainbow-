# Connectors, servers, keys and tools in use (round 21, 2026-11-20) — NAMES ONLY, no secrets

Logins, connector sign-ins, API keys and running processes are tied to a Claude account / cloud environment and CANNOT be moved
through GitHub. Everything else (code, assets, agents, briefs, transcripts, pictures) is in this repository. On the new account:

| What | Used for | State on the old account (verified 2026-11-20) | How to restore on the new account |
|---|---|---|---|
| GitHub (claude.ai GitHub connection + Claude GitHub App on `josiahscalia5-dev/rainbow-`) | clone, push, GitHub MCP tools | connected as `josiahscalia5-dev` | connect GitHub in claude.ai, install / allow the Claude GitHub App on the repo |
| World Labs Atlas / Marble connector (claude.ai connector, MCP `World_Labs_Marble`) | Atlas tools: images2PosedRGBD, atlasGenerate, posedImages2Splats, splats2Mesh, atlasTextToImage, atlasChisel | connected; project "My project" (`proj_ad4fdb076f4a4c80934406cfefc4d30b`), credits available | add the World Labs connector in claude.ai and sign in |
| World Labs API key (environment network secret, host `api.worldlabs.ai`, header `WLT-Api-Key`) | Marble API, `scripts/verify-assets.py worldlabs` | authenticated, 5,420 credits (old Marble worlds 404 = earlier account; their files are in Git LFS) | Claude checks with a free read; only on 401/403 the secure credential form (never paste keys in chat) |
| fal key (environment network secret, host `queue.fal.run`, header `Authorization: Key …`) | paid image jobs `fal-ai/nano-banana-2/edit` (generated continuation views), plates | working (status read 200; 5 jobs this round, $0.60, ledger `qa/review_r21/artwork/LEDGER.md`) | same: free check first, secure form only if it fails |
| Hugging Face connector (claude.ai, MCP `Hugging_Face`) | Hub models / spaces lookups | connected as `josdois` | add the Hugging Face connector in claude.ai and sign in |
| Claude Docs connector | documents (not used by the game) | available | optional |
| Context7 plugin | library docs | needs a sign-in (not used by the game) | optional |
| Playwright MCP plugin + headless Chromium (WebGL2, SwiftShader) | all real-game screenshots / clips | connected; Chromium preinstalled — never `playwright install` | automatic in the cloud image |
| Repo plugin `worldlabs@worldlabs` + skills (atlas-splats, atlas-flythrough, atlas-blender, worldlabs-cli) | World Labs workflows | installed by the bootstrap | automatic (bootstrap) |
| Account plugins synced this session | superpowers, claude-bridge (browser), claude-md-management, code-review, code-simplifier, commit-commands, feature-dev, frontend-design, security-guidance, typescript LSP, typemux-cc, claude-code-setup | enabled | enable in claude.ai if wanted (the game does not need them) |
| Cloud environment | network + secrets | "Default" personal environment, network UNRESTRICTED, network secrets for `api.worldlabs.ai` and `queue.fal.run` | on a limited network allow `v3.fal.media`, `v3b.fal.media`, `cdn.marble.worldlabs.ai` (fal / Marble downloads) |
| Tools in the container | Blender 5.3.0, Android SDK 34 + Java 21 + Gradle, Node 22, Python QA libs (numpy, Pillow, OpenCV, SciPy), ffmpeg, ImageMagick | all OK (bootstrap) | the SessionStart bootstrap installs what is missing |
| Project specialists (10) | `.claude/agents/*.md` (in the repo) | definitions unchanged | automatic; running agents do NOT carry over — relaunch from `docs/briefs/2026-11-20-r21/` |
| Lead tools (round 21) | `tools/lead21/audit_screen.mjs`, `clean_frame.mjs`, `fal_view.py` | in the repo | automatic |
| Chat history | `backups/claude-sessions/<session id>/transcript.md` (+ `subagents/`) — this round: `5a3a0996-c88f-53c3-8888-e587e3601a8b` | saved by the autosave | readable in the repo |
