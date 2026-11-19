# Rainbow transfer to Claude Code or another developer

Rainbow is an existing Three.js and TypeScript game delivered on Android through Vite and Capacitor. Benny is the pink, fluffy mascot with the purple-and-white knitted beanie and yellow star. Screens 04–08 are real-time playable worlds. Screens 01–03 and 09–11 share the owner’s separate Google Flow opening and ending workflow. `Project/docs/FLOW_VIDEO.md` records the storyboard, filenames, transitions and fallback behavior.

## Choose the correct starting point

The ordinary `Project/` folder is the byte-verified Account 18 coordination branch. Development continued independently on multiple specialist branches. Read the lead handoff and the relevant screen branch before editing. The GitHub default branch has its own saved state. The complete list of 178 remote branches, including all 38 pre-existing Codex branches, and the original tag is in `Inventory/remote-branches-and-tags.tsv`. Local checkouts and staging histories have separate names in `History/saved-refs-final.jsonl`.

| Screen or role | Branch | Frozen commit | Status |
|---|---|---|---|
| Coordination | `ccr-ae71d3a5-80naq2` | `08dce491ec04a5a022ea4d9351cdaa0d9fcd5605` | Account 18 coordinated working snapshot |
| Previous lead | `ccr-bbe2b27e-oxfh1w` | `d22ec46b72146d69703d4271cd54c1c852164dff` | Account 17 handoff |
| 04 | `claude/rainbow-s04-match-c18` | `f9cb52f9baea95937adf3555db672dd7529a3174` | Claudia’s retained specialist work |
| 04 gold | `claude/rainbow-s04-ringtex-c18` | `9eb27e6ee79c7029ee2094a510c868abe081a96d` | Separate ring specialist |
| 05 | `claude/rainbow-s05-match-c18` | `31a61b906090f614b0606299902714d4b8d7cb6c` | Claudia’s retained specialist work |
| 06 | `claude/rainbow-s06-match-c18` | `c649fcbc35780e11cefce83eb54684f1d55752a5` | Protected Screen 06 baseline |
| 07 | `claude/rainbow-s07-match-c18` | `8accdad0a07ec4e3c4189701aea9df101932c7f5` | Protected Screen 07 baseline |
| 08 | `claude/rainbow-s08-scenery-c17` | `3c0fa97090afb2c0fca41898774db7247e23e522` | Specialist scenery checkpoint. Owner review pause applies |
| 06 scenery | `codex/s06-arched-washer-passage` | `94c36531af3cce486a252e56f75b81595536ad96` | Candidate, pending owner review |
| 06 Benny | `codex/s06-benny-reference-pink` | `692ae350bb83bc7497abe2bba9cf1520c1195b78` | Separate character candidate, pending owner review |

Start with `Project/CLAUDE.md`, `Project/docs/NEW_CLAUDE_ACCOUNT_HANDOFF.md`, the Account 18 coordination and resume records under `docs/briefs/`, `docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md`, `backups/AGENTS_STATUS.json` and `backups/TOOL_MANIFEST.json`. Later specialist reports live on their own branches. `backups/wip/` preserves unfinished snapshots, including Account 16 recovery material.

## Visual decisions

The original file for each screen in `Project/references/` is authoritative. The hash manifest also covers the original cartoon girl and isolated Screen 05 water artwork. Preserve all original bytes. The owner personally approves visual results and any additional moving-view designs.

| Screen | Retained design and outstanding review |
|---|---|
| 04 | Preserve the five arrows and gold entrance. Compare the deeper corridor’s ring profile and reflections against the entrance and the separate gold specialist work. The curved-water result is a candidate. |
| 05 | Preserve the S-shaped river, golden paddles and rounded foam. Review stretching at the final bend. The mirrored-wall test was rejected. |
| 06 | Preserve the sweeping crest, purple opening and off-center tunnel. The arched washer-passage and lighter-pink Benny experiments are separate candidates. Prior oversized-water and rejected curve/route trials remain recoverable. The opening, hard turns and deep passage need owner review. |
| 07 | Preserve Claudia’s near-water correction. Check the downward plunge for white walls, cyan streaking and straightened magenta banks. The older Image2Blender bank/foam experiment was rejected for promotion. The saved paddle study is unapproved. |
| 08 | Preserve the chamber door, platform, towel, ring and four spouts. The owner paused additional editing pending review. The saved curved-water experiments remain separate. |

`Handoff/Earlier-review-EXPERIMENTS.csv` records the dispositions that were documented when that review was created. Newer branch-local notes and explicit owner decisions take precedence. The export does not grant approval to a saved model or test. Use `Inventory/historical-paths.jsonl` to locate every saved path/version and `History/Rainbow.git` to resolve its exact commit context. Run `git diff --name-status <checkpoint>..<candidate>` in a recovered working copy to see the exact changed files for an experiment.

## Recover branches and unfinished work

The offline bare mirror retains the original remote branches and tag by name, plus a separate `refs/recovered/` namespace for local heads, old refs and recoverable reflog checkpoints. The Git metadata packs and byte-addressed blobs form a portable history export. `restore_rainbow.py` reconstructs the original Git object IDs and runs `git fsck --full --strict`. LFS payloads are in the resulting mirror’s `lfs/objects/`.

Create a fresh working directory for each specialist or experiment. The following example uses the restored mirror as a local source. Supply your restored mirror’s absolute path for the LFS storage setting.

```sh
GIT_LFS_SKIP_SMUDGE=1 git clone --no-checkout RainbowRestored/History/Rainbow.git Screen06-Candidate
git -C Screen06-Candidate lfs install --local
git -C Screen06-Candidate config lfs.storage "/absolute/path/RainbowRestored/History/Rainbow.git/lfs"
git -C Screen06-Candidate switch --detach 94c36531af3cce486a252e56f75b81595536ad96
git -C Screen06-Candidate lfs checkout
```

To recover unfinished, untracked or ignored project work, run the restoration in a new empty destination with `--workspaces`. Choose an alias in `History/working-repositories.jsonl`. Then recreate its original index and working files with the bundled helper.

```sh
python3 restore_rainbow.py --from RainbowDownloads --to RainbowWithWorkspaces --workspaces
python3 restore_workspace.py --root RainbowWithWorkspaces --workspace 001-repo --to Recovered-Benny-Work
```

The first alias in this example is the earlier local Benny work. Its original detached commit and subsequent published successor are recorded independently. Keep purposeful sparse or unhydrated local files in their recorded state when recovering that exact workspace. The fully materialized lead and LFS store give you the corresponding usable assets. Portable symlinks to included project files are restored when their targets exist. Reinstall the linked dependency folders that were disposable.

## Run and build

The restored lead passed its build with Node 24.22.1 and npm 11.9.0. The lockfile pins its dependency graph. The game uses Three.js 0.170 and Capacitor 6. Use the Gradle wrapper, Android SDK platform 34 and Build Tools 34. The native project declares minimum SDK 22 and targets SDK 34. The isolated restore used Gradle 8.2.1, a JDK 21 installation, and a disposable debug signing key.

```sh
cd RainbowRestored/Project
npm ci
npm run verify:refs
npm run dev
```

For automated testing, install the Chromium runtime used by Playwright and run the following from the same folder. The verified restore used the existing Playwright installation and system Chromium with the repository’s headless WebGL flags.

```sh
npm run build
npm run test:continuity
node scripts/gameplay-test.mjs
npm run android:debug
```

The recovery build verifies the 13 reference hashes. The restored real-game test passed all 8 assertions, collected 91 coins, progressed from 1,330 to 2,240 and retained five hearts. The independently restored native build produced a 22,882,260-byte debug APK for `com.rainbow.washergame`. The archive also preserves earlier saved APKs. The new verification APK was a disposable build test. Review `Verification/` for the results. Physical Android gameplay and sustained device performance were not measured in this restore.

## Continue reconstruction

Use the existing Blender scripts, editable scenes, GLB exports, depth maps, textures and camera records. The offline file inventory includes the editable Image2Blender and motion-matching skill experiments. Locate `rainbow-visual-motion-matcher` on its saved Codex branch, and inspect the pinned Image2Blender checkout and its license in the restored workspaces. Blender 5.3.0 opened the Screen 06 scene and imported the restored runtime GLBs. See `Verification/all-models.json` for dependencies in older scenes that may require relinking.

Blender Python works headlessly. To use Blender Lab MCP on a replacement machine, follow the saved tool manifest, use its pinned version, start one loopback Blender connection, and confirm it can read a disposable scene. Keep service credentials in the development environment’s secret store. Previous running MCP connections, Claude agents and chat sessions have to be started anew. Saved project instructions, handoffs and experiment decisions transfer as files.

For new experiments, recheck the specialist’s latest commit, use a separate working branch and lock the exact approved image hash. Compare three full-size images and matched real gameplay at the opening, +3, +6, +10 and +20 where applicable, hard turns, bends, plunge and exit. Record a continuous ride. Ask the owner to review hidden viewpoints and any promotion. Preserve controls, collisions, scoring, transitions, Benny’s identity and the Flow handoffs.

## Locally recoverable objects without a filename

Four local Git blobs totaling 30,225 bytes had no path in the saved history or staged files. Their exact bytes and Git object IDs are in `Handoff/Unattached-local-Git-objects/` and `Inventory/unattached-local-git.jsonl`. Their purpose and approval status are unverified. No additional local stash ref was found.

The complete list of Codex tip and comparison bases is in `Handoff/Codex-branch-status.jsonl`. The corresponding 15,090 branch-comparison path records are in `Handoff/Codex-branch-deltas.jsonl`. Export branches with independent roots are explicitly identified.

## Accessible conversation records

The ordinary lead contains 36 saved Claudia transcripts under `Project/backups/claude-sessions/`. The preserved Git history contains 71 distinct transcript paths with 1,278 saved file versions. Project-specific Codex handoffs and experiment records are included. No private Codex conversation export was available.
