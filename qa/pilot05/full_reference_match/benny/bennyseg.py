"""Benny part segmentation helpers (benny-character-artist, Screen 05 full reference match).
approved_parts(): colour classes inside masks/benny_and_hat.png of the APPROVED picture ->
  pom / crown white bands / crown purple band / cuff / star / body / arm nubs (boolean masks).
game_parts(mask_capture, hide_capture): the same parts in the REAL game from a `?bennyMask=1` flat-ID capture
  (pixels that differ from the `hide=benny` capture, classified by ID colour).
"""
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

REF = "references/05_flow_into_the_current.png"
MASK = "qa/pilot05/full_reference_match/masks/benny_and_hat.png"


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
    return np.asarray(Image.open(p).convert("RGB")).astype(float)


def colour_classes(a):
    """1 pink, 2 purple, 3 white, 4 yellow, 0 other"""
    H, S, V = rgb2hsv(a)
    cls = np.zeros(a.shape[:2], np.uint8)
    cls[((H > 297) | (H < 10)) & (S > 0.25)] = 1
    cls[(H > 240) & (H <= 297) & (S > 0.3)] = 2
    cls[(S <= 0.3) & (V > 0.55)] = 3
    cls[(H > 28) & (H < 65) & (S > 0.45) & (V > 0.6)] = 4
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
