/** Final colour grade (display space): saturation / contrast / gentle vignette for the candy look. */
import * as THREE from 'three';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

export function createGradePass(opts: { saturation?: number; contrast?: number; vignette?: number } = {}) {
  return new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      uSat: { value: opts.saturation ?? 1.28 },
      uCon: { value: opts.contrast ?? 1.1 },
      uVig: { value: opts.vignette ?? 0.18 },
    },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse; uniform float uSat; uniform float uCon; uniform float uVig; varying vec2 vUv;
      void main(){
        vec4 c = texture2D(tDiffuse, vUv);
        float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
        vec3 col = mix(vec3(l), c.rgb, uSat);
        col = (col - 0.5) * uCon + 0.5;
        vec2 d = vUv - 0.5; d.x *= 0.75;
        col *= 1.0 - uVig * smoothstep(0.25, 0.75, length(d));
        gl_FragColor = vec4(clamp(col, 0.0, 1.0), c.a);
      }`,
  } as unknown as THREE.ShaderMaterialParameters);
}
