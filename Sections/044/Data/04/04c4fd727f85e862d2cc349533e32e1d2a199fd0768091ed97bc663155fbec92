"""Refit the retained ride and reuse its separately surveyed curved drum in Screen 06.

Run with Blender 5.3.0 --background --python this_file -- GAME PREVIOUS_BLEND LAYOUT EDITABLE GLB.
The previous study is used only as an editable donor for the measured fittings and rounded bank foam.
"""
import json
import math
import ast
import sys
from pathlib import Path

import bpy
from mathutils import Vector


def gauss(value, centre, scale):
    return math.exp(-((value - centre) / scale) ** 2)


def smooth(edge0, edge1, value):
    t = max(0., min(1., (value - edge0) / (edge1 - edge0)))
    return t * t * (3. - 2. * t)


def write_grid(name, rows, material, collection, blender_point, role):
    columns = len(rows[0])
    mesh = bpy.data.meshes.new(name)
    faces = [(i, i + 1, i + columns + 1, i + columns)
             for start in range(0, (len(rows) - 1) * columns, columns)
             for i in range(start, start + columns - 1)]
    samples = [sample for row in rows for sample in row]
    mesh.from_pydata([blender_point(sample[0]) for sample in samples], [], faces)
    mesh.update()
    layer = mesh.uv_layers.new(name="Channel width and distance travelled")
    for face in mesh.polygons:
        face.use_smooth = True
    for i, loop in enumerate(mesh.loops):
        u, v = samples[loop.vertex_index][1]
        layer.data[i].uv = (u, 1. - v)
    obj = bpy.data.objects.new(name, mesh)
    obj["surface_family"] = role
    collection.objects.link(obj)
    mesh.materials.append(material)
    return obj


def preview_material(material, image_path, mapping, scale):
    texture = bpy.data.images.load(str(image_path), check_existing=True)
    texture.pack()
    nodes, links = material.node_tree.nodes, material.node_tree.links
    uv = nodes.new("ShaderNodeTexCoord")
    adjust = nodes.new("ShaderNodeVectorMath")
    adjust.operation = "MULTIPLY"
    adjust.inputs[1].default_value = (*scale, 1.)
    sample = nodes.new("ShaderNodeTexImage")
    sample.name = mapping
    sample.image = texture
    links.new(uv.outputs["UV"], adjust.inputs[0])
    links.new(adjust.outputs["Vector"], sample.inputs["Vector"])
    links.new(sample.outputs["Color"], nodes.get("Principled BSDF").inputs["Base Color"])


def main():
    game, donor, layout_file, edited, export = map(Path, sys.argv[sys.argv.index("--") + 1:])
    # Claudia's existing Screen 05 helper calls main() even on import. Load its two pure helpers
    # without running that scene builder or modifying the project script.
    helper_path = game / "tools/blender/build_05_river_scene.py"
    syntax = ast.parse(helper_path.read_text())
    syntax.body = [node for node in syntax.body if isinstance(node, ast.FunctionDef) and node.name in {"b", "mat"}]
    helpers = {"Vector": Vector, "bpy": bpy}
    exec(compile(syntax, str(helper_path), "exec"), helpers)
    blender_point, material = helpers["b"], helpers["mat"]
    layout = json.loads(layout_file.read_text())
    bpy.ops.wm.open_mainfile(filepath=str(donor))
    scene = bpy.context.scene
    # Remove the earlier experimental water from the opened, disposable copy of the editor scene.
    old = bpy.data.objects["RinseWater"]
    collection = old.users_collection[0]
    for name in ["RinseWater", "RinseBank_left", "RinseBank_right"]:
        bpy.data.objects.remove(bpy.data.objects[name], do_unlink=True)
    water = material("Screen 06 / gloss and ripples from original art", (.02, .68, .83, 1.))
    water.node_tree.nodes.get("Principled BSDF").inputs["Roughness"].default_value = .18
    preview_material(water, game / "assets/textures/match06/tile_river6.png",
                     "Native approved water, physical longitudinal scale", (1., .90))
    panel = bpy.data.objects["RinseWall"].data.materials[0]
    preview_material(panel, game / "assets/arched-passage06/panel.png",
                     "Approved purple perforations between collars", (3.0, .48))
    # The native gold arc at the fourth visible seat is about 54 px thick. Its prior
    # solid projected to 36.5 px. Expand the machined profile around the fixed drum seat.
    ring_factors = [1.36, 1.36, 1.36, 1.36, 1.45, 1.04, 1.28, 1.18, 1.18, 1.18, 1.18, 1.18]
    for index, (sec, factor) in enumerate(zip(layout["rings"], ring_factors)):
        obj = bpy.data.objects[f"RinseRing_{index:02}"]
        centre, tangent = blender_point(sec["p"]), blender_point(sec["t"])
        for vertex in obj.data.vertices:
            delta = vertex.co - centre
            axial = delta.dot(tangent)
            radial = delta - axial * tangent
            inset = min(0., radial.length - sec["radius"])
            vertex.co += radial.normalized() * (inset * (factor - 1.)) + tangent * (axial * (factor - 1.))
        obj.data.update()
        obj["profile_scale"] = factor
        obj["paint_profile"] = "Physical circumference and beveled section"
    stations = [row["distance"] for row in layout["rings"]]
    bpy.data.objects["RinseWall"]["seats"] = stations
    # The editable metal keeps the isolated photographed slot and its real recess. The glossy
    # purple base and large-scale reflections come from the material and studio illumination.
    slot_image = bpy.data.images.load(str(game / "assets/arched-passage06/slot.png"), check_existing=True)
    slot_image.colorspace_settings.name = "Non-Color"
    slot_image.pack()
    nodes, links = panel.node_tree.nodes, panel.node_tree.links
    sample = nodes.get("Approved purple perforations between collars")
    sample.image = slot_image
    sample.inputs["Vector"].links[0].from_node.inputs[1].default_value = (14. / 1.32, 1. / .86, 1.)
    depth = nodes.new("ShaderNodeSeparateColor")
    links.new(sample.outputs["Color"], depth.inputs["Color"])
    dye = nodes.new("ShaderNodeMixRGB")
    dye.inputs[1].default_value = (.47, .135, .61, 1.)
    dye.inputs[2].default_value = (.038, .007, .058, 1.)
    links.new(depth.outputs["Red"], dye.inputs[0])
    links.new(dye.outputs["Color"], nodes.get("Principled BSDF").inputs["Base Color"])
    preview_material(bpy.data.objects["RinseRing_00"].data.materials[0],
                     game / "assets/textures/match06/tile_ring6.png",
                     "Approved machined brass with pink-violet reflections", (4., 1.))
    shadow = material("Underside of rolled cyan and magenta crest", (.22, .105, .53, 1.))
    shadow.node_tree.nodes.get("Principled BSDF").inputs["Roughness"].default_value = .24
    river, banks, cheeks, distance, last = [], [[], []], [[], []], 0., None
    sections = layout["water"]
    for section in sections:
        s = section["s"]
        p, right, up = [Vector(section[key]) for key in ("p", "r", "u")]
        if last is not None:
            distance += (p - last).length
        last = p
        roll = gauss(s, 13.45, 3.35)
        # The underside falls away on the outside of the left-hand crest. Keep the real ride surface
        # at its recorded height along the centre and at the full-steering tracks.
        left = section["leftWidth"] + .27 * roll
        right_width = section["rightWidth"]
        row = []
        for j in range(49):
            fraction = j / 24. - 1.
            width = left if fraction < 0 else right_width
            lateral = fraction * width
            shoulder = smooth(3.02, max(3.15, width), abs(lateral))
            bank_height = section["leftRise" if fraction < 0 else "rightRise"] * .52 * shoulder
            swell = .78 * roll * gauss(lateral, -1.86, .58)
            ripple = .028 * math.sin(distance * 2.55 + lateral * 2.1) * smooth(.55, 1.85, abs(lateral))
            point = p + right * lateral + up * (bank_height + swell + ripple)
            row.append((point, ((fraction + 1.) / 2., distance)))
        river.append(row)
        for side, sign in enumerate([-1., 1.]):
            lip, uv = row[0 if side == 0 else -1]
            width = left if side == 0 else right_width
            drop = .22 + (.58 * roll if side == 0 else .12 * gauss(s, 16., 7.))
            profile = [(0., 0.), (.115, .035), (.16, -.035), (.095, -drop * .56), (-.13, -drop)]
            banks[side].append([(lip + sign * right * outward + up * vertical,
                                  (k / (len(profile) - 1), distance))
                                 for k, (outward, vertical) in enumerate(profile)])
            # The photographed arch has a perforated washer surface behind its return. Carry
            # that physical surface down from the rolled bank into the drum, outside steering.
            if -9. <= s <= 75.:
                drum = min(layout["drum"], key=lambda frame: (Vector(frame["p"]) - p).length_squared)
                axis_r, axis_u, hub = Vector(drum["r"]), Vector(drum["u"]), Vector(drum["p"])
                direction = sign * right * .62 - up * .79
                radial = lip - hub
                a0, b0 = radial.dot(axis_r), radial.dot(axis_u)
                da, db = direction.dot(axis_r), direction.dot(axis_u)
                aa, ab = da * da + db * db, a0 * da + b0 * db
                disc = max(0., ab * ab - aa * (a0 * a0 + b0 * b0 - drum["radius"] ** 2))
                length = max(.35, (-ab + math.sqrt(disc)) / max(1.e-5, aa))
                junction = lip + direction * length
                segment = []
                start = lip - up * drop + sign * right * .10
                for k in range(9):
                    t = k / 8.
                    pos = start.lerp(junction, t) + sign * right * (.24 * math.sin(math.pi*t))
                    segment.append((pos, ((sign * width + sign * t * length) / 14., distance)))
                cheeks[side].append(segment)
    write_grid("RinseWater", river, water, collection, blender_point, "water")
    for side, rows in enumerate(banks):
        write_grid(["RinseBank_left", "RinseBank_right"][side], rows, shadow, collection, blender_point, "bank")

        write_grid(["Left inner washer return", "Right inner washer return"][side],
                   cheeks[side], panel, collection, blender_point, "wall")

    # Paint the directly visible crest's low rounded lip into the channel, with metric UV coordinates.
    # The centre and the steering limits are inherited from the protected game, including the transition.
    scene.name = "Screen 06 / curved washer passage"
    scene.camera.data.sensor_fit = "VERTICAL"
    scene.camera.data.lens = scene.camera.data.sensor_height / (2. * math.tan(math.radians(31.)))
    original = bpy.data.images.load(str(game / "references/06_crest_the_rinse_arch.png"), check_existing=True)
    original.pack()
    scene.camera.data.show_background_images = True
    backdrop = scene.camera.data.background_images.new()
    backdrop.image = original
    backdrop.alpha = .25
    backdrop.show_background_image = False
    scene["design"] = "Independent curved metal shell and gold seats, rolled crest, metric water and outboard bank foam. Hidden geometry proposed for review."
    edited.parent.mkdir(parents=True, exist_ok=True)
    export.parent.mkdir(parents=True, exist_ok=True)
    # In Blender's editable file every ring is an independent object.
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(edited), compress=True)
    bpy.ops.object.select_all(action="DESELECT")
    meshes = [obj for obj in scene.objects if obj.type == "MESH"]
    for obj in meshes:
        obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(export), export_format="GLB", use_selection=True,
                              export_yup=True, export_texcoords=True, export_normals=True,
                              export_materials="PLACEHOLDER", export_extras=True,
                              export_cameras=False, export_animations=False)
    print("CREST_PASSAGE", len(meshes), "mesh objects", len(sections), "sections", export.stat().st_size, "GLB bytes")


if __name__ == "__main__":
    main()
