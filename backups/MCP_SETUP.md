# Rainbow — tool / MCP reconnection (no secrets stored)

Machine-readable list of every tool, plugin, MCP server, hook, host and credential (names only):
**`backups/TOOL_MANIFEST.json`**. `scripts/claude-bootstrap.sh` checks and installs what is missing at session start.

## Newest check — session 01AvQv6S (branch `claude/rainbow-restore-env-setup-bxn85h`, 2026-11-17 00:40–00:55 UTC, new account, personal environment `rainbow-`, limited network)
| Tool | Tested result (really run) | On the next account |
|---|---|---|
| GitHub MCP + git proxy | `mcp__github__list_branches` → 26 branches; pushes verified (remote SHA == local) | connect GitHub + Claude GitHub App |
| Playwright plugin MCP + Chromium 153 | `claude mcp list` → connected; `browser_navigate` + `browser_evaluate`: WebGL 2.0, ANGLE / SwiftShader | enable the `playwright` plugin if missing |
| Blender 5.3.0 (CLI + Python) | present at session start (environment setup script); `scripts/verify-blender.py`: Workbench / EEVEE / Cycles renders, 7/7 `.blend`, 3 GLBs, GLB round trip 6/6; paddle, camera-lock and tunnel bake scripts ran | automatic (bootstrap) if `download.blender.org` is allowed |
| Blender MCP (`mcp-for-blender`) | **NOT connected, not possible**: headless container, no display, no desktop add-on socket (`uvx` exists, nothing to connect to) | only on a desktop machine with Blender open |
| Chrome DevTools MCP | not present in this environment (not listed by `claude mcp list`); not needed — Playwright covers it | — |
| worldlabs plugin MCP (Atlas) | installed, **not connected** (proxy 403) — optional, not needed for Screen 05 | connector sign-in only for new World Labs work |
| Marble World API | host `api.worldlabs.ai` not allowed here → network error (NOT a key problem); no key on this account | `request_credential` only if the user wants new Marble work |
| Android SDK 34 + build-tools 34.0.0, Java 21, Capacitor 6.2.3 | present; APK not built in this check | automatic (bootstrap) if `dl.google.com` is allowed |
| Meshy / Rodin | not installed, not needed, no credits | — |

## Newest check — session 01Kbt6BT (branch `ccr-251ed97c-ty2xvp`, 2026-11-16 10:40–11:20 UTC, `Default` environment, unrestricted)
| Tool | Tested result | On the next account |
|---|---|---|
| GitHub (git proxy) | pushes verified (remote SHA == local) | connect GitHub + Claude GitHub App |
| Git LFS 3.4.1 | 24/24 real; all 24 confirmed + downloaded fresh from GitHub LFS (SHA-256 match) | automatic (hook) |
| Blender 5.3.0, Android SDK 34 + build-tools 34.0.0 | installed by the bootstrap (≈ 60 s, parallel), headless bpy test OK | automatic (bootstrap) |
| Playwright plugin MCP + Chromium 153 | `claude mcp list` → connected; WebGL2 smoke test OK | enable the `playwright` plugin if missing |
| World Labs Atlas connector | `list_projects` OK ("My project", credits available); nothing run | re-add + sign in |
| Marble World API key | network secret on this account's **Default** environment; free `GET /credits` → 5,190 | `request_credential` only if needed |
| worldlabs@worldlabs plugin | installed by the bootstrap | automatic (bootstrap) |
| context7 plugin | needs authentication; not used | ignore |

## Newest check — session 012NR93N (branch `ccr-44f84024-ii5iih`, 2026-11-16 03:10–10:35 UTC)
| Tool | Tested result | On the next account |
|---|---|---|
| GitHub (git proxy + GitHub MCP) | pushes verified (remote SHA == local); `list_pull_requests` / `create_pull_request` OK (draft PR #5) | connect GitHub to the Claude account + Claude GitHub App on the repo |
| Git LFS | 24 / 24 binaries downloaded fresh from GitHub LFS, SHA-256 identical. Container default filter is `--skip` → run `git lfs pull` after cloning | `bash scripts/resume-newest-work.sh` |
| World Labs Atlas connector | connected (tool list present); not called, no credits used | re-add the connector in claude.ai settings and sign in |
| Marble World API key | NOT on this account's `rainbow-` environment (no network secret; `api.worldlabs.ai` not allowed). Not needed — all generated assets are in Git LFS | `request_credential` (host `api.worldlabs.ai`, header `WLT-Api-Key`) only if the API is needed again |
| Playwright plugin MCP + Chromium | connected; `scripts/capture.mjs` and `scripts/gameplay-test.mjs` ran | re-enable the plugin if missing |
| worldlabs@worldlabs plugin | installed (skills `worldlabs:*`) | `bash scripts/setup-worldlabs-plugin.sh` |
| Blender 5.3.0 / Android SDK 34 + build-tools 34.0.0 | installed by the environment setup script (`/usr/local/bin/blender`, `/opt/android-sdk`) | `resume-newest-work.sh --tools` |
| Cloud environment `rainbow-` | limited network + package managers + MCP servers; hosts `download.blender.org`, `dl.google.com`, `api.atlas.worldlabs.ai`, `lfs.github.com`; setup script present | recreate with the same hosts; setup script = `scripts/cloud-env-setup.sh` |
| context7 plugin | failed to connect (`ERR_PROXY_TUNNEL`); not used | ignore |

## Newest check — recovery session 01Kbt6BV (new Claude account, 2026-11-16 ~02:15–02:45 UTC)
| Tool | Tested result | On the next account |
|---|---|---|
| GitHub (git proxy + GitHub MCP) | pushes verified (remote SHA == local); `list_pull_requests`/`create_pull_request` OK (draft PR #4) | connect GitHub to the Claude account + Claude GitHub App on the repo |
| World Labs Atlas connector | `list_projects` OK ("My project", Personal workspace, credits_available true); nothing run | re-add the connector in claude.ai settings and sign in |
| Marble World API key | saved by the user via the secure credential form on this account's **Default** environment (host `api.worldlabs.ai`, header `WLT-Api-Key`); free `GET /credits` → 5,190; both pilot worlds `GET /worlds/{id}` → 200 | does not transfer: request it again with the secure form; never chat/git |
| Playwright plugin MCP | tools loaded (`browser_*`); captures use the preinstalled Chromium via `scripts/capture.mjs` | re-enable the plugin if missing |
| worldlabs@worldlabs plugin | installed by `scripts/setup-worldlabs-plugin.sh` (its duplicate Atlas MCP disabled) | `bash scripts/setup-worldlabs-plugin.sh` |
| Blender 5.3.0 / Android SDK 34 + build-tools 34.0.0 | installed by `scripts/setup-blender.sh` / `setup-android-sdk.sh`; both `.blend` Marble imports open | rerun the scripts (or `resume-newest-work.sh --tools`) |
| context7 plugin | needs OAuth sign-in; not used by Rainbow | ignore unless needed |

Status as verified in the cloud development session on 2026-11-15. "Tested" means a real call succeeded
in this environment; nothing here is assumed.

| Tool | Status here | Evidence / blocker | Reconnect |
|---|---|---|---|
| Playwright MCP | **connected** (`claude mcp list` → ✓ Connected) | Plugin server `@playwright/mcp@latest`; Chromium + Playwright library preinstalled and used by `scripts/` capture tooling | `claude mcp add playwright npx @playwright/mcp@latest` |
| Chrome DevTools MCP | connected (bonus) | `chrome-devtools-mcp@1.1.1 --headless` ✓ | plugin-provided |
| GitHub | **connected** | Session GitHub access scoped to `josiahscalia5-dev/rainbow-`; repo verified private via API; pushes use the session git proxy | GitHub MCP / normal `git` auth |
| Blender MCP (`mcp-for-blender`) | **not connected** | No desktop Blender in this headless container; the add-on needs Blender's UI to start its socket server | `claude mcp add blender uvx mcp-for-blender` then `uvx mcp-for-blender install-addon`, enable add-on in Blender, start server from the N-panel |
| Meshy MCP | **not installed / needs API key + credits** | No key provided; paid generation requires your approval | Follow https://github.com/meshy-dev/meshy-mcp-server README; store `MESHY_API_KEY` in local env only |
| Hyper3D Rodin MCP | **not installed / needs sign-in + credits** | Requires OAuth in `/mcp` and a billing workspace | `claude mcp add --transport http hyper3d-rodin --scope user https://api.hyper3d.com/api/mcp` |
| World Labs Atlas | account 8: claude.ai connector **connected** (`list_projects` OK); per Claude account | Re-add + sign in on each new account | claude.ai connector "World Labs Atlas" (preferred) or `claude mcp add --transport http worldlabs https://api.atlas.worldlabs.ai/mcp` |
| Marble World API | account 8: key saved via secure form as an environment network secret (host `api.worldlabs.ai`, header `WLT-Api-Key`); tested 200 | Secrets never transfer: re-enter via `request_credential` on the new environment | REST, no MCP: `tools/worldlabs/marble_pilot.py`; ledger `qa/worldlabs/05/pilot/LEDGER.md` |
| context7 (docs) | needs authentication | Not required for Rainbow | via claude.ai connector settings |

`.mcp.json.template` mirrors these servers without credentials. Copy it to `.mcp.json` (git-ignored) if
you prefer file-based config.

**Paid-credit policy:** no Meshy / Rodin / World Labs credits have been spent. Claude must ask before any
paid generation, naming the asset, estimated credits (or "pricing unknown") and the account/workspace.
