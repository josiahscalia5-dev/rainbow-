"""Screen 06 (?match06=1, r3 2026-11-17): masks on the approved picture (864x1536) for the moving camera.
  R = Benny's provisional fill (plate06_fillmask.png inside Benny's box): the river floor shows the painted-water tile
      there instead of the blurry fill (the game Benny covers it in the approved view; seen from 3 u forward it was a
      white smear on the water)
  G = where the picture shows NO painted water (tunnel walls, rings, the wall seen through the river's crest loop, the
      foam banks): if the river FLOOR carries such pixels, it shows the painted-water tile instead once the camera leaves
      the approved view (they were seen as an upside-down tunnel copy under Benny at 6 u forward / when steering)
Hand-traced polygons on references/06_crest_the_rinse_arch.png; check picture: qa/match/06/masks06_check.png
usage: python3 -I tools/match06/make_masks06.py <plate dir> <qa dir>"""
import sys
import numpy as np, cv2

d, q = sys.argv[1], sys.argv[2]
A = cv2.imread(f"{d}/plate06_hybrid.png"); H, W = A.shape[:2]
fill = cv2.imread(f"{d}/plate06_fillmask.png", cv2.IMREAD_GRAYSCALE) > 127
R = np.zeros((H, W), np.uint8); box = np.zeros((H, W), bool); box[700:1240, 180:680] = True
R[fill & box] = 255
R = cv2.dilate(R, np.ones((15, 15), np.uint8))
R = np.maximum(R, cv2.GaussianBlur(cv2.dilate(R, np.ones((41, 41), np.uint8)), (0, 0), 14))   # soft edge (no visible block border)
# G = everything that is NOT the painted river: outline of the painted water (near river + its crest loop + the thin far
# stream into the tunnel) minus the tunnel wall seen inside the loop
water = [(0, 1536), (864, 1536), (864, 1010), (812, 975), (770, 910), (730, 850), (690, 795), (650, 760), (610, 735),
         (700, 725), (712, 705), (650, 650), (580, 600), (520, 560), (470, 530), (400, 500), (300, 480), (200, 490),
         (100, 520), (30, 560), (0, 590)]
loop = [(292, 640), (300, 596), (330, 566), (380, 553), (430, 560), (480, 590), (530, 625), (580, 655), (630, 676),
        (672, 690), (676, 708), (640, 716), (590, 712), (540, 704), (480, 698), (420, 694), (360, 688), (318, 676)]
Wm = np.zeros((H, W), np.uint8)
cv2.fillPoly(Wm, [np.array(water, np.int32)], 255)
cv2.fillPoly(Wm, [np.array(loop, np.int32)], 0)
G = 255 - Wm
G = cv2.GaussianBlur(G, (0, 0), 2.0)
cv2.imwrite(f"{d}/mask06.png", np.dstack([np.zeros_like(R), G, R]))      # BGR: R channel = fill, G = no-water
chk = A.astype(np.float32).copy()
chk[G > 127] = 0.45 * chk[G > 127] + 0.55 * np.array([0, 255, 0])
chk[R > 127] = 0.45 * chk[R > 127] + 0.55 * np.array([0, 0, 255])
cv2.imwrite(f"{q}/masks06_check.png", chk.astype(np.uint8))
print("fill px", int((R > 127).sum()), "no-water px", int((G > 127).sum()))
