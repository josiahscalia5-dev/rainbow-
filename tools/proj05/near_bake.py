"""Screen 05 approved water — sharp NEAR tile for riding (`?proj05=1&projnear05=1`, src/vfx/waterRibbon.ts).

Why: the exact layer E holds the approved water at screen resolution only for the LOCKED camera. As the camera rides
forward the nearby water comes from the near / tile layers at 24 texels per unit of s, while the screen near Benny needs
100-250: the approved swirls turn into a pastel blur (qa/pilot05/proj/flow2/NOTES.md, part 2).

What: proj05_T2.png — a periodic tile (mirrored repeat along s, period P) built ONLY from approved pixels of E, at about
200 texels per world unit both ways, from the crisp band of the approved river just in front of Benny (s S0..S0+P: the
cyan core with its glossy streaks and the start of the pink ribbons). Columns the locked view only sees further away
(the river's sides, where the pink ribbons run) take their rows from the nearest stretch of river where they ARE
visible (a smooth per-column shift along s: the ribbons keep their real colours and streaks); the right bank, which the
locked eye never sees close by, is the mirror of the left bank (as the old tile layer did); anything else is folded from
the nearest visible column. Bubbles (they would repeat with the tile) are found as circles in E and filled ALONG s from
the water above and below them (the streaks run along s). The foam banks along the edges stay. The game uses the tile
only where the near layer would be magnified (the approached river), so the locked view stays the approved picture.
Also writes proj05_WT2.png (flow direction of the tile for `&projflow05=2`, same encoding as flow_bake.py) and
proj05_near.json.
usage: python3 -I tools/proj05/near_bake.py <assets/textures/water05> [s0=132.2] [period=4.2] [--out=DIR] [--debug=DIR]"""
import json, os, sys
import numpy as np, cv2
from PIL import Image
from scipy.ndimage import map_coordinates, gaussian_filter1d, binary_dilation, binary_opening

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import flow_bake  # noqa: E402

pos = [a for a in sys.argv[1:] if not a.startswith("--")]
dbg = next((a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--debug=")), None)
A = pos[0]
OUT = next((a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--out=")), A)   # where the tile is written
S0 = float(pos[1]) if len(pos) > 1 else 132.2          # beyond the ripple arcs; both pink ribbons run straight here
P = float(pos[2]) if len(pos) > 2 else 4.2              # to the right ribbon's turning point: the mirrored tile meanders smoothly
TW, TH = 2048, 1024                       # u -1..1 (9.6 world units) x s S0..S0+P
MARGIN = 0.02                             # stay this far inside the visible u-range (its edges are soft)
SHIFT_MAX = 7.0                           # a column may borrow rows up to this far along the river

lut = json.load(open(os.path.join(A, "proj05_lut.json")))
L = lut["E"]
sl = np.linspace(L["s0"], L["s1"], L["n"])
V, C, Wd = np.array(L["V"]), np.array(L["c"]), np.array(L["w"])
E = np.asarray(Image.open(os.path.join(A, "proj05_E.png")).convert("RGBA")).astype(np.float32)
NE, WE = E.shape[:2]
lo = lambda s: np.interp(s, sl, C - Wd) + MARGIN
hi = lambda s: np.interp(s, sl, C + Wd) - MARGIN

u = -1 + (np.arange(TW) + 0.5) / TW * 2
s = S0 + (np.arange(TH) + 0.5) / TH * P

# bubbles: circles in E's own (≈ screen) space, where they are still round
g8 = cv2.GaussianBlur(cv2.cvtColor(E[..., :3].astype(np.uint8), cv2.COLOR_RGB2GRAY), (0, 0), 1.5)
circ = cv2.HoughCircles(g8, cv2.HOUGH_GRADIENT_ALT, dp=1.5, minDist=8, param1=200, param2=0.80, minRadius=5, maxRadius=70)
bubE = np.zeros((NE, WE), np.uint8)
for (cx, cy, r) in ([] if circ is None else circ[0]):
    cv2.circle(bubE, (int(round(cx)), int(round(cy))), int(round(r * 1.35 + 3)), 1, -1)
Ef = np.concatenate([E, bubE[..., None].astype(np.float32) * 255], -1)

# per column: the first s (from S0, up to SHIFT_MAX along) at which this u is inside the visible range
sg = np.linspace(S0, S0 + SHIFT_MAX, 701)
vis = (u[None, :] >= lo(sg)[:, None]) & (u[None, :] <= hi(sg)[:, None])
avail = vis.any(0)
first = np.where(avail, sg[vis.argmax(0)], S0 + SHIFT_MAX) - S0
U, S = np.meshgrid(u, s)


def sample(usrc_col, shift_col):
    """approved pixels of E for tile texels: column source u, shifted along s; folded back where still not visible"""
    shift_col = gaussian_filter1d(shift_col, 24, mode="nearest")           # smooth shear across u (no steps)
    Ssrc = S + shift_col[None, :]
    Uc = np.broadcast_to(usrc_col[None, :], S.shape)
    a, b = lo(Ssrc), hi(Ssrc)
    t = (Uc - a) / np.maximum(b - a, 1e-3)
    t = 1.0 - np.abs(1.0 - np.mod(t, 2.0))                                 # triangle fold into [0, 1]
    Usrc = a + t * (b - a)
    x = (0.5 + (Usrc - np.interp(Ssrc, sl, C)) / (2 * np.interp(Ssrc, sl, Wd))) * WE - 0.5
    y = np.interp(Ssrc, sl, V) * NE - 0.5
    out = np.stack([map_coordinates(Ef[..., k], [y, x], order=1, mode="nearest") for k in range(5)], -1)
    return out, (Uc < a) | (Uc > b)


direct, fold_d = sample(u, first)
# the right bank (and any other column the locked eye only sees far away): mirror of the opposite bank
mi = np.arange(TW)[::-1]                                                   # column of -u
mirror, fold_m = sample(-u, first[mi])
w_d = gaussian_filter1d(avail.astype(np.float32), 20, mode="nearest")      # 1 where u itself is seen near by
w_m = (1.0 - w_d) * gaussian_filter1d(avail[mi].astype(np.float32), 20, mode="nearest")
w_f = np.clip(1.0 - w_d - w_m, 0, 1)                                       # neither: folded direct
wsum = w_d + w_m + w_f
img = (direct * (w_d + w_f)[None, :, None] + mirror * w_m[None, :, None]) / wsum[None, :, None]
folded = (fold_d & (w_d + w_f > 0.5)[None, :]) | (fold_m & (w_m > 0.5)[None, :])
rgb = img[..., :3]

# fill bubbles (and the rare texel E itself marks invalid) ALONG s: linear between the water above and below
hole = (img[..., 4] > 64) | (img[..., 3] < 100)
# foam islands INSIDE the river (they would repeat too; the foam banks along the edges stay): bright unsaturated blobs
mn_, mx_ = rgb.min(-1), rgb.max(-1)
isle = binary_opening((mn_ > 150) & (mx_ - mn_ < 80), iterations=4) & (np.abs(U) < 0.55)
hole |= binary_dilation(isle, iterations=8)
rgb_f = rgb.copy()
rows = np.arange(TH)
for xcol in np.nonzero(hole.any(0))[0]:
    h = hole[:, xcol]
    ok = ~h
    if ok.sum() < 2:
        continue
    for k in range(3):
        rgb_f[h, xcol, k] = np.interp(rows[h], rows[ok], rgb[ok, xcol, k])
soft = np.stack([gaussian_filter1d(rgb_f[..., k], 2.0, axis=1, mode="nearest") for k in range(3)], -1)
rgb_f = np.where(binary_dilation(hole, iterations=2)[..., None], soft, rgb_f)
rgb8 = np.clip(rgb_f + 0.5, 0, 255).astype(np.uint8)
blob = hole
os.makedirs(OUT, exist_ok=True)
Image.fromarray(rgb8).save(os.path.join(OUT, "proj05_T2.png"), optimize=True)

# flow direction of the tile (same encoding as proj05_WT.png); the tile repeats mirrored, so its own flow map does too
m, mask, cov, _ = flow_bake.flow_of(rgb8.astype(np.float32), np.ones((TH, TW), np.float32), P, wrap=False)
flow_bake.save(OUT, "proj05_WT2.png", m, mask, cov, 128)
meta = dict(s0=S0, period=P, width=TW, height=TH, wrap="mirrored along s, clamp across u",
            texels_per_world_unit=dict(across=round(TW / (2 * flow_bake.HW), 1), along=round(TH / P, 1)),
            share_columns_shifted=round(float((first > 0.05).mean()), 3), share_columns_mirrored=round(float((w_m > 0.5).mean()), 3),
            share_folded=round(float(folded.mean()), 3), share_bubbles_filled=round(float(blob.mean()), 3),
            bubbles_found_in_E=0 if circ is None else int(len(circ[0])),
            note="approved pixels of proj05_E only: per-column shift along s to the nearest visible stretch; right bank = mirrored left bank; fold; bubbles filled along s")
with open(os.path.join(OUT, "proj05_near.json"), "w") as f:
    json.dump(meta, f, indent=1)
print(json.dumps(meta))
if dbg:
    os.makedirs(dbg, exist_ok=True)
    vis_img = rgb8.copy()
    vis_img[folded] = (vis_img[folded] * 0.6).astype(np.uint8)
    Image.fromarray(vis_img[::-1]).resize((TW // 2, TH // 2), Image.LANCZOS).save(os.path.join(dbg, "T2_far_top_folded_dimmed.png"))
    rep = np.concatenate([rgb8, rgb8[::-1], rgb8], 0)[::-1]           # three periods as the game repeats it
    Image.fromarray(rep).resize((TW // 4, rep.shape[0] // 4), Image.LANCZOS).save(os.path.join(dbg, "T2_three_periods.png"))
