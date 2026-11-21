# Subagent agent-ad91fcfe78cecfe93 — session 0b75226b-8a40-5a2a-98c8-95d5f5e274d8

### 🧑 User — 2026-11-20T19:25:25.137Z

Read these two official pages and answer precisely (quote short key phrases where useful):
1. https://engine.needle.tools/docs/three/needle-devtools-for-threejs-chrome-extension/
2. https://engine.needle.tools/docs/ai/needle-mcp-server/

Questions:
a) What is Needle Inspector (the three.js Chrome DevTools extension)? Which browsers does it support, how is it installed (Chrome Web Store only, or also a downloadable/unpacked build or npm package)? Does it work with any three.js app (plain three.js / Vite, not built with Needle Engine)? Any minimum three.js version or requirement (e.g. the app must expose the renderer/scene via __THREE_DEVTOOLS__ or similar)?
b) Which features are free and which require Pro (especially the MCP server and the "development server editing" / saving edits back to source)? What does Pro cost (price, billing period) if the page says, and where is it purchased?
c) How does the Needle MCP server work for Claude Code exactly: exact command(s) to add it (e.g. `claude mcp add ...`), transport (stdio/HTTP/SSE), URL/port, whether it needs the browser extension running in a visible Chrome with DevTools open, whether it needs a Needle account/login/licence key, and whether it can work with a headless browser (Playwright/headless Chromium) on a remote Linux server.
d) What tools/capabilities does the MCP expose (inspect scene graph, read/modify objects, materials, cameras, screenshots, etc.)?
e) Any stated limitations relevant to: a remote cloud Linux container with no desktop, headless Chromium only, no Chrome Web Store access.
Keep the answer factual and concise (bullets). If a page fails to load, say so.

### 🤖 Claude — 2026-11-20T19:25:26.875Z

> 🔧 **WebFetch** `{"url": "https://engine.needle.tools/docs/three/needle-devtools-for-threejs-chrome-extension/", "prompt": "Extract everything relevant: what Needle Inspector / Needle DevTools is; supported browsers; installation methods (Chrome Web Store, unpacked, npm, etc.); whether it works with any three.js app (plain three.js/Vite) and any minimum three.js version or setup requirement (e.g. __THREE_DEVTOOLS__ or exposing renderer/scene); which features are free vs Pro (MCP server, development server editing, saving edits back to source); Pro price and billing period and where to buy; MCP server setup for …[+243 chars]`

### 🤖 Claude — 2026-11-20T19:25:27.812Z

> 🔧 **WebFetch** `{"url": "https://engine.needle.tools/docs/ai/needle-mcp-server/", "prompt": "Extract everything relevant: what the Needle MCP server is; exact setup commands (e.g. claude mcp add), transport (stdio/HTTP/SSE), URL/port; whether the browser extension must be running in a visible Chrome with DevTools open; whether a Needle account/login/licence key is needed; whether headless browsers or remote Linux servers are supported; the MCP tools and capabilities (scene graph, object/material/camera edits, screenshots, etc.); Pro vs free requirements; stated limitations. Quote short key phrases verbatim."}`

### 🧑 User — 2026-11-20T19:25:28.182Z

> ↩︎ result: Fetched https://engine.needle.tools/docs/three/needle-devtools-for-threejs-chrome-extension/ from a non-preapproved source (HTTP 200 OK, text/html, 28739 characters).
> <fetched-web-content>
>      Needle Inspector — three.js Debugger & Chrome DevTools Extension | docs   
> 
> [docs](/docs/)
> 
> [Getting Started](/docs/getting-started/)
> 
> [Tutorials](/docs/tutorials/)
> 
> [How-To Guides](/docs/how-to-guides/)
> 
> [Explanation](/docs/explanation/)
> 
> [Reference](/docs/reference/)
> 
> [Help](/docs/help/)
> 
> searchSearch
> 
> [Getting Started](/docs/getting-started/)
> 
> [Tutorials](/docs/tutorials/)
> 
> [How-To Guides](/docs/how-to-guides/)
> 
> [Explanation](/docs/explanation/)
> 
> [Reference](/docs/reference/)
> 
> [Help](/docs/help/)
> 
>   
> 
> ![three.js Logo](/docs/imgs/threejs-logo.webp "three.js Logo") + ![Chrome Logo](/docs/imgs/chrome-logo.webp "Chrome Logo")
> 
> [Needle Inspector — DevTools and MCP for three.js](#needle-inspector-devtools-and-mcp-for-three.js)
> ===================================================================================================
> 
> The **Needle Inspector** brings Chrome DevTools for three.js to your browser. Use this free Chrome extension to inspect and debug three.js, React Three Fiber (react-three- …[+27742 chars]

### 🧑 User — 2026-11-20T19:25:29.059Z

> ↩︎ result: Fetched https://engine.needle.tools/docs/ai/needle-mcp-server/ from a non-preapproved source (HTTP 200 OK, text/html, 12257 characters).
> <fetched-web-content>
>      Needle MCP Server — Local AI for Needle | docs   
> 
> [docs](/docs/)
> 
> [Getting Started](/docs/getting-started/)
> 
> [Tutorials](/docs/tutorials/)
> 
> [How-To Guides](/docs/how-to-guides/)
> 
> [Explanation](/docs/explanation/)
> 
> [Reference](/docs/reference/)
> 
> [Help](/docs/help/)
> 
> searchSearch
> 
> [Getting Started](/docs/getting-started/)
> 
> [Tutorials](/docs/tutorials/)
> 
> [How-To Guides](/docs/how-to-guides/)
> 
> [Explanation](/docs/explanation/)
> 
> [Reference](/docs/reference/)
> 
> [Help](/docs/help/)
> 
>   
> 
> ![Needle Logo](/docs/logo.png "Needle Logo") + ![MCP Logo](/docs/imgs/mcp-logo.webp "MCP Logo")
> 
> [Needle MCP Server — Local AI for Needle](#needle-mcp-server-local-ai-for-needle)
> =================================================================================
> 
> Talk to your AI assistant about your local and online 3D scenes! Connect Claude, Cursor, or other AI tools to the Needle MCP Server so you can explore your three.js scenes, edit objects, and get help — all through natural conversation.
> 
> ### [Quick Start](#quick-start)
> 
> 1.  [Configure your …[+11239 chars]

### 🤖 Claude — 2026-11-20T19:25:40.620Z

**Sources read:** https://engine.needle.tools/docs/three/needle-devtools-for-threejs-chrome-extension/ and https://engine.needle.tools/docs/ai/needle-mcp-server/ (both HTTP 200, both pages fetched in full).

**a) Needle Inspector and install**
- It is a free Chrome extension that inspects three.js, React Three Fiber, and Needle Engine scenes with WebGL and WebGPU renderers. Pages describe it as "Chrome DevTools for three.js."
- Browsers: "Google Chrome or a Chromium-based browser." The page names Edge, Brave, Arc, and Opera. Firefox and Safari are not mentioned.
- Install: Chrome Web Store only. The docs give the store URL and "Add to Chrome." They mention no unpacked build, npm package, or other download.
- Usage: open a page with a three.js scene, click the Needle toolbar icon to enable the Inspector for that site (the page reloads), then pick objects in the hierarchy.
- Plain three.js/Vite: supported. The page lists "Any three.js-based framework," and says "Do I need Needle Engine? No. The inspector works on any three.js scene." Localhost and LAN dev servers "including projects served with Vite or webpack" are supported.
- Minimum version and setup: the page only says "modern three.js versions." It does not mention `__THREE_DEVTOOLS__` or any app-side hook. Detection "can vary with the three.js version and how the site creates its scene."

**b) Free vs Pro**
- Free: scene hierarchy, search, live inspection, performance stats, free-fly camera, node graphs (viewing), code view (your own source), and property editing on ordinary public websites. Also asset library browsing, a limited camera timeline, and resource previews.
- Pro: live property editing on development servers (localhost, LAN, and supported dev/preview/staging hosts), "Inspector MCP tools & AI editing," "Save Edits (JSON/text)," GLB export, full resource list, node-graph drill-down, full generated shader code, longer camera animations with JSON import/export, and applying assets.
- Saving edits back to source: the page's workflow is File → Save Edits (JSON), then the user or an AI agent applies the JSON to source. Saving edits requires Pro. The page also says that with MCP, an agent can call `get_edits` to pull pending edits and apply them to source.
- Price: the page does not state a price. It says the price "is always shown in the extension (Get Pro in the toolbar)," and that it is "a one-time purchase — no subscription." It is also included with Needle Engine Pro licenses.
- Where to buy: https://cloud.needle.tools/buy/needle-inspector-pro, or the Get Pro button in the toolbar. Purchase requires signing in or creating a Needle account.

**c) Needle MCP server with Claude Code**
- Exact command: `claude mcp add --scope user --transport stdio needle -- npx -y needle-cloud mcp`
- Transport: stdio (the default). The page also documents an HTTP alternative: run `npx needle-cloud start` and connect to `http://localhost:8424/mcp`. The page says the stdio setup "also supports Needle Inspector tools."
- Then start or restart Claude Code and check the connection with `/mcp`.
- The stdio command "reuses or starts the shared local server at localhost:8424." Node/npx must be available.
- Browser requirement: Inspector-specific tools need the Inspector open in Chrome. The page says "When you have the Needle Inspector open in Chrome, additional tools become available." Built-in MCP tools work without it. The page does not say the browser must be visible or that DevTools must be open.
- Account or licence: the MCP setup steps mention no login or key. The Inspector MCP tools and AI editing require Pro, and buying Pro requires a Needle account.
- Headless Chromium or remote Linux: the pages do not address this at all.

**d) MCP tools**
- Built-in, always available (no Inspector needed): Search (Needle Engine docs and forum, semantic), Load Needle Skill, Get Project Path, Get Scene Path, Get Web Project Path, Get Log Path, Read File, Search Files, List Files, Read Log, Read glTF/GLB.
- Inspector tools: the page says the agent "reads the hierarchy, inspects objects, changes properties, and pulls your pending edits (`get_edits`)." It also says changes "appear instantly in your browser." The full list is in the Inspector settings, and the page does not enumerate it. Screenshots, camera control, and materials/cameras as dedicated tools are not named.
- Blender-specific tools exist but do not apply to three.js.

**e) Limitations relevant to your setup**
- No Chrome Web Store access: the only documented install path is the Web Store, so there is no documented way to install the extension otherwise.
- Headless or no desktop: not mentioned. The docs assume a browser with the extension running. Whether a headless Chromium can load the extension is not stated.
- Dev-server editing: Pro only. Edits can be lost: "a reload or hot update can replace edited objects."
- Detection depends on the three.js version and how the site creates its scene.
- Data: inspection runs in the browser. With your own MCP client, scene context goes directly to that client, not through Needle Cloud.
- Pro is a one-time purchase, but the price is not on the page.

