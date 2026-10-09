extends SceneTree

func _initialize():
 call_deferred("capture")

func capture():
 var scene = load("res://scenes/main.tscn").instantiate()
 root.add_child(scene)
 await process_frame
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png("res://builds/alien-selection.png")
 scene.selection = false
 scene.reset_round()
 scene.process_mode = Node.PROCESS_MODE_DISABLED
 scene.position_a = Vector2(440, 455)
 scene.position_b = Vector2(840, 475)
 scene.cast(0)
 scene.queue_redraw()
 await process_frame
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png("res://builds/arena-gameplay.png")
 print("Saved actual Godot selection and gameplay screenshots")
 quit()
