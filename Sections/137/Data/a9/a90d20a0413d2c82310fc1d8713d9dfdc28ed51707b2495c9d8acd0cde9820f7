"""Benny part segmentation helpers for the APPROVED Screen 08 picture (benny-character-artist, 2026-11-17).
Adapted copy of line B's qa/pilot05/full_reference_match/benny/bennyseg.py (ccr-b0757dec-dj6l1o @99ab17b, read-only):
same colour classes / HSV / bbox helpers, reference switched to Screen 08. No mask file is needed: parts08.py builds
the approved Benny part masks from the 08 picture itself (colour components inside Benny's box)."""
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

REF = 'references/08_final_spin_chamber.png'
W, H = 864, 1536


def rgb2hsv(a):
    a = a / 255.0
    mx, mn = a.max(-1), a.min(-1)
    d = mx - mn
    h = np.zeros(mx.shape)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    nz = d > 1e-9
    i = nz & (mx == r); h[i] = ((g - b)[i] / d[i]) % 6
    i = nz & (mx == g) & (mx != r); h[i] = (b - r)[i] / d[i] + 2
    i = nz & (mx == b) & (mx != r) & (mx != g); h[i] = (r - g)[i] / d[i] + 4
    s = np.where(mx > 0, d / np.maximum(mx, 1e-9), 0)
    return h * 60, s, mx


def load(p):
    return np.asarray(Image.open(p).convert('RGB')).astype(float)


def colour_classes(a):
    """1 pink, 2 purple, 3 white, 4 yellow, 0 other"""
    H_, S, V = rgb2hsv(a)
    cls = np.zeros(a.shape[:2], np.uint8)
    cls[((H_ > 297) | (H_ < 10)) & (S > 0.25)] = 1
    cls[(H_ > 240) & (H_ <= 297) & (S > 0.3)] = 2
    cls[(S <= 0.3) & (V > 0.55)] = 3
    cls[(H_ > 28) & (H_ < 65) & (S > 0.45) & (V > 0.6)] = 4
    return cls


def bbox(m):
    ys, xs = np.nonzero(m)
    if not len(xs):
        return None
    return dict(x0=int(xs.min()), x1=int(xs.max()), y0=int(ys.min()), y1=int(ys.max()), w=int(xs.max() - xs.min() + 1),
                h=int(ys.max() - ys.min() + 1), cx=round(float(xs.mean()), 1), cy=round(float(ys.mean()), 1), px=int(m.sum()))


def biggest(m, n=1):
    lab, k = ndi.label(m)
    if k == 0:
        return m
    sz = ndi.sum(m, lab, range(1, k + 1))
    keep = np.argsort(sz)[::-1][:n] + 1
    return np.isin(lab, keep)
