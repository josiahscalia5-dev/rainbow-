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

/**
 * Cross-process render slots (2026-11-16, full reference match): several specialists capture the game at the same time on
 * 4 shared cores with software WebGL; unlimited parallel captures time out and change timing-dependent HUD pixels. Every
 * script that starts the dev server waits here for one of RAINBOW_RENDER_SLOTS (default 2) slots and frees it on close /
 * exit. A slot whose owner process is gone is taken over; after 40 minutes of waiting the script runs anyway.
 */
async function acquireRenderSlot() {
  const { mkdirSync, writeFileSync, readFileSync, rmSync } = await import('node:fs');
  const slots = Math.max(1, Number(process.env.RAINBOW_RENDER_SLOTS ?? 2));
  const t0 = Date.now();
  const alive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
  for (;;) {
    for (let i = 0; i < slots; i++) {
      const dir = `/tmp/rainbow-render-slot-${i}`;
      try {
        mkdirSync(dir);
        writeFileSync(`${dir}/pid`, String(process.pid));
        const free = () => { try { rmSync(dir, { recursive: true, force: true }); } catch { /* */ } };
        process.on('exit', free);
        for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { free(); process.exit(1); });
        return free;
      } catch {
        let pid = NaN;
        try { pid = Number(readFileSync(`${dir}/pid`, 'utf8')); } catch { /* being created */ }
        if (Number.isFinite(pid) && !alive(pid)) { try { rmSync(dir, { recursive: true, force: true }); } catch { /* */ } }
      }
    }
    if (Date.now() - t0 > 40 * 60 * 1000) return () => {};
    await new Promise((r) => setTimeout(r, 1500));
  }
}

/** start a Vite dev server for the project and return { url, close } */
export async function startVite(port = 5199) {
  const free = await acquireRenderSlot();
  const { createServer } = await import('vite');
  const server = await createServer({ server: { port, strictPort: false, host: '127.0.0.1', hmr: false, watch: { ignored: ['**/*'] } }, logLevel: 'error' });
  await server.listen();
  const addr = server.resolvedUrls?.local?.[0] ?? `http://127.0.0.1:${port}/`;
  return { url: addr.replace(/\/$/, ''), close: async () => { try { await server.close(); } finally { free(); } } };
}

export async function waitDone(page, timeoutMs = 180000) {
  await page.waitForFunction(() => window.__done === true, null, { timeout: timeoutMs });
  const err = await page.evaluate(() => window.__error);
  if (err) throw new Error(err);
}
