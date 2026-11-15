# Official cartoon girl — model, rig & animation notes

Specialist: `cartoon-girl-character-artist`. Identity source: `character_references/official_cartoon_girl_original.jpg`
(the realistic girls inside references 01 / 10 / 11 are composition references only and were NOT modelled).
ONE model / ONE rig is used for scene 01 (walks away), scene 10 (seen through the door) and scene 11 (leans in,
hands on the folded purple towel).

| Item | Value |
|---|---|
| Builder | `src/characters/girl/build.ts` → `buildGirl(): BuiltModel` (procedural Three.js geometry + canvas textures, no external images) |
| Textures | `src/characters/girl/textures.ts` (eye, face decal, hoodie stripes, rib knit, denim twill, hair strands) |
| Runtime | `src/characters/girl/runtime.ts` → `loadGirl(): Promise<GirlRuntime>` |
| GLB | `assets/models/rainbow_girl.glb` — 3,546,480 bytes, 165 meshes, 194 nodes, **84,820 triangles**, 9 clips |
| Contract | origin between the feet on the floor, faces **+Z**, up +Y, height ≈ **25.6 units** (≈ 26 incl. ponytail spring) ; her LEFT = +X |
| Review renders | `docs/characters/girl_turntable.png` (front · ¾ · side · back), `girl_turntable_anim_leanReachTowel_t_1_6.png`, `girl_turntable_anim_walk_t_0_3.png`, `girl_face_closeup_lean_glb.png` (scene-11-like face close-up, loaded from the GLB) |
| Close-up lab | `src/characters/girl/girl-lab.html?src=glb|build&layout=identity|face|poses&anim=<clip>&t=<s>` |

## Rig (joint hierarchy — rigid parts parented to joints, **not skin-weighted**)

```
girl_root
└ hips ─ thighL ─ shinL ─ footL          (hoodie_skirt, hem, jeans hips/pockets ride the hips)
  │    └ thighR ─ shinR ─ footR
  └ spine ─ chest ─ neck ─ head ─ headCenter ─ eyeL/eyeR (eye surface + eyelidL/eyelidR morph meshes)
          │                              └ ponytail ─ ponytailL / ponytailR / ponytailTip (curl groups)
          ├ shoulderL ─ upperArmL ─ forearmL ─ handL
          └ shoulderR ─ upperArmR ─ forearmR ─ handR
```

* Blinking: `eyelidL` / `eyelidR` are skin-coloured lid meshes sitting just behind the real eye openings in the
  skull, with a `blink` morph target (0 = open, 1 = closed). The runtime blinks procedurally every 2.2–5.4 s
  (occasional double blink); the explicit `blink` clip also drives the morph.
* Eyes: real almond openings are cut into the head mesh (boundary vertices snapped onto the curve) with a
  face-conforming eye surface behind them — no bulging domes. Gaze is fixed forward (rotating `eyeL/eyeR`
  would slide the conforming surface; not supported).
* Material names (for runtime tweaks): `skin`, `lid`, `hair`, `hairLight`, `hairDark`, `eye`, `face`, `hoodie`,
  `rib`, `collar`, `denim`, `denimLight`, `purple`, `purpleDeep`, `shoe`, `white`, `sole`, `gold`, `starYellow`, `sock`, …

## Clips (24 fps sampled, all body joints keyed in every clip so cross-fades never leave a joint stuck)

| Clip | Length | Loop | Use |
|---|---|---|---|
| `idle` | 6.0 s | yes | two breaths, weight shift, glances, ponytail sway |
| `walk` | 1.06 s | yes | in place (no root motion); move the root ≈ 12–14 units/s |
| `carryTowel` | 1.06 s | yes | walking with the towel bundle held in front (move root ≈ 10–11 units/s) |
| `dropLoad` | 2.3 s | once | lean to the front-loader, push the bundle in, straighten |
| `closeDoor` | 1.4 s | once | wind up and push the door shut with the right arm |
| `laundryCounter` | 3.2 s | yes | standing at a counter folding (scene 10, seen from behind/side) |
| `leanReachTowel` | 1.6 s | once, clamps | lean ≈ 42° (hips 8° + spine 18° + chest 16°), hands down/forward, face tilted up toward the camera, smile |
| `holdTowel` | 3.0 s | yes | holding the folded towel at chest height, gentle lift |
| `blink` | 0.24 s | once | eyelid morphs only |

Hand (wrist-joint) positions in her local frame, for attaching / placing the towel:

| Pose | handL | handR |
|---|---|---|
| `leanReachTowel` @1.6 s (held) | (3.64, 9.80, 4.87) | (−3.64, 9.80, 4.87) |
| `holdTowel` @1.0 s | (3.89, 14.33, 4.58) | (−3.91, 14.19, 4.58) |
| `carryTowel` @0.5 s | (3.93, 14.15, 5.23) | (−4.20, 14.17, 5.00) |

Fingertips are ≈ 1.2–1.4 units beyond the wrist; for scene 11 a folded towel whose top sits at y ≈ 9.0–9.5 and
z ≈ 5.0–6.0 (her local frame) is under her palms.

## Identity checklist (vs. the official reference)

| Feature | Status |
|---|---|
| Curly warm-brown HIGH ponytail, voluminous ringlets (reads from behind/side) | ✅ 52 corkscrew ringlets fountaining from a crown-back tie, purple hair tie; reads clearly in back/side views |
| Hair pulled back from a soft arched hairline, temple curls | ✅ parametric hairline cap with strands sweeping back; 2 ringlets per temple |
| Purple headband tied into a BIG purple bow with a small gold/yellow star | ✅ puffy satin loops + tails + knot with extruded star |
| Large brown cartoon eyes, big highlights, lashes, friendly face, rosy cheeks, warm open smile | ✅ almond openings, warm brown iris + 3 highlights, thick upper lash line + outer flicks, blush, open smile with teeth & tongue |
| Gold hoop earrings | ✅ |
| Lavender-and-white horizontally striped hoodie, hood bunched at back, ribbed white hem/cuffs, zipper + drawstrings | ✅ |
| Gold star patch on the upper sleeve | ✅ on her RIGHT upper sleeve (the arm facing the viewer in the reference) |
| Blue jeans with cuffed/rolled hems, cargo pocket with yellow star patch | ✅ star on the right cargo pocket; plain pocket on the left; back pockets |
| Purple-and-white sneakers with yellow star, white soles/laces, white socks | ✅ |
| Same soft, warm, glossy cartoon art direction as Benny; no photoreal face | ✅ |

## Known gaps (honest)

* Rigid joint rig, not skin-weighted: elbows/knees/shoulders are covered by overlapping spheres; very deep bends
  (> ~100°) would show seams. The clips stay inside that range.
* Simple hands (palm + capsule fingers, no finger joints); one facial expression (happy open smile) — no lip sync.
* The reference shows her glancing sideways; the model looks forward (gaze is not rigged).
* 84.8 k triangles / 3.5 MB is heavy for a mobile character; ~30 k tris are the ponytail ringlets. She only
  appears in the 01/10/11 cinematics, so hide her (`root.visible = false`) during the ride; no LOD yet.
* Canvas-texture detail only (no normal maps); hair is tube geometry + strand texture, not cards/fur.
* Stripe/denim/skin colours were picked by eye from the reference and render slightly more pink/violet under
  the candy environment light than in the reference's warm daylight.
* Materials are all `MeshStandardMaterial` in the GLB; the runtime swaps the eye material to a softly glossy
  `MeshPhysicalMaterial`.
