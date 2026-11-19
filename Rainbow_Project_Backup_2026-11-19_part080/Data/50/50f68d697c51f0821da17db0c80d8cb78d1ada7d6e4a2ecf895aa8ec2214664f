"""env05 refinement: fit the sideways / upward displacement of a REAL ring under the env05 warp (weight
smoothstep(sin th, -0.28, 0.05), as src/world/environment.ts e05Weight) to the approved band edges.
usage: python3 -I tools/env05/warp_fit.py <tunnel.json of an env05 probe> <ring name A|B> <mesh index> <h> [axial shift]"""
import json, math, sys, os
import numpy as np
from scipy.optimize import least_squares
sys.path.insert(0, os.path.dirname(__file__))
from ringproj import *
tj = json.load(open(sys.argv[1])); name = sys.argv[2]; k = int(sys.argv[3]); h = float(sys.argv[4])
model = json.load(open("qa/pilot05/proj/tunnel/model/ring_model.json"))
from PIL import Image
water = np.asarray(Image.open("qa/pilot05/proj/target/water_mask.png").convert("L")) > 127
cam = Cam(tj); M = mat4(tj["ringInstances"][k]); r = np.linalg.norm(M[:3, 0])
negR, U, T = M[:3, 0] / r, M[:3, 1] / r, M[:3, 2]
NT = 720; th = (np.arange(NT) + 0.5) / NT * 2 * math.pi
ain, aout = approved_edges(model, name, NT)
def vis(rr):
    x = O[0] + rr * np.cos(th); y = O[1] - rr * np.sin(th)
    ok = (x >= 2) & (x <= W - 3) & (y >= 205) & (y <= H - 3)
    return ok & ~water[np.clip(np.round(y).astype(int), 0, H - 1), np.clip(np.round(x).astype(int), 0, W - 1)]
vin, vout = vis(ain), vis(aout)
bn = dict(tj["tunnel"]["band05near"]); prof = band_profile(**dict(bn, height=h))
phi = np.linspace(0, 2 * math.pi, 1440, endpoint=False)
X = np.stack([prof[None, :, 0] * np.sin(phi)[:, None], -prof[None, :, 0] * np.cos(phi)[:, None]], -1)   # object xy
tho = np.arctan2(X[..., 1], -X[..., 0])
s = np.sin(tho); w = np.clip((s + 0.28) / 0.33, 0, 1); w = w * w * (3 - 2 * w)
def edges(p):
    side, up, dz = p
    P = M[:3, 3] + negR * (r * X[..., 0])[..., None] + U * (r * X[..., 1])[..., None] + T * (prof[None, :, 1] + dz)[..., None]
    P = P - negR * (side * w)[..., None] + U * (up * w)[..., None]
    px, dep = cam.project(P)
    return polar_edges(px, NT)
def res(p):
    gin, gout = edges(p)
    return np.concatenate([np.where(vin & np.isfinite(gin), gin - ain, 0), np.where(vout & np.isfinite(gout), gout - aout, 0)])
p0 = [float(x) for x in (sys.argv[5:8] if len(sys.argv) > 7 else [0, 0, 0])]
n = vin.sum() + vout.sum()
e0 = np.abs(res(p0)).sum() / n
sol = least_squares(res, p0, bounds=([-3, -3, -6], [3, 3, 6]), diff_step=1e-3, loss="soft_l1", f_scale=4.0)
print(name, "extra (side, up, axial) relative to this probe:", np.round(sol.x, 3), f"edge err {e0:.1f} -> {np.abs(res(sol.x)).sum() / n:.1f} px")
