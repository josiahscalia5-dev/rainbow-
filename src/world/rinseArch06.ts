import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PROJ05_INVERSE } from '../vfx/waterRibbon';
import type { Match06 } from './match06';
import layout from '../../assets/textures/match06/proj06.json';

const vertexShader = /* glsl */ `
uniform mat4 lockedProjection;
varying vec2 surface;
varying vec3 worldPoint;
varying vec3 worldNormal;
varying vec4 sourcePosition;
void main() {
  vec4 p = modelMatrix * vec4(position, 1.0);
  worldPoint = p.xyz;
  worldNormal = normalize(mat3(modelMatrix) * normal);
  surface = uv;
  sourcePosition = lockedProjection * p;
  gl_Position = projectionMatrix * viewMatrix * p;
}`;

const fragmentShader = /* glsl */ `
uniform sampler2D plate;
uniform sampler2D sourceMask;
uniform sampler2D sourceMaterials;
uniform sampler2D sourceDepth;
uniform sampler2D riverPaint;
uniform sampler2D panelPaint;
uniform sampler2D ringPaint;
uniform vec3 sourceEye;
uniform float clockTime;
uniform vec4 uPjPost;
uniform vec2 uPjRes;
varying vec2 surface;
varying vec3 worldPoint;
varying vec3 worldNormal;
varying vec4 sourcePosition;
${PROJ05_INVERSE}

float hash12(vec2 p) { return fract(sin(dot(p,vec2(113.17,57.43)))*43567.12); }
float linearDepth(float depth) { return 120.0 / (400.0 - depth * 399.7); }
float ridge(float a, float w) { return 1.0 - smoothstep(w, w + max(fwidth(a), .008), abs(a)); }
vec3 flowingWater() {
  float down = surface.y - clockTime * .56;
  float x = surface.x * 2.0 - 1.0;
  float sweep = .16 * sin(surface.y * .39 + .8) + .09 * sin(surface.y * .71 - .4);
  float lane = clamp(x - sweep * (1.0 - x*x), -1.0, 1.0);
  float across = lane * .5 + .5;
  // Fixed scale in game units. Each shot sees the same curved banks and the same underlying surface.
  float phase = down / 1.12 + .37*sin(lane*5.4 + surface.y*.34) + lane*lane*.46;
  vec3 paint = texture2D(riverPaint, vec2(across, phase)).rgb;
  vec3 fine = texture2D(riverPaint, vec2(clamp(across+.037*sin(down*.82),.005,.995), down/1.52 - .27*sin(lane*7.1-surface.y*.22))).rgb;
  vec3 water = mix(paint, fine, .32);
  float satin = smoothstep(.61,.94,abs(lane)+.09*sin(down*.69+lane*4.));
  water = mix(water, mix(vec3(.64,.13,.91),vec3(.99,.42,.94),fine.r), .25*satin);
  float ribbon = ridge(abs(lane)-(.63+.06*sin(down*.43)), .035);
  float warm = smoothstep(.35,.92,sin(surface.y*.28+lane*1.6));
  water += ribbon*warm*vec3(.25,.27,.06);
  // Short broken crests run across the current, avoiding long vertical highlight lines.
  float front = fract(down/1.39 + lane*lane*1.14+.18*sin(lane*8.0+down*.35))-.5;
  float segment = smoothstep(.44,.91,sin(lane*12.0+down*1.8)*.5+.5);
  water += ridge(front,.018)*segment*(1.-satin*.44)*vec3(.22,.20,.24);
  return clamp(water,0.0,1.0);
}
vec3 drumPanel(vec3 n, vec3 viewDir) {
  float circumferenceRadius=mix(15.0,5.85,smoothstep(75.0,145.0,surface.y));
  float row=floor(surface.y/.66);
  vec2 slot=vec2((fract(surface.x*circumferenceRadius/.88+.5*mod(row,2.0))-.5)*.88,(fract(surface.y/.66)-.5)*.66);
  float sdf=length(max(abs(slot)-vec2(.152,.020),0.0))-.048;
  float aa=max(fwidth(sdf),.005);
  float cut=1.0-smoothstep(-aa,aa,sdf);
  float rim=(1.0-smoothstep(.012,.038+aa,abs(sdf-.024)))*smoothstep(-.035,.04,slot.y);
  vec3 light=normalize(vec3(-.56,.68,.47));
  float angle=surface.x, run=surface.y;
  float violet=.5+.5*sin(angle*2.+.55*sin(run*.11)+.3);
  vec3 purple=mix(vec3(.34,.13,.49),vec3(.74,.29,.77),violet);
  float blue=pow(.5+.5*cos(angle*3.7-run*.085),5.0);
  float pink=pow(.5+.5*cos(angle*4.3+run*.11),9.0);
  purple=mix(purple,vec3(.43,.52,.96),blue*.52)+pink*vec3(.19,.055,.16);
  float gloss=pow(max(dot(reflect(-light,n),viewDir),0.0),16.0);
  purple+=vec3(.52,.38,.53)*gloss;
  float brush=.016*sin(run*39.+angle*10.);purple+=brush*(1.-smoothstep(.014,.10,fwidth(run)));
  vec3 machined=mix(purple,vec3(.16,.045,.23),cut*.89)+rim*vec3(.34,.22,.37);
  // A rectified strip of the approved slotted washer carries its original brushed metal and reflected light.
  vec2 millimetres=vec2(angle*circumferenceRadius/4.0,run/2.12);
  vec3 actual=texture2D(panelPaint,millimetres).rgb;
  actual=mix(actual,actual*vec3(.71,.80,1.10)+vec3(.06,.025,.08),.45+.27*sin(angle*2.+run*.074));
  return mix(machined,actual,.64)+gloss*vec3(.14,.095,.18);

}
void main() {
  vec3 viewDir=normalize(cameraPosition-worldPoint);
  vec3 n=normalize(worldNormal); if(dot(n,viewDir)<0.)n=-n;
  vec3 base=vec3(.28,.12,.44); float farStart=53.0, farEnd=96.0;
#ifdef SURFACE_WATER
  base=flowingWater(); farStart=15.0; farEnd=37.0;
#endif
#ifdef SURFACE_BANK
  float lip=sin(surface.x*3.14159);vec3 paint=texture2D(riverPaint,vec2(.05+.07*lip,(surface.y-clockTime*.5)/1.18)).rgb;
  base=mix(vec3(.61,.085,.76),paint,.73)+vec3(.23,.13,.22)*pow(max(lip,0.),6.);farStart=16.;farEnd=33.;
#endif
#ifdef SURFACE_WALL
  base=drumPanel(n,viewDir);
#endif
#ifdef SURFACE_RING
  base=texture2D(ringPaint,vec2(surface.x*4.0,surface.y)).rgb;
  float highlight=pow(max(0.,dot(reflect(-normalize(vec3(-.48,.71,.45)),n),viewDir)),22.0);
  base+=highlight*vec3(.30,.23,.28); farStart=45.0; farEnd=98.0;
#endif
#ifdef SURFACE_PADDLE
  base=texture2D(ringPaint,vec2(surface.x*1.5,.23+.62*surface.y)).rgb;
  base=mix(base,vec3(.98,.66,.27),.14)+.16*pow(max(0.,dot(reflect(-normalize(vec3(-.4,.7,.5)),n),viewDir)),16.0);
#endif
#ifdef SURFACE_FOAM
  float shade=dot(n,normalize(vec3(-.44,.81,.40)));
  base=mix(vec3(.62,.65,.90),vec3(.97,.96,1.),smoothstep(-.58,.59,shade));
  vec2 cell=surface*vec2(9.0,6.);vec2 off=fract(cell)-.5;float pore=length(off);float seed=hash12(floor(cell));
  base-=vec3(.17,.15,.09)*(1.-smoothstep(.09,.22+max(fwidth(pore),.01),pore))*smoothstep(.46,.8,seed)*(1.-smoothstep(.01,.84,shade));
  farStart=19.0;farEnd=35.0;
#endif
  // This assignment depends only on the photographed surface, its normal and depth at the saved camera.
  // It never follows the live camera. Unseen geometry keeps its own metre-scaled paint and normal response.
  if(sourcePosition.w>.30) {
    vec3 ndc=sourcePosition.xyz/sourcePosition.w; vec2 pos=ndc.xy*.5+.5;
    if(all(greaterThanEqual(pos,vec2(0)))&&all(lessThanEqual(pos,vec2(1)))) {
      vec3 label=texture2D(sourceMaterials,pos).rgb;
      float wall=texture2D(sourceMask,pos).g;
      float own=0.;
#ifdef SURFACE_WALL
      own=wall*(1.-label.r);
#endif
#ifdef SURFACE_RING
      own=wall*label.r;
#endif
#ifdef SURFACE_PADDLE
      own=wall;
#endif
#ifdef SURFACE_WATER
      own=(1.-wall)*(1.-label.b)*(1.-.65*label.g);
#endif
#ifdef SURFACE_BANK
      own=(1.-wall)*(1.-label.b)*(1.-label.g);
#endif
#ifdef SURFACE_FOAM
      own=label.g;
#endif
      float z=sourcePosition.w, first=linearDepth(texture2D(sourceDepth,pos).r);
      float visible=1.-smoothstep(.028+z*.002,.10+z*.009,z-first);
      float incident=abs(dot(normalize(worldNormal),normalize(sourceEye-worldPoint)));
      float sourceTexelsPerUnit=1277.9*incident/max(z,.3);
      float minDensity=13.0, fullDensity=34.0;
#ifdef SURFACE_WATER
      minDensity=40.0;fullDensity=105.0;
#endif
#ifdef SURFACE_PADDLE
      minDensity=3.0;fullDensity=13.0;
#endif
      float fixedDensity=smoothstep(minDensity,fullDensity,sourceTexelsPerUnit)*(1.-smoothstep(farStart,farEnd,z));
      base=mix(base,texture2D(plate,pos).rgb,own*visible*fixedDensity);
    }
  }
  gl_FragColor=vec4(pjInverse(clamp(base,0.,1.)),1.);
}`;

export async function buildRinseArch06(): Promise<Match06> {
  const loader = new THREE.TextureLoader();
  const art = (name: string) => new URL(`../../assets/textures/match06/${name}`, import.meta.url).href;
  const [model, plate, sourceMask, sourceMaterials, riverPaint, ringPaint, panelPaint] = await Promise.all([
    new GLTFLoader().loadAsync(new URL('../../assets/reconstruction06/rinse_arch.glb', import.meta.url).href),
    loader.loadAsync(art('plate06_hybrid.png')), loader.loadAsync(art('mask06.png')),
    loader.loadAsync(new URL('../../assets/reconstruction06/art_materials.png', import.meta.url).href),
    loader.loadAsync(art('tile_river6.png')), loader.loadAsync(art('tile_ring6.png')),
    loader.loadAsync(new URL('../../assets/reconstruction06/painted_panel.png', import.meta.url).href),
  ]);
  for (const t of [plate, sourceMask, sourceMaterials, riverPaint, ringPaint, panelPaint]) {
    t.colorSpace = THREE.NoColorSpace;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.anisotropy = 8;
  }
  riverPaint.wrapT = THREE.MirroredRepeatWrapping;
  ringPaint.wrapS = THREE.MirroredRepeatWrapping;
  panelPaint.wrapS=panelPaint.wrapT=THREE.MirroredRepeatWrapping;
  const [width,height] = layout.camera.size;
  const camera = new THREE.PerspectiveCamera(layout.camera.fov, width/height, .3, 400);
  camera.matrixWorld.fromArray(layout.camera.matrixWorld);
  camera.matrixWorld.decompose(camera.position,camera.quaternion,camera.scale);
  camera.updateMatrixWorld(true);
  const depth = new THREE.WebGLRenderTarget(width,height,{depthBuffer:true});
  depth.depthTexture = new THREE.DepthTexture(width,height,THREE.UnsignedIntType);
  const uniforms = {
    lockedProjection:{value:new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse)},
    sourceEye:{value:camera.position.clone()}, sourceDepth:{value:depth.depthTexture}, plate:{value:plate},
    sourceMask:{value:sourceMask},sourceMaterials:{value:sourceMaterials},riverPaint:{value:riverPaint},ringPaint:{value:ringPaint},panelPaint:{value:panelPaint},
    uPjPost:{value:new THREE.Vector4(.86,1.36,1.15,.18)},uPjRes:{value:new THREE.Vector2(width,height)},clockTime:{value:0},
  };
  const mats = new Map<string,THREE.ShaderMaterial>();
  const group=model.scene;
  group.name='Screen06_Structural_World';
  group.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    const family = String(object.userData.surface_family || 'end');
    if (!mats.has(family)) mats.set(family,new THREE.ShaderMaterial({name:'Rinse '+family,vertexShader,fragmentShader,
      defines:{['SURFACE_'+family.toUpperCase()]:1},uniforms,side:THREE.DoubleSide,fog:false}));
    object.material=mats.get(family)!;
  });
  return {
    group,
    bakeDepth(renderer) {
      const scene=new THREE.Scene(); const depthOnly=new THREE.MeshBasicMaterial({side:THREE.DoubleSide,colorWrite:false});
      const copy=group.clone(true);copy.visible=true;copy.traverse(o=>{if(o instanceof THREE.Mesh)o.material=depthOnly;});scene.add(copy);
      const current=renderer.getRenderTarget();renderer.setRenderTarget(depth);renderer.clear();renderer.render(scene,camera);renderer.setRenderTarget(current);depthOnly.dispose();
    },
    away(position) { return THREE.MathUtils.smoothstep(position.distanceTo(camera.position),.6,2.0); },
    setAway() { /* The bank lobes are solid meshes and remain present at every view. */ },
    sync(renderer,w,h) {uniforms.uPjPost.value.x=renderer.toneMappingExposure;uniforms.uPjRes.value.set(w,h);uniforms.clockTime.value=performance.now()/1000;},
  };
}
