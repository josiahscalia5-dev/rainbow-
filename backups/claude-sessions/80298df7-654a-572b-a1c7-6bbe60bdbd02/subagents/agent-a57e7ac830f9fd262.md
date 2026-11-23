# Subagent agent-a57e7ac830f9fd262 — session 80298df7-654a-572b-a1c7-6bbe60bdbd02

### 🧑 User — 2026-11-23T10:26:30.980Z

Read these official Unity pages and answer precisely, quoting short phrases where useful:
1) https://unity.com/the-unity-cli-1.0-is-here
2) https://unity.com/blog/meet-the-unity-cli
3) https://docs.unity.com/en-us/unity-cli/release-notes/2026/november
Questions:
a) How is the Unity CLI installed on Linux (exact package repo / .deb URL or install command)? Which OS/versions are supported?
b) How does authentication / licensing work for the CLI and for an Editor it installs on a headless or CI machine (Unity ID sign-in, service accounts, license activation for Personal vs Pro)? What exact credentials are needed?
c) What is the "Pipeline package" (com.unity.pipeline): what does it do, how is it added, and how does an agent use it (e.g. builds, running the Editor in batch mode, live commands)?
d) Is a headless Linux container Editor supported today, or still "coming soon"? Any statement about running the Editor without a GPU?
e) Does the CLI install Android build support modules (and which flag), and Unity 6.3 LTS version string if mentioned?
f) Anything about Claude Code / agent plugin / MCP integration.
Report facts only, with the page each came from.

### 🤖 Claude — 2026-11-23T10:26:32.595Z

> 🔧 **WebFetch** `{"url": "https://unity.com/the-unity-cli-1.0-is-here", "prompt": "Extract every fact relevant to: Linux installation (exact package repo, .deb URL, or install command; supported OS/versions), authentication/licensing (Unity ID, service accounts, license activation for Personal vs Pro, credentials for headless/CI), the \"Pipeline package\" (com.unity.pipeline) and how agents use it, headless Linux/container Editor support or \"coming soon\" status, GPU-less running, Android build support modules and flags, Unity 6.3 LTS version strings, and Claude Code / agent plugin / MCP integration. Quote sh …[+84 chars]`

### 🧑 User — 2026-11-23T10:26:33.003Z

> ↩︎ result: Fetched https://unity.com/the-unity-cli-1.0-is-here from a non-preapproved source (HTTP 200 OK, text/html, 14207 characters).
> <fetched-web-content>
> Unity CLI 1.0 is here
> 
> [](/)
> 
> *   [Games](/games)
> *   [Industry](/industry)
> *   [Resources](/resources)
> *   [Community](/community)
> *   [Learning](https://learn.unity.com/)
> *   [Support](/support-services)
> *   [Pricing](/products)
> 
> Develop
> 
> [Unity EngineBuild 2D and 3D games for any platform](/products/unity-engine)[CollaborationCollaborate and iterate quickly with your team](/features/collaboration)
> 
> [Download Unity](/download)[Plans and pricing](/products)
> 
> Deploy
> 
> [MultiplatformDiscover 25+ platforms Unity supports](/features/multiplatform)[LiveOpsPost-launch insights and live game ops](/features/liveops)
> 
> Grow
> 
> [User acquisitionGet discovered and acquire mobile users](/solutions/user-acquisition)[In-App PurchaseManage IAP across stores and D2C](/products/iap)[MonetizationConnect players with the right games](/solutions/app-monetization)
> 
> [Advertise with Unity](https://cloud.unity.com/acquire)[Monetize with Unity](https://cloud.unity.com/home/products?query=Monetization)
> 
> Use cases
> 
> [Mobile GamesBuild & grow mobile hits with Unity](/ …[+13178 chars]

### 🤖 Claude — 2026-11-23T10:26:33.355Z

> 🔧 **WebFetch** `{"url": "https://unity.com/blog/meet-the-unity-cli", "prompt": "Extract every fact relevant to: Linux installation (exact package repo, .deb URL, or install command; supported OS/versions), authentication/licensing (Unity ID, service accounts, license activation for Personal vs Pro, credentials for headless/CI), the \"Pipeline package\" (com.unity.pipeline) and how agents use it, headless Linux/container Editor support or \"coming soon\" status, GPU-less running, Android build support modules and flags, Unity 6.3 LTS version strings, and Claude Code / agent plugin / MCP integration. Quote shor …[+82 chars]`

### 🧑 User — 2026-11-23T10:26:33.518Z

> ↩︎ result: Fetched https://unity.com/blog/meet-the-unity-cli from a non-preapproved source (HTTP 200 OK, text/html, 20251 characters).
> <fetched-web-content>
> Meet the Unity CLI: manage Unity from your terminal
> 
> [](/)
> 
> *   [Games](/games)
> *   [Industry](/industry)
> *   [Resources](/resources)
> *   [Community](/community)
> *   [Learning](https://learn.unity.com/)
> *   [Support](/support-services)
> *   [Pricing](/products)
> 
> Develop
> 
> [Unity EngineBuild 2D and 3D games for any platform](/products/unity-engine)[CollaborationCollaborate and iterate quickly with your team](/features/collaboration)
> 
> [Download Unity](/download)[Plans and pricing](/products)
> 
> Deploy
> 
> [MultiplatformDiscover 25+ platforms Unity supports](/features/multiplatform)[LiveOpsPost-launch insights and live game ops](/features/liveops)
> 
> Grow
> 
> [User acquisitionGet discovered and acquire mobile users](/solutions/user-acquisition)[In-App PurchaseManage IAP across stores and D2C](/products/iap)[MonetizationConnect players with the right games](/solutions/app-monetization)
> 
> [Advertise with Unity](https://cloud.unity.com/acquire)[Monetize with Unity](https://cloud.unity.com/home/products?query=Monetization)
> 
> Use cases
> 
> [Mobile GamesBuild & gr …[+19220 chars]

### 🤖 Claude — 2026-11-23T10:26:34.090Z

> 🔧 **WebFetch** `{"url": "https://docs.unity.com/en-us/unity-cli/release-notes/2026/november", "prompt": "Extract every fact relevant to: Linux installation (exact package repo, .deb URL, or install command; supported OS/versions), authentication/licensing (Unity ID, service accounts, license activation for Personal vs Pro, credentials for headless/CI), the \"Pipeline package\" (com.unity.pipeline) and how agents use it, headless Linux/container Editor support or \"coming soon\" status, GPU-less running, Android build support modules and flags, Unity 6.3 LTS version strings, and Claude Code / agent plugin / MC …[+107 chars]`

### 🧑 User — 2026-11-23T10:26:50.143Z

> ↩︎ result: Fetched https://docs.unity.com/en-us/unity-cli/release-notes/2026/november (HTTP 200 OK, text/html, 135511 characters, truncated to the first 39925, then a model-extracted summary of the rest).
> <fetched-web-content>
> Unity CLI release notes for November 2026 • Unity command-line interface (CLI)
> 
> [
> 
> Documentation
> 
> ](/en-us)
> 
> Development
> 
> User Acquisition
> 
> Monetization
> 
> Industry
> 
> Development
> 
> User Acquisition
> 
> Monetization
> 
> Industry
> 
> ### Unity command-line interface (CLI)
> 
> [
> 
> ### Unity Pipeline
> 
> ](/en-us/unity-production-pipeline)[
> 
> ### Unity Hub
> 
> ](/en-us/hub)
> 
> [Download Unity Hub](https://unity.com/download)
> 
> ### Unity command-line interface (CLI)
> 
> 
> 
> 
> 
> Unity command-line interface (CLI)
> 
> *   [Introduction to the Unity CLI](/en-us/unity-cli/unity-cli)
>     
> *   [Use the Unity CLI](/en-us/unity-cli/use-unity-cli)
>     
> *   [Unity CLI reference](/en-us/unity-cli/reference)
>     
> *   [Replace MCP Server with Unity CLI](/en-us/unity-cli/replace-mcp-server-unity-cli)
>     
> *   [Install Pipeline package](/en-us/unity-cli/unity-pipeline/unity-pipeline-package)
>     
> *   [Command naming conventions](/en-us/unity-cli/command-name-conventions)
>     
> *   [Unity CLI plugins](/en-us/unity-cli/unity-cli …[+43796 chars]

### 🤖 Claude — 2026-11-23T10:26:54.176Z

> 🔧 **WebFetch** `{"url": "https://docs.unity.com/en-us/unity-cli/use-unity-cli", "prompt": "Extract verbatim-short quotes and exact commands for: Linux installation (APT repo URL, .deb, install script, supported distros/versions), supported OS list, authentication (unity auth login, service accounts, environment variables such as UNITY_CLOUD_PROJECT or token variables, CI setup), licensing (Unity ID, Personal vs Pro, license activation, Build Server license), headless/container Editor status, GPU/graphics notes, Android module install flags (unity install ... -m android), and Unity 6.3 LTS version strings. Say …[+37 chars]`

### 🧑 User — 2026-11-23T10:26:54.458Z

> ↩︎ result: Fetched https://docs.unity.com/en-us/unity-cli/use-unity-cli (HTTP 200 OK, text/html, 22749 characters).
> <fetched-web-content>
> Use the Unity command-line interface (CLI) • Unity command-line interface (CLI)
> 
> [
> 
> Documentation
> 
> ](/en-us)
> 
> Development
> 
> User Acquisition
> 
> Monetization
> 
> Industry
> 
> Development
> 
> User Acquisition
> 
> Monetization
> 
> Industry
> 
> ### Unity command-line interface (CLI)
> 
> [
> 
> ### Unity Pipeline
> 
> ](/en-us/unity-production-pipeline)[
> 
> ### Unity Hub
> 
> ](/en-us/hub)
> 
> [Download Unity Hub](https://unity.com/download)
> 
> ### Unity command-line interface (CLI)
> 
> 
> 
> 
> 
> Unity command-line interface (CLI)
> 
> *   [Introduction to the Unity CLI](/en-us/unity-cli/unity-cli)
>     
> *   [Use the Unity CLI](/en-us/unity-cli/use-unity-cli)
>     
> *   [Unity CLI reference](/en-us/unity-cli/reference)
>     
> *   [Replace MCP Server with Unity CLI](/en-us/unity-cli/replace-mcp-server-unity-cli)
>     
> *   [Install Pipeline package](/en-us/unity-cli/unity-pipeline/unity-pipeline-package)
>     
> *   [Command naming conventions](/en-us/unity-cli/command-name-conventions)
>     
> *   [Unity CLI plugins](/en-us/unity-cli/unity-cli-plugins)
>     
> *   [Unity CLI data collection and privacy](/en-us/unity-cli/data-collect …[+21699 chars]

### 🤖 Claude — 2026-11-23T10:26:55.076Z

> 🔧 **WebFetch** `{"url": "https://docs.unity.com/en-us/unity-cli/unity-pipeline/unity-pipeline-package", "prompt": "Extract exact facts about the Pipeline package (com.unity.pipeline): what it does, supported Unity versions, how it is added (unity pipeline install, or Package Manager steps and any git/registry URL), how agents use it (unity command, eval, batch mode, builds), localhost/security token details, and any mention of headless, container, or GPU. Quote short exact phrases and say explicitly when a topic is absent."}`

### 🧑 User — 2026-11-23T10:26:55.229Z

> ↩︎ result: Fetched https://docs.unity.com/en-us/unity-cli/unity-pipeline/unity-pipeline-package (HTTP 200 OK, text/html, 5436 characters).
> <fetched-web-content>
> Unity Pipeline package • Unity command-line interface (CLI)
> 
> [
> 
> Documentation
> 
> ](/en-us)
> 
> Development
> 
> User Acquisition
> 
> Monetization
> 
> Industry
> 
> Development
> 
> User Acquisition
> 
> Monetization
> 
> Industry
> 
> ### Unity command-line interface (CLI)
> 
> [
> 
> ### Unity Pipeline
> 
> ](/en-us/unity-production-pipeline)[
> 
> ### Unity Hub
> 
> ](/en-us/hub)
> 
> [Download Unity Hub](https://unity.com/download)
> 
> ### Unity command-line interface (CLI)
> 
> 
> 
> 
> 
> Unity command-line interface (CLI)
> 
> *   [Introduction to the Unity CLI](/en-us/unity-cli/unity-cli)
>     
> *   [Use the Unity CLI](/en-us/unity-cli/use-unity-cli)
>     
> *   [Unity CLI reference](/en-us/unity-cli/reference)
>     
> *   [Replace MCP Server with Unity CLI](/en-us/unity-cli/replace-mcp-server-unity-cli)
>     
> *   [Install Pipeline package](/en-us/unity-cli/unity-pipeline/unity-pipeline-package)
>     
> *   [Command naming conventions](/en-us/unity-cli/command-name-conventions)
>     
> *   [Unity CLI plugins](/en-us/unity-cli/unity-cli-plugins)
>     
> *   [Unity CLI data collection and privacy](/en-us/unity-cli/data-coll …[+4409 chars]

### 🤖 Claude — 2026-11-23T10:27:11.886Z

Sources: P1 = https://unity.com/the-unity-cli-1.0-is-here (Nov 17, 2026 post), P2 = https://unity.com/blog/meet-the-unity-cli (Jul 20, 2026 post), P3 = https://docs.unity.com/en-us/unity-cli/release-notes/2026/november (release notes; the tail of this page was a model summary, so facts from that part are marked). I also read two pages linked from these: D1 = https://docs.unity.com/en-us/unity-cli/use-unity-cli and D2 = https://docs.unity.com/en-us/unity-cli/unity-pipeline/unity-pipeline-package.

**a) Linux install and supported systems**
- Install script (D1): `curl -fsSL https://unity.com/install.sh | bash`. On Linux it installs to `~/.local/bin/unity`. D1 calls this "the recommended way."
- Install script in P2 (July, older): `curl -fsSL https://public-cdn.cloud.unity3d.com/hub/prod/cli/install.sh | UNITY_CLI_CHANNEL=beta bash`. P2 also said apt/brew/winget support was "coming soon." P1 says the CLI is available "through Homebrew, winget and APT."
- APT (D1), Debian/Ubuntu:
  - Key: `curl -sL https://hub.unity3d.com/linux/keys/public | sudo gpg --dearmor -o /usr/share/keyrings/Unity_Technologies_ApS.gpg`
  - Source file `/etc/apt/sources.list.d/unity-cli.sources` with `Types: deb`, `URIs: https://hub.unity3d.com/linux/repos/deb`, `Suites: unstable` (beta; GA uses `stable`), `Components: main`, `Signed-By: /usr/share/keyrings/Unity_Technologies_ApS.gpg`
  - Then `sudo apt update && sudo apt install unity-cli`. The package installs the command as `unity`.
- RPM (D1), Fedora/RHEL: repo at `https://hub.unity3d.com/linux/repos/rpm/unstable` (gpgcheck on), then `sudo dnf install unity-cli`.
- Homebrew (D1): `brew install --cask unity-cli`. Linux casks need Homebrew 6.0 or later. Also available as AppImage and .deb/.rpm files.
- Supported OS (D1, "Compatibility"): Windows 10 21H1 or newer; "Linux RHEL 9 and Ubuntu 22.04 and later. Requires glibc 2.34 or newer. Debian 11, CentOS 8, Amazon Linux 2 aren't supported."; macOS 14 and newer.
- D1 says the CLI "can be installed on headless machines, such as CI workers and build agents."

**b) Authentication and licensing**
- Interactive: `unity auth login` "opens a browser-based sign-in flow" (D1). `unity auth status` checks sign-in.
- Service account for CI (D1): set `UNITY_SERVICE_ACCOUNT_ID` and `UNITY_SERVICE_ACCOUNT_SECRET` to the key ID and secret key. P2 says a headless build agent "authenticates with a service account via environment variables."
- Service accounts cannot create cloud projects (D1). `unity projects create` needs a signed-in user unless `--no-cloud` is passed.
- P3 (release notes, summary part): `UNITY_CLOUD_PROJECT` should be set to the project ID the token is for. Also `unity auth login --insecure-storage` exists (P3, verbatim part).
- P1 says the "Build Server license now covers agents and automation... one license per instance lets you run agents on a headless Editor or in a container."
- None of the pages I read mention Unity ID specifically, Personal vs Pro activation, or the exact license-activation steps for a headless Editor. P3 mentions `unity license return` returning "Assigned seats such as Unity Pro." Whether an Editor on a CI machine can be activated under a Personal license is not stated.

**c) Pipeline package (com.unity.pipeline)**
- P2: "lets a running Editor receive commands from the CLI entirely on your machine," and works "with Unity 6.0 LTS and newer." It is "experimental" per P2 (July). P1 says the CLI and Pipeline package "are out of beta."
- D2: "Control the Unity Editor through a local HTTP API to automate builds, tests, and development workflows." Prerequisites: Unity Editor 6.0 or later and the Unity CLI.
- Install (D2): close and reopen the terminal, open the project in the Editor, run `unity auth login`, then `unity pipeline install` ("targets the current directory or the running Editor instance"), wait for recompile, then `unity pipeline editors` to verify "Pipeline: Installed."
- Agent use (P2): `unity command` lists commands; `unity command <name>` runs one. `unity command eval "return Application.version;"` runs C# in the running Editor (Roslyn, main thread), "gated behind a security token." Custom commands use `[CliCommand]` and `[CliArg]`. `--runtime <player exec name>` targets a dev Player build; "localhost-only and off by default."
- `--project-path=<path>` selects one Editor when several are open (D2).
- P1: `unity build --target` "builds in the Editor that has the project open." `unity open --until-ready` waits until the Editor can take commands. `unity projects create` adds the Pipeline package to new projects.
- Batch mode: neither D2 nor P2 describes batch-mode Editor runs. P3 (verbatim part) says `unity assets import` and `unity open --batchmode` now work on Linux with no display.

**d) Headless or container Editor**
- P1: "Coming soon: the Linux containerized Editor, a supported headless Unity Editor in a Linux container, built for CI, build machines and agents." Its status is still "coming soon" as of P1.
- Headless use of the CLI itself is supported (D1, P2). The "Build Server license... on a headless Editor or in a container" wording in P1 is the only mention of container use.
- No page I read says whether the Editor runs without a GPU. The only related statement is the P3 `--batchmode` / no-display item above.

**e) Android modules and Unity 6.3 LTS**
- P2: `unity install 6000.2.10f1 -m android ios webgl` and `unity install 6000.2.10f1 -m android ios --accept-eula --yes`.
- D1: `unity install lts -m ios android webgl`, and `unity install-modules -e 6000.3.7f1 -m android ios`. `-m` takes module IDs.
- D1 example version: `unity install 6000.3.7f1`.
- P3 (summary part): fallback versions "Unity 6000.0.85f2 and 6000.3.28f1 LTS." No page says "6.3 LTS" literally; 6000.3.x is the 6.3 line.
- P3 (summary part): `unity editors module add` and `unity install-modules` exist. Android-specific `--android-*` flags exist, but the summary did not list them.
- No Android module ID list was found.

**f) Claude Code, agent plugins, MCP**
- P1: "official Unity plugins for Claude Code, Codex, Grok Build and Google Antigravity." Skills come from GitHub `Unity-Technologies/skills`.
- P1: `unity setup` "installs the official plugin for Claude Code, Codex, Grok Build or Google Antigravity." `unity skill install --all` and `unity skill sync` cover other agents. `unity setup all` installs skills.
- P3 (summary part): `unity mcp configure <client>` and `unity mcp configure --list` exist. `unity mcp --tools` and `--exclude-tools` filter commands. A docs page titled "Replace MCP Server with Unity CLI" exists (D1 link list) but was not read.
- P2: each registered command "maps onto the kind of tool a function-calling model or MCP server already knows how to invoke."
- P1 says the official plugin "gives the agent skills," including "building UI, setting up lighting or adding in-app purchases."

