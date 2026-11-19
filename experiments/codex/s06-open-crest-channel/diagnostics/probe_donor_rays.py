"""Intersect the actual Blender-imported donor GLB with native Screen 06 gameplay rays.
Run blender -b --python probe_donor_rays.py -- passage.glb world-layout.json poses.json
"""
import bpy
import json
import math
import sys
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
from pathlib import Path
model,layout_path,pose_path=map(Path,sys.argv[sys.argv.index("--")+1:])
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(model))
layout=json.loads(layout_path.read_text())
poses=json.loads(pose_path.read_text())
def bl(v):return Vector((v[0],-v[2],v[1]))
def th(v):return Vector((v[0],v[2],-v[1]))
trees={o.name:BVHTree.FromObject(o,bpy.context.evaluated_depsgraph_get()) for o in bpy.context.scene.objects if o.type=='MESH'}
loop=[(292,640),(300,596),(330,566),(380,553),(430,560),(480,590),(530,625),(580,655),(630,676),(672,690),(676,708),(640,716),(590,712),(540,704),(480,698),(420,694),(360,688),(318,676)]
def hit(pose,x,y):
 m=Matrix([pose['camera']['matrixWorld'][i:i+4] for i in range(0,16,4)]).transposed()
 eye=bl(m.translation)
 camd=Vector(((x/864*2-1)*.5625*math.tan(math.radians(31)),(1-y/1536*2)*math.tan(math.radians(31)),-1))
 ray=bl(m.to_3x3() @ camd).normalized()
 hits=[]
 for name,tree in trees.items():
  ob=bpy.data.objects[name]
  world=ob.matrix_world; inv=world.inverted_safe(); orig=inv @ eye; direction=(inv.to_3x3() @ ray).normalized()
  loc,norm,idx,dist=tree.ray_cast(orig,direction)
  if loc is None:continue
  location=th(world@loc)
  d=(world@loc-eye).length; sec=min(layout['water'],key=lambda f:(Vector(f['p'])-location).length_squared)
  lat=(location-Vector(sec['p'])).dot(Vector(sec['r']))
  hits.append((round(d,1),name,round(sec['s'],1),round(lat,1)))
 return sorted(hits)
for pose in [p for p in poses if p['name'] in ('opening','crest-release','forward-03','forward-06')]:
 print('POSE',pose['name'])
 for x,y in [(315,625),(370,593),(390,650),(440,660),(492,672),(550,687),(591,694),(649,694),(440,710),(360,525)]:
  print(x,y,hit(pose,x,y)[:4])
