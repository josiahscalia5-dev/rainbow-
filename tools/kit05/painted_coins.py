"""Round 33: the APPROVED picture's coins (centre, radius) cast onto the kit river -> (s along Benny's path, lateral offset).
python3 -I painted_coins.py <kit.json> -> prints JSON list [[s, lat, r_px], ...] nearest first (used by kitgame.html for coin run 1)."""
import sys, json, numpy as np, cv2
from PIL import Image
sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from kit_model import *
ref = np.array(Image.open(os.path.join(REPO, 'references/05_flow_into_the_current.png')).convert('RGB')).astype(np.float32)
hsv = cv2.cvtColor(ref.astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
gold = ((hsv[..., 0] >= 9) & (hsv[..., 0] <= 30) & (hsv[..., 1] > 120) & (hsv[..., 2] > 140)).astype(np.uint8)
roi = np.zeros_like(gold); roi[480:760, 380:600] = 1; m = cv2.morphologyEx(gold * roi, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
n, lab, st, cen = cv2.connectedComponentsWithStats(m, 8)
coins = sorted([(float(cen[i][0]), float(cen[i][1]), float(np.sqrt(st[i, 4] / np.pi))) for i in range(1, n) if st[i, 4] > 25], key=lambda c: -c[1])
bdir = cam_dir(432, 1180); B0 = bdir * (-CAM_H / (bdir @ NUP)); tB0 = float(B0 @ A); latB0 = float((B0 - A0) @ RR)
def ginv(a):                                     # inverse depth curve
    return np.where(a <= Z2, a, Z2 + Z2 * np.log(np.maximum(a, 1e-9) / Z2))
kitj = json.load(open(sys.argv[1])); coinD = 0.15038523388874458 * float(np.linalg.norm(B0)) / 1.186
out = []
for x, y, r in coins:
    # the coin centre stands coinD * 0.75 above the water: intersect the view ray with that raised plane in APPARENT space, then undo g()
    d = cam_dir(x, y); lam = (-(CAM_H) + coinD * 0.75) / (d @ NUP); Pa = d * lam
    za = Pa @ A; P = Pa + (ginv(za) - za) * A
    s = float(P @ A) - tB0; lat = float((P - A0) @ RR) - latB0
    out.append([round(s, 3), round(lat, 3), round(r, 1), round(x, 1), round(y, 1)])
print(json.dumps(out))
