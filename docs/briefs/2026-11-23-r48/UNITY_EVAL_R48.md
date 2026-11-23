# Round 48 (2026-11-23) — Unity evaluation: user's order (verbatim) + requirement check

## User's order (verbatim)
> I want to evaluate Unity as the engine for my Rainbow game because matching my approved screen is my priority.
>
> First verify that we have access to a suitable computer running Unity Editor, and that you can control it through Unity's official agent
> plugin, Unity CLI and Pipeline package. Report any missing requirement clearly.
>
> Create a separate Unity 6.3 LTS project using URP. Reuse my existing Benny and environment models wherever they import correctly.
>
> Build one short playable Screen 05 section using my attached approved image as the visual specification. Prioritize the camera and river
> layout, rounded gold fittings, purple drum, flowing cyan/pink water, soft Benny shading and his contact with the water.
>
> Include forward movement, left/right steering, a jump, coin collection and a readable ending.
>
> Show the actual game at the same portrait proportions as the reference, then provide an Android build and a continuous gameplay recording.
> Explain the remaining visual differences and report device performance only when measured.
>
> Keep my existing game saved while we evaluate this version. Use existing assets and free tools for this first test.

(No new image arrived with this message; the approved Screen 05 = `references/05_flow_into_the_current.png`, 864 x 1536, unchanged.)

## Requirement check (session 2026-11-23 ~10:30 UTC, cloud session, branch `ccr-6deca498-03lhkc`)
| requirement | status | evidence |
|---|---|---|
| a computer running Unity Editor that this session can control | **MISSING** | no computer attached (Remote Control folders: none listed); this cloud container = Ubuntu 24.04, 4 CPU, 15 GB RAM, 34 GB free, **no GPU (/dev/dri absent), no KVM**, no Unity Editor |
| Unity 6.3 LTS Editor | not installed anywhere reachable | `unity releases --lts`: newest 6.3 LTS = **6000.3.29f1** (Linux build available) |
| Unity sign-in + license | **MISSING** | `unity auth status`: signed out; `unity license status`: none active. Personal license = `unity auth login` (the user's own browser sign-in) then `unity license activate --personal --accept-eula`; service accounts cannot activate licenses; no-browser paths need a Pro/Plus serial, a floating server or an offline .ulf. Unity's CLI 1.0 post: the **Build Server license** "covers agents and automation… run agents on a headless Editor or in a container" (paid) |
| Unity CLI | **AVAILABLE** (container) | installed with Unity's official installer: `unity` 1.0.1 in `~/.local/bin`; lists releases; skills `unity-cli` + `new-unity-project` loaded. Needs installing on the user's computer too |
| Unity's official agent plugin for Claude Code | available, **NOT ENABLED** | Anthropic plugin directory: "Unity" by Unity Technologies (partner); not enabled on the account. `unity setup claude` also installs it |
| Pipeline package `com.unity.pipeline` | **blocked** | needs a running Unity 6.0+ Editor with the project open (`unity pipeline install`); none exists yet |
| live Editor for building the scene + capturing the game | **blocked here** | Unity's skill: build scenes in a LIVE Editor; batch mode is a fallback that "can't see what it produced". Unity: a supported Linux containerized Editor is "coming soon"; this container has no GPU |
| Android build | possible once an Editor exists | `unity install 6000.3.29f1 -m android` (Android SDK/NDK/OpenJDK modules) |
| Android device for measured performance | **MISSING** | no device attached; no KVM for an emulator here → no performance numbers will be reported |
| network to Unity | OK | unity.com, public-cdn.cloud.unity3d.com, packages.unity.com, services.api.unity.com reachable |
| existing game kept saved | OK | five-minute autosave `AUTOSAVE OK … (match)`; nothing in the existing game changed |

Candidate models for the Unity import (glTF 2.0 via the free glTFast package): `assets/models/benny31.glb` (approved Benny 31), `assets/models/lids05.glb`
(Screen 05 gold paddles), `public/world/a05/scene.glb` (round-45 Screen 05 world area), `qa/pilot05/wave6/camera_lock/screen05_layout.glb`; the
round-47 modular parts (`tools/mod05/`) can be exported as GLB from three.js or rebuilt in Blender.

## Next step (waiting for the user)
Recommended free route: the user's own computer (Windows 10 21H1+ / macOS 14+ / Ubuntu 22.04+, with a GPU, ~20 GB free) runs Claude Code
(Desktop app, or `claude remote-control` in a folder) with the Unity CLI (`curl -fsSL https://unity.com/install.sh | bash`, or
`irm https://unity.com/install.ps1 | iex` on Windows), the user's own Unity sign-in (`unity auth login`) + free Personal license, Unity
6000.3.29f1 with Android support, and Unity's Claude Code plugin (`unity setup claude`). Then: separate project (outside the existing game's
folders), URP, glTFast, Screen 05 section, captures at 412 x 915 / 864 x 1536 proportions, APK, continuous recording.

## Update 2026-11-23 ~10:50 UTC
* User: Unity plugin installed on the account (the `unity:*` skills load in this cloud session); Unity Editor NOT installed on the Windows laptop
  `LAPTOP-7BA6G3BC`. The laptop's Remote Control folder "claude yes" is still `not_available` to cloud sessions (cause not reported by the laptop),
  so this cloud session cannot check or drive the laptop yet.
* Windows install, measured with `unity install 6000.3.29f1 --dry-run --operating-system windows -m android` (Unity CLI 1.0.1):
  Editor 6000.3.29f1 = 4.2 GB download; Android Build Support 1.55 GB + OpenJDK 17.0.21 + Android NDK r27c + CMake 3.22.1 + SDK build-tools 36,
  platform-tools 37.0.1, platforms 34 / 35 / 36 / 37, command-line tools 21.0 ("Android SDK & NDK Tools"); total download 7.15 GB.
* Order of work (user, binding): install Hub + free Personal license + 6.3 LTS with Android -> verify the Unity plugin / CLI talks to the real Editor
  (`unity status` ready, `unity command` lists Editor commands via com.unity.pipeline) -> separate Screen 05 test project from the approved picture,
  existing assets reused, current game unchanged. NO rebuild of the whole game before the connection is verified and a playable 05 test succeeds.
