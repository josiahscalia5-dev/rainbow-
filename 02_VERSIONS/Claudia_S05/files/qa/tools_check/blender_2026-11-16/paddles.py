import bpy, os, sys, time
out = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.open_mainfile(filepath="/home/user/rainbow-/qa/pilot05/proj/tunnel/lid/lids05.blend")
sc = bpy.context.scene
for im in bpy.data.images:
    ok = im.has_data or (im.packed_file is not None) or os.path.exists(bpy.path.abspath(im.filepath))
    print("IMAGE", im.name, "packed" if im.packed_file else bpy.path.abspath(im.filepath), "size", tuple(im.size), "found" if ok else "MISSING")
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 864, 1536, 50
sc.render.film_transparent = False
w = bpy.data.worlds.new("qa_world"); sc.world = w; w.use_nodes = True
w.node_tree.nodes["Background"].inputs[0].default_value = (0.08, 0.02, 0.1, 1); w.node_tree.nodes["Background"].inputs[1].default_value = 1.0
for eng, name in (("BLENDER_WORKBENCH", "paddles_workbench_texture"), ("CYCLES", "paddles_cycles_lit")):
    sc.render.engine = eng
    if eng == "BLENDER_WORKBENCH":
        sc.display.shading.light = "FLAT"; sc.display.shading.color_type = "TEXTURE"
    else:
        sc.cycles.device = "CPU"; sc.cycles.samples = 32
        w.node_tree.nodes["Background"].inputs[0].default_value = (1, 1, 1, 1); w.node_tree.nodes["Background"].inputs[1].default_value = 1.2
    sc.render.filepath = os.path.join(out, name + ".png")
    t = time.time(); bpy.ops.render.render(write_still=True)
    print("RENDER OK", name, f"{time.time()-t:.1f}s")
