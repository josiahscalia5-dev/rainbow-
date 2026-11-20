#!/usr/bin/env node
// Development adapter for scripts/export-models.mjs in the managed ChatGPT runtime.
// Keeps the repository's procedural builders and exports unchanged; only selects
// the preinstalled Playwright package and system Chromium. Downloads no browser.
// Run from the project root:
//   node tools/chatgpt/export-models-runtime.mjs benny girl
import { writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { loadPlaywright, CHROMIUM_ARGS, startVite, waitDone } from '../../scripts/lib/pw.mjs';

const args = process.argv.slice(2);
const models = args.filter((a) => !a.startsWith('--'));
const list = models.length ? models : ['benny', 'girl'];
const turntableOnly = args.includes('--turntable-only');
const extra = args.filter((a) => a.startsWith('--') && a.includes('=')).map((a) => a.slice(2)).join('&');
const fileName = { benny: 'benny.glb', girl: 'rainbow_girl.glb' };

const runtimeModules = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
const { chromium } = runtimeModules
  ? createRequire(join(runtimeModules, 'runtime-resolve.cjs'))('playwright')
  : loadPlaywright();
const vite = await startVite();
let browser;
mkdirSync('assets/models', { recursive: true });
mkdirSync('docs/characters', { recursive: true });
try {
  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium',
    headless: true,
    args: [...CHROMIUM_ARGS, '--no-sandbox'],
  });
  for (const m of list) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 560 } });
    page.on('console', (msg) => { if (msg.type() === 'error') console.error(`[${m}] ${msg.text()}`); });
    if (!turntableOnly) {
      await page.goto(`${vite.url}/tools/model-lab.html?model=${m}&mode=export`);
      await waitDone(page);
      const b64 = await page.evaluate(() => window.__glbBase64);
      const info = await page.evaluate(() => window.__info);
      writeFileSync(`assets/models/${fileName[m]}`, Buffer.from(b64, 'base64'));
      console.log(`exported assets/models/${fileName[m]}`, JSON.stringify(info));
    }
    await page.goto(`${vite.url}/tools/model-lab.html?model=${m}&mode=turntable${extra ? '&' + extra : ''}`);
    await waitDone(page);
    const suffix = extra ? '_' + extra.replace(/[^a-z0-9]+/gi, '_') : '';
    const out = `docs/characters/${m}_turntable${suffix}.png`;
    await page.locator('#lab').screenshot({ path: out });
    console.log('turntable', out, JSON.stringify(await page.evaluate(() => window.__info)));
    await page.close();
  }
} finally {
  if (browser) await browser.close();
  await vite.close();
}
