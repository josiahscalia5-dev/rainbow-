"""
Build the Screen 05 layout scene in Blender from the game's OWN geometry (no World Labs credits).

    blender -b --python tools/blender/build_05_river_scene.py -- \
        --layout qa/worldlabs/05/blender/river05_layout.json --out-dir qa/worldlabs/05/blender

Input: river05_layout.json from `npx vite-node scripts/export-river-05.ts` (river centre/right/up/width
and cyan-core lateral every 0.25 u, the straight 05 tunnel line + radius, the checkpoint camera).
Builds, in Three.js axes converted to Blender (x, y, z)three → (x, −z, y)blender:
  River05      ribbon mesh of the playable water (width from Course.widthAt), vertex colours:
               cyan core / hot-pink bands from the core lateral, so the S-bends are visible
  CyanCore05   curve along the cyan core (where the coins sit)
  Tunnel05     open cylinder on the straight tunnel line (radius = stage 'tube'), 64 segments
  RingMarks05  thin torus markers every 6 u along the tunnel (alignment marks, not final rings)
  Cam05        the gameplay camera at the 05 checkpoint (if the layout carries it)
Saves screen05_layout.blend, screen05_layout.glb and a Workbench preview from Cam05.
This is the alignment base for a Marble/Atlas tunnel export (tools/blender/import_world_asset.py):
the tunnel comes from the reconstruction, the near river from this real game geometry.
"""
import argparse
import json
import math
import os
import sys

import bpy
from mathutils import Vector


def args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument("--layout", default="qa/worldlabs/05/blender/river05_layout.json")
    ap.add_argument("--out-dir", default="qa/worldlabs/05/blender")
    ap.add_argument("--lateral", type=int, default=24, help="river cross-section segments")
    return ap.parse_args(argv)


def b(v):
    """Three.js (x, y, z) → Blender (x, −z, y)"""
    return Vector((v[0], -v[2], v[1]))


def mat(name, rgba, emit=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = rgba
    if emit:
        bsdf.inputs["Emission Color"].default_value = rgba
        bsdf.inputs["Emission Strength"].default_value = emit
    return m


def main():
    a = args()
    L = json.load(open(a.layout))
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scn = bpy.context.scene
    os.makedirs(a.out_dir, exist_ok=True)

    # ---- river ribbon with cyan/pink vertex colours ------------------------------------------------
    verts, faces, cols = [], [], []
    rows = L["river"]
    n = a.lateral
    for r in rows:
        c, rt = Vector(r["pos"]), Vector(r["right"])
        half = r["width"] / 2
        for j in range(n + 1):
            u = -1 + 2 * j / n
            p = c + rt * (u * half)
            verts.append(b(p))
            # distance from the cyan core (core lateral is along `right`)
            d = abs(u * half - r["core"]) / max(half, 1e-3)
            pink = max(0.0, min(1.0, (d - 0.38) / 0.12)) * (1 - max(0.0, min(1.0, (d - 0.85) / 0.1)))
            cols.append((0.01 + 0.96 * pink, 0.6 * (1 - pink) + 0.22 * pink, 0.95 * (1 - pink) + 0.9 * pink, 1.0))
    for i in range(len(rows) - 1):
        for j in range(n):
            k = i * (n + 1) + j
            faces.append((k, k + 1, k + n + 2, k + n + 1))
    me = bpy.data.meshes.new("River05")
    me.from_pydata(verts, [], faces)
    me.update()
    ca = me.color_attributes.new("Col", "FLOAT_COLOR", "POINT")
    for i, cc in enumerate(cols):
        ca.data[i].color = cc
    river = bpy.data.objects.new("River05", me)
    scn.collection.objects.link(river)
    m = mat("WaterVC", (0.02, 0.6, 0.95, 1))
    nt = m.node_tree
    vc = nt.nodes.new("ShaderNodeVertexColor")
    vc.layer_name = "Col"
    nt.links.new(vc.outputs["Color"], nt.nodes["Principled BSDF"].inputs["Base Color"])
    me.materials.append(m)

    # ---- cyan core curve --------------------------------------------------------------------------
    cd = bpy.data.curves.new("CyanCore05", "CURVE")
    cd.dimensions = "3D"
    sp = cd.splines.new("POLY")
    pts = [b(Vector(r["pos"]) + Vector(r["right"]) * r["core"] + Vector(r["up"]) * 0.05) for r in rows]
    sp.points.add(len(pts) - 1)
    for i, p in enumerate(pts):
        sp.points[i].co = (p.x, p.y, p.z, 1)
    cd.bevel_depth = 0.06
    core = bpy.data.objects.new("CyanCore05", cd)
    scn.collection.objects.link(core)
    core.data.materials.append(mat("Core", (0.0, 0.85, 1.0, 1), emit=2.0))

    # ---- tunnel + ring marks on the straight 05 line --------------------------------------------------
    T = L.get("tunnel")
    if T:
        A, B = b(T["a"]), b(T["b"])
        axis = B - A
        length = axis.length
        mid = (A + B) / 2
        bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=T["radius"], depth=length, end_fill_type="NOTHING", location=mid)
        tun = bpy.context.active_object
        tun.name = "Tunnel05"
        tun.rotation_mode = "QUATERNION"
        tun.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(axis.normalized())
        tun.data.materials.append(mat("WallMagenta", (0.6, 0.12, 0.66, 1)))
        tun.display_type = "WIRE"
        rings = bpy.data.collections.new("RingMarks05")
        scn.collection.children.link(rings)
        k = 0
        t = 0.0
        while t <= length:
            bpy.ops.mesh.primitive_torus_add(major_radius=T["radius"], minor_radius=0.08, major_segments=96, minor_segments=8,
                                             location=A + axis.normalized() * t)
            o = bpy.context.active_object
            o.name = f"RingMark05_{k:02d}"
            o.rotation_mode = "QUATERNION"
            o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(axis.normalized())
            o.data.materials.append(mat(f"Gold{k}", (1.0, 0.72, 0.2, 1)))
            for cl in o.users_collection:
                cl.objects.unlink(o)
            rings.objects.link(o)
            k += 1
            t += 6.0

    # ---- gameplay camera ----------------------------------------------------------------------------
    cp = L.get("checkpoint", {})
    cam = None
    if cp.get("camera") and cp.get("look"):
        cdat = bpy.data.cameras.new("Cam05")
        cdat.sensor_fit = "VERTICAL"
        cdat.angle_y = math.radians(cp.get("fov") or 62)
        cam = bpy.data.objects.new("Cam05", cdat)
        scn.collection.objects.link(cam)
        cam.location = b(cp["camera"])
        cam.rotation_mode = "QUATERNION"
        cam.rotation_quaternion = (b(cp["look"]) - cam.location).to_track_quat("-Z", "Y")
        scn.camera = cam
    bm = bpy.data.objects.new("Benny05_marker", None)
    bm.empty_display_type = "SPHERE"
    bm.empty_display_size = 0.9
    bm.location = b(cp["benny"]) + Vector((0, 0, 0.9))
    scn.collection.objects.link(bm)

    blend = os.path.join(a.out_dir, "screen05_layout.blend")
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(blend))
    bpy.ops.export_scene.gltf(filepath=os.path.abspath(os.path.join(a.out_dir, "screen05_layout.glb")), export_format="GLB",
                              export_cameras=True, export_apply=True)
    if cam:
        scn.render.engine = "BLENDER_WORKBENCH"
        scn.display.shading.light = "STUDIO"
        scn.display.shading.color_type = "VERTEX"
        scn.render.resolution_x, scn.render.resolution_y = 432, 768
        scn.render.filepath = os.path.abspath(os.path.join(a.out_dir, "screen05_layout_cam05.png"))
        bpy.ops.render.render(write_still=True)
    print("saved", blend, "river verts", len(verts), "tunnel", bool(T), "camera", bool(cam))


main()
