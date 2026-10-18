# Ben 10 — Classic Alien Clash 2D

**Version 3.1:** larger readable menus, a free starter choice, coin-based alien unlocks, missions and rewards, and a character-first upgrade picker. Testing keeps all ten aliens available. See [PROGRESSION.md](PROGRESSION.md).

An unofficial ten-alien arena game in `web/`, packaged as an offline landscape Android game in `android/`. The previous four-alien Godot source remains for reference.

## Version 3.0 — Full cel action clips

All ten aliens now use newly drawn, native-resolution whole-body cel clips for idle, locomotion, jump, normal strike, all three powers, ultimate, guard, hit, knockdown and dash. Heatblast uses the approved pilot walk, jump and fireball art. XLR8 skates, Wildmutt moves on four limbs, Stinkfly flies, and Ghostfreak floats. Discrete cel playback replaces optical-flow interpolation, crossfades and procedural replacement limbs. Walk timing follows actual travel distance. Battle textures are loaded for the current fighter pair.

Download `Ben10-2D-Alien-Clash.apk` from the newest successful [Android release](../../releases). The release also includes `All-Aliens-Cel-Actions.mp4`, a ZIP copy and checksums. Android 6.0+ with an up-to-date Android System WebView is required. This is a debug-signed test APK. The application ID, save keys and signing-key cache are retained for updates from the preceding build.

## Play

Choose an alien, equip two of three powers, and start Versus, Training or Survival. Hits require contact; guard reduces damage by 70%; ultimates charge from damage dealt and received. Upgrades save on the device. Survival carries health through random rivals and restores 20% maximum health after each win. Training awards no credits.

Move with A/D, jump with W, normal strike J, powers K/L, ultimate I, guard Space, forward dodge dash Shift/E, pause Esc. Mobile has corresponding touch buttons. Dash travels up to 190 arena units over 0.22 seconds with dodge protection and a 1.25-second cooldown.

## Build and verify

See [CEL-ANIMATION.md](CEL-ANIMATION.md) for asset generation, tests and preview rendering. Install Python Pillow/numpy/SciPy, run `python3 ci/build-cels.py`, then build with JDK 17, Gradle 8.9 and Android SDK 35: `gradle -p android assembleDebug`. APK: `android/app/build/outputs/apk/debug/app-debug.apk`. GitHub Actions exports and tests the new sprites, renders and validates the MP4, builds and verifies the APK, then publishes both. FFmpeg is installed explicitly by CI.

## Art

The new cel sheets were generated with ImageGen from the existing classic character designs and the approved Heatblast preview style. They are new game artwork, not TV footage. Original design references were sourced from Trixdex; Ben 10 belongs to its respective owners. Powers and relative sizes are adapted for gameplay. Source prompts and sheets are in `ci/cel-sources/`; processed game assets are in `web/assets/cels/`.

The optional browser sprite importer remains available. Browser saves and Android saves are separate. Automated animation and control checks do not replace play-testing on a physical Android device.

