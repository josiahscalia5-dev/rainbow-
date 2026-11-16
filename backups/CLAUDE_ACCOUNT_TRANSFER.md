# Rainbow — Claude account transfer guide (newest: session 013VHsJB, branch `claude/rainbow-05-water-projection`, 2026-11-16 ~16:00 UTC)

Rainbow is an EXISTING, playable 11-screen 3D Android game. Never restart it.

## ▶ NEWEST — URGENT BACKUP during the Screen 05 water-PROJECTION experiment (2026-11-16 ~15:50–16:00 UTC) — READ THIS FIRST
Rainbow is an EXISTING game. Do not start a new one. This section wins over everything below.

### Branches (all on GitHub, nothing force-pushed)
| Branch | What it is | Rule |
|---|---|---|
| **`claude/rainbow-05-water-projection`** | NEWEST work: everything below + the projection experiment in progress. Recover from this one | session branch of the experiment; a new session gets its own branch and the SessionStart hook merges this one into it |
| `ccr-451ea8c7-3nqlis` (`97dda28`) | the user's current WORKING version: default = T2, candidates W12 `?silk05=1&puff05=1&glow05=1&flowcam05=1`, W11, W10, W2, G1b behind URL switches; APKs in `builds/` | PROTECTED, never pushed to |
| `codex/screen05-water-hfb8p0-20261116` (`4abf548`) | Codex's separate opt-in water experiment (`src/vfx/liquid05.ts`, `foam05Options.ts`, `scripts/liquid05-*`, `qa/codex-water/`), based on `088dd3f` | PROTECTED. **Never merge automatically** (user) — compare / cherry-pick only when the user asks |
| `codex/screen05-water-experiment-20261116` (`d493cc3`) | points at one of this session's autosave commits, no extra work | protected |
| all earlier `ccr-*` / `claude/*` | history | protected, all contained in the newest branch |

### The current objective (user, 2026-11-16 ~15:40) — do not change it
"STOP recreating my approved water with new procedural patterns, random shader adjustments and additional bloom …
reproduce my original approved water's DESIGN FIRST, then make it move." Texture-projection feasibility test first; then a
real textured, continuous 3D river (not an image pasted over the screen); then the SAME design animated, flowing down the
S-curves toward the camera; full-size APPROVED vs NEW from the same camera and scale; a short clip proving the flow
direction; separate reversible branch; no 100 % claims without evidence.
* Source artwork (supplied by the user in chat 15:42 UTC, was NOT in the repo before): `references/water/05_water_isolated_original.png`
  (941 × 1672 RGBA; in `scripts/reference.sha256`, 13 files now). Target: `references/05_flow_into_the_current.png`.
* **Specialist 1** = `washer-environment-modeler` as Blender texture-projection / UV-mapping artist — RUNNING at the time
  of this backup (launched 15:47). Progress then: live camera + river mesh exported (`qa/pilot05/proj/probe/`), probe
  script `scripts/proj05-probe.mjs`, read-only QA hook `qa3d()` in `src/game/Game.ts`; no footprint numbers, no baked
  texture, no `?proj05` switch yet. Later progress: look at `qa/pilot05/proj/` (NOTES.md when it exists) and `git log`.
  **A running specialist does not survive a session end: if you are a new session, it is INTERRUPTED — relaunch it** with
  `qa/pilot05/proj/BRIEF_SPECIALIST1_VERBATIM.md` (exact prompt) + "continue from the files already in qa/pilot05/proj/".
* **Specialist 2** = `water-fx-specialist` — QUEUED; launch only after the user has seen Specialist 1's static match:
  `qa/pilot05/proj/BRIEF_SPECIALIST2.md` (the user's exact words + ready launch prompt).
* Machine-readable: `backups/AGENTS_STATUS.json` → `running_now`, `assignments_now`.

### Verified at this backup (15:51–16:00 UTC)
| Check | Result |
|---|---|
| Push | `claude/rainbow-05-water-projection`: remote SHA == local HEAD after every save (15:51 `f01bad3`, 15:55 `4de60b0`, then the final one reported to the user in chat) |
| Other branches | all 15 `ccr-*` / `claude/*` remote branches are ancestors of the newest branch; the one branch NOT contained is Codex's `codex/screen05-water-hfb8p0-20261116` (kept separate on purpose) |
| Git LFS | 26 / 26 real files locally, `git lfs fsck` OK, 26 / 26 objects (199 MB, 17 Marble / World Labs) confirmed on GitHub LFS |
| Marble / World Labs | both worlds complete (draft `5fd3d7a7-…`, full `c0c9dc57-…`): 49 files checked, 71 tracked under `qa/worldlabs/`; API key works on the `rainbow-` environment (free read: 5,190 credits); no credits spent, no new world |
| References | 13 / 13 byte-identical (12 approved + the isolated water artwork) |
| Specialists | 10 / 10 definitions present, SHA-256 unchanged |
| Autosave | daemon running, every 5 min, lock-protected, remote verified; `autosave.config.json` → `branch` = the projection branch; 16 protected branches |

### What does NOT travel through GitHub (re-do on the next account)
Claude login · GitHub connection + Claude GitHub App on the private repo · the Marble World API key (secure form
`request_credential`, host `api.worldlabs.ai`, header `WLT-Api-Key`, only when the free check says 401 / 403) · World Labs
Atlas connector (not installed on the current account; optional) · account-level plugins (enable `playwright`) ·
installed tools (Blender, Android SDK, npm packages — the bootstrap reinstalls them in ≈ 1 min) · running processes
(autosave daemon: restarted by the SessionStart hook; specialists: relaunch from the briefs). Backups cannot run while
the cloud environment is closed.

## Earlier — account switch recovery + Screen 05 water wave 12 (session `013VHsJB`, 2026-11-16 13:42–15:00 UTC), branch `ccr-451ea8c7-3nqlis` — READ THIS FIRST
The previous account (session `915f17cf`, branch `claude/rainbow-3d-account-recovery-hfb8p0`) ran out of credits at 13:32
UTC, right after its W11 water work and before its emergency-backup request could run. Nothing was lost: its 13:32 Stop
hook save and 13:37 daemon save (`088dd3f`) are on GitHub and its working tree was clean.

### Recovery on the new account (verified)
| Check | Result |
|---|---|
| SessionStart hook | merged `ccr-251ed97c-ty2xvp` (13:42, `494848d`), 14/14 remote branches contained, LFS 24/24 real files, all on GitHub LFS (184 MB, 17 Marble) |
| Bootstrap | BOOTSTRAP OK with one warning: Marble API key HTTP 401 on this account's personal environment `rainbow-` |
| Marble key | user re-entered it through `request_credential` (host `api.worldlabs.ai`, header `WLT-Api-Key`); free read OK: 5,190 credits, both worlds HTTP 200. No credits spent |
| Atlas connector | NOT installed on this Claude account (ListConnectors: none) — add it in claude.ai only for an Atlas task |
| Environment setup script | the user DECLINED adding `scripts/cloud-env-setup.sh` as the `rainbow-` environment's setup script — do not propose it again; the SessionStart hook installs Blender / Android SDK / npm in every session anyway (≈1 min) |
| Protected checkpoint | `claude/rainbow-3d-account-recovery-hfb8p0` (`088dd3f`) added to `protected_branches`; `autosave.config.json` → `branch` = `ccr-451ea8c7-3nqlis` |
| Autosave | daemon every 5 min, remote == local verified repeatedly |
| Tools | Node 22.23.4 / npm 10.9.9, Playwright Chromium WebGL2 (SwiftShader), Blender 5.3.0 (bpy OK), Android SDK 34 + build-tools 34.0.0 + Java 21, ffmpeg, ImageMagick, Python QA libs; plugins incl. playwright, worldlabs, superpowers; MCP: playwright + github connected, context7 / design MCPs fail (proxy 403, not used by Rainbow) |
| Specialists | 10/10 definitions, SHA-256 unchanged, none running (none needed relaunching) |

### Work done (all behind URL switches; default T2 and BEFORE pixel-identical)
* Wave 11 write-up that the previous account could not write: `qa/pilot05/wave11/NOTES.md`.
* **Wave 12** — `qa/pilot05/wave12/NOTES.md`: `?silk05=1` (smooth long streaks along the current, deep electric cyan),
  `?puff05=1` (bubbly foam banks), `?glow05=1` (Screen-05-only highlight bloom, threshold 2.6), `?flowcam05=1` (water
  streams toward the camera), `?tone05=` (tone-mapping test, not kept). NEW = `?silk05=1&puff05=1&glow05=1&flowcam05=1`.
  Gameplay 8/8, continuity OK, +3–5 % relative frame cost. Full-size pictures `qa/pilot05/wave12/compare/`.
* New QA tool `tools/qa/water05_grain.py`; build-time switch `VITE_RAINBOW_Q05` for experiment APKs.
* Android: see `qa/pilot05/wave12/android/NOTES.md` (experiment + default APK in `builds/`); no device → device fps unverified.

### Exact next tasks
1. The user's verdict on W12 (and on W2 `?wall05=1`, G1b `?gold05=1`, still waiting).
2. Then, one factor at a time (W12 "Left undone"): vivid magenta ribbons beside Benny + bigger near flares; splash
   beads / froth collar (foam-bubbles-particles); far-river saturation under the golden glow; polished gold rings,
   purple metal walls, premium lighting. Then screens 03, 04, 06, 07, 08, 09.
3. Flow videos: still no `intro.mp4` / `ending.mp4` in `public/video/` — ask the user.

## Earlier — permanent recovery + backup system (session `01Kbt6BT`, 2026-11-16 10:40–11:20 UTC), branch `ccr-251ed97c-ty2xvp` — READ THIS FIRST
This section wins over everything below it (history). Prompt for a new account: `backups/START_NEW_CLAUDE_ACCOUNT.md`.

### One command — recovery is automatic now
| When | What runs |
|---|---|
| Every session start (automatic) | SessionStart hook → `scripts/autosave-hook.sh` → **`scripts/claude-bootstrap.sh --hook`**: fetch all branches (unshallow), merge every newer `ccr-*`/`claude/*` branch, `git lfs pull`, re-arm the five-minute autosave (≈ 9 s), then the full bootstrap in the background. Its summary appears in Claude's context |
| By hand, any time | `bash scripts/claude-bootstrap.sh` (`--check` report only · `--full` + gameplay test, Screen 05 BEFORE pixel check, fresh LFS download · `--status` last report) |
| From an old branch / brand-new account | `git fetch origin ccr-251ed97c-ty2xvp && git show FETCH_HEAD:scripts/claude-bootstrap.sh > /tmp/b.sh && bash /tmp/b.sh` |
| Old prompts | `bash scripts/resume-newest-work.sh --tools` → runs the bootstrap (also from the old default branch: it takes the bootstrap from the newest remote branch) |
| Cloud environment setup script | `scripts/cloud-env-setup.sh` → `claude-bootstrap.sh --env-setup` (tools only, never git) |
Result: `backups/BOOTSTRAP_REPORT.md` (tracked, committed by the autosave) + `backups/.live/BOOTSTRAP_REPORT.json`.

### What the bootstrap checks / restores (each step checks first; nothing working is reinstalled)
1. Repository + branch (refuses protected branches) · newest work merged (normal merges; a conflicting merge is
   **aborted** and reported, never left half-done; uncommitted edits are autosaved before any merge) · if the merge
   brought a newer bootstrap it continues with that one.
2. Backup gap: previous save on GitHub, whether the previous session made an end-of-session backup, gaps > 10 min in
   the autosave log (honest report — backups cannot run while an environment is closed).
3. Git LFS: 24/24 real files + `git lfs fsck`; every object confirmed on GitHub through the LFS batch API
   (`--full`: downloaded fresh, SHA-256 compared). Approved references 12/12 (`scripts/reference.sha256`). 11 screens.
4. Ten specialists (`backups/AGENTS_STATUS.json`: present + SHA-256 + state + next assignment). Both Marble worlds:
   49 files checked against `backups/MANIFEST.json`, World Labs key (free credit read), worldlabs plugin.
5. Tools: Node ≥ 20, `npm ci` only when `package*.json` changed (hash in `node_modules/.rainbow-bootstrap.sha256`),
   Python numpy/Pillow (+ cv2/scipy), Playwright + Chromium WebGL2 smoke test (never `playwright install`),
   Blender 5.3.0 + headless bpy test, Android SDK 34 + build-tools 34.0.0 + Java 17+ + `android/local.properties`
   (Blender and SDK download in parallel), ffmpeg / ImageMagick, hooks + plugins + Playwright MCP.
6. Tests: `tsc`, continuity (`--full`: browser gameplay test + Screen 05 capture vs BEFORE). 7. Autosave: scheduler
   re-armed, one verified backup, `autosave-status.py`.
Versions, install commands, hosts, plugins, MCP servers, credentials (names only), Marble IDs: **`backups/TOOL_MANIFEST.json`**.

### Verified in this session (2026-11-16, container `Default` environment, unrestricted network)
| Test | Result |
|---|---|
| Save before any change | 10:45 manual autosave `d72ed52`, remote == local |
| First bootstrap run (fresh container: no Blender, no SDK, empty `node_modules`) | BOOTSTRAP OK in ≈ 60 s: installed Blender 5.3.0, Android SDK 34, npm (99 packages), opencv + scipy, worldlabs plugin |
| Second run | 24.5 s, every install skipped ("present", "npm ci skipped") |
| Changed npm fingerprint | `npm ci` ran again, new hashes verify |
| SessionStart hook, `source=startup` | 8.8 s synchronous summary, background bootstrap finished OK; `source=resume` ≈ 1 s (autosave re-armed only) |
| **New-account simulation**: fresh GitHub clone of the OLD default branch `ccr-6f431adf-7h0m8y` (LFS skipped like a new container) + the one-liner / the legacy `resume-newest-work.sh --tools` | merged all 11 newer branches, 24/24 LFS from GitHub, npm ci, tests OK → BOOTSTRAP OK (only warning: the deliberate test-branch name). Found + fixed one bug (gap check ran before the merge) |
| `--full` | 24/24 LFS objects **downloaded fresh from GitHub, SHA-256 match** (17 Marble/World Labs); gameplay test pass (plunge 61.41, errors []); Screen 05 capture **pixel-identical** to the BEFORE baseline (max diff 0) |
| Environment setup script, run from the parent folder as root | OK, 3.7 s when everything is present |
| World Labs (free reads only) | API key works on this account's Default environment: **5,190 credits** (unchanged); both worlds HTTP 200; Atlas connector `list_projects` OK ("My project"); worldlabs plugin installed. **No credits spent** |
| shellcheck (warnings), `py_compile` | clean |

### Things found and fixed
* Autosave 10:40:49 error = the first daemon run raced the session-start `git lfs pull` (index lock). Now the
  bootstrap holds the autosave lock during merges / LFS, and `git` retries once on `index.lock`; the log now shows
  git's error text first.
* The previous session (`012NR93N`) ended WITHOUT an end-of-session backup (last save 10:38 automatic, `98ffd8e`;
  this session started 10:40). Autosave log gaps > 10 min in the last 72 h: 7, longest 03:22 → 09:28 UTC (6.1 h,
  environment idle/closed). Nothing can be saved while an environment is closed.
* The commit trailer's `Claude-Session:` line now follows the running session automatically.
* `README_FIRST.md` / `START_HERE_PASTE_TO_CLAUDE.md` (original kit, "brand-new project") got a do-not-paste banner.

### Exact project state (unchanged game code)
* `src/` = the user's accepted BEFORE baseline for Screen 05 (commit `aa35c8a`), verified pixel-identical again.
  T1 (`?ringa=20`, front ring closer) still waits for the user's yes/no — see the 012NR93N section below and
  `qa/pilot05/COORDINATION_WAVE9B.md`. Rejected forever: oval tunnel, enlarged "big tunnel".
* No specialist running; unfinished wave-9 work as patches in `qa/pilot05/wave9b/not_merged/`.
* No Google Flow video in the repo yet (`public/video/` placeholder) — ask the user for `intro.mp4` / `ending.mp4`.

### Cloud environments on the current account
* **`rainbow-`** (personal, created ~11:14 UTC with the user's approval): setup script = `scripts/cloud-env-setup.sh`,
  limited network = package managers + MCP servers + the 11 hosts in `TOOL_MANIFEST.json` → `network_hosts`,
  repository linked. Pick it for the next session to start with Blender / SDK / npm already installed. It has no
  Marble key yet (only needed for new API calls: `request_credential`).
* **`Default`** (unrestricted, no setup script) holds the Marble key; this session ran on it. The repo's SessionStart
  hook makes either environment work — the setup script only saves ≈ 1 minute of background installs.

### What cannot travel through GitHub (re-connect on a new Claude account)
Claude login · GitHub connection + Claude GitHub App on the repo · World Labs Atlas connector sign-in · the Marble
World API key (network secret on the environment; secure form `request_credential`, host `api.worldlabs.ai`, header
`WLT-Api-Key`, only if new API calls are needed) · cloud-environment settings (setup script = `scripts/cloud-env-setup.sh`)
· account-level plugins (enable `playwright`) · running processes (the hook restarts the autosave; specialists are
relaunched from their notes).

## Earlier: session `012NR93N` (2026-11-16 03:10–10:35 UTC), branch `ccr-44f84024-ii5iih`
**Start the next account from branch `ccr-44f84024-ii5iih`** (prompt: `backups/START_NEW_CLAUDE_ACCOUNT.md`). It contains
every other `ccr-*` / `claude/*` branch (all 11 checked with `git merge-base --is-ancestor`, 10:29 UTC). Draft PR #5
("DO NOT MERGE") points at it. Where this section and older sections (§5, §6, §12, "wave 9") disagree, this one wins.

### Verified at the urgent full save (2026-11-16 10:29–10:35 UTC)
| Check | Result |
|---|---|
| Push | `python3 scripts/rainbow-autosave.py` → remote SHA == local HEAD on `ccr-44f84024-ii5iih` (0022842 at 10:29; the final SHA is reported to the user in chat — a file cannot contain its own commit) |
| Other branches | all 11 remote `ccr-*` / `claude/*` tips are ancestors of this branch — nothing newer anywhere |
| Untracked / ignored | working tree clean after the save; not in git by design: `node_modules` (npm ci), `backups/.live/` + `.autosave.lock` (scratch), `scripts/__pycache__` |
| **Git LFS recoverable from GitHub** | 24 / 24 binaries (175 MB) downloaded fresh from GitHub LFS in an empty clone, SHA-256 == pointer oid == local copy; local `git lfs fsck` OK, 0 pointer stubs. NB this container's default LFS filter is `--skip`: after a plain clone the binaries are 130-byte pointer files until `git lfs pull` (the resume script runs it) |
| Marble / World Labs files | 71 / 71 files under `qa/worldlabs/` tracked (17 binaries in LFS: both worlds' splats `.spz`, `splats_500k.ply`, `collider.glb`, `import/*.blend` + underlay GLBs; panoramas, thumbnails, wall textures, measurements, world JSON, ledger and prompt as normal git files) — table in §7 |
| Approved references | `sha256sum -c scripts/reference.sha256` → 12 / 12 OK (incl. `references/05_flow_into_the_current.png`) |
| Specialists | 10 / 10 definitions in `.claude/agents/`, SHA-256 unchanged (§3) |
| Secrets | scan of all 494 tracked text files (transcript backups included) for GitHub / API / AWS / Slack / Google keys, private-key blocks, JWTs, `WLT-Api-Key` or Bearer values, key/password assignments and e-mail addresses → 0 hits |
| Game | `tsc` OK, `npm run test:continuity` ok, `node scripts/gameplay-test.mjs` pass 8 / 8, 07→08 drop 61.41, errors [] (10:26 UTC, on the restored BEFORE code) |
| Autosave | daemon running, commits every ≈5 min (10:07, 10:12, 10:17, 10:23, 10:27 …); `autosave.config.json` → `branch` = this branch, `claude/rainbow-3d-account-recovery-xex5hc` added to `protected_branches` (10 protected) |

### Exact project state
* **Working game = the user's accepted BEFORE baseline for Screen 05** (`src/` = commit `aa35c8a`; a fresh
  `scripts/capture.mjs 05` is pixel-identical to `qa/pilot05/wave9/baseline/05.png`), plus one switchable test:
  **T1** (`?ringa=20`: only the front ring moved closer; default build unchanged). T1 was shown to the user and is
  **waiting for the user's yes/no**. Evidence `qa/pilot05/wave9b/T1/`, measurements `qa/pilot05/wave9b/rings/`,
  tool `tools/qa/ring_fit05.py`, full brief + next tests **`qa/pilot05/COORDINATION_WAVE9B.md`**.
* **Rejected by the user — never bring back:** the oval tunnel (wave 9, K 1.7) and the enlarged "big tunnel test 1".
  The approved tunnel is round; the user wants controlled tests, one geometric factor at a time, always shown
  approved | BEFORE | NEW, kept only when clearly closer.
* **Unfinished specialist work is saved but NOT in the game:** `qa/pilot05/wave9b/not_merged/` (README + one patch
  per specialist: foam it06 finished; path-camera far coin trail it01; water it02 worse than baseline; environment
  oval rejected). Notes: `qa/pilot05/wave9/<name>/NOTES.md`. Same code in history: commit `f6de5c7`.
* **User priorities (2026-11-16):** Google Flow videos are the opening and ending — do not rebuild 01 / 02 / 11 as
  detailed 3D; specialists work on playable screens 03–09, Screen 05 first, then 03, 04, 06, 07, 08, 09; separate
  full-size comparisons against the approved gameplay screens. **No Flow video file is in the repo yet**
  (`public/video/` = placeholder only): ask the user to upload `intro.mp4` / `ending.mp4` (`docs/FLOW_VIDEO.md`).
* All 11 screens, gameplay mechanics, Android project (`android/`, `builds/rainbow-debug.apk` from 2026-11-15, before
  the Screen 05 waves), characters (`assets/models/*.glb`), shaders and Blender files are unchanged from the previous
  hand-over except Screen 05 as described.

### Background services / agents at hand-over
* Running: only the five-minute autosave daemon (`scripts/autosave-daemon.sh`, re-armed by the SessionStart hook in
  `.claude/settings.json`). It stops when the cloud session closes; the next session re-arms it automatically.
* No specialist agent, dev server or test was running. Nothing else has to be restarted.

### Tools on this account (tested in this session)
| Tool | State | Next account |
|---|---|---|
| Cloud environment | personal environment `rainbow-`: limited network + package managers + MCP servers; allowed hosts `download.blender.org`, `dl.google.com`, `api.atlas.worldlabs.ai`, `lfs.github.com`; setup script = an older copy of `scripts/cloud-env-setup.sh` | create the same environment (§4); paste the current `scripts/cloud-env-setup.sh` |
| GitHub | git proxy pushes verified; GitHub MCP `list_pull_requests` / `create_pull_request` OK (draft PR #5) | connect GitHub + install the Claude GitHub App on the repo |
| Git LFS 3.4.1 | 24 / 24 real files; fresh download from GitHub verified | `git lfs pull` (resume script) |
| Blender 5.3.0 (`/usr/local/bin/blender`), Android SDK 34 + build-tools 34.0.0 (`/opt/android-sdk`) | installed by the environment setup script | `resume-newest-work.sh --tools` |
| Playwright plugin MCP + preinstalled Chromium | connected; all captures and the gameplay test ran | re-enable the plugin if missing |
| World Labs Atlas connector | connected (tools listed); not called, no credits used | re-add the connector in claude.ai settings and sign in |
| worldlabs@worldlabs plugin (skills) | installed | `bash scripts/setup-worldlabs-plugin.sh` |
| Marble World API key | **not saved on this account's environment** (no network secret, `api.worldlabs.ai` not in its allowed hosts) — not needed: every generated asset is already in Git LFS | only if the API is needed again: `request_credential` (host `api.worldlabs.ai`, header `WLT-Api-Key`) |
| context7 plugin | failed to connect (`ERR_PROXY_TUNNEL`); not used by Rainbow | ignore |
Never transfers through GitHub: Claude account logins, connector sign-ins, environment secrets, installed tools
(`node_modules`, Blender, Android SDK — all reinstalled by the scripts).

### Exact next tasks
1. `bash scripts/resume-newest-work.sh --tools`, autosave check, short recovery report to the user.
2. Screen 05: get the user's answer on T1; then T2 (height of the near tunnel axis around the front ring) and T3
   (lateral offset ≈ −0.6 u) as single-factor tests; then colour / gloss of rings, lids and walls, vanishing-point
   glow, water depth and flares, foam (`wave9_foam_it06.patch`), far coin trail (`wave9_pathcamera_…patch`) — each
   its own test against the accepted baseline.
3. Flow videos: when the user uploads them, copy to `public/video/intro.mp4` / `ending.mp4`, run
   `npm run test:cinematic`, check both hand-overs.
4. After Screen 05: reference-match-director makes a ranked difference list per screen, then one specialist per
   screen for 03, 04, 06, 07, 08, 09. android-build-performance rebuilds the APK at the end.

Everything below was checked in the earlier sessions named, unless marked "last verified on account N".

## Earlier: recovery session `01Kbt6BV` (2026-11-16 from ~02:12 UTC) — superseded by the section above
**Newest work branch: `claude/rainbow-3d-account-recovery-xex5hc`** (started from aa35c8a = tip of `ccr-937c7fbb-htsrgt`,
which is now protected in `autosave.config.json`). Verified 02:12–02:35 UTC:
| Check | Result |
|---|---|
| `scripts/resume-newest-work.sh` | RESUME CHECK OK — all 10 `ccr-*`/`claude/*` branches contained (incl. `ccr-4f6c3e0e-5kxgr0` 0fe0b0c, `ccr-937c7fbb-htsrgt` aa35c8a); LFS 24 tracked / 0 pointer stubs, fsck OK; refs 12/12; 10 agents; tsc OK; continuity ok (drop 61.19) |
| Gameplay test on the recovered (wave-8 mid-iteration) code | **pass** 8/8, plunge 61.41, errors [] |
| Tools | Blender 5.3.0, Android SDK 34 + build-tools 34.0.0, worldlabs plugin installed via `scripts/setup-*.sh`; Atlas connector `list_projects` OK |
| World Labs | key saved by the user via the secure form on this account's **Default** environment (host `api.worldlabs.ai`, header `WLT-Api-Key`); free reads: credits **5,190** (unchanged), both pilot worlds HTTP 200. No credits spent |
| Marble files | all present; `full05.blend` + `draft05.blend` open in Blender 5.3 |
| Autosave | daemon follows this branch; config `branch` + `commit_trailer` updated |
Wave 8 had stopped mid-iteration (credits ran out). Wave 9 (all four Screen 05 specialists continuing their own wave-8
work) brief: `qa/pilot05/COORDINATION_WAVE9.md`; status: `backups/AGENTS_STATUS.md` top table.
Recovered 05 vs approved (`qa/pilot05/wave9/recovered/`): mad 50.6, hue_corr 0.875, edge_corr 0.195.
The previous transfer branch `ccr-937c7fbb-htsrgt` received one more autosave (f6e4071, 02:13: final wave-8 notes, no
source change) after this session started; it was merged here (7b70f98). New finding in it: approved rings are OVALS
(aspect ≈1.7–1.8, ring #1 half-axes ≈490×270 px), live rings are circles — forwarded to environment + path-camera.

Full save check (02:45 UTC, user request "save everything"): every remote `ccr-*`/`claude/*` branch contained; secret
scan of all 486 tracked/pending text files → 0 hits; LFS 24/24 real locally + 24/24 downloadable from GitHub (LFS batch
API); not in git by design: node_modules (npm ci), installed Blender/Android SDK (setup scripts), `backups/.live/`
scratch, the World Labs key (network secret on the Claude environment). Draft PR #4 (DO NOT MERGE) points at this branch.
**Next account: start from `claude/rainbow-3d-account-recovery-xex5hc`** (see `backups/START_NEW_CLAUDE_ACCOUNT.md`).

## ▶ 0. Earlier verified backup (transfer session `94cf04e3`, branch `ccr-937c7fbb-htsrgt`) — read first
**Two Claude sessions were saving at the same time** at hand-off: account 8 on `ccr-4f6c3e0e-5kxgr0` (with the
washer-environment-modeler still running) and the transfer session on `ccr-937c7fbb-htsrgt`. The transfer branch
merged everything account 8 had pushed up to `8d7464b` (01:19 UTC). If account 8 kept saving after that, its
newer commits are only on `ccr-4f6c3e0e-5kxgr0`, so **always run `scripts/resume-newest-work.sh`** (§2): it merges
every remote `ccr-*`/`claude/*` branch your session does not yet contain, restores LFS and runs the checks.

Verified in the transfer session (2026-11-16 01:17–01:35 UTC):
| Check | Result |
|---|---|
| Branch containment (after `git fetch --unshallow`) | `ccr-937c7fbb-htsrgt` contains all 9 earlier branches: `ccr-6f431adf-7h0m8y` 81e639e, `claude/rainbow-3d-recovery-m4v347` b83b7e0, `ccr-8b6fc834-7kd55l` 8a36270, `ccr-d4bb0ad3-8ycajb` 648f531, `ccr-e033f912-8b40f5` 3c0fe33, `claude/rainbow-3d-account-transfer-syorak` 7ae64c3, `ccr-93add0fa-q17ey6` **08fb461** (merged; its content was already here), `ccr-4f6c3e0e-5kxgr0` **8d7464b** (merged) |
| **Git LFS downloadable from GitHub** | fresh `git clone` of the branch into an empty folder + `git lfs pull` → **24/24 files downloaded, SHA-256 == pointer oid and size, identical to the working copy**; `git lfs fsck` OK. Includes all 17 Marble/World Labs binaries (table in §7) |
| References | `sha256sum -c scripts/reference.sha256` 12/12 OK |
| Agents | 10/10 `.claude/agents/*.md` present (SHA-256 list in §3) |
| Build / game | `npm ci` OK, `tsc --noEmit` OK, `npm run test:continuity` ok (all 10 stage gaps 0, 05→06 gap 0, 07→08 verticalDrop 61.19, max step tangent 6.24°), `node scripts/gameplay-test.mjs` **pass** (pause, continuous travel, no camera cut, no teleport, plunge 61.41, real coin pickups, heart loss on wall bump, victory, errors []) — re-run on the code with the environment specialist's final wave-7 edits (merged from `7cc4869`) |
| Resume script | `bash scripts/resume-newest-work.sh` → `RESUME CHECK: OK` |
| Autosave | `AUTOSAVE OK … (match)` on `ccr-937c7fbb-htsrgt`; `autosave.config.json` now targets this branch and protects `ccr-4f6c3e0e-5kxgr0` |
| World Labs credits | **none spent** in the transfer session; balance re-read 01:35 UTC = **5,190**; both pilot worlds still on the API account; the draft pano (newly listed by the API) downloaded free → `draft/pano.png` |

## 1. Repository, branch, commit
| | |
|---|---|
| Repository | `josiahscalia5-dev/rainbow-` (private, GitHub) |
| **Newest work** | **`claude/rainbow-3d-account-recovery-xex5hc`** (recovery session 01Kbt6BV, 2026-11-16; contains every branch below incl. `ccr-937c7fbb-htsrgt` f6e4071). Earlier: `ccr-937c7fbb-htsrgt` (transfer session) |
| Latest verified commit | the final commit is reported to the user in chat; the doc cannot contain its own SHA. Always use the remote tips: `git ls-remote origin refs/heads/ccr-937c7fbb-htsrgt refs/heads/ccr-4f6c3e0e-5kxgr0` |
| Contains | every earlier branch (checked after `git fetch --unshallow`): `ccr-6f431adf-7h0m8y` (original), `claude/rainbow-3d-recovery-m4v347`, `ccr-8b6fc834-7kd55l`, `ccr-d4bb0ad3-8ycajb`, `ccr-e033f912-8b40f5`, `claude/rainbow-3d-account-transfer-syorak`, `ccr-93add0fa-q17ey6` (08fb461), `ccr-4f6c3e0e-5kxgr0` (to 8d7464b) |
| Protected (autosave refuses to push) | all branches above — `backups/autosave.config.json` → `protected_branches`. The next account must add `ccr-937c7fbb-htsrgt` too |
| Default branch warning | the repo's GitHub default branch is the OLD original `ccr-6f431adf-7h0m8y` (81e639e). A session that starts there has the old game — run §2 first |

## 2. Safe new working branch on the next account
A new Claude Code cloud session gets its own `ccr-*` (or `claude/*`) branch, possibly started from the old default
branch. From the repo folder, get the resume script from the newest branch and run it (works from any start point;
it only fetches and merges — never resets, deletes or force-pushes):
```bash
git fetch origin ccr-44f84024-ii5iih
git show FETCH_HEAD:scripts/resume-newest-work.sh > /tmp/resume-newest-work.sh
bash /tmp/resume-newest-work.sh            # add --tools to also install Blender 5.3, Android SDK 34, World Labs plugin
git push -u origin "$(git branch --show-current)"
```
Expect `RESUME CHECK: OK`, `24 tracked, 0 still pointer stubs`, `10 agent definitions`, `tsc OK`, and every
`ccr-*`/`claude/*` branch listed as `ok`. If it stops with `CONFLICT`, resolve keeping both sides, `git commit`.
Then add `ccr-937c7fbb-htsrgt` to `protected_branches` and set `"branch"` + `commit_trailer` in
`backups/autosave.config.json` to the new session branch (as done for every previous account). Never force-push.

## 3. The ten specialist agents
`.claude/agents/*.md` — android-build-performance, animation-and-gameplay-engineer, benny-character-artist,
cartoon-girl-character-artist, foam-bubbles-particles, path-camera-transition-engineer, playwright-visual-qa,
reference-match-director, washer-environment-modeler, water-fx-specialist. They load automatically as project
subagents (Agent tool, `subagent_type` = file name without `.md`). Do not recreate or rename them.
Status, finished work and who must be relaunched: **`backups/AGENTS_STATUS.md` (top table)**. Relaunch brief
template: `qa/pilot05/COORDINATION_WAVE7.md` + the specialist's own `qa/pilot05/wave7/<name>/NOTES.md`.

Relaunch on the next account (state at 01:30 UTC):
| Agent | Relaunch? |
|---|---|
| washer-environment-modeler | **Wave 7 DONE** (log written 01:23 UTC): `it06` KEPT — rings with band shading + 20 spots, rose-copper lids, wall swirl removed, warm VP throat, real-3D near gold frame corners (gated to the 05 straight, no pops). Whole-frame mad 59.0 → 51.2, tunnel+VP 62.6 → 61.0, Benny+near water 63.8 → 46.7; regression 06/07/08 pixel-identical, 04 own share 0.091 %. Handoff capture `qa/pilot05/wave7/handoff/`. Relaunch for the **next wave** with its "Left undone" list in `qa/pilot05/wave7/environment/NOTES.md`: walls overshoot to violet (70–80 % vs ref 29–46 %), VP core too small/orange, lids flatter than ref, far rings at wrong virtual depths (request in `qa/pilot05/REQUESTS.md` for path-camera). It deliberately did NOT adopt the Marble 0.87 R ring spacing — the approved image shows ≈1.75 R bays |
| path-camera-transition-engineer | YES — next task (far river/VP strip, §6 item 5, + the far-ring depth request in `qa/pilot05/REQUESTS.md`); never started |
| water-fx-specialist, foam-bubbles-particles | later polish passes only (wave 7 DONE) |
| reference-match-director, playwright-visual-qa | YES, after the environment + path-camera work lands |
| benny-character-artist, cartoon-girl-character-artist, animation-and-gameplay-engineer | idle — no relaunch needed |
| android-build-performance | YES at the end — rebuild the APK (the committed `builds/rainbow-debug.apk` is from 2026-11-15 18:00, before the Screen 05 waves 4–7) |

Definition checksums (unchanged; compare with `sha256sum .claude/agents/*.md`):
`android-build-performance b0c45161…`, `animation-and-gameplay-engineer c48094c3…`, `benny-character-artist cde203af…`,
`cartoon-girl-character-artist 52058503…`, `foam-bubbles-particles f6341dcd…`, `path-camera-transition-engineer 4244cc82…`,
`playwright-visual-qa 0f14c32f…`, `reference-match-director b977e3f7…`, `washer-environment-modeler 7abdea78…`,
`water-fx-specialist b160f12f…`.

## 4. Tools — exact setup
Cloud environment (claude.ai → Claude Code → environment settings) for the new account:
* Personal environment named `rainbow-` with repository `josiahscalia5-dev/rainbow-`.
* Network: unrestricted, or "limited + package managers" plus hosts `download.blender.org`, `dl.google.com`,
  `api.atlas.worldlabs.ai`, `api.worldlabs.ai`, `cdn.marble.worldlabs.ai`, `storage.googleapis.com`.
* Setup script = the contents of `scripts/cloud-env-setup.sh` (LFS fix + `git lfs pull`, `npm ci`, Blender 5.3.0,
  Android SDK 34, World Labs plugin). Each step is non-fatal.
Manual equivalents inside a session:
```bash
cd rainbow-
git config --unset-all "lfs.https://github.com/josiahscalia5-dev/rainbow-.git/info/lfs.access"; git lfs pull && git lfs fsck
npm ci && npx tsc --noEmit
bash scripts/setup-blender.sh          # Blender 5.3.0 headless → /usr/local/bin/blender
bash scripts/setup-android-sdk.sh      # SDK platform 34 + build-tools 34.0.0 (export ANDROID_HOME=/opt/android-sdk)
bash scripts/setup-worldlabs-plugin.sh # worldlabs@worldlabs plugin (skills); its duplicate MCP copy disabled
```
Playwright/Chromium are preinstalled in Claude cloud containers (`require('playwright')`); captures:
`node scripts/capture.mjs 05 --out=<dir>`. MCP/plugin reconnection notes: `backups/MCP_SETUP.md`.

## 5. Status of the 11 screens (all real-time 3D; continuous course)
| Screen | State |
|---|---|
| 01 Inside the Washing Machine, 02 Whirlpool Tumble | real-time cinematics (girl + Benny). Optional Google Flow intro video plays silently, then hands over to live 3D (`src/ui/cinematicVideo.ts`, `docs/FLOW_VIDEO.md`); **no real Flow MP4 committed yet** |
| 03 Whirlpool Twirl, 04 Through the Five Arrows | playable; visually still clearly different from the references |
| **05 Flow Into the Current** | **active work** — camera LOCKED, S-curve refit (wave 6); wave 7 environment + water + foam DONE (see §6) |
| 06 Crest the Rinse Arch | playable; next after 05: rebuild the raised water arch to its reference; keep the 05→06 join and stage anchors |
| 07 Dive the Washer Tube → 08 Final Spin Chamber | real continuous plunge (verticalDrop 61.41, gaps 0) — must be preserved |
| 09 Ride the Final Wave, 10 Slide Into Hiding | playable; visual work pending |
| 11 Safely Home | victory cinematic, `FINAL SPIN COMPLETE`, girl lifts the towel while Benny hides |
Gameplay systems: coins, hearts (loss on wall bump), pause/resume, steering, HUD, collisions, stage transitions.

## 6. Unfinished Screen 05 work (approved image `references/05_flow_into_the_current.png` ALWAYS wins)
User's goal (unchanged): recreate the APPROVED Screen 05 as real playable 3D, ideally 90–95 % visually similar
where achievable — rich metallic purple perforated washer walls, properly sized reflective golden tunnel rings,
thick glossy cyan-and-pink winding water in continuous S-curves into the golden light, natural foam, splashes and
translucent bubbles, Benny exactly as approved, correct camera framing and premium lighting. The approved
screenshot beats the Marble world. Keep the finished gameplay systems and the locked camera; do not redo work the
specialists already finished (wave-7 water/foam DONE). Report measured differences, never invented percentages.
Wave-7 baseline `qa/pilot05/wave7/baseline/05.png`; ranked difference table in `qa/pilot05/COORDINATION_WAVE6.md`.
Wave 7 result (water, foam and environment specialists all DONE): `qa/pilot05/wave7/handoff/05_side_by_side.png`
(approved | before | now); whole-frame mad 59.0 → 51.2, hue_corr 0.809 → 0.856, edge_corr 0.117 → 0.177, near band
63.8 → 46.7, tunnel band 62.6 → 61.0 (lower mad / higher corr = closer). Gameplay test pass after the wave (account 8
and transfer session). Remaining items, from the environment "Left undone" list in `qa/pilot05/wave7/environment/NOTES.md`:
1. Walls: swirl removed, slot rows + streaks done — but too VIOLET (70–80 % vs ref 29–46 %) → pinker magenta metal /
   warmer F0; more white-pink lengthwise streaks (2.0–3.6 % vs ref 5.1 %) (environment).
2. Rings: band shading + 20 spots done; colour reads rose/salmon — make the bands more YELLOW-gold with a brighter
   highlight; ring 2 at y198 vs ref 170 and one extra far ring (virtual depths in path-camera's far block,
   `qa/pilot05/REQUESTS.md`) (environment + path-camera). Ring spacing follows the approved image (≈1.75 R bays),
   not the Marble 0.87–0.93 R.
3. Lids: rose-copper round pucks done — shading flatter than ref (V std 0.15 vs 0.22); far lids stay mid-bay (environment).
4. Near gold frame corners: DONE as real 3D (05 only); tune its gold share (32/33/43 % vs ref 43/50/45 %). VP core now
   too small/orange.
5. Far river at the VP (y 470–560) still straight 06-style stripes → keep winding S-bends + coins into the light;
   far foam rims (path-camera-transition-engineer, `class ForcedTunnel` / `// ---- 05 far tunnel` block).
6. Water polish: brighter near highlights (p95 225 → 247), ~2× glints, sweep starts (water-fx).
7. Foam polish: bluer near clumps, lower-left clump inset (foam).
8. Then reference-match-director + playwright-visual-qa: whole-frame review, side-by-side report.
Rules: 864×1536 captures, `scripts/screen_report.py`, ≤130 draw calls / ≤650k tris, 04/06/07/08 regression,
no static image/video substitutes, no invented fidelity percentages.

## 7. Marble (World Labs) — results and next steps
Full ledger, IDs and asset table: **`qa/worldlabs/05/pilot/LEDGER.md`**.
* User's website world "Vibrant Tunnel of Fortune" `f0be2178-4291-4f90-848f-6506b53cc87d`: official
  `GET /marble/v1/worlds/{id}` → **404** with the API key; `worlds:list` → 0. Not accessible to the API account;
  its 3D files would need a paid Marble app plan export (not done). A screenshot of it is in
  `qa/worldlabs/05/marble_user_world/`.
* Generated from the approved 05 image (crop `qa/worldlabs/05/geometry_ref/2_geometry_reference_05.png` +
  `qa/worldlabs/05/pilot/prompt_05.txt`): draft `5fd3d7a7-21ae-45c7-a3fe-b7ed47bdd13f` and full
  `c0c9dc57-afa3-4330-b2f0-9c6d4dddfef9`. All splat sizes, collider GLBs, PLY exports, pano, thumbnails, Blender
  imports (`import/*.blend`) and measurements are in `qa/worldlabs/05/pilot/{draft,full}/` (Git LFS).
* Measured: ring spacing ≈ 0.87–0.93 × tube radius, river ≈ 0.71–0.73 × diameter, wall rgb ≈ (178–184,62–71,160).
* Next: give the environment specialist the unrolled bay textures (`*/analysis/bay_unrolled.png`) and the
  Blender scenes as modelling/texture references; render the splats from the locked 05 camera in Blender for a
  material comparison; only then decide on the HQ mesh export (3,500 credits, needs the user's OK).
* Budget: user approved max US$5 (6,250 credits) for this pilot, no auto-recharge. Spent 1,810; API balance
  5,190 at hand-off.

Exact asset inventory (all in Git LFS unless noted; every LFS file verified downloadable from GitHub, §0):
| World | Generation | Saved files | Not available / not bought |
|---|---|---|---|
| draft `5fd3d7a7-21ae-45c7-a3fe-b7ed47bdd13f` | op `4a549a9d-3de2-424b-8324-db24a8d1b9bd`, `marble-1.0-draft`, 230 credits (pano 80 + draft 150), 00:55 UTC | `draft/collider.glb` (35,795 tris), `splats_100k.spz`, `splats_500k.spz`, `splats_full_res.spz`, `splats_500k.ply` (free export), `pano.png` (2304×1152; listed by the API only later, downloaded free 01:36), `thumbnail.{webp,png}`, `world.json`, `world_refresh_2026-11-16.json`, `operation_response.sanitized.json`, `import/draft05.blend` + `draft05_underlay.glb` + preview + `draft05_measure.json`, `analysis/` | no HQ / full-res mesh (not generated) |
| full `c0c9dc57-afa3-4330-b2f0-9c6d4dddfef9` | op `12a08430-f687-4a09-bdc7-3a469c76363d`, `marble-1.1`, 1,580 credits (pano 80 + world 1,500), 00:58 UTC | `full/collider.glb`, `splats_100k.spz`, `splats_150k.spz`, `splats_500k.spz`, `splats_full_res.spz`, `splats_500k.ply`, `pano.png` (4608×2304) + `pano_preview_2048.jpg`, `thumbnail.{webp,png}`, `world_refresh_2026-11-16.json`, `operation_response.sanitized.json` (metric_scale_factor 1.5619, ground_plane_offset 0.9745), `import/full05.blend` + underlay + preview + measure, `analysis/` | HQ mesh export (3,500 credits) not bought — needs the user's OK |
| Inputs | — | approved crop `qa/worldlabs/05/geometry_ref/2_geometry_reference_05.png`, `qa/worldlabs/05/pilot/prompt_05.txt`; upload/generate/export calls in `tools/worldlabs/marble_pilot.py`; analysis `tools/worldlabs/analyze_splats.py`, `bay_texture.py`; Blender import `tools/blender/import_world_asset.py` | the media-asset ID of the uploaded input image was not recorded (re-upload is free) |
Both worlds are private to the World API account that made them. Re-download (free, needs that account's key):
`python3 -I tools/worldlabs/marble_pilot.py world <world_id> out.json` → fresh CDN links.

## 8. World Labs authentication (no credentials here)
| Connection | State on account 8 | On the next account |
|---|---|---|
| Marble World API key | NEW key (the exposed account-7 key is retired) saved by the user via the secure credential form as a network secret on account 8's `rainbow-` environment (host `api.worldlabs.ai`, header `WLT-Api-Key`). Tested: `GET /credits` 200 | **Does not transfer.** In the new session the assistant calls `request_credential` (host `api.worldlabs.ai`, header `WLT-Api-Key`); the user pastes the same platform key (or a fresh one from platform.worldlabs.ai/api-keys) ONLY into that form. Credits stay on the World Labs platform account |
| World Labs Atlas (claude.ai connector) | connected, `list_projects` OK ("My project", credits available); nothing run | Re-add the connector in claude.ai settings and sign in again |
| worldlabs@worldlabs plugin | installed by the setup script (skills only) | reinstalled by `scripts/cloud-env-setup.sh` |
| GitHub | session git proxy; pushes verified | connect GitHub to the new Claude account + install the Claude GitHub App on the repo |
| Playwright MCP | plugin, connected | re-enable the plugin if missing; Chromium is preinstalled |
| Other plugin MCPs (Figma, Notion, Slack, Linear, Atlassian, Intercom, context7) | need sign-in; not used by Rainbow | ignore unless needed |
Nothing about Claude account logins, live MCP sessions or connector sign-ins travels through GitHub.

Transfer session `94cf04e3` (same date, a different Claude account from account 8 — its environments are
"Default", "Christmas-", "bubblegames"; no "rainbow-" environment): at 01:35 UTC the user saved a Marble World API
key through the secure credential form on that account's **Default** environment (host `api.worldlabs.ai`, header
`WLT-Api-Key`). Free reads: `GET /credits` → **5,190** (unchanged); `GET /worlds/{id}` → both pilot worlds present,
so the key belongs to the same World Labs platform account. The user had first pasted a key in chat: it was never
used in a command, is redacted in the exported transcripts (`[REDACTED-PRIVATE]`) and is in no git commit (checked on
all branches). **Advice given: delete that pasted key at platform.worldlabs.ai and use a fresh one** via the form
on the next account. Credentials never travel through GitHub — the next account must enter the key in its own form.
Atlas connector `list_projects` OK (project "My project", Personal workspace,
`credits_available: true`, nothing run). GitHub MCP + git proxy pushes OK. Plugins seen: superpowers,
parallax-threejs (playwright-mcp, chrome-devtools-mcp, threejs-devtools-mcp connected; **spector failed to
connect**), playwright, context7 (**needs sign-in**), feature-dev, code-review, frontend-design,
claude-code-setup. The worldlabs@worldlabs plugin was **not** installed in that container, and Blender / Android
SDK were not installed there either (its environment setup script did not run) — run `--tools` (§2) or
`scripts/cloud-env-setup.sh`. Hosts `download.blender.org` and `dl.google.com` answered 200.

## 9. Git LFS restore
```bash
git config --unset-all "lfs.https://github.com/josiahscalia5-dev/rainbow-.git/info/lfs.access"
git lfs pull && git lfs fsck && git lfs ls-files | awk '$2=="-"' | wc -l   # expect "Git LFS fsck OK" and 0
```
Tracked: `*.glb *.ply *.spz *.blend *.fbx *.hdr *.exr *.ktx2 *.psd *.mp4` + the kit ZIP and APK.

## 10. Five-minute autosave
* `scripts/rainbow-autosave.py` (commit + push + verify remote == local), daemon `scripts/autosave-daemon.sh`,
  re-armed by the SessionStart hook in `.claude/settings.json` → `scripts/autosave-hook.sh`.
* Check: `python3 -I scripts/autosave-status.py` (expect `AUTOSAVE OK … (match)`).
* Manual / before ending: `python3 scripts/rainbow-autosave.py --reason manual:end`, then confirm
  `git ls-remote origin refs/heads/<branch>` == `git rev-parse HEAD`.
* Backups stop when the cloud environment is closed; nothing can push then.

## 11. Last successful tests
| Test | Result | When |
|---|---|---|
| Fresh-clone LFS download from GitHub | 24/24 files, SHA-256 == oid, fsck OK | transfer session, 2026-11-16 ~01:20 |
| `node scripts/gameplay-test.mjs` | pass: all 8 checks, plunge 61.41, errors [] — re-run on the final wave-7 environment code | transfer session, 2026-11-16 ~01:28 |
| `npm run test:continuity`, `tsc`, refs 12/12 | ok / OK / OK | transfer session, ~01:20 and again via `resume-newest-work.sh` |
| `node scripts/gameplay-test.mjs` | pass: victory, heart loss on wall bump, plunge 61.41, errors [] | account 8, 2026-11-16 00:41 |
| `npm run test:continuity` | all stage gaps 0 | account 8 |
| `npx tsc --noEmit` | OK | account 8 (also by water + foam specialists) |
| `sha256sum -c scripts/reference.sha256` | 12/12 OK | account 8 |
| `git lfs fsck` | OK (all LFS files present) | account 8 |
| 05 capture | 86 draw calls, ~633k tris | account 8 |
| Android `assembleDebug` | BUILD SUCCESSFUL, APK 7.29 MB (`builds/rainbow-debug.apk`), not run on a device | last verified on account 6 |

## 12. Exact next tasks
1. Run §2 (`resume-newest-work.sh`), check §9/§10, then read `backups/AGENTS_STATUS.md` and
   `qa/pilot05/wave7/*/NOTES.md`. Give the user a short recovery report.
2. Launch path-camera-transition-engineer for the far river/VP strip, far ring positions and far foam rims
   (§6 items 2 and 5, `qa/pilot05/REQUESTS.md`).
3. Second washer-environment-modeler pass on its "Left undone" list (§6 items 1–4: pinker wall metal, yellower ring
   gold, lid shading, VP core) — can run alongside step 2 with strict file ownership; far rings belong to step 2.
4. Water + foam polish passes (§6 items 6–7), then reference-match-director + playwright-visual-qa report with
   approved vs before (`qa/pilot05/wave7/baseline/05.png`) vs after at 864×1536.
5. Marble: Blender render of the full splats from the locked 05 camera; decide on HQ mesh (ask the user).
6. Screen 06 raised water arch; then 04/07 using the same method. Rebuild + verify the Android APK.
