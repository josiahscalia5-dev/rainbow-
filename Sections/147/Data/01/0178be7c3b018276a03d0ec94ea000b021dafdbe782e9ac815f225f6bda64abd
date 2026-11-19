"""Shared helpers for the Screen 05 Marble feasibility test (read-only on the Marble assets)."""
import numpy as np

def load_ply(path, min_alpha=0.0):
    raw = open(path, "rb").read()
    he = raw.index(b"end_header\n") + len(b"end_header\n")
    hdr = raw[:he].decode()
    n = int([l for l in hdr.splitlines() if l.startswith("element vertex")][0].split()[-1])
    props = [l.split()[-1] for l in hdr.splitlines() if l.startswith("property")]
    a = np.frombuffer(raw, dtype="<f4", offset=he, count=n * len(props)).reshape(n, len(props))
    P = {k: a[:, i].astype(np.float64) for i, k in enumerate(props)}
    xyz = np.stack([P["x"], P["y"], P["z"]], 1)
    rgb = np.clip(0.5 + 0.28209479 * np.stack([P["f_dc_0"], P["f_dc_1"], P["f_dc_2"]], 1), 0, 1)
    alpha = 1 / (1 + np.exp(-P["opacity"]))
    scale = np.exp(np.stack([P["scale_0"], P["scale_1"], P["scale_2"]], 1))
    keep = alpha > min_alpha
    return dict(xyz=xyz[keep], rgb=rgb[keep], alpha=alpha[keep], scale=scale[keep], n_total=n)

def project(xyz, f, cx, cy):
    """OpenCV pinhole at the origin, +z forward, +y down (Marble PLY frame)."""
    z = xyz[:, 2]
    u = f * xyz[:, 0] / z + cx
    v = f * xyz[:, 1] / z + cy
    return u, v, z

def zbuffer(xyz, rgb, f, cx, cy, W, H, extra=None):
    """Nearest-point image (point render) + depth; extra = per-point values carried along."""
    u, v, z = project(xyz, f, cx, cy)
    m = (z > 0.05) & (u >= 0) & (u < W) & (v >= 0) & (v < H)
    ui, vi, zz = u[m].astype(int), v[m].astype(int), z[m]
    idx = vi * W + ui
    order = np.lexsort((zz, idx))  # by pixel, then depth
    idx_s = idx[order]
    first = np.ones(len(idx_s), bool); first[1:] = idx_s[1:] != idx_s[:-1]
    sel = np.nonzero(m)[0][order[first]]
    pix = idx_s[first]
    img = np.zeros((H * W, 3)); dep = np.full(H * W, np.nan); cov = np.zeros(H * W, bool)
    img[pix] = rgb[sel]; dep[pix] = xyz[sel, 2]; cov[pix] = True
    out = dict(img=img.reshape(H, W, 3), depth=dep.reshape(H, W), cov=cov.reshape(H, W), sel=sel, pix=pix)
    if extra is not None:
        e = np.full(H * W, -1); e[pix] = extra[sel]; out["extra"] = e.reshape(H, W)
    return out
