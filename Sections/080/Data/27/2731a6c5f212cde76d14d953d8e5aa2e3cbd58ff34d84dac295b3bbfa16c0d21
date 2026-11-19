"""Screen 05 HUD (hud05): split the HUD + text region error (mask hud_and_text, tools/match05) into its parts, so a change
can be judged per element. Parts (approved frame px): bar pill (x 33-825, y 13-100, round ends) split into the four icon
boxes, the two number boxes, the rim (within 4 px of the pill edge) and the fill; banner pill (x 120-746, y 113-181)
split into text box, rim (within 5 px of the edge) and fill; 'outside' = HUD-mask pixels outside both pills (the 3-D
scene around the HUD, not the HUD itself).
usage (repo root): python3 -I qa/pilot05/full_reference_match/hud/hud_split.py <capture.png> [<capture2.png> ...]"""
import sys
import numpy as np
from PIL import Image

AP = np.asarray(Image.open("references/05_flow_into_the_current.png").convert("RGB"), float)
MASK = np.asarray(Image.open("qa/pilot05/full_reference_match/masks/hud_and_text.png").convert("L")) > 127
H, W = MASK.shape
yy, xx = np.mgrid[0:H, 0:W] + 0.5


def pill_sd(x0, y0, x1, y1):
    """signed distance (px) to a full-round pill: < 0 inside"""
    r = (y1 - y0) / 2
    cy = (y0 + y1) / 2
    cx = np.clip(xx, x0 + r, x1 - r)
    return np.hypot(xx - cx, yy - cy) - r


def box(x0, y0, x1, y1):
    return (xx >= x0) & (xx < x1) & (yy >= y0) & (yy < y1)


bar_sd = pill_sd(33, 13, 825, 100)
ban_sd = pill_sd(120, 113, 746, 181)
bar = (bar_sd < 0) & MASK
ban = (ban_sd < 0) & MASK
icons = {"heart": box(60, 21, 154, 95), "plus": box(254, 28, 310, 77), "coin": box(375, 13, 465, 102), "pause": box(727, 9, 823, 105)}
nums = {"num 5/5": box(160, 30, 242, 74), "num counter": box(494, 30, 622, 74)}
parts = {}
used = np.zeros_like(MASK)
for k, m in {**icons, **nums}.items():
    parts[k] = bar & m & ~used
    used |= parts[k]
parts["bar rim"] = bar & (bar_sd > -4) & ~used
used |= parts["bar rim"]
parts["bar fill"] = bar & ~used
tb = box(140, 126, 730, 168)
parts["banner text"] = ban & tb & (ban_sd < -5)
parts["banner rim"] = ban & (ban_sd >= -5)
parts["banner fill"] = ban & ~parts["banner text"] & ~parts["banner rim"]
parts["outside (scene)"] = MASK & ~bar & ~ban

for cap in sys.argv[1:]:
    c = np.asarray(Image.open(cap).convert("RGB"), float)
    d = np.abs(c - AP).mean(-1)
    tot = d[MASK].sum()
    print(f"{cap}: HUD mask mean {d[MASK].mean():.2f}, within 20 {100 * (d[MASK] <= 20).mean():.1f} %")
    for k, m in parts.items():
        if m.sum():
            print(f"  {k:16s} px {int(m.sum()):6d}  mean {d[m].mean():6.2f}  share of HUD error {100 * d[m].sum() / tot:5.1f} %  signed {np.round((c[m] - AP[m]).mean(0), 1)}")
