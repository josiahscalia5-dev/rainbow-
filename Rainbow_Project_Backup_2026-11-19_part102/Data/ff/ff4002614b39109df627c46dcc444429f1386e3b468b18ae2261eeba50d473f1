# RAINBOW — new-account handoff (2026-11-17 ~11:50 UTC) — READ THIS FIRST

Rainbow is an EXISTING playable 3D Android game (Three.js + Vite + TypeScript, Blender 5.3.0, Playwright, Android).
Never restart it, never change engines, never rebuild Screen 05, never modify `references/` (13 files,
`sha256sum -c scripts/reference.sha256`).

## 1. Repository and branches
Repository: https://github.com/josiahscalia5-dev/rainbow-
**Source branch of this handoff: `ccr-61131b9d-uj0oqb`** (the final verified SHA is in `backups/BACKUP_LOG.md`, last
entry, and was reported to the user; `git ls-remote origin refs/heads/ccr-61131b9d-uj0oqb`).

There are **TWO lines of unique game work. They have NOT been merged — the user must approve any merge/cherry-pick.**

| Branch | Newest commit | Contains | Unique work |
|---|---|---|---|
| `ccr-61131b9d-uj0oqb` (THIS) | see BACKUP_LOG | `ccr-57af22a4-lsg7y7` @ `e27c6fa` + this session | Screen 05: paddles (Blender trays `?projlid05=1`), near gold frame, water flow `?projflow05=2`, sharp riding water `?projnear05=1`, `?match05=1` (= all 05 switches); `?matchNN=1` framework (`src/game/match.ts`), audit of 02–10 (`qa/match/`), Screen 07 measurement + camera work, generic tools (`tools/match/`, `scripts/match-*.mjs`), bootstrap auto-merge OFF |
| `ccr-b0757dec-dj6l1o` | `a8c03f0` (11-17 03:36) | every other recent branch (`claude/rainbow-account-transfer-npxahd`, `claude/rainbow-restore-env-setup-bxn85h`, `ccr-694bda6a-x58ntq`, `claude/approved-screen-implementation-g3loqu`, `ccr-8c4acadc-iybw0n`, `ccr-e546a360-cxmton`) | 139 commits since the split: Screen 05 HUD (`src/ui/hud.ts`), coins (`src/gameplay/coins.ts`), bubbles / rider splash / spray, `proj05Tunnel.ts`, `environment.ts`, `tube.ts`, `waterRibbon.ts` changes, its OWN parallel `projnear05` version, env05 ring table, Benny r7, `tools/splash05/` |

* Split point: `aea7e77` (2026-11-16 22:13). Neither branch contains the other.
* Dry-run merge (`git merge-tree --write-tree HEAD origin/ccr-b0757dec-dj6l1o`): **11 conflicts** — `CLAUDE.md`,
  `src/vfx/waterRibbon.ts`, `assets/textures/water05/proj05_T2.png`, `proj05_WT2.png`, `proj05_near.json`,
  `qa/pilot05/proj/near/NOTES.md`, and backup status files. The two `projnear05` versions are DIFFERENT implementations
  of the same idea — a human (the user) must choose which one to keep, after comparing both captures.
* `codex/*` branches: Codex's separate experiments — protected, never merge.
* Safest procedure to keep BOTH sets of improvements (only after the user says so):
  1. compare: `git diff aea7e77 origin/ccr-b0757dec-dj6l1o --stat` and capture Screen 05 on both branches
     (`node scripts/capture.mjs 05 --q=...`) — show the user both;
  2. create a NEW branch from this one, `git merge --no-ff origin/ccr-b0757dec-dj6l1o`, resolve each conflict keeping
     both features (non-05 files: take both sides; `projnear05`: the user's choice), verify default pixel identity,
     `?ringa=26&nearfloor05=0` baseline, gameplay test 8/8, then push to that new branch. Never force-push.

## 2. Recovery on the new account (NO automatic merges)
```
git fetch origin ccr-61131b9d-uj0oqb && git checkout -B <new session branch> FETCH_HEAD   # or start the session on it
bash scripts/claude-bootstrap.sh --skip-resume        # tools, LFS, autosave, report; merges NOTHING
python3 -I scripts/autosave-status.py                 # expect AUTOSAVE OK … (match)
sha256sum -c scripts/reference.sha256                 # 13 OK
```
From an older checkout whose bootstrap still auto-merges:
`git fetch origin ccr-61131b9d-uj0oqb && git show FETCH_HEAD:scripts/claude-bootstrap.sh > /tmp/b.sh && bash /tmp/b.sh --skip-resume`.
Since 2026-11-17 `scripts/claude-bootstrap.sh` merges **nothing by default** (the SessionStart hook only fetches);
`--resume` turns the old ccr-*/claude/* merge back on and may only be used with the user's explicit OK.

## 3. Game structure (user, 2026-11-17 — do not change without asking)
VIDEOS: 01 existing opening · 02 whirlpool tumble · 03 Whirlpool Twirl · 09 final wave · 10 return to hiding ·
11 existing ending. REAL PLAYABLE 3D: 04 Five Arrows · 05 Flow Into the Current · 06 Rinse Arch · 07 Washer Tube ·
08 Final Spin Chamber. Goal 9/10 visual similarity per playable screen to its own approved picture.
* No video regenerated, no paid credits spent. `public/video/` holds only `PUT_FLOW_VIDEOS_HERE.txt`: the user's
  `intro.mp4` / `ending.mp4` are NOT in the repo yet (`docs/FLOW_VIDEO.md` explains the existing hand-over).
* Not yet built: video manifest, reversible `?route=v2` (intro → c02 → c03 → 04…08 → c09 → c10 → ending, old
  real-time 02/03/09/10 kept as fallback), Screen 03 Flow test pack (first frame = approved 03, last frame = real 04
  start; Flow-ready prompt; the USER runs Flow — no credits by Claude).

## 4. Screen 07 — current state (first test of the "new production method", user 2026-11-17)
User order: 1 Benny position/size → 2 tunnel perspective, ring positions, VP → 3 S-river path → 4 low foam banks →
5 coin trail → 6 only then projection/texture. Never bake Benny/coins/HUD into textures. Deliver APPROVED | BEFORE |
NEW (separate full-size) + moving clip + metrics.
Measured (approved `references/07_dive_the_washer_tube.png`):
* Benny box ≈ x 200–640, y 790–1200 (pom-pom to waterline incl. arms).
* Rings (`tools/match/ring_fit.py`, `qa/match/07/rings/approved.json|png`): R1 (409,607) r456 · R2 (582,529) r303 ·
  R3 (592,534) r187 · R4 (612,551) r118 · R5 (624,560) r72; VP ≈ (615,550). At fov 62 (f = 1278 px) and tube
  radius 7.2 these are depths ≈ 20, 30, 49, 78, 128 u from the eye — R3+ lie beyond the plunge top (≈41 u ahead of
  the 07 eye), so they need a forced-perspective far block like Screen 05's `ForcedTunnel` (environment.ts 05 block).
* Game 07 (`qa/match/07/geo_match07.json`, `scripts/match-geo.mjs`): stage 07 s 247.06–389.22, checkpoint s 273.06,
  plunge top s 310.41; tube r 7.2, river width 5.6; course S-wiggle 3.2·sin(3πt)·sin(πt) (course.ts 07 section);
  Benny sits ≈2.5 u left of the tube axis; the game's rings are seen obliquely (not concentric), VP ≈ (490,440).
* Camera fit (`scripts/match-cam-fit.mjs`, now measures only the LARGEST connected Benny blob — Benny's trail
  bubbles/spray were inflating the mask, `qa/match/07/cam/benny_mask_debug.png`): best IoU 0.577 at
  `{back 6.5, up 2.8, lookUp 1, ahead 10, latFollow 0.9}` → Benny box [112,776,532,1232] = right SIZE, but ≈100 px
  too far LEFT (`qa/match/07/cam/fit_largest_blob.json`, `best_fit_render.png`, `approved_before_bestfit_halfres.png`).
* In progress (uncommitted idea now committed, inactive): `src/game/cameraRig.ts` gained `yaw07` / `side07`
  (view yaw + sideways camera shift over stage 07). They do nothing until `MATCH_CAM['07']` in `src/game/match.ts`
  sets them (it does not yet) → default build unchanged. NEXT: extend match-cam-fit with a VP term (target VP
  (615,550), axis tangent from geo json) and fit back/up/lookUp/yaw07/side07; then rings (real R1/R2 at depths 20/30
  in 05 gold style + forced far block R3–R5 + warm end glow), foam squash in 07 (foam.ts `bermScale05`/`low05`
  extended to 07 under `match07`, keeping the shared rand() sequence), paddles on the upper-left wall only, then the
  S-river (course.ts 07 lateral offsets; marks shift a little → rerun gameplay test), coins, then projection.
* Tool evaluation the user asked for (A Blender/Three.js only · B + fSpy/Substance 3D Painter · C external 3D
  generator) was NOT yet written up. Facts to use: fSpy (https://fspy.io, free, open source) solves camera from
  vanishing lines in one image, exports a .json + Blender importer add-on — approved 07 has strong ring/tunnel lines but
  is not physically consistent (R1 centre off the VP), so it can give a starting camera only; Substance 3D Painter
  (Adobe, paid subscription) paints/projects onto UV'd meshes and exports PBR maps usable as glTF textures — useful
  only after geometry is right; generators (Meshy/Tripo/Rodin/World Labs) do not give an exact match to a given 2D
  composition (see `qa/pilot05/marble_feas/NOTES.md`). Never claim a tool was tested unless it was.

## 5. Specialists (`.claude/agents/`, 10 files, unchanged)
android-build-performance, animation-and-gameplay-engineer, benny-character-artist, cartoon-girl-character-artist,
foam-bubbles-particles, path-camera-transition-engineer, playwright-visual-qa, reference-match-director,
washer-environment-modeler, water-fx-specialist.
* **Running now: none.** path-camera-transition-engineer (Screen 06 structure behind `?match06=1`) was launched twice
  in a git worktree and stopped both times by interruptions BEFORE committing anything (no work lost, nothing to
  merge). Relaunch it with exactly `qa/match/06/relaunch/BRIEF_path-camera-transition-engineer.txt`
  (isolation: worktree, background). It owns course.ts 06 section, 06 parts of environment.ts, `MATCH_CAM['06']`,
  `qa/match/06/`; the main session owns Screen 07 + `src/game/match.ts` + `tools/match/` + `scripts/match-*.mjs`.
* All other specialists: idle; their previous notes are in `backups/AGENTS_STATUS.json`.

## 6. Tools (verified in this container 2026-11-17)
Blender 5.3.0 (bpy headless, GLB export) · Node v22.23.4, TypeScript (`npx tsc --noEmit` clean), Vite, Three.js r170 ·
Playwright + preinstalled Chromium (WebGL2 via SwiftShader; never `playwright install`) · Git LFS 3.4.1 (.glb .blend
.mp4 …) · Android SDK platform 34 + Java (`/opt/android-sdk`) · FFmpeg 6.1.1 · Python PIL 12.3, numpy 2.5, OpenCV 5.0,
scipy. The bootstrap installs anything missing (it checks first). MCP needing manual authorisation on a new account:
GitHub (claude.ai GitHub connection + Claude GitHub App on the repo), World Labs Atlas connector (`api.worldlabs.ai`;
key only as an environment network secret — never in files), context7 (OAuth, optional). Playwright / three.js
devtools MCP come from the parallax-threejs plugin. No secrets are stored in the repo.

## 7. Five-minute autosave
`scripts/rainbow-autosave.py` (daemon `scripts/autosave-daemon.sh`, re-armed by SessionStart/Stop hooks) commits and
pushes to the session's own branch, verifies remote == local, logs to `backups/BACKUP_LOG.md`. Check:
`python3 -I scripts/autosave-status.py`. End of session: `python3 scripts/rainbow-autosave.py --reason manual:end`.

## 8. Next commands (safe order)
1. Recovery commands of §2; report the backup line of CLAUDE.md §4.
2. Ask the user whether to merge `ccr-b0757dec-dj6l1o` (§1 procedure) — do not do it unasked.
3. Screen 07: continue §4 "NEXT" (camera with VP term → rings/far block → foam → paddles → river → coins → projection),
   everything behind `?match07=1`, default pixel-identical, gameplay test `node scripts/gameplay-test.mjs --q=match07=1`.
4. Write the A/B/C tool comparison for the user (facts in §4), then deliver APPROVED | BEFORE | NEW 07 + moving clip.
5. Relaunch the Screen 06 specialist only if the user wants parallel work.
