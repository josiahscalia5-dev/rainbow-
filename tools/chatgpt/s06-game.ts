/** Development-only entry wrapper; original game source is imported without changes. */
type ModelOwner = Window & { __rainbowReviewModels?: Map<string, Blob> };
const runtime = { modelSources: {} as Record<string, string>, errors: [] as string[] };
(window as unknown as { __rainbowReviewRuntime: typeof runtime }).__rainbowReviewRuntime = runtime;
if (!import.meta.env.DEV) throw new Error('The Screen 06 review wrapper is development-only.');
window.addEventListener('error', (event) => runtime.errors.push(String(event.message)));
window.addEventListener('unhandledrejection', (event) => runtime.errors.push(String(event.reason)));
const priorConsoleError = console.error.bind(console);
console.error = (...args: unknown[]) => { runtime.errors.push(args.map(String).join(' ').slice(0, 2000)); priorConsoleError(...args); };

// The review's explicit model-builder buttons populate this map with genuine GLB exports.
// Only the two exact character requests may be replaced; every other fetch is unchanged.
const models = new Map<string, Blob>();
if (new URLSearchParams(location.search).get('reviewModels') === '1') {
  for (const name of ['benny.glb', 'rainbow_girl.glb']) {
    let blob: Blob | undefined;
    try { blob = (window.parent as ModelOwner).__rainbowReviewModels?.get(name); } catch { /* independent tab */ }
    if (!blob && 'caches' in window) {
      try {
        const cache = await caches.open('rainbow-development-models-v1');
        const response = await cache.match(new URL(`../../assets/models/${name}`, import.meta.url).href);
        if (response) blob = await response.blob();
      } catch (error) { runtime.errors.push(`Model cache: ${String(error)}`); }
    }
    if (blob) { models.set(new URL(`../../assets/models/${name}`, import.meta.url).pathname, blob); runtime.modelSources[name] = `original procedural builder, browser copy (${blob.size} bytes)`; }
    else runtime.modelSources[name] = 'repository request; no browser rebuild available';
  }
}
const originalFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const requestUrl = new URL(input instanceof Request ? input.url : String(input), location.href);
  const model = requestUrl.origin === location.origin ? models.get(requestUrl.pathname) : undefined;
  const method = init?.method ?? (input instanceof Request ? input.method : 'GET');
  if (model && method.toUpperCase() === 'GET') return new Response(model, { status: 200, headers: { 'Content-Type': 'model/gltf-binary', 'Content-Length': String(model.size) } });
  return originalFetch(input, init);
};
await import('../../src/main');
export {};
