"""Screen 05 — does the water NEAR Benny look like the approved water while riding? While the camera moves, the water
under and around Benny is a different stretch of river than in the approved picture, so a pixel match means nothing;
this compares how the water LOOKS, on the same screen region of every frame and of the approved picture:
  detail    mean |luminance - blur(sigma 2 px)|      — crisp streaks and glints (a pastel blur scores low)
  sat       mean HSV saturation                       — vivid pink / cyan vs washed-out lavender
  pink      share of strongly pink pixels             — the hot-pink ribbons
  cyan      share of strongly cyan pixels             — the electric-blue core
  glint     share of near-white highlight pixels      — the glossy sparkle
Region: the water beside and below Benny (screen rows 900-1460), minus Benny + his splash, the near gold frame and
coin-gold pixels.
usage: python3 -I tools/proj05/near_water_stats.py <frame.png> [...] [--json=OUT]"""
import json, sys
import numpy as np, cv2
from PIL import Image
from scipy.ndimage import gaussian_filter

H, W = 1536, 864
yy, xx = np.mgrid[0:H, 0:W].astype(float)


def arc(cx, cy, r0, r1, t0, t1):
    rr = np.hypot(xx - cx, yy - cy); th = np.degrees(np.arctan2(-(yy - cy), xx - cx))
    return (rr >= r0) & (rr <= r1) & (th >= t0) & (th <= t1)


frame = arc(432, 1060, 440, 700, -170, -10) | arc(432, 2121, 500, 700, 50, 130)       # near gold frame (generous)
benny = (xx > 200) & (xx < 680) & (yy > 760) & (yy < 1310)                              # Benny + splash
region = (yy >= 900) & (yy < 1460) & ~frame & ~benny


def stats(p):
    rgb = np.asarray(Image.open(p).convert("RGB"))
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV_FULL).astype(float)
    a = rgb.astype(float); R, G, B = a[..., 0], a[..., 1], a[..., 2]
    gold = (R > 170) & (G > 110) & (B < 90) & (R > B + 90)                              # coins
    m = region & ~gold
    lum = (a * [0.2126, 0.7152, 0.0722]).sum(-1)
    det = np.abs(lum - gaussian_filter(lum, 2.0))
    pink = (R > 190) & (G < 140) & (B > 120) & (R > G + 80)
    cyan = (B > 190) & (R < 140) & (G > 120)
    glint = (lum > 225)
    return dict(px=int(m.sum()), detail=round(float(det[m].mean()), 2), sat=round(float(hsv[..., 1][m].mean() / 255), 3),
                pink=round(float(pink[m].mean()), 3), cyan=round(float(cyan[m].mean()), 3), glint=round(float(glint[m].mean()), 4))


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    jout = next((a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--json=")), None)
    out = {p: stats(p) for p in args}
    for p, r in out.items():
        print(f"{p[-48:]:48s} detail {r['detail']:5.2f}  sat {r['sat']:.3f}  pink {r['pink']:.3f}  cyan {r['cyan']:.3f}  glint {r['glint']:.4f}  ({r['px']} px)")
    if jout:
        json.dump(out, open(jout, "w"), indent=1)
