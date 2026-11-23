# Rainbow Unity – Screen 05 runbook (Agent 1)

Written 2026-11-23 against the **open** Editor of `C:\RainbowUnity\UnityProject` (Unity 6000.3.29f1, Unity CLI 1.0.1,
`com.unity.pipeline` 1.0.1). Every command marked **[ran]** was executed read-only by Agent 1 and its real output is
quoted. Commands marked **[help]** come from the live Editor's own `--help` / command catalog or the CLI's `--help`.
**[docs]** = the unity-cli skill docs. Nothing here was guessed.

> Command and flag names come from the project's Pipeline package, not from the CLI. This package spells its
> flags in **kebab-case** (`--output-path`, `--enabled`, `--interval-ms`, `--wait-id`). The older skill docs
> show `--save_path`, `--enable` – those do **not** exist in this Editor.

## 0. Session setup (PowerShell 5.1, paste once per terminal)

```powershell
$env:UNITY_NO_CONSENT_PROMPT='1'; $env:DO_NOT_TRACK='1'; $env:UNITY_NO_PAGER='1'
$u  = 'C:\Users\josia\AppData\Local\Unity\bin\unity.exe'
$pp = 'C:\RainbowUnity\UnityProject'
```

Three PowerShell 5.1 rules (all verified):
1. **Editor-command flags go after a `--` fence**; CLI flags (`--project-path`, `--timeout`, `--format`) go before it.
   `--timeout` before the fence = CLI wait (seconds); after it = the Editor command's own timeout. **[ran]**
2. **JSON arguments need `\"`**: `'{\"member\":\"X\",\"op\":\"equals\",\"value\":false}'`. Plain `'{"member":...}'`
   reaches the Editor as `{member:...}` and fails with *"--condition expects WaitConditionInput"*. **[ran, both forms]**
3. **C# only through `--file`** (inline quotes get mangled). `--file` accepts project-relative paths
   (`AgentScripts/x.cs`) and absolute paths anywhere. **[ran]**

The ready-made eval scripts are in `AgentScripts\` (copy to `C:\RainbowUnity\UnityProject\AgentScripts\`, outside
`Assets`, so writing them never triggers an import; or call them by absolute path from staging).

---

## 1. Driving the open Editor

### 1.1 Is the Editor connected?
```powershell
& $u status --until-ready --project-path $pp            # [ran] -> state ready, port 7800, 6000.3.29f1
& $u status --project-path $pp --format json             # machine form; read data.items[0].state
```
`--until-ready` waits up to 300 s (`--timeout <s>` changes it) **[help]**. Exit 6 + `STATUS_SAFE_MODE` = compile
errors (see 1.6); `STATUS_BLOCKED_BY_DIALOG*` = a dialog waits for the user.

### 1.2 Find commands
```powershell
& $u command --project-path $pp                          # [ran] 38 groups (capture, editor, editor.playmode, console, script, package, job, runtime ...)
& $u command capture --project-path $pp                  # [ran] list one group with its flags
& $u command --query screenshot --project-path $pp       # search CLI + plugins + this Editor's commands
& $u command capture game_view --help --project-path $pp # one command's parameters
```

### 1.3 Editor / play state (read-only)
```powershell
& $u command editor status --project-path $pp            # [ran] status: ready, compiling: false, playMode: stopped ...
& $u command console status --project-path $pp           # [ran] compilationFailed flag + error/warn counts
& $u command console get --project-path $pp -- --tail 50 --level error   # [help] errors + exceptions only
& $u command editor dialog --project-path $pp            # [docs] list an open modal dialog (answer: editor dialog answer <id> <button>)
```

### 1.4 Run C# in the Editor
```powershell
& $u command script eval --project-path $pp -- --file AgentScripts/screen05_status.cs              # [ran with a probe file]
& $u command script eval --project-path $pp -- --file AgentScripts/screen05_status.cs --dry-run true  # compile only
```
Script mode: top-level statements, `return x;` is the result, `await` allowed; `System`, `System.Linq`,
`UnityEngine`, `UnityEditor`, `Unity.Pipeline.Scripting` (`Wait.Until`) are pre-imported; project types
(`Rainbow.Screen05...`) are visible – **[ran]** returned `Assets/Rainbow/Scenes/Screen05.unity | 6000.3.29f1`.
Optional analytics labels from the skill: add `--caller plugin --skill unity-cli` before the fence.

Compile-check a whole C# file without loading it (how Agent 1 verified the Testing code – nothing runs):
```powershell
& $u command script run --project-path $pp -- --file <file.cs> --entry Some.Type.Method --dry-run true   # [ran]
```

### 1.5 Build the scene (coordinator's builder)
```powershell
& $u command script eval --project-path $pp --timeout 960 -- --file AgentScripts/screen05_build_scene.cs --timeout 900
```
Calls `Rainbow.Screen05.EditorTools.Screen05SceneBuilder.Build()` and returns one line per builder
(`OK -> root` / `MISSING` / `FAILED ...`). Menu equivalent: **Rainbow → Build Screen 05 Scene**. Not run by Agent 1
(it changes the scene).

### 1.6 Recompile and read compile errors (coordinator only)
```powershell
& $u recompile --project-path $pp                 # [help] triggers the recompile, waits (default 120 s), prints compile errors; --strict fails on warnings
& $u command console get --project-path $pp -- --tail 80 --level error
& $u command script recompile_status --project-path $pp   # [help] idle | triggered | compiling | completed | up_to_date
```
**Safe Mode** (Editor started with compile errors → Pipeline server off, `unity command` cannot connect) **[docs]**:
1. `& $u status --project-path $pp --format json` → `errors[0].code = STATUS_SAFE_MODE`,
   `data.items[0].safeMode.compileErrors[]` = `{file, line, column, code, message}`.
2. If `status` lists none: search `C:\RainbowUnity\UnityProject\Logs\Editor.log` (then
   `%LOCALAPPDATA%\Unity\Editor\Editor.log`) for `error CS` – read through a filter, never the whole file.
3. Fix the named `.cs` files (the one case where editing files by hand is right). The Editor recompiles and leaves
   Safe Mode on its own; `& $u status --until-ready --project-path $pp` waits for it.
4. If it was stopped at the **"Enter Safe Mode?"** prompt (`STATUS_BLOCKED_BY_DIALOG_SAFE_MODE`), the user chooses
   *Quit* or *Enter Safe Mode* – never answer it for them. Never kill Unity by name.

Fastest protection: integrate the Testing folder alone first – it compiles on its own (it reaches gameplay code only
by reflection) and was compile-checked with **0 errors, 0 warnings** against this Editor.

### 1.7 Play mode – start, prove it runs, stop
```powershell
& $u command editor status --project-path $pp                          # playMode must be "stopped" (else it is the user's session: read only)
& $u command editor set_auto_tick --project-path $pp                   # [help] defaults --enabled true --interval-ms 16 --persist true
& $u command editor.playmode start --project-path $pp                  # [help] turns Run In Background on for this session (--run-in-background true default)
& $u status --until-ready --project-path $pp
& $u command job wait --project-path $pp -- --condition '{\"member\":\"UnityEngine.Time.frameCount\",\"op\":\"changed\"}' --timeout 10
```
`state: met`, `framesObserved > 0` = the game advances (a `--condition` of this form **[ran]**: `state: met`).
`timedOut` = frozen at frame 1 → check `set_auto_tick`, a locked screen, the laptop lid.
```powershell
& $u command editor.playmode stop --project-path $pp
& $u command editor set_auto_tick --project-path $pp -- --enabled false    # skip if you keep driving the Editor
```
Pause/step a session you started: `& $u command editor.playmode pause --project-path $pp` (toggle) **[help]**.

---

## 2. Visual evidence: stills, series, recording

### 2.1 Phone-shaped Game view (do this once per Editor session)
```powershell
& $u command script eval --project-path $pp -- --file AgentScripts/screen05_gameview_1080x1920.cs
```
Uses `UnityEditor.PlayModeWindow.SetCustomRenderingResolution` (compile-verified on 6000.3.29f1). Menu: **Rainbow →
Capture → Set Game View 1080x1920**. Cinemachine frames for the Game view aspect, so keep it 9:16 for all evidence.

### 2.2 Agent 1 tools (Assets/Rainbow/Testing) – exact size, independent of window size/focus
| Goal | Command (all `& $u command script eval --project-path $pp -- --file AgentScripts/<file>`) | Mode |
|---|---|---|
| Still 864×1536 (approved size) | `screen05_still_864x1536.cs` → returns PNG path | Edit or Play |
| Still 1080×1920 | `screen05_still_1080x1920.cs` | Edit or Play |
| Approved vs capture sheet + numbers | `screen05_side_by_side_last.cs` → `<still>_vs_approved.png/.json` | any |
| Moving-view series (16 stills) | `screen05_series_default.cs` → `series_<time>\NN_<label>.png` + `index.json` | Play |
| 12 s gameplay clip, 30 fps | `screen05_record_gameplay.cs` → `gameplay_<time>.mp4` + `.json` + `_first.png` + `_last.png` | Play |
| Wait for series / clip to finish | add `--timeout 960` before the fence and `--timeout 900` after it: `screen05_wait_capture.cs` | Play |
| Status (read-only) | `screen05_status.cs` | any |
| Stop a running capture | `screen05_cancel.cs` | Play |
| Watch the autopilot live | `screen05_autopilot_toggle.cs` | Play |

Outputs go to `C:\RainbowUnity\UnityProject\Recordings\Screen05\` (already git-ignored). Same functions in
**Rainbow → Capture**. Direct C# (any eval file): `Rainbow.Screen05.EditorTools.Screen05Capture.CaptureStill(path, 864, 1536)`,
`.CaptureSeries(folder, float[] s, float[] worldX)`, `.CaptureDefaultSeries()`, `.RecordGameplay(mp4, 12f, 30)`,
`.IsBusy`, `.Status`, `.LastOutput`, `.Cancel()`, `Screen05SideBySide.Compose(png)`.

Waiting without an eval (alternative): the static property can be watched server-side –
```powershell
& $u command job wait --project-path $pp --timeout 660 -- --condition '{\"member\":\"Rainbow.Screen05.EditorTools.Screen05Capture.IsBusy\",\"op\":\"equals\",\"value\":false}' --timeout 600
```

How they work (details in README.md): stills render `Camera.main` through the SRP render-request API at the exact
size with URP post-processing forced on, then composite the Screen Space - Overlay HUD (URP never draws overlay UI
into a RenderTexture, so the HUD is rendered separately and matted in). The series teleports Benny with
`BennyController.Instance.TeleportTo(s, x)`, lets 10 frames settle, and records the real Benny/camera pose per still.
The clip sets `Time.captureFramerate = 30` (deterministic, smooth on the N150) and encodes every game frame with the
built-in `UnityEditor.Media.MediaEncoder` (no Recorder package needed).

### 2.3 Steering / jumps during automated capture
* **Autopilot (used by the clip):** `Screen05Autopilot` writes `SwimInputOverride.Active / Steer / JumpRequested`
  (CONTRACT). Program by course distance s: coin line (target x = `RiverPath.Meander(s + 3)`) → hard left s 18–23 →
  coin line (jump at s 26) → hard right s 30–35.5 → coin line (jump at s 44) → hard left s 51–55 → coin line to the finish.
* **Single key presses (Input System), e.g. manual tests:** **[help]**
  ```powershell
  & $u command runtime simulate_key --project-path $pp -- --key LeftArrow --action down
  & $u command runtime simulate_key --project-path $pp -- --key LeftArrow --action up
  & $u command runtime simulate_key --project-path $pp -- --key Space                  # press = down + up
  ```

### 2.4 Pipeline's own Game-view capture (what the Game window shows)
```powershell
& $u command capture game_view --project-path $pp -- --source screen --output-path Recordings/Screen05/gameview.png
& $u command capture game_view --project-path $pp -- --source camera --overlay false --width 864 --height 1536 --output-path Recordings/Screen05/camera_864.png
```
**[help]** `--source screen` = the Game view's own render target incl. HUD (needs an unlocked screen; set the Game
view to 9:16 first). `--source camera` with overlay UI renders at the Game view size and **stretches** to
width×height if the aspects differ – use `--overlay false` for an exact 3D-only frame, or Agent 1's stills.
`--output-path` is relative to the project root; without it the PNG comes back inline (base64 – large).

### 2.5 Evidence sequence (user's mandatory visual tests)
```powershell
& $u command script eval --project-path $pp -- --file AgentScripts/screen05_gameview_1080x1920.cs
& $u command editor set_auto_tick --project-path $pp
& $u command editor.playmode start --project-path $pp
& $u status --until-ready --project-path $pp
& $u command job wait --project-path $pp -- --condition '{\"member\":\"UnityEngine.Time.frameCount\",\"op\":\"changed\"}' --timeout 10
& $u command script eval --project-path $pp -- --file AgentScripts/screen05_status.cs          # hooks must all say ok
& $u command script eval --project-path $pp -- --file AgentScripts/screen05_still_864x1536.cs  # (Benny is at StartS right after Play)
& $u command script eval --project-path $pp -- --file AgentScripts/screen05_side_by_side_last.cs
& $u command script eval --project-path $pp -- --file AgentScripts/screen05_series_default.cs
& $u command script eval --project-path $pp --timeout 960 -- --file AgentScripts/screen05_wait_capture.cs --timeout 900
& $u command script eval --project-path $pp -- --file AgentScripts/screen05_record_gameplay.cs
& $u command script eval --project-path $pp --timeout 960 -- --file AgentScripts/screen05_wait_capture.cs --timeout 900
& $u command console get --project-path $pp -- --tail 50 --level error
& $u command editor.playmode stop --project-path $pp
```
Then look at the PNGs/MP4 with the Read tool (PNG) or a player (MP4; check it plays upright – if not, record with
`RecordGameplay(null, 12f, 30, 864, 1536, true, true)`), and write the explicit list of differences. Never state a
likeness percentage; the side-by-side JSON numbers are pixel statistics only.

---

## 3. Packages (verified 2026-11-23)

| Package | State | Evidence |
|---|---|---|
| `com.unity.cloud.gltfast` | **6.21.0 installed** | manifest + `package search` **[ran]** |
| `com.unity.inputsystem` | **1.20.1 installed** | manifest + `package search` **[ran]** |
| `com.unity.recorder` | not installed; registry version for this Editor **5.1.8** | `package search` **[ran]** |
| URP 17.3.0, Cinemachine 3.1.7, Splines 2.9.2, uGUI 2.0.0, Pipeline 1.0.1 | installed | manifest |

Nothing needs adding for Screen 05: the recording uses the built-in `MediaEncoder`. If the Recorder is wanted later
(coordinator decides; never during Play mode – a domain reload follows):
```powershell
& $u command package add --project-path $pp -- --name com.unity.recorder@5.1.8 --dry-run true      # [ran] plan: Add package 'com.unity.recorder' @ 5.1.8 [Registry]
& $u command package add --project-path $pp -- --name com.unity.recorder@5.1.8 --confirm true --wait true
& $u command package status --project-path $pp
& $u command script recompile_status --project-path $pp
```
Same pattern for any package (`--name com.unity.cloud.gltfast@6.21.0`, `--name com.unity.inputsystem@1.20.1`).
`package add` refuses without `--confirm true` **[help]**. Fallback outside the Editor: `unity-package-management` skill.

---

## 4. Android (not installed – needs the user's OK and disk space)

Exact module plan from the CLI (read-only dry run) **[ran]**:
```powershell
& $u install 6000.3.29f1 -m android --child-modules --dry-run --format json --non-interactive
```
| Module id | Download |
|---|---|
| `android` (Android Build Support) | 1,553 MB |
| `android-ndk-r27c` (NDK r27c) | 782 MB |
| `android-sdk-command-line-tools-21.0` | 152 MB |
| `android-open-jdk-17.0.21+9` (OpenJDK 17) | 115 MB |
| `android-sdk-platforms-34 / 35 / 36 / 37.0` | 63 + 64 + 66 + 67 MB |
| `android-sdk-build-tools-36.0.0` | 59 MB |
| `cmake-3.22.1` | 16 MB |
| `android-sdk-platform-tools-37.0.1` | 8 MB |
| **Total download** | **2,946 MB** |

Installed size: the release feed (`unity editors info 6000.3.29f1`) reports **6.9 GB installed for `android`**; it gives
no installed size for the child modules (NDK/SDK unpack larger than they download). Budget **≥ 10 GB free on C:**
(downloads + unpack). C: has **10.2 GB free** now → free space first (DISK_REPORT.md).

Install command (only after the user agrees; the Windows elevation prompt is the user's):
```powershell
& $u install-modules --editor-version 6000.3.29f1 -m android --child-modules --accept-eula
```
(`unity install-modules --list` and `unity modules 6000.3.29f1` return **nothing** for this Editor because it was
installed by the standalone installer without module metadata; the `install --dry-run` form above works.)

Existing tools on the laptop **[ran]**:
* `%LOCALAPPDATA%\Android\Sdk` (1.7 GB): build-tools 35.0.0 + **36.0.0**, platforms **android-36, android-37.0**,
  platform-tools, emulator (1.0 GB), sources; **no NDK, no cmdline-tools**.
* JDK: `C:\Users\josia\.jdks\ms-17.0.20.1` (Microsoft OpenJDK 17, 0.29 GB). `JAVA_HOME`/`ANDROID_HOME` unset; no
  `java`/`adb` on PATH; `C:\Program Files\Android` is empty (no Android Studio); `%USERPROFILE%\.gradle` 0.15 GB.
* Verdict: the existing SDK + JDK could replace only ~0.6 GB of the 2.9 GB download (SDK parts + JDK). The NDK
  r27c (required for IL2CPP / ARM64) and the 1.55 GB Android Build Support module are needed anyway, and the existing
  SDK lacks `cmdline-tools` (Unity uses it for licences/updates). Recommended: install the full module set above.
  Optional saving (advanced): install `-m android -m android-ndk-r27c` only and point **Preferences → External
  Tools** to `%LOCALAPPDATA%\Android\Sdk` and `C:\Users\josia\.jdks\ms-17.0.20.1` – Unity warns about non-bundled
  JDK/SDK, and the SDK would still need cmdline-tools.

---

## 5. Git (already set up by the coordinator – current state verified from `.git` files, git not run)

* Portable Git (user-approved) at `C:\Users\josia\PortableGit`: `cmd\git.exe`, `ucrt64\bin\git-lfs.exe`,
  `ucrt64\bin\git-credential-manager.exe`; system gitconfig uses GCM as credential helper.
* Repo `C:\RainbowUnity` (no 22 GB clone), branch **`unity/screen05-dev`**, `origin` =
  `https://github.com/josiahscalia5-dev/rainbow-.git`; local and `origin/unity/screen05-dev` both at
  **`ab69920`** (4 commits, last "Handoff: usage limit reached, specialists to relaunch"). Author "Rainbow Unity"
  (noreply e-mail).
* `.gitignore` already keeps out `UnityProject/Library, Temp, Obj, Build(s), Logs, UserSettings, MemoryCaptures,
  Recordings`, IDE files, `*.ulf/*.alf` licences, `.env/*.pem/*.key`. `.gitattributes`: LFS for
  `*.blend *.glb *.ply *.spz *.fbx *.hdr *.exr *.ktx2 *.psd *.mp4 *.webm *.mov *.apk *.aab *.zip`; PNG/JPG stay plain
  binary (approved reference byte-identical). Matches the brief. Suggestion: keep evidence clips you want on GitHub
  outside `Recordings/` (e.g. `C:\RainbowUnity\evidence\`), they then go through LFS automatically.

Daily commands (coordinator):
```powershell
$g = 'C:\Users\josia\PortableGit\cmd\git.exe'
& $g -C C:\RainbowUnity status --short
& $g -C C:\RainbowUnity add -A
& $g -C C:\RainbowUnity commit -m "Screen 05: integrate specialists"
& $g -C C:\RainbowUnity lfs ls-files                    # *.glb / *.mp4 must be listed here
& $g -C C:\RainbowUnity ls-files UnityProject/Library   # must print nothing
& $g -C C:\RainbowUnity push origin unity/screen05-dev   # first push opens the GCM browser sign-in for the user
```
From scratch (reference only – already done): `git init` in `C:\RainbowUnity`, `git lfs install --local`,
`git remote add origin https://github.com/josiahscalia5-dev/rainbow-.git`, `git checkout --orphan unity/screen05-dev`,
add `.gitignore`/`.gitattributes`, commit, `git push -u origin unity/screen05-dev` (no fetch of the big repo is needed
for an orphan branch). Original brief item "winget Git.Git" is superseded: Git is already present per-user, no admin.
