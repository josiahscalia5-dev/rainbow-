# Round-26 lead tool trial (Three.js DevTools + Spector.js) — recovered 2026-11-20 ~15:25 UTC (round 27)

The r26 lead ran this trial from `/home/user/scratch/lead/trial07/` (outside the repo), so its files and outputs were lost with that
container. The two scripts were recovered verbatim from the saved conversation
(`backups/claude-sessions/57d35962-86cf-5cfa-ab0b-2faf54b8a6e6/transcript.sanitized.jsonl`, Write calls 13:27:58 and 13:40:00 UTC):
`inspect.mjs` (DevTools) and `probe2.mjs` (DevTools raycast + Spector capture). Paths inside them still point at the old scratch
folder; the trial worktree itself is restored at `/home/user/wt/trial07` (LOCAL `lead/trial07-c28` = `8accdad` + snapshot
`backups/wip/lead__trial07-c27/`, byte-identical).

## What it is (accurate status)
| Tool | How it was used | Available as MCP tools in Claude? |
|---|---|---|
| `threejs-devtools-mcp` 0.5.0 (DmitriyGolub, commit 8151443) | **in-page library**: its Playwright helper `attachDevtools(page)` injected the bridge into OUR Playwright page; the tool functions were called with `page.evaluate` | NO — never registered as an MCP server |
| `spectorjs` 0.9.33 (npm) | **in-page library**: `spector.bundle.js` injected into our Playwright page, capture code adapted from Spector.js `mcp/src/spector-bridge.ts` | NO |
| Runpod plugin / MCP | READMEs read only; no proposal written, nothing provisioned, no cost incurred | NO |

Install locations (`/home/user/tools-threejs-devtools`, `/home/user/tools-spector`) were outside the repo → reinstall with
`npm install` into those folders (free, not into the game's dependencies).

## Results that were established (Screen 07 middle, `s=315`, 864×1536 capture)
* Renderer = **SwiftShader** (CPU): `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)`, maxAniso 16.
  This container has **no GPU** (`nvidia-smi` missing, no `/dev/dri`) — re-checked 2026-11-20 15:25 UTC.
* Timings (s, cumulative): vite 0.35 · browser 0.62 · page loaded 3.8 · game ready 4.5 · DevTools found scene 11.6 · sim to middle 12.4 ·
  **first frame 17.2 (≈4.9 s/frame)** · second frame 21.4 (≈4.2 s) · screenshot 26.8. Whole job took 10.5 min wall-clock, of which
  **607 s was waiting for a render slot** (both slots busy with the four workers' renders; load average 7–8 on 4 cores).
  → Capture time is dominated by machine contention + CPU rendering, not by the game.
* Scene: 157 draw calls, 373,735 triangles, 600 points; 48 textures (all unnamed), wrap/filters as coded (anisotropy 8 on 07 tiles).
* **Raycast failed**: `THREE.Raycaster not available` — the game does not expose `window.THREE`. Fix for a debug build only: expose the
  constructors (e.g. `window.THREE = THREE` behind a `?devtools=1` URL switch) before `attachDevtools`.
* Spector capture (`probe2`) finished at 13:58 (18 min incl. slot wait) but the lead hit its usage limit before reading it; output lost.

## Next (if useful)
1. Name the Screen 07 textures/meshes (or expose THREE under `?devtools=1`) so DevTools output identifies river / wall / foam.
2. Re-run probe2 for one Spector capture of the 07→08 join (the user's "speckled band") — that is the defect it can clarify.
3. A GPU worker (Runpod) only after showing the user the configuration and current price; nothing is authorized yet.
