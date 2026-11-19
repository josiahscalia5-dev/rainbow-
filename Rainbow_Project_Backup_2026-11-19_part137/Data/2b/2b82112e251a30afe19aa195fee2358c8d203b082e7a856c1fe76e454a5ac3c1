// Resolve the Playwright that is pre-installed in this environment (global node_modules),
// falling back to a local install. Chromium launch flags give WebGL2 via SwiftShader headless.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

export function loadPlaywright() {
  try {
    return createRequire(import.meta.url)('playwright');
  } catch {
    const root = execSync('npm root -g').toString().trim();
    return createRequire(join(root, 'noop.js'))('playwright');
  }
}

export const CHROMIUM_ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

/** start a Vite dev server for the project and return { url, close } */
export async function startVite(port = 5199) {
  const { createServer } = await import('vite');
  const server = await createServer({ server: { port, strictPort: false, host: '127.0.0.1' }, logLevel: 'error' });
  await server.listen();
  const addr = server.resolvedUrls?.local?.[0] ?? `http://127.0.0.1:${port}/`;
  return { url: addr.replace(/\/$/, ''), close: () => server.close() };
}

export async function waitDone(page, timeoutMs = 180000) {
  await page.waitForFunction(() => window.__done === true, null, { timeout: timeoutMs });
  const err = await page.evaluate(() => window.__error);
  if (err) throw new Error(err);
}
