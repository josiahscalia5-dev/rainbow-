"""Author the rounded wet crest and its fittings from the previous editable Screen 06.
In Blender 5.3 use build_patch(seats_path, blend_path, glb_path) with the parent model open.
Game units are preserved. Blender coordinates are (x, -z, y) relative to Three.js.
"""
import json
import math
import random
from pathlib import Path
import bpy
import numpy as np

UP = np.array([0., 1., 0.])

def smooth(a, b, value):
    u = np.clip((value - a) / (b - a), 0., 1.)
    return u * u * (3. - 2. * u)

def mix(a, b, t):
    return a + (b - a) * t

def unit(v):
    return v / max(.00001, np.linalg.norm(v))

def to_game(blender_points):
    return np.column_stack((blender_points[:,0], blender_points[:,2], -blender_points[:,1]))

def to_blender(game_points):
    return np.column_stack((game_points[:,0], -game_points[:,2], game_points[:,1]))

def vertices(obj):
    a = np.empty(3 * len(obj.data.vertices), dtype=np.float32)
    obj.data.vertices.foreach_get('co', a)
    return to_game(a.reshape(-1,3)).astype(np.float64)

def vertex_uv(obj):
    mesh = obj.data
    indices = np.empty(len(mesh.loops), dtype=np.int32)
    mesh.loops.foreach_get('vertex_index', indices)
    coords = np.empty(2 * len(indices), dtype=np.float32)
    mesh.uv_layers.active.uv.foreach_get('vector', coords)
    result = np.empty((len(mesh.vertices),2), dtype=np.float32)
    result[indices] = coords.reshape(-1,2)
    return result

def add_surface(name, points, uv, faces, material, collection):
    mesh = bpy.data.meshes.new(name+' surface')
    mesh.from_pydata(to_blender(np.array(points)).tolist(), [], faces)
    mesh.update()
    mesh.polygons.foreach_set('use_smooth', np.ones(len(mesh.polygons),dtype=bool))
    layer = mesh.uv_layers.new(name='Runtime surface UV')
    loops = np.empty(len(mesh.loops),dtype=np.int32)
    mesh.loops.foreach_get('vertex_index',loops)
    layer.uv.foreach_set('vector',np.asarray(uv,dtype=np.float32)[loops].ravel())
    o = bpy.data.objects.new(name,mesh)
    collection.objects.link(o)
    o.data.materials.append(material)
    return o

def grid_faces(rows, cols):
    return [(r*cols+c,r*cols+c+1,(r+1)*cols+c+1,(r+1)*cols+c)
            for r in range(rows-1) for c in range(cols-1)]

def wet_edges(water):
    points = vertices(water)
    uv = vertex_uv(water)
    edges=[]
    for side in (0.,1.):
        mask = np.abs(uv[:,0]-side)<.0001
        edge = points[mask][np.argsort(uv[mask,1])]
        # Screen 06 crests as Z decreases. Crop the branch before the next plunge.
        edge = edge[:199]
        if not np.all(np.diff(edge[:,2])<0): raise ValueError('Expected ordered Screen 06 bank')
        edges.append(edge)
    return edges

def point_on_bank(edge,z):
    axis=edge[::-1]
    return np.array([np.interp(z,axis[:,2],axis[:,0]),np.interp(z,axis[:,2],axis[:,1]),z])

def rounded_arm(old_top, left_bank):
    original=vertices(old_top).reshape(101,11,3)
    wet, uv, bottom, bottom_uv = [],[],[],[]
    crest_foam=[]
    previous=None
    station=0.
    for row, prior in enumerate(original):
        t=row/(len(original)-1)
        lip=prior[-1].copy()
        delta=original[min(row+1,100),-1]-original[max(0,row-1),-1]
        outward=unit(np.array([delta[2],0.,-delta[0]]))
        bed=point_on_bank(left_bank,lip[2])
        crown_zone=smooth(.075,.29,t)*(1.-smooth(.65,.96,t))
        # This offset is on the outer side of the measured riding surface. It gives the
        # crest real breadth across the flow, even when it is viewed almost edge-on.
        lip[1]+=.35*crown_zone
        landing=smooth(.48,.79,t)
        join=bed+outward*(.05-.85*smooth(.59,.88,t))
        join[1]+=.065-.24*smooth(.76,.98,t)
        lip=mix(lip,join,landing)
        back=prior[0]+outward*(1.38*crown_zone)
        landing_width=mix(1.74,.65,smooth(.74,1.,t))
        landing_back=lip+outward*landing_width
        landing_back[1]+=.19*(1.-smooth(.8,1.,t))
        back=mix(back,landing_back,landing)
        width=np.linalg.norm(back-lip)
        cross=unit(np.array([back[0]-lip[0],0.,back[2]-lip[2]]))
        middle=(back+lip)*.5
        if previous is not None: station+=np.linalg.norm(middle-previous)
        previous=middle
        radius=min(.33,.15*width)*(.55+.45*crown_zone)
        rise=min(.35,.13*width)
        def cap(q):
            a=mix(back,lip,q)
            a[1]+=rise*math.sin(math.pi*q)
            return a
        crest_foam.append((station,cap(.12),outward))
        for c in range(15):
            q=c/14
            wet.append(cap(q)); uv.append((.10+.79*q,station))
        # Bend the WET skin around the visible inside edge. Slots belong to the drum behind it.
        for c in range(1,9):
            a=math.pi*c/8
            rolled=lip-cross*(radius*math.sin(a))+UP*(radius*(math.cos(a)-1.))
            wet.append(rolled);uv.append((.89+.08*c/8,station))
        # The shaded underside sits inside the wet skin and meets both boundaries exactly.
        for c in range(11):
            f=c/10
            underside=cap(1.-f)
            underside[1]-=2.*radius*(1.-f)+radius*.60*math.sin(math.pi*f)
            bottom.append(underside);bottom_uv.append((f,station))
    return (wet,uv,grid_faces(101,23)),(bottom,bottom_uv,grid_faces(101,11)),crest_foam

def foam_groups(traces):
    rng=random.Random(60632)
    points,uv,faces=[],[],[]
    def lobe(center, length, width, height, direction, sides, rings):
        first=len(points)
        along=unit(np.array([-direction[2],0.,direction[0]]))
        phase=rng.uniform(0,math.tau)
        # Shared poles and smooth triangulated latitude rings avoid flat vertical foam slabs.
        points.append(center-UP*height);uv.append((.5,0.))
        for k in range(1,rings+1):
            a=-math.pi*.5+math.pi*k/(rings+1)
            for j in range(sides):
                b=math.tau*j/sides
                uneven=1+.055*math.sin(3*b+phase)*math.cos(a)
                points.append(center + along*(length*math.cos(a)*math.cos(b)*uneven)
                  +direction*(width*math.cos(a)*math.sin(b)*uneven)+UP*(height*math.sin(a)))
                uv.append((j/sides,k/(rings+1)))
        pole=len(points);points.append(center+UP*height);uv.append((.5,1.))
        for j in range(sides):
            k=(j+1)%sides
            faces.append((first,first+1+k,first+1+j))
            for ring in range(rings-1):
                a=first+1+sides*ring
                faces.append((a+j,a+k,a+sides+k,a+sides+j))
            last=first+1+(rings-1)*sides
            faces.append((pole,last+j,last+k))
    for trace, spacing, size in traces:
        next_station=spacing*.6
        for s,p,outward in trace:
            if s<next_station: continue
            next_station=s+spacing*rng.uniform(.74,1.25)
            base=size*rng.uniform(.80,1.18)
            site=p+outward*(base*.29)-UP*(base*.12)
            along=unit(np.array([-outward[2],0.,outward[0]]))
            lobe(site,base*1.20,base*.80,base*.80,outward,10,4)
            for sign in (-1,1):
                side=base*rng.uniform(.44,.76)
                loc=site+sign*along*(base*.82)+outward*rng.uniform(-.055,.105)-UP*(base*.13)
                lobe(loc,side*1.14,side*.85,side*.82,outward,8,3)
    return points,uv,faces

def mesh_components(mesh):
    n=len(mesh.vertices)
    roots=list(range(n))
    def root(x):
        while roots[x]!=x:
            roots[x]=roots[roots[x]];x=roots[x]
        return x
    pairs=np.empty(len(mesh.edges)*2,dtype=np.int32);mesh.edges.foreach_get('vertices',pairs)
    for a,b in pairs.reshape(-1,2): roots[root(int(a))]=root(int(b))
    result={}
    for i in range(n): result.setdefault(root(i),[]).append(i)
    return sorted((np.array(ix) for ix in result.values()),key=len,reverse=True)

def bend_progress(points):
    z=-points[:,2]
    return smooth(182,220,z)*(1.-smooth(261,294,z))

def fit_washer(obj,ring_seats,banks):
    p=vertices(obj)
    loop_ix=np.empty(len(obj.data.loops),dtype=np.int32)
    obj.data.loops.foreach_get('vertex_index',loop_ix)
    corner=np.empty(len(loop_ix)*3,dtype=np.float32)
    obj.data.corner_normals.foreach_get('vector',corner)
    norms=np.empty_like(p)
    norms[loop_ix]=to_game(corner.reshape(-1,3))
    original=p.copy()
    components=mesh_components(obj.data)
    amount=bend_progress(p)
    if obj.name=='m06_arched_wall':
        # The shell and the two existing cheek meshes have separate connected components.
        # Pin the cheek at its rolled river edge and carry its outer end with the drum.
        for ix in components[1:]:
            edge=banks[0] if vertex_uv(obj)[ix,0].mean()<0 else banks[1]
            z=p[ix,2]
            sample=np.column_stack([np.interp(z,edge[::-1,2],edge[::-1,k]) for k in (0,1)])
            clearance=np.linalg.norm(p[ix,:2]-sample,axis=1)
            amount[ix]*=smooth(.38,4.5,clearance)
    elif obj.name=='m06_arched_ring':
        centers=np.array([r['p'] for r in ring_seats])
        for ix in components:
            index=int(np.argmin(np.linalg.norm(centers-p[ix].mean(axis=0),axis=1)))
            if index<3:continue
            seat=ring_seats[index]
            tangent=unit(np.array(seat['t']))
            offset=p[ix]-centers[index]
            axial=offset@tangent
            radial=offset-np.outer(axial,tangent)
            radii=np.maximum(np.linalg.norm(radial,axis=1),.001)
            # Keep the seating circle on the tube. Broaden its rolled bevel toward the water.
            factor=.12+.08*smooth(80,126,seat['distance'])
            p[ix]+=factor*(np.outer(axial,tangent)+radial*(np.minimum(0,radii-seat['radius'])/radii)[:,None])
    p[:,0]+=2.65*amount
    p[:,1]-=1.58*amount
    obj.data.vertices.foreach_set('co',to_blender(p).astype(np.float32).ravel())
    obj.data.update()
    shift=np.array([0.,0.,.01])
    derivative=(bend_progress(original+shift)-bend_progress(original-shift))/.02
    norms[:,2]-=derivative*(2.65*norms[:,0]-1.58*norms[:,1])
    norms/=np.maximum(.000001,np.linalg.norm(norms,axis=1,keepdims=True))
    obj.data.normals_split_custom_set_from_vertices(to_blender(norms).tolist())
    return len(components)

def build_patch(seats_path, blend_path, glb_path):
    seats=json.loads(Path(seats_path).read_text())['rings']
    objects={o.name:o for o in bpy.context.scene.objects if o.type=='MESH'}
    banks=wet_edges(objects['m06_arched_water'])
    prior_top=objects['m06_crest_upper_water'];prior_bottom=objects['m06_crest_outer_soffit']
    collection=prior_top.users_collection[0]
    wet,underside,crest=rounded_arm(prior_top,banks[0])
    wm=prior_top.data.materials[0];metal=objects['m06_arched_bank'].data.materials[0]
    # The parent file was opened in a separate process. Only this new editable file is saved.
    prior_top.name='Parent upper mesh (survey control)';prior_bottom.name='Parent casing (survey control)'
    prior_top.hide_render=prior_bottom.hide_render=True
    prior_top.hide_set(True);prior_bottom.hide_set(True)
    top=add_surface('m06_crest_upper_water',*wet,wm,collection)
    soffit=add_surface('m06_crest_outer_soffit',*underside,metal,collection)
    traces=[([x for x in crest if 2.5<x[0]<29.5],1.43,.22)]
    for side,edge in enumerate(banks):
        line=[];s=0.
        for i in range(1,len(edge)-1):
            s+=np.linalg.norm(edge[i]-edge[i-1])
            if -194.<edge[i,2]<-143.:
                delta=edge[i+1]-edge[i-1]
                out=unit(np.array([delta[2],0.,-delta[0]]))*(1 if side==0 else -1)
                line.append((s,edge[i],out))
        traces.append((line,1.05 if side==0 else 1.42,.33 if side==0 else .26))
    foam=add_surface('m06_crest_foam_additions',*foam_groups(traces),objects['m06_arched_foam'].data.materials[0],collection)
    output=[top,soffit,foam]
    counts={}
    for name in ['m06_arched_wall','m06_arched_ring','m06_arched_paddle']:
        obj=objects[name]
        counts[name]=fit_washer(obj,seats,banks)
        output.append(obj)
    assert counts['m06_arched_ring']==12 and counts['m06_arched_paddle']==4
    for obj in output:obj['version']='Screen 06 rounded crest and washer bend'
    bpy.context.scene.name='Screen 06 – rounded crest authoring'
    bpy.context.scene['artwork']='references/06_crest_the_rinse_arch.png'
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path),compress=True)
    # This inspection file stores the original Three UV. Blender glTF export flips V.
    # Compensate in-memory only so all retained textures land on their original coordinates.
    for obj in output:
        layer=obj.data.uv_layers.active
        uv=np.empty(len(layer.uv)*2,dtype=np.float32);layer.uv.foreach_get('vector',uv)
        uv[1::2]=1.-uv[1::2];layer.uv.foreach_set('vector',uv)
    bpy.ops.object.select_all(action='DESELECT')
    for obj in output:obj.select_set(True)
    bpy.context.view_layer.objects.active=top
    bpy.ops.export_scene.gltf(filepath=str(glb_path),export_format='GLB',use_selection=True,
      export_materials='NONE',export_texcoords=True,export_normals=True,export_extras=False,
      export_cameras=False,export_lights=False,export_animations=False)
    return {'blender':bpy.app.version_string,'ringAndPaddleComponents':counts,
            'parts':{o.name:{'vertices':len(o.data.vertices),'polygons':len(o.data.polygons)} for o in output},
            'kilobytes':Path(glb_path).stat().st_size//1024}


if __name__ == '__main__':
    import sys
    if '--' in sys.argv:
        build_patch(*map(Path, sys.argv[sys.argv.index('--')+1:]))
