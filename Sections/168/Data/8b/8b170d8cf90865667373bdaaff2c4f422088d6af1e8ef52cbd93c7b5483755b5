/** Authored reflection curves swept across the actual 3D water surface. No image textures. */
import * as THREE from 'three';
import type { Course } from '../world/course';
import measurements from './fit05-data.json';
import { REFERENCE05_FRAME_GLSL, reference05TargetFrame } from './reference05Geometry';
import { FRAG_TAIL, withFog } from './glsl';

type Point = [number, number, number]; // course distance, lateral distance, perpendicular half-width
type Stroke = { id: string; points: Point[]; strength: number; sheen: boolean };
type Band = { coreLeft: number[][]; coreRight: number[][] };
export interface Fit05GlintOptions {
  ampAt: (course: Course, s: number) => number;
  edgeLift: number;
  quality?: 'high' | 'low';
  /** Small normal offset covering the water mesh's interpolation error. */
  lift?: number;
}

function at(points: number[][], s: number): number {
  if (s <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    if (s > points[i][0]) continue;
    const a = points[i - 1], b = points[i], t = (s - a[0]) / Math.max(1e-8, b[0] - a[0]);
    return THREE.MathUtils.lerp(a[1], b[1], t);
  }
  return points[points.length - 1][1];
}

/** The lookup authoring pass split curves at s extrema. Rejoin matching endpoints for a true 2D sweep. */
function joinStrokes(input: Stroke[]): Stroke[] {
  const result: Stroke[] = [];
  for (const source of input) {
    const stroke = { ...source, id: source.id.replace(/_\d+$/, ''), points: source.points.map((p) => [...p] as Point) };
    if (stroke.points.length < 2) continue;
    const previous = result[result.length - 1];
    const a = previous?.points[previous.points.length - 1], b = stroke.points[0];
    if (previous && previous.id === stroke.id && previous.sheen === stroke.sheen && a
      && Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.002) {
      previous.points.push(...stroke.points.slice(1));
    } else result.push(stroke);
  }
  return result;
}

const VERT = /* glsl */ `
attribute vec3 aWater; // s, normalized lateral, amplitude
attribute vec3 aRefPosition;
attribute vec3 aRefNormal;
attribute vec3 aTint; // strength, magenta membership, sheen flag
uniform float uTime;
uniform vec3 uBenny;
varying vec2 vRibbon;
varying vec3 vTint;
varying float vWaterU;
#include <fog_pars_vertex>
${REFERENCE05_FRAME_GLSL}
void main() {
  float s=aWater.x, u=aWater.y;
  float h=aWater.z*(0.6*sin(s*0.9-uTime*2.4+u*1.7)+0.4*sin(s*0.41+uTime*1.5-u*2.3));
  float upright=reference05Weight(s,uBenny.x);
  vec3 p=mix(position+normal*h,aRefPosition+aRefNormal*h,upright);
  vec4 mvPosition=modelViewMatrix*vec4(p,1.0);
  gl_Position=projectionMatrix*mvPosition;
  vRibbon=uv;
  vTint=aTint;
  vWaterU=u;
  #include <fog_vertex>
}`;

const FRAG = /* glsl */ `
varying vec2 vRibbon;
varying vec3 vTint;
varying float vWaterU;
#include <fog_pars_fragment>
void main() {
  if(abs(vWaterU)>1.0) discard;
  float across=abs(vRibbon.x);
  float aa=max(fwidth(vRibbon.x),0.002);
  float ends=smoothstep(0.0,0.025,vRibbon.y)*(1.0-smoothstep(0.975,1.0,vRibbon.y));
  float shoulder=1.0-smoothstep(0.35,1.0,across);
  float core=1.0-smoothstep(0.28-aa,0.66+aa,across);
  vec3 tint=mix(vec3(0.09,1.1,1.45),vec3(1.4,0.12,1.15),vTint.y);
  vec3 color=mix(tint,vec3(2.5,2.7,2.75),core);
  float alpha=(core*0.94+shoulder*0.13)*vTint.x*ends;
  if(vTint.z>0.5) {
    color=vec3(0.08,0.95,1.35);
    alpha=shoulder*vTint.x*0.32*ends;
  }
  if(alpha<0.002) discard;
  gl_FragColor=vec4(color,min(alpha,1.0));
  ${FRAG_TAIL}
}`;

export function createFit05Glints(
  course: Course,
  sharedTime: THREE.IUniform,
  sharedBenny: THREE.IUniform,
  options: Fit05GlintOptions,
): THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial> {
  const data = measurements.near as unknown as { glints: Omit<Stroke, 'sheen'>[]; sheens?: Omit<Stroke, 'sheen'>[]; bands: Band[] };
  const strokes = joinStrokes([
    ...data.glints.map((stroke) => ({ ...stroke, sheen: false })),
    ...(data.sheens ?? []).map((stroke) => ({ ...stroke, sheen: true })),
  ]);
  const position: number[] = [], normal: number[] = [], referencePosition: number[] = [], referenceNormal: number[] = [];
  const uv: number[] = [], water: number[] = [], tint: number[] = [], indices: number[] = [];
  const step = options.quality === 'low' ? 0.18 : 0.10;
  const lift = options.lift ?? 0.025;
  const p = new THREE.Vector3(), n = new THREE.Vector3(), rp = new THREE.Vector3(), rn = new THREE.Vector3();
  for (const stroke of strokes) {
    const controls = stroke.points.filter((v, i, all) => i === 0 || Math.hypot(v[0] - all[i - 1][0], v[1] - all[i - 1][1]) > 1e-7);
    if (controls.length < 2) continue;
    const curve = new THREE.CatmullRomCurve3(controls.map(([s, lat]) => new THREE.Vector3(s, lat, 0)), false, 'centripetal');
    const samples: { t: number; point: THREE.Vector3; width: number; distance: number }[] = [];
    let distance = 0;
    for (let i = 0; i < controls.length - 1; i++) {
      const a = controls[i], b = controls[i + 1];
      const subdivisions = Math.max(2, Math.min(24, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)));
      for (let j = 0; j < subdivisions; j++) {
        const f = j / subdivisions, t = (i + f) / (controls.length - 1), point = curve.getPoint(t);
        if (samples.length) distance += point.distanceTo(samples[samples.length - 1].point);
        samples.push({ t, point, width: THREE.MathUtils.lerp(a[2], b[2], f), distance });
      }
    }
    const endpoint = curve.getPoint(1);
    distance += endpoint.distanceTo(samples[samples.length - 1].point);
    samples.push({ t: 1, point: endpoint, width: controls[controls.length - 1][2], distance });
    const base = position.length / 3;
    for (const sample of samples) {
      const tangent = curve.getTangent(sample.t);
      // A true perpendicular in (s,lateral), including points where ds=0 at a bowed reflection's crest.
      // The core occupies 0.66 of the strip width; reserve the rest for the soft
      // coloured shoulder while preserving the measured white-core footprint.
      const ds = -tangent.y, dl = tangent.x, width = Math.max(0.0001, sample.width / 0.66);
      for (const side of [-1, 0, 1]) {
        const s = sample.point.x + ds * width * side, lat = sample.point.y + dl * width * side;
        const f = course.sample(s), target = reference05TargetFrame(f), halfWidth = course.widthAt(s) / 2;
        const u = lat / halfWidth, surface = options.edgeLift * Math.min(1, Math.abs(u)) ** 3;
        const slope = Math.abs(u) <= 1 ? options.edgeLift * 3 * u * Math.abs(u) / halfWidth : 0;
        n.copy(f.up).addScaledVector(f.right, -slope).normalize();
        rn.copy(target.up).addScaledVector(target.right, -slope).normalize();
        p.copy(f.pos).addScaledVector(f.right, lat).addScaledVector(f.up, surface).addScaledVector(n, lift);
        rp.copy(target.pos).addScaledVector(target.right, lat).addScaledVector(target.up, surface).addScaledVector(rn, lift);
        p.toArray(position, position.length); n.toArray(normal, normal.length);
        rp.toArray(referencePosition, referencePosition.length); rn.toArray(referenceNormal, referenceNormal.length);
        uv.push(side, sample.distance / Math.max(distance, 1e-8));
        water.push(s, u, options.ampAt(course, s));
        let pink = 0;
        if (!stroke.sheen) for (const band of data.bands) {
          if (!band.coreLeft.length || !band.coreRight.length || s < band.coreLeft[0][0] || s > band.coreLeft.at(-1)![0]) continue;
          const left = at(band.coreLeft, s), right = at(band.coreRight, s);
          pink = Math.max(pink, THREE.MathUtils.smoothstep(lat, left - 0.12, left + 0.06)
            * (1 - THREE.MathUtils.smoothstep(lat, right - 0.06, right + 0.12)));
        }
        tint.push(stroke.strength, pink, stroke.sheen ? 1 : 0);
      }
    }
    for (let i = 0; i < samples.length - 1; i++) for (let j = 0; j < 2; j++) {
      const a = base + i * 3 + j, b = a + 3;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  for (const [name, values, size] of [
    ['position', position, 3], ['normal', normal, 3], ['aRefPosition', referencePosition, 3],
    ['aRefNormal', referenceNormal, 3], ['uv', uv, 2], ['aWater', water, 3], ['aTint', tint, 3],
  ] as [string, number[], number][]) geometry.setAttribute(name, new THREE.Float32BufferAttribute(values, size));
  geometry.setIndex(indices); geometry.computeBoundingSphere();
  const uniforms = withFog({ uTime: sharedTime, uBenny: sharedBenny });
  // Preserve shared uniform identity after UniformsUtils.merge inside withFog.
  uniforms.uTime = sharedTime; uniforms.uBenny = sharedBenny;
  const material = new THREE.ShaderMaterial({
    uniforms, vertexShader: VERT, fragmentShader: FRAG, transparent: true,
    depthTest: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.NormalBlending,
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1, fog: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'fit05_authored_glints'; mesh.frustumCulled = false;
  mesh.userData.fit05 = { sourceStrokes: data.glints.length + (data.sheens?.length ?? 0), strips: strokes.length,
    vertices: position.length / 3, triangles: indices.length / 3, lift, frozenReferenceTime: 12 };
  return mesh;
}
