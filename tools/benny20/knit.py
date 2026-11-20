"""benny20 (benny-character-artist r19b): hand-knit beanie + felt star maps for `?benny20=1`.
Procedural, seamless around u, built to the APPROVED Screen 04 beanie (references/04_through_the_five_arrows.png):
  * crown: stockinette V-stitch columns, cream-white / violet stripes (layout measured on the approved 04 picture),
  * brim:  thick ribbed violet cuff (raised knit columns with V stitches, deep purl grooves, visible rows),
  * star:  flat felt patch, soft gold, puffy towards the middle, darker felt edge, stitched dashed rim.
Writes <out>/{crown,crown_n,brim,brim_n,star,star_n}.png (albedo sRGB; normal maps tangent space, +Y = up in the image).
usage: python3 -I tools/benny20/knit.py <out_dir> [--json params.json]"""
import sys, json, os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

P = dict(
    # crown: columns around, stitch rows over v 0..1 (v = height on the dome: 0 = inside the cuff, 1 = apex under the pom)
    crown_w=2048, crown_h=512, crown_cols=168, crown_rows=34,
    # stripes, bottom -> top (v boundaries); colours sRGB 0..255 (albedo, before the material factor)
    stripes=[[0.0, 'W'], [0.30, 'V'], [0.50, 'W'], [0.645, 'V'], [0.75, 'W'], [0.815, 'V']],
    white=[238, 226, 240], violet=[118, 40, 222], cuff=[112, 34, 218],
    brim_w=2048, brim_h=256, brim_cols=132, brim_rows=12,
    groove=0.38, seed=7,
    star_px=512, star_gold=[255, 206, 72], star_edge=[236, 150, 40], star_stitch=[196, 112, 36],
)


def rng(seed):
    return np.random.default_rng(seed)


def fbm(shape, seed, sigmas=(0.7, 1.6, 4.0), weights=(0.5, 0.3, 0.2), wrap=True):
    r = rng(seed)
    out = np.zeros(shape)
    for s, w in zip(sigmas, weights):
        n = ndi.gaussian_filter(r.standard_normal(shape), s, mode='wrap' if wrap else 'reflect')
        out += w * n / (n.std() + 1e-9)
    return out


def leg_height(s, t, side):
    """one leg of a V stitch in cell coords (s across the column -0.5..0.5, t up the row 0..1): slanted ellipse"""
    # leg runs from the top outer corner (side*0.42, 1.08) to the bottom centre (side*0.04, -0.02)
    ax, ay = side * 0.42, 1.08
    bx, by = side * 0.04, -0.04
    cx, cy = (ax + bx) / 2, (ay + by) / 2
    dx, dy = ax - bx, ay - by
    L = np.hypot(dx, dy)
    ux, uy = dx / L, dy / L
    a = (s - cx) * ux + (t - cy) * uy          # along the leg
    b = -(s - cx) * uy + (t - cy) * ux         # across the leg
    A, B = L / 2 * 1.02, 0.205
    q = 1 - (a / A) ** 2 - (b / B) ** 2
    h = np.sqrt(np.clip(q, 0, 1))
    # yarn ply twist: fine diagonal striations along the leg
    tw = 0.86 + 0.14 * np.sin(2 * np.pi * (a * 5.5 + b * side * 9.0))
    return h * tw


def knit_field(W, H, cols, rows, seed, rib=False, groove=0.38):
    """height (0..1) + per-texel stitch row index + per-stitch random, seamless in u"""
    x = (np.arange(W) + 0.5) / W * cols
    y = (np.arange(H) + 0.5) / H * rows       # y = rows counted from the TOP of the image
    X, Y = np.meshgrid(x, y)
    hmax = np.zeros((H, W)); rowid = np.zeros((H, W), int); var = np.zeros((H, W))
    r = rng(seed)
    rv = r.uniform(-1, 1, (rows + 3, cols + 2))
    col = np.floor(X).astype(int)
    s = X - col - 0.5
    for dr in (-1, 0, 1):
        # t measured upward inside row k: image y grows downward
        k = np.floor(Y).astype(int) + dr
        t = 1 - (Y - k)            # 0 at the row's lower edge, 1 at its top edge
        # a little per-stitch jitter (hand-knit irregularity)
        js = rv[np.clip(k + 1, 0, rows + 2), (col % cols)] * 0.03
        hs = np.maximum(leg_height(s + js, t, -1), leg_height(s + js, t, 1))
        if rib:
            hs = hs * 1.0
        better = hs > hmax
        hmax = np.where(better, hs, hmax)
        rowid = np.where(better, k, rowid)
        var = np.where(better, rv[np.clip(k + 1, 0, rows + 2), (col % cols)], var)
    if rib:
        # ribbing: every column is a raised knit rib; the purl grooves between them sink deep
        edge = np.abs(s)
        ribprof = np.clip(1 - ((edge - 0.18) / 0.32).clip(0) ** 2, 0, 1)
        hmax = hmax * (0.55 + 0.45 * ribprof) + 0.35 * ribprof
        hmax = hmax / hmax.max()
    return hmax, rowid, var


def shade(h, base, var, groove, fuzz):
    occ = groove + (1 - groove) * np.clip(h, 0, 1) ** 0.75
    c = base * occ[..., None] * (1 + 0.045 * var)[..., None] * (1 + 0.05 * fuzz)[..., None]
    return c


def normals(h, strength):
    dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * 0.5
    dy = (np.vstack([h[1:], h[-1:]]) - np.vstack([h[:1], h[:-1]])) * 0.5
    n = np.stack([-dx * strength, dy * strength, np.ones_like(h)], -1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    return ((n * 0.5 + 0.5) * 255 + 0.5).astype(np.uint8)


def s2l(c):
    c = np.asarray(c, float) / 255
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def l2s8(c):
    c = np.clip(c, 0, 1)
    s = np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - 0.055)
    return (s * 255 + 0.5).astype(np.uint8)


def crown(p, out):
    W, H, cols, rows = p['crown_w'], p['crown_h'], p['crown_cols'], p['crown_rows']
    # r20: optional ribbed crown (approved 04 crown = raised knit columns with grooves, like the cuff but milder)
    h, rowid, var = knit_field(W, H, cols, rows, p['seed'], rib=bool(p.get('crown_rib', False)))
    fz = fbm((H, W), p['seed'] + 1)
    # stripe per stitch ROW (stripes change on row boundaries -> jagged knit edge like a real beanie)
    vrow = 1 - (rowid + 0.5) / rows          # v of the row centre (0 bottom .. 1 top)
    cw, cv = s2l(p['white']), s2l(p['violet'])
    st = sorted(p['stripes'], key=lambda e: e[0])
    isv = np.zeros_like(vrow, bool)
    for v0, c in st:
        isv = np.where(vrow >= v0, c == 'V', isv)
    base = np.where(isv[..., None], cv, cw)
    # the white yarn is a touch warmer / greyer in the grooves (real cream yarn), violet deeper
    alb = shade(h, base, var, p['groove'], fz)
    Image.fromarray(l2s8(alb)).save(f'{out}/crown.png')
    Image.fromarray(normals(ndi.gaussian_filter(h, 0.6, mode='wrap'), 5.0)).save(f'{out}/crown_n.png')


def brim(p, out):
    W, H, cols, rows = p['brim_w'], p['brim_h'], p['brim_cols'], p['brim_rows']
    h, rowid, var = knit_field(W, H, cols, rows, p['seed'] + 3, rib=True)
    fz = fbm((H, W), p['seed'] + 4)
    base = np.broadcast_to(s2l(p['cuff']), (H, W, 3))
    alb = shade(h, base, var, p['groove'] * 0.85, fz)
    Image.fromarray(l2s8(alb)).save(f'{out}/brim.png')
    Image.fromarray(normals(ndi.gaussian_filter(h, 0.6, mode='wrap'), 6.0)).save(f'{out}/brim_n.png')


def star_poly():
    pts = []
    for i in range(10):
        a = np.pi / 2 + i * np.pi / 5
        r = 0.165 if i % 2 == 0 else 0.083
        pts.append((np.cos(a) * r, np.sin(a) * r))
    return np.array(pts)


def star(p, out):
    """planar UVs of benny05.starUVs on the GLB star: u = x / 0.41593 + 0.5, v = (y - 0.020078) / 0.41593 + 0.5
    (x, y = the build.ts star shape coordinates; bbox incl. bevel 0.39993 x 0.38035, centre y +0.020078)"""
    N = p['star_px']
    size, cy = 0.41593, 0.020078
    u = (np.arange(N) + 0.5) / N
    v = 1 - (np.arange(N) + 0.5) / N
    U, V = np.meshgrid(u, v)
    X = (U - 0.5) * size
    Y = (V - 0.5) * size + cy
    poly = star_poly()
    # signed distance to the star outline (negative inside)
    d = np.full(X.shape, 1e9)
    for i in range(10):
        ax, ay = poly[i]; bx, by = poly[(i + 1) % 10]
        ex, ey = bx - ax, by - ay
        t = np.clip(((X - ax) * ex + (Y - ay) * ey) / (ex * ex + ey * ey), 0, 1)
        d = np.minimum(d, np.hypot(X - ax - t * ex, Y - ay - t * ey))
    inside = np.zeros(X.shape, bool)
    for i in range(10):  # even-odd ray test
        ax, ay = poly[i]; bx, by = poly[(i + 1) % 10]
        c = ((ay > Y) != (by > Y)) & (X < (bx - ax) * (Y - ay) / (by - ay + 1e-12) + ax)
        inside ^= c
    sd = np.where(inside, -d, d)
    gold, edge, stc = s2l(p['star_gold']), s2l(p['star_edge']), s2l(p['star_stitch'])
    # puffy felt: brighter towards the middle, darker towards the sewn edge
    depth = np.clip(-sd / 0.05, 0, 1)
    puff = 0.78 + 0.22 * np.sqrt(depth)
    fz = fbm(X.shape, p['seed'] + 9, sigmas=(0.5, 1.2, 3.0), weights=(0.55, 0.3, 0.15), wrap=False)
    col = gold[None, None] * puff[..., None] * (1 + 0.06 * fz)[..., None]
    # felt edge band (the sewn-down rim) + the bevel ring outside the face
    rim = np.clip(1 - (-sd) / 0.012, 0, 1)
    col = col * (1 - rim[..., None]) + edge[None, None] * (0.85 + 0.1 * fz)[..., None] * rim[..., None]
    col = np.where((sd > 0)[..., None], edge[None, None] * 0.8 * (1 + 0.05 * fz)[..., None], col)
    # stitched dashed line inset from the outline: dashes along the contour (arc length parameter)
    inset = 0.020
    band = np.abs(sd + inset) < 0.0045
    # arc-length coordinate along the outline: nearest-segment parameter accumulated
    seg_len = np.hypot(*(np.roll(poly, -1, 0) - poly).T)
    cum = np.concatenate([[0], np.cumsum(seg_len)])
    best = np.full(X.shape, 1e9); arc = np.zeros(X.shape)
    for i in range(10):
        ax, ay = poly[i]; bx, by = poly[(i + 1) % 10]
        ex, ey = bx - ax, by - ay
        t = np.clip(((X - ax) * ex + (Y - ay) * ey) / (ex * ex + ey * ey), 0, 1)
        dd = np.hypot(X - ax - t * ex, Y - ay - t * ey)
        m = dd < best
        best = np.where(m, dd, best); arc = np.where(m, cum[i] + t * seg_len[i], arc)
    dash = (np.mod(arc / 0.016, 1.0) < 0.62)
    stitch = band & dash & (sd < 0)
    sm = ndi.gaussian_filter(stitch.astype(float), 0.8)
    col = col * (1 - sm[..., None]) + stc[None, None] * sm[..., None]
    # tiny shadow under each stitch
    sh = ndi.gaussian_filter(np.roll(stitch, 2, 0).astype(float), 1.2) * (1 - sm)
    col = col * (1 - 0.18 * sh[..., None])
    Image.fromarray(l2s8(col)).save(f'{out}/star.png')
    # normals: puffy dome + stitch dimples + felt fuzz
    hgt = np.sqrt(depth) * 1.0 - 0.6 * ndi.gaussian_filter(stitch.astype(float), 1.0) + 0.04 * fz
    Image.fromarray(normals(ndi.gaussian_filter(hgt, 1.0), 2.0 * N / 256)).save(f'{out}/star_n.png')


def main():
    out = sys.argv[1]
    if '--json' in sys.argv:
        P.update(json.load(open(sys.argv[sys.argv.index('--json') + 1])))
    os.makedirs(out, exist_ok=True)
    crown(P, out)
    brim(P, out)
    star(P, out)
    json.dump(P, open(f'{out}/knit_params.json', 'w'), indent=1)
    print('wrote', out)


if __name__ == '__main__':
    main()
