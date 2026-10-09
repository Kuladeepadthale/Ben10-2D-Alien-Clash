extends Node2D

const LABELS = ["HEATBLAST", "FOUR ARMS", "DIAMONDHEAD", "XLR8"]
const COLORS = [Color("ff823c"), Color("ed554d"), Color("77ecd5"), Color("54c9ff")]
const SPEED = [260.0, 215.0, 250.0, 410.0]
const MOVES = [["FIREBALL", "FLAME BURST", "INFERNO"], ["PUNCH", "GROUND SLAM", "QUAD STRIKE"], ["CRYSTAL", "CRYSTAL FAN", "SHATTER"], ["QUICK HIT", "SPEED DASH", "SPEED STORM"]]
const FLOOR = Rect2(90, 320, 1100, 245)
var hero = 0
var rival = 2
var position_a = Vector2(330, 460)
var position_b = Vector2(920, 460)
var hp = 100.0
var rival_hp = 100.0
var charge = 0.0
var clock = 0.0
var cooldown = [0.0, 0.0, 0.0]
var enemy_cooldown = 1.8
var attack_pose = 0.0
var hit_flash = 0.0
var rival_flash = 0.0
var move_axis = Vector2.ZERO
var moving = false
var facing_right = true
var touch_id = -1
var projectiles = []
var particles = []
var rings = []
var trails = []
var sprites = []
var background: Texture2D
var stopped = false
var selection = true
var paused = false
var round_number = 1
var status = "CHOOSE YOUR ALIEN"
var status_timer = 3.0
var mouse_move = false

func _ready():
 background = load("res://assets/environments/desert_base.jpg")
 for name in ["heatblast", "fourarms", "diamondhead", "xlr8"]:
  sprites.append(load("res://assets/characters/" + name + ".png"))

func _physics_process(delta):
 if paused or selection:
  queue_redraw()
  return
 clock += delta
 status_timer = maxf(0.0, status_timer - delta)
 attack_pose = maxf(0.0, attack_pose - delta)
 hit_flash = maxf(0.0, hit_flash - delta)
 rival_flash = maxf(0.0, rival_flash - delta)
 for i in 3:
  cooldown[i] = maxf(0.0, cooldown[i] - delta)
 if not stopped:
  charge = minf(100.0, charge + delta * 4.0)
  var axis = (Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down") + move_axis).limit_length()
  moving = axis.length() > 0.05
  if absf(axis.x) > 0.05:
   facing_right = axis.x > 0.0
  position_a = (position_a + axis * SPEED[hero] * delta).clamp(FLOOR.position, FLOOR.end)
  var toward = position_a - position_b
  if toward.length() > 130.0:
   var chase_speed = 260.0 if rival == 3 else (175.0 if rival == 1 else 135.0)
   position_b += toward.normalized() * (chase_speed + round_number * 6.0) * delta
  position_b = position_b.clamp(FLOOR.position, FLOOR.end)
  enemy_cooldown -= delta
  if enemy_cooldown <= 0.0:
   enemy_cooldown = maxf(0.8, 1.7 - round_number * 0.08)
   if toward.length() < 150.0:
    hp = maxf(0.0, hp - 8.0)
    hit_flash = 0.2
    burst(position_a - Vector2(0, 70), Color("ff5368"), 14)
   elif rival == 0 or rival == 2:
    shoot(position_b, toward.normalized(), 350.0, 8.0, COLORS[rival], true, "fire" if rival == 0 else "crystal")
   elif rival == 3:
    position_b = (position_b + toward.normalized() * minf(230.0, maxf(0.0, toward.length() - 100.0))).clamp(FLOOR.position, FLOOR.end)
    ring(position_b, COLORS[rival], 200.0)
   else:
    ring(position_b, COLORS[rival], 220.0)
    if toward.length() < 260.0:
     hp = maxf(0.0, hp - 10.0)
     hit_flash = 0.2
 for i in range(projectiles.size() - 1, -1, -1):
  var p = projectiles[i]
  var previous = p.pos
  p.pos += p.dir * p.speed * delta
  p.life -= delta
  var target = position_a if p.enemy else position_b
  var nearest = Geometry2D.get_closest_point_to_segment(target, previous, p.pos)
  if not stopped and nearest.distance_to(target) < 42.0:
   if p.enemy:
    hp = maxf(0.0, hp - p.damage)
    hit_flash = 0.2
   else:
    damage_enemy(p.damage)
   burst(p.pos - Vector2(0, 65), p.color, 16)
   projectiles.remove_at(i)
  elif p.life <= 0.0:
   projectiles.remove_at(i)
 for i in range(particles.size() - 1, -1, -1):
  particles[i].pos += particles[i].vel * delta
  particles[i].vel *= 0.97
  particles[i].life -= delta
  if particles[i].life <= 0.0:
   particles.remove_at(i)
 for i in range(rings.size() - 1, -1, -1):
  rings[i].radius += delta * rings[i].speed
  rings[i].life -= delta
  if rings[i].life <= 0.0:
   rings.remove_at(i)
 for i in range(trails.size() - 1, -1, -1):
  trails[i].life -= delta
  if trails[i].life <= 0.0:
   trails.remove_at(i)
 if not stopped and (hp <= 0.0 or rival_hp <= 0.0):
  stopped = true
  move_axis = Vector2.ZERO
  moving = false
 queue_redraw()

func damage_enemy(amount):
 rival_hp = maxf(0.0, rival_hp - amount)
 charge = minf(100.0, charge + amount * 0.75)
 rival_flash = 0.18

func shoot(origin, direction, speed, damage, color, enemy, kind):
 projectiles.append({"pos": origin + direction * 45.0, "dir": direction, "speed": speed, "damage": damage, "color": color, "enemy": enemy, "kind": kind, "life": 2.3})

func burst(at, color, count):
 for i in count:
  particles.append({"pos": at, "vel": Vector2.from_angle(randf() * TAU) * randf_range(70, 220), "life": randf_range(0.2, 0.65), "color": color})

func ring(at, color, speed = 280.0):
 rings.append({"pos": at, "color": color, "radius": 15.0, "life": 0.65, "speed": speed})

func cast(slot):
 if selection or paused:
  return
 if stopped:
  if slot == 0:
   if rival_hp <= 0.0:
    round_number += 1
   reset_round()
  return
 if cooldown[slot] > 0.0 or (slot == 2 and charge < 100.0):
  return
 var direction = (position_b - position_a).normalized()
 if direction == Vector2.ZERO:
  direction = Vector2.RIGHT
 facing_right = direction.x >= 0.0
 attack_pose = 0.3
 status = MOVES[hero][slot]
 status_timer = 1.2
 var distance = position_a.distance_to(position_b)
 if slot == 2:
  charge = 0.0
  cooldown[2] = 8.0
  damage_enemy(52.0)
  ring(position_b, COLORS[hero], 450.0)
  burst(position_b - Vector2(0, 65), COLORS[hero], 64)
  if hero == 3:
   for j in 8:
    trails.append({"pos": position_a.lerp(position_b, float(j) / 8.0), "life": 0.6})
  return
 cooldown[slot] = 0.45 if slot == 0 else 3.8
 match hero:
  0:
   if slot == 0:
    shoot(position_a, direction, 610.0, 13.0, COLORS[hero], false, "fire")
   else:
    for j in 5:
     shoot(position_a, direction.rotated((j - 2) * 0.14), 500.0, 7.0, COLORS[hero], false, "fire")
  1:
   ring(position_a, COLORS[hero], 200.0 if slot == 0 else 450.0)
   if distance < (165.0 if slot == 0 else 290.0):
    damage_enemy(19.0 if slot == 0 else 32.0)
    position_b = (position_b + direction * 55.0).clamp(FLOOR.position, FLOOR.end)
    burst(position_b - Vector2(0, 60), COLORS[hero], 24)
  2:
   var count = 1 if slot == 0 else 5
   for j in count:
    shoot(position_a, direction.rotated((j - (count - 1) * 0.5) * 0.16), 700.0, 14.0 if slot == 0 else 8.0, COLORS[hero], false, "crystal")
  3:
   if slot == 0:
    if distance < 175.0:
     damage_enemy(16.0)
     burst(position_b - Vector2(0, 60), COLORS[hero], 15)
    cooldown[0] = 0.25
   else:
    var old = position_a
    position_a = (position_a + direction * minf(distance + 65.0, 370.0)).clamp(FLOOR.position, FLOOR.end)
    for j in 8:
     trails.append({"pos": old.lerp(position_a, float(j) / 8.0), "life": 0.45})
    if Geometry2D.get_closest_point_to_segment(position_b, old, position_a).distance_to(position_b) < 90.0:
     damage_enemy(29.0)
     burst(position_b - Vector2(0, 65), COLORS[hero], 22)

func reset_round():
 hp = 100.0
 rival_hp = 100.0
 charge = 0.0
 stopped = false
 paused = false
 position_a = Vector2(330, 460)
 position_b = Vector2(920, 460)
 rival = (hero + 1 + round_number % 3) % 4
 cooldown = [0.0, 0.0, 0.0]
 enemy_cooldown = 1.8
 move_axis = Vector2.ZERO
 touch_id = -1
 projectiles.clear()
 particles.clear()
 rings.clear()
 trails.clear()
 status = "ROUND %d - FIGHT!" % round_number
 status_timer = 2.0

func _notification(what):
 if what == NOTIFICATION_APPLICATION_FOCUS_OUT:
  move_axis = Vector2.ZERO
  touch_id = -1
  if not selection and not stopped:
   paused = true

func press(at):
 if selection:
  for i in 4:
   if Rect2(120 + i * 265, 195, 245, 350).has_point(at):
    hero = i
  if Rect2(480, 570, 320, 74).has_point(at):
   selection = false
   round_number = 1
   reset_round()
  return
 if paused:
  paused = false
  return
 if Rect2(1160, 15, 100, 70).has_point(at):
  paused = true
 elif Rect2(15, 15, 110, 70).has_point(at):
  selection = true
  move_axis = Vector2.ZERO
 elif at.y > 585 and at.x >= 830:
  cast(clampi(int((at.x - 830) / 140.0), 0, 2))

func _input(event):
 if event is InputEventScreenTouch:
  if event.pressed:
   press(event.position)
   if not selection and not paused and event.position.x < 330 and event.position.y > 570 and touch_id == -1:
    touch_id = event.index
    move_axis = (event.position - Vector2(155, 650)).limit_length(60.0) / 60.0
  elif event.index == touch_id:
   touch_id = -1
   move_axis = Vector2.ZERO
 elif event is InputEventScreenDrag and event.index == touch_id:
  move_axis = (event.position - Vector2(155, 650)).limit_length(60.0) / 60.0
 elif event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
  if event.pressed:
   press(event.position)
   mouse_move = event.position.x < 330 and event.position.y > 570
  else:
   mouse_move = false
   move_axis = Vector2.ZERO
 elif event is InputEventMouseMotion and mouse_move:
  move_axis = (event.position - Vector2(155, 650)).limit_length(60.0) / 60.0
 elif event is InputEventKey and event.pressed and not event.echo:
  if event.keycode == KEY_ENTER and selection:
   selection = false
   reset_round()
  elif event.keycode in [KEY_1, KEY_2, KEY_3, KEY_4]:
   hero = event.keycode - KEY_1
   if not selection:
    reset_round()
  elif event.keycode == KEY_J:
   cast(0)
  elif event.keycode == KEY_K:
   cast(1)
  elif event.keycode == KEY_L:
   cast(2)
  elif event.keycode == KEY_ESCAPE:
   paused = not paused

func text_at(value, at, size = 24, color = Color.WHITE):
 draw_string(ThemeDB.fallback_font, at, value, HORIZONTAL_ALIGNMENT_LEFT, -1, size, color)

func panel(rect, color, border = Color("355968")):
 draw_style_box(style(color, border), rect)

func style(color, border):
 var box = StyleBoxFlat.new()
 box.bg_color = color
 box.border_color = border
 box.set_border_width_all(2)
 box.set_corner_radius_all(14)
 return box

func alien(index, feet, height, right, tint = Color.WHITE, animated = false):
 var texture = sprites[index]
 var width = height * texture.get_width() / float(texture.get_height())
 var bounce = sin(clock * 15.0) * 4.0 if animated else sin(clock * 2.0) * 1.5
 var tilt = (0.045 * sin(clock * 15.0)) if animated else 0.0
 draw_set_transform(feet, tilt, Vector2(1.0 if right else -1.0, 1.0))
 draw_texture_rect(texture, Rect2(-width * 0.5, -height + bounce, width, height), false, tint)
 draw_set_transform(Vector2.ZERO)

func fighter(index, feet, right, is_hero):
 draw_set_transform(feet + Vector2(0, 4), 0, Vector2(47, 11))
 draw_circle(Vector2.ZERO, 1.0, Color(0, 0, 0, 0.35))
 draw_set_transform(Vector2.ZERO)
 var flash = hit_flash if is_hero else rival_flash
 alien(index, feet, 190.0 if index != 1 else 215.0, right, Color(2, 2, 2) if flash > 0.0 else Color.WHITE, moving if is_hero else not stopped)
 if is_hero:
  draw_arc(feet, 38, 0, TAU, 40, Color("89ff4f"), 3)
 else:
  draw_arc(feet, 38, 0, TAU, 40, Color("ff6474"), 3)
 if is_hero and attack_pose > 0.0:
  draw_arc(feet - Vector2(0, 80), 68, -0.9 if right else 2.2, 0.9 if right else 4.0, 24, COLORS[index], 7.0)

func _draw():
 if background == null or sprites.size() != 4:
  return
 draw_texture_rect(background, Rect2(0, 0, 1280, 720), false)
 draw_rect(Rect2(0, 0, 1280, 100), Color(0.025, 0.05, 0.06, 0.88))
 if selection:
  draw_rect(Rect2(0, 100, 1280, 620), Color(0.01, 0.03, 0.05, 0.68))
  text_at("BEN 10  /  ALIEN CLASH", Vector2(390, 60), 34, Color("a3ff60"))
  text_at("CHOOSE YOUR ALIEN", Vector2(475, 145), 28)
  for i in 4:
   var rect = Rect2(120 + i * 265, 195, 245, 350)
   panel(rect, Color("163033") if i == hero else Color("101e2b"), COLORS[i] if i == hero else Color("355968"))
   alien(i, rect.position + Vector2(122, 250), 215, true)
   text_at(LABELS[i], rect.position + Vector2(20, 292), 23, COLORS[i])
   text_at(MOVES[i][1], rect.position + Vector2(20, 322), 16)
  panel(Rect2(480, 570, 320, 74), Color("83dc3c"), Color("bfff85"))
  text_at("ENTER THE ARENA", Vector2(525, 617), 26, Color("10221a"))
  text_at("Move with joystick  /  Attack, special and charged ultimate", Vector2(350, 681), 19)
  return
 for t in trails:
  alien(hero, t.pos, 190, facing_right, Color(0.5, 0.9, 1.0, t.life * 0.7))
 if position_a.y < position_b.y:
  fighter(hero, position_a, facing_right, true)
  fighter(rival, position_b, position_a.x >= position_b.x, false)
 else:
  fighter(rival, position_b, position_a.x >= position_b.x, false)
  fighter(hero, position_a, facing_right, true)
 for r in rings:
  draw_set_transform(r.pos, 0, Vector2(1.0, 0.4))
  draw_arc(Vector2.ZERO, r.radius, 0, TAU, 48, Color(r.color, r.life), 6.0)
  draw_set_transform(Vector2.ZERO)
 for p in projectiles:
  var center = p.pos - Vector2(0, 65)
  if p.kind == "crystal":
   var d = p.dir
   var side = d.orthogonal()
   draw_colored_polygon(PackedVector2Array([center + d * 24, center + side * 10, center - d * 18, center - side * 10]), p.color)
   draw_line(center - d * 12, center + d * 19, Color.WHITE, 3)
  else:
   draw_line(center - p.dir * 36, center, Color(p.color, 0.45), 22)
   draw_circle(center, 17, p.color)
   draw_circle(center, 9, Color("fff5a0") if p.kind == "fire" else Color.WHITE)
 for p in particles:
  draw_circle(p.pos, maxf(1.5, p.life * 8), Color(p.color, minf(1.0, p.life * 2)))
 panel(Rect2(18, 17, 100, 65), Color("183036"))
 text_at("ALIENS", Vector2(30, 57), 19)
 text_at(LABELS[hero], Vector2(145, 38), 20, COLORS[hero])
 panel(Rect2(145, 49, 400, 23), Color("29323c"))
 draw_rect(Rect2(149, 53, 392 * hp / 100.0, 15), Color("91ed58"))
 text_at("ROUND %02d" % round_number, Vector2(577, 49), 24)
 text_at(LABELS[rival] + "  /  RIVAL", Vector2(740, 38), 20, Color("ff838c"))
 panel(Rect2(740, 49, 400, 23), Color("29323c"))
 draw_rect(Rect2(744, 53, 392 * rival_hp / 100.0, 15), Color("ed6574"))
 panel(Rect2(1160, 17, 100, 65), Color("183036"))
 text_at("PAUSE", Vector2(1175, 57), 18)
 if status_timer > 0.0:
  panel(Rect2(440, 115, 400, 45), Color(0.03, 0.1, 0.12, 0.8))
  text_at(status, Vector2(461, 146), 22, COLORS[hero])
 draw_rect(Rect2(0, 583, 1280, 137), Color(0.02, 0.05, 0.08, 0.94))
 draw_circle(Vector2(155, 650), 57, Color("203b48"))
 draw_arc(Vector2(155, 650), 57, 0, TAU, 48, Color("54828c"), 3)
 draw_circle(Vector2(155, 650) + move_axis * 35, 24, Color("9cea65"))
 text_at("MOVE", Vector2(123, 718), 15, Color("a5c8cc"))
 text_at("OMNITRIX", Vector2(380, 626), 20, Color("a3ff60"))
 panel(Rect2(380, 646, 330, 18), Color("20363a"))
 draw_rect(Rect2(384, 650, 322 * charge / 100.0, 10), COLORS[hero])
 text_at("ULTIMATE READY" if charge >= 100.0 else "ENERGY  %d%%" % int(charge), Vector2(380, 695), 18)
 for i in 3:
  var rect = Rect2(830 + i * 140, 605, 130, 90)
  var ready = cooldown[i] <= 0.0 and (i != 2 or charge >= 100.0)
  panel(rect, Color("27483b") if ready else Color("172735"), COLORS[hero] if ready else Color("344752"))
  text_at(["ATTACK", "SPECIAL", "ULTIMATE"][i], rect.position + Vector2(16, 28), 18)
  text_at(MOVES[hero][i], rect.position + Vector2(9, 70), 12, COLORS[hero])
  if cooldown[i] > 0.0:
   text_at("%.1f s" % cooldown[i], rect.position + Vector2(37, 50), 17)
 if stopped or paused:
  draw_rect(Rect2(0, 100, 1280, 483), Color(0.015, 0.025, 0.04, 0.75))
  panel(Rect2(365, 240, 550, 210), Color("122631"), Color("91e756"))
  text_at("PAUSED" if paused else ("VICTORY" if rival_hp <= 0.0 else "TRY AGAIN"), Vector2(485, 310), 42, Color("adff70"))
  text_at("Tap anywhere to resume" if paused else "Tap ATTACK for the next fight", Vector2(440, 369), 23)
  text_at("Tap ALIENS to change character", Vector2(438, 412), 20, Color("9ab8bf"))
