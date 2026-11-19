"""Screen 05 wake card + approved bubble sprites (foam-bubbles-particles, switches `splash05m` / `bub05`).

Both effects carry the APPROVED picture's own splash / bubble pixels as a premultiplied LINEAR layer (L, a) that the game
blends over whatever lies behind it (out = L + background * (1 - a), CustomBlending ONE / ONE_MINUS_SRC_ALPHA, no fog, no
bloom on 05). L and a are solved per pixel against a real game capture of the locked 05 frame WITHOUT them (`--bg`), through
the exact inverse of the post chain (tools/splash05/post.py = src/vfx/waterRibbon.ts PROJ05_INVERSE), choosing the most
transparent solution: a = smallest alpha that keeps L >= 0. So the locked frame shows the approved pixels, and while
riding the splash / bubbles stay transparent layers over the live water and walls (nothing of the background is baked in
where the approved is brighter than the game's background).

* Wake card: a flat card on the water in Benny's frame (riderSplash.ts createRiderSplash05). Its fragment shader projects
  the fragment's local position with the LOCKED camera (matrix `lock`, Benny frame -> clip) to find its texel. Matte =
  approved splash only: pixels whiter (less saturated, brighter) than the game's water + a band under the body (bright
  reflection / foam collar), inside the wake mask, minus Benny, the bubbles and the foam banks. Coloured differences of the
  water itself (the river texture's job) are NOT carried, so nothing water-like slides with Benny.
* Bubbles: each approved bubble (masks/bubbles_approved.json) is a camera-facing sprite placed on its locked view ray in
  front of the first surface (world-anchored), its quad half-size chosen so the locked frame shows it at the approved size.
  group "missing": the game shows no bubble there (tunnel walls, next to the splash) -> solved against --bg.
  group "painted": the bubble is painted into the projected water texture (coordinator's assets/textures/water05) -> solved
  against an inpainted clean estimate; only shown with `?bub05all=1` once the texture copy is removed (REQUEST).

usage: python3 -I tools/splash05/bake.py --bg=<capture without splash/spray> --probe=<probe.json> [--resid=<capture with the
       baked layers on> --prev=<previous target npz>] [--only=wake|bub]
outputs: assets/textures/splash05/wake05.png + wake05.json, assets/textures/bub05/bub05.png + bub05.json,
         tools/splash05/work/target.npz (the display targets, for a residual iteration)
PNG layout (no alpha channel, so no browser premultiplication can touch it): top half RGB = sqrt(L / LMAX), bottom half
grey = a."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, binary_dilation, distance_transform_edt
import cv2
from post import forward, inverse, grid

LMAX = 2.0
args = dict(a[2:].split("=", 1) for a in sys.argv[1:] if a.startswith("--") and "=" in a)
M = "qa/pilot05/full_reference_match/masks"
W, H = 864, 1536
ap = np.asarray(Image.open("references/05_flow_into_the_current.png").convert("RGB"), float) / 255
bg = np.asarray(Image.open(args["bg"]).convert("RGB"), float) / 255
probe = json.load(open(args["probe"]))
mask = lambda n: np.asarray(Image.open(f"{M}/{n}.png").convert("L")) > 127
wm, bm, fm, cm = mask("wake_splash"), mask("benny_and_hat"), mask("foam_banks"), mask("coins")
B = json.load(open(f"{M}/bubbles_approved.json"))
xy = grid()
yy, xx = np.mgrid[0:H, 0:W]
os.makedirs("tools/splash05/work", exist_ok=True)

# display-space target: the approved picture, optionally corrected by the residual of a previous capture
target = ap.copy()
if "resid" in args:
    cap = np.asarray(Image.open(args["resid"]).convert("RGB"), float) / 255
    prev = np.load(args["prev"])["target"] if "prev" in args else ap
    target = np.clip(prev - (cap - ap), 0, 1)
np.savez_compressed("tools/splash05/work/target.npz", target=target)

PAINTED = {5, 6, 7, 8, 14, 15, 16, 17, 18, 20, 21, 25, 26, 29}   # bubble_audit.py on the splash-free capture: <= 20 levels
disk_all = np.zeros((H, W), bool)
for b in B:
    disk_all |= np.hypot(xx - b["x"], yy - b["y"]) <= b["r"] + 3


def solve(tgt, back, pxy):
    """most transparent premultiplied linear layer (L, a) with forward(L + inverse(back)(1 - a)) = tgt"""
    tL, bL = inverse(tgt, pxy), inverse(back, pxy)
    a = np.clip(((bL - tL) / np.maximum(bL, 1e-4)).max(-1), 0, 1)[..., None]
    L = np.clip(tL - bL * (1 - a), 0, None)
    return L, a[..., 0]


def enc(L, a):
    """top half RGB sqrt(L/LMAX), bottom half grey alpha"""
    top = np.sqrt(np.clip(L / LMAX, 0, 1))
    bot = np.repeat(a[..., None], 3, -1)
    return (np.concatenate([top, bot], 0) * 255 + 0.5).astype(np.uint8)


# camera of the locked frame (three.js arrays are column-major)
Mw = np.array(probe["camera"]["matrixWorld"]).reshape(4, 4).T
P = np.array(probe["camera"]["projection"]).reshape(4, 4).T
V = np.linalg.inv(Mw)
focal = P[1, 1] * H / 2
cam = Mw[:3, 3]
fwd = -Mw[:3, 2] / np.linalg.norm(Mw[:3, 2])
invPV = np.linalg.inv(P @ V)


def ray(x, y):
    nd = np.array([(x + 0.5) / W * 2 - 1, 1 - (y + 0.5) / H * 2, 1.0, 1.0])
    w = invPV @ nd
    d = w[:3] / w[3] - cam
    return d / np.linalg.norm(d)


only = args.get("only", "")
# ------------------------------------------------------------------------------------------------ wake card
if only in ("", "wake"):
    Lw, aw = solve(target, bg, xy)
    sat = lambda im: (im.max(-1) - im.min(-1)) / np.maximum(im.max(-1), 1e-3)
    lum = lambda im: im @ [0.2126, 0.7152, 0.0722]
    mw = np.clip((sat(bg) - sat(ap) + 0.02) / 0.2, 0, 1) * np.clip((lum(ap) - lum(bg)) / 0.08, 0, 1)
    mw = gaussian_filter(mw, 0.7)
    # band under the body: from 40 px inside to 30 px below the approved silhouette's bottom edge (rows > 1080)
    bot = np.full(W, -1)
    for x in np.nonzero(bm.any(0))[0]:
        bot[x] = np.nonzero(bm[:, x])[0].max()
    under = (bot[xx] > 0) & (yy > bot[xx] - 40) & (yy < bot[xx] + 30) & (yy > 1080)
    mu = gaussian_filter(under.astype(float), 6)
    zone = binary_dilation(wm, iterations=4) & ~bm & ~fm & ~cm & ~disk_all
    feather = np.clip(distance_transform_edt(zone) / 4.0, 0, 1)
    m = np.maximum(mw, mu) * feather
    m[~zone] = 0
    ys, xs = np.nonzero(m > 0.004)
    x0, x1, y0, y1 = xs.min() - 2, xs.max() + 3, ys.min() - 2, ys.max() + 3
    Lc = (Lw * m[..., None])[y0:y1, x0:x1]
    ac = (aw * m)[y0:y1, x0:x1]
    os.makedirs("assets/textures/splash05", exist_ok=True)
    Image.fromarray(enc(Lc, ac)).save("assets/textures/splash05/wake05.png", optimize=True)
    Ws = np.array(probe["splash05"]["matrixWorld"]).reshape(4, 4).T
    lock = P @ V @ Ws
    meta = dict(note="tools/splash05/bake.py: wake card texture (top: sqrt(L/LMAX) premultiplied linear RGB, bottom: alpha)",
                org=[int(x0), int(y0)], size=[int(x1 - x0), int(y1 - y0)], LMAX=LMAX, frame=[W, H],
                lock=[float(v) for v in lock.T.flatten()], strength=probe["splash05"]["uStrength"], uR=probe["splash05"]["uR"],
                matte_px=int((m > 0.5).sum()), t_lock=12.0)
    json.dump(meta, open("assets/textures/splash05/wake05.json", "w"), indent=1)
    print("wake card", meta["org"], meta["size"], "matte>0.5 px", meta["matte_px"])
    np.save("tools/splash05/work/wake_matte.npy", m)

# ------------------------------------------------------------------------------------------------ bubbles
if only in ("", "bub"):
    # clean estimate under the painted bubbles: inpaint the approved picture inside their disks (Telea)
    holes = np.zeros((H, W), np.uint8)
    for i, b in enumerate(B):
        if i in PAINTED:
            holes[np.hypot(xx - b["x"], yy - b["y"]) <= b["r"] + 4] = 255
    clean = cv2.inpaint((ap * 255).astype(np.uint8)[..., ::-1], holes, 6, cv2.INPAINT_TELEA)[..., ::-1].astype(float) / 255
    Image.fromarray((clean * 255 + 0.5).astype(np.uint8)).save("tools/splash05/work/painted_clean_estimate.png")
    hits = probe["bubbles"]
    tiles, meta = [], []
    for i, b in enumerate(B):
        h = b["r"] + 5
        sl = (slice(b["y"] - h, b["y"] + h + 1), slice(b["x"] - h, b["x"] + h + 1))
        group = "painted" if i in PAINTED else "missing"
        back = clean if group == "painted" else bg
        L, a = solve(target[sl], back[sl], xy[sl])
        rr = np.hypot(xx[sl] - b["x"], yy[sl] - b["y"])
        k = np.clip((b["r"] + 3.5 - rr) / 1.5, 0, 1)
        L, a = L * k[..., None], a * k
        # world placement: on the locked view ray, in front of the first surface it hits
        d0 = hits[i]["hits"][0]["d"] if hits[i]["hits"] else 20.0
        f = 0.9 if d0 < 12 else 0.85
        rd = ray(b["x"], b["y"])
        c = cam + rd * d0 * f
        depth = float((c - cam) @ fwd)
        R = (h + 0.5) * depth / focal
        tiles.append(enc(L, a))
        meta.append(dict(i=i, x=b["x"], y=b["y"], r=b["r"], group=group, half=h, center=[float(v) for v in c], R=R, depth=depth,
                         hit=hits[i]["hits"][0]["obj"] if hits[i]["hits"] else None, alpha_mean=round(float(a[k > 0.5].mean()), 3)))
    # shelf-pack the tiles (each tile: (2h+1) wide, 2 * (2h+1) tall)
    AW = 512
    x = y = rowh = 0
    for t, m_ in zip(tiles, meta):
        tw, th = t.shape[1], t.shape[0]
        if x + tw > AW:
            x, y, rowh = 0, y + rowh + 2, 0
        m_["atlas"] = [x, y, tw, th // 2]
        x += tw + 2
        rowh = max(rowh, th)
    AH = y + rowh
    atlas = np.zeros((AH, AW, 3), np.uint8)
    for t, m_ in zip(tiles, meta):
        ax, ay, tw, th2 = m_["atlas"]
        atlas[ay:ay + 2 * th2, ax:ax + tw] = t
    os.makedirs("assets/textures/bub05", exist_ok=True)
    Image.fromarray(atlas).save("assets/textures/bub05/bub05.png", optimize=True)
    json.dump(dict(note="tools/splash05/bake.py: approved bubble sprites; atlas rect [x, y, w, h] = L tile, alpha tile directly below (y + h)",
                   LMAX=LMAX, atlas=[AW, AH], focal=focal, frame=[W, H], t_lock=12.0, bubbles=meta),
              open("assets/textures/bub05/bub05.json", "w"), indent=1)
    for m_ in meta:
        print(f"#{m_['i']:2d} {m_['group']:7s} r{m_['r']:2d} depth {m_['depth']:6.2f} R {m_['R']:.3f} alpha {m_['alpha_mean']:.2f} hit {m_['hit'][-30:] if m_['hit'] else None}")
    print("atlas", AW, AH)
