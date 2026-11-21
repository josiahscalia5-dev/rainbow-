"""
Screen 05 proof render: the Blender camera-lock LAYOUT by itself (no reference image anywhere).

    blender -b qa/pilot05/wave6/camera_lock/screen05_camera_lock.blend --python tools/blender/render_05_proof.py -- \
        --out qa/pilot05/wave6/proof/2_blender_layout.png [--samples 48]

What it shows (honestly labelled "geometry layout"): the game's own 05 river surface (River05, vertex
colours = cyan core / pink bands from the game's coreLateral), the straight 05 tunnel cylinder (Tunnel05)
with its ring markers (RingMarks05, every 6 u — alignment marks, not the game's ring bands), the game's
05 coin anchors (GameCoin05_*) — all from Cam05 = the exact locked game camera, 864×1536.
Not in this file: Benny, foam, bubbles, the forced-perspective far tunnel, the game's wall/ring/water
shaders. The camera background image is switched OFF and the RefCoin05 markers (reference
back-projections) are hidden, so nothing from the approved image appears in the render.
Plain materials, Cycles CPU: violet metal tunnel, gold markers/coins, emissive river vertex colours.
"""
import argparse
import os
import sys

import bpy


def args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--samples", type=int, default=48)
    return ap.parse_args(argv)


def mat(name, base, metallic=0.0, rough=0.4, emit=None, emit_strength=0.0, vcol=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = base
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = rough
    if vcol:
        a = nt.nodes.new("ShaderNodeVertexColor")
        a.layer_name = vcol
        nt.links.new(a.outputs["Color"], bsdf.inputs["Base Color"])
        nt.links.new(a.outputs["Color"], bsdf.inputs["Emission Color"])
        bsdf.inputs["Emission Strength"].default_value = emit_strength
    elif emit:
        bsdf.inputs["Emission Color"].default_value = emit
        bsdf.inputs["Emission Strength"].default_value = emit_strength
    return m


def main():
    a = args()
    scn = bpy.context.scene
    cam = scn.camera
    cam.data.show_background_images = False
    for bg in list(cam.data.background_images):
        cam.data.background_images.remove(bg)
    for ob in bpy.data.objects:
        if ob.name.startswith("RefCoin05_"):
            ob.hide_render = True
    violet = mat("proof_tunnel", (0.42, 0.10, 0.55, 1), metallic=0.85, rough=0.32, emit=(0.35, 0.06, 0.45, 1), emit_strength=0.25)
    gold = mat("proof_gold", (1.0, 0.70, 0.18, 1), metallic=1.0, rough=0.22, emit=(1.0, 0.6, 0.15, 1), emit_strength=0.35)
    for ob in bpy.data.objects:
        if ob.type != "MESH":
            continue
        n = ob.name
        if n.startswith("River05"):
            vc = ob.data.color_attributes[0].name if ob.data.color_attributes else None
            m = mat("proof_river", (0.0, 0.6, 1.0, 1), rough=0.15, vcol=vc, emit_strength=0.9)
        elif n.startswith("Tunnel05"):
            m = violet
        elif n.startswith(("RingMarks05", "GameCoin05_")):
            m = gold
        else:
            continue
        ob.data.materials.clear()
        ob.data.materials.append(m)
    # light: a warm point at the far end of the tunnel (the game's VP light) + a soft fill at the camera
    far = bpy.data.lights.new("proof_far", "POINT")
    far.energy = 60000
    far.color = (1.0, 0.82, 0.55)
    fo = bpy.data.objects.new("proof_far", far)
    fo.location = cam.matrix_world @ __import__("mathutils").Vector((0, 0, -90))
    scn.collection.objects.link(fo)
    fill = bpy.data.lights.new("proof_fill", "POINT")
    fill.energy = 2500
    fl = bpy.data.objects.new("proof_fill", fill)
    fl.location = cam.matrix_world.translation
    scn.collection.objects.link(fl)
    w = scn.world or bpy.data.worlds.new("proof_world")
    scn.world = w
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = (0.03, 0.0, 0.05, 1)
    scn.render.engine = "CYCLES"
    scn.cycles.device = "CPU"
    scn.cycles.samples = a.samples
    scn.cycles.use_denoising = True
    scn.render.film_transparent = False
    scn.view_settings.view_transform = "Standard"
    scn.render.resolution_percentage = 100
    scn.render.filepath = os.path.abspath(a.out)
    os.makedirs(os.path.dirname(scn.render.filepath), exist_ok=True)
    bpy.ops.render.render(write_still=True)
    print("PROOF_RENDER_OK", scn.render.filepath, scn.render.resolution_x, scn.render.resolution_y)


main()
