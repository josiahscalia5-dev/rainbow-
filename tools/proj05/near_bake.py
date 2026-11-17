"""Screen 05 approved water — sharp NEAR tile for riding (`?proj05=1&projnear05=1`, src/vfx/waterRibbon.ts).

Why: the exact layer E holds the approved water at screen resolution only for the LOCKED camera. As the camera rides
forward the nearby water comes from the near / tile layers at 24 texels per unit of s, while the screen near Benny needs
100-250: the approved swirls turn into a pastel blur (qa/pilot05/proj/flow2/NOTES.md, part 2).

What: proj05_T2.png — a periodic tile (mirrored repeat along s, period P) built ONLY from approved pixels of E, at about
200 texels per world unit both ways, from the crisp band of the approved river just in front of Benny (s S0..S0+P: the
cyan core with its glossy streaks and the start of the pink ribbons). Columns the locked view only sees further away
(the river's sides, where the pink ribbons run) take their rows from the nearest stretch of river where they ARE
visible (a smooth per-column shift along s: the ribbons keep their real colours and streaks); what the approved picture
never shows near the camera is folded from the nearest visible column. Bubbles and foam blobs (they would repeat) are
inpainted. The game uses it only where the near layer would be magnified (the approached river), so the locked view
stays the approved picture.
Also writes proj05_WT2.png (flow direction of the tile for `&projflow05=2`, same encoding as flow_bake.py) and
proj05_near.json.
usage: python3 -I tools/proj05/near_bake.py <assets/textures/water05> [s0=131.4] [period=5.0] [--debug=DIR]"""
import json, os, sys
import numpy as np, cv2
from PIL import Image
from scipy.ndimage import map_coordinates, gaussian_filter1d, binary_opening, binary_dilation

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import flow_bake  # noqa: E402

pos = [a for a in sys.argv[1:] if not a.startswith("--")]
dbg = next((a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--debug=")), None)
A = pos[0]
S0 = float(pos[1]) if len(pos) > 1 else 131.4
P = float(pos[2]) if len(pos) > 2 else 5.0
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

# per column: how far along the river until this u is inside the visible range (smooth, capped)
sg = np.linspace(S0, S0 + SHIFT_MAX, 701)
vis = (u[None, :] >= lo(sg)[:, None]) & (u[None, :] <= hi(sg)[:, None])
first = np.where(vis.any(0), vis.argmax(0), len(sg) - 1)
shift = sg[first] - S0
shift = gaussian_filter1d(shift, 24, mode="nearest")            # smooth shear across u (no steps between columns)

U, S = np.meshgrid(u, s)
Ssrc = S + shift[None, :]
# still outside the visible range (sides the locked eye never saw close by): fold back from the visible edge
a, b = lo(Ssrc), hi(Ssrc)
t = (U - a) / np.maximum(b - a, 1e-3)
t = 1.0 - np.abs(1.0 - np.mod(t, 2.0))                         # triangle fold into [0, 1]
Usrc = a + t * (b - a)
folded = (U < a) | (U > b)

x = (0.5 + (Usrc - np.interp(Ssrc, sl, C)) / (2 * np.interp(Ssrc, sl, Wd))) * WE - 0.5
y = np.interp(Ssrc, sl, V) * NE - 0.5
img = np.stack([map_coordinates(E[..., k], [y, x], order=1, mode="nearest") for k in range(4)], -1)
rgb = img[..., :3]

# bubbles / foam blobs (bright, unsaturated, larger than a glint) would repeat with the tile: inpaint them
mn, mx = rgb.min(-1), rgb.max(-1)
whitish = (mn > 150) & (mx - mn < 80)
blob = binary_opening(whitish, iterations=6)
blob = binary_dilation(blob, iterations=5) | (img[..., 3] < 100)
rgb8 = np.clip(rgb + 0.5, 0, 255).astype(np.uint8)
rgb8 = cv2.inpaint(rgb8, blob.astype(np.uint8), 7, cv2.INPAINT_TELEA)

Image.fromarray(rgb8).save(os.path.join(A, "proj05_T2.png"), optimize=True)

# flow direction of the tile (same encoding as proj05_WT.png); the tile repeats mirrored, so its own flow map does too
m, mask, cov, _ = flow_bake.flow_of(rgb8.astype(np.float32), np.ones((TH, TW), np.float32), P, wrap=False)
flow_bake.save(A, "proj05_WT2.png", m, mask, cov, 128)
meta = dict(s0=S0, period=P, width=TW, height=TH, wrap="mirrored along s, clamp across u",
            texels_per_world_unit=dict(across=round(TW / (2 * flow_bake.HW), 1), along=round(TH / P, 1)),
            share_shifted=round(float((shift[None, :] > 0.05).mean()), 3), share_folded=round(float(folded.mean()), 3),
            share_inpainted=round(float(blob.mean()), 3),
            note="approved pixels of proj05_E only: per-column shift along s to the nearest visible stretch, then fold")
with open(os.path.join(A, "proj05_near.json"), "w") as f:
    json.dump(meta, f, indent=1)
print(json.dumps(meta))
if dbg:
    os.makedirs(dbg, exist_ok=True)
    vis_img = rgb8.copy()
    vis_img[folded] = (vis_img[folded] * 0.6).astype(np.uint8)
    Image.fromarray(vis_img[::-1]).resize((TW // 2, TH // 2), Image.LANCZOS).save(os.path.join(dbg, "T2_far_top_folded_dimmed.png"))
    rep = np.concatenate([rgb8, rgb8[::-1], rgb8], 0)[::-1]           # three periods as the game repeats it
    Image.fromarray(rep).resize((TW // 4, rep.shape[0] // 4), Image.LANCZOS).save(os.path.join(dbg, "T2_three_periods.png"))
