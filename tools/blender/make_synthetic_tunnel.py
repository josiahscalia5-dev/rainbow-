"""Test fixture: a 'Marble-like' tunnel GLB with KNOWN dimensions (radius 3.0, length 60, rings every 6),
deliberately rotated/offset, so tools/blender/import_world_asset.py can be verified without any credits.
    blender -b --python tools/blender/make_synthetic_tunnel.py -- OUT.glb"""
import math, sys, bpy
out = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_homefile(use_empty=True)
bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=3.0, depth=60.0, end_fill_type="NOTHING")
tube = bpy.context.active_object
bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.subdivide(number_cuts=40); bpy.ops.object.mode_set(mode="OBJECT")
for i in range(10):
    bpy.ops.mesh.primitive_torus_add(major_radius=2.95, minor_radius=0.18, major_segments=96, minor_segments=12,
                                     location=(0, 0, -27 + i * 6.0))
bpy.ops.object.select_all(action="SELECT"); bpy.context.view_layer.objects.active = tube; bpy.ops.object.join()
o = bpy.context.active_object
o.rotation_euler = (math.radians(35), math.radians(-20), math.radians(50)); o.location = (4.0, -7.0, 2.5)
bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", export_yup=True)
print("SYNTH_OK", out)
