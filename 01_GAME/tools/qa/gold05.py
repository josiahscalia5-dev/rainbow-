import sys
import numpy as np
from PIL import Image
def stats(label, p):
    a = np.asarray(Image.open(p).convert("RGB").resize((864, 1536))).astype(np.float32)[150:700]
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    gold = (r > 160) & (r - b > 70) & (g > 45)
    px = a[gold]; mx = px.max(1); mn = px.min(1); sat = (mx - mn) / (mx + 1e-6); v = mx / 255
    hi = ((v > 0.95) & (sat < 0.35)).mean() * 100
    print(f"{label:9} gold px {gold.mean()*100:5.1f} % | mean RGB {px.mean(0).round(0)} | G/R {np.median(px[:,1]/(px[:,0]+1e-6)):.2f} | "
          f"V p10/p50 {np.percentile(v,10):.2f}/{np.median(v):.2f} | sat {np.median(sat):.2f} | highlights {hi:.1f} %")
for spec in sys.argv[1:]:
    l, p = spec.split("=", 1); stats(l, p)
