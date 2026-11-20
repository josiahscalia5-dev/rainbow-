# Screen06 World Labs job

This standard-library Python client prepares and submits **one private `marble-1.1` image job** for the purple perforated washer tunnel, broad gold bands, and descending cyan/pink slide. It preserves the input image. Generated geometry still requires visual inspection and game integration; a precise visual match is not guaranteed. Screen07 is a later task and has no automatic job here.

## Current access and budget

The task owner verified **5,420 API credits in the platform dashboard**. The workspace's earlier unauthenticated `GET /marble/v1/credits` returned **401**. A browser login is not an API credential. Network commands require `WLT_API_KEY` securely bound to the process environment. Do not put the value in chat, command arguments, source files, request JSON, or logs. This client does not create, retrieve, configure, or print a key.

[Official pricing](https://docs.worldlabs.ai/api/pricing), checked **2026-11-20**, lists **1,580 credits** for a standard `marble-1.1` non-panorama image job: 1,500 for world generation plus 80 for panorama generation. The expected remaining balance from 5,420 is **3,840**, absent other activity. The runner requires a sufficient live balance, fixes the client ceiling at 5,420, and records the API's settled `operation.cost` and before/after balances. It refuses a new start when the price verification is more than seven days old. There is no documented server-side `max_cost` field; the local ceiling cannot prevent a provider tariff change or other account activity. Balance differences are not a reliable per-job charge when concurrent activity occurs.

The API charges **3,500 credits** for a new HQ mesh export. This client has no export, purchase, auto-refill, or repeat-generation operation. Media upload and operation polling do not consume credits under the cited pricing.

## Reference selection still needs visual approval

`assets/textures/match06/plate06_hybrid.png` is **not selected for generation**. Inspection found mirrored/stretched repair artifacts in the removed character area, upper strip, and water crest. The selected input is the user's already approved, untouched original `references/06_crest_the_rinse_arch.png`, visually inspected by the coordinating agent and verified at SHA-256 `3946058c0893e97a99dd5015f3197901859475cd7ef55e09d982d232951441fe`. The supplied text prompt requests the environment without Benny or the HUD; the image itself is preserved exactly. Offline job `s06-approved-reference` has been prepared locally. Its provenance is recorded in `docs/chatgpt-s06/WORLDLABS_PREPARED_INPUT.json`; that copy is a preparation receipt, not an active attempt or proof of a submitted job. No paid API request has been made. The CLI requires an explicit input path, records its exact bytes, and never edits the image or silently chooses a replacement.

Run from the repository root with Python **3.11+** on Linux:

```bash
python tools/chatgpt/worldlabs_s06.py prepare \
  --request-json tools/chatgpt/worldlabs_s06.request.json \
  --input /absolute/path/to/visually-approved-screen06.png \
  --job s06-first
```

Preparation is offline and needs no credential. It writes the request, exact input path, SHA-256 hashes, correlation ID, and budget record to `.cache/worldlabs-s06/s06-first/`, already ignored by the repository. It refuses to overwrite an existing job. A prepared `media_asset_id` is a placeholder until a signed upload succeeds; it is never sent as the real ID. Upload extension and MIME type are detected from the bytes, so an original JPEG with a `.png` filename can be uploaded correctly without modifying its contents.

## Read-only GitHub authentication check

`.github/workflows/check-worldlabs-access.yml` runs only `credits`. It supports manual dispatch and a push trigger restricted to the isolated candidate branch and that exact workflow path; it cannot trigger from other branches. The push option allows a check without merging the workflow to the default branch. The job uses `contents: read`, an SHA-pinned checkout, existing system Python, a five-minute timeout, and a step-local environment binding to the repository secret named `WLT_API_KEY`. It has no tracing, environment dump, artifact upload, generation, export, or secret-creation command. A missing binding fails with an explicit safe message. This workflow has been prepared for review, not executed here.

Paid generation is not implemented in CI. A fresh runner loses the local duplicate-attempt marker, so a paid CI implementation would require durable attempt/receipt recovery before it could safely use `start`.

## Execute once after secure credential binding

```bash
python tools/chatgpt/worldlabs_s06.py credits
python tools/chatgpt/worldlabs_s06.py start --job s06-first
python tools/chatgpt/worldlabs_s06.py resume --job s06-first --max-seconds 600 --interval 15
```

The first command is read-only. `start` checks the exact prepared bytes and current balance, obtains the API's signed PUT upload contract, uploads those same bytes, then submits a single private generation request. The API key is sent only to `https://api.worldlabs.ai`; signed uploads and asset downloads use a separate unauthenticated opener. Both use Python's normal configured proxy settings and reject redirects. Upload header instructions cannot inject authentication or transport-control headers.

Before the generation POST, an exclusive, fsynced task-wide `generation-attempt.json` marker is created. The process also holds a lock. Every later `start` is blocked, including after a timeout, disconnection, malformed response, HTTP failure, or interruption. An operation ID is saved before the later balance check. No mutation is automatically retried.

**Keep the job directory and task-wide attempt marker intact.** The duplicate-attempt guard is local to this workspace; deleting or losing those files removes its memory. Do not delete them or create a replacement job to recover from an uncertain submission. If the provider received the job but the response was lost, recover its operation ID from the provider and attach it read-only:

```bash
python tools/chatgpt/worldlabs_s06.py resume --job s06-first --operation-id THE_EXISTING_OPERATION_ID --once
```

This stores the recovered ID and verifies the job's correlation tag when the world completes. It never submits another generation. `resume --once` makes one status request; ordinary resume polls every 15 seconds by default, accepts intervals of 1–30 seconds, and has a bounded total runtime including downloads. Exit code 0 means the requested stage finished; 3 means pending, interrupted, or incomplete assets; 2 means a reported failure requiring inspection.

## Receipts and generated assets

`state.json` records sanitized API responses, local/server request identifiers when supplied, operation/world IDs, and budget snapshots. It excludes headers, upload instructions, API credentials, and URLs. The exact API-bound request is saved separately without credentials. Signed URLs are held only in memory and fetched again on resume.

Resume downloads only SPZ variants, the collider, and the panorama URLs supplied in the generated world. Files go under the job's ignored `results/` directory with fixed role-based names, safe suffixes, atomic completion, and a SHA-256 `manifest.json`. Existing files are reused only after their hashes match. A download failure can be resumed without generation or export. Asset files are limited to 2 GiB each; the explicit image input is limited to 20 MiB as a conservative client policy. The receipt will identify missing API asset roles instead of claiming every output is present.

No credentialed call, image upload, generation, HQ export, or billable request was made while preparing this client.

## API references

- [Generate a world](https://docs.worldlabs.ai/api/reference/worlds/generate)
- [Prepare media upload](https://docs.worldlabs.ai/api/reference/media-assets/prepare-upload)
- [Get operation and settled cost](https://docs.worldlabs.ai/api/reference/operations/get)
- [Get API credits](https://docs.worldlabs.ai/api/reference/credits/get)
- [OpenAPI schema](https://docs.worldlabs.ai/api/reference/openapi)
- [Model identifiers](https://docs.worldlabs.ai/api/models)
- [Pricing and overage behavior](https://docs.worldlabs.ai/api/pricing)
