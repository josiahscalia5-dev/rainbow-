# Subagent agent-ac8dcef8e7b76b5b4 — session eae80a1c-be41-5f1a-858b-469afcc249da

### 🧑 User — 2026-11-15T19:18:28.640Z

You are the foam-bubbles-particles specialist for RAINBOW, the user's real-time 3D portrait mobile game (Three.js r170 + TypeScript + Vite) in /home/user/rainbow- (git branch `ccr-8b6fc834-7kd55l`). You take over the foam/bubble/splash work that the water-fx-specialist started in wave 1 (cut off at 18:55 UTC while making "the berm: larger bubble cells, CPU-baked bubble domes for a lumpy silhouette, distance fade, whiter puffs"). Those edits are saved in src/vfx/foam.ts, src/vfx/riderSplash.ts and src/vfx/bubbles.ts. Keep what works.

READ FIRST: CLAUDE.md, qa/pilot05/COORDINATION.md (file ownership and rules; obey strictly, four other specialists edit the same tree in parallel), qa/scene_comparisons.md section "### 05" (5.7 is your target), and the Screen 05 section of Rainbow_Claude_Code_Master_Prompt_11_Screens.md. Look at references/05_flow_into_the_current.png and qa/pilot05/05_ref_before_partial.png (reference | before | current partial) with the Read tool.

YOUR FILES ONLY: src/vfx/foam.ts, src/vfx/bubbles.ts, src/vfx/riderSplash.ts, src/vfx/spray.ts, src/vfx/index.ts, plus ONLY the lines in src/game/Game.ts that feed VFX with Benny's position (wake/splash/foam anchors). The path-camera engineer may also edit the camera/checkpoint table in Game.ts: re-read before each edit and change only your lines.

BUG #1 (fix first): a WHITE JAGGED BAND / white haze plus a pattern of large blue dots across the bottom of the frame under Benny (clearly visible in qa/pilot05/05_partial_f2a86ab.png). The Benny artist diagnosed it at 18:54: "The white jagged band is new. Likely the water wake/spray emitted at `benny.root.position` (now 0.3 below his lifted body centre)". Benny now rides higher (ride-height lift in src/characters/benny/runtime.ts). Find the real cause (the rider splash crown, wake, spray or foam), fix the anchor so splash/wake sit at the WATER LINE, and check 03, 04 and 07 too (the band also appeared in 03).
TARGETS (reference 05):
* Foam: soft CLOUD BANKS of white-lavender clumps (#FCF6FF, 10–40 px puffs with soft lavender shading) hugging both edges of the stream from y≈540 to y≈1300. Not a flat white strip, not uniform spheres or "sugar grains".
* Splash: a V-shaped spray fan of white/cyan droplets fanning back from Benny's base (≈180–680 × 1080–1260 px in the ref), not a white haze.
* Bubbles: ≈18 large iridescent bubbles (25–65 px) at the SIDES of the tube plus ≈25 small ones. None over the path or over Benny's hat. The current dozens of tiny bubbles everywhere are wrong.
Keep mobile budgets: instanced, few draw calls, no per-frame allocations.

METHOD: measure → change → capture. Capture: `node scripts/capture.mjs 05 --out=qa/pilot05/foam` (the real WebGL game). Side-by-side: `python3 scripts/triptych.py OUT.png 900 "REF=references/05_flow_into_the_current.png" "NOW=qa/pilot05/foam/05.png"`. Crop and zoom on the bottom third and the banks to judge. Other specialists are changing the walls, water, camera and Benny at the same time, so judge only your elements. Regression-capture 03, 04, 06, 07 and 09 (they use foam, bubbles or the splash) into qa/pilot05/foam/.

FINISH: `npm run typecheck` passes, `npm run test:continuity` stays ok. Write qa/pilot05/foam/NOTES.md (root cause of the band, changes by file:function, before/after evidence, what is left). Do not commit or push. Report a short summary with the capture paths and remaining differences. Be honest.

### 🤖 Claude — 2026-11-15T19:18:29.973Z

I'll start by reading the coordination rules, brief sections, and the current state of my files.

### 🤖 Claude — 2026-11-15T19:18:30.814Z

> 🔧 **Bash** `{"command": "git status --short | head -50 && git log --oneline | head -10 && cat qa/pilot05/COORDINATION.md", "description": "Show git status, recent commits, and coordination rules"}`

### 🧑 User — 2026-11-15T19:18:30.844Z

> ↩︎ result: M backups/BACKUP_LOG.md
>  M backups/BACKUP_STATUS.json
>  M qa/capture_log.json
> ?? qa/pilot05/
> ?? scripts/triptych.py
> 4f33276 autosave: Rainbow 2026-11-15 19:15 UTC
> ecbd15f autosave test: account 3 recovery on ccr-8b6fc834-7kd55l
> f2a86ab autosave: Rainbow 2026-11-15 19:07 UTC
> 18453dc autosave: Rainbow 2026-11-15 19:01 UTC
> ca18522 autosave: Rainbow 2026-11-15 18:56 UTC
> 428d3fb autosave: Rainbow 2026-11-15 18:54 UTC
> f1eb5a4 Snapshot: specialist work in progress
> 70b100d autosave: Rainbow 2026-11-15 18:54 UTC
> a428010 Record latest autosave status rows
> fc70e56 full snapshot: game, design agents, specialist work in progress, docs, transcripts
> # Screen 05 pilot: specialist coordination (wave 2, account 3)
> 
> Started 2026-11-15 ~19:20 UTC on branch `ccr-8b6fc834-7kd55l` (from `f2a86ab`). The coordinator is the main Claude session.
> Wave 1 (account 2, 18:36–18:58 UTC) was cut off by the usage limit. Its edits were saved by autosave and are **kept**:
> the straight 05 tube axis, the wider stream, the new rider splash, the foam berm and Benny's proportions/lift.
> 
> ## Evidence
> * `05_before_81e639e.png`: live game before any specialist work (original account)
> * `05_partial_f2a86ab.png`: live game with w …[+1940 chars]

### 🤖 Claude — 2026-11-15T19:18:32.751Z

> 🔧 **Bash** `{"command": "ls qa/pilot05/ && ls src/vfx/ && wc -l src/vfx/*.ts src/game/Game.ts && cat qa/pilot05/REQUESTS.md 2>/dev/null", "description": "List pilot05 files and vfx sources with line counts"}`

### 🧑 User — 2026-11-15T19:18:32.795Z

> ↩︎ result: Exit code 1
> 05_before_81e639e.png
> 05_partial_f2a86ab.png
> 05_ref_before_partial.png
> COORDINATION.md
> benny
> camera
> environment
> foam
> qa
> water
> bubbles.ts
> drumWater.ts
> finalWave.ts
> foam.ts
> glsl.ts
> index.ts
> puddles.ts
> riderSplash.ts
> spray.ts
> waterRibbon.ts
> whirlpool.ts
>    261 src/vfx/bubbles.ts
>    239 src/vfx/drumWater.ts
>    183 src/vfx/finalWave.ts
>    388 src/vfx/foam.ts
>    104 src/vfx/glsl.ts
>    204 src/vfx/index.ts
>    119 src/vfx/puddles.ts
>    147 src/vfx/riderSplash.ts
>     93 src/vfx/spray.ts
>    406 src/vfx/waterRibbon.ts
>    199 src/vfx/whirlpool.ts
>    618 src/game/Game.ts
>   2961 total

### 🤖 Claude — 2026-11-15T19:18:33.497Z

> 🔧 **Grep** `{"pattern": "### 05", "path": "/home/user/rainbow-/qa/scene_comparisons.md", "output_mode": "content", "-n": true}`

### 🧑 User — 2026-11-15T19:18:33.538Z

> ↩︎ result: 242:### 05 · FLOW INTO THE CURRENT (interactive): pilot screen, detailed

### 🤖 Claude — 2026-11-15T19:18:34.995Z

> 🔧 **Read** `{"file_path": "/home/user/rainbow-/qa/scene_comparisons.md", "offset": 242, "limit": 90}`

### 🧑 User — 2026-11-15T19:18:35.009Z

> ↩︎ result: 242	### 05 · FLOW INTO THE CURRENT (interactive): pilot screen, detailed
> 243	
> 244	`references/05_flow_into_the_current.png` vs `screenshots/05.png` (`qa/05_side_by_side.png`). Live state at capture:
> 245	stage 05, s=144.18, coins 1,420, hearts 5, cam (4.75, −37.93, −79.82). Live rig at `81e639e` (`STAGE_CAM['05']`):
> 246	back 6.4, up 4.1, ahead 18, lookUp 1.8, vFOV 62, latFollow 0.6, roll 0.5.
> 247	
> 248	Verdict: the HUD values and the general ingredients are right. The geometry reads as a bending spring of orange pipes in a blue-lilac tube, where the reference is a **straight** magenta tube with concentric gold bands and a meandering water floor. Benny sits too low and is seen too steeply.
> 249	
> 250	#### 5.1 Camera, height and vanishing point
> 251	
> 252	| | Reference | Live |
> 253	|---|---|---|
> 254	| VP | **(498, 479) = 57.6% x / 31.2% y** (measured). Every ring is concentric about it. | Brightest point (471, 478) lies in a white glare band (y≈500–700). Rings are **not** concentric, so there is no single VP. |
> 255	| Pitch | Implied at vFOV 62°: view axis ≈12.7° below the tube axis, ≈3° left of it | Stream and coin line **climb** toward the upper centre; the view looks up a rising, bending …[+7044 chars]

### 🤖 Claude — 2026-11-15T19:18:35.940Z

> 🔧 **Bash** `{"command": "ls -la qa/pilot05/foam qa/pilot05/water qa/pilot05/benny qa/pilot05/camera qa/pilot05/environment qa/pilot05/qa 2>&1 | head -60", "description": "List contents of pilot05 subfolders"}`

### 🧑 User — 2026-11-15T19:18:35.968Z

> ↩︎ result: qa/pilot05/benny:
> total 8
> drwxr-xr-x 2 root root 4096 Nov 15 19:17 .
> drwxr-xr-x 8 root root 4096 Nov 15 19:17 ..
> 
> qa/pilot05/camera:
> total 8
> drwxr-xr-x 2 root root 4096 Nov 15 19:17 .
> drwxr-xr-x 8 root root 4096 Nov 15 19:17 ..
> 
> qa/pilot05/environment:
> total 12
> drwxr-xr-x 3 root root 4096 Nov 15 19:18 .
> drwxr-xr-x 8 root root 4096 Nov 15 19:17 ..
> drwxr-xr-x 2 root root 4096 Nov 15 19:18 iter00
> 
> qa/pilot05/foam:
> total 8
> drwxr-xr-x 2 root root 4096 Nov 15 19:17 .
> drwxr-xr-x 8 root root 4096 Nov 15 19:17 ..
> 
> qa/pilot05/qa:
> total 8
> drwxr-xr-x 2 root root 4096 Nov 15 19:17 .
> drwxr-xr-x 8 root root 4096 Nov 15 19:17 ..
> 
> qa/pilot05/water:
> total 8
> drwxr-xr-x 2 root root 4096 Nov 15 19:17 .
> drwxr-xr-x 8 root root 4096 Nov 15 19:17 ..

### 🤖 Claude — 2026-11-15T19:18:37.013Z

> 🔧 **Read** `{"file_path": "/home/user/rainbow-/qa/pilot05/05_ref_before_partial.png"}`

### 🧑 User — 2026-11-15T19:18:37.240Z

> ↩︎ result: [image]

### 🤖 Claude — 2026-11-15T19:18:37.464Z

> 🔧 **Read** `{"file_path": "/home/user/rainbow-/qa/pilot05/05_partial_f2a86ab.png"}`

### 🧑 User — 2026-11-15T19:18:37.606Z

> ↩︎ result: [image]

### 🤖 Claude — 2026-11-15T19:18:39.691Z

Now let me read my files.

### 🤖 Claude — 2026-11-15T19:18:40.149Z

> 🔧 **Read** `{"file_path": "/home/user/rainbow-/src/vfx/foam.ts"}`

### 🧑 User — 2026-11-15T19:18:40.176Z

> ↩︎ result: 1	/**
> 2	 * Foam banks along the stream (refs 03–10) + whirlpool rim foam.
> 3	 *  - berm: ONE continuous lumpy lather bank per side, swept along the course (custom shader:
> 4	 *    two-scale cellular soap bubbles with derivative bump lighting, lavender crevices, pores,
> 5	 *    faint iridescent rim). This is what makes the banks read as continuous foam, not cotton balls.
> 6	 *  - puffs: instanced bubble puffs sitting ON the berm crest (silhouette lumps), in ~40-unit chunks
> 7	 *    so only chunks near Benny are drawn; quality 'low' halves density and uses 20-tri puffs.
> 8	 *  - foam rings on the whirlpool rim and along its spiral bands (rotating with the swirl)
> 9	 */
> 10	import * as THREE from 'three';
> 11	import { type Course, WORLD, funnelY } from '../world/course';
> 12	import { EDGE_LIFT } from './waterRibbon';
> 13	import { SPIRAL_C, FUNNEL_LIFT } from './whirlpool';
> 14	import { FRAG_FX_GLSL, FRAG_TAIL, NOISE_GLSL, withFog } from './glsl';
> 15	
> 16	interface Puff { p: THREE.Vector3; r: number; c: number }
> 17	
> 18	// ---------------------------------------------------------------------------------- berm profile
> 19	/** berm spans e ∈ [BERM_IN, BERM_OUT] units outward from the ribbon edge (negat …[+16088 chars]

### 🤖 Claude — 2026-11-15T19:18:40.562Z

> 🔧 **Read** `{"file_path": "/home/user/rainbow-/src/vfx/riderSplash.ts"}`

### 🧑 User — 2026-11-15T19:18:40.573Z

> ↩︎ result: 1	/**
> 2	 * Rider splash crown: a thin animated water sheet that flares out of the surface around Benny's
> 3	 * waterline (ref 05: white splash/wake fanning out to both sides and backwards).
> 4	 *
> 5	 * One small mesh (polar grid: angle × radial), shaped and animated entirely in the vertex shader,
> 6	 * and drawn with a translucent "finger + lace" fragment shader. It is placed every frame at the
> 7	 * computed water surface under Benny (index.ts `wake()`), so it always sits exactly on the stream
> 8	 * that carries him. Hidden automatically when wake() stops being called (intro / outro).
> 9	 */
> 10	import * as THREE from 'three';
> 11	import { FRAG_TAIL, NOISE_GLSL, withFog } from './glsl';
> 12	
> 13	const VERT = /* glsl */ `
> 14	attribute vec2 aPolar;   // x = angle (0 = straight behind Benny, ±pi = in front), y = radial 0..1
> 15	uniform float uTime;
> 16	uniform float uR;        // waterline radius of Benny's body (units)
> 17	uniform float uStrength; // 0..1
> 18	varying vec2 vPolar;
> 19	varying float vSide;
> 20	varying vec3 vPosW;
> 21	#include <fog_pars_vertex>
> 22	float h1(float n) { return fract(sin(n) * 43758.5453); }
> 23	float n1(float x) { float i = floor(x); float f = fract(x); f = f * f * (3.0 - 2. …[+5000 chars]

### 🤖 Claude — 2026-11-15T19:18:41.005Z

> 🔧 **Read** `{"file_path": "/home/user/rainbow-/src/vfx/bubbles.ts"}`

### 🧑 User — 2026-11-15T19:18:41.015Z

> ↩︎ result: 1	/**
> 2	 * Iridescent soap bubbles.
> 3	 *  - big bubbles: InstancedMesh spheres with a thin-film shader (rainbow Fresnel rim, white
> 4	 *    window highlight, nearly clear centre) — pooled around Benny (focusS) or the Drum A volume
> 5	 *  - small bubbles: one THREE.Points draw of hundreds of tiny ring-sprite bubbles hugging the water
> 6	 * Bubbles drift with the flow, rise, wobble, and are respawned ahead when left behind.
> 7	 */
> 8	import * as THREE from 'three';
> 9	import { type Course, WORLD } from '../world/course';
> 10	import { FRAG_TAIL, NOISE_GLSL, withFog } from './glsl';
> 11	
> 12	const BIG_VERT = /* glsl */ `
> 13	attribute float aSeed;
> 14	varying vec3 vPosW;
> 15	varying vec3 vNormalW;
> 16	varying float vSeed;
> 17	#include <fog_pars_vertex>
> 18	void main() {
> 19	  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
> 20	  vPosW = wp.xyz;
> 21	  vNormalW = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
> 22	  vSeed = aSeed;
> 23	  vec4 mvPosition = viewMatrix * wp;
> 24	  gl_Position = projectionMatrix * mvPosition;
> 25	  #include <fog_vertex>
> 26	}
> 27	`;
> 28	const BIG_FRAG = /* glsl */ `
> 29	uniform float uTime;
> 30	uniform vec3 uLightDir;
> 31	varying vec3 vPosW;
> 32	varying vec3 v …[+10489 chars]

### 🤖 Claude — 2026-11-15T19:18:41.407Z

> 🔧 **Read** `{"file_path": "/home/user/rainbow-/src/vfx/spray.ts"}`

### 🧑 User — 2026-11-15T19:18:41.424Z

> ↩︎ result: 1	/**
> 2	 * Spray droplets: one pooled THREE.Points draw for Benny's wake fans, landing splashes, the
> 3	 * final-wave crest spray and spout splashes. Simple ballistic CPU sim (gravity along -Y).
> 4	 */
> 5	import * as THREE from 'three';
> 6	import { FRAG_TAIL, withFog } from './glsl';
> 7	
> 8	const VERT = /* glsl */ `
> 9	attribute float aSize;
> 10	attribute float aAlpha;
> 11	uniform float uScale;
> 12	varying float vAlpha;
> 13	#include <fog_pars_vertex>
> 14	void main() {
> 15	  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
> 16	  gl_PointSize = clamp(aSize * uScale / -mvPosition.z, 1.0, 48.0);
> 17	  vAlpha = aAlpha;
> 18	  gl_Position = projectionMatrix * mvPosition;
> 19	  #include <fog_vertex>
> 20	}
> 21	`;
> 22	const FRAG = /* glsl */ `
> 23	varying float vAlpha;
> 24	#include <fog_pars_fragment>
> 25	void main() {
> 26	  vec2 c = gl_PointCoord - 0.5;
> 27	  float d = length(c) * 2.0;
> 28	  if (d > 1.0) discard;
> 29	  float body = 1.0 - smoothstep(0.6, 1.0, d);
> 30	  float hl = smoothstep(0.35, 0.0, length(c - vec2(-0.15, -0.15)));
> 31	  vec3 col = mix(vec3(0.75, 0.95, 1.0), vec3(1.0), 0.5 + 0.5 * hl) * 1.25;
> 32	  gl_FragColor = vec4(col, body * vAlpha * 0.9);
> 33	  ${FRAG_TAIL}
> 34	}
> 35	`;
> 36	
> 37	export interfa …[+2526 chars]

### 🤖 Claude — 2026-11-15T19:18:41.760Z

> 🔧 **Read** `{"file_path": "/home/user/rainbow-/src/vfx/index.ts"}`

### 🧑 User — 2026-11-15T19:18:41.808Z

> ↩︎ result: 1	/**
> 2	 * Rainbow water system (water-fx-specialist + foam-bubbles-particles).
> 3	 *
> 4	 *   const water = createWater(course, { quality: 'high' });
> 5	 *   scene.add(water.group);
> 6	 *   // per frame:
> 7	 *   water.update(time, dt, bennyS, camera);
> 8	 *   water.wake(bennyPos, forward, right, speed, dt);
> 9	 *   // cinematic controls (0..1): water.controls.drumSwirl / drumAgitation / outro
> 10	 *
> 11	 * Benny rides ON the water: place his body centre at
> 12	 *   course.pointAt(s, lateral, water.surfaceHeight(s, lateral, time) + BENNY_RIDE_OFFSET)
> 13	 * (BENNY_RIDE_OFFSET ≈ 0.55 for a 0.8-radius body: bottom third in the water, splash visible).
> 14	 */
> 15	import * as THREE from 'three';
> 16	import { type Course, WORLD, funnelY } from '../world/course';
> 17	import { createRibbon } from './waterRibbon';
> 18	import { createWhirlpool, whirlpoolHeight, FUNNEL_LIFT } from './whirlpool';
> 19	import { createDrumWater } from './drumWater';
> 20	import { createFinalWave } from './finalWave';
> 21	import { createPuddles } from './puddles';
> 22	import { createFoam } from './foam';
> 23	import { createBubbles } from './bubbles';
> 24	import { createSpray } from './spray';
> 25	import { createRiderSplash } from './ride …[+9986 chars]

### 🤖 Claude — 2026-11-15T19:18:45.231Z

Now Game.ts's VFX lines and Benny's runtime (ride-height lift).

### 🤖 Claude — 2026-11-15T19:18:46.479Z

> 🔧 **Grep** `{"pattern": "water\\.|wake|splash|BENNY_RIDE_OFFSET|rideLift|RIDE|lift", "path": "/home/user/rainbow-/src/game/Game.ts", "output_mode": "content", "-n": true}`

### 🧑 User — 2026-11-15T19:18:46.500Z

> ↩︎ result: 83:  scene.add(water.group);
> 91:  if (hidden.has('water')) water.group.visible = false;
> 153:    const h = water.surfaceHeight(s, lat, time);
> 224:      // the swirl lifts him toward the middle of the drum while he tumbles (ref 02), then he drops to the drain
> 338:      water.splash(benny.root.position, course.sample(st.s).up, 1);
> 363:    water.wake(pose.pos, f.tan, f.right, speed, dt);
> 366:    // towel: folded in 08/09, lifted into a tent as the stream reaches it (late 09 → 10)
> 495:    water.update(time, dt, st.s, camera);

### 🤖 Claude — 2026-11-15T19:18:47.585Z

> 🔧 **Grep** `{"pattern": "lift|LIFT|rideHeight|RIDE|root\\.position|body\\.position", "path": "/home/user/rainbow-/src/characters/benny", "output_mode": "content", "-n": true}`

### 🧑 User — 2026-11-15T19:18:47.614Z

> ↩︎ result: src/characters/benny/runtime.ts:40: * lifted inside the root so he sits ON the water like refs 04–10: only the bottom ≈ 0.1 of the fur and
> src/characters/benny/runtime.ts:43:export const BENNY_RIDE_LIFT = 0.3;
> src/characters/benny/runtime.ts:44:/** QA A/B hook: `?bennyLift=<units>` overrides the ride lift (e.g. 0 = the game's raw placement) */
> src/characters/benny/runtime.ts:46:  if (typeof location === 'undefined') return BENNY_RIDE_LIFT;
> src/characters/benny/runtime.ts:48:  return Number.isFinite(v) ? THREE.MathUtils.clamp(v, 0, 0.6) : BENNY_RIDE_LIFT;
> src/characters/benny/runtime.ts:117:  let lift = 0;
> src/characters/benny/runtime.ts:118:  const liftMax = rideLift();
> src/characters/benny/runtime.ts:137:    // ride height (see BENNY_RIDE_LIFT): eased so mode switches never pop
> src/characters/benny/runtime.ts:138:    const liftTarget = tumble || peek ? 0 : liftMax * THREE.MathUtils.smoothstep(swim, 0.5, 0.9);
> src/characters/benny/runtime.ts:139:    lift += (liftTarget - lift) * (1 - Math.exp(-dt * 7));
> src/characters/benny/runtime.ts:140:    scene.position.y = lift;
> src/characters/benny/benny-lab.ts:13:import { BENNY_RIDE_LIFT, createBennyRuntime, loadBenny } from './runtime';
> src …[+593 chars]

### 🤖 Claude — 2026-11-15T19:18:49.149Z

> 🔧 **Read** `{"file_path": "/home/user/rainbow-/src/game/Game.ts", "offset": 130, "limit": 250}`

### 🧑 User — 2026-11-15T19:18:49.168Z

> ↩︎ result: 130	    basin: ['02', '05'],
> 131	    tubes: ['03', '09'],
> 132	    chamber: ['07', '11'],
> 133	  };
> 134	  const updateZones = () => {
> 135	    const i = STAGE_ORDER.indexOf(st.stage);
> 136	    for (const [k, [a, b]] of Object.entries(zoneRanges)) {
> 137	      env.zones[k as keyof typeof env.zones].visible = !zoneHidden(k) && i >= STAGE_ORDER.indexOf(a) && i <= STAGE_ORDER.indexOf(b);
> 138	    }
> 139	    const inDrum = i <= 1;
> 140	    fog.density = inDrum ? 0.0015 : i >= 7 ? 0.0025 : 0.0035;
> 141	  };
> 142	
> 143	  // girl placement helpers (she lives in laundry-room local frames)
> 144	  const placeGirl = (room: 'A' | 'C', local: THREE.Vector3, yaw: number) => {
> 145	    const anchor = room === 'A' ? env.roomA.anchor : env.roomC.anchor;
> 146	    if (girl.root.parent !== anchor) anchor.add(girl.root);
> 147	    girl.root.position.copy(local);
> 148	    girl.root.rotation.set(0, yaw, 0);
> 149	  };
> 150	
> 151	  const bennyPose = (s: number, lat: number, time: number, out: { pos: THREE.Vector3; quat: THREE.Quaternion }) => {
> 152	    const f = course.sample(s);
> 153	    const h = water.surfaceHeight(s, lat, time);
> 154	    out.pos.copy(f.pos).addScaledVector(f.right, lat).addScaledVector(f.up, h + benny.radius …[+12449 chars]

### 🤖 Claude — 2026-11-15T19:18:49.677Z

> 🔧 **Read** `{"file_path": "/home/user/rainbow-/src/characters/benny/runtime.ts", "offset": 30, "limit": 130}`

### 🧑 User — 2026-11-15T19:18:49.697Z

> ↩︎ result: 30	
> 31	export async function loadBenny(opts: { furQuality?: 'high' | 'low' } = {}): Promise<BennyRuntime> {
> 32	  const src = await loadScene();
> 33	  const clips: THREE.AnimationClip[] = src.userData.animations ?? [];
> 34	  return createBennyRuntime(src.clone(true), clips, { furQuality: opts.furQuality ?? defaultFurQuality() });
> 35	}
> 36	
> 37	/**
> 38	 * Ride height. The game places the root at water surface + radius·0.55 (≈ 0.44), which buried the lower
> 39	 * third of the plush ball in the opaque stream. While riding (swim ≥ 0.5, not tumbling) the model is
> 40	 * lifted inside the root so he sits ON the water like refs 04–10: only the bottom ≈ 0.1 of the fur and
> 41	 * the kicking feet are under the surface. Cinematics (01 peek, 02 tumble, 11 hide) keep the root as placed.
> 42	 */
> 43	export const BENNY_RIDE_LIFT = 0.3;
> 44	/** QA A/B hook: `?bennyLift=<units>` overrides the ride lift (e.g. 0 = the game's raw placement) */
> 45	function rideLift(): number {
> 46	  if (typeof location === 'undefined') return BENNY_RIDE_LIFT;
> 47	  const v = parseFloat(new URLSearchParams(location.search).get('bennyLift') ?? '');
> 48	  return Number.isFinite(v) ? THREE.MathUtils.clamp(v, 0, 0.6) : BENNY_RIDE_LIFT;
> 4 …[+4678 chars]

### 🤖 Claude — 2026-11-15T19:18:59.042Z

> 🔧 **Bash** `{"command": "sed -n 1,80p scripts/capture.mjs && grep -n \"uBenny\\|uBennyR\\|wake\" src/vfx/waterRibbon.ts | head -40", "description": "Read capture script and ribbon wake usage"}`

### 🧑 User — 2026-11-15T19:18:59.073Z

> ↩︎ result: #!/usr/bin/env node
> // Playwright capture of the REAL running game (WebGL) at the native reference sizes.
> //   node scripts/capture.mjs                 → screenshots/01.png … 11.png (+ qa/capture_log.json)
> //   node scripts/capture.mjs 03 07           → only those
> //   node scripts/capture.mjs --plunge        → qa/continuity/07a…07d.png descent proof frames
> //   node scripts/capture.mjs --size=1080x1920 → extra Android-size set into screenshots/1080x1920/
> //   node scripts/capture.mjs --out=DIR       → custom output dir
> import { mkdirSync, writeFileSync } from 'node:fs';
> import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';
> 
> const args = process.argv.slice(2);
> const opt = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
> let ids = args.filter((a) => !a.startsWith('--'));
> const NATIVE = { '03': [727, 1536] };
> const plunge = ['07a_plunge_top', '07b_plunge_mid', '07c_plunge_bottom', '07d_entering_08'];
> if (opt.plunge) ids = plunge;
> if (!ids.length) ids = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];
> const size = typeof opt.size === 'string' ? opt.size.split(' …[+3456 chars]

### 🤖 Claude — 2026-11-15T19:19:01.566Z

The capture script supports `--q=` for extra query params, so I can use `?waterhide=` for isolation. Let me take a baseline capture plus isolation captures (hide crown, spray, bubbles, foam).

### 🤖 Claude — 2026-11-15T19:19:02.777Z

> 🔧 **Bash** `{"command": "mkdir -p qa/pilot05/foam/iso && timeout 600 node scripts/capture.mjs 05 --out=qa/pilot05/foam/iso/base 2>&1 | tail -5", "description": "Capture baseline screen 05 from the live game", "timeout": 620000}`

### 🧑 User — 2026-11-15T19:19:18.394Z

> ↩︎ result: 05 → qa/pilot05/foam/iso/base/05.png {"stage":"05","s":127.389,"y":-41.182,"calls":112,"tris":610907,"modules":{"water":"vfx/index.ts","benny":"assets/models/benny.glb","girl":"assets/models/rainbow_girl.glb"}}

### 🤖 Claude — 2026-11-15T19:19:19.461Z

> 🔧 **Read** `{"file_path": "/home/user/rainbow-/qa/pilot05/foam/iso/base/05.png"}`

### 🧑 User — 2026-11-15T19:19:19.511Z

> ↩︎ result: [image]

### 🤖 Claude — 2026-11-15T19:19:21.421Z

Baseline reproduces the band. Now isolation captures, one water part hidden per run.

### 🤖 Claude — 2026-11-15T19:19:23.032Z

> 🔧 **Bash** `{"command": "for h in crown spray bubbles ribbon; do (timeout 600 node scripts/capture.mjs 05 --out=qa/pilot05/foam/iso/no_$h --q=waterhide=$h 2>&1 | tail -1) & done; wait", "description": "Capture 05 four times, each with one water part hidden", "timeout": 620000}`

### 🧑 User — 2026-11-15T19:19:55.708Z

> ↩︎ result: 05 → qa/pilot05/foam/iso/no_crown/05.png {"stage":"05","s":127.389,"y":-41.182,"calls":112,"tris":610907,"modules":{"water":"vfx/index.ts","benny":"assets/models/benny.glb","girl":"assets/models/rainbow_girl.glb"}}
> [1]   Done                    ( timeout 600 node scripts/capture.mjs 05 --out=qa/pilot05/foam/iso/no_$h --q=waterhide=$h 2>&1 | tail -1 )
> 05 → qa/pilot05/foam/iso/no_ribbon/05.png {"stage":"05","s":127.389,"y":-41.182,"calls":112,"tris":610907,"modules":{"water":"vfx/index.ts","benny":"assets/models/benny.glb","girl":"assets/models/rainbow_girl.glb"}}
> 05 → qa/pilot05/foam/iso/no_spray/05.png {"stage":"05","s":127.389,"y":-41.182,"calls":112,"tris":610907,"modules":{"water":"vfx/index.ts","benny":"assets/models/benny.glb","girl":"assets/models/rainbow_girl.glb"}}
> [2]   Done                    ( timeout 600 node scripts/capture.mjs 05 --out=qa/pilot05/foam/iso/no_$h --q=waterhide=$h 2>&1 | tail -1 )
> [4]+  Done                    ( timeout 600 node scripts/capture.mjs 05 --out=qa/pilot05/foam/iso/no_$h --q=waterhide=$h 2>&1 | tail -1 )
> 05 → qa/pilot05/foam/iso/no_bubbles/05.png {"stage":"05","s":127.389,"y":-41.182,"calls":112,"tris":610907,"modules":{"water":"vfx/index.ts" …[+214 chars]

### 🤖 Claude — 2026-11-15T19:19:57.226Z

Let me compose the bottom halves of all five side by side for comparison.

### 🤖 Claude — 2026-11-15T19:19:58.271Z

> 🔧 **Bash** `{"command": "cat scripts/triptych.py | head -40; python3 -c \"import PIL; print(PIL.__version__)\"; python3 -c \"import numpy; print(numpy.__version__)\"", "description": "Inspect triptych script and check Python imaging libs"}`

### 🧑 User — 2026-11-15T19:19:58.483Z

> ↩︎ result: import sys
> from PIL import Image, ImageDraw, ImageFont
> # usage: triptych.py out.png h label1=path1 label2=path2 ...
> out, H = sys.argv[1], int(sys.argv[2])
> items = [a.split('=',1) for a in sys.argv[3:]]
> ims = []
> for lab, p in items:
>     im = Image.open(p).convert('RGB')
>     w = round(im.width * H / im.height)
>     ims.append((lab, im.resize((w, H), Image.LANCZOS)))
> pad, top = 8, 34
> W = sum(i.width for _, i in ims) + pad * (len(ims) + 1)
> canvas = Image.new('RGB', (W, H + top + pad), (24, 18, 32))
> d = ImageDraw.Draw(canvas)
> try: f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
> except Exception: f = ImageFont.load_default()
> x = pad
> for lab, im in ims:
>     canvas.paste(im, (x, top)); d.text((x + 6, 7), lab, fill=(255, 255, 255), font=f); x += im.width + pad
> canvas.save(out)
> print(out, canvas.size)
> 12.3.0
> 2.5.3

### 🤖 Claude — 2026-11-15T19:20:06.138Z

> 🔧 **Bash** `{"command": "mkdir -p /tmp/claude-0/-home-user-rainbow-/eae80a1c-be41-5f1a-858b-469afcc249da/scratchpad && cat > /tmp/claude-0/-home-user-rainbow-/eae80a1c-be41-5f1a-858b-469afcc249da/scratchpad/crops.py <<'EOF'\nimport sys\nfrom PIL import Image, ImageDraw, ImageFont\n# usage: crops.py out.png x0 y0 x1 y1 scale label=path ...\nout = sys.argv[1]; x0,y0,x1,y1 = map(int, sys.argv[2:6]); sc = float(sys.argv[6])\nitems = [a.split('=',1) for a in sys.argv[7:]]\nims = []\nfor lab,p in items:\n    im = Image.open(p).convert('RGB').crop((x0,y0,x1,y1))\n    im = im.resize((round(im.width*sc), round(im. …[+1026 chars]`

### 🧑 User — 2026-11-15T19:20:06.585Z

> ↩︎ result: /tmp/claude-0/-home-user-rainbow-/eae80a1c-be41-5f1a-858b-469afcc249da/scratchpad/iso_bottom.png (1851, 280)

### 🤖 Claude — 2026-11-15T19:20:07.769Z

> 🔧 **Read** `{"file_path": "/tmp/claude-0/-home-user-rainbow-/eae80a1c-be41-5f1a-858b-469afcc249da/scratchpad/iso_bottom.png"}`

### 🧑 User — 2026-11-15T19:20:07.779Z

> ↩︎ result: [image]

### 🤖 Claude — 2026-11-15T19:20:16.422Z

> 🔧 **Bash** `{"command": "grep -rn \"__rainbow\" src --include=*.ts | head -20 && sed -n 1,60p scripts/lib/pw.mjs", "description": "Find the QA hook API and Playwright helper"}`

### 🧑 User — 2026-11-15T19:20:16.575Z

> ↩︎ result: src/game/Game.ts:9: * window.__rainbow exposes a deterministic QA API used by scripts/capture.mjs.
> src/game/Game.ts:616:  (window as unknown as { __rainbow: typeof api }).__rainbow = api;
> src/game/modules.ts:4: * reported in window.__rainbow.stats().modules so QA never mistakes them for final assets.
> // Resolve the Playwright that is pre-installed in this environment (global node_modules),
> // falling back to a local install. Chromium launch flags give WebGL2 via SwiftShader headless.
> import { createRequire } from 'node:module';
> import { execSync } from 'node:child_process';
> import { join } from 'node:path';
> 
> export function loadPlaywright() {
>   try {
>     return createRequire(import.meta.url)('playwright');
>   } catch {
>     const root = execSync('npm root -g').toString().trim();
>     return createRequire(join(root, 'noop.js'))('playwright');
>   }
> }
> 
> export const CHROMIUM_ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
> 
> /** start a Vite dev server for the project and return { url, close } */
> export async function startVite(port = 5199) {
>   const { createServer } = await import('vite');
>   const server = await createServer({ server: { port, str …[+520 chars]

### 🤖 Claude — 2026-11-15T19:20:17.780Z

> 🔧 **Read** `{"file_path": "/home/user/rainbow-/src/game/Game.ts", "offset": 470, "limit": 150}`

### 🧑 User — 2026-11-15T19:20:17.809Z

> ↩︎ result: 470	  };
> 471	  const resetToIntro = () => {
> 472	    st.mode = 'intro'; st.t = 0; st.s = 0; st.lat = 0; st.coins = START_COINS; st.hearts = 5; st.paused = false;
> 473	    coins.resetUntil(-1);
> 474	    hud.setCoins(st.coins); hud.setHearts(5); hud.setVisible(false); hud.showVictory(false); hud.showPaused(false);
> 475	    st.stage = '01'; updateZones();
> 476	    env.towel.setTent(0);
> 477	    env.towel.mesh.position.set(WORLD.platform.center.x, WORLD.platform.topY, WORLD.platform.center.z - 1.0);
> 478	    env.doorC.rotation.y = 0;
> 479	    benny.root.visible = true;
> 480	    playIntroVideo();
> 481	  };
> 482	
> 483	  const stepSim = (dt: number) => {
> 484	    if (st.paused) return;
> 485	    st.t += dt;
> 486	    if (st.frozen === null) st.clock += dt;
> 487	    if (st.mode === 'intro') introUpdate(dt);
> 488	    else if (st.mode === 'ride') rideUpdate(dt);
> 489	    else if (st.mode === 'outro' || st.mode === 'end') {
> 490	      outroUpdate(dt);
> 491	    }
> 492	    girl.update(dt);
> 493	    const time = st.frozen ?? st.clock;
> 494	    env.update(time, dt);
> 495	    water.update(time, dt, st.s, camera);
> 496	    fill.position.copy(camera.position);
> 497	    sun.target.position.copy(camera.position).add(new THREE.Ve …[+6527 chars]

### 🤖 Claude — 2026-11-15T19:20:19.875Z

> 🔧 **Read** `{"file_path": "/home/user/rainbow-/src/game/Game.ts", "offset": 60, "limit": 70}`

### 🧑 User — 2026-11-15T19:20:19.923Z

> ↩︎ result: 60	  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.2, 0.35, 0.94);
> 61	  const useBloom = qs.get('bloom') !== '0';
> 62	  if (useBloom) composer.addPass(bloom);
> 63	  composer.addPass(new OutputPass());
> 64	  composer.addPass(createGradePass());
> 65	
> 66	  const resize = () => {
> 67	    const w = canvas.clientWidth || window.innerWidth;
> 68	    const h = canvas.clientHeight || window.innerHeight;
> 69	    renderer.setSize(w, h, false);
> 70	    composer.setSize(w, h);
> 71	    bloom.resolution.set(w / 2, h / 2);
> 72	    camera.aspect = w / h;
> 73	    camera.updateProjectionMatrix();
> 74	  };
> 75	  window.addEventListener('resize', resize);
> 76	  resize();
> 77	
> 78	  // ---------------------------------------------------------------- world
> 79	  const course = new Course();
> 80	  const env = buildEnvironment(course);
> 81	  scene.add(env.group);
> 82	  const water = await loadWater(course);
> 83	  scene.add(water.group);
> 84	  const benny = await loadBennyRuntime();
> 85	  scene.add(benny.root);
> 86	  const girl = await loadGirlRuntime();
> 87	  const coins = createCoins(course);
> 88	  scene.add(coins.group);
> 89	  // debug: ?hide=water,benny,coins,drumA,basin,tubes,chamber
> 90	  const hidden = new Set …[+1339 chars]

### 🤖 Claude — 2026-11-15T19:20:28.395Z

> 🔧 **Bash** `{"command": "cat > /tmp/claude-0/-home-user-rainbow-/eae80a1c-be41-5f1a-858b-469afcc249da/scratchpad/cap.mjs <<'EOF'\n// scratch capture: node cap.mjs OUTDIR ID \"query1\" \"query2\" ...   (each query → OUTDIR/<ID>_<n>.png)\nimport { mkdirSync } from 'node:fs';\nimport { loadPlaywright, CHROMIUM_ARGS, startVite } from '/home/user/rainbow-/scripts/lib/pw.mjs';\nconst [outDir, id, ...qs] = process.argv.slice(2);\nmkdirSync(outDir, { recursive: true });\nprocess.chdir('/home/user/rainbow-');\nconst { chromium } = loadPlaywright();\nconst vite = await startVite(5301);\nconst browser = await chromi …[+1469 chars]`

### 🧑 User — 2026-11-15T19:22:05.381Z

> ↩︎ result: qa/pilot05/foam/iso/05_waterhide_crown.png {"st":{"mode":"ride","stage":"05","s":127.389,"lat":0,"coins":1420,"hearts":5,"paused":false,"bennyY":-41.182,"bennyVisible":true,"cam":[3.24,-37.64,-63.48]},"b":{"x":0.06,"y":-0.46,"z":0.985,"visible":true,"cam":[3.24,-37.64,-63.48],"benny":[3.37,-41.18,-69.62]},"calls":112}
> qa/pilot05/foam/iso/05_waterhide_spray.png {"st":{"mode":"ride","stage":"05","s":127.389,"lat":0,"coins":1420,"hearts":5,"paused":false,"bennyY":-41.182,"bennyVisible":true,"cam":[3.24,-37.64,-63.48]},"b":{"x":0.06,"y":-0.46,"z":0.985,"visible":true,"cam":[3.24,-37.64,-63.48],"benny":[3.37,-41.18,-69.62]},"calls":111}
> qa/pilot05/foam/iso/05_waterhide_ribbon.png {"st":{"mode":"ride","stage":"05","s":127.389,"lat":0,"coins":1420,"hearts":5,"paused":false,"bennyY":-41.182,"bennyVisible":true,"cam":[3.24,-37.64,-63.48]},"b":{"x":0.06,"y":-0.46,"z":0.985,"visible":true,"cam":[3.24,-37.64,-63.48],"benny":[3.37,-41.18,-69.62]},"calls":111}
> qa/pilot05/foam/iso/05_waterhide_crown,spray,bubbles.png {"st":{"mode":"ride","stage":"05","s":127.389,"lat":0,"coins":1420,"hearts":5,"paused":false,"bennyY":-41.182,"bennyVisible":true,"cam":[3.24,-37.64,-63.48]},"b":{"x":0.06,"y":-0.46, …[+94 chars]

### 🤖 Claude — 2026-11-15T19:22:08.734Z

> 🔧 **Bash** `{"command": "D=qa/pilot05/foam/iso && python3 /tmp/claude-0/-home-user-rainbow-/eae80a1c-be41-5f1a-858b-469afcc249da/scratchpad/crops.py /tmp/claude-0/-home-user-rainbow-/eae80a1c-be41-5f1a-858b-469afcc249da/scratchpad/iso_bottom2.png 0 950 864 1536 0.42 base=$D/base/05.png no_crown=$D/05_waterhide_crown.png no_spray=$D/05_waterhide_spray.png no_ribbon=$D/05_waterhide_ribbon.png no_crown_spray_bub=$D/05_waterhide_crown,spray,bubbles.png", "description": "Build bottom-third comparison strip of isolation captures"}`

### 🧑 User — 2026-11-15T19:22:09.268Z

> ↩︎ result: /tmp/claude-0/-home-user-rainbow-/eae80a1c-be41-5f1a-858b-469afcc249da/scratchpad/iso_bottom2.png (1851, 280)

### 🤖 Claude — 2026-11-15T19:22:10.361Z

> 🔧 **Read** `{"file_path": "/tmp/claude-0/-home-user-rainbow-/eae80a1c-be41-5f1a-858b-469afcc249da/scratchpad/iso_bottom2.png"}`

### 🧑 User — 2026-11-15T19:22:10.376Z

> ↩︎ result: [image]

### 🤖 Claude — 2026-11-15T19:22:15.295Z

> 🔧 **Read** `{"file_path": "/home/user/rainbow-/src/vfx/waterRibbon.ts", "offset": 90, "limit": 230}`

### 🧑 User — 2026-11-15T19:22:15.312Z

> ↩︎ result: 90	uniform vec3 uPinkLight;
> 91	uniform vec3 uFoam;
> 92	uniform vec3 uFoamLav;
> 93	uniform vec3 uHaze;
> 94	uniform vec3 uLightDir;
> 95	uniform vec3 uBenny;      // s, lateral (units), strength
> 96	uniform float uBennyR;    // Benny's waterline radius (units)
> 97	uniform vec3 uChevron;    // start s, spacing, enabled
> 98	uniform vec2 uOutro;      // amount, chamber start s
> 99	varying vec2 vUV;
> 100	varying float vHalfW;
> 101	varying float vSpeed;
> 102	varying float vSkirt;
> 103	varying float vHide;
> 104	varying vec3 vPosW;
> 105	varying vec3 vNormalW;
> 106	#include <fog_pars_fragment>
> 107	${NOISE_GLSL}
> 108	${FRAG_FX_GLSL}
> 109	
> 110	// Stationary channel shape (refs 05–07): u-centre of the electric-cyan core. It only drifts slowly
> 111	// downstream at a constant rate (no shear between stage speeds); the strand texture below is what
> 112	// is advected at the local stage speed.
> 113	float meander(float s) {
> 114	  float a = s - uTime * 0.9;
> 115	  return 0.16 * sin(a * 0.24) + 0.07 * sin(a * 0.55 + 1.3) + 0.16 * (vnoise(vec2(a * 0.055, 4.7)) - 0.5);
> 116	}
> 117	
> 118	// advected strand texture ("combed" glossy water lines parallel to the flow)
> 119	// x = lateral units relative to the meander centre, v = adve …[+9935 chars]

### 🤖 Claude — 2026-11-15T19:22:34.882Z

> 🔧 **Bash** `{"command": "git log --oneline -8 -- src/vfx/waterRibbon.ts src/vfx/index.ts src/vfx/riderSplash.ts src/characters/benny/runtime.ts && git diff 81e639e f2a86ab --stat -- src/vfx src/characters/benny src/game && grep -n \"radius\" src/characters/benny/runtime.ts | head", "description": "Check history of ribbon/wake files and Benny radius"}`

### 🧑 User — 2026-11-15T19:22:34.933Z

> ↩︎ result: 70b100d autosave: Rainbow 2026-11-15 18:54 UTC
> fc70e56 full snapshot: game, design agents, specialist work in progress, docs, transcripts
> 0719fd3 autosave: Rainbow 2026-11-15 18:51 UTC
> af80fb1 Flow video hand-off, World Labs 05 pilot package, recovery docs
> ed710db autosave: Rainbow 2026-11-15 17:20 UTC
> cd85ef3 autosave: Rainbow 2026-11-15 17:15 UTC
> e1af619 autosave: Rainbow 2026-11-15 17:10 UTC
> f6f4777 autosave: Rainbow 2026-11-15 17:05 UTC
>  src/characters/benny/benny-lab.ts |  81 ++++++++----
>  src/characters/benny/build.ts     | 149 ++++++++++++++-------
>  src/characters/benny/runtime.ts   |  31 ++++-
>  src/characters/benny/textures.ts  |   7 +-
>  src/game/Game.ts                  |  25 +++-
>  src/game/cameraRig.ts             |  24 +++-
>  src/vfx/bubbles.ts                |  19 ++-
>  src/vfx/foam.ts                   | 264 ++++++++++++++++++++++++++++++++++----
>  src/vfx/glsl.ts                   |  38 +++++-
>  src/vfx/index.ts                  |  42 ++++--
>  src/vfx/riderSplash.ts            | 147 +++++++++++++++++++++
>  src/vfx/waterRibbon.ts            | 195 +++++++++++++++++++---------
>  12 files changed, 839 insertions(+), 183 deletions(-)
> 38: * Ride height. The game places the root at …[+120 chars]

### 🤖 Claude — 2026-11-15T19:22:36.366Z

> 🔧 **Bash** `{"command": "git diff 81e639e f2a86ab -- src/vfx/index.ts src/game/Game.ts | head -150", "description": "Show wave-1 changes to index.ts and Game.ts"}`

### 🧑 User — 2026-11-15T19:22:36.413Z

> ↩︎ result: diff --git a/src/game/Game.ts b/src/game/Game.ts
> index ea9843a..f42580c 100644
> --- a/src/game/Game.ts
> +++ b/src/game/Game.ts
> @@ -18,6 +18,7 @@ import { buildEnvironment } from '../world/environment';
>  import { createCandyEnvironment, createRenderer } from '../render/env';
>  import { createGradePass } from '../render/grade';
>  import { createHud } from '../ui/hud';
> +import { findCinematic, playCinematic } from '../ui/cinematicVideo';
>  import { createCoins, COIN_VALUE } from '../gameplay/coins';
>  import { createInput } from '../gameplay/input';
>  import { RideCamera } from './cameraRig';
> @@ -376,10 +377,16 @@ export async function startGame(canvas: HTMLCanvasElement) {
>    };
>  
>    // ---------------------------------------------------------------- outro (11)
> +  const cinematic = { ending: null as string | null };
>    const startOutro = () => {
>      st.mode = 'outro';
>      st.t = 0;
>      setStage('11');
> +    if (cinematic.ending) {
> +      // optional Flow ending video; the real-time 11 frame (girl holds towel, FINAL SPIN COMPLETE) follows
> +      st.paused = true;
> +      void playCinematic(cinematic.ending, { onEnding: () => { st.t = Math.max(st.t, O.badge - 0.4); st.paused = false; } });
> + …[+7211 chars]

### 🤖 Claude — 2026-11-15T19:23:08.255Z

> 🔧 **Bash** `{"command": "sed -n 1,30p src/characters/benny/runtime.ts && sed -n 160,180p src/characters/benny/runtime.ts && grep -n \"radius\\|furLen\\|length:\\|shellLen\\|'body'\" src/characters/benny/build.ts | head -30 && grep -n \"loadBennyRuntime\" -A12 src/game/modules.ts | head -30", "description": "Inspect Benny runtime interface, body radius and fur length"}`

### 🧑 User — 2026-11-15T19:23:08.299Z

> ↩︎ result: /**
>  * Runtime Benny: loads the canonical assets/models/benny.glb, upgrades fur_* meshes to shell fur,
>  * and drives expressions + procedural secondary motion on top of the GLB clips.
>  */
> import * as THREE from 'three';
> import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
> import type { BennyRuntime } from '../types';
> import { makeFur, type FurHandle, type FurParams } from './fur';
> 
> const BENNY_URL = new URL('../../../assets/models/benny.glb', import.meta.url).href;
> 
> let cached: Promise<THREE.Group> | null = null;
> 
> function loadScene(): Promise<THREE.Group> {
>   if (!cached) cached = new GLTFLoader().loadAsync(BENNY_URL).then((g) => {
>     const s = g.scene as THREE.Group;
>     s.userData.animations = g.animations;
>     return s;
>   });
>   return cached;
> }
> 
> /** fur tier: explicit option, else `?quality=low|high`, else low on Android/iOS (same rule as the water) */
> function defaultFurQuality(): 'high' | 'low' {
>   if (typeof location === 'undefined') return 'high';
>   const qp = new URLSearchParams(location.search).get('quality');
>   const mobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad/i.test(navigator.userAgent);
>   return qp === 'low' || (qp !== 'high' && …[+2755 chars]

### 🤖 Claude — 2026-11-15T19:23:09.815Z

> 🔧 **Bash** `{"command": "sed -n 20,40p src/characters/benny/build.ts && grep -n \"interface BennyRuntime\" -A12 src/characters/types.ts", "description": "Read Benny build dims and runtime type"}`

### 🧑 User — 2026-11-15T19:23:09.870Z

> ↩︎ result: soleTexture,
> } from './textures';
> 
> export const BENNY_DIMS = {
>   skin: 0.7,
>   fur: 0.12,
>   radius: 0.8,
>   /** lower-body bulge (radial gain at its peak) — the plush ball is widest below the brim (refs 05/07/10) */
>   pear: 0.09,
>   /** lower-half vertical stretch at the bottom pole (y' = y·(1 + stretch·|y|/r) for y < 0) */
>   stretch: 0.1,
>   /** front of the beanie raised (rad, about X). Small, so the back brim stays high on the ball in rear views */
>   hatTilt: -0.06,
>   brimBottom: 0.24, // hat-local
>   brimR: 0.74, // brim outer radius (≈ 0.85 × the fluffy body width, as in the rear references)
>   crownH: 0.54, // crown height above the brim's top edge
> };
> 
> /**
>  * Body skin deformation of a point `v` on the r = skin sphere: the lower half is stretched down a little
>  * and bulged radially (strongest at the sides/back, faded out on the face so eyes, blush and mouth keep
> 12:export interface BennyRuntime {
> 13-  /** origin = centre of the round body; faces +Z (camera behind him looks toward -Z… see docs) */
> 14-  root: THREE.Group;
> 15-  /** 'happy' (default, open smile), 'dizzy' (spiral eyes, scene 02), 'peek' (01, wide eyes) */
> 16-  setExpression(e: 'happy' | 'dizzy' | 'peek'): void;
> 17-  /* …[+423 chars]

### 🤖 Claude — 2026-11-15T19:23:43.572Z

> 🔧 **Bash** `{"command": "python3 -c \"\nfrom PIL import Image\nim=Image.open('references/05_flow_into_the_current.png'); print(im.size, im.mode)\nim2=Image.open('qa/pilot05/foam/iso/base/05.png'); print(im2.size)\n\" && S=/tmp/claude-0/-home-user-rainbow-/eae80a1c-be41-5f1a-858b-469afcc249da/scratchpad && python3 $S/crops.py $S/ref_bottom.png 0 900 864 1536 1.0 REF=references/05_flow_into_the_current.png", "description": "Check reference size and crop its bottom section"}`

### 🧑 User — 2026-11-15T19:23:43.970Z

> ↩︎ result: (864, 1536) RGB
> (864, 1536)
> /tmp/claude-0/-home-user-rainbow-/eae80a1c-be41-5f1a-858b-469afcc249da/scratchpad/ref_bottom.png (876, 670)

### 🤖 Claude — 2026-11-15T19:23:45.332Z

> 🔧 **Read** `{"file_path": "/tmp/claude-0/-home-user-rainbow-/eae80a1c-be41-5f1a-858b-469afcc249da/scratchpad/ref_bottom.png"}`

### 🧑 User — 2026-11-15T19:23:45.358Z

> ↩︎ result: [image]

### 🤖 Claude — 2026-11-15T19:23:52.368Z

> 🔧 **Bash** `{"command": "S=/tmp/claude-0/-home-user-rainbow-/eae80a1c-be41-5f1a-858b-469afcc249da/scratchpad && python3 $S/crops.py $S/mid.png 0 300 864 950 0.62 REF=references/05_flow_into_the_current.png NOW=qa/pilot05/foam/iso/base/05.png", "description": "Crop the mid section of reference vs current"}`

### 🧑 User — 2026-11-15T19:23:52.686Z

> ↩︎ result: /tmp/claude-0/-home-user-rainbow-/eae80a1c-be41-5f1a-858b-469afcc249da/scratchpad/mid.png (1090, 437)

### 🤖 Claude — 2026-11-15T19:23:53.864Z

> 🔧 **Read** `{"file_path": "/tmp/claude-0/-home-user-rainbow-/eae80a1c-be41-5f1a-858b-469afcc249da/scratchpad/mid.png"}`

### 🧑 User — 2026-11-15T19:23:53.900Z

> ↩︎ result: [image]

### 🤖 Claude — 2026-11-15T19:23:59.489Z

> 🔧 **Bash** `{"command": "S=/tmp/claude-0/-home-user-rainbow-/eae80a1c-be41-5f1a-858b-469afcc249da/scratchpad && python3 $S/crops.py $S/banks_now.png 440 520 864 900 1.0 NOW_right=qa/pilot05/foam/iso/base/05.png && python3 $S/crops.py $S/banks_ref.png 560 560 864 940 1.0 REF_right=references/05_flow_into_the_current.png", "description": "Zoom on right foam bank in current and reference"}`

### 🧑 User — 2026-11-15T19:23:59.790Z

> ↩︎ result: /tmp/claude-0/-home-user-rainbow-/eae80a1c-be41-5f1a-858b-469afcc249da/scratchpad/banks_now.png (436, 414)
> /tmp/claude-0/-home-user-rainbow-/eae80a1c-be41-5f1a-858b-469afcc249da/scratchpad/banks_ref.png (316, 414)

### 🤖 Claude — 2026-11-15T19:24:01.201Z

> 🔧 **Read** `{"file_path": "/tmp/claude-0/-home-user-rainbow-/eae80a1c-be41-5f1a-858b-469afcc249da/scratchpad/banks_now.png"}`

### 🧑 User — 2026-11-15T19:24:01.214Z

> ↩︎ result: [image]

### 🤖 Claude — 2026-11-15T19:24:01.593Z

> 🔧 **Read** `{"file_path": "/tmp/claude-0/-home-user-rainbow-/eae80a1c-be41-5f1a-858b-469afcc249da/scratchpad/banks_ref.png"}`

### 🧑 User — 2026-11-15T19:24:01.604Z

> ↩︎ result: [image]

### 🤖 Claude — 2026-11-15T19:24:17.891Z

> 🔧 **Bash** `{"command": "grep -rn \"benny.root.add\\|root.add(\\|root.children\" src --include=*.ts | head; grep -n \"length\\b\\|get length\" src/world/course.ts | head -5", "description": "Check children added to Benny root and course length"}`

### 🧑 User — 2026-11-15T19:24:17.949Z

> ↩︎ result: src/characters/girl/runtime.ts:16:  root.add(model);
> src/characters/benny/runtime.ts:59:  root.add(scene);
> src/characters/benny/build.ts:131:  root.add(body);
> src/world/environment.ts:44:  Object.entries(zones).forEach(([k, g]) => { g.name = 'zone_' + k; root.add(g); });
> src/game/modules.ts:108:  root.add(body, hat, pom);
> src/game/modules.ts:119:  root.add(body, head);
> src/game/modules.ts:123:  root.add(handL, handR);
> 11: * Every stage is a range of arc-length `s` on a single centripetal Catmull-Rom spline, so position
> 23:  /** arc-length range on the course */
> 90:  /** arc-length range of the stretch on the course */
> 111:    if (pts.length && p.distanceTo(pts[pts.length - 1]) < 0.25) return;
> 114:  const mark = (k: string) => (marks[k] = pts.length - 1);

### 🤖 Claude — 2026-11-15T19:24:20.804Z

> 🔧 **Bash** `{"command": "sed -n 95,112p src/game/modules.ts", "description": "Read stand-in Benny construction"}`

### 🧑 User — 2026-11-15T19:24:20.835Z

> ↩︎ result: const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: '#29d6ff', emissive: '#19a6ff', emissiveIntensity: 0.5, roughness: 0.1, metalness: 0.1, side: THREE.DoubleSide }));
>   const group = new THREE.Group();
>   group.add(mesh);
>   return { group, update() {}, surfaceHeight: () => 0, wake() {}, splash() {} };
> }
> 
> function standInBenny(): BennyRuntime {
>   const root = new THREE.Group();
>   const body = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 24), new THREE.MeshStandardMaterial({ color: '#ff7ec4', roughness: 0.9 }));
>   const hat = new THREE.Mesh(new THREE.SphereGeometry(0.84, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#7d3ff0' }));
>   hat.position.y = 0.12;
>   const pom = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 16), new THREE.MeshStandardMaterial({ color: '#7a2de0' }));
>   pom.position.y = 1.15;
>   root.add(body, hat, pom);
>   return { root, radius: 0.8, setExpression() {}, update() {} };
> }
> 
> function standInGirl(): GirlRuntime {

### 🤖 Claude — 2026-11-15T19:24:30.631Z

> 🔧 **Bash** `{"command": "grep -rn \"wake(\" src --include=*.ts | grep -v \"^src/vfx/waterRibbon\" ; grep -n \"loadWater\" -A6 src/game/modules.ts | head -20; grep -n \"WaterSystem\\|wake\" src/characters/types.ts src/types.ts 2>/dev/null", "description": "Find wake() declarations and water loader typing"}`

### 🧑 User — 2026-11-15T19:24:30.679Z

> ↩︎ result: Exit code 2
> src/vfx/riderSplash.ts:7: * computed water surface under Benny (index.ts `wake()`), so it always sits exactly on the stream
> src/vfx/riderSplash.ts:8: * that carries him. Hidden automatically when wake() stops being called (intro / outro).
> src/vfx/index.ts:8: *   water.wake(bennyPos, forward, right, speed, dt);
> src/vfx/index.ts:46:  wake(pos: THREE.Vector3, forward: THREE.Vector3, right: THREE.Vector3, speed: number, dt: number): void;
> src/vfx/index.ts:164:    wake(pos, forward, right, speed, dt) {
> src/game/Game.ts:363:    water.wake(pose.pos, f.tan, f.right, speed, dt);
> src/game/modules.ts:14:  wake(pos: THREE.Vector3, forward: THREE.Vector3, right: THREE.Vector3, speed: number, dt: number): void;
> src/game/modules.ts:98:  return { group, update() {}, surfaceHeight: () => 0, wake() {}, splash() {} };
> 24:export async function loadWater(course: Course): Promise<WaterLike> {
> 25-  const f = Object.values(vfxMods)[0];
> 26-  if (f) {
> 27-    try {
> 28-      const m = (await f()) as { createWater: (c: Course, o?: { quality?: 'high' | 'low' }) => WaterLike };
> 29-      // Android/mobile defaults to the low tier (measured budgets: see qa/performance.md); ?quality= overrides
> 30-       …[+63 chars]

### 🤖 Claude — 2026-11-15T19:24:38.335Z

> 🔧 **Bash** `{"command": "grep -rn \"BENNY_RIDE_OFFSET\" src scripts tests 2>/dev/null | grep -v \"^src/vfx/index.ts\"; ls tests 2>/dev/null | head; grep -n \"\\\"test\\|typecheck\\|continuity\" package.json", "description": "Find BENNY_RIDE_OFFSET users and test scripts"}`

### 🧑 User — 2026-11-15T19:24:38.417Z

> ↩︎ result: 11:    "typecheck": "tsc --noEmit",
> 12:    "test:continuity": "vite-node scripts/continuity-test.ts",
> 19:    "test:cinematic": "node scripts/cinematic-test.mjs"

### 🤖 Claude — 2026-11-15T19:24:44.760Z

> 🔧 **Bash** `{"command": "sed -n 158,162p src/game/Game.ts && sed -n 360,364p src/game/Game.ts && git diff --stat src/game/Game.ts", "description": "Re-read Game.ts wake lines before editing"}`

### 🧑 User — 2026-11-15T19:24:44.817Z

> ↩︎ result: };
> 
>   const pose = { pos: new THREE.Vector3(), quat: new THREE.Quaternion() };
>   const tmpV = new THREE.Vector3();
>   const doorAOpen = -1.9, doorCOpen = -1.95;
>     benny.root.visible = true;
>     benny.setExpression('happy');
>     benny.update(dt, { swim: 1, steer: input.steer, speed, time: st.clock });
>     water.wake(pose.pos, f.tan, f.right, speed, dt);
>     // camera

### 🤖 Claude — 2026-11-15T19:24:47.446Z

> 🔧 **Edit** `{"replace_all": false, "file_path": "/home/user/rainbow-/src/game/Game.ts", "old_string": "    water.wake(pose.pos, f.tan, f.right, speed, dt);\n    // camera", "new_string": "    // VFX anchor = the body centre AFTER the runtime's ride lift (the model is raised inside the root),\n    // so the wake/splash footprint matches the real waterline instead of the unlifted root\n    water.wake((benny.root.children[0] ?? benny.root).getWorldPosition(wakeAnchor), f.tan, f.right, speed, dt);\n    // camera"}`

### 🧑 User — 2026-11-15T19:24:47.485Z

> ↩︎ result: The file /home/user/rainbow-/src/game/Game.ts has been updated successfully.

### 🤖 Claude — 2026-11-15T19:24:48.960Z

> 🔧 **Edit** `{"replace_all": false, "file_path": "/home/user/rainbow-/src/game/Game.ts", "old_string": "  const tmpV = new THREE.Vector3();\n  const doorAOpen = -1.9, doorCOpen = -1.95;", "new_string": "  const tmpV = new THREE.Vector3();\n  const wakeAnchor = new THREE.Vector3(); // VFX: Benny's lifted body centre fed to water.wake()\n  const doorAOpen = -1.9, doorCOpen = -1.95;"}`

### 🧑 User — 2026-11-15T19:24:49.000Z

> ↩︎ result: The file /home/user/rainbow-/src/game/Game.ts has been updated successfully.

### 🤖 Claude — 2026-11-15T19:24:49.739Z

Now `wake()` in index.ts: real waterline radius from the body-centre height.

### 🤖 Claude — 2026-11-15T19:24:54.086Z

> 🔧 **Edit** `{"replace_all": false, "file_path": "/home/user/rainbow-/src/vfx/index.ts", "old_string": "      // body radius from the ride offset (centre = surface + BENNY_RIDE_OFFSET · radius)\n      const above = d.dot(f.up) - surfaceHeight(s, lateral, curTime);\n      const bodyR = THREE.MathUtils.clamp(above / BENNY_RIDE_OFFSET, 0.4, 2.0);\n      const waterlineR = bodyR * Math.sqrt(1 - BENNY_RIDE_OFFSET * BENNY_RIDE_OFFSET);\n      const strength = Math.min(1, speed / 8);", "new_string": "      // pos = Benny's real body centre (Game.ts passes it AFTER the runtime's ride lift). The waterline\n      // …[+539 chars]`

### 🧑 User — 2026-11-15T19:24:54.125Z

> ↩︎ result: The file /home/user/rainbow-/src/vfx/index.ts has been updated successfully. (file state is current in your context — no need to Read it back)

### 🤖 Claude — 2026-11-15T19:24:55.543Z

> 🔧 **Edit** `{"replace_all": false, "file_path": "/home/user/rainbow-/src/vfx/index.ts", "old_string": "export const BENNY_RIDE_OFFSET = 0.55;", "new_string": "export const BENNY_RIDE_OFFSET = 0.55;\n/** Benny's outer (fur) radius near the waterline: skin 0.7 + fur 0.12 + lower-body bulge (benny/build.ts BENNY_DIMS) */\nconst BENNY_OUTER_R = 0.86;"}`

### 🧑 User — 2026-11-15T19:24:55.609Z

> ↩︎ result: The file /home/user/rainbow-/src/vfx/index.ts has been updated successfully. (file state is current in your context — no need to Read it back)

### 🤖 Claude — 2026-11-15T19:24:56.384Z

Also update the doc comment at the top of index.ts so the contract is clear, then capture.

### 🤖 Claude — 2026-11-15T19:24:57.592Z

> 🔧 **Edit** `{"replace_all": false, "file_path": "/home/user/rainbow-/src/vfx/index.ts", "old_string": " *   water.wake(bennyPos, forward, right, speed, dt);", "new_string": " *   water.wake(bennyBodyCentre, forward, right, speed, dt);   // centre of the (lifted) body, not the root"}`

### 🧑 User — 2026-11-15T19:24:57.638Z

> ↩︎ result: The file /home/user/rainbow-/src/vfx/index.ts has been updated successfully. (file state is current in your context — no need to Read it back)

### 🤖 Claude — 2026-11-15T19:24:59.537Z

> 🔧 **Bash** `{"command": "npx tsc --noEmit 2>&1 | head -20; timeout 900 node /tmp/claude-0/-home-user-rainbow-/eae80a1c-be41-5f1a-858b-469afcc249da/scratchpad/cap.mjs qa/pilot05/foam/iso/fix1 05 \"\" 2>&1 | tail -2", "description": "Typecheck and capture 05 after the anchor fix", "timeout": 920000}`

