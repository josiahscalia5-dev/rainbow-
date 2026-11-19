#!/usr/bin/env node
// Builds the canonical character GLBs from the procedural builders and renders turntables.
//   node scripts/export-models.mjs [benny] [girl] [--turntable-only] [--anim=walk --t=0.4]
import { writeFileSync, mkdirSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite, waitDone } from './lib/pw.mjs';

const args = process.argv.slice(2);
const models = args.filter((a) => !a.startsWith('--'));
const list = models.length ? models : ['benny', 'girl'];
const turntableOnly = args.includes('--turntable-only');
const extra = args.filter((a) => a.startsWith('--') && a.includes('=')).map((a) => a.slice(2)).join('&');
const fileName = { benny: 'benny.glb', girl: 'rainbow_girl.glb' };

const { chromium } = loadPlaywright();
const vite = await startVite();
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
mkdirSync('assets/models', { recursive: true });
mkdirSync('docs/characters', { recursive: true });
try {
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
  await browser.close();
  await vite.close();
}
