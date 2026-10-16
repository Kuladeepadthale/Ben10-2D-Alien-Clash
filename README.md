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

## Version 0.5
Home hub with separate Modes, Match Setup, Characters, Powers, Upgrades, Settings, Controls, Credits and Results screens. Each screen includes Back navigation; Android Back pauses/resumes battle. Versus plays best of three; Training gives a resetting target; Survival carries health through successive random rivals, restores 20% health between stages and awards 40 credits per defeated rival.

Character motion now uses cached articulated mesh deformation of the same original illustrations, with stepping, arm extension, anticipation, recoil, guard, jump and hit poses. These remain newly made image-based animations, not animation extracted from the TV show. Includes material trails, impact shards, foot dust and an animated home character preview. Sound, shake and quality settings persist locally.

## Version 0.6 movement pass
Continuous pose sampling replaces the 16-step bitmap animation. WebGL texture deformation renders where supported, with a Canvas fallback. Guard, landing, recoil and attacks blend rather than snap. Ability movement uses each cast's actual wind-up, ticks and recovery. Combat runs in fixed 1/120-second simulation steps, independent of display frame rate. See `docs/movement-audit.md` for all characters, buttons and source limitations. These are authored image-based motions, not extracted cartoon animation.

## Version 0.7 joint skeletons
Each alien now has a hierarchical bone rig bound to its classic artwork: head/neck, chest/spine, waist, shoulders, elbows, wrists, hips, knees and ankles where applicable. Four Arms uses all four arm chains; Wildmutt uses four limb chains and corrected facing; Stinkfly adds wing bones; Ghostfreak uses a segmented tail instead of legs. Smooth skin weights overlap between bones, keeping the texture continuous without visible joint markers or cutout seams. Bones and neutral weights are cached; only joint matrices and vertices change per frame. Original cartoon animation has not been extracted. Physical-device performance still needs testing.

## Version 0.8 — Heatblast drawn-pose pilot
Heatblast now plays 48 newly drawn poses from a 6×8 transparent atlas instead of deforming the original single illustration. This pilot covers idle, six-key walk cycle, crouch/takeoff/ascent/apex/descent/landing, guard entry/hold/release, recoil/KO, normal punch, fireball throw, flame-jet brace, ground eruption and raised-arm ultimate. Pose changes align with each cast's actual wind-up, release and recovery. Heatblast's fireball and beam now originate at its extended palms; close-range launch sweeps preserve collision behavior. Jump includes a 70ms crouch anticipation. Other aliens retain version 0.7's joint rigs.

The atlas is newly generated artwork based on the classic Heatblast design; it is not original TV footage or studio animation. This is a test of the new animation approach, not a finished ten-alien art pass. See `web/assets/heatblast-poses/ART.md`.

## Version 0.9 — Heatblast alignment and quiet motion
The six idle drawings drift sideways across their atlas cells; cycling them made the fighter vibrate. Idle now holds the ready drawing with a 4.4-second, 0.12% breathing scale anchored at the feet (under 0.3 arena pixels of vertical motion). Sustained flame jet and ultimate hold their release drawings instead of rapidly alternating different poses. Per-frame primary-silhouette bounds, torso pivots and foot baselines register all 48 keys. Cropping excludes stray fragments from adjacent atlas rows; a floor clip prevents sprite pixels below the physical feet. Jump playback now uses the tucked ascent, apex, extended descent and landing, omitting the running-leap key. Short 35ms registered crossfades soften pose changes; additive offscreen blending preserves opacity, and impact poses appear immediately at damage release. Palm origins use the same registration as the displayed sprites.
