"""Screen 08 (?match08=1): solve the 3D proxy geometry from the APPROVED picture + the locked game camera.
Every proxy is placed by casting rays from the locked camera through measured picture points onto known surfaces
(floor plane at Benny's water level, the chamber cylinder, the arch plane), so its silhouette matches the picture.
usage: python3 -I tools/match08/fit_proxies.py <cam08.json> <out proj08.json>
cam08.json: {"mw": camera.matrixWorld.elements (16, column-major), "fov": 62, ...} read from the live game."""
import json, sys, math
import numpy as np

cam = json.load(open(sys.argv[1]))
W, H, FOV = 864, 1536, math.radians(cam["fov"])
MW = np.array(cam["mw"], float).reshape(4, 4).T          # three.js column-major -> row-major
C = MW[:3, 3]; R = MW[:3, :3]
t = math.tan(FOV / 2); asp = W / H

def ray(u, v):
    x, y = u / W * 2 - 1, 1 - v / H * 2
    d = R @ np.array([x * t * asp, y * t, -1.0]); return d / np.linalg.norm(d)

def project(p):
    q = R.T @ (np.asarray(p, float) - C)
    return np.array([(q[0] / (-q[2]) / (t * asp) + 1) / 2 * W, (1 - q[1] / (-q[2]) / t) / 2 * H])

# known world surfaces (src/world/course.ts WORLD + the live game)
FLOOR_Y = -113.6                         # chamber floor (WORLD.chamber.floorY): painted river/floor plane, just under Benny's water line
CH = dict(cx=12.0, cy=-101.1, r=13.5, zBack=-280.0, zDoor=-332.0)

def hit_plane_y(u, v, y):
    d = ray(u, v); s = (y - C[1]) / d[1]; return C + s * d
def hit_plane_z(u, v, z):
    d = ray(u, v); s = (z - C[2]) / d[2]; return C + s * d
def hit_cyl(u, v, r=CH["r"]):           # inside the chamber cylinder (axis along z)
    d = ray(u, v); ox, oy = C[0] - CH["cx"], C[1] - CH["cy"]
    a = d[0] ** 2 + d[1] ** 2; b = 2 * (ox * d[0] + oy * d[1]); c = ox * ox + oy * oy - r * r
    s = (-b + math.sqrt(b * b - 4 * a * c)) / (2 * a); return C + s * d

def circle3(p1, p2, p3):                 # circle through 3 points in a z-plane (x, y)
    (x1, y1), (x2, y2), (x3, y3) = p1, p2, p3
    A = np.array([[x2 - x1, y2 - y1], [x3 - x1, y3 - y1]], float)
    b = 0.5 * np.array([x2 ** 2 - x1 ** 2 + y2 ** 2 - y1 ** 2, x3 ** 2 - x1 ** 2 + y3 ** 2 - y1 ** 2])
    cx, cy = np.linalg.solve(A, b); return float(cx), float(cy), float(math.hypot(x1 - cx, y1 - cy))

out = {"camera": {"pos": C.tolist(), "matrixWorld": cam["mw"], "fov": cam["fov"], "size": [W, H]}, "floorY": FLOOR_Y, "chamber": CH}

# ---- gold arch: feet on the floor give its depth; top + feet give the outer/inner circles in that plane
fL, fR = hit_plane_y(195, 1255, FLOOR_Y), hit_plane_y(655, 1255, FLOOR_Y)
zA = float((fL[2] + fR[2]) / 2)
oL, oR = hit_plane_z(183, 1250, zA), hit_plane_z(666, 1250, zA)
iL, iR = hit_plane_z(224, 1205, zA), hit_plane_z(623, 1205, zA)
oT, iT = hit_plane_z(432, 189, zA), hit_plane_z(432, 252, zA)
co = circle3(oL[:2], oR[:2], oT[:2]); ci = circle3(iL[:2], iR[:2], iT[:2])
out["arch"] = {"z": zA, "outer": {"cx": co[0], "cy": co[1], "r": co[2]}, "inner": {"cx": ci[0], "cy": ci[1], "r": ci[2]},
               "depth": 0.9, "feetZ": [float(fL[2]), float(fR[2])]}
# check: where does the fitted outer circle cross image row 600 (the picture's arch leaves the frame at x≈0 / 864)?
yy = hit_plane_z(432, 600, zA)[1]; dx = math.sqrt(max(co[2] ** 2 - (yy - co[1]) ** 2, 0))
out["arch"]["check_row600_px"] = [float(project([co[0] - dx, yy, zA])[0]), float(project([co[0] + dx, yy, zA])[0])]

# ---- outer inlet pipe: the picture's walls OUTSIDE the arch are near the camera -> a pipe around the camera that ends
# at the arch (radius = the arch's outer radius), so those rays hit close walls (big slots) as in the picture
out["pipe"] = {"cx": co[0], "cy": co[1], "r": co[2] + 0.04, "z0": float(C[2] + 8.0), "z1": zA}
# back wall behind the arch: deep enough that Benny (≈2 u long, centre ≈7 u ahead) passes in front of it, hole wide enough
# that no ray through the arch opening hits it (so it never shows in the locked view)
zbw = float(C[2] - 10.0)
out["backwall"] = {"z": zbw, "holeR": float(ci[2] * (C[2] - zbw) / (C[2] - zA) + 0.3)}

# ---- platform: at the game's platform depth (WORLD.platform z -325); width + top/rim rows from the picture.
# Its painted top is seen from above while the game eye is ~level with it, so the top disc is tilted toward the camera
# by the angle that reproduces the picture's ellipse (b/a); legs are a skirt down to the floor.
PZ = -325.0
pl, pr = hit_plane_z(260, 549, PZ), hit_plane_z(702, 549, PZ)
pcx = float((pl[0] + pr[0]) / 2); prad = float(abs(pr[0] - pl[0]) / 2)
ptop = float(hit_plane_z(481, 549, PZ)[1])
rim_b = float(hit_plane_z(481, 577, PZ)[1]); legs_b = float(hit_plane_z(481, 625, PZ)[1])
d_eye = np.array([pcx, ptop, PZ]) - C
elev = math.degrees(math.atan2(-d_eye[1], math.hypot(d_eye[0], d_eye[2])))   # + = platform below the eye
tilt = float(math.degrees(math.asin(17.0 / 221.0)) - elev)                      # extra tilt toward the camera
out["platform"] = {"cx": pcx, "cz": PZ, "r": prad, "topY": ptop, "rimBottomY": rim_b, "legsBottomY": legs_b,
                   "floorY": FLOOR_Y, "tiltDeg": tilt, "eyeElevDeg": float(elev)}

# ---- towel: box on the platform top, picture box x 390-570, y 465-542 (at the platform depth)
tl, tr = hit_plane_z(390, 542, PZ), hit_plane_z(570, 542, PZ)
ttop = float(hit_plane_z(480, 465, PZ)[1]); tbot = float(hit_plane_z(480, 542, PZ)[1])
tw = float(abs(tr[0] - tl[0]))
out["towel"] = {"cx": float((tl[0] + tr[0]) / 2), "cz": PZ + 1.0, "w": tw, "h": ttop - tbot, "y0": tbot, "d": 3.2}

# ---- four half-dome spouts on the side walls (picture boxes); depth: upper pair just in front of the door wall,
# lower pair where their centre ray meets the chamber wall; radius from the picture width at that depth
spouts = {"UL": (150, 330, 315, 420, -322.0), "UR": (665, 370, 760, 460, -322.0), "LL": (0, 605, 265, 810, None), "LR": (615, 640, 864, 875, None)}
out["spouts"] = {}
for k, (x0, y0, x1, y1, zz) in spouts.items():
    uc, vc = (x0 + x1) / 2, (y0 + y1) / 2
    if zz is None: zz = float(hit_cyl(uc, vc)[2])
    pc = hit_plane_z(uc, vc, zz); pe = hit_plane_z(x0, vc, zz); pf = hit_plane_z(x1, vc, zz)
    rx = float(abs(pf[0] - pe[0]) / 2); ry = float(abs(hit_plane_z(uc, y0, zz)[1] - hit_plane_z(uc, y1, zz)[1]) / 2)
    out["spouts"][k] = {"c": pc.tolist(), "rx": rx, "ry": ry, "box": [x0, y0, x1, y1], "dist": float(np.linalg.norm(pc - C))}

# ---- checks: project the solved shapes back
out["checks"] = {"platform_centre_px": project([pcx, ptop, PZ]).tolist(), "towel_top_px": project([out["towel"]["cx"], ttop, PZ + 1.0]).tolist(),
                 "arch_top_outer_px": project([co[0], co[1] + co[2], zA]).tolist(), "door_px": project([12, -103.6, -332]).tolist(),
                 "camera_to_arch": float(C[2] - zA), "camera_to_platform": float(C[2] - PZ)}
json.dump(out, open(sys.argv[2], "w"), indent=1)
print(json.dumps({k: out[k] for k in ("pipe", "platform", "towel", "checks")}))
for k, v in out["spouts"].items(): print(k, "rx %.2f ry %.2f dist %.1f c" % (v["rx"], v["ry"], v["dist"]), [round(x, 2) for x in v["c"]])
