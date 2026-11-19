# Subagent agent-aa5f2019de3b1020e — session 7c0df0fc-7d43-5a1e-bb66-c0bb31003a42

### 🧑 User — 2026-11-16T00:37:48.565Z

Read the official World Labs Marble World API documentation and answer precisely, quoting exact wording where it matters. Start with https://docs.worldlabs.ai/llms.txt (it may list all doc pages) and https://docs.worldlabs.ai/api, then follow links to the API reference pages for: getting a world by id (e.g. GET /marble/v1/worlds/{world_id}), listing worlds (e.g. worlds:list), operations, authentication/API keys, pricing/billing, and any FAQ.

Questions to answer:
1. Full list of endpoints (method + path + one-line purpose).
2. Can the API GET or LIST a world that was created in the Marble WEB APP (marble.worldlabs.ai), as opposed to one generated through the API? Quote any sentence about web-app worlds vs API worlds, world ownership, or which worlds worlds:list returns. If the docs are silent, say so explicitly.
3. What exactly does a World object contain (asset fields: SPZ urls, collider mesh GLB, pano, thumbnail, caption, high-quality mesh, PLY)? Are download URLs signed/expiring?
4. Does reading/getting/listing a world or downloading its assets cost credits? What costs credits (generation, PLY export, HQ mesh export)? Quote the pricing table.
5. How is an API key created (which site, e.g. platform.worldlabs.ai), is the API account the same login/account as the Marble web app, and is API billing separate from the Marble web app subscription? Is a payment/credit purchase required before an API key works at all, even for free read-only calls?
6. Any endpoint to export/convert an existing world's assets (e.g. PLY export, mesh export) and its cost.
Report what the docs actually say, with the URL of each page you read. Do not guess; mark anything unconfirmed.

### 🤖 Claude — 2026-11-16T00:37:49.992Z

> 🔧 **WebFetch** `{"url": "https://docs.worldlabs.ai/llms.txt", "prompt": "List every documentation page URL on this index, with its title. Quote the exact wording of any intro text that describes the docs."}`

### 🤖 Claude — 2026-11-16T00:37:50.630Z

> 🔧 **WebFetch** `{"url": "https://docs.worldlabs.ai/api", "prompt": "Summarize this API overview page. List every endpoint (method + path + one-line purpose) mentioned, and quote exactly any sentences about web-app worlds, world ownership, API keys, authentication, pricing, or credits. Also list all links to other doc pages."}`

### 🧑 User — 2026-11-16T00:37:50.782Z

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

### 🧑 User — 2026-11-16T00:37:51.245Z

> ↩︎ result: Fetched https://docs.worldlabs.ai/api from a non-preapproved source (HTTP 200 OK, text/markdown, 36729 characters).
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
> > Save your API key in a secure location an …[+35618 chars]

### 🤖 Claude — 2026-11-16T00:37:53.574Z

> 🔧 **WebFetch** `{"url": "https://docs.worldlabs.ai/api/reference/worlds/get.md", "prompt": "Quote exactly the endpoint method and path, the description, every parameter, the response schema (all World object fields and asset fields, incl. any spz/ply/mesh/pano/thumbnail/caption/hq_mesh/full_res_mesh URL fields), and any sentence about ownership, permission, which worlds can be fetched, expiry or signing of URLs, or credits/cost."}`

### 🧑 User — 2026-11-16T00:37:53.674Z

> ↩︎ result: Fetched https://docs.worldlabs.ai/api/reference/worlds/get.md from a non-preapproved source (HTTP 200 OK, text/markdown, 16161 characters).
> <fetched-web-content>
> > ## Documentation Index
> > Fetch the complete documentation index at: https://docs.worldlabs.ai/llms.txt
> > Use this file to discover all available pages before exploring further.
> 
> # Get a world
> 
> > Get a world by ID.
> 
> Retrieves a world's details including generated assets if available.
> Only the world owner or users with access to public worlds can retrieve them.
> 
> Args:
>     world_id: The unique identifier of the world.
> 
> Returns:
>     World object with world_id, display_name, tags, assets, created_at,
>     updated_at, permission, model, world_prompt, and world_marble_url.
> 
> Raises:
>     HTTPException: 404 if world not found or access denied
> 
> 
> 
> ## OpenAPI
> 
> ````yaml GET /marble/v1/worlds/{world_id}
> openapi: 3.1.0
> info:
>   description: Public-facing API for the Marble platform
>   summary: Marble Public API v1
>   title: Marble Public API v1
>   version: 1.0.0
> servers:
>   - description: World API
>     url: https://api.worldlabs.ai
> security:
>   - ApiKeyAuth: []
> paths:
>   /marble/v1/worlds/{world_id}:
>     get:
>       summary: Get World
>       desc …[+15146 chars]

### 🤖 Claude — 2026-11-16T00:37:54.270Z

> 🔧 **WebFetch** `{"url": "https://docs.worldlabs.ai/api/reference/worlds/list.md", "prompt": "Quote exactly the endpoint method and path, the description, every query parameter and filter (and what they filter on), pagination fields, the response schema, and any sentence about which worlds are returned (e.g. only API-created, only the authenticated user's, web-app worlds), ownership, or credits/cost."}`

### 🧑 User — 2026-11-16T00:37:54.390Z

> ↩︎ result: Fetched https://docs.worldlabs.ai/api/reference/worlds/list.md from a non-preapproved source (HTTP 200 OK, text/markdown, 21228 characters).
> <fetched-web-content>
> > ## Documentation Index
> > Fetch the complete documentation index at: https://docs.worldlabs.ai/llms.txt
> > Use this file to discover all available pages before exploring further.
> 
> # List worlds
> 
> > List worlds with optional filters.
> 
> Returns worlds created through the API with optional filtering and pagination.
> 
> Args:
>     request: List request with optional filters:
>         - page_size: Number of results per page (default: 10)
>         - page_token: [REDACTED] token from previous response
>         - status: Filter by status (e.g., "COMPLETED")
>         - model: Filter by model name (e.g., "marble-1.0-plus")
>         - tags: Filter by tags (matches worlds with any tag)
>         - is_public: Filter by visibility (true=public, false=private, null=all)
>         - created_after: Filter by creation time (after timestamp)
>         - created_before: Filter by creation time (before timestamp)
>         - sort_by: Sort order ("created_at" or "updated_at")
> 
> Returns:
>     ListWorldsResponse with worlds list and next_page_token for pagination.
> 
>  …[+20214 chars]

### 🤖 Claude — 2026-11-16T00:37:54.901Z

> 🔧 **WebFetch** `{"url": "https://docs.worldlabs.ai/api/reference/worlds/export.md", "prompt": "Quote exactly the endpoint method and path, the description, request body schema and allowed asset_type/format values, the response (Operation?), how long exports/cached files last, any URL expiry, and any sentence about credits or cost for export."}`

### 🧑 User — 2026-11-16T00:37:54.990Z

> ↩︎ result: Fetched https://docs.worldlabs.ai/api/reference/worlds/export.md from a non-preapproved source (HTTP 200 OK, text/markdown, 8915 characters).
> <fetched-web-content>
> > ## Documentation Index
> > Fetch the complete documentation index at: https://docs.worldlabs.ai/llms.txt
> > Use this file to discover all available pages before exploring further.
> 
> # Export a world
> 
> > Export a generated world asset.
> 
> PLY splat exports are converted synchronously, cached in GCS, and returned
> as completed operations. HQ mesh exports reuse the existing async mesh
> export service and return an in-progress operation.
> 
> 
> 
> ## OpenAPI
> 
> ````yaml POST /marble/v1/worlds/{world_id}:export
> openapi: 3.1.0
> info:
>   description: Public-facing API for the Marble platform
>   summary: Marble Public API v1
>   title: Marble Public API v1
>   version: 1.0.0
> servers:
>   - description: World API
>     url: https://api.worldlabs.ai
> security:
>   - ApiKeyAuth: []
> paths:
>   /marble/v1/worlds/{world_id}:export:
>     post:
>       summary: Export World
>       description: >-
>         Export a generated world asset.
> 
> 
>         PLY splat exports are converted synchronously, cached in GCS, and
>         returned
> 
>         as completed operations. HQ mesh exp …[+7902 chars]

### 🤖 Claude — 2026-11-16T00:37:55.504Z

> 🔧 **WebFetch** `{"url": "https://docs.worldlabs.ai/api/pricing.md", "prompt": "Quote the full pricing/credits content verbatim where possible, including any table (generation costs by model, PLY export, mesh export, reads/downloads) and any sentence about what consumes credits or what is free. Quote exact table rows."}`

### 🧑 User — 2026-11-16T00:37:55.593Z

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

### 🤖 Claude — 2026-11-16T00:37:56.106Z

> 🔧 **WebFetch** `{"url": "https://docs.worldlabs.ai/api/faq.md", "prompt": "Quote exactly every question and answer that concerns API keys, accounts/logins, web app vs API worlds, ownership, billing/credits, payment required before use, free tier, or listing/getting worlds. Include exact wording."}`

### 🧑 User — 2026-11-16T00:37:56.182Z

> ↩︎ result: Fetched https://docs.worldlabs.ai/api/faq.md from a non-preapproved source (HTTP 200 OK, text/markdown, 7060 characters).
> <fetched-web-content>
> > ## Documentation Index
> > Fetch the complete documentation index at: https://docs.worldlabs.ai/llms.txt
> > Use this file to discover all available pages before exploring further.
> 
> # Frequently asked questions
> 
> > Common questions and answers about the World API
> 
> ### Why does `worlds:generate` return `400 Bad request`?
> 
> A `400 Bad request` means the request was rejected before generation started. The response body is generic and includes a `request_id`, but not the exact cause. Other status codes narrow things down: `401` is an authentication problem, `402` is insufficient API credits, `422` is a schema validation error, and `429` is a rate limit.
> 
> The most common cause is a request body that is not valid JSON. This is the usual reason a request that works in `curl` fails from another HTTP client. Some libraries send an object's string form instead of JSON. For example, a Java `Map.toString()` produces `key=value` pairs with unquoted keys:
> 
> ```text theme={null}
> # Rejected: a stringified map, not JSON
> {model=marble-1.0, world_prompt={type=text …[+6025 chars]

### 🤖 Claude — 2026-11-16T00:37:56.719Z

> 🔧 **WebFetch** `{"url": "https://docs.worldlabs.ai/marble/support/account-billing.md", "prompt": "Quote exactly any sentences about the Marble subscription vs API billing, credits, the platform/API account, whether API usage is included in or separate from a Marble subscription, and any payment requirements. Include exact wording."}`

### 🧑 User — 2026-11-16T00:37:56.808Z

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

### 🤖 Claude — 2026-11-16T00:37:57.107Z

> 🔧 **WebFetch** `{"url": "https://docs.worldlabs.ai/api/reference/operations/get.md", "prompt": "Quote the method and path, description, and response schema of this endpoint, and any sentence about credits or cost."}`

### 🧑 User — 2026-11-16T00:37:57.181Z

> ↩︎ result: Fetched https://docs.worldlabs.ai/api/reference/operations/get.md from a non-preapproved source (HTTP 200 OK, text/markdown, 22952 characters).
> <fetched-web-content>
> > ## Documentation Index
> > Fetch the complete documentation index at: https://docs.worldlabs.ai/llms.txt
> > Use this file to discover all available pages before exploring further.
> 
> # Get an operation
> 
> > Get an operation by ID.
> 
> Poll this endpoint to check the status of a long-running operation.
> When done=true, the response field contains the generated world.
> 
> Args:
>     operation_id: The operation identifier from /worlds:generate.
> 
> Returns:
>     GetOperationResponse[World] with:
>         - operation_id: Operation identifier
>         - created_at: Creation timestamp
>         - updated_at: Last update timestamp
>         - expires_at: Expiration timestamp
>         - done: true when complete, false while in progress
>         - error: Error details if failed, null otherwise
>         - metadata: Progress information and world_id
>         - response: Generated World if done=true, null otherwise
>         - cost: Settled credit cost breakdown; populated only when the
>           operation completed successfully (done=true with no error)
>      …[+21941 chars]

### 🤖 Claude — 2026-11-16T00:37:57.398Z

> 🔧 **WebFetch** `{"url": "https://docs.worldlabs.ai/api/reference/credits/get.md", "prompt": "Quote the method and path, description, and response schema, and any sentence about what consumes credits."}`

### 🧑 User — 2026-11-16T00:37:57.492Z

> ↩︎ result: Fetched https://docs.worldlabs.ai/api/reference/credits/get.md from a non-preapproved source (HTTP 200 OK, text/markdown, 2166 characters).
> <fetched-web-content>
> > ## Documentation Index
> > Fetch the complete documentation index at: https://docs.worldlabs.ai/llms.txt
> > Use this file to discover all available pages before exploring further.
> 
> # Get credits
> 
> > Get remaining API credits for the authenticated user.
> 
> Returns:
>     CreditsResponse with the current aggregate API credit balance.
> 
> Raises:
>     HTTPException: 404 if the caller is not an API-enabled user
>     HTTPException: 503 if the billing backend is unavailable
> 
> 
> 
> ## OpenAPI
> 
> ````yaml GET /marble/v1/credits
> openapi: 3.1.0
> info:
>   description: Public-facing API for the Marble platform
>   summary: Marble Public API v1
>   title: Marble Public API v1
>   version: 1.0.0
> servers:
>   - description: World API
>     url: https://api.worldlabs.ai
> security:
>   - ApiKeyAuth: []
> paths:
>   /marble/v1/credits:
>     get:
>       tags:
>         - credits
>       summary: Get Credits
>       description: |-
>         Get remaining API credits for the authenticated user.
> 
>         Returns:
>             CreditsResponse with the current aggregate API credit balance.
> 
>  …[+1151 chars]

### 🤖 Claude — 2026-11-16T00:38:00.364Z

> 🔧 **WebFetch** `{"url": "https://docs.worldlabs.ai/api/reference/openapi.yaml", "prompt": "List every path key under `paths:` with each HTTP method and its `summary`, exactly as written. Also state whether the spec has any endpoint for deleting worlds, listing/getting web-app (marble.worldlabs.ai) worlds, or exporting mesh/PLY beyond the one under /worlds/{world_id}:export. Quote the top-level `info` and `securitySchemes` descriptions verbatim."}`

### 🤖 Claude — 2026-11-16T00:38:00.880Z

> 🔧 **WebFetch** `{"url": "https://docs.worldlabs.ai/api/reference/worlds/generate.md", "prompt": "Quote the method and path, the description, and any sentence about which account or world ownership applies, credits/cost, or visibility of created worlds (e.g. whether they appear in the Marble web app)."}`

### 🧑 User — 2026-11-16T00:38:00.992Z

> ↩︎ result: Fetched https://docs.worldlabs.ai/api/reference/worlds/generate.md from a non-preapproved source (HTTP 200 OK, text/markdown, 20545 characters).
> <fetched-web-content>
> > ## Documentation Index
> > Fetch the complete documentation index at: https://docs.worldlabs.ai/llms.txt
> > Use this file to discover all available pages before exploring further.
> 
> # Generate a world
> 
> > Start world generation.
> 
> Creates a new world generation job and returns a long-running operation.
> Poll the /operations/{operation_id} endpoint to check generation status
> and retrieve the generated world when complete.
> 
> Args:
>     request: The world generation request containing world_prompt, display_name,
>         tags, model, seed, and permission settings.
> 
> Returns:
>     GenerateWorldResponse with operation_id and timestamps. Use the operation_id
>     to poll for completion.
> 
> Raises:
>     HTTPException: 400 if invalid request or content violates policies
>     HTTPException: 402 if insufficient credits
>     HTTPException: 500 if generation could not be started
> 
> 
> 
> ## OpenAPI
> 
> ````yaml POST /marble/v1/worlds:generate
> openapi: 3.1.0
> info:
>   description: Public-facing API for the Marble platform
>   summary: Marble Public API v1
>   t …[+19535 chars]

### 🧑 User — 2026-11-16T00:38:06.000Z

> ↩︎ result: Fetched https://docs.worldlabs.ai/api/reference/openapi.yaml from a non-preapproved source (HTTP 200 OK, text/yaml, 67997 characters, truncated to the first 39939, then a model-extracted summary of the rest).
> <fetched-web-content>
> components:
>   schemas:
>     Content:
>       description: 'Represents content (media, text, images) that can be stored inline
>         or via URL.
> 
> 
>         Supports both direct data storage (up to 10MB) and URL references (up to 20MB).'
>       properties:
>         data_base64:
>           anyOf:
>           - type: string
>           - type: 'null'
>           title: Data Base64
>         extension:
>           anyOf:
>           - type: string
>           - type: 'null'
>           description: File extension without dot
>           examples:
>           - jpg
>           - png
>           - pdf
>           - txt
>           title: Extension
>         uri:
>           anyOf:
>           - type: string
>           - type: 'null'
>           title: Uri
>       title: Content
>       type: object
>     CreditsResponse:
>       description: Remaining credits for the authenticated API user.
>       properties:
>         remaining_credits:
>           description: Remaining API credits available to the authenticated u …[+40559 chars]

### 🤖 Claude — 2026-11-16T00:38:32.407Z

## World API findings

All pages below are from docs.worldlabs.ai and were read in full unless noted. The openapi.yaml page was truncated, and the tail of its path list came from a model summary, so the entries marked (summary) are less certain.

## 1. Endpoints

Base URL: `https://api.worldlabs.ai`. Auth header: `WLT-Api-Key`.

| Method | Path | Purpose |
|---|---|---|
| POST | `/marble/v1/worlds:generate` | Start world generation; returns an Operation |
| GET | `/marble/v1/worlds/{world_id}` | Get a world by ID |
| DELETE | `/marble/v1/worlds/{world_id}` | Delete a world by ID (summary; only the owner can call it) |
| POST | `/marble/v1/worlds/{world_id}:export` | Export a generated asset (PLY splats or GLB mesh) |
| POST | `/marble/v1/worlds:list` | List API-generated worlds with filters (note: POST, not GET) |
| GET | `/marble/v1/operations/{operation_id}` | Poll a long-running operation |
| GET | `/marble/v1/credits` | Get remaining API credit balance |
| POST | `/marble/v1/media-assets:prepare_upload` | Get a signed upload URL for an input media asset |
| GET | `/marble/v1/media-assets/{media_asset_id}` | Get a media asset (summary) |
| POST | `/marble/v1/pano:depth_to_rgb` | Generate an RGB panorama from a depth panorama (summary) |

Sources: the llms.txt index, the openapi.yaml page, and the individual reference pages. The delete, media-asset, and pano pages were not fetched.

## 2. Web-app worlds

The docs do not say whether a world created in the Marble web app can be fetched by ID or listed through the API.

- Listing: "Returns worlds created through the API with optional filtering and pagination." (worlds/list.md). Nothing says web-app worlds are excluded, and nothing says they are included. This is unconfirmed.
- Get: "Only the world owner or users with access to public worlds can retrieve them." (worlds/get.md). This implies a web-app world could be readable if it is public and you know its ID, but the docs do not say so.
- Ownership: the docs do not describe how web-app and API worlds relate to each other, beyond the link pattern `https://marble.worldlabs.ai/world/{world_id}` for API worlds (quickstart).
- The `permission` object has `public`, `allowed_readers`, `allowed_writers`, and `allow_id_access`, but the docs do not explain how these interact with web-app worlds.

## 3. World object

From worlds/get.md and the openapi schema. Returned as a World object (not wrapped), with `world_id`, `display_name`, `tags`, `world_marble_url`, `created_at`, `updated_at`, `permission`, `world_prompt`, `model`, and `assets`:

- `assets.caption`: "AI-generated description of the world"
- `assets.thumbnail_url`: thumbnail image URL
- `assets.splats.spz_urls`: map of SPZ URLs. Example keys are `100k`, `500k`, and `full_res`.
- `assets.splats.semantics_metadata`: `metric_scale_factor` and `ground_plane_offset`
- `assets.mesh.collider_mesh_url`: "Collider mesh URL" (GLB, per the quickstart)
- `assets.mesh.hq_mesh_url`: "High-quality textured mesh URL" (GLB, "once exported" per the quickstart)
- `assets.mesh.full_res_mesh_url`: "Full-resolution vertex-colored mesh URL" (GLB, "once exported" per the quickstart)
- `assets.imagery.pano_url`: "Panorama image URL"
- PLY: not a World field. It is produced by the export endpoint.

Signing and expiry: the docs do not say whether world asset URLs (SPZ, collider, pano, thumbnail) are signed or expire. The FAQ says a PLY export returns "a signed download URL in response.url," but gives no expiry time. Upload URLs are described as "signed," but no expiry is stated. Unconfirmed.

Discrepancies to be aware of:
- The quickstart's GET example wraps the result as `{"world": {...}}` and uses the field name `id`. The reference says the endpoint returns a World object with `world_id`.
- The export enum includes `150k`, but the SPZ examples show `100k`, `500k`, and `full_res`.

## 4. Credits and pricing

Pricing page (pricing.md) quotes:
- "World API billing is separate from Marble web app billing."
- "Credits purchased for the Marble app at marble.worldlabs.ai CANNOT be used with the API"
- "You may purchase credits at a fixed rate of \$1.00 USD per 1,250 credits through the World Labs Platform. The minimum purchase is 6,250 credits or \$5.00 USD."
- "API credits do not expire."
- "Note that not all API requests consume credits, such as API key creation, media asset upload and management, and Operation polling."

That exemption sentence does not name GET world, worlds:list, asset download, or GET credits. Whether those are free is therefore unconfirmed. Only export PLY is stated as free (see below).

Usage event costs table, quoted as given:

| Usage event | Credits |
|---|---:|
| Pano generation (image, pano) | 0 |
| Pano generation (text) | 80 |
| Pano generation (image, non-pano) | 80 |
| Pano generation (multi-image) | 100 |
| Pano generation (video) | 100 |
| Draft world generation | 150 |
| World generation | 1,500 |
| HQ mesh export | 3,500 |

What costs credits:
- Generation: yes. World generation costs 1,500 credits for `marble-1.0` and `marble-1.1`, 150 for `marble-1.0-draft`, and 1,500 base plus up to 1,500 variable for `marble-1.1-plus`. Pano generation is added when the input is not already a pano.
- HQ mesh export: 3,500 credits ($2.80), charged once per world, only when a new export run starts. Cached or in-progress exports are free.
- PLY splat export: "PLY splat exports (`{"asset_type": "splats", "format": "ply"}`) are free."
- Read/get/list/download: not stated explicitly. Unconfirmed.

## 5. API keys and accounts

Quickstart steps:
1. "Sign in to the World Labs Platform (platform.worldlabs.ai) with your Marble account."
2. "Visit the billing page. Add a payment method to your account and then purchase some credits to get started."
3. "Generate an API key from the API keys page" (platform.worldlabs.ai/api-keys).

- Same login: the platform uses the Marble account to sign in. The FAQ says the two are "separate accounts with separate balances" even with the same email (account-billing.md).
- Separate billing: yes. Marble plan credits cannot be used for the API, and API credits cannot be spent in Marble. Credits "cannot be transferred or converted between the two."
- Payment before first use: the quickstart says to add a payment method and purchase credits "to get started." The docs do not explicitly say that free read-only calls fail without credits. The 402 response is documented only for generate and export. Whether GET world or list works with a zero balance is unconfirmed.
- Overage: the pricing page says requests are admitted based on a low-balance threshold, so a balance can go below zero. Excess usage "becomes an overage" and is "charged to your payment method on file" at the end of the monthly period. This means the account is not strictly prepaid.
- The Get Credits endpoint returns 404 for a caller that "is not an API-enabled user."

## 6. Export endpoints and costs

Only one export endpoint exists: `POST /marble/v1/worlds/{world_id}:export`.

Request fields:
- `asset_type`: `splats` or `mesh` (required)
- `format`: `ply` or `glb` (required)
- `resolution` (splats only): `full_res` (default), `500k`, `150k`, `100k`
- `mesh_variant` (mesh only): `textured` (default) or `vertex_colored`

Behavior, quoted from export.md: "PLY splat exports are converted synchronously, cached in GCS, and returned as completed operations. HQ mesh exports reuse the existing async mesh export service and return an in-progress operation."

Costs:
- PLY: free.
- HQ mesh GLB: 3,500 credits. A single run produces both mesh variants.
- Responses: 402 if credits are insufficient.

The docs do not say how long exported download URLs remain valid. Unconfirmed.

## Pages read

- https://docs.worldlabs.ai/llms.txt
- https://docs.worldlabs.ai/api
- https://docs.worldlabs.ai/api/reference/worlds/get.md
- https://docs.worldlabs.ai/api/reference/worlds/list.md
- https://docs.worldlabs.ai/api/reference/worlds/generate.md
- https://docs.worldlabs.ai/api/reference/worlds/export.md
- https://docs.worldlabs.ai/api/reference/operations/get.md
- https://docs.worldlabs.ai/api/reference/credits/get.md
- https://docs.worldlabs.ai/api/reference/openapi.yaml (tail partly summarized)
- https://docs.worldlabs.ai/api/pricing.md
- https://docs.worldlabs.ai/api/faq.md
- https://docs.worldlabs.ai/marble/support/account-billing.md

Not fetched: the delete, media-assets, and pano reference pages, rate limits, errors, and rendering-spz.

