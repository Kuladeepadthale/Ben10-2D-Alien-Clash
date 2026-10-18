"""Build and bake an original-classic-inspired Heatblast animation pilot in Blender 4.3.
Run with Python 3.11 plus bpy. No existing game animation or third-party model is used.
"""
import bpy, math, json, os, sys
from mathutils import Vector, Quaternion, Matrix
from bpy_extras.object_utils import world_to_camera_view
from pathlib import Path
from math import sin,cos,pi,sqrt
OUT=Path(os.environ.get('HEATBLAST_OUT','tmp/heatblast-model'));OUT.mkdir(parents=True,exist_ok=True)
CELL=int(os.environ.get('HEATBLAST_CELL','224'));PREVIEW=os.environ.get('HEATBLAST_PREVIEW','0')=='1'
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.render.engine='CYCLES' if os.environ.get('HEATBLAST_CYCLES') else 'BLENDER_EEVEE_NEXT'
scene.render.resolution_x=scene.render.resolution_y=CELL;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.film_transparent=True
scene.render.image_settings.color_mode='RGBA';scene.view_settings.view_transform='Standard';scene.view_settings.look='Medium High Contrast';scene.render.fps=30;scene.eevee.taa_render_samples=4
scene.world.color=(.4,.4,.4)
# A cel material, with model-local stable lava plates rather than per-frame textures.
def material(name,color,cracks=False):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;n.clear();out=n.new('ShaderNodeOutputMaterial');em=n.new('ShaderNodeEmission');l.new(em.outputs[0],out.inputs['Surface']);em.inputs['Color'].default_value=(*color,1)
 if cracks:
  tex=n.new('ShaderNodeAttribute');tex.attribute_name='rest_position';vor=n.new('ShaderNodeTexVoronoi');vor.feature='DISTANCE_TO_EDGE';vor.inputs['Scale'].default_value=3.6;vor.inputs['Randomness'].default_value=.86;l.new(tex.outputs['Vector'],vor.inputs['Vector']);r=n.new('ShaderNodeValToRGB');r.color_ramp.interpolation='CONSTANT';r.color_ramp.elements[0].position=.027;r.color_ramp.elements[0].color=(1,.88,.32,1);r.color_ramp.elements[1].position=.032;r.color_ramp.elements[1].color=(*color,1);l.new(vor.outputs['Distance'],r.inputs[0]);l.new(r.outputs[0],em.inputs['Color'])
 return m
rock=material('Dark crimson rock with pale-yellow molten seams',(.42,.006,.003),True);gold=material('Pale yellow living flame',(1,.88,.34));cream=material('Flame core',(1,.98,.65));red=material('Original crimson face',(.42,.004,.002));black=material('Cartoon outline',(.012,.009,.006));white=material('Omnitrix white',(.85,.87,.81));gray=material('Omnitrix rim',(.13,.15,.13));black.use_backface_culling=True;badgeink=material('Flat emblem ink',(.012,.009,.006))
LEG_TWIST=math.atan2(.783,.621)
def legpoint(p):
 v=Matrix.Rotation(LEG_TWIST,4,'Z')@Vector(p);sgn=-1 if p[0]<0 else 1;return v+Vector((sgn*.13*.783,-sgn*.13*.621,0))
# Actual skeletal hierarchy. Mesh parts have armature deformation and overlap inside sockets.
arm=bpy.data.armatures.new('Heatblast anatomy');rig=bpy.data.objects.new('Heatblast skeletal rig',arm);bpy.context.collection.objects.link(rig);bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
def bone(name,a,b,parent=None):
 q=arm.edit_bones.new(name);isleg=any(name.endswith('_'+k) for k in ['thigh','shin','foot']);q.head=legpoint(a) if isleg else a;q.tail=legpoint(b) if isleg else b
 if parent:q.parent=arm.edit_bones[parent]
 return q
bone('pelvis',(0,0,.99),(0,0,1.15));bone('spine',(0,0,1.15),(0,0,1.58),'pelvis');bone('head',(0,0,1.58),(0,0,2.12),'spine')
for side,sgn in [('left',-1),('right',1)]:
 bone(side+'_upper',(sgn*.28,0,1.66),(sgn*.36,0,1.32),'spine');bone(side+'_fore',(sgn*.36,0,1.32),(sgn*.38,0,.99),side+'_upper');bone(side+'_hand',(sgn*.38,0,.99),(sgn*.38,-.01,.86),side+'_fore')
 bone(side+'_thigh',(sgn*.14,0,.99),(sgn*.15,0,.55),'pelvis');bone(side+'_shin',(sgn*.15,0,.55),(sgn*.15,0,.12),side+'_thigh');bone(side+'_foot',(sgn*.15,0,.12),(sgn*.15,-.18,.06),side+'_shin')
 for i in range(4):
  x=sgn*.38+(i-1.5)*.039;z=.89-(.015 if i in [0,3] else 0)
  bone(side+'_finger'+str(i),(x,-.015,z),(x,-.025,z-.082),side+'_hand');bone(side+'_tip'+str(i),(x,-.025,z-.082),(x,-.035,z-.14),side+'_finger'+str(i))
bpy.ops.object.mode_set(mode='OBJECT');rig.select_set(False)
for b in rig.pose.bones:b.rotation_mode='XYZ'
objects=[]
def skin(obj,bname,mat,outline=True):
 if any(bname.endswith('_'+k) for k in ['thigh','shin','foot']):obj.data.transform(Matrix.Translation(Vector(((-1 if bname.startswith('left') else 1)*.13*.783,(-1 if bname.startswith('left') else 1)*-.13*.621,0)))@Matrix.Rotation(LEG_TWIST,4,'Z'))
 attr=obj.data.attributes.new('rest_position','FLOAT_VECTOR','POINT')
 for i,vertex in enumerate(obj.data.vertices):attr.data[i].vector=vertex.co
 obj.data.materials.append(mat);g=obj.vertex_groups.new(name=bname);g.add(list(range(len(obj.data.vertices))),1,'REPLACE');mod=obj.modifiers.new('Skeletal deformation','ARMATURE');mod.object=rig
 if outline:
  obj.data.materials.append(black);mod=obj.modifiers.new('Cartoon ink silhouette','SOLIDIFY');mod.thickness=.005;mod.offset=1;mod.use_flip_normals=True;mod.material_offset=1;mod.material_offset_rim=1
 objects.append(obj);return obj

def ellipsoid(name,center,scale,bname,mat,segments=16,rings=10,outline=True):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=center);o=bpy.context.object;o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=True,rotation=True,scale=True);return skin(o,bname,mat,outline)
def limb(name,a,b,r1,r2,bname,mat):
 a,b=Vector(a),Vector(b);d=b-a;axis=d.normalized();u=axis.cross(Vector((0,1,0))).normalized();v=axis.cross(u);verts=[];N=12
 for t,r in [(0,r1*.7),(.12,r1),(.78,r2),(1,r2*.7)]:
  for j in range(N):verts.append(a+d*t+(u*cos(j*2*pi/N)+v*sin(j*2*pi/N))*r)
 faces=[]
 for k in range(3):
  for j in range(N):faces.append((k*N+j,k*N+(j+1)%N,(k+1)*N+(j+1)%N,(k+1)*N+j))
 faces.extend([tuple(range(N-1,-1,-1)),tuple(3*N+j for j in range(N))]);mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);return skin(o,bname,mat)
def polygon(name,coords,depth,bname,mat):
 verts=[(x,depth,z) for x,z in coords];mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],[tuple(range(len(verts)))]);mesh.update();o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);return skin(o,bname,mat,False)
# Connected torso: a faceted muscular silhouette matching the classic proportions.
verts=[];faces=[];R=16
for z,rx,ry in [(.94,.15,.10),(1.04,.20,.125),(1.23,.18,.12),(1.45,.25,.16),(1.61,.29,.155),(1.71,.23,.12)]:
 for i in range(R):verts.append((rx*cos(i*2*pi/R),ry*sin(i*2*pi/R),z))
for k in range(5):
 for i in range(R):faces.append((k*R+i,k*R+(i+1)%R,(k+1)*R+(i+1)%R,(k+1)*R+i))
faces.extend([tuple(range(R-1,-1,-1)),tuple(5*R+i for i in range(R))]);me=bpy.data.meshes.new('Continuous chest and waist');me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new('Classic molten-rock torso',me);bpy.context.collection.objects.link(o)
# Torso weights change continuously from pelvis to chest.
o.data.materials.append(rock);o.data.materials.append(black)
attr=o.data.attributes.new('rest_position','FLOAT_VECTOR','POINT')
for i,vertex in enumerate(o.data.vertices):attr.data[i].vector=vertex.co
for bn in ['pelvis','spine']:o.vertex_groups.new(name=bn)
for i,v in enumerate(verts):
 w=max(0,min(1,(v[2]-1.04)/.32));o.vertex_groups['spine'].add([i],max(.00001,w),'REPLACE');o.vertex_groups['pelvis'].add([i],max(.00001,1-w),'REPLACE')
mod=o.modifiers.new('Continuous torso skin','ARMATURE');mod.object=rig;mod=o.modifiers.new('Ink edge','SOLIDIFY');mod.thickness=.005;mod.offset=1;mod.use_flip_normals=True;mod.material_offset=1;objects.append(o)
ellipsoid('Molten neck',(0,0,1.77),(.10,.10,.13),'head',rock)
for side,sgn in [('left',-1),('right',1)]:
 ellipsoid(side+' shoulder',(sgn*.28,0,1.64),(.135,.135,.15),side+'_upper',rock)
 limb(side+' upper arm',(sgn*.28,0,1.64),(sgn*.36,0,1.31),.105,.073,side+'_upper',rock)
 ellipsoid(side+' elbow',(sgn*.36,0,1.32),(.077,.077,.08),side+'_fore',gold)
 limb(side+' broad forearm',(sgn*.36,0,1.32),(sgn*.38,0,.99),.105,.075,side+'_fore',rock)
 ellipsoid(side+' wrist',(sgn*.38,0,.99),(.073,.065,.075),side+'_hand',gold)
 ellipsoid(side+' flaming palm',(sgn*.38,0,.91),(.085,.056,.105),side+'_hand',gold)
 ellipsoid(side+' palm rock',(sgn*.38,-.057,.94),(.057,.014,.055),side+'_hand',red,outline=False)
 for i in range(4):
  x=sgn*.38+(i-1.5)*.039;z=.89-(.015 if i in [0,3] else 0)
  limb(side+' finger '+str(i),(x,-.015,z),(x,-.025,z-.082),.023,.021,side+'_finger'+str(i),gold)
  ellipsoid(side+' knuckle '+str(i),(x,-.025,z-.082),(.021,.023,.023),side+'_tip'+str(i),gold,segments=10,rings=6)
  limb(side+' fingertip '+str(i),(x,-.025,z-.082),(x,-.035,z-.14),.021,.013,side+'_tip'+str(i),gold)
 # Thumb, attached to the hand and visible from the side.
 limb(side+' thumb',(sgn*.38-sgn*.065,-.02,.94),(sgn*.38-sgn*.105,-.07,.87),.028,.021,side+'_hand',gold)
 ellipsoid(side+' hip',(sgn*.14,0,.98),(.12,.12,.13),side+'_thigh',rock)
 limb(side+' thigh',(sgn*.14,0,.99),(sgn*.15,0,.55),.115,.076,side+'_thigh',rock)
 ellipsoid(side+' knee',(sgn*.15,0,.55),(.078,.078,.084),side+'_shin',gold)
 limb(side+' shin',(sgn*.15,0,.55),(sgn*.15,0,.12),.091,.052,side+'_shin',gold)
 ellipsoid(side+' shin plate',(sgn*.15,-.068,.42),(.065,.022,.10),side+'_shin',red)
 ellipsoid(side+' ankle',(sgn*.15,0,.12),(.06,.066,.068),side+'_foot',gold)
 ellipsoid(side+' living-flame foot',(sgn*.15,-.075,.055),(.079,.16,.055),side+'_foot',gold)
 ellipsoid(side+' foot plate',(sgn*.15,-.11,.103),(.055,.075,.009),side+'_foot',red,outline=False)
# Flame head and original crimson mask. Volume and raised face details, not an image card.
ellipsoid('Flame head core',(0,-.003,2.035),(.125,.105,.19),'head',gold)
flame=[(-.09,1.89),(-.15,1.97),(-.18,2.09),(-.16,2.17),(-.12,2.13),(-.16,2.29),(-.08,2.22),(-.11,2.39),(-.035,2.31),(-.03,2.49),(.035,2.40),(.05,2.29),(.10,2.37),(.14,2.26),(.105,2.21),(.18,2.16),(.16,2.03),(.11,1.91)]
# Curved, closed flame volume with pointed tips instead of a stair-stepped polygon.
flame=[(-.09,1.89),(-.17,2.02),(-.155,2.13),(-.19,2.23),(-.11,2.19),(-.10,2.31),(-.13,2.40),(-.04,2.35),(-.06,2.50),(.015,2.44),(.055,2.33),(.11,2.39),(.135,2.27),(.10,2.22),(.18,2.14),(.16,2.02),(.10,1.91)]
def flame_volume(name,scale,depth,mat):
 cu=bpy.data.curves.new(name,'CURVE');cu.dimensions='2D';cu.fill_mode='BOTH';cu.extrude=.028;cu.resolution_u=12;sp=cu.splines.new('BEZIER');sp.bezier_points.add(len(flame)-1)
 for i,(pt,(x,z)) in enumerate(zip(sp.bezier_points,flame)):
  pt.co=(x*scale,(z-2.13)*scale+2.13,0);pt.handle_left_type=pt.handle_right_type='AUTO'
  if i in [3,6,8,11,14]:pt.handle_left_type=pt.handle_right_type='VECTOR'
 sp.use_cyclic_u=True;o=bpy.data.objects.new(name,cu);bpy.context.collection.objects.link(o);o.rotation_euler[0]=pi/2;o.location.y=depth;bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');bpy.ops.object.transform_apply(location=True,rotation=True,scale=True);o.select_set(False);skin(o,'head',mat,False)
flame_volume('Sculpted curved yellow flame',1,0,gold);flame_volume('Pale inner flame core',.84,-.065,cream)
polygon('Crimson facial plate',[(-.105,2.13),(-.06,2.18),(-.015,2.13),(.045,2.17),(.10,2.12),(.087,2.01),(.045,1.95),(-.04,1.95),(-.095,2.01)],-.116,'head',red)
polygon('Left flame eye',[(-.078,2.095),(-.022,2.073),(-.033,2.045),(-.065,2.06)],-.119,'head',cream)
polygon('Right flame eye',[(.02,2.073),(.078,2.095),(.064,2.06),(.033,2.045)],-.119,'head',cream)
polygon('Flame mouth',[(-.035,2.004),(.035,2.004),(.023,1.985),(-.022,1.985)],-.12,'head',cream)
# Preserve the actual classic illustrated head as a facial/flame decal over the
# rigged head volume. A hybrid decal avoids inventing a replacement cartoon face.
for obj in objects:
 if obj.name.startswith(('Sculpted curved','Pale inner','Crimson facial','Left flame eye','Right flame eye','Flame mouth')):obj.hide_render=True
ref=bpy.data.images.load(str(Path('tmp/heatblast-model/original-portrait.png').resolve()));ref.pack();m=bpy.data.materials.new('Original classic Heatblast head artwork');m.use_nodes=True;m.surface_render_method='DITHERED';n=m.node_tree.nodes;l=m.node_tree.links;n.clear();out=n.new('ShaderNodeOutputMaterial');mix=n.new('ShaderNodeMixShader');em=n.new('ShaderNodeEmission');tr=n.new('ShaderNodeBsdfTransparent');tex=n.new('ShaderNodeTexImage');tex.image=ref;l.new(tex.outputs['Color'],em.inputs['Color']);l.new(tex.outputs['Alpha'],mix.inputs[0]);l.new(tr.outputs[0],mix.inputs[1]);l.new(em.outputs[0],mix.inputs[2]);l.new(mix.outputs[0],out.inputs[0])
coords=[(-.19,-.135,1.88),(.19,-.135,1.88),(.19,-.135,2.50),(-.19,-.135,2.50)];rot=Matrix.Rotation(math.radians(-38.435),4,'Z');coords=[rot@Vector(v) for v in coords];me=bpy.data.meshes.new('Classic head decal UV surface');me.from_pydata(coords,[],[(0,1,2,3)]);me.update();uv=me.uv_layers.new();bounds=[(68/181,1-112/480),(141/181,1-112/480),(141/181,1),(68/181,1)]
for i,v in enumerate(bounds):uv.data[i].uv=v
o=bpy.data.objects.new('Original illustrated flame head',me);bpy.context.collection.objects.link(o);skin(o,'head',m,False)
# Raised black/white classic chest badge.
for name,radius,depth,mat in [('Black emblem rim',.084,-.166,black),('White emblem face',.065,-.177,white)]:
 coords=[(.05+radius*cos(i*2*pi/32),1.49+radius*sin(i*2*pi/32)) for i in range(32)];polygon(name,coords,depth,'spine',mat)
polygon('Black hourglass emblem',[(.012,1.538),(.088,1.538),(.061,1.49),(.088,1.442),(.012,1.442),(.039,1.49)],-.18,'spine',badgeink)
# IK targets and poles. Ground targets stay fixed throughout the stance portion.
targets={};bindrot={}
for side,sgn in [('left',-1),('right',1)]:
 for part,bn,pos,pole in [('arm',side+'_fore',(sgn*.38,0,.99),(sgn*.5,-1,1.25)),('leg',side+'_shin',(sgn*.15,0,.12),(sgn*.15,-1,.6))]:
  target=bpy.data.objects.new(side+' '+part+' target',None);bpy.context.collection.objects.link(target);target.location=legpoint(pos) if part=='leg' else pos;targets[side+'_'+part]=target
  p=bpy.data.objects.new(side+' '+part+' pole',None);bpy.context.collection.objects.link(p);p.location=legpoint(pole) if part=='leg' else pole
  con=rig.pose.bones[bn].constraints.new('IK');con.target=target;con.pole_target=p;con.chain_count=2;con.use_stretch=False;con.pole_angle=pi/2 if part=='leg' and side=='right' else -pi/2
  if part=='leg':
   foot=rig.pose.bones[side+'_foot'];r=bpy.data.objects.new(side+' foot orientation',None);bpy.context.collection.objects.link(r);r.rotation_mode='QUATERNION';bindrot[side]=rig.data.bones[side+'_foot'].matrix_local.to_quaternion();r.rotation_quaternion=bindrot[side];con=foot.constraints.new('COPY_ROTATION');con.target=r;targets[side+'_foot']=r
# Place the complete rig in profile, with the camera revealing the front of the face.
root=bpy.data.objects.new('Heatblast model facing right',None);bpy.context.collection.objects.link(root);root.rotation_euler[2]=math.radians(65)
for o in objects+[rig]+[o for o in bpy.context.scene.objects if o.type=='EMPTY' and o!=root]:o.parent=root
# Camera and cel-compatible lighting.
bpy.ops.object.camera_add(location=(4,-8,1.25));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1.25))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.9;scene.camera=cam
for pos,power,size in [((3,-4,7),700,5),((-4,-2,3),350,4)]:
 bpy.ops.object.light_add(type='AREA',location=pos);lamp=bpy.context.object;lamp.data.energy=power;lamp.data.shape='DISK';lamp.data.size=size;lamp.rotation_euler=(Vector((0,0,1.2))-lamp.location).to_track_quat('-Z','Y').to_euler()

def smooth(x):x=max(0,min(1,x));return x*x*(3-2*x)
def lerp(a,b,t):return Vector(a).lerp(Vector(b),t)
def step(phase,direction):
 p=phase%1;stance=.62;stride=1.30;extent=stride*stance/2
 if p<stance:return (extent-p*stride)*direction,0,0
 u=(p-stance)/(1-stance);u2=u*u;u3=u*u*u;m=-stride*(1-stance);x=(2*u3-3*u2+1)*(-extent)+(u3-2*u2+u)*m+(-2*u3+3*u2)*extent+(u3-u2)*m
 return x*direction,.16*sin(pi*u)**2,.28*sin(pi*u)*direction

def pose(clip,p):
 for b in rig.pose.bones:b.rotation_euler=(0,0,0);b.location=(0,0,0)
 root.rotation_euler=(0,0,math.radians(65));root.location=(0,0,0);head=rig.pose.bones['head'];head.rotation_euler[1]=-.04
 curl=0;wrists={'left':Vector((-.38,0,.99)),'right':Vector((.38,0,.99))};feet={'left':legpoint((-.15,0,.12)),'right':legpoint((.15,0,.12))};pitch={'left':0,'right':0};body=.0;lean=0
 if clip in ['forward','backward']:
  direction=1 if clip=='forward' else -1;body=-.085+.009*cos(4*pi*p);lean=.035*direction
  for side,offset in [('left',0),('right',.5)]:
   travel,lift,roll=step(p+offset,direction);feet[side].x+=travel*.783;feet[side].y=-travel*.621;feet[side].z+=lift;pitch[side]=roll
   wrists[side].y=.18*sin(2*pi*(p+offset))*direction;wrists[side].z+=.025+.025*cos(2*pi*(p+offset))
  rig.pose.bones['spine'].rotation_euler[1]=.025*sin(2*pi*p);head.rotation_euler[1]=-.025*sin(2*pi*p)
 elif clip=='idle':
  rig.pose.bones['spine'].rotation_euler[0]=.0025*sin(2*pi*p);head.rotation_euler[0]=-.002*sin(2*pi*p)
 elif clip=='jump':
  bend=sin(pi*p);body=-.06*(1-bend);feet['left'].y=-.12*bend;feet['left'].z+=.22*bend;feet['right'].y=.15*bend;feet['right'].z+=.12*bend;wrists['left']=lerp(wrists['left'],(-.36,-.25,1.25),bend);wrists['right']=lerp(wrists['right'],(.36,.12,1.3),bend)
 elif clip=='guard':
  w=smooth(p/.3);body=-.05*w;wrists['left']=lerp(wrists['left'],(-.12,-.34,1.49),w);wrists['right']=lerp(wrists['right'],(.17,-.35,1.58),w);curl=w
 elif clip=='hit':
  w=sin(pi*p);lean=-.18*w;body=-.03*w;wrists['left'].y=.15*w;wrists['right'].y=.1*w;head.rotation_euler[0]=-.12*w
 elif clip=='ko':
  w=smooth(p);root.rotation_euler[0]=-.5*pi*w;root.location.z=.16*w;root.location.x=.35*w;root.location.y=.175*w
 else:
  pre=smooth(p/.35);release=smooth((p-.35)/.12);recover=smooth((p-.64)/.36);hold=1-recover;body=-.035*pre*hold
  if clip=='normal':
   prep=(-.16,-.20,1.37);strike=(.04,-.55,1.42);wrists['left']=lerp(lerp(wrists['left'],prep,pre),strike,release);wrists['left']=lerp(wrists['left'],(-.38,0,.99),recover);wrists['right']=lerp(wrists['right'],(.19,-.24,1.33),pre*hold);curl=pre*hold;lean=.07*release*hold
  elif clip=='fireball':
   wrists['left']=lerp(lerp(wrists['left'],(-.15,-.22,1.30),pre),(.0,-.56,1.45),release);wrists['left']=lerp(wrists['left'],(-.38,0,.99),recover);wrists['right']=lerp(wrists['right'],(.20,-.20,1.25),pre*hold);lean=.035*release*hold
  elif clip=='jet':
   wrists['left']=lerp(wrists['left'],(-.04,-.53,1.40),pre*hold);wrists['right']=lerp(wrists['right'],(.20,-.55,1.43),pre*hold);lean=.045*pre*hold
  elif clip=='eruption':
   body=-.22*pre*hold;lean=.22*pre*hold;wrists['left']=lerp(wrists['left'],(-.25,-.38,.85),pre*hold);wrists['right']=lerp(wrists['right'],(.25,-.38,.85),pre*hold)
  elif clip=='ultimate':
   body=-.055*pre*hold;wrists['left']=lerp(wrists['left'],(-.75,.15,1.83),pre*hold);wrists['right']=lerp(wrists['right'],(.75,-.15,1.83),pre*hold);head.rotation_euler[0]=-.10*pre*hold
 rig.pose.bones['pelvis'].location[1]=body # Bone local Y is vertical in the bind pose.
 rig.pose.bones['spine'].rotation_euler[0]=lean
 for side in ['left','right']:
  targets[side+'_arm'].location=wrists[side];targets[side+'_leg'].location=feet[side];targets[side+'_foot'].rotation_quaternion=Quaternion((.621,.783,0),pitch[side])@bindrot[side]
  for i in range(4):rig.pose.bones[side+'_finger'+str(i)].rotation_euler[0]=curl*.85;rig.pose.bones[side+'_tip'+str(i)].rotation_euler[0]=curl*1.1
 bpy.context.view_layer.update()

clips=[('idle',8),('forward',48),('backward',48),('jump',16),('guard',12),('hit',8),('ko',16),('normal',20),('fireball',20),('jet',20),('eruption',16),('ultimate',24)]
meta={'cell':CELL,'columns':8,'heightUnits':2.49,'ground':CELL*(.5+1.25/2.9),'originX':CELL/2,'pixelsPerUnit':CELL/2.9,'stride':1.30*CELL/2.9,'clips':{},'frames':[],'source':'Original-classic-inspired procedural model, authored key poses and planted-foot IK. Not Nekki assets or Cascadeur output.'}
if PREVIEW:
 pose(os.environ.get('HEATBLAST_CLIP','idle'),float(os.environ.get('HEATBLAST_PHASE','0')));scene.render.filepath=str(OUT/('preview-'+os.environ.get('HEATBLAST_CLIP','idle')+'.png'));bpy.ops.render.render(write_still=True);bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'heatblast.blend'));print('PREVIEW',flush=True)
else:
 n=0
 for clip,count in clips:
  meta['clips'][clip]={'start':n,'count':count,'loop':clip in ['idle','forward','backward']}
  for j in range(count):
   p=j/count if clip in ['idle','forward','backward'] else j/(count-1);pose(clip,p);wrist=rig.matrix_world@rig.pose.bones['left_hand'].tail;point=world_to_camera_view(scene,cam,wrist);feet=[]
   for side in ['left','right']:
    foot=world_to_camera_view(scene,cam,rig.matrix_world@rig.pose.bones[side+'_foot'].head);feet.append([foot.x*CELL,(1-foot.y)*CELL])
   meta['frames'].append({'hand':[point.x*CELL,(1-point.y)*CELL],'feet':feet});scene.render.filepath=str(OUT/f'{n:04d}.png')
   if not os.environ.get('HEATBLAST_METADATA_ONLY'):bpy.ops.render.render(write_still=True)
   n+=1;print('FRAME',n,clip,flush=True)
 (OUT/'animation.json').write_text(json.dumps(meta,separators=(',',':')));pose('idle',0);bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'heatblast.blend'));print('DONE',n,flush=True)
