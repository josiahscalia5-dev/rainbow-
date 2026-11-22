"""Rainbow ONE connected world (round 44) - the connector pieces between areas, built in Blender 5.3 (headless) from
tools/world/world_layout.py -> connectors_spec.json, exported as ONE GLB with clean per-mesh UVs (the world page gives each piece the material
family of the area it belongs to, so it matches that area's look). Kinds:
  wall_hole  a flat wall (x0..x1, y0..y1 at z) with a round doorway (hole cx, cy, r): a polar grid from the hole rim out to the rectangle
  collar     a gold band ring around a doorway (the kit's RB_Sweep_Band profile)
  strip      a flat water strip (x0..x1 at height y, from z0 to z1) that closes any gap between two areas' water surfaces
  blender -b --python tools/world/blender_connectors.py -- <connectors_spec.json> <out.glb>
"""
import bpy, bmesh, sys, json, math
from mathutils import Vector
argv = sys.argv[sys.argv.index('--') + 1:]; SPEC = json.load(open(argv[0])); OUT = argv[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
B2 = lambda p: Vector((p[0], -p[2], p[1]))            # game (x, y up, z) -> Blender (x, -z, y up)


def grid(name, nu, nv, fn, flip=False):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); V, UV = [], []
    for j in range(nv + 1):
        row, ru = [], []
        for i in range(nu + 1):
            p, uv = fn(i / nu, j / nv); row.append(bm.verts.new(B2(p))); ru.append(uv)
        V.append(row); UV.append(ru)
    for j in range(nv):
        for i in range(nu):
            q = [V[j][i], V[j][i + 1], V[j + 1][i + 1], V[j + 1][i]]; uq = [UV[j][i], UV[j][i + 1], UV[j + 1][i + 1], UV[j + 1][i]]
            if flip: q, uq = q[::-1], uq[::-1]
            f = bm.faces.new(q)
            for l, uv in zip(f.loops, uq): l[uvl].uv = uv
    bm.to_mesh(me); bm.free(); ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob)
    for p in me.polygons: p.use_smooth = True
    return ob


for c in SPEC['connectors']:
    if c['kind'] == 'wall_hole':
        hx, hy, hr = c['hole']
        def f(u, v, c=c, hx=hx, hy=hy, hr=hr):
            th = 2 * math.pi * u; dx, dy = math.cos(th), math.sin(th)
            tx = ((c['x1'] if dx > 0 else c['x0']) - hx) / dx if abs(dx) > 1e-9 else 1e9; ty = ((c['y1'] if dy > 0 else c['y0']) - hy) / dy if abs(dy) > 1e-9 else 1e9
            k = min(tx, ty); r = hr + (k - hr) * v; return ((hx + r * dx, hy + r * dy, c['z']), (u, v))
        grid(c['name'], 192, 20, f, flip=True)                 # faces the chamber (-z side is the chamber, +z the tube): double-sided material anyway
    elif c['kind'] == 'collar':
        ax, ay = c['axis']; R = c['r']; bw = c['band']
        # rounded band: inner face, front lip, outer face, back lip (like the kit's RB_Sweep_Band), swept around the doorway
        prof = [(-0.5, -0.17), (-0.5, 0.1), (-0.42, 0.16), (-0.25, 0.18), (0.25, 0.18), (0.42, 0.16), (0.5, 0.1), (0.5, -0.17), (-0.5, -0.17)]
        def f(u, v, ax=ax, ay=ay, R=R, bw=bw, c=c):
            th = 2 * math.pi * u; k = v * (len(prof) - 1); i = min(int(k), len(prof) - 2); w = k - i
            a = prof[i][0] + (prof[i + 1][0] - prof[i][0]) * w; b = prof[i][1] + (prof[i + 1][1] - prof[i][1]) * w
            r = R - b * bw; return ((ax + r * math.cos(th), ay + r * math.sin(th), c['z'] + a * bw), (u, v))
        grid(c['name'], 192, 24, f)
    elif c['kind'] == 'strip':
        n = max(4, int((c['z0'] - c['z1']) / 0.25))
        grid(c['name'], 24, n, lambda a, b, c=c: ((c['x0'] + (c['x1'] - c['x0']) * a, c['y'], c['z0'] - (c['z0'] - c['z1']) * b), (a, b)))
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_texcoords=True, export_normals=True, export_materials='NONE', export_apply=True)
print('exported', OUT, [o.name for o in bpy.data.objects])
