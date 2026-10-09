extends SceneTree

func _initialize() -> void:
 var settings = EditorInterface.get_editor_settings()
 settings.set_setting("export/android/java_sdk_path", OS.get_environment("JAVA_HOME"))
 settings.set_setting("export/android/android_sdk_path", OS.get_environment("ANDROID_HOME"))
 settings.set_setting("export/android/debug_keystore", OS.get_environment("HOME") + "/.android/debug.keystore")
 settings.set_setting("export/android/debug_keystore_user", "androiddebugkey")
 settings.set_setting("export/android/debug_keystore_pass", "android")
 var err = ResourceSaver.save(settings, settings.get_settings_dir() + "/editor_settings-4.3.tres")
 if err != OK:
  push_error("Cannot save Android editor settings: %s" % err)
  quit(1)
  return
 print("Configured and saved Android toolchains")
 quit()
