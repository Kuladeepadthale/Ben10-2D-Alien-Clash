extends Node3D

const NAMES = ["HEATBLAST", "DIAMONDHEAD"]
const COLORS = [Color("ff7938"), Color("72edcb")]
const MODEL_PATHS = ["res://assets/models/heatblast.glb", "res://assets/models/diamondhead.glb"]
const MOVES = [["FIREBALL", "FLAME BURST", "INFERNO"], ["SHARD", "CRYSTAL FAN", "SHATTER"]]
var hero = 0
var player: CharacterBody3D
var enemy: CharacterBody3D
var player_visual: Node3D
var enemy_visual: Node3D
var player_anim: AnimationPlayer
var enemy_anim: AnimationPlayer
var camera: Camera3D
var hud: Control
var hp_bar: ProgressBar
var enemy_bar: ProgressBar
var energy_bar: ProgressBar
var title_label: Label
var status_label: Label
var skill_buttons = []
var selection_panel: PanelContainer
var result_panel: PanelContainer
var result_label: Label
var hp = 100.0
var enemy_hp = 100.0
var energy = 0.0
var cooldown = [0.0, 0.0, 0.0]
var enemy_cooldown = 2.0
var axis = Vector2.ZERO
var touch_id = -1
var camera_touch = -1
var yaw = 0.0
var pitch = 0.52
var camera_target = Vector3.ZERO
var clock = 0.0
var round_number = 1
var selecting = true
var paused = false
var stopped = false
var mouse_orbit = false
var projectiles = []
var effects = []
var dash_time = 0.0
var dash_direction = Vector3.ZERO
var dash_cooldown = 0.0
var joystick: Control
var attack_time = 0.0
var skeleton: Skeleton3D
var status_time = 0.0
var selected_buttons = []

func _ready():
 build_world()
 player = make_body(Vector3(-3, 0.1, 3))
 enemy = make_body(Vector3(3, 0.1, -3))
 set_models()
 camera = Camera3D.new()
 camera.fov = 58
 camera.far = 160
 add_child(camera)
 camera_target = Vector3(0, 1.2, 0)
 camera.position = Vector3(0, 5.5, 11)
 camera.look_at(camera_target)
 build_ui()
 update_ui()

func material(color, glow = 0.0):
 var mat = StandardMaterial3D.new()
 mat.albedo_color = color
 mat.roughness = 0.85
 if glow > 0:
  mat.emission_enabled = true
  mat.emission = color
  mat.emission_energy_multiplier = glow
 return mat

func shape_mesh(mesh, at, color, parent = self, glow = 0.0):
 var node = MeshInstance3D.new()
 node.mesh = mesh
 node.material_override = material(color, glow)
 parent.add_child(node)
 node.position = at
 return node

func block(at, size, color, solid = false):
 var mesh = BoxMesh.new()
 mesh.size = size
 var node = shape_mesh(mesh, at, color)
 if solid:
  var body = StaticBody3D.new()
  node.add_child(body)
  var collider = CollisionShape3D.new()
  var box = BoxShape3D.new()
  box.size = size
  collider.shape = box
  body.add_child(collider)
 return node

func cylinder(at, radius, height, color, glow = 0.0):
 var mesh = CylinderMesh.new()
 mesh.top_radius = radius
 mesh.bottom_radius = radius
 mesh.height = height
 mesh.radial_segments = 24
 return shape_mesh(mesh, at, color, self, glow)

func build_world():
 var world = WorldEnvironment.new()
 var env = Environment.new()
 env.background_mode = Environment.BG_SKY
 var sky = Sky.new()
 var sky_mat = ProceduralSkyMaterial.new()
 sky_mat.sky_top_color = Color("243a69")
 sky_mat.sky_horizon_color = Color("eea464")
 sky_mat.ground_bottom_color = Color("382d3b")
 sky_mat.ground_horizon_color = Color("d9a36f")
 sky.sky_material = sky_mat
 env.sky = sky
 env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
 env.ambient_light_color = Color("c0d9f2")
 env.ambient_light_energy = 0.65
 env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
 world.environment = env
 add_child(world)
 var sun = DirectionalLight3D.new()
 sun.light_color = Color("ffd6ad")
 sun.light_energy = 1.3
 sun.shadow_enabled = true
 sun.directional_shadow_max_distance = 55
 sun.rotation_degrees = Vector3(-48, -35, 0)
 add_child(sun)
 block(Vector3(0, -0.4, 0), Vector3(60, 0.8, 60), Color("b39170"), true)
 for x in range(-4, 5):
  for z in range(-4, 5):
   var shade = 0.32 + float(posmod(x * 17 + z * 7, 6)) * 0.012
   block(Vector3(x * 3.1, 0.015, z * 3.1), Vector3(3.06, 0.03, 3.06), Color(shade + 0.04, shade + 0.02, shade))
 for x in [-1, 1]:
  block(Vector3(x * 14.4, 1.2, 0), Vector3(0.7, 2.4, 29), Color("555b60"), true)
  for z in range(-13, 14, 3):
   block(Vector3(x * 14.0, 2.45, z), Vector3(0.15, 0.1, 1.3), Color("afff53"))
 block(Vector3(0, 1.2, 14.4), Vector3(29, 2.4, 0.7), Color("555b60"), true)
 block(Vector3(0, 4, -16.5), Vector3(18, 8, 5), Color("424c58"), true)
 block(Vector3(0, 3, -13.93), Vector3(9, 5.8, 0.15), Color("232d34"))
 for x in [-4.6, 4.6]:
  block(Vector3(x, 3, -13.8), Vector3(0.22, 6, 0.2), Color("a1db64"))
 for y in [1.0, 2.2, 3.4, 4.6]:
  block(Vector3(0, y, -13.8), Vector3(8.8, 0.06, 0.05), Color("596570"))
 block(Vector3(-10, 2.7, -16), Vector3(4, 5.4, 5), Color("6d6660"), true)
 block(Vector3(-10, 7, -16), Vector3(3, 3.2, 3), Color("444d54"), true)
 block(Vector3(-10, 7.3, -14.45), Vector3(2.5, 1.1, 0.07), Color("8cd8bc"))
 cylinder(Vector3(11, 0.3, -11), 2.6, 0.6, Color("303c41"))
 cylinder(Vector3(11, 3.0, -11), 1.5, 5.4, Color("82de3e"), 0.8)
 cylinder(Vector3(11, 5.8, -11), 2.0, 0.5, Color("344549"))
 for a in 6:
  var p = Vector3(11 + cos(a * TAU / 6.0) * 1.75, 3, -11 + sin(a * TAU / 6.0) * 1.75)
  cylinder(p, 0.13, 5.5, Color("46525d"))
 for location in [Vector3(-11, 0.8, -9), Vector3(-11, 0.8, -6), Vector3(11, 0.8, 8), Vector3(11, 0.8, 5)]:
  block(location, Vector3(1.6, 1.6, 1.6), Color("6a6650"), true)
  block(location + Vector3(0, 0, 0.82), Vector3(1.35, 0.18, 0.04), Color("d4a456"))
 for i in range(14):
  var mesh = CylinderMesh.new()
  mesh.top_radius = 0.3
  mesh.bottom_radius = 6.0 + posmod(i * 7, 4)
  mesh.height = 9.0 + posmod(i * 3, 6)
  mesh.radial_segments = 6
  var angle = i * TAU / 14.0
  shape_mesh(mesh, Vector3(cos(angle) * 42, 2, sin(angle) * 42), Color("986f67"))

func make_body(at):
 var body = CharacterBody3D.new()
 add_child(body)
 body.position = at
 var shape = CollisionShape3D.new()
 var capsule = CapsuleShape3D.new()
 capsule.radius = 0.38
 capsule.height = 2.05
 shape.shape = capsule
 shape.position.y = 1.03
 body.add_child(shape)
 body.floor_snap_length = 0.3
 return body

func find_type(node, kind):
 if node.is_class(kind):
  return node
 for child in node.get_children():
  var result = find_type(child, kind)
  if result != null:
   return result
 return null

func load_visual(index, body):
 var visual = load(MODEL_PATHS[index]).instantiate()
 body.add_child(visual)
 var animator = find_type(visual, "AnimationPlayer")
 if animator:
  for animation_name in animator.get_animation_list():
   if "Idle" in animation_name or "Run" in animation_name or "Walk" in animation_name:
    animator.get_animation(animation_name).loop_mode = Animation.LOOP_LINEAR
 return visual

func set_models():
 if is_instance_valid(player_visual):
  player_visual.free()
 if is_instance_valid(enemy_visual):
  enemy_visual.free()
 player_visual = load_visual(hero, player)
 enemy_visual = load_visual(1 - hero, enemy)
 player_anim = find_type(player_visual, "AnimationPlayer")
 enemy_anim = find_type(enemy_visual, "AnimationPlayer")
 skeleton = find_type(player_visual, "Skeleton3D")
 animate(player_anim, 0.0)
 animate(enemy_anim, 0.0)

func animate(animator, speed):
 if animator == null:
  return
 var requested = "Idle_Breathe" if speed < 0.1 else ("Walk_Narrow" if speed < 2.4 else "Run_Narrow")
 for animation_name in animator.get_animation_list():
  if requested in animation_name:
   if animator.current_animation != animation_name:
    animator.play(animation_name, 0.2)
   animator.speed_scale = clampf(speed / 4.5, 0.8, 1.35) if speed >= 2.4 else 1.0
   break

func _physics_process(delta):
 clock += delta
 if selecting:
  animate(player_anim, 0)
  animate(enemy_anim, 0)
  update_camera(delta)
  return
 if paused or stopped:
  return
 energy = minf(100, energy + 4 * delta)
 for i in 3:
  cooldown[i] = maxf(0, cooldown[i] - delta)
 dash_cooldown = maxf(0, dash_cooldown - delta)
 dash_time = maxf(0, dash_time - delta)
 attack_time = maxf(0, attack_time - delta)
 status_time = maxf(0, status_time - delta)
 var movement = (Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down") + axis).limit_length()
 var direction = Vector3(movement.x, 0, movement.y).rotated(Vector3.UP, yaw)
 if dash_time > 0:
  direction = dash_direction
 var speed = 11.0 if dash_time > 0 else 4.8
 var target = direction * speed
 player.velocity.x = move_toward(player.velocity.x, target.x, delta * 24)
 player.velocity.z = move_toward(player.velocity.z, target.z, delta * 24)
 player.velocity.y -= 22 * delta
 if player.is_on_floor() and player.velocity.y < 0:
  player.velocity.y = -0.2
 player.move_and_slide()
 player.position.x = clampf(player.position.x, -13.5, 13.5)
 player.position.z = clampf(player.position.z, -12.8, 13.5)
 var horizontal_speed = Vector2(player.velocity.x, player.velocity.z).length()
 if direction.length() > 0.05:
  player_visual.rotation.y = lerp_angle(player_visual.rotation.y, atan2(direction.x, direction.z), 1 - exp(-delta * 14))
 animate(player_anim, horizontal_speed)
 var toward = player.position - enemy.position
 toward.y = 0
 var enemy_target = toward.normalized() * 2.0 if toward.length() > 5 else Vector3.ZERO
 enemy.velocity.x = move_toward(enemy.velocity.x, enemy_target.x, delta * 10)
 enemy.velocity.z = move_toward(enemy.velocity.z, enemy_target.z, delta * 10)
 enemy.velocity.y -= 22 * delta
 enemy.move_and_slide()
 enemy_visual.rotation.y = lerp_angle(enemy_visual.rotation.y, atan2(toward.x, toward.z), 1 - exp(-delta * 10))
 animate(enemy_anim, Vector2(enemy.velocity.x, enemy.velocity.z).length())
 enemy_cooldown -= delta
 if enemy_cooldown <= 0:
  enemy_cooldown = maxf(0.95, 2.2 - round_number * 0.1)
  fire(enemy.position, player.position, 1 - hero, true)
 for i in range(projectiles.size() - 1, -1, -1):
  var shot = projectiles[i]
  var old = shot.node.position
  shot.node.position += shot.direction * shot.speed * delta
  shot.life -= delta
  var target_body = player if shot.enemy else enemy
  var aim = target_body.position + Vector3(0, 1.15, 0)
  var nearest = Geometry3D.get_closest_point_to_segment(aim, old, shot.node.position)
  if nearest.distance_to(aim) < 0.65:
   if shot.enemy:
    if dash_time <= 0:
     hp = maxf(0, hp - shot.damage)
   else:
    enemy_hp = maxf(0, enemy_hp - shot.damage)
    energy = minf(100, energy + 10)
   impact(shot.node.position, COLORS[shot.kind])
   shot.node.queue_free()
   projectiles.remove_at(i)
  elif shot.life <= 0:
   shot.node.queue_free()
   projectiles.remove_at(i)
 for i in range(effects.size() - 1, -1, -1):
  var effect = effects[i]
  effect.life -= delta
  effect.node.scale += Vector3.ONE * delta * effect.growth
  if effect.life <= 0:
   effect.node.queue_free()
   effects.remove_at(i)
 if hp <= 0 or enemy_hp <= 0:
  stopped = true
  axis = Vector2.ZERO
  result_label.text = "VICTORY" if enemy_hp <= 0 else "TRY AGAIN"
  result_panel.show()
  animate(player_anim, 0)
  animate(enemy_anim, 0)
 update_camera(delta)
 update_ui()

func _process(_delta):
 # Apply a short upper-body casting pose after the locomotion animation.
 if attack_time > 0 and skeleton != null and not paused:
  var weight = sin(clampf(attack_time / 0.4, 0, 1) * PI)
  for bone_name in ["UpperArm.R", "Forearm.R"]:
   var bone = skeleton.find_bone(bone_name)
   if bone >= 0:
    var base = skeleton.get_bone_pose_rotation(bone)
    skeleton.set_bone_pose_rotation(bone, base.slerp(Quaternion(Vector3.RIGHT, -1.15), weight * 0.7))

func update_camera(delta):
 var focus = Vector3(0, 1.1, 0) if selecting else player.position + Vector3(0, 1.2, 0)
 camera_target = camera_target.lerp(focus, 1 - exp(-delta * 9))
 var distance = 11.0 if selecting else 7.0
 var offset = Vector3(0, sin(pitch) * distance, cos(pitch) * distance).rotated(Vector3.UP, yaw)
 camera.position = camera_target + offset
 camera.look_at(camera_target)

func fire(origin, target, kind, enemy_shot, spread = 0.0, damage = 13.0):
 var aim = target + Vector3(0, 1.15, 0)
 var start = origin + Vector3(0, 1.3, 0)
 var direction = (aim - start).normalized().rotated(Vector3.UP, spread)
 var mesh: PrimitiveMesh
 if kind == 0:
  var sphere = SphereMesh.new()
  sphere.radius = 0.18
  sphere.height = 0.36
  sphere.radial_segments = 12
  sphere.rings = 6
  mesh = sphere
 else:
  var crystal = PrismMesh.new()
  crystal.size = Vector3(0.18, 0.55, 0.2)
  mesh = crystal
 var node = shape_mesh(mesh, start + direction * 0.65, COLORS[kind], self, 1.2)
 if kind == 1:
  node.rotation.x = PI / 2
 projectiles.append({"node": node, "direction": direction, "speed": 10.0 if enemy_shot else 19.0, "damage": 9.0 if enemy_shot else damage, "enemy": enemy_shot, "kind": kind, "life": 3.0})

func impact(at, color, large = false):
 var mesh = SphereMesh.new()
 mesh.radius = 0.2
 mesh.height = 0.4
 mesh.radial_segments = 12
 mesh.rings = 6
 var node = shape_mesh(mesh, at, color, self, 0.8)
 var mat = node.material_override
 mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
 mat.albedo_color.a = 0.45
 effects.append({"node": node, "life": 0.4 if not large else 0.7, "growth": 3.0 if not large else 10.0})

func cast(slot):
 if paused or selecting or stopped or cooldown[slot] > 0:
  return
 if slot == 2 and energy < 100:
  return
 var direction = enemy.position - player.position
 player_visual.rotation.y = atan2(direction.x, direction.z)
 attack_time = 0.4
 status_label.text = MOVES[hero][slot]
 status_time = 1.0
 cooldown[slot] = [0.45, 3.8, 8.0][slot]
 if slot == 0:
  fire(player.position, enemy.position, hero, false)
 elif slot == 1:
  for i in 5:
   fire(player.position, enemy.position, hero, false, (i - 2) * 0.12, 8.0)
 else:
  energy = 0
  enemy_hp = maxf(0, enemy_hp - 48)
  impact(enemy.position + Vector3.UP, COLORS[hero], true)

func jump():
 if not selecting and not paused and not stopped and player.is_on_floor():
  player.velocity.y = 7.2

func dash():
 if not selecting and not paused and not stopped and dash_cooldown <= 0:
  dash_time = 0.32
  dash_cooldown = 2.0
  var input_axis = (Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down") + axis).limit_length()
  dash_direction = Vector3(input_axis.x, 0, input_axis.y).rotated(Vector3.UP, yaw).normalized()
  if dash_direction.length() < 0.1:
   dash_direction = player_visual.basis.z.normalized()

func reset_round():
 for shot in projectiles:
  shot.node.queue_free()
 projectiles.clear()
 for effect in effects:
  effect.node.queue_free()
 effects.clear()
 hp = 100
 enemy_hp = 100
 energy = 0
 cooldown = [0.0, 0.0, 0.0]
 enemy_cooldown = 2.0
 player.position = Vector3(-3, 0.1, 3)
 enemy.position = Vector3(3, 0.1, -3)
 player.velocity = Vector3.ZERO
 enemy.velocity = Vector3.ZERO
 axis = Vector2.ZERO
 touch_id = -1
 camera_touch = -1
 stopped = false
 paused = false
 dash_time = 0
 dash_cooldown = 0
 yaw = 0
 result_panel.hide()
 status_label.text = "ROUND %d  /  FIGHT" % round_number
 status_time = 2.0
 update_ui()

func pick(index):
 hero = index
 set_models()
 for i in selected_buttons.size():
  selected_buttons[i].modulate = COLORS[i] if hero == i else Color.WHITE
 update_ui()

func begin():
 selecting = false
 selection_panel.hide()
 round_number = 1
 reset_round()

func pause_game():
 if selecting or stopped:
  return
 paused = not paused
 axis = Vector2.ZERO
 touch_id = -1
 camera_touch = -1
 if paused:
  player_anim.pause()
  enemy_anim.pause()
  result_label.text = "PAUSED"
  result_panel.show()
 else:
  player_anim.play()
  enemy_anim.play()
  result_panel.hide()

func label(text, pos, size, color = Color.WHITE):
 var node = Label.new()
 node.text = text
 node.position = pos
 node.add_theme_font_size_override("font_size", size)
 node.add_theme_color_override("font_color", color)
 hud.add_child(node)
 return node

func box_style(color, border):
 var style = StyleBoxFlat.new()
 style.bg_color = color
 style.border_color = border
 style.set_border_width_all(2)
 style.set_corner_radius_all(12)
 return style

func button(text, rect, action, parent = hud):
 var node = Button.new()
 node.text = text
 node.position = rect.position
 node.size = rect.size
 node.add_theme_font_size_override("font_size", 20)
 node.add_theme_stylebox_override("normal", box_style(Color("172c36"), Color("6b995c")))
 node.add_theme_stylebox_override("pressed", box_style(Color("487946"), Color("caff87")))
 parent.add_child(node)
 node.pressed.connect(action)
 return node

func progress(pos, size, color):
 var bar = ProgressBar.new()
 bar.position = pos
 bar.size = size
 bar.show_percentage = false
 bar.add_theme_stylebox_override("background", box_style(Color("1d2d36"), Color("2e434a")))
 bar.add_theme_stylebox_override("fill", box_style(color, color))
 hud.add_child(bar)
 return bar

func build_ui():
 var canvas = CanvasLayer.new()
 add_child(canvas)
 hud = Control.new()
 hud.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 hud.mouse_filter = Control.MOUSE_FILTER_IGNORE
 canvas.add_child(hud)
 var strip = ColorRect.new()
 strip.color = Color(0.025, 0.045, 0.065, 0.87)
 strip.size = Vector2(1280, 90)
 strip.mouse_filter = Control.MOUSE_FILTER_IGNORE
 hud.add_child(strip)
 title_label = label("", Vector2(155, 12), 22, Color("bcff80"))
 hp_bar = progress(Vector2(155, 47), Vector2(400, 21), Color("98e656"))
 label("ALIEN RIVAL", Vector2(740, 12), 22, Color("ff8790"))
 enemy_bar = progress(Vector2(740, 47), Vector2(395, 21), Color("ed6574"))
 button("ALIENS", Rect2(15, 15, 120, 58), func(): selecting = true; selection_panel.show(); axis = Vector2.ZERO; result_panel.hide())
 button("PAUSE", Rect2(1160, 15, 105, 58), pause_game)
 status_label = label("", Vector2(460, 104), 23, Color("d6ffba"))
 joystick = Control.new()
 joystick.position = Vector2(145, 605)
 joystick.size = Vector2.ZERO
 joystick.mouse_filter = Control.MOUSE_FILTER_IGNORE
 hud.add_child(joystick)
 joystick.draw.connect(func():
  joystick.draw_circle(Vector2.ZERO, 68, Color(0.07, 0.16, 0.19, 0.65))
  joystick.draw_arc(Vector2.ZERO, 68, 0, TAU, 48, Color("a0da7b"), 3)
  joystick.draw_circle(axis * 42, 27, Color("a2ec75")))
 label("MOVE", Vector2(116, 685), 16)
 label("DRAG RIGHT SIDE TO ROTATE CAMERA", Vector2(430, 686), 15, Color("c0d8d7"))
 energy_bar = progress(Vector2(455, 650), Vector2(315, 15), Color("a5f451"))
 label("OMNITRIX ENERGY", Vector2(455, 620), 17, Color("d3ffac"))
 for i in 3:
  var slot = i
  skill_buttons.append(button("", Rect2(825 + i * 145, 602, 135, 85), func(): cast(slot)))
 button("JUMP", Rect2(1000, 515, 120,  60), jump)
 button("DODGE", Rect2(1140, 515, 120, 60), dash)
 selection_panel = PanelContainer.new()
 selection_panel.position = Vector2(330, 175)
 selection_panel.size = Vector2(620, 320)
 selection_panel.add_theme_stylebox_override("panel", box_style(Color(0.025, 0.065, 0.08, 0.94), Color("a9e673")))
 hud.add_child(selection_panel)
 var content = Control.new()
 content.custom_minimum_size = Vector2(620, 320)
 selection_panel.add_child(content)
 var heading = Label.new()
 heading.text = "BEN 10  /  ALIEN CLASH 3D"
 heading.position = Vector2(70, 25)
 heading.add_theme_font_size_override("font_size", 28)
 content.add_child(heading)
 for i in 2:
  var index = i
  selected_buttons.append(button(NAMES[i], Rect2(40 + i * 280, 92, 260, 75), func(): pick(index), content))
 button("ENTER ARENA", Rect2(150, 215, 320, 65), begin, content)
 result_panel = PanelContainer.new()
 result_panel.position = Vector2(390, 245)
 result_panel.size = Vector2(500, 210)
 result_panel.add_theme_stylebox_override("panel", box_style(Color("132630"), Color("a4e375")))
 hud.add_child(result_panel)
 var result_content = Control.new()
 result_content.custom_minimum_size = Vector2(500, 210)
 result_panel.add_child(result_content)
 result_label = Label.new()
 result_label.position = Vector2(125, 25)
 result_label.add_theme_font_size_override("font_size", 35)
 result_content.add_child(result_label)
 button("CONTINUE", Rect2(120, 115, 260,  60), func():
  if paused:
   pause_game()
  else:
   if enemy_hp <= 0:
    round_number += 1
   reset_round(), result_content)
 result_panel.hide()
 pick(hero)

func update_ui():
 if title_label == null:
  return
 title_label.text = NAMES[hero] + "  /  ROUND %02d" % round_number
 hp_bar.value = hp
 enemy_bar.value = enemy_hp
 energy_bar.value = energy
 for i in 3:
  skill_buttons[i].text = MOVES[hero][i] + ("\n%.1f s" % cooldown[i] if cooldown[i] > 0 else ("\n%d%%" % int(energy) if i == 2 and energy < 100 else ""))
  skill_buttons[i].modulate = Color.WHITE if cooldown[i] <= 0 else Color("8998a0")
 if status_time <= 0 and not selecting:
  status_label.text = ""
 joystick.queue_redraw()

func _unhandled_input(event):
 if event is InputEventScreenTouch:
  if event.pressed:
   if event.position.x < 340 and event.position.y > 360 and touch_id == -1:
    touch_id = event.index
    axis = (event.position - Vector2(145, 605)).limit_length(68) / 68.0
   elif event.position.x > 350 and camera_touch == -1:
    camera_touch = event.index
  else:
   if event.index == touch_id:
    touch_id = -1
    axis = Vector2.ZERO
   if event.index == camera_touch:
    camera_touch = -1
 elif event is InputEventScreenDrag:
  if event.index == touch_id:
   axis = (event.position - Vector2(145, 605)).limit_length(68) / 68.0
  elif event.index == camera_touch:
   yaw -= event.relative.x * 0.006
   pitch = clampf(pitch + event.relative.y * 0.004, 0.18, 0.9)
 elif event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_RIGHT:
  mouse_orbit = event.pressed
 elif event is InputEventMouseMotion and mouse_orbit:
  yaw -= event.relative.x * 0.006
  pitch = clampf(pitch + event.relative.y * 0.004, 0.18, 0.9)
 elif event is InputEventKey and event.pressed and not event.echo:
  match event.keycode:
   KEY_J: cast(0)
   KEY_K: cast(1)
   KEY_L: cast(2)
   KEY_SPACE: jump()
   KEY_SHIFT: dash()
   KEY_ESCAPE: pause_game()
   KEY_ENTER:
    if selecting: begin()

func _notification(what):
 if what == NOTIFICATION_APPLICATION_FOCUS_OUT:
  axis = Vector2.ZERO
  touch_id = -1
  camera_touch = -1
  if not selecting and not paused and not stopped:
   pause_game()
