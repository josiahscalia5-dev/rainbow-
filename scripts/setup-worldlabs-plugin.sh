#!/usr/bin/env bash
# Official World Labs Claude Code plugin for Rainbow (idempotent; run from anywhere).
#
# One Atlas integration only:
#   * Atlas MCP tools come from the claude.ai connector "World Labs Atlas" (the user's own sign-in,
#     https://api.atlas.worldlabs.ai/mcp). Connect/disconnect it at https://claude.ai/customize/connectors.
#   * This script installs the plugin worldlabs@worldlabs for its SKILLS (atlas-blender, atlas-splats,
#     atlas-flythrough, worldlabs-cli) and disables ONLY the plugin's own copy of the same Atlas MCP
#     server ("plugin:worldlabs:worldlabs") for this project, so the tools are never duplicated.
#     Same effect as `/mcp disable plugin:worldlabs:worldlabs`; undo with `/mcp enable`.
# Credits: installing the plugin costs nothing. Atlas task tools use paid credits: user approval first.
#   bash scripts/setup-worldlabs-plugin.sh
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
C="$(command -v claude || echo /opt/node22/bin/claude)"
[ -x "$C" ] || { echo "worldlabs: claude CLI not found, skipped"; exit 0; }
"$C" plugin marketplace add worldlabsai/skills > /dev/null 2>&1
"$C" plugin install worldlabs@worldlabs > /dev/null 2>&1 || echo "worldlabs: plugin install failed"
python3 - "$ROOT" <<'PY'
import json, os, sys
path, root = os.path.expanduser("~/.claude.json"), sys.argv[1]
data = json.load(open(path)) if os.path.exists(path) else {}
off = data.setdefault("projects", {}).setdefault(root, {}).setdefault("disabledMcpServers", [])
if "plugin:worldlabs:worldlabs" not in off:
    off.append("plugin:worldlabs:worldlabs")
    tmp = path + ".rainbow-tmp"
    json.dump(data, open(tmp, "w"), indent=2)
    os.replace(tmp, path)
print("worldlabs: plugin installed; its duplicate Atlas MCP server is disabled for", root)
PY
