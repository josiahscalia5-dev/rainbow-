"""env05 — offline A/B of wall / ring atlas variants WITHOUT a game render (run #4, 2026-11-17).
The env05 wall / ring shaders show (post chain inverted) the texel colour, so a variant's locked frame is predicted as
    V = capture_of_old + S(new atlases) − S(old atlases)
with S = bilinear sampling of the atlases at the per-pixel texture coordinates of the probe
(`node scripts/proj05-tunnel-probe.mjs --coords --q='<STACK>&env05=1' --raw=DIR` → tunnel_coords.f32: wall (u, v, 7, 77),
ring (u, v, 8, 78)). Bloom spill of the change is not modelled: confirm a kept variant with a real capture.
usage: python3 -I tools/env05/atlas_eval.py <coords.f32> <capture_old.png> <old_dir> <new_dir> [<out_png>] [--box=x0,x1,y0,y1 ...]
  prints the per-region and box numbers (tools/match05/metrics.py masks) of old capture vs predicted new frame"""
import json, sys
import numpy as np
from PIL import Image

H, W = 1536, 864
pos = [a for a in sys.argv[1:] if not a.startswith("--")]
boxes = [tuple(int(v) for v in a[6:].split(",")) for a in sys.argv[1:] if a.startswith("--box=")]
coords, cap_old, old_dir, new_dir = pos[:4]
out_png = pos[4] if len(pos) > 4 else None
a = np.fromfile(coords, np.float32).reshape(H, W, 4)
wallm = np.abs(a[..., 3] - 77) < 1e-3
ringm = np.abs(a[..., 3] - 78) < 1e-3


def sample(tex, m):
    h, w = tex.shape[:2]
    x = a[..., 0][m] * w - 0.5; y = a[..., 1][m] * h - 0.5
    x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int); fx = (x - x0)[:, None]; fy = (y - y0)[:, None]
    g = lambda yy, xx: tex[np.clip(yy, 0, h - 1), xx % w]
    return g(y0, x0) * (1 - fx) * (1 - fy) + g(y0, x0 + 1) * fx * (1 - fy) + g(y0 + 1, x0) * (1 - fx) * fy + g(y0 + 1, x0 + 1) * fx * fy


L = lambda p: np.asarray(Image.open(p).convert("RGB"), np.float32)
cap = L(cap_old)
pred = cap.copy()
for name, m in (("wall05e.png", wallm), ("ring05e.png", ringm)):
    pred[m] += sample(L(f"{new_dir}/{name}"), m) - sample(L(f"{old_dir}/{name}"), m)
pred = np.clip(pred, 0, 255)
if out_png:
    Image.fromarray((pred + 0.5).astype(np.uint8)).save(out_png)
ap = L("references/05_flow_into_the_current.png")
MK = "qa/pilot05/full_reference_match/masks"
idx = np.asarray(Image.open(f"{MK}/region_index.png"))
names = {v["id"]: k for k, v in json.load(open(f"{MK}/regions.json"))["regions"].items()}
e0 = np.abs(cap - ap).mean(-1); e1 = np.abs(pred - ap).mean(-1)
print(f"{'whole frame':28s} {e0.mean():6.2f} / {(e0 <= 20).mean() * 100:5.1f} %  ->  {e1.mean():6.2f} / {(e1 <= 20).mean() * 100:5.1f} %")
for i in sorted(names):
    m = idx == i
    if np.abs(e1[m] - e0[m]).max() > 0:
        print(f"{names[i]:28s} {e0[m].mean():6.2f} / {(e0[m] <= 20).mean() * 100:5.1f} %  ->  {e1[m].mean():6.2f} / {(e1[m] <= 20).mean() * 100:5.1f} %")
for (x0, x1, y0, y1) in boxes:
    s0, s1 = e0[y0:y1, x0:x1], e1[y0:y1, x0:x1]
    print(f"box x {x0}-{x1} y {y0}-{y1}: {s0.mean():6.2f} / {(s0 <= 20).mean() * 100:5.1f} %  ->  {s1.mean():6.2f} / {(s1 <= 20).mean() * 100:5.1f} %")
