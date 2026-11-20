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
from scipy.ndimage import gaussian_filter1d, median_filter

d = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
S_LIP = 0.79
# wall arc per painted ring: ring 1 keeps its own measured arc (= the existing tile, unchanged); rings 0 and 2 use the arc
# read by eye on the (q, psi) unwrap (the warm test cuts ring 0's pink-violet sheen away and ring 2's arc short)
ARC = {0: "-1.68,1.88", 1: "", 2: "-1.68,1.88"}
LW = np.array([0.11, 0.59, 0.3], np.float32)                      # BGR luma


def flatten_lip(full, sft, rt):
    """re-time every column so the dark line just under the bright lip (the painted lip edge) is ONE straight row rt:
    ring 0's lip line still steps up and down by a few rows after the main straightening (kinks on the 3D lip)"""
    ns, nc = full.shape[:2]
    L = cv2.GaussianBlur(full @ LW, (0, 0), sigmaX=3.0, sigmaY=0.8)
    a0, a1 = int(ns * 0.72), int(ns * 0.95)
    rd = a0 + np.argmin(L[a0:a1], 0).astype(np.float32)
    # robust: a wide median along the angle drops the narrow outliers where a bright light column crosses the lip (no dark
    # minimum there); only the broad steps of the lip line (60+ columns) are corrected
    rd = gaussian_filter1d(median_filter(rd, size=61, mode="wrap"), 8, mode="wrap")
    rt = float(np.median(rd)) if rt is None else rt
    print(f"  dark lip edge rows: median {np.median(rd):.1f}, spread {np.percentile(rd, 95) - np.percentile(rd, 5):.1f} -> row {rt:.1f}")
    yt = np.arange(ns, dtype=np.float32)[:, None]
    ys = np.where(yt <= rt, yt / rt * rd[None, :], rd[None, :] + (yt - rt) / (ns - 1 - rt) * (ns - 1 - rd[None, :]))
    xs = np.repeat(np.arange(nc, dtype=np.float32)[None, :], ns, 0)
    return [cv2.remap(t, xs, ys.astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE) for t in (full, sft)]


tiles, soft = {}, {}
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
                acc[K] = t; continue                                    # already on the row: keep the texels as they are
            st = (np.arange(ns) + 0.5) / ns
            src = np.where(st <= S_LIP, st / S_LIP * lip, lip + (st - S_LIP) / (1 - S_LIP) * (1 - lip))
            y = np.clip(src * ns - 0.5, 0, ns - 1)
            y0 = np.floor(y).astype(int); y1 = np.minimum(y0 + 1, ns - 1); w = (y - y0)[:, None, None]
            acc[K] = t[y0] * (1 - w) + t[y1] * w
        print(f"painted ring {K}: lip line s {lip:.3f} -> {S_LIP}")
        ns = tiles[K].shape[0]
        if K == 0:                                                      # only ring 0's lip line steps (rings 1, 2 are clean)
            tiles[K], soft[K] = flatten_lip(tiles[K], soft[K], None)
for name, acc in (("tile_ring_paint_var.png", tiles), ("tile_ring_paint_var_soft.png", soft)):
    at = np.concatenate([acc[0], acc[1], acc[2]], 0)
    cv2.imwrite(os.path.join(d, name), np.clip(at, 0, 255).astype(np.uint8))
    print("wrote", name, at.shape)
