import * as THREE from 'three';

// The near and far water edges were traced independently on the 864 × 1536 original.
// Coordinates register the cut once against the archived opening camera. Afterwards every
// vertex belongs to the stationary washer, including the return behind the rolled edge.
const lip = [
  [297, 624, 632], [310, 601, 652], [338, 585, 669], [364, 578, 677],
  [404, 575, 683], [459, 587, 696], [506, 608, 711], [558, 639, 729],
  [594, 657, 733], [623, 672, 727], [656, 685, 719], [681, 697, 708]
];
const eye = new THREE.Vector3(1.7205354776162962, -35.369414293064274, -132.64401919037763);
const horizontal = new THREE.Vector3(.9808381362, 0, -.1948244098);
const vertical = new THREE.Vector3(-.0369568501, .9818434296, -.1860582461);
const forward = new THREE.Vector3(-.1912870667, -.1896931198, -.9630294795);
const focalLength = 768 / Math.tan(31 * Math.PI / 180);
type Point = { p: THREE.Vector3, uv: THREE.Vector2, x: number, y: number, z: number };
type Edge = (v: Point) => number;
type Surface = { coordinates: number[], texcoords: number[] };
function sample(p: THREE.Vector3, uv: THREE.Vector2): Point {
  const d = p.clone().sub(eye), z = d.dot(forward);
  return { p, uv, z, x: 432*z + focalLength*d.dot(horizontal), y: 768*z - focalLength*d.dot(vertical) };
}
function polygonSplit(polygon: Point[], edge: Edge) {
  const inside: Point[] = [], outside: Point[] = [];
  for(let i=0; i<polygon.length; i++) {
    const a=polygon[i], b=polygon[(i+1)%polygon.length], da=edge(a), db=edge(b);
    (da>=0 ? inside : outside).push(a);
    if ((da>=0) !== (db>=0)) {
      const t=da/(da-db);
      const hit=sample(a.p.clone().lerp(b.p,t),a.uv.clone().lerp(b.uv,t));
      inside.push(hit); outside.push(hit);
    }
  }
  return {inside,outside};
}
function append(target: Surface, polygon: Point[]) {
  for(let i=1;i<polygon.length-1;i++) for(const v of [polygon[0],polygon[i],polygon[i+1]]) {
    target.coordinates.push(v.p.x,v.p.y,v.p.z); target.texcoords.push(v.uv.x,v.uv.y);
  }
}
function geometry(s: Surface) {
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(s.coordinates,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(s.texcoords,2));
  geo.computeVertexNormals();
  return geo;
}
function edgeLine(x0: number, y0: number, x1: number, y1: number, sign: number): Edge {
  const m=(y1-y0)/(x1-x0), b=y0-m*x0;
  return v => sign * (v.y - m*v.x - b*v.z);
}
function drawReturn(v: Point, upper: number, lower: number) {
  const progress=THREE.MathUtils.clamp((v.y/v.z-upper)/(lower-upper),0,1);
  // Inboard return leans forward under the far ribbon. The shallow lower shelf carries
  // wet contact across the crease; the slotted backing is recessed behind its rolled lip.
  const across=(v.x/v.z-lip[0][0])/(lip[lip.length-1][0]-lip[0][0]);
  const recess=(.65+2.2*(1-progress))*(.42+.58*Math.sin(Math.PI*across));
  const p=v.p.clone().addScaledVector(v.p.clone().sub(eye).normalize(),recess);
  const metric=new THREE.Vector2(p.clone().sub(eye).dot(horizontal)/14, p.clone().sub(eye).dot(forward));
  return {wall:sample(p,metric), depth:recess};
}
export function carveOpenCrest06(source: THREE.BufferGeometry) {
  const water: Surface={coordinates:[],texcoords:[]}, wall: Surface={coordinates:[],texcoords:[]};
  const rim: Surface={coordinates:[],texcoords:[]}, wet: Surface={coordinates:[],texcoords:[]};
  const pos=source.getAttribute('position'), uv=source.getAttribute('uv');
  const vtx=Array.from({length:pos.count},(_,i)=>sample(new THREE.Vector3().fromBufferAttribute(pos,i),new THREE.Vector2(uv.getX(i),uv.getY(i))));
  const strips=lip.slice(0,-1).map(([x0,y0,l0],i)=>{
    const [x1,y1,l1]=lip[i+1];
    const top=edgeLine(x0,y0,x1,y1,1), bottom=edgeLine(x0,l0,x1,l1,-1);
    return { x0,x1,y0,y1,l0,l1,top,bottom,edges:[(v:Point)=>v.x-x0*v.z,(v:Point)=>x1*v.z-v.x,top,bottom,(v:Point)=>16.5-v.z] };
  });
  const count=source.index?.count ?? pos.count;
  for(let i=0;i<count;i+=3) {
    const abc=[0,1,2].map(j=>vtx[source.index?.getX(i+j)??(i+j)]);
    if(abc.every(v=>v.z<4) || abc.every(v=>v.z>16.5) || abc.every(v=>v.y/v.z<568) || abc.every(v=>v.y/v.z>740)) {
      append(water,abc); continue;
    }
    let rest=[abc];
    for(const s of strips) {
      const next: Point[][]=[];
      for(const tri of rest) {
        if(tri.every(v=>v.x < s.x0*v.z-.0001) || tri.every(v=>v.x > s.x1*v.z+.0001)) {next.push(tri);continue;}
        let part=tri;
        for(const edge of s.edges) {
          const split=polygonSplit(part,edge);
          if(split.outside.length>=3) next.push(split.outside);
          part=split.inside; if(part.length<3) break;
        }
        if(part.length<3) continue;
        const rear=part.map(v=>{
          const t=(v.x/v.z-s.x0)/(s.x1-s.x0);
          return drawReturn(v,THREE.MathUtils.lerp(s.y0,s.y1,t),THREE.MathUtils.lerp(s.l0,s.l1,t)).wall;
        });
        append(wall,rear);
        // The real course travels across the lower return. A clear shallow surface preserves
        // the wet ride and reveals the submerged perforations with depth and parallax.
        append(wet,part.map(v=>sample(v.p.clone().addScaledVector(vertical,-.085),v.uv.clone())));
        for(let n=0;n<part.length;n++){
          const k=(n+1)%part.length, a=part[n], b=part[k];
          const on=(e:Edge)=>Math.abs(e(a)/a.z)<.001 && Math.abs(e(b)/b.z)<.001;
          if(!on(s.top) && !on(s.bottom) &&
             !(s===strips[0] && on(s.edges[0])) && !(s===strips[strips.length-1] && on(s.edges[1]))) continue;
          const outer=[a,b], inner=[rear[n],rear[k]];
          // Narrow rolled wet edge at the two visible sills, then slotted metal lining the recess.
          const rolls=outer.map((v,j)=>sample(v.p.clone().lerp(inner[j].p,.16),new THREE.Vector2(.9,v.uv.y)));
          append(rim,[a,b,rolls[1],rolls[0]]);
          append(wall,[rolls[0],rolls[1],inner[1],inner[0]]);
        }
      }
      rest=next;
    }
    for(const poly of rest) append(water,poly);
  }
  return {water:geometry(water),wall:geometry(wall),rim:geometry(rim),wet:geometry(wet)};
}

