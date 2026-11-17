"""Screen 06 (?match06=1) shared geometry for the offline tools (must match src/world/match06.ts):
river frames from the probe (course.sample every 0.5 u WITH the 06 correction), the tube around the river and the river
floor. Tube: centre c(s) = pos + hA * up, radius R; floor: pos + l * right, |l| <= L = sqrt(R^2 - hA^2) (meets the wall).
After sEnd both continue straight along the tangent at sEnd (the painted tunnel's far rings stay concentric).
The locked camera: assets/textures/match06/cam06_locked.json."""
import json, math
import numpy as np

LAYOUT = {"R": 7.5, "hA": 3.0, "sBack": -12.0, "sAhead07": 34.0, "ext": 260.0}

class Geo:
    def __init__(self, probe, cam, layout=LAYOUT):
        d = json.load(open(probe)) if isinstance(probe, str) else probe
        c = json.load(open(cam)) if isinstance(cam, str) else cam
        self.d, self.c, self.L = d, c, dict(layout)
        F = d["frames"]
        self.fs = np.array([f["s"] for f in F]); self.fp = np.array([f["pos"] for f in F])
        self.fu = np.array([f["up"] for f in F]); self.fr = np.array([f["right"] for f in F]); self.ft = np.array([f["tan"] for f in F])
        self.sB = d["s"]; self.s07 = d["s07"][0]
        self.s0 = self.sB + self.L["sBack"]; self.s1 = self.s07 + self.L["sAhead07"]
        self.W, self.H = c["size"]; self.t = math.tan(math.radians(c["fov"]) / 2); self.asp = self.W / self.H
        MW = np.array(c["mw"]).reshape(4, 4).T; self.C = MW[:3, 3]; self.Rm = MW[:3, :3]
        self.Fpx = (self.H / 2) / self.t
        self.R = self.L["R"]; self.hA = self.L["hA"]; self.Lf = math.sqrt(self.R ** 2 - self.hA ** 2)

    def frame(self, s):
        """pos, tan, up, right at s (linear interpolation; beyond s1 straight along the tangent at s1)"""
        s = np.atleast_1d(np.asarray(s, float)); se = np.minimum(s, self.s1)
        g = lambda A: np.stack([np.interp(se, self.fs, A[:, k]) for k in range(3)], -1)
        p, tn, u, r = g(self.fp), g(self.ft), g(self.fu), g(self.fr)
        tn /= np.linalg.norm(tn, axis=-1, keepdims=True)
        T1 = np.interp(self.s1, self.fs, self.ft[:, 0]), np.interp(self.s1, self.fs, self.ft[:, 1]), np.interp(self.s1, self.fs, self.ft[:, 2])
        T1 = np.array(T1); T1 /= np.linalg.norm(T1)
        p = p + np.maximum(s - self.s1, 0)[:, None] * T1[None]
        return p, tn, u, r

    def tube(self, s, th):
        p, _, u, r = self.frame(s)
        return p + self.hA * u + self.R * (np.cos(th)[..., None] * r + np.sin(th)[..., None] * u)

    def floor(self, s, l):
        p, _, _, r = self.frame(s)
        return p + np.asarray(l)[..., None] * r

    def proj(self, X):
        q = (np.asarray(X) - self.C) @ self.Rm; z = np.minimum(q[..., 2], -1e-4)
        return (q[..., 0] / -z / (self.t * self.asp) + 1) / 2 * self.W, (1 - q[..., 1] / -z / self.t) / 2 * self.H, q[..., 2]

    def ray(self, u, v):
        r = self.Rm @ np.array([(u / self.W * 2 - 1) * self.t * self.asp, (1 - v / self.H * 2) * self.t, -1.0]); return r / np.linalg.norm(r)

    def layout_json(self):
        return {"note": "Screen 06 proxy layout (tools/match06/geo06.py)", "camera": {"matrixWorld": self.c["mw"], "fov": self.c["fov"], "size": [self.W, self.H], "pos": self.C.tolist()},
                **self.L, "sB": self.sB, "s0": self.s0, "s1": self.s1, "Lfloor": self.Lf}
