"""env05 — analytic study of the wall/ring displacement WEIGHT (src/world/environment.ts e05Weight) without a render.
Replicates the real 05 rings A, B (one warped mesh each) and the far rings C..G (instanced, object x displaced) exactly as
the game builds them (tube.ts buildWarpedBandRing / environment.ts far rings), projects them through the locked camera of
an env05 probe (tunnel.json) and compares the band edges along rays about O with the approved ring model (as warp_fit.py:
rays whose approved edge lies on the river or under the HUD are not compared). Also draws every variant's band outline on
the approved picture (kinks / bulges show by eye).
usage: python3 -I tools/env05/weight_study.py <tunnel.json> <out_dir> [variant ...]
variants: cur | asym:<l0>,<l1>,<r0>,<r1>  (left half ramps smoothstep(sin th, l0, l1), right half smoothstep(sin th, r0, r1))
          optional suffix @side,up for ring B and A overrides, e.g. asym:-0.95,-0.45,-0.28,0.45"""
import json, math, sys, os
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(__file__))
from ringproj import *

tj = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
variants = sys.argv[3:] or ["cur"]
model = json.load(open("qa/pilot05/proj/tunnel/model/ring_model.json"))
water = np.asarray(Image.open("qa/pilot05/proj/target/water_mask.png").convert("L")) > 127
cam = Cam(tj)
tun = tj["tunnel"]
bn = dict(tun["band05near"]); bf = dict(tun["band05"])
NT = 720
th = (np.arange(NT) + 0.5) / NT * 2 * math.pi
ap = Image.open("references/05_flow_into_the_current.png").convert("RGB")

# environment.ts E05 (keep in sync)
E05 = dict(hA=0.09, hB=0.12, hFar=0.11, side=[[3, 0], [17, -0.715], [23, -0.715], [35, -0.95], [42, -0.95], [54, -0.6]],
           up=[[6, 0], [17, 0.42], [23, 0.42], [32, -0.23], [42, -0.23], [54, 0.45]], sideFar=-0.6)


def sstep(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def knots_at(k, x):
    if x <= k[0][0]: return k[0][1]
    for i in range(1, len(k)):
        if x <= k[i][0]:
            return k[i - 1][1] + (k[i][1] - k[i - 1][1]) * float(sstep(x, k[i - 1][0], k[i][0]))
    return k[-1][1]


def weight_fn(spec):
    if spec == "cur":   # run #3 game RING weight (environment.ts e05RingWeight; the wall's right half is −0.28 … 0.05)
        return lambda t: np.where(np.cos(t) < 0, sstep(np.sin(t), -0.95, -0.5), sstep(np.sin(t), -0.9, -0.1))
    if spec == "e2":    # the weight of probe e2 (symmetric)
        return lambda t: sstep(np.sin(t), -0.28, 0.05)
    l0, l1, r0, r1 = [float(v) for v in spec.split(":")[1].split(",")]
    return lambda t: np.where(np.cos(t) < 0, sstep(np.sin(t), l0, l1), sstep(np.sin(t), r0, r1))


def vis(rr):
    x = O[0] + rr * np.cos(th); y = O[1] - rr * np.sin(th)
    ok = (x >= 2) & (x <= W - 3) & (y >= 205) & (y <= H - 3)
    return ok & ~water[np.clip(np.round(y).astype(int), 0, H - 1), np.clip(np.round(x).astype(int), 0, W - 1)]


sCam = tun["sCam05"]
rings = tun["rings05"]
real = []  # (name, instance index, depth d, band height)
for k, s in enumerate(rings):
    d = s - sCam
    if abs(d - 20) < 0.5: real.append(("A", k, d, E05["hA"]))
    elif d > 30: real.append(("B", k, d, E05["hB"]))
far_names = ["C", "D", "E", "F", "G"]


def real_points(k, d, h, wfn, side=None, up=None):
    M = mat4(tj["ringInstances"][k]); r = np.linalg.norm(M[:3, 0])
    prof = band_profile(**dict(bn, height=h))
    phi = np.linspace(0, 2 * math.pi, 1440, endpoint=False)
    x = prof[None, :, 0] * np.sin(phi)[:, None]; y = -prof[None, :, 0] * np.cos(phi)[:, None]
    w = wfn(np.arctan2(y, -x))
    sd = knots_at(E05["side"], d) if side is None else side
    u = knots_at(E05["up"], d) if up is None else up
    x2 = x - sd * w / r; y2 = y + u * w / r
    X = np.stack([x2, y2, np.broadcast_to(prof[None, :, 1], x.shape), np.ones_like(x)], -1)
    return (X @ M.T)[..., :3]


def far_points(i, h, wfn, sideFar=None):
    M = mat4(tj["farRingInstances"][i]); r = np.linalg.norm(M[:3, 0])
    rRing = r  # object scale incl. the forced-perspective factor; the game displaces object x by sideFar·w / rRing (rRing = real radius)
    prof = band_profile(**dict(bf, height=h))
    phi = np.linspace(0, 2 * math.pi, 1440, endpoint=False)
    x = prof[None, :, 0] * np.sin(phi)[:, None]; y = -prof[None, :, 0] * np.cos(phi)[:, None]
    # far ring object x runs along Rt (screen right): th = atan2(y, x)
    w = wfn(np.arctan2(y, x))
    sf = E05["sideFar"] if sideFar is None else sideFar
    x2 = x + sf * w / (tun["R"] - 0.02)
    y = y + UPFAR * w / (tun["R"] - 0.02)
    X = np.stack([x2, y, np.broadcast_to(prof[None, :, 1], x.shape), np.ones_like(x)], -1)
    return (X @ M.T)[..., :3]


def err(name, P):
    px, dep = cam.project(P)
    gin, gout = polar_edges(px, NT)
    LINES.append((name, gin, gout))
    ain, aout = approved_edges(model, name, NT)
    vin, vout = vis(ain), vis(aout)
    a = np.where(vin & np.isfinite(gin), np.abs(gin - ain), np.nan)
    b = np.where(vout & np.isfinite(gout), np.abs(gout - aout), np.nan)
    allv = np.concatenate([a[np.isfinite(a)], b[np.isfinite(b)]])
    # lower sides (image angle 180..250 = lower left, 290..360 = lower right) separately
    def part(lo, hi):
        m = (np.degrees(th) >= lo) & (np.degrees(th) < hi)
        v = np.concatenate([a[m][np.isfinite(a[m])], b[m][np.isfinite(b[m])]])
        return round(float(v.mean()), 1) if v.size else None
    return dict(all=round(float(allv.mean()), 1) if allv.size else None, n=int(allv.size), upper=part(20, 160), left=part(160, 250), right=part(290, 360)), px


def draw_edges(dr, rin, rout, col, wdt=2):
    for rr in (rin, rout):
        pts = [(O[0] + r * math.cos(t), O[1] - r * math.sin(t)) for r, t in zip(rr, th)]
        for (x0, y0), (x1, y1), r0, r1 in zip(pts, pts[1:] + pts[:1], rr, np.roll(rr, -1)):
            if np.isfinite(r0) and np.isfinite(r1) and abs(r0 - r1) < 40: dr.line((x0, y0, x1, y1), fill=col, width=wdt)


FIT = os.environ.get('WS_FIT') == '1'
UPFAR = float(os.environ.get('WS_UPFAR', '0.45'))
res = {}
LINES = []
for v in variants:
    spec, _, ov = v.partition("@")
    wfn = weight_fn(spec)
    img = ap.copy(); dr = ImageDraw.Draw(img)
    row = {}
    LINES.clear()
    for name, k, d, h in real:
        P = real_points(k, d, h, wfn)
        e, px = err(name, P)
        row[name] = e
        if FIT:
            from scipy.optimize import least_squares
            ain, aout = approved_edges(model, name, NT)
            vin, vout = vis(ain), vis(aout)
            def resid(p):
                gin, gout = polar_edges(cam.project(real_points(k, d, h, wfn, p[0], p[1]))[0], NT)
                return np.concatenate([np.where(vin & np.isfinite(gin), gin - ain, 0), np.where(vout & np.isfinite(gout), gout - aout, 0)])
            p0 = [knots_at(E05["side"], d), knots_at(E05["up"], d)]
            sol = least_squares(resid, p0, bounds=([-3, -3], [3, 3]), diff_step=1e-3, loss="soft_l1", f_scale=4.0)
            e2, _ = err(name, real_points(k, d, h, wfn, *sol.x)); LINES.pop()
            row[name + "_fit"] = dict(side=round(float(sol.x[0]), 3), up=round(float(sol.x[1]), 3), **e2)
    for i, name in enumerate(far_names[:len(tj["farRingInstances"])]):
        P = far_points(i, E05["hFar"], wfn)
        e, px = err(name, P)
        row[name] = e
    for name, gin, gout in LINES:
        ain, aout = approved_edges(model, name, NT)
        draw_edges(dr, ain, aout, (255, 255, 255), 1)
        draw_edges(dr, gin, gout, (0, 255, 80) if name in ("A", "B") else (255, 255, 0), 2)
    res[v] = row
    img.crop((0, 150, 864, 800)).save(os.path.join(out, f"ws_{v.replace(':', '_').replace(',', '_')}.png"))
    print(v, json.dumps(row))
json.dump(res, open(os.path.join(out, "weight_study.json"), "w"), indent=1)
