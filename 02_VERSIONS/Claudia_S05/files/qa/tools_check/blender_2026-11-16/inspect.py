import bpy
bpy.ops.wm.open_mainfile(filepath="/home/user/rainbow-/qa/pilot05/proj/tunnel/lid/lids05.blend")
sc=bpy.context.scene
print("SCENE", sc.name, "engine", sc.render.engine, "res", sc.render.resolution_x, sc.render.resolution_y, "camera", sc.camera and sc.camera.name)
print("WORLD", sc.world and sc.world.name, sc.world and sc.world.use_nodes)
for o in sc.objects:
    extra=""
    if o.type=="CAMERA": extra=f"lens {o.data.lens:.1f} clip {o.data.clip_start}-{o.data.clip_end} type {o.data.type}"
    if o.type=="LIGHT": extra=f"{o.data.type} energy {o.data.energy}"
    if o.type=="MESH": extra=f"mats {[m.name for m in o.data.materials if m]} verts {len(o.data.vertices)} hide_render {o.hide_render}"
    print("OBJ", o.type, o.name, tuple(round(v,2) for v in o.location), extra)
for m in bpy.data.materials:
    nodes=[n.type for n in m.node_tree.nodes] if m.use_nodes else []
    print("MAT", m.name, nodes)
