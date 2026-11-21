#!/usr/bin/env python3
"""r25 Screen 06 `&m06hole=1` (qa/match/06/r25/PROGRESS.md): the user's "raised blue cone" under Benny at the opening.

Cause (lead r24, qa/match/06/r24/lead_rip/NOTES.md): where the painted Benny was cut out of the projected approved plate, the river
floor shows the river's own brighter flowing material once the camera leaves the approved view — a hard-edged, Benny-shaped bright
patch that reads as a cone — and the painted lacy ripple ring stays pinned at the checkpoint below it.

This tool fills that cut-out (the plate's provisional fill: painted Benny + painted coins, plate06_fillmask, slightly dilated) AND
the painted ring zone round the approved Benny's contact with the approved picture's OWN painted water, continued from the water
around it, in the river floor's own coordinates (lateral l x course s): the plate is unwrapped onto the floor exactly as
match06.ts builds it (tools/match06/r25_unwrap06.py; river frames from the game's course.ts via tools/match06/r25_frames.mjs).
  method 'flow' (default): the painted streaks are carried across the hole along their own direction (orientation field of the
    surrounding painted water, smoothly extended into the hole), each texel = the two streak ends interpolated by distance; then a
    gradient-domain (Poisson) blend keeps those streaks but makes the fill meet the surrounding water with no seam.
  method 'patch': exemplar (patch) inpainting — rejected on sight in r25 (blocky mosaic, copied foam pieces), kept for reference.
Sources / streak ends = visible painted WATER only (no soap bubbles, foam heaps, ripple ring, provisional fill, wall, banks).
Output (static, world-pinned like the rest of the painted water):
  assets/textures/match06/tile_hole06.png  RGB = plate water with the cut-out + ring zone filled
  assets/textures/match06/tile_hole06w.png L = cut-out weight (soft); the ring zone is the analytic ellipse in hole06.json
  assets/textures/match06/hole06.json      rect (l0, l1, s0, s1 absolute course s) + ring-zone ellipse
  python3 -I tools/match06/make_hole06.py <frames.json> [outDir] [K] [method]"""
import json, sys, time
from pathlib import Path
import numpy as np
import cv2
import scipy.sparse as sp
import scipy.sparse.linalg as spl
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import r25_unwrap06 as UW  # noqa: E402

T = Path(__file__).resolve().parents[2] / 'assets/textures/match06'
# painted soap bubbles round the river near Benny (approved-picture px: x, y, radius) — never used as a source
BUB = [(366, 645, 22), (48, 668, 20), (85, 740, 37), (68, 868, 30), (207, 863, 28), (14, 952, 24), (172, 927, 10), (176, 958, 8),
       (115, 993, 7), (722, 1115, 16), (692, 1220, 27), (58, 1190, 17), (697, 1352, 42), (708, 1048, 9), (792, 891, 15),
       (88, 1452, 40), (643, 993, 6)]
# ring zone round the approved Benny's contact (the lacy splash collar + concentric rings): ellipse in (l, ds)
ZONE = dict(dc=-0.25, hl=1.75, hs=0.85)


def foam_mask_px():
    """the painted foam heaps (bright, unsaturated blobs; thin white sparkle streaks removed by an opening), plate px"""
    im = np.asarray(Image.open(T / 'plate06_hybrid.png').convert('RGB'))
    hsv = cv2.cvtColor(im, cv2.COLOR_RGB2HSV)
    f = ((hsv[..., 2] > 195) & (hsv[..., 1] < 80)).astype(np.uint8)
    f = cv2.morphologyEx(f, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    # heaps only: the lacy splash collar's white bits are small (they belong to the rings and go with them)
    # (and the provisional Benny fill + the splash collar joined to it are not foam either)
    fill = np.asarray(Image.open(T / 'plate06_fillmask.png').convert('L')) > 8
    n, lab, st, _ = cv2.connectedComponentsWithStats(f)
    onfill = set(np.unique(lab[fill]).tolist())
    f = np.isin(lab, [k for k in range(1, n) if st[k, cv2.CC_STAT_AREA] >= 2500 and k not in onfill]).astype(np.uint8)
    return cv2.dilate(f, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13))) > 0


def poisson(target, guide, unk, dirichlet):
    """solve x on `unk` texels: discrete Laplacian of x = that of `guide` for pairs inside `unk`, zero guidance across the border
    to `dirichlet` texels (value = target there, so the fill meets them with no seam), Neumann elsewhere. target/guide (H,W,C)."""
    H, W = unk.shape
    idx = -np.ones((H, W), np.int64); ys, xs = np.nonzero(unk); n = len(ys); idx[ys, xs] = np.arange(n)
    rows, cols, vals = [], [], []
    diag = np.zeros(n); b = np.zeros((n, target.shape[2]))
    for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        qy, qx = ys + dy, xs + dx
        inb = (qy >= 0) & (qy < H) & (qx >= 0) & (qx < W)
        qyc, qxc = np.clip(qy, 0, H - 1), np.clip(qx, 0, W - 1)
        inU = inb & unk[qyc, qxc]
        inD = inb & ~unk[qyc, qxc] & dirichlet[qyc, qxc]
        k = np.nonzero(inU)[0]
        diag[k] += 1; rows.append(k); cols.append(idx[qyc[k], qxc[k]]); vals.append(-np.ones(len(k)))
        b[k] += guide[ys[k], xs[k]] - guide[qyc[k], qxc[k]]
        k = np.nonzero(inD)[0]
        diag[k] += 1; b[k] += target[qyc[k], qxc[k]]
    diag[diag == 0] = 1
    diag += 1e-6  # a part with Neumann borders only stays solvable
    A = sp.csc_matrix((np.concatenate(vals + [diag]), (np.concatenate(rows + [np.arange(n)]), np.concatenate(cols + [np.arange(n)]))), shape=(n, n))
    lu = spl.splu(A, permc_spec='COLAMD')
    out = target.astype(np.float64).copy()
    for c in range(target.shape[2]): out[ys, xs, c] = lu.solve(b[:, c])
    return out


def flow_fill(I, Om, good, valid, seam, K):
    """carry the painted streaks across Om along their own direction, then Poisson-blend into the surrounding water"""
    t0 = time.time()
    g = I @ np.array([0.299, 0.587, 0.114], np.float32)
    gm = good.astype(np.float32)
    gs = cv2.GaussianBlur(g * gm, (0, 0), 1.0) / np.maximum(cv2.GaussianBlur(gm, (0, 0), 1.0), 1e-3)
    gx = cv2.Sobel(gs, cv2.CV_32F, 1, 0, ksize=3); gy = cv2.Sobel(gs, cv2.CV_32F, 0, 1, ksize=3)
    ok = (cv2.erode(good.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0).astype(np.float32)
    sig = 0.06 * K
    wv = cv2.GaussianBlur(ok, (0, 0), sig)
    J = [cv2.GaussianBlur(v * ok, (0, 0), sig) / np.maximum(wv, 1e-4) for v in (gx * gx, gx * gy, gy * gy)]
    c2, s2 = J[0] - J[2], 2 * J[1]
    m = np.hypot(c2, s2) + 1e-6; c2, s2 = c2 / m, s2 / m
    conf = wv > 0.25
    # orientation unknown in the hole: smooth (harmonic) extension of the doubled-angle field from all around it
    ext = ~conf & (valid | Om)
    ori = poisson(np.dstack([c2 * conf, s2 * conf]), np.zeros(c2.shape + (2,)), ext, conf)
    th = 0.5 * np.arctan2(ori[..., 1], ori[..., 0]) + np.pi / 2  # streak direction = across the dominant gradient
    DX, DY = np.cos(th), np.sin(th)
    print(f'  orientation field {time.time() - t0:.0f}s', flush=True)
    Ib = cv2.GaussianBlur(I, (0, 0), 0.7)
    H, W = Om.shape
    ys, xs = np.nonzero(Om); n = len(ys)
    res = []
    for sgn in (1.0, -1.0):
        px, py = xs.astype(np.float64), ys.astype(np.float64)
        dpx, dpy = sgn * DX[ys, xs], sgn * DY[ys, xs]
        hitc = np.full((n, 3), np.nan); hitd = np.full(n, np.inf)
        act = np.arange(n)
        for k in range(1, int(6 * K)):
            ix, iy = np.clip(np.round(px[act]).astype(int), 0, W - 1), np.clip(np.round(py[act]).astype(int), 0, H - 1)
            dx, dy = DX[iy, ix], DY[iy, ix]
            flip = dx * dpx[act] + dy * dpy[act] < 0
            dx = np.where(flip, -dx, dx); dy = np.where(flip, -dy, dy)
            px[act] += dx; py[act] += dy; dpx[act] = dx; dpy[act] = dy
            ix, iy = np.round(px[act]).astype(int), np.round(py[act]).astype(int)
            out = (ix < 0) | (iy < 0) | (ix >= W) | (iy >= H)
            ixc, iyc = np.clip(ix, 0, W - 1), np.clip(iy, 0, H - 1)
            stop = out | ~valid[iyc, ixc]
            hit = ~stop & good[iyc, ixc]
            if hit.any():
                a = act[hit]
                # 2 texels on into the good water (away from the border's soft edge)
                hx = np.clip(np.round(px[a] + 2 * dpx[a]).astype(int), 0, W - 1); hy = np.clip(np.round(py[a] + 2 * dpy[a]).astype(int), 0, H - 1)
                hitc[a] = Ib[hy, hx]; hitd[a] = k
            act = act[~(stop | hit)]
            if not len(act): break
        res.append((hitc, hitd))
    (c1, d1), (c2_, d2) = res
    both = np.isfinite(d1) & np.isfinite(d2)
    col = np.where(np.isfinite(d1)[:, None], c1, c2_)
    wt = (d2 / (d1 + d2))[both][:, None]
    col[both] = c1[both] * wt + c2_[both] * (1 - wt)
    none = ~np.isfinite(d1) & ~np.isfinite(d2)
    print(f'  streaks carried {time.time() - t0:.0f}s; both ends {both.mean():.2f}, one end {1 - both.mean() - none.mean():.2f}, none {none.mean():.3f}', flush=True)
    Tt = I.astype(np.float64).copy()
    Tt[ys, xs] = np.nan_to_num(col, nan=0.0)
    G = Tt.copy()
    if none.any():  # no streak end at all: no guidance there (smooth membrane)
        G[ys[none], xs[none]] = np.nan
        G = np.where(np.isnan(G), 0, G)
    out = poisson(I.astype(np.float64), G, Om, seam)
    print(f'  poisson blend {time.time() - t0:.0f}s', flush=True)
    return out.astype(np.float32), Tt.astype(np.float32)


def main():
    frames = sys.argv[1]
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else T
    K = float(sys.argv[3]) if len(sys.argv) > 3 else 160
    method = sys.argv[4] if len(sys.argv) > 4 else 'flow'
    t0 = time.time()
    U = UW.unwrap(frames, K, -2.8, 2.8, -1.7, 4.4)
    NX, NY, ls, ss, sB, Wc = U['NX'], U['NY'], U['ls'], U['ss'], U['sB'], U['Wc']
    L2 = np.broadcast_to(ls[None, :], (NY, NX)); DS = np.broadcast_to((ss - sB)[:, None], (NY, NX))
    x, y, W, H = U['x'], U['y'], 864, 1536
    I = U['rgb'].astype(np.float32)
    water = np.abs(L2) < Wc - 0.05
    vis = U['vis'] | (cv2.morphologyEx(U['vis'].astype(np.uint8), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)) > 0)  # z-buffer specks
    V = vis & U['inside'] & (U['mask'][..., 1] < 128) & (x > 2) & (y > 2) & (x < W - 3) & (y < H - 3)
    # the unknown = the plate's provisional fill itself (painted Benny + painted coins, plate06_fillmask), slightly dilated;
    # the rest of mask06's blurred red is real painted water and stays as the boundary the fill continues from
    # (only the painted Benny's part = where mask06 red marks the cut-out; the painted coins further up keep today's look)
    hole = (U['fill'] > 8) & (U['mask'][..., 0] > 3)
    hole = cv2.dilate(hole.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(0.08 * K) | 1,) * 2)) > 0
    eZ = np.hypot(L2 / ZONE['hl'], (DS - ZONE['dc']) / ZONE['hs'])
    zone = eZ < 1.12
    bub = np.zeros_like(V)
    for bx, by, br in BUB: bub |= np.hypot(x - bx, y - by) < br + 5
    fm = foam_mask_px()
    foam = fm[np.clip(np.round(y), 0, H - 1).astype(int), np.clip(np.round(x), 0, W - 1).astype(int)]
    # the painted foam heaps / soap bubbles inside the ring zone stay as painted (only the rings go)
    bigbub = np.zeros_like(V)  # tiny bubbles inside the ring zone would float as lone specks in the smooth fill: filled too
    for bx, by, br in BUB:
        if br > 10: bigbub |= np.hypot(x - bx, y - by) < br + 5
    Om = V & water & (hole | (zone & ~foam & ~bigbub))
    good = V & water & ~Om & ~bub & ~foam & ~(eZ < 1.2)  # not the rings' outer fringe either
    valid = V & water
    seam = valid & ~Om & ~foam & ~bub  # the fill meets the painted WATER seamlessly (foam / bubbles: their own edge, no bleed)
    print('grid', NX, NY, 'omega', int(Om.sum()), 'good', int(good.sum()), f'{time.time() - t0:.1f}s', flush=True)
    if method == 'flow':
        Iout, Tt = flow_fill(I, Om, good, valid, seam, K)
    else:
        raise SystemExit('patch method: see the r25 history of this file (rejected)')
    # soft cut-out weight (the shader swaps the plate for this fill there; the ring zone is analytic, ZONE)
    hw = cv2.GaussianBlur(hole.astype(np.float32), (0, 0), 0.03 * K)
    hw = np.clip(np.maximum(hw * 1.6, hole), 0, 1) * ((V & water) | hole)
    out.mkdir(parents=True, exist_ok=True)
    # two files (a PNG alpha channel is decoded premultiplied by browsers: the fill colour under weight 0 would be lost);
    # row 0 = the far end (texture v points up the river)
    Image.fromarray(np.clip(Iout, 0, 255).astype(np.uint8)[::-1].copy(), 'RGB').save(out / 'tile_hole06.png', optimize=True)
    Image.fromarray((hw * 255).astype(np.uint8)[::-1].copy(), 'L').save(out / 'tile_hole06w.png', optimize=True)
    meta = dict(note='r25 m06hole (tools/match06/make_hole06.py)', method=method, K=K, l0=float(U['l0']), l1=float(U['l1']),
                s0=float(sB + U['sa']), s1=float(sB + U['sb']), sB=float(sB), zone=ZONE)
    (out / 'hole06.json').write_text(json.dumps(meta, indent=1))
    if out.resolve() != T.resolve(): np.savez_compressed(out / 'hole06_dbg.npz', before=U['rgb'].astype(np.uint8), after=np.clip(Iout, 0, 255).astype(np.uint8),
                        carried=np.clip(Tt, 0, 255).astype(np.uint8), Om=Om, good=good, V=V, hole=hole)
    print(meta, f'{time.time() - t0:.0f}s')


if __name__ == '__main__':
    main()
