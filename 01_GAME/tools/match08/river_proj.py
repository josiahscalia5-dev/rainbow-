import json, math, sys, numpy as np
cam=json.load(open(sys.argv[1])); MW=np.array(cam['mw'],float).reshape(4,4).T; C=MW[:3,3]; R=MW[:3,:3]
W,H=864,1536; t=math.tan(math.radians(cam['fov'])/2); asp=W/H
def ray(u,v):
    x,y=u/W*2-1,1-v/H*2; d=R@np.array([x*t*asp,y*t,-1.0]); return d/np.linalg.norm(d)
FY=-113.6; out=[]
for y,c,a,b in json.load(open(sys.argv[2])):
    hit=lambda u: C+((FY-C[1])/ray(u,y)[1])*ray(u,y)
    p,pa,pb=hit(c),hit(a),hit(b); out.append((float(p[2]),float(p[0]),float(abs(pb[0]-pa[0]))))
out.sort(key=lambda r:-r[0])
json.dump({'note':'Screen 08 painted river centre line (approved picture) projected on the floor y=-113.6 from the locked ?match08=1 camera; tools/match08 (2026-11-17)','floorY':FY,'z':[r[0] for r in out],'x':[r[1] for r in out],'width':[r[2] for r in out]},open(sys.argv[3],'w'),indent=1)
