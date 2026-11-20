#!/usr/bin/env python3
"""r25 Screen 06 `&m06hole=1` (qa/match/06/r25/PROGRESS.md): the user's "raised blue cone" under Benny at the opening.

Cause (lead r24, qa/match/06/r24/lead_rip/NOTES.md): where the painted Benny was cut out of the projected approved plate (mask06
red), the river floor shows the river's own brighter flowing material once the camera leaves the approved view — a hard-edged,
Benny-shaped bright patch that reads as a cone — and the painted lacy ripple ring stays pinned at the checkpoint below it.

This tool fills that hole AND the painted ring zone round the approved Benny's contact with the approved picture's OWN painted
water, continued from the water around it, in the river floor's own coordinates (lateral l x course s): the projected plate is
unwrapped onto the floor exactly as match06.ts builds it (tools/match06/r25_unwrap06.py, river frames from the game's course.ts
via tools/match06/r25_frames.mjs), then exemplar (patch) inpainting copies small patches of the surrounding painted water into
the hole, front to back, so streaks, colours and brightness continue with no edge. Sources = visible painted WATER only (no soap
bubbles, foam heaps, coin patches, the ripple ring itself or the provisional Benny fill). Output (static, world-pinned like the
rest of the painted water):
  assets/textures/match06/tile_hole06.png  RGB = plate water with the hole + ring zone filled
  assets/textures/match06/tile_hole06w.png L = hole weight (soft)
  assets/textures/match06/hole06.json      rect (l0, l1, s0, s1 absolute course s) + ring-zone ellipse
  python3 -I tools/match06/make_hole06.py <frames.json> [outDir] [K]"""
import json, sys, time
from pathlib import Path
import numpy as np
import cv2
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import r25_unwrap06 as UW  # noqa: E402

T = Path(__file__).resolve().parents[2] / 'assets/textures/match06'
# painted soap bubbles round the river near Benny (approved-picture px: x, y, radius) — never copied into the fill
BUB = [(366, 645, 22), (48, 668, 20), (85, 740, 37), (68, 868, 30), (207, 863, 28), (14, 952, 24), (172, 927, 10), (176, 958, 8),
       (115, 993, 7), (722, 1115, 16), (692, 1220, 27), (58, 1190, 17), (697, 1352, 42), (708, 1048, 9), (792, 891, 15),
       (88, 1452, 40), (643, 993, 6)]
# ring zone round the approved Benny's contact (the lacy splash collar + concentric rings): ellipse in (l, ds)
ZONE = dict(dc=-0.25, hl=1.75, hs=0.85)


def main():
    frames = sys.argv[1]
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else T
    K = float(sys.argv[3]) if len(sys.argv) > 3 else 160
    psz = int(sys.argv[4]) if len(sys.argv) > 4 else 13
    t0 = time.time()
    U = UW.unwrap(frames, K, -2.8, 2.8, -1.7, 4.4)
    NX, NY, ls, ss, sB, Wc = U['NX'], U['NY'], U['ls'], U['ss'], U['sB'], U['Wc']
    L2 = np.broadcast_to(ls[None, :], (NY, NX)); DS = np.broadcast_to((ss - sB)[:, None], (NY, NX))
    x, y, W, H = U['x'], U['y'], 864, 1536
    I = U['rgb'].astype(np.float32)
    water = np.abs(L2) < Wc - 0.05
    V = U['vis'] & U['inside'] & (U['mask'][..., 1] < 128) & (x > 2) & (y > 2) & (x < W - 3) & (y < H - 3)
    # the unknown = the plate's provisional fill itself (painted Benny + painted coins, plate06_fillmask), slightly dilated;
    # the rest of mask06's blurred red is real painted water and stays as the boundary the fill continues from
    hole = cv2.dilate((U['fill'] > 8).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(0.08 * K) | 1,) * 2)) > 0
    eZ = np.hypot(L2 / ZONE['hl'], (DS - ZONE['dc']) / ZONE['hs'])
    zone = eZ < 1.12
    Om = V & water & (hole | zone)
    bub = np.zeros_like(V)
    for bx, by, br in BUB: bub |= np.hypot(x - bx, y - by) < br + 5
    coin = np.zeros_like(hole)
    S = V & water & ~Om & ~bub & ~coin & ~(eZ < 1.2)  # not the rings' outer fringe either
    print('grid', NX, NY, 'omega', int(Om.sum()), 'source', int(S.sum()), f'{time.time() - t0:.1f}s')

    h = psz // 2
    srcOK = cv2.erode(S.astype(np.uint8), np.ones((psz, psz), np.uint8)) > 0
    srcOK[:h] = srcOK[-h:] = False; srcOK[:, :h] = srcOK[:, -h:] = False
    C = (~Om).astype(np.float32)
    known = V & ~Om
    todo = Om.copy()
    R = int(1.0 * K)  # search radius (u): nearby painted water first
    k3 = np.ones((3, 3), np.uint8)
    grey = lambda im: im @ np.array([0.299, 0.587, 0.114], np.float32)  # noqa: E731
    it = 0
    while todo.any():
        front = todo & (cv2.dilate(known.astype(np.uint8), k3) > 0)
        if not front.any(): break
        fy, fx = np.nonzero(front)
        # priority = confidence (share of known texels in the patch) x (structure: isophote along the fill normal)
        Cs = cv2.boxFilter(C * known, -1, (psz, psz), normalize=True)
        g = grey(I) * known
        gx = cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3); gy = cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3)
        okg = cv2.erode(known.astype(np.uint8), k3) > 0
        gx *= okg; gy *= okg
        mk = cv2.GaussianBlur(known.astype(np.float32), (0, 0), 2)
        nx = cv2.Sobel(mk, cv2.CV_32F, 1, 0, ksize=3); ny = cv2.Sobel(mk, cv2.CV_32F, 0, 1, ksize=3)
        nn = np.hypot(nx, ny) + 1e-6
        # isophote = strongest known gradient near the front texel (rotated 90 deg)
        ag = np.hypot(gx, gy)
        agm = cv2.dilate(ag, np.ones((5, 5), np.uint8))
        D = np.abs(-gy * nx + gx * ny) / nn / 255.0
        Dm = cv2.dilate(D, np.ones((5, 5), np.uint8))
        pr = Cs[fy, fx] * (0.15 + Dm[fy, fx])
        q = int(np.argmax(pr)); py, px = int(fy[q]), int(fx[q])
        y0, y1, x0, x1 = py - h, py + h + 1, px - h, px + h + 1
        if y0 < 0 or x0 < 0 or y1 > NY or x1 > NX:  # grid border: the mean of the known texels round it
            kk = known[max(0, py - 2):py + 3, max(0, px - 2):px + 3]
            if kk.any(): I[py, px] = I[max(0, py - 2):py + 3, max(0, px - 2):px + 3][kk].mean(0)
            todo[py, px] = False; known[py, px] = True; continue
        tpl = I[y0:y1, x0:x1]
        tm = known[y0:y1, x0:x1].astype(np.float32)
        sy0, sy1, sx0, sx1 = max(0, py - R), min(NY, py + R + 1), max(0, px - R), min(NX, px + R + 1)
        area = I[sy0:sy1, sx0:sx1]
        if tm.sum() < 3:  # a thin sliver: take the mean of the known texels round it
            kk = known[max(0, py - 2):py + 3, max(0, px - 2):px + 3]
            if kk.any(): I[py, px] = I[max(0, py - 2):py + 3, max(0, px - 2):px + 3][kk].mean(0)
            todo[py, px] = False; known[py, px] = True; C[py, px] = Cs[py, px]; continue
        res = cv2.matchTemplate(area, tpl, cv2.TM_SQDIFF, mask=np.repeat(tm[..., None], 3, -1))
        okc = srcOK[sy0 + h:sy1 - h, sx0 + h:sx1 - h]
        if not okc.any():
            R = int(R * 1.5); continue
        res = np.where(okc, res, np.inf)
        by, bx = np.unravel_index(int(np.argmin(res)), res.shape)
        by += sy0; bx += sx0
        src = I[by:by + psz, bx:bx + psz]
        un = todo[y0:y1, x0:x1].copy()
        I[y0:y1, x0:x1][un] = src[un]
        C[y0:y1, x0:x1][un] = Cs[py, px]
        todo[y0:y1, x0:x1][un] = False
        known[y0:y1, x0:x1] |= un
        it += 1
        if it % 500 == 0: print('it', it, 'left', int(todo.sum()), f'{time.time() - t0:.0f}s', flush=True)
    print('filled in', it, 'patches', f'{time.time() - t0:.0f}s', 'left', int(todo.sum()))

    # soft hole weight (the shader swaps the plate for this fill there; the ring zone is analytic, ZONE)
    hw = cv2.GaussianBlur(hole.astype(np.float32), (0, 0), 0.03 * K)
    hw = np.clip(np.maximum(hw * 1.6, hole), 0, 1) * (V & water | hole)
    out.mkdir(parents=True, exist_ok=True)
    # two files (a PNG alpha channel is decoded premultiplied by browsers: the fill colour under weight 0 would be lost);
    # row 0 = the far end (texture v points up the river)
    Image.fromarray(np.clip(I, 0, 255).astype(np.uint8)[::-1].copy(), 'RGB').save(out / 'tile_hole06.png', optimize=True)
    Image.fromarray((hw * 255).astype(np.uint8)[::-1].copy(), 'L').save(out / 'tile_hole06w.png', optimize=True)
    meta = dict(note='r25 m06hole (tools/match06/make_hole06.py)', K=K, l0=float(U['l0']), l1=float(U['l1']),
                s0=float(sB + U['sa']), s1=float(sB + U['sb']), sB=float(sB), zone=ZONE, psz=psz)
    (out / 'hole06.json').write_text(json.dumps(meta, indent=1))
    np.savez_compressed(out / 'hole06_dbg.npz', before=U['rgb'].astype(np.uint8), after=I.astype(np.uint8), Om=Om, S=S, V=V, hole=hole)
    print(meta)


if __name__ == '__main__':
    main()
