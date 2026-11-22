"""Rainbow screen kit - shared fitting maths (round 43). Every screen's fit script measures ITS OWN approved picture and uses these
helpers to turn the measurements into one physical world (y up, the water under Benny at y = 0, route roughly along -z), with the
same conventions as the proven Bubble Dash / Sock Rescue fit (tools/reflock/fit_section.py): vertical FOV 64 deg, camera 0.734 above
the water at the picture position, Benny scaled to his painted height.
Camera rotation = three.js Euler YXZ (yaw about +y = turn left, pitch about +x = look up); columns of R = camera axes in world."""
import math, json
import numpy as np
from scipy.optimize import least_squares

FOV = 64.0
CAM_H = 0.734           # camera height above the water at the picture position (kit convention)


class Cam:
    def __init__(self, W, H, fov=FOV):
        self.W, self.H, self.fov = W, H, fov
        self.F = (H / 2) / math.tan(math.radians(fov / 2)); self.CX, self.CY = W / 2, H / 2
        self.R = np.eye(3); self.C = np.zeros(3); self.yaw = 0.0; self.pitch = 0.0

    def set(self, yaw, pitch, C):
        self.yaw, self.pitch = float(yaw), float(pitch); self.R = rot(yaw, pitch); self.C = np.asarray(C, float); return self

    def proj(self, P):
        q = self.R.T @ (np.asarray(P, float) - self.C); return np.array([self.CX + self.F * q[0] / -q[2], self.CY - self.F * q[1] / -q[2]]), -q[2]

    def ray(self, px, py):
        d = self.R @ np.array([(px - self.CX) / self.F, -(py - self.CY) / self.F, -1.0]); return d / np.linalg.norm(d)

    def depth_dir(self, px, py):
        """ray scaled so that its component along the camera's view axis is 1 (point = C + d * camera-space depth)"""
        d = self.R @ np.array([(px - self.CX) / self.F, -(py - self.CY) / self.F, -1.0]); return d

    def on_plane_y(self, px, py, y=0.0):
        d = self.ray(px, py); lam = (y - self.C[1]) / d[1]; return self.C + lam * d

    def json(self, ref, extra=None):
        out = {'pos': self.C.tolist(), 'yaw': self.yaw, 'pitch': self.pitch, 'ref': ref, 'img': [self.W, self.H], 'fov': self.fov, 'focal_px': self.F}
        out.update(extra or {}); return out


def rot(yaw, pitch):
    cy, sy, cp, sp = math.cos(yaw), math.sin(yaw), math.cos(pitch), math.sin(pitch)
    Ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]]); Rx = np.array([[1, 0, 0], [0, cp, -sp], [0, sp, cp]]); return Ry @ Rx


def yaw_pitch_from_vp(cam, vp, axis=(0, 0, -1.0)):
    """camera yaw / pitch so that the world direction `axis` vanishes at image point vp"""
    a = np.asarray(axis, float)
    def res(p):
        R = rot(p[0], p[1]); q = R.T @ a; return [cam.CX + cam.F * q[0] / -q[2] - vp[0], cam.CY - cam.F * q[1] / -q[2] - vp[1]]
    return least_squares(res, [0.0, 0.0]).x


def ring_offsets(cam, vp, circles):
    """painted rings of a straight tube seen from an off-axis camera: centre = VP + (-ox, +oy) / R * radius (image y down).
    Returns the camera offset from the axis in units of the tube radius (ox right, oy up), least squares over all rings."""
    A, b = [], []
    for cx, cy, r in circles:
        A.append([r, 0]); b.append(cx - vp[0]); A.append([0, r]); b.append(cy - vp[1])
    k = np.linalg.lstsq(np.array(A, float), np.array(b, float), rcond=None)[0]
    return float(-k[0]), float(k[1])          # ox / R (camera right of the axis), oy / R (camera above the axis)


def ray_cylinder(C, d, P0, A, R):
    """first intersection (from inside) of the ray C + t d with the cylinder of radius R around the line P0 + u A"""
    A = A / np.linalg.norm(A); w = C - P0; dp = d - A * (d @ A); wp = w - A * (w @ A)
    a = dp @ dp; b = 2 * dp @ wp; c = wp @ wp - R * R; disc = b * b - 4 * a * c
    if disc < 0: return None
    t = (-b + math.sqrt(disc)) / (2 * a); return C + t * d if t > 0 else None


def smooth_polyline(P, iters=3):
    P = np.asarray(P, float).copy()
    for _ in range(iters): P[1:-1] = 0.25 * P[:-2] + 0.5 * P[1:-1] + 0.25 * P[2:]
    return P


def resample(P, step):
    P = np.asarray(P, float); L = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))])
    s = np.arange(0, L[-1] + 1e-9, step); return np.stack([np.interp(s, L, P[:, i]) for i in range(3)], 1), s


def dump(path, obj):
    def conv(o):
        if isinstance(o, np.ndarray): return o.tolist()
        if isinstance(o, (np.floating,)): return float(o)
        if isinstance(o, (np.integer,)): return int(o)
        raise TypeError(type(o))
    json.dump(obj, open(path, 'w'), indent=1, default=conv)


def catmull_rom(P, step, alpha=0.5):
    """centripetal Catmull-Rom spline THROUGH every control point (the painted points stay exactly on the route), resampled every `step`"""
    P = np.asarray(P, float); P = np.vstack([2 * P[0] - P[1], P, 2 * P[-1] - P[-2]]); out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        t0 = 0.0; t1 = t0 + np.linalg.norm(p1 - p0) ** alpha + 1e-9; t2 = t1 + np.linalg.norm(p2 - p1) ** alpha + 1e-9; t3 = t2 + np.linalg.norm(p3 - p2) ** alpha + 1e-9
        for t in np.linspace(t1, t2, 24, endpoint=False):
            a1 = (t1 - t) / (t1 - t0) * p0 + (t - t0) / (t1 - t0) * p1; a2 = (t2 - t) / (t2 - t1) * p1 + (t - t1) / (t2 - t1) * p2; a3 = (t3 - t) / (t3 - t2) * p2 + (t - t2) / (t3 - t2) * p3
            b1 = (t2 - t) / (t2 - t0) * a1 + (t - t0) / (t2 - t0) * a2; b2 = (t3 - t) / (t3 - t1) * a2 + (t - t1) / (t3 - t1) * a3
            out.append((t2 - t) / (t2 - t1) * b1 + (t - t1) / (t2 - t1) * b2)
    out.append(P[-2]); return resample(np.array(out), step)
