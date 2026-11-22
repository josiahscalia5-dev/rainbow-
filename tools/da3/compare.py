"""Compare Depth Anything 3 depth of each APPROVED picture with the game's true depth at that screen's approved viewpoint.
Usage: compare.py SCRATCH MODEL[,MODEL...]   (reads SCRATCH/gameNN/{depth.f32,dyn_mask.pgm,camera.json}, SCRATCH/out/<model>/NN.npz)
Writes SCRATCH/report/NN_*.png (separate full-size pictures) and SCRATCH/report/metrics.json."""
import sys, json, math, shutil
import numpy as np, cv2
from scipy.stats import spearmanr

S, MODELS = sys.argv[1], sys.argv[2].split(',')
W, H = 864, 1536
REPO = '/home/user/rainbow-'
REFS = {'04': '04_through_the_five_arrows', '05': '05_flow_into_the_current', '06': '06_crest_the_rinse_arch',
        '07': '07_dive_the_washer_tube', '08': '08_final_spin_chamber'}
OUT = f'{S}/report'
import os; os.makedirs(OUT, exist_ok=True)


def read_pgm(p):
    b = open(p, 'rb').read()
    parts = b.split(maxsplit=4)  # P5 W H MAX data
    return np.frombuffer(parts[4][:W * H], np.uint8).reshape(H, W)


def colour(logd, lo, hi, mask):
    x = np.clip((logd - lo) / max(hi - lo, 1e-6), 0, 1)
    img = cv2.applyColorMap((255 - x * 255).astype(np.uint8), cv2.COLORMAP_TURBO)  # near = red, far = blue
    img[~mask] = 0
    return img


res = {}
for nn, ref in REFS.items():
    g = np.fromfile(f'{S}/game{nn}/depth.f32', np.float32).reshape(H, W)
    cam = json.load(open(f'{S}/game{nn}/camera.json'))
    dyn = read_pgm(f'{S}/game{nn}/dyn_mask.pgm') > 127
    rows = np.arange(H)[:, None] * np.ones((1, W))
    valid = (g > 0) & np.isfinite(g) & (g < 1000) & ~dyn & (rows > 190)  # below the HUD banner, no Benny / coins
    shutil.copy(f'{REPO}/references/{ref}.png', f'{OUT}/{nn}_1_APPROVED.png')
    lg = np.log(np.where(valid, g, 1))
    lo, hi = np.percentile(lg[valid], [1, 99])
    cv2.imwrite(f'{OUT}/{nn}_2_GAME_depth_at_approved_view.png', colour(lg, lo, hi, valid))
    r = {'game_fov_v_deg': cam['fov'], 'valid_px': int(valid.sum())}
    for m in MODELS:
        z = np.load(f'{S}/out/{m}/{nn}.npz')
        d = cv2.resize(z['depth'], (W, H), interpolation=cv2.INTER_LINEAR)
        mk = valid & np.isfinite(d) & (d > 0)
        # best of: scale-only in log depth, or affine in inverse depth (relative-depth models)
        sc = np.exp(np.median(np.log(g[mk]) - np.log(d[mk])))
        a1 = d * sc
        A = np.stack([1 / d[mk], np.ones(mk.sum())], 1)
        coef, *_ = np.linalg.lstsq(A, 1 / g[mk], rcond=None)
        inv = coef[0] / np.maximum(d, 1e-6) + coef[1]
        a2 = np.where(inv > 1e-6, 1 / np.maximum(inv, 1e-6), np.nan)
        def score(a):
            e = a[mk]; t = g[mk]; ok = np.isfinite(e)
            absrel = float(np.mean(np.abs(e[ok] - t[ok]) / t[ok]))
            ratio = np.maximum(e[ok] / t[ok], t[ok] / e[ok])
            return absrel, float(np.mean(ratio < 1.25)), float(np.mean(ok))
        s1, s2 = score(a1), score(a2)
        best, how = (a1, 'scale') if s1[0] <= s2[0] else (a2, 'affine-inverse')
        absrel, d125, okf = min(s1, s2, key=lambda s: s[0])
        idx = np.flatnonzero(mk); idx = idx[:: max(1, idx.size // 60000)]
        rho = float(spearmanr(g.ravel()[idx], d.ravel()[idx]).correlation)
        mr = {'align': how, 'absrel': round(absrel, 3), 'within_1.25x': round(d125, 3), 'spearman': round(rho, 3),
              'seconds': round(float(z['seconds']), 1)}
        if 'intrinsics' in z.files:
            hp = z['depth'].shape[0]; fy = float(z['intrinsics'][1, 1])
            mr['da3_fov_v_deg'] = round(math.degrees(2 * math.atan(hp / 2 / fy)), 1)
        bm = mk & np.isfinite(best)
        cv2.imwrite(f'{OUT}/{nn}_3_DA3_{m}_depth.png', colour(np.log(np.where(bm, best, 1)), lo, hi, bm))
        # error: ratio aligned/game; white = agree, red = DA3 nearer, blue = DA3 farther (±2x saturates)
        lr = np.clip(np.log2(np.where(bm, best / g, 1)), -1, 1)
        err = np.full((H, W, 3), 255, np.uint8)
        err[..., 2] = np.where(lr < 0, 255, (255 * (1 - lr)).astype(np.uint8))   # R
        err[..., 1] = (255 * (1 - np.abs(lr))).astype(np.uint8)                   # G
        err[..., 0] = np.where(lr > 0, 255, (255 * (1 + lr)).astype(np.uint8))   # B
        err[~bm] = 0
        cv2.imwrite(f'{OUT}/{nn}_4_DA3_{m}_disagreement.png', err)
        r[m] = mr
    res[nn] = r
    print(nn, json.dumps(r))
json.dump(res, open(f'{OUT}/metrics.json', 'w'), indent=1)
