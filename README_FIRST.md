# Start here

This is the portable 19 November 2026 export of Josiah’s private Rainbow Android game. It contains the Account 18 working game, all 11 approved screens, the specialist and Codex histories, local development snapshots, original-quality assets and gameplay evidence. The original Google Flow movie masters still need to be supplied by their owner. See `MISSING_AND_EXCLUDED.md`.

## On your phone

1. Save **Rainbow_Project_Backup_2026-11-19.zip** from the single-download link in the delivery. Open the link in the same browser where you can see your private GitHub project. If Chrome adds the repository name to the filename, you can keep that name.
2. Open the ZIP to see the ordinary working game in `Project/`, the original artwork in `Project/references/`, and six separate images in `Screen06_stills/`. The pictures include the approved art, Claudia’s gameplay, the scenery candidate at the opening and deeper in the tunnel, and the separately tested pink Benny. On Android you can open just the pictures you want.
3. To transfer the complete development history, copy the single ZIP to a computer. Put it in a folder named `RainbowDownloads`. Extract `restore_rainbow.py` from the top of the ZIP into your current folder and run the command below. The script recognizes the backup even if the browser added a prefix to the filename.
4. A smaller-download option is available if a phone cannot receive a file this large. The alternative download list supplies every independently openable section, 001 through 180. Saving all sections together restores the same work. Parts 001 and 002 contain the immediately runnable game, and part 180 includes the restore scripts and handoff.

```sh
python3 restore_rainbow.py --from RainbowDownloads --to RainbowRestored
```

Python 3.11 or newer and Git are required. Full restoration requires disk for the downloads, decoded files, Git object database and any extra editable working copies. Allow about 75 GB free for the downloads and the standard restore, and additional space for `--workspaces`. The snapshot stores 22,831,289,571 unique uncompressed bytes before creating separate working copies. Archive extraction and Git recovery run locally. GitHub, prior Codex sessions, paid model services and Claude are optional after you have saved the downloads.

## What comes back

| Folder or file | Contents |
|---|---|
| `Project/` | All 3,175 files in the coordinated Account 18 lead, with LFS assets materialized |
| `Project/references/` | All eleven original screen artworks in their authored filenames and bytes |
| `Screen06_stills/` | Full-size originals and labeled gameplay comparison stills |
| `History/Rainbow.git/` | Restored offline Git mirror, branches, tag and LFS object store |
| `History/` | Verified refs, local working-copy ledgers, original staged indexes and packed Git metadata |
| `Inventory/` | Paths, sizes, SHA-256 checksums, source versions and exclusions |
| `Handoff/` | Older decision reports, media and model indexes, and a directly accessible Screen 06 editable scene |
| `Data/` and `Chunks/` | Original bytes shared by saved versions. The restore checks and reassembles large individual files |
| `Workspaces/`, `Saved-deliveries/` and `External-assets/` | Original file layout materialized with `--workspaces` |
| `Verification/` | Restore tests, actual gameplay results, artwork hashes and asset inspection |

The full restored Git graph passed `git fsck --full --strict` with zero unresolved reachable objects. Read `HANDOFF_FOR_CLAUDE.md` before choosing a branch. An archive name or passing test does not confer owner approval.

## Verification receipt

See `Verification/backup-verification.json` for the independent history check, the number of restored files and branch comparison. All 21 oversized originals were reassembled byte-for-byte from their numbered ZIPs. The archive has 50561 directly inventoried local file paths in addition to the Git version history.
