# Screen 06 editable scenery

Open **Screen06_Recessed_Shoulder.blend** with Blender 5.3.0. The editable meshes are a capture of the world-space buffers used by the playable game. They include the curved washer shell, gold collars, paddles, main watercourse, wet upper arm, recessed metal underside, rolled banks and foam. The three cameras are the actual opening, +3 and +6 game poses. Timeline frames 1, 4 and 7 select them. The opening camera has the exact approved artwork packed as an optional background. The Blender materials aid mesh inspection. Use the game for final animated water, lighting, character, HUD and moving views.

The new geometry is controlled by `src/world/openCrest06.ts`. The integration in `src/world/archedPassage06.ts` deforms the near water, rolled banks, foam and their washer returns together when the isolated crest flag is enabled. The existing game passes its retained course into this construction from `src/world/match06.ts`. The editable game ZIP contains the complete TypeScript source and existing asset inputs. Rebuilding the geometry there updates the playable result.

The following commands use the local dependencies and Blender. `CREST_BASELINE_CAPTURE` can point to the editable runtime snapshot from the preceding camera-fit Git revision to reproduce the changed-mesh list. The earlier experiment is named in the main README. With the variable omitted, the exporter compares against the original arched-passage flag on this branch.

```sh
node export-runtime.cjs http://127.0.0.1:7906 editable-source.json.gz
blender -b -noaudio --python-exit-code 1 -P build-editable.py -- editable-source.json.gz /path/to/rainbow Screen06_Recessed_Shoulder.blend
blender -b Screen06_Recessed_Shoulder.blend -noaudio --python-exit-code 1 -P verify-editable.py -- editable-source.json.gz verification.json
```

The verification reopened the saved Blender file, verified all triangle indices, vertices and surface UVs, checked the packed original artwork hash, and tested pixel registration against the captured gameplay cameras. The saved verification report contains the errors in game units and pixels.
