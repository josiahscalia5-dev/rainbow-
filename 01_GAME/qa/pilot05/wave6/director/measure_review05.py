#!/usr/bin/env python3
"""Screen 05 wave-6 director review: reproducible measurements (reference vs live game).

    python3 -I qa/pilot05/wave6/director/measure_review05.py            # from the repo root

Inputs  : qa/pilot05/wave6/proof/1_approved_reference.png, 3_threejs_gameplay.png (864x1536)
Outputs : qa/pilot05/wave6/director/measurements.json  (+ crops/classmap_ref_vs_game.png)

Every number is a crude colour-threshold / geometry measurement, identical for both images.
They locate and characterise elements; they are NOT a fidelity score.
"""
from __future__ import annotations

import colorsys
import json
import os

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = os.getcwd()
REF = os.path.join(ROOT, "qa/pilot05/wave6/proof/1_approved_reference.png")
GAME = os.path.join(ROOT, "qa/pilot05/wave6/proof/3_threejs_gameplay.png")
OUTD = os.path.join(ROOT, "qa/pilot05/wave6/director")
VP = {"ref": (498.6, 479.4), "game": (499.1, 478.0)}  # landmarks05.py warm-blob centroids
W, H = 864, 1536
YY, XX = np.mgrid[0:H, 0:W]


def load(p):
    im = Image.open(p).convert("RGB")
    rgb = np.asarray(im).astype(np.float32)
    hsv = np.asarray(im.convert("HSV")).astype(np.float32)
    return rgb, hsv[..., 0] * 360 / 255, hsv[..., 1] / 255, hsv[..., 2] / 255


def classes(h, s, v):
    """0 other, 1 gold/warm metal, 2 dark (slots), 3 white, 4 cyan/blue, 5 violet, 6 magenta/pink."""
    C = np.zeros(h.shape, np.uint8)
    C[((h >= 292) & (h < 345)) & (s > 0.25) & (v >= 0.30)] = 6
    C[(h >= 235) & (h < 292) & (s > 0.25) & (v >= 0.30)] = 5
    C[(h >= 170) & (h < 235) & (s > 0.35) & (v > 0.45)] = 4
    C[(s < 0.28) & (v > 0.80)] = 3
    C[(h >= 8) & (h <= 62) & (s > 0.45) & (v > 0.45)] = 1
    C[v < 0.30] = 2
    return C


def warm_mask(h, s, v):
    return ((h <= 62) | (h >= 345)) & (s > 0.35) & (v > 0.3)


def cls_letter(r, g, b):
    hh, ss, vv = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    hh *= 360
    if (hh <= 62 or hh >= 350) and ss > 0.35 and vv > 0.3:
        return "G"
    if ss < 0.3 and vv > 0.85:
        return "W"
    if vv < 0.35:
        return "d"
    if 235 <= hh < 292:
        return "V"
    if 292 <= hh < 350:
        return "M"
    return "o"


def wall_stats(C, h, s, v, rgb, tag):
    vx, vy = VP[tag]
    rr = np.hypot(XX - vx, YY - vy)
    wins = {"upper x300-700 y190-300": (300, 190, 700, 300), "left x0-130 y420-620": (0, 420, 130, 620),
            "inner annulus r60-150 upper half": None}
    out = {}
    for name, w in wins.items():
        if w is None:
            m = (rr >= 60) & (rr < 150) & (YY < vy - 10)
        else:
            x0, y0, x1, y1 = w
            m = np.zeros((H, W), bool)
            m[y0:y1, x0:x1] = True
        purple = m & ((C == 5) | (C == 6))
        n = m.sum()
        out[name] = dict(
            violet_share_of_purple=round(float(((C == 5) & m).sum()) / max(1, purple.sum()), 3),
            hue_med=round(float(np.median(h[purple])), 1), S_med=round(float(np.median(s[purple])), 2),
            V_p10=round(float(np.percentile(v[purple], 10)), 2), V_med=round(float(np.median(v[purple])), 2),
            rgb_med=[int(x) for x in np.median(rgb[purple], axis=0)],
            gold_frac=round(float((m & (C == 1)).sum()) / n, 3), slot_dark_frac=round(float((m & (C == 2)).sum()) / n, 3),
            specular_white_frac=round(float((m & (C == 3)).sum()) / n, 3))
    m = (YY >= 190) & (YY < 540) & (rr > 60)
    dk = (v < 0.30) & m
    lab, n = ndimage.label(dk)
    areas, elong, radial = [], [], []
    for i, sl in enumerate(ndimage.find_objects(lab)):
        ys, xs = np.nonzero(lab[sl] == i + 1)
        if not (12 <= len(xs) <= 2500):
            continue
        ys = ys + sl[0].start
        xs = xs + sl[1].start
        cy, cx = ys.mean(), xs.mean()
        ev, evec = np.linalg.eigh(np.cov(np.vstack([xs - cx, ys - cy])))
        elong.append(np.sqrt(max(ev[1], 1e-6) / max(ev[0], 1e-6)))
        rd = np.array([cx - vx, cy - vy])
        rd /= np.linalg.norm(rd) + 1e-9
        radial.append(abs(float(evec[:, 1] @ rd)))
        areas.append(len(xs))
    rim = ndimage.binary_dilation(dk, iterations=3) & ~dk & m & ((C == 5) | (C == 6) | (C == 3))
    out["slots y190-540 r>60"] = dict(count=len(areas), area_med=float(np.median(areas)), elong_med=round(float(np.median(elong)), 2),
                                      major_axis_ringwise_share=round(float((np.array(radial) < 0.4).mean()), 2),
                                      slot_V_med=round(float(np.median(v[dk])), 2), rim3px_V_med=round(float(np.median(v[rim])), 2))
    lum = ndimage.gaussian_filter(rgb.mean(2), 1.0)
    gx, gy = ndimage.sobel(lum, 1), ndimage.sobel(lum, 0)
    mag = np.hypot(gx, gy)
    wm = m & ((C == 5) | (C == 6) | (C == 3)) & (mag > np.percentile(mag[m], 50))
    cosg = np.abs((gx * (XX - vx) + gy * (YY - vy)) / (rr + 1e-9) / (mag + 1e-9))
    wgt = mag[wm]
    out["edge orientation y190-560 r>60"] = dict(
        edges_running_toward_VP=round(float((wgt * (cosg[wm] < 0.383)).sum() / wgt.sum()), 3),
        edges_running_ringwise=round(float((wgt * (cosg[wm] > 0.924)).sum() / wgt.sum()), 3), random_baseline=0.25)
    return out


def ring_profiles(rgb):
    vert = []
    for y in range(186, 472, 3):
        r, g, b = rgb[y, 497:502].mean(0)
        vert.append([y, cls_letter(r, g, b), int(r), int(g), int(b)])
    horiz = []
    for x in range(0, 300, 3):
        r, g, b = rgb[448:453, x].mean(0)
        horiz.append([x, cls_letter(r, g, b), int(r), int(g), int(b)])
    return {"x499_y186-471": vert, "y450_x0-297": horiz}


def vp_glow(rgb, h, s, v, tag):
    vx, vy = VP[tag]
    rr = np.hypot(XX - vx, YY - vy)
    up = YY < vy + 2
    lum = (0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]) / 255
    bins = {}
    for r0, r1 in [(0, 8), (8, 16), (16, 24), (24, 32), (32, 48), (48, 64), (64, 96)]:
        m = up & (rr >= r0) & (rr < r1)
        bins[f"r{r0}-{r1}"] = dict(lum=round(float(lum[m].mean()), 2), rgb_mean=[int(x) for x in rgb[m].mean(0)],
                                   warm=round(float((warm_mask(h, s, v) & m).sum() / m.sum()), 2),
                                   purple=round(float(((h >= 235) & (h < 345) & (s > 0.25) & m).sum() / m.sum()), 2))
    radii = {}
    for thr in (0.85, 0.75):
        for r in range(1, 200):
            m = up & (rr >= r - 1) & (rr < r + 1)
            if lum[m].mean() < thr:
                radii[f"lum<{thr}"] = r
                break
    return {"bins": bins, "glow_radius_px": radii}


def far_river(rgb, h, s, v):
    cyan = (h >= 170) & (h < 240) & (s > 0.30) & (v > 0.5)
    rows = {}
    for y in range(498, 572, 6):
        xs = np.nonzero(cyan[y - 1:y + 2, 380:640].any(0))[0] + 380
        if len(xs):
            rows[y] = dict(median_x=int(np.median(xs)), extent=[int(xs.min()), int(xs.max())])
    gold = (rgb[..., 0] > 200) & (rgb[..., 1] > 140) & (rgb[..., 2] < 120) & ((rgb[..., 0] - rgb[..., 2]) > 110) & (h >= 30) & (h <= 60)
    win = np.zeros_like(gold)
    win[476:556, 420:600] = True
    lab, n = ndimage.label(gold & win)
    blobs = []
    for k in range(1, n + 1):
        ys, xs = np.nonzero(lab == k)
        if 4 <= len(xs) <= 900:
            w, hh = xs.max() - xs.min() + 1, ys.max() - ys.min() + 1
            if w <= 45 and hh <= 30 and len(xs) / (w * hh) > 0.35:
                blobs.append([int(xs.mean()), int(ys.mean()), int(w), int(hh)])
    return {"cyan_rows": rows, "gold_blobs_y476-556": sorted(blobs, key=lambda b: -b[1])}


def benny(rgb, h, s, v):
    out = {}
    prof = []
    for y in range(744, 1236, 6):
        r, g, b = rgb[y - 1:y + 2, 418:427].reshape(-1, 3).mean(0)
        prof.append([y, int(r), int(g), int(b)])
    out["x422_profile"] = prof
    for y, name, cond in [(1000, "cuff_violet", (h >= 240) & (h < 292) & (s > 0.6)), (1100, "body_fur", (h >= 305) & (h < 345) & (s > 0.45))]:
        row = ndimage.binary_closing(cond[y - 1:y + 2].any(0), iterations=3)
        lab, _ = ndimage.label(row)
        xs = np.nonzero(lab == lab[420])[0] if lab[420] else np.array([])
        out[f"y{y}_{name}"] = [int(xs.min()), int(xs.max())] if len(xs) else None
    sub = (slice(1060, 1150), slice(330, 520))
    out["fur_rgb_med"] = [int(x) for x in np.median(rgb[sub].reshape(-1, 3), 0)]
    out["fur_V_med"] = round(float(np.median(v[sub])), 2)
    return out


def lids_coins(rgb, h, s, v, tag):
    samples = {"ref": {"L1": (90, 345, 190, 400), "R1": (740, 430, 850, 500)},
               "game": {"L1": (10, 315, 100, 380), "R1": (745, 385, 815, 418)}}[tag]
    out = {}
    for name, (x0, y0, x1, y1) in samples.items():
        hh = h[y0:y1, x0:x1].ravel()
        hh = np.where(hh > 300, hh - 360, hh)
        vv = v[y0:y1, x0:x1].ravel()
        out[f"lid_{name}"] = dict(rgb_med=[int(x) for x in np.median(rgb[y0:y1, x0:x1].reshape(-1, 3), 0)], hue_med=round(float(np.median(hh)), 1),
                                  S_med=round(float(np.median(s[y0:y1, x0:x1])), 2), V_med=round(float(np.median(vv)), 2), V_std=round(float(vv.std()), 3))
    cx, cy, r = {"ref": (474, 726, 40), "game": (487, 739, 38)}[tag]
    m = ((XX - cx) / r) ** 2 + ((YY - cy) / (r * 0.85)) ** 2 < 1
    out["coin1_face"] = dict(rgb_med=[int(x) for x in np.median(rgb[m], 0)], hue_med=round(float(np.median(h[m])), 1), S_med=round(float(np.median(s[m])), 2))
    return out


def near_field(rgb, h, s, v, C):
    out = {}
    for name, (x0, y0, x1, y1) in {"BL x0-200 y1250-1536": (0, 1250, 200, 1536), "BR x664-864 y1250-1536": (664, 1250, 864, 1536),
                                   "bottom arc x200-664 y1440-1536": (200, 1440, 664, 1536)}.items():
        out[f"gold_frac {name}"] = round(float((C[y0:y1, x0:x1] == 1).mean()), 3)
    m = np.zeros((H, W), bool)
    m[1230:1500, 250:600] = True
    c = m & (h >= 170) & (h < 240) & (s > 0.3)
    out["centre channel x250-600 y1230-1500"] = dict(water_rgb_med=[int(x) for x in np.median(rgb[c], 0)], hue_med=round(float(np.median(h[c])), 1),
                                                    white_glint_frac=round(float(((s < 0.25) & (v > 0.9) & m).sum() / m.sum()), 3))
    return out


def impact(ref, game, Cr):
    rgb_r, h, s, v = ref
    rgb_g, hg, sg, vg = game
    zone = Image.new("L", (W, H), 0)
    ImageDraw.Draw(zone).polygon([(0, 185), (864, 185), (864, 760), (760, 660), (600, 540), (498, 485), (330, 525), (190, 600), (0, 790)], fill=255)
    tunnel = np.asarray(zone) > 0
    bennyb = (XX >= 225) & (XX < 620) & (YY >= 760) & (YY < 1200)
    wr, wg = warm_mask(h, s, v), warm_mask(hg, sg, vg)
    pr = (h >= 300) & (h < 345) & (s > 0.45) & (v > 0.6)
    pg = (hg >= 300) & (hg < 345) & (sg > 0.45) & (vg > 0.6)

    def q(a):
        return a.reshape(H // 4, 4, W // 4, 4, -1).mean((1, 3))
    diff = np.abs(q(rgb_r) - q(rgb_g)).mean(-1)
    tot = diff.sum()
    zones = {
        "HUD y<185": YY < 185,
        "tunnel above banks": tunnel,
        "  tunnel: ring/lid metal in both": tunnel & wr & wg,
        "  tunnel: ring/lid in game only": tunnel & wg & ~wr,
        "  tunnel: ring/lid in ref only": tunnel & wr & ~wg,
        "  tunnel: wall in both": tunnel & ~wr & ~wg,
        "river y<1000 excl Benny": (~tunnel) & (YY >= 185) & (YY < 1000) & ~bennyb,
        "Benny box x225-620 y760-1200": bennyb,
        "near field y>=1000 excl Benny": (YY >= 1000) & ~bennyb,
        "  near: ref gold frame": (YY >= 1000) & wr & ~bennyb,
        "  near: game pink where ref not pink": (YY >= 1000) & pg & ~pr & ~wr & ~bennyb,
        "  near: rest (water vs water)": (YY >= 1000) & ~wr & ~(pg & ~pr) & ~bennyb,
    }
    out = {"frame_mean_abs_dRGB_quarter_scale": round(float(diff.mean()), 1)}
    for name, m in zones.items():
        mq = q(m[..., None].astype(np.float32))[..., 0] > 0.5
        out[name] = dict(area_pct=round(float(mq.mean() * 100), 1), mean_abs_d=round(float(diff[mq].mean()), 1),
                         share_of_frame_d_pct=round(float(diff[mq].sum() / tot * 100), 1))
    return out


def foam_and_edges(rgb, h, s, v, C):
    out = {}
    for name, (x0, y0, x1, y1) in {"left bank x0-330 y560-800": (0, 560, 330, 800), "right bank x620-864 y560-960": (620, 560, 864, 960)}.items():
        m = np.zeros((H, W), bool)
        m[y0:y1, x0:x1] = True
        f = m & (s < 0.30) & (v > 0.75)
        px = rgb[f]
        out[f"foam {name}"] = dict(frac=round(float(f.sum() / m.sum()), 3), rgb_med=[int(x) for x in np.median(px, 0)],
                                   pure_white_share=round(float((px.min(1) > 235).mean()), 2))
    ab = "oGdWCVM"
    for x in (12, 850):  # class runs (>= 8 px) down the frame-edge columns, y 600-1249
        col = C[600:1250, x - 4:x + 5]
        seq = [int(np.bincount(col[i], minlength=7).argmax()) for i in range(col.shape[0])]
        runs, i = [], 0
        while i < len(seq):
            k, i0 = seq[i], i
            while i < len(seq) and seq[i] == k:
                i += 1
            if i - i0 >= 8:
                runs.append(f"{ab[k]}{600 + i0}-{600 + i - 1}")
        out[f"edge column x{x}"] = " ".join(runs)
    return out


def river_decomp(ref, game):
    rgb_r, hr, sr, vr = ref
    rgb_g, hg, sg, vg = game
    zone = Image.new("L", (W, H), 0)
    ImageDraw.Draw(zone).polygon([(0, 185), (864, 185), (864, 760), (760, 660), (600, 540), (498, 485), (330, 525), (190, 600), (0, 790)], fill=255)
    tunnel = np.asarray(zone) > 0
    bennyb = (XX >= 225) & (XX < 620) & (YY >= 760) & (YY < 1200)
    river = (~tunnel) & (YY >= 185) & (YY < 1000) & ~bennyb
    fr, fg = (sr < 0.30) & (vr > 0.75), (sg < 0.30) & (vg > 0.75)
    wr, wg = (hr >= 170) & (hr < 240) & (sr > 0.3), (hg >= 170) & (hg < 240) & (sg > 0.3)
    pr, pg = (hr >= 292) & (hr < 345) & (sr > 0.35), (hg >= 292) & (hg < 345) & (sg > 0.35)
    wall_r = ((hr >= 235) & (hr < 292) & (sr > 0.25)) | (vr < 0.3)

    def q(a):
        return a.reshape(H // 4, 4, W // 4, 4, -1).mean((1, 3))
    diff = np.abs(q(rgb_r) - q(rgb_g)).mean(-1)
    tot = diff.sum()
    parts = {"river zone total": river, "game foam where ref not foam": river & fg & ~fr, "ref foam where game not foam": river & fr & ~fg,
             "pink vs cyan mismatch": river & ((pg & wr) | (wg & pr)), "ref wall/dark where game water/foam/pink": river & wall_r & (wg | fg | pg),
             "same class both (texture/shade)": river & ((fr & fg) | (wr & wg) | (pr & pg)),
             "far strip x420-580 y480-560": river & (XX >= 420) & (XX < 580) & (YY >= 480) & (YY < 560)}
    out = {}
    for name, m in parts.items():
        mq = q(m[..., None].astype(np.float32))[..., 0] > 0.5
        out[name] = dict(area_pct=round(float(mq.mean() * 100), 1), mean_abs_d=round(float(diff[mq].mean()), 1),
                         share_of_frame_d_pct=round(float(diff[mq].sum() / tot * 100), 1))
    return out


def main():
    data = {"ref": load(REF), "game": load(GAME)}
    res = {"note": "colour-threshold measurements; not a fidelity score", "vp": VP}
    pal = np.array([[60, 60, 60], [255, 200, 0], [0, 0, 0], [255, 255, 255], [0, 200, 255], [120, 60, 255], [255, 40, 180]], np.uint8)
    maps, Cs = [], {}
    for tag, (rgb, h, s, v) in data.items():
        C = classes(h, s, v)
        Cs[tag] = C
        maps.append(pal[C])
        names = ["other", "gold", "dark", "white", "cyan", "violet", "magenta"]
        r = {}
        r["class_frac_tunnel_y190-560"] = {names[k]: round(float((C[190:560] == k).mean()), 3) for k in range(7)}
        r["class_frac_near_y1100-1536"] = {names[k]: round(float((C[1100:] == k).mean()), 3) for k in range(7)}
        r["walls"] = wall_stats(C, h, s, v, rgb, tag)
        r["ring_profiles"] = ring_profiles(rgb)
        r["vp_glow"] = vp_glow(rgb, h, s, v, tag)
        r["far_river"] = far_river(rgb, h, s, v)
        r["benny"] = benny(rgb, h, s, v)
        r["lids_coins"] = lids_coins(rgb, h, s, v, tag)
        r["near_field"] = near_field(rgb, h, s, v, C)
        r["foam_and_edges"] = foam_and_edges(rgb, h, s, v, C)
        res[tag] = r
    res["impact"] = impact(data["ref"], data["game"], Cs["ref"])
    res["river_decomposition"] = river_decomp(data["ref"], data["game"])
    Image.fromarray(np.concatenate([maps[0], np.zeros((H, 12, 3), np.uint8), maps[1]], axis=1)).save(os.path.join(OUTD, "crops/classmap_ref_vs_game.png"))
    with open(os.path.join(OUTD, "measurements.json"), "w") as f:
        json.dump(res, f, indent=1)
    imp = res["impact"]
    print(json.dumps({k: v for k, v in imp.items()}, indent=0))
    for tag in ("ref", "game"):
        print(tag, "glow", res[tag]["vp_glow"]["glow_radius_px"], "slots", res[tag]["walls"]["slots y190-540 r>60"])


if __name__ == "__main__":
    main()
