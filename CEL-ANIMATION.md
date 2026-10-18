# All-alien cel animation upgrade

Version 3.0 replaces the optical-flow/blended character renderer with complete native-resolution cel drawings. All ten aliens have clips for idle, locomotion, jump, normal strike, three selectable powers, ultimate, guard, hit, knockdown, and forward dodge dash. Heatblast retains the approved pilot walk, jump and fireball drawings and gains the remaining actions. XLR8 skates, Wildmutt moves on four limbs, Stinkfly flies and Ghostfreak floats.

`web/cel-player.js` draws exactly one registered complete body frame at a time. No optical flow, frame blending, limb deformation or procedural replacement legs are used. Eight locomotion drawings advance from actual distance traveled, including reverse travel. Attack drawing changes follow the combat wind-up, active and recovery windows. The gameplay engine still owns projectile motion, collision, damage, jump gravity and the 0.22-second dodge dash. Original save keys, application ID and signing-key cache remain unchanged.

The art is newly generated cel artwork based on the existing character designs, using the built-in ImageGen tool. It is not animation extracted from the television show. This delivers the approved pilot's drawing and playback approach; it is not a claim of 4K source drawings or television animation frame counts. Raw sheets contain eight large drawings each (four columns by two rows); their complete prompts are in `ci/cel-sources/prompts.json`. Processed sheets retain native resolution in lossless WebP. The exporter uses connected-body masks to record tight crop bounds and body origins, retains the native source sheets, and creates portraits.

Only the current fighter pair's large textures are retained. Other fighters load before their match begins; all ten portraits are available in the roster. APK packaging includes the new cel assets and UI, excluding the obsolete blended atlases.

## Build and verify

```sh
python3 -m pip install Pillow numpy scipy
npm install --prefix /tmp/cel-tools --no-package-lock --no-save @napi-rs/canvas jsdom@30.1.3 css-tree
export NODE_PATH=/tmp/cel-tools/node_modules
python3 ci/build-cels.py
node ci/check-cels.cjs
node ci/check-footwork-dash.cjs
node ci/check-interface.cjs
node ci/check-cel-ui.cjs
node ci/render-cels.cjs
python3 ci/verify-cel-video.py
gradle -p android assembleDebug
```

FFmpeg must be installed to render and verify the downloadable preview. GitHub Actions installs it explicitly. The release contains the signed test APK, 1080p MP4 preview of every action for every alien, ZIP copy and SHA-256 checksums. Automated drawing/control checks do not replace Android device play-testing.
