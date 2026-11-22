"""Rainbow screen kit - Blender component library (round 43, Blender 5.3 headless). Builds a screen's connected 3D scenery from its
fitted layout (tools/screenkit/screens/NN/fitNN.py -> layout.json) and exports ONE GLB with clean per-mesh UVs (0..1) for the
picture bake and the code materials. Reusable Geometry Nodes groups (created once per file, applied to curves the layout defines):
  RB_Sweep_Tube    circle profile swept along a curve, normals facing INSIDE (washer drums / tubes); radius per point = curve radius
  RB_Sweep_Ribbon  flat ribbon (water channel surface) swept along a curve, banked by the curve tilt, width = curve radius * 2
  RB_Sweep_Flume   the channel body under a ribbon: two rounded side lips + underside (the painted rainbow edges of a water slide)
  RB_Sweep_Band    rounded rectangular band profile swept around a circle (gold rings / collars hugging a drum wall)
  RB_FoamBank      points along a curve, jittered, instanced lumpy flattened ico spheres (foam heaps along banks)
Every sweep stores the UV map 'UVMap' (u = across the profile 0..1, v = along the curve 0..1) as a FLOAT2 face-corner attribute,
which glTF exports as TEXCOORD_0. Object names carry the material family the game assigns (tunnel_*, ring_*, water_*, pool_*,
flume_*, foam_*, paddle_*; r44 optional: funnel_*, wall_*, pool_front_*, arrow_*, ring_mouth). Screen-specific numbers live ONLY in
layout.json; this file has none.
  blender -b --python tools/screenkit/blender_kit.py -- <layout.json> <out.glb>
"""
import bpy, bmesh, sys, json, math
from mathutils import Vector
argv = sys.argv[sys.argv.index('--') + 1:]; LAY = json.load(open(argv[0])); OUT = argv[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
B2 = lambda p: Vector((p[0], -p[2], p[1]))            # game (x, y up, z) -> Blender (x, -z, y up)


# ----------------------------------------------------------------------------------------------------------------- node groups
def _link(ng, a, b): ng.links.new(a, b)


def sweep_group(name, profile, flip=False):
    """profile(ng) -> (profile geometry socket). Builds: curve -> capture v (spline factor) ; profile -> capture u ; Curve to Mesh with
    Scale = curve radius ; UVMap = (u, v) ; optional flip ; smooth shading."""
    if name in bpy.data.node_groups: return bpy.data.node_groups[name]
    ng = bpy.data.node_groups.new(name, 'GeometryNodeTree')
    ng.interface.new_socket('Geometry', in_out='INPUT', socket_type='NodeSocketGeometry')
    ng.interface.new_socket('Geometry', in_out='OUTPUT', socket_type='NodeSocketGeometry')
    N = ng.nodes; gin = N.new('NodeGroupInput'); gout = N.new('NodeGroupOutput')
    sp = N.new('GeometryNodeSplineParameter')
    capC = N.new('GeometryNodeCaptureAttribute'); capC.capture_items.new('FLOAT', 'v'); capC.domain = 'POINT'
    _link(ng, gin.outputs[0], capC.inputs['Geometry']); _link(ng, sp.outputs['Factor'], capC.inputs['v'])   # by name: Blender 5 has a Selection socket at index 1
    prof = profile(ng)
    sp2 = N.new('GeometryNodeSplineParameter')
    capP = N.new('GeometryNodeCaptureAttribute'); capP.capture_items.new('FLOAT', 'u'); capP.domain = 'POINT'
    _link(ng, prof, capP.inputs['Geometry']); _link(ng, sp2.outputs['Factor'], capP.inputs['u'])
    rad = N.new('GeometryNodeInputRadius')
    c2m = N.new('GeometryNodeCurveToMesh'); _link(ng, capC.outputs['Geometry'], c2m.inputs['Curve']); _link(ng, capP.outputs['Geometry'], c2m.inputs['Profile Curve'])
    _link(ng, rad.outputs[0], c2m.inputs['Scale'])
    comb = N.new('ShaderNodeCombineXYZ'); _link(ng, capP.outputs['u'], comb.inputs[0]); _link(ng, capC.outputs['v'], comb.inputs[1])
    st = N.new('GeometryNodeStoreNamedAttribute'); st.data_type = 'FLOAT2'; st.domain = 'CORNER'; st.inputs['Name'].default_value = 'UVMap'
    _link(ng, c2m.outputs[0], st.inputs['Geometry']); _link(ng, comb.outputs[0], st.inputs['Value'])
    last = st.outputs[0]
    if flip:
        ff = N.new('GeometryNodeFlipFaces'); _link(ng, last, ff.inputs[0]); last = ff.outputs[0]
    sm = N.new('GeometryNodeSetShadeSmooth'); _link(ng, last, sm.inputs[0]); _link(ng, sm.outputs[0], gout.inputs[0])
    return ng


def prof_circle(res):
    def f(ng):
        # an OPEN full arc (first and last point coincide): the UV seam gets u = 0 and u = 1 at the same place instead of one face
        # wrapping backwards across the whole texture (a cyclic circle's closing face would)
        c = ng.nodes.new('GeometryNodeCurveArc'); c.inputs['Resolution'].default_value = res; c.inputs['Radius'].default_value = 1.0
        c.inputs['Start Angle'].default_value = 0.0; c.inputs['Sweep Angle'].default_value = 2 * math.pi; return c.outputs['Curve']
    return f


def object_profile_group(name, pts, flip=False):
    """sweep group whose profile is an existing poly curve object (named name + '_prof'), referenced through an Object Info node"""
    if name in bpy.data.node_groups: return bpy.data.node_groups[name]
    cu = bpy.data.curves.new(name + '_prof', 'CURVE'); cu.dimensions = '3D'; spl = cu.splines.new('POLY'); spl.points.add(len(pts) - 1)
    # pts are (across, up). Measured in Blender 5.3 (Z_UP twist): profile X -> the curve's right side, profile Y -> DOWN (so y is negated)
    for i, (x, y) in enumerate(pts): spl.points[i].co = (x, -y, 0, 1)   # measured: profile X -> sideways (right), profile -Y -> up
    pob = bpy.data.objects.new(name + '_prof', cu)                     # not linked to the scene: only referenced by the node group
    def f(ng):
        oi = ng.nodes.new('GeometryNodeObjectInfo'); oi.inputs['Object'].default_value = pob; return oi.outputs['Geometry']
    return sweep_group(name, f, flip)


def foam_group():
    name = 'RB_FoamBank'
    if name in bpy.data.node_groups: return bpy.data.node_groups[name]
    ng = bpy.data.node_groups.new(name, 'GeometryNodeTree'); N = ng.nodes
    ng.interface.new_socket('Geometry', in_out='INPUT', socket_type='NodeSocketGeometry')
    ng.interface.new_socket('Spacing', in_out='INPUT', socket_type='NodeSocketFloat')
    ng.interface.new_socket('Size', in_out='INPUT', socket_type='NodeSocketFloat')
    ng.interface.new_socket('Seed', in_out='INPUT', socket_type='NodeSocketInt')
    ng.interface.new_socket('Geometry', in_out='OUTPUT', socket_type='NodeSocketGeometry')
    gin = N.new('NodeGroupInput'); gout = N.new('NodeGroupOutput')
    rs = N.new('GeometryNodeResampleCurve'); rs.inputs['Mode'].default_value = 'Length'; _link(ng, gin.outputs[0], rs.inputs['Curve']); _link(ng, gin.outputs[1], rs.inputs['Length'])
    c2p = N.new('GeometryNodeCurveToPoints'); c2p.mode = 'EVALUATED'; _link(ng, rs.outputs[0], c2p.inputs['Curve'])
    jit = N.new('FunctionNodeRandomValue'); jit.data_type = 'FLOAT_VECTOR'; jit.inputs['Min'].default_value = (-1, -1, -0.15); jit.inputs['Max'].default_value = (1, 1, 0.1)
    _link(ng, gin.outputs[3], jit.inputs['Seed'])
    jsc = N.new('ShaderNodeVectorMath'); jsc.operation = 'SCALE'; _link(ng, jit.outputs['Value'], jsc.inputs[0]); _link(ng, gin.outputs[2], jsc.inputs['Scale'])
    sp = N.new('GeometryNodeSetPosition'); _link(ng, c2p.outputs['Points'], sp.inputs['Geometry']); _link(ng, jsc.outputs[0], sp.inputs['Offset'])
    ico = N.new('GeometryNodeMeshIcoSphere'); ico.inputs['Radius'].default_value = 1.0; ico.inputs['Subdivisions'].default_value = 2
    rnd = N.new('FunctionNodeRandomValue'); rnd.data_type = 'FLOAT'; rnd.inputs['Min'].default_value = 0.55; rnd.inputs['Max'].default_value = 1.25
    _link(ng, gin.outputs[3], rnd.inputs['Seed'])
    msz = N.new('ShaderNodeMath'); msz.operation = 'MULTIPLY'; _link(ng, rnd.outputs['Value'], msz.inputs[0]); _link(ng, gin.outputs[2], msz.inputs[1])
    flat = N.new('ShaderNodeCombineXYZ'); _link(ng, msz.outputs[0], flat.inputs[0]); _link(ng, msz.outputs[0], flat.inputs[1])
    mz = N.new('ShaderNodeMath'); mz.operation = 'MULTIPLY'; mz.inputs[1].default_value = 0.62; _link(ng, msz.outputs[0], mz.inputs[0]); _link(ng, mz.outputs[0], flat.inputs[2])
    iop = N.new('GeometryNodeInstanceOnPoints'); _link(ng, sp.outputs[0], iop.inputs['Points']); _link(ng, ico.outputs['Mesh'], iop.inputs['Instance']); _link(ng, flat.outputs[0], iop.inputs['Scale'])
    real = N.new('GeometryNodeRealizeInstances'); _link(ng, iop.outputs[0], real.inputs[0])
    sm = N.new('GeometryNodeSetShadeSmooth'); _link(ng, real.outputs[0], sm.inputs[0]); _link(ng, sm.outputs[0], gout.inputs[0])
    return ng


# ----------------------------------------------------------------------------------------------------------------- builders
def curve_object(name, pts, radii=None, tilts=None, cyclic=False, twist='Z_UP'):
    cu = bpy.data.curves.new(name + '_curve', 'CURVE'); cu.dimensions = '3D'; cu.twist_mode = twist
    spl = cu.splines.new('POLY'); spl.points.add(len(pts) - 1); spl.use_cyclic_u = cyclic
    for i, p in enumerate(pts):
        spl.points[i].co = (*B2(p), 1.0); spl.points[i].radius = radii[i] if radii else 1.0; spl.points[i].tilt = tilts[i] if tilts else 0.0
    ob = bpy.data.objects.new(name, cu); bpy.context.collection.objects.link(ob); return ob


def apply_group(ob, ng, inputs=None):
    mod = ob.modifiers.new('kit', 'NODES'); mod.node_group = ng
    for k, v in (inputs or {}).items():
        sock = next(s for s in ng.interface.items_tree if getattr(s, 'in_out', '') == 'INPUT' and s.name == k); sock.default_value = v   # Blender 5: set the group default, applied at once below
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
    """washer drum / tube: the axis polyline split into segments of seg_len (each its own 0..1 UVs for the bake), RB_Sweep_Tube"""
    ng = sweep_group('RB_Sweep_Tube', prof_circle(res), flip=True)
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
    rib = object_profile_group('RB_Sweep_Ribbon', [(-1.0, 0.0), (-0.5, 0.0), (0.0, 0.0), (0.5, 0.0), (1.0, 0.0)])
    flu = object_profile_group('RB_Sweep_Flume', [(-1.0, 0.0), (-1.07, -0.02), (-1.12, -0.09), (-1.1, -0.18), (-1.0, -0.24), (-0.6, -0.27), (0.0, -0.28),
                                                   (0.6, -0.27), (1.0, -0.24), (1.1, -0.18), (1.12, -0.09), (1.07, -0.02), (1.0, 0.0)], flip=True)
    L = [0.0]
    for i in range(1, len(route)): L.append(L[-1] + math.dist(route[i], route[i - 1]))
    n = max(1, round(L[-1] / seg_len)); per = (len(route) - 1) / n; out = []
    for k in range(n):
        i0, i1 = round(k * per), round((k + 1) * per); pts = route[i0:i1 + 1]; tl = [-b for b in bank[i0:i1 + 1]]
        out.append(apply_group(curve_object(f'{prefix}_{k:02d}', pts, [width / 2] * len(pts), tl), rib))
        if flume: out.append(apply_group(curve_object(f'flume_{prefix}_{k:02d}', pts, [width / 2] * len(pts), tl), flu))
    return out


def foam_bank(name, pts, spacing, size, seed):
    ng = foam_group(); ob = curve_object(name, pts); return apply_group(ob, ng, {'Spacing': spacing, 'Size': size, 'Seed': seed})


def paddle(name, pos, axis_pt, width):
    """copper half-disc tray standing out of the drum wall (the painted trays of 05 / 06 / 07): its straight edge lies in the wall"""
    c = Vector(pos); a = Vector((axis_pt[0], axis_pt[1], pos[2])); inward = (a - c).normalized(); along = Vector((0, 0, -1.0)); side = inward.cross(along).normalized()
    R = width / 2; T = 0.11 * width
    def f(u, v):
        th = math.pi * u                                    # half disc: along the tube from -R to +R, out of the wall up to R
        if v < 0.25: k = v / 0.25; rr = R * k; h = T / 2           # top face
        elif v < 0.75: k = (v - 0.25) / 0.5; rr = R; h = T / 2 - T * k   # rim band
        else: k = (v - 0.75) / 0.25; rr = R * (1 - k); h = -T / 2        # underside
        p = c + along * (rr * math.cos(th)) + inward * (rr * math.sin(th) - 0.03) + side * h   # r43b gray test: straight edge 3 cm INTO the wall (was 2 cm off it = floating)
        return ((p.x, p.y, p.z), (u, v))
    return grid(name, 48, 24, f)


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
    # band ring: unit profile scaled by the curve radius (= band width), centred on the wall circle slightly inside the drum
    prof_scale = bw
    pts = [[xa + (R - 0.04) * math.cos(2 * math.pi * j / 160), ya + (R - 0.04) * math.sin(2 * math.pi * j / 160), z] for j in range(161)]
    # closed rounded band, centred on the wall circle (radial -0.17..+0.17 of the band width): reads the same whichever way the ring's
    # minimum-twist normal points, half of it stands proud of the wall
    ng = object_profile_group('RB_Sweep_Band', [(-0.5, -0.17), (-0.5, 0.1), (-0.42, 0.16), (-0.25, 0.18), (0.25, 0.18), (0.42, 0.16), (0.5, 0.1), (0.5, -0.17), (-0.5, -0.17)])
    apply_group(curve_object(f'ring_{i:02d}', pts, [prof_scale] * len(pts), twist='MINIMUM'), ng)
# the pool: water plane on the drum floor between the walls (segments along the drum, own UVs)
chord = D['chord'] - 0.02; z = D['z0']; k = 0
while z > D['z1'] + 1e-6:
    # r43b gray test: the pool faced DOWN (flip) and lay in the channel's plane where the channel lands (z-fighting) -> faces up, 2 cm lower:
    # the channel rests IN the pool instead of sharing its surface
    z1 = max(D['z1'], z - (4.0 if z > zf else 12.0)); grid(f'pool_{k:02d}', 24, max(4, int((z - z1) / 0.25)), lambda a, b, z=z, z1=z1: ((xa - chord + 2 * chord * a, D.get('pool_y', -0.02), z - (z - z1) * b), (a, b)), flip=False)
    z = z1; k += 1
# the crest channel (Benny's route) + its flume body (a screen whose water fills the tube floor, e.g. 04, has no separate channel)
RT = LAY['route']; route = RT['points']; bank = RT['bank']
if not LAY.get('no_route_ribbon'): ribbon('water_route', route, bank, RT['width'], 2.5)


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
    ng = object_profile_group('RB_Sweep_Band', [(-0.5, -0.17), (-0.5, 0.1), (-0.42, 0.16), (-0.25, 0.18), (0.25, 0.18), (0.42, 0.16), (0.5, 0.1), (0.5, -0.17), (-0.5, -0.17)])
    apply_group(curve_object('ring_mouth', pts, [mr['band']] * len(pts), twist='MINIMUM'), ng)
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
    foam_bank(nm, [[xa + side * (chord - 0.06), 0.0, zq] for zq in [D['z0'] - 0.5 * j for j in range(int((D['z0'] - zf) / 0.5))]], 0.09, 0.11, 7 + side)
for i, p in enumerate(LAY.get('paddles', [])): paddle(f'paddle_{i}', p['pos'], (xa, ya), p['width'])
# helper objects that only fed node groups are not exported
for ob in list(bpy.data.objects):
    if ob.type != 'MESH': bpy.data.objects.remove(ob)
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_texcoords=True, export_normals=True, export_materials='NONE', export_apply=True)
print('exported', OUT, len(bpy.data.objects), 'objects:', sorted({o.name.split('_')[0] for o in bpy.data.objects}))
