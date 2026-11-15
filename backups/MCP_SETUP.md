# Rainbow — tool / MCP reconnection (no secrets stored)

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
| World Labs Atlas/Marble | **not installed / needs sign-in** | Optional; Atlas ≠ Marble; verify any Marble link before use | `claude mcp add --transport http worldlabs https://api.atlas.worldlabs.ai/mcp` |
| context7 (docs) | needs authentication | Not required for Rainbow | via claude.ai connector settings |

`.mcp.json.template` mirrors these servers without credentials. Copy it to `.mcp.json` (git-ignored) if
you prefer file-based config.

**Paid-credit policy:** no Meshy / Rodin / World Labs credits have been spent. Claude must ask before any
paid generation, naming the asset, estimated credits (or "pricing unknown") and the account/workspace.
