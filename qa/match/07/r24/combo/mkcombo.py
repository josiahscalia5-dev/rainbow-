#!/usr/bin/env python3
"""r24 s07 — RENDER-ONLY combined build: my Screen 07 worktree + the latest Screen 08 code (s08 worker's tree, K16 & m08gl).

No tree / branch holds both lines (the 07 line = 8accdad0 has the r3-era 08 code; the 08 line = 3c0fa97 has no 07 match
code). The user asked that the 07->08 transition is checked with the latest Screen 08, so every 07 clip / join check of
round 24 renders from this throw-away directory. Nothing here is committed or merged into any branch; it is rebuilt from
the two sources before each render:
  * everything from /home/user/wt/s07 (src, assets, public, scripts, tools/match07, configs; node_modules = symlink)
  * from the s08 snapshot (read-only copy of /home/user/wt/s08, see SNAP below):
      - src/world/match08.ts (whole file: the 07 line never changed it after r3) + assets/textures/match08/* (new files)
      - src/gameplay/coins.ts = the s08 file with my 07 parts spliced in (07 trail / picture coins / m07coinsz look);
        the 08 coin look (m08coinv, quiet pop) is limited to non-07 coins so 07 stays exactly as in my build
      - src/world/course.ts = my file + the 08 line's frame-table spacing rule under match08 (keep the default build's
        spacing) combined with my m07sbend grid rule (the S's extra length is a whole number of those steps), so 08 is
        sampled exactly as in the s08 worker's build
usage: python3 -I mkcombo.py <s08snap dir> <combo out dir>
"""
import os, shutil, subprocess, sys
from pathlib import Path

SNAP, OUT = Path(sys.argv[1]), Path(sys.argv[2])
WT = Path('/home/user/wt/s07')

def rd(p): return Path(p).read_text()

def rep(s, old, new, cnt=1):
    assert s.count(old) == cnt, (old[:90], s.count(old))
    return s.replace(old, new)

def between(s, a, b):
    i = s.index(a); j = s.index(b, i)
    return s[i:j]

# ---- 1. copy my worktree (no qa / docs / backups / android / screenshots)
OUT.mkdir(parents=True, exist_ok=True)
def mirror(a, b):  # (no rsync on this machine)
    if b.exists(): shutil.rmtree(b)
    shutil.copytree(a, b, symlinks=True)
for name in ['src', 'assets', 'public', 'scripts']:
    mirror(WT / name, OUT / name)
(OUT / 'tools').mkdir(exist_ok=True)
mirror(WT / 'tools/match07', OUT / 'tools/match07')
for f in ['index.html', 'package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts', 'capacitor.config.ts']:
    shutil.copy2(WT / f, OUT / f)
if not (OUT / 'node_modules').exists():
    os.symlink('/home/user/rainbow-/node_modules', OUT / 'node_modules')

# ---- 2. Screen 08 files from the snapshot
shutil.copy2(SNAP / 'src/world/match08.ts', OUT / 'src/world/match08.ts')
shutil.copytree(SNAP / 'assets/textures/match08', OUT / 'assets/textures/match08', dirs_exist_ok=True)

# ---- 3. coins.ts = s08 file + my 07 parts
mine, c = rd(WT / 'src/gameplay/coins.ts'), rd(SNAP / 'src/gameplay/coins.ts')
c = rep(c, "import coins08px from '../../assets/textures/match08/coins08px.json';\n",
        "import coins08px from '../../assets/textures/match08/coins08px.json';\nimport coins07 from '../../assets/textures/match07/coins07.json';\n")
far = between(mine, '/** `?m07coins=1`', 'export function coinLayout')
c = rep(c, 'export function coinLayout', far + 'export function coinLayout')
c = rep(c, between(c, '  // 07 — winding trail, continuing down the plunge\n', '  // 08 — S toward the platform\n'),
        between(mine, '  // 07 — winding trail, continuing down the plunge\n', '  // 08 — S toward the platform\n'))
c = rep(c, '  if (m08) out.sort((a, b) => a.s - b.s);', '  if (m08 || m07) out.sort((a, b) => a.s - b.s);')
iface = between(mine, '  /** `?match07=1&m07coinsz=1` (look only)', '}\n\nexport function createCoins')
c = rep(c, '  resetUntil(s: number): void;\n}\n', '  resetUntil(s: number): void;\n' + iface + '}\n')
look = between(mine, '  // `?match07=1&m07coinsz=1` (round 7', '\n  let lastT = 0;\n')
c = rep(c, '  // `&m08coinv=1` (Screen 08 scenery r8', look + '\n  let lastT = 0;\n  // `&m08coinv=1` (Screen 08 scenery r8')
c = rep(c, '  const place = (time: number) => {\n    defs.forEach(', '  const place = (time: number) => {\n    lastT = time;\n    defs.forEach(')
c = rep(c, '        const quiet = coinV && d.faceTo;', "        const quiet = coinV && d.faceTo && d.stage !== '07';")
c = rep(c, '      let vis = d.faceTo && (!collected[i] || coinV) ? coinVisual(p, d.scale ?? 1) : 1;',
        "      let vis = d.faceTo && d.stage !== '07' && (!collected[i] || coinV) ? coinVisual(p, d.scale ?? 1) : 1;")
c = rep(c, '      if (coinV && d.faceTo && bS >= 0) vis *=', "      if (coinV && d.faceTo && d.stage !== '07' && bS >= 0) vis *=")
c = rep(c, '      m.compose(p, q, sc.setScalar((d.scale ?? 1) * scale * vis * (collected[i] ? 1 - (time - popT[i]) / 0.35 : 1)));',
        '      const size = (d.scale ?? 1) * scale * vis * (collected[i] ? 1 - (time - popT[i]) / 0.35 : 1);\n'
        '      m.compose(p, q, sc.setScalar(size * lookScale(d, p, size)));')
c = rep(c, '    resetUntil(s) {\n', '    setView(camera, benny, viewH) { vCam = camera; vBenny = benny; vH = viewH; place(lastT); },\n    resetUntil(s) {\n')
(OUT / 'src/gameplay/coins.ts').write_text(c)

# ---- 4. course.ts = my file + the 08 line's spacing rule
s = mine_course = rd(WT / 'src/world/course.ts')
s = rep(s, 'function buildRoute(bendAmp?: number): RouteData {', 'function buildRoute(bendAmp?: number, no08 = false): RouteData {')
s = rep(s, "  const m08 = flag05('match08') || flag05('matchall');\n  const rz = river08.z",
        "  const m08 = !no08 && (flag05('match08') || flag05('matchall'));\n  const rz = river08.z")
# reference spacing: with match08 the DEFAULT build's (no 08 river, no bend) — the 08 line's rule; my bend grid uses it too
s = rep(s, '      const L0 = arc(buildRoute(0).points), n0 = Math.ceil(L0 / 0.25), ds0 = L0 / n0;',
        "      const L0 = arc(buildRoute(0).points);\n"
        "      const dsRef = flag05('match08') || flag05('matchall') ? (() => { const Ld = arc(buildRoute(0, true).points); return Ld / Math.ceil(Ld / 0.25); })() : L0 / Math.ceil(L0 / 0.25);\n"
        "      const ds0 = dsRef, n0 = Math.round(L0 / ds0);")
s = rep(s, '    if (grid07) { this.ds = grid07.ds; this.N = grid07.n + 1; } // r23 m07sbend: the un-bent grid (see above)\n',
        "    if (flag05('match08') || flag05('matchall')) {\n"
        "      const dPts = buildRoute(0, true).points, dCurve = new THREE.CatmullRomCurve3(dPts, false, 'centripetal');\n"
        "      const dM = dPts.length * 24;\n"
        "      let dLen = 0, dPrev = dCurve.getPoint(0);\n"
        "      for (let i = 1; i <= dM; i++) { const p = dCurve.getPoint(i / dM); dLen = dLen + p.distanceTo(dPrev); dPrev = p; }\n"
        "      this.ds = dLen / (Math.ceil(dLen / 0.25));\n"
        "      this.N = Math.ceil(this.length / this.ds) + 1;\n"
        "    } else if (grid07) { this.ds = grid07.ds; this.N = grid07.n + 1; } // r23 m07sbend: the un-bent grid (see above)\n")
(OUT / 'src/world/course.ts').write_text(s)
print('combo ok', OUT)
