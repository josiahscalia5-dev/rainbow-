// r23 (QA only): Vite dev server for this worktree that may also serve the symlinked node_modules
// (/home/user/wt/s06/node_modules -> /home/user/rainbow-/node_modules; without this the HUD fonts are refused and fall back).
import { realpathSync } from 'node:fs';
export async function startVite(port = 5276) {
  const { createServer, searchForWorkspaceRoot } = await import('vite');
  const root = process.cwd();
  const allow = [searchForWorkspaceRoot(root), realpathSync(`${root}/node_modules`)];
  const server = await createServer({ server: { port, strictPort: false, host: '127.0.0.1', hmr: false, watch: { ignored: ['**/*'] }, fs: { allow } }, logLevel: 'error' });
  await server.listen();
  const addr = server.resolvedUrls?.local?.[0] ?? `http://127.0.0.1:${port}/`;
  return { url: addr.replace(/\/$/, ''), close: () => server.close() };
}
