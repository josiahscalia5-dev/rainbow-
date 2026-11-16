import bpy, sys, glob, os
root = "/home/user/rainbow-"
for f in sorted(glob.glob(root + "/**/*.blend", recursive=True)):
    if "/node_modules/" in f: continue
    bpy.ops.wm.open_mainfile(filepath=f)
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    tris = sum(len(o.data.polygons) for o in meshes)
    print(f"BLEND OK  {os.path.relpath(f, root)}: {len(bpy.data.objects)} objects, {len(meshes)} meshes, {tris} faces")
for g in ["assets/models/lids05.glb", "assets/models/benny.glb", "assets/models/rainbow_girl.glb"]:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=os.path.join(root, g))
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    print(f"GLB OK    {g}: {len(meshes)} meshes: {[o.name for o in meshes][:8]}")
