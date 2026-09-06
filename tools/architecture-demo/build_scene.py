"""Author the reusable assurance-platform scene in Blender; export an optimized GLB.
Run: Blender --background --python tools/architecture-demo/build_scene.py
"""
import bpy, json, math
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
DATA=json.loads((ROOT/'assets/data/architecture-demo.json').read_text())
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for b in list(bpy.data.materials):bpy.data.materials.remove(b)
def xyz(v): return (v[0],-v[2],v[1])
def material(name,color,metal=0,rough=.35,emission=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 if emission:p.inputs['Emission Color'].default_value=(*color,1);p.inputs['Emission Strength'].default_value=emission
 return m
ivory=material('Porcelain',(0.68,.79,.76),.28,.28)
navy=material('Deep ceramic',(.021,.06,.074),.4,.31)
teal=material('Brushed teal',(.035,.36,.31),.55,.3)
gold=material('Brushed brass',(.55,.34,.105),.7,.29)
light=material('Signal mint',(.10,.84,.61),.1,.25,2)
white=material('Signal ivory',(.69,.95,.83),.1,.25,1.3)
slate=material('Plinth basalt',(.015,.037,.049),.22,.44)
glass=material('Smoked teal',(.06,.20,.22),.55,.19)
def finish(o,name,mat,parent=None):
 o.name=name;o.data.materials.append(mat)
 if parent:o.parent=parent
 if o.type=='MESH':
  for p in o.data.polygons:p.use_smooth=True
 return o
def box(name,dims,pos,mat,parent=None,bevel=.10):
 bpy.ops.mesh.primitive_cube_add(size=1,location=xyz(pos));o=bpy.context.object;o.dimensions=(dims[0],dims[2],dims[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  mod=o.modifiers.new('Machined radius','BEVEL');mod.width=bevel;mod.segments=3
  bpy.ops.object.modifier_apply(modifier=mod.name)
 return finish(o,name,mat,parent)
def cylinder(name,r,depth,pos,mat,parent=None):
 bpy.ops.mesh.primitive_cylinder_add(vertices=40,radius=r,depth=depth,location=xyz(pos));o=bpy.context.object
 b=o.modifiers.new('Soft lip','BEVEL');b.width=.045;b.segments=3;bpy.ops.object.modifier_apply(modifier=b.name)
 return finish(o,name,mat,parent)
def sphere(name,r,pos,mat,parent=None,ico=False):
 if ico:bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=r,location=xyz(pos))
 else:bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,radius=r,location=xyz(pos))
 return finish(bpy.context.object,name,mat,parent)
def ring(name,r,pos,mat,parent=None,angle=None):
 bpy.ops.mesh.primitive_torus_add(major_segments=48,minor_segments=8,location=xyz(pos),major_radius=r,minor_radius=.045);o=bpy.context.object
 if angle:o.rotation_euler=angle
 return finish(o,name,mat,parent)
def text(name,body,size,pos,mat,parent=None):
 bpy.ops.object.text_add(location=xyz(pos));o=bpy.context.object;o.name=name;o.data.body=body;o.data.size=size;o.data.align_x='CENTER';o.data.extrude=.001
 bpy.ops.object.convert(target='MESH');return finish(bpy.context.object,name,mat,parent)
def line(name,points,mat,r=.025,parent=None):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=2;s=c.splines.new('POLY');s.points.add(len(points)-1)
 for p,v in zip(s.points,points):p.co=(*xyz(v),1)
 o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.data.materials.append(mat)
 if parent:o.parent=parent
 return o
box('Foundation',(21.5,.55,15.2),(0,-.35,.65),slate,bevel=.35)
box('Inset surface',(20.9,.08,14.6),(0,-.03,.65),navy,bevel=.2)
for z in [-6.45,7.8]:line('Perimeter light',[[-10,.08,z],[10,.08,z]],teal,.025)
for x in [-10,10]:line('Perimeter light',[[x,.08,-6.45],[x,.08,7.8]],teal,.025)
for i,node in enumerate(DATA['nodes']):
 root=bpy.data.objects.new('module_'+node['id'],None);root['nodeId']=node['id'];root.location=xyz(node['position']);bpy.context.collection.objects.link(root)
 box('base_'+node['id'],(3.25,.24,2.35),(0,.17,0),ivory,root,.12)
 box('trim_'+node['id'],(3.05,.055,2.15),(0,.305,0),teal,root,.05)
 box('deck_'+node['id'],(2.90,.10,2.0),(0,.38,0),navy,root,.06)
 text('ID_'+node['id'],str(i+1).zfill(2),.19,(-1.21,.32,1.00),gold,root)
 k=node['id']
 if k in ['experience','delivery']:
  if k=='experience':
   box('Terminal',(1.70,1.08,.17),(0,1.08,-.20),ivory,root)
   box('Screen',(1.47,.82,.04),(0,1.10,-.10),glass,root,.02)
   for j in range(4):box('Code line',(.9-j*.12,.035,.02),(-.15,1.33-j*.16,-.071),light,root,.005)
   box('Keyboard',(1.50,.09,.57),(0,.53,.55),ivory,root,.04)
  else:
   for j in range(3):
    box('Server', (1.7,.38,1.2),(0,.65+j*.44,0),ivory,root,.07)
    for x in [-.55,-.35,-.15]:sphere('Status',.035,(x,.65+j*.44,.62),light,root)
 elif k=='context':
  for j in range(4):box('Versioned layer',(1.85,.17,1.35),((j%2)*.12,.58+j*.28,0),ivory if j!=2 else teal,root,.045)
 elif k=='runtime':
  cylinder('Engine pedestal',.9,.23,(0,.59,0),gold,root)
  sphere('Inference core',.59,(0,1.36,0),light,root,True)
  for a in [(math.pi/2,0,0),(math.pi/2,math.pi/2,0),(0,0,0)]:ring('Compute cage',.90,(0,1.36,0),ivory,root,a)
 elif k=='gateway':
  for x in [-.79,.79]:box('Authority pillar',(.30,1.72,.7),(x,1.25,0),ivory,root)
  box('Authority lintel',(1.85,.3,.7),(0,2.02,0),gold,root)
  box('Permission field',(1.19,1.30,.10),(0,1.23,0),glass,root,.025)
  for x in [-.36,0,.36]:box('Scope line',(.025,1.13,.12),(x,1.22,.10),light,root,.008)
 elif k=='checks':
  for x in [-.52,.52]:
   box('Test chamber',(.85,1.10,1.04),(x,.99,0),ivory,root,.12)
   box('Test window',(.65,.76,.08),(x,1.06,.54),glass,root,.05)
   line('Check mark',[[x-.2,1.03,.60],[x-.04,.88,.60],[x+.23,1.25,.60]],light,.045,root)
 elif k=='application':
  for x,z in [(-.5,0),(.5,-.27),(0,.55)]:
   box('AI component',(.7,.7,.7),(x,.88,z),teal,root,.13)
   sphere('Application port',.09,(x,1.3,z),light,root)
 elif k=='evidence':
  for j in range(4):
   cylinder('Receipt layer',.81,.23,(0,.59+j*.27,0),ivory,root)
   ring('Integrity ring',.80,(0,.70+j*.27,0),light if j==3 else teal,root)
 elif k=='corpus':
  for j in range(5):
   box('Case card',(.27,1.20,1.22),(-.66+j*.33,1.04,0),ivory if j%2==0 else teal,root,.045)
   box('Case tab',(.25,.14,.24),(-.66+j*.33,1.7,-.37),gold,root,.025)
 elif k=='release':
  cylinder('Review dais',.8,.20,(0,.57,0),gold,root)
  cylinder('Owner body',.24,.63,(0,1.02,.05),ivory,root)
  sphere('Owner head',.22,(0,1.57,.05),ivory,root)
  ring('Independent gate',.79,(0,1.21,-.24),teal,root,(math.pi/2,0,0))
 elif k=='evaluation':
  cylinder('Evaluation base',.88,.19,(0,.57,0),ivory,root)
  for j in range(3):ring('Evaluation lens',.64+j*.07,(0,.93+j*.31,0),light if j==1 else gold,root)
  sphere('Evaluation target',.32,(0,1.40,0),teal,root,True)
# Export only the authored reusable model. Browser routes and labels stay crisp at every resolution.
model=ROOT/'assets/models/assurance-platform.glb'
bpy.ops.export_scene.gltf(filepath=str(model),export_format='GLB',export_animations=False,export_extras=True,export_cameras=False,export_lights=False)
# The editable Blender file also contains a native animated camera and flow packets.
for route in DATA['routes']:line('route_'+route['id'],route['points'],teal,.032)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=32;scene.render.resolution_x=1600;scene.render.resolution_y=900;scene.render.resolution_percentage=100;scene.render.fps=24
scene.world.color=(.10,.10,.10)
for name,loc,power,size in [('Key',(-5,4,13),2200,8),('Fill',(7,-5,9),1500,7),('Rim',(2,8,7),1800,5)]:
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(16,-23,23));camera=bpy.context.object;camera.name='Cinematic camera';camera.data.type='ORTHO';camera.data.ortho_scale=28;scene.camera=camera
focus=bpy.data.objects.new('Camera focus',None);bpy.context.collection.objects.link(focus);focus.location=(0,-.4,.5)
c=camera.constraints.new(type='TRACK_TO');c.target=focus;c.track_axis='TRACK_NEGATIVE_Z';c.up_axis='UP_Y'
scene.frame_start=1;scene.frame_end=840
for frame,loc in [(1,(16,-23,23)),(420,(12,-25,22)),(840,(16,-23,23))]:camera.location=loc;camera.keyframe_insert(data_path='location',frame=frame)
route_map={r['id']:r for r in DATA['routes']};offset=1
for index,step in enumerate(DATA['scenarios'][0]['steps']):
 scene.timeline_markers.new(step['title'],frame=offset)
 for rid in step['routes']:
  points=route_map[rid]['points'];packet=sphere('signal_'+str(index)+'_'+rid,.14,points[0],white)
  # Scale keyframes isolate each route's active interval without hiding context paths.
  for f,scale in [(1,0),(offset-1,0),(offset,1),(offset+105,1),(offset+106,0)]:packet.scale=(scale,)*3;packet.keyframe_insert(data_path='scale',frame=max(1,f))
  lengths=[0]
  for a,b in zip(points,points[1:]):lengths.append(lengths[-1]+(Vector(a)-Vector(b)).length)
  for point,d in zip(points,lengths):packet.location=xyz(point);packet.keyframe_insert(data_path='location',frame=offset+int(105*d/lengths[-1]))
 offset+=120
scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets/models/assurance-platform.blend'),compress=True)
print('Authored',len(DATA['nodes']),'modules;',model.stat().st_size,'GLB bytes')
