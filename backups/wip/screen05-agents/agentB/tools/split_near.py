"""split_near.py <track dir> [split_u=1.25]  ([track] Android splat budget)
Splits <track>/near.ply (456k splats, the start piece) along the tunnel axis into near_a.ply (u < split: everything from far
behind the start camera up to the split) and near_b.ply (u >= split). Every splat goes to exactly ONE piece, unchanged, so with
both drawn the picture is identical. play3.html hides near_a as soon as all of it is behind the camera (it can no longer be
seen), which removes ~350k splats from the visible set in section 1 (was 1.08 M visible there, Android budget ~1 M).
Also writes near_a_hull.json: the convex-hull vertices of near_a's splat centres (world coordinates, after the page's 180 deg
flip about X) and a margin = 3 sigma of near_a's largest splat near the split, for the page's exact "all behind" test."""
import sys, json, numpy as np
from scipy.spatial import ConvexHull
d = sys.argv[1]; SU = float(sys.argv[2]) if len(sys.argv) > 2 else 1.25
raw = open(f'{d}/near.ply', 'rb').read(); i = raw.index(b'end_header\n') + 11
hdr = raw[:i].decode(); n = int(hdr.split('element vertex ')[1].split()[0])
props = [l.split()[-1] for l in hdr.splitlines() if l.startswith('property')]
a = np.frombuffer(raw, '<f4', n * len(props), i).reshape(n, len(props))
TR = json.load(open(f'{d}/track.json')); ax = np.array(TR['ax'])
W = a[:, :3] * np.array([1, -1, -1])           # world = flip about X (quaternion 1,0,0,0 in play3.html)
u = W @ ax; A = u < SU
def write(path, rows):
    h = hdr.replace(f'element vertex {n}\n', f'element vertex {len(rows)}\n')
    open(path, 'wb').write(h.encode() + rows.astype('<f4').tobytes())
write(f'{d}/near_a.ply', a[A]); write(f'{d}/near_b.ply', a[~A])
P = W[A]; hull = ConvexHull(P); V = P[hull.vertices]
sc = np.exp(a[A, 7:10]).max(1); close = u[A] > SU - 1.0
margin = float(3 * sc[close].max()) + 0.02   # the largest splat's 3-sigma reach: no splat of near_a can poke in front
json.dump({'split_u': SU, 'margin': round(margin, 4), 'hull': np.round(V, 4).tolist()}, open(f'{d}/near_a_hull.json', 'w'))
print('near', n, '-> near_a', int(A.sum()), 'near_b', int((~A).sum()), 'hull vertices', len(V), 'margin', round(margin, 3), 'max splat near split', float(sc[close].max()))
