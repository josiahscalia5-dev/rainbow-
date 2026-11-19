import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { makeCrestGrade06, fitCrestGrade06, reconstructOpenCrest06 } from './openCrest06';
import type { Course } from './course';
import { PROJ05_INVERSE } from '../vfx/waterRibbon';

const roundedURL = new URL('../../assets/rounded-crest06/rounded-spillway.glb', import.meta.url).href;
const shellURL = new URL('../../assets/arched-passage06/passage.glb', import.meta.url).href;
const panelURL = new URL('../../assets/arched-passage06/slot.png', import.meta.url).href;
const goldURL = new URL('../../assets/textures/match06/tile_ring6.png', import.meta.url).href;
type Surface = 'wall' | 'ring' | 'paddle' | 'water' | 'foam' | 'bank' | 'end';
const families: Surface[] = ['wall', 'ring', 'paddle', 'water', 'foam', 'bank', 'end'];

// UVs are the coordinates exported from the bent drum, solid collars and measured channel.
// The reference camera is fixed in the world. Its visibility buffer prevents back surfaces
// from borrowing paint. The fallback is a material on the same physical surface.
const passageVertex = /* glsl */ `
uniform mat4 uProjVP;
varying vec4 projected;
varying vec3 worldPosition;
varying vec3 worldNormal;
varying vec2 surfaceUV;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.);
  worldPosition = world.xyz;
  worldNormal = normalize(mat3(modelMatrix) * normal);
  surfaceUV = uv;
  projected = uProjVP * world;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

const passageFragment = /* glsl */ `
uniform sampler2D uPlate, uDepth, uMask, uTile, uRiver, uRingTex;
uniform float uUseDepth, uTime;
uniform float uSeats[12];
uniform vec2 uNearFar, uPjRes;
uniform vec3 uProjPos;
uniform vec4 uPjPost;
varying vec4 projected;
varying vec3 worldPosition, worldNormal;
varying vec2 surfaceUV;
${PROJ05_INVERSE}
float opticalDepth(float z) {
  float n = uNearFar.x, f = uNearFar.y;
  return n * f / (f - z * (f - n));
}
vec3 surfacePaint(vec3 normal, vec3 view) {
  float grazing = pow(1. - abs(dot(normal, view)), 3.);
#if defined(CREST_WALL)
  // The gold collars are separate solids. The sampled panel contains only perforated metal.
  float circumference = surfaceUV.x * 14.;
  float station = surfaceUV.y;
  float row = floor(station / .86);
  vec2 shapeUV = vec2(fract(circumference / 1.32 + .5 * mod(row,2.)), fract(station / .86));
  vec2 slot = texture2D(uTile,shapeUV).rg;
  // Only the original recess and tiny rim repeat. Broad purple, blue and pink reflections
  // follow the complete physical bay instead of repeating once per hole.
  float phase = surfaceUV.x + .012*station;
  float violet = .5 + .5*sin(phase * 1.7 - .4);
  float polish = pow(.5+.5*cos(phase*2.16+.52),6.);
  float blue = pow(.5+.5*cos(phase*2.65-1.6),9.);
  vec3 metal = mix(vec3(.43,.17,.53),vec3(.74,.36,.77),violet);
  metal += vec3(.23,.18,.18)*polish + vec3(.025,.15,.30)*blue;
  float specular = pow(max(0., dot(reflect(-view,normal),normalize(vec3(-.2,.53,-.825)))),14.);
  metal += vec3(.17,.14,.18)*specular + vec3(.065,.05,.082)*grazing;
#ifdef ROUNDED_CREST
  // A broad violet-blue studio reflection travels over the drum's curved normal.
  vec3 reflected = reflect(-view, normal);
  float wash = pow(max(0., dot(reflected, normalize(vec3(.62,.54,-.56)))), 6.);
  float edge = pow(max(0., dot(reflected, normalize(vec3(-.67,.32,-.64)))), 14.);
  metal += vec3(.035,.11,.20)*wash + vec3(.18,.085,.12)*edge;
#endif
  float nearestSeat = 1000.;
  for (int i=0;i<12;i++) nearestSeat=min(nearestSeat,abs(station-uSeats[i]));
  float collarShadow = .19 * exp(-nearestSeat * .42);
  float distantGlow = smoothstep(83.,178.,station) * (.19 + .11*polish);
  metal = mix(metal*(1.-collarShadow),vec3(.99,.54,.39),distantGlow);
  return mix(metal,vec3(.19,.045,.24),slot.r*.88) + vec3(.28,.19,.26)*slot.g;
#elif defined(CREST_RING) || defined(CREST_PADDLE)
  vec3 gold = texture2D(uRingTex, vec2(surfaceUV.x * 4., surfaceUV.y)).rgb;
  float rim = .12 * pow(max(dot(reflect(-view, normal), normalize(vec3(.2,.6,-.8))), 0.), 14.);
#ifdef ROUNDED_CREST
  vec3 reflected = reflect(-view, normal);
  float cool = pow(max(0.,dot(reflected,normalize(vec3(-.72,.24,-.64)))),5.);
  float warm = pow(max(0.,dot(reflected,normalize(vec3(.29,.71,-.64)))),11.);
  gold = mix(gold, vec3(.83,.42,.72), cool*.21) + vec3(.22,.165,.11)*warm;
#endif
  return mix(gold, vec3(1.,.90,.70), .13 * grazing) + vec3(rim, rim * .63, rim * .42);
#elif defined(CREST_WATER)
  float s = surfaceUV.y;
  float centre = .50 + .102 * sin(s * .226 + .38) + .04 * sin(s * .46 - .93);
  float x = clamp(.5 + surfaceUV.x - centre + .021 * sin(s * 1.54 + surfaceUV.x * 4.8), .012, .988);
  float flow = s - uTime * .72;
#ifdef ROUNDED_CREST
  // Refract the retained swatch over short curved ripples across the actual course.
  float curl = sin(flow*2.55 + 6.8*x + .75*sin(s*.63 - 7.9*x));
  x = clamp(x + .035*curl, .012, .988);
  flow += .10*sin(6.7*x - s*.93) + .072*curl;
#endif
  // The archived swatch comes from 0.70 longitudinal units. Sample shorter wavelengths
  // with two curved phases so its highlights retain local definition through the crest.
  vec3 a = texture2D(uRiver, vec2(x, flow / 1.12 + .27 * sin(8.1*x + s*.32))).rgb;
  vec3 b = texture2D(uRiver, vec2(clamp(x + .023*sin(s*1.21),.005,.995),
                                  flow / .82 + .36 * sin(x * 9. + s * .41))).rgb;
  float blend = .18 + .31 * smoothstep(-1., 1., sin(s * .62 + x * 2.2));
  vec3 paint = mix(a, b, blend);
  float crest = sin(s*5.41 + 7.12*x + 1.54*sin(s*.82+9.*x) - uTime*2.);
  float glint = smoothstep(.85,1.,crest) * smoothstep(.37,.95,paint.g) * .11;
#ifdef ROUNDED_CREST
  float wavelet = sin(7.2*flow + 1.5*sin(5.5*x - s*.51) + .6*cos(14.*x + s*.35));
  glint += smoothstep(.81,.985,wavelet)*(.035+.065*paint.g)*(.6+.4*curl);
#endif
#ifdef CREST_ROLLED_CAP
  // The narrow rolled edge has different texel density from the broad wet crown.
  // Carry the highlight around its actual curved normal and along the full wet lip.
  float fold = smoothstep(.82,.94,surfaceUV.x);
  float across = smoothstep(.82,.975,surfaceUV.x);
  float pool = .5 + .5*sin(.72*s + .65*sin(.27*s) - uTime*.42);
  vec3 side = mix(vec3(.16,.75,.89),vec3(.68,.26,.77),across);
  float fresnel = pow(1.-abs(dot(normal,view)),2.);
  side += vec3(.09,.105,.135)*pool + vec3(.16,.11,.18)*fresnel;
  paint = mix(paint,side,.94*fold);
  glint *= 1.-.80*fold;
#endif
  return paint + vec3(.78,.96,1.)*(glint + grazing * .075);
#elif defined(CREST_BANK)
  float lip = 1. - smoothstep(.12,.82,surfaceUV.x);
  float reflection = .5 + .5 * sin(surfaceUV.y * .76 + surfaceUV.x * 3.);
  return mix(vec3(.30,.13,.54),vec3(.94,.19,.77),lip*.82 + reflection*.09)
          + vec3(.20,.18,.26)*grazing;
#elif defined(CREST_FOAM)
  float lighting = .5+.5*dot(normal,normalize(vec3(-.36,.78,.48)));
  vec3 cloud = mix(vec3(.61,.56,.82),vec3(.99,.97,1.),smoothstep(.14,.86,lighting));
#ifdef ROUNDED_CREST
  cloud *= mix(vec3(.80,.76,.90),vec3(1.,1.,1.),smoothstep(.16,.72,lighting));
#endif
  return cloud + vec3(.038,.041,.065)*grazing;
#else
  float d = length(surfaceUV - .5);
  return mix(vec3(1.,.82,.50),vec3(.41,.18,.54),smoothstep(.025,.28,d));
#endif
}
void main() {
  vec3 view = normalize(cameraPosition - worldPosition);
  vec3 norm = normalize(worldNormal);
  if(dot(norm,view)<0.) norm=-norm;
  vec3 paint = surfacePaint(norm,view);
  vec3 fromOriginal = uProjPos - worldPosition;
  if (projected.w > 0.) {
    vec3 nativeNdc = projected.xyz / projected.w;
    vec2 uvRef = nativeNdc.xy * .5 + .5;
    if (all(greaterThanEqual(uvRef,vec2(0.))) && all(lessThanEqual(uvRef,vec2(1.)))) {
      float z = opticalDepth(nativeNdc.z*.5+.5);
      float nearest = opticalDepth(texture2D(uDepth,uvRef).r);
      float seen = uUseDepth < .5 ? 1. : 1.-smoothstep(.015*nearest,.04*nearest+.05,z-nearest);
      vec3 sourceRay = normalize(fromOriginal);
      float distanceNow = distance(cameraPosition,worldPosition);
      float parallax = length(cross(view,sourceRay)) * min(length(fromOriginal),distanceNow);
      float approach = max(0.,length(fromOriginal)-distanceNow);
      float relativeIncidence = abs(dot(norm,view)) / max(.001,abs(dot(norm,normalize(fromOriginal))));
      float enlargement = relativeIncidence * length(fromOriginal) / max(.001,distance(cameraPosition,worldPosition));
      // Retain the opening's registered paint. Reproject only while the sampled feature still
      // belongs to this surface and has enough original detail for the moving viewpoint.
      float sameFootprint = 1. - smoothstep(.25,3.65,parallax + .34*approach);
      float fit = 1.-smoothstep(1.25,2.9,enlargement);
      float correct = 1.;
#if defined(CREST_WATER)
      vec3 mask=texture2D(uMask,uvRef).rgb;
      correct = (1.-max(mask.r,mask.g)) * .80;
#elif defined(CREST_WALL)
      correct = texture2D(uMask,uvRef).g * .30;
#else
      correct = 0.;
#endif
      float weight = seen * fit * mix(correct,1.,sameFootprint);
#ifdef OPEN_CREST_WATER
      // Retire painted walls, coins and filled character silhouettes promptly from water.
      // Beyond the registered pose their shine belongs to objects at a different depth.
      vec2 exclusion=texture2D(uMask,uvRef).rg;
      float movingSeparation=smoothstep(.06,1.5,parallax+.5*approach);
      weight *= 1.-movingSeparation*max(exclusion.x,exclusion.y);
#ifdef ROUNDED_CREST
      // The saved plate includes rounded foam and dry metal at different depths. Blend
      // into the flowing metric swatch as the swimmer leaves the photograph's footprint.
      weight *= 1.-smoothstep(.40,2.55,parallax+.72*approach);
#endif
#endif
      paint = mix(paint,texture2D(uPlate,uvRef).rgb,weight);
    }
  }
  gl_FragColor=vec4(pjInverse(paint),1.);
}`;

export async function buildArchedPassage06(
  makeMaterial: (tile: THREE.Texture, floor?: boolean) => THREE.ShaderMaterial, course: Course, openCrest = false, roundedCrest = false
): Promise<THREE.Group> {
  const loader = new THREE.TextureLoader();
  const gltfLoader = new GLTFLoader();
  const [gltf, panel, gold, rounded] = await Promise.all([
    gltfLoader.loadAsync(shellURL), loader.loadAsync(panelURL), loader.loadAsync(goldURL),
    roundedCrest ? gltfLoader.loadAsync(roundedURL) : null
  ]);
  const fitted = new Map<string, THREE.BufferGeometry>();
  if (rounded) {
    rounded.scene.updateMatrixWorld(true);
    rounded.scene.traverse(obj => {
      if (!(obj instanceof THREE.Mesh)) return;
      if (!obj.geometry.getAttribute('uv') || fitted.has(obj.name)) {
        throw Error('Invalid rounded crest mesh ' + obj.name);
      }
      fitted.set(obj.name, obj.geometry.clone().applyMatrix4(obj.matrixWorld));
      obj.geometry.dispose();
      for (const mat of Array.isArray(obj.material) ? obj.material : [obj.material]) mat.dispose();
    });
    for (const name of ['m06_arched_wall', 'm06_arched_ring', 'm06_arched_paddle',
        'm06_crest_upper_water', 'm06_crest_outer_soffit', 'm06_crest_foam_additions']) {
      if (!fitted.has(name)) throw Error('Rounded Screen 06 model is missing ' + name);
    }
  }
  for (const texture of [panel, gold]) {
    texture.colorSpace = THREE.NoColorSpace;
    texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
    texture.anisotropy = 8;
  }
  let seats: number[] = [];
  const parts = new Map<Surface, THREE.BufferGeometry[]>();
  const group = new THREE.Group();
  group.name = 'match06';
  const grade = openCrest ? makeCrestGrade06(course) : undefined;
  const liner = rounded ? {
    upper: fitted.get('m06_crest_upper_water')!, soffit: fitted.get('m06_crest_outer_soffit')!
  } : grade ? reconstructOpenCrest06(grade) : undefined;
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse(obj => {
    if (!(obj instanceof THREE.Mesh)) return;
    const surface = obj.userData.surface_family as Surface;
    if (!families.includes(surface) || !obj.geometry.getAttribute('uv')) {
      throw new Error('Invalid Screen 06 Blender export at ' + obj.name);
    }
    if (obj.name === 'RinseWall') seats = obj.userData.seats;
    if (!fitted.has('m06_arched_' + surface)) {
      const geometry = obj.geometry.clone().applyMatrix4(obj.matrixWorld);
      const geometries = parts.get(surface) ?? [];
      const bankReturn = obj.name === 'Left_inner_washer_return' || obj.name === 'Right_inner_washer_return';
      if (grade && (surface === 'water' || surface === 'foam' || surface === 'bank' || bankReturn)) {
        fitCrestGrade06(geometry, grade);
      }
      geometries.push(geometry);
      parts.set(surface, geometries);
    }
    obj.geometry.dispose();
    const sourceMaterials = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const material of sourceMaterials) material.dispose();
  });
  if (seats?.length !== 12) throw new Error('Screen 06 gold seat stations missing');
  for (const family of families) {
    const batch = parts.get(family) ?? [];
    if (rounded && family === 'foam') batch.push(fitted.get('m06_crest_foam_additions')!);
    const geometry = fitted.get('m06_arched_' + family) ?? (batch.length ? mergeGeometries(batch) : null);
    if (!geometry) throw new Error('Cannot batch Screen 06 surface ' + family);
    for (const piece of batch) piece.dispose();
    const material = makeMaterial(panel, family === 'water');
    material.vertexShader = passageVertex;
    material.fragmentShader = passageFragment;
    material.defines = { ['CREST_' + family.toUpperCase()]: 1 };
    if (rounded) material.defines.ROUNDED_CREST = 1;
    material.uniforms.uRingTex.value = gold;
    material.uniforms.uSeats = { value: seats };
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'm06_arched_' + family;
    group.add(mesh);
    if (openCrest && family === 'water') material.defines.OPEN_CREST_WATER = 1;
    if (liner && (family === 'water' || family === (rounded ? 'bank' : 'wall'))) {
      let sectionMaterial = material;
      if (rounded && family === 'water') {
        sectionMaterial = material.clone();
        sectionMaterial.uniforms = material.uniforms;
        sectionMaterial.defines = { ...material.defines, CREST_ROLLED_CAP: 1 };
      }
      const section = new THREE.Mesh(family === 'water' ? liner.upper : liner.soffit, sectionMaterial);
      section.name = family === 'water' ? 'm06_crest_upper_water' : 'm06_crest_outer_soffit';
      group.add(section);
    }

  }
  return group;
}
