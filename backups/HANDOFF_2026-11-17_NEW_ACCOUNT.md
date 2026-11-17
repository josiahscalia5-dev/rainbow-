# RAINBOW — new-account handoff (refreshed 2026-11-17 ~11:50 UTC) — READ THIS FIRST

Rainbow is an EXISTING playable 3D Android game (Three.js + Vite + TypeScript, Blender 5.3.0, Playwright, Android).
Never restart it, never change engines, never rebuild Screen 05 from scratch, never modify `references/` (13 files,
`sha256sum -c scripts/reference.sha256`). Every fact below was re-checked in session 03b94f36 (2026-11-17 ~11:40–11:50 UTC).

## 0. The user's newest priority (2026-11-17, verbatim excerpt) — this decides what to work on
> "Please make sure that my approved screens that you're working on, make sure you're working on the visual part. I don't
> like hear much about the camera or the movements. I care about more the scenery and the visual part of my what I want my
> exact approved screens. At least if it's 90% or more, that'd be okay. I just want to work on the visual part of my
> approved screens, nothing else. I just want them look like I want them look my very exactly like my approved screens.
> Like I want the scenery, just the look to match my exact approved screens."

So: work on scenery / look only (walls, gold rings, river water, foam, colours, lighting, paddles and props, Benny's
look) for the playable screens 04–08, target ≥ 90 % likeness to each approved picture. Touch camera framing only when
the scenery cannot line up otherwise, and talk to the user in pictures (APPROVED | BEFORE | NEW, separate full size) and
whole-frame numbers — not about camera or movement. Gameplay must keep working (coins, steering, collisions).

## 1. Repository and branches
Repository: https://github.com/josiahscalia5-dev/rainbow-

**There are TWO lines of unique game work. They are NOT merged. The user must approve any merge or cherry-pick.**

| Line | Branch (tip) | Contains | Unique work since the split |
|---|---|---|---|
| **A** | **`ccr-9c4a8ad6-xovgsx`** (this session; newest) = `ccr-61131b9d-uj0oqb` fast-forwarded to the same final checkpoint (final SHA: last entry of `backups/BACKUP_LOG.md`; `git ls-remote origin refs/heads/ccr-61131b9d-uj0oqb`) | `ccr-61131b9d-uj0oqb`, `ccr-57af22a4-lsg7y7`, `claude/rainbow-05-water-projection`, `ccr-451ea8c7-3nqlis` and every older branch | 63 files, 3 source files (+142 lines): **Screen 07** measurement + camera work (`qa/match/07/`, `tools/match/ring_fit.py`, `scripts/match-geo.mjs`, `scripts/match-cam-fit.mjs`, `scripts/match-probe.mjs`, inactive `yaw07`/`side07` hook in `src/game/cameraRig.ts`); `?matchNN=1` framework `src/game/match.ts` + audit of 02–10 (`qa/match/audit/`); Screen 05 projection water: its OWN `?projnear05=1` (`tools/proj05/near_bake.py`, `assets/textures/water05/proj05_near*`), `?projflow05=2` flow bake, and its OWN `?match05=1` = only the projection switches (`MATCH05_KEYS` in `src/vfx/waterRibbon.ts`); bootstrap auto-merge OFF; this handoff |
| **B** | **`ccr-b0757dec-dj6l1o`** (`a8c03f06cf3cc2f3aeeff8c03af3f7d7f481c38d` at 03:36 UTC; **still being extended**: session `01VCMXob` on the old account autosaved `65f3a89` at 11:48 UTC — full-game `?match05=1` video `builds/rainbow-full-game-match05-2026-11-17.mp4|.md` + `tools/video/record_full.mjs`, `capture_dist.mjs`. Always re-check the tip with `git ls-remote origin refs/heads/ccr-b0757dec-dj6l1o`) | `claude/rainbow-account-transfer-npxahd` ⊂ `claude/rainbow-restore-env-setup-bxn85h` ⊂ `ccr-694bda6a-x58ntq` ⊂ `claude/approved-screen-implementation-g3loqu`, plus `ccr-8c4acadc-iybw0n` and `ccr-e546a360-cxmton` (all verified contained) | **813 files, 15 source files (+1506 lines): the big Screen 05 FULL REFERENCE MATCH** behind its OWN `?match05=1` (= `env05` tunnel walls/rings/paddles re-bake, `benny05` Benny + knitted hat baked from the approved picture, `hud05`, `coins05` (18 approved coins), `splash05m` wake, `bub05` approved bubbles, `projvp05`, `projgap05`, `projedge05`, plus its OWN `projnear05`). Measured whole frame (locked camera, `tools/match05/metrics.py`): 57.0 % within 20 levels → cp3 83.6 % → **86.9 % (c2, 02:50 UTC)**; walls 92 %, gold 88 %, distant 97 %, water 92 %, foam 95 %, bubbles 99.7 %, wake 77.5 %, **Benny + hat 73 %**, coins ~52 %, HUD ~74 %. Debug APK `builds/rainbow-debug-match05-2026-11-17.apk`. Notes: `qa/pilot05/full_reference_match/COORDINATION.md` (newest RESUMED section), `ORDER_USER_2026-11-17.md`, per-part `*/NOTES.md`. |

* **Split point** `aea7e77` (2026-11-16 22:13 UTC). At ~11:50 UTC A had ~38 commits B lacks; B had 141 commits A lacks (B's session was still running).
* **Latest Screen 05 visual improvements = line B.** **Latest Screen 07 camera/geometry work = line A.**
* **Dry-run merge** (`git merge-tree --write-tree --name-only HEAD origin/ccr-b0757dec-dj6l1o`, changes nothing), re-run
  2026-11-17 ~11:45: **14 conflicting files** — `CLAUDE.md`, `src/vfx/waterRibbon.ts` (the only game source file both
  changed), `assets/textures/water05/proj05_T2.png`, `proj05_WT2.png`, `proj05_near.json`, `tools/proj05/near_bake.py`,
  `qa/pilot05/proj/near/NOTES.md`, `scripts/claude-bootstrap.sh`, and 6 `backups/` status files.
* **Naming clash:** both lines define `?match05=1` with different meanings, and both built their own `?projnear05=1`.
  The user chooses which `projnear05` to keep after seeing both captures. Recommended: keep line B's `?match05=1`
  (the measured whole-screen match) as the master and give line A's projection set another name (e.g. `?match05a=1`).
* `codex/*` branches (Codex's separate experiments, NEVER merge): `codex/screen05-reference-fit-20261116` (6 commits not
  in A), `codex/screen05-approved-water-study-20261116` (3), `codex/screen05-water-hfb8p0-20261116` (1),
  `codex/screen05-water-experiment-20261116` (0). All four are in `protected_branches`.

### Safest procedure to keep BOTH sets of improvements (ONLY after the user says yes)
1. Show the user first: capture Screen 05 on both lines from the same view —
   line A `node scripts/capture.mjs 05 --q='match05=1'`, line B (in a separate worktree
   `git worktree add ../rainbow-B origin/ccr-b0757dec-dj6l1o`, `npm ci`) the same command — next to
   `references/05_flow_into_the_current.png`, as three separate full-size pictures.
2. Base on line B (it holds ~13× more game work): `git checkout -b <new branch> origin/ccr-b0757dec-dj6l1o`, then
   `git merge --no-ff origin/ccr-9c4a8ad6-xovgsx`. Resolve: non-05 files take both sides; `scripts/claude-bootstrap.sh`
   keep line A's (auto-merge off, `--skip-resume`); `CLAUDE.md` + `backups/*` keep both texts; `waterRibbon.ts`,
   `proj05_near*`, `near_bake.py`, `near/NOTES.md` = the user's `projnear05` choice; rename A's master switch as above.
3. Verify before pushing: `npx tsc --noEmit`; default `node scripts/capture.mjs 05` == `qa/pilot05/current_default_05.png`
   (0 px); protected BEFORE `?ringa=26&nearfloor05=0` == `qa/pilot05/wave9/baseline/05.png` (0 px); line B's
   `?match05=1` reproduces its c2 numbers (`python3 -I tools/match05/metrics.py`); `node scripts/gameplay-test.mjs` 8/8;
   continuity test. Push to the NEW branch only. Never force-push, never rewrite either line.

## 2. Recovery on the new account (NO automatic merges)
```
# start the cloud session on branch ccr-9c4a8ad6-xovgsx (or ccr-61131b9d-uj0oqb: same game files)
bash scripts/claude-bootstrap.sh --skip-resume        # tools, LFS, autosave, report; merges NOTHING
bash scripts/claude-bootstrap.sh --status             # -> backups/BOOTSTRAP_REPORT.md
python3 -I scripts/autosave-status.py                 # expect AUTOSAVE OK … (match)
sha256sum -c scripts/reference.sha256                 # 13 OK
ls .claude/agents/ | wc -l                            # 10
```
From a checkout whose bootstrap is older: `git fetch origin ccr-9c4a8ad6-xovgsx && git show
FETCH_HEAD:scripts/claude-bootstrap.sh > /tmp/b.sh && bash /tmp/b.sh --skip-resume`.
Both lines' bootstraps default to NO merge (`DO_RESUME=0`); the SessionStart hook only fetches and lists. `--resume`
re-enables the old `ccr-*`/`claude/*` merge and may only be used with the user's explicit OK.

## 3. Game structure (user, 2026-11-17 — do not change without asking)
VIDEOS: 01 existing opening · 02 whirlpool tumble · 03 Whirlpool Twirl · 09 final wave · 10 return to hiding ·
11 existing ending. REAL PLAYABLE 3D: 04 Five Arrows · 05 Flow Into the Current · 06 Rinse Arch · 07 Washer Tube ·
08 Final Spin Chamber. Goal ≥ 9/10 visual likeness per playable screen to its own approved picture
(`references/04_…png` … `references/08_…png`).
* No video regenerated, no paid credits spent. `public/video/` holds only `PUT_FLOW_VIDEOS_HERE.txt`: the user's
  `intro.mp4` / `ending.mp4` are NOT in the repo yet (`docs/FLOW_VIDEO.md` explains the hand-over).
* Not yet built: video manifest, reversible `?route=v2` (intro → c02 → c03 → 04…08 → c09 → c10 → ending, old
  real-time 02/03/09/10 kept as fallback).

## 4. Screen state and visual next steps (scenery first — §0)
* **05 (line B is ahead):** 86.9 % whole frame. Biggest visual gaps: Benny + knitted hat (73 %), coins (~52 %), HUD
  (~74 %), wake (77.5 %). Remaining work is in §5 (line B specialists). Never paste the approved image over the screen.
* **07 (line A):** measured approved picture — Benny box ≈ x 200–640, y 790–1200; five gold rings R1 (409,607) r456 ·
  R2 (582,529) r303 · R3 (592,534) r187 · R4 (612,551) r118 · R5 (624,560) r72, VP ≈ (615,550)
  (`qa/match/07/rings/approved.json|png`, `qa/match/07/geo_match07.json`). Isolated-Benny mask investigation DONE and
  committed: `scripts/match-cam-fit.mjs` renders Benny alone with his own materials (everything else hidden) and keeps
  only the LARGEST connected blob (trail bubbles / spray had inflated the box; `qa/match/07/cam/benny_mask_debug.png`,
  `bmask_debug.mjs`, `benny_boxes_v1.txt`); best framing IoU 0.577 (`fit_largest_blob.json`, `best_fit_render.png`) =
  right size, ≈100 px too far left. The `yaw07`/`side07` hook in `cameraRig.ts` is inactive (default unchanged).
  **Visual next steps (per §0):** gold rings in the 05 polished-gold style (real R1/R2 + forced-perspective far block
  R3–R5 with the warm end glow), purple metal walls, low foam banks, paddles on the upper-left wall, the cyan-and-pink
  S-river look — all behind `?match07=1`, default pixel-identical. Only nudge framing if the rings cannot line up.
* **04, 06, 08:** audit + `?match04/06/08=1` switches exist on line A (`qa/match/audit/`); no visual work yet.
  Screen 06 brief: `qa/match/06/relaunch/BRIEF_path-camera-transition-engineer.txt` (re-read it against §0 before use:
  it is structure-first).
* Tool evaluation (A Blender/Three.js only · B + fSpy/Substance 3D Painter · C external 3D generator) was NOT written up
  and none of those tools was tested. Facts: fSpy (free, open source) gives a starting camera from vanishing lines;
  Substance 3D Painter (paid) paints onto UV'd meshes → glTF PBR maps, useful only once geometry is right; generators
  (Meshy/Tripo/Rodin/World Labs) do not reproduce a given 2D composition exactly (`qa/pilot05/marble_feas/NOTES.md`).

## 4b. Screen 08 — DONE as a test, waiting for the user (2026-11-17 ~13:45 UTC)
`?match08=1`: hybrid approved artwork projected onto fitted 3D geometry; scenery 95.4 % / whole frame 80.6 % within 20
levels; gameplay 8/8; default 0 px. Details, remaining corrections (coins, Benny's look, arch inner faces when moving)
and Android notes: `qa/match/08/NOTES.md`. Image-Blaster/Marble test record: `qa/imageblaster/08/NOTES.md`.

## 5. Specialists (`.claude/agents/`, 10 files, SHA-256 unchanged) — NONE is running now
Running agents do not survive a session or account switch. Relaunch from the brief + notes; do not repeat finished steps.

| Specialist | Line | State | Next (exactly) |
|---|---|---|---|
| washer-environment-modeler (`env05`) | B | **INTERRUPTED** ~03:10 UTC mid wall/ring feedback re-bake (`tools/env05/proj_bake.py`, `remap_feedback.py`, `atlas_eval.py`, `environment.ts`, `proj05Tunnel.ts` edited 02:59–03:10; nothing written to `env/NOTES.md` about it) | Re-capture `?match05=1` + metrics first (the 03:05/03:10 bake is unmeasured; keep it only if not worse than walls 92 % / gold 88 %), then the two left-far-bend chunks (left wall x165–200 y553–592; far wall + far-river wedge x325–400 y528–590). Brief `qa/pilot05/full_reference_match/briefs/washer-environment-modeler.md`, notes `env/NOTES.md` §7. |
| foam-bubbles-particles (`splash05m`, `bub05`) | B | **INTERRUPTED** ~03:10 UTC; c2 = 86.9 % whole, wake 77.5 %, bubbles 99.7 % | `splash_bubbles/NOTES.md` → "Remaining": re-bake against the current walls, new.png + metrics, moving/steering frames, 04/06 with switches on, gameplay, continuity; REQUEST 1 (remove 14 painted bubbles from the water texture, then `bub05all`), REQUEST 2 (cyan water between wake filaments, mask file). |
| benny-character-artist (`benny05`) | B | FINISHED round 1 (Benny + hat 23.5 % → 73.0 %); round 2 QUEUED | Fur softness / colour / pom-pom (user priority 3); `benny/NOTES.md`. Keep pink fluff, violet eyes, knitted star hat, paw pads. |
| animation-and-gameplay-engineer (`hud05`, `coins05`) | B | FINISHED (gameplay 8/8, default 0 px) | Only HUD/coin look fixes if the user asks (coins ~52 %, HUD ~74 %). |
| android-build-performance | B | match05 debug APK built 02:44 | Last: final APK + performance after the visual parts are in. |
| path-camera-transition-engineer | A | NOT STARTED (two launches stopped before any commit) | Screen 06 behind `?match06=1`, only if the user wants parallel work; brief above. |
| water-fx-specialist | A/B | idle | W12 "Left undone" list (`qa/pilot05/wave12/NOTES.md`) only on request. |
| reference-match-director, playwright-visual-qa | — | main-session roles | APPROVED / BEFORE / NEW full-size + metrics after each accepted step. |
| cartoon-girl-character-artist | — | idle | Not planned (videos cover the girl). |

Unfinished wave-9 patches (not merged, A and B): `qa/pilot05/wave9b/not_merged/`.

## 6. Tools (verified in this container 2026-11-17 ~11:45 UTC by the bootstrap)
Blender 5.3.0 (`/usr/local/bin/blender`, bpy headless OK, GLB export) · Node v22.23.4 / npm 10.9.9, TypeScript (`tsc`
clean), Vite, Three.js r170 · Playwright + preinstalled Chromium 153 (WebGL2 via SwiftShader; never `playwright
install`) · Git LFS (all binaries real; GitHub LFS has every object) · Android SDK 34 + build-tools 34.0.0 +
platform-tools (`/opt/android-sdk`), Java 21, Gradle wrapper 8.2.1 (`npm run android:debug`) · FFmpeg 6.1.1, ImageMagick
6.9.12 · Python 3.13 with Pillow, numpy, OpenCV, scipy · continuity test OK (07→08 drop 61.19).
Reproducible setup = `scripts/claude-bootstrap.sh` (checks first, installs only what is missing) + the cloud-environment
setup script `scripts/cloud-env-setup.sh`.

**Manual steps on the new Claude account (cannot travel through GitHub):**
1. claude.ai → connect GitHub + install the Claude GitHub App on `josiahscalia5-dev/rainbow-`.
2. Cloud environment: create a personal environment (e.g. `rainbow-`), network "limited" + package managers + MCP
   servers allowed, allowed hosts `download.blender.org`, `dl.google.com`, `lfs.github.com`; setup script = contents of
   `scripts/cloud-env-setup.sh`. (Claude can propose this with its environment tools; the user approves.)
3. Optional: World Labs Atlas connector; Marble API key only as an environment network secret for host
   `api.worldlabs.ai` (header `WLT-Api-Key`) via the secure credential form, and only for a paid job the user approved.
   On the current account the `rainbow-` environment has NO World Labs key and does not allow `api.worldlabs.ai`
   (bootstrap: proxy 403 = network, not a key problem). Nothing in the game needs it.
   On 2026-11-17 ~11:47 UTC the user pasted a Marble key into the chat. It was NOT used and NOT saved anywhere in the
   repo (transcript export redacts it; verified 0 occurrences in files and commits). The user was advised to rotate
   it. Never use a key from chat; Marble jobs need the user's OK for the named job + credits first.
4. Optional: context7 MCP (failed to connect in this session: proxy tunnel error). Playwright MCP comes with the
   playwright plugin and connected here.

## 7. Five-minute autosave
`scripts/rainbow-autosave.py` (daemon `scripts/autosave-daemon.sh`, re-armed by SessionStart/Stop hooks) commits and
pushes to the session's own branch, verifies remote == local, logs to `backups/BACKUP_LOG.md`. Check:
`python3 -I scripts/autosave-status.py`. End of session: `python3 scripts/rainbow-autosave.py --reason manual:end`.
It cannot run while no session is open — never claim it did.

## 8. Next commands (safe order)
1. §2 recovery; give the user the backup report of `CLAUDE.md` §4.
2. Ask the user whether to combine line A and line B (§1 procedure, show the two Screen 05 captures first). Do not do
   it unasked.
3. Visual work only (§0): Screen 05 remaining parts on line B (§5), then Screen 07 scenery (§4), then 04, 06, 08.
   One change per test behind a URL switch; default build pixel-identical; APPROVED | BEFORE | NEW full size + numbers.
