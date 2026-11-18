"""Save the fitted runtime geometry and its packed artwork as an editable Blender object."""
import json
from pathlib import Path
import sys

import bpy

folder=Path(sys.argv[sys.argv.index('--')+1]).resolve()
data=json.loads((folder/'paddleShape07.json').read_text())
bpy.ops.wm.read_factory_settings(use_empty=True)
def blender_xyz(x,y,z):
    return (x,-z,y)
positions=[blender_xyz(*data['positions'][i:i+3]) for i in range(0,len(data['positions']),3)]
faces=[data['indices'][i:i+3] for i in range(0,len(data['indices']),3)]
mesh=bpy.data.meshes.new('Paddle · fitted front and rear')
mesh.from_pydata(positions,[],faces)
mesh.update()
uv=mesh.uv_layers.new(name='Approved paddle paint')
for loop in mesh.loops:
    i=2*loop.vertex_index
    uv.data[loop.index].uv=data['uv'][i:i+2]
for face in mesh.polygons:
    face.use_smooth=True
obj=bpy.data.objects.new('Screen 07 · third gold washer paddle',mesh)
bpy.context.collection.objects.link(obj)
obj.location=blender_xyz(*data['origin'])
obj['reference']='references/07_dive_the_washer_tube.png'
obj['fit']='Left edge attaches to the retained cylindrical wall at the third paddle. Back thickness follows its existing axial depth.'
mat=bpy.data.materials.new('Gold lip and berry underside')
mat.use_nodes=True
shader=mat.node_tree.nodes.get('Principled BSDF')
shader.inputs['Metallic'].default_value=.62
shader.inputs['Roughness'].default_value=.23
image=bpy.data.images.load(str(folder/'paddleFace07.png'))
image.pack()
tex=mat.node_tree.nodes.new('ShaderNodeTexImage')
tex.image=image
mat.node_tree.links.new(tex.outputs['Color'],shader.inputs['Base Color'])
obj.data.materials.append(mat)
bpy.context.view_layer.objects.active=obj
obj.select_set(True)
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.region_3d.view_distance=4.0
        area.spaces.active.region_3d.view_location=obj.location
        area.spaces.active.shading.color_type='TEXTURE'
bpy.ops.wm.save_as_mainfile(filepath=str(folder/'screen-07-fitted-paddle.blend'))
bpy.ops.export_scene.gltf(filepath=str(folder/'screen-07-fitted-paddle.glb'),export_format='GLB',use_selection=True,export_yup=True)
print('Editable object verified',len(mesh.vertices),len(mesh.polygons),image.size[:])
