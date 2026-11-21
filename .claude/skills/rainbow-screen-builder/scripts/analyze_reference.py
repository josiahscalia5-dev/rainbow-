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
    # lit ring edges run from gold to red-orange (far rings in warm light): used for the ring-top profile, not for the class shares
    c['ring_warm'] = (((h <= 30) | (h >= 176)) & (s > 90) & (v > 195))
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


def tunnel_core(rgb, gold, y0):
    """the tunnel's glowing end: local maxima of white-hot pixels (central 80 %, between the HUD and 75 % height), ranked by how many
    separate concentric gold arcs surround them (repeated rings), then by the gold fraction on those arcs. Returns top-3 candidates."""
    H, W = rgb.shape[:2]; hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV); s, v = hsv[..., 1].astype(np.int32), hsv[..., 2].astype(np.int32)
    wh = ((s < 110) & (v > 230)).astype(np.float32); wh[:y0] = 0; wh[int(H * 0.75):] = 0; wh[:, :int(0.1 * W)] = 0; wh[:, int(0.9 * W):] = 0
    b = cv2.GaussianBlur(wh, (0, 0), W / 90)
    if b.max() <= 0:
        return []
    pk = (b == cv2.dilate(b, np.ones((41, 41), np.uint8))) & (b > 0.25 * b.max())
    ys, xs = np.where(pk); order = np.argsort(-b[ys, xs])[:20]
    th = np.radians(np.linspace(190, 350, 48)); rs = np.geomspace(20, 0.45 * W, 40); out = []
    for k in order:
        x, y = int(xs[k]), int(ys[k]); prof = []
        for r in rs:
            px = (x + r * np.cos(th)).astype(int); py = (y + r * np.sin(th)).astype(int); ok = (px >= 0) & (px < W) & (py >= y0) & (py < H)
            prof.append(float(gold[py[ok], px[ok]].mean()) if ok.mean() > 0.8 else 0.0)
        prof = np.array(prof); peaks = (prof > 0.35) & (prof >= np.maximum(np.r_[0, prof[:-1]], np.r_[prof[1:], 0]))
        out.append({'x': x, 'y': y, 'ring_arcs': int(peaks.sum()), 'arc_gold': round(float(np.sort(prof)[-6:].mean()), 3), 'glow': round(float(b[y, x]), 3)})
    out.sort(key=lambda c: (c['ring_arcs'], c['arc_gold']), reverse=True)
    return out[:3]


def line_vp(rgb, y0):
    """convergence point of straight edge segments (LSD; RANSAC over pair intersections) — a second, independent estimate"""
    H, W = rgb.shape[:2]; g = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY); g[:y0] = 0
    try:
        L = cv2.createLineSegmentDetector().detect(g)[0]
    except Exception:
        L = None
    if L is None or len(L) < 4:
        return None
    L = np.asarray(L).reshape(-1, 4).astype(np.float64); d = L[:, 2:] - L[:, :2]; ln = np.hypot(d[:, 0], d[:, 1])
    ang = np.degrees(np.arctan2(d[:, 1], d[:, 0])) % 180
    ok = (ln > 0.015 * W) & (np.abs(ang - 90) > 6) & (np.minimum(ang, 180 - ang) > 6)     # neither horizontal nor vertical
    L, d, ln = L[ok], d[ok], ln[ok]
    if len(L) < 4:
        return None
    n = np.stack([-d[:, 1], d[:, 0]], 1) / ln[:, None]; c = (n * L[:, :2]).sum(1)     # line: n . p = c
    rng = np.random.default_rng(0); best, bestw, tol = None, -1, 0.005 * W
    for _ in range(4000):
        i, j = rng.choice(len(L), 2, replace=False); A = np.stack([n[i], n[j]])
        if abs(np.linalg.det(A)) < 0.05:
            continue
        p = np.linalg.solve(A, [c[i], c[j]])
        if not (0 < p[0] < W and y0 < p[1] < 0.8 * H):
            continue
        w = (ln * (np.abs(n @ p - c) < tol)).sum()
        if w > bestw:
            bestw, best = w, p
    if best is None:
        return None
    inl = np.abs(n @ best - c) < tol
    p = np.linalg.lstsq(n[inl], c[inl], rcond=None)[0] if inl.sum() >= 2 else best
    return {'x': round(float(p[0]), 1), 'y': round(float(p[1]), 1), 'inlier_segments': int(inl.sum()), 'segments': int(len(L)), 'inlier_share': round(float(inl.mean()), 3)}


def ring_tops(gold, vx, vy, y0):
    """gold runs straight above the core: their distances from the core and the ratio between successive ones"""
    H, W = gold.shape; x0, x1 = int(max(0, vx - 8)), int(min(W, vx + 9))
    rows = np.arange(int(vy) - 1, max(y0, 0) - 1, -1)
    col = gold[rows, x0:x1].mean(1) if len(rows) else np.zeros(0)
    on = (cv2.GaussianBlur(col.astype(np.float32).reshape(-1, 1), (1, 5), 0).ravel() > 0.45) if len(col) > 5 else np.zeros(0, bool)
    d = np.diff(np.concatenate([[0], on.astype(np.int8), [0]])); st = np.where(d == 1)[0]; en = np.where(d == -1)[0]
    tops = [float((a + b) / 2 + 1) for a, b in zip(st, en) if b - a >= 2]
    tops = [t for t in tops if t >= 0.03 * W]                   # nearer to the core the rings merge into the glow
    rat = [tops[k + 1] / tops[k] for k in range(len(tops) - 1) if tops[k] > 0]
    return {'centre_used': [round(float(vx), 1), round(float(vy), 1)], 'tops_px_from_core': [round(t, 1) for t in tops], 'count': len(tops),
            'successive_ratio': [round(r, 3) for r in rat], 'median_ratio': round(float(np.median(rat)), 3) if rat else None,
            'note': 'radius ratio of successive rings = their depth ratio (r ~ 1/z); constant ratio = the painting\'s own perspective'}


def river(c, vy, hud_bottom):
    """main water body below the core: centre line every 24 rows, widths, S-bends (direction changes of the lateral wiggle that swing
    by >= 4 % of the local river width, so painted streaks do not count as bends)"""
    H, W = c['water_cyan'].shape; ytop = int(max(vy, hud_bottom))
    wm = (c['water_cyan'] | c['pink_edge']).astype(np.uint8); wm[:ytop] = 0
    wm = cv2.morphologyEx(wm, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(wm, 8)
    if n <= 1:
        return {'found': False, 'centre_line_y_x_width': []}
    k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA])); m = lab == k
    pts = []
    for y in range(ytop + 4, H, 24):                         # largest contiguous water run per row = the river between its banks
        r = m[y].astype(np.int8); d = np.diff(np.concatenate([[0], r, [0]])); st_ = np.where(d == 1)[0]; en = np.where(d == -1)[0]
        if len(st_):
            j = int(np.argmax(en - st_))
            if en[j] - st_[j] > 8:
                pts.append([y, float((st_[j] + en[j] - 1) / 2), int(en[j] - st_[j])])
    res = {'found': True, 'area_share': round(float(m.mean()), 3), 'cyan_share_in_river': round(float(c['water_cyan'][m].mean()), 3),
           'pink_share_in_river': round(float(c['pink_edge'][m].mean()), 3), 'centre_line_y_x_width': [[int(a), round(b, 1), int(cw)] for a, b, cw in pts],
           'touches_frame_bottom': bool(m[-3:].any()),
           'note': 'centre = middle of the largest water run per row (between the banks); judge the S-shape on the overlay'}
    if len(pts) >= 5:
        P = np.array(pts, float); y, x, w = P[:, 0], P[:, 1], P[:, 2]
        off = (x - np.polyval(np.polyfit(y, x, 1), y)) / np.maximum(w, 1)
        res['max_lateral_wiggle_of_width'] = round(float(np.abs(off).max()), 3)
    # no automatic bend COUNT: painted rivers have several cyan channels and pink streaks, a count would be noise; the S-shape is read
    # by eye on the overlay (cyan line = river centre between its banks) and fitted per screen (e.g. kit.json river_center for 05)
    return res


def dark_areas(c, pm, hud_bottom):
    m = c['near_black'].astype(np.uint8); m[:hud_bottom] = 0
    n, lab, st, cen = cv2.connectedComponentsWithStats(m, 8); a2 = pm['scale'] ** 2
    areas = sorted([(int(st[i, 4]), [int(v) for v in st[i, :4]]) for i in range(1, n)], key=lambda t: -t[0])
    largest_phone = round(areas[0][0] * a2, 1) if areas else 0.0
    return {'share_below_hud': round(float(m[hud_bottom:].mean()), 4), 'components': len(areas), 'largest_px': areas[0][0] if areas else 0,
            'largest_px_at_phone': largest_phone, 'top_boxes_xywh': [b for _, b in areas[:8]],
            'visual_check_patch_limit_px_at_phone': 150, 'artwork_dark_below_limit': bool(largest_phone < 150),
            'note': 'intentional dark details of the ARTWORK; visual_check.py counts only connected near-black areas >= 150 px at 412x915 — '
                    'if artwork_dark_below_limit is false, that screen needs its own dark-area exclusion before any acceptance run'}


def benny(rgb, hsv, hud_bottom):
    """the painted Benny = the most compact, centred blob of TEXTURED pink / purple (fur, knitted hat, pompom). Colour alone cannot
    separate him from the pink river edges (same hue / saturation); texture can (local grey std 9x9: fur ~21, painted water ~9-13)."""
    H, W = hsv.shape[:2]; h, s, v = [hsv[..., i].astype(np.int32) for i in range(3)]
    g = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32); mu = cv2.blur(g, (9, 9)); sd = np.sqrt(np.maximum(cv2.blur(g * g, (9, 9)) - mu * mu, 0))
    m = ((h >= 120) & (h <= 175) & (s > 60) & (v > 120) & (sd > 15)).astype(np.float32); m[:max(hud_bottom, int(H * 0.3))] = 0
    fr = (cv2.blur(m, (31, 31)) > 0.5).astype(np.uint8)
    fr = cv2.morphologyEx(fr, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
    n, lab, st, _ = cv2.connectedComponentsWithStats(fr, 8); best, bs = None, -1
    for i in range(1, n):
        x, y, w, hh, a = [int(t) for t in st[i]]
        if a < 0.01 * H * W:
            continue
        cnt, _ = cv2.findContours((lab == i).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        sol = a / max(1.0, cv2.contourArea(cv2.convexHull(max(cnt, key=cv2.contourArea))))
        sc = sol ** 2 * (1 - abs(x + w / 2 - W / 2) / (W / 2)) * np.sqrt(a)
        if sc > bs:
            bs, best = sc, (x, y, w, hh, sol)
    if best is None:
        return {'found': False}
    x, y, w, hh, sol = best; box = [x, y, x + w, y + hh]
    pad = [int(0.12 * w), int(0.08 * hh)]
    gen = [max(0, x - pad[0]), max(0, y - pad[1]), min(W, x + w + pad[0]), min(H, y + hh + 3 * pad[1])]   # + splash / wake below him
    return {'found': True, 'confidence': 'ok' if sol >= 0.7 else 'LOW (blob not compact: confirm on the overlay)', 'solidity': round(sol, 3),
            'box_xyxy': box, 'compare_exclusion_box_xyxy': gen, 'size_px': [w, hh], 'centre_px': [round(x + w / 2, 1), round(y + hh / 2, 1)]}


def coins(c, hud_bottom, benny_box=None):
    """small filled round gold blobs sitting on water (cyan / pink around them): the painted coin trail, nearest (lowest) first"""
    gold = c['gold'].astype(np.uint8); gold[:hud_bottom] = 0
    gold = cv2.morphologyEx(gold, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    water = (c['water_cyan'] | c['pink_edge']).astype(np.float32)
    n, lab, st, cen = cv2.connectedComponentsWithStats(gold, 8); H, W = gold.shape; out = []
    for i in range(1, n):
        x, y, w, hh, a = [int(t) for t in st[i]]
        if a < 25 or a > 0.006 * H * W or w > 2.2 * hh or hh > 2.2 * w or x == 0 or y + hh >= H or x + w >= W:
            continue
        if a / (np.pi * w * hh / 4) < 0.6:                    # filled ellipse, not an arc of a ring
            continue
        cx, cy = cen[i]
        if benny_box and benny_box[0] <= cx <= benny_box[2] and benny_box[1] <= cy <= benny_box[3]:
            continue                                          # the star on Benny's hat
        ex, ey = max(w // 2, 4), max(hh // 2, 4)
        if water[max(0, y - ey):y + hh + ey, max(0, x - ex):x + w + ex].mean() < 0.2:
            continue                                          # not on the river: machinery highlight, not a coin
        out.append([round(float(cx), 1), round(float(cy), 1), round(float(np.sqrt(a / np.pi)), 1)])
    out.sort(key=lambda t: -t[1])
    return {'count': len(out), 'xy_r_px_nearest_first': out[:40]}


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('ref'); ap.add_argument('out'); ap.add_argument('--overlay'); ap.add_argument('--phone', default='412x915')
    ap.add_argument('--vp', help='x,y in reference px: a vanishing point confirmed by eye (overrides the estimate for rings / river)')
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
    shares = {k: round(float(m[below].mean()), 4) for k, m in c.items() if k != 'ring_warm'}
    cores = tunnel_core(rgb, c['gold'].astype(np.float32), hb); lv = line_vp(rgb, hb)
    if a.vp:
        vx, vy = [float(t) for t in a.vp.split(',')]; vsrc = 'given (--vp)'
    elif cores:
        vx, vy = float(cores[0]['x']), float(cores[0]['y']); vsrc = 'tunnel core estimate'
    else:
        vx, vy = W / 2, H * 0.35; vsrc = 'fallback (no core found)'
    conf = 'ok' if (a.vp or (cores and cores[0]['ring_arcs'] >= 1 and cores[0]['arc_gold'] >= 0.5)) else 'LOW (confirm by eye, re-run with --vp x,y)'
    rt = ring_tops(c['ring_warm'].astype(np.float32), vx, vy, hb)
    rv = river(c, vy, hb)
    dk = dark_areas(c, pm, hb)
    bn = benny(rgb, hsv, hb)
    cn = coins(c, hb, bn.get('box_xyxy'))
    res = {'reference': os.path.abspath(a.ref), 'size': [W, H], 'phone_frame': pm, 'hud': hud,
           'palette_below_hud': palette, 'class_shares_below_hud': shares,
           'vanishing_point': {'used': [round(vx, 1), round(vy, 1)], 'source': vsrc, 'confidence': conf, 'tunnel_core_candidates': cores,
                               'line_convergence': lv, 'agreement_px': round(float(np.hypot(lv['x'] - vx, lv['y'] - vy)), 1) if lv else None},
           'rings': rt, 'river': rv, 'dark': dk, 'benny': bn, 'coins': cn}
    pb = {'hud_rows': int(np.ceil(hb * pm['scale'])), 'vp': [round(v, 1) for v in to_phone(pm, vx, vy)]}
    if bn.get('found'):
        t0 = to_phone(pm, *bn['box_xyxy'][:2]); t1 = to_phone(pm, *bn['box_xyxy'][2:])
        x0, y0 = to_phone(pm, *bn['compare_exclusion_box_xyxy'][:2]); x1, y1 = to_phone(pm, *bn['compare_exclusion_box_xyxy'][2:])
        pb['benny_box_xyxy'] = [int(max(0, round(t0[0]))), int(round(t0[1])), int(min(pw, round(t1[0]))), int(round(t1[1]))]
        pb['benny_exclusion_box_xyxy'] = [int(max(0, np.floor(x0))), int(np.floor(y0)), int(min(pw, np.ceil(x1))), int(min(ph, np.ceil(y1)))]
    res['phone'] = pb
    res['suggested_compare_mask'] = {'hud_rows': pb['hud_rows'], 'exclude_boxes_xyxy': [pb['benny_exclusion_box_xyxy']] if 'benny_exclusion_box_xyxy' in pb else [],
                                     'status': 'ESTIMATE - confirm on the overlay; a validated per-screen mask in screens.json wins'}
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    json.dump(res, open(a.out, 'w'), indent=1)
    if a.overlay:
        ov = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR).copy(); T = max(2, W // 300)
        cv2.rectangle(ov, (0, 0), (W - 1, hb), (255, 255, 255), T)                                   # HUD band: white
        for cd in cores:
            cv2.circle(ov, (cd['x'], cd['y']), 10, (0, 255, 255), T)                                # core candidates: yellow
        cv2.drawMarker(ov, (int(vx), int(vy)), (0, 255, 255), cv2.MARKER_TILTED_CROSS, 36, T + 1)    # VP used
        if lv:
            cv2.drawMarker(ov, (int(lv['x']), int(lv['y'])), (0, 0, 255), cv2.MARKER_CROSS, 36, T)  # line convergence: red
        for t in rt['tops_px_from_core']:
            cv2.circle(ov, (int(vx), int(vy - t)), 6, (0, 220, 0), -1)                             # ring tops: green dots
        cl = rv.get('centre_line_y_x_width', [])
        xs = [float(np.median([q[1] for q in cl[max(0, k - 3):k + 4]])) for k in range(len(cl))]     # 7-sample median: banks, not streaks
        pts = np.array([[int(x_), int(q[0])] for x_, q in zip(xs, cl)], np.int32)
        if len(pts) > 1:
            cv2.polylines(ov, [pts], False, (255, 255, 0), T + 1)                                   # river centre: cyan
        if bn.get('found'):
            cv2.rectangle(ov, tuple(bn['box_xyxy'][:2]), tuple(bn['box_xyxy'][2:]), (0, 255, 0), T)
            cv2.rectangle(ov, tuple(bn['compare_exclusion_box_xyxy'][:2]), tuple(bn['compare_exclusion_box_xyxy'][2:]), (0, 128, 255), T)
        for x, y, r in cn['xy_r_px_nearest_first']:
            cv2.circle(ov, (int(x), int(y)), int(r) + 4, (255, 0, 255), T)                          # coins: magenta
        for x, y, w, h in dk['top_boxes_xywh']:
            cv2.rectangle(ov, (x, y), (x + w, y + h), (0, 0, 255), T)                               # artwork dark spots: red
        os.makedirs(os.path.dirname(os.path.abspath(a.overlay)), exist_ok=True)
        cv2.imwrite(a.overlay, ov, [cv2.IMWRITE_JPEG_QUALITY, 85] if a.overlay.lower().endswith('.jpg') else [])
    print(json.dumps({'hud_rows_phone': pb['hud_rows'], 'vp': [round(vx), round(vy)], 'vp_confidence': conf, 'vp_lines': [lv['x'], lv['y']] if lv else None,
                      'ring_tops': rt['tops_px_from_core'][:9], 'ring_ratio': rt['median_ratio'], 'river_area': rv.get('area_share'),
                      'benny_box_phone': pb.get('benny_box_xyxy'), 'benny_conf': bn.get('confidence'), 'coins': cn['count'],
                      'dark_largest_phone_px': dk['largest_px_at_phone']}))


if __name__ == '__main__':
    main()
