"""
Screen 05 MARBLE FEASIBILITY — Blender 5.3 camera projection of the user's ORIGINAL water artwork onto
(a) Marble's reconstructed river surface and (b) the ideal flat river floor, from the camera that reproduces the
approved 864x1536 frame (Marble origin camera fitted in qa/pilot05/marble_feas/splat_fit_full.json, lens shift
for the full frame). No Marble API calls, no credits.

    blender -b --python tools/blender/marble05_projection.py -- --scene-dir DIR --artwork PNG --out-dir OUT [--blend OUT.blend]

DIR holds marble_river.obj, flat_river.obj, scene.json (tools/marble05/build_meshes.py). Steps:
  * Cam05_MarbleLocked: 864x1536, vertical sensor fit, focal from f_px, shift_y for the principal point, pitch;
  * camera projection -> UV map "ProjUV" from the camera's own projection matrix (Blender's UV Project modifier
    ignores lens shift: measured and reported), checked against Blender's world_to_camera_view;
  * unlit emission material = artwork (Standard view transform, so the artwork colours come out unchanged);
  * renders (transparent film): river layer from the locked camera and from the moved camera (1 tunnel radius ahead);
  * exports GLB per river with the projected texture.
"""
import argparse, json, math, os, sys
import bpy
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--scene-dir", required=True); ap.add_argument("--artwork", required=True)
ap.add_argument("--out-dir", required=True); ap.add_argument("--blend", default="")
a = ap.parse_args(argv)
os.makedirs(a.out_dir, exist_ok=True)
S = json.load(open(os.path.join(a.scene_dir, "scene.json")))["cameras"]
W, H, F, CX, CY = S["width"], S["height"], S["f_px"], S["cx"], S["cy"]

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = W, H, 100
sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = 16; sc.cycles.use_denoising = False
sc.render.film_transparent = True; sc.render.filter_size = 0.75
sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
sc.view_settings.exposure = 0; sc.view_settings.gamma = 1
sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGBA"

def three_to_blender(v):
    return Vector((v[0], -v[2], v[1]))

def make_cam(name, pos):
    cd = bpy.data.cameras.new(name)
    cd.sensor_fit = "VERTICAL"; cd.sensor_height = 36.0
    cd.lens = F * cd.sensor_height / H
    cd.shift_x = (CX - W / 2) / max(W, H) * -1
    cd.shift_y = -(H / 2 - CY) / max(W, H)
    cd.clip_start, cd.clip_end = 0.01, 500
    ob = bpy.data.objects.new(name, cd); sc.collection.objects.link(ob)
    ob.location = three_to_blender(pos)
    ob.rotation_euler = (math.radians(90 + S["pitch_deg"]), 0, math.radians(S["yaw_deg"]))
    return ob

cam_locked = make_cam("Cam05_MarbleLocked", S["locked"]["position"])
cam_moved = make_cam("Cam05_MarbleMoved_1R", S["moved"]["position"])
sc.camera = cam_locked
bpy.context.view_layer.update()

img = bpy.data.images.load(os.path.abspath(a.artwork)); img.colorspace_settings.name = "sRGB"; img.alpha_mode = "STRAIGHT"
mat = bpy.data.materials.new("ApprovedWaterArtwork_Projected"); mat.use_nodes = True
nt = mat.node_tree; nt.nodes.clear()
tex = nt.nodes.new("ShaderNodeTexImage"); tex.image = img; tex.interpolation = "Linear"; tex.extension = "CLIP"
uvn = nt.nodes.new("ShaderNodeUVMap"); uvn.uv_map = "ProjUV"
em = nt.nodes.new("ShaderNodeEmission"); tr = nt.nodes.new("ShaderNodeBsdfTransparent")
mix = nt.nodes.new("ShaderNodeMixShader"); outn = nt.nodes.new("ShaderNodeOutputMaterial")
nt.links.new(uvn.outputs["UV"], tex.inputs["Vector"])
nt.links.new(tex.outputs["Color"], em.inputs["Color"])
nt.links.new(tex.outputs["Alpha"], mix.inputs["Fac"])
nt.links.new(tr.outputs["BSDF"], mix.inputs[1]); nt.links.new(em.outputs["Emission"], mix.inputs[2])
nt.links.new(mix.outputs["Shader"], outn.inputs["Surface"])
try:
    mat.surface_render_method = "BLENDED"
except Exception:
    pass

report = dict(camera=dict(lens_mm=cam_locked.data.lens, sensor_fit="VERTICAL", sensor_height=36.0,
                          shift_x=cam_locked.data.shift_x, shift_y=cam_locked.data.shift_y,
                          rotation_deg=[math.degrees(x) for x in cam_locked.rotation_euler]), rivers={})
objs = {}
for key in ("marble_river", "flat_river"):
    bpy.ops.wm.obj_import(filepath=os.path.join(a.scene_dir, key + ".obj"), forward_axis="NEGATIVE_Z", up_axis="Y")
    ob = bpy.context.selected_objects[0]; ob.name = key; objs[key] = ob
    me = ob.data
    obj_uv = me.uv_layers[0]; obj_uv.name = "ObjUV"
    me.uv_layers.new(name="ProjUV"); me.uv_layers.active = me.uv_layers["ProjUV"]
    # UV Project modifier (kept for the record: it ignores lens shift, measured error below) ...
    tmp = ob.copy(); tmp.data = me.copy(); sc.collection.objects.link(tmp)
    mod = tmp.modifiers.new("CameraProjection", "UV_PROJECT")
    mod.uv_layer = "ProjUV"; mod.projector_count = 1; mod.projectors[0].object = cam_locked
    mod.aspect_x, mod.aspect_y = W / H, 1.0
    bpy.context.view_layer.objects.active = tmp
    bpy.ops.object.modifier_apply(modifier=mod.name)
    tu, to_ = tmp.data.uv_layers["ProjUV"].data, tmp.data.uv_layers["ObjUV"].data
    step = max(1, len(tmp.data.loops) // 4000)
    err_mod = max(math.hypot((tu[i].uv[0] - to_[i].uv[0]) * W, (tu[i].uv[1] - to_[i].uv[1]) * H) for i in range(0, len(tmp.data.loops), step))
    tdata = tmp.data; bpy.data.objects.remove(tmp); bpy.data.meshes.remove(tdata)
    # ... so the projection uses the camera's own projection matrix (includes shift + vertical sensor fit)
    dg = bpy.context.evaluated_depsgraph_get()
    Pm = cam_locked.calc_matrix_camera(dg, x=W, y=H) @ cam_locked.matrix_world.inverted() @ ob.matrix_world
    pu = me.uv_layers["ProjUV"].data
    vuv = []
    for v in me.vertices:
        c = Pm @ v.co.to_4d()
        vuv.append(((c.x / c.w + 1) / 2, (c.y / c.w + 1) / 2))
    for li, lp in enumerate(me.loops):
        pu[li].uv = vuv[lp.vertex_index]
    ou = me.uv_layers["ObjUV"].data
    err_mod_obj, err_w2c, err_proj, n = err_mod, 0.0, 0.0, 0
    for li in range(0, len(me.loops), max(1, len(me.loops) // 4000)):
        vi = me.loops[li].vertex_index
        p = world_to_camera_view(sc, cam_locked, ob.matrix_world @ me.vertices[vi].co)
        err_proj = max(err_proj, math.hypot((pu[li].uv[0] - p.x) * W, (pu[li].uv[1] - p.y) * H))
        err_w2c = max(err_w2c, math.hypot((p.x - ou[li].uv[0]) * W, (p.y - ou[li].uv[1]) * H)); n += 1
    me.uv_layers.remove(me.uv_layers["ObjUV"])
    me.materials.clear(); me.materials.append(mat)
    report["rivers"][key] = dict(vertices=len(me.vertices), faces=len(me.polygons),
                                 max_px_err_uvproject_modifier_vs_analytic=err_mod_obj, max_px_err_projuv_vs_world_to_camera_view=err_proj,
                                 max_px_err_world_to_camera_view_vs_analytic=err_w2c, checked_loops=n,
                                 note="UV Project modifier ignores lens shift -> ProjUV comes from the camera projection matrix")

def render(cam, show, path):
    for k_, ob in objs.items():
        ob.hide_render = k_ != show
    sc.camera = cam; sc.render.filepath = path
    bpy.ops.render.render(write_still=True)

render(cam_locked, "marble_river", os.path.join(a.out_dir, "river_marble_locked.png"))
render(cam_moved, "marble_river", os.path.join(a.out_dir, "river_marble_moved1R.png"))
render(cam_moved, "flat_river", os.path.join(a.out_dir, "river_flat_moved1R.png"))
render(cam_locked, "flat_river", os.path.join(a.out_dir, "river_flat_locked.png"))
for k_, ob in objs.items():
    ob.hide_render = False
    bpy.ops.object.select_all(action="DESELECT"); ob.select_set(True); bpy.context.view_layer.objects.active = ob
    bpy.ops.export_scene.gltf(filepath=os.path.join(a.out_dir, k_ + "_projected.glb"), export_format="GLB", use_selection=True, export_yup=True)
if a.blend:
    img.pack()
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend), compress=True)
json.dump(report, open(os.path.join(a.out_dir, "blender_projection_report.json"), "w"), indent=1)
print("REPORT", json.dumps(report))
