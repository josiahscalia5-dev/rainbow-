"""Screen 05 env05 — CAMERA-PROJECTION bake of the 05 tunnel walls and rings (`?env05=1`, src/vfx/proj05Tunnel.ts).
The game's own wall / ring shaders write, per screen pixel of the locked 05 frame, the texture coordinate they sample
(`node scripts/proj05-tunnel-probe.mjs --coords --q='<STACK>&env05=1' --raw=DIR` → tunnel_coords.f32: wall (u, v, 7, 77),
ring (u, v, 8, 78)). Every visible texel therefore receives exactly the approved pixel the camera sees there (bilinear
splat), only where the APPROVED picture shows that kind of surface (region masks of qa/pilot05/full_reference_match/masks:
walls ← purple walls + distant tunnel; rings ← gold rings + distant tunnel). Texels the locked camera does not see (behind
rings, HUD, river, Benny …) keep the previous bake (tunnel05/wall05.png, ring05.png: the approved wall / ring B unwrapped
and filled from the same picture), offset-blended so no tone step shows. The texture stays anchored to the 3D tunnel.
Colour feedback: `--capture=<05.png> --coords_all=<tunnel_coords_all.f32>` scatters (approved − capture) on pixels that
show the surface and the approved surface, into `<out>/feedback.npz` (accumulated, damped), applied on the next bake.
usage: python3 -I tools/env05/proj_bake.py <out_dir> [--coords=F] [--capture=PNG --coords_all=F] [--reset_feedback]"""
import json, math, os, sys
import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt, gaussian_filter, binary_dilation

W, H = 864, 1536
args = dict(a[2:].split("=", 1) if "=" in a else (a[2:], "1") for a in sys.argv[2:] if a.startswith("--"))
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
OLD = "assets/textures/tunnel05"
TW = 2048
WROWS = [("AB", 256), ("BC", 128), ("CD", 64), ("DE", 32), ("EF", 16), ("FG", 16), ("GX", 16), ("N1", 256), ("N2", 128)]
GUT = 8
RROWS = ["A", "B", "C", "D", "E", "F", "G", "N"]
RH = 48
MK = "qa/pilot05/full_reference_match/masks"

# ---------------------------------------------------------------- base atlases (the previous bake, re-laid out)
old = np.asarray(Image.open(f"{OLD}/wall05.png").convert("RGB"), np.float32)
ometa = json.load(open(f"{OLD}/tunnel05.json"))
atlas_h = sum(h for _, h in WROWS) + GUT * (len(WROWS) + 1)
wall = np.zeros((atlas_h, TW, 3), np.float32)
rows = {}
y0 = GUT
for name, h in WROWS:
    src = ometa["wall"]["rows"]["AB" if name in ("N1", "N2") else name]
    blk = old[src["y0"]:src["y0"] + src["h"]]
    if blk.shape[0] != h:
        blk = np.asarray(Image.fromarray(np.clip(blk, 0, 255).astype(np.uint8)).resize((TW, h), Image.BICUBIC), np.float32)
    wall[y0:y0 + h] = blk
    wall[y0 - GUT:y0] = blk[0]; wall[y0 + h:y0 + h + GUT] = blk[-1]
    rows[name] = {"y0": y0, "h": h}
    y0 += h + GUT
oring = np.asarray(Image.open(f"{OLD}/ring05.png").convert("RGB"), np.float32)          # u = image angle, v radial out→in
oring48 = np.asarray(Image.fromarray(np.clip(oring, 0, 255).astype(np.uint8)).resize((TW, RH), Image.BICUBIC), np.float32)
ring = np.zeros((RH * len(RROWS), TW, 3), np.float32)
for i, n in enumerate(RROWS):
    # real rings (A, B, N): object angle 0 = screen LEFT (basis −right) → half a turn from the image angle
    ring[i * RH:(i + 1) * RH] = np.roll(oring48, TW // 2, axis=1) if n in ("A", "B", "N") else oring48
base_wall, base_ring = wall.copy(), ring.copy()


def push_pull(val, wt, levels=9):
    """fill zero-weight texels of val (h, w, c) from coarser levels (weighted pyramid), u periodic"""
    pyr = [(val * wt[..., None], wt)]
    for _ in range(levels):
        v, w = pyr[-1]
        if min(w.shape) < 4: break
        hh, ww = w.shape[0] // 2 * 2, w.shape[1] // 2 * 2
        v2 = v[:hh, :ww].reshape(hh // 2, 2, ww // 2, 2, -1).sum((1, 3)); w2 = w[:hh, :ww].reshape(hh // 2, 2, ww // 2, 2).sum((1, 3))
        pyr.append((v2, w2))
    v, w = pyr[-1]
    est = v / np.maximum(w, 1e-6)[..., None]
    for v, w in reversed(pyr[:-1]):
        up = np.repeat(np.repeat(est, 2, 0), 2, 1)
        up = np.pad(up, ((0, v.shape[0] - up.shape[0]), (0, v.shape[1] - up.shape[1]), (0, 0)), mode="edge")
        a = np.clip(w, 0, 1)[..., None]
        est = a * (v / np.maximum(w, 1e-6)[..., None]) + (1 - a) * up
    return est


def splat(tex_shape, U, V, col, wrap_u=True):
    """bilinear splat of colours col (n, 3) at texture coords (U, V in 0..1) → acc (h, w, 3), wsum (h, w)"""
    h, w = tex_shape
    x = U * w - 0.5; y = V * h - 0.5
    x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int)
    fx = x - x0; fy = y - y0
    acc = np.zeros((h, w, 3)); ws = np.zeros((h, w))
    for dx, dy, wt in ((0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)):
        xx = (x0 + dx) % w if wrap_u else np.clip(x0 + dx, 0, w - 1)
        yy = np.clip(y0 + dy, 0, h - 1)
        np.add.at(ws, (yy, xx), wt)
        for c in range(3): np.add.at(acc[..., c], (yy, xx), wt * col[:, c])
    return acc, ws


def load_coords(path):
    a = np.fromfile(path, np.float32).reshape(H, W, 4)
    wallm = np.abs(a[..., 3] - 77) < 1e-3; ringm = np.abs(a[..., 3] - 78) < 1e-3
    return a, wallm, ringm


ap = np.asarray(Image.open("references/05_flow_into_the_current.png").convert("RGB"), np.float32)
idx = np.asarray(Image.open(f"{MK}/region_index.png"))
rid = {k: v["id"] for k, v in json.load(open(f"{MK}/regions.json"))["regions"].items()}
src_wall = (idx == rid["purple_walls"]) | (idx == rid["distant_tunnel_and_glow"])
src_ring = (idx == rid["gold_rings_and_front_frame"]) | (idx == rid["distant_tunnel_and_glow"])
src_ring[1100:] = False                                           # the bottom gold frame is the camera-held near frame
report = {}


def bake(tex, base, coordm, srcm, a, wrap_u=True):
    """own texels = approved pixels; elsewhere base + the own-minus-base offset diffused with a falloff"""
    h, w = tex.shape[:2]
    m = coordm & srcm
    yy, xx = np.nonzero(m)
    acc, ws = splat((h, w), a[yy, xx, 0], a[yy, xx, 1], ap[yy, xx], wrap_u)
    own = ws > 0.2
    ownc = acc / np.maximum(ws, 1e-6)[..., None]
    # texels the camera sees between splat hits (minified areas): interpolate the own colours (push-pull) within the
    # visible footprint (all coord hits, incl. invalid approved pixels, dilated by 1)
    seen = binary_dilation(splat((h, w), a[coordm][:, 0], a[coordm][:, 1], np.zeros((coordm.sum(), 3)), wrap_u)[1] > 0, iterations=1)
    pp = push_pull(np.where(own[..., None], ownc, 0), own.astype(np.float64))
    near_own = distance_transform_edt(~own) <= 2.5
    fill_pp = seen & ~own & near_own
    res = base.copy()
    off = np.where(own[..., None], ownc - base, 0)
    offd = push_pull(off, own.astype(np.float64))
    dist = distance_transform_edt(~own)
    res = base + offd * np.exp(-dist / 10.0)[..., None]
    res[fill_pp] = pp[fill_pp]
    res[own] = ownc[own]
    return np.clip(res, 0, 255), own, seen


coords = args.get("coords")
if coords:
    a, wallm, ringm = load_coords(coords)
    wall, own_w, seen_w = bake(wall, base_wall, wallm, src_wall, a)
    ring, own_r, seen_r = bake(ring, base_ring, ringm, src_ring, a)
    report.update(wall_own_texels=int(own_w.sum()), wall_seen_texels=int(seen_w.sum()), ring_own_texels=int(own_r.sum()), ring_seen_texels=int(seen_r.sum()),
                  wall_pixels_used=int((wallm & src_wall).sum()), wall_pixels_seen=int(wallm.sum()), ring_pixels_used=int((ringm & src_ring).sum()), ring_pixels_seen=int(ringm.sum()))

# ---------------------------------------------------------------- colour feedback (bloom spill etc.)
fb_path = os.path.join(out, "feedback.npz")
fb = dict(np.load(fb_path)) if os.path.exists(fb_path) and "reset_feedback" not in args else {"wall": np.zeros_like(wall), "ring": np.zeros_like(ring)}
if args.get("capture") and args.get("coords_all"):
    cap = np.asarray(Image.open(args["capture"]).convert("RGB"), np.float32)
    a2, wm2, rm2 = load_coords(args["coords_all"])
    hud = idx == rid["hud_and_text"]
    damp = float(args.get("damp", 0.8))
    for key, m, srcm, tex in (("wall", wm2, src_wall, wall), ("ring", rm2, src_ring, ring)):
        mm = m & srcm & ~hud
        yy, xx = np.nonzero(mm)
        r = ap[yy, xx] - cap[yy, xx]
        acc, ws = splat(tex.shape[:2], a2[yy, xx, 0], a2[yy, xx, 1], r)
        ok = ws > 0.2
        d = np.where(ok[..., None], acc / np.maximum(ws, 1e-6)[..., None], 0)
        # low-pass the residual (bloom is smooth; per-texel noise would add speckle)
        num = np.stack([gaussian_filter(d[..., c] * ok, 1.5, mode=("nearest", "wrap")) for c in range(3)], -1)
        den = gaussian_filter(ok.astype(float), 1.5, mode=("nearest", "wrap"))
        d = np.where((den > 0.05)[..., None], num / np.maximum(den, 1e-6)[..., None], 0)
        fb[key] = np.clip(fb[key] + damp * d, -90, 90)
        report[f"feedback_{key}_mean_abs_residual"] = round(float(np.abs(r).mean()), 2)
    np.savez_compressed(fb_path, **fb)
if "wall" in fb and fb["wall"].shape == wall.shape: wall = np.clip(wall + fb["wall"], 0, 255)
if "ring" in fb and fb["ring"].shape == ring.shape: ring = np.clip(ring + fb["ring"], 0, 255)

Image.fromarray((wall + 0.5).astype(np.uint8)).save(os.path.join(out, "wall05e.png"), optimize=True)
Image.fromarray((ring + 0.5).astype(np.uint8)).save(os.path.join(out, "ring05e.png"), optimize=True)
meta = {"wall": {"w": TW, "h": atlas_h, "rows": rows, "gutter": GUT}, "ring": {"w": TW, "h": RH * len(RROWS), "rowH": RH, "rows": RROWS},
        "note": "env05 camera-projection bake (tools/env05/proj_bake.py); wall u = angle round the tube (+0.25), ring u = object angle, v = axial"}
json.dump(meta, open(os.path.join(out, "env05.json"), "w"), indent=1)
json.dump(report, open(os.path.join(out, "bake_report.json"), "w"), indent=1)
print(json.dumps(report))
