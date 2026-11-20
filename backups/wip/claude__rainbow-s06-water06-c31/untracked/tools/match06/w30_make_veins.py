#!/usr/bin/env python3
"""r30 water06 (`&w30=1`, src/world/m06water30.ts): ONE tileable 512x512 RGB texture for the Screen 06 rainbow water in motion.

The approved picture (references/06_crest_the_rinse_arch.png) and the r30 storyboard paint the slide as bright cyan water crossed by a
fine network of sparkly white "electric" veins (jagged, branching, mostly running with the flow) plus small star glints. The shader
reads this texture twice (two scales / speeds, world-anchored on the river's own lateral x s coordinates) and builds the colours
itself (cyan core, rainbow edges), so the texture only holds shapes:
  R = jagged electric veins (zero-contour lines of band-limited noise + a fine jag octave), core + soft glow baked in, faded in
      and out by a slow noise so the veins read as broken flashes, not a regular net
  G = branching caustic cell network (warped Voronoi F2-F1 edges: Y-junctions = the painted veins' branching)
  B = sparse sparkle points (star glints; the shader twinkles them)
Every field is built on the torus (FFT noise, wrapped Voronoi), so the tile repeats seamlessly in both directions.
Free, local, deterministic (seed 30).   python3 -I tools/match06/w30_make_veins.py [out.png]
"""
import sys
import numpy as np
from PIL import Image

N = 512
rng = np.random.default_rng(30)
fx = np.fft.fftfreq(N) * N
FX, FY = np.meshgrid(fx, fx)  # cycles per tile, x = across the river, y = along it


def band(f0, bw, ax=1.0, ay=1.0):
    """zero-mean, unit-std, tileable band-limited noise (ring spectrum at f0 cycles / tile)"""
    r = np.sqrt((FX * ax) ** 2 + (FY * ay) ** 2)
    filt = np.exp(-(((r - f0) / bw) ** 2))
    filt[0, 0] = 0
    n = np.real(np.fft.ifft2(np.fft.fft2(rng.normal(size=(N, N))) * filt))
    return n / n.std()


def grad(n):
    gx = (np.roll(n, -1, 1) - np.roll(n, 1, 1)) * 0.5
    gy = (np.roll(n, -1, 0) - np.roll(n, 1, 0)) * 0.5
    return np.sqrt(gx * gx + gy * gy) + 1e-6


def blur(a, sig):
    k = np.exp(-0.5 * (FX ** 2 + FY ** 2) * (2 * np.pi * sig / N) ** 2)
    return np.real(np.fft.ifft2(np.fft.fft2(a) * k))


def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


# R: jagged veins (lightning-like): wavy contours elongated along the flow (y) ~1.6x, kinked by two finer jag octaves, plus a finer
# second vein family; line width ~ constant in px (the gradient is floored so flat noise extrema do not swell into blobs).
n1 = band(4.0, 1.8, 1.0, 1.6) + 0.30 * band(20.0, 6.0) + 0.10 * band(56.0, 14.0)
n2 = band(9.0, 3.5, 1.0, 1.5) + 0.30 * band(38.0, 10.0)
g1, g2 = grad(n1), grad(n2)
l1 = np.exp(-((n1 / (1.5 * np.maximum(g1, 0.5 * g1.mean()))) ** 2))
l2 = np.exp(-((n2 / (0.9 * np.maximum(g2, 0.5 * g2.mean()))) ** 2))
m1 = smooth(-0.7, 0.8, band(2.0, 1.2))  # slow on / off: broken electric flashes
m2 = smooth(-0.1, 1.3, band(3.0, 1.5))
veins = np.maximum(l1 * (0.3 + 0.7 * m1), 0.6 * l2 * m2)
gv = blur(veins, 4.0)
R = np.clip(0.8 * veins + 0.6 * gv / max(gv.max(), 1e-6), 0, 1)

# G: warped Voronoi edges (branching caustic net), ~36 cells / tile, jagged by noise warp.
P = rng.random((36, 2)) * N
yy, xx = np.mgrid[0:N, 0:N].astype(float)
wx = 9.0 * band(7.0, 3.0) + 2.5 * band(30.0, 9.0)
wy = 9.0 * band(7.0, 3.0) + 2.5 * band(30.0, 9.0)
X, Y = xx + wx, yy + wy
d1 = np.full((N, N), 1e9)
d2 = np.full((N, N), 1e9)
for px, py in P:
    for ox in (-N, 0, N):
        for oy in (-N, 0, N):
            d = np.hypot((X - px - ox) * 1.0, (Y - py - oy) * 0.75)
            m = d < d1
            d2 = np.where(m, d1, np.minimum(d2, d))
            d1 = np.where(m, d, d1)
edge = d2 - d1
cell = np.exp(-((edge / 2.2) ** 2))
G = np.clip(0.85 * cell * (0.4 + 0.6 * smooth(-0.8, 0.8, band(2.5, 1.3))) + 0.35 * blur(cell, 2.5), 0, 1)

# B: sparkle points (few hundred tiny gaussian dots, random brightness), preferring the veins (glints ride on the bright lines)
B = np.zeros((N, N))
cand = np.argwhere((R > 0.55) | (rng.random((N, N)) < 0.0012))
pick = cand[rng.choice(len(cand), size=420, replace=False)]
for y, x in pick:
    r = 0.9 + 0.9 * rng.random()
    a = 0.55 + 0.45 * rng.random()
    ys = (np.arange(-4, 5) + y) % N
    xs = (np.arange(-4, 5) + x) % N
    gy, gx = np.meshgrid(np.arange(-4, 5), np.arange(-4, 5), indexing='ij')
    dot = a * np.exp(-(gx ** 2 + gy ** 2) / (2 * r * r))
    star = a * 0.5 * (np.exp(-(gx ** 2) / 0.6 - (gy ** 2) / (6 * r)) + np.exp(-(gy ** 2) / 0.6 - (gx ** 2) / (6 * r)))
    B[np.ix_(ys, xs)] = np.maximum(B[np.ix_(ys, xs)], np.maximum(dot, star))
B = np.clip(B, 0, 1)

img = (np.stack([R, G, B], -1) * 255 + 0.5).astype(np.uint8)
out = sys.argv[1] if len(sys.argv) > 1 else 'assets/textures/match06/tile_w30veins.png'
Image.fromarray(img, 'RGB').save(out, optimize=True)
print(out, img.shape, 'mean R G B', [round(float(c.mean()), 3) for c in (R, G, B)])
