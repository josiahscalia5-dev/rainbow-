# Rainbow — tool / MCP reconnection (no secrets stored)

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
