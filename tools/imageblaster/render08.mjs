// usage: node tools/marble05/spark/render.mjs <served_dir> <spz> <out.png> [px py pz]
// Serves <served_dir> (render.html + node_modules with three + @sparkjsdev/spark + the .spz) and screenshots the canvas.
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const [dir, spz, out, px = "0", py = "0", pz = "0", frames = "6"] = process.argv.slice(2);
const types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".wasm": "application/wasm", ".json": "application/json" };
const srv = http.createServer((req, res) => {
  const p = path.join(dir, decodeURIComponent(new URL(req.url, "http://x").pathname));
  fs.readFile(p, (e, b) => { if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "content-type": types[path.extname(p)] || "application/octet-stream" }); res.end(b); });
}).listen(0);
const port = srv.address().port;
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
page.on("console", (m) => { if (m.type() === "error" || /initialized|frame/.test(m.text())) console.log("console:", m.type(), m.text()); });
page.on("pageerror", (e) => console.log("pageerror:", e.message));
await page.goto(`http://127.0.0.1:${port}/render.html?spz=${spz}&px=${px}&py=${py}&pz=${pz}&frames=${frames}${process.env.QS ? "&" + process.env.QS : ""}`);
await page.waitForFunction(() => window.__done === true, null, { timeout: 600000, polling: 500 });
const durl = await page.evaluate(() => window.__png);
fs.writeFileSync(out, Buffer.from(durl.split(",")[1], "base64"));
await browser.close(); srv.close();
console.log("wrote", out);
