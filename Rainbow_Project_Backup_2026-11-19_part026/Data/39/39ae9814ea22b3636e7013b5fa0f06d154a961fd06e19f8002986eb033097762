"""Screen 05 walls + gold rings bake, step 2 — unwrap the approved picture's tunnel into textures in the tunnel's OWN
coordinates (so they are anchored to the 3D tunnel, not to the camera):
  wall05.png   atlas, one row per wall bay between two gold rings: AB, BC, CD, DE, EF, FG, GX (beyond the last ring).
               u = image angle theta / 360 (0 = screen right, counter-clockwise), v = t from the near ring's far edge (0) to
               the far ring's near edge (1), linear in depth (1/r). Hidden parts (HUD, lids, bubbles, foam, river) are
               filled from the mirrored wall (left <-> right) and then by reflection along theta. No invented texture.
  ring05.png   the gold band of ring B unwrapped: u = theta / 360, v = 0 at the band's outer (camera-side) edge .. 1 inner.
  tunnel05.json  atlas rows, sizes, conventions (read by src/vfx/proj05Tunnel.ts)
usage: python3 -I tools/proj05/tunnel_bake.py <model_dir with ring_model.json> <out_dir> [correction.npz]"""
import json, math, os, sys
import numpy as np, cv2
from PIL import Image
from scipy.ndimage import distance_transform_edt, gaussian_filter
sys.path.insert(0, os.path.dirname(__file__))
from tunnel_common import *

model_dir, out = sys.argv[1], sys.argv[2]
corr_path = sys.argv[3] if len(sys.argv) > 3 else None
os.makedirs(out, exist_ok=True)
model = json.load(open(os.path.join(model_dir, "ring_model.json")))
ap8 = load_approved(); M = masks(ap8)

TW = 2048                                  # atlas width (theta)
ROWS = [("AB", 256), ("BC", 128), ("CD", 64), ("DE", 32), ("EF", 16), ("FG", 16), ("GX", 16)]
GUT = 8                                    # gutter rows between atlas rows (edge texels repeated)
RING_W, RING_H = 2048, 64


def edge(name, which, th):
    c = model["rings"][name][which]
    return c[0] + c[1] * np.cos(th) + c[2] * np.sin(th) + c[3] * np.cos(2 * th) + c[4] * np.sin(2 * th)


# ---- validity of approved pixels as WALL
nonwall = M["light"] | M["cyan"]
nonwall = binary_dilation(binary_opening(nonwall, iterations=1), iterations=7)        # bubbles, foam (specks dropped)
gold = binary_dilation(M["warm"], iterations=2)
lid = binary_dilation(M["lid"], iterations=5)
water = binary_dilation(M["water"], iterations=6)
wall_ok = ~(nonwall | gold | lid | water | M["hud"]) & M["env"]
# ---- validity as RING gold
ring_ok = M["warm"] & ~lid & ~M["hud"] & M["env"] & ~binary_dilation(M["water"], iterations=2)

apf = ap8.astype(np.float32)


def sample(mx, my, ok):
    img = cv2.remap(apf, mx, my, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    v = cv2.remap(ok.astype(np.float32), mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    inside = (mx >= 0.5) & (mx <= W - 1.5) & (my >= 0.5) & (my <= H - 1.5)
    return np.clip(img, 0, 255), (v > 0.985) & inside



def lowfreq_match(patch, ref, ring, hole, sigma=14.0):
    """shift the copied patch by the smooth colour difference to the surrounding own pixels (ring), so no tone step shows"""
    d = np.zeros_like(patch); wsum = ring.astype(np.float32)
    for c in range(3):
        d[..., c] = gaussian_filter((ref[..., c] - patch[..., c]) * wsum, sigma, mode=("nearest", "wrap"))
    wb = gaussian_filter(wsum, sigma, mode=("nearest", "wrap"))
    d = d / np.maximum(wb, 1e-4)[..., None]
    d[wb < 1e-3] = 0
    return np.clip(patch + d * hole[..., None], 0, 255)


def translate_fill(img, ok, max_w, dt_max=14, label_id=4, srcmap=None):
    """fill bounded holes by copying the same wall from further along theta (shift d_theta, small d_t), chosen so that the
    copy agrees best with the own pixels round the hole; the slot rows run along theta, so the copy keeps them intact"""
    from scipy.ndimage import label as cc_label
    h, w = ok.shape
    out_img = img.copy(); have = ok.copy()
    # thin invalid strips (bay ends next to the gold, hairlines) must not join separate holes into one: label the
    # opened mask, then grow every hole back by a few texels inside the invalid area
    core = binary_opening(~ok, iterations=4)
    lab0, n = cc_label(core)
    lab = lab0.copy()
    for _ in range(7):
        grown = np.zeros_like(lab)
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            sh = np.roll(lab, (dy, dx), (0, 1))
            if dy == 1: sh[0] = 0
            if dy == -1: sh[-1] = 0
            grown = np.where((grown == 0), sh, grown)
        lab = np.where((lab == 0) & ~ok, grown, lab)
    # merge components across the theta seam
    for y in range(h):
        a, b = lab[y, 0], lab[y, -1]
        if a and b and a != b: lab[lab == b] = a
    ids = [i for i in np.unique(lab) if i]
    info = []
    for i in ids:
        m = lab == i
        cols = np.nonzero(m.any(0))[0]
        if len(cols) == 0: continue
        # width on the circle: the smallest arc containing the columns
        gaps = np.diff(np.concatenate([cols, [cols[0] + w]]))
        wd = w - gaps.max() + 1
        if wd > max_w or m.sum() < 12: continue
        info.append((int(m.sum()), i, wd))
    for _, i, wd in sorted(info):
        m = lab == i
        ring = binary_dilation(m, iterations=7) & have & ~m
        if ring.sum() < 30: continue
        hy, hx = np.nonzero(m); ry, rx = np.nonzero(ring)
        sub = slice(None, None, max(1, len(hy) // 4000))
        hys, hxs = hy[sub], hx[sub]
        best = None
        for sign in (-1, 1):
            for d in range(wd + 3, min(3 * wd + 80, w // 3), 2):
                D = sign * d
                for dt in range(-dt_max, dt_max + 1, 2):
                    yy = hys + dt
                    if yy.min() < 0 or yy.max() >= h: continue
                    if have[yy, (hxs + D) % w].mean() < 0.995: continue
                    ry2 = ry + dt; okr = (ry2 >= 0) & (ry2 < h)
                    if okr.mean() < 0.7: continue
                    srcok = have[ry2[okr], (rx[okr] + D) % w]
                    if srcok.mean() < 0.7: continue
                    a = out_img[ry2[okr], (rx[okr] + D) % w][srcok]; b = out_img[ry[okr], rx[okr]][srcok]
                    diff = a - b
                    cost = float(np.abs(diff - diff.mean(0)).mean()) + 0.004 * d + 0.15 * abs(dt)
                    if best is None or cost < best[0]: best = (cost, D, dt)
        if best is None: continue
        _, D, dt = best
        yy = np.clip(hy + dt, 0, h - 1)
        patch = out_img.copy()
        patch[hy, hx] = out_img[yy, (hx + D) % w]
        ringv = np.zeros((h, w), bool); ringv[ry, rx] = True
        ry2 = np.clip(ry + dt, 0, h - 1)
        ref = out_img.copy()
        cmp_ = out_img.copy(); cmp_[ry, rx] = out_img[ry2, (rx + D) % w]
        # colour difference measured on the ring (own pixel vs what the copy would put there), diffused into the hole
        d3 = np.zeros_like(out_img); wsum = ringv.astype(np.float32)
        for c in range(3):
            d3[..., c] = gaussian_filter((ref[..., c] - cmp_[..., c]) * wsum, 12.0, mode=("nearest", "wrap"))
        wb = gaussian_filter(wsum, 12.0, mode=("nearest", "wrap"))
        d3 = d3 / np.maximum(wb, 1e-4)[..., None]
        out_img[hy, hx] = np.clip(patch[hy, hx] + d3[hy, hx], 0, 255)
        have[hy, hx] = True
        if srcmap is not None: srcmap[hy, hx] = label_id
    return out_img, have


def fill_theta(img, ok, feather=5.0, src0=None, mirror=True):
    """fill invalid texels: (1) from the mirrored wall (theta -> 180 deg - theta), (2) by reflection along theta about the
    nearest valid run, (3) nearest along t. Returns the filled image and the source map (0 own, 1 mirror, 2 reflect, 3 t)."""
    h, w = ok.shape
    src = np.zeros((h, w), np.uint8) if src0 is None else src0.copy()
    out_img = img.copy(); have = ok.copy()
    j = np.arange(w)
    jm = (w // 2 - 1 - j) % w
    mimg, mok = img[:, jm], ok[:, jm]
    take = ~have & mok & mirror
    out_img[take] = mimg[take]; src[take] = 1; have |= take
    # reflection along theta (periodic), row by row, repeated until nothing changes
    for _ in range(64):
        if have.all(): break
        changed = False
        for y in range(h):
            row = have[y]
            if row.all() or not row.any(): continue
            idx = np.nonzero(row)[0]
            # nearest valid column on each side (periodic)
            pos = np.searchsorted(idx, j)
            left = idx[(pos - 1) % len(idx)]; right = idx[pos % len(idx)]
            dl = (j - left) % w; dr = (right - j) % w
            usel = dl <= dr
            near = np.where(usel, left, right); d = np.where(usel, dl, dr)
            refl = np.where(usel, (left - dl + 1) % w, (right + dr - 1) % w)       # mirror about the run's edge
            bad = ~row
            good_src = row[refl]
            t1 = bad & good_src
            out_img[y, t1] = out_img[y, refl[t1]]
            src[y, t1] = 2
            newrow = row | t1
            if (newrow != row).any(): changed = True
            have[y] = newrow
        if not changed: break
    if not have.all():
        d, (iy, ix) = distance_transform_edt(~have, return_indices=True)
        miss = ~have
        out_img[miss] = out_img[iy[miss], ix[miss]]; src[miss] = 3
    # feather the seams between own and filled texels (own pixels are kept exact)
    if feather > 0:
        own = (src == 0).astype(np.float32)
        blur = np.stack([gaussian_filter(out_img[..., c], (0.6, feather), mode=("nearest", "wrap")) for c in range(3)], -1)
        dist = distance_transform_edt(src != 0)                                    # inside the filled area: distance to own
        wgt = np.clip(1.0 - dist / (feather * 1.5), 0, 1)[..., None] * (src != 0)[..., None]
        out_img = out_img * (1 - 0.5 * wgt) + blur * (0.5 * wgt)
    return out_img, src


th = (np.arange(TW) + 0.5) / TW * 2 * math.pi
atlas_h = sum(h for _, h in ROWS) + GUT * (len(ROWS) + 1)
atlas = np.zeros((atlas_h, TW, 3), np.float32)
srcmap = np.zeros((atlas_h, TW), np.uint8)
meta_rows = {}
report = {}
raw = {}
for name, h in ROWS:
    a, b = name[0], name[1]
    r0 = edge(a, "in", th)
    r1 = edge(b, "out", th) if b != "X" else np.full(TW, 9.0)
    t = (np.arange(h) + 0.5) / h
    inv = (1 - t)[:, None] / r0[None, :] + t[:, None] / r1[None, :]
    rr = 1.0 / inv
    mx = (O[0] + rr * np.cos(th)[None, :]).astype(np.float32)
    my = (O[1] - rr * np.sin(th)[None, :]).astype(np.float32)
    okmask = wall_ok if name in ("AB", "BC", "CD") else (wall_ok | (M["env"] & ~M["hud"] & ~water & ~lid)) if name != "GX" else (M["env"] & ~M["hud"] & ~binary_dilation(M["water"], iterations=2))
    raw[name] = sample(mx, my, okmask)

y0 = GUT
for name, h in ROWS:
    img, ok = raw[name]
    src = np.zeros(ok.shape, np.uint8)
    if name == "AB":
        # the crown of bay AB is behind the HUD in the approved picture: take the same wall from bay BC (same theta, same
        # t), which the picture shows completely, colour-matched to AB's own pixels next to it
        bimg, bok = raw["BC"]
        bimg = cv2.resize(bimg, (TW, h), interpolation=cv2.INTER_CUBIC); bok = cv2.resize(bok.astype(np.uint8), (TW, h), interpolation=cv2.INTER_NEAREST) > 0
        thd = np.degrees(th)
        crown = ((thd > 40) & (thd < 140))[None, :] & ~ok & bok
        ring = binary_dilation(crown, iterations=10) & ok
        img = np.where(crown[..., None], lowfreq_match(bimg, img, ring, crown, 30.0), img)
        src[crown] = 5; ok = ok | crown
    if name in ("AB", "BC", "CD"):
        img, ok2 = translate_fill(img, ok, max_w=int(TW * 70 / 360), dt_max=int(h * 0.06), srcmap=src)
    else:
        ok2 = ok
    filled, src = fill_theta(img, ok2, src0=src, mirror=name not in ("AB", "BC", "CD"))
    atlas[y0:y0 + h] = filled; srcmap[y0:y0 + h] = src
    atlas[y0 - GUT:y0] = filled[0]; atlas[y0 + h:y0 + h + GUT] = filled[-1]
    meta_rows[name] = {"y0": y0, "h": h}
    report[name] = {k: round(float((src == v).mean()), 3) for k, v in (("own", 0), ("mirror", 1), ("reflect", 2), ("nearest_t", 3), ("translate", 4), ("from_BC", 5))}
    y0 += h + GUT

# ---- ring B band
thr = (np.arange(RING_W) + 0.5) / RING_W * 2 * math.pi
ro, ri = edge("B", "out", thr), edge("B", "in", thr)
v = (np.arange(RING_H) + 0.5) / RING_H
rr = ro[None, :] * (1 - v)[:, None] + ri[None, :] * v[:, None]
mx = (O[0] + rr * np.cos(thr)[None, :]).astype(np.float32)
my = (O[1] - rr * np.sin(thr)[None, :]).astype(np.float32)
rimg, rok = sample(mx, my, ring_ok)
# a column is usable only if most of the band is gold there (lids / water / HUD columns are dropped entirely)
colok = rok.mean(0) > 0.8
rok2 = np.repeat(colok[None, :], RING_H, 0)
rsrc = np.zeros(rok2.shape, np.uint8)
rimg2, rok3 = translate_fill(rimg, rok2, max_w=int(RING_W * 80 / 360), dt_max=0, srcmap=rsrc)
ring, rsrc = fill_theta(rimg2, rok3, feather=8.0, src0=rsrc, mirror=False)
report["ring_B"] = {"own_columns": round(float(colok.mean()), 3), "theta_deg_own": [round(float(np.degrees(thr[colok].min())), 1), round(float(np.degrees(thr[colok].max())), 1)]}

if corr_path and os.path.exists(corr_path):
    c = np.load(corr_path)
    if "wall" in c: atlas = atlas + c["wall"]
    if "ring" in c: ring = ring + c["ring"]
    report["correction"] = corr_path

Image.fromarray(np.clip(atlas + 0.5, 0, 255).astype(np.uint8)).save(os.path.join(out, "wall05.png"), optimize=True)
Image.fromarray(np.clip(ring + 0.5, 0, 255).astype(np.uint8)).save(os.path.join(out, "ring05.png"), optimize=True)
np.save(os.path.join(model_dir, "wall05_srcmap.npy"), srcmap)
np.save(os.path.join(model_dir, "ring05_srcmap.npy"), rsrc)
meta = {"wall": {"w": TW, "h": atlas_h, "rows": meta_rows, "gutter": GUT}, "ring": {"w": RING_W, "h": RING_H},
        "theta": "u = image angle / 360, 0 = screen right, counter-clockwise (90 deg = up)", "origin": list(O)}
json.dump(meta, open(os.path.join(out, "tunnel05.json"), "w"), indent=1)
json.dump(report, open(os.path.join(model_dir, "bake_report.json"), "w"), indent=1)
print(json.dumps(report, indent=1))
print("atlas", TW, atlas_h, "ring", RING_W, RING_H)
