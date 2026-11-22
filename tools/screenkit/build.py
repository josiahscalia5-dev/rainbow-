"""Rainbow screen kit - INCREMENTAL, CACHED builder (round 45). One command from a screen's approved picture to a playable, pre-baked game
folder, re-running ONLY the steps whose inputs changed. Every step's output is stored once in a content-addressed cache
($RAINBOW_BUILD_CACHE, default ~/.cache/rainbow-build) under the SHA-256 of exactly the inputs that step reads, so:
  * a change to a material / water shader in screen.html or world.html  -> nothing is rebuilt (only the game folder is re-assembled, < 1 s)
  * a change to the bake / template-sampling code (bake.js)               -> only the bake runs again (Blender + masks are reused)
  * a change to a look value in layout.json (palette, splash, coins ...) -> Blender is NOT re-run (geometry key = GEOM_KEYS of blender_kit.py)
  * a change to the geometry (fit / blender_kit.py / the GN asset library) -> Blender + bake, masks reused
Steps (each timed; build_report.json + build_report.md in the workspace):
  depth     Depth Anything V2 cross-check of the picture (optional guide for the fit)     key: picture + model
  fit       tools/screenkit/screens/NN/fitNN.py -> layout.json (camera, drum, route, ...)   key: fit script + fitlib + picture + depth + args
  layout    world transforms of the fitted layout (scale to the ONE Benny, drum overrides) key: fit + transforms (no cache needed: < 0.1 s)
  segment   SAM 2.1 masks of what the game draws itself + clean plate                     key: picture + segNN.json + segment code + models
  gnlib     the reusable Geometry Nodes asset library (tools/screenkit/gn_assets.py)        key: gn_assets.py
  geometry  Blender 5.3 builds scene.glb from the layout (tools/screenkit/blender_kit.py)   key: GEOM_KEYS of the layout + blender_kit.py + gnlib
  bake      the approved picture baked ONCE onto the meshes + the artwork-sampled materials (wall / ring / tray templates, water swatches)
            (tools/screenkit/bake.js run by screen_export.cjs)                                key: scene.glb + cams + plate + mask + bake.js + export script
  assemble  the runnable game folder (page, shared game code, Benny, pre-baked textures)    always (fast)
  preview   automated stills: beginning / middle / curves / end x left / centre / right lanes, gray + sentinel geometry test,
            likeness at the picture camera (tools/screenkit/preview.cjs)                       key: the assembled folder's files
  python3 -I tools/screenkit/build.py <NN> <workspace> [--tube-len L] [--open-end] [--benny-h H] [--drum-far-end] [--set k=json ...]
                                       [--no-preview] [--force step,step] [--quiet]
The game folder <workspace>/game opens pre-baked (play3.html?prebaked=1 is the default there); ?live=1 re-bakes in the browser.
Free tools only (Blender, three.js, onnxruntime, Playwright); no paid service.
"""
import argparse, ast, hashlib, json, os, shutil, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
CACHE = os.environ.get('RAINBOW_BUILD_CACHE', os.path.expanduser('~/.cache/rainbow-build'))
MODELS = os.environ.get('RAINBOW_MODELS', os.path.expanduser('~/.cache/rainbow-models'))
NODE_MODULES = '/tmp/rainbow_r34/node_modules'


# ----------------------------------------------------------------------------------------------------------- hashing + cache
def h_bytes(*parts):
    h = hashlib.sha256()
    for p in parts:
        h.update(p if isinstance(p, bytes) else str(p).encode()); h.update(b'\0')
    return h.hexdigest()


def h_file(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''): h.update(b)
    return h.hexdigest()


def h_files(paths):
    return h_bytes(*[f'{os.path.relpath(p, REPO) if p.startswith(REPO) else os.path.basename(p)}:{h_file(p)}' for p in paths])


def h_dir(d):
    out = []
    for root, _, files in sorted(os.walk(d)):
        for f in sorted(files): p = os.path.join(root, f); out.append(f'{os.path.relpath(p, d)}:{h_file(p)}')
    return h_bytes(*out)


def h_obj(o):
    return h_bytes(json.dumps(o, sort_keys=True, separators=(',', ':')))


def place(src, dst):
    """materialise a cached file / folder at dst (hard links: no copy, no extra disk)"""
    if os.path.isdir(dst) and not os.path.islink(dst): shutil.rmtree(dst)
    elif os.path.lexists(dst): os.remove(dst)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if os.path.isdir(src): shutil.copytree(src, dst, copy_function=_link_or_copy)
    else: _link_or_copy(src, dst)


def _link_or_copy(s, d):
    try: os.link(s, d)
    except OSError: shutil.copy2(s, d)


class Build:
    def __init__(self, ws, quiet=False, force=()):
        self.ws = ws; self.quiet = quiet; self.force = set(force); self.steps = []; self.t0 = time.time()

    def log(self, *a):
        if not self.quiet: print(*a, flush=True)

    def step(self, name, key, outputs, fn, cache=True):
        """outputs = {cache-relative name: workspace path}. fn(tmpdir) must write every output into tmpdir/<name>."""
        t = time.time(); cdir = os.path.join(CACHE, name, key[:24]); ok = os.path.join(cdir, '.ok'); status = 'cached'
        if not cache or name in self.force or not os.path.exists(ok):
            tmp = cdir + f'.tmp{os.getpid()}'; shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp)
            fn(tmp)
            for n in outputs:
                if not os.path.exists(os.path.join(tmp, n)): raise SystemExit(f'step {name}: output {n} missing')
            shutil.rmtree(cdir, ignore_errors=True); os.rename(tmp, cdir); open(ok, 'w').write(time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()))
            status = 'built'
        for n, dst in outputs.items(): place(os.path.join(cdir, n), dst)
        dt = time.time() - t; self.steps.append({'step': name, 'status': status, 'seconds': round(dt, 2), 'key': key[:16]})
        self.log(f'  {name:9s} {status:7s} {dt:6.1f} s   ({key[:10]})'); return cdir

    def timed(self, name, fn):
        t = time.time(); r = fn(); dt = time.time() - t; self.steps.append({'step': name, 'status': 'ran', 'seconds': round(dt, 2)}); self.log(f'  {name:9s} ran     {dt:6.1f} s'); return r

    def report(self, extra=None):
        rep = {'workspace': self.ws, 'total_seconds': round(time.time() - self.t0, 2), 'steps': self.steps, **(extra or {})}
        json.dump(rep, open(os.path.join(self.ws, 'build_report.json'), 'w'), indent=1)
        md = ['| step | result | seconds |', '|---|---|---|'] + [f"| {s['step']} | {s['status']} | {s['seconds']} |" for s in self.steps]
        md.append(f"| **total** | | **{rep['total_seconds']}** |")
        open(os.path.join(self.ws, 'build_report.md'), 'w').write('\n'.join(md) + '\n'); return rep


def run(cmd, log=None, cwd=REPO, env=None):
    e = dict(os.environ, **(env or {}))
    r = subprocess.run(cmd, cwd=cwd, env=e, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if log: open(log, 'w').write(r.stdout)
    if r.returncode: raise SystemExit(f'FAILED ({r.returncode}): {" ".join(cmd)}\n' + r.stdout[-3000:])
    return r.stdout


def geom_keys():
    """the layout keys blender_kit.py reads (declared there as GEOM_KEYS): only these decide whether Blender must run again"""
    src = open(os.path.join(HERE, 'blender_kit.py')).read(); tree = ast.parse(src)
    for n in tree.body:
        if isinstance(n, ast.Assign) and any(getattr(t, 'id', '') == 'GEOM_KEYS' for t in n.targets): return ast.literal_eval(n.value)
    raise SystemExit('blender_kit.py: GEOM_KEYS missing')


BAKE_KEYS = ('cams', 'fov', 'img', 'focal_px', 'bake_res', 'bake_dens', 'foam_from_picture', 'hud_rows', 'drum', 'rings', 'route', 'templates', 'paddles')


def npm_root():
    return subprocess.run(['npm', 'root', '-g'], stdout=subprocess.PIPE, text=True).stdout.strip()


# ----------------------------------------------------------------------------------------------------------- the screen build
def build_screen(NN, ws, tube_len=None, open_end=False, benny_h=None, drum_far_end=False, sets=(), preview=True, quiet=False, force=()):
    ws = os.path.abspath(ws); os.makedirs(ws, exist_ok=True); B = Build(ws, quiet, force); G = os.path.join(ws, 'game')
    SD = os.path.join(HERE, 'screens', NN); spec = json.load(open(os.path.join(REPO, '.claude/skills/rainbow-screen-builder/screens.json')))['screens'][NN]
    REF = os.path.join(REPO, spec['reference']); ref_h = h_file(REF)
    B.log(f'screen {NN} -> {ws}')
    # depth (optional guide for the fit)
    depth_model = os.path.join(MODELS, 'depth', 'model.onnx'); da2 = None
    if os.path.exists(depth_model):
        def f_depth(tmp):
            run([sys.executable, '-I', '-c', 'import sys, os, numpy as np\nfrom PIL import Image\nsys.path.insert(0, os.path.join(sys.argv[3], "tools", "screenkit", "eval"))\n'
                 'from eval_extract import Depth\nd = Depth(os.path.join(sys.argv[4], "depth")); np.save(sys.argv[2], d(np.asarray(Image.open(sys.argv[1]).convert("RGB"))).astype(np.float16))',
                 REF, os.path.join(tmp, 'da2.npy'), REPO, MODELS])
        B.step('depth', h_bytes('depth-v1', ref_h, h_file(depth_model)), {'da2.npy': os.path.join(ws, 'fit', 'da2.npy')}, f_depth); da2 = os.path.join(ws, 'fit', 'da2.npy')
    # fit
    fit_args = (['--tube-len', str(tube_len)] if tube_len else []) + (['--open-end'] if open_end else [])
    for s in sets: fit_args += ['--set', s]
    k_fit = h_bytes('fit-v1', h_files([os.path.join(SD, f'fit{NN}.py'), os.path.join(HERE, 'fitlib.py')]), ref_h, h_file(da2) if da2 else '', json.dumps(fit_args))
    def f_fit(tmp):
        run([sys.executable, '-I', os.path.join(SD, f'fit{NN}.py'), tmp] + (['--da2', da2] if da2 else []) + fit_args, log=os.path.join(tmp, 'fit.log'))
    B.step('fit', k_fit, {'layout.json': os.path.join(ws, 'fit', 'layout_fit.json'), 'fit_overlay.jpg': os.path.join(ws, 'fit', 'fit_overlay.jpg'), 'fit.log': os.path.join(ws, 'fit', 'fit.log')}, f_fit)
    # layout transforms (world scale, drum far end) - deterministic, instant
    def f_layout():
        lay_p = os.path.join(ws, 'fit', 'layout.json'); src = os.path.join(ws, 'fit', 'layout_fit.json')
        if benny_h: run([sys.executable, '-I', os.path.join(HERE, 'scale_layout.py'), src, lay_p, '--benny-h', str(benny_h)])
        else: shutil.copyfile(src, lay_p)
        if drum_far_end:   # the world joins the next area where this screen's route ends: its far drum is not built
            L = json.load(open(lay_p)); L['drum']['z1'] = L['drum']['z_far']; L['drum']['open_end'] = True; json.dump(L, open(lay_p, 'w'))
        L = json.load(open(lay_p))
        for i, c in enumerate(L['cams']): c['plate'] = f'plate_{i}.png'; c['mask'] = f'mask_{i}.png'
        json.dump(L, open(lay_p, 'w')); return L
    L = B.timed('layout', f_layout)
    # segment (masks + clean plate)
    seg_code = [os.path.join(HERE, 'segment.py'), os.path.join(REPO, 'tools/reflock/plate.py'), os.path.join(HERE, 'eval', 'eval_extract.py')]
    seg_models = sorted(os.path.join(MODELS, 'sam2', f) for f in os.listdir(os.path.join(MODELS, 'sam2'))) if os.path.isdir(os.path.join(MODELS, 'sam2')) else []
    k_seg = h_bytes('seg-v1', ref_h, h_file(os.path.join(SD, f'segment{NN}.json')), h_files([p for p in seg_code if os.path.exists(p)]), *[f'{os.path.basename(m)}:{os.path.getsize(m)}' for m in seg_models])
    def f_seg(tmp):
        run([sys.executable, '-I', os.path.join(HERE, 'segment.py'), REF, os.path.join(SD, f'segment{NN}.json'), tmp], log=os.path.join(tmp, 'segment.log'))
    B.step('segment', k_seg, {'plate.png': os.path.join(ws, 'seg', 'plate.png'), 'mask.png': os.path.join(ws, 'seg', 'mask.png'), 'segment.log': os.path.join(ws, 'seg', 'segment.log')}, f_seg)
    # the Geometry Nodes asset library (shared by every screen)
    gnlib = build_gnlib(B)
    # geometry (Blender)
    GK = geom_keys(); geo = {k: L[k] for k in GK if k in L}
    k_geo = h_bytes('geo-v1', h_obj(geo), h_file(os.path.join(HERE, 'blender_kit.py')), h_file(gnlib))
    def f_geo(tmp):
        lp = os.path.join(tmp, 'layout_geo.json'); json.dump(geo, open(lp, 'w'))
        out = run(['blender', '-b', '--factory-startup', '--python', os.path.join(HERE, 'blender_kit.py'), '--', lp, os.path.join(tmp, 'scene.glb'), '--gnlib', gnlib], log=os.path.join(tmp, 'blender.log'))
        if 'exported' not in out: raise SystemExit('blender_kit.py did not export:\n' + out[-2000:])
    B.step('geometry', k_geo, {'scene.glb': os.path.join(G, 'scene.glb'), 'blender.log': os.path.join(ws, 'fit', 'blender.log')}, f_geo)
    # assemble the page folder (needed by the bake: the export runs the page)
    def f_asm(): assemble(G, ws, REF, L)
    B.timed('assemble', f_asm)
    # bake (the approved pixels on the meshes + artwork-sampled materials), once, offline
    bk = {k: L[k] for k in BAKE_KEYS if k in L}
    k_bake = h_bytes('bake-v1', h_file(os.path.join(G, 'scene.glb')), h_obj(bk), h_file(os.path.join(ws, 'seg', 'plate.png')), h_file(os.path.join(ws, 'seg', 'mask.png')), ref_h,
                     h_files([os.path.join(HERE, 'bake.js'), os.path.join(HERE, 'screen_export.cjs'), os.path.join(HERE, 'screen.html')]) if os.environ.get('RAINBOW_BAKE_KEY_PAGE') else
                     h_files([os.path.join(HERE, 'bake.js'), os.path.join(HERE, 'screen_export.cjs')]))
    def f_bake(tmp):
        out = run(['node', os.path.join(HERE, 'screen_export.cjs'), G, tmp], env={'NODE_PATH': npm_root()}, log=os.path.join(tmp, 'export.log'))
        if 'exported' not in out: raise SystemExit('bake export failed:\n' + out[-2000:])
    B.step('bake', k_bake, {'baked': os.path.join(G, 'baked'), 'export.log': os.path.join(ws, 'fit', 'export.log')}, f_bake)
    rep = {'screen': NN}
    if preview:
        rep['preview'] = run_preview(B, G, ws, NN)
    return B.report(rep)


def build_gnlib(B):
    src = os.path.join(HERE, 'gn_assets.py'); key = h_bytes('gnlib-v1', h_file(src))
    def f(tmp):
        out = run(['blender', '-b', '--factory-startup', '--python', src, '--', os.path.join(tmp, 'rainbow_gn_assets.blend')], log=os.path.join(tmp, 'gnlib.log'))
        if 'saved' not in out: raise SystemExit('gn_assets.py failed:\n' + out[-2000:])
    cdir = B.step('gnlib', key, {}, f)
    return os.path.join(cdir, 'rainbow_gn_assets.blend')


def assemble(G, ws, REF, L):
    os.makedirs(G, exist_ok=True)
    json.dump(L, open(os.path.join(G, 'layout.json'), 'w'))
    for src, dst in [(os.path.join(ws, 'seg', 'plate.png'), 'plate_0.png'), (os.path.join(ws, 'seg', 'mask.png'), 'mask_0.png'), (REF, 'ref_0.png'),
                     (os.path.join(HERE, 'screen.html'), 'play3.html'), (os.path.join(HERE, 'bake.js'), 'bake.js'), (os.path.join(HERE, 'materials.js'), 'materials.js'),
                     (os.path.join(REPO, 'tools/kit05/controls.js'), 'controls.js'), (os.path.join(REPO, 'tools/kit05/swimfx.js'), 'swimfx.js'),
                     (os.path.join(REPO, 'assets/models/benny31.glb'), 'benny31.glb'), (os.path.join(REPO, 'assets/textures/benny31/bake.png'), 'bake.png'),
                     (os.path.join(REPO, 'assets/textures/paint/05_coin.png'), 'coin.png')] + \
                    [(os.path.join(REPO, 'tools/marble05/viewer', f), f) for f in ('splash.png', 'bubble.png', 'glint.png')]:
        d = os.path.join(G, dst)
        if os.path.exists(src): shutil.copyfile(os.path.realpath(src), d)
    with open(os.path.join(G, 'benny31.glb'), 'rb') as f:
        if b'git-lfs' in f.read(200): raise SystemExit('benny31.glb is an LFS pointer: run git lfs pull')
    if not os.path.isdir(os.path.join(NODE_MODULES, 'three')):
        os.makedirs(os.path.dirname(NODE_MODULES), exist_ok=True); run(['npm', 'init', '-y'], cwd=os.path.dirname(NODE_MODULES)); run(['npm', 'install', 'three@0.180.0'], cwd=os.path.dirname(NODE_MODULES))
    nm = os.path.join(G, 'node_modules')
    if os.path.lexists(nm): os.remove(nm)
    os.symlink(NODE_MODULES, nm)


def run_preview(B, G, ws, NN, extra_args=()):
    files = [os.path.join(G, f) for f in sorted(os.listdir(G)) if f not in ('node_modules', 'preview') and os.path.isfile(os.path.join(G, f))]
    key = h_bytes('preview-v1', h_files(files), h_dir(os.path.join(G, 'baked')) if os.path.isdir(os.path.join(G, 'baked')) else '', h_file(os.path.join(HERE, 'preview.cjs')), json.dumps(list(extra_args)))
    def f(tmp):
        run(['node', os.path.join(HERE, 'preview.cjs'), G, tmp, '--screen', NN] + list(extra_args), env={'NODE_PATH': npm_root()}, log=os.path.join(tmp, 'preview.log'))
    B.step('preview', key, {'preview': os.path.join(ws, 'preview')}, lambda tmp: (os.makedirs(os.path.join(tmp, 'preview')), f(os.path.join(tmp, 'preview'))))
    pj = os.path.join(ws, 'preview', 'preview.json')
    return json.load(open(pj)).get('verdict') if os.path.exists(pj) else None


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('screen'); ap.add_argument('ws'); ap.add_argument('--tube-len', type=float); ap.add_argument('--open-end', action='store_true')
    ap.add_argument('--benny-h', type=float); ap.add_argument('--drum-far-end', action='store_true'); ap.add_argument('--set', action='append', default=[])
    ap.add_argument('--no-preview', action='store_true'); ap.add_argument('--force', default=''); ap.add_argument('--quiet', action='store_true')
    a = ap.parse_args()
    rep = build_screen(a.screen, a.ws, a.tube_len, a.open_end, a.benny_h, a.drum_far_end, a.set, not a.no_preview, a.quiet, [s for s in a.force.split(',') if s])
    print(f"screen {a.screen} ready: {os.path.join(os.path.abspath(a.ws), 'game', 'play3.html')}  ({rep['total_seconds']} s; report {os.path.join(os.path.abspath(a.ws), 'build_report.md')})")
