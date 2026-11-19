# Rainbow session — session 428714b1-22e5-54c0-9c48-8c89d874b370

### 🧑 User — 2026-11-17T15:40:37.600Z

You are the SCREEN 04 workstream agent of the RAINBOW game (my existing project — do NOT restart or redesign anything). The lead coordinator is the session "Rainbow game restoration and parallel agents" (session_01AvQv6UXiBngewM8kSBwFfZ); it owns integration, shared systems and Screen 08. You work ONLY on Screen 04, isolated, on branch `claude/rainbow-s04-match` (created from `ccr-9c4a8ad6-xovgsx` @ 752d6d8 = line A, which has the successful Screen 08 method).

## Startup (short)
1. Follow CLAUDE.md. The SessionStart bootstrap already ran; check `bash scripts/claude-bootstrap.sh --status` once. NEVER merge, cherry-pick, force-push, reset or rebase; never push to any branch except `claude/rainbow-s04-match`. Confirm `git branch --show-current`.
2. Read: docs/NEW_CLAUDE_ACCOUNT_HANDOFF.md, qa/match/08/NOTES.md (THE METHOD), qa/imageblaster/08/NOTES.md, src/world/match08.ts, src/game/match.ts, src/game/cameraRig.ts (off08/aim08), tools/match08/*, tools/qa/screen_match.py, qa/match/audit/ (04 numbers: today 6.4 %).
3. API keys are NOT configured on this account yet: do not call World Labs or fal, do not request credentials.

## Goal
`?match04=1`: my approved picture `references/04_through_the_five_arrows.png` (never modify it; `sha256sum -c scripts/reference.sha256` must stay 13 OK) reproduced in the REAL playable 3D game with the Screen 08 method: exact camera solve at the game's FOV → real 3D proxy geometry fitted to the picture → texture = my ORIGINAL pixels camera-projected (post-chain inverse as in match08) → unseen surfaces from tiles cut from the artwork + stretch guard → river path following the painted water → the picture's coins at the painted spots (still real pickups) → moving-camera + steering test. Where Benny / HUD / title banner / coins must be removed from the texture, use a PROVISIONAL local fill (OpenCV inpainting / patch fill / continuing the scenery) and prepare — but DO NOT run — one fal `nano-banana-2/edit` clean-plate request (exact prompt + inputs written in qa/match/04/FAL_PLATE_REQUEST.md); the lead asks me for approval of paid edits. Do not use Marble for gameplay views (08 test proved it changes the layout).

## Isolation rules (strict)
* Your own files: `src/world/match04.ts`, `assets/textures/match04/`, `tools/match04/`, `qa/match/04/`.
* Shared files (src/game/match.ts, cameraRig.ts, course.ts, Game.ts, src/gameplay/coins.ts): only minimal, additive edits that run ONLY when `match04` is on; list every one in `qa/match/04/SHARED_CHANGES.md` for the lead's approval.
* NEVER touch: Benny (src/characters/benny/*, assets/textures/benny0*/ — the Screen 08 agent owns Benny), HUD (src/ui/*), gameplay rules, Screen 08 files (match08), references, protected branches.
* Proofs required: default build 0 px different (`node scripts/capture.mjs 04` and `05` before/after); Screen 08 under `?match08=1` 0 px different; gameplay `node scripts/gameplay-test.mjs` 8/8 with and without `match04=1`, coin total stays 91 / 2,240; `npx tsc --noEmit -p .` clean.

## Deliverables
APPROVED | BEFORE | NEW as SEPARATE full-size pictures (1080×1920; no grids as the main result) in `qa/match/04/`, numbers from tools/qa/screen_match.py (whole frame, scenery without HUD/Benny, bands, SSIM), moving-camera frames (forward 3/6/10 u + steering left/right), `qa/match/04/NOTES.md` (method, numbers, reproduce commands) and `qa/match/04/STATUS.md` with exactly these fields: Assigned screen · Active agent · Git branch · Completed work · Visual accuracy measurements · Remaining issues · Latest saved commit · Next task · Status (in development / under review — NEVER "approved": only I approve).

## Saving + reporting
The five-minute autosave pushes this branch; also commit + push at each milestone and verify `git ls-remote origin refs/heads/claude/rainbow-s04-match` == HEAD. At each milestone send a short status to the lead session with send_message (session_01AvQv6UXiBngewM8kSBwFfZ) if that tool is available, and keep STATUS.md current. No integration into ccr-9c4a8ad6-xovgsx: the lead integrates only after I approve Screen 08 and this screen.

## Pace
The account's usage limit is shared by all parallel sessions and Screen 08 has priority. Work efficiently (one heavy render at a time; reuse the match08 tools rather than rewriting). MILESTONE 1 = first NEW 04 at the approved view with numbers + a moving-camera check + STATUS.md pushed. Then send the lead your status and stop and wait for instructions. You may use the project specialists in .claude/agents/ (washer-environment-modeler, playwright-visual-qa, reference-match-director) as subagents inside your own session.

### 🤖 Claude — 2026-11-17T15:40:41.237Z

> 🔧 **Bash** `{"command": "git branch --show-current && git log --oneline -3 && bash scripts/claude-bootstrap.sh --status 2>&1 | tail -30", "description": "Check branch and bootstrap status"}`

### 🧑 User — 2026-11-17T15:40:41.945Z

> ↩︎ result: claude/rainbow-s04-match
> 548411b autosave: Rainbow 2026-11-17 15:40 UTC
> 752d6d8 autosave: Rainbow 2026-11-17 15:18 UTC
> 0d6f669 Full save on user request: code, assets, agents, Marble worlds, APKs, QA, docs, sanitized chat transcripts
> Generated 2026-11-17 11:41 UTC by `scripts/claude-bootstrap.sh` (mode `background`) on branch `ccr-9c4a8ad6-xovgsx`.
> The commit that contains this file is the backup itself, so its SHA is not written here; use `git log -1 -- backups/BOOTSTRAP_REPORT.md`.
> 
> | Step | Result | Details | s |
> |---|---|---|---|
> | Repository + branch | OK | josiahscalia5-dev/rainbow- on ccr-9c4a8ad6-xovgsx @ 051ef83 (session started from ccr-61131b9d-uj0oqb) | 0 |
> | Resume newest work | WARN | 18/25 remote ccr-*/claude/* branches contained in HEAD 051ef83; not merged (automatic merge disabled (use --resume only with the user's OK)): run bash scripts/claude-bootstrap.sh | 54 |
> | Backup gap since last session | OK | previous save on GitHub: 051ef83 2026-11-17 11:35 UTC (hook:Stop) on ccr-61131b9d-uj0oqb, ccr-9c4a8ad6-xovgsx; previous session ended WITHOUT an end-of-session backup (its environment closed after an automatic save); 16 gap(s) > 10 min in the last 72 h of the autosav …[+3386 chars]

### 🤖 Claude — 2026-11-17T15:40:44.383Z

> 🔧 **Bash** `{"command": "cat qa/match/08/NOTES.md | head -150; ls tools/match08 qa/match/audit; wc -l src/world/match08.ts src/game/match.ts src/game/cameraRig.ts tools/match08/* tools/qa/screen_match.py", "description": "Read Screen 08 method notes and tool list"}`

### 🧑 User — 2026-11-17T15:40:44.441Z

> ↩︎ result: # Screen 08 — approved scenery on real 3D geometry (`?match08=1`, 2026-11-17, session 03b94f36)
> 
> User order (2026-11-17): apply the cleaned environment-only Screen 08 artwork to the actual 3D game environment behind a
> test switch; real geometry + texture projection (not a flat picture); match camera, proportions, architecture,
> waterway, colours, lighting; correct mismatched geometry; APPROVED | BEFORE | NEW as separate full-size pictures;
> measure; check that it can work with a moving camera on Android. **Default build unchanged (0 px, verified).**
> 
> ## What `?match08=1` does (all behind the switch; files)
> 1. **Camera** (`src/game/match.ts` MATCH_CAM['08'], `src/game/cameraRig.ts` off08/aim08): solved in the live game so
>    Benny's box, the door and the platform land on the approved picture at the game's own 62° FOV (Benny box
>    266,843–594,1216 vs approved 260,850–600,1210; door 489,399 vs 490,400; platform 483,565 vs 480,560). The game's
>    chamber proportions already agree with the picture — only the camera was off. Camera: Benny + offset, aimed at the
>    door, level (no bank roll); blended in before the checkpoint, out before 09.
> 2. **Waterway** (`src/world/course.ts`, `assets/t …[+13910 chars]

### 🤖 Claude — 2026-11-17T15:40:45.338Z

> 🔧 **Bash** `{"command": "(git push -u origin claude/rainbow-s04-match 2>&1 | tail -2); git ls-remote origin refs/heads/claude/rainbow-s04-match", "description": "Push branch to establish remote"}`

### 🧑 User — 2026-11-17T15:40:46.550Z

> ↩︎ result: Everything up-to-date
> branch 'claude/rainbow-s04-match' set up to track 'origin/claude/rainbow-s04-match'.
> 548411b272676f5dc23c3c54cdba21383f593af0	refs/heads/claude/rainbow-s04-match

### 🤖 Claude — 2026-11-17T15:40:48.201Z

> 🔧 **Bash** `{"command": "cat src/game/match.ts; cat src/world/match08.ts; cat qa/match/audit/04_metrics.json", "description": "Read match.ts, match08.ts and 04 audit"}`

### 🧑 User — 2026-11-17T15:40:48.234Z

> ↩︎ result: /**
>  * "Match my approved picture" test switches for the gameplay screens (2026-11-17, qa/match/NOTES.md).
>  *   `?match02=1` … `?match10=1`  one screen each (05 has its own set; `?match05=1` turns all of those on — see
>  *   src/vfx/waterRibbon.ts q05). `?matchall=1` = every screen switch below at once.
>  * Every change a screen makes lives behind its switch: with no switch the game is byte-for-byte the default build
>  * (verified by pixel comparison after every change). Packaged experiment builds read the same keys from
>  * VITE_RAINBOW_Q05 (flag05).
>  * File ownership (one owner per screen while work runs in parallel): see qa/match/NOTES.md.
>  */
> import type { CamParams } from './cameraRig';
> import { flag05 } from '../vfx/waterRibbon';
> 
> export type MatchId = '02' | '03' | '04' | '06' | '07' | '08' | '09' | '10';
> export const MATCH_IDS: MatchId[] = ['02', '03', '04', '06', '07', '08', '09', '10'];
> const ALL = flag05('matchall');
> export const MATCH: Record<MatchId, boolean> = Object.fromEntries(MATCH_IDS.map((id) => [id, ALL || flag05('match' + id)])) as Record<MatchId, boolean>;
> export const matchOn = (id: string): boolean => (MATCH as Record<string, boolean>)[id] === true;
> 
> /**
>  * Came …[+14682 chars]

### 🤖 Claude — 2026-11-17T15:40:49.050Z

Let me look at the approved picture and current game 04.

### 🤖 Claude — 2026-11-17T15:40:51.815Z

> 🔧 **Bash** `{"command": "python3 -c \"\nfrom PIL import Image\na=Image.open('references/04_through_the_five_arrows.png');print(a.size,a.mode)\nb=Image.open('qa/match/audit/04_BEFORE_default.png');print(b.size)\nw=540;Image.new('RGB',(w*2,960)).save('/tmp/x.png')\nim=Image.new('RGB',(1080,960));im.paste(a.convert('RGB').resize((540,960)),(0,0));im.paste(b.convert('RGB').resize((540,960)),(540,0));im.save('$PWD/../sbs04.png' if False else '/tmp/claude-0/-home-user-rainbow-/428714b1-22e5-54c0-9c48-8c89d874b370/scratchpad/sbs04.png')\n\"", "description": "Make side-by-side of approved vs current 04"}`

### 🧑 User — 2026-11-17T15:40:52.417Z

> ↩︎ result: (864, 1536) RGB
> (864, 1536)

### 🤖 Claude — 2026-11-17T15:40:53.828Z

> 🔧 **Read** `{"file_path": "/tmp/claude-0/-home-user-rainbow-/428714b1-22e5-54c0-9c48-8c89d874b370/scratchpad/sbs04.png"}`

### 🧑 User — 2026-11-17T15:40:53.878Z

> ↩︎ result: [image]

### 🤖 Claude — 2026-11-17T15:40:59.190Z

> 🔧 **Bash** `{"command": "grep -rn \"match08\\|MATCH\\['08'\\]\\|matchOn('08')\\|off08\\|aim08\\|river08\\|coins08\\|M08_\" src --include=*.ts | grep -v \"^src/world/match08.ts\" | head -60", "description": "Find all match08 hooks in shared files"}`

### 🧑 User — 2026-11-17T15:40:59.228Z

> ↩︎ result: src/characters/benny/benny05.ts:22:// branch it runs under `?benny05=1`, `?benny08=1` or the Screen 08 switch `?match08=1` (and `?matchall=1`); off: nothing runs
> src/characters/benny/benny05.ts:23:const on05 = (key: string): boolean => flag05(key) || flag05('benny08') || flag05('match08') || flag05('matchall');
> src/world/course.ts:16:import river08 from '../../assets/textures/match08/river08.json';
> src/world/course.ts:317:  // `?match08=1` (src/world/match08.ts, qa/match/08/NOTES.md): the 08–10 stream follows the APPROVED picture's painted
> src/world/course.ts:318:  // river (its centre line projected on the chamber floor from the locked 08 camera, assets/textures/match08/river08.json),
> src/world/course.ts:320:  const m08 = flag05('match08') || flag05('matchall');
> src/world/course.ts:321:  const rz = river08.z.filter((z) => z >= -326), rxs = river08.x.slice(0, rz.length);
> src/game/match.ts:28:  '08': { fov: 62, roll: 0, off08: [0.686, 3.697, 7.115], aim08: [9.812, -119.291, -332.288] },
> src/game/cameraRig.ts:28:  /** `?match08=1` only (src/game/match.ts): over the 08 stage the camera sits at Benny's water point + this world
> src/game/cameraRig.ts:29:   *  offset and looks at the fixe …[+2931 chars]

### 🤖 Claude — 2026-11-17T15:41:01.081Z

> 🔧 **Bash** `{"command": "sed -n 1,200p src/game/cameraRig.ts; sed -n 95,130p src/game/Game.ts; sed -n 500,600p src/game/Game.ts", "description": "Read camera rig and Game hooks"}`

### 🧑 User — 2026-11-17T15:41:01.167Z

> ↩︎ result: /**
>  * Third-person ride camera: behind/above Benny, looking along his heading (the course tangent), or
>  * along the straight tunnel axis inside the 05–07 tube so the gold rings converge to one vanishing point
>  * as in the references. Pitch & roll follow the banked path smoothly — including the 07 plunge.
>  */
> import * as THREE from 'three';
> import { WORLD } from '../world/course';
> import type { Course, StageId } from '../world/course';
> import type { TubePath } from '../world/tube';
> import { applyMatchCam } from './match';
> 
> export interface CamParams {
>   back: number; // distance behind Benny
>   up: number; // height above Benny's water point
>   ahead: number; // look-at distance ahead
>   lookUp: number; // look-at height
>   fov: number;
>   latFollow: number; // 1 = camera fully follows Benny's lateral offset
>   roll: number; // 0..1 how much of the path bank the camera adopts
>   /** 05 only: view yaw (deg) to the LEFT of the tunnel axis, i.e. the vanishing point sits right of centre */
>   yaw?: number;
>   /** 05 only: lateral dead zone (units): the camera holds the tunnel axis while Benny is within ~this of it */
>   deadZone?: number;
>   /** `?match07=1` only (src/game/match.ts): extra view y …[+17191 chars]

