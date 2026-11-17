"""Screen 05 coins (coins05): measure coin SILHOUETTES (gold face + milled edge band) in the approved picture and, optionally,
in a real game probe (coin pixels = probe <tag>_nohud.png vs <tag>_nohud_nocoins.png, see hud/probe05.mjs --vis).
The silhouette of a coin (a cylinder) is centrally symmetric, so its bounding-box centre is the projected coin centre and
its width the projected diameter: these are the solve targets for coins.ts C05M. Also reports, on the centre column, where
the face ends and the edge band starts (face height / edge height -> tilt and thickness).
usage (repo root): python3 -I qa/pilot05/full_reference_match/coins/measure_coins.py [probe_dir/tag]
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

AP = "references/05_flow_into_the_current.png"
# approximate centres (x, y, search half-size) of the approved coins 1-8 (larger coins: silhouettes; 9+ too small)
NEAR = [(474, 729, 60), (548, 662, 42), (481, 614, 34), (431, 577, 26), (465.5, 546, 17), (495.5, 533, 12), (518, 524, 10), (532, 516.5, 8)]


def coin_mask(img):
    R, G, B = img[..., 0], img[..., 1], img[..., 2]
    return (R - B > 30) & (B < 150) & (G > 0.35 * R) & (R > 110)


def silhouettes(mask, cents, img=None):
    out = []
    for k, (cx, cy, hs) in enumerate(cents):
        x0, x1, y0, y1 = int(cx - hs), int(cx + hs) + 1, int(cy - hs), int(cy + hs) + 1
        sub = ndi.binary_closing(mask[y0:y1, x0:x1], np.ones((3, 3)))
        sub = ndi.binary_fill_holes(sub)
        lab, n = ndi.label(sub)
        if n == 0:
            out.append(None)
            continue
        # the component that contains (or is nearest to) the expected centre
        yy, xx = np.nonzero(lab)
        j = np.argmin((xx + x0 - cx) ** 2 + (yy + y0 - cy) ** 2)
        comp = lab == lab[yy[j], xx[j]]
        ys, xs = np.nonzero(comp)
        bx0, bx1, by0, by1 = xs.min() + x0, xs.max() + x0, ys.min() + y0, ys.max() + y0
        rec = dict(k=k + 1, x=round((bx0 + bx1) / 2, 1), y=round((by0 + by1) / 2, 1), w=int(bx1 - bx0 + 1), h=int(by1 - by0 + 1),
                   box=[int(bx0), int(by0), int(bx1), int(by1)], px=int(comp.sum()))
        if img is not None and rec["w"] >= 25:
            # face / edge boundary on the centre column: first row (from the bottom up) whose luminance jumps to face level
            col = img[by0:by1 + 1, int(round(rec["x"]))].astype(float)
            lum = col @ [0.299, 0.587, 0.114]
            sat_b = col[:, 2]
            # edge band = darker brown rows at the bottom: lum < 175 and B > 25 (face rows are bright, B ~ 0-140 with lum > 175)
            edge = 0
            for v in lum[::-1]:
                if v < 175:
                    edge += 1
                else:
                    break
            rec["edge_px"] = edge
            rec["face_h"] = rec["h"] - edge
        out.append(rec)
    return out


def main():
    ap = np.asarray(Image.open(AP).convert("RGB")).astype(int)
    m = coin_mask(ap)
    print("APPROVED silhouettes (bbox centre x, y; width w; height h; edge band px on the centre column)")
    for r in silhouettes(m, NEAR, ap):
        print(r)
    if len(sys.argv) > 1:
        t = sys.argv[1]
        a = np.asarray(Image.open(t + "_nohud.png").convert("RGB")).astype(int)
        b = np.asarray(Image.open(t + "_nohud_nocoins.png").convert("RGB")).astype(int)
        gm = np.abs(a - b).max(-1) > 12
        print("GAME silhouettes (", t, ")")
        for r in silhouettes(gm, NEAR, a):
            print(r)


main()
