"""Rainbow screen kit - the reusable GEOMETRY NODES ASSET LIBRARY (round 45, Blender 5.3). Every washer-world component is ONE node group,
marked as a Blender asset and saved to rainbow_gn_assets.blend (built once and cached by tools/screenkit/build.py; blender_kit.py appends
the groups from it, and an artist can drag them from Blender's Asset Browser into any scene). No screen-specific numbers live here.
  RB_PerforatedDrum  washer drum / tube: circle profile swept along an axis curve, normals INSIDE, per-point radius = curve radius,
                     UVMap u = around (0..1, open seam), v = along (0..1). The perforated look comes from the artwork-sampled wall material.
  RB_WaterChannel    the curved water channel surface: flat ribbon swept along the route curve, banked by the curve tilt, width = 2 x radius
  RB_ChannelBody     the channel body under the water (rounded side lips + underside: the painted rainbow edges of a water slide)
  RB_GoldRing        a gold washer ring: an open circle (Curve Arc) of radius Radius in the plane of the drum section, rounded band profile of
                     width Band, minimum-twist normals (same profile and UV layout as every other ring -> one artwork template fits all)
  RB_Band            the band sweep used by RB_GoldRing (and by doorway collars): any curve, band width = curve radius
  RB_FoamBank        foam heaps along a bank curve: resampled points, jitter, clumping noise, each heap a cumulus CLUSTER of 4 lumpy
                     spheres (random turn, flattened), realised. Inputs Spacing, Size, Seed, Spread, Height
  RB_WallTray        the copper half-disc tray standing out of the drum wall (washer machinery), UVs: u around the rim (0..1), v top -> rim
                     -> underside; built at the origin facing +X (wall normal), its straight edge along Y
  RB_MachineryRow    trays instanced on points (one point per tray: attribute 'tray_w' = width, 'tray_n' = wall normal pointing to the axis,
                     'tray_t' = the drum axis direction) and realised: the painted trays repeated along the whole tube
  blender -b --factory-startup --python tools/screenkit/gn_assets.py -- <out.blend>
Blender 5.3 lessons (round 43): link Capture Attribute items BY NAME (a Selection socket sits at index 1); Curve to Mesh profile X -> the
curve's right side, profile Y -> down; use an OPEN full arc as a circular profile (a cyclic circle wraps one face backwards over the UVs).
"""
import bpy, math, sys

ASSET_NAMES = ['RB_PerforatedDrum', 'RB_WaterChannel', 'RB_ChannelBody', 'RB_Band', 'RB_GoldRing', 'RB_FoamBank', 'RB_WallTray', 'RB_MachineryRow']
BAND_PROFILE = [(-0.5, -0.17), (-0.5, 0.1), (-0.42, 0.16), (-0.25, 0.18), (0.25, 0.18), (0.42, 0.16), (0.5, 0.1), (0.5, -0.17), (-0.5, -0.17)]
RIBBON_PROFILE = [(-1.0, 0.0), (-0.5, 0.0), (0.0, 0.0), (0.5, 0.0), (1.0, 0.0)]
BODY_PROFILE = [(-1.0, 0.0), (-1.07, -0.02), (-1.12, -0.09), (-1.1, -0.18), (-1.0, -0.24), (-0.6, -0.27), (0.0, -0.28), (0.6, -0.27), (1.0, -0.24),
                (1.1, -0.18), (1.12, -0.09), (1.07, -0.02), (1.0, 0.0)]


def _link(ng, a, b): ng.links.new(a, b)


def _new_group(name):
    ng = bpy.data.node_groups.new(name, 'GeometryNodeTree'); return ng, ng.nodes


def _io(ng, name, kind, in_out='INPUT', default=None):
    s = ng.interface.new_socket(name, in_out=in_out, socket_type=kind)
    if default is not None: s.default_value = default
    return s


def sweep_group(name, profile, flip=False):
    """curve -> capture v (spline factor); profile -> capture u; Curve to Mesh scaled by the curve radius; UVMap = (u, v); optional flip; smooth"""
    if name in bpy.data.node_groups: return bpy.data.node_groups[name]
    ng, N = _new_group(name); _io(ng, 'Geometry', 'NodeSocketGeometry'); _io(ng, 'Geometry', 'NodeSocketGeometry', 'OUTPUT')
    gin = N.new('NodeGroupInput'); gout = N.new('NodeGroupOutput')
    sp = N.new('GeometryNodeSplineParameter')
    capC = N.new('GeometryNodeCaptureAttribute'); capC.capture_items.new('FLOAT', 'v'); capC.domain = 'POINT'
    _link(ng, gin.outputs[0], capC.inputs['Geometry']); _link(ng, sp.outputs['Factor'], capC.inputs['v'])
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


def prof_arc(res):
    def f(ng):
        c = ng.nodes.new('GeometryNodeCurveArc'); c.inputs['Resolution'].default_value = res; c.inputs['Radius'].default_value = 1.0
        c.inputs['Start Angle'].default_value = 0.0; c.inputs['Sweep Angle'].default_value = 2 * math.pi; return c.outputs['Curve']
    return f


def prof_object(name, pts):
    """a poly curve object (stored with the library, fake user) referenced through an Object Info node; pts are (across, up)"""
    cu = bpy.data.curves.new(name + '_prof', 'CURVE'); cu.dimensions = '3D'; spl = cu.splines.new('POLY'); spl.points.add(len(pts) - 1)
    for i, (x, y) in enumerate(pts): spl.points[i].co = (x, -y, 0, 1)   # measured: profile X -> the curve's right, profile -Y -> up
    pob = bpy.data.objects.new(name + '_prof', cu); pob.use_fake_user = True
    def f(ng):
        oi = ng.nodes.new('GeometryNodeObjectInfo'); oi.inputs['Object'].default_value = pob; return oi.outputs['Geometry']
    return f


def gold_ring_group():
    """RB_GoldRing: Curve Arc (open, 2 pi) of radius Radius, minimum-twist normals, radius = Band, swept with the band profile"""
    name = 'RB_GoldRing'
    if name in bpy.data.node_groups: return bpy.data.node_groups[name]
    band = bpy.data.node_groups['RB_Band']
    ng, N = _new_group(name); _io(ng, 'Geometry', 'NodeSocketGeometry', 'OUTPUT')
    _io(ng, 'Radius', 'NodeSocketFloat', default=1.0); _io(ng, 'Band', 'NodeSocketFloat', default=0.3); _io(ng, 'Resolution', 'NodeSocketInt', default=160)
    gin = N.new('NodeGroupInput'); gout = N.new('NodeGroupOutput')
    arc = N.new('GeometryNodeCurveArc'); arc.inputs['Start Angle'].default_value = 0.0; arc.inputs['Sweep Angle'].default_value = 2 * math.pi
    _link(ng, gin.outputs['Radius'], arc.inputs['Radius']); _link(ng, gin.outputs['Resolution'], arc.inputs['Resolution'])
    nrm = N.new('GeometryNodeSetCurveNormal')
    # measured in Blender 5.3 (r45): Curve to Mesh lays the profile's X along the curve NORMAL. Free normal = +Z (the ring's axis = the drum
    # axis) -> the band's width runs along the drum, its thickness radially, exactly as the r43 rings. Mode is a menu socket in 5.3.
    nrm.inputs['Mode'].default_value = 'Free'; nrm.inputs['Normal'].default_value = (0.0, 0.0, 1.0)
    _link(ng, arc.outputs['Curve'], nrm.inputs['Curve'])
    rad = N.new('GeometryNodeSetCurveRadius'); _link(ng, nrm.outputs['Curve'], rad.inputs['Curve']); _link(ng, gin.outputs['Band'], rad.inputs['Radius'])
    g = N.new('GeometryNodeGroup'); g.node_tree = band; _link(ng, rad.outputs['Curve'], g.inputs[0]); _link(ng, g.outputs[0], gout.inputs[0])
    return ng


def foam_group():
    """RB_FoamBank v2: cumulus clusters (4 lumpy spheres each) along a bank curve, clumped by noise, random turn, flattened"""
    name = 'RB_FoamBank'
    if name in bpy.data.node_groups: return bpy.data.node_groups[name]
    ng, N = _new_group(name)
    _io(ng, 'Geometry', 'NodeSocketGeometry'); _io(ng, 'Spacing', 'NodeSocketFloat', default=0.15); _io(ng, 'Size', 'NodeSocketFloat', default=0.12)
    _io(ng, 'Seed', 'NodeSocketInt', default=0); _io(ng, 'Spread', 'NodeSocketFloat', default=1.0); _io(ng, 'Height', 'NodeSocketFloat', default=0.62)
    _io(ng, 'Detail', 'NodeSocketInt', default=1); _io(ng, 'Geometry', 'NodeSocketGeometry', 'OUTPUT')
    gin = N.new('NodeGroupInput'); gout = N.new('NodeGroupOutput')
    rs = N.new('GeometryNodeResampleCurve'); rs.inputs['Mode'].default_value = 'Length'; _link(ng, gin.outputs['Geometry'], rs.inputs['Curve']); _link(ng, gin.outputs['Spacing'], rs.inputs['Length'])
    c2p = N.new('GeometryNodeCurveToPoints'); c2p.mode = 'EVALUATED'; _link(ng, rs.outputs[0], c2p.inputs['Curve'])
    # jitter (scaled by Size x Spread), a little up / down
    jit = N.new('FunctionNodeRandomValue'); jit.data_type = 'FLOAT_VECTOR'; jit.inputs['Min'].default_value = (-1, -1, -0.15); jit.inputs['Max'].default_value = (1, 1, 0.1)
    _link(ng, gin.outputs['Seed'], jit.inputs['Seed'])
    ss = N.new('ShaderNodeMath'); ss.operation = 'MULTIPLY'; _link(ng, gin.outputs['Size'], ss.inputs[0]); _link(ng, gin.outputs['Spread'], ss.inputs[1])
    jsc = N.new('ShaderNodeVectorMath'); jsc.operation = 'SCALE'; _link(ng, jit.outputs['Value'], jsc.inputs[0]); _link(ng, ss.outputs[0], jsc.inputs['Scale'])
    sp = N.new('GeometryNodeSetPosition'); _link(ng, c2p.outputs['Points'], sp.inputs['Geometry']); _link(ng, jsc.outputs[0], sp.inputs['Offset'])
    # the cluster: 4 lumpy spheres (cumulus), built once
    def ico(r, off):
        i = N.new('GeometryNodeMeshIcoSphere'); i.inputs['Radius'].default_value = r; _link(ng, gin.outputs['Detail'], i.inputs['Subdivisions'])
        t = N.new('GeometryNodeTransform'); t.inputs['Translation'].default_value = off; _link(ng, i.outputs['Mesh'], t.inputs['Geometry']); return t.outputs[0]
    join = N.new('GeometryNodeJoinGeometry')
    for r, off in ((1.0, (0, 0, 0)), (0.72, (0.62, 0.12, 0.12)), (0.74, (-0.58, -0.16, 0.08)), (0.58, (0.08, 0.5, 0.36)), (0.5, (-0.14, -0.46, 0.42))):
        _link(ng, ico(r, off), join.inputs[0])
    # per-heap size: random 0.55..1.25 x clumping noise along the bank 0.45..1.6
    rnd = N.new('FunctionNodeRandomValue'); rnd.data_type = 'FLOAT'; rnd.inputs['Min'].default_value = 0.55; rnd.inputs['Max'].default_value = 1.25; _link(ng, gin.outputs['Seed'], rnd.inputs['Seed'])
    pos = N.new('GeometryNodeInputPosition'); noi = N.new('ShaderNodeTexNoise'); noi.inputs['Scale'].default_value = 1.3; _link(ng, pos.outputs[0], noi.inputs['Vector'])
    mr = N.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = 0.3; mr.inputs['From Max'].default_value = 0.7; mr.inputs['To Min'].default_value = 0.45; mr.inputs['To Max'].default_value = 1.6
    _link(ng, noi.outputs['Fac'], mr.inputs['Value'])
    m1 = N.new('ShaderNodeMath'); m1.operation = 'MULTIPLY'; _link(ng, rnd.outputs['Value'], m1.inputs[0]); _link(ng, mr.outputs['Result'], m1.inputs[1])
    m2 = N.new('ShaderNodeMath'); m2.operation = 'MULTIPLY'; _link(ng, m1.outputs[0], m2.inputs[0]); _link(ng, gin.outputs['Size'], m2.inputs[1])
    mz = N.new('ShaderNodeMath'); mz.operation = 'MULTIPLY'; _link(ng, m2.outputs[0], mz.inputs[0]); _link(ng, gin.outputs['Height'], mz.inputs[1])
    sc = N.new('ShaderNodeCombineXYZ'); _link(ng, m2.outputs[0], sc.inputs[0]); _link(ng, m2.outputs[0], sc.inputs[1]); _link(ng, mz.outputs[0], sc.inputs[2])
    rot = N.new('FunctionNodeRandomValue'); rot.data_type = 'FLOAT_VECTOR'; rot.inputs['Min'].default_value = (0, 0, 0); rot.inputs['Max'].default_value = (0, 0, 2 * math.pi)
    seed2 = N.new('ShaderNodeMath'); seed2.operation = 'ADD'; seed2.inputs[1].default_value = 17.0; _link(ng, gin.outputs['Seed'], seed2.inputs[0]); _link(ng, seed2.outputs[0], rot.inputs['Seed'])
    e2r = N.new('FunctionNodeEulerToRotation'); _link(ng, rot.outputs['Value'], e2r.inputs[0])
    iop = N.new('GeometryNodeInstanceOnPoints'); _link(ng, sp.outputs[0], iop.inputs['Points']); _link(ng, join.outputs[0], iop.inputs['Instance'])
    _link(ng, sc.outputs[0], iop.inputs['Scale']); _link(ng, e2r.outputs[0], iop.inputs['Rotation'])
    real = N.new('GeometryNodeRealizeInstances'); _link(ng, iop.outputs[0], real.inputs[0])
    sm = N.new('GeometryNodeSetShadeSmooth'); _link(ng, real.outputs[0], sm.inputs[0]); _link(ng, sm.outputs[0], gout.inputs[0])
    return ng


def wall_tray_group():
    """RB_WallTray: half-disc tray, radius Width/2, thickness 0.11 Width; a parametric grid (u around the half rim, v: top face -> rim band ->
    underside) mapped by math nodes; straight edge along Y at x = -0.03 (3 cm into the wall), standing out along +X; UVMap = (u, v)"""
    name = 'RB_WallTray'
    if name in bpy.data.node_groups: return bpy.data.node_groups[name]
    ng, N = _new_group(name); _io(ng, 'Width', 'NodeSocketFloat', default=1.0); _io(ng, 'Geometry', 'NodeSocketGeometry', 'OUTPUT')
    gin = N.new('NodeGroupInput'); gout = N.new('NodeGroupOutput')
    grid = N.new('GeometryNodeMeshGrid'); grid.inputs['Size X'].default_value = 1.0; grid.inputs['Size Y'].default_value = 1.0
    grid.inputs['Vertices X'].default_value = 49; grid.inputs['Vertices Y'].default_value = 25
    pos = N.new('GeometryNodeInputPosition'); sep = N.new('ShaderNodeSeparateXYZ'); _link(ng, pos.outputs[0], sep.inputs[0])
    def m(op, a, b=None, c=None):
        n = N.new('ShaderNodeMath'); n.operation = op
        for i, x in enumerate((a, b, c)):
            if x is None: continue
            if isinstance(x, (int, float)): n.inputs[i].default_value = x
            else: _link(ng, x, n.inputs[i])
        return n.outputs[0]
    u = m('ADD', sep.outputs['X'], 0.5); v = m('ADD', sep.outputs['Y'], 0.5)          # grid -0.5..0.5 -> 0..1
    R = m('MULTIPLY', gin.outputs['Width'], 0.5); T = m('MULTIPLY', gin.outputs['Width'], 0.11)
    th = m('MULTIPLY', u, math.pi)
    # piecewise along v: top (v < .25): rr = R v/.25, h = T/2 ; rim (.25..75): rr = R, h = T/2 - T (v-.25)/.5 ; under (> .75): rr = R (1-(v-.75)/.25), h = -T/2
    k_top = m('MINIMUM', m('DIVIDE', v, 0.25), 1.0); k_und = m('MAXIMUM', m('DIVIDE', m('SUBTRACT', v, 0.75), 0.25), 0.0)
    rr = m('MULTIPLY', R, m('SUBTRACT', k_top, k_und))
    k_rim = m('MINIMUM', m('MAXIMUM', m('DIVIDE', m('SUBTRACT', v, 0.25), 0.5), 0.0), 1.0)
    h = m('MULTIPLY', T, m('SUBTRACT', 0.5, k_rim))
    x = m('SUBTRACT', m('MULTIPLY', rr, m('SINE', th)), 0.03); y = m('MULTIPLY', rr, m('COSINE', th))
    cmb = N.new('ShaderNodeCombineXYZ'); _link(ng, x, cmb.inputs[0]); _link(ng, y, cmb.inputs[1]); _link(ng, h, cmb.inputs[2])
    uv = N.new('ShaderNodeCombineXYZ'); _link(ng, u, uv.inputs[0]); _link(ng, v, uv.inputs[1])
    st = N.new('GeometryNodeStoreNamedAttribute'); st.data_type = 'FLOAT2'; st.domain = 'CORNER'; st.inputs['Name'].default_value = 'UVMap'
    _link(ng, grid.outputs['Mesh'], st.inputs['Geometry']); _link(ng, uv.outputs[0], st.inputs['Value'])
    setp = N.new('GeometryNodeSetPosition'); _link(ng, st.outputs[0], setp.inputs['Geometry']); _link(ng, cmb.outputs[0], setp.inputs['Position'])
    sm = N.new('GeometryNodeSetShadeSmooth'); _link(ng, setp.outputs[0], sm.inputs[0]); _link(ng, sm.outputs[0], gout.inputs[0])
    return ng


def machinery_row_group():
    """RB_MachineryRow: a unit RB_WallTray instanced on every input point, scaled by 'tray_w', its +X turned to 'tray_n' (toward the axis)
    and its Y along 'tray_t' (the drum axis), realised"""
    name = 'RB_MachineryRow'
    if name in bpy.data.node_groups: return bpy.data.node_groups[name]
    tray = bpy.data.node_groups['RB_WallTray']
    ng, N = _new_group(name); _io(ng, 'Points', 'NodeSocketGeometry'); _io(ng, 'Geometry', 'NodeSocketGeometry', 'OUTPUT')
    gin = N.new('NodeGroupInput'); gout = N.new('NodeGroupOutput')
    t = N.new('GeometryNodeGroup'); t.node_tree = tray; t.inputs['Width'].default_value = 1.0
    def attr(nm, typ):
        a = N.new('GeometryNodeInputNamedAttribute'); a.data_type = typ; a.inputs['Name'].default_value = nm; return a.outputs['Attribute']
    al1 = N.new('FunctionNodeAlignRotationToVector'); al1.axis = 'X'; _link(ng, attr('tray_n', 'FLOAT_VECTOR'), al1.inputs['Vector'])
    al2 = N.new('FunctionNodeAlignRotationToVector'); al2.axis = 'Y'; al2.pivot_axis = 'X'; _link(ng, al1.outputs['Rotation'], al2.inputs['Rotation']); _link(ng, attr('tray_t', 'FLOAT_VECTOR'), al2.inputs['Vector'])
    iop = N.new('GeometryNodeInstanceOnPoints'); _link(ng, gin.outputs['Points'], iop.inputs['Points']); _link(ng, t.outputs[0], iop.inputs['Instance'])
    _link(ng, al2.outputs['Rotation'], iop.inputs['Rotation']); _link(ng, attr('tray_w', 'FLOAT'), iop.inputs['Scale'])
    real = N.new('GeometryNodeRealizeInstances'); _link(ng, iop.outputs[0], real.inputs[0]); _link(ng, real.outputs[0], gout.inputs[0])
    return ng


def build_all():
    """create every asset node group in the current file (idempotent); returns {name: node group}"""
    sweep_group('RB_PerforatedDrum', prof_arc(96), flip=True)
    sweep_group('RB_WaterChannel', prof_object('RB_WaterChannel', RIBBON_PROFILE))
    sweep_group('RB_ChannelBody', prof_object('RB_ChannelBody', BODY_PROFILE), flip=True)
    sweep_group('RB_Band', prof_object('RB_Band', BAND_PROFILE))
    gold_ring_group(); foam_group(); wall_tray_group(); machinery_row_group()
    return {n: bpy.data.node_groups[n] for n in ASSET_NAMES}


if __name__ == '__main__' and '--' in sys.argv:
    out = sys.argv[sys.argv.index('--') + 1]
    bpy.ops.wm.read_factory_settings(use_empty=True)
    groups = build_all()
    for n, ng in groups.items():
        ng.asset_mark(); ng.asset_data.description = (__doc__.split(n, 1)[1].split('\n  RB_', 1)[0].strip(' \n') if n in __doc__ else n)[:400]
        ng.asset_data.tags.new('Rainbow washer kit'); ng.use_fake_user = True
    bpy.ops.wm.save_as_mainfile(filepath=out, compress=True)
    print('saved', out, sorted(groups))
