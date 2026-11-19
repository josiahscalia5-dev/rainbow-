import bpy,json
from pathlib import Path
run=Path('image2blender-runs/s07_banks')
coll=bpy.data.collections['s07_banks']
data={'version':bpy.app.version_string,'meshes':{},'splines':{},'packedImages':{},'camera':bpy.context.scene.camera.name}
for o in coll.objects:
    if o.type=='MESH':
        data['meshes'][o.name]={'vertices':len(o.data.vertices),'faces':len(o.data.polygons),'modifiers':[m.type for m in o.modifiers]}
    elif o.type=='CURVE':
        data['splines'][o.name]=sum(len(s.bezier_points) for s in o.data.splines)
for im in bpy.data.images:
    if im.packed_file:data['packedImages'][im.name]=list(im.size)
assert set(data['meshes'])=={'left_bank','right_bank','left_foam','right_foam'}
assert set(data['splines'])=={'left_spine','right_spine'}
assert len(data['packedImages'])>=2
(run/'reopened-blend.json').write_text(json.dumps(data,indent=2))
print(json.dumps(data))
