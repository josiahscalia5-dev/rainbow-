import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const { chromium } = loadPlaywright(); const vite = await startVite(5267); const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 } });
  await page.goto(`${vite.url}/?qa=1&dpr=1&match08=1`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  await page.evaluate(() => window.__rainbow.goto('08'));
  const out = await page.evaluate(() => {
    const { scene } = window.__rainbow.qa3d(); let b = null; scene.traverse((o) => { if (!b && o.name === 'Benny') b = o; });
    const chain = (n) => { const o = b.getObjectByName(n); const a = []; let p = o; while (p && p !== b) { a.push(p.name + "(" + p.type + ")"); p = p.parent; } return n + ": " + a.join(" < "); }; return ["hat_crown","hat_brim","pom","fur_body","fur_armL","eyeL_happy"].map(chain).join("\n") + "\nmap crown: " + !!b.getObjectByName("hat_crown").material.map;
    
  });
  console.log(out);
} finally { await browser.close(); await vite.close?.(); }
