"""Build a separate Blender study of the visible crest and unchanged steering limits."""
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Vector
from bpy_extras.object_utils import world_to_camera_view


def blender_xyz(point):
    x, y, z = point
    return (x, -z, y)


def make_guide(collection, name, points, color):
    data = bpy.data.curves.new(name, "CURVE")
    data.dimensions = "3D"
    data.resolution_u = 2
    data.bevel_depth = .024
    data.bevel_resolution = 2
    spline = data.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for point, position in zip(spline.points, points):
        point.co = (*blender_xyz(position), 1.)
    material = bpy.data.materials.new(name)
    material.diffuse_color = (*color, 1.)
    data.materials.append(material)
    guide = bpy.data.objects.new(name, data)
    guide.color = (*color, 1.)
    collection.objects.link(guide)


def build():
    fit_path, approved_path, destination = map(Path, sys.argv[sys.argv.index("--") + 1:])
    fit = json.loads(fit_path.read_text())
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    width, height = fit["size"]
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100
    geometry = bpy.data.collections.new("Visible crest fitting study")
    scene.collection.children.link(geometry)
    data = bpy.data.meshes.new("Crest traced from the approved water boundary")
    vertices = [blender_xyz(p) for section in fit["worldSections"] for p in section]
    data.from_pydata(vertices, [], fit["faces"])
    data.update()
    model = bpy.data.objects.new("Visible crest surface / inferred depth", data)
    geometry.objects.link(model)
    model["purpose"] = "Editable partial geometry study. No integration into the game."
    model["depth_assumption"] = "Across each photographed section, both boundaries share the optical depth estimated for the coin arc."
    for face in data.polygons:
        face.use_smooth = True
    # Show the native source on these world-space vertices using a fixed UV map.
    original = bpy.data.images.load(str(approved_path))
    original.pack()
    uvs = data.uv_layers.new(name="Approved camera UV")
    photo_pixels = [p for section in fit["sourceSectionsPx"] for p in section]
    for loop in data.loops:
        px, py = photo_pixels[loop.vertex_index]
        uvs.data[loop.index].uv = (px / width, 1 - py / height)
    material = bpy.data.materials.new("Photographed crest / modeling guide")
    material.diffuse_color = (.026, .68, .81, 1)
    material.use_nodes = True
    texture = material.node_tree.nodes.new("ShaderNodeTexImage")
    texture.image = original
    material.node_tree.links.new(texture.outputs["Color"], material.node_tree.nodes["Principled BSDF"].inputs["Base Color"])
    data.materials.append(material)
    solid = model.modifiers.new("Study surface thickness", "SOLIDIFY")
    solid.thickness = .045
    solid.offset = -1.
    for index, name in [(0, "First visible bank"), (2, "Opposite visible bank")]:
        make_guide(geometry, name, [row[index] for row in fit["worldSections"]], (.91, .12, .63))
    for key, name, color in [
        ("centre", "Existing gameplay centre", (1., .35, .055)),
        ("left", "Established hard-left trace", (.1, .61, .20)),
        ("right", "Established hard-right trace", (.62, .80, .06)),
    ]:
        make_guide(geometry, name, [row[key] for row in fit["centrelineAndLimits"]], color)
    cam = bpy.data.cameras.new("Original calibrated camera")
    cam.sensor_fit = "VERTICAL"
    cam.lens = cam.sensor_height / (2 * math.tan(math.radians(fit["fov"]) / 2))
    cam.clip_start = .05
    cam.clip_end = 500.
    camera_object = bpy.data.objects.new(cam.name, cam)
    geometry.objects.link(camera_object)
    three_matrix = Matrix([fit["camera"][j::4] for j in range(4)])
    axes = Matrix(((1,0,0,0),(0,0,-1,0),(0,1,0,0),(0,0,0,1)))
    camera_object.matrix_world = axes @ three_matrix
    scene.camera = camera_object
    layer = cam.background_images.new()
    layer.image = original
    layer.alpha = .3
    layer.show_background_image = False
    cam.show_background_images = True
    scene["status"] = "UNINTEGRATED GEOMETRY STUDY. The visible surface matches a silhouette and does not support the full steering envelope at these assumed depths."
    scene.display.shading.color_type = "MATERIAL"
    bpy.context.view_layer.update()
    errors = []
    for vertex, target in zip(vertices, photo_pixels):
        p = world_to_camera_view(scene, camera_object, Vector(vertex))
        errors.append(math.hypot(width*p.x-target[0], height*(1-p.y)-target[1]))
    if max(errors) > .02:
        raise ValueError(f"Incorrect camera reprojection: {max(errors):.4f} pixels")
    scene["maximum_camera_error_px"] = max(errors)
    bpy.ops.wm.save_as_mainfile(filepath=str(destination), compress=True)
    print(f"Saved {len(vertices)} world vertices. Maximum original camera reprojection error {max(errors):.6f} pixels.")


if __name__ == "__main__":
    build()
