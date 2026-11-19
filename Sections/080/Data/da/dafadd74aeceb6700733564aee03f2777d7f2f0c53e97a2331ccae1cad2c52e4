"""Screen 04 milestone 3: Benny's splash, cut from the ORIGINAL approved picture (white crest + droplets around his base;
alpha = bright + low saturation, soft elliptical window that leaves out the foam banks and bubbles), as a camera-facing
card that rides with Benny (as splash08). Card placed so that in the locked approved camera it covers exactly the
painted splash, 1.0 u in front of Benny's root along the view.
usage: python3 -I tools/match04/splash04.py references/04_through_the_five_arrows.png assets/textures/match04 <benny root x,y,z>"""
import json, math, sys
import numpy as np, cv2
ref, d, root = sys.argv[1], sys.argv[2], np.array([float(v) for v in sys.argv[3].split(',')])
X0, Y0, X1, Y1 = 140, 1262, 624, 1442
A = cv2.imread(ref)[Y0:Y1, X0:X1]
hsv = cv2.cvtColor(A, cv2.COLOR_BGR2HSV).astype(np.float32)
al = np.clip((hsv[..., 2] - 175) / 55, 0, 1) * np.clip((105 - hsv[..., 1]) / 55, 0, 1)
h, w = al.shape; yy, xx = np.mgrid[0:h, 0:w]
ell = ((xx - w * 0.47) / (w * 0.5)) ** 2 + ((yy - h * 0.5) / (h * 0.52)) ** 2
al *= np.clip((1.0 - ell) / 0.25, 0, 1)
al *= 1 - np.clip((xx - 0.80 * w) / (0.06 * w), 0, 1) * np.clip((yy - 0.55 * h) / (0.1 * h), 0, 1)   # foam-bank bubbles, lower right
al = cv2.GaussianBlur(al, (0, 0), 0.8)
cv2.imwrite(f"{d}/splash04.png", np.dstack([A, (al * 255).astype(np.uint8)]))
c = json.load(open(f"{d}/cam04_locked.json"))
W, H = c["size"]; t = math.tan(math.radians(c["fov"]) / 2); asp = W / H
M = np.array(c["mw"]).reshape(4, 4).T; C = M[:3, 3]; R = M[:3, :3]
zr = -((root - C) @ R)[2]; z = zr - 1.0                        # view depth of the card
cx, cy = (X0 + X1) / 2, (Y0 + Y1) / 2
q = np.array([(cx / W * 2 - 1) * t * asp * z, (1 - cy / H * 2) * t * z, -z])
P = C + R @ q
px = 2 * t * z / H                                              # world units per pixel at that depth
json.dump({"note": "Screen 04 approved splash around Benny (approved x%d-%d y%d-%d, alpha = bright/low saturation in an ellipse), camera-facing card 1.0 u in front of Benny's root, offset from Benny's root at the 04 checkpoint" % (X0, X1, Y0, Y1),
           "offset": (P - root).tolist(), "w": (X1 - X0) * px, "h": (Y1 - Y0) * px, "alphaMean": float(al.mean())}, open(f"{d}/splash04.json", "w"), indent=1)
print(open(f"{d}/splash04.json").read())
