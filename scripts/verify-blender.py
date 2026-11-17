"""Rainbow - Blender verification, run at every session start by scripts/claude-bootstrap.sh (step "Blender render +
GLB check") and by hand:
    blender -b --factory-startup --python scripts/verify-blender.py -- <out_dir>
Checks, all really executed: bpy, the three render engines (Workbench / EEVEE / Cycles) with a real render each of the
Blender-built Screen 05 paddles from the game camera, every tracked .blend opens, the three game GLBs import
(benny, rainbow_girl, lids05 = six gold paddles), and a GLB export -> import round trip that compares the paddle
geometry (triangle counts + rounded world-space vertex positions) exactly, also against the game's lids05.glb.
Writes <out_dir>/results.json and three PNG renders. Read-only for the project: nothing under the repository changes
(first written by session 018Sg3AU as qa/tools_check/blender_transfer_s018/verify_blender.py)."""
import bpy, sys, os, json, time, hashlib, subprocess
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = sys.argv[sys.argv.index("--") + 1]
os.makedirs(out, exist_ok=True)
R = {"blender": bpy.app.version_string, "build_date": bpy.app.build_date.decode(), "bpy": True,
     "background": bpy.app.background, "engines": {}, "renders": [], "blends": [], "glbs": {}, "roundtrip": {}}


def mesh_sig(objs):
    """per-mesh (verts, faces, sha of world-space vertex positions rounded to 0.1 mm), sorted by name"""
    dg = bpy.context.evaluated_depsgraph_get()
    sig = {}
    for o in sorted(objs, key=lambda o: o.name):
        ev = o.evaluated_get(dg)
        me = ev.to_mesh()
        co = np.empty(len(me.vertices) * 3, np.float64)
        me.vertices.foreach_get("co", co)
        co = co.reshape(-1, 3)
        M = np.array(o.matrix_world)
        w = co @ M[:3, :3].T + M[:3, 3]
        w = np.round(w, 4) + 0.0          # +0.0 folds -0.0 into 0.0
        key = np.unique(w, axis=0)        # GLB splits vertices at UV seams: compare the SET of positions
        sig[o.name] = {"verts_unique": int(len(key)), "faces": len(me.polygons),
                       "tris": int(sum(len(p.vertices) - 2 for p in me.polygons)),
                       "bbox_min": [float(x) for x in w.min(0)], "bbox_max": [float(x) for x in w.max(0)],
                       "pos_sha": hashlib.sha256(key.tobytes()).hexdigest()[:16]}
        ev.to_mesh_clear()
    return sig


def img_stats(path):
    """share of pixels that differ from the plain background (corner colour) = the rendered paddles"""
    px = np.array(bpy.data.images.load(path).pixels[:], np.float32).reshape(-1, 4)[:, :3]
    bgc = px[-1]                                     # bottom-right corner is background in this framing
    fg = np.abs(px - bgc).max(1) > 0.06
    return {"background_rgb": [round(float(x), 3) for x in bgc], "foreground_share": round(float(fg.mean()), 4)}


# 1. engines available in this build: the RNA enum is filled dynamically, so probe by selecting each engine
bpy.ops.wm.read_factory_settings(use_empty=True)
for eng in ("BLENDER_WORKBENCH", "BLENDER_EEVEE", "CYCLES"):
    try:
        bpy.context.scene.render.engine = eng
        R["engines"][eng] = bpy.context.scene.render.engine == eng
    except TypeError:
        R["engines"][eng] = False
R["engines"] = {k: v for k, v in R["engines"].items() if v}

# 2. real render with each engine: the Blender-built paddles from the game camera (portrait 864x1536 at 50 %)
LIDS = ROOT + "/qa/pilot05/proj/tunnel/lid/lids05.blend"
for eng in ("BLENDER_WORKBENCH", "BLENDER_EEVEE", "CYCLES"):
    if eng not in R["engines"]:
        R["renders"].append({"engine": eng, "ok": False, "error": "engine not in this build"}); continue
    bpy.ops.wm.open_mainfile(filepath=LIDS)
    sc = bpy.context.scene
    cam = bpy.data.objects.get("Cam05_game") or sc.camera
    sc.camera = cam
    sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 864, 1536, 50
    w = bpy.data.worlds.new("qa_world"); sc.world = w; w.use_nodes = True
    bg = w.node_tree.nodes["Background"]; bg.inputs[0].default_value = (1, 1, 1, 1); bg.inputs[1].default_value = 1.2
    sc.render.engine = eng
    if eng == "BLENDER_WORKBENCH":
        sc.display.shading.light = "FLAT"; sc.display.shading.color_type = "TEXTURE"
    if eng == "CYCLES":
        sc.cycles.device = "CPU"; sc.cycles.samples = 16; sc.cycles.use_denoising = False
    if eng == "BLENDER_EEVEE":
        try: sc.eevee.taa_render_samples = 16
        except Exception: pass
    p = os.path.join(out, f"paddles_{eng}.png")
    sc.render.filepath = p; sc.render.image_settings.file_format = "PNG"
    t = time.time()
    try:
        bpy.ops.render.render(write_still=True)
        st = img_stats(p)
        R["renders"].append({"engine": eng, "ok": os.path.exists(p) and st["foreground_share"] > 0.005, "seconds": round(time.time() - t, 1),
                             "file": os.path.relpath(p, ROOT) if p.startswith(ROOT) else p, "camera": cam.name if cam else None, **st})
    except Exception as e:
        R["renders"].append({"engine": eng, "ok": False, "error": str(e)[:300]})
    print("RENDER", R["renders"][-1])

# 3. every tracked .blend opens
blends = subprocess.run(["git", "-C", ROOT, "ls-files", "*.blend"], capture_output=True, text=True).stdout.split()
for rel in blends:
    try:
        bpy.ops.wm.open_mainfile(filepath=os.path.join(ROOT, rel))
        meshes = [o for o in bpy.data.objects if o.type == "MESH"]
        R["blends"].append({"file": rel, "ok": True, "objects": len(bpy.data.objects), "meshes": len(meshes),
                            "faces": sum(len(o.data.polygons) for o in meshes), "cameras": [o.name for o in bpy.data.objects if o.type == "CAMERA"]})
    except Exception as e:
        R["blends"].append({"file": rel, "ok": False, "error": str(e)[:300]})
    print("BLEND", R["blends"][-1])

# 4. game GLBs import
for g in ("assets/models/benny.glb", "assets/models/rainbow_girl.glb", "assets/models/lids05.glb"):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    try:
        bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT, g))
        meshes = [o for o in bpy.data.objects if o.type == "MESH"]
        R["glbs"][g] = {"ok": len(meshes) > 0, "meshes": len(meshes), "names": sorted(o.name for o in meshes)[:12],
                        "materials": len(bpy.data.materials), "images": len(bpy.data.images),
                        "armatures": len([o for o in bpy.data.objects if o.type == "ARMATURE"]),
                        "actions": len(bpy.data.actions)}
        if g.endswith("lids05.glb"):
            R["glbs"][g]["paddles"] = mesh_sig(meshes)
    except Exception as e:
        R["glbs"][g] = {"ok": False, "error": str(e)[:300]}
    print("GLB", g, {k: v for k, v in R["glbs"][g].items() if k != "paddles"})

# 5. round trip: paddles in lids05.blend -> GLB -> re-import, geometry compared
bpy.ops.wm.open_mainfile(filepath=LIDS)
src_meshes = [o for o in bpy.data.objects if o.type == "MESH"]
src = mesh_sig(src_meshes)
glb = os.path.join(out, "lids05_roundtrip.glb")
bpy.ops.export_scene.gltf(filepath=glb, export_format="GLB", use_selection=False)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
back = mesh_sig([o for o in bpy.data.objects if o.type == "MESH"])
game = R["glbs"].get("assets/models/lids05.glb", {}).get("paddles", {})
same = lambda a, b: {n: (a[n]["pos_sha"] == b.get(n, {}).get("pos_sha") and a[n]["tris"] == b.get(n, {}).get("tris")) for n in a}
R["roundtrip"] = {"glb_bytes": os.path.getsize(glb), "src_meshes": sorted(src), "back_meshes": sorted(back),
                  "blend_vs_roundtrip_identical": same(src, back),
                  "blend_vs_game_glb_identical": same(src, game) if game else "game glb not loaded",
                  "src": src, "back": back}
os.remove(glb)    # the round-trip file is a test product, not an asset
print("ROUNDTRIP", {k: v for k, v in R["roundtrip"].items() if k not in ("src", "back")})
json.dump(R, open(os.path.join(out, "results.json"), "w"), indent=1)
print("WROTE", os.path.join(out, "results.json"))
