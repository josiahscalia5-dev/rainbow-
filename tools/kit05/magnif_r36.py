import sys, numpy as np
sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from kit_model import *
HWD = float(np.sqrt(RT ** 2 - HW ** 2)); PH = 915 / 1536.0          # phone frame scale vs the painting
def proj_from(P, C):
    Q = remap(P, C) - C; z = Q @ F
    return W / 2 + FOC * (Q @ R) / z, H / 2 - FOC * (Q @ U) / z, z
ts = np.linspace(0.3, 40, 1500); ls = np.linspace(-HWD, HWD, 140); TT, LL = np.meshgrid(ts, ls, indexing='ij')
P = A0 + TT[..., None] * A + LL[..., None] * RR - HW * NUP
e = 1e-3
def dens(C):
    x, y, z = proj_from(P, C); xt, yt, _ = proj_from(P + e * A[None, None], C); xl, yl, _ = proj_from(P + e * RR[None, None], C)
    # area of one world unit^2 on screen (px^2), and whether on screen below the HUD
    J = np.abs((xt - x) * (yl - y) - (yt - y) * (xl - x)) / (e * e)
    on = (z > 0.05) & (x >= 0) & (x < W) & (y >= 125 / PH) & (y < H)
    return J, on, x, y
J0, on0, _, _ = dens(np.zeros(3))                                  # the painting's own pixels per unit^2 (start camera)
for s in [0.0, 1.0, 2.0, 3.0, 4.5, 6.0]:
    C = s * A; J, on, x, y = dens(C)
    mag = np.sqrt(J / np.maximum(J0, 1e-9))                        # linear up-scaling the screen needs from the painting
    vis = on & on0                                                  # water seen now AND painted in the picture
    unseen = on & ~on0                                              # water seen now that the painting never shows
    w = J * on                                                      # weight = screen area
    a = lambda m: float((w * m).sum() / max(w.sum(), 1e-9))
    print(f's {s:3.1f}: water on screen painted at <= 1x {a(vis & (mag <= 1.0)):.0%}, 1-2x {a(vis & (mag > 1) & (mag <= 2)):.0%}, 2-4x {a(vis & (mag > 2) & (mag <= 4)):.0%}, >4x {a(vis & (mag > 4)):.0%}, never painted {a(unseen):.0%}')
