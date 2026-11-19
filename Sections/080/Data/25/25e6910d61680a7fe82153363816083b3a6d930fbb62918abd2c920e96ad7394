import bpy, sys, os, time, math
out = sys.argv[sys.argv.index("--") + 1]
def ensure_cam_light(target_objs):
    sc = bpy.context.scene
    if sc.camera is None:
        bpy.ops.object.camera_add(location=(0, -6, 2), rotation=(math.radians(75), 0, 0))
        sc.camera = bpy.context.object
        # frame the meshes
        bpy.ops.object.select_all(action="DESELECT")
        for o in target_objs: o.select_set(True)
        bpy.ops.view3d.camera_to_view_selected() if bpy.context.area else None
    if not any(o.type == "LIGHT" for o in sc.objects):
        bpy.ops.object.light_add(type="SUN", location=(0, -3, 6)); bpy.context.object.data.energy = 4
def render(blend, name, engine, res=(432, 768), samples=16):
    bpy.ops.wm.open_mainfile(filepath=blend)
    sc = bpy.context.scene
    meshes = [o for o in sc.objects if o.type == "MESH"]
    ensure_cam_light(meshes)
    sc.render.engine = engine
    if engine == "CYCLES":
        sc.cycles.device = "CPU"; sc.cycles.samples = samples; sc.cycles.use_denoising = False
    sc.render.resolution_x, sc.render.resolution_y = res; sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = "PNG"
    sc.render.filepath = os.path.join(out, f"{name}_{engine}.png")
    t = time.time()
    try:
        bpy.ops.render.render(write_still=True)
        print(f"RENDER OK  {name} {engine} {res[0]}x{res[1]} in {time.time()-t:.1f}s -> {sc.render.filepath} (camera {sc.camera.name}, {len(meshes)} meshes)")
    except Exception as e:
        print(f"RENDER FAIL {name} {engine}: {e}")
root = "/home/user/rainbow-"
render(root + "/qa/pilot05/wave6/camera_lock/screen05_camera_lock.blend", "screen05_camera_lock", "CYCLES")
render(root + "/qa/pilot05/proj/tunnel/lid/lids05.blend", "paddles_lids05", "CYCLES", res=(640, 360), samples=32)
render(root + "/qa/pilot05/wave6/camera_lock/screen05_camera_lock.blend", "screen05_camera_lock", "BLENDER_EEVEE")
# GLB export round-trip of the paddles
bpy.ops.wm.open_mainfile(filepath=root + "/qa/pilot05/proj/tunnel/lid/lids05.blend")
glb = os.path.join(out, "lids05_roundtrip.glb")
bpy.ops.export_scene.gltf(filepath=glb, export_format="GLB")
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
print("GLB ROUNDTRIP OK", os.path.getsize(glb), "bytes,", len([o for o in bpy.data.objects if o.type == "MESH"]), "meshes:", sorted(o.name for o in bpy.data.objects if o.type == "MESH"))
