# Editable Screen 06 crest

Open **Screen06_Open_Crest.blend** in Blender 5.3. The first collection contains surfaces whose geometry or UVs differ from the previous passage candidate. The next collection holds its retained tunnel, gold rings, foam and surrounding geometry. These are meshes from the same Three.js scene used for the gameplay recording.

The timeline cameras show the actual opening at frame 1, three units forward at frame 4 and six units forward at frame 7. The opening camera includes an optional packed copy of the original approved artwork. You can enable it under Camera Data → Background Images. Press Tab on a selected object to inspect or edit its actual mesh. The original near-water surface stays in the completed candidate. The separate upper water lip and outer soffit identify the added physical arch.

Blender’s colors and lighting are inspection materials. The playable build includes the registered opening paint, animated shaders, Benny, the HUD and postprocessing. The Three.js construction source beside the playable build is authoritative for changes to the running game.

## Reproduce this file

From a restored candidate checkout, start its local Vite game server. Use a Node installation with Playwright, Chromium and Blender 5.3.0. The export takes two runtime snapshots using the saved specialist flags. One enables the prior arched passage. The other also enables the new crest. It fingerprints mesh topology, world transforms, positions, normals and UVs to identify changed surfaces. The geometry is static across the three held viewpoints.

Run these commands from this editable folder, setting the paths to your local game and executables. The first command compares the actual runtime geometry. The next two can be run offline from the saved compressed snapshot.

```sh
CHROMIUM_PATH=/usr/bin/chromium node export-runtime.cjs http://127.0.0.1:5173 editable-source.json.gz
blender -b -noaudio --python-exit-code 1 -P build-editable.py -- editable-source.json.gz /path/to/rainbow Screen06_Open_Crest.blend
blender -b Screen06_Open_Crest.blend -noaudio --python-exit-code 1 -P verify-editable.py -- editable-source.json.gz verification.json
```

The verification reopens the saved Blender file. It compares every vertex, triangle index and exported UV against the game, validates the packed original artwork against its repository SHA-256, and independently checks multiple world points from the three camera poses against Three.js pixel coordinates. This verifies geometric registration. Review the separate recorded gameplay for the final appearance and motion.
