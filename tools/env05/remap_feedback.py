"""env05 — carry the accumulated colour feedback (assets/textures/env05/feedback.npz) over to a changed atlas MAPPING
(run #4, 2026-11-17: the BC row's seam fraction changed). For every screen pixel whose texel moved between the old and
the new probe coordinates, the old feedback is sampled at the old texel and splatted to the new texel (averaged);
texels no moved pixel reaches keep their old value. Atlas content and layout are untouched.
usage: python3 -I tools/env05/remap_feedback.py <old_coords.f32> <new_coords.f32> <feedback_in.npz> <feedback_out.npz>"""
import sys
import numpy as np

H, W = 1536, 864
old_c, new_c, fin, fout = sys.argv[1:5]
a0 = np.fromfile(old_c, np.float32).reshape(H, W, 4)
a1 = np.fromfile(new_c, np.float32).reshape(H, W, 4)
fb = dict(np.load(fin))
rep = {}
for key, tag in (("wall", 77), ("ring", 78)):
    tex = fb[key]
    h, w = tex.shape[:2]
    m = (np.abs(a0[..., 3] - tag) < 1e-3) & (np.abs(a1[..., 3] - tag) < 1e-3)
    moved = m & ((np.abs(a0[..., 0] - a1[..., 0]) * w > 0.25) | (np.abs(a0[..., 1] - a1[..., 1]) * h > 0.25))
    yy, xx = np.nonzero(moved)
    rep[key + "_moved_px"] = int(len(yy))
    if not len(yy):
        continue
    # bilinear sample of the old feedback at the old coords
    x = a0[yy, xx, 0] * w - 0.5; y = a0[yy, xx, 1] * h - 0.5
    x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int); fx = (x - x0)[:, None]; fy = (y - y0)[:, None]
    g = lambda q, p: tex[np.clip(q, 0, h - 1), p % w]
    val = g(y0, x0) * (1 - fx) * (1 - fy) + g(y0, x0 + 1) * fx * (1 - fy) + g(y0 + 1, x0) * (1 - fx) * fy + g(y0 + 1, x0 + 1) * fx * fy
    # splat to the new coords
    x = a1[yy, xx, 0] * w - 0.5; y = a1[yy, xx, 1] * h - 0.5
    x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int); fx = x - x0; fy = y - y0
    acc = np.zeros_like(tex); ws = np.zeros((h, w))
    for dx, dy, wt in ((0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)):
        qy, qx = np.clip(y0 + dy, 0, h - 1), (x0 + dx) % w
        np.add.at(ws, (qy, qx), wt)
        for c in range(3):
            np.add.at(acc[..., c], (qy, qx), wt * val[:, c])
    ok = ws > 0.2
    tex = tex.copy()
    tex[ok] = acc[ok] / ws[ok][:, None]
    fb[key] = tex
    rep[key + "_texels_set"] = int(ok.sum())
np.savez_compressed(fout, **fb)
print(rep)
