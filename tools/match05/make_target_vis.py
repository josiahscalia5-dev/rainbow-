"""[match05 copy with tgtvis05, see the block after `hole =`] Screen 05 proj05 — TARGET water image in the approved frame (864x1536, sRGB), from the user's own pictures only:
  * where the approved picture shows its water (not hidden by Benny + splash, coins, HUD): the APPROVED pixels;
  * under Benny + splash and the bottom gold ring arcs: the user's ORIGINAL isolated water artwork, registered onto the approved water with dense
    optical flow (banks / bands line up), colour-matched and blended in with a multi-band blend inside the hidden area (no invented texture);
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
# ---- match05 tgtvis05 (Screen 05 agent, 2026-11-17): the "benny" dome above (env-mask blob, rows >= 760) also covers
#      water that the APPROVED picture shows (region "water" of qa/pilot05/full_reference_match/masks, rows 700-1100,
#      i.e. around Benny's hat / shoulders). Those pixels are visible approved water: keep them APPROVED, fill only what
#      Benny + splash really hide. The optical-flow registration and the colour match keep the ORIGINAL hole
#      (identical fill elsewhere); only the composite below uses holeC. Margin: the visible set is eroded by 3 px so the blend seam stays under Benny.
import json as _json
_M = "qa/pilot05/full_reference_match/masks"
_idx = np.asarray(Image.open(f"{_M}/region_index.png"))
_wid = _json.load(open(f"{_M}/regions.json"))["regions"]["water"]["id"]
from scipy.ndimage import binary_erosion
_marg = int(os.environ.get("TGTVIS05_MARGIN", "16"))
_names = _json.load(open(f"{_M}/regions.json"))["regions"]
_occ = np.isin(_idx, [_names[k]["id"] for k in ("benny_and_hat", "wake_splash", "bubbles", "coins")])
from scipy.ndimage import distance_transform_edt as _edt
vis = binary_erosion(_idx == _wid, iterations=3) & (_edt(~_occ) > _marg) & (rows >= 700) & (rows < 1100)
print("tgtvis05: pixels returned to APPROVED", int((hole & vis).sum()))
holeC = hole & ~vis   # used ONLY for the final composite (registration + colour match keep the original hole)

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

# ---- multi-band (Laplacian pyramid) blend of the colour-matched artwork INTO the hole: the transition lies inside the
#      hole (approved pixels outside it stay exact — a soft edge outside the hole first cost 3.9 % of the visible water),
#      and low / high frequencies blend over different widths, so there is no visible seam when Benny steers aside.
#      (A Poisson blend was tried first: it pushed the pink band at the hole's rim into a saturated red streak.)
def pyr_blend(a_, b_, m_, levels=6):
    ga = [a_]; gb = [b_]; gm = [m_]
    for _ in range(levels):
        ga.append(cv2.pyrDown(ga[-1])); gb.append(cv2.pyrDown(gb[-1])); gm.append(cv2.pyrDown(gm[-1]))
    la = [ga[i] - cv2.pyrUp(ga[i + 1], dstsize=ga[i].shape[1::-1]) for i in range(levels)] + [ga[levels]]
    lb = [gb[i] - cv2.pyrUp(gb[i + 1], dstsize=gb[i].shape[1::-1]) for i in range(levels)] + [gb[levels]]
    out = None
    for i in range(levels, -1, -1):
        mm = gm[i][..., None]
        lv = la[i] * (1 - mm) + lb[i] * mm
        out = lv if out is None else cv2.pyrUp(out, dstsize=lv.shape[1::-1]) + lv
    return out
from scipy.ndimage import binary_erosion
inner = binary_erosion(holeC, iterations=5)
mask = np.clip(gaussian_filter(inner.astype(float), 3.0) * 1.15, 0, 1).astype(np.float32)
# coinfill05 (milestone 2, env TGTFILL05=1): the approved side of the pyramid blend carried the OCCLUDERS' colours
# (yellow coins, pink Benny) into the coarse levels of every small hole -> dull green-teal discs where the coins sit.
# With TGTFILL05=1 the approved side already holds the fill inside the hole, so the blend only harmonises the rim.
# TGTFILL05=2: the approved side inside the hole = the visible approved water around it spread in by normalised
# convolution (no occluder colour, smooth low frequencies continuous with the rim); the texture still comes from the fill.
_tf = os.environ.get("TGTFILL05")
if _tf == "2":
    _vis = (~binary_dilation(hole, iterations=2)).astype(np.float32)
    _num = np.stack([gaussian_filter(appr[..., i].astype(np.float32) * _vis, 12) for i in range(3)], -1)
    _den = gaussian_filter(_vis, 12)[..., None]
    for _big in (40, 120):
        _lo = _den[..., 0] < 0.05
        _n2 = np.stack([gaussian_filter(appr[..., i].astype(np.float32) * _vis, _big) for i in range(3)], -1)
        _d2 = gaussian_filter(_vis, _big)[..., None]
        _num[_lo] = _n2[_lo]; _den[_lo] = _d2[_lo]
    _aside = np.where(holeC[..., None], _num / np.maximum(_den, 1e-4), appr)
else:
    _aside = np.where(holeC[..., None], fill, appr) if _tf == "1" else appr
blend = pyr_blend(_aside.astype(np.float32), fill.astype(np.float32), mask)
tgt = np.where(holeC[..., None], np.clip(blend, 0, 255), appr).astype(np.uint8)

Image.fromarray(tgt).save(os.path.join(out, "target_05.png"))
Image.fromarray((Aw * 255).astype(np.uint8)).save(os.path.join(out, "water_mask.png"))
Image.fromarray((holeC * 255).astype(np.uint8)).save(os.path.join(out, "fill_mask.png"))
Image.fromarray((coins * 255).astype(np.uint8)).save(os.path.join(out, "coin_mask.png"))
Image.fromarray(artw).save(os.path.join(out, "art_registered.png"))
rep = dict(ring_px=int(ringb.sum()), note="target = approved water where visible; registered + colour-matched + Poisson-blended original artwork in the holes",
           water_px=int(Aw.sum()), fill_px=int((hole & Aw).sum()), coins_px=int(coins.sum()), benny_px=int(benny.sum()),
           flow_px_median=float(np.median(np.hypot(fs[..., 0], fs[..., 1])[A0])), flow_px_p95=float(np.percentile(np.hypot(fs[..., 0], fs[..., 1])[A0], 95)),
           approved_vs_artwork_registered_mean_abs_visible_water=float(np.abs(appr.astype(float) - artw[..., :3].astype(float))[Aw & ~hole].mean()),
           approved_vs_artwork_plain_mean_abs_visible_water=float(np.abs(appr.astype(float) - art[..., :3].astype(float))[A0 & ~hole].mean()))
json.dump(rep, open(os.path.join(out, "report.json"), "w"), indent=1); print(json.dumps(rep, indent=1))
