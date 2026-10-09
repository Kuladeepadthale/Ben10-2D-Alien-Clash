extends SceneTree

func _initialize():
 call_deferred("check_game")

func check_game():
 var scene = load("res://scenes/main.tscn").instantiate()
 root.add_child(scene)
 await process_frame
 assert(scene.sprites.size() == 4, "Four sprites must be loaded")
 assert(scene.background != null, "Arena texture must be loaded")
 for texture in scene.sprites:
  assert(texture != null and texture.get_width() > 0, "Missing character texture")
 scene.selection = false
 for alien in 4:
  scene.hero = alien
  for slot in 3:
   scene.reset_round()
   scene.position_b = scene.position_a + Vector2(100, 0)
   scene.charge = 100.0
   scene.cast(slot)
   for frame in 20:
    scene._physics_process(1.0 / 60.0)
   assert(scene.rival_hp < 100.0, "Alien %d move %d did not damage the rival" % [alien, slot])
   assert(scene.cooldown[slot] > 0.0 or alien == 3 and slot == 0, "Cooldown missing")
 scene.reset_round()
 scene.move_axis = Vector2.RIGHT
 var old = scene.position_a
 scene._physics_process(0.1)
 assert(scene.position_a.x > old.x, "Movement failed")
 scene.cooldown = [5.0, 5.0, 5.0]
 scene.reset_round()
 assert(scene.cooldown == [0.0, 0.0, 0.0], "Restart must reset cooldowns")
 assert(scene.projectiles.is_empty(), "Restart must clear projectiles")
 scene.position_b = scene.position_a + Vector2(100, 0)
 scene.enemy_cooldown = 0.0
 scene._physics_process(0.1)
 assert(scene.hp < 100.0, "Rival melee attack failed")
 print("PASS: four textures, arena, twelve abilities, movement, restart and rival combat")
 quit()
