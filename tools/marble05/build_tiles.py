"""Screen 05 modular tunnel from the Marble world (no credits): near piece (the world up to ring B, so the start = the approved
picture) + one repeatable bay (ring A -> ring B) whose floor is eased down so its end meets the next copy's start.
Writes near.ply, bay.ply (local Marble/OpenCV frame, like the SPZ) and tiles.json (copy offset, Benny path)."""
import sys, json, numpy as np
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from spz import read_spz_full
src, scene_json, frame_json, out = sys.argv[1:5]
from spz import write_ply
d = read_spz_full(src)
F = json.load(open(frame_json)); ax, nn, rt = (np.array(F[k]) for k in ('ax', 'n', 'right')); dpl = F['dpl']
SC = json.load(open(scene_json)); n_plane = np.array(SC['plane']['n'])
L3 = d['xyz'] * np.array([1, -1, -1], np.float32)                     # three.js frame
u = L3 @ ax; h = L3 @ n_plane - dpl; lat = L3 @ rt
UA, UB = 1.30, 3.33                                                     # cut at the start of ring A / ring B
Lt = UB - UA
DH, DLAT = 0.436 - 0.665, -0.022 - 0.0                                  # ring-centre offset B - A (measured cross-sections)
D = ax * Lt + n_plane * DH + rt * DLAT                                  # one copy further on
box = (np.abs(lat) < 2.4) & (h > -0.7) & (h < 2.6)
def ramp(uu, hh):                                                       # floor eased down toward the bay's end (walls untouched)
    wu = np.clip((uu - UA) / Lt, 0, 1); wh = 1 - np.clip((hh - 0.1) / 0.55, 0, 1); wh = wh * wh * (3 - 2 * wh)
    return DH * wu * wh
def piece(mask, name):
    p = L3[mask] + np.outer(ramp(u[mask], h[mask]), n_plane)
    out_d = {k: v[mask] for k, v in d.items()}; out_d['xyz'] = (p * np.array([1, -1, -1], np.float32)).astype(np.float32)
    write_ply(f'{out}/{name}.ply', out_d); print(name, int(mask.sum()))
piece(box & (u < UB), 'near')
piece(box & (u >= UA) & (u < UB), 'bay')
# Benny path: the painted trail on the water, eased like the floor, continued through the copies, smoothed across the joins
T = np.array(SC['trail']); tu = T @ ax
base = T[(tu < UB)]; base = base + np.outer(ramp(base @ ax, np.zeros(len(base))), n_plane)
seg = T[(tu >= UA) & (tu < UB)]; seg = seg + np.outer(ramp(seg @ ax, np.zeros(len(seg))), n_plane)
N = int(sys.argv[5]) if len(sys.argv) > 5 else 6
path = [base] + [seg + D * k for k in range(1, N + 1)]
P = np.vstack(path)
# resample by arc length (0.02) and smooth sideways (window 0.7) so he never jumps at a join
s = np.r_[0, np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))]
ss = np.arange(0, s[-1], 0.02); R = np.c_[[np.interp(ss, s, P[:, i]) for i in range(3)]].T
k = int(0.35 / 0.02); Rs = R.copy()
for i in range(len(R)):
    a, b = max(0, i - k), min(len(R), i + k + 1); Rs[i] = R[a:b].mean(0)
Rs[:k] = R[:k]  # the start stays exactly on the painted spot
json.dump({'D': D.tolist(), 'N': N, 'UA': UA, 'UB': UB, 'ax': ax.tolist(), 'trail': Rs.tolist(), 'trail_s': ss.tolist()}, open(f'{out}/tiles.json', 'w'))
print('D', np.round(D, 3), '|D|', round(float(np.linalg.norm(D)), 3), 'path length', round(float(ss[-1]), 2))
