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
Run #4 options (2026-11-17, session 01VCMXob; without them the bake is byte-identical to run #3):
  --smoothfill   fallback fill (push-pull pyramid) upsampled bilinearly instead of nearest: the coarse levels drew flat
                 square blocks that showed as flat facets wherever the camera sees a non-own texel
  --bubblefill   approved bubbles in front of the tunnel (masks/bubbles_approved.json): the approved picture is first
                 inpainted in screen space with the best-matching shifted patch of the surrounding wall / ring (boundary
                 SSD), so the wall continues behind the bubble (the bubble itself stays a bubble-specialist object)
  --paintwater   tunnel pixels where the approved picture shows water / foam (bank misregistration, river gaps at the
                 far bends, ring ends at the banks) take that approved pixel, like the foam apron on the lower wall
usage: python3 -I tools/env05/proj_bake.py <out_dir> [--coords=F] [--capture=PNG --coords_all=F] [--reset_feedback]
       [--smoothfill] [--bubblefill] [--paintwater]"""
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


def up2(est):
    """cell-centred bilinear 2x upsampling (u periodic, v clamped)"""
    p = np.concatenate([est[:1], est[:-1]], 0); n = np.concatenate([est[1:], est[-1:]], 0)
    a = np.empty((est.shape[0] * 2,) + est.shape[1:], est.dtype)
    a[0::2] = 0.75 * est + 0.25 * p; a[1::2] = 0.75 * est + 0.25 * n
    p = np.roll(a, 1, 1); n = np.roll(a, -1, 1)
    b = np.empty((a.shape[0], a.shape[1] * 2) + a.shape[2:], a.dtype)
    b[:, 0::2] = 0.75 * a + 0.25 * p; b[:, 1::2] = 0.75 * a + 0.25 * n
    return b


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
        up = up2(est) if "smoothfill" in args else np.repeat(np.repeat(est, 2, 0), 2, 1)
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
report = {}
coords = args.get("coords")
if "bubblefill" in args:
    # run #4: approved bubbles in front of the tunnel → inpaint the approved picture behind them (screen space) with the
    # best-matching shifted patch of the surrounding tunnel (SSD over a boundary annulus), class taken from the source
    tunvis = None
    if coords:
        _c = np.fromfile(coords, np.float32).reshape(H, W, 4)[..., 3]
        tunvis = (np.abs(_c - 77) < 1e-3) | (np.abs(_c - 78) < 1e-3)
    tuncls = [rid[k] for k in ("purple_walls", "gold_rings_and_front_frame", "distant_tunnel_and_glow", "side_fittings")]
    bubs = json.load(open(f"{MK}/bubbles_approved.json"))
    yy_, xx_ = np.mgrid[0:H, 0:W]
    bubm = idx == rid["bubbles"]
    for b in bubs:
        bubm |= (xx_ - b["x"]) ** 2 + (yy_ - b["y"]) ** 2 <= (b["r"] + 3) ** 2
    validsrc = np.isin(idx, tuncls) & ~bubm
    ap0, idx0 = ap.copy(), idx.copy()
    idx = idx.copy()
    fills = []
    for b in bubs:
        cx, cy, R = b["x"], b["y"], b["r"] + 3
        d2 = (xx_ - cx) ** 2 + (yy_ - cy) ** 2
        hole = (d2 <= R * R) | ((idx0 == rid["bubbles"]) & (d2 <= (R + 4) ** 2))
        need = hole & tunvis if tunvis is not None else hole
        if need.sum() < max(20, 0.05 * hole.sum()):
            continue
        ann = (d2 <= (R + 8) ** 2) & ~hole & validsrc
        hy, hx = np.nonzero(hole); ny, nx = np.nonzero(need); ay, ax = np.nonzero(ann)
        if len(ay) < 30:
            fills.append({"bubble": [cx, cy, b["r"]], "skipped": "no tunnel boundary"}); continue
        Ra = int(np.ceil(R))

        def score(dy, dx):
            sy, sx = ny + dy, nx + dx
            if sy.min() < 0 or sx.min() < 0 or sy.max() >= H or sx.max() >= W or not validsrc[sy, sx].all():
                return None
            ty, tx = ay + dy, ax + dx
            ok = (ty >= 0) & (tx >= 0) & (ty < H) & (tx < W)
            ok[ok] = validsrc[ty[ok], tx[ok]]
            if ok.mean() < 0.7:
                return None
            e = ((ap0[ay[ok], ax[ok]] - ap0[ty[ok], tx[ok]]) ** 2).mean()
            return e * (1 + 0.05 * math.hypot(dx, dy) / R)
        best = None
        for dy in range(-4 * Ra, 4 * Ra + 1, 2):
            for dx in range(-4 * Ra, 4 * Ra + 1, 2):
                if dx * dx + dy * dy < (2 * R) ** 2:
                    continue
                s = score(dy, dx)
                if s is not None and (best is None or s < best[0]):
                    best = (s, dy, dx)
        if best is None:
            fills.append({"bubble": [cx, cy, b["r"]], "skipped": "no valid source"}); continue
        for dy in range(best[1] - 1, best[1] + 2):
            for dx in range(best[2] - 1, best[2] + 2):
                s = score(dy, dx)
                if s is not None and s < best[0]:
                    best = (s, dy, dx)
        _, dy, dx = best
        wgt = np.clip(distance_transform_edt(hole)[hy, hx] / 3.0, 0, 1)[:, None]
        ap[hy, hx] = wgt * ap0[hy + dy, hx + dx] + (1 - wgt) * ap0[hy, hx]
        idx[hy, hx] = np.where(validsrc[hy + dy, hx + dx], idx0[hy + dy, hx + dx], idx0[hy, hx])
        fills.append({"bubble": [cx, cy, b["r"]], "shift": [int(dx), int(dy)], "rms": round(float(math.sqrt(best[0])), 1), "hole_px": int(hole.sum()), "tunnel_px": int(need.sum())})
    report["bubblefill"] = fills
    if "debug" in args:
        Image.fromarray(np.clip(ap, 0, 255).astype(np.uint8)).save(os.path.join(out, "approved_bubblefill.png"))
src_wall =(idx == rid["purple_walls"]) | (idx == rid["distant_tunnel_and_glow"])
src_ring = (idx == rid["gold_rings_and_front_frame"]) | (idx == rid["distant_tunnel_and_glow"])
if "regionmask" not in args:
    # run #3 (2026-11-17): the region masks are colour classes — the approved rings' white-pink marquee highlights and
    # reflections inside the band are "purple walls" there, so the ring texels under them were FILLED (highlights lost).
    # Inside the approved ring bands (ring_model.json edges about O, +-2 px) the approved pixel IS ring: rings take every
    # tunnel-class pixel there, walls take the gold slivers there (ring edge misregistration, stays next to the ring).
    rm = json.load(open("qa/pilot05/proj/tunnel/model/ring_model.json"))
    Ox, Oy = rm["origin"]
    yy_, xx_ = np.mgrid[0:H, 0:W]
    rr_ = np.hypot(xx_ - Ox, Oy - yy_); tt_ = np.arctan2(Oy - yy_, xx_ - Ox)
    def ev(c): return c[0] + c[1] * np.cos(tt_) + c[2] * np.sin(tt_) + c[3] * np.cos(2 * tt_) + c[4] * np.sin(2 * tt_)
    env = np.zeros((H, W), bool)
    for n, rgs in rm["rings"].items():
        env |= (rr_ >= ev(rgs["in"]) - 2) & (rr_ <= ev(rgs["out"]) + 2)
    tun = (idx == rid["purple_walls"]) | (idx == rid["gold_rings_and_front_frame"]) | (idx == rid["distant_tunnel_and_glow"]) | (idx == rid["side_fittings"])
    src_ring = src_ring | (tun & env)
    src_wall = src_wall | ((idx == rid["gold_rings_and_front_frame"]) & env)
src_ring[1100:] = False                                           # the bottom gold frame is the camera-held near frame
water_cls = (idx == rid["water"]) | (idx == rid["foam_banks"])
water_cls[1100:] = False


def with_water(srcm, surfm):
    """--paintwater: tunnel pixels (surfm) where the approved picture shows water / foam take that approved pixel"""
    return srcm | (water_cls & surfm) if "paintwater" in args else srcm


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


if coords:
    a, wallm, ringm = load_coords(coords)
    sw, sr = with_water(src_wall, wallm), with_water(src_ring, ringm)
    wall, own_w, seen_w = bake(wall, base_wall, wallm, sw, a)
    ring, own_r, seen_r = bake(ring, base_ring, ringm, sr, a)
    report.update(wall_own_texels=int(own_w.sum()), wall_seen_texels=int(seen_w.sum()), ring_own_texels=int(own_r.sum()), ring_seen_texels=int(seen_r.sum()),
                  wall_pixels_used=int((wallm & sw).sum()), wall_pixels_seen=int(wallm.sum()), ring_pixels_used=int((ringm & sr).sum()), ring_pixels_seen=int(ringm.sum()))

# ---------------------------------------------------------------- colour feedback (bloom spill etc.)
fb_path = os.path.join(out, "feedback.npz")
fb = dict(np.load(fb_path)) if os.path.exists(fb_path) and "reset_feedback" not in args else {"wall": np.zeros_like(wall), "ring": np.zeros_like(ring)}
if args.get("capture") and args.get("coords_all"):
    cap = np.asarray(Image.open(args["capture"]).convert("RGB"), np.float32)
    a2, wm2, rm2 = load_coords(args["coords_all"])
    hud = idx == rid["hud_and_text"]
    damp = float(args.get("damp", 0.8))
    for key, m, srcm, tex in (("wall", wm2, with_water(src_wall, wm2), wall), ("ring", rm2, with_water(src_ring, rm2), ring)):
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
