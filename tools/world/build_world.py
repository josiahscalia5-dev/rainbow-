"""Rainbow ONE connected world - INCREMENTAL, CACHED builder (round 45; replaces the step list of setup_world.sh, same result folder).
Every area is built by tools/screenkit/build.py (content-addressed cache: fit, masks, Blender geometry, bake + artwork-sampled materials are
reused whenever their inputs did not change), the section (Bubble Dash -> Sock Rescue) comes pre-baked from public/section, world_layout.py
places everything on ONE route, the Blender connector pieces are cached on their spec, and the game folder is assembled. Each step is timed
(build_report.json / .md in the workspace); --preview 05,06 runs the automated preview check on those areas inside the world.
  python3 -I tools/world/build_world.py <workspace> [--preview 05,06] [--force step,..] [--quiet]
Result: <workspace>/game/play3.html (= tools/world/world.html), QA API as every kit page. Free tools only; no credits.
Areas (round 44 route 04 -> A -> B -> 05 -> 06 -> 07; each area's world settings exactly as setup_world.sh v4):
  04  tube 22 u, open end (the doorway into Bubble Dash)      05  tube 20 u, open end (runs on into the 06 drum)
  06  scaled to the world's ONE Benny (0.468 u), its far drum replaced by the join into 07       07  tube 30 u, open end, scaled
"""
import argparse, json, os, shutil, subprocess, sys, time
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(REPO, 'tools', 'screenkit'))
import build as kit   # noqa: E402

AREAS = [('04', dict(tube_len=22, open_end=True)), ('05', dict(tube_len=20, open_end=True)),
         ('06', dict(benny_h=0.468, drum_far_end=True)), ('07', dict(tube_len=30, open_end=True, benny_h=0.468))]


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('ws'); ap.add_argument('--preview', default=''); ap.add_argument('--force', default=''); ap.add_argument('--quiet', action='store_true')
    a = ap.parse_args(); ws = os.path.abspath(a.ws); os.makedirs(ws, exist_ok=True); G = os.path.join(ws, 'game'); force = [s for s in a.force.split(',') if s]
    B = kit.Build(ws, a.quiet, force); t0 = time.time(); area_reports = {}
    for nn, opt in AREAS:   # each area: its own cached kit build (fit -> masks -> GN geometry -> bake + templates)
        t = time.time(); rep = kit.build_screen(nn, os.path.join(ws, 's' + nn), preview=False, quiet=True, force=force, **opt)
        area_reports[nn] = rep['steps']; built = [s['step'] for s in rep['steps'] if s['status'] == 'built']
        B.steps.append({'step': f'area {nn}', 'status': ('built: ' + ', '.join(built)) if built else 'cached', 'seconds': round(time.time() - t, 2)})
        B.log(f"  area {nn}   {('built ' + ','.join(built)) if built else 'cached':40s} {time.time() - t:6.1f} s")
    def f_asm():
        if os.path.isdir(G): shutil.rmtree(G)
        os.makedirs(G)
        for nn, _ in AREAS:
            src = os.path.join(ws, 's' + nn, 'game'); d = os.path.join(G, 'a' + nn); os.makedirs(d)
            for f in ('layout.json', 'scene.glb', 'mask_0.png', 'splash_pic.png'):
                if os.path.exists(os.path.join(src, f)): kit.place(os.path.join(src, f), os.path.join(d, f))
            kit.place(os.path.join(src, 'baked'), os.path.join(d, 'baked'))
        os.makedirs(os.path.join(G, 'aAB'))
        for f in ('section.json', 'section.glb'): kit.place(os.path.join(REPO, 'public', 'section', f), os.path.join(G, 'aAB', f))
        kit.place(os.path.join(REPO, 'public', 'section', 'baked'), os.path.join(G, 'aAB', 'baked'))
    B.timed('assemble', f_asm)
    out = B.timed('layout', lambda: kit.run([sys.executable, '-I', os.path.join(HERE, 'world_layout.py'), os.path.join(G, 'a04', 'layout.json'), os.path.join(G, 'aAB', 'section.json'), G,
                                             os.path.join(G, 'a05', 'layout.json'), os.path.join(G, 'a06', 'layout.json'), os.path.join(G, 'a07', 'layout.json')], log=os.path.join(ws, 'world_layout.log')))
    spec = os.path.join(G, 'connectors_spec.json')
    key = kit.h_bytes('conn-v1', kit.h_file(spec), kit.h_file(os.path.join(HERE, 'blender_connectors.py')))
    def f_conn(tmp):
        kit.run(['blender', '-b', '--factory-startup', '--python', os.path.join(HERE, 'blender_connectors.py'), '--', spec, os.path.join(tmp, 'connectors.glb')], log=os.path.join(tmp, 'connectors.log'))
    B.step('connectors', key, {'connectors.glb': os.path.join(G, 'connectors.glb')}, f_conn)
    def f_files():
        s04 = os.path.join(ws, 's04', 'game')
        for src, dst in [(os.path.join(HERE, 'world.html'), 'play3.html'), (os.path.join(REPO, 'tools/screenkit/bake.js'), 'bake.js'), (os.path.join(REPO, 'tools/screenkit/qa.js'), 'qa.js'), (os.path.join(REPO, 'tools/kit05/controls.js'), 'controls.js'),
                         (os.path.join(REPO, 'tools/kit05/swimfx.js'), 'swimfx.js')] + [(os.path.join(s04, f), f) for f in ('benny31.glb', 'bake.png', 'coin.png', 'splash.png', 'bubble.png', 'glint.png')]:
            shutil.copyfile(os.path.realpath(src), os.path.join(G, dst))
        nm = os.path.join(G, 'node_modules')
        if os.path.lexists(nm): os.remove(nm)
        os.symlink(kit.NODE_MODULES, nm)
    B.timed('files', f_files)
    prev = {}
    for area in [s for s in a.preview.split(',') if s]:
        t = time.time(); d = os.path.join(ws, 'preview_' + area); shutil.rmtree(d, ignore_errors=True)
        kit.run(['node', os.path.join(REPO, 'tools/screenkit/preview.cjs'), G, d, '--screen', area, '--area', area], env={'NODE_PATH': kit.npm_root()}, log=os.path.join(ws, f'preview_{area}.log'))
        pj = json.load(open(os.path.join(d, 'preview.json'))); prev[area] = pj['summary']
        B.steps.append({'step': f'preview {area}', 'status': pj['verdict'], 'seconds': round(time.time() - t, 2)}); B.log(f"  preview {area} {pj['verdict']:8s} {time.time() - t:6.1f} s")
    rep = B.report({'areas': area_reports, 'preview': prev})
    print(f"world ready: {os.path.join(G, 'play3.html')}  ({rep['total_seconds']} s; report {os.path.join(ws, 'build_report.md')})")


if __name__ == '__main__':
    main()
