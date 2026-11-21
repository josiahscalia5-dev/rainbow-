#!/usr/bin/env python3
"""r25 (Screen 06, `&m06hole=1` preparation): unwrap the projected approved plate + masks into the river floor's own coordinates
(lateral l x course s), exactly as match06.ts builds the floor (river frame + right * l + up * bank(l)) and projects it with the
locked projector camera (assets/textures/match06/proj06.json). Visibility = floor self-occlusion z-buffer in the projector image.
River frames from tools/match06/r25_frames.mjs (the game's own course.ts under the 06 query).
  python3 -I r25_unwrap06.py <frames.json> <out.npz> [texels_per_u] [l0 l1 sa sb  (s relative to sB)]"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image

T = Path(__file__).resolve().parents[2] / 'assets/textures/match06'


def load_layout():
    L = json.loads((T / 'proj06.json').read_text())
    M = np.array(L['camera']['matrixWorld'], float).reshape(4, 4).T  # three.js column-major -> row-major
    return L, M


def project(L, M, P):
    """world points (...,3) -> projector px x, y (rip-code convention) and distance"""
    W, H = L['camera']['size']
    V = np.linalg.inv(M)
    ph = np.concatenate([P, np.ones(P.shape[:-1] + (1,))], -1) @ V.T
    f = 1 / np.tan(np.radians(L['camera']['fov']) / 2)
    asp = W / H
    z = -ph[..., 2]
    nx = (f / asp) * ph[..., 0] / z
    ny = f * ph[..., 1] / z
    x = (nx + 1) / 2 * W - 0.5
    y = (1 - ny) / 2 * H - 0.5
    d = np.linalg.norm(P - M[:3, 3], axis=-1)
    return x, y, d, z


def frames_at(fr, s):
    rows = np.array(fr['rows'])
    S = rows[:, 0]
    out = []
    for k in range(1, 10):
        out.append(np.interp(s, S, rows[:, k]))
    pos = np.stack(out[0:3], -1); up = np.stack(out[3:6], -1); rt = np.stack(out[6:9], -1)
    up /= np.linalg.norm(up, axis=-1, keepdims=True); rt /= np.linalg.norm(rt, axis=-1, keepdims=True)
    return pos, up, rt


def bilinear(img, x, y):
    H, W = img.shape[:2]
    x = np.clip(x, 0, W - 1); y = np.clip(y, 0, H - 1)
    x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int)
    x1 = np.minimum(x0 + 1, W - 1); y1 = np.minimum(y0 + 1, H - 1)
    fx = (x - x0)[..., None]; fy = (y - y0)[..., None]
    im = img.astype(np.float32)
    if im.ndim == 2: im = im[..., None]
    return ((im[y0, x0] * (1 - fx) + im[y0, x1] * fx) * (1 - fy) + (im[y1, x0] * (1 - fx) + im[y1, x1] * fx) * fy)


def unwrap(frames_json, K=64, l0=None, l1=None, sa=-5.0, sb=25.0):
    L, M = load_layout()
    fr = json.loads(Path(frames_json).read_text())
    r6 = L['tiles']['r6']; Wc, Wb, hb = r6['Wc'], r6['Wb'], r6['hb']
    sB = L.get('sB', L['s0'] + 12)
    l0 = -Wb if l0 is None else l0; l1 = Wb if l1 is None else l1
    NX = int(round((l1 - l0) * K)); NY = int(round((sb - sa) * K))
    ls = l0 + (np.arange(NX) + 0.5) / NX * (l1 - l0)
    ss = sB + sa + (np.arange(NY) + 0.5) / NY * (sb - sa)
    pos, up, rt = frames_at(fr, ss)
    t = np.clip((np.abs(ls) - Wc + 0.1) / 0.5, 0, 1); bank = hb * t * t * (3 - 2 * t)
    P = pos[:, None, :] + rt[:, None, :] * ls[None, :, None] + up[:, None, :] * bank[None, :, None]
    x, y, d, z = project(L, M, P)
    W, H = L['camera']['size']
    inside = (z > 0.3) & (x >= 0) & (y >= 0) & (x <= W - 1) & (y <= H - 1)
    # self-occlusion z-buffer, each texel splatted over its pixel footprint
    zb = np.full((H, W), np.inf, np.float32)
    fx_ = np.maximum(np.abs(np.diff(x, axis=1, append=x[:, -1:])), np.abs(np.diff(x, axis=0, append=x[-1:, :])))
    fy_ = np.maximum(np.abs(np.diff(y, axis=1, append=y[:, -1:])), np.abs(np.diff(y, axis=0, append=y[-1:, :])))
    rad = np.clip(np.ceil(np.maximum(fx_, fy_) / 2) + 1, 1, 12).astype(int)
    jj, ii = np.nonzero(inside)
    for r in np.unique(rad[jj, ii]):
        sel = rad[jj, ii] == r
        xc = np.round(x[jj[sel], ii[sel]]).astype(int); yc = np.round(y[jj[sel], ii[sel]]).astype(int); dv = d[jj[sel], ii[sel]].astype(np.float32)
        for dy in range(-r, r + 1):
            for dx in range(-r, r + 1):
                xx = np.clip(xc + dx, 0, W - 1); yy = np.clip(yc + dy, 0, H - 1)
                np.minimum.at(zb, (yy, xx), dv)
    zq = zb[np.clip(np.round(y), 0, H - 1).astype(int), np.clip(np.round(x), 0, W - 1).astype(int)]
    vis = inside & (d <= zq * 1.02 + 0.05)
    plate = np.asarray(Image.open(T / 'plate06_hybrid.png').convert('RGB'))
    mask = np.asarray(Image.open(T / 'mask06.png').convert('RGB'))
    fill = np.asarray(Image.open(T / 'plate06_fillmask.png').convert('L'))
    return dict(K=K, l0=l0, l1=l1, sa=sa, sb=sb, sB=sB, Wc=Wc, Wb=Wb, NX=NX, NY=NY, ls=ls, ss=ss,
                rgb=bilinear(plate, x, y), mask=bilinear(mask, x, y), fill=bilinear(fill, x, y)[..., 0],
                vis=vis, inside=inside, x=x, y=y, d=d)


if __name__ == '__main__':
    a = sys.argv[1:]
    K = float(a[2]) if len(a) > 2 else 64
    ext = [float(v) for v in a[3:7]] if len(a) > 6 else [None, None, -5.0, 25.0]
    U = unwrap(a[0], K, *ext)
    np.savez_compressed(a[1], **{k: v for k, v in U.items()})
    print('unwrap', U['NX'], U['NY'], 'visible', U['vis'].mean().round(3))
