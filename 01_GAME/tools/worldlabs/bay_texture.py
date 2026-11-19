"""Extract a hole-filled, physically proportioned wall texture for one bay (ring to ring) and the ring band
profile from a Marble tunnel splat PLY, using analyze_splats.py's measurements.
usage: bay_texture.py <splats.ply> <splat_measure.json> <out_dir>"""
import json, os, sys
import numpy as np
from PIL import Image, ImageFilter

ply, meas, out = sys.argv[1:4]
M = json.load(open(meas))
raw = open(ply, "rb").read()
he = raw.index(b"end_header\n") + 11
hdr = raw[:he].decode()
n = int([l for l in hdr.splitlines() if l.startswith("element vertex")][0].split()[-1])
props = [l.split()[-1] for l in hdr.splitlines() if l.startswith("property")]
a = np.frombuffer(raw, dtype="<f4", offset=he, count=n * len(props)).reshape(n, len(props))
P = {k: a[:, i] for i, k in enumerate(props)}
xyz = np.stack([P["x"], P["y"], P["z"]], 1).astype(np.float64)
rgb = np.clip(0.5 + 0.28209479 * np.stack([P["f_dc_0"], P["f_dc_1"], P["f_dc_2"]], 1), 0, 1)
alpha = 1 / (1 + np.exp(-P["opacity"]))
k = alpha > 0.3
xyz, rgb = xyz[k], rgb[k]
ax, c, R = np.array(M["axis"]), np.array(M["centre"]), M["wall_radius_p90_median"]
t = (xyz - c) @ ax
up = np.array([0, 1, 0.0]) if abs(ax[1]) < 0.9 else np.array([1, 0, 0.0])
e1 = up - ax * up.dot(ax); e1 /= np.linalg.norm(e1); e2 = np.cross(ax, e1)
d = xyz - c - np.outer(t, ax)
r = np.hypot(d @ e1, d @ e2); th = np.arctan2(d @ e2, d @ e1)
wall = (r > 0.75 * R) & (r < 1.4 * R)
rings = sorted(M["ring_t"])
gaps = [(rings[i], rings[i + 1]) for i in range(len(rings) - 1) if rings[i + 1] - rings[i] > 0.5 * (M["ring_spacing_median"] or 1)]
best = max(gaps, key=lambda g: ((t > g[0]) & (t < g[1]) & wall).sum())
sp = best[1] - best[0]
# texture spans one full spacing, centred on the bay, so the ring band sits on the top/bottom edges
t0, t1 = best[0], best[1]
W = 1024
H = int(round(W * sp / (2 * np.pi * R)))  # physical aspect: circumference x one ring spacing
H = max(64, H)
m = wall & (t >= t0) & (t <= t1)
xi = ((th[m] + np.pi) / (2 * np.pi) * (W - 1)).astype(int)
yi = ((t1 - t[m]) / (t1 - t0) * (H - 1)).astype(int)
acc = np.zeros((H, W, 3)); cnt = np.zeros((H, W))
np.add.at(acc, (yi, xi), rgb[m]); np.add.at(cnt, (yi, xi), 1)
cov = cnt > 0
img = acc / np.maximum(cnt, 1)[..., None]
# fill holes: repeated normalized blur of (colour*mask, mask)
filled = img.copy(); mask = cov.astype(float)
for rad in (1, 2, 4, 8):
    ci = Image.fromarray((filled * mask[..., None] * 255).astype(np.uint8)).filter(ImageFilter.BoxBlur(rad))
    mi = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.BoxBlur(rad))
    cb = np.asarray(ci).astype(float) / 255; mb = np.asarray(mi).astype(float) / 255
    hole = mask < 0.5
    est = cb / np.maximum(mb[..., None], 1e-3)
    filled[hole & (mb > 0.05)] = est[hole & (mb > 0.05)]
    mask = np.maximum(mask, (mb > 0.05).astype(float))
os.makedirs(out, exist_ok=True)
Image.fromarray((filled * 255).astype(np.uint8)).save(os.path.join(out, "bay_unrolled.png"))
Image.fromarray((cov * 255).astype(np.uint8)).save(os.path.join(out, "bay_coverage.png"))
# ring band profile: gold fraction vs t across +-0.3 spacing around each ring
gold = (rgb[:, 0] > 0.6) & (rgb[:, 1] > 0.35) & (rgb[:, 2] < 0.45) & (rgb[:, 1] > rgb[:, 2] + 0.12)
prof = []
for rt in rings:
    mm = wall & (np.abs(t - rt) < 0.3 * sp)
    if mm.sum() < 200:
        continue
    h_all, e = np.histogram(t[mm] - rt, bins=30, range=(-0.3 * sp, 0.3 * sp))
    h_g, _ = np.histogram(t[mm & gold] - rt, bins=e)
    frac = h_g / np.maximum(h_all, 1)
    band = (frac > 0.5)
    prof.append(dict(ring_t=rt, band_width=float(band.sum() * (e[1] - e[0])),
                     band_width_over_spacing=float(band.sum() * (e[1] - e[0]) / sp)))
res = dict(bay=[t0, t1], spacing=sp, texture_px=[W, H], coverage=float(cov.mean()), rings=prof,
           band_width_over_spacing_median=float(np.median([p["band_width_over_spacing"] for p in prof])) if prof else None)
json.dump(res, open(os.path.join(out, "bay_measure.json"), "w"), indent=1)
print(json.dumps(res, indent=1))
