"""Screen 05 post chain in numpy (foam-bubbles-particles tools): the game's display colour of a LINEAR scene colour and back.
Mirrors the live chain without bloom: exposure 0.86 -> three.js NeutralToneMapping -> sRGB encode (OutputPass) -> grade
(src/render/grade.ts: saturation 1.36, contrast 1.15, vignette 0.18, clamp) and its inverse `pjInverse`
(src/vfx/waterRibbon.ts PROJ05_INVERSE). Values 0..1 floats, arrays (..., 3); xy = pixel coordinates (for the vignette)."""
import numpy as np

EXPOSURE, SAT, CON, VIG = 0.86, 1.36, 1.15, 0.18
LW = np.array([0.2126, 0.7152, 0.0722])


def _vig(xy, W=864, H=1536):
    q = (xy + 0.5) / np.array([W, H]) - 0.5
    q[..., 0] *= 0.75
    L = np.sqrt((q ** 2).sum(-1))
    t = np.clip((L - 0.25) / 0.5, 0, 1)
    return 1.0 - VIG * t * t * (3 - 2 * t)


def forward(c, xy):
    c = np.asarray(c, float) * EXPOSURE
    x = c.min(-1, keepdims=True)
    off = np.where(x < 0.08, x - 6.25 * x * x, 0.04)
    c = c - off
    peak = c.max(-1, keepdims=True)
    sc = 0.8 - 0.04
    d = 1 - sc
    newp = 1 - d * d / (peak + d - sc)
    cc = c * newp / np.maximum(peak, 1e-6)
    g = 1 - 1 / (0.15 * (peak - newp) + 1)
    cc = cc * (1 - g) + newp * g
    c = np.where(peak < sc, c, cc)
    c = np.clip(c, 0, None)
    s = np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(np.maximum(c, 0), 1 / 2.4) - 0.055)
    l = (s * LW).sum(-1, keepdims=True)
    s = l + (s - l) * SAT
    s = (s - 0.5) * CON + 0.5
    s = s * _vig(xy)[..., None]
    return np.clip(s, 0, 1)


def inverse(t, xy):
    c = np.asarray(t, float) / np.maximum(_vig(xy), 0.5)[..., None]
    c = (c - 0.5) / CON + 0.5
    l = (c * LW).sum(-1, keepdims=True)
    c = l + (c - l) / SAT
    c = np.clip(c, 0, 0.975)
    c = np.where(c >= 0.04045, np.power((c + 0.055) / 1.055, 2.4), c / 12.92)
    np_ = c.max(-1, keepdims=True)
    peak = 0.0576 / np.maximum(1 - np_, 1e-6) - 0.24 + 0.76
    g = 1 - 1 / (0.15 * (peak - np_) + 1)
    cc = (c - g * np_) / (1 - g)
    cc = cc * peak / np.maximum(np_, 1e-6)
    c = np.where(np_ >= 0.76, cc, c)
    x = c.min(-1, keepdims=True)
    off = np.where(x >= 0.04, 0.04, np.sqrt(np.maximum(x, 0)) / 2.5 - x)
    return (c + off) / EXPOSURE


def grid(H=1536, W=864):
    yy, xx = np.mgrid[0:H, 0:W]
    return np.stack([xx, H - 1 - yy], -1).astype(float)  # gl_FragCoord y is bottom-up


if __name__ == "__main__":
    from PIL import Image
    import sys
    im = np.asarray(Image.open(sys.argv[1]).convert("RGB"), float)[1000:1100, 300:400] / 255
    xy = grid()[1000:1100, 300:400]
    rt = forward(inverse(im, xy), xy)
    print("round trip max |d| (levels)", float(np.abs(rt - im).max() * 255), "mean", float(np.abs(rt - im).mean() * 255))
