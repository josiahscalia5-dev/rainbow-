"""
Import a World Labs export (Marble world GLB mesh / PLY splats, or an Atlas splats2Mesh GLB) into
Blender, align it to the Rainbow tube convention, measure it, and write a light underlay for the
environment modeler. It costs no World Labs credits: it only reads files you already exported.

    blender -b --python tools/blender/import_world_asset.py -- \
        --in path/to/world.glb [--ply path/to/splats.ply] \
        --name marble05 [--target-radius 7.6] [--decimate 0.25] [--out-dir qa/worldlabs/05/import]

Outputs (in --out-dir):
  <name>_underlay.glb    aligned, scaled, decimated mesh (tunnel axis = -Z, i.e. Three.js forward;
                         centre line on the origin; radius scaled to --target-radius)
  <name>.blend           the Blender scene (original import kept in its own hidden collection)
  <name>_measure.json    axis, length, radius stats, ring-like cross-section peaks, scale applied
  <name>_preview.png     Workbench render from the tunnel axis looking down -Z (rear-camera view)

The underlay is a modelling/measurement aid. The playable tube, rings and animated water stay
real-time Three.js geometry/shaders (CLAUDE.md: no static substitutes in gameplay).
"""
import argparse
import json
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Matrix, Vector


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp", required=True, help="GLB/GLTF mesh exported from Marble or Atlas")
    ap.add_argument("--ply", default=None, help="optional PLY splats/points to import alongside (not aligned by PCA)")
    ap.add_argument("--name", default="world")
    ap.add_argument("--target-radius", type=float, default=7.6, help="Rainbow 05 tube radius (src/world/course.ts)")
    ap.add_argument("--decimate", type=float, default=0.25, help="collapse ratio for the underlay (1 = keep all)")
    ap.add_argument("--out-dir", default="qa/worldlabs/import")
    ap.add_argument("--no-preview", action="store_true")
    ap.add_argument("--flip", action="store_true", help="reverse the detected tunnel direction")
    return ap.parse_args(argv)


def reset_scene():
    bpy.ops.wm.read_homefile(use_empty=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)


def import_mesh(path):
    before = set(bpy.data.objects)
    ext = os.path.splitext(path)[1].lower()
    if ext in (".glb", ".gltf"):
        bpy.ops.import_scene.gltf(filepath=path)
    elif ext == ".obj":
        bpy.ops.wm.obj_import(filepath=path)
    elif ext == ".ply":
        bpy.ops.wm.ply_import(filepath=path)
    else:
        raise SystemExit(f"unsupported mesh format: {ext}")
    objs = [o for o in bpy.data.objects if o not in before and o.type == "MESH"]
    if not objs:
        raise SystemExit(f"no mesh objects found in {path}")
    return objs


def world_vertices(objs):
    pts = []
    for o in objs:
        m = np.array(o.matrix_world)
        v = np.empty(len(o.data.vertices) * 3, dtype=np.float64)
        o.data.vertices.foreach_get("co", v)
        v = v.reshape(-1, 3)
        v = (np.c_[v, np.ones(len(v))] @ m.T)[:, :3]
        pts.append(v)
    return np.concatenate(pts)


def principal_axis(p):
    c = p.mean(axis=0)
    _, s, vt = np.linalg.svd(p - c, full_matrices=False)
    return c, vt[0], s


def measure(p, centre, axis, nbins=60):
    d = p - centre
    t = d @ axis                                   # position along the axis
    radial = d - np.outer(t, axis)
    r = np.linalg.norm(radial, axis=1)
    t0, t1 = np.percentile(t, [1, 99])
    keep = (t >= t0) & (t <= t1)
    edges = np.linspace(t0, t1, nbins + 1)
    idx = np.clip(np.digitize(t[keep], edges) - 1, 0, nbins - 1)
    per_bin_r = [float(np.median(r[keep][idx == i])) if np.any(idx == i) else None for i in range(nbins)]
    per_bin_n = [int(np.sum(idx == i)) for i in range(nbins)]
    # ring-like features: cross-sections with clearly more geometry than their neighbours
    n = np.array(per_bin_n, dtype=float)
    base = np.convolve(n, np.ones(7) / 7, mode="same")
    peaks = [i for i in range(1, nbins - 1) if n[i] > 1.35 * base[i] and n[i] >= n[i - 1] and n[i] >= n[i + 1]]
    ring_t = [float((edges[i] + edges[i + 1]) / 2) for i in peaks]
    spacing = float(np.median(np.diff(ring_t))) if len(ring_t) > 2 else None
    return {
        "length": float(t1 - t0),
        "radius_median": float(np.median(r[keep])),
        "radius_p10_p90": [float(x) for x in np.percentile(r[keep], [10, 90])],
        "radius_per_section": per_bin_r,
        "ring_like_sections_t": ring_t,
        "ring_spacing_median": spacing,
        "t_range": [float(t0), float(t1)],
    }


def align_matrix(centre, axis, up_hint, scale):
    """Matrix taking world points to: axis -> +Y (Blender), which the Y-up glTF export turns into -Z (Three.js forward)."""
    fwd = Vector(axis).normalized()
    up = Vector(up_hint)
    up = (up - fwd * up.dot(fwd)).normalized() if (up - fwd * up.dot(fwd)).length > 1e-6 else fwd.orthogonal().normalized()
    right = fwd.cross(up).normalized()
    rot = Matrix((right, fwd, up)).to_4x4()      # maps world -> (right, fwd, up) coordinates
    return Matrix.Scale(scale, 4) @ rot @ Matrix.Translation(-Vector(centre))


def main():
    a = parse_args()
    os.makedirs(a.out_dir, exist_ok=True)
    reset_scene()
    src = bpy.data.collections.new(f"{a.name}_source")
    bpy.context.scene.collection.children.link(src)
    objs = import_mesh(a.inp)
    for o in objs:
        for c in o.users_collection:
            c.objects.unlink(o)
        src.objects.link(o)

    p = world_vertices(objs)
    centre, axis, sv = principal_axis(p)
    # pick the axis sign so that it points into the larger half (deeper part of the tunnel) consistently
    if np.median((p - centre) @ axis) < 0:
        axis = -axis
    if a.flip:
        axis = -axis
    m = measure(p, centre, axis)
    scale = a.target_radius / m["radius_median"] if m["radius_median"] > 1e-9 else 1.0
    up_hint = (0.0, 0.0, 1.0)  # Blender Z-up after glTF import
    M = align_matrix(centre, axis, up_hint, scale)

    # aligned working copy: joined, transformed, decimated
    under = bpy.data.collections.new(f"{a.name}_underlay")
    bpy.context.scene.collection.children.link(under)
    copies = []
    for o in objs:
        c = o.copy()
        c.data = o.data.copy()
        under.objects.link(c)
        copies.append(c)
    bpy.ops.object.select_all(action="DESELECT")
    for c in copies:
        c.select_set(True)
    bpy.context.view_layer.objects.active = copies[0]
    if len(copies) > 1:
        bpy.ops.object.join()
    u = bpy.context.view_layer.objects.active
    u.name = f"{a.name}_underlay"
    u.data.transform(M @ u.matrix_world)
    u.matrix_world = Matrix.Identity(4)
    tris_before = sum(len(poly.vertices) - 2 for poly in u.data.polygons)
    if a.decimate < 1.0:
        mod = u.modifiers.new("decimate", "DECIMATE")
        mod.ratio = a.decimate
        bpy.ops.object.modifier_apply(modifier=mod.name)
    tris_after = sum(len(poly.vertices) - 2 for poly in u.data.polygons)
    src.hide_viewport = True
    src.hide_render = True

    if a.ply:
        before = set(bpy.data.objects)
        bpy.ops.wm.ply_import(filepath=a.ply)
        for o in set(bpy.data.objects) - before:
            o.matrix_world = M @ o.matrix_world
            o.name = f"{a.name}_splats"

    glb = os.path.join(a.out_dir, f"{a.name}_underlay.glb")
    bpy.ops.object.select_all(action="DESELECT")
    u.select_set(True)
    bpy.ops.export_scene.gltf(filepath=glb, use_selection=True, export_format="GLB", export_yup=True)

    preview = None
    if not a.no_preview:
        scn = bpy.context.scene
        cam = bpy.data.objects.new("rear_cam", bpy.data.cameras.new("rear_cam"))
        scn.collection.objects.link(cam)
        # inside the tunnel near its start, slightly above the floor, looking down the axis (+Y blender)
        t0 = m["t_range"][0] * scale
        cam.location = Vector((0.0, t0 + 0.05 * m["length"] * scale, -0.25 * a.target_radius))
        cam.rotation_euler = (math.radians(90), 0.0, 0.0)
        cam.data.lens_unit = "FOV"
        cam.data.angle = math.radians(62)
        scn.camera = cam
        scn.render.engine = "BLENDER_WORKBENCH"
        scn.display.shading.light = "STUDIO"
        scn.display.shading.color_type = "OBJECT"
        scn.render.resolution_x, scn.render.resolution_y = 432, 768
        preview = os.path.join(a.out_dir, f"{a.name}_preview.png")
        scn.render.filepath = os.path.abspath(preview)
        bpy.ops.render.render(write_still=True)

    blend = os.path.join(a.out_dir, f"{a.name}.blend")
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(blend))
    report = {
        "input": a.inp, "ply": a.ply, "objects": [o.name for o in objs],
        "centre": [float(x) for x in centre], "axis": [float(x) for x in axis],
        "singular_values": [float(x) for x in sv],
        "measure_source_units": m, "scale_applied": scale, "target_radius": a.target_radius,
        "triangles": {"before_decimate": tris_before, "after_decimate": tris_after},
        "outputs": {"underlay_glb": glb, "blend": blend, "preview": preview},
        "convention": "underlay GLB: tunnel axis -Z (Three.js forward), centre line on origin, +Y up",
    }
    with open(os.path.join(a.out_dir, f"{a.name}_measure.json"), "w") as f:
        json.dump(report, f, indent=2)
    print("IMPORT_OK", json.dumps({k: report[k] for k in ("scale_applied", "triangles", "outputs")}))


main()
