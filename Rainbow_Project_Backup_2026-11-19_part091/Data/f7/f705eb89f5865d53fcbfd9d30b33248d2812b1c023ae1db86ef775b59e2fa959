"""Fit a real Screen 06 ride through the source coin arc with fixed endpoints and length."""
import argparse
import json
import math
from pathlib import Path

import numpy as np
from scipy.interpolate import CubicSpline
from scipy.optimize import brentq, least_squares
from scipy.ndimage import distance_transform_edt, map_coordinates
from PIL import Image


def unit(a):
    return a / np.maximum(np.linalg.norm(a,axis=-1,keepdims=True),1e-10)


def main():
    p=argparse.ArgumentParser(description=__doc__)
    for name in ("course","match","target","diagnostic"):p.add_argument(name,type=Path)
    args=p.parse_args()
    data=json.loads(args.course.read_text())
    old_s=np.array([q["s"]-data["inlet"] for q in data["rows"]])
    old=CubicSpline(old_s,np.array([q["p"] for q in data["rows"]]))
    cam=json.loads((args.match/"cam06_locked.json").read_text())
    width,height=cam["size"]
    camera=np.array(cam["mw"]).reshape(4,4).T
    R,eye=camera[:3,:3],camera[:3,3]
    f=height/(2*math.tan(math.radians(cam["fov"]/2)))
    coins=json.loads((args.match/"coins06.json").read_text())["coins"]
    raw=np.array([c["px"] for c in coins])
    target=raw[:,:2].copy()
    target[:,1]+=.37*raw[:,2]
    rays=np.c_[(target[:,0]-width/2)/f,(height/2-target[:,1])/f,-np.ones(len(coins))]@R.T
    pictured_depth=-((np.array([c["pos"] for c in coins])-eye)@R)[:,2]
    start,end=10.45,48.
    # These are spline parameters, not new pickup times. Arc-length inversion below
    # determines when the swimmer physically passes each photographed landmark.
    param=np.array([start,12.75,14.3,16.05,17.75,19.55,22.65,24.65,26.2,27.3,28.1,28.7,29.4,30.2,30.85,31.7,37.2,42.8,end])
    post=param[-3:-1]
    samples=np.linspace(start,end,381)
    mask=np.asarray(Image.open(args.match/'mask06.png').convert('RGB'))[:,:,1]>128
    wall_distance=distance_transform_edt(mask)-distance_transform_edt(~mask)
    visible=samples[(samples>=12.1)&(samples<=param[15])]
    def project(w):
        q=(w-eye)@R
        return np.column_stack((width/2-f*q[:,0]/q[:,2],height/2+f*q[:,1]/q[:,2]))
    def spline(v):
        # Coins span a visible area. Let the river centre pass underneath each disc
        # within a fraction of its photographed diameter while preserving the arc.
        adjusted=target+v[21:].reshape(15,2)*raw[:,2,None]
        sight=np.c_[(adjusted[:,0]-width/2)/f,(height/2-adjusted[:,1])/f,-np.ones(15)]@R.T
        landmarks=eye+sight*v[:len(coins),None]
        continuation=old(post)+v[15:21].reshape(-1,3)
        return CubicSpline(param,np.vstack((old(start),landmarks,continuation,old(end))),
                           bc_type=((1,old(start,1)),(1,old(end,1))))
    def residual(v):
        fit=spline(v)
        vel=fit(samples,1);acc=fit(samples,2)
        speed=np.linalg.norm(vel,axis=1)
        curv=np.linalg.norm(np.cross(vel,acc),axis=1)/np.maximum(.05,speed**3)
        length=np.trapezoid(speed,samples)
        inside=map_coordinates(wall_distance,project(fit(visible)).T[::-1],order=1,mode='nearest')
        return np.r_[650*(length-(end-start)), np.maximum(inside+3.,0)*.60,
                     (v[:15]-pictured_depth)*.65, v[15:21]*.22,v[21:]*4.2,
                     (speed-1)*.25, np.maximum(.48-speed,0)*5,
                     curv*.55, np.maximum(curv-.42,0)*85.,
                     (fit(samples,3)*.055).ravel(),
                     np.maximum(.20-np.diff(v[:15]),0)*2.8]
    initial=np.r_[np.interp(param[1:16],[start,16,23,31.7],[6.55,10.7,16.3,23.55]),np.zeros(36)]
    limit=.70
    result=least_squares(residual,initial,bounds=(np.r_[np.full(15,6.6),np.full(6,-4.),np.full(30,-limit)],
                                                 np.r_[np.full(15,29.5),np.full(6,4.),np.full(30,limit)]),max_nfev=360,
                         ftol=1e-8,xtol=1e-8,gtol=1e-8)
    fit=spline(result.x)
    u=np.linspace(start,end,7001);raw_world=fit(u)
    cumulative=np.r_[0,np.cumsum(np.linalg.norm(np.diff(raw_world,axis=0),axis=1))]
    original_length=np.linalg.norm(np.diff(old(u),axis=0),axis=1).sum()
    provisional_s=start+(end-start)*cumulative/cumulative[-1]
    reported_param=np.interp(param[1:16],u,provisional_s)
    base_world=old(provisional_s)
    delta=raw_world-base_world
    def remaining_length(strength):
        return np.linalg.norm(np.diff(base_world+strength*delta,axis=0),axis=1).sum()-original_length
    strength=brentq(remaining_length,.55,1.08)
    fit=CubicSpline(provisional_s,base_world+strength*delta,bc_type=((1,old(start,1)),(1,old(end,1))))
    raw_world=fit(u)
    cumulative=np.r_[0,np.cumsum(np.linalg.norm(np.diff(raw_world,axis=0),axis=1))]
    curve_length=float(cumulative[-1]); length_ratio=curve_length/(end-start)
    if abs(length_ratio-1)>.002:
        raise ValueError(f"Could not preserve the actual distance through the tested arc: {length_ratio}")
    def pts(s):
        local=np.interp((np.array(s)-start)*length_ratio,cumulative,u)
        return fit(local)
    # A dense table of C1 station offsets is sampled once in the Course constructor.
    # On unchanged stations the existing position, tangent and up frame are untouched.
    stations=np.r_[start,np.arange(math.ceil(start*4)/4,end,.25),end]
    offsets=pts(stations)-old(stations)
    dr=np.array([fit(x,1) for x in np.interp((stations-start)*length_ratio,cumulative,u)])
    derivative=unit(dr)*length_ratio-old(stations,1)
    offsets[[0,-1]]=0;derivative[[0,-1]]=0
    distance=wall_distance
    metrics={}
    for title,world in [("retained",old),("experiment",lambda s:np.where((s>start)[:,None],pts(s),old(s)))]:
        st=np.arange(10.,30.001,.25);xy=project(world(st));d=map_coordinates(distance,xy.T[::-1],order=1,mode="nearest")
        gap=(xy[:,0]>=295)&(xy[:,0]<560)&(xy[:,1]>=575)&(xy[:,1]<710)&(d>0)
        metrics[title]={"countInsideWall":int((d>0).sum()),"maxWallOverlapPixels":round(float(max(0,d.max())),4),"insidePhotographedPurpleOpening":int(gap.sum()),"openingToPlus20SampleCount":len(st),"plus3_75Pixel":xy[15].round(3).tolist()}
    actual_station=start+np.interp(reported_param,u,cumulative)/length_ratio
    geo={"begin":start,"end":end,"knots":np.column_stack((stations,offsets,derivative)).round(8).tolist(),"coins":[]}
    args.target.write_text(json.dumps(geo,separators=(",",":"))+"\n")
    v=fit(samples,1);a=fit(samples,2);curvature=np.linalg.norm(np.cross(v,a),axis=1)/np.linalg.norm(v,axis=1)**3
    diag={"method":"World-space cubic through the 15 pictured coin contacts with the retained start and exit tangents. Fitted optical depths are interpretations. The geometry is parameterized by actual arc length. Course positions and tangents are untouched outside the local segment.",
          "inlet":data["inlet"],"exit":data["exit"],"beginFromInlet":start,"endFromInlet":end,"geometricLength":curve_length,
          "unchangedDistanceBudget":end-start,"physicalLengthRatio":length_ratio,"smallestCentreRadius":float(1/curvature.max()),
          "maximumWorldShift":float(np.linalg.norm(offsets,axis=1).max()),"nativeCameraWallCheck":metrics,
          "sourceContactsPx":target.round(3).tolist(),"fittedCentrePx":project(fit(reported_param)).round(3).tolist(),"solvedDepthsBeforeLengthCorrection":result.x[:15].round(4).tolist(),"lengthCorrection":strength,"inferredPassageStations":actual_station.round(5).tolist(),
          "solverConverged":bool(result.success)}
    args.diagnostic.write_text(json.dumps(diag,indent=2)+"\n")
    print(json.dumps({k:diag[k] for k in ["geometricLength","physicalLengthRatio","smallestCentreRadius","maximumWorldShift","nativeCameraWallCheck","solverConverged"]}))


if __name__=="__main__":
    main()
