#!/usr/bin/env python3
"""Screen 05: measure the projected gold rings (centre, radius, band thickness) in the approved image and in live
captures, by fitting circles to the gold pixels of each ring's upper arc.

    python3 -I tools/qa/ring_fit05.py OUT_DIR LABEL=image[:guessfile] ...

A circle (cx, cy, r) is scored by the share of gold pixels on its arc above its own centre line (HUD bar, title
banner and everything outside the frame are skipped). Each ring starts from a rough guess and is refined by an
exhaustive local search; the radius reported is the middle of the gold band, `thick` its radial thickness.
Writes OUT_DIR/rings.json, rings.md and one overlay PNG per image (fitted circles drawn on the picture) so the
fit can be checked by eye. Raw geometry only — not a fidelity score.
"""
import json, math, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

W, H = 864, 1536
GUESS = {
    # rough starting circles (cx, cy, r, search half-ranges dx, dy, dr)
    'ref': {'A': (455, 535, 499, 45, 70, 60), 'B': (465, 455, 245, 30, 40, 30), 'C': (478, 453, 150, 20, 25, 20),
            'D': (490, 460, 96, 14, 18, 14), 'E': (495, 464, 62, 10, 12, 9), 'F': (497, 466, 42, 8, 9, 6)},
    'live': {'A': (512, 480, 370, 40, 50, 40), 'B': (505, 478, 232, 30, 35, 28), 'C': (500, 475, 160, 20, 22, 20),
             'D': (500, 472, 96, 14, 16, 14), 'E': (500, 471, 58, 10, 12, 9), 'F': (500, 470, 41, 8, 9, 6)},
}

def gold_mask(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return (r > 160) & (r - b > 70) & (g > 45)

def arc_points(cx, cy, r, n=220):
    th = np.linspace(math.radians(8), math.radians(172), n)
    x = cx + r * np.cos(th); y = cy - r * np.sin(th)
    ok = (x >= 0) & (x < W) & (y >= 112) & (y < H) & ~((x > 112) & (x < 752) & (y > 114) & (y < 188))
    return x[ok].astype(int), y[ok].astype(int)

def score(m, cx, cy, r):
    x, y = arc_points(cx, cy, r)
    if len(x) < 30: return 0.0
    return float(m[y, x].mean())

def fit(m, g):
    cx0, cy0, r0, dx, dy, dr = g
    best = (-1, cx0, cy0, r0)
    for step in (4, 1):
        _, bx, by, br = best
        if step == 4: rx, ry, rr = range(-dx, dx + 1, 4), range(-dy, dy + 1, 4), range(-dr, dr + 1, 3)
        else: rx, ry, rr = range(-4, 5), range(-4, 5), range(-3, 4)
        for ox in rx:
            for oy in ry:
                for orr in rr:
                    cx, cy, r = bx + ox, by + oy, br + orr
                    s = (score(m, cx, cy, r - 2) + score(m, cx, cy, r) + score(m, cx, cy, r + 2)) / 3
                    if s > best[0]: best = (s, cx, cy, r)
    s, cx, cy, r = best
    # band edges along the radius (score falls below half of the peak)
    prof = {rr: score(m, cx, cy, rr) for rr in range(int(r) - 60, int(r) + 61)}
    pk = max(prof.values()); half = 0.5 * pk
    lo = r
    while lo - 1 in prof and prof[lo - 1] >= half: lo -= 1
    hi = r
    while hi + 1 in prof and prof[hi + 1] >= half: hi += 1
    return {'cx': cx, 'cy': cy, 'r': round((lo + hi) / 2, 1), 'thick': hi - lo + 1, 'gold_share': round(pk, 2)}

def main(argv):
    out = Path(argv[0]); out.mkdir(parents=True, exist_ok=True)
    res = {}
    for spec in argv[1:]:
        label, path = spec.split('=', 1)
        im = Image.open(path).convert('RGB')
        if im.size != (W, H): im = im.resize((W, H), Image.LANCZOS)
        m = gold_mask(np.asarray(im))
        kind = 'ref' if 'references/' in path else 'live'
        guesses = dict(GUESS[kind])
        gfile = out / f'guess_{label}.json'
        if gfile.exists(): guesses.update({k: tuple(v) for k, v in json.loads(gfile.read_text()).items()})
        rings = {k: fit(m, g) for k, g in guesses.items()}
        res[label] = rings
        ov = im.copy(); d = ImageDraw.Draw(ov)
        for k, f in rings.items():
            cx, cy, r = f['cx'], f['cy'], f['r']
            for i in range(0, 360, 2):   # dashed circle
                if (i // 2) % 2: continue
                a0, a1 = math.radians(i), math.radians(i + 2)
                d.line([(cx + r * math.cos(a0), cy - r * math.sin(a0)), (cx + r * math.cos(a1), cy - r * math.sin(a1))], fill=(255, 255, 255), width=3)
                d.line([(cx + r * math.cos(a0), cy - r * math.sin(a0)), (cx + r * math.cos(a1), cy - r * math.sin(a1))], fill=(0, 0, 0), width=1)
            d.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], outline=(255, 255, 255), fill=(0, 0, 0))
            d.text((cx + 6, cy - 6), k, fill=(255, 255, 0))
        ov.crop((0, 0, W, 900)).save(out / f'overlay_{label}.png')
    (out / 'rings.json').write_text(json.dumps(res, indent=1))
    lines = ['| image | ring | centre x | centre y | radius | band thick | radius ÷ next ring | gold share on arc |', '|---|---|---|---|---|---|---|---|']
    for label, rings in res.items():
        ks = list(rings)
        for i, k in enumerate(ks):
            f = rings[k]
            ratio = f"{f['r'] / rings[ks[i + 1]]['r']:.2f}" if i + 1 < len(ks) else '—'
            lines.append(f"| {label} | {k} | {f['cx']} | {f['cy']} | {f['r']} | {f['thick']} | {ratio} | {f['gold_share']} |")
    (out / 'rings.md').write_text('\n'.join(lines) + '\n')
    print('\n'.join(lines))

if __name__ == '__main__':
    main(sys.argv[1:])
