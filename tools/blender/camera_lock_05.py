"""
Screen 05 CAMERA LOCK scene in Blender 5.3 (coordinator tool, wave 6).

    npx vite-node scripts/export-river-05.ts -- --cam=X,Y,Z --look=X,Y,Z --fov=62      (river05_layout.json)
    blender -b --python tools/blender/build_05_river_scene.py -- --layout ... --out-dir OUT
    blender -b OUT/screen05_layout.blend --python tools/blender/camera_lock_05.py -- \
        --camera qa/pilot05/wave6/camera_lock/camera05.json \
        --landmarks qa/pilot05/wave6/camera_lock/landmarks.json \
        --reference references/05_flow_into_the_current.png --out-dir qa/pilot05/wave6/camera_lock

Inputs come from the REAL game (scripts/camera-lock-05.mjs reads window.__rainbow.camera() at the 05
checkpoint): the exact camera world matrix, vertical FOV and aspect, plus the reference landmarks
back-projected through that camera onto the river. This script
  * sets Cam05 to that exact matrix (Three.js → Blender axes already applied in camera05.json),
    VERTICAL sensor fit, 864×1536 — the lock every specialist works against;
  * loads the approved reference as Cam05's background image (for interactive matching in the GUI);
  * adds RefCoins05 (gold spheres at the reference coins' back-projected world positions) and
    GameCoins05 (cyan spheres at the game's 05 coin anchors) so the S-path agreement is visible in 3D;
  * renders a Workbench layout pass from Cam05 (transparent film) → camera_lock_render.png;
saves screen05_camera_lock.blend. The 50 % overlay with the reference is composited afterwards
(scripts/camera-lock-overlay.py) so the reference file is only ever read, never modified.
"""
import argparse
import json
import math
import os
import sys

import bpy
from mathutils import Matrix, Vector


def args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument("--camera", required=True)
    ap.add_argument("--landmarks", required=True)
    ap.add_argument("--reference", required=True)
    ap.add_argument("--out-dir", required=True)
    return ap.parse_args(argv)


def b(v):
    """Three.js (x, y, z) → Blender (x, −z, y)"""
    return Vector((v[0], -v[2], v[1]))


def sphere(name, loc, r, color, coll):
    me = bpy.data.meshes.new(name)
    import bmesh
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=8, radius=r)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.location = loc
    ob.color = color
    coll.objects.link(ob)
    return ob


def main():
    a = args()
    os.makedirs(a.out_dir, exist_ok=True)
    camj = json.load(open(a.camera))
    lm = json.load(open(a.landmarks))
    scn = bpy.context.scene

    # ---- camera: the exact live game pose
    cam = bpy.data.objects.get("Cam05")
    if cam is None:
        cdat = bpy.data.cameras.new("Cam05")
        cam = bpy.data.objects.new("Cam05", cdat)
        scn.collection.objects.link(cam)
    cd = cam.data
    cd.sensor_fit = "VERTICAL"
    cd.angle_y = math.radians(camj["blender"]["vfovDeg"])
    cd.clip_start = camj["three"]["near"]
    cd.clip_end = min(camj["three"]["far"], 2000.0)
    rows = camj["blender"]["matrixWorldRowMajor"]
    cam.matrix_world = Matrix([rows[0:4], rows[4:8], rows[8:12], rows[12:16]])
    scn.camera = cam
    W, H = camj["blender"]["resolution"]
    scn.render.resolution_x, scn.render.resolution_y = W, H
    scn.render.resolution_percentage = 100

    # ---- reference as camera background (GUI matching; not rendered)
    img = bpy.data.images.load(os.path.abspath(a.reference), check_existing=True)
    cd.show_background_images = True
    cd.background_images.clear()
    bg = cd.background_images.new()
    bg.image = img
    bg.alpha = 0.5
    bg.display_depth = "FRONT"
    bg.frame_method = "FIT"

    # ---- landmark markers
    coll = bpy.data.collections.get("CameraLock05") or bpy.data.collections.new("CameraLock05")
    if coll.name not in scn.collection.children:
        scn.collection.children.link(coll)
    for i, c in enumerate(lm["coins"]["ref"]):
        if c.get("world"):
            sphere(f"RefCoin05_{i}", b(c["world"]), 0.45, (1.0, 0.8, 0.1, 1.0), coll)
    # game coin anchors are in (s, lat) — resolve them on the river samples of the layout (River05 data)
    river = None
    lay = os.path.join(os.path.dirname(bpy.data.filepath), "river05_layout.json")
    if os.path.exists(lay):
        river = json.load(open(lay)).get("river")
    if river:
        def at(s, lat):
            best = min(river, key=lambda r: abs(r["s"] - s))
            p = Vector(best["pos"]) + Vector(best["right"]) * lat + Vector(best["up"]) * 1.2
            return b(p)
        for i, d in enumerate(lm["coins"]["gameDefs05"]):
            sphere(f"GameCoin05_{i}", at(d["s"], d["lat"]), 0.3, (0.1, 0.9, 1.0, 1.0), coll)

    # ---- Workbench layout render from Cam05 (object colours: markers gold/cyan, river vertex colours)
    scn.render.engine = "BLENDER_WORKBENCH"
    sh = scn.display.shading
    sh.light = "FLAT"
    sh.color_type = "VERTEX"
    scn.render.film_transparent = True
    out_png = os.path.abspath(os.path.join(a.out_dir, "camera_lock_render.png"))
    scn.render.filepath = out_png
    bpy.ops.render.render(write_still=True)
    # a second pass with object colours so the markers read clearly
    sh.color_type = "OBJECT"
    out_png2 = os.path.abspath(os.path.join(a.out_dir, "camera_lock_markers.png"))
    scn.render.filepath = out_png2
    bpy.ops.render.render(write_still=True)

    blend = os.path.abspath(os.path.join(a.out_dir, "screen05_camera_lock.blend"))
    bpy.ops.wm.save_as_mainfile(filepath=blend)
    print("CAMERA_LOCK_OK", json.dumps({"blend": blend, "render": out_png, "markers": out_png2, "resolution": [W, H], "vfov": camj["blender"]["vfovDeg"]}))


main()
