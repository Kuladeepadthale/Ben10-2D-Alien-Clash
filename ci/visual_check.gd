extends SceneTree
func _initialize():
 call_deferred("capture")
func capture():
 var game = load("res://scenes/main.tscn").instantiate()
 root.add_child(game)
 await create_timer(0.5).timeout
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png("res://builds/alien-selection.png")
 game.begin()
 await create_timer(0.3).timeout
 game.player.position = Vector3(0, 0.1, 3)
 game.enemy.position = Vector3(3, 0.1, -1)
 game.yaw = 0.7
 game.pitch = 0.35
 await create_timer(0.6).timeout
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png("res://builds/arena-gameplay.png")
 game.enemy_cooldown = 100
 game.axis = Vector2(0, -1)
 for i in 24:
  await create_timer(1.0 / 12.0).timeout
  await RenderingServer.frame_post_draw
  root.get_texture().get_image().save_png("res://builds/movement-%03d.png" % i)
 print("Captured actual 3D gameplay and movement frames")
 quit()
