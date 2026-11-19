"""Screen 05 paddles (`?projlid05=1`), Blender pipeline step A: each approved paddle outline (tunnel_common.LIDS, the
large pairs L1 L2 R1 R2) as a 2D triangle mesh in approved-frame pixels — boundary resampled every STEP px plus an
interior grid, Delaunay, triangles kept when their centroid lies inside the outline. Step B
(scripts/proj05-lid-raycast.mjs) lifts every vertex onto the real 05 wall through the real game camera; step C
(tools/proj05/lid_blender.py, Blender) builds the trays and exports the GLB.
usage: python3 -I tools/proj05/lid_mesh2d.py [out.json]"""
import json, os, sys
import numpy as np
from scipy.spatial import Delaunay
import cv2

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tunnel_common import LIDS, W, H  # noqa: E402

OUT = sys.argv[1] if len(sys.argv) > 1 else "qa/pilot05/proj/tunnel/lid/mesh2d.json"
NAMES = ["L1", "L2", "L3", "R1", "R2", "R3"]
USE = ["L1", "L2", "R1", "R2"]          # L3 / R3 lie in the forced-perspective far section: the existing far lids
STEP = 4.0


def resample(poly, step):
    pts = []
    n = len(poly)
    for i in range(n):
        a, b = np.array(poly[i], float), np.array(poly[(i + 1) % n], float)
        k = max(1, int(np.ceil(np.linalg.norm(b - a) / step)))
        for j in range(k):
            pts.append(a + (b - a) * j / k)
    return np.array(pts)


out = {"frame": [W, H], "step": STEP, "lids": {}}
for name, poly in zip(NAMES, LIDS):
    if name not in USE:
        continue
    poly = [(min(max(x, 0.0), W - 0.01), min(max(y, 0.0), H - 0.01)) for x, y in poly]
    bnd = resample(poly, STEP)
    cnt = np.array(poly, np.float32).reshape(-1, 1, 2)
    sd = lambda P: np.array([cv2.pointPolygonTest(cnt, (float(x), float(y)), True) for x, y in P])   # >0 inside
    x0, y0 = bnd.min(0); x1, y1 = bnd.max(0)
    gx, gy = np.meshgrid(np.arange(x0 + STEP / 2, x1, STEP), np.arange(y0 + STEP / 2, y1, STEP))
    g = np.stack([gx.ravel(), gy.ravel()], 1)
    inner = sd(g) > STEP * 0.6                                   # keep interior points clear of the boundary
    pts = np.concatenate([bnd, g[inner]], 0)
    tri = Delaunay(pts)
    cen = pts[tri.simplices].mean(1)
    keep = sd(cen) > 0
    tris = tri.simplices[keep]
    out["lids"][name] = {"verts_px": pts.round(3).tolist(), "tris": tris.tolist(), "boundary": list(range(len(bnd)))}
    print(name, "verts", len(pts), "tris", len(tris), "boundary", len(bnd))
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w") as f:
    json.dump(out, f)
