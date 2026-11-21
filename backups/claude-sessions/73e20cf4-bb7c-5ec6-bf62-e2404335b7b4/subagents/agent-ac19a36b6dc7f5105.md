# Subagent agent-ac19a36b6dc7f5105 — session 73e20cf4-bb7c-5ec6-bf62-e2404335b7b4

### 🧑 User — 2026-11-21T14:27:33.991Z

Read https://ai-game.dev/ and every docs/pricing/terms/privacy/GitHub page it links to (follow links to its documentation, install guide, GitHub repo or npm package if any). I need concrete facts, each with its exact URL, and 'not stated' where absent: (1) What it actually is: an MCP server? a CLI? a desktop app? a cloud IDE? a Unity plugin? Which engines does it support (Unity, Godot, Three.js/web?) — quote exactly what it says about Three.js. (2) Can it open an EXISTING project (a Vite/TypeScript Three.js game, or a standalone HTML page that uses three.js 0.180 + the @sparkjsdev/spark Gaussian-splat renderer and .glb models), or does it only create new projects from its own templates? (3) How does it connect to Claude Code (MCP setup command? which tools/functions does the agent get — list them by name if a tool list is published: e.g. screenshot, scene graph inspection, read object transforms/materials, run game, send input/touch/keyboard events, playtest, record video)? (4) Does it run on Linux / headless (no display, software WebGL)? Does it require a browser extension, a desktop app, or its own cloud? (5) Pricing / free tier / credits; account required? (6) Privacy/terms: does it upload project code or assets to its servers, train on them, retention, ownership. (7) Is it open source (licence)? Also note who makes it and how new it is. Do not sign up or download anything.

### 🤖 Claude — 2026-11-21T14:27:35.223Z

> 🔧 **WebFetch** `{"url": "https://ai-game.dev/", "prompt": "Return the full page content as-is, including all links (their exact URLs and link text), headings, and any text about what the product is, supported engines (quote exactly anything about Three.js), MCP setup commands, tools/functions, platform requirements, pricing, accounts, privacy, terms, licence, and the company/author. Do not summarize away details."}`

### 🧑 User — 2026-11-21T14:27:35.681Z

> ↩︎ result: Fetched https://ai-game.dev/ from a non-preapproved source (HTTP 200 OK, text/markdown, 12908 characters).
> <fetched-web-content>
> # Free AI Game Developer
> 
> The home page of AI Game Developer (ai-game.dev): a free desktop app for Windows, macOS and Linux that builds, edits and playtests games in Unreal Engine, Unity, Godot, BRUTAL, Bevy and Three.js, and sets up the engine for you.
> 
> _Last updated: 2026-11-16_
> 
> [Desktop app Windows · macOS · Linux](https://ai-game.dev/download)
> 
> An AI agent that builds, edits and playtests your game live in Unity, Unreal Engine, Godot, BRUTAL, Bevy and Three.js. Describe what you want: it writes the code, changes the scene and checks the result in the running game.
> 
> [Get the desktop app Free · Windows · macOS · Linux](https://ai-game.dev/download) [Other platforms & CLI](https://ai-game.dev/download)
> 
> Unity 2022.3+ · Unreal Engine 5.5+ · Godot 4.3+ (.NET) · Windows, macOS, Linux
> 
> - Free forever with your own AI agent
> - Built-in AI models: 7-day Indie trial
> - Open-source engine plugins
> 
> The AI Game Developer desktop app building and playtesting a flying dropship in Unity.
> 
> Works with
> 
> - Unreal
> - Unity
> - Godot
> - BRUTAL
> - Bevy
> - Three.js
> 
> Real results
> 
> # …[+11860 chars]

### 🤖 Claude — 2026-11-21T14:27:39.300Z

> 🔧 **WebFetch** `{"url": "https://ai-game.dev/download", "prompt": "Return the full page content verbatim where possible: what the download is (desktop app, CLI, other), supported OS and architectures, any system requirements, whether an account/sign-in is needed, any browser extension requirement, GPU requirements, and every link (exact URL and text), including the CLI/installation and any npm or GitHub links. Quote anything about Three.js exactly."}`

### 🧑 User — 2026-11-21T14:27:39.388Z

> ↩︎ result: Fetched https://ai-game.dev/download from a non-preapproved source (HTTP 200 OK, text/markdown, 2907 characters).
> <fetched-web-content>
> # Download AI Game Developer — One app. Every engine.
> 
> Download the AI Game Developer desktop app or CLI — one AI pair-programmer for Unity, Unreal Engine, Godot, BRUTAL, Bevy and Three.js. Sign in with your subscription and it sets up the engine connection for you. Free for Windows, macOS and Linux.
> 
> _Last updated: 2026-11-16_
> 
> Your AI game developer for Unreal, Unity, Godot, BRUTAL, Bevy & Three.js. Pick how you like to work — both use the same account and set up the engine for you.
> 
> ## Desktop app (recommended)
> 
> For everyone. Chat with your engine in a window.
> 
> - Voice input, chat history and a live view of every tool call
> - Installs & connects the engine plugin for you
> - Usage, history & limits sync with your subscription
> - Auto-updates on launch
> 
> Every build is the same app, and each installer keeps itself up to date.
> 
> | OS | Build | Installer | Download |
> | --- | --- | --- | --- |
> | Windows | 64-bit | Signed .exe installer · x64 · auto-updates | https://ai-game.dev/download/win?arch=x64 |
> | macOS | Apple Silicon (M1–M4) | Native .dmg — recomm …[+1866 chars]

### 🤖 Claude — 2026-11-21T14:27:39.969Z

> 🔧 **WebFetch** `{"url": "https://ai-game.dev/pricing", "prompt": "Return the full pricing details verbatim: every plan name, price, included usage/credits/limits, which models are included per plan, trial terms, cancellation, taxes, what the Free plan includes, and any links to terms or FAQ. Note any 'not stated' items."}`

### 🧑 User — 2026-11-21T14:27:40.061Z

> ↩︎ result: Fetched https://ai-game.dev/pricing from a non-preapproved source (HTTP 200 OK, text/markdown, 5651 characters).
> <fetched-web-content>
> # Pricing — Simple, Transparent Pricing
> 
> Free forever with your own AI agent. Hosted AI when you need it. AI Game Developer has a Free plan — bring your own AI agent and pay your AI provider directly — and three paid plans (Indie, Studio, Studio Max) that add hosted, metered AI. Prices are in US dollars, monthly or billed annually.
> 
> _Last updated: 2026-10-17_
> 
> ## Plans
> 
> | Plan | Monthly billing | Annual billing | Summary |
> | --- | --- | --- | --- |
> | Free | $0 | — | Bring your own AI agent. Pay your AI provider directly. |
> | Indie (Most Popular) | $25/month | $24/month — $285/yr billed annually | Hosted AI for independent game developers. |
> | Studio | $99/month | $94/month — $1129/yr billed annually | More than 4× Indie’s allowance for larger projects. |
> | Studio Max | $199/month | $189/month — $2269/yr billed annually | More than 8× Indie’s allowance for heavy workloads. |
> 
> ### Free
> 
> Bring your own AI agent. Pay your AI provider directly.
> 
> - Unreal, Unity, Godot & Blender
> - Use DeepSeek or any model with your own AI agent
> - Music creation
> - Local i …[+4609 chars]

### 🤖 Claude — 2026-11-21T14:27:40.767Z

> 🔧 **WebFetch** `{"url": "https://ai-game.dev/trust", "prompt": "Return the full content verbatim where possible: data handling for source code, assets, prompts; what goes through the MCP relay; which providers receive files; training policy; retention periods; ownership of outputs; account data; any links to Privacy Policy or Terms of Service (exact URLs). Note explicitly anything not stated."}`

### 🧑 User — 2026-11-21T14:27:40.873Z

> ↩︎ result: Fetched https://ai-game.dev/trust from a non-preapproved source (HTTP 200 OK, text/markdown, 3526 characters).
> <fetched-web-content>
> # Trust & Security
> 
> What happens to your game project, prompts, payments and personal data with AI Game Developer, in plain words. The binding text is the Privacy Policy, Terms of Service and Refund Policy.
> 
> _Last updated: 2026-11-14_
> 
> ## Your project
> 
> - We do not collect or store your source code, project files, scenes or game assets through the MCP relay. Files you choose to submit for image, video, audio or 3D generation are the exception, handled as described in section 2.13 of the Privacy Policy.
> - The MCP relay routes tool calls between your AI agent and the editor without inspecting or storing their contents. It logs operational metadata only, such as which tool ran, when and how long it took.
> - Crash and error reports can name a file or folder, quote a short piece of text involved in the error and, for the CLI, list the packages in your package.json, but do not otherwise include a file’s contents. You can turn them off.
> 
> ## Your prompts and AI providers
> 
> - On the Free plan you bring your own AI agent: your prompts go straight to the AI provide …[+2472 chars]

### 🤖 Claude — 2026-11-21T14:27:41.403Z

> 🔧 **WebFetch** `{"url": "https://ai-game.dev/mcp-endpoint-info", "prompt": "Return verbatim: the MCP endpoint URL(s), transport type, authentication method, setup commands (exact text), any tool list with tool names, client config snippets, and whether a local app or cloud relay is required. Include every link with exact URL."}`

### 🧑 User — 2026-11-21T14:27:41.506Z

> ↩︎ result: Fetched https://ai-game.dev/mcp-endpoint-info from a non-preapproved source (HTTP 200 OK, text/markdown, 10239 characters).
> <fetched-web-content>
> # MCP Endpoint Info
> 
> The MCP endpoint page gives the connection details for pointing any MCP-compatible AI client at AI Game Developer: the hosted endpoint https://ai-game.dev/mcp (Streamable HTTP; OAuth 2.1 browser sign-in, project keys written by setup-mcp, or personal access tokens for CI) plus per-client config snippets.
> 
> _Last updated: 2026-11-04_
> 
> ## The fastest way: let setup-mcp write it
> 
> Every engine CLI writes the right config file for your client: the project-pinned URL plus a project key, so the client connects at once with nothing to sign in. Add --oauth for a URL-only config that signs in through the browser instead. The desktop app does the same when it sets up a project. Install guides: https://ai-game.dev/engines/unity, https://ai-game.dev/engines/unreal, https://ai-game.dev/engines/godot.
> 
> ```bash
> unity-mcp-cli setup-mcp claude-code ./MyUnityProject
> unreal-mcp-cli setup-mcp cursor --path ./MyUnrealProject
> godot-cli setup-mcp gemini ./MyGodotProject --oauth
> ```
> 
> ## Signing in
> 
> ### OAuth 2.1 — a browser sign-in, nothing to …[+8984 chars]

### 🤖 Claude — 2026-11-21T14:27:42.258Z

> 🔧 **WebFetch** `{"url": "https://ai-game.dev/docs/wiki/app/installation", "prompt": "Return verbatim: install steps, system requirements (OS, GPU, RAM, disk, Linux distro notes), whether a display/GUI or browser is needed, headless or CLI installation options, gamedev CLI install command text, sign-in requirements, and any mention of WebGL, software rendering, or browser extensions. Include exact URLs of links."}`

### 🧑 User — 2026-11-21T14:27:42.353Z

> ↩︎ result: Fetched https://ai-game.dev/docs/wiki/app/installation from a non-preapproved source (HTTP 200 OK, text/markdown, 5336 characters).
> <fetched-web-content>
> # Installation
> 
> Install the AI Game Dev desktop app on Windows, macOS or Linux, or the gamedev CLI with npm, and keep both up to date.
> 
> _Last updated: 2026-11-04_
> 
> This page shows how to install the AI Game Dev desktop app and the `gamedev` CLI, which builds exist for each operating system, and how updates work. Both are free to download; what the agent can do depends on your plan (see [Sign-in and account](https://ai-game.dev/docs/wiki/app/sign-in-and-account)).
> 
> ## Install the desktop app
> 
> Open [the download page](https://ai-game.dev/download). It detects your system and offers the matching build, and lists every build below the main button.
> 
> | Operating system | Build | Notes |
> | --- | --- | --- |
> | Windows | Signed `.exe` installer, x64 | Runs on Windows on ARM through emulation |
> | macOS, Apple silicon | Native `.dmg` for arm64 | Recommended for any M-series Mac |
> | macOS, Intel | `.dmg` for x64 | For Intel Macs |
> | Linux | AppImage and `.deb`, x86\_64 | No arm64 Linux build yet |
> 
> There is no universal macOS binary: pick the …[+4313 chars]

### 🤖 Claude — 2026-11-21T14:27:45.155Z

> 🔧 **WebFetch** `{"url": "https://ai-game.dev/docs/wiki/app/projects-and-engines", "prompt": "Return verbatim everything about Three.js specifically (quote exactly): how a Three.js project is created, whether an existing Three.js project can be opened, what files the app creates (templates, Vite, TypeScript, package manager), how the agent connects to the running game (browser, page, WebGL), and any requirements. Also any statement about existing projects for other engines. Include exact link URLs."}`

### 🧑 User — 2026-11-21T14:27:45.248Z

> ↩︎ result: Fetched https://ai-game.dev/docs/wiki/app/projects-and-engines from a non-preapproved source (HTTP 200 OK, text/markdown, 7279 characters).
> <fetched-web-content>
> # Projects and engines
> 
> Open or create a Unity, Unreal or Godot project in the AI Game Dev app, install the engine plugin, and let the agent open the editor when needed.
> 
> _Last updated: 2026-11-14_
> 
> Everything in the AI Game Dev app happens inside a project: a folder on your computer. When the folder is a Unity, Unreal Engine or Godot project, the app detects the engine, sets up the matching MCP plugin and connects the editor's tools to your chat. This page covers opening and creating projects in the desktop app and the CLI, plugin installation and updates, and how the agent works with the editor.
> 
> ## Supported engines
> 
> | Engine | Plugin | How the app recognises the project | Supported versions |
> | --- | --- | --- | --- |
> | Unity | [Unity MCP](https://ai-game.dev/docs/wiki/unity) | `ProjectSettings/ProjectVersion.txt`, or an `Assets/` folder with `Packages/manifest.json` | Unity 2022.3 LTS or newer |
> | Unreal Engine | [Unreal MCP](https://ai-game.dev/docs/wiki/unreal) | A `*.uproject` file in the folder | Unreal Engine 5.5 …[+6264 chars]

### 🤖 Claude — 2026-11-21T14:27:45.830Z

> 🔧 **WebFetch** `{"url": "https://ai-game.dev/legal/terms", "prompt": "Return verbatim the key clauses on: ownership of user content and outputs, licence granted to the company over user content, training use, data retention, account termination, governing law/entity, and any reference to the Privacy Policy URL (exact). Quote short phrases only; mark anything not stated as 'not stated'."}`

### 🤖 Claude — 2026-11-21T14:27:46.488Z

> 🔧 **WebFetch** `{"url": "https://ai-game.dev/docs/wiki/app/cli", "prompt": "Return the CLI command list verbatim (command names), and any mention of headless/no-display operation, browser, WebGL, software rendering, the list of agent tools or MCP tools by name (e.g. screenshot, console, input, playtest, video recording), and Three.js. Include exact URLs of relevant links."}`

### 🧑 User — 2026-11-21T14:27:46.578Z

> ↩︎ result: Fetched https://ai-game.dev/docs/wiki/app/cli from a non-preapproved source (HTTP 200 OK, text/markdown, 12706 characters).
> <fetched-web-content>
> # gamedev CLI reference
> 
> Every gamedev CLI command and option: interactive and headless modes, pkg, remote, daemon, acp, image-runtime, update, and the slash commands in the terminal.
> 
> _Last updated: 2026-11-04_
> 
> The `gamedev` CLI is the AI Game Dev agent in your terminal: the same account, models, packages and engine connection as the desktop app. This reference lists every command and option of the CLI, the slash commands you type inside it, and its exit codes. Install it with `npm install -g @baizor/gamedev` (see [Installation](https://ai-game.dev/docs/wiki/app/installation#cli)).
> 
> ## Usage at a glance
> 
> ```text
> gamedev [<project-dir>] [options]          interactive terminal UI
> gamedev --print "<prompt>"                 headless one-shot query, reply on stdout
> gamedev --print -                          headless, prompt read from stdin
> gamedev --headless                         headless, prompt read from stdin
> gamedev update                             upgrade the CLI to the latest version
> gamedev pkg <subcommand> [args]            manag …[+11675 chars]

### 🧑 User — 2026-11-21T14:27:50.426Z

> ↩︎ result: Fetched https://ai-game.dev/legal/terms from a non-preapproved source (HTTP 200 OK, text/markdown, 60179 characters, truncated to the first 39956, then a model-extracted summary of the rest).
> <fetched-web-content>
> # Terms of Service
> 
> The Terms of Service of AI Game Dev (ai-game.dev), converted to Markdown at build time from the published page https://ai-game.dev/legal/terms. The wording below is the page's own; the HTML page is the authoritative version.
> 
> Version 3.9 — Effective date: 16 December 2026 (version 3.8, effective 21 November 2026, applies until that date; version 3.6 applies before then)
> 
> This version updates Section 8 to match version 6.0 of our Refund & Cancellation Policy: outside the EU/EEA, the UK and Switzerland (and where we cannot tell your country, which keeps the current terms), which refunds you can get depends on your country. It applies to purchases made and free trials started on or after 16 December 2026; a purchase or trial before that date keeps the refund terms of the version in force when it was made. Until then, the earlier versions apply as stated above.
> 
> Version 3.8 added Sections 20.5 to 20.8 and a line in Section 5 about AI models that third part …[+40311 chars]

### 🤖 Claude — 2026-11-21T14:27:54.199Z

> 🔧 **WebFetch** `{"url": "https://ai-game.dev/legal/privacy", "prompt": "Return verbatim where possible: what data is collected and stored, whether project source code/assets go to servers, what the MCP relay logs, provider list and what each receives, retention periods, whether data is used for training, and section 2.13 on media generation. Quote short phrases only. Mark anything not stated as 'not stated'."}`

### 🧑 User — 2026-11-21T14:28:11.174Z

> ↩︎ result: Fetched https://ai-game.dev/legal/privacy from a non-preapproved source (HTTP 200 OK, text/markdown, 98984 characters, truncated to the first 39954, then a model-extracted summary of the rest).
> <fetched-web-content>
> # Privacy Policy
> 
> The Privacy Policy of AI Game Dev (ai-game.dev), converted to Markdown at build time from the published page https://ai-game.dev/legal/privacy. The wording below is the page's own; the HTML page is the authoritative version.
> 
> Version 3.10 — Effective date: 21 November 2026 (version 3.9, effective 20 November 2026, applies until that date; version 3.8 applies before then)
> 
> This version extends the product-usage analytics of the desktop app and command-line tool in Section 2.15. In addition to the usage events described in version 3.9, the app can record detailed activity events: what the AI agent in the app does (for example which tools it calls, whether a request succeeded and how long it took) and how you use the app (for example connecting to your engine, opening a project, and the screens and errors shown). These never include your prompts, the AI's answers to you, your files, file paths, project names or anything you type, with one exception: the A …[+44628 chars]

### 🤖 Claude — 2026-11-21T14:28:45.598Z

## AI Game Developer (ai-game.dev): facts from the pages

**Bottom line for a Three.js 0.180 + Spark project:** the pages I read say the product supports Three.js, but none of them describe how it works with an existing Three.js project, which tools the agent gets for Three.js, or whether it runs headless on Linux. Those are "not stated" below. The only Three.js-specific statements are marketing lines.

### (1) What it is, and engine support

- **Desktop app plus CLI, with a hosted MCP endpoint.** The download page offers a desktop app (Windows x64, macOS Apple silicon and Intel, Linux x86_64) and a CLI installed with `npm install -g @baizor/gamedev`. Source: https://ai-game.dev/download and https://ai-game.dev/docs/wiki/app/installation
- **Also an MCP server.** It is hosted at `https://ai-game.dev/mcp`, using Streamable HTTP. Source: https://ai-game.dev/mcp-endpoint-info
- **Engine plugins.** Unity, Unreal and Godot plugins are installed by the app or CLI, and they are the engines with an MCP tool count (72, 98 and 47). Source: https://ai-game.dev/docs/wiki/app/projects-and-engines
- **Not a cloud IDE.** Nothing I read describes a browser IDE. The homepage calls it "a free desktop app."
- **Three.js wording, exact:**
  - Homepage, "Six engines, one app": "plus BRUTAL, Bevy and Three.js, which the app creates, builds and runs for you."
  - FAQ: the app and CLI "also create and run BRUTAL (C#, .NET 10), Bevy (Rust; install Rust with rustup) and Three.js web games, and connect the agent to the running game."
  - Homepage step 2: "Pick a new or existing Unity, Unreal, Godot, BRUTAL, Bevy or Three.js project."
  - Sources: https://ai-game.dev/ and https://ai-game.dev/ FAQ section
- **Three.js is absent from the engine-specific docs.** The supported-engines table on https://ai-game.dev/docs/wiki/app/projects-and-engines lists only Unity, Unreal and Godot. Three.js has no install guide, no MCP setup command and no Three.js tool list in any page I read. Its Three.js page was not linked from the pages I read.

### (2) Existing project, or only new ones?

- **Existing projects are claimed, but not detailed.** The homepage says to pick "a new or existing" Three.js project. Nothing says whether a Vite/TypeScript project, or a standalone HTML page using three.js 0.180 and @sparkjsdev/spark with .glb models, is detected or supported.
- **Any folder can be opened.** The projects page says: "You can also open any other folder... The agent can then work with files, packages and tools, just without engine tools." Whether a Three.js folder counts as an "engine tools" case is not stated.
- **Create and open flows** (for Unity, Unreal and Godot only, per the same page): "Open folder…" in the app, or `gamedev /path/to/your/game` in the CLI.

### (3) How it connects to Claude Code

- **Command, from https://ai-game.dev/mcp-endpoint-info:** `claude mcp add --transport http ai-game-dev "https://ai-game.dev/mcp"`
- **Auth:** OAuth 2.1 browser sign-in. A personal access token can be used instead, via an `Authorization: Bearer` header.
- **Project pinning:** `/mcp/p/<pin>` is pinned to one project. It is written by `setup-mcp`, which exists only for `unity-mcp-cli`, `unreal-mcp-cli` and `godot-cli`. No Three.js equivalent is documented.
- **Tool names for Three.js:** not stated. The only published names are examples, such as "Screenshot / Isolated GameObject" and "Console / Get Logs" (Godot). The full catalogue is at https://ai-game.dev/docs/tools, which I did not fetch.
- **Playtest and input features** (screenshot, input events, video recording, scene graph, transforms, materials): not stated for Three.js. The homepage says the agent "enters Play mode, reads console errors and takes screenshots" (Unity/Unreal/Godot context).

### (4) Linux and headless

- **Linux desktop:** AppImage and .deb, x86_64 only. "No arm64 Linux build yet." Source: https://ai-game.dev/docs/wiki/app/installation
- **CLI on Linux:** prebuilt binaries for x64 and arm64. It needs Node.js 22 or newer. Note that the download page says "Node.js 20.19+ or 22.12+", which does not match the installation page.
- **Headless mode exists for prompts, not rendering.** `gamedev --print "<prompt>"` and `--headless` send a prompt and print the reply. The CLI reference does not say the game is rendered headless. Source: https://ai-game.dev/docs/wiki/app/cli
- **Software WebGL, display requirements, GPU requirements for the game:** not stated.
- **Browser extension:** none mentioned.
- **Account needed:** yes. "On first launch the CLI asks you to sign in." This also applies on the Free plan.
- **Hosted dependency:** the app and CLI require sign-in to the hosted service. The Free plan works with your own agent, but prompts go straight to your provider. Paid AI goes through their servers.

### (5) Pricing, free tier, credits

Source: https://ai-game.dev/pricing (last updated 2026-10-17), with the plan terms in https://ai-game.dev/legal/terms.

- **Free:** $0. "Bring your own AI agent. Pay your AI provider directly." Includes "Unlimited MCP server access" and "Unreal, Unity, Godot & Blender." Three.js is not in the feature list. Account needed, no card.
- **Indie:** $25/month ($24/month or $285/year billed annually). Hosted Claude Haiku and GPT Luna.
- **Studio:** $99/month ($94/month or $1129/year). Claude Opus, Sonnet and Fable, and GPT models.
- **Studio Max:** $199/month ($189/month or $2269/year). More than 8× Indie's usage.
- **Indie trial:** 7 days, requires a card, and auto-renews at $25 after the trial unless cancelled.
- **Usage:** a weekly allowance applies to paid plans. Optional pay-as-you-go extended usage is funded from a prepaid balance, with a 15% markup on provider cost.
- **Billing:** Paddle is merchant of record. Taxes are added at checkout.
- **Caveat:** the Terms say a usage charge is made "whether or not the result was useful," and an agent that keeps running consumes allowance.

### (6) Privacy and terms

Sources: https://ai-game.dev/trust, https://ai-game.dev/legal/privacy (Privacy Policy version 3.10, effective 21 November 2026) and https://ai-game.dev/legal/terms (version 3.8 applies now).

- **Project code and assets through the relay:** the Privacy Policy, section 2.7, says the company does not collect, store or access "Your source code, project files, or game assets." The relay "routes tool calls ... without inspecting or persisting the payload contents."
- **What the relay does log:** tool calls, timing and status (section 2.5), and MCP events including "the tool, prompt, or resource referenced" (section 2.6).
- **Paid AI requests:** the prompt "including any code or other project context your AI agent adds" goes to the provider that serves the model. Providers include Anthropic, OpenAI, Google, DeepInfra and Sail Research (section 2.8).
- **Free plan with your own agent:** prompts do not pass through the company's servers (section 2.8).
- **Training:** Anthropic's commercial terms say it may not train on API content. OpenAI keeps request content up to 30 days for abuse monitoring, and "not used for training by default." Runway's terms reportedly permit training on inputs and outputs. The Privacy Policy says general use for training is "Not stated" (from the model summary).
- **Media generation uploads:** deleted after 7 days, except Tripo files, which are kept until you ask for deletion (section 2.13).
- **Crash reports:** sent by default, can be turned off. They may name a file or folder, or quote short text (sections 2.7 and 2.10).
- **Retention, from the Privacy Policy summary:** crash reports 90 days, AI provider attempt records 60 days, product analytics 24 months, backups up to 366 days. This comes from a model-extracted summary, not verbatim text.
- **Ownership:** Terms section 10 says you keep your rights in "your projects, source code, game assets, and any content you create," and "we claim none of them."
- **Agent actions, Terms section 2.2:** the software and AI agents "can ... read, create, modify, overwrite and delete files, folders and entire projects," and "Some of these actions cannot be undone."
- **Governing law:** Washington State, USA.
- **Contacts:** [REDACTED-EMAIL], [REDACTED-EMAIL], [REDACTED-EMAIL].
- **Not fetched:** the Refund & Cancellation Policy at https://ai-game.dev/legal/refund.

### (7) Licence, maker, and age

- **Open source:** the Unity, Godot and Unreal plugins, the GameDev-MCP-Server and MCP-Plugin-dotnet are Apache-2.0 (Terms section 9). Repos: https://github.com/IvanMurzak/Unity-MCP, https://github.com/IvanMurzak/Godot-MCP, https://github.com/IvanMurzak/Unreal-MCP, https://github.com/IvanMurzak/GameDev-MCP-Server, https://github.com/IvanMurzak/MCP-Plugin-dotnet.
- **Proprietary:** the desktop app, the hosted service and the rest of the Software. Three.js support is not listed as open source.
- **Maker:** Ivan Murzak, trading as Modalith, a sole proprietorship in Kirkland, Washington (https://ai-game.dev/trust).
- **Age:** the Unity plugin has been open on GitHub since April 2025. The Godot and Unreal plugins followed in 2026.

### Pages read

- https://ai-game.dev/
- https://ai-game.dev/download
- https://ai-game.dev/pricing
- https://ai-game.dev/trust
- https://ai-game.dev/mcp-endpoint-info
- https://ai-game.dev/docs/wiki/app/installation
- https://ai-game.dev/docs/wiki/app/projects-and-engines
- https://ai-game.dev/docs/wiki/app/cli
- https://ai-game.dev/legal/terms (truncated, with a summary of the rest)
- https://ai-game.dev/legal/privacy (truncated, with a summary of the rest; the summary covers sections 2.13 and later, and the verbatim text does not reach section 2.13)

Not read: https://ai-game.dev/docs/tools, the Three.js page if one exists, https://ai-game.dev/docs/wiki/app/sign-in-and-account, https://ai-game.dev/model-availability, https://ai-game.dev/legal/refund, and https://discord.gg/cfbdMZX99G. Nothing was signed up for or downloaded.

