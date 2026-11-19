"""Open the packed editor file and independently reimport the actual runtime GLB in Blender."""
import collections
import hashlib
import json
import math
import sys
from pathlib import Path

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector


def sha(data):
    return hashlib.sha256(data).hexdigest()


def inspect_scene():
    objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    families = collections.Counter(obj.get("surface_family") for obj in objects)
    assert families == {"ring": 12, "paddle": 4, "foam": 1, "water": 1, "bank": 2, "wall": 3, "end": 1}
    triangles = 0
    for obj in objects:
        obj.data.calc_loop_triangles()
        triangles += len(obj.data.loop_triangles)
        assert obj.data.uv_layers.active and len(obj.data.vertices) > 2, obj.name
    return {"families": dict(families), "triangles": triangles, "meshCount": len(objects)}


def main():
    edited, glb, original, cam_file, output = map(Path, sys.argv[sys.argv.index("--") + 1:])
    bpy.ops.wm.open_mainfile(filepath=str(edited))
    editor = inspect_scene()
    original_hash = sha(original.read_bytes())
    packs = {item.name: sha(item.packed_file.data) for item in bpy.data.images if item.packed_file}
    assert original_hash in packs.values(), "Missing original in the camera study"
    camera = bpy.context.scene.camera
    record = json.loads(cam_file.read_text())["camera"]
    pos = record["pos"]
    assert (camera.matrix_world.translation - Vector((pos[0], -pos[2], pos[1]))).length < 2.e-5
    assert abs(math.degrees(2. * math.atan(.5 * camera.data.sensor_height / camera.data.lens)) - record["fov"]) < .001
    assert tuple(record["size"]) == (864, 1536)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(glb))
    runtime = inspect_scene()
    assert editor == runtime, (editor, runtime)
    assert glb.read_bytes()[:4] == b"glTF"
    output.write_text(json.dumps({"Blender": bpy.app.version_string, "editor": editor,
                                 "reimport": runtime, "cameraFov": record["fov"],
                                 "orthographic": False, "referenceSha256": original_hash,
                                 "packedImages": sorted(packs),
                                 "blendSha256": sha(edited.read_bytes()), "glbSha256": sha(glb.read_bytes()),
                                 "gameBatches": 7}, indent=2) + "\n")
    print("Verified the editable camera, original packed image, 24 meshes and seven runtime surface batches.")


if __name__ == "__main__":
    main()
