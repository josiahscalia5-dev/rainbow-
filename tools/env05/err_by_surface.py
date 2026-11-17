"""Screen 05 env05: where does the tunnel error come from? Per approved region (masks/region_index.png), split the
pixels by the surface the GAME shows there (probe id buffer tunnel_id.f32 from scripts/proj05-tunnel-probe.mjs) and
report mean |dRGB| per (region, game surface).
usage: python3 -I tools/env05/err_by_surface.py <capture.png> <tunnel_id.f32>"""
import json, sys
import numpy as np
from PIL import Image
M = "qa/pilot05/full_reference_match/masks"
cap, idf = sys.argv[1], sys.argv[2]
ap = np.asarray(Image.open("references/05_flow_into_the_current.png").convert("RGB"), float)
c = np.asarray(Image.open(cap).convert("RGB"), float)
d = np.abs(c - ap).mean(-1)
idx = np.asarray(Image.open(f"{M}/region_index.png"))
names = {v["id"]: k for k, v in json.load(open(f"{M}/regions.json"))["regions"].items()}
a = np.fromfile(idf, np.float32).reshape(1536, 864, 4)
tag = np.where(a[..., 3] >= 10, np.round(a[..., 3]).astype(int), 0)
cls = np.where(tag > 0, np.round(a[..., 2]).astype(int), 0)
surf = np.full(cls.shape, "other", object)
surf[cls == 1] = "wall"; surf[cls == 2] = "farwall"
surf[(cls == 3) & (tag == 21)] = "ring@12u"; surf[(cls == 3) & (tag == 22)] = "ringA"; surf[(cls == 3) & (tag == 23)] = "ringB"
for i in range(5): surf[(cls == 4) & (tag == 20 + i)] = f"far{i}"
for rid in sorted(names):
    nm = names[rid]
    if nm not in ("purple_walls", "gold_rings_and_front_frame", "side_fittings", "distant_tunnel_and_glow"): continue
    m = idx == rid
    print(f"== {nm}: {m.sum()} px, mean {d[m].mean():.1f}")
    for s in sorted(set(surf[m])):
        k = m & (surf == s)
        print(f"   game shows {s:9s} {k.sum():7d} px  mean {d[k].mean():6.1f}  share of region error {d[k].sum() / d[m].sum():.3f}")
