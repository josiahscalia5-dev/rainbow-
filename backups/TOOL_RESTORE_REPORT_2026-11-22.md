# Tool restore report — previous Claude account → new Claude account (2026-11-22 ~15:05 UTC)

New-account lead branch `ccr-0bbd5b9d-js1cpg` (continues `ccr-80cdb162-4sqz1a` = 6b5e632, which contains 791654a). Nothing merged, reset or deleted.
Previous-account snapshot = `backups/LIVE_TOOLS_STATE.json` at 6b5e632 (14:10 UTC); `TOOL_MANIFEST.json`, `MCP_SETUP.md`, `.mcp.json.template` identical on both branches.

Legend: ✔ yes · ✘ no · — not applicable. "Tested" = a real action this session, not a listing.

## Claude plugins
| plugin | previous account | new account: installed / enabled | connected / auth | tested this session |
|---|---|---|---|---|
| parallax-threejs (Three.js DevTools, Chrome DevTools, Playwright MCP, Spector) | synced | ✔ / ✔ | see MCP table | ✔ (see MCP) |
| playwright | synced | ✔ / ✔ | ✔ connected | ✔ |
| design | synced | ✔ / ✔ | its Slack/Figma/Linear/Notion/Atlassian/Intercom servers need sign-in; Asana incompatible | not needed for Rainbow |
| worldlabs (skills) | local | ✔ / ✔ | its own MCP copy "needs authentication" = the known duplicate; Atlas is used through the claude.ai connector | ✔ via connector |
| **claude-code-setup** | synced | **restored** ✔ / ✔ (card, 14:53) | — | loaded (skill listed) |
| **serena** | synced | **restored** ✔ / ✔ | ✔ connected (uvx) | health check only |
| **typescript-native-lsp** | synced | **restored** ✔ / ✔ | needs `typescript-language-server` → installed 4.4.0 now + added to bootstrap (`step_lsp`) | binary ✔ (project TS 5.9.3 → fallback server) |
| skill-creator | synced | not re-enabled: **duplicate** — the built-in `anthropic-skills:skill-creator` is already in this session | — | — |
| context7 | ✘ | ✔ / ✔ (new) | plugin copy needs OAuth; the **Context7 claude.ai connector works** | ✔ resolved three.js docs |
| frontend-design | ✘ | ✔ / ✔ (new) | — | loaded |
| feature-dev | ✘ | **added** ✔ / ✔ (card) | — | loaded |
| superpowers | ✘ | **added** ✔ / ✔ (card) | — | loaded |
| pyright-lsp | ✘ | **added** ✔ / ✔ (card) | pyright-langserver present | binary ✔ |
| code-review | ✘ | not added: built-in `code-review` skill already present (duplicate) | — | — |
| Meshy / Runpod / spaitial-ai | ✘ | **not enabled** — paid services / own API keys; ask the user first | — | — |
| Hyper3D Rodin | ✘ (not installed) | not in the plugin directory; MCP needs OAuth + billing | — | — |

## MCP servers / connectors
| server | previous | new: connected | authenticated | tested |
|---|---|---|---|---|
| GitHub (git proxy + GitHub MCP) | ✔ | ✔ | ✔ | ✔ read `tools/screenkit` on this branch, listed PRs (#32 draft untouched); ✔ push = every autosave, remote SHA == local |
| Playwright MCP (×2: playwright plugin + parallax) | ✔ | ✔ | — | ✔ opened Screen 06 in Chromium |
| Three.js DevTools MCP | installed, bridge not used | ✔ | — | ✔ **bridge connected** to the running Screen 06 page (proxy 9222 → 3000): 233 draw calls, 309,594 triangles, 250 textures, 15 programs |
| Chrome DevTools MCP | ✔ | ✔ | — | ✔ list_pages |
| Spector.js MCP | failed | plugin copy: ✘ (never built in synced plugins — ignore); **standalone official `spectorjs`: ✔ connected** (added 15:20 UTC at the user's request) | — | ✔ real Screen 06 frame captured twice (also from a from-scratch reinstall by the bootstrap): 1,056 commands, 233 draw calls, 11 programs, 0 GL errors — `qa/tools/spector_2026-11-22/`; tools appear from the next session start |
| World Labs Atlas connector | ✔ | ✔ | ✔ (credits available) | ✔ list_projects (free) — no paid task |
| Marble World API key (network secret) | ✔ | ✔ | ✔ 2,030 credits (free read) | old world IDs return 404 for this key; their files are saved in Git LFS |
| fal.ai (proxy-injected) | ✔ | ✔ | no auth error (free status probe → 404 for a dummy id) | no job started |
| Context7 connector | ✘ | ✔ | ✔ | ✔ |
| serena | synced | ✔ | — | health check |
| Blender MCP (`mcp-for-blender`) | ✘ not connected | ✘ not installed | — | needs a desktop Blender UI; headless Blender does all the work (tested below) |

## Development tools (all tested by real actions)
| tool | result |
|---|---|
| Blender 5.3.0 + Geometry Nodes | ✔ `setup_screen.sh 06` rebuilt Screen 06 (RB_Sweep_Tube/Ribbon/Flume/Band, FoamBank, pools, paddles) and exported `scene.glb` (Khronos glTF Blender I/O 5.3.43, 133,359 vertices) in 16 s |
| SAM 2.1 tiny + Depth Anything V2 small | ✔ downloaded free (149 MB + 95 MB, `~/.cache/rainbow-models`, onnxruntime 1.29.0); SAM 2 Benny mask pred IoU 0.951 |
| Texture bake + Playwright Chromium (WebGL2) | ✔ game page baked in 36 s; still at the picture camera → **88.5 % scenery px within 20 levels, SSIM 0.856, colour look 0.996** = exactly the saved round-43b result (old game 3.8 %) |
| Android SDK 34 + Gradle 8.2.1 + Capacitor | ✔ `VITE_RAINBOW_BONUS=1 VITE_RAINBOW_KIT06=1 npm run android:debug` → BUILD SUCCESSFUL in 1 m 31 s, `app-debug.apk` 118 MB with `public/screen06` inside. **Not tested on a device** (no phone / emulator here) |
| glTF Transform | ✔ `npx @gltf-transform/cli@4.2.1 inspect` read the Screen 06 GLB (on demand, not installed globally) |
| Git LFS | ✔ 615 files, 0 pointer stubs (220 mp4, 138 jpg, 138 png, 56 ply, 26 glb incl. Benny `benny31.glb`, 20 spz, 9 apk, 7 .blend) |
| Approved pictures | ✔ `sha256sum -c scripts/reference.sha256`: all 13 OK (11 screens, isolated 05 water, cartoon girl); Bubble Dash / Sock Rescue references untouched |
| Five-minute autosave | ✔ `AUTOSAVE OK … (match)`; private redaction list re-created (outside the repo) |

## Specialists (`.claude/agents/`)
All 10 definitions present and byte-identical to the saved ones (SHA-256 match): reference-match-director, washer-environment-modeler,
water-fx-specialist, benny-character-artist, animation-and-gameplay-engineer, path-camera-transition-engineer, foam-bubbles-particles,
playwright-visual-qa, android-build-performance, cartoon-girl-character-artist. All are invocable through the Agent tool in this session.
**Running now: none** (a running agent never transfers between accounts; no worktrees exist). `AGENTS_STATUS.json → running_now` updated
(it still listed the round-34 team). Relaunch one only for a concrete task, from its notes.

## Did not transfer / needs the user
* Spector.js MCP — solved with the official standalone server (`spectorjs`, reinstalled automatically by `scripts/claude-bootstrap.sh` → `step_spector`).
* Context7 plugin copy + design-plugin servers (Slack, Figma, …) — would need OAuth sign-in in a local Claude Code; not needed (the Context7 claude.ai connector works).
* Meshy, Runpod, spaitial-ai, Hyper3D Rodin — paid / own keys: only with the user's explicit OK.
* Blender MCP — only useful on a desktop with the Blender UI.
* Session-local installs (typescript-language-server) vanish with the container; `scripts/claude-bootstrap.sh` (`step_lsp`) now reinstalls it.
