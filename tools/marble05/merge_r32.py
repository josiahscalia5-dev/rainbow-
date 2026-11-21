"""Round 32 lead: merge the two Screen 05 specialists' folders into one playable page (reproducible, never edits their folders).
  python3 -I tools/marble05/merge_r32.py <workspace> [out=<workspace>/merged]   (workspace = the folder setup_r32.sh built: base/, agentA/, agentB/)
Result: <workspace>/merged = agentB's visuals (waterflow.js, track_w/, backing shells, golden end) + agentA's controls (controls.js and its
`// [controls]` hooks), page merged with a three-way merge of play3.html against the common original (base/play3.html); the known
"both added a line at the same place" conflicts are resolved by keeping both; anything else stops the merge. Adds one lead hook:
window.camInfo() (camera pose per frame for the acceptance test's smoothness check)."""
import os, sys, shutil, subprocess, filecmp
WS = sys.argv[1]; A, B, O, M = (os.path.join(WS, x) for x in ('agentA', 'agentB', 'base', 'merged'))
if len(sys.argv) > 2: M = os.path.abspath(sys.argv[2])   # optional other output folder (e.g. a specialist's private test copy)
SKIP_DIRS = ('out_', '_', 'node_modules')
if os.path.exists(M): shutil.rmtree(M)
shutil.copytree(B, M, symlinks=True, ignore=lambda d, names: [n for n in names if (n.startswith('out_') or n == 'node_modules') and os.path.isdir(os.path.join(d, n))])
os.symlink(os.path.join(O, 'node_modules'), os.path.join(M, 'node_modules'))
report = []
for n in sorted(os.listdir(A)):
    pa, pm = os.path.join(A, n), os.path.join(M, n)
    if n.startswith(SKIP_DIRS) or n == 'play3.html' or (os.path.isdir(pa) and not os.path.islink(pa)):
        continue
    if not os.path.lexists(pm):
        (os.symlink(os.readlink(pa), pm) if os.path.islink(pa) else shutil.copy2(pa, pm)); report.append(f'from agentA: {n}')
    elif not os.path.islink(pa) and not os.path.islink(pm) and not filecmp.cmp(pa, pm, shallow=False):
        if n == 'controls.js': shutil.copy2(pa, pm); report.append('from agentA: controls.js')
        else: report.append(f'DIFFERS (kept agentB): {n}')
# three-way merge of the page
tmp = os.path.join(M, '.merge'); os.makedirs(tmp, exist_ok=True)
for k, src in (('B', B), ('O', O), ('A', A)): shutil.copy2(os.path.join(src, 'play3.html'), os.path.join(tmp, k))
r = subprocess.run(['git', 'merge-file', '-p', '-L', 'B', '-L', 'O', '-L', 'A', os.path.join(tmp, 'B'), os.path.join(tmp, 'O'), os.path.join(tmp, 'A')], capture_output=True, text=True)
out, lines, i = [], r.stdout.split('\n'), 0
while i < len(lines):
    if not lines[i].startswith('<<<<<<< '):
        out.append(lines[i]); i += 1; continue
    j = lines.index('=======', i); k = lines.index('>>>>>>> A', j)
    b, a = lines[i + 1:j], lines[j + 1:k]; i = k + 1
    if len(b) == 1 and len(a) == 1 and 'camera.position.copy(relPos)' in b[0] and 'camera.position.copy(relPos)' in a[0]:
        line = a[0].replace('addScaledVector(Fc.n, CT ? CT.c.camH : 0);', 'addScaledVector(Fc.n, qaRise + (CT ? CT.c.camH : 0));')
        assert line != a[0] and 'qaRise' in b[0], 'camera line changed shape: resolve by hand'
        out.append(line + ' [qa] qaRise = 0 normally'); report.append('conflict: camera line = agentA controls + agentB qaRise')
    elif any(x.lstrip().startswith('return {') for x in b) and any(x.lstrip().startswith('return {') for x in a):
        out += [x for x in b if not x.lstrip().startswith('return {')] + a; report.append('conflict: end of step = agentB water update + agentA return')
    elif all('// [' in x or not x.strip() for x in b + a):
        out += b + a; report.append('conflict: both added lines here -> kept both (' + ' | '.join(x.strip()[:60] for x in b + a) + ')')
    else:
        sys.exit('UNKNOWN CONFLICT, resolve by hand:\n' + '\n'.join(['B:'] + b + ['A:'] + a))
page = '\n'.join(out)
hook = "window.camInfo = () => ({ p: camera.position.toArray(), q: camera.quaternion.toArray() }); // [lead] acceptance test: camera pose per frame\n"
assert page.count('window.ready = true;') == 1
if 'window.camInfo' not in page: page = page.replace('window.ready = true;', hook + 'window.ready = true;')
# Benny's on-screen pose per frame (read-only): tilt of his up axis as seen by the camera, and where he is on screen
bhook = ("window.bennyInfo = () => { const q = new THREE.Quaternion(), p = new THREE.Vector3(); benny.getWorldQuaternion(q); benny.getWorldPosition(p);"
         " const up = new THREE.Vector3(0, 1, 0).applyQuaternion(q).applyQuaternion(camera.quaternion.clone().invert());"
         " const nW = N.clone().applyQuaternion(camera.quaternion.clone().invert()); const sp = p.clone().project(camera);"
         " return { rollDeg: Math.atan2(-up.x, up.y) * 180 / Math.PI, camRollDeg: Math.atan2(-nW.x, nW.y) * 180 / Math.PI, x: (sp.x * 0.5 + 0.5) * W, y: (0.5 - sp.y * 0.5) * H, dist: p.distanceTo(camera.position) }; }; // [lead] acceptance test: Benny on-screen tilt / position\n")
if 'window.bennyInfo' not in page: page = page.replace('window.ready = true;', bhook + 'window.ready = true;')
assert '<<<<<<<' not in page and '>>>>>>>' not in page
open(os.path.join(M, 'play3.html'), 'w').write(page); shutil.rmtree(tmp)
open(os.path.join(M, 'MERGE_REPORT.txt'), 'w').write('\n'.join(report) + '\n')
print('\n'.join(report)); print('merged ->', M)
