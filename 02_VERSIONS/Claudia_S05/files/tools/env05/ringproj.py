"""Screen 05 env05 — ring projection model (Python replica of the game's 05 gold rings seen from the locked camera).
Camera + ring instances come from scripts/proj05-tunnel-probe.mjs (tunnel.json); the band profile replicates
src/world/tube.ts roundBandGeometry. Screen polar coordinates about O (tools/proj05/tunnel_common.O), image angle
theta (0 = right, counter-clockwise), radius in px of the 864x1536 frame."""
import json, math
import numpy as np

W, H = 864, 1536
O = (497.0, 468.0)


def band_profile(height=0.095, width=0.78, lipHeight=0.045, lipWidth=0.26, groove=0.07, **_):
    """(radial fraction, axial) points of roundBandGeometry (without the 1.03 skirt points)"""
    w = (width + groove + lipWidth) / 2
    yc, a = w - width / 2, width / 2
    yl, al = -w + lipWidth / 2, lipWidth / 2
    pts = [(1.0, w)]
    for i in range(1, 12):
        f = i / 12 * math.pi
        pts.append((1 - height * math.sin(f), yc + a * math.cos(f)))
    pts += [(1.0, yc - a), (1.0 - height * 0.04, yc - a - groove * 0.5), (1.0, yl + al)]
    for i in range(1, 7):
        f = i / 7 * math.pi
        pts.append((1 - lipHeight * math.sin(f), yl + al * math.cos(f)))
    pts.append((1.0, -w))
    return np.array(pts)


def mat4(arr):
    return np.array(arr, float).reshape(4, 4).T          # three.js toArray is column-major


class Cam:
    def __init__(self, tj):
        self.Mw = mat4(tj["camera"]["matrixWorld"]); self.P = mat4(tj["camera"]["projection"])
        self.V = np.linalg.inv(self.Mw)
        self.eye = self.Mw[:3, 3]

    def project(self, X):
        """world points (...,3) -> pixel (...,2), camera depth (...)"""
        Xh = np.concatenate([X, np.ones(X.shape[:-1] + (1,))], -1)
        v = Xh @ self.V.T
        c = v @ self.P.T
        ndc = c[..., :3] / c[..., 3:4]
        px = np.stack([(ndc[..., 0] + 1) / 2 * W, (1 - ndc[..., 1]) / 2 * H], -1)
        return px, -v[..., 2]


def ring_points(M, prof, nphi=720):
    """world points of a band ring with instance matrix M (local XY = ring plane, Z = axis): (nphi, nprof, 3)"""
    phi = np.linspace(0, 2 * math.pi, nphi, endpoint=False)
    rho, z = prof[:, 0], prof[:, 1]
    X = np.stack([rho[None, :] * np.sin(phi)[:, None], -rho[None, :] * np.cos(phi)[:, None], np.broadcast_to(z, (nphi, len(z))), np.ones((nphi, len(z)))], -1)
    return (X @ M.T)[..., :3]


def polar_edges(px, nth=720, origin=O):
    """min / max radius about origin per theta bin of projected points px (..., 2) -> (r_in, r_out) arrays (nan = none)"""
    dx = px[..., 0] - origin[0]; dy = origin[1] - px[..., 1]
    th = (np.degrees(np.arctan2(dy, dx)) % 360.0).ravel(); r = np.hypot(dx, dy).ravel()
    b = np.minimum((th / 360.0 * nth).astype(int), nth - 1)
    rin = np.full(nth, np.inf); rout = np.full(nth, -np.inf)
    np.minimum.at(rin, b, r); np.maximum.at(rout, b, r)
    rin[~np.isfinite(rin)] = np.nan; rout[~np.isfinite(rout)] = np.nan
    return rin, rout


def mask_edges(mask, nth=720, origin=O, rmax=1300.0, dr=0.5):
    """inner / outer radius of a screen mask along rays about origin (first / last hit), nan where the ray misses"""
    th = (np.arange(nth) + 0.5) / nth * 2 * math.pi
    r = np.arange(0, rmax, dr)
    X = origin[0] + r[None, :] * np.cos(th)[:, None]; Y = origin[1] - r[None, :] * np.sin(th)[:, None]
    ok = (X >= 0) & (X <= W - 1) & (Y >= 0) & (Y <= H - 1)
    xi = np.clip(np.round(X).astype(int), 0, W - 1); yi = np.clip(np.round(Y).astype(int), 0, H - 1)
    hit = mask[yi, xi] & ok
    rin = np.full(nth, np.nan); rout = np.full(nth, np.nan)
    anyh = hit.any(1)
    rin[anyh] = r[np.argmax(hit[anyh], 1)]
    rout[anyh] = r[hit.shape[1] - 1 - np.argmax(hit[anyh][:, ::-1], 1)]
    return rin, rout


def approved_edges(model, name, nth=720):
    th = (np.arange(nth) + 0.5) / nth * 2 * math.pi
    def ev(c): return c[0] + c[1] * np.cos(th) + c[2] * np.sin(th) + c[3] * np.cos(2 * th) + c[4] * np.sin(2 * th)
    return ev(model["rings"][name]["in"]), ev(model["rings"][name]["out"])


def circle_fit(th, r, origin=O):
    """least-squares circle through the points (origin + r(theta)) -> cx, cy, R"""
    x = origin[0] + r * np.cos(th); y = origin[1] - r * np.sin(th)
    A = np.stack([x, y, np.ones_like(x)], -1); b = x * x + y * y
    (a, bb, c), *_ = np.linalg.lstsq(A, b, rcond=None)
    cx, cy = a / 2, bb / 2
    return cx, cy, math.sqrt(c + cx * cx + cy * cy)
