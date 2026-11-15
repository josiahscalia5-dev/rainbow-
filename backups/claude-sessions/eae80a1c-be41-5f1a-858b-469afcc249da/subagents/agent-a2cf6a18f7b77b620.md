# Subagent agent-a2cf6a18f7b77b620 — session eae80a1c-be41-5f1a-858b-469afcc249da

### 🧑 User — 2026-11-15T19:39:20.375Z

Read World Labs' official documentation and answer with exact quotes/figures and the URL each fact came from. Pages to read (follow links within docs.worldlabs.ai and docs.atlas.worldlabs.ai as needed; start with the llms.txt indexes):
- https://docs.worldlabs.ai/llms.txt (the Marble / World API docs index), then the API quickstart/authentication page, the pricing page (try https://docs.worldlabs.ai/api/pricing.md), and the page about exporting/downloading worlds (Gaussian splats .spz/.ply, collider mesh / GLB, panorama).
- https://docs.atlas.worldlabs.ai/llms.txt, then https://docs.atlas.worldlabs.ai/billing.md and the getting-started / account sign-up page.
Questions:
1. Is there an official API for Marble world generation (often called the "World API" / "Marble API")? Base URL, how it authenticates (API key header name? OAuth?), where the key is created (e.g. platform.worldlabs.ai), and whether an MCP server or Claude integration exists for Marble itself (distinct from Atlas).
2. Marble API pricing: credits per USD, minimum purchase, cost of generating one world (per model/quality tier, e.g. Marble 0.1-mini vs plus, image-to-world), whether failed generations are charged, any free credits.
3. Are Marble app (marble.worldlabs.ai subscription) credits the same as or separate from API credits? Are Atlas credits separate from Marble/World API credits?
4. Atlas: how does a user activate an Atlas account (sign-up URL/steps), and what does "no active Atlas account" imply? Atlas credit price (credits per USD) and the published credit cost of each task: images2PosedRGBD, atlasGenerate, atlasTextToImage, atlasChisel, posedImages2Splats (draft vs refined), splats2Mesh. Say "not published" if a figure is not on the pages.
5. Which Marble export formats can be downloaded from a generated world (from the app and/or API), and is a mesh (GLB/OBJ) export available?
Keep the answer compact: a list of facts, each with its URL. Say plainly when something is not stated.

### 🤖 Claude — 2026-11-15T19:39:22.058Z

> 🔧 **WebFetch** `{"url": "https://docs.worldlabs.ai/llms.txt", "prompt": "List every documentation page URL in this index, with its title. Note any pages about authentication, quickstart, pricing, MCP, exporting or downloading worlds, and the API reference."}`

### 🤖 Claude — 2026-11-15T19:39:22.392Z

> 🔧 **WebFetch** `{"url": "https://docs.atlas.worldlabs.ai/llms.txt", "prompt": "List every documentation page URL in this index, with its title. Note any pages about billing, credits, pricing, sign-up, getting started, or account activation."}`

### 🧑 User — 2026-11-15T19:39:22.649Z

> ↩︎ result: Fetched https://docs.worldlabs.ai/llms.txt from a non-preapproved source (HTTP 200 OK, text/plain, 7490 characters).
> <fetched-web-content>
> # World Labs
> 
> - [Welcome to Marble](https://docs.worldlabs.ai/index.md): Marble helps you create high-fidelity, persistent 3D worlds.
> - [Models](https://docs.worldlabs.ai/marble/models.md): An overview of available Marble models
> - [Release notes](https://docs.worldlabs.ai/marble/release-notes.md): Latest updates and improvements to Marble
> - [Overview](https://docs.worldlabs.ai/marble/create/index.md): Ways to generate new worlds with prompts, images, video, and Chisel
> - [Prompt guidelines](https://docs.worldlabs.ai/marble/create/prompt-guides/index.md): Input requirements and specifications for Marble world generation
> - [Image prompt tips](https://docs.worldlabs.ai/marble/create/prompt-guides/image-prompt.md): How to create sharp scenes with image prompt
> - [Multi-image prompt tips](https://docs.worldlabs.ai/marble/create/prompt-guides/multi-image-prompt.md): Specify more details by combining multiple images.
> - [Pano prompt tips](https://docs.worldlabs.ai/marble/create/prompt-guides/pano-prompt.md): Use panoramas for maximum control over the worl …[+6452 chars]

### 🧑 User — 2026-11-15T19:39:22.865Z

> ↩︎ result: Fetched https://docs.atlas.worldlabs.ai/llms.txt from a non-preapproved source (HTTP 200 OK, text/plain, 8274 characters).
> <fetched-web-content>
> # World Labs Developer API
> 
> > Markdown versions of the World Labs Developer API docs. Append `.md` to any page URL for the same text.
> 
> Coding agents: the World Labs skills hold step-by-step workflows for videos and 3D scenes. See https://docs.atlas.worldlabs.ai/skills-and-plugins.md.
> 
> ## Get started
> 
> - [Quickstart](https://docs.atlas.worldlabs.ai/quickstart.md): Make your first Atlas API request and wait for its result.
> - [Skills and plugins](https://docs.atlas.worldlabs.ai/skills-and-plugins.md): Give a coding agent the World Labs skills so it can make videos and 3D scenes with Atlas.
> - [CLI](https://docs.atlas.worldlabs.ai/cli.md): Install the World Labs CLI and use it from a terminal or coding agent.
> - [Web quickstart](https://docs.atlas.worldlabs.ai/web-quickstart.md): Start a TypeScript project, pose an image, and generate a new view.
> - [Authentication](https://docs.atlas.worldlabs.ai/authentication.md): Use project-scoped API keys safely.
> - [Projects and API keys](https://docs.atlas.worldlabs.ai/projects-and-api-keys.md): Isolate cre …[+7242 chars]

### 🤖 Claude — 2026-11-15T19:39:24.864Z

> 🔧 **WebFetch** `{"url": "https://docs.worldlabs.ai/api/index.md", "prompt": "Quote exactly: the base URL, how requests authenticate (header name and key format), where the API key is created (URL), the minimum/any purchase info, and any mention of MCP server or Claude integration. Also list the generate endpoint path and the model names. State plainly if something is absent."}`

### 🧑 User — 2026-11-15T19:39:24.948Z

> ↩︎ result: Fetched https://docs.worldlabs.ai/api/index.md from a non-preapproved source (HTTP 200 OK, text/markdown, 36729 characters).
> <fetched-web-content>
> > ## Documentation Index
> > Fetch the complete documentation index at: https://docs.worldlabs.ai/llms.txt
> > Use this file to discover all available pages before exploring further.
> 
> # Quickstart
> 
> > Learn how to use the World API
> 
> ## Quickstart
> 
> > [card] [API Platform](https://platform.worldlabs.ai)
> >
> > Create API keys, manage billing, and check account settings.
> 
> > [card] [World generation examples](https://docs.worldlabs.ai/api/world-generation-examples.md)
> >
> > See request patterns for text, image, pano, multi-image, and video inputs.
> 
> **1. Get an API key**
> 
> **Step 1**
> 
> Sign in to the [World Labs Platform](https://platform.worldlabs.ai) with your Marble account.
> 
> If you don't have a Marble account, you'll be prompted to create one.
> 
> **Step 2**
> 
> Visit the [billing page](https://platform.worldlabs.ai/billing).
> 
> Add a payment method to your account and then purchase some credits to get started.
> 
> **Step 3**
> 
> Generate an API key from the [API keys page](https://platform.worldlabs.ai/api-keys).
> 
> > [!WARNING]
> >
> > Save your API key in a secure lo …[+35627 chars]

### 🤖 Claude — 2026-11-15T19:39:25.582Z

> 🔧 **WebFetch** `{"url": "https://docs.worldlabs.ai/api/pricing.md", "prompt": "Quote exactly all credit figures: credits per USD, minimum purchase, cost per world for each model/quality tier (Marble 0.1-mini, 0.1-plus, text vs image vs multi-image vs video input), whether failed generations are charged, free credits, and whether API credits are separate from the Marble app subscription credits. State plainly if not stated."}`

### 🧑 User — 2026-11-15T19:39:25.663Z

> ↩︎ result: Fetched https://docs.worldlabs.ai/api/pricing.md from a non-preapproved source (HTTP 200 OK, text/markdown, 9182 characters).
> <fetched-web-content>
> > ## Documentation Index
> > Fetch the complete documentation index at: https://docs.worldlabs.ai/llms.txt
> > Use this file to discover all available pages before exploring further.
> 
> # Pricing
> 
> > Understanding API usage and credits
> 
> ## Credits
> 
> > [!WARNING]
> >
> > World API billing is separate from Marble web app billing.
> >
> > * Credits purchased for the Marble app at [marble.worldlabs.ai](https://marble.worldlabs.ai) CANNOT be used with the API
> > * API usage requires credits purchased through the World Labs Platform at [platform.worldlabs.ai](https://platform.worldlabs.ai)
> >
> > If you plan to use the API, make sure you purchase credits on the World Labs Platform, not in the Marble app.
> 
> The World Labs API uses a credit-based pricing model.
> 
> You may purchase credits at a fixed rate of \$1.00 USD per 1,250 credits through the [World Labs Platform](https://platform.worldlabs.ai/billing). The minimum purchase is 6,250 credits or \$5.00 USD.
> 
> API credits do not expire.
> 
> You can check your current API credit balance with
> [`GET /marble/v1/credits`](h …[+8153 chars]

### 🤖 Claude — 2026-11-15T19:39:26.340Z

> 🔧 **WebFetch** `{"url": "https://docs.atlas.worldlabs.ai/billing.md", "prompt": "Quote exactly: credits per USD, minimum purchase, the credit cost of each task (images2PosedRGBD, atlasGenerate, atlasTextToImage, atlasChisel, posedImages2Splats draft vs refined, splats2Mesh), whether failed tasks are charged, free credits, whether Marble/World API credits are the same or separate, and how an account is activated or what 'no active Atlas account' means. State 'not published' for anything absent."}`

### 🧑 User — 2026-11-15T19:39:26.451Z

> ↩︎ result: Fetched https://docs.atlas.worldlabs.ai/billing.md from a non-preapproved source (HTTP 200 OK, text/markdown, 4485 characters).
> <fetched-web-content>
> # Billing
> 
> Understand credits, projects, spend limits, and payments.
> 
> Atlas Developer API usage is billed to the account that owns the API key's
> project. Balances, top-ups, and monthly spend limits are under
> [Settings → Developer Platform](https://atlas.worldlabs.ai/settings/credits/developer). Payment methods and
> invoices are under [Settings → Billing](https://atlas.worldlabs.ai/settings/billing). Account usage is on the
> [Settings → Usage](https://atlas.worldlabs.ai/settings/usage/developer) page.
> 
> ## Credits and top-ups
> 
> Developer API tasks draw credits from the account balance. The current
> conversion is 1,000 credits per US dollar. Credits purchased for the account
> do not expire.
> 
> Account owners and billing owners can add credits manually or enable automatic
> recharge. Auto-recharge charges the account's default payment method when the
> balance falls below a configured threshold and restores it to the chosen
> balance.
> 
> The task rate card can change. Use the current rate card shown in
> the platform when estimating task costs rather than …[+3458 chars]

### 🤖 Claude — 2026-11-15T19:39:26.980Z

> 🔧 **WebFetch** `{"url": "https://docs.atlas.worldlabs.ai/quickstart.md", "prompt": "Quote exactly: the sign-up URL and steps to get an account active, the base URL, the API key header name and key format, where keys are created, and any mention of 'active account' or billing requirement. Also whether the MCP server requires an API key. State plainly if absent."}`

### 🧑 User — 2026-11-15T19:39:27.091Z

> ↩︎ result: Fetched https://docs.atlas.worldlabs.ai/quickstart.md from a non-preapproved source (HTTP 200 OK, text/markdown, 7775 characters).
> <fetched-web-content>
> # Quickstart
> 
> Make your first Atlas API request and wait for its result.
> 
> A coding agent makes requests with the World Labs CLI and skills. An
> application calls the HTTP API. This page covers both.
> 
> > Use the endpoint names and schemas in this documentation, not examples for the
> > legacy Marble or World APIs.
> 
> ## With a coding agent
> 
> Follow these steps if you are a coding agent, or to set one up.
> 
> 1. Install the CLI. It requires Node.js 22 or newer.
> 
>    ```sh
>    npm install -g @worldlabsai/cli
>    ```
> 
> 2. Install the [World Labs skills](/skills-and-plugins). They hold complete
>    workflows for videos and 3D scenes. Pass `--client <agent>` to choose an
>    agent, such as `claude-code`, `codex`, or `cursor`. Claude Code and Codex
>    can install the skills as a plugin instead.
> 
>    ```sh
>    worldlabs skills install
>    ```
> 
> 3. Sign in. The user runs the login in their own terminal and enters their API
>    key at its private prompt. Do not ask for the key in the chat or put it in a
>    command.
> 
>    ```sh
>    worldlabs auth login
>    worldlabs  …[+6728 chars]

### 🤖 Claude — 2026-11-15T19:39:30.729Z

> 🔧 **WebFetch** `{"url": "https://docs.worldlabs.ai/marble/export/mesh.md", "prompt": "Quote exactly what formats, mesh types (collider, HQ/textured, vertex-colored, full-res), file formats (GLB/OBJ), and how to export a mesh from the Marble app. Include any credit cost stated. State plainly if OBJ or a panorama export is not mentioned."}`

### 🧑 User — 2026-11-15T19:39:30.806Z

> ↩︎ result: Fetched https://docs.worldlabs.ai/marble/export/mesh.md from a non-preapproved source (HTTP 200 OK, text/markdown, 4192 characters).
> <fetched-web-content>
> > ## Documentation Index
> > Fetch the complete documentation index at: https://docs.worldlabs.ai/llms.txt
> > Use this file to discover all available pages before exploring further.
> 
> # Mesh export
> 
> [Mesh Export](https://www.youtube.com/embed/I7rYwrgXRmg)
> 
> # Mesh export: downloading 3D assets
> 
> Export your Marble worlds as 3D meshes for use in game engines, 3D software, and other
> applications. Choose from multiple mesh formats and quality levels to suit your specific
> needs, from quick prototyping to high-quality production assets.
> 
> > [!NOTE]
> >
> > Collider mesh export is included with the [Standard plan](https://docs.worldlabs.ai/marble/support/account-billing.md). High-quality textured mesh (GLB) export requires the [Pro plan](https://docs.worldlabs.ai/marble/support/account-billing.md).
> 
> ## Getting started with collider mesh export
> 
> You can export collider mesh along with a splat to provide simple physics for games.
> For example, see [**first person shooting game**](https://github.com/bmild/spark-physics).
> To download collider mesh, na …[+3170 chars]

### 🤖 Claude — 2026-11-15T19:39:31.320Z

> 🔧 **WebFetch** `{"url": "https://docs.worldlabs.ai/marble/export/specs.md", "prompt": "Quote exactly the export file formats and specs listed (splat formats .spz/.ply, collider mesh, GLB, panorama/pano image, any OBJ), and the resolutions/levels (100k, 500k, full res). State plainly what is not listed."}`

### 🧑 User — 2026-11-15T19:39:31.403Z

> ↩︎ result: Fetched https://docs.worldlabs.ai/marble/export/specs.md from a non-preapproved source (HTTP 200 OK, text/markdown, 7760 characters).
> <fetched-web-content>
> > ## Documentation Index
> > Fetch the complete documentation index at: https://docs.worldlabs.ai/llms.txt
> > Use this file to discover all available pages before exploring further.
> 
> # Export file specs
> 
> > Tech specs on export files
> 
> ### Images
> 
> * &#x20;**Prompt image**:
>   * prompt from which the world is generated
> * &#x20;**360 panorama**:
>   * Equirectangular png of 2560 x 1280 pixels
> 
> ### Splats
> 
> * &#x20;**Splats (SPZ)**:
>   * Splat-based format optimized for Marble's rendering system, about 2M splats
> * &#x20;**Splats (low-res SPZ)**:
>   * Splat-based format optimized for Marble's rendering system, about 500k splats
> * &#x20;**Splats (PLY)**:
>   * Splat file with broader software compatibility, about 2M splats
> * &#x20;**Splats (low-res PLY)**:
>   * Splat file with broader software compatibility, about 500k splats
> 
> ### Mesh
> 
> * &#x20;**Collider Mesh (GLB)**
>   * coarse mesh optimized for simple physics calculations
>   * glb format
>   * 100-200k triangles
> 
> * &#x20;**High-quality mesh (GLB)**
>   * One glb around 600k triangles, with texture i …[+6739 chars]

### 🤖 Claude — 2026-11-15T19:39:31.851Z

> 🔧 **WebFetch** `{"url": "https://docs.worldlabs.ai/marble/support/account-billing.md", "prompt": "Quote exactly the statements about Marble subscription plans, monthly credits, whether app credits can be used with the API, free credits, and how credits relate to the World API or Atlas. State plainly if absent."}`

### 🧑 User — 2026-11-15T19:39:31.953Z

> ↩︎ result: Fetched https://docs.worldlabs.ai/marble/support/account-billing.md from a non-preapproved source (HTTP 200 OK, text/markdown, 7713 characters).
> <fetched-web-content>
> > ## Documentation Index
> > Fetch the complete documentation index at: https://docs.worldlabs.ai/llms.txt
> > Use this file to discover all available pages before exploring further.
> 
> # Subscriptions & billing
> 
> > Manage your Marble subscription, credits, and billing settings.
> 
> # Subscriptions & billing
> 
> ## How does Marble's pricing work?
> 
> Marble uses a credit-based subscription system, with higher tiers unlocking more features and credits. This guide explains how the plans, credits, and feature unlocks work so you can choose the right plan for your needs.
> 
> Credits are used each time you take an action in Marble.
> 
> Our current pricing can be found [here](https://marble.worldlabs.ai/pricing).
> 
> ## What are the different subscription options?
> 
> Marble offers four subscription tiers, each with a monthly credit allocation and access to different capabilities.
> 
> ### Free plan
> 
> Good for exploring the basics of what Marble can do
> 
> * Lightweight intro to Marble that lets you generate worlds from a text prompt, single image, or 360 pan …[+6679 chars]

### 🤖 Claude — 2026-11-15T19:39:32.587Z

> 🔧 **WebFetch** `{"url": "https://docs.atlas.worldlabs.ai/mcp.md", "prompt": "Quote exactly: how to connect (URL of the MCP server, sign-in flow), whether an API key is needed, what account/plan/active-account requirement exists, and any mention of Marble (as opposed to Atlas). Quote any error text about no active account or billing if present."}`

### 🧑 User — 2026-11-15T19:39:32.701Z

> ↩︎ result: Fetched https://docs.atlas.worldlabs.ai/mcp.md from a non-preapproved source (HTTP 200 OK, text/markdown, 3573 characters).
> <fetched-web-content>
> # MCP server
> 
> Run Atlas tasks from Claude and other MCP clients by signing in, with no API key.
> 
> World Labs hosts a [Model Context Protocol](https://modelcontextprotocol.io)
> server, so an assistant can run Atlas tasks for you from a chat. You sign in
> with your World Labs account; there is no API key to create or paste.
> 
> ```text
> https://api.atlas.worldlabs.ai/mcp
> ```
> 
> Tasks run in a project you choose and use that project's Developer API
> credits, at the same prices as the API. See [Billing](/billing).
> 
> ## Connect
> 
> Add the URL above as a remote MCP server in your client, then sign in when it
> opens World Labs in your browser.
> 
> - **Claude on the web or desktop:** open **Settings > Connectors**, add a
>   custom connector, and paste the URL.
> - **Claude Code:** run
>   `claude mcp add --transport http worldlabs https://api.atlas.worldlabs.ai/mcp`,
>   then run `/mcp` and sign in.
> - **Other clients:** any client that supports remote MCP servers with OAuth
>   sign-in connects with the same URL.
> 
> ## Tools
> 
> | Tool                  | What it does           …[+2542 chars]

### 🤖 Claude — 2026-11-15T19:39:33.159Z

> 🔧 **WebFetch** `{"url": "https://docs.atlas.worldlabs.ai/api-reference/images2-posed-rgbd.md", "prompt": "Quote any credit cost, price, or rate-card information for this task, and any mention of account activation or an active Atlas account. State 'not published on this page' if absent."}`

### 🧑 User — 2026-11-15T19:39:33.319Z

> ↩︎ result: Fetched https://docs.atlas.worldlabs.ai/api-reference/images2-posed-rgbd.md from a non-preapproved source (HTTP 200 OK, text/markdown, 30064 characters).
> <fetched-web-content>
> # images2PosedRGBD
> 
> POST /api/v2/tasks:images2PosedRGBD
> 
> Submit the images2PosedRGBD task
> 
> Estimates cameras and depth for one or more ordered images. Store the returned operation ID, then wait or poll until the operation is done.
> 
> ```sh
> curl --request POST \
>   --url 'https://api.atlas.worldlabs.ai/api/v2/tasks:images2PosedRGBD?wait=true' \
>   --header "WLT-Api-Key: [REDACTED]" \
>   --header 'Idempotency-Key: request-001' \
>   --header 'Content-Type: application/json' \
>   --data '{
>   "base64Outputs": false,
>   "frames": [
>     {
>       "imageAsset": {
>         "assetId": "asset_01jexample000000000000000"
>       }
>     }
>   ],
>   "canonicalizeToFirstFrame": false,
>   "refinePoses": false
> }'
> ```
> 
> 
> ## Response
> 
> ```json
> {
>   "id": "op_01jexample000000000000000000",
>   "ownerId": "acct_01jexample00000000000000000",
>   "metadata": null,
>   "done": false,
>   "error": null,
>   "expiresAtSecs": 1789415864,
>   "createdAtSecs": 1789412264,
>   "response": null,
>   "name": "accounts/acct_01jexample00000000000000000/projects/project_example/op …[+29061 chars]

### 🤖 Claude — 2026-11-15T19:39:36.346Z

> 🔧 **WebFetch** `{"url": "https://docs.atlas.worldlabs.ai/task-overview.md", "prompt": "Quote any credit cost, price, or rate per task (atlasTextToImage, images2PosedRGBD, atlasGenerate, atlasChisel, posedImages2Splats draft vs refined, splats2Mesh), any credits-per-USD figure, and any mention of account sign-up, activation, or 'active account'. State 'not published on this page' for anything absent."}`

### 🧑 User — 2026-11-15T19:39:36.453Z

> ↩︎ result: Fetched https://docs.atlas.worldlabs.ai/task-overview.md from a non-preapproved source (HTTP 200 OK, text/markdown, 2019 characters).
> <fetched-web-content>
> # Task overview
> 
> Choose the right Atlas task for what you have and what you want to make.
> 
> Start with the result you want. Each task links to its guide or API reference.
> 
> | Task                                            | When to use it                                                                                                        |
> | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
> | [`atlasTextToImage`](/text-to-image)            | Make a starting image from a written description of a place.                                                          |
> | [`images2PosedRGBD`](/images-to-posed-images)   | Estimate camera poses and depth for your images so you can use them to generate new views or build a 3D scene.        |
> | [`atlasGenerate`](/atlas-generate)              | Explore the same scene from new camera angles. Start with one or more images that have a camera pose and a depth map. |
> | [`atlasChis …[+998 chars]

### 🤖 Claude — 2026-11-15T19:39:52.479Z

Facts from the official docs, each with its source URL. Where a figure is missing from the pages I read, I say so.

**1. Marble / World API**
- Base URL: `https://api.worldlabs.ai/marble/v1` (e.g. `POST /marble/v1/worlds:generate`). Source: https://docs.worldlabs.ai/api/index.md
- Auth: header `WLT-Api-Key: [REDACTED] The docs show no OAuth. Source: https://docs.worldlabs.ai/api/index.md
- Key creation: sign in at https://platform.worldlabs.ai with a Marble account, add a payment method and buy credits at https://platform.worldlabs.ai/billing, then create the key at https://platform.worldlabs.ai/api-keys. Source: https://docs.worldlabs.ai/api/index.md
- Models in the examples: `marble-1.1`, `marble-1.1-plus`, and `marble-1.0-draft` (pricing page). The name "0.1-mini" does not appear.
- MCP / Claude integration for Marble: none in the Marble docs index (https://docs.worldlabs.ai/llms.txt). The only MCP server I found is Atlas's, at `https://api.atlas.worldlabs.ai/mcp`, which runs Atlas tasks. Source: https://docs.atlas.worldlabs.ai/mcp.md

**2. Marble API pricing** (https://docs.worldlabs.ai/api/pricing.md)
- "$1.00 USD per 1,250 credits"; "The minimum purchase is 6,250 credits or $5.00 USD."
- "API credits do not expire."
- Standard models (`marble-1.0`, `marble-1.1`), world generation alone 1,500 credits. Totals: image-as-pano 1,500; text 1,580; non-pano image 1,580; multi-image 1,600; video 1,600.
- Draft (`marble-1.0-draft`): world generation 150 credits; totals 150 to 250.
- `marble-1.1-plus`: base world generation 1,500 plus 0 to 1,500 variable. Totals run 1,500 to 3,000 for a pano image and 1,600 to 3,100 for multi-image or video. Observed mean $1.714, median $1.280.
- Charged per usage event; pano generation adds 80 (text or non-pano image), 100 (multi-image or video), or 0 (pano image).
- Failed generations: not stated.
- Free API credits: not stated.

**3. Credit separation**
- Marble app and API are separate. "Credits purchased for the Marble app at marble.worldlabs.ai CANNOT be used with the API." Source: https://docs.worldlabs.ai/api/pricing.md
- "Marble and the World API bill separately, and credits are not interchangeable in either direction." Source: https://docs.worldlabs.ai/marble/support/account-billing.md
- Atlas vs Marble/World API: the Atlas billing page does not mention Marble or the World API, so whether the two are interchangeable is not stated. Its rate (1,000 credits per USD) differs from the World API's 1,250. Source: https://docs.atlas.worldlabs.ai/billing.md

**4. Atlas**
- Account and key setup: the Atlas quickstart says to open https://atlas.worldlabs.ai/developers, select API keys, and create a key with `tasks.create`, `operations.read`, `assets.create`, `assets.read`. Source: https://docs.atlas.worldlabs.ai/quickstart.md
- Base URL: `https://api.atlas.worldlabs.ai/api/v2`, with header `WLT-Api-Key`. Source: https://docs.atlas.worldlabs.ai/quickstart.md and https://docs.atlas.worldlabs.ai/api-reference/images2-posed-rgbd.md
- "no active Atlas account": not found on any page I read. The phrase, and any separate sign-up page, do not appear in https://docs.atlas.worldlabs.ai/llms.txt.
- Credit price: "1,000 credits per US dollar. Credits purchased for the account do not expire." Minimum purchase: not stated. Source: https://docs.atlas.worldlabs.ai/billing.md
- Task costs (all six): not published. The billing page says "The task rate card can change. Use the current rate card shown in the platform." Source: https://docs.atlas.worldlabs.ai/billing.md. The task overview page lists no prices either: https://docs.atlas.worldlabs.ai/task-overview.md
- Failed-task charging: not stated.

**5. Marble exports** (https://docs.worldlabs.ai/marble/export/specs.md, https://docs.worldlabs.ai/marble/export/mesh.md)
- Splats: SPZ (about 2M splats), low-res SPZ (about 500k), PLY (about 2M), low-res PLY (about 500k).
- Panorama: "Equirectangular png of 2560 x 1280 pixels."
- Collider mesh GLB: "100-200k triangles." Included in the Standard plan.
- High-quality mesh GLB: one about 600k triangles with textures, one about 1M triangles with vertex colors. Pro plan required. Takes up to an hour. Rate limited to "4 generation requests per hour per user." Only on worlds you own.
- OBJ: not mentioned.
- API (https://docs.worldlabs.ai/api/index.md): `spz_urls` (100k, 500k, full_res), `collider_mesh_url` (GLB), `hq_mesh_url` and `full_res_mesh_url` (GLB, once exported), `pano_url`. Export via `POST /marble/v1/worlds/{world_id}:export`: `{"asset_type":"splats","format":"ply"}` (free) or `{"asset_type":"mesh","format":"glb"}` (3,500 credits, per https://docs.worldlabs.ai/api/pricing.md).

**URLs read:** https://docs.worldlabs.ai/llms.txt, https://docs.atlas.worldlabs.ai/llms.txt, https://docs.worldlabs.ai/api/index.md, https://docs.worldlabs.ai/api/pricing.md, https://docs.worldlabs.ai/marble/export/mesh.md, https://docs.worldlabs.ai/marble/export/specs.md, https://docs.worldlabs.ai/marble/support/account-billing.md, https://docs.atlas.worldlabs.ai/quickstart.md, https://docs.atlas.worldlabs.ai/billing.md, https://docs.atlas.worldlabs.ai/mcp.md, https://docs.atlas.worldlabs.ai/api-reference/images2-posed-rgbd.md, https://docs.atlas.worldlabs.ai/task-overview.md

Not read: the Marble app pricing page (https://marble.worldlabs.ai/pricing) and the Marble "Create & edit" and "Chisel" pages.

