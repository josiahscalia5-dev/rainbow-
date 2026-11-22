"""Reference-Locked 3D Scene Builder - GEOMETRY step (Blender 5.3, headless): builds the Bubble Dash -> Sock Rescue section as connected
3D meshes from the fitted layout (fit_section.py -> section.json) and exports ONE optimized GLB (no textures: the game bakes the approved
pictures onto these meshes at load and keeps code materials where the pictures never showed a surface).
  blender -b --python tools/reflock/blender_section.py -- <section.json> <out.glb>
Every mesh is a clean parametric grid with its own non-overlapping UV layout (u around / across, v along), so the same UVs serve the
picture bake (one texel = one place in the world) and the repeating code material. Object names carry the material family:
  tunnel, ring_*, arch, bulkhead, wall_L, wall_R, ceiling, backwall, outlet_*, fall_*, pipe_*, collar_*, tower*, pod_*, rail_*, towel_*, sock_*
World coordinates follow the game (y up, water y = 0, route along -z); Blender stores them Z-up and the glTF exporter converts back.
"""
import bpy, bmesh, sys, json, math
from mathutils import Vector
argv = sys.argv[sys.argv.index('--') + 1:]; SEC = json.load(open(argv[0])); OUT = argv[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
T, CH, SF = SEC['tunnel'], SEC['chamber'], SEC['sock_fit']
B2 = lambda p: (p[0], -p[2], p[1])                                   # game (x, y, z) -> Blender (x, -z, y)
lerp = lambda a, b, x: a + (b - a) * x
smooth = lambda x: x * x * (3 - 2 * x)

def grid(name, nu, nv, fn, close_u=False, flip=False):
    """fn(a, b) -> ((x, y, z) game coords, (u, v)); a in [0,1] across nu, b in [0,1] along nv"""
    me = bpy.data.meshes.new(name); bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap')
    V, UV = [], []
    for j in range(nv + 1):
        row, rowuv = [], []
        for i in range(nu + 1):
            p, uv = fn(i / nu, j / nv); row.append(bm.verts.new(B2(p))); rowuv.append(uv)
        V.append(row); UV.append(rowuv)
    for j in range(nv):
        for i in range(nu):
            q = [V[j][i], V[j][i + 1], V[j + 1][i + 1], V[j + 1][i]]; uq = [UV[j][i], UV[j][i + 1], UV[j + 1][i + 1], UV[j + 1][i]]
            if flip: q, uq = q[::-1], uq[::-1]
            f = bm.faces.new(q)
            for l, uv in zip(f.loops, uq): l[uvl].uv = uv
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6) if close_u else None
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob)
    for p in me.polygons: p.use_smooth = True
    return ob

# ---------------- tunnel: arch sleeve end -> funnel -> Sock Rescue tube -> exit, radius / axis height profile ----------------
ZA, Z0F, Z1F, ZX = T['z_arch'], T['funnel'][0], T['funnel'][1], T['z_exit']
def radius(z):
    if z >= Z0F: return T['r_arch_in']
    if z >= Z1F: return lerp(T['r_arch_in'], T['r_sock'], smooth((Z0F - z) / (Z0F - Z1F)))
    return T['r_sock']
def axy(z):
    if z >= Z0F: return T['axis_y_arch']
    if z >= Z1F: return lerp(T['axis_y_arch'], T['axis_y_sock'], smooth((Z0F - z) / (Z0F - Z1F)))
    return T['axis_y_sock']
# the tube is split into segments (each with its own 0..1 UVs): the funnel, then 2.5 u Sock Rescue segments, so every segment can carry
# its own baked picture pixels at a useful texel density and the best painted segment can serve as the template for the unseen ones
SEGS = [(ZA - 0.6, Z0F), (Z0F, Z0F - 2.0), (Z0F - 2.0, Z1F)]
z = Z1F
while z > ZX + 1e-6: SEGS.append((z, max(ZX, z - 2.5))); z -= 2.5
for i, (z0, z1) in enumerate(SEGS):
    L = z0 - z1
    grid(f'tunnel_{i:02d}', 128, max(4, int(L / 0.1)), lambda a, b, z0=z0, L=L: ((radius(z0 - b * L) * math.cos(2 * math.pi * a), axy(z0 - b * L) + radius(z0 - b * L) * math.sin(2 * math.pi * a), z0 - b * L),
                                                                                  (a, b)), flip=True)
# gold rings: rounded band (front face -> inner face -> back face), radius following the tunnel; the five painted Sock rings + funnel ribs
def ring(name, z, depth=0.22, inset=0.1):
    R = radius(z); Y = axy(z); ri = R * (1 - inset)
    def f(a, b):
        th = 2 * math.pi * a
        if b < 1 / 3: k = b * 3; r = lerp(R, ri, smooth(k)); zz = z + 0.03 * math.sin(math.pi * k)
        elif b < 2 / 3: k = (b - 1 / 3) * 3; r = ri - 0.015 * math.sin(math.pi * k); zz = z - depth * k
        else: k = (b - 2 / 3) * 3; r = lerp(ri, R, smooth(k)); zz = z - depth - 0.03 * math.sin(math.pi * k)
        return ((r * math.cos(th), Y + r * math.sin(th), zz), (a, b))
    return grid(name, 160, 12, f, flip=True)
ribs = [Z0F - 0.8, Z0F - 1.6, Z0F - 2.4, Z0F - 3.2, Z0F - 4.0, Z0F - 4.8, Z1F - 0.3] + [T['rings_sock'][-1] - 0.8, T['rings_sock'][-1] - 1.5]
for i, z in enumerate(ribs): ring(f'ring_f{i}', z, 0.16, 0.07)
for i, z in enumerate(T['rings_sock']): ring(f'ring_s{i}', z, 0.24, 1 - SEC['tunnel']['ring_open_sock'] / T['r_sock'] + 0.0)
# the golden arch: thick front face (outer -> inner), rounded outer rim, deep inner sleeve
def arch_f(a, b):
    th = 2 * math.pi * a; Ri, Ro, Y = T['r_arch_in'], T['r_arch_out'], T['axis_y_arch']
    if b < 0.25: k = b / 0.25; r = Ro; zz = ZA - 0.45 + 0.45 * smooth(k)                          # outer rim (from the bulkhead to the front)
    elif b < 0.6: k = (b - 0.25) / 0.35; r = lerp(Ro, Ri, k); zz = ZA + 0.05 * math.sin(math.pi * k)   # front face (slightly domed)
    else: k = (b - 0.6) / 0.4; r = Ri; zz = ZA - 0.6 * k                                          # inner sleeve
    return ((r * math.cos(th), Y + r * math.sin(th), zz), (a, b))
grid('arch', 192, 20, arch_f, flip=True)
# bulkhead around the arch: from the arch's outer rim out to a rectangle (pink perforated wall); up to just above the arch
ZB = ZA - 0.45; YB = T['axis_y_arch'] + T['r_arch_out'] + 0.55; XL, XR = CH['xl'], CH['xr']
def rect_pt(th):
    dx, dy = math.cos(th), math.sin(th); Y = T['axis_y_arch']; ts = []
    for v, d, lim in [(XR, dx, 1), (XL, dx, 1), (YB - Y, dy, 0), (-0.4 - Y, dy, 0)]:
        if abs(d) > 1e-9:
            t = v / d if lim else v / d
            if t > 0: ts.append(t)
    t = min(ts); return dx * t, Y + dy * t
grid('bulkhead', 192, 8, lambda a, b: ((lerp(T['r_arch_out'] * math.cos(2 * math.pi * a), rect_pt(2 * math.pi * a)[0], b),
                                         lerp(T['axis_y_arch'] + T['r_arch_out'] * math.sin(2 * math.pi * a), rect_pt(2 * math.pi * a)[1], b), ZB),
                                        ((lerp(T['r_arch_out'] * math.cos(2 * math.pi * a), rect_pt(2 * math.pi * a)[0], b) - XL) / (XR - XL),
                                         (lerp(T['axis_y_arch'] + T['r_arch_out'] * math.sin(2 * math.pi * a), rect_pt(2 * math.pi * a)[1], b) + 0.4) / (YB + 0.4))))
# side walls, back wall above the bulkhead, ceiling (the chamber room)
ZN, YC = CH['z_near'], CH['yc']; ZBW = ZA - 5.0
grid('wall_L', 40, 20, lambda a, b: ((XL, lerp(-0.4, YC, a), lerp(ZN, ZBW, b)), (a, b)))
grid('wall_R', 40, 20, lambda a, b: ((XR, lerp(-0.4, YC, a), lerp(ZN, ZBW, b)), (a, b)), flip=True)
grid('backwall', 30, 10, lambda a, b: ((lerp(XL, XR, a), lerp(YB - 0.6, YC, b), ZBW), (a, b)), flip=True)
grid('ledge', 30, 6, lambda a, b: ((lerp(XL, XR, a), YB, lerp(ZB, ZBW, b)), (a, b)), flip=True)
grid('ceiling', 20, 20, lambda a, b: ((lerp(XL, XR, a), YC, lerp(ZN, ZBW, b)), (a, b)), flip=True)
grid('wall_near_floor', 20, 4, lambda a, b: ((lerp(XL, XR, a), -0.4, lerp(ZN, ZB, b)), (a, b)))   # under the water (closes the room)
# gold outlet pipes on both walls (short gold tubes with a thick lip, pointing into the room and toward the river) + their dark throats
def outlet(name, o, side):
    c = Vector(o[:3]); r = o[3]; n = Vector((-side * 0.85, -0.05, 0.5)).normalized()   # pointing out of the wall, a little toward the camera
    up = Vector((0, 1, 0)); u1 = up.cross(n).normalized(); u2 = n.cross(u1)
    def f(a, b):
        th = 2 * math.pi * a
        if b < 0.4: k = b / 0.4; rr = r; d = lerp(-0.3, 0.55, k)                       # outer barrel (from inside the wall)
        elif b < 0.6: k = (b - 0.4) / 0.2; rr = lerp(r, 0.72 * r, k); d = 0.55 + 0.06 * math.sin(math.pi * k)   # lip
        else: k = (b - 0.6) / 0.4; rr = 0.72 * r; d = lerp(0.55, -0.2, k)              # throat
        p = c + n * d + (u1 * math.cos(th) + u2 * math.sin(th)) * rr; return ((p.x, p.y, p.z), (a, b))
    grid(name, 64, 16, f, flip=(side < 0))
    p0 = c + n * -0.15
    grid(name + '_throat', 32, 1, lambda a, b: (tuple(p0 + (u1 * math.cos(2 * math.pi * a) + u2 * math.sin(2 * math.pi * a)) * 0.72 * r * (1 - b)), (a, b)), flip=(side > 0))
    return c, n, r
oL = outlet('outlet_L', CH['outlet_L'], -1); oR = outlet('outlet_R', CH['outlet_R'], 1)
# waterfalls: a curved sheet from the bottom of each mouth arcing down into the river (animated water in the game)
def fall(name, o, land):
    c, n, r = o; top = c + n * 0.5 + Vector((0, -0.45 * r, 0)); end = Vector(land); w = 0.62 * r
    side = Vector((0, 1, 0)).cross(n).normalized()
    def f(a, b):
        k = b; ctl = top + n * 0.9
        p = top * (1 - k) ** 2 + ctl * 2 * k * (1 - k) + end * k * k
        p = p + side * (a - 0.5) * w * (1 + 0.5 * k); return ((p.x, p.y, p.z), (a, b))
    grid(name, 12, 24, f)
fall('fall_L', oL, CH['fall_L']); fall('fall_R', oR, CH['fall_R'])
# purple pipes with gold collars, placed where the picture shows them (screen polyline + depth -> 3D centre line)
cam = SEC['cams']['bubble']; FPX = SEC['focal_px']; IW, IH = SEC['img']
def cam_ray(px, py):
    yaw, pitch = cam['yaw'], cam['pitch']; d = Vector(((px - IW / 2) / FPX, -(py - IH / 2) / FPX, -1.0))
    cp, sp = math.cos(pitch), math.sin(pitch); d = Vector((d.x, cp * d.y - sp * d.z, sp * d.y + cp * d.z))
    cy, sy = math.cos(yaw), math.sin(yaw); d = Vector((cy * d.x + sy * d.z, d.y, -sy * d.x + cy * d.z)); return d.normalized()
def at_depth(px, py, depth):
    C = Vector(cam['pos']); d = cam_ray(px, py); return C + d * (depth / -d.z)
def pipe(name, pts, rpx):
    P = [at_depth(x, y, z) for x, y, z in pts]; r = rpx * (sum(p[2] for p in pts) / len(pts)) / FPX
    from mathutils.geometry import interpolate_bezier
    curve = []
    for i in range(len(P) - 1):
        p0, p1 = P[i], P[i + 1]; pm = P[i - 1] if i > 0 else p0; pn = P[i + 2] if i + 2 < len(P) else p1
        for s in range(8):
            t = s / 8; t2, t3 = t * t, t * t * t
            curve.append(0.5 * ((2 * p1 - 2 * p1) + (2 * p0) + (-pm + p1) * t + (2 * pm - 5 * p0 + 4 * p1 - pn) * t2 + (-pm + 3 * p0 - 3 * p1 + pn) * t3))
    curve.append(P[-1])
    L = [0.0]
    for i in range(1, len(curve)): L.append(L[-1] + (curve[i] - curve[i - 1]).length)
    def frame(i):
        tg = (curve[min(i + 1, len(curve) - 1)] - curve[max(i - 1, 0)]).normalized(); ref = Vector((0, 1, 0)) if abs(tg.y) < 0.9 else Vector((1, 0, 0))
        n1 = ref.cross(tg).normalized(); n2 = tg.cross(n1); return tg, n1, n2
    nv = len(curve) - 1
    def f(a, b):
        i = min(nv, round(b * nv)); tg, n1, n2 = frame(i); th = 2 * math.pi * a; p = curve[i] + (n1 * math.cos(th) + n2 * math.sin(th)) * r
        return ((p.x, p.y, p.z), (a, L[i] / L[-1]))
    grid(name, 24, nv, f, flip=True)
    for j, d in enumerate([0.15, 0.5, 0.85]):                                    # gold collars
        i = min(nv, round(d * nv)); tg, n1, n2 = frame(i); c = curve[i]
        def g(a, b, c=c, n1=n1, n2=n2, tg=tg):
            th = 2 * math.pi * a; ph = 2 * math.pi * b; rr = r * 1.18 + 0.35 * r * math.cos(ph) * 0.4; p = c + (n1 * math.cos(th) + n2 * math.sin(th)) * rr + tg * 0.35 * r * math.sin(ph) * 0.6
            return ((p.x, p.y, p.z), (a, b))
        grid(f'collar_{name}_{j}', 32, 8, g, flip=True)
for name, pts, rpx in [('pipe_A', [(300, 395, 14.4), (300, 470, 14.4), (300, 565, 14.4)], 24),
                       ('pipe_B', [(-40, 215, 10.0), (90, 280, 11.3), (210, 345, 12.6), (300, 395, 14.4)], 30),
                       ('pipe_C', [(990, 215, 9.6), (900, 260, 9.9), (820, 320, 10.1), (800, 420, 10.2), (810, 520, 10.3), (835, 575, 10.0)], 46),
                       ('pipe_D', [(740, 380, 15.2), (740, 450, 15.2), (735, 520, 15.2)], 22),
                       ('pipe_E', [(355, 450, 15.6), (355, 520, 15.6), (380, 560, 15.0)], 20)]:
    pipe(name, pts, rpx)
# the shirt tank above the arch: cylinder + gold rims + heaped foam top
tx, tz, tw, tb, tt = CH['tower']; TH = tt - tb
grid('tower', 64, 12, lambda a, b: ((tx + tw * math.cos(2 * math.pi * a), lerp(tb, tt - 0.25 * TH, b), tz + tw * math.sin(2 * math.pi * a)), (a, b)), flip=False)
for j, y in enumerate([tb + 0.06 * TH, tt - 0.27 * TH]):
    grid(f'tower_rim{j}', 64, 8, lambda a, b, y=y: ((tx + (tw * 1.06 + 0.06 * TH * math.cos(2 * math.pi * b) * 0.5) * math.cos(2 * math.pi * a), y + 0.05 * TH * math.sin(2 * math.pi * b),
                                                    tz + (tw * 1.06 + 0.06 * TH * math.cos(2 * math.pi * b) * 0.5) * math.sin(2 * math.pi * a)), (a, b)), flip=True)
import random; random.seed(40)
for j in range(16):                                                              # foam heaped on the tank (round domes)
    ang = random.random() * 2 * math.pi; rad = random.random() ** 0.5 * tw * 0.8; rs = tw * (0.22 + 0.18 * random.random()); cy_ = tt - 0.27 * TH + rs * 0.4 + (1 - rad / tw) * 0.25 * TH
    grid(f'towerfoam_{j}', 16, 10, lambda a, b, ang=ang, rad=rad, rs=rs, cy_=cy_: ((tx + rad * math.cos(ang) + rs * math.sin(math.pi * b) * math.cos(2 * math.pi * a), cy_ + rs * 0.8 * math.cos(math.pi * b),
                                                                                tz + rad * math.sin(ang) + rs * math.sin(math.pi * b) * math.sin(2 * math.pi * a)), (a, b)), flip=True)
# Sock Rescue tunnel furniture: silver lifter pods hanging from the ceiling, gold towel rails with draped towels (painted ones + repeats)
k, zc, ay = SF['scale'], SF['z_cam'], SF['axis_y']; RS = T['r_sock']
def pod(name, z, th, L=0.55, rad=0.13):
    base = Vector((RS * math.cos(th), ay + RS * math.sin(th), z)); tip = Vector((0.55 * RS * math.cos(th), ay + 0.55 * RS * math.sin(th), z - 0.25))
    ax = (tip - base).normalized(); ref = Vector((0, 0, 1)); n1 = ref.cross(ax).normalized(); n2 = ax.cross(n1)
    def f(a, b):
        th2 = 2 * math.pi * a; prof = math.sin(math.pi * min(1, b * 1.05)) ** 0.7 * (1 - 0.35 * b); p = base + (tip - base) * b + (n1 * math.cos(th2) + n2 * math.sin(th2)) * rad * prof
        return ((p.x, p.y, p.z), (a, b))
    grid(name, 24, 16, f, flip=True)
n = 0
for t, th in SF['pods']: pod(f'pod_{n}', zc - t * k, th); n += 1
for zr in T['rings_sock'][1:-1]:
    for th in (2.04, 1.17): pod(f'pod_{n}', zr - 0.9, th); n += 1
def towel(name, z, side, rh, w=0.62, drop=0.62):
    """gold rail standing off the wall + a terry towel folded over it (front + back layer, soft folds)"""
    x_wall = side * math.sqrt(max(0.05, RS ** 2 - rh ** 2)) * 0.96; x_bar = x_wall - side * 0.16; yb = ay + rh
    grid(f'rail_{name}', 16, 24, lambda a, b: ((x_bar + 0.025 * math.cos(2 * math.pi * a) - (side * 0.16 * (1 - math.sin(math.pi * b)) if b < 0.08 or b > 0.92 else 0),
                                                 yb + 0.025 * math.sin(2 * math.pi * a), z - (w + 0.12) * b + 0.06), (a, b)), flip=True)
    def f(a, b):            # a across the towel (along the route), b: 0 = back bottom -> 0.5 over the bar -> 1 = front bottom
        zz = z - 0.06 - w * a; fold = 0.02 * math.sin(a * math.pi * 6)
        if b < 0.5: k2 = b / 0.5; y = yb - drop * (1 - k2) * 0.92; x = x_bar + side * (0.03 + fold)
        else: k2 = (b - 0.5) / 0.5; y = yb - drop * k2; x = x_bar - side * (0.035 + 0.05 * k2 + fold)
        return ((x, y, zz), (a, b))
    grid(f'towel_{name}', 24, 24, f)
for i, (t, side, rh, f0, f1) in enumerate(SF['towels']): towel(f'p{i}', zc - t * k, side, (rh - 0.1) * k)
for i, zr in enumerate(T['rings_sock'][1:-1]): towel(f'r{i}', zr - 1.3, -1 if i % 2 == 0 else 1, 0.55 * k)
# floating socks (picked up in the game): a bent tube (leg -> heel -> foot)
def sock(name, p):
    P = Vector(p); pts = [P + Vector((-0.02, 0.2, -0.04)), P + Vector((0, 0.05, 0)), P + Vector((0.07, 0.01, 0.03)), P + Vector((0.18, 0.02, 0.06))]   # leg up, foot lying sideways in the water
    nv = 18; cur = []
    for i in range(nv + 1):
        t = i / nv; seg = min(2, int(t * 3)); u = t * 3 - seg; cur.append(pts[seg].lerp(pts[seg + 1], u))
    def f(a, b):
        i = round(b * nv); tg = (cur[min(i + 1, nv)] - cur[max(i - 1, 0)]).normalized(); n1 = Vector((1, 0, 0)).cross(tg).normalized() if abs(tg.x) < 0.9 else Vector((0, 1, 0)); n2 = tg.cross(n1)
        r = 0.07 * (1.0 + 0.15 * math.sin(math.pi * b)); th = 2 * math.pi * a; q = cur[i] + (n1 * math.cos(th) + n2 * math.sin(th)) * r
        return ((q.x, q.y, q.z), (a, b))
    grid(name, 16, nv, f, flip=True)
for i, p in enumerate(SEC['socks']): sock(f'sock_{i}', p)
# export (Y-up glTF), no materials (the game assigns them by object name)
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_texcoords=True, export_normals=True, export_materials='NONE', export_apply=True)
print('exported', OUT, len(bpy.data.objects), 'objects')
