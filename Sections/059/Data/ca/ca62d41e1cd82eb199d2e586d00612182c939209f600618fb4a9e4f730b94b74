"""Rebuild one editable Screen 07 scenery excerpt, only in the run collection."""
import bpy, json, math, random
from pathlib import Path
from mathutils import Matrix, Vector
from mathutils.geometry import interpolate_bezier

RUN = 's07_banks'
out = run_root/'image2blender-runs'/RUN
inputs = run_root/'inputs'
layout = json.loads((inputs/'proj07.json').read_text())
samples = json.loads((inputs/'sections.json').read_text())
scene = bpy.context.scene

def ensure_collection():
    coll=bpy.data.collections.get(RUN)
    if coll is None:
        coll=bpy.data.collections.new(RUN)
        scene.collection.children.link(coll)
    return coll

def replace(name):
    old=bpy.data.objects.get(name)
    if old:
        assert old in list(ensure_collection().objects)
        bpy.data.objects.remove(old,do_unlink=True)

def obj(name,data):
    replace(name)
    o=bpy.data.objects.new(name,data)
    ensure_collection().objects.link(o)
    return o

def camera(name,pose=None,position=None,target=None):
    data=bpy.data.cameras.new(name)
    o=obj(name,data)
    data.sensor_fit='VERTICAL';data.sensor_height=36
    if pose:
        o.matrix_world=pose
        data.lens=36/(2*math.tan(math.radians(layout['camera']['fov']/2)))
    else:
        o.location=position
        o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
        data.type='ORTHO';data.ortho_scale=35
    return o

def setup():
    ensure_collection()
    x,u,d=[Vector(layout[k]) for k in ['X','U','D']]
    m=Matrix((x,u,-d)).transposed().to_4x4()
    m.translation=Vector(layout['water'])
    cam=layout['camera']['matrixWorld']
    raw=Matrix([[cam[i+4*j] for j in range(4)] for i in range(4)])
    convert=Matrix(((1,0,0,0),(0,0,-1,0),(0,1,0,0),(0,0,0,1)))
    camera('reference_camera',pose=convert@m.inverted()@raw)
    camera('oblique_camera',position=(11,-3,14),target=(0,12,0))
    camera('overhead_camera',position=(0,11,26),target=(0,11,0))
    scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=3
    scene.cycles.use_denoising=False
    scene.render.threads_mode='FIXED';scene.render.threads=4
    scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
    scene.render.film_transparent=True
    scene.view_settings.view_transform='Standard'
    scene.view_settings.look='None';scene.view_settings.exposure=0
    world=bpy.data.worlds.new('Preview world');scene.world=world
    world.use_nodes=True;world.node_tree.nodes.get('Background').inputs['Color'].default_value=(0.76,0.80,1,1)
    world.node_tree.nodes.get('Background').inputs['Strength'].default_value=.75

def base_mat(name,color,roughness):
    mat=bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.diffuse_color=(*color,1);mat.use_nodes=True
    bs=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    bs.inputs['Base Color'].default_value=(*color,1)
    bs.inputs['Roughness'].default_value=roughness
    return mat,bs

def light(name,pos,power,size):
    l=bpy.data.lights.new(name,'AREA');l.energy=power;l.shape='DISK';l.size=size
    o=obj(name,l);o.location=pos
    o.rotation_euler=(Vector((0,7,0))-o.location).to_track_quat('-Z','Y').to_euler()

def sweep(side,shaped):
    name=side+'_bank';v=[];faces=[];uv=[]
    cross=[0,.16,.35,.56,.78,1] if shaped else [0,1]
    # The right foreground is behind foam and clipped from the source. Start the
    # independently reconstructed right ribbon at the last visible edge.
    rows=[r for r in samples if side=='left' or r['along']>=-.6]
    for r in rows:
        outer,inner=r[side+'_outer'],r[side+'_inner']
        for u in cross:
            h=.018+(.075 if shaped else 0)*math.sin(math.pi*u)
            v.append((outer+(inner-outer)*u,r['along'],h))
            uv.append((.011+(.349-.011)*u,r['along']/2.4+(0 if side=='left' else .5)))
    n=len(cross)
    for j in range(len(rows)-1):
        for k in range(n-1):
            idx=j*n+k;face=(idx,idx+1,idx+n+1,idx+n)
            faces.append(face if side=='left' else tuple(reversed(face)))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(v,[],faces);mesh.update()
    o=obj(name,mesh);o['cross_sections']=len(rows);o['cross_columns']=n;o['coordinates']='X lateral, Y forward, Z relief'
    layer=mesh.uv_layers.new(name='Painted bank')
    for poly in mesh.polygons:
        poly.use_smooth=True
        for loop in poly.loop_indices:layer.data[loop].uv=uv[mesh.loops[loop].vertex_index]
    mat,_=base_mat('satin_magenta',(.72,.017,.25),.34)
    o.data.materials.append(mat)
    if shaped:
        mod=o.modifiers.new('Lip thickness','SOLIDIFY');mod.thickness=.045;mod.offset=-1
        guide=bpy.data.curves.new(side+'_spine','CURVE');guide.dimensions='3D'
        spl=guide.splines.new('BEZIER');pts=rows[::7]+[rows[-1]]
        spl.bezier_points.add(len(pts)-1)
        for bp,r in zip(spl.bezier_points,pts):
            bp.co=((r[side+'_inner']+r[side+'_outer'])*.5,r['along'],.09)
            bp.handle_left_type='AUTO';bp.handle_right_type='AUTO'
        spine=obj(side+'_spine',guide);spine.parent=o;spine.hide_render=True

def foam(side):
    # Small foam islands share one editable mesh per bank. Their relief is
    # inferred from the reference's round lit tops and overlapping silhouettes.
    rng=random.Random(7101 if side=='left' else 7102);v=[];faces=[];uv=[]
    clusters=([1.7,3.5,5.5,6.7,9.0,14,17.3] if side=='left' else [0.5,1.9,6.5,11.4,15.2,19.3])
    for z in clusters:
        for member in range(5):
            along=z+rng.uniform(-.55,.55)
            row=min(samples,key=lambda r:abs(r['along']-along))
            sign=-1 if side=='left' else 1
            rad=(.26 if member==0 else rng.uniform(.10,.22))
            x=row[side+'_outer']+sign*(.17+rng.uniform(-.07,.31))
            y=along;z0=-.055;start=len(v);rings=7;slices=12
            for a in range(rings):
                elev=-math.pi/2+math.pi*a/(rings-1)
                for b in range(slices):
                    angle=2*math.pi*b/slices
                    v.append((x+rad*1.18*math.cos(elev)*math.cos(angle),y+rad*1.35*math.cos(elev)*math.sin(angle),z0+rad*.82*math.sin(elev)))
                    uv.append((.5+.45*math.cos(elev)*math.cos(angle),.5+.42*math.sin(elev)))
            for a in range(rings-1):
                for b in range(slices):
                    k=start+a*slices;bb=(b+1)%slices
                    faces.append((k+b,k+bb,k+slices+bb,k+slices+b))
    name=side+'_foam';mesh=bpy.data.meshes.new(name);mesh.from_pydata(v,[],faces);mesh.update()
    o=obj(name,mesh);layer=mesh.uv_layers.new(name='Soap')
    for poly in mesh.polygons:
        poly.use_smooth=True
        for li in poly.loop_indices:layer.data[li].uv=uv[mesh.loops[li].vertex_index]
    mat,_=base_mat('soap_lilac',(.68,.76,.92),.34);o.data.materials.append(mat)

def texture(name,filename,rough,emission):
    mat=bpy.data.materials[name];tree=mat.node_tree
    bs=next(n for n in tree.nodes if n.type=='BSDF_PRINCIPLED')
    t=tree.nodes.get('Claudia texture') or tree.nodes.new('ShaderNodeTexImage');t.name='Claudia texture'
    t.image=bpy.data.images.load(str(inputs/filename),check_existing=True);t.image.pack();t.extension='REPEAT'
    tree.links.new(t.outputs['Color'],bs.inputs['Base Color'])
    tree.links.new(t.outputs['Color'],bs.inputs['Emission Color'])
    bs.inputs['Emission Strength'].default_value=emission;bs.inputs['Roughness'].default_value=rough

def render(stage,angle,pct=25):
    scene.camera=bpy.data.objects[angle+'_camera']
    scene.render.resolution_x=864;scene.render.resolution_y=1536;scene.render.resolution_percentage=pct
    scene.render.filepath=str(out/'renders'/(stage+'_'+angle+'.png'))
    bpy.ops.render.render(write_still=True)

def run_pass(stage):
    if stage=='blockout':
        setup()
        light('review_key',(0,4,9),600,10)
        for side in ['left','right']:sweep(side,False)
    elif stage=='form':
        scene.cycles.samples=12
        for side in ['left','right']:
            sweep(side,True);foam(side)
    elif stage=='materials':
        texture('satin_magenta','near_bank.png',.30,.34)
        texture('soap_lilac','near_foam.png',.36,.26)
    elif stage=='lighting':
        bpy.data.objects['review_key'].data.energy=245
        light('soft_side',(-4,12,7),175,8)
        scene.world.node_tree.nodes.get('Background').inputs['Strength'].default_value=.53
        mat=bpy.data.materials['satin_magenta']
        bs=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
        bs.inputs['Specular IOR Level'].default_value=.09
        bs.inputs['Emission Strength'].default_value=.18
    if stage in ('blockout','form','materials','lighting'):
        for ang in ['reference','oblique']:render(stage,ang)
    elif stage=='finish':
        scene.cycles.samples=32
        for ang in ['reference','oblique','overhead']:render('final',ang,100 if ang=='reference' else 50)
        scene.camera=bpy.data.objects['reference_camera'];scene.render.resolution_percentage=100
        bpy.ops.wm.save_as_mainfile(filepath=str(out/'s07-banks.blend'))
        bpy.ops.object.select_all(action='DESELECT')
        for name in ['left_bank','right_bank','left_foam','right_foam']:bpy.data.objects[name].select_set(True)
        bpy.ops.export_scene.gltf(filepath=str(out/'s07-banks.glb'),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_yup=True)
    return {'stage':stage,'collection':RUN,'objects':{o.name:len(o.data.vertices) if o.type=='MESH' else o.type for o in ensure_collection().objects}}
