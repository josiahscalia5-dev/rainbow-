"""Verify the portable Blender scenes, original camera calibration and actual runtime GLB."""
import hashlib
import json
import math
import struct
import sys
from collections import Counter
from pathlib import Path

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector


def checksum(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def surface_counts(scene):
    objects = [obj for obj in scene.objects if obj.type == "MESH"]
    return dict(Counter(obj.get("surface_family", "unspecified") for obj in objects)), {obj.name for obj in objects}


def main():
    blend, study, glb, approved, landmarks, output = map(Path, sys.argv[sys.argv.index("--") + 1:])
    reference_sha = checksum(approved)
    bpy.ops.wm.open_mainfile(filepath=str(blend))
    scene = bpy.context.scene
    counts, expected = surface_counts(scene)
    assert counts == {"ring": 12, "paddle": 4, "bank": 2, "wall": 1, "foam": 1, "water": 1, "end": 1}
    packed = {image.name: hashlib.sha256(bytes(image.packed_file.data)).hexdigest()
              for image in bpy.data.images if image.packed_file}
    assert reference_sha in packed.values()
    assert len(packed) >= 6
    fitted = json.loads(landmarks.read_text())["inferredGuide"]
    errors = []
    for point in fitted:
        x, y, z = point["retainedCoinWorld"]
        screen = world_to_camera_view(scene, scene.camera, Vector((x, -z, y)))
        px, py = point["sourceCentrePx"]
        errors.append(math.hypot(864 * screen.x - px, 1536 * (1 - screen.y) - py))
    assert max(errors) < .025
    data = glb.read_bytes()
    header, version, length = struct.unpack_from("<4sII", data)
    json_length, chunk = struct.unpack_from("<I4s", data, 12)
    assert (header, version, length, chunk) == (b"glTF", 2, len(data), b"JSON")
    gltf = json.loads(data[20:20+json_length])
    triangles = sum(gltf["accessors"][primitive["indices"]]["count"] // 3
                    for mesh in gltf["meshes"] for primitive in mesh["primitives"])
    assert triangles > 0
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(glb))
    imported, names = surface_counts(bpy.context.scene)
    assert names == expected and counts == imported
    bpy.ops.wm.open_mainfile(filepath=str(study))
    scene_study = bpy.context.scene
    object_study = next(x for x in scene_study.objects if x.type == "MESH")
    assert len(object_study.data.vertices) == 420 and len(object_study.data.polygons) == 556
    assert scene_study["maximum_camera_error_px"] < .025
    assert any(hashlib.sha256(bytes(i.packed_file.data)).hexdigest() == reference_sha
               for i in bpy.data.images if i.packed_file)
    report = {
        "blenderVersion": bpy.app.version_string,
        "editableMeshes": len(expected), "families": counts,
        "packedImageCount": len(packed), "originalArtSha256": reference_sha,
        "maximumSavedCameraCoinErrorPx": max(errors),
        "portableBlendSha256": checksum(blend), "runtimeGlbSha256": checksum(glb),
        "runtimeGlbBytes": len(data), "runtimeGlbTriangles": triangles,
        "blenderGlbReimportMatched": True, "fittingStudySha256": checksum(study),
        "fittingStudyVertices": len(object_study.data.vertices),
        "fittingStudyMaxCameraErrorPx": scene_study["maximum_camera_error_px"],
    }
    output.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report))


if __name__ == "__main__":
    main()
