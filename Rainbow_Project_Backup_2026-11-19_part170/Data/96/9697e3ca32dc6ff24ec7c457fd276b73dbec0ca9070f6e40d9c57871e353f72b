"""Screen 04 round 17 `&m04rpvar=3`: the user's painted inner rings are not all alike — painted ring 0 (the first inner
ring) carries a pink-violet sheen with blue-violet glints, ring 1 is the plain copper-gold one with yellow light columns
(the only one in tile_ring_paint*.png), ring 2 is copper with pink-violet patches on the left and blue-violet glints.
This straightens ALL three clean painted periods with tools/match04/ring_paint04.py (same method, same bubble fill and
continuation) and stacks them into one atlas, every ring re-timed piecewise-linearly so its bright lip line sits on the
same row (s 0.79, the row the shader puts on the modeled lip). The game then gives every 3D ring one of the painted rings.

  python3 -I tools/match04/ring_paint04_var.py assets/textures/match04
writes tile_ring_paint_var.png and tile_ring_paint_var_soft.png (3 x 160 rows: painted ring 0, 1, 2; 2048 columns psi)."""
import json, os, shutil, subprocess, sys, tempfile
import numpy as np, cv2

d = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
S_LIP = 0.79
# wall arc per painted ring: ring 1 keeps its own measured arc (= the existing tile, unchanged); rings 0 and 2 use the arc
# read by eye on the (q, psi) unwrap (the warm test cuts ring 0's pink-violet sheen away and ring 2's arc short)
ARC = {0: "-1.68,1.88", 1: "", 2: "-1.68,1.88"}
tiles, soft = [], []
with tempfile.TemporaryDirectory() as tmp:
    for K in (0, 1, 2):
        wd = os.path.join(tmp, f"K{K}"); os.makedirs(wd)
        shutil.copy(os.path.join(d, "plate04_hybrid.png"), wd)
        out = subprocess.run([sys.executable, "-I", os.path.join(HERE, "ring_paint04.py"), wd, str(K), "", ARC[K]],
                             check=True, capture_output=True, text=True).stdout
        print(f"--- painted ring {K}\n" + "".join(l + "\n" for l in out.splitlines() if "ring " in l or "arc" in l or "profile" in l))
        lip = json.load(open(os.path.join(wd, "ring_paint04.json")))["s_lip"]
        for name, acc in (("tile_ring_paint.png", tiles), ("tile_ring_paint_soft.png", soft)):
            t = cv2.imread(os.path.join(wd, name)).astype(np.float32)
            ns = t.shape[0]
            if abs(lip - S_LIP) < 0.005:
                acc.append(t); continue                                     # already on the row: keep the texels as they are
            st = (np.arange(ns) + 0.5) / ns
            src = np.where(st <= S_LIP, st / S_LIP * lip, lip + (st - S_LIP) / (1 - S_LIP) * (1 - lip))
            y = np.clip(src * ns - 0.5, 0, ns - 1)
            y0 = np.floor(y).astype(int); y1 = np.minimum(y0 + 1, ns - 1); w = (y - y0)[:, None, None]
            acc.append(t[y0] * (1 - w) + t[y1] * w)
        print(f"painted ring {K}: lip line s {lip:.3f} -> {S_LIP}")
for name, acc in (("tile_ring_paint_var.png", tiles), ("tile_ring_paint_var_soft.png", soft)):
    cv2.imwrite(os.path.join(d, name), np.clip(np.concatenate(acc, 0), 0, 255).astype(np.uint8))
    print("wrote", name, np.concatenate(acc, 0).shape)
