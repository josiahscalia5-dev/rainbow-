# SpAItial Echo-2 test — Screen 05 (round 32, 2026-11-21, branch `claude/screen-05-3d-geometry-9yu7pu`)
User: "LET'S TEST SpAItial ECHO-2 FOR SCREEN 05 … free credits … Do not spend cash or purchase credits." The plugin cannot be installed in this
cloud session (`/plugin` unavailable); the SpAItial Developer API is called directly, key saved by the user through the secure credential form
(host `api.spaitial.ai`, Authorization: Bearer; never in git or chat). Free plan: 800 credits/month; Echo-2 Standard = 160 credits; a too-low
balance is refused (402), nothing is bought automatically.

| UTC | Call | Result | Credits |
|---|---|---|---|
| 10:46 | `POST /v1/files` input_05_clean.png (approved 05, Benny / coins / HUD removed) | 201 `file_5832791cf8be44fd82c48218c00eea78` | free |
| 10:46 | `POST /v1/worlds` model `echo-2` | request `req_40e267ab06ec494ba4ef9a60dd6da114` PENDING | 160 (free monthly credits) |
| 10:55 | Echo-2 COMPLETED: world `a4234bb6-6c3d-4661-b564-8d015cf811d0` "Neon River Tunnel Odyssey" (private), splat `echo2.spz` 2.2 M splats (SPZ v3) | 200 | 160 spent (free plan) |
| 11:0x | local only: `echo2_front.spz` = the 1.38 M splats in front of / just behind the start camera (for rendering here) | — | free |
