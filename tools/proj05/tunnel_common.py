"""Screen 05 walls + gold rings bake (`?projwall05=1`, `?projring05=1`) — shared helpers: the approved picture's masks and
its ring model (the gold bands as curves r(theta) about one origin O near the vanishing point).
Image angle theta: 0 = +x (screen right), 90 deg = up, counter-clockwise; r in pixels of the 864x1536 approved frame."""
import json, math
import numpy as np, cv2
from PIL import Image
from scipy.ndimage import binary_dilation, binary_opening, binary_closing, median_filter, uniform_filter1d

W, H = 864, 1536
APPROVED = "references/05_flow_into_the_current.png"
O = (497.0, 468.0)                      # common polar origin (close to the vanishing point of the approved tunnel)
NTH = 3600                              # theta samples (0.1 deg)
# circle fits of the approved rings (tools/qa/ring_fit05.py, qa/pilot05/wave9b/rings/rings.md) + far rings read off the
# log-polar view (qa/pilot05/proj/tunnel/NOTES.md): name -> (cx, cy, r mid-band, band thickness)
RING_GUESS = {
    "A": (474, 529, 492.5, 64), "B": (477, 447, 239.5, 38), "C": (491, 458, 150.0, 23), "D": (493, 464, 88.5, 12),
    "E": (497, 466, 57.0, 8), "F": (497, 467, 40.0, 6), "G": (497, 468, 28.0, 5),
}
RING_ORDER = ["A", "B", "C", "D", "E", "F", "G"]
# the six larger wall lids ("paddles") of the approved picture, outlines read off a 4x zoom (full-frame pixels)
LIDS = [
    [(62.5, 360), (75, 324), (102, 315.5), (140, 322.5), (170, 340), (200, 372.5), (214, 400), (212.5, 415), (190, 420), (152, 410), (115, 392), (80, 375)],
    [(248.8, 447.5), (260, 422.5), (280, 418.8), (305, 425), (325, 442.5), (332.5, 460), (330, 470), (310, 472.5), (280, 462.5), (255, 452.5)],
    [(372, 458), (385, 455), (400, 462), (402, 476), (388, 478), (374, 470)],
    [(720, 510), (735, 480), (760, 450), (800, 425), (835, 404), (864, 400), (864, 497.5), (835, 505), (785, 515), (750, 527.5), (732.5, 526), (720, 515)],
    [(631, 444), (640, 420), (660, 405), (685, 394), (692.5, 395), (696, 425), (695, 434), (677.5, 442.5), (655, 451), (635, 450)],
    [(581, 455), (587.5, 442.5), (602.5, 435.5), (619, 435), (622.5, 447.5), (620, 451), (597.5, 455)],
]


def load_approved():
    return np.asarray(Image.open(APPROVED).convert("RGB"))


def masks(ap8):
    """returns dict of boolean masks in the approved frame"""
    ap = ap8.astype(int)
    R, G, B = ap[..., 0], ap[..., 1], ap[..., 2]
    hsv = cv2.cvtColor(ap8, cv2.COLOR_RGB2HSV_FULL).astype(float)
    hue, sat, val = hsv[..., 0] * 360 / 255, hsv[..., 1] / 255, hsv[..., 2] / 255
    warm = ((hue >= 342) | (hue <= 62)) & (sat > 0.22) & (val > 0.3)          # gold / copper (rings, lids, coins)
    light = (G > 150) & (B > 150) & (G > R - 28)                              # white-blue foam, bubble highlights
    cyan = (B > R + 25) & (G > R) & (G > 110)                                 # cyan water, bubble tints
    hud = np.zeros((H, W), bool); hud[:104, :] = True; hud[104:196, 100:770] = True
    env = np.asarray(Image.open("qa/worldlabs/05/05_env_mask.png").convert("L")) > 127
    water = np.asarray(Image.open("qa/pilot05/proj/target/water_mask.png").convert("L")) > 127
    lid = np.zeros((H, W), np.uint8)
    for poly in LIDS:
        cv2.fillPoly(lid, [np.round(np.array(poly) * 8).astype(np.int32)], 1, shift=3)
    lid = lid > 0
    return dict(warm=warm, light=light, cyan=cyan, hud=hud, env=env, water=water, lid=lid)


def polar_maps(n_th=NTH, r_max=1200.0, dr=0.5, origin=O):
    """sampling maps of a (r rows, theta cols) polar image about `origin`"""
    th = np.radians(np.arange(n_th) * 360.0 / n_th)
    r = np.arange(0, r_max, dr)
    T, Rr = np.meshgrid(th, r)
    mx = (origin[0] + Rr * np.cos(T)).astype(np.float32)
    my = (origin[1] - Rr * np.sin(T)).astype(np.float32)
    return th, r, mx, my


def circle_r_of_theta(cx, cy, rad, th, origin=O):
    """radius about `origin` at which the ray of angle th meets the circle (cx, cy, rad); origin must lie inside"""
    dx, dy = math.cos(th), -math.sin(th)
    ox, oy = origin[0] - cx, origin[1] - cy
    b = ox * dx + oy * dy
    c = ox * ox + oy * oy - rad * rad
    return -b + math.sqrt(max(b * b - c, 0.0))


def smooth_periodic(x, win):
    return uniform_filter1d(x, win, mode="wrap")
