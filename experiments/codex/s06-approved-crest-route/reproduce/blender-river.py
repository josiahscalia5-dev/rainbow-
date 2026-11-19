"""Package both real Three.js river meshes and swimming routes as an editable Blender inspection scene."""
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Vector

root, original, camera_file, dest = map(Path, sys.argv[sys.argv.index("--")+1:])
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
conversion=Matrix(((1,0,0,0),(0,0,-1,0),(0,1,0,0),(0,0,0,1)))

def material(name,color):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1.0);return m

def curve(name,points, collection, shade):
    data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';data.bevel_depth=.036
    spline=data.splines.new('POLY');spline.points.add(len(points)-1)
    for p,v in zip(spline.points,points):p.co=(*v,1.)
    o=bpy.data.objects.new(name,data);collection.objects.link(o);o.data.materials.append(shade)
    o.show_in_front=True
    return o

counts={}
for key,label,color in [('retained','Claudia retained',(0.82,0.39,0.07)),('experiment','Codex course test',(0.03,0.62,0.88))]:
    raw=json.loads((root/(key+'-river.json')).read_text())
    col=bpy.data.collections.new(label);scene.collection.children.link(col)
    world=Matrix([raw['matrix'][i::4] for i in range(4)])
    m=conversion@world
    positions=raw['positions']; faces=raw['indices']
    xyz=[m@Vector(positions[i:i+3]) for i in range(0,len(positions),3)]
    triangles=[faces[i:i+3] for i in range(0,len(faces),3)]
    mesh=bpy.data.meshes.new(label+' river geometry');mesh.from_pydata(xyz,[],triangles);mesh.update()
    obj=bpy.data.objects.new(label+' real river',mesh);col.objects.link(obj)
    obj.data.materials.append(material(label+' inspection colour',color))
    uv=mesh.uv_layers.new(name='Three.js aTile')
    for loop in mesh.loops:
        i=loop.vertex_index*2;uv.data[loop.index].uv=raw['uv'][i:i+2]
    line=curve(label+' swimmer centre',[conversion@Vector(p['centre']) for p in raw['frames']],col,material(label+' centreline',color))
    counts[key]={'vertices':len(xyz),'triangles':len(triangles),'swimStations':len(raw['frames'])}
    if key=='retained':
        col.hide_viewport=True;col.hide_render=True
cam=json.loads(camera_file.read_text())
mat=Matrix([cam['mw'][i::4] for i in range(4)])
camera=bpy.data.cameras.new('Locked original Screen 06 camera')
camera.type='PERSP';camera.sensor_fit='VERTICAL';camera.sensor_height=32;camera.lens=32/(2*math.tan(math.radians(cam['fov'])/2))
obj=bpy.data.objects.new(camera.name,camera);scene.collection.objects.link(obj);obj.matrix_world=conversion@mat;scene.camera=obj
scene.render.resolution_x,scene.render.resolution_y=cam['size'];scene.render.resolution_percentage=100
art=bpy.data.images.load(str(original));art.name='Owner-approved Screen 06 original';art.pack()
camera.show_background_images=True
reference=camera.background_images.new();reference.image=art;reference.alpha=.31;reference.display_depth='BACK'
scene['purpose']='Inspect the real game river positions, UVs and route aligned to the native opening. Materials in this guide are identification colours. Visual evidence uses the Three.js renderer.'
dest.parent.mkdir(parents=True,exist_ok=True);bpy.ops.wm.save_as_mainfile(filepath=str(dest),compress=True)
bpy.ops.wm.open_mainfile(filepath=str(dest))
assert all(len(bpy.data.objects[label+' real river'].data.vertices)==counts[key]['vertices'] for key,label in [('retained','Claudia retained'),('experiment','Codex course test')])
assert bool(bpy.data.images['Owner-approved Screen 06 original'].packed_file)
(root/'blender-inspection.json').write_text(json.dumps({'blender':bpy.app.version_string,'verifiedReload':True,'parts':counts,'openingCameraFOV':cam['fov'],'packedOriginal':True},indent=2)+'\n')
