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
    rot = np.stack([P["rot_0"], P["rot_1"], P["rot_2"], P["rot_3"]], 1)  # 3DGS PLY: (w, x, y, z)
    rot /= np.linalg.norm(rot, axis=1, keepdims=True)
    keep = alpha > min_alpha
    return dict(xyz=xyz[keep], rgb=rgb[keep], alpha=alpha[keep], scale=scale[keep], rot=rot[keep], n_total=n)

def cam_rot(yaw_deg, pitch_deg):
    """camera->world rotation of the fitted Marble origin camera (+pitch looks up; y down, z forward)."""
    yaw, pitch = np.radians(yaw_deg), np.radians(pitch_deg)
    cy_, sy_ = np.cos(yaw), np.sin(yaw); cp, sp = np.cos(pitch), np.sin(pitch)
    Ry = np.array([[cy_, 0, sy_], [0, 1, 0], [-sy_, 0, cy_]])
    Rx = np.array([[1, 0, 0], [0, cp, -sp], [0, sp, cp]])
    return Ry @ Rx

def sample_gaussians(S, k, seed=0):
    """k random 3D samples per splat (from its Gaussian), so footprints cover pixels, not only centres."""
    rng = np.random.default_rng(seed)
    w, x, y, z = S["rot"].T
    R = np.stack([
        np.stack([1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)], -1),
        np.stack([2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)], -1),
        np.stack([2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)], -1)], 1)
    out_xyz, out_i = [S["xyz"]], [np.arange(len(S["xyz"]))]
    for _ in range(k - 1):
        e = rng.standard_normal((len(S["xyz"]), 3)) * S["scale"]
        out_xyz.append(S["xyz"] + np.einsum("nij,nj->ni", R, e)); out_i.append(np.arange(len(S["xyz"])))
    return np.concatenate(out_xyz), np.concatenate(out_i)

def composite(cam_xyz, alpha, rgb, f, cx, cy, W, H, a_scale=1.0):
    """Per-pixel front-to-back alpha compositing of point samples (camera frame, +z forward, +y down).
    Returns median depth (transmittance crosses 0.5), colour, accumulated opacity."""
    z = cam_xyz[:, 2]; m = z > 0.03
    u = f * cam_xyz[m, 0] / z[m] + cx; v = f * cam_xyz[m, 1] / z[m] + cy
    ok = (u >= 0) & (u < W) & (v >= 0) & (v < H)
    sel = np.nonzero(m)[0][ok]
    idx = v[ok].astype(int) * W + u[ok].astype(int); zz = z[sel]
    o = np.lexsort((zz, idx)); idx = idx[o]; sel = sel[o]; zz = zz[o]
    a = np.clip(alpha[sel] * a_scale, 0, 0.99)
    la = np.log1p(-a); cs = np.cumsum(la)
    start = np.ones(len(idx), bool); start[1:] = idx[1:] != idx[:-1]
    gstart = np.maximum.accumulate(np.where(start, np.arange(len(idx)), 0))
    base = np.where(gstart > 0, cs[gstart - 1], 0.0)
    T_after = np.exp(cs - base); T_before = T_after / (1 - a)
    wgt = a * T_before
    col = np.zeros((H * W, 3)); np.add.at(col, idx, rgb[sel] * wgt[:, None])
    acc = np.zeros(H * W); np.add.at(acc, idx, wgt)
    # median depth: first sample per pixel whose T_after < 0.5
    cross = (T_after < 0.5) & (T_before >= 0.5)
    dep = np.full(H * W, np.nan); dep[idx[cross]] = zz[cross]
    pid = np.full(H * W, -1); pid[idx[cross]] = sel[cross]
    return dict(depth=dep.reshape(H, W), rgb=(col / np.maximum(acc, 1e-6)[:, None]).reshape(H, W, 3),
                acc=acc.reshape(H, W), pid=pid.reshape(H, W))

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
