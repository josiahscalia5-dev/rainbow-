"""Screen 05 tunnel kit (round 33) - geometry fitted to the APPROVED painting, in the round-32 world units (camera of the approved
picture at the origin, Marble scale: tunnel radius ~1, camera 0.734 above the water, Benny 0.404 tall).

The painting is not drawn in strict perspective: from ring 2 inward every gold ring is ~1.5x deeper than the one before it (a constant
ratio, measured 2026-11-21 from the ring tops: 260, 165, 102, 69, 52, 38, 27, 18 px from the bright core). The kit is a REAL straight
3D tunnel with evenly spaced rings, and every scenery vertex goes through a camera-relative depth curve g() along the tunnel axis:
identity up to the depth of ring 2 (Benny, his water, the controls are plain 3D) and exponential beyond it, so the far tunnel keeps
the painting's ring ratio from EVERY camera position while Benny swims (the same idea as the "curved world" shaders of endless
runners). kit05.html applies exactly the same g() in its vertex shaders (KIT.remap)."""
import json, os, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
V = os.path.join(REPO, 'tools', 'marble05', 'viewer')
SC = json.load(open(os.path.join(V, 'scene05.json')))
W, H = 864, 1536
FOC = (H / 2) / np.tan(np.radians(SC['cam']['fov']) / 2)
F = np.array(SC['cam']['fwd'], float); F /= np.linalg.norm(F)
U = np.array(SC['cam']['up'], float); U -= F * (U @ F); U /= np.linalg.norm(U)
R = np.cross(F, U)

# ---- measured on the painting (full-resolution pixels) ----
VP = (500.0, 474.0)          # bright core = the tunnel's vanishing point
RING2_PX = 246.0             # painted ring 2 radius (RANSAC circle fit, centre (470, 459))
RATIO = 1.52                 # depth ratio between successive painted rings (ring 2 inward)
CAM_OFF = (-0.12, -0.02)     # tunnel axis relative to the camera, in tunnel radii: 0.12 to the LEFT, 0.02 BELOW (fitted to the ring tops)
RT = 1.0                     # tunnel wall radius (world units; equals the Marble scale)
RING_IN, RING_W = 0.90, 0.10 # gold ring: inner radius, width along the axis

CAM_H = 0.734                # camera height above the water (round-32 value, Marble scale)

def cam_dir(px, py):
    d = (px - W / 2) / FOC * R + (-(py - H / 2) / FOC) * U + F; return d / np.linalg.norm(d)

A = cam_dir(*VP)                                                      # tunnel axis: exactly towards the painted core
NUP = U - A * (U @ A); NUP /= np.linalg.norm(NUP)                     # tunnel up = picture up, square to the axis
# the water is parallel to the axis (its horizon passes through the core). NOTE: the round-32 Marble water plane is tilted against the
# painted tunnel (made parallel to it, the core would sit 138 px higher), so the kit does NOT use it.
PN = NUP.copy(); PD = -CAM_H                                          # water: PN . P = PD
RR = np.cross(A, NUP); RR /= np.linalg.norm(RR)
if RR @ R < 0: RR = -RR                                              # tunnel right ~ camera right
A0 = CAM_OFF[0] * RT * RR + CAM_OFF[1] * RT * NUP                    # a point on the axis (axial coordinate 0 = the start camera)
HW = CAM_H + CAM_OFF[1] * RT                                         # axis height above the water
Z2 = FOC * RT / RING2_PX                                             # axial depth of painted ring 2 from the start camera
S = Z2 * np.log(RATIO)                                               # ring spacing: g'(Z2) = 1 and g(z + S) = RATIO * g(z) beyond Z2
def ring_t(k): return Z2 + (k - 2) * S                               # axial position of ring k (ring 2 = painted ring 2)
_bd = cam_dir(432, 1180); B0 = _bd * (-CAM_H / (_bd @ NUP))          # Benny's painted water contact point (same as kitgame.html)
TB0 = float(B0 @ A); LATB0 = float((B0 - A0) @ RR)                    # his axial start and lateral offset from the axis

def g(z):
    """camera-relative apparent depth along the axis (z = true axial distance from the camera)"""
    z = np.asarray(z, float); return np.where(z <= Z2, z, Z2 * np.exp((z - Z2) / Z2))

def remap(P, C=np.zeros(3)):
    """apparent position of world point(s) P seen from a camera at C (same formula as the shader)"""
    P = np.asarray(P, float); d = P - C; za = d @ A
    return C + d + (g(za) - za)[..., None] * A

def project(P):
    """approved-picture pixel of world point(s) P for the START camera (after the depth curve)"""
    Q = remap(P); z = Q @ F
    return W / 2 + FOC * (Q @ R) / z, H / 2 - FOC * (Q @ U) / z, z

def wall_point(theta, t, radius=RT):
    """theta: angle around the axis from tunnel-right, counter-clockwise (pi/2 = top); t: axial coordinate"""
    theta = np.asarray(theta, float); t = np.asarray(t, float)
    return A0 + t[..., None] * A + radius * (np.cos(theta)[..., None] * RR + np.sin(theta)[..., None] * NUP)

def height_above_water(P): return np.asarray(P) @ PN - PD

# ---- round 34 (S1): the river's WORLD-ANCHORED centre line (lateral offset along RR from the tunnel axis, world units) ----
# Painted stretch (axial t <= ~11): measured on the APPROVED picture cast onto the kit water (tools/kit05/bake_river.py prints the
# check): the painted coin trail (t 2.96 +0.06, 4.05 +0.28, 5.50 +0.04, 7.13 -0.31, 8.86 -0.18, 9.87 +0.07) and the cyan channel's
# centroid (t 2.3 -0.16, 4.3 +0.21, 5.8 +0.04, 7.3 -0.26, 8.8 -0.17, 10.3 +0.34) agree: S-bends ~3 u apart, ~0.26 u to each side.
# Apexes are joined by half-cosines (C1, zero slope at each apex = natural meanders). Beyond the painting the same character
# continues with seeded random spacing (2.6-3.8 u, i.e. 1.9-2.7 s at 1.4 u/s) and amplitude (0.15-0.28 u): no fixed period.
RIVER_LAT_START = LATB0                                              # the river centre passes through Benny's painted start point
RIVER_APEX_PAINTED = [(2.30, -0.05), (4.25, 0.26), (7.80, -0.29), (10.90, 0.27)]
RIVER_AMAX = 0.29                                                    # |centre| never exceeds this (water floor half chord 0.70)
def _river_apexes(t_end=95.0, seed=34):
    rng = np.random.default_rng(seed); ap = list(RIVER_APEX_PAINTED)
    while ap[-1][0] < t_end:
        t, a = ap[-1]; ap.append((t + rng.uniform(2.6, 3.8), -np.sign(a) * rng.uniform(0.15, 0.28)))
    return ap
def river_center(t):
    """lateral offset (along RR, from the tunnel axis) of the river centre at axial t; flat behind Benny's start"""
    t = np.atleast_1d(np.asarray(t, float)); ap = [(TB0, RIVER_LAT_START)] + _river_apexes(); ts = np.array([p[0] for p in ap]); cs = np.array([p[1] for p in ap])
    k = np.clip(np.searchsorted(ts, t) - 1, 0, len(ts) - 2); f = np.clip((t - ts[k]) / (ts[k + 1] - ts[k]), 0, 1)
    c = cs[k] + (cs[k + 1] - cs[k]) * (1 - np.cos(np.pi * f)) / 2
    return np.clip(np.where(t <= ts[0], cs[0], c), -RIVER_AMAX, RIVER_AMAX)

def export():
    return {'A': A.tolist(), 'NUP': NUP.tolist(), 'RR': RR.tolist(), 'A0': A0.tolist(), 'RT': RT, 'RING_IN': RING_IN, 'RING_W': RING_W,
            'Z2': float(Z2), 'S': float(S), 'HW': float(HW), 'PN': PN.tolist(), 'PD': float(PD), 'VP': VP, 'RATIO': RATIO, 'CAM_OFF': CAM_OFF}

if __name__ == '__main__':
    print('axis', A.round(4), 'right', RR.round(4), 'axis height above water', round(HW, 3), 'Z2', round(Z2, 3), 'S', round(S, 3))
    vx, vy, _ = project(A0 + 200 * A); print('VP after making the axis parallel to the water:', round(float(vx), 1), round(float(vy), 1), '(measured', VP, ')')
    for k in range(1, 9):
        th = np.pi / 2; x, y, z = project(wall_point(th, ring_t(k), RING_IN)); xo, yo, _ = project(wall_point(th, ring_t(k), RT))
        xl, yl, _ = project(wall_point(np.pi, ring_t(k), RT)); xr, yr, _ = project(wall_point(0, ring_t(k), RT))
        print(f'ring {k}: t {ring_t(k):6.2f}  top (outer {yo:6.1f}, inner {y:6.1f})  left x {xl:6.1f}  right x {xr:6.1f}  at y {yl:6.1f}')
    print('water chord half-width', round(float(np.sqrt(RT ** 2 - HW ** 2)), 3))
