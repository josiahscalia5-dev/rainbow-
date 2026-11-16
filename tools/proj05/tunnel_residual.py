"""Screen 05 walls + rings bake, step 3 — colour feedback: what the game shows (a locked capture with `?projwall05=1`
and / or `?projring05=1`) minus what the baked texture asked for, per texel, so the next bake can pre-compensate the
part of the post chain the shader cannot undo (bloom spill).
usage: python3 -I tools/proj05/tunnel_residual.py <capture.png> <tunnel_coords[_all].f32> <assets_dir> <out correction.npz> [gain]
The coordinates come from scripts/proj05-tunnel-probe.mjs --coords (the shaders' own texture coordinates per pixel).
Writes / updates correction.npz {wall, ring}: additive corrections in texture space (smoothed; 0 where never seen)."""
import os, sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, map_coordinates

cap_p, co_p, assets, out_p = sys.argv[1:5]
gain = float(sys.argv[5]) if len(sys.argv) > 5 else 0.8
a = np.fromfile(co_p, dtype=np.float32).reshape(1536, 864, 4)
cap = np.asarray(Image.open(cap_p).convert("RGB")).astype(np.float32)
prev = dict(np.load(out_p)) if os.path.exists(out_p) else {}
res = {}
for name, fn, code, alpha in (("wall", "wall05.png", 7, 77), ("ring", "ring05.png", 8, 78)):
    tex = np.asarray(Image.open(os.path.join(assets, fn)).convert("RGB")).astype(np.float32)
    h, w = tex.shape[:2]
    m = (np.abs(a[..., 2] - code) < 1e-3) & (np.abs(a[..., 3] - alpha) < 1e-3)
    m[:204, :] = False                       # the HUD bar and the title are drawn over the canvas: not the tunnel's colour
    corr = prev.get(name, np.zeros_like(tex))
    if m.sum() < 100:
        res[name] = corr; print(name, "not in this capture"); continue
    u = a[..., 0][m] * w - 0.5; v = a[..., 1][m] * h - 0.5
    t = np.stack([map_coordinates(tex[..., c], [v, u], order=1, mode="grid-wrap") for c in range(3)], -1)
    d = cap[m] - t
    print(name, "px", int(m.sum()), "mean diff RGB", d.mean(0).round(2), "mean abs", float(np.abs(d).mean().round(2)), "within 10:", float((np.abs(d).mean(1) < 10).mean().round(3)))
    # splat the residual into texture space (nearest texel), then a normalised blur
    xi = np.clip(np.round(u).astype(int) % w, 0, w - 1); yi = np.clip(np.round(v).astype(int), 0, h - 1)
    acc = np.zeros_like(tex); cnt = np.zeros((h, w), np.float32)
    np.add.at(acc, (yi, xi), d); np.add.at(cnt, (yi, xi), 1)
    sig = (2.0, 4.0)
    num = np.stack([gaussian_filter(acc[..., c], sig, mode=("nearest", "wrap")) for c in range(3)], -1)
    den = gaussian_filter(cnt, sig, mode=("nearest", "wrap"))
    step = np.where(den[..., None] > 0.05, num / np.maximum(den, 1e-4)[..., None], 0.0)
    # far outside the seen area: fade the correction out smoothly
    seen = gaussian_filter((cnt > 0).astype(np.float32), (4.0, 12.0), mode=("nearest", "wrap"))
    step *= np.clip(seen * 3.0, 0, 1)[..., None]
    res[name] = corr - gain * step
np.savez_compressed(out_p, **res)
