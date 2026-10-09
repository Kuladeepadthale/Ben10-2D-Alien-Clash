extends Node2D
const LABELS = ["HEATBLAST","FOUR ARMS","DIAMONDHEAD","XLR8"]
const PALETTE = [Color("#ff7139"),Color("#e64940"),Color("#8ee6d6"),Color("#48b5ee")]
const SPEED = [265.0,215.0,240.0,340.0]
var hero = 0
var position_a = Vector2(310,400)
var position_b = Vector2(955,400)
var hp = 100.0
var rival_hp = 100.0
var charge = 0.0
var time = 0.0
var facing = Vector2.RIGHT
var cooldown = [0.0,0.0,0.0]
var projectiles = []
var particles = []
var move_axis = Vector2.ZERO
var touch_id = -1
var touch_origin = Vector2.ZERO
var stopped = false
var sprites = {}
const GROUND = Rect2(50,155,1180,425)
func _ready():
 for i in range(4):
  var p = "res://assets/characters/%s.png" % ["heatblast","fourarms","diamondhead","xlr8"][i]
  if ResourceLoader.exists(p): sprites[i] = load(p)
func _physics_process(delta):
 if stopped:
  queue_redraw()
  return
 time += delta
 for i in range(3): cooldown[i] = maxf(0.0,cooldown[i]-delta)
 var direction = Input.get_vector("ui_left","ui_right","ui_up","ui_down") + move_axis
 direction = direction.limit_length()
 if direction.length() > 0.05: facing = direction.normalized()
 position_a += direction*SPEED[hero]*delta
 position_a = position_a.clamp(GROUND.position+Vector2(35,60),GROUND.end-Vector2(35,35))
 var towards = position_a-position_b
 if towards.length() > 105: position_b += towards.normalized()*minf(155*delta,towards.length()-105)
 if towards.length() < 130 and int(time*2.5)%5 == 0: hp = maxf(0,hp-9*delta)
 for i in range(projectiles.size()-1,-1,-1):
  var p = projectiles[i]
  p.pos += p.dir*p.speed*delta
  p.life -= delta
  if p.pos.distance_to(position_b)<55:
   rival_hp = maxf(0,rival_hp-p.damage)
   charge = minf(100,charge+p.damage*.5)
   burst(p.pos,p.color,16)
   projectiles.remove_at(i)
  elif p.life<=0: projectiles.remove_at(i)
 for i in range(particles.size()-1,-1,-1):
  particles[i].pos += particles[i].vel*delta
  particles[i].life -= delta
  if particles[i].life<=0: particles.remove_at(i)
 if rival_hp<=0 or hp<=0: stopped=true
 queue_redraw()
func burst(at, c, count):
 for i in count:
  var a = float(i)*TAU/count
  particles.append({"pos":at,"vel":Vector2.from_angle(a)*randf_range(85,310),"life":randf_range(.18,.6),"color":c})
func cast(slot):
 if stopped:
  reset()
  return
 if cooldown[slot]>0:return
 if slot==2 and charge<100:return
 var dir = (position_b-position_a).normalized()
 if dir.length()<.1:dir=facing
 if slot==0:
  cooldown[0]=.55
  projectiles.append({"pos":position_a+dir*45,"dir":dir,"speed":590.0,"life":1.8,"damage":12.0,"color":PALETTE[hero]})
 if slot==1:
  cooldown[1]=3.6
  for j in range(7):
   var d = dir.rotated((j-3)*.14)
   projectiles.append({"pos":position_a+d*47,"dir":d,"speed":470.0,"life":.9,"damage":4.0,"color":PALETTE[hero]})
 if slot==2:
  cooldown[2]=7.0
  charge=0
  rival_hp = maxf(0,rival_hp-(48 if position_a.distance_to(position_b)<620 else 15))
  burst(position_b,PALETTE[hero],65)
func reset():
 hp=100;rival_hp=100;charge=0;stopped=false;cooldown=[0.0,0.0,0.0];time=0.0;move_axis=Vector2.ZERO;touch_id=-1;position_a=Vector2(310,400);position_b=Vector2(955,400);projectiles.clear();particles.clear()
func _unhandled_key_input(event):
 if event.pressed and not event.echo:
  if event.keycode==KEY_J:cast(0)
  if event.keycode==KEY_K:cast(1)
  if event.keycode==KEY_L:cast(2)
  if event.keycode in [KEY_1,KEY_2,KEY_3,KEY_4]:hero=event.keycode-KEY_1;reset()
func _notification(what):
 if what == NOTIFICATION_APPLICATION_FOCUS_OUT:
  move_axis=Vector2.ZERO
  touch_id=-1

func _input(event):
 if event is InputEventScreenTouch:
  if event.pressed:
   if event.position.y < 115:
    hero = (hero+1)%4
    reset()
   elif event.position.x>835 and event.position.y>585:
    cast(clampi(int((event.position.x-840)/125),0,2))
   elif event.position.x<420 and touch_id == -1:
    touch_id=event.index;touch_origin=event.position
  elif event.index==touch_id:
   touch_id=-1;move_axis=Vector2.ZERO
 elif event is InputEventScreenDrag and event.index==touch_id:
  move_axis=(event.position-touch_origin).limit_length(75)/75.0
func text_at(str, at, size=24, color=Color.WHITE):
 draw_string(ThemeDB.fallback_font,at,str,HORIZONTAL_ALIGNMENT_LEFT,-1,size,color)
func fighter(pos,c,is_hero,index=0):
 draw_ellipse(pos+Vector2(0,55),Vector2(49,12),Color(0,0,0,.35))
 if is_hero and sprites.has(index):
  var texture = sprites[index]
  draw_texture_rect(texture,Rect2(pos-Vector2(65,137),Vector2(130,188)),false)
 else:
  draw_circle(pos+Vector2(0,-65),25,c)
  draw_rect(Rect2(pos+Vector2(-28,-41),Vector2(56,86)),c)
  draw_line(pos+Vector2(-22,-25),pos+Vector2(-43,22),c,17,true)
  draw_line(pos+Vector2(22,-25),pos+Vector2(43,22),c,17,true)
  draw_line(pos+Vector2(-15,37),pos+Vector2(-17,64),c,16,true)
  draw_line(pos+Vector2(15,37),pos+Vector2(17,64),c,16,true)
  draw_circle(pos+Vector2(-9,-70),4,Color.WHITE)
  draw_circle(pos+Vector2(9,-70),4,Color.WHITE)
func draw_ellipse(p,r,c):
 draw_set_transform(p)
 draw_circle(Vector2.ZERO,1,c)
 draw_set_transform(Vector2.ZERO)
 draw_set_transform(p,0,r)
 draw_circle(Vector2.ZERO,1,c)
 draw_set_transform(Vector2.ZERO)
func _draw():
 draw_rect(Rect2(0,0,1280,720),Color("#091923"))
 for n in 9:
  var x = n*180-time*12
  draw_circle(Vector2(fposmod(x,1450)-80,115),80,Color("#123b47"))
 draw_rect(GROUND,Color("#183c38"))
 for j in 8:
  draw_line(Vector2(50,165+j*53),Vector2(1230,165+j*53),Color("#32615d"),2)
 for j in 12:
  draw_line(Vector2(50+j*105,155),Vector2(50+j*105,580),Color("#32615d"),2)
 draw_rect(GROUND,Color("#68c78c"),false,5)
 draw_circle(Vector2(640,366),125,Color("#3b766d"),false,3)
 draw_circle(Vector2(640,366),25,Color("#8eeaca"),false,5)
 draw_rect(Rect2(28,25,580,22),Color("#2b4449"))
 draw_rect(Rect2(28,25,580*hp/100,22),Color("#61e4a3"))
 draw_rect(Rect2(672,25,580,22),Color("#2b4449"))
 draw_rect(Rect2(672,25,580*rival_hp/100,22),Color("#ff756e"))
 text_at(LABELS[hero]+"  • TAP TOP TO SWITCH",Vector2(28,80),24)
 text_at("ARENA RIVAL",Vector2(1050,80),20)
 fighter(position_a,PALETTE[hero],true,hero)
 fighter(position_b,Color("#bd626e"),false)
 for p in projectiles:
  draw_circle(p.pos,22,p.color.darkened(.35))
  draw_circle(p.pos,12,p.color.lightened(.45))
 for p in particles:
  draw_circle(p.pos,maxf(2,9*p.life),p.color)
 draw_rect(Rect2(0,585,1280,135),Color("#081723"))
 draw_circle(Vector2(155,649),61,Color("#34565c"),false,5)
 if move_axis.length()>0:draw_circle(Vector2(155,649)+move_axis*36,25,Color("#6de6a4"))
 for j in 3:
  var rect=Rect2(840+j*125,600,110,98)
  draw_rect(rect,Color("#27575e") if cooldown[j]<=0 else Color("#34454b"))
  text_at(["ATTACK","SPECIAL","ULTIMATE"][j],rect.position+Vector2(8,56),15)
  if cooldown[j]>0:text_at("%.1f" % cooldown[j],rect.position+Vector2(38,27),18)
 text_at("ULT: %d%%"%int(charge),Vector2(570,660),22)
 if stopped:
  draw_rect(Rect2(320,245,640,180),Color("#081a27"))
  text_at("VICTORY!" if rival_hp<=0 else "DEFEAT",Vector2(510,312),44)
  text_at("TAP ATTACK TO RESTART",Vector2(480,363),23)
