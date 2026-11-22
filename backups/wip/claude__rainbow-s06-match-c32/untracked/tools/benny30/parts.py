"""r30 benny06: Benny-box share vs the approved 06 picture + part extents from a sweep mask capture.
Box x200-700, y600-1260 of the 864x1536 frame; share of pixels whose max channel |dRGB| <= 20 (reproduces the lead's 49.4 % BEFORE v2).
usage: python3 -I parts.py <capture.png> ...   (a sibling <name>_mask.png, if present, gives the part extents; runtime.ts mask colours)"""
import sys, os, numpy as np
from PIL import Image
A = np.asarray(Image.open('/home/user/rainbow-/references/06_crest_the_rinse_arch.png').convert('RGB'), float)
def box(p):
    C = np.asarray(Image.open(p).convert('RGB').resize((864, 1536)), float)
    d = np.abs(A - C).max(-1)
    return 100 * (d[600:1260, 200:700] <= 20).mean(), np.abs(A - C).mean(-1)[600:1260, 200:700].mean()
def parts(m):
    R, G, B = m[..., 0], m[..., 1], m[..., 2]
    return dict(body=(R > 150) & (G < 60) & (B < 60), pom=(G > 150) & (R < 60) & (B < 60), cuff=(B > 150) & (R < 60) & (G < 60),
                crown=(R < 60) & (G > 150) & (B > 150), star=(m.max(-1) < 40))
for p in sys.argv[1:]:
    if p.endswith('_mask.png'): continue
    s, md = box(p)
    print(f"== {os.path.basename(p)}: benny-box {s:5.1f}%  mean|d| {md:4.1f}")
    mp = p[:-4] + '_mask.png'
    if not os.path.exists(mp): continue
    m = np.asarray(Image.open(mp).convert('RGB')).astype(int)
    C = np.asarray(Image.open(p).convert('RGB')).astype(int)
    chg = np.abs(m - C).max(-1) > 40
    P = {k: v & chg for k, v in parts(m).items()}
    allm = np.zeros(chg.shape, bool)
    for k, v in P.items():
        ys, xs = np.nonzero(v)
        if len(xs) < 50: continue
        allm |= v
        print(f"   {k:6s} x {xs.min()}-{xs.max()} (w {xs.max()-xs.min()}) y {ys.min()}-{ys.max()} n {len(xs)}")
    ys, xs = np.nonzero(allm)
    top, bot = ys.min(), ys.max()
    cx = int(np.median(np.nonzero(P['cuff'])[1])) if P['cuff'].any() else int(xs.mean())
    cb = np.nonzero(P['cuff'][:, cx] | P['crown'][:, cx])[0]
    if len(cb):
        print(f"   ALL x {xs.min()}-{xs.max()} (w {xs.max()-xs.min()}) y {top}-{bot};  cuff bottom @x{cx}: y {cb.max()} -> {100*(cb.max()-top)/(bot-top):.0f}% of height")
    rows = []
    for f in (0.6, 0.7, 0.8, 0.9, 0.97):
        y = int(top + f * (bot - top)); xs2 = np.nonzero(P['body'][y])[0]
        rows.append(f"{f:.2f}:{xs2.max()-xs2.min() if len(xs2) else 0}")
    hw = (np.nonzero((P['cuff'] | P['crown']).any(0))[0])
    bw = np.nonzero(P['body'].any(0))[0]
    print(f"   hat width {hw.max()-hw.min() if len(hw) else 0}  body width {bw.max()-bw.min()}  body widths at height-frac " + ' '.join(rows))
