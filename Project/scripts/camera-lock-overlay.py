#!/usr/bin/env python3
"""50 % overlay of the Blender camera-lock render (tools/blender/camera_lock_05.py) on the approved reference.

    python3 -I scripts/camera-lock-overlay.py [DIR]      (default qa/pilot05/wave6/camera_lock)

Writes DIR/camera_lock_overlay.png: reference at 50 % under the Blender layout render from the locked game
camera (river vertex colours: cyan core / pink bands of the GAME geometry), plus the reference coin
back-projections (gold) and the game coin anchors (cyan) from the marker pass, the reference VP (white
cross) and the game axis VP (cyan cross). The reference file is only read.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw

d = Path(sys.argv[1] if len(sys.argv) > 1 else "qa/pilot05/wave6/camera_lock")
ref = Image.open("references/05_flow_into_the_current.png").convert("RGBA")
lay = Image.open(d / "camera_lock_render.png").convert("RGBA").resize(ref.size)
mk = Image.open(d / "camera_lock_markers.png").convert("RGBA").resize(ref.size)
lm = json.loads((d / "landmarks.json").read_text())

base = Image.blend(ref, Image.new("RGBA", ref.size, (0, 0, 0, 255)), 0.5)
lay_a = lay.copy()
lay_a.putalpha(lay.getchannel("A").point(lambda v: int(v * 0.5)))
out = Image.alpha_composite(base, lay_a)
# markers: only the small spheres (object-colour pass), fully opaque where they are gold/cyan
px = mk.load()
w, h = mk.size
mask = Image.new("L", mk.size, 0)
mp = mask.load()
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if a > 0 and ((r > 200 and g > 150 and b < 90) or (r < 80 and g > 180 and b > 200)):
            mp[x, y] = 255
out.paste(mk, (0, 0), mask)
dr = ImageDraw.Draw(out)
vr = lm["vp"]["ref"]
vg = lm["vp"]["gameAxisProjected"]
for (x, y), col in (((vr["x"], vr["y"]), (255, 255, 255, 255)), ((vg[0], vg[1]), (0, 230, 255, 255))):
    dr.line([(x - 14, y), (x + 14, y)], fill=col, width=3)
    dr.line([(x, y - 14), (x, y + 14)], fill=col, width=3)
for p in lm["coins"]["pairs"]:
    rx, ry, _ = p["ref"]
    dr.ellipse([rx - 5, ry - 5, rx + 5, ry + 5], outline=(255, 255, 255, 255), width=2)
    if p.get("game"):
        gx, gy, _ = p["game"]
        dr.line([(rx, ry), (gx, gy)], fill=(255, 255, 255, 200), width=2)
dr.rectangle([230, 767, 612, 1185], outline=(255, 255, 255, 180), width=2)
out.convert("RGB").save(d / "camera_lock_overlay.png")
print(d / "camera_lock_overlay.png")
