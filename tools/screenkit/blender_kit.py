"""Rainbow screen kit - Blender scene builder (round 43; round 45: built from the reusable Geometry Nodes ASSET LIBRARY
tools/screenkit/gn_assets.py -> rainbow_gn_assets.blend, cached by tools/screenkit/build.py). Builds a screen's connected 3D scenery from its
fitted layout (tools/screenkit/screens/NN/fitNN.py -> layout.json) and exports ONE GLB with clean per-mesh UVs (0..1) for the picture bake
and the artwork-sampled materials. Asset node groups used (see gn_assets.py):
  RB_PerforatedDrum  washer drums / tubes            RB_WaterChannel + RB_ChannelBody  the banked river channel and its body
  RB_GoldRing        gold washer rings              RB_FoamBank v2  cumulus foam clusters along banks
  RB_WallTray        painted copper wall trays      RB_MachineryRow the trays repeated along the whole tube (layout 'machinery')
Object names carry the material family the game assigns (tunnel_*, ring_*, water_*, pool_*, flume_*, foam_*, paddle_*, paddlerep_*;
r44 optional: funnel_*, wall_*, pool_front_*, arrow_*, ring_mouth). Screen-specific numbers live ONLY in layout.json; this file has none.
GEOM_KEYS lists every layout key this file reads: build.py re-runs Blender only when one of them (or this file / the asset library) changes.
  blender -b --python tools/screenkit/blender_kit.py -- <layout.json> <out.glb> [--gnlib rainbow_gn_assets.blend]
"""
import bpy, bmesh, sys, os, json, math
from mathutils import Vector, Matrix
GEOM_KEYS = ['drum', 'rings', 'route', 'no_route_ribbon', 'route_flume', 'mouth_ring', 'funnel', 'wall', 'pool_front', 'arrows', 'foam_route', 'foam_pool',
             'paddles', 'foam_style', 'machinery', 'foam_banks', 'foam_pool_from']
argv = sys.argv[sys.argv.index('--') + 1:]; LAY = json.load(open(argv[0])); OUT = argv[1]
GNLIB = argv[argv.index('--gnlib') + 1] if '--gnlib' in argv else None
bpy.ops.wm.read_factory_settings(use_empty=True)
B2 = lambda p: Vector((p[0], -p[2], p[1]))            # game (x, y up, z) -> Blender (x, -z, y up)
HERE = os.path.dirname(os.path.abspath(__file__))
if GNLIB and os.path.exists(GNLIB):                    # the cached asset library (build.py)
    with bpy.data.libraries.load(GNLIB, link=False) as (src, dst): dst.node_groups = [n for n in src.node_groups if n.startswith('RB_')]
else:                                                  # stand-alone use: build the same groups in this file
    sys.path.insert(0, HERE); import gn_assets; gn_assets.build_all()
NG = bpy.data.node_groups
print('asset library:', GNLIB if GNLIB else 'built in place', sorted(n.name for n in NG if n.name.startswith('RB_')))


# ----------------------------------------------------------------------------------------------------------------- builders
def curve_object(name, pts, radii=None, tilts=None, cyclic=False, twist='Z_UP'):
    cu = bpy.data.curves.new(name + '_curve', 'CURVE'); cu.dimensions = '3D'; cu.twist_mode = twist
    spl = cu.splines.new('POLY'); spl.points.add(len(pts) - 1); spl.use_cyclic_u = cyclic
    for i, p in enumerate(pts):
        spl.points[i].co = (*B2(p), 1.0); spl.points[i].radius = radii[i] if radii else 1.0; spl.points[i].tilt = tilts[i] if tilts else 0.0
    ob = bpy.data.objects.new(name, cu); bpy.context.collection.objects.link(ob); return ob


def apply_group(ob, ng, inputs=None):
    # r45 fix: Blender 5 copies a group's input defaults into the modifier WHEN THE MODIFIER IS CREATED; setting them afterwards had no
    # effect, so the first object built with a group got the previous defaults (the 05 foam bank was one lump, the first tray / ring wrong size).
    # The defaults are now set BEFORE the modifier exists.
    for k, v in (inputs or {}).items():
        sock = next(s for s in ng.interface.items_tree if getattr(s, 'in_out', '') == 'INPUT' and s.name == k); sock.default_value = v
    mod = ob.modifiers.new('kit', 'NODES'); mod.node_group = ng
    bpy.context.view_layer.objects.active = ob
    for o in bpy.context.selected_objects: o.select_set(False)
    ob.select_set(True); bpy.ops.object.convert(target='MESH'); return bpy.context.view_layer.objects.active


def grid(name, nu, nv, fn, flip=False):
    """plain parametric grid (as tools/reflock/blender_section.py): fn(a, b) -> (game xyz, (u, v))"""
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


def tube_segments(prefix, axis_pts, radius, seg_len, res=96):
    """washer drum / tube: the axis polyline split into segments of seg_len (each its own 0..1 UVs for the bake), asset RB_PerforatedDrum"""
    ng = NG['RB_PerforatedDrum']
    L = [0.0]
    for i in range(1, len(axis_pts)): L.append(L[-1] + math.dist(axis_pts[i], axis_pts[i - 1]))
    n = max(1, round(L[-1] / seg_len)); out = []
    for k in range(n):
        a, b = L[-1] * k / n, L[-1] * (k + 1) / n; pts = []
        for j in range(9):
            t = a + (b - a) * j / 8; i = max(1, min(len(L) - 1, next((m for m in range(1, len(L)) if L[m] >= t), len(L) - 1))); f = (t - L[i - 1]) / max(1e-9, L[i] - L[i - 1])
            pts.append([axis_pts[i - 1][c] + (axis_pts[i][c] - axis_pts[i - 1][c]) * f for c in range(3)])
        ob = curve_object(f'{prefix}_{k:02d}', pts, [radius(p) for p in pts]); out.append(apply_group(ob, ng))
    return out


def ribbon(prefix, route, bank, width, seg_len, flume=True):
    """water channel along the route: the ribbon surface (water_*) and, under it, the flume body (flume_*), both banked by `bank`"""
    rib = NG['RB_WaterChannel']; flu = NG['RB_ChannelBody']   # assets (gn_assets.py)
    L = [0.0]
    for i in range(1, len(route)): L.append(L[-1] + math.dist(route[i], route[i - 1]))
    n = max(1, round(L[-1] / seg_len)); per = (len(route) - 1) / n; out = []
    for k in range(n):
        i0, i1 = round(k * per), round((k + 1) * per); pts = route[i0:i1 + 1]; tl = [-b for b in bank[i0:i1 + 1]]
        out.append(apply_group(curve_object(f'{prefix}_{k:02d}', pts, [width / 2] * len(pts), tl), rib))
        if flume: out.append(apply_group(curve_object(f'flume_{prefix}_{k:02d}', pts, [width / 2] * len(pts), tl), flu))
    return out


FS = {'spacing': 1.0, 'size': 1.0, 'height': 0.62, 'spread': 1.0, 'detail': 1, **LAY.get('foam_style', {})}   # r45: per-screen foam look (multipliers)


def foam_bank(name, pts, spacing, size, seed, spread=None):
    """asset RB_FoamBank v2 (cumulus clusters) along a bank polyline"""
    ob = curve_object(name, pts)
    return apply_group(ob, NG['RB_FoamBank'], {'Spacing': spacing * FS['spacing'], 'Size': size * FS['size'], 'Seed': seed, 'Height': FS['height'],
                                              'Spread': FS['spread'] if spread is None else spread, 'Detail': int(FS['detail'])})


def tray_frame(pos, axis_pt):
    """a wall tray's frame (game coords): inward (to the drum axis, horizontal), along (-z), side = inward x along"""
    c = Vector(pos); a = Vector((axis_pt[0], axis_pt[1], pos[2])); inward = (a - c).normalized(); along = Vector((0, 0, -1.0)); side = inward.cross(along).normalized()
    return c, inward, along, side


def paddle(name, pos, axis_pt, width):
    """copper half-disc tray standing out of the drum wall (the painted trays of 05 / 06 / 07), asset RB_WallTray: its straight edge lies
    3 cm inside the wall (r43b gray test), the disc stands out toward the axis"""
    c, inward, along, side = tray_frame(pos, axis_pt)
    me = bpy.data.meshes.new(name + '_m'); ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob)
    ob = apply_group(ob, NG['RB_WallTray'], {'Width': width})
    X, Y, Z, O = B2(inward), B2(along), B2(side), B2(c)   # local X -> inward, Y -> along the tube, Z -> side
    M = Matrix(((X.x, Y.x, Z.x, O.x), (X.y, Y.y, Z.y, O.y), (X.z, Y.z, Z.z, O.z), (0, 0, 0, 1)))
    ob.data.transform(M); ob.data.update(); return ob


def machinery_row(name, trays):
    """asset RB_MachineryRow: trays = [(pos, axis_pt, width)] -> one realised mesh (identical tray UVs: the artwork template fits every tray)"""
    me = bpy.data.meshes.new(name + '_pts'); me.vertices.add(len(trays))
    for i, (pos, axis_pt, w) in enumerate(trays): me.vertices[i].co = B2(pos)
    aw = me.attributes.new('tray_w', 'FLOAT', 'POINT'); an = me.attributes.new('tray_n', 'FLOAT_VECTOR', 'POINT'); at_ = me.attributes.new('tray_t', 'FLOAT_VECTOR', 'POINT')
    for i, (pos, axis_pt, w) in enumerate(trays):
        c, inward, along, side = tray_frame(pos, axis_pt); aw.data[i].value = w; an.data[i].vector = B2(inward); at_.data[i].vector = B2(along)
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob); return apply_group(ob, NG['RB_MachineryRow'])


# ----------------------------------------------------------------------------------------------------------------- the screen
D = LAY['drum']; xa, ya, R = D['axis_x'], D['axis_y'], D['r']
zf = D.get('z_far', D['z1'])
tube_segments('tunnel', [[xa, ya, D['z0']], [xa, ya, zf]], lambda p: R, D.get('seg', 2.5))
if zf > D['z1'] + 1e-6: tube_segments('tunnelfar', [[xa, ya, zf], [xa, ya, D['z1']]], lambda p: R, D.get('seg_far', 12.0), res=72)   # the far drum: longer segments
z_r = [z for z in LAY['rings']['z'] if D['z1'] < z < D['z0']]
zz = (min(z_r) if z_r else D['z0'] - 6) - LAY['rings']['spacing']
while zz > D['z1'] + 1: z_r.append(zz); zz -= LAY['rings']['spacing']
bw = LAY['rings']['band']
for i, z in enumerate(sorted(z_r, reverse=True)):
    # asset RB_GoldRing: a rounded band (width bw) centred on the wall circle slightly inside the drum (radial -0.17..+0.18 of the band
    # width: half of it stands proud of the wall); the unit ring lies in Blender's XY plane -> turned into the drum section (game x-y plane)
    me = bpy.data.meshes.new(f'ring_{i:02d}_m'); ob = bpy.data.objects.new(f'ring_{i:02d}', me); bpy.context.collection.objects.link(ob)
    ob = apply_group(ob, NG['RB_GoldRing'], {'Radius': R - 0.04, 'Band': bw, 'Resolution': 160})
    ob.data.transform(Matrix.Translation(B2((xa, ya, z))) @ Matrix.Rotation(math.pi / 2, 4, 'X')); ob.data.update()
# the pool: water plane on the drum floor between the walls (segments along the drum, own UVs)
chord = D['chord'] - 0.02; z = D['z0']; k = 0
while z > D['z1'] + 1e-6:
    # r43b gray test: the pool faced DOWN (flip) and lay in the channel's plane where the channel lands (z-fighting) -> faces up, 2 cm lower:
    # the channel rests IN the pool instead of sharing its surface
    z1 = max(D['z1'], z - (4.0 if z > zf else 12.0)); grid(f'pool_{k:02d}', 24, max(4, int((z - z1) / 0.25)), lambda a, b, z=z, z1=z1: ((xa - chord + 2 * chord * a, D.get('pool_y', -0.02), z - (z - z1) * b), (a, b)), flip=False)
    z = z1; k += 1
# the crest channel (Benny's route) + its flume body (a screen whose water fills the tube floor, e.g. 04, has no separate channel)
RT = LAY['route']; route = RT['points']; bank = RT['bank']
if not LAY.get('no_route_ribbon'): ribbon('water_route', route, bank, RT['width'], 2.5, flume=LAY.get('route_flume', True))   # r44: 05's S-river has no flume lips


# ---------------------------------------------------------------- r44 optional components (absent keys -> nothing built: 06 is unchanged)
def chevron(name, pos, width, fwd, tilt_deg=0.0):
    """a white arrow lying on the water (04): two bars meeting at an apex pointing along fwd; a thin slab (top + side walls), planar UVs"""
    W_ = width; h = 0.36 * W_; t = 0.2 * W_; y0, y1 = 0.004, 0.03   # r44: bars as broad as the painted 04 arrows
    f = Vector((fwd[0], 0.0, fwd[2])).normalized(); s = Vector((-f.z, 0.0, f.x))          # s = rider's right (game x when heading -z)
    # local (across, forward) -> game point; tilt_deg > 0 raises the apex (forward edge) like a ramp: the panel's near edge stays on the water
    ct, st_ = math.cos(math.radians(tilt_deg)), math.sin(math.radians(tilt_deg)); c = Vector(pos)
    P = lambda a, b: c + s * a + f * ((b + t) * ct - t) + Vector((0.0, (b + t) * st_, 0.0))
    quads = [[P(0, h), P(-W_ / 2, 0), P(-W_ / 2, -t), P(0, h - 1.4 * t)], [P(0, h), P(0, h - 1.4 * t), P(W_ / 2, -t), P(W_ / 2, 0)]]
    me = bpy.data.meshes.new(name); bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap')
    for q in quads:
        top = [bm.verts.new(B2((p.x, p.y + y1, p.z))) for p in q]; bot = [bm.verts.new(B2((p.x, p.y + y0, p.z))) for p in q]
        faces = [top[::-1]] + [[top[i], top[(i + 1) % 4], bot[(i + 1) % 4], bot[i]] for i in range(4)]
        for fv in faces:
            fa = bm.faces.new(fv)
            for l in fa.loops:
                g = Vector((l.vert.co.x, l.vert.co.z, -l.vert.co.y)); lp = g - c; l[uvl].uv = (0.5 + lp.dot(s) / W_, 0.5 + lp.dot(f) / W_)
    bm.normal_update(); bm.to_mesh(me); bm.free(); ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob); return ob


if LAY.get('mouth_ring'):            # the thick gold flange around a tunnel mouth seen from outside (04)
    mr = LAY['mouth_ring']; pts = [[xa + mr['r'] * math.cos(2 * math.pi * j / 192), ya + mr['r'] * math.sin(2 * math.pi * j / 192), mr['z']] for j in range(193)]
    apply_group(curve_object('ring_mouth', pts, [mr['band']] * len(pts), twist='MINIMUM'), NG['RB_Band'])
if LAY.get('funnel'):                # swirling water bell mouth around the tunnel mouth: circle r_in at z_in -> ellipse (a_out, b_out) at z_out
    fu = LAY['funnel']
    def ffun(u, v, fu=fu):
        th = 2 * math.pi * u; e = v ** 1.5; ra = fu['r_in'] + (fu['a_out'] - fu['r_in']) * e; rb = fu['r_in'] + (fu['b_out'] - fu['r_in']) * e
        return ((fu['axis_x'] + ra * math.cos(th), fu['axis_y'] + rb * math.sin(th), fu['z_in'] + (fu['z_out'] - fu['z_in']) * v), (u, v))
    grid('funnel_00', 192, 24, ffun, flip=True)
if LAY.get('wall'):                  # the wall at the funnel rim (04: laundry-room porthole, control panel, towel shelf painted there)
    wa = LAY['wall']; hx, hy, ha, hb = wa['hole']
    def wfun(u, v, wa=wa):
        th = 2 * math.pi * u; dx, dy = math.cos(th), math.sin(th)
        tx = ((wa['x1'] if dx > 0 else wa['x0']) - hx) / dx if abs(dx) > 1e-9 else 1e9; ty = ((wa['y1'] if dy > 0 else wa['y0']) - hy) / dy if abs(dy) > 1e-9 else 1e9
        rim = Vector((hx + ha * dx, hy + hb * dy)); edge = Vector((hx + min(tx, ty) * dx, hy + min(tx, ty) * dy)); p = rim + (edge - rim) * v
        return ((p.x, p.y, wa['z']), (u, v))
    grid('wall_00', 192, 24, wfun, flip=True)
if LAY.get('pool_front'):            # the water in front of the mouth, where Benny starts (04: the painted swirl around him)
    pf = LAY['pool_front']; nz = max(4, int((pf['z0'] - pf['z1']) / 0.25))
    grid('pool_front_00', 48, nz, lambda a, b, pf=pf: ((pf['x0'] + (pf['x1'] - pf['x0']) * a, pf['y'], pf['z0'] - (pf['z0'] - pf['z1']) * b), (a, b)), flip=False)
for i, ar in enumerate(LAY.get('arrows', [])):
    chevron(f'arrow_{i}', ar['pos'], ar['width'], ar.get('fwd', (0.0, 0.0, -1.0)), ar.get('tilt', 0.0))
# foam banks along both edges of the channel where it is lifted above the pool, and along both pool edges
def edge(side, off):
    out = []
    for i in range(0, len(route) - 1, 4):
        p, q = Vector(route[i]), Vector(route[min(len(route) - 1, i + 1)]); t = (q - p).normalized(); r = t.cross(Vector((0, 1, 0))).normalized()
        out.append(list(p + r * side * (RT['width'] / 2 + off)))
    return out
for side, nm, sd in ((-1, 'foam_routeL', 3), (1, 'foam_routeR', 5)):
    if LAY.get('foam_route', {}).get(nm): foam_bank(nm, edge(side, 0.02), 0.06, 0.07, sd)   # only where the screen's picture paints foam along the channel
for side, nm in (((-1, 'foam_poolL'), (1, 'foam_poolR')) if LAY.get('foam_pool', True) else ()):   # r44: 04 paints no foam along the tube's water edges
    # r45: RB_FoamBank v2 clusters along the whole tube (was: the near drum only, single lumps)
    zf0 = min(D['z0'], LAY.get('foam_pool_from', D['z0']))   # r45: where the picture paints its own foam the painted domes are used (foam_from_picture)
    foam_bank(nm, [[xa + side * (chord - 0.06), 0.0, zq] for zq in [zf0 - 0.5 * j for j in range(int((zf0 - D['z1']) / 0.5) + 1)]], 0.16, 0.11, 7 + side)
for i, p in enumerate(LAY.get('paddles', [])): paddle(f'paddle_{i}', p['pos'], (xa, ya), p['width'])
# r45: extra foam banks (layout 'foam_banks': [{'side': -1|1, 'off': metres from the route edge, 'spacing', 'size', 's0', 's1', 'seed'}]) along the route
for j, fb in enumerate(LAY.get('foam_banks', [])):
    ds_ = RT.get('ds', 0.05); i0 = int(fb.get('s0', 0) / ds_); i1 = min(len(route) - 1, int(fb.get('s1', 1e9) / ds_)); pts = []
    for i in range(i0, i1, 4):
        p, q = Vector(route[i]), Vector(route[min(len(route) - 1, i + 1)]); t = (q - p).normalized(); r = t.cross(Vector((0, 1, 0))).normalized()
        pts.append(list(p + r * fb['side'] * (RT['width'] / 2 + fb.get('off', 0.0)) + Vector((0, fb.get('y', 0.0), 0))))
    if len(pts) > 1: foam_bank(f'foam_bank{j}', pts, fb.get('spacing', 0.16), fb.get('size', 0.11), fb.get('seed', 11 + j), fb.get('spread'))
# r45: the painted trays repeated along the whole tube (asset RB_MachineryRow): the painted group (angle around the axis, offset from its ring,
# width) every `every` ring spacings beyond the painted ones, until the tube's end (layout 'machinery': {'every': 2, 'to': z})
MC = LAY.get('machinery')
if MC and LAY.get('paddles'):
    zr_all = sorted(LAY['rings']['z']); sp = LAY['rings']['spacing'] * MC.get('every', 2); pat = []
    for p in LAY['paddles']:
        zr = min(zr_all, key=lambda z: abs(z - p['pos'][2])); pat.append((math.atan2(p['pos'][1] - ya, p['pos'][0] - xa), p['pos'][2] - zr, p['width']))
    zk = min(zr_all) - sp; zend = MC.get('to', D['z1'] + 1.0); trays = []
    while zk > zend:
        for th, dz, w in pat:
            cy_ = MC.get('clear_y')   # keep the camera's height band clear (the chase camera swings to the outer lanes)
            if cy_ and abs(ya + R * math.sin(th) - cy_[0]) < cy_[1]: continue
            if zk + dz > zend and zk + dz < MC.get('z_from', 1e9): trays.append(([xa + R * math.cos(th), ya + R * math.sin(th), zk + dz], (xa, ya), w * MC.get('scale', 1.0)))
        zk -= sp
    if trays: machinery_row('paddlerep_00', trays)
# helper objects that only fed node groups are not exported
for ob in list(bpy.data.objects):
    if ob.type != 'MESH': bpy.data.objects.remove(ob)
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_texcoords=True, export_normals=True, export_materials='NONE', export_apply=True)
print('exported', OUT, len(bpy.data.objects), 'objects:', sorted({o.name.split('_')[0] for o in bpy.data.objects}))
