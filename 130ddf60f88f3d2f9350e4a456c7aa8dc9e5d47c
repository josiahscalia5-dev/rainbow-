# Rainbow — Claude Code tool setup and verification

Run in the **Claude Code machine's terminal**, after installing prerequisites. Claude should verify actual versions/docs and check what is already installed before running installs; these commands don't run inside an Android app. No tools were installed or connected by packaging this kit.

## Blender MCP — community tool (not made by Blender Foundation)

Official project: https://github.com/ahujasid/mcp-for-blender

Prerequisite: installed desktop Blender, `uv`/`uvx` (https://docs.astral.sh/uv/).

```bash
claude mcp add blender uvx mcp-for-blender
uvx mcp-for-blender install-addon
```

Open Blender, enable `Interface: MCP for Blender` in Preferences > Add-ons; from the 3D viewport sidebar (`N`) open MCP for Blender, connect/start its server and verify with Claude's `/mcp`. The package was formerly called `blender-mcp`; **new installs should use `mcp-for-blender`**.

## Playwright MCP — browser WebGL capture and UI test

Official docs: https://playwright.dev/docs/getting-started-mcp
Requires Node.js 20+.

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

Verify server listed and screenshot test of running dev server; Playwright's screenshots alone cannot tell whether a scene is real 3D—test interaction and inspect rendered scene + code.

## World Labs Atlas MCP — OPTIONAL

Official docs: https://docs.atlas-beta.worldlabs.ai/mcp

```bash
claude mcp add --transport http worldlabs https://api.atlas.worldlabs.ai/mcp
```

Run `/mcp` then sign in. **Atlas and Marble are not automatically the same service;** user may provide a separate Marble link later. Atlas outputs/credits/terms must be checked before use. Not the source of truth for exact tube geometry or working water physics.

## Hyper3D Rodin MCP — OPTIONAL alternative to Meshy

Official docs: https://hyper3d.ai/features/mcp

```bash
claude mcp add --transport http hyper3d-rodin --scope user https://api.hyper3d.com/api/mcp
```

Authorize in `/mcp`; confirm billing workspace, then ask user before spending credits.

## Meshy MCP — OPTIONAL primary generated asset candidate

Official docs: https://www.meshy.ai/mcp ; repository: https://github.com/meshy-dev/meshy-mcp-server

Ask Claude Code: `Install the Meshy MCP server following the official README; store MESHY_API_KEY locally in secure configuration, never in this chat/repository; verify by checking my credit balance.` Requires plan/API access; do not use paid operations without explicit user approval. Avoid embedding API secrets in command history.

## Claude Code subagents

Official overview: https://claude.com/blog/subagents-in-claude-code

This package already includes `.claude/agents/*.md`; Claude can load project-specific agents or create/edit them using `/agents`. **A Water FX Specialist is a custom project agent, not an official water plugin.**

## Audit proof to report

```
Tool              Installed/connected?        Tested capability        Cost/auth blocker?
Blender MCP       ...                         ...                      ...
Playwright MCP    ...                         ...                      ...
Meshy MCP         ...                         ...                      ...
Hyper3D Rodin     ...                         ...                      ...
World Labs Atlas  ...                         ...                      ...
GitHub            ...                         ...                      ...
```

No install, payment or repository setup has been executed by this ZIP package.
