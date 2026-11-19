// Optional preload for the existing QA scripts when Chromium is installed by the host rather
// than Playwright. Example: node --import ./scripts/use-installed-chromium.mjs scripts/perf05.mjs ...
// No package downloads, browser installation, production code or historical QA scripts change.
import { existsSync } from 'node:fs';
import { loadPlaywright } from './lib/pw.mjs';

const path = process.env.CHROMIUM_EXECUTABLE_PATH
  || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
if (path) {
  const { chromium } = loadPlaywright();
  const launch = chromium.launch.bind(chromium);
  chromium.launch = options => launch({ ...options, executablePath: path });
}
