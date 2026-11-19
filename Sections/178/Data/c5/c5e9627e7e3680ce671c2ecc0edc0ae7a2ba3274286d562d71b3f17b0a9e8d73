# Benny — canonical model, rig & runtime (benny-character-artist)

**One** Benny for every scene: `assets/models/benny.glb` (1.18 MB), built procedurally by
`src/characters/benny/build.ts` and exported with `node scripts/export-models.mjs benny`
(Three.js GLTFExporter in headless Chromium). No external assets, no paid generators, no Blender.
The game loads it through `loadBenny()` in `src/characters/benny/runtime.ts`.

## Contract
* Origin = centre of the round body; faces **+Z**, up +Y (so `root.lookAt(pos + tangent)` points him down the course).
* Skin sphere r = 0.70, fur adds ≈ 0.105 → visual body radius ≈ 0.8 (`BennyRuntime.radius = 0.8`).
* Height: feet −0.85 → pom top +1.44 ≈ **2.3 units**; width ≈ 1.9 incl. arms.

## Rig (joint nodes, rigid parts parented to joints — not skin-weighted)
`benny_root › body › { hat › pom, eyes › eyeL / eyeR, mouth, armL, armR, footL, footR }`
(armL/footL = Benny's left = +X). Blink = cartoon squash of `eyeL/eyeR` (scale.y).

## Animation clips (in the GLB)
| clip | length | content |
|---|---|---|
| `idle` | 2.4 s | gentle bob, arm sway |
| `swim` | 0.6 s | paws paddle (alternating), feet kick, body bob + roll |
| `tumble` | 1.0 s | paws flail up, fast kicks (caller spins the root — scene 02) |
| `peek` | 2.0 s | paws forward/up holding the towel edge, sway (scene 01) |

Runtime blends idle↔swim by `swim`, crossfades tumble/peek, and adds procedural steering lean,
pom-pom spring bounce (vertical acceleration + steer + speed jitter), blinks, and fur wind.

## Expressions
`setExpression('happy' | 'dizzy' | 'peek')` toggles meshes in the GLB:
`eye{L,R}_happy` (violet iris, black pupil, 2 sparkles, outer lashes), `eye{L,R}_dizzy` (purple spirals, scene 02),
`mouth_happy` (open smile + tongue), `mouth_dizzy` (round "O" + tongue), `mouth_peek` (small grin, wider eyes).

## Materials / textures (canvas-generated, sRGB)
* Beanie crown: knit "V"-stitch texture + Sobel normal map, stripes bottom→top **white / purple / white / purple**.
* Brim: ribbed k2p2 purple cuff texture + normal map.
* Gold star: extruded beveled 5-point star, metalness 0.55 + warm emissive, on the brim's top edge at **132° from the
  front toward Benny's right (−X)**, so it reads image-right in rear gameplay views 04–10.
* Eyes glossy (roughness 0.12); blush = alpha decal; mouths = alpha-tested decals; white soles with pink toe beans on
  feet and paw palms.

## Shell fur (`src/characters/benny/fur.ts`)
* Every `fur_*` mesh (fur_body, fur_armL/R, fur_footL/R, fur_pom) carries its parameters in glTF `extras`
  (length, density, shells, root/tip colours, gravity, bald/short masks).
* Runtime turns each into an `InstancedMesh` of N shells (**one draw call per furry part**); `gl_InstanceID` = layer.
* Fragment: jittered 3-D strand grid (8-neighbour search) with tapering strands, low-frequency **clumping** toward tuft
  centres (plush tufts), root-dark → tip-light gradient + AO, small tip emissive. Bald under the beanie (tilted plane)
  and short fur on the face so eyes/mouth stay readable. Vertex: push along normal, gravity droop, wind sway.
* Built on `MeshStandardMaterial.onBeforeCompile`, so IBL, lights and `scene.fog` still apply.

## Budgets (measured from the geometry)
| | triangles |
|---|---|
| base meshes (no shells) | 13,844 |
| rendered incl. shells, `furQuality: 'high'` (body 20, pom 16, arms 12, feet 8 shells) | ≈ 120,000 |
| rendered incl. shells, `furQuality: 'low'` (×0.6 shells) | ≈ 77,000 |
| draw calls | 4–6 fur + ~23 small parts |

`'low'` is recommended for Android until on-device FPS is measured (not yet measured — no device here).

## Proof images
* `docs/characters/benny_turntable.png` — model-lab strip (front / ¾ / side / back) from the exported GLB.
* `docs/characters/benny_turntable_full_glb.png` — fully framed front / ¾ / side / back / rear-high from the GLB.
* `docs/characters/benny_turntable_expr_dizzy.png` — dizzy expression (scene 02).
* `docs/characters/benny_reference_views_glb.png` — portrait panels framed like ref 05 (rear), 03 (front ¾), 02 (dizzy).
* QA page: `/src/characters/benny/benny-lab.html?src=glb&views=refs|turntable`.

## Known discrepancies (honest)
1. **Star side:** the references are mirror-inconsistent (front views 01–03 show the star image-right = Benny's left;
   rear views 04–10 show it image-right = Benny's right). One rig cannot satisfy both; the star is on Benny's
   right-rear so the 7 rear gameplay views match, and it appears image-left / mostly hidden in front views.
2. Fur reads slightly streaky at grazing silhouettes compared with the painted soft plush in the references
   (shell-fur limitation); more shells or alpha-to-coverage would soften it at extra cost.
3. Ref 03 shows a looser, slightly smaller-looking beanie with more face visible; ref 02 has the brim touching the
   eyes. The single model sits between the two (brim tilted −11.5°, front raised).
4. Painted references have strong bloom/sheen; final glow depends on the game's lighting/bloom, not the model.
5. Rig is a rigid joint hierarchy (parts parented to joints), not skin-weighted deformation.
