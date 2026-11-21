"""Screen 05 full-length track from the sharp first section of the Marble world (no credits, no new art).
Pieces (PLY, Marble/OpenCV local frame like the SPZ):
  near      the world as the approved picture shows it, up to ring B (walls cut at the ring, water cross-faded past it)
  bay[_m]   ring A -> ring B section, water cross-faded at both ends; _m = mirrored left/right (river bends the other way)
  *_lo      the same from the 100k-splat world (distant sections / phones)
  far       the world beyond ring B (the tunnel end with its gold glow), placed after the last section drawn
Copies alternate bay, bay_m, bay, ... so the S-river keeps bending right, left, right; the river centre is at the
middle of the tunnel at both rings, so the path joins without a jump.
python3 -I build_track.py <hi.spz> <lo.spz> <scene05.json> <tile_frame.json> <outdir> [N]
water-fx (agentB) changes, marked [wfx]: (1) only the water channel is mirrored (walls / foam banks stay where they are; the
old rule mirrored everything below 0.32 about the river line, 8 cm off the tunnel centre -> wall gaps); (2) the cross-fade
keeps full coverage at every joint (incoming copy is opaque at the ring, outgoing fades after it) instead of two 50 % layers;
(3) walls overlap 3 cm at the cut; (4) *_lo2 = 35 % subsample of *_lo with enlarged splats for very distant copies."""
import os, sys, json, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from spz import read_spz_full, write_ply

hi_p, lo_p, scene_p, frame_p, rings_p, out = sys.argv[1:7]
N = int(sys.argv[7]) if len(sys.argv) > 7 else 10
RG = json.load(open(rings_p)); XA, XB = np.array(RG['XA']), np.array(RG['XB'])  # 3D ring centres (gold circle fits)
F = json.load(open(frame_p)); ax, rt = np.array(F['ax']), np.array(F['right']); dpl = F['dpl']
SC = json.load(open(scene_p)); n_plane = np.array(SC['plane']['n'])
FL = np.array([1, -1, -1], np.float32)
UA, UB = 1.30, 3.33; Lt = UB - UA
D0 = XB - XA                     # ring A -> ring B, measured in 3D
DH = float(D0 @ n_plane)         # the water must drop by this much over one section to meet the next copy
_T = np.array(SC['trail']); _tu = _T @ ax
LAT_C = float(np.mean([(_T[np.argmin(np.abs(_tu - uu))] @ rt) for uu in (UA, UB)]))  # river centre at the rings = mirror line
mirror_pt = lambda p: p - 2 * np.outer(p @ rt - LAT_C, rt)
OV = 0.18          # half-width of the water cross-fade at each ring
MIR_H, MIR_LAT = 0.10, 0.95   # [wfx] mirrored = water channel only: below this height and within this distance of the river line
WALL_OV = 0.03     # [wfx] walls overlap this much past the cut so the joint has no hairline gap
LO2_KEEP = 0.35    # [wfx] fraction of the _lo splats kept for the very distant copies
HW = 0.32          # below this height above the water a splat counts as water / foam (cross-faded, not cut)

def ramp(u, h):    # water eased down toward the section's end so it meets the next copy's water (walls untouched)
    wu = np.clip((u - UA) / Lt, 0, 1); wh = 1 - np.clip((h - 0.1) / 0.55, 0, 1); wh = wh * wh * (3 - 2 * wh)
    return DH * wu * wh

def sstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

def frame_of(d):
    P = d['xyz'] * FL
    return P, P @ ax, P @ n_plane - dpl, P @ rt

def emit(d, mask, wmul, name, mirror=False):
    P, u, h, lat = frame_of(d)
    p = P[mask] + np.outer(ramp(u[mask], h[mask]), n_plane)
    mw = (h[mask] < MIR_H) & (np.abs(lat[mask] - LAT_C) < MIR_LAT)  # [wfx] only the water channel is mirrored
    o = {k: v[mask].copy() for k, v in d.items()}
    a = 1 / (1 + np.exp(-o['opacity'])) * wmul[mask]
    keep = a > 0.01
    a = np.clip(a, 1e-4, 1 - 1e-4); o['opacity'] = np.log(a / (1 - a))
    if mirror:  # reflect across the tunnel's vertical mid-plane (lateral 0); Gaussian: R' = M R diag(-1,1,1)
        p = np.where(mw[:, None], mirror_pt(p), p)
        rl = rt * FL; M = np.eye(3) - 2 * np.outer(rl, rl)
        w, x, y, z = o['rot'].T
        R = np.stack([np.stack([1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)], -1),
                      np.stack([2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)], -1),
                      np.stack([2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)], -1)], -2)
        R2 = M[None] @ R @ np.diag([-1.0, 1, 1])[None]
        tr = R2[:, 0, 0] + R2[:, 1, 1] + R2[:, 2, 2]
        qw = np.sqrt(np.clip(1 + tr, 1e-9, None)) / 2
        q = np.stack([qw, (R2[:, 2, 1] - R2[:, 1, 2]) / (4 * qw), (R2[:, 0, 2] - R2[:, 2, 0]) / (4 * qw), (R2[:, 1, 0] - R2[:, 0, 1]) / (4 * qw)], -1)
        bad = qw < 0.05  # numerically safe fallback for near-180-degree rotations
        if bad.any():
            Rb = R2[bad]; i = np.argmax(np.stack([Rb[:, 0, 0], Rb[:, 1, 1], Rb[:, 2, 2]], -1), 1); qb = np.zeros((len(Rb), 4))
            for k in range(len(Rb)):
                m = Rb[k]; j = i[k]; jj, kk = (j + 1) % 3, (j + 2) % 3
                s = np.sqrt(max(1e-9, 1 + m[j, j] - m[jj, jj] - m[kk, kk])) * 2
                qq = np.zeros(4); qq[1 + j] = s / 4; qq[0] = (m[kk, jj] - m[jj, kk]) / s; qq[1 + jj] = (m[jj, j] + m[j, jj]) / s; qq[1 + kk] = (m[kk, j] + m[j, kk]) / s
                qb[k] = qq
            q[bad] = qb
        o['rot'] = np.where(mw[:, None], q / np.linalg.norm(q, axis=1, keepdims=True), o['rot']).astype(np.float32)
    o['xyz'] = (p * FL).astype(np.float32)
    o = {k: v[keep] for k, v in o.items()}
    write_ply(f'{out}/{name}.ply', o); print(name, len(o['xyz']))

for tag, path in (('hi', hi_p), ('lo', lo_p)):
    d = read_spz_full(path); P, u, h, lat = frame_of(d)
    box = (np.abs(lat) < 2.4) & (h > -0.7) & (h < 2.6)
    water = h < HW
    one = np.ones(len(u))
    fade_in = sstep(UA - OV, UA, u); fade_out = 1 - sstep(UB, UB + OV, u)  # [wfx] full coverage across the joint
    bay_m = box & ((~water & (u >= UA - WALL_OV) & (u < UB + WALL_OV)) | (water & (u >= UA - OV) & (u < UB + OV)))
    w_bay = np.where(water, fade_in * fade_out, 1.0)
    sfx = '' if tag == 'hi' else '_lo'
    emit(d, bay_m, w_bay, 'bay' + sfx)
    emit(d, bay_m, w_bay, 'bay_m' + sfx, mirror=True)
    if tag == 'hi':
        near_m = box & ((~water & (u < UB + WALL_OV)) | (water & (u < UB + OV)))
        emit(d, near_m, np.where(water, fade_out, 1.0), 'near')
        far_m = box & (u >= UB + 0.02)
        emit(d, far_m, one, 'far')

# [wfx] very distant copies: 35 % of the light pieces, splats enlarged so the coverage stays
from spz import write_ply as _wp
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from plyio import read_ply
rng = np.random.default_rng(5)
for nm in ('bay_lo', 'bay_m_lo'):
    d = read_ply(f'{out}/{nm}.ply'); a = 1 / (1 + np.exp(-d['opacity']))
    keep = rng.random(len(a)) < np.clip(LO2_KEEP * (0.6 + 0.8 * a), 0, 1)
    o = {k: v[keep].copy() for k, v in d.items()}
    srt = np.argsort(o['scale'], 1); big = srt[:, 1:]          # the two largest axes of each splat
    np.put_along_axis(o['scale'], big, np.take_along_axis(o['scale'], big, 1) - 0.5 * np.log(keep.mean()), 1)
    _wp(f'{out}/{nm}2.ply', o); print(nm + '2', len(o['xyz']))

# Benny's path: the painted trail on the water through near + N alternating copies, smoothed across the joins
T = np.array(SC['trail']); tu = T @ ax
def eased(Q): return Q + np.outer(ramp(Q @ ax, np.zeros(len(Q))), n_plane)
base = eased(T[tu < UB]); seg = eased(T[(tu >= UA) & (tu < UB)])
seg_m = mirror_pt(seg)
# offsets: each copy's ring A lands exactly on the previous copy's ring B (copies alternate mirrored / normal)
offs = [D0 * k for k in range(1, N + 1)]
far_offs = [np.zeros(3)] + offs  # the far piece after copy m starts at that copy's ring B
P = np.vstack([base] + [(seg_m if k % 2 else seg) + offs[k - 1] for k in range(1, N + 1)])
D = offs[1] - offs[0] if N > 1 else D0
s = np.r_[0, np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))]
ss = np.arange(0, s[-1], 0.02); R = np.c_[[np.interp(ss, s, P[:, i]) for i in range(3)]].T
k = int(0.3 / 0.02); Rs = R.copy()
for i in range(len(R)):
    a_, b_ = max(0, i - k), min(len(R), i + k + 1); Rs[i] = R[a_:b_].mean(0)
Rs[:k] = R[:k]
json.dump({'XA': XA.tolist(), 'XB': XB.tolist(), 'offsets': [o.tolist() for o in offs], 'far_offsets': [o.tolist() for o in far_offs], 'D': D.tolist(), 'N': N, 'UA': UA, 'UB': UB, 'ax': ax.tolist(), 'right': rt.tolist(), 'n': n_plane.tolist(),
           'trail': Rs.tolist(), 'trail_s': ss.tolist()}, open(f'{out}/track.json', 'w'))
print('D', np.round(D, 3), 'path length', round(float(ss[-1]), 2))
