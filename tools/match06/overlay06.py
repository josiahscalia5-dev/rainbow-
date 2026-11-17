"""debug overlay: the game river (centre + edges, corrected by path06) projected from the locked 06 camera onto the
approved picture. usage: python3 -I tools/match06/overlay06.py <probe06.json> <cam06.json> <out.png> [probe already corrected: 1]"""
import json, sys, math
import numpy as np, cv2
d = json.load(open(sys.argv[1])); cam = json.load(open(sys.argv[2])); applied = len(sys.argv) > 4
W, H = cam["size"]; t = math.tan(math.radians(cam["fov"]) / 2); asp = W / H
MW = np.array(cam["mw"]).reshape(4, 4).T; C = MW[:3, 3]; R = MW[:3, :3]
F = d["frames"]; z6 = [f for f in F if f["s"] >= d["s06"][0]][0]["pos"][2]
def bump(c, t): return math.sin(math.pi * t) ** 2 * (c[0] + c[1] * math.cos(math.pi * t) + c[2] * math.cos(2 * math.pi * t))
A = cv2.imread("references/06_crest_the_rinse_arch.png")
for k, col in ((-1, (0, 255, 255)), (0, (0, 255, 0)), (1, (0, 255, 255))):
    pts = []
    for f in F:
        if f["s"] < d["s"] - 3: continue
        P = np.array(f["pos"], float)
        if not applied and d["s06"][0] <= f["s"] <= d["s06"][1]:
            tt = min(max((z6 - P[2]) / 46, 0), 1); P[0] += bump(cam["path06"]["dx"], tt); P[1] += bump(cam["path06"]["dy"], tt)
        P = P + k * f["w"] / 2 * np.array(f["right"])
        q = (P - C) @ R
        if q[2] < -0.3: pts.append([(q[0] / -q[2] / (t * asp) + 1) / 2 * W, (1 - q[1] / -q[2] / t) / 2 * H])
    cv2.polylines(A, [np.array(pts).astype(np.int32)], False, col, 2)
cv2.imwrite(sys.argv[3], A)
