"""Forward model of the 05 display pipeline for a material's linear output colour (no bloom, no vignette):
NeutralToneMapping(exposure 0.86) -> sRGB -> grade (saturation 1.36 about Rec.709 luma, contrast 1.15).
inv(target sRGB) finds a linear shader colour that lands on the target (coordinate search)."""
import sys
import numpy as np

def neutral(c):
    c = c * 0.86
    start, desat = 0.8 - 0.04, 0.15
    x = c.min(); off = x - 6.25 * x * x if x < 0.08 else 0.04
    c = c - off
    peak = c.max()
    if peak < start:
        return c
    d = 1 - start
    newPeak = 1 - d * d / (peak + d - start)
    c = c * (newPeak / peak)
    g = 1 - 1 / (desat * (peak - newPeak) + 1)
    return c * (1 - g) + newPeak * g

def srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, 12.92 * c, 1.055 * np.power(c, 1 / 2.4) - 0.055)

def grade(c):
    l = c @ np.array([0.2126, 0.7152, 0.0722])
    c = l + (c - l) * 1.36
    c = (c - 0.5) * 1.15 + 0.5
    return np.clip(c, 0, 1)

def fwd(lin):
    return grade(srgb(neutral(np.asarray(lin, float)))) * 255

def inv(t):
    t = np.asarray(t, float); x = np.array([0.5, 0.5, 0.5]); st = 0.25
    err = lambda v: np.abs(fwd(v) - t).sum()
    e = err(x)
    while st > 1e-4:
        imp = False
        for i in range(3):
            for s in (st, -st):
                y = x.copy(); y[i] = max(0, y[i] + s); ey = err(y)
                if ey < e: x, e, imp = y, ey, True
        if not imp: st /= 2
    return x, fwd(x)

if __name__ == '__main__':
    for arg in sys.argv[1:]:
        t = [float(v) for v in arg.split(',')]
        x, o = inv(t)
        print(arg, '-> linear', x.round(3), 'gives', o.round().astype(int))
