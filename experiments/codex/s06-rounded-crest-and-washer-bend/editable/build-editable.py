"""Build an editable Blender scene from a captured Screen 06 WebGL game.
blender -b -noaudio --python-exit-code 1 -P build-editable.py -- mesh-capture.json.gz GAME_ROOT candidate.blend
"""
import base64
import gzip
import hashlib
import json
import math
import os
from pathlib import Path
import sys

import bpy
import numpy as np
from mathutils import Matrix

args = sys.argv[sys.argv.index('--') + 1:]
snapshot_path, game_root, output = map(Path, args)
with gzip.open(snapshot_path, 'rt') as stream:
    doc = json.load(stream)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = 'Screen 06 – playable rounded-crest candidate'
scene.render.resolution_x, scene.render.resolution_y = doc['width'], doc['height']
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.unit_settings.system = 'NONE'
scene['runtime_query'] = doc['flags']
scene['runtime_capture_sha256'] = hashlib.sha256(snapshot_path.read_bytes()).hexdigest()
scene['changed_runtime_meshes'] = ','.join(doc['changedMeshes'])
for source_rel in ('tools/blender/rounded-crest06/build_rounded_crest.py', 'assets/rounded-crest06/rounded-spillway.glb', 'src/world/openCrest06.ts','src/world/archedPassage06.ts','src/world/match06.ts'):
    src=game_root/source_rel
    if src.is_file():
        scene['sha256_'+src.name]=hashlib.sha256(src.read_bytes()).hexdigest()

def collection(name):
    c = bpy.data.collections.new(name)
    scene.collection.children.link(c)
    return c

edit = collection('01 · Crest repair · changed meshes')
context = collection('02 · Retained passage geometry')
cams = collection('03 · Actual gameplay cameras')
preview = collection('04 · Inspection lighting')
basis = Matrix(((1,0,0,0), (0,0,-1,0), (0,1,0,0), (0,0,0,1)))
basis3 = np.asarray(basis.to_3x3(), dtype=np.float64)

def read_array(field):
    encoding = field['encoding']
    return np.frombuffer(base64.b64decode(field['data']),
                         dtype={'float32-little-endian':'<f4','uint32-little-endian':'<u4'}[encoding])

def matrix(values):
    return Matrix(np.array(values, dtype=np.float64).reshape(4,4).T.tolist())

def rgba(color):
    # Blender displays RGB values in scene-linear space.
    def linear(value):
        value = value / 255.0
        return value / 12.92 if value < .04045 else ((value + .055) / 1.055) ** 2.4
    return tuple(linear(c) for c in color) + (1.,)

surface_looks = {
    'water': ((15, 192, 225), .18, .08),
    'wall': ((144, 61, 163), .34, .68),
    'bank': ((221, 40, 158), .23, .18),
    'ring': ((243, 166, 49), .25, .79),
    'paddle': ((233, 153, 38), .25, .77),
    'foam': ((241, 228, 252), .62, .0),
    'end': ((250, 198, 112), .46, .12),
    'perforated_return': ((139,62,164), .32, .70),
    'rolled_sills': ((230,66,177), .23, .20),
    'clear_water': ((47,192,235), .17, .02),
    'upper_water': ((15,192,225), .18, .08),
    'outer_soffit': ((134,54,156), .34, .68),
}

def preview_material(family):
    name = 'Inspection · ' + family
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    color, roughness, metal = surface_looks.get(family, ((179,118,192),.4,.05))
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = rgba(color)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = mat.diffuse_color
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Metallic'].default_value = metal
    if family == 'clear_water':
        # The runtime film is at most 5.5% opaque. Keep the metal behind it readable.
        shader.inputs['Alpha'].default_value = .025
        mat.diffuse_color = (*mat.diffuse_color[:3], .025)
        mat.surface_render_method = 'DITHERED'
    mat['application'] = 'Editable solid/material preview. The playable game owns the reference registration, highlights and animated shaders.'
    return mat

for entry in doc['meshes']:
    name = entry['name']
    mw = np.asarray(matrix(entry['matrixWorld']), dtype=np.float64)
    pos = read_array(entry['attributes']['position']).reshape(-1, 3)
    vertices = ((pos @ mw[:3,:3].T + mw[:3,3]) @ basis3.T).astype(np.float32)
    ix = read_array(entry['index']).astype(np.int32, copy=True)
    if np.linalg.det(mw[:3,:3]) < 0:
        ix = ix.reshape(-1,3)[:,[0,2,1]].copy().ravel()
    mesh = bpy.data.meshes.new(name)
    mesh.vertices.add(len(vertices))
    mesh.vertices.foreach_set('co', vertices.ravel())
    mesh.loops.add(len(ix))
    mesh.loops.foreach_set('vertex_index', ix)
    mesh.polygons.add(len(ix)//3)
    mesh.polygons.foreach_set('loop_start', np.arange(0,len(ix),3,dtype=np.int32))
    mesh.update(calc_edges=True)
    mesh.polygons.foreach_set('use_smooth', np.ones(len(mesh.polygons), dtype=bool))
    if 'normal' in entry['attributes']:
        ns = read_array(entry['attributes']['normal']).reshape(-1,3)
        ns = (ns @ np.linalg.inv(mw[:3,:3]) @ basis3.T)
        ns /= np.maximum(np.linalg.norm(ns, axis=1, keepdims=True), 1e-12)
        mesh.normals_split_custom_set_from_vertices(ns.tolist())
    if 'uv' in entry['attributes']:
        uv = read_array(entry['attributes']['uv']).reshape(-1,2)
        layer = mesh.uv_layers.new(name='Runtime surface UV')
        layer.uv.foreach_set('vector', np.ascontiguousarray(uv[ix]).ravel())
    family = name.removeprefix('m06_arched_').removeprefix('m06_crest_').lower()
    mesh.materials.append(preview_material(family))
    obj = bpy.data.objects.new(name, mesh)
    target = edit if name in doc['changedMeshes'] else context
    target.objects.link(obj)
    if family == 'clear_water':
        obj.display_type = 'WIRE'
    obj['runtime_mesh_name'] = name
    obj['runtime_surface_sha256'] = entry['digest']
    obj['source_world_matrix_column_major'] = entry['matrixWorld']
    obj['changed_from_previous_passage'] = name in doc['changedMeshes']

reference = game_root/'references'/'06_crest_the_rinse_arch.png'
expected = '3946058c0893e97a99dd5015f3197901859475cd7ef55e09d982d232951441fe'
if hashlib.sha256(reference.read_bytes()).hexdigest() != expected:
    raise ValueError('Incorrect approved Screen 06 artwork')
art = bpy.data.images.load(str(reference))
art.name = 'Original approved Screen 06 · packed source'
art.pack()
art.use_fake_user = True
art['original_sha256'] = expected
for entry in doc['cameras']:
    camera = bpy.data.cameras.new(entry['name'])
    camera.type = 'PERSP'
    camera.sensor_fit = 'VERTICAL'
    camera.sensor_height = 32
    camera.lens = camera.sensor_height / (2*math.tan(math.radians(entry['fov'])/2))
    camera.clip_start, camera.clip_end = entry['near'], entry['far']
    obj = bpy.data.objects.new(entry['name'],camera)
    cams.objects.link(obj)
    obj.matrix_world = basis @ matrix(entry['matrixWorld'])
    obj['actual_course_station'] = entry['courseS']
    obj['actual_lateral_offset'] = entry['lateral']
    obj['requested_forward_units'] = entry['offset']
    marker = scene.timeline_markers.new(entry['name'], frame=1+entry['offset'])
    marker.camera = obj
    if entry['offset'] == 0:
        scene.camera = obj
        bg = camera.background_images.new()
        bg.image = art
        bg.alpha = .28
        camera.show_background_images = False

# Pack the actual game swatches for material editing. Storing them does not substitute
# image geometry for the crest or tunnel.
for rel in ('assets/textures/match06/tile_river6.png', 'assets/textures/match06/tile_ring6.png',
            'assets/arched-passage06/slot.png', 'assets/textures/match06/mask06.png'):
    p = game_root/rel
    if p.is_file():
        img=bpy.data.images.load(str(p))
        img.name='Game swatch · ' + p.name
        img.pack()
        img.use_fake_user=True

world = bpy.data.worlds.new('Geometry inspection lighting')
world.use_nodes = True
world.node_tree.nodes.get('Background').inputs['Color'].default_value = (.32,.32,.36,1.0)
world.node_tree.nodes.get('Background').inputs['Strength'].default_value = .47
scene.world = world
light = bpy.data.lights.new('Preview sun', type='SUN')
light.energy = 2.7
sun = bpy.data.objects.new('Preview sun',light)
sun.rotation_euler = (math.radians(24),math.radians(-34),math.radians(-27))
preview.objects.link(sun)
scene.frame_end = 7
scene.frame_set(1)
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == 'VIEW_3D':
            space = area.spaces.active
            space.region_3d.view_perspective = 'CAMERA'
            space.shading.color_type = 'MATERIAL'
            space.shading.light = 'STUDIO'
            space.overlay.show_overlays = False
readme=bpy.data.texts.new('READ ME · editable crest')
readme.write('''These meshes are captured from the actual opt-in Screen 06 WebGL scene. Collection 01 contains meshes with a topology, position, normal, transform, or UV difference from the previous Screen 06 candidate. Collection 02 holds retained geometry for context. Move between the opening, +3 and +6 camera markers on frames 1, 4 and 7. All meshes preserve the gameplay layout; Blender units correspond to game units. Select a mesh and enter Edit Mode to inspect it. For the original art, enable the opening camera’s packed background image. Blender uses simple inspection materials. Play the supplied Three.js build to evaluate final animated water, projection, postprocessing, Benny and HUD. The editable geometry and world cameras here record the candidate at time of capture. Use its reconstruction script when changing the playable geometry; edits in this file alone do not change the game.
''')
output.parent.mkdir(parents=True, exist_ok=True)
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(output), compress=True)
print('Saved editable geometry',output,len(doc['meshes']),sum(m['faceCount'] for m in doc['meshes']))

# Background Blender in this headless cloud can block while shutting down audio.
# This opt-in runs only after all files have been closed and success was reported.
if bpy.app.background and os.environ.get('RAINBOW_BLENDER_BATCH_EXIT') == '1':
    sys.stdout.flush()
    sys.stderr.flush()
    os._exit(0)
