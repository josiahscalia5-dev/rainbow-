"""Cast the native crest-gap rays through the editable world and test nearer wall clearance."""
import argparse
import json
import sys
from collections import Counter
from pathlib import Path

import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree


def read(path):
    return json.loads(path.read_text())


def blender_xyz(vector):
    x, y, z = vector
    return Vector((x, -z, y))


def sweep_clearance(points, course_rows):
    centres = np.array([r["p"] for r in course_rows])
    delta = points[:, None, :] - centres
    local = [np.einsum("pji,ji->pj", delta, np.array([r[a] for r in course_rows])) for a in ("r","u","t")]
    lateral, vertical, longitudinal = local
    dl = np.maximum(0, np.abs(lateral) - 3.4)
    dv = np.maximum.reduce([np.zeros_like(vertical), -.45-vertical, vertical-2.25])
    ds = np.maximum(0, np.abs(longitudinal) - .135)
    return np.sqrt((dl*dl+dv*dv+ds*ds).min(axis=1))


def camera_clearance(points, film, poses):
    cameras = np.array([frame["camera"] for frame in film["frames"]])
    delta = cameras[1:] - cameras[:-1]
    offset = points[:, None, :] - cameras[:-1]
    factor = np.einsum("pji,ji->pj", offset, delta) / np.maximum((delta*delta).sum(axis=1), 1e-12)
    distance = np.linalg.norm(offset - np.clip(factor,0,1)[:,:,None]*delta,axis=2).min(axis=1)
    still_cameras = np.array([pose["camera"]["position"] for pose in poses if not pose.get("skip")])
    return np.minimum(distance, np.linalg.norm(points[:,None,:]-still_cameras,axis=2).min(axis=1))


def main():
    p = argparse.ArgumentParser(description=__doc__)
    for name in ("blend","camera","mask","course","film","poses","output"):
        p.add_argument(name, type=Path)
    args = p.parse_args(sys.argv[sys.argv.index("--")+1:])
    bpy.ops.wm.open_mainfile(filepath=str(args.blend))
    source_camera = read(args.camera)
    matrix = np.array(source_camera["mw"]).reshape(4,4).T
    eye, orientation = matrix[:3,3], matrix[:3,:3]
    w, h = source_camera["size"]
    focal = h / (2 * np.tan(np.deg2rad(source_camera["fov"])/2))
    mask = bpy.data.images.load(str(args.mask.resolve()))
    mask.colorspace_settings.name = "Non-Color"
    rgba = np.empty(w*h*4, dtype=np.float32)
    mask.pixels.foreach_get(rgba)
    native_mask = rgba.reshape(h,w,4)[::-1,:,1] > .5
    # A hemispherical tube may produce two hits. The camera is inside it, so
    # the first positive hit on that family is the appropriate physical wall.
    trees = []
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH":
            continue
        vertices = [obj.matrix_world @ v.co for v in obj.data.vertices]
        triangles = [face.vertices[:] for face in obj.data.polygons]
        trees.append((obj.get("surface_family"), BVHTree.FromPolygons(vertices, triangles)))
    coordinates = [(x,y) for y in range(578,710,9) for x in range(298,560,9) if native_mask[y,x]]
    def rays(pixels):
        px = np.array(pixels)
        return np.c_[(px[:,0]-w/2)/focal,(h/2-px[:,1])/focal,-np.ones(len(px))] @ orientation.T
    def cast(pixel):
        ray = rays([pixel])[0]
        query = blender_xyz(ray).normalized()
        hits = []
        for kind, tree in trees:
            _, _, face, distance = tree.ray_cast(blender_xyz(eye), query, 600.)
            if face is not None:
                hits.append((distance/np.linalg.norm(ray),kind))
        hits.sort()
        return {"sourcePixel": list(pixel), "firstFamily": hits[0][1], "firstOpticalDepth": round(float(hits[0][0]),4),
                "shellOpticalDepth": next((round(float(z),4) for z,name in hits if name=="wall"), None),
                "waterOpticalDepth": next((round(float(z),4) for z,name in hits if name=="water"), None)}
    results = [cast(pt) for pt in coordinates]
    worst_ray = cast((461,649))
    water_hits = [j for j,row in enumerate(results) if row["firstFamily"] in ("water","bank","foam")]
    needed = rays([coordinates[i] for i in water_hits])
    first = np.array([results[i]["firstOpticalDepth"] for i in water_hits])
    course = read(args.course)
    rows = [r for r in course["rows"] if -4 <= r["s"]-course["inlet"] <= 54]
    film, poses = read(args.film), read(args.poses)
    sampled = []
    for z in (2.,3.,4.,5.,6.,7.,8.,9.,10.,12.):
        points = eye+needed*z
        lane = sweep_clearance(points,rows)
        cameras = camera_clearance(points,film,poses)
        in_front = z < first-.03
        sampled.append({
            "testOpticalDepth":z,"rays":len(points),"inFrontOfWrongSurface":int(in_front.sum()),
            "inFrontAndInsideAssumedSwimmerEnvelope":int((in_front & (lane<.01)).sum()),
            "inFrontWithSwimmerAndSampledCameraClearance":int((in_front & (lane>.20) & (cameras>.35)).sum()),
        })
    result = {
        "scope":"Only native masks in x295–559 and y575–709. One world-space ray per nine native pixels. The 22 modeled meshes are intersected with their transforms. Plane tests are hypothetical clearance tests; no plane is added to the game.",
        "surfaceSamples":len(results),"nearestVisibleFamiliesOnOriginallyPurplePixels":dict(Counter(hit["firstFamily"] for hit in results)),
        "worstCentrelineRay":worst_ray,"constantDepthTests":sampled,
        "assumptions":"Swimming envelope +/-3.4 laterally and -.45 to 2.25 vertically. Clearance threshold .2 for this assumed swimmer volume and .35 for the recorded camera polyline and all 14 camera stations. Additional cameras and non-planar attached walls remain possible.",
        "surfaceHits":results,
    }
    args.output.write_text(json.dumps(result,indent=2)+"\n")
    print(result["surfaceSamples"],result["nearestVisibleFamiliesOnOriginallyPurplePixels"],worst_ray)
    print(sampled)


if __name__ == "__main__":
    main()
