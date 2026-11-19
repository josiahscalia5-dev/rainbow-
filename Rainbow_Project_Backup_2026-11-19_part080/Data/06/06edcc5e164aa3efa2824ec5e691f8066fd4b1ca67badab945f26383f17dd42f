"""Screen 05 env05 step A — the approved rings vs the game's rings from the locked 05 camera.
Approved: qa/pilot05/proj/tunnel/model/ring_model.json (tools/proj05/tunnel_rings.py, gold-mask edges about O).
Game: the probe id buffer (scripts/proj05-tunnel-probe.mjs → tunnel_id.f32 + tunnel.json): every ring instance's pixels,
edges along the same rays; plus the analytic projection (tools/env05/ringproj.py) as a cross-check.
usage: python3 -I tools/env05/ring_table.py <tunnel.json> <tunnel_id.f32> <out.json> [pairs, e.g. A=r22,B=r23,C=f0,...]"""
import json, math, sys, os
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from ringproj import *

tj = json.load(open(sys.argv[1])); idf = sys.argv[2]; outp = sys.argv[3]
pairs = dict(p.split("=") for p in (sys.argv[4] if len(sys.argv) > 4 else "A=r22,B=r23,C=f0,D=f1,E=f2,F=f3,G=f4").split(","))
model = json.load(open("qa/pilot05/proj/tunnel/model/ring_model.json"))
a = np.fromfile(idf, np.float32).reshape(H, W, 4)
tag = np.where(a[..., 3] >= 10, np.round(a[..., 3]).astype(int), 0)
cls = np.where(tag > 0, np.round(a[..., 2]).astype(int), 0)
NT = 720
th = (np.arange(NT) + 0.5) / NT * 2 * math.pi
rows = {}
for name, key in pairs.items():
    c = 3 if key[0] == "r" else 4
    inst = int(key[1:]) if key[0] == "r" else 20 + int(key[1:])
    m = (cls == c) & (tag == inst)
    gin, gout = mask_edges(m, NT)
    ain, aout = approved_edges(model, name, NT)
    rep = model["report"].get(f"{name}_in", {})
    meas = rep.get("source") in ("measured", "scan from r 330")
    # compare where the game ring is visible on the ray and the ray is inside the frame at the approved edge, not behind HUD
    ok = np.isfinite(gin) & np.isfinite(gout)
    ax = O[0] + aout * np.cos(th); ay = O[1] - aout * np.sin(th)
    inframe = (ax >= 0) & (ax < W) & (ay >= 200) & (ay < H)
    k = ok & inframe
    row = {"key": key, "px": int(m.sum()), "approved_source": rep.get("source"), "rays_compared": int(k.sum())}
    if k.sum() > 20:
        for lab, rin, rout in (("approved", ain, aout), ("game", gin, gout)):
            cx, cy, R = circle_fit(th[k], 0.5 * (rin[k] + rout[k]))
            row[lab] = {"centre": [round(cx, 1), round(cy, 1)], "r_mid": round(R, 1), "band_px_median": round(float(np.median(rout[k] - rin[k])), 1),
                        "r_in_mean": round(float(rin[k].mean()), 1), "r_out_mean": round(float(rout[k].mean()), 1)}
        row["d_r_in_mean"] = round(float((gin[k] - ain[k]).mean()), 1)
        row["d_r_out_mean"] = round(float((gout[k] - aout[k]).mean()), 1)
        row["abs_d_edges_mean"] = round(float((np.abs(gin[k] - ain[k]) + np.abs(gout[k] - aout[k])).mean() / 2), 1)
    rows[name] = row
json.dump(rows, open(outp, "w"), indent=1)
print(f"{'ring':4s} {'game':5s} {'rays':>5s} | {'APPROVED centre':>16s} {'r_mid':>6s} {'band':>5s} | {'GAME centre':>16s} {'r_mid':>6s} {'band':>5s} | dr_in dr_out |d|")
for n, r in rows.items():
    if "approved" not in r: print(n, r["key"], r["rays_compared"], "not comparable"); continue
    A, G = r["approved"], r["game"]
    print(f"{n:4s} {r["key"]:5s} {r['rays_compared']:5d} | {str(A['centre']):>16s} {A['r_mid']:6.1f} {A['band_px_median']:5.1f} | {str(G['centre']):>16s} {G['r_mid']:6.1f} {G['band_px_median']:5.1f} | {r['d_r_in_mean']:5.1f} {r['d_r_out_mean']:5.1f} {r['abs_d_edges_mean']:5.1f}")
