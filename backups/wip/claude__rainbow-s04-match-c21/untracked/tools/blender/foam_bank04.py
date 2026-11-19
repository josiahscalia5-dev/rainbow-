# r20 (s04 foam worker): Screen 04 BANK FOAM heaps built in Blender (free, deterministic) — several seeds in ONE glb, to be
# instanced along both river banks by `&m04bbank=1` (src/world/match04m4.ts). Recipe from the lead's single-heap test
# tools/blender/foam_cluster04.py (r19 blendfoam): the painted bank foam = LOW, WIDE heaps of BIG separate glossy round
# bubbles (biggest on the ridge, smaller ones at the waterline and both ends, packed with overlap), pearly lilac-white with
# pale blue-lilac undersides, a few pinker / bluer bubbles. Lower-poly than the test heap (mobile: many instances).
# Built lying flat: +X = along the bank (length), +Y = across (depth), +Z = up (glTF +Y). One mesh object per seed
# ("heap_0" ...), vertex colours, each heap's base at z = 0 and centred on x / y.
#   blender -b --python tools/blender/foam_bank04.py -- <out.glb> [nSeeds] [firstSeed]
import bpy, random, math, sys
from mathutils import Vector
argv = sys.argv[sys.argv.index('--') + 1:]
OUT = argv[0]; NS = int(argv[1]) if len(argv) > 1 else 4; S0 = int(argv[2]) if len(argv) > 2 else 40419
bpy.ops.wm.read_factory_settings(use_empty=True)
L, W = 3.0, 1.2                      # heap length along the bank, depth across it (u, before in-game scaling)
heaps = []
stats = []
for k in range(NS):
    rnd = random.Random(S0 + 977 * k)
    placed = []
    def free(c, r):
        return all((c - c2).length >= 0.74 * (r + r2) for c2, r2 in placed)
    cands = []
    nMax = 38 + rnd.randint(-4, 4)
    for i in range(900):
        t = rnd.random(); env = math.sin(math.pi * t) ** 0.6           # taller in the middle, tapering at both ends
        r = (0.08 + (rnd.random() ** 1.7) * 0.34) * (0.55 + 0.45 * env)
        cands.append((r, t, env))
    cands.sort(key=lambda c: -c[0])   # big bubbles first, small ones fill the gaps
    skew = rnd.uniform(-0.25, 0.25)    # the ridge peaks off-centre (no two heaps alike)
    for r, t, env in cands:
        for _ in range(30):
            x = (t - 0.5) * L + rnd.uniform(-0.08, 0.08)
            y = rnd.gauss(0, 0.24 * W) * (0.6 + 0.4 * env)
            ridge = math.exp(-(y / (0.42 * W)) ** 2) * env * (1.0 + skew * (t - 0.5) * 2)
            z = r * 0.55 + max(0.0, ridge) * rnd.uniform(0.03, 0.34)   # LOW heaps (the painted banks lie low and wide)
            c = Vector((x, y, z))
            if free(c, r):
                placed.append((c, r)); break
        if len(placed) >= nMax: break
    objs = []
    for c, r in placed:
        seg = 14 if r > 0.2 else 10 if r > 0.12 else 8
        bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=r, location=c)
        o = bpy.context.active_object; bpy.ops.object.shade_smooth()
        me = o.data
        col = me.color_attributes.new(name='Col', type='FLOAT_COLOR', domain='POINT')
        u = (c.x / L) + 0.5
        base = Vector((0.95, 0.93, 1.0))
        pink = Vector((1.0, 0.86, 0.96)); blue = Vector((0.85, 0.91, 1.0))
        tint = base.lerp(pink, max(0.0, 0.5 - u) * 0.9 if k % 2 == 0 else max(0.0, u - 0.5) * 0.9)
        q = rnd.random()
        if q < 0.22: tint = tint.lerp(blue, 0.6)
        elif q < 0.32: tint = tint.lerp(pink, 0.5)
        for i, v in enumerate(me.vertices):
            n = v.normal
            shade = 0.86 + 0.14 * max(0.0, n.z)                 # baked soft blue-lilac underside (the painted shadow side)
            cc = tint * shade
            if n.z < -0.2: cc = cc.lerp(Vector((0.78, 0.82, 1.0)), 0.4)
            col.data[i].color = (cc.x, cc.y, cc.z, 1.0)
        objs.append(o)
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    heap = bpy.context.active_object; heap.name = f'heap_{k}'; heap.data.name = f'heap_{k}'
    # centre on x / y, base on z = 0 (in-game: the heap rests on the water / floor)
    bb = [heap.matrix_world @ Vector(b) for b in heap.bound_box]
    mn = Vector((min(p.x for p in bb), min(p.y for p in bb), min(p.z for p in bb)))
    mx = Vector((max(p.x for p in bb), max(p.y for p in bb), max(p.z for p in bb)))
    off = Vector(((mn.x + mx.x) / 2, (mn.y + mx.y) / 2, mn.z))
    for v in heap.data.vertices: v.co -= off
    heap.location = (0, 0, 0)
    heaps.append(heap)
    stats.append({'seed': S0 + 977 * k, 'bubbles': len(placed), 'tris': sum(len(p.vertices) - 2 for p in heap.data.polygons),
                  'dims': tuple(round(d, 3) for d in heap.dimensions)})
    # spread them out in the file (each heap's own origin stays at its base centre)
mat = bpy.data.materials.new('foam_pearl'); mat.use_nodes = True
nt = mat.node_tree; bs = nt.nodes['Principled BSDF']
ca = nt.nodes.new('ShaderNodeVertexColor'); ca.layer_name = 'Col'
nt.links.new(ca.outputs['Color'], bs.inputs['Base Color'])
bs.inputs['Roughness'].default_value = 0.15
for h in heaps: h.data.materials.append(mat)
bpy.ops.object.select_all(action='DESELECT')
for h in heaps: h.select_set(True)
kw = dict(filepath=OUT, export_format='GLB', use_selection=True, export_apply=True)
for k2, v2 in (('export_vertex_color', 'ACTIVE'), ('export_colors', True)):
    try:
        bpy.ops.export_scene.gltf(**kw, **{k2: v2}); break
    except TypeError:
        continue
print('FOAM_BANK', stats)
