"""Measure a Marble tunnel splat PLY: axis, wall radius, ring spacing, lids, river width, and an
unrolled wall image.  usage: analyze_splats.py <splats.ply> <out_dir>"""
import json, os, sys
import numpy as np
from PIL import Image

ply, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
raw = open(ply, "rb").read()
hdr_end = raw.index(b"end_header\n") + len(b"end_header\n")
hdr = raw[:hdr_end].decode()
n = int([l for l in hdr.splitlines() if l.startswith("element vertex")][0].split()[-1])
props = [l.split()[-1] for l in hdr.splitlines() if l.startswith("property")]
a = np.frombuffer(raw, dtype="<f4", offset=hdr_end, count=n * len(props)).reshape(n, len(props))
P = {k: a[:, i] for i, k in enumerate(props)}
xyz = np.stack([P["x"], P["y"], P["z"]], 1).astype(np.float64)
rgb = np.clip(0.5 + 0.28209479 * np.stack([P["f_dc_0"], P["f_dc_1"], P["f_dc_2"]], 1), 0, 1)
alpha = 1 / (1 + np.exp(-P["opacity"]))
keep = alpha > 0.3
xyz, rgb = xyz[keep], rgb[keep]

# robust centre line: PCA on the points, axis = largest component, oriented away from the origin (camera)
c = np.median(xyz, 0)
u, s, vt = np.linalg.svd(xyz - c, full_matrices=False)
ax = vt[0]
if np.dot(ax, c) < 0:  # make +t point from the camera into the tunnel
    ax = -ax
t = (xyz - c) @ ax
# per-slice centre (the river makes the cloud asymmetric, so fit the centre per slice on the upper wall)
lo, hi = np.percentile(t, [1, 99])
bins = np.linspace(lo, hi, 61)
up_hint = np.array([0, 1, 0.0]) if abs(ax[1]) < 0.9 else np.array([1, 0, 0.0])
e1 = up_hint - ax * np.dot(up_hint, ax); e1 /= np.linalg.norm(e1)
e2 = np.cross(ax, e1)
d = xyz - c - np.outer(t, ax)
y1, y2 = d @ e1, d @ e2
r = np.hypot(y1, y2)
theta = np.arctan2(y2, y1)  # 0 = "up" hint direction
# camera-side "up": in Marble/OpenCV frames y is down; report both signs, pick wall = larger radius half
secs = []
for i in range(60):
    m = (t >= bins[i]) & (t < bins[i + 1])
    if m.sum() < 200:
        continue
    secs.append(dict(t=float((bins[i] + bins[i + 1]) / 2), n=int(m.sum()),
                     r_p50=float(np.median(r[m])), r_p90=float(np.percentile(r[m], 90))))
R = float(np.median([s_["r_p90"] for s_ in secs]))
wall = r > 0.75 * R

# gold = warm, bright, not pink:  R high, G mid-high, B low
R_, G_, B_ = rgb[:, 0], rgb[:, 1], rgb[:, 2]
gold = (R_ > 0.6) & (G_ > 0.35) & (B_ < 0.45) & (G_ > B_ + 0.12) & (R_ > G_)
cyan = (B_ > 0.6) & (G_ > 0.45) & (R_ < 0.45)
pink = (R_ > 0.65) & (B_ > 0.45) & (G_ < 0.4)
# rings: gold wall points histogram along t
gw = gold & wall
h, edges = np.histogram(t[gw], bins=400, range=(lo, hi))
hs = np.convolve(h, np.ones(3) / 3, mode="same")
peaks = [i for i in range(2, len(hs) - 2) if hs[i] == max(hs[i - 2:i + 3]) and hs[i] > 2.5 * np.median(hs[hs > 0])]
ring_t = [float((edges[i] + edges[i + 1]) / 2) for i in peaks]
spacing = np.diff(ring_t) if len(ring_t) > 1 else np.array([])

# river: cyan/pink points, lateral spread per slice
riv = cyan | pink
rw = []
for i in range(60):
    m = riv & (t >= bins[i]) & (t < bins[i + 1])
    if m.sum() > 100:
        lat = y2[m]
        rw.append(float(np.percentile(lat, 95) - np.percentile(lat, 5)))

# unrolled wall image: x = theta (-pi..pi), y = t (near at bottom)
W, H = 720, 1440
xi = ((theta[wall] + np.pi) / (2 * np.pi) * (W - 1)).astype(int)
yi = ((hi - t[wall]) / (hi - lo) * (H - 1)).clip(0, H - 1).astype(int)
acc = np.zeros((H, W, 3)); cnt = np.zeros((H, W))
np.add.at(acc, (yi, xi), rgb[wall]); np.add.at(cnt, (yi, xi), 1)
img = (acc / np.maximum(cnt, 1)[..., None] * 255).astype(np.uint8)
Image.fromarray(img).save(os.path.join(out, "wall_unrolled.png"))

res = dict(points_used=int(keep.sum()), axis=ax.tolist(), centre=c.tolist(),
           length=float(hi - lo), t_range=[float(lo), float(hi)], wall_radius_p90_median=R,
           sections=secs[::6], ring_t=ring_t, ring_spacing=spacing.tolist(),
           ring_spacing_median=float(np.median(spacing)) if len(spacing) else None,
           ring_spacing_over_radius=float(np.median(spacing) / R) if len(spacing) else None,
           river_width_p5_p95_median=float(np.median(rw)) if rw else None,
           river_width_over_diameter=float(np.median(rw) / (2 * R)) if rw else None,
           colour_fractions=dict(gold=float(gold.mean()), cyan=float(cyan.mean()), pink=float(pink.mean())),
           wall_mean_rgb=(rgb[wall & ~gold & ~cyan].mean(0) * 255).round().tolist())
json.dump(res, open(os.path.join(out, "splat_measure.json"), "w"), indent=1)
print(json.dumps({k: v for k, v in res.items() if k not in ("sections",)}, indent=1))
