"""Camera-locked geometry picture: colour the approved water footprint by (Marble depth / ideal flat-floor depth).
green = within +-10 %, red = Marble too shallow (surface rises / collapsed), blue = Marble too deep; grey = no water.
usage: python3 -I tools/marble05/depth_ratio_map.py <world> <out.png>"""
import json, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import zoom
world, outp = sys.argv[1], sys.argv[2]
g = json.load(open(f"qa/pilot05/marble_feas/geometry/geometry_{world}.json"))
d = np.load(f"qa/pilot05/marble_feas/geometry/geometry_{world}.npz")
T, A = d["T"], d["A"]; H, W = T.shape; k = 1536 // H
F, CX, CY = g["camera"]["f_px"], g["camera"]["cx"], g["camera"]["cy"]
uu, vv = np.meshgrid((np.arange(W) + 0.5) * k, (np.arange(H) + 0.5) * k)
ray = np.stack([(uu - CX) / F, (vv - CY) / F, np.ones_like(uu)], -1)
vp = g["vp_approved_image"]; ax = np.array([(vp[0] - CX) / F, (vp[1] - CY) / F, 1.0]); ax /= np.linalg.norm(ax)
e_d = np.array([0, 1.0, 0]) - ax * ax[1]; e_d /= np.linalg.norm(e_d)
h = g["floor_below_axis"] - g["camera_offset_from_axis"]["down"]
rd = ray @ e_d
tflat = np.where(rd > 1e-3, h / np.maximum(rd, 1e-3), np.inf) * (ray @ ax)
ratio = np.where(A, T / tflat, np.nan)
r = zoom(np.nan_to_num(ratio, nan=1.0), k, order=1); Am = zoom(A.astype(float), k, order=0) > 0.5
lr = np.log2(np.clip(r, 0.25, 4))
col = np.zeros(r.shape + (3,))
ok = np.abs(lr) <= np.log2(1.1)
col[ok] = (0.25, 0.85, 0.35)
sh = lr < -np.log2(1.1); dp = lr > np.log2(1.1)
s = np.clip(-lr / 1.0, 0, 1); col[sh] = np.stack([0.95 + 0 * s, 0.55 - 0.45 * s, 0.35 - 0.25 * s], -1)[sh]
s = np.clip(lr / 0.6, 0, 1); col[dp] = np.stack([0.35 - 0.25 * s, 0.6 - 0.2 * s, 0.95 + 0 * s], -1)[dp]
appr = np.asarray(Image.open("references/05_flow_into_the_current.png").convert("L"), float) / 255
out = np.stack([appr * 0.55] * 3, -1)
out[Am] = 0.35 * out[Am] + 0.65 * col[Am]
im = Image.fromarray((out * 255).astype(np.uint8)); dr = ImageDraw.Draw(im)
for y in (197, 767):
    dr.line([(0, y), (864, y)], fill=(255, 255, 255), width=2)
dr.text((10, 201), "Marble saw only the rows between the white lines (197-767)", fill=(255, 255, 255))
leg = [((64, 217, 89), "Marble depth within 10 % of an ideal flat river floor"),
       ((242, 90, 60), "Marble too SHALLOW (surface rises / far tunnel collapsed)"),
       ((70, 110, 242), "Marble too DEEP")]
for i, (c, t) in enumerate(leg):
    y = 1440 + i * 26; dr.rectangle([12, y, 32, y + 18], fill=c); dr.text((40, y + 3), t, fill=(255, 255, 255))
im.save(outp)
inA = A & np.isfinite(ratio)
rows = vv
summ = {}
for name, m in (("input_rows_197_767", inA & (rows >= 197) & (rows < 767)), ("below_767", inA & (rows >= 767)), ("far_river_rows_490_600", inA & (rows < 600))):
    rr = ratio[m]
    summ[name] = dict(within_10pct=float((np.abs(np.log2(rr)) <= np.log2(1.1)).mean()), too_shallow=float((rr < 1 / 1.1).mean()),
                      too_deep=float((rr > 1.1).mean()), median_ratio=float(np.median(rr)))
json.dump(summ, open(outp.replace(".png", ".json"), "w"), indent=1); print(json.dumps(summ, indent=1))
