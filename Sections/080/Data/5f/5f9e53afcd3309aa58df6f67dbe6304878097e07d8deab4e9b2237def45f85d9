"""Screen 05 bubbles audit (foam-bubbles-particles, `bub05`): for each of the 30 APPROVED bubbles
(qa/pilot05/full_reference_match/masks/bubbles_approved.json, {x, y, r} in approved pixels) compare the approved picture
with a real game capture inside the bubble disk (r + 2 px): mean |dRGB|, share within 20 levels, signed RGB, and the
same numbers for a ring just outside the disk (what surrounds it). Also writes a contact sheet approved | game per bubble.
usage: python3 -I tools/splash05/bubble_audit.py <capture.png> <out_prefix> [--sheet]
  -> <out_prefix>bubbles_audit.json (+ <out_prefix>bubbles_sheet.png)"""
import json, sys
import numpy as np
from PIL import Image, ImageDraw
M = "qa/pilot05/full_reference_match/masks"
cap, pre = sys.argv[1], sys.argv[2]
ap = np.asarray(Image.open("references/05_flow_into_the_current.png").convert("RGB"), float)
c = np.asarray(Image.open(cap).convert("RGB"), float)
idx = np.asarray(Image.open(f"{M}/region_index.png"))
names = {v["id"]: k for k, v in json.load(open(f"{M}/regions.json"))["regions"].items()}
B = json.load(open(f"{M}/bubbles_approved.json"))
H, W = ap.shape[:2]
yy, xx = np.mgrid[0:H, 0:W]
bm = np.asarray(Image.open(f"{M}/bubbles.png").convert("L")) > 127
d = np.abs(c - ap).mean(-1)
out = []
for i, b in enumerate(B):
    rr = np.hypot(xx - b["x"], yy - b["y"])
    disk = rr <= b["r"] + 2
    ring = (rr > b["r"] + 3) & (rr <= b["r"] + 8)
    lum = lambda im, m: float((im[m] @ [0.2126, 0.7152, 0.0722]).mean())
    # what region is under the bubble's surroundings (approved index outside the bubble mask)
    sur = idx[ring & ~bm]
    reg = names.get(int(np.bincount(sur).argmax()), "?") if sur.size else "?"
    out.append(dict(i=i, x=b["x"], y=b["y"], r=b["r"], px=int(disk.sum()), mean_abs=round(float(d[disk].mean()), 2),
                    within_20=round(float((d[disk] <= 20).mean()), 3), signed=[round(float(v), 1) for v in (c[disk] - ap[disk]).mean(0)],
                    lum_app=round(lum(ap, disk), 1), lum_game=round(lum(c, disk), 1),
                    ring_mean_abs=round(float(d[ring].mean()), 2), surround=reg))
json.dump(out, open(pre + "bubbles_audit.json", "w"), indent=1)
for o in sorted(out, key=lambda o: -o["mean_abs"] * o["px"]):
    print(f"#{o['i']:2d} ({o['x']:3d},{o['y']:4d}) r{o['r']:2d} px {o['px']:5d} mean {o['mean_abs']:6.2f} <=20 {o['within_20']:.2f} signed {o['signed']} lum A {o['lum_app']:5.1f} G {o['lum_game']:5.1f} ring {o['ring_mean_abs']:5.1f} on {o['surround']}")
tot = sum(o["px"] for o in out)
print("disks px", tot, "weighted mean", round(sum(o["mean_abs"] * o["px"] for o in out) / tot, 2))
if "--sheet" in sys.argv:
    S = 96
    cols = 6
    sheet = Image.new("RGB", (cols * (2 * S + 8), ((len(B) + cols - 1) // cols) * (S + 16)), (0, 0, 0))
    dr = ImageDraw.Draw(sheet)
    for i, b in enumerate(B):
        h = max(18, int(b["r"] * 1.8))
        box = (b["x"] - h, b["y"] - h, b["x"] + h, b["y"] + h)
        a = Image.fromarray(ap.astype(np.uint8)).crop(box).resize((S, S), Image.NEAREST)
        g = Image.fromarray(c.astype(np.uint8)).crop(box).resize((S, S), Image.NEAREST)
        X, Y = (i % cols) * (2 * S + 8), (i // cols) * (S + 16)
        sheet.paste(a, (X, Y + 14)); sheet.paste(g, (X + S, Y + 14))
        dr.text((X + 2, Y + 1), f"#{i} r{b['r']} {out[i]['mean_abs']:.0f}", fill=(255, 255, 255))
    sheet.save(pre + "bubbles_sheet.png")
