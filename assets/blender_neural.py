import bpy
import math
import random
import os

# === Neural Network background generator for portfolio-hub ===
# Blender 5.x / Cycles low-samples render

SEED = 42
random.seed(SEED)

# Purge default
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'GPU' if bpy.context.preferences.addons['cycles'].preferences.has_active_device() else 'CPU'
scene.cycles.samples = 64
scene.cycles.use_denoising = True
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 50
scene.render.fps = 30

# World
world = bpy.data.worlds.new('DarkWorld')
scene.world = world
world.use_nodes = True
wn = world.node_tree.nodes
wn.clear()
wn_bg = wn.new('ShaderNodeBackground')
wn_out = wn.new('ShaderNodeOutputWorld')
wn_bg.inputs['Color'].default_value = (0.04, 0.04, 0.04, 1.0)
wn_bg.inputs['Strength'].default_value = 1.0
world.node_tree.links.new(wn_bg.outputs[0], wn_out.inputs[0])

# Camera
bpy.ops.object.camera_add(location=(0, -12, 3.5))
cam = bpy.context.active_object
cam.rotation_euler = (math.radians(75), 0, 0)
scene.camera = cam

# Gold material
mat_gold = bpy.data.materials.new(name='GoldNode')
mat_gold.use_nodes = True
mn = mat_gold.node_tree.nodes
mn.clear()
mn_out = mn.new('ShaderNodeOutputMaterial')
mn_prin = mn.new('ShaderNodeBsdfPrincipled')
mn_prin.inputs['Base Color'].default_value = (0.655, 0.545, 0.443, 1.0)  # #a78b71
mn_prin.inputs['Metallic'].default_value = 1.0
mn_prin.inputs['Roughness'].default_value = 0.35
mn_prin.inputs['Emission Strength'].default_value = 0.15
mn_prin.inputs['Emission Color'].default_value = (0.78, 0.65, 0.5, 1.0)
mat_gold.node_tree.links.new(mn_prin.outputs[0], mn_out.inputs[0])

# Dim node material
mat_dim = bpy.data.materials.new(name='DimNode')
mat_dim.use_nodes = True
md = mat_dim.node_tree.nodes
md.clear()
md_out = md.new('ShaderNodeOutputMaterial')
md_prin = md.new('ShaderNodeBsdfPrincipled')
md_prin.inputs['Base Color'].default_value = (0.12, 0.12, 0.12, 1.0)
md_prin.inputs['Metallic'].default_value = 0.8
md_prin.inputs['Roughness'].default_value = 0.5
mat_dim.node_tree.links.new(md_prin.outputs[0], md_out.inputs[0])

# Central node
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=0.55, location=(0, 0, 0))
central = bpy.context.active_object
central.data.materials.append(mat_gold)
bpy.ops.object.light_add(type='POINT', location=(0, -2, 1))
light = bpy.context.active_object
light.data.energy = 60
light.data.color = (0.78, 0.65, 0.5)

# Ring of nodes
NODE_COUNT = 24
nodes = []
for i in range(NODE_COUNT):
    angle = i / NODE_COUNT * math.tau
    radius = random.uniform(4.5, 7.5)
    height = random.uniform(-2.5, 3.5)
    x = math.cos(angle) * radius
    y = math.sin(angle) * radius * 0.4
    z = height
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=random.uniform(0.08, 0.2), location=(x, y, z))
    node = bpy.context.active_object
    node.data.materials.append(mat_gold if i % 4 == 0 else mat_dim)
    nodes.append((node, (x, y, z)))

# Connecting curves from central to each node
for node, pos in nodes:
    bpy.ops.curve.primitive_bezier_curve_add(location=(0, 0, 0))
    curve = bpy.context.active_object
    spline = curve.data.splines[0]
    p0 = spline.bezier_points[0]
    p1 = spline.bezier_points[1]
    p0.co = (0, 0, 0)
    p1.co = pos
    # handles
    mid = tuple(0.5 * a for a in pos)
    p0.handle_right = mid
    p1.handle_left = mid
    curve.data.bevel_depth = 0.015
    curve.data.bevel_resolution = 2
    # Curve material
    cm = bpy.data.materials.new(name=f'GoldLine_{node.name}')
    cm.use_nodes = True
    cn = cm.node_tree.nodes
    cn.clear()
    cn_out = cn.new('ShaderNodeOutputMaterial')
    cn_em = cn.new('ShaderNodeEmission')
    cn_em.inputs['Color'].default_value = (0.655, 0.545, 0.443, 1.0)
    cn_em.inputs['Strength'].default_value = 0.8
    cm.node_tree.links.new(cn_em.outputs[0], cn_out.inputs[0])
    curve.data.materials.append(cm)

# Floating squares (cubes) scattered
for _ in range(18):
    x = random.uniform(-9, 9)
    y = random.uniform(-5, 5)
    z = random.uniform(-3, 5)
    size = random.uniform(0.08, 0.25)
    bpy.ops.mesh.primitive_cube_add(size=size, location=(x, y, z))
    cube = bpy.context.active_object
    cube.rotation_euler = (random.random()*math.tau, random.random()*math.tau, random.random()*math.tau)
    cube.data.materials.append(mat_gold if random.random() > 0.6 else mat_dim)

# Key light
bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))
sun = bpy.context.active_object
sun.data.energy = 2.5
sun.data.color = (0.95, 0.9, 0.85)

# Output - render single frame as hero still
scene.frame_set(1)
out_dir = os.path.dirname(bpy.data.filepath) if bpy.data.filepath else os.getcwd()
scene.render.image_settings.file_format = 'WEBP'
scene.render.filepath = os.path.join(out_dir, 'neural_hero_')
bpy.ops.render.render(write_still=True)
print('Rendered:', scene.render.filepath)
