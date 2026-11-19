"""Screen 05 round 9 BLUEPRINT: structural measurements of the approved picture and of live game frames.

Approved (references/05_flow_into_the_current.png): the river (water region of qa/pilot05/full_reference_match/masks,
plus Benny / wake / coins / bubbles lying on it) per screen row: left / right edge, centre, width; inside it the magenta
bank bands vs the cyan lane (colour: magenta = hue > 270 or < 15 with saturation > 0.35, cyan = hue 170–235); the foam
banks beyond each edge; the gold rings (gold pixels on the vertical through the vanishing point above it and on the
horizontal through it) and the throat glow.
Game frames (tools/match05/blueprint05_game.mjs <dir>): the river edges are the projected 3D edges (<shot>.geo.json),
the bands / lane the same colour rule inside them, rings and throat projected circles.
  python3 -I tools/match05/blueprint05.py <outDir> <gameDir> shot,shot,...
writes <outDir>/blueprint.json, <outDir>/APPROVED_overlay.png, <outDir>/<shot>_overlay.png
"""
import json, sys, os
import numpy as np, cv2
from PIL import Image, ImageDraw

OUT, GAME, SHOTS = sys.argv[1], sys.argv[2], sys.argv[3].split(',')
os.makedirs(OUT, exist_ok=True)
M = 'qa/pilot05/full_reference_match/masks/'
ROWS = [520, 540, 560, 580, 600, 630, 660, 700, 750, 800, 900, 1000, 1100, 1200, 1300, 1400]
VP = (497, 478)


def hsv_of(a):
    h = cv2.cvtColor(a, cv2.COLOR_RGB2HSV).astype(float)
    return h[..., 0] * 2, h[..., 1] / 255, h[..., 2] / 255


def bands(a_row_h, a_row_s, L, R):
    """magenta / cyan shares inside [L, R] and the magenta-weighted centres of the left / right half"""
    L, R = int(max(0, L)), int(min(863, R))
    if R - L < 4:
        return None
    h, s = a_row_h[L:R], a_row_s[L:R]
    mag = ((h > 270) | (h < 15)) & (s > 0.35)
    cy = (h > 170) & (h < 235) & (s > 0.3)
    xs = np.arange(L, R)
    mid = (L + R) / 2
    lm, rm = mag & (xs < mid), mag & (xs >= mid)
    # width of the magenta run that hugs each edge (first 70 % of each half)
    def run(m, from_left):
        idx = np.where(m)[0]
        if not len(idx):
            return 0
        return int(len(idx))
    return {'magenta_share': round(float(mag.mean()), 3), 'cyan_share': round(float(cy.mean()), 3),
            'left_band_px': run(lm, True), 'right_band_px': run(rm, False),
            'left_band_c': round(float(xs[lm].mean()), 1) if lm.any() else None,
            'right_band_c': round(float(xs[rm].mean()), 1) if rm.any() else None}


def approved():
    ap = np.asarray(Image.open('references/05_flow_into_the_current.png').convert('RGB'))
    H, S, V = hsv_of(ap)
    m = lambda n: np.asarray(Image.open(M + n).convert('L')) > 127
    water = m('water.png') | m('benny_and_hat.png') | m('wake_splash.png') | m('coins.png') | m('bubbles.png')
    foam = m('foam_banks.png')
    gold = m('gold_rings_and_front_frame.png')
    rows = {}
    for y in ROWS:
        xs = np.where(water[y])[0]
        if not len(xs):
            continue
        # main run: the longest contiguous stretch (gaps ≤ 8 px bridged)
        runs, a = [], xs[0]
        for p, q in zip(xs[:-1], xs[1:]):
            if q - p > 8:
                runs.append((a, p)); a = q
        runs.append((a, xs[-1]))
        L, R = max(runs, key=lambda r: r[1] - r[0])
        fx = np.where(foam[y])[0]
        fl = int(L - fx[fx < L].min()) if (fx < L).any() else 0
        fr = int(fx[fx > R].max() - R) if (fx > R).any() else 0
        rows[y] = {'L': int(L), 'R': int(R), 'C': round((L + R) / 2, 1), 'W': int(R - L), 'foamL_px': fl, 'foamR_px': fr,
                   **(bands(H[y], S[y], L, R) or {})}
    # gold rings: gold runs on the vertical through the VP above it (ring tops) → radius = VP.y − y
    col = gold[:VP[1], VP[0]]
    tops, inrun = [], False
    for y in range(VP[1] - 1, 180, -1):
        if col[y] and not inrun:
            tops.append(VP[1] - y); inrun = True
        elif not col[y]:
            inrun = False
    # throat: bright low-saturation disc around the VP
    br = (V > 0.93) & (S < 0.35)
    ys, xs = np.where(br[VP[1] - 80:VP[1] + 80, VP[0] - 80:VP[0] + 80])
    throat = [VP[0], VP[1], round(float(np.sqrt(len(xs) / np.pi)), 1)] if len(xs) else None
    return ap, rows, {'ring_top_radii_px': tops[:8], 'throat': throat}


def game(shot):
    im = np.asarray(Image.open(f'{GAME}/{shot}.png').convert('RGB'))
    g = json.load(open(f'{GAME}/{shot}.geo.json'))
    H, S, V = hsv_of(im)
    # river edge polylines (screen): near ribbon then far river rows
    pl = [(p['L'], p['R'], p['C']) for p in g['near'] if p['L'] and p['R']]
    pf = [(p['L'], p['R'], None) for p in g['far'] if p['L'] and p['R']]
    def at(y, pts):
        best = None
        for (a, b, c), (a2, b2, c2) in zip(pts[:-1], pts[1:]):
            ya, yb = (a[1] + b[1]) / 2, (a2[1] + b2[1]) / 2
            if (ya - y) * (yb - y) <= 0 and ya != yb:
                t = (y - ya) / (yb - ya)
                L = a[0] + t * (a2[0] - a[0]); R = b[0] + t * (b2[0] - b[0])
                best = (L, R, 'near' if c is not None else 'far')
                break
        return best
    rows = {}
    for y in ROWS:
        hit = at(y, pl) or at(y, pf)
        if not hit:
            continue
        L, R, src = hit
        rows[y] = {'L': round(L), 'R': round(R), 'C': round((L + R) / 2, 1), 'W': round(R - L), 'src': src,
                   **(bands(H[y], S[y], max(0, L), min(863, R)) or {})}
    rings = [r for r in g['rings'] if r['c']]
    return im, rows, {'rings': rings, 'throat': g['glow'], 'benny': g['benny'], 's': g['state']['s'], 'sSeam': g['sSeam']}, pl, pf


def overlay(im, rows, path, extra=None):
    o = Image.fromarray(im).convert('RGB')
    d = ImageDraw.Draw(o)
    pts = sorted(rows.items())
    for (y, r) in pts:
        d.line([(r['L'], y), (r['R'], y)], fill=(255, 255, 0), width=1)
        d.ellipse([r['L'] - 4, y - 4, r['L'] + 4, y + 4], outline=(255, 255, 0), width=2)
        d.ellipse([r['R'] - 4, y - 4, r['R'] + 4, y + 4], outline=(255, 255, 0), width=2)
        for k in ('left_band_c', 'right_band_c'):
            if r.get(k):
                d.rectangle([r[k] - 3, y - 3, r[k] + 3, y + 3], fill=(255, 0, 200))
        d.text((r['R'] + 6, y - 6), f"W{r['W']}", fill=(255, 255, 255))
    if len(pts) > 1:
        d.line([(r['C'], y) for y, r in pts], fill=(0, 255, 120), width=3)
    if extra:
        for c in extra.get('circles', []):
            x, y, rr = c
            d.ellipse([x - rr, y - rr, x + rr, y + rr], outline=(255, 160, 0), width=2)
        if extra.get('throat'):
            x, y, rr = extra['throat']
            d.ellipse([x - rr, y - rr, x + rr, y + rr], outline=(0, 200, 255), width=3)
    o.save(path)


res = {}
ap, arows, aextra = approved()
res['APPROVED'] = {'rows': arows, **aextra}
overlay(ap, arows, f'{OUT}/APPROVED_overlay.png',
        {'circles': [(VP[0], VP[1], r) for r in aextra['ring_top_radii_px']], 'throat': aextra['throat']})
for sh in SHOTS:
    im, rows, extra, pl, pf = game(sh)
    res[sh] = {'rows': rows, **extra}
    overlay(im, rows, f'{OUT}/{sh}_overlay.png', {'circles': [r['c'] for r in extra['rings']], 'throat': extra['throat']})
json.dump(res, open(f'{OUT}/blueprint.json', 'w'), indent=1)
# compact table: per row W / C / magenta share, approved vs each shot
hdr = 'y    | APPROVED W  C   mag cyan foamL/R | ' + ' | '.join(f'{s[:3]} W  C   mag  src' for s in SHOTS)
print(hdr)
for y in ROWS:
    a = arows.get(y)
    line = f'{y:4d} | ' + (f"{a['W']:4d} {a['C']:5.0f} {a.get('magenta_share', 0):.2f} {a.get('cyan_share', 0):.2f} {a['foamL_px']:3d}/{a['foamR_px']:3d}" if a else ' ' * 30)
    for sh in SHOTS:
        r = res[sh]['rows'].get(y)
        line += ' | ' + (f"{r['W']:4d} {r['C']:5.0f} {r.get('magenta_share', 0):.2f} {r['src'][0]}" if r else ' ' * 18)
    print(line)
print('approved ring top radii px', aextra['ring_top_radii_px'], 'throat', aextra['throat'])
for sh in SHOTS:
    e = res[sh]
    print(sh, 's', e['s'], 'seam', e['sSeam'], 'throat', e['throat'], 'rings', [r['c'][2] for r in e['rings']][:10])
