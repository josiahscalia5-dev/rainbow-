"""Screen 05 env05 — geometry check WITHOUT a capture: the probe id buffer (scripts/proj05-tunnel-probe.mjs →
tunnel_id.f32: which tunnel surface the locked camera sees per pixel) against the approved region masks
(qa/pilot05/full_reference_match/masks/region_index.png). Prints, per approved tunnel region, which game surface covers it
(the SILHOUETTE agreement: a camera-projection bake can only be right where the game shows the same kind of surface) and
writes a picture: game surface classes as flat colours, the approved gold / fittings outlines drawn on top.
usage: python3 -I tools/env05/idviz.py <tunnel_id.f32> <out.png> [approved-underlay 0..1]"""
import json, sys
import numpy as np
from PIL import Image
from scipy.ndimage import binary_erosion

W, H = 864, 1536
M = "qa/pilot05/full_reference_match/masks"
idf, outp = sys.argv[1], sys.argv[2]
a = np.fromfile(idf, np.float32).reshape(H, W, 4)
tag = np.where(a[..., 3] >= 10, np.round(a[..., 3]).astype(int), 0)
cls = np.where(tag > 0, np.round(a[..., 2]).astype(int), 0)
idx = np.asarray(Image.open(f"{M}/region_index.png"))
reg = json.load(open(f"{M}/regions.json"))["regions"]
rid = {k: v["id"] for k, v in reg.items()}
ap = np.asarray(Image.open("references/05_flow_into_the_current.png").convert("RGB"), float)

names = {0: "other", 1: "wall", 2: "farwall", 3: "ring", 4: "farring", 5: "lid", 6: "farlid"}
kind = {"purple_walls": (1, 2), "gold_rings_and_front_frame": (3, 4), "distant_tunnel_and_glow": (1, 2, 3, 4), "side_fittings": (5, 6)}
print(f"{'approved region':28s} {'px':>7s}  same kind  | game shows: " + "  ".join(f"{n:>7s}" for n in names.values()))
tot_ok = tot = 0
for k, kinds in kind.items():
    m = idx == rid[k]
    cnt = [int((m & (cls == c)).sum()) for c in names]
    ok = sum(cnt[c] for c in kinds)
    if k != "side_fittings": tot_ok += ok; tot += int(m.sum())
    print(f"{k:28s} {int(m.sum()):7d}  {ok / m.sum():8.3f}   |             " + "  ".join(f"{c:7d}" for c in cnt))
print(f"walls + gold + distant: same kind {tot_ok / tot:.4f}")
# the reverse: game tunnel surface on approved NON-tunnel pixels (water, foam, bubbles … must not be covered)
for k in ("water", "foam_banks", "bubbles", "wake_splash", "coins", "benny_and_hat"):
    m = idx == rid[k]
    print(f"   game tunnel surface over approved {k:14s}: wall {int((m & ((cls == 1) | (cls == 2))).sum()):6d}  ring {int((m & ((cls == 3) | (cls == 4))).sum()):6d}  (of {int(m.sum())})")

col = {0: (40, 40, 40), 1: (150, 60, 200), 2: (95, 40, 150), 3: (250, 190, 40), 4: (240, 130, 30), 5: (60, 220, 120), 6: (40, 170, 90)}
img = np.zeros((H, W, 3), float)
for c, rgb in col.items(): img[cls == c] = rgb
# per ring instance: alternate brightness so neighbouring rings can be told apart
for t in np.unique(tag[(cls == 3) | (cls == 4)]):
    if t % 2: img[((cls == 3) | (cls == 4)) & (tag == t)] *= 0.82
under = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
img[cls == 0] = ap[cls == 0] * 0.55
if under > 0: img = img * (1 - under) + ap * under
for k, rgb in (("gold_rings_and_front_frame", (255, 255, 255)), ("side_fittings", (0, 255, 255)), ("distant_tunnel_and_glow", (255, 0, 0))):
    m = idx == rid[k]
    edge = m & ~binary_erosion(m, iterations=1)
    img[edge] = rgb
Image.fromarray(img.clip(0, 255).astype(np.uint8)).save(outp)
