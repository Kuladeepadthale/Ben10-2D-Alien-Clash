# Ben 10 — Classic Alien Clash 2D

The approved ten-alien arena is in `web/`, packaged as a fully offline landscape Android game in `android/`. The previous four-alien Godot source remains in the repository for reference.

## Play
Download `Ben10-2D-Alien-Clash.apk` from the latest Android test-build release. Android 6.0+ and an up-to-date Android System WebView are required. Enable installation from your download source when Android asks. This is a debug-signed testing APK, not a Play Store release. Older builds signed with a different key require uninstalling first (which removes local progress).

Choose one of the original ten aliens, equip two of three powers, then enter the arena. Touch controls support movement, jump, guard, normal attack, two powers and ultimate. Hits require contact; guard reduces damage 70%; ultimates charge from actual dealt/received damage. Profile upgrades persist locally. Back pauses combat; back again returns to loadout. Training awards no credits.

## Build
JDK 17, Gradle 8.9, Android SDK 35. Run `gradle -p android assembleDebug`. APK: `android/app/build/outputs/apk/debug/app-debug.apk`. GitHub Actions builds and verifies the APK, then attaches it to a prerelease. No network permission, account, ads or purchases.

## Art and animation
Classic character illustrations from Trixdex are bundled with image-based animation sheets. These are newly composed puppet/transform animations, not original TV frame sequences. Powers and relative character sizes are adapted for gameplay. Ben 10 belongs to its respective owners; this is an unofficial fan project. See `web/assets/classic/README.md` and in-game credits.

The optional browser sprite importer is intended for the browser edition; the Android edition uses bundled art. Website profile saves are separate from Android app saves.
