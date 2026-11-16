"""Screen 05 proj05 — TARGET water image in the approved frame (864x1536, sRGB), from the user's own pictures only:
  * where the approved picture shows its water (not hidden by Benny + splash, coins, HUD): the APPROVED pixels;
  * under Benny + splash and the bottom gold ring arcs: the user's ORIGINAL isolated water artwork, registered onto the approved water with dense
    optical flow (banks / bands line up), colour-matched and blended in with a soft edge (no invented texture);
  * the coins too (an along-the-flow interpolation in river space was tried first: it drew straight stripes);
    coin_mask.png is kept for the metrics.
usage: python3 -I tools/proj05/make_target.py <out_dir>
outputs: target_05.png (RGB), water_mask.png (approved water footprint), fill_mask.png (pixels taken from the artwork),
         art_registered.png, report.json"""
import json, os, sys
import numpy as np, cv2
from PIL import Image
from scipy.ndimage import gaussian_filter, binary_dilation, binary_closing, label

out = sys.argv[1]; os.makedirs(out, exist_ok=True)
appr = np.asarray(Image.open("references/05_flow_into_the_current.png").convert("RGB"))
art = np.asarray(Image.open("qa/pilot05/proj/align/artwork_aligned_864x1536.png").convert("RGBA"))
env = np.asarray(Image.open("qa/worldlabs/05/05_env_mask.png").convert("L")) > 127   # white = environment / water
H, W = appr.shape[:2]
rows = np.arange(H)[:, None] * np.ones((1, W))
A0 = art[..., 3] > 127

# ---- occluders in the approved picture
blob = ~env & (rows > 60)                                    # Benny + splash + coin column (+ HUD rows < 60 ignored)
benny = blob & (rows >= 760)                                 # Benny + splash dome: fill completely
af = appr.astype(float) / 255
gold = (af[..., 0] > 0.62) & (af[..., 1] > 0.40) & (af[..., 2] < 0.42) & (af[..., 0] - af[..., 2] > 0.30)
dark_rim = (af.sum(-1) < 1.2) & (af[..., 0] > af[..., 2])   # coin edges / shadows
coinc = binary_closing(gold | (dark_rim & binary_dilation(gold, iterations=6)), iterations=3)
lab, n = label(coinc)
coins = np.zeros_like(coinc)
for i in range(1, n + 1):
    m = lab == i
    if m.sum() >= 40: coins |= m
coins = binary_dilation(coins & (rows < 800) & (rows > 470) & binary_dilation(A0, iterations=4), iterations=10) & A0
hud = rows < 196
ringb = (af[..., 0] > 0.55) & (af[..., 1] > 0.30) & (af[..., 2] < 0.50) & (af[..., 0] - af[..., 2] > 0.22) & (rows > 1100)
ringb = binary_dilation(binary_closing(ringb, iterations=4), iterations=8)   # the approved's bottom gold ring arcs
hole = (benny | ringb | coins) & ~hud          # Benny + splash, the bottom ring and the coins: filled from the artwork

# ---- dense registration artwork -> approved (large-scale flow, smoothed, interpolated across the holes)
def gray(x):
    g = cv2.cvtColor(x[..., :3], cv2.COLOR_RGB2GRAY)
    return cv2.GaussianBlur(g, (0, 0), 3)
ga, gp = gray(art), gray(appr)
ga = np.where(A0, ga, 0).astype(np.uint8); gp = np.where(A0 | (~hole & A0), gp, 0).astype(np.uint8)
dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
dis.setFinestScale(1)
flow = dis.calc(gp, ga, None)            # for each approved pixel: where to sample the artwork
valid = (A0 & ~binary_dilation(hole, iterations=12)).astype(float)
sig = 18
fs = np.stack([gaussian_filter(flow[..., i] * valid, sig) for i in range(2)], -1) / np.maximum(gaussian_filter(valid, sig), 1e-4)[..., None]
for big in (60, 140):                     # fill large holes with a wider normalised blur
    wv = gaussian_filter(valid, big)
    fb = np.stack([gaussian_filter(flow[..., i] * valid, big) for i in range(2)], -1) / np.maximum(wv, 1e-4)[..., None]
    lowc = gaussian_filter(valid, sig) < 0.15
    fs[lowc] = fb[lowc]
fs = np.clip(fs, -40, 40)
mx = (np.arange(W)[None, :] + fs[..., 0]).astype(np.float32); my = (rows + fs[..., 1]).astype(np.float32)
artw = cv2.remap(art, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
Aw = artw[..., 3] > 127                                     # approved water footprint (registered artwork alpha)

# ---- colour match the registered artwork to the approved water around the hole
ring = binary_dilation(hole, iterations=40) & ~binary_dilation(hole, iterations=4) & Aw
src = artw[..., :3].astype(float); dst = appr.astype(float)
mu_s, sd_s = src[ring].mean(0), src[ring].std(0) + 1e-3
mu_d, sd_d = dst[ring].mean(0), dst[ring].std(0) + 1e-3
# mean shift only, half strength (a per-channel std match turned the artwork's pink into red)
fill = np.clip(src + 0.5 * (mu_d - mu_s), 0, 255).astype(np.uint8)

# ---- feathered blend of the colour-matched artwork into the hole (a Poisson blend was tried first: it pushed the
#      pink band at the hole's rim into a saturated red streak inside the hole)
alpha = np.clip(gaussian_filter(binary_dilation(hole, iterations=6).astype(float), 7), 0, 1)
alpha = np.maximum(alpha, hole.astype(float))
tgt = np.clip(appr.astype(float) * (1 - alpha[..., None]) + fill.astype(float) * alpha[..., None], 0, 255).astype(np.uint8)

Image.fromarray(tgt).save(os.path.join(out, "target_05.png"))
Image.fromarray((Aw * 255).astype(np.uint8)).save(os.path.join(out, "water_mask.png"))
Image.fromarray((hole * 255).astype(np.uint8)).save(os.path.join(out, "fill_mask.png"))
Image.fromarray((coins * 255).astype(np.uint8)).save(os.path.join(out, "coin_mask.png"))
Image.fromarray(artw).save(os.path.join(out, "art_registered.png"))
rep = dict(ring_px=int(ringb.sum()), note="target = approved water where visible; registered + colour-matched + Poisson-blended original artwork in the holes",
           water_px=int(Aw.sum()), fill_px=int((hole & Aw).sum()), coins_px=int(coins.sum()), benny_px=int(benny.sum()),
           flow_px_median=float(np.median(np.hypot(fs[..., 0], fs[..., 1])[A0])), flow_px_p95=float(np.percentile(np.hypot(fs[..., 0], fs[..., 1])[A0], 95)),
           approved_vs_artwork_registered_mean_abs_visible_water=float(np.abs(appr.astype(float) - artw[..., :3].astype(float))[Aw & ~hole].mean()),
           approved_vs_artwork_plain_mean_abs_visible_water=float(np.abs(appr.astype(float) - art[..., :3].astype(float))[A0 & ~hole].mean()))
json.dump(rep, open(os.path.join(out, "report.json"), "w"), indent=1); print(json.dumps(rep, indent=1))
