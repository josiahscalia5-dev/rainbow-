"""Screen 05 approved-water FLOW MAP (`?proj05=1&projflow05=2`, src/vfx/waterRibbon.ts): the direction in which the
approved picture's own streaks run, read from the baked water layers in river coordinates (u across -1..1, s = arc
length), so the flow animation slides the fine streaks ALONG the painted S-curves instead of sliding the whole picture
straight down the river (which doubles the pink ribbons, the foam banks and the bubbles twice per cycle).
  proj05_WN.png  from the near layer N (s 126..166)      R = 0.5 + m * SCALE, m = du/ds along the streak (u per s unit)
  proj05_WT.png  from the periodic tile T (14 u, wraps)  G = flow mask: 1 streaky water … 0 foam banks, bubbles, edges
                                                          B = coverage of the layer (N: what the locked view shows; T: 1)
Method: structure tensor of luminance + red (pink vs cyan) on an isotropic resampling (PX px per world unit), the
streak direction = eigenvector of the smaller eigenvalue; slopes are averaged with coherence weights (normalised
convolution, sigma SMOOTH u) so flat or lumpy areas inherit the direction of the streaks around them.
usage: python3 -I tools/proj05/flow_bake.py <assets/textures/water05> [half_width_u=4.8] [--debug=DIR]
(importable: flow_of / save are reused by tools/proj05/near_bake.py)"""
import json, os, sys
import numpy as np, cv2
from PIL import Image
from scipy.ndimage import gaussian_filter, binary_opening, binary_dilation

HW = 4.8                                              # river half width (world units) ≈ course.widthAt(05) / 2
PX = 24.0                                             # isotropic working resolution, px per world unit
SCALE = 2.0                                           # R = 0.5 + m * SCALE  (|m| <= 0.25 u per s unit)
SMOOTH = 0.9                                          # world units
OUT_W = 128


def flow_of(rgb, cov, length_u, wrap):
    """rgb float (h, w, 3) covering u -1..1 across and `length_u` world units along; returns m, mask, coherence"""
    h0, w0 = rgb.shape[:2]
    W, H = int(round(2 * HW * PX)), int(round(length_u * PX))
    img = cv2.resize(rgb, (W, H), interpolation=cv2.INTER_AREA)
    cv = cv2.resize(cov, (W, H), interpolation=cv2.INTER_AREA)
    mode = "wrap" if wrap else "nearest"
    g = lambda a, s: gaussian_filter(a, s, mode=("wrap" if wrap else "nearest", "nearest"))
    lum = (img * [0.2126, 0.7152, 0.0722]).sum(-1)
    Jxx = Jxy = Jyy = 0.0
    for ch, wgt in ((lum, 1.0), (img[..., 0], 1.0)):
        c = g(ch, 1.2)
        gy, gx = np.gradient(c)
        if wrap:
            gy = (np.roll(c, -1, 0) - np.roll(c, 1, 0)) / 2
        Jxx = Jxx + wgt * gx * gx; Jxy = Jxy + wgt * gx * gy; Jyy = Jyy + wgt * gy * gy
    s_t = 0.45 * PX
    Jxx, Jxy, Jyy = g(Jxx, s_t), g(Jxy, s_t), g(Jyy, s_t)
    # eigenvector of the SMALLER eigenvalue = along the streaks
    tr, det = Jxx + Jyy, Jxx * Jyy - Jxy * Jxy
    disc = np.sqrt(np.maximum(tr * tr / 4 - det, 0))
    l1, l2 = tr / 2 + disc, tr / 2 - disc
    vx, vy = Jxy, l2 - Jxx                          # (J - l2 I) v = 0  ->  v = (Jxy, l2 - Jxx)
    alt = np.abs(vx) + np.abs(vy) < 1e-9
    vx = np.where(alt, 0.0, vx); vy = np.where(alt, 1.0, vy)
    sgn = np.where(vy < 0, -1.0, 1.0)
    vx, vy = vx * sgn, vy * sgn                     # pointing toward +s
    slope = np.clip(vx / np.maximum(vy, 1e-3), -1.2, 1.2)      # world dx per world ds
    coh = np.where(tr > 1e-6, (l1 - l2) / np.maximum(l1 + l2, 1e-6), 0.0)
    # foam banks + bubbles: bright, unsaturated, larger than a glint (opening drops thin highlights)
    mn, mx = img.min(-1), img.max(-1)
    whitish = (mn > 150) & (mx - mn < 80)
    blob = binary_opening(whitish, iterations=int(round(0.14 * PX)))
    blob = binary_dilation(blob, iterations=int(round(0.2 * PX)))
    still = g(blob.astype(np.float32), 0.35 * PX)
    uu = np.linspace(-1, 1, W)[None, :] * np.ones((H, 1))
    edge = 1.0 - np.clip((np.abs(uu) - 0.9) / 0.1, 0, 1)        # no flow offset on the very edge of the river
    mask = np.clip(1.0 - 1.6 * still, 0, 1) * edge
    # coherence-weighted average of the slope; foam / flat areas inherit the streak direction around them
    wgt = np.clip(coh, 0, 1) ** 2 * (1.0 - np.clip(still * 2, 0, 1)) * np.clip(cv, 0, 1) + 1e-4
    s_s = SMOOTH * PX
    slope_s = g(slope * wgt, s_s) / g(wgt, s_s)
    m = slope_s / HW                                            # u per s unit
    return m, mask, np.clip(cv, 0, 1), img


def save(A, name, m, mask, coh, out_h):
    enc = np.stack([np.clip(0.5 + m * SCALE, 0, 1), mask, np.clip(coh, 0, 1)], -1).astype(np.float32)
    enc = cv2.resize(enc, (OUT_W, out_h), interpolation=cv2.INTER_AREA)
    Image.fromarray(np.clip(enc * 255 + 0.5, 0, 255).astype(np.uint8)).save(os.path.join(A, name))


def debug(dbg, tag, img, m, mask):
    if not dbg:
        return
    os.makedirs(dbg, exist_ok=True)
    v = np.clip(img, 0, 255).astype(np.uint8).copy()
    H, W = v.shape[:2]
    for y in range(6, H - 6, 14):
        for x in range(6, W - 6, 14):
            sl = m[y, x] * HW
            n = (1 + sl * sl) ** 0.5
            dx, dy = 6 * sl / n, 6 / n
            col = (255, 255, 0) if mask[y, x] > 0.5 else (90, 90, 90)
            cv2.line(v, (int(x - dx), int(y - dy)), (int(x + dx), int(y + dy)), col, 1, cv2.LINE_AA)
    Image.fromarray(v[::-1]).save(os.path.join(dbg, f"flow_{tag}.png"))            # far end on top, as on screen


def main():
    global HW
    pos = [a for a in sys.argv[1:] if not a.startswith("--")]
    dbg = next((a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--debug=")), None)
    A = pos[0]
    if len(pos) > 1:
        HW = float(pos[1])
    lut = json.load(open(os.path.join(A, "proj05_lut.json")))
    rep = {}
    N = np.asarray(Image.open(os.path.join(A, "proj05_N.png")).convert("RGBA")).astype(np.float32)
    m, mask, coh, img = flow_of(N[..., :3], N[..., 3] / 255.0, lut["N"]["s1"] - lut["N"]["s0"], wrap=False)
    save(A, "proj05_WN.png", m, mask, coh, 240)
    debug(dbg, "N", img, m, mask)
    rep["N"] = dict(mean_abs_slope_world=round(float(np.abs(m * HW)[(mask > 0.5) & (coh > 0.5)].mean()), 3), flow_area_of_covered=round(float((mask > 0.5)[coh > 0.5].mean()), 3))
    T = np.asarray(Image.open(os.path.join(A, "proj05_T.png")).convert("RGB")).astype(np.float32)
    m, mask, coh, img = flow_of(T, np.ones(T.shape[:2], np.float32), lut["T"]["L"], wrap=True)
    save(A, "proj05_WT.png", m, mask, coh, 84)
    debug(dbg, "T", img, m, mask)
    rep["T"] = dict(mean_abs_slope_world=round(float(np.abs(m * HW)[mask > 0.5].mean()), 3), flow_area=round(float((mask > 0.5).mean()), 3))
    meta = dict(scale=SCALE, half_width_u=HW, note="R = 0.5 + m * scale (m = du/ds along the approved streaks), G = flow mask, B = layer coverage", **rep)
    with open(os.path.join(A, "proj05_flow.json"), "w") as f:
        json.dump(meta, f, indent=1)
    print(json.dumps(meta))


if __name__ == "__main__":
    main()
