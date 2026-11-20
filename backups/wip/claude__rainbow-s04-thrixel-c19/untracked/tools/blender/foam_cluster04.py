# r19 (lead): Screen 04 bank foam heap built in Blender (free, deterministic) after the Thrixel test was not an improvement.
# The approved picture's right-bank heap: a LOW, WIDE pile of BIG glossy separate round bubbles (mixed sizes, biggest on the
# ridge, small ones at the waterline and ends), pearly lilac-white, a pinker tint at one end, bluish undersides.
# Built lying flat: +X = along the bank (length), +Y = across (depth), +Z = up (glTF +Y). Exported as one mesh with vertex colours.
#   blender -b --python tools/blender/foam_cluster04.py -- <out.glb> [seed]
import bpy, random, math, sys
from mathutils import Vector
argv = sys.argv[sys.argv.index('--') + 1:]
OUT = argv[0]; SEED = int(argv[1]) if len(argv) > 1 else 40419
bpy.ops.wm.read_factory_settings(use_empty=True)
rnd = random.Random(SEED)
L, W = 3.0, 1.1                      # heap length along the bank, depth across it (u, before in-game scaling)
placed = []                           # (centre, radius)
def free(c, r):
    return all((c - c2).length >= 0.72 * (r + r2) for c2, r2 in placed)
cands = []
for i in range(900):
    t = rnd.random(); env = math.sin(math.pi * t) ** 0.55          # taller in the middle, tapering at both ends
    r = (0.09 + (rnd.random() ** 1.6) * 0.36) * (0.55 + 0.45 * env)
    cands.append((r, t, env))
cands.sort(key=lambda c: -c[0])       # big bubbles first, small ones fill the gaps
for r, t, env in cands:
    for _ in range(30):
        x = (t - 0.5) * L + rnd.uniform(-0.08, 0.08)
        y = rnd.gauss(0, 0.22 * W) * (0.6 + 0.4 * env)
        # rest on the water / on lower bubbles: height grows toward the ridge line (y≈0) and the middle
        ridge = math.exp(-(y / (0.42 * W)) ** 2) * env
        z = r * 0.55 + ridge * rnd.uniform(0.05, 0.42)
        c = Vector((x, y, z))
        if free(c, r):
            placed.append((c, r)); break
    if len(placed) >= 46: break
objs = []
for c, r in placed:
    seg = 28 if r > 0.22 else 20 if r > 0.13 else 14
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=r, location=c)
    o = bpy.context.active_object; bpy.ops.object.shade_smooth()
    me = o.data
    col = me.color_attributes.new(name='Col', type='FLOAT_COLOR', domain='POINT')
    # pearly lilac-white; pinker toward the -X end (the painted heap's pink side), a few bluer bubbles
    u = (c.x / L) + 0.5
    base = Vector((0.95, 0.92, 1.0))
    pink = Vector((1.0, 0.84, 0.95)); blue = Vector((0.86, 0.90, 1.0))
    tint = base.lerp(pink, max(0.0, 0.55 - u) * 1.2)
    if rnd.random() < 0.2: tint = tint.lerp(blue, 0.6)
    for i, v in enumerate(me.vertices):
        n = v.normal
        shade = 0.88 + 0.12 * max(0.0, n.z)                  # baked soft bluish underside (the painted shadow side)
        cc = tint * shade
        if n.z < -0.2: cc = cc.lerp(Vector((0.80, 0.84, 1.0)), 0.35)
        col.data[i].color = (cc.x, cc.y, cc.z, 1.0)
    objs.append(o)
bpy.ops.object.select_all(action='DESELECT')
for o in objs: o.select_set(True)
bpy.context.view_layer.objects.active = objs[0]
bpy.ops.object.join()
heap = bpy.context.active_object; heap.name = 'foam_heap04'
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
heap.location = (0, 0, 0)
mat = bpy.data.materials.new('foam_pearl'); mat.use_nodes = True
nt = mat.node_tree; bs = nt.nodes['Principled BSDF']
ca = nt.nodes.new('ShaderNodeVertexColor'); ca.layer_name = 'Col'
nt.links.new(ca.outputs['Color'], bs.inputs['Base Color'])
bs.inputs['Roughness'].default_value = 0.22
heap.data.materials.append(mat)
tris = sum(len(p.vertices) - 2 for p in heap.data.polygons)
dims = tuple(round(d, 3) for d in heap.dimensions)
kw = dict(filepath=OUT, export_format='GLB', use_selection=True, export_apply=True)
for k, v in (('export_vertex_color', 'ACTIVE'), ('export_colors', True)):
    try:
        bpy.ops.export_scene.gltf(**kw, **{k: v}); break
    except TypeError:
        continue
print('FOAM_HEAP', {'bubbles': len(placed), 'tris': tris, 'dims': dims, 'seed': SEED})
