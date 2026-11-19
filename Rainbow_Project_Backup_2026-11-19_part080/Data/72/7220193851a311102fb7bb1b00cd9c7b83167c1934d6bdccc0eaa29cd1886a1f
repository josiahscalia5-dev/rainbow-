"""Screen 05 env05 step B — where must each 05 ring sit (3D, real geometry, locked camera) to project onto the approved
ring? Least squares on the band edges along rays about O (approved: ring_model.json; game: tools/env05/ringproj.py).
Real rings A, B: axial distance t from the game's ring B, lateral dx (frame right), vertical dy (frame up) of the ring
centre relative to the straight axis through ring B's centre, band crown height h (fraction of R). Far rings C..G: virtual
depth Dv of the forced-perspective block, offset (ox, oy) in its cross-section plane, h.
usage: python3 -I tools/env05/ring_fit.py <tunnel.json> <out.json>"""
import json, math, sys, os
import numpy as np
from PIL import Image
from scipy.optimize import least_squares
sys.path.insert(0, os.path.dirname(__file__))
from ringproj import *
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "proj05"))

tj = json.load(open(sys.argv[1])); outp = sys.argv[2]
model = json.load(open("qa/pilot05/proj/tunnel/model/ring_model.json"))
cam = Cam(tj)
bn = dict(tj["tunnel"]["band05near"]); bf = dict(tj["tunnel"]["band05"])
NT = 720
th = (np.arange(NT) + 0.5) / NT * 2 * math.pi
water = np.asarray(Image.open("qa/pilot05/proj/target/water_mask.png").convert("L")) > 127

MB = mat4(tj["ringInstances"][3])
rR = np.linalg.norm(MB[:3, 0])
negR, U, T = MB[:3, 0] / rR, MB[:3, 1] / np.linalg.norm(MB[:3, 1]), MB[:3, 2] / np.linalg.norm(MB[:3, 2])
cB = MB[:3, 3]
eye = cam.eye
dB = float((cB - eye) @ T)


def real_M(t, dx, dy, r=rR):
    c = cB + T * t - negR * dx + U * dy
    M = np.eye(4); M[:3, 0] = negR * r; M[:3, 1] = U * r; M[:3, 2] = T; M[:3, 3] = c
    return M

# far block: reconstruct T, Rt, U, rRing, c0, q from the far ring instances (ForcedTunnel.matrix)
tun = tj["tunnel"]; D0, L = tun["D0"], tun["L"]
zOf = lambda Z: Z / (1 + Z / L)
kOf = lambda Z: (D0 + zOf(Z)) / (D0 + Z)
knots = tun["knots"]
Zs = [k[1] for k in knots[1:]]
FM = [mat4(m) for m in tj["farRingInstances"]]
Tf = FM[0][:3, 2] / np.linalg.norm(FM[0][:3, 2])
Rt = FM[0][:3, 0] / np.linalg.norm(FM[0][:3, 0]); Uf = FM[0][:3, 1] / np.linalg.norm(FM[0][:3, 1])
rRing = np.linalg.norm(FM[0][:3, 0]) / kOf(Zs[0])
qs = [(eye + Tf * (D0 + zOf(Z)) - M[:3, 3]) / kOf(Z) for Z, M in zip(Zs, FM)]
q = np.mean(qs, 0)
c0 = eye + D0 * Tf - q


def far_M(Dv, ox, oy):
    Z = Dv - D0
    c = c0 + Tf * Z + Rt * ox + Uf * oy
    M = np.eye(4); M[:3, 0] = Rt * rRing; M[:3, 1] = Uf * rRing; M[:3, 2] = Tf; M[:3, 3] = c
    return M


def edges(M, band):
    px, dep = cam.project(ring_points(M, band_profile(**band), 1440))
    if (dep < 0.3).any(): return None, None
    return polar_edges(px, NT)


def target(name):
    ain, aout = approved_edges(model, name, NT)
    def vis(r):
        x = O[0] + r * np.cos(th); y = O[1] - r * np.sin(th)
        ok = (x >= 2) & (x <= W - 3) & (y >= 205) & (y <= H - 3)
        xi = np.clip(np.round(x).astype(int), 0, W - 1); yi = np.clip(np.round(y).astype(int), 0, H - 1)
        return ok & ~water[yi, xi]
    return ain, aout, vis(ain), vis(aout)


def fit(name, kind, x0, lo, hi):
    ain, aout, vin, vout = target(name)
    def res(p):
        band = dict((bn if kind == "real" else bf), height=p[3])
        M = real_M(*p[:3]) if kind == "real" else far_M(*p[:3])
        gin, gout = edges(M, band)
        if gin is None: return np.full(2 * NT, 50.0)
        r1 = np.where(vin & np.isfinite(gin), gin - ain, 0.0)
        r2 = np.where(vout & np.isfinite(gout), gout - aout, 0.0)
        return np.concatenate([r1, r2])
    r0 = res(np.array(x0, float))
    sol = least_squares(res, x0, bounds=(lo, hi), diff_step=1e-3, loss="soft_l1", f_scale=4.0)
    rr = res(sol.x)
    n = int((vin.sum() + vout.sum()))
    return sol.x, float(np.abs(r0).sum() / n), float(np.abs(rr).sum() / n), int(vin.sum()), int(vout.sum())

out = {"camera_eye": eye.tolist(), "ringB_game_depth": dB, "far": {"D0": D0, "L": L, "rRing": rRing}}
print(f"game ring B depth from eye {dB:.2f}, rR {rR:.3f}, far rRing {rRing:.3f}")
# real rings: game A is at t = (cA - cB)·T
MA = mat4(tj["ringInstances"][2]); tA = float((MA[:3, 3] - cB) @ T)
dA = MA[:3, 3] - (cB + T * tA)
x0A = [tA, float(-dA @ negR), float(dA @ U), bn["height"]]
for name, kind, x0, lo, hi in (
    ("A", "real", x0A, [-30, -3, -4, 0.06], [-10, 3, 3, 0.25]),
    ("B", "real", [0.0, 0.0, 0.0, bn["height"]], [-12, -3, -3, 0.06], [12, 3, 3, 0.25]),
):
    p, e0, e1, nin, nout = fit(name, kind, x0, lo, hi)
    out[name] = {"kind": kind, "game": {"t_from_B": x0[0], "dx": x0[1], "dy": x0[2], "h": x0[3], "depth": dB + x0[0]},
                 "fit": {"t_from_B": p[0], "dx": p[1], "dy": p[2], "h": p[3], "depth": dB + p[0]}, "mean_abs_edge_px": [round(e0, 2), round(e1, 2)], "rays": [nin, nout]}
    print(name, "game", np.round(x0, 3), "->", np.round(p, 3), f"edge err {e0:.1f} -> {e1:.1f} px", nin, nout)
for i, name in enumerate("CDEFG"):
    Dv0 = D0 + Zs[i]
    p, e0, e1, nin, nout = fit(name, "far", [Dv0, 0.0, 0.0, bf["height"]], [Dv0 * 0.6, -3, -3, 0.04], [Dv0 * 1.6, 3, 3, 0.25])
    out[name] = {"kind": "far", "game": {"Dv": Dv0, "ox": 0, "oy": 0, "h": bf["height"]}, "fit": {"Dv": p[0], "ox": p[1], "oy": p[2], "h": p[3]},
                 "mean_abs_edge_px": [round(e0, 2), round(e1, 2)], "rays": [nin, nout]}
    print(name, "game Dv", round(Dv0, 1), "->", np.round(p, 3), f"edge err {e0:.1f} -> {e1:.1f} px", nin, nout)
json.dump(out, open(outp, "w"), indent=1)

# ---- constrained variants: no lateral offsets (rings stay concentric with the unmoved walls / far block)
if "--nolat" in sys.argv:
    print("--- no lateral offset (dx = 0, far ox = oy = 0)")
    res_nolat = {}
    pA = out["A"]["fit"]
    for name, kind, x0, lo, hi in (
        ("A", "real", [x0A[0], 0.0, x0A[2], 0.1], [-30, -1e-4, -4, 0.06], [-10, 1e-4, 3, 0.25]),
        ("B", "real", [0.0, 0.0, 0.0, 0.13], [-12, -1e-4, -3, 0.06], [12, 1e-4, 3, 0.25]),
    ):
        p, e0, e1, nin, nout = fit(name, kind, x0, lo, hi)
        print(name, np.round(p, 3), f"edge err {e0:.1f} -> {e1:.1f}")
        res_nolat[name] = {"t_from_B": p[0], "dy": p[2], "h": p[3], "depth": dB + p[0], "err": e1}
    for i, name in enumerate("CDEFG"):
        Dv0 = D0 + Zs[i]
        p, e0, e1, nin, nout = fit(name, "far", [Dv0, 0.0, 0.0, bf["height"]], [Dv0 * 0.6, -1e-4, -1e-4, 0.04], [Dv0 * 1.6, 1e-4, 1e-4, 0.25])
        print(name, np.round(p, 3), f"edge err {e0:.1f} -> {e1:.1f}")
        res_nolat[name] = {"Dv": p[0], "h": p[3], "err": e1}
    out["no_lateral"] = res_nolat
    json.dump(out, open(outp, "w"), indent=1)
