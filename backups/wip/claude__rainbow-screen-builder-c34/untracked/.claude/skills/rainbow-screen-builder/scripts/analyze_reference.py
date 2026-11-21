"""Rainbow Screen Builder — analyse ONE approved screen picture (read-only, offline: numpy / PIL / OpenCV only).

  python3 -I analyze_reference.py <reference.png> <out.json> [--overlay out.png] [--phone 412x915]

Measures what a playable level must reproduce, in the picture's own pixels AND in the 412x915 phone frame the game renders
(the game keeps the picture's VERTICAL field of view: scale to the frame height, centre-crop the width — same rule as
compare_r33.py / visual_check.py):
  hud           top band covered by the HUD bar + stage title (long horizontal UI borders) -> rows to exclude from scenery
  palette       8 k-means colours below the HUD + shares of the Rainbow colour classes (water cyan, pink edge, gold, purple, foam
                white, near-black)
  vanishing     two estimates: the brightest blurred core (tunnel end) and the convergence point of long straight edges
  rings         repeated gold structures: gold runs straight above the core ("ring tops"), their distances and the
                ratio between successive ones (Screen 05: ~1.5 = the painting's non-strict perspective, see kit_model.py)
  river         water mask (cyan + pink edge), centre line every 24 rows, widths, number of S-bends
  dark          intentional near-black areas of the ARTWORK (the visual checker must never count them as errors)
  benny         the painted Benny (dusty-rose fur blob + hat above it) -> tight box and a generous compare-exclusion box
  coins         small round gold blobs on/near the river (the painted coin trail)
Every value is an ESTIMATE for the lead / specialists to confirm on the overlay picture; validated per-screen values (e.g. the
round-33 Screen 05 compare mask) live in ../screens.json and win over these estimates."""
import sys, os, json, argparse
import numpy as np, cv2
from PIL import Image


def load_rgb(path):
    return np.array(Image.open(path).convert('RGB'))


def phone_map(w, h, pw=412, ph=915):
    """reference px -> phone px: scale to the phone height, centre-crop (or pad) the width"""
    sc = ph / h; rw = round(w * sc); cx = (rw - pw) / 2.0
    return {'w': pw, 'h': ph, 'scale': sc, 'scaled_width': rw, 'crop_x': cx}


def to_phone(pm, x, y):
    return x * pm['scale'] - pm['crop_x'], y * pm['scale']


def reference_in_phone_frame(rgb, pw=412, ph=915):
    """the approved picture as the game frame shows it (float32 RGB, ph x pw) — identical to compare_r33.py"""
    im = Image.fromarray(rgb); sc = ph / im.height; rw = round(im.width * sc)
    a = np.array(im.resize((rw, ph), Image.LANCZOS))
    if rw >= pw:
        return a[:, (rw - pw) // 2:(rw - pw) // 2 + pw].astype(np.float32)
    out = np.zeros((ph, pw, 3), np.uint8); out[:, (pw - rw) // 2:(pw - rw) // 2 + rw] = a; return out.astype(np.float32)


def classes(rgb):
    """Rainbow colour classes (OpenCV HSV: H 0-180, S/V 0-255). Shared with compare_to_approved.py for region routing."""
    hsv = cv2.cvtColor(rgb.astype(np.uint8), cv2.COLOR_RGB2HSV); h, s, v = [hsv[..., i].astype(np.int32) for i in range(3)]
    mx = rgb.max(2)
    c = {
        'gold': (h >= 9) & (h <= 30) & (s > 120) & (v > 140),                       # rings, machinery, coins (painted_coins.py rule)
        'water_cyan': (h >= 84) & (h <= 112) & (s > 80) & (v > 110),               # cyan / blue river body
        'pink_edge': ((h >= 140) | (h <= 6)) & (s > 110) & (v > 120),              # pink / magenta river edges and streaks
        'purple': (h >= 115) & (h < 140) & (s > 60) & (v > 50),                    # purple metal walls
        'foam_white': (s < 60) & (v > 200),                                        # foam, splashes, highlights
        'near_black': mx < 22,                                                     # visual_check.py dark-patch rule
    }
    return c, hsv


def detect_hud(rgb):
    """HUD = rounded bars at the top. Their borders are long, perfectly horizontal edges, which the scenery rarely has in the top
    quarter. Bottom of the HUD = the lowest row (top 25 %) with a horizontal edge run >= 35 % of the width, + an 8 % margin."""
    H, W = rgb.shape[:2]; g = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32)
    gy = np.abs(cv2.Sobel(cv2.GaussianBlur(g, (0, 0), 1.0), cv2.CV_32F, 0, 1, ksize=3))
    top = int(H * 0.25); strong = gy[:top] > 60
    runs = []
    for y in range(top):
        r = strong[y].astype(np.int8); d = np.diff(np.concatenate([[0], r, [0]])); st = np.where(d == 1)[0]; en = np.where(d == -1)[0]
        runs.append(int((en - st).max()) if len(st) else 0)
    runs = np.array(runs); rows = np.where(runs >= 0.35 * W)[0]
    if not len(rows):
        return {'found': False, 'bottom_px': 0, 'rows_with_long_edges': []}
    bottom = int(rows.max()); margin = int(round(0.08 * bottom))
    return {'found': True, 'bottom_px': min(top, bottom + margin), 'last_long_edge_row': bottom, 'rows_with_long_edges': rows.tolist()[:60]}


def bright_core(rgb, y0):
    H, W = rgb.shape[:2]; hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV).astype(np.float32)
    # bright AND warm/white (the tunnel's glowing end): value minus a little saturation, heavily blurred
    m = hsv[..., 2] - 0.35 * hsv[..., 1]; m[:y0] = 0; m[int(H * 0.8):] = 0
    b = cv2.GaussianBlur(m, (0, 0), max(6, W / 60)); y, x = np.unravel_index(int(np.argmax(b)), b.shape)
    return float(x), float(y), float(b.max() / max(1e-6, np.percentile(b[y0:int(H * 0.8)], 50)))


def line_vp(rgb, y0):
    """convergence point of long straight edges (RANSAC over pair intersections)"""
    H, W = rgb.shape[:2]; g = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY); g[:y0] = 0
    e = cv2.Canny(cv2.GaussianBlur(g, (0, 0), 1.5), 60, 150)
    L = cv2.HoughLinesP(e, 1, np.pi / 360, 60, minLineLength=int(W * 0.08), maxLineGap=6)
    if L is None or len(L) < 4:
        return None
    L = np.asarray(L).reshape(-1, 4).astype(np.float64); d = L[:, 2:] - L[:, :2]; ln = np.hypot(d[:, 0], d[:, 1]); keep = ln > 0
    L, d, ln = L[keep], d[keep], ln[keep]
    ang = np.degrees(np.arctan2(d[:, 1], d[:, 0])) % 180
    ok = (np.abs(ang - 90) > 8) & (np.minimum(ang, 180 - ang) > 8)     # neither horizontal (HUD, water lines) nor vertical
    L, d, ln = L[ok], d[ok], ln[ok]
    if len(L) < 4:
        return None
    n = np.stack([-d[:, 1], d[:, 0]], 1) / ln[:, None]; c = (n * L[:, :2]).sum(1)     # line: n . p = c
    rng = np.random.default_rng(0); best, bestw = None, -1
    for _ in range(min(3000, len(L) * len(L))):
        i, j = rng.choice(len(L), 2, replace=False); A = np.stack([n[i], n[j]]); det = np.linalg.det(A)
        if abs(det) < 1e-3:
            continue
        p = np.linalg.solve(A, [c[i], c[j]])
        if not (-0.2 * W < p[0] < 1.2 * W and 0 < p[1] < H):
            continue
        dist = np.abs(n @ p - c); w = (ln * (dist < 0.012 * W)).sum()
        if w > bestw:
            bestw, best = w, p
    if best is None:
        return None
    inl = np.abs(n @ best - c) < 0.012 * W
    p = np.linalg.lstsq(n[inl], c[inl], rcond=None)[0] if inl.sum() >= 2 else best
    return {'x': float(p[0]), 'y': float(p[1]), 'inlier_lines': int(inl.sum()), 'lines': int(len(L)), 'inlier_share': round(float(inl.mean()), 3)}


def ring_tops(gold, vx, vy, y0):
    """gold runs straight above the core: their distances from the core and the ratio between successive ones"""
    H, W = gold.shape; x0, x1 = int(max(0, vx - 8)), int(min(W, vx + 9))
    col = gold[:, x0:x1].mean(1)[::-1][H - int(vy):]          # from the core upward
    col = col[:max(0, int(vy) - y0)]
    on = cv2.GaussianBlur(col.astype(np.float32)[:, None], (1, 0), sigmaX=0.1, sigmaY=1.0)[:, 0] > 0.45 if len(col) > 3 else np.array([], bool)
    d = np.diff(np.concatenate([[0], on.astype(np.int8), [0]])); st = np.where(d == 1)[0]; en = np.where(d == -1)[0]
    tops = [float((a + b) / 2) for a, b in zip(st, en) if b - a >= 2]
    tops = [t for t in tops if t >= 6]
    rat = [tops[k + 1] / tops[k] for k in range(len(tops) - 1) if tops[k] > 0]
    return {'centre_used': [round(vx, 1), round(vy, 1)], 'tops_px_from_core': [round(t, 1) for t in tops], 'count': len(tops),
            'successive_ratio': [round(r, 3) for r in rat], 'median_ratio': round(float(np.median(rat)), 3) if rat else None}


def river(c, vy, hud_bottom):
    H, W = c['water_cyan'].shape
    wm = (c['water_cyan'] | c['pink_edge']).astype(np.uint8); wm[:max(int(vy), hud_bottom)] = 0
    wm = cv2.morphologyEx(wm, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(wm, 8)
    if n <= 1:
        return {'found': False}
    k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA])); m = lab == k
    pts = []
    for y in range(int(max(vy, hud_bottom)) + 4, H, 24):
        xs = np.where(m[y])[0]
        if len(xs) > 8:
            pts.append([y, float(xs.mean()), int(xs.max() - xs.min() + 1)])
    if len(pts) < 4:
        return {'found': True, 'area_share': round(float(m.mean()), 3), 'centre_line': pts, 's_bends': 0}
    P = np.array(pts, float); y, x, w = P[:, 0], P[:, 1], P[:, 2]
    off = (x - np.polyval(np.polyfit(y, x, 1), y)) / np.maximum(w, 1)          # lateral wiggle relative to the river width
    sm = np.convolve(off, np.ones(3) / 3, mode='same'); dd = np.sign(np.diff(sm)); dd = dd[dd != 0]
    bends = int((np.diff(dd) != 0).sum()) if len(dd) > 1 else 0
    cyan_in = float(c['water_cyan'][m].mean()); pink_in = float(c['pink_edge'][m].mean())
    return {'found': True, 'area_share': round(float(m.mean()), 3), 'cyan_share_in_river': round(cyan_in, 3), 'pink_share_in_river': round(pink_in, 3),
            'centre_line': [[int(a), round(b, 1), int(cw)] for a, b, cw in pts], 's_bends': bends,
            'max_wiggle_of_width': round(float(np.abs(off).max()), 3)}


def dark_areas(c, pm, hud_bottom):
    m = c['near_black'].astype(np.uint8); m[:hud_bottom] = 0
    n, lab, st, cen = cv2.connectedComponentsWithStats(m, 8); a2 = pm['scale'] ** 2
    areas = [(int(st[i, 4]), [int(v) for v in st[i, :4]]) for i in range(1, n)]
    areas.sort(key=lambda t: -t[0])
    largest_phone = round(areas[0][0] * a2, 1) if areas else 0.0
    return {'share_below_hud': round(float(m[hud_bottom:].mean()), 4), 'components': len(areas), 'largest_px': areas[0][0] if areas else 0,
            'largest_px_at_phone': largest_phone, 'top_boxes_xywh': [b for _, b in areas[:8]],
            'visual_check_patch_limit_px_at_phone': 150,
            'artwork_dark_below_limit': bool(largest_phone < 150),
            'note': 'intentional dark details of the artwork; the visual checker counts only connected near-black areas >= 150 px at 412x915'}


def benny(c, hsv, hud_bottom):
    H, W = hsv.shape[:2]; h, s, v = [hsv[..., i].astype(np.int32) for i in range(3)]
    fur = (((h >= 150) | (h <= 10)) & (s >= 45) & (s <= 175) & (v >= 150)).astype(np.uint8)
    fur[:max(hud_bottom, int(H * 0.30))] = 0
    fur = cv2.morphologyEx(fur, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
    fur = cv2.morphologyEx(fur, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    n, lab, st, cen = cv2.connectedComponentsWithStats(fur, 8)
    best, bs = None, -1
    for i in range(1, n):
        x, y, w, hh, a = st[i]
        if a < 0.004 * H * W or w > 0.8 * W:
            continue
        cnt, _ = cv2.findContours((lab == i).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        hull = cv2.convexHull(max(cnt, key=cv2.contourArea)); sol = a / max(1.0, cv2.contourArea(hull))
        centred = 1 - abs((x + w / 2) - W / 2) / (W / 2)
        sc = sol * (0.5 + centred) * np.sqrt(a)
        if sc > bs:
            bs, best = sc, (int(x), int(y), int(w), int(hh), float(sol))
    if best is None:
        return {'found': False}
    x, y, w, hh, sol = best
    # the hat sits on top of the fur: purple / white mass right above, within the fur's columns
    hat = (c['purple'] | c['foam_white'] | ((h >= 125) & (h <= 160) & (s > 80))).astype(np.uint8)
    yt = y
    for yy in range(y - 1, max(hud_bottom, y - int(1.3 * hh)), -1):
        if hat[yy, x + w // 5:x + 4 * w // 5].mean() > 0.35:
            yt = yy
        elif y - yy > 0.15 * hh and yt > yy + 0.12 * hh:
            break
    box = [x, yt, x + w, y + hh]
    pad = [int(0.18 * w), int(0.12 * (box[3] - box[1]))]
    gen = [max(0, box[0] - pad[0]), max(0, box[1] - pad[1]), min(W, box[2] + pad[0]), min(H, box[3] + int(2.2 * pad[1]))]   # + splash below
    return {'found': True, 'fur_solidity': round(sol, 3), 'box_xyxy': box, 'compare_exclusion_box_xyxy': gen,
            'size_px': [box[2] - box[0], box[3] - box[1]], 'centre_px': [round((box[0] + box[2]) / 2, 1), round((box[1] + box[3]) / 2, 1)]}


def coins(c, river_info, hud_bottom):
    gold = c['gold'].astype(np.uint8); gold[:hud_bottom] = 0
    gold = cv2.morphologyEx(gold, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    n, lab, st, cen = cv2.connectedComponentsWithStats(gold, 8); H, W = gold.shape; out = []
    rows = {r[0]: r for r in river_info.get('centre_line', [])}
    for i in range(1, n):
        x, y, w, hh, a = st[i]
        if a < 25 or a > 0.01 * H * W or w > 3 * hh or hh > 3 * w:
            continue
        circ = a / (np.pi * (max(w, hh) / 2) ** 2)
        if circ < 0.55:
            continue
        cx, cy = cen[i]
        near = [r for yy, r in rows.items() if abs(yy - cy) <= 24]
        if near and abs(near[0][1] - cx) > 0.75 * near[0][2]:
            continue                                     # far off the river: machinery highlight, not a coin
        if not near:
            continue
        out.append([round(float(cx), 1), round(float(cy), 1), round(float(np.sqrt(a / np.pi)), 1)])
    out.sort(key=lambda t: -t[1])
    return {'count': len(out), 'xy_r_px_nearest_first': out[:40]}


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('ref'); ap.add_argument('out'); ap.add_argument('--overlay'); ap.add_argument('--phone', default='412x915')
    a = ap.parse_args(); pw, ph = [int(v) for v in a.phone.split('x')]
    rgb = load_rgb(a.ref); H, W = rgb.shape[:2]; pm = phone_map(W, H, pw, ph)
    c, hsv = classes(rgb)
    hud = detect_hud(rgb); hb = hud['bottom_px']
    below = np.zeros((H, W), bool); below[hb:] = True
    px = rgb[below].reshape(-1, 3).astype(np.float32)[::7]
    crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 1.0)
    _, lb, cc = cv2.kmeans(px, 8, None, crit, 2, cv2.KMEANS_PP_CENTERS)
    cnt = np.bincount(lb.ravel(), minlength=8) / len(lb); order = np.argsort(-cnt)
    palette = [{'hex': '#%02x%02x%02x' % tuple(int(v) for v in cc[i]), 'share': round(float(cnt[i]), 3)} for i in order]
    shares = {k: round(float(m[below].mean()), 4) for k, m in c.items()}
    bx, by, bpeak = bright_core(rgb, hb); lv = line_vp(rgb, hb)
    rt = ring_tops(c['gold'].astype(np.float32), bx, by, hb)
    rv = river(c, by, hb)
    dk = dark_areas(c, pm, hb)
    bn = benny(c, hsv, hb)
    cn = coins(c, rv, hb)
    res = {'reference': os.path.abspath(a.ref), 'size': [W, H], 'phone_frame': pm, 'hud': hud,
           'palette_below_hud': palette, 'class_shares_below_hud': shares,
           'vanishing_point': {'bright_core': {'x': round(bx, 1), 'y': round(by, 1), 'peak_over_median': round(bpeak, 2)}, 'line_convergence': lv,
                               'agreement_px': round(float(np.hypot(lv['x'] - bx, lv['y'] - by)), 1) if lv else None},
           'rings': rt, 'river': rv, 'dark': dk, 'benny': bn, 'coins': cn}
    # phone-frame versions of the values the compare / acceptance tools need
    pb = {'hud_rows': int(np.ceil(hb * pm['scale'])), 'vp_bright_core': [round(v, 1) for v in to_phone(pm, bx, by)]}
    if bn.get('found'):
        x0, y0 = to_phone(pm, *bn['compare_exclusion_box_xyxy'][:2]); x1, y1 = to_phone(pm, *bn['compare_exclusion_box_xyxy'][2:])
        t0 = to_phone(pm, *bn['box_xyxy'][:2]); t1 = to_phone(pm, *bn['box_xyxy'][2:])
        pb['benny_box_xyxy'] = [int(max(0, round(t0[0]))), int(round(t0[1])), int(min(pw, round(t1[0]))), int(round(t1[1]))]
        pb['benny_exclusion_box_xyxy'] = [int(max(0, np.floor(x0))), int(np.floor(y0)), int(min(pw, np.ceil(x1))), int(min(ph, np.ceil(y1)))]
    res['phone'] = pb
    res['suggested_compare_mask'] = {'hud_rows': pb['hud_rows'], 'exclude_boxes_xyxy': [pb['benny_exclusion_box_xyxy']] if 'benny_exclusion_box_xyxy' in pb else [],
                                     'status': 'ESTIMATE — confirm on the overlay; a validated per-screen mask in screens.json wins'}
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    json.dump(res, open(a.out, 'w'), indent=1)
    if a.overlay:
        ov = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR).copy()
        cv2.rectangle(ov, (0, 0), (W - 1, hb), (255, 255, 255), 3)
        cv2.circle(ov, (int(bx), int(by)), 14, (0, 255, 255), 3)
        if lv:
            cv2.drawMarker(ov, (int(lv['x']), int(lv['y'])), (0, 0, 255), cv2.MARKER_CROSS, 40, 3)
        for t in rt['tops_px_from_core']:
            cv2.circle(ov, (int(bx), int(by - t)), 6, (0, 200, 0), -1)
        if rv.get('found'):
            pts = np.array([[int(p[1]), int(p[0])] for p in rv['centre_line']], np.int32)
            if len(pts) > 1:
                cv2.polylines(ov, [pts], False, (255, 255, 0), 4)
        if bn.get('found'):
            cv2.rectangle(ov, tuple(bn['box_xyxy'][:2]), tuple(bn['box_xyxy'][2:]), (0, 255, 0), 3)
            cv2.rectangle(ov, tuple(bn['compare_exclusion_box_xyxy'][:2]), tuple(bn['compare_exclusion_box_xyxy'][2:]), (0, 128, 255), 2)
        for x, y, r in cn['xy_r_px_nearest_first']:
            cv2.circle(ov, (int(x), int(y)), int(r) + 4, (255, 0, 255), 2)
        for x, y, w, h in dk['top_boxes_xywh']:
            cv2.rectangle(ov, (x, y), (x + w, y + h), (0, 0, 255), 2)
        cv2.imwrite(a.overlay, ov, [cv2.IMWRITE_JPEG_QUALITY, 85] if a.overlay.lower().endswith('.jpg') else [])
    short = {'hud_rows_phone': pb['hud_rows'], 'vp_core': [round(bx), round(by)], 'vp_lines': [round(lv['x']), round(lv['y'])] if lv else None,
             'ring_tops': rt['tops_px_from_core'][:8], 'ring_ratio': rt['median_ratio'], 'river_s_bends': rv.get('s_bends'),
             'benny_box_phone': pb.get('benny_box_xyxy'), 'coins': cn['count'], 'dark_largest_phone_px': dk['largest_px_at_phone']}
    print(json.dumps(short))


if __name__ == '__main__':
    main()
