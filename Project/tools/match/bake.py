"""Any screen (`?matchNN=1`, src/vfx/matchProj.ts): bake the APPROVED picture into the generic projector's textures.
  assets/textures/match/NN_bg.png     the approved picture with what the GAME draws itself removed (inpainted): Benny +
                                      splash, the coins, the HUD bar + title banner — otherwise they would be painted onto
                                      the water / walls behind them and slide around when Benny moves
  assets/textures/match/NN_depth.png  per pixel the view depth (clip w) of the first STATIC surface at the checkpoint
                                      (scripts/match-probe.mjs): R = high byte, G = low byte of round(d / far * 65535),
                                      A = 255 where there is a surface (sampled NEAREST in the game)
  assets/textures/match/NN.json       the checkpoint camera's view-projection matrix, size, far, the masks' shares
Coins of the approved picture: compact bright gold blobs (rings and paddles are long / large, left alone).
usage: python3 -I tools/match/bake.py <NN> <probe_dir> [--hud=x0,y0,x1,y1;...] [--grow=14] [--debug=DIR]"""
import glob, json, os, sys
import numpy as np, cv2
from PIL import Image
from scipy.ndimage import binary_dilation

pos = [a for a in sys.argv[1:] if not a.startswith("--")]
opt = dict(a[2:].split("=", 1) for a in sys.argv[1:] if a.startswith("--") and "=" in a)
NN, PROBE = pos[0], pos[1]
OUT = opt.get("out", "assets/textures/match")
GROW = int(opt.get("grow", 14))
ref = glob.glob(f"references/{NN}_*.png")[0]
ap8 = np.asarray(Image.open(ref).convert("RGB"))
H, W = ap8.shape[:2]
cam = json.load(open(os.path.join(PROBE, "camera.json")))
assert cam["size"] == [W, H], (cam["size"], (W, H))
depth = np.fromfile(os.path.join(PROBE, "depth.f32"), np.float32).reshape(H, W)
pgm = open(os.path.join(PROBE, "dyn_mask.pgm"), "rb").read()
dyn = np.frombuffer(pgm[-W * H:], np.uint8).reshape(H, W) > 127

# HUD bar + title banner (the game draws its own): rounded boxes, full-frame px (defaults measured on the approved 04-10)
hud_boxes = [tuple(int(v) for v in b.split(",")) for b in opt.get("hud", "14,10,850,112;110,108,754,196").split(";")]
hud = np.zeros((H, W), bool)
for x0, y0, x1, y1 in hud_boxes:
    hud[y0:y1, x0:x1] = True

# approved coins: bright saturated gold, compact (area / bbox and size limits keep the rings and paddles out)
hsv = cv2.cvtColor(ap8, cv2.COLOR_RGB2HSV_FULL).astype(float)
hue, sat, val = hsv[..., 0] * 360 / 255, hsv[..., 1] / 255, hsv[..., 2] / 255
gold = (hue > 30) & (hue < 62) & (sat > 0.45) & (val > 0.55)
n, lab, st, _ = cv2.connectedComponentsWithStats(cv2.morphologyEx(gold.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)), 8)
coins = np.zeros((H, W), bool)
for k in range(1, n):
    x, y, w, h, a = st[k]
    if 120 <= a <= 9000 and 0.45 <= w / max(h, 1) <= 2.6 and a / (w * h) > 0.45 and max(w, h) < 130 and y > 200:
        coins |= lab == k
coins = binary_dilation(coins, iterations=6)

hole = binary_dilation(dyn, iterations=GROW) | hud | coins
img = cv2.inpaint(ap8, hole.astype(np.uint8), 9, cv2.INPAINT_TELEA)
os.makedirs(OUT, exist_ok=True)
Image.fromarray(img).save(os.path.join(OUT, f"{NN}_bg.png"), optimize=True)

far = float(np.ceil(depth.max() + 1.0))
q = np.clip(np.round(depth / far * 65535), 0, 65535).astype(np.uint32)
rgba = np.zeros((H, W, 4), np.uint8)
rgba[..., 0] = (q >> 8).astype(np.uint8)
rgba[..., 1] = (q & 255).astype(np.uint8)
rgba[..., 3] = np.where(depth > 0, 255, 0).astype(np.uint8)
Image.fromarray(rgba, "RGBA").save(os.path.join(OUT, f"{NN}_depth.png"))
meta = dict(id=NN, approved=ref, size=[W, H], far=far, viewProjection=cam["viewProjection"], eye=cam["eye"],
            share_removed=dict(dynamic=round(float(binary_dilation(dyn, iterations=GROW).mean()), 4), hud=round(float(hud.mean()), 4),
                               coins=round(float(coins.mean()), 4), coin_blobs=int(len(np.unique(lab[coins & (lab > 0)])))),
            note="tools/match/bake.py: approved picture minus what the game draws itself (inpainted) + checkpoint depth")
json.dump(meta, open(os.path.join(OUT, f"{NN}.json"), "w"), indent=1)
print(json.dumps({k: v for k, v in meta.items() if k not in ("viewProjection",)}))
if "debug" in opt:
    os.makedirs(opt["debug"], exist_ok=True)
    vis = ap8.copy(); vis[hole] = (vis[hole] * 0.35 + np.array([255, 0, 0]) * 0.65).astype(np.uint8)
    Image.fromarray(vis).save(os.path.join(opt["debug"], f"{NN}_removed_red.png"))
