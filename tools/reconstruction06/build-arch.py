"""Build the editable Screen 06 drum and crest, then export the same surfaces to the game."""
import bpy, json, math, random, sys
from pathlib import Path
import numpy as np
from mathutils import Matrix

base,layout_path,blend_path,glb_path=map(Path,sys.argv[sys.argv.index('--')+1:]);layout=json.loads(layout_path.read_text());bpy.ops.wm.read_factory_settings(use_empty=True);scene=bpy.context.scene
worldm=np.array([[1,0,0],[0,0,-1],[0,1,0]],dtype=float)
def bv(v):return (worldm@v).tolist()
def vector(o,k):return np.array(o[k],dtype=float)
def unit(x):return x/max(1e-8,np.linalg.norm(x))
def group(name):
 c=bpy.data.collections.new(name);scene.collection.children.link(c);return c
waterGroup=group('Calibrated crest and banks');drumGroup=group('Curved washer drum');metalGroup=group('Gold machined fittings');guides=group('Source camera and editable path guides')
def material(name,col,metal,rough,patch=None):
 m=bpy.data.materials.new(name);m.diffuse_color=(*col,1);m.use_nodes=True;b=m.node_tree.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=(*col,1);b.inputs['Metallic'].default_value=metal;b.inputs['Roughness'].default_value=rough
 if patch:
  n=m.node_tree.nodes.new('ShaderNodeTexImage');n.image=bpy.data.images.load(str(base/'assets/textures/match06'/patch),check_existing=True);n.image.pack();n.name='Approved artwork material source';n.label='Approved artwork material source';n.location=(-540,-250)
 return m
mats={'bank':material('Raised magenta water lip',(.75,.052,.65),.19,.24,'tile_river6.png'),'wall':material('Violet perforated steel',(.38,.115,.58),.78,.25,'tile_tube.png'),'ring':material('Machined gold and pink reflection',(.94,.47,.115),.8,.20,'tile_ring6.png'),'water':material('Glossy cyan and satin magenta flow',(.03,.72,.93),.14,.19,'tile_river6.png'),'foam':material('Lilac-white bank foam',(.81,.78,.97),.02,.42,'tile_foam6.png'),'paddle':material('Polished drum lifter',(.88,.39,.08),.78,.21,'tile_ring6.png'),'end':material('Distant violet drum',(.18,.055,.28),.55,.44)}
class Builder:
 def __init__(self):self.vertices=[];self.uv=[];self.faces=[]
 def vertex(self,v,uv):self.vertices.append(bv(v));self.uv.append(uv);return len(self.vertices)-1
 def rows(self,rows):
  for prev,nxt in zip(rows,rows[1:]):
   for j in range(len(prev)-1):self.faces.append((prev[j],prev[j+1],nxt[j+1],nxt[j]))
 def object(self,name,mat,collection):
  mesh=bpy.data.meshes.new(name);mesh.from_pydata(self.vertices,[],self.faces);mesh.update();layer=mesh.uv_layers.new(name='Surface coordinates')
  for i,loop in enumerate(mesh.loops):u,v=self.uv[loop.vertex_index];layer.data[i].uv=(u,1-v)
  for face in mesh.polygons:face.use_smooth=True
  obj=bpy.data.objects.new(name,mesh);collection.objects.link(obj);mesh.materials.append(mats[mat]);obj['surface_family']=mat;return obj

# Real hollow tube. Its stations and every gold seat share exactly the same frame.
tube=Builder();rows=[];sections=layout['drum'][::4];sections+= [layout['drum'][-1]] if sections[-1]!=layout['drum'][-1] else [];segments=80
for q in sections:
 c,r,u,rad,d=vector(q,'p'),vector(q,'r'),vector(q,'u'),q['radius'],q['distance'];row=[]
 for j in range(segments+1):
  th=-math.pi/2+j*math.tau/segments;n=r*math.cos(th)+u*math.sin(th);row.append(tube.vertex(c+rad*n,(th,d)))
 rows.append(row)
tube.rows(rows);tube.object('RinseWall','wall',drumGroup)
for i,sec in enumerate(layout['rings']):
 c,t,r,u=map(lambda key:vector(sec,key),['p','t','r','u']);rad,h,dep=sec['radius'],sec['halfWidth'],sec['depth'];ring=Builder();rows=[]
 # Faces, narrow lips and a recessed fillet are part of the solid, with paint coordinates along the profile.
 profile=[(.14,-h,0.),(-dep,-h,.17),(-dep-.07,-h+.10,.31),(-dep-.07,-h*.52,.39),(-dep+.04,-h*.40,.43),(-dep+.04,h*.50,.79),(-dep-.065,h*.63,.85),(-dep-.065,h-.095,.94),(-dep,h,.97),(.14,h,1.)]
 for j in range(97):
  th=math.tau*j/96-math.pi/2;n=r*math.cos(th)+u*math.sin(th);rows.append([ring.vertex(c+n*(rad+off)+t*ax,(j/96,across)) for off,ax,across in profile])
 ring.rows(rows);o=ring.object(f'RinseRing_{i:02}','ring',metalGroup);o['station']=sec['z']
# Winding sweep with independent asymmetric sculpted sections. Centre vertices stay on Benny's established course.
river=Builder();rows=[];sections=layout['water'];tSpan=np.linspace(-1.,1.,19);cumulative=0.;last=None
for q in sections:
 p,r,u=vector(q,'p'),vector(q,'r'),vector(q,'u');s=q['s'];cumulative+=0 if last is None else np.linalg.norm(p-last);last=p
 row=[]
 for frac in tSpan:
  side='left' if frac<0 else 'right';a=abs(frac);w=q[side+'Width'];h=q[side+'Rise'];shoulder=max(0.,min(1.,(a*w-2.91)/max(.28,w-2.91))) if 0<s<56 else a; bank=shoulder*shoulder*(3.-2.*shoulder);ripple=.025*math.sin(s*1.55+frac*5.2)*a*(1-a);v=p+r*(frac*w)+u*(h*bank+ripple)
  row.append(river.vertex(v,((frac+1)*.5,cumulative)))
 rows.append(row)
river.rows(rows);river.object('RinseWater','water',waterGroup)
# Closed glossy banks give the water a visible edge during turns and support its rounded foam.
for side,sign in [('left',-1.),('right',1.)]:
 lip=Builder();grid=[];dist=0.;last=None
 for q in sections:
  c,r,u=vector(q,'p'),vector(q,'r'),vector(q,'u');w=q[side+'Width'];h=q[side+'Rise'];dist+=0 if last is None else np.linalg.norm(c-last);last=c
  edge=c+sign*r*w+u*h;rad=.10+.03*math.sin(q['s']*.42);profile=[(-.09,-.025),(.01,.045),(.17,rad),(.31,.05),(.35,-.068),(.24,-.21),(-.10,-.25)]
  grid.append([lip.vertex(edge+sign*r*x+u*y,(i/(len(profile)-1),dist)) for i,(x,y) in enumerate(profile)])
 lip.rows(grid);lip.object('RinseBank_'+side,'bank',waterGroup)
# Rounded lobes seat on the outer shoulder. Deliberate gaps separate the clusters around the bends.
foam=Builder();rand=random.Random(60617)
def lobe(c,ex,ez,ey,ra,rb,rh,detail,seed):
 rings=[];lon=7 if detail else 5;levels=4 if detail else 3
 for h in range(levels+1):
  ph=-math.pi*.48+h/levels*math.pi*.96;row=[]
  for v in range(lon+1):
   th=math.tau*v/lon;pos=c+ex*(ra*math.cos(ph)*math.cos(th))+ez*(rb*math.cos(ph)*math.sin(th))+ey*(rh*math.sin(ph));row.append(foam.vertex(pos,(v/lon+seed,h/levels)))
  rings.append(row)
 foam.rows(rings);foam.faces.append(tuple(reversed(rings[0][:-1])));foam.faces.append(tuple(rings[-1][:-1]))
ss=np.array([q['s'] for q in sections]);rng=random.Random(876);clusters=0
for side,sign in [('left',-1),('right',1)]:
 s=-10.1+(1.2 if sign>0 else 0)
 while s<ss[-1]-1:
  q=sections[int(np.argmin(abs(ss-s)))];r,u,p=map(lambda k:vector(q,k),['r','u','p']);t=unit(np.cross(u,r));w=q[side+'Width'];h=q[side+'Rise'];scale=(.23+.13*rng.random())*(1.16 if 7<s<30 else 1.);shore=max(w+.17,3.75 if 0<s<54 else w+.06);centre=p+sign*r*shore+u*(h-.025);spread=.32+.45*rng.random();n=rng.randrange(3,6)
  for j in range(n):
   along=rng.uniform(-.82,.82)*spread;out=rng.uniform(.08,.64)*spread;size=scale*rng.uniform(.55,1.20);c=centre+t*along+sign*r*out+u*(size*.18+rng.uniform(-.025,.045));lobe(c,r,t,u,size*1.04,size*1.25,size*.72,True,rng.randrange(20))
   if j==1:
    sz=size*.34;lobe(c+sign*r*size*.58+t*size*.62+u*.045,r,t,u,sz,sz,sz*.92,False,rng.randrange(20))
  clusters+=1;s+=rng.uniform(1.63,2.65) if s<65 else rng.uniform(2.8,4.3)
foam.object('RinseFoam','foam',waterGroup)
# A shallow half-oval mechanism with softened lips, attached to the inside of the drum at the calibrated rays.
for i,q in enumerate(layout['paddles']):
 if q.get('front'):
  obj=Builder();front=np.array(q['front']);back=np.array(q['back']);fc=np.mean(front,axis=0);bc=np.mean(back,axis=0);grid=[]
  for ring,frac,uvy in [(back,1.,.03),(front*.17+back*.83,1.012,.18),(front*.82+back*.18,1.008,.73),(front,.96,.96)]:
   mid=np.mean(ring,axis=0);pts=mid+(ring-mid)*frac;grid.append([obj.vertex(pts[j%len(pts)],(j/len(pts),uvy)) for j in range(len(pts)+1)])
  obj.rows(grid);face=obj.vertex(fc-(vector(q,'normal')*.035),(.5,.55))
  for x1,x2 in zip(grid[-1],grid[-1][1:]):obj.faces.append((face,x1,x2))
  obj.faces.append(tuple(reversed(grid[0][:-1])));obj.object(f'RinsePaddle_{i:02}','paddle',metalGroup);continue
 p,n,t=map(lambda k:vector(q,k),['p','normal','t']);x=unit(np.cross(t,n));y=unit(t);a=q['halfWidth'];obj=Builder();contour=[(-1.,-.18)]+[(math.cos(th),math.sin(th)*.58-.15) for th in np.linspace(math.pi,0,22)]+[(1.,-.18),(.82,-.28),(-.84,-.28),(-1.,-.18)];rings=[]
 for inset,scale,uvY in [(0.,1.,.04),(.15,1.,.23),(.45,.95,.57),(.58,.81,.85)]:
  rings.append([obj.vertex(p+x*(ax*a*scale)+y*(ay*a*scale)-n*inset,(j/(len(contour)-1),uvY)) for j,(ax,ay) in enumerate(contour)])
 obj.rows(rings);obj.faces.append(tuple(reversed(rings[-1][:-1])));obj.object(f'RinsePaddle_{i:02}','paddle',metalGroup)
# Back plate terminates the geometry well around the unseen bend.
last=layout['drum'][-1];p,r,u=vector(last,'p'),vector(last,'r'),vector(last,'u');end=Builder();centre=end.vertex(p,(.5,.5));circle=[end.vertex(p+(r*math.cos(th)+u*math.sin(th))*last['radius'],((math.cos(th)+1)/2,(math.sin(th)+1)/2)) for th in np.linspace(0,math.tau,65)]
for a,b in zip(circle,circle[1:]):end.faces.append((centre,a,b))
end.object('RinseEnd','end',drumGroup)
# Editable guide curves and the exact original game camera are retained inside the Blender file.
for name,src in [('Original ride and crest guide',layout['water']),('Drum and ring sweep guide',layout['drum'])]:
 curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';sp=curve.splines.new('POLY');sp.points.add(len(src)-1)
 for pt,coord in zip(sp.points,src):pt.co=(*bv(vector(coord,'p')),1)
 obj=bpy.data.objects.new(name,curve);guides.objects.link(obj);obj.hide_render=True
cam=bpy.data.cameras.new('Approved Screen 06 camera');cam.sensor_fit='VERTICAL';cam.angle=math.radians(layout['camera']['fov']);cam.clip_start=.3;cam.clip_end=500;obj=bpy.data.objects.new(cam.name,cam);guides.objects.link(obj);mc=np.array(layout['camera']['matrixWorld']).reshape(4,4).T;wm=np.eye(4);wm[:3,:3]=worldm;obj.matrix_world=Matrix((wm@mc).tolist());scene.camera=obj;scene.render.resolution_x=864;scene.render.resolution_y=1536;scene.render.resolution_percentage=100
scene['notes']='World-anchored Three.js reconstruction. The editable guide follows the retained gameplay route. Modeled ring bays, foam height and the unseen return are pending owner visual review.'
blend_path.parent.mkdir(parents=True,exist_ok=True);glb_path.parent.mkdir(parents=True,exist_ok=True);bpy.ops.wm.save_as_mainfile(filepath=str(blend_path),compress=True)
bpy.ops.object.select_all(action='DESELECT')
for o in scene.objects:
 if o.type=='MESH':o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(glb_path),export_format='GLB',use_selection=True,export_yup=True,export_texcoords=True,export_normals=True,export_materials='EXPORT',export_extras=True,export_cameras=False,export_animations=False)
print('RAINBOW06 world export',len(layout['rings']),'rings',clusters,'foam groups',glb_path.stat().st_size)
