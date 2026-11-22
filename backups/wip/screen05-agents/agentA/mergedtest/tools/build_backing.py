"""Backing shell for the Screen 05 splat track (water-fx / agentB).
The Marble reconstruction is a thin shell of splats; where two copied sections meet, the two pieces' cross-sections are not
identical (e.g. at ring B the left wall dips 0.35 below the water, at ring A it does not), so a few wedge-shaped holes open
at the wall bases and the black clear colour shows through as BLACK PATCHES.
This builds, for each piece, a low-poly tube that lies 3-4 cm BEHIND the piece's own splat surface (outside the tunnel,
below the water) and carries the piece's own local colours (opacity-weighted surface colour per cell; empty cells are
filled from their neighbours). Drawn opaque before the splats, it is hidden wherever the splats cover, and only shows in
the holes - with the colour of the wall / water around the hole, not black. Nothing in front of it changes.
python3 -I build_backing.py <track dir> <scene05.json> <tile_frame.json> <rings.json>  -> <track dir>/backing_<piece>.json"""
import os, sys, json, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from plyio import read_ply

td, scene_p, frame_p, rings_p = sys.argv[1:5]
SC = json.load(open(scene_p)); F = json.load(open(frame_p)); RG = json.load(open(rings_p))
n = np.array(SC['plane']['n']); ax = np.array(F['ax']); rt = np.array(F['right']); dpl = F['dpl']
XA, XB = np.array(RG['XA']), np.array(RG['XB'])
UA, UB = 1.30, 3.33; LT = UB - UA; DH = float((XB - XA) @ n); FL = np.array([1, -1, -1])
DU, NA, MARGIN, FLANGE, SAT = 0.05, 64, 0.04, 1.2, 1.35

def srgb2lin(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)

def build(name):
    d = read_ply(f'{td}/{name}.ply'); P = d['xyz'] * FL
    u = P @ ax; ramp = DH * np.clip((u - UA) / LT, 0, 1)
    lat = P @ rt; h = P @ n - dpl
    a = 1 / (1 + np.exp(-d['opacity'])); rgb = np.clip(0.5 + 0.282095 * d['dc'], 0, 1)
    # cross-section centre: between the two ring centres, at 0.62 above this section's (ramped) water
    latc = np.interp(u, [XA @ ax, XB @ ax], [XA @ rt, XB @ rt])
    hc = 0.62 + ramp
    dy, dx = h - hc, lat - latc
    r = np.hypot(dx, dy); th = np.arctan2(dy, dx)
    ok = (a > 0.25) & (r > 0.35) & (r < 1.9)
    u0, u1 = np.percentile(u[ok], 0.2), np.percentile(u[ok], 99.8)
    nu = int(np.ceil((u1 - u0) / DU)) + 1
    iu = np.clip(((u - u0) / DU).round().astype(int), 0, nu - 1)
    it = ((th + np.pi) / (2 * np.pi) * NA).astype(int) % NA
    R = np.full((nu, NA), np.nan); C = np.full((nu, NA, 3), np.nan)
    cell = iu * NA + it
    order = np.argsort(cell[ok]); cs = cell[ok][order]; rs = r[ok][order]; ws = a[ok][order]; cols = rgb[ok][order]
    bounds = np.flatnonzero(np.diff(cs)) + 1; starts = np.r_[0, bounds]; ends = np.r_[bounds, len(cs)]
    for s_, e_ in zip(starts, ends):
        if e_ - s_ < 3: continue
        c = cs[s_]; rr = rs[s_:e_]; ww = ws[s_:e_]
        R[c // NA, c % NA] = np.percentile(rr, 97)
        surf = rr >= np.percentile(rr, 40)  # the visible surface layer
        C[c // NA, c % NA] = (cols[s_:e_][surf] * ww[surf, None]).sum(0) / max(1e-6, ww[surf].sum())
    filled = ~np.isnan(R)
    for _ in range(200):  # fill empty cells (the holes!) from their neighbours
        if filled.all(): break
        Rn = np.zeros_like(R); Cn = np.zeros_like(C); wn = np.zeros(R.shape)
        for du_, dt_ in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            Rs = np.roll(np.nan_to_num(R), (du_, dt_), (0, 1)); Cs = np.roll(np.nan_to_num(C), (du_, dt_), (0, 1)); fs = np.roll(filled, (du_, dt_), (0, 1)).astype(float)
            if du_ == 1: fs[0] = 0
            if du_ == -1: fs[-1] = 0
            Rn += Rs * fs; Cn += Cs * fs[..., None]; wn += fs
        new = (~filled) & (wn > 0)
        R[new] = Rn[new] / wn[new]; C[new] = Cn[new] / wn[new][:, None]; filled |= new
    R = np.nan_to_num(R, nan=1.1); C = np.nan_to_num(C, nan=0.3)
    # averaging neighbouring splats greys the colour; give back the saturation of the surface it stands in for
    lum = (C @ np.array([0.2126, 0.7152, 0.0722]))[..., None]; C = np.clip(lum + (C - lum) * SAT, 0, 1)
    # light smoothing of the radius so the shell does not poke through a noisy surface
    Rp = np.pad(R, ((1, 1), (0, 0)), mode='edge')
    R = np.maximum(R, (Rp[:-2] + Rp[2:] + np.roll(R, 1, 1) + np.roll(R, -1, 1)) / 4) + MARGIN
    uu = u0 + np.arange(nu) * DU; tt = -np.pi + (np.arange(NA) + 0.5) * 2 * np.pi / NA
    # flanges: at both open ends the shell turns outward (FLANGE wide), so a view ray cannot slip through the ring-shaped
    # space between two neighbouring shells whose cross-sections differ (the same wedge that opens between the splat pieces)
    uu = np.r_[uu[0], uu, uu[-1]]; R = np.vstack([R[:1] + FLANGE, R, R[-1:] + FLANGE]); C = np.concatenate([C[:1] * 0.9, C, C[-1:] * 0.9]); nu += 2
    lc = np.interp(uu, [XA @ ax, XB @ ax], [XA @ rt, XB @ rt]); hcc = 0.62 + DH * np.clip((uu - UA) / LT, 0, 1)
    # vertex = u*ax + lat*rt + (h + dpl)*n  (ax, rt, n are nearly orthonormal; solve exactly)
    M = np.linalg.inv(np.stack([ax, rt, n]))
    lat_v = lc[:, None] + R * np.cos(tt)[None]; h_v = hcc[:, None] + R * np.sin(tt)[None]
    coords = np.stack([np.broadcast_to(uu[:, None], R.shape), lat_v, h_v + dpl], -1)
    V = coords.reshape(-1, 3) @ M.T
    idx = []
    for i in range(nu - 1):
        for j in range(NA):
            a0 = i * NA + j; a1 = i * NA + (j + 1) % NA; b0 = a0 + NA; b1 = a1 + NA
            idx += [a0, b0, a1, a1, b0, b1]
    col = srgb2lin(np.clip(C.reshape(-1, 3), 0, 1))
    json.dump({'pos': np.round(V, 4).ravel().tolist(), 'col': np.round(col, 4).ravel().tolist(), 'idx': idx},
              open(f'{td}/backing_{name}.json', 'w'))
    print(name, 'cells', nu, 'x', NA, 'empty filled', int((~np.isfinite(R)).sum()), 'u', round(u0, 2), round(u1, 2))

for nm in ('near', 'bay', 'bay_m'):
    build(nm)
