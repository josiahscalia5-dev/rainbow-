"""game part geometry from a UV pass (uv.f32 of rect 220,820,440,440 at the locked 08 frame) vs the approved 08 parts.
Adapted from line B's qa/pilot05/full_reference_match/benny/work/geom.py (read-only source, ccr-b0757dec-dj6l1o @99ab17b).
usage: python3 -I geom08.py <uv.f32>"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from bennyseg08 import bbox, W as FW, H as FH

X0, Y0, W, H = 220, 820, 440, 440


def load_uv(p):
    u = np.fromfile(p, np.float32).reshape(H, W, 4)[::-1]
    full = np.zeros((FH, FW, 4), np.float32)
    full[Y0:Y0 + H, X0:X0 + W] = u
    return full


def game_ids(uvf):
    ids = np.rint(uvf[..., 2]).astype(int)
    ids[np.abs(uvf[..., 2] - ids) > 0.01] = 0
    return ids


if __name__ == '__main__':
    from parts08 import approved_parts
    u = load_uv(sys.argv[1]); idm = game_ids(u)
    P, a, m = approved_parts()
    G = dict(pom=idm == 4, crown=idm == 2, cuff=idm == 3, star=idm == 5, body=np.isin(idm, [1, 6, 7, 8, 9]))
    G['all'] = idm > 0
    P['all'] = m
    f = lambda b: f"{b['x0']}-{b['x1']}, {b['y0']}-{b['y1']} ({b['w']}x{b['h']}) c({b['cx']},{b['cy']}) {b['px']}px"
    print(f"{'part':6s} | {'approved':52s} | game")
    for k in ['all', 'pom', 'crown', 'cuff', 'star', 'body']:
        print(f"{k:6s} | {f(bbox(P[k])):52s} | {f(bbox(G[k]))}")
    for k in ['pom', 'crown', 'cuff', 'star', 'body', 'all']:
        i = (P[k] & G[k]).sum(); un = (P[k] | G[k]).sum()
        print(k, 'IoU', round(i / un, 3), 'approved px covered by the same game part', round(i / P[k].sum(), 3))
