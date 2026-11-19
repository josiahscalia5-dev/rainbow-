"""Screen 05 paddles (`?projlid05=1`), Blender pipeline step C (run INSIDE Blender):
  blender -b --factory-startup -P tools/proj05/lid_blender.py -- <lid_dir> <texture.png> <crop x0,y0,x1,y1> <out.glb> [depth]
Builds each approved paddle (L1 L2 R1 R2) as a real 3D tray-block in the game's world coordinates:
  back  = the approved outline lifted onto the real 05 wall (raycast.json, step B), 0.02 u off the wall
  front = the same rays, `depth` u (radially) closer to the tube axis
  sides = along the camera rays, so from the locked 05 camera the outline is exactly the approved one; when Benny rides on,
          the block shows its real depth.
UV = the approved picture itself (camera projection from the locked 05 camera), cropped to the paddles' box: the game
shader shows those colours through the post-chain inverse (src/vfx/proj05Tunnel.ts). Saves lids05.blend next to the GLB
inputs (with the game camera and the approved picture as its background) for hand edits, then exports the GLB.
Coordinates: three (x, y, z) -> Blender (x, -z, y); the glTF exporter (+Y up) maps them back exactly."""
import json, math, os, sys
import bpy, bmesh
from mathutils import Matrix, Vector

argv = sys.argv[sys.argv.index("--") + 1:]
lid_dir, tex_path, crop_s, out_glb = argv[:4]
depth = float(argv[4]) if len(argv) > 4 else 0.35
x0, y0, x1, y1 = [float(v) for v in crop_s.split(",")]
m2 = json.load(open(os.path.join(lid_dir, "mesh2d.json")))
rc = json.load(open(os.path.join(lid_dir, "raycast.json")))


def b(v):                                   # three -> Blender
    return Vector((v[0], -v[2], v[1]))


bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.resolution_x, scene.render.resolution_y = 864, 1536

# the game's locked 05 camera (three looks down local -Z with +Y up, as Blender cameras do)
cam_d = bpy.data.cameras.new("Cam05_game")
cam_d.sensor_fit = "VERTICAL"
cam_d.angle_y = math.radians(rc["camera"]["fov"])
cam = bpy.data.objects.new("Cam05_game", cam_d)
scene.collection.objects.link(cam)
M3 = Matrix([rc["camera"]["matrixWorld"][i::4] for i in range(4)])          # three stores column-major
C = Matrix(((1, 0, 0, 0), (0, 0, -1, 0), (0, 1, 0, 0), (0, 0, 0, 1)))
cam.matrix_world = C @ M3
scene.camera = cam
ref = os.path.abspath("references/05_flow_into_the_current.png")
if os.path.exists(ref):
    cam_d.show_background_images = True
    bg = cam_d.background_images.new()
    bg.image = bpy.data.images.load(ref)
    bg.alpha = 0.6

img = bpy.data.images.load(os.path.abspath(tex_path))
mat = bpy.data.materials.new("lid05_approved")
mat.use_nodes = True
nt = mat.node_tree
bsdf = nt.nodes.get("Principled BSDF")
tex = nt.nodes.new("ShaderNodeTexImage")
tex.image = img
tex.interpolation = "Linear"
nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
bsdf.inputs["Metallic"].default_value = 0.0
bsdf.inputs["Roughness"].default_value = 0.6

report = {}
for name, L in m2["lids"].items():
    R = rc["lids"][name]
    px = L["verts_px"]
    n = len(px)
    me = bpy.data.meshes.new(f"lid05_{name}")
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    back, front, pix = [], [], []
    for i in range(n):
        P, N, D = Vector(R["P"][i]), Vector(R["N"][i]), Vector(R["D"][i])
        cos = max(0.25, -D.dot(N))                                  # grazing rays: cap the run along the ray
        Pb = P + N * 0.02
        Pf = P - D * (depth / cos)
        back.append(bm.verts.new(b(Pb)))
        front.append(bm.verts.new(b(Pf)))
        u = (px[i][0] - x0) / (x1 - x0)
        v = 1.0 - (px[i][1] - y0) / (y1 - y0)                       # Blender UV origin bottom-left; glTF flips it
        pix.append((u, v))

    def face(vs, ids):
        try:
            f = bm.faces.new(vs)
        except ValueError:
            return
        for lp, k in zip(f.loops, ids):
            lp[uv].uv = pix[k]

    for t in L["tris"]:
        face([front[t[0]], front[t[1]], front[t[2]]], t)
        face([back[t[2]], back[t[1]], back[t[0]]], t[::-1])
    bnd = L["boundary"]
    for j in range(len(bnd)):
        a, c = bnd[j], bnd[(j + 1) % len(bnd)]
        face([front[a], back[a], back[c], front[c]], [a, a, c, c])
    bm.normal_update()
    # face the camera: front triangles should point toward it (flip the whole mesh if the majority does not)
    camp = cam.matrix_world.translation
    score = sum((f.calc_center_median() - camp).dot(f.normal) for f in bm.faces[:len(L["tris"])])
    if score > 0:
        for f in bm.faces:
            f.normal_flip()
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(f"lid05_{name}", me)
    ob.data.materials.append(mat)
    scene.collection.objects.link(ob)
    report[name] = {"verts": len(me.vertices), "faces": len(me.polygons)}

os.makedirs(os.path.dirname(os.path.abspath(out_glb)), exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(os.path.join(lid_dir, "lids05.blend")))
for o in scene.objects:
    o.select_set(o.type == "MESH")
bpy.ops.export_scene.gltf(filepath=os.path.abspath(out_glb), export_format="GLB", use_selection=True)
print("LIDS05", json.dumps({"depth": depth, "lids": report, "glb": out_glb}))
