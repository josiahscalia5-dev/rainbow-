# Disk report – drive C: (read-only scan, 2026-11-23)

C: **107.9 GB used, 10.2 GB free**. Measured with `robocopy /L` (list only) and `Get-ChildItem`; nothing was changed
or deleted. `pagefile.sys` is 7.66 GB (Windows-managed – leave it). Recycle Bin 0 GB, no `Windows.old`, Temp 0.04 GB,
OneDrive folder 4 files / 0 GB local. The 4.2 GB Unity installer (`%APPDATA%\UnityHub\downloads`) is **already gone**
(folder empty). `C:\Program Files\Unity\Hub\Editor\6000.6.0f1` is an empty leftover folder (0 bytes).

## 30 largest folders (GB; nested rows are part of their parent)
| # | GB | Folder | What it is | Free it? |
|---|---|---|---|---|
| 1 | 16.76 | `C:\Users\josia\Downloads` | 130 `.glb` models (10.9 GB, Meshy/Hi3D, 100–600 MB each), 35 `.zip` (3.05 GB), installers | **User decides** – biggest win |
| 2 | 16.35 | `C:\Users\josia\AppData` | app data total (rows below) | – |
| 3 | 7.82 | `C:\Program Files\Unity` | Unity Editor 6000.3.29f1 | Keep |
| 4 | 4.75 | `C:\Program Files (x86)\Microsoft` | Edge 1.15, EdgeCore 2.6, EdgeWebView 0.86 | Keep (system) |
| 5 | 4.37 | `C:\Program Files\Microsoft Office` | Office apps | User decides (uninstall in Settings only if unused) |
| 6 | 3.22 | `AppData\Local\Google\Chrome` | Chrome profiles (Profile 2 1.85, Default 0.99); caches ≈ 0.5 | Clear cache in Chrome settings (low risk) |
| 7 | 3.16 | `AppData\Roaming\Godot\app_userdata\Bubble Wash Kingdom` | Godot project user data | User decides |
| 8 | 1.95 | `C:\RainbowUnity` (Library 1.94) | this Unity project | Keep |
| 9 | 1.74 | `AppData\Local\Microsoft` | Office 0.64, OneDrive app 0.64, Edge 0.39 | Keep |
| 10 | 1.72 | `AppData\Local\Android\Sdk` | emulator 1.01, build-tools 0.27, platforms 0.22, sources 0.21 | Emulator + sources (1.2) not needed for Unity – user decides |
| 11 | 1.40 | `C:\Users\josia\.ai-game-dev` | AI game-dev tool runtime | User decides (if tool unused) |
| 12 | 1.28 | `C:\Users\josia\.cache\codex-runtimes` | Codex runtime cache | User decides (re-downloads) |
| 13 | 1.00 | `C:\Program Files\Google` | Chrome app | Keep |
| 14 | 0.95 | `C:\Users\josia\.codex` | Codex CLI data/plugins | User decides |
| 15 | 0.94 | `AppData\Local\Claude-Data` | Claude app data (Unity skills live here) | Keep |
| 16 | 0.81 | `C:\Users\josia\dyad-apps` | dyad projects (95k files, node_modules) | User decides |
| 17 | 0.81 | `AppData\Local\Packages` | Store-app data | Keep |
| 18 | 0.63 | `AppData\Local\OpenAI` | OpenAI app data | User decides |
| 19 | 0.63 | `AppData\Local\Unity` | Unity caches (bee 0.31, UPM cache 0.26) | Keep (rebuilds slowly) |
| 20 | 0.57 | `C:\ProgramData\josia\dyad` | dyad app 1.15.0 + packages | User decides |
| 21 | 0.56 | `C:\ProgramData\Microsoft` | Windows data | Keep |
| 22 | 0.53 | `C:\Program Files (x86)\Google` | Google updater | Keep |
| 23 | 0.50 | `C:\Users\josia\Documents` | documents | Keep |
| 24 | 0.52 | `ProgramData\GameMakerStudio2-LTS2026` (+ Roaming 0.10) | GameMaker | User decides |
| 25 | 0.41 | `C:\Users\josia\.gemini` | Gemini CLI data | User decides |
| 26 | 0.38 | `C:\Users\josia\PortableGit` | Git used by this project | Keep |
| 27 | 0.38 | `AppData\Roaming\UnityHub` | `Templates\com.unity.template.get-started-4.0.1.tgz` 0.32 (Hub not installed) | Low risk, re-downloadable |
| 28 | 0.64 | `AppData\Local\pnpm-cache` 0.37 + `pnpm` 0.27 | Node package caches | Low risk (`pnpm store prune`) |
| 29 | 0.65 | updater leftovers: `antigravity-updater` 0.31, `unityhub-updater` 0.17, `@verdentmain-updater` 0.17 | cached installers | Low risk if those apps are current/unused |
| 30 | 0.29 | `C:\Users\josia\.jdks\ms-17.0.20.1` | Microsoft OpenJDK 17 | Keep (usable for Android, see RUNBOOK §4) |

## Quick wins (user must approve every deletion – Agent 1 deleted nothing)
1. **Byte-identical duplicates in Downloads – 0.74 GB** (SHA-256 verified, keep one of each):
   `Birthday_Runner_Envir.glb` = two `Meshy_AI_Birthday_Runner_Envir_*.glb` (110 MB ×3);
   `bubble_wash_brush_plu.glb` = `Meshy_AI_bubble_wash_brush_plu_1103152833_texture.glb` (40 MB);
   `Hi3D_Stylized Magical Golden Water Wash Tunnel ..._171311.glb` = `Hi3D_Untitled_allparts_20261020_170122.glb` (144 MB);
   `right_cake_mountain_c.glb` = `Meshy_AI_right_cake_mountain_c_1031203403_image-to-3d-texture.glb` (199 MB);
   `Downloads\Rainbow_AI_Game_Developer_Handoff.zip` = the copy inside `Laundry_Loop_Approved_Images_Only\` (140 MB).
2. Old installer `Downloads\Godot_v4.7.2-stable_win64.exe` 0.17 GB.
3. Android emulator + sources 1.2 GB (Unity never uses them).
4. Chrome cache ≈ 0.5 GB, UnityHub template 0.32 GB, updater leftovers 0.65 GB, pnpm caches 0.64 GB.
5. Bigger, the user's call: Downloads models (up to ~14 GB), Godot user data 3.16 GB, unused AI tools (~4.5 GB), Office 4.37 GB.

Android Build Support needs ≥ 10 GB free (RUNBOOK §4): items 1–4 give ≈ 4 GB; one of the item-5 choices is needed too.
