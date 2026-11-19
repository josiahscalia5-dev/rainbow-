"""Reopen validation. Pass the .blend before -P and capture and report paths after --."""
import base64
import gzip
import hashlib
import json
import os
from pathlib import Path
import sys

import bpy
import numpy as np
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

args = sys.argv[sys.argv.index('--')+1:]
snapshot, output = map(Path, args)
with gzip.open(snapshot, 'rt') as f:
    doc=json.load(f)
scene=bpy.context.scene
meshes=[]
basis=np.array([[1,0,0],[0,0,-1],[0,1,0]],dtype=np.float64)

def read(entry, name, dims, dtype='<f4'):
    return np.frombuffer(base64.b64decode(entry[name]['data']), dtype=dtype).reshape(-1,dims)

sample_world=[]
max_vertex_error=0
max_uv_error=0
for item in doc['meshes']:
    obj=bpy.data.objects[item['name']]
    assert obj.type=='MESH'
    mesh=obj.data
    assert (len(mesh.vertices),len(mesh.polygons))==(item['vertexCount'],item['faceCount'])
    assert obj['runtime_surface_sha256']==item['digest']
    assert obj['changed_from_previous_passage']==(item['name'] in doc['changedMeshes'])
    assert abs(obj.matrix_world.determinant()-1)<1e-6
    mw=np.array(item['matrixWorld'],dtype=float).reshape(4,4).T
    pos=read(item['attributes'],'position',3)
    three_world=pos@mw[:3,:3].T+mw[:3,3]
    expected=three_world@basis.T
    actual=np.empty(len(pos)*3,dtype=np.float32)
    mesh.vertices.foreach_get('co',actual)
    error=float(np.max(np.abs(actual.reshape(-1,3)-expected)))
    assert error < .0001, (item['name'],error)
    max_vertex_error=max(max_vertex_error,error)
    source=read(item,'index',3,'<u4').astype(np.int32)
    if np.linalg.det(mw[:3,:3]) < 0: source=source[:,[0,2,1]]
    indices=np.empty(len(mesh.loops),dtype=np.int32)
    mesh.loops.foreach_get('vertex_index',indices)
    assert np.array_equal(indices,source.ravel())
    if 'uv' in item['attributes']:
        uv=read(item['attributes'],'uv',2)
        real=np.empty(len(mesh.loops)*2,dtype=np.float32)
        mesh.uv_layers['Runtime surface UV'].uv.foreach_get('vector',real)
        uv_error=float(np.max(np.abs(uv[indices]-real.reshape(-1,2))))
        assert uv_error < .0001
        max_uv_error=max(max_uv_error,uv_error)
    meshes.append(dict(name=obj.name,vertices=len(mesh.vertices),faces=len(mesh.polygons),changed=bool(obj['changed_from_previous_passage'])))
    sample_world.extend(three_world[::max(1,len(three_world)//200)])
assert len(meshes)==len(doc['meshes'])
camera_results=[]
s=np.asarray(sample_world)
homogeneous=np.column_stack((s,np.ones(len(s))))
for camera in doc['cameras']:
    obj=bpy.data.objects[camera['name']]
    world=np.array(camera['matrixWorld']).reshape(4,4).T
    projection=np.array(camera['projectionMatrix']).reshape(4,4).T
    clip=homogeneous@(projection@np.linalg.inv(world)).T
    normalized=clip[:,:3]/clip[:,3:4]
    valid=(clip[:,3]>camera['near'])&(np.abs(normalized[:,:2]).max(axis=1)<.99)&(np.abs(normalized[:,2])<1)
    samples=np.flatnonzero(valid)
    assert len(samples)>0
    errors=[]
    for i in samples[::max(1,len(samples)//100)]:
        actual=world_to_camera_view(scene,obj,Vector((s[i]@basis.T).tolist()))
        expected=(normalized[i,:2]+1)/2
        errors.append(np.linalg.norm((np.array(actual[:2])-expected)*[doc['width'],doc['height']]))
    error=float(max(errors))
    assert error < .03,(obj.name,error)
    camera_results.append(dict(name=obj.name,courseStation=obj['actual_course_station'],maxPixelError=error,samples=len(errors)))
reference=bpy.data.images['Original approved Screen 06 · packed source']
digest=hashlib.sha256(bytes(reference.packed_file.data)).hexdigest()
assert digest==reference['original_sha256']=='3946058c0893e97a99dd5015f3197901859475cd7ef55e09d982d232951441fe'
result={'blender':bpy.app.version_string,'blendSHA256':hashlib.sha256(Path(bpy.data.filepath).read_bytes()).hexdigest(),
'captureSHA256':hashlib.sha256(snapshot.read_bytes()).hexdigest(),'approvedImageSHA256':digest,
'maxVertexErrorGameUnits':max_vertex_error,'maxSurfaceUVError':max_uv_error,'verifiedMeshes':meshes,
'cameraReprojection':camera_results,'renderWidth':scene.render.resolution_x,'renderHeight':scene.render.resolution_y}
output.write_text(json.dumps(result,indent=2)+'\n')
print('Verified',len(meshes),'meshes',len(camera_results),'camera registrations',result['blendSHA256'])

# Background Blender in this headless cloud can block while shutting down audio.
# This opt-in runs only after all files have been closed and success was reported.
if bpy.app.background and os.environ.get('RAINBOW_BLENDER_BATCH_EXIT') == '1':
    sys.stdout.flush()
    sys.stderr.flush()
    os._exit(0)
