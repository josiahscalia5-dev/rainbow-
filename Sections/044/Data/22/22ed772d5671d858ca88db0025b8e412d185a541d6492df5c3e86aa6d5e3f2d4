"""Fit Screen 06 garment landmarks and the native pink coat swatch to the existing actor.

This works in the hat's own parent space. All recorded root, pose, route and camera matrices
stay fixed. The small fur-edge offset is calibrated against Claudia's game capture.
"""
import argparse
import json
import struct
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.optimize import least_squares
from scipy.spatial.transform import Rotation


def json_file(path):
    return json.loads(path.read_text())


def write_json(path, data):
    path.write_text(json.dumps(data, indent=2) + "\n")


def model_points(file):
    raw = file.read_bytes()
    length = struct.unpack_from("<I", raw, 12)[0]
    gltf = json.loads(raw[20:20 + length])
    data = raw[28 + length:]
    def read(accessor):
        a = gltf["accessors"][accessor]
        view = gltf["bufferViews"][a["bufferView"]]
        offset = a.get("byteOffset", 0) + view.get("byteOffset", 0)
        return np.ndarray((a["count"], 3), dtype="<f4", buffer=data, offset=offset,
                          strides=(view.get("byteStride", 12), 4)).astype(float)
    return {node["name"]: read(gltf["meshes"][node["mesh"]]["primitives"][0]["attributes"]["POSITION"])
            for node in gltf["nodes"] if "mesh" in node}


def transform(points, matrix):
    return points @ matrix[:3,:3].T + matrix[:3,3]


def fit_hat(model, recorded, approved, native_parts):
    points = model_points(model)
    state = recorded["geometryAndPose"]["opening"]
    matrices = {n["name"]: np.array(n["matrixWorld"]).reshape(4,4).T for n in state["meshes"]}
    camera = state["camera"]
    camera_inv = np.linalg.inv(np.array(camera["matrixWorld"]).reshape(4,4).T)
    focal = .5 * camera["height"] / np.tan(np.deg2rad(camera["fov"]) * .5)
    def project(world):
        coords = transform(world, camera_inv)
        return np.column_stack((camera["width"]/2 - focal*coords[:,0]/coords[:,2],
                                camera["height"]/2 + focal*coords[:,1]/coords[:,2]))
    pieces = ["hat_brim","hat_crown","hat_star","fur_pom"]
    hat = matrices["hat"]
    local = {key:transform(transform(points[key],matrices[key]),np.linalg.inv(hat)) for key in pieces}
    pivot = local["fur_pom"].mean(0)
    def rectangle(v):
        return np.r_[v.min(0),v.max(0)]
    def rectangles(params):
        scale, pitch, roll, x, y, z, pom_y = params
        rot = Rotation.from_euler("xz", [pitch,roll]).as_matrix()
        pixels = {}
        for key, vertices in local.items():
            p = vertices.copy()
            if key=="fur_pom":
                p[:,1] = pivot[1] + (p[:,1]-pivot[1])*pom_y
            p = (p * scale) @ rot.T + np.array([x,y,z])
            pixels[key] = project(transform(p,hat))
        return {**{k:rectangle(v) for k,v in pixels.items()},
                "hat":rectangle(np.concatenate(list(pixels.values())))}
    original_pose = np.array([1.,0.,0.,0.,0.,0.,1.])
    original_calc = rectangles(original_pose)
    calibrate = {k:np.asarray(native_parts[k]["visibleBoundsXYXY"])-original_calc[k]
                 for k in ("hat","hat_brim","fur_pom")}
    calibrate["hat_star"] = np.zeros(4)
    img = np.asarray(Image.open(approved).convert("RGB"), dtype=float)
    x0,y0,x1,y1=455,888,565,982
    red,green,blue = img[y0:y1,x0:x1].transpose(2,0,1)
    mask = (red>190)&(green>137)&(green>blue+55)
    yy,xx=np.where(mask)
    # Source landmarks are in original, unscaled image coordinates. The bounds of the yarn
    # and pom are hand-read with +/-8 px uncertainty. The star is directly segmented.
    targets={"hat":[261,731,574,1026],"hat_brim":[261,924,572,1026],
             "fur_pom":[326,731,499,878],"hat_star":[int(xx.min()+x0),int(yy.min()+y0),
                                                      int(xx.max()+x0),int(yy.max()+y0)]}
    weights={"hat":[1.,1.,1.,1.8],"hat_brim":[.45,.4,.45,2.1],
             "fur_pom":[.8,1.,.8,1.],"hat_star":[.6,.6,.6,.6]}
    def residual(params):
        estimates=rectangles(params)
        deltas=[(estimates[k]+calibrate[k]-v)*weights[k] for k,v in targets.items()]
        # Prefer a hat seated over the crown and modest changes to the original fitting.
        scale,pitch,roll,x,y,z,py=params
        deltas.append(np.array([15*(1.-scale), 10*pitch, 20*roll, 30*x, 12*y, 45*z, 12*(1.-py)]))
        return np.concatenate(deltas)
    fit=least_squares(residual,original_pose,
       bounds=([.80,-.76,-.2,-.22,-.15,-.22,.72],[1.02,.76,.2,.22,.37,.22,1.02]),
       max_nfev=180)
    shaped=rectangles(fit.x)
    return {"parameterOrder":["scale","localPitchRadians","localRollRadians","localX","localY","localZ","pomVertical"],
            "parameters":fit.x.tolist(),"nativeTargetXYXY":targets,
            "projectedCandidateXYXY":{k:(shaped[k]+calibrate[k]).round(2).tolist() for k in targets},
            "estimatedFitRmsPx":round(float(np.sqrt(np.mean(np.concatenate(
                [shaped[k]+calibrate[k]-v for k,v in targets.items()])**2))),2),
            "sourceUncertaintyPx":8}


def fit_pink(original, previous, before, hidden_body, swatch, output):
    def rgb(path):return np.asarray(Image.open(path).convert("RGB"),dtype=float)
    ref,last,retained,without = map(rgb,[original,previous,before,hidden_body])
    mask = abs(retained-without).sum(2)>30.
    core=np.zeros(mask.shape,dtype=bool)
    core[1080:1176,327:535]=True
    core &= mask
    def linear(v):
        a=v/255.
        return np.where(a<.04045,a/12.92,((a+.055)/1.055)**2.4)
    quantiles=[24.,52.,81.]
    target=np.percentile(ref[core],quantiles,axis=0)
    observed=np.percentile(last[core],quantiles,axis=0)
    feedback=np.clip((linear(target)/np.maximum(.004,linear(observed)))**.77,
                     [.57,.49,.72],[1.18,1.35,1.19])
    data=np.asarray(Image.open(swatch).convert("RGBA")).copy()
    relief=data[:,:,3]/255.
    new=data[:,:,:3].astype(float)
    depth=np.percentile(relief,quantiles)
    for channel in range(3):
        factor=np.interp(relief,depth,feedback[:,channel])
        new[:,:,channel]*=factor
    data[:,:,:3]=np.rint(np.clip(new,0,255)).astype(np.uint8)
    Image.fromarray(data).save(output)
    return {"nativeCoreXYXY":[327,1080,535,1176],"bodyPixels":int(core.sum()),"quantiles":quantiles,
            "nativeTargetSRGB":target.tolist(),"previousLayeredCoatSRGB":observed.tolist(),
            "linearClampedAlbedoMultipliers":feedback.tolist(),"priorTileAlphaPreserved":True}


if __name__=="__main__":
    parser=argparse.ArgumentParser(description=__doc__)
    for field in ["game","prior_geometry","parts","previous_opening","before_opening","body_hidden","output"]:
        parser.add_argument(field,type=Path)
    paths=parser.parse_args()
    source=paths.game/"references/06_crest_the_rinse_arch.png"
    hat=fit_hat(paths.game/"assets/models/benny.glb",json_file(paths.prior_geometry),source,json_file(paths.parts))
    fur=fit_pink(source,paths.previous_opening,paths.before_opening,paths.body_hidden,
                 paths.game/"assets/textures/match06/coat-locks.png",
                 paths.game/"assets/textures/match06/benny-reference-pink.png")
    write_json(paths.output,{"hat":hat,"fur":fur})
    print("Fitted the source hat landmarks and three pink fur luminance quantiles.")
