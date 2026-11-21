# S4: mark the tiles qa_visual.py counts as "stretched" (green) on one frame: python3 -I stretch_viz.py <frame.jpg> <out.jpg>
import sys, cv2, numpy as np
f, outp = sys.argv[1:3]
im = cv2.imread(f); H, W = im.shape[:2]; TS = 24
R0 = cv2.imread('/home/user/rainbow-/references/05_flow_into_the_current.png'); rw = round(R0.shape[1]*H/R0.shape[0]); REF = cv2.resize(R0, (rw, H), interpolation=cv2.INTER_AREA)[:, (rw-W)//2:(rw-W)//2+W]
def coh(x):
    g = cv2.GaussianBlur(cv2.cvtColor(x, cv2.COLOR_BGR2GRAY).astype(np.float32), (0,0), 0.8); gx = cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3); gy = cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3)
    ny, nx = H//TS, W//TS; sh = lambda z: z[:ny*TS,:nx*TS].reshape(ny,TS,nx,TS).mean((1,3)); Jxx, Jyy, Jxy = sh(gx*gx), sh(gy*gy), sh(gx*gy); tr = Jxx+Jyy
    return np.sqrt((Jxx-Jyy)**2+4*Jxy**2)/np.maximum(tr,1e-6), np.sqrt(tr)
c, e = coh(im); cr, _ = coh(REF); fl = (c >= 0.75) & (c - cr >= 0.35) & (e >= 3)
o = im.copy()
for y, x in zip(*np.where(fl)):
    if y*TS >= 125: cv2.rectangle(o, (x*TS, y*TS), (x*TS+TS-1, y*TS+TS-1), (0,255,0), 2)
cv2.imwrite(outp, o)
