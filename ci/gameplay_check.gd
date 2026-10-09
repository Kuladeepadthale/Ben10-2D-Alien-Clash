extends SceneTree
func _initialize():
 call_deferred("run_checks")
func run_checks():
 var game = load("res://scenes/main.tscn").instantiate()
 root.add_child(game)
 await create_timer(0.4).timeout
 for index in 2:
  game.pick(index)
  assert(game.player_anim != null, "Character animation player missing")
  assert(game.skeleton != null and game.skeleton.get_bone_count() >= 20, "Skeleton missing")
  var animations = str(game.player_anim.get_animation_list())
  assert("Idle_Breathe" in animations and "Walk_Narrow" in animations and "Run_Narrow" in animations, "Movement clips missing")
  game.begin()
  await create_timer(0.25).timeout
  for slot in 3:
   game.reset_round()
   game.player.position = Vector3(0, 0.1, 3)
   game.enemy.position = Vector3(0, 0.1, 0)
   game.energy = 100
   game.cast(slot)
   await create_timer(0.4).timeout
   assert(game.enemy_hp < 100, "Ability failed to damage rival")
 game.reset_round()
 await create_timer(0.4).timeout
 var start = game.player.position
 game.axis = Vector2.RIGHT
 await create_timer(0.3).timeout
 assert(game.player.position.x > start.x + 0.1, "Movement failed")
 assert("Run_Narrow" in game.player_anim.current_animation, "Running animation not selected")
 game.axis = Vector2.ZERO
 await create_timer(0.4).timeout
 assert(Vector2(game.player.velocity.x, game.player.velocity.z).length() < 0.1, "Deceleration failed")
 assert("Idle_Breathe" in game.player_anim.current_animation, "Idle transition failed")
 game.jump()
 await create_timer(0.1).timeout
 assert(game.player.position.y > 0.1, "Jump failed")
 game.pause_game()
 var paused_at = game.player.position
 await create_timer(0.1).timeout
 assert(game.player.position.is_equal_approx(paused_at), "Pause failed")
 game.pause_game()
 game.reset_round()
 assert(game.projectiles.is_empty() and game.hp == 100 and game.cooldown[0] == 0, "Reset failed")
 print("PASS: two rigged models, six abilities, animation transitions, acceleration, braking, jump, pause and restart")
 quit()
