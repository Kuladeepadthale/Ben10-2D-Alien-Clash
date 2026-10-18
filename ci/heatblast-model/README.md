# Heatblast model-to-sprite pilot

This is an authored Blender 4.3 model and animation generator, not a Cascadeur integration or an extraction of Nekki animations. A classic-inspired faceted crimson/yellow body uses skeletal deformation, IK arms/legs and curling fingers. The actual bundled original classic illustrated head is retained as a texture decal over the head volume. The existing character-art credits apply to that texture.

The chest surface blends pelvis/spine weights. Solid 3D elbow/wrist/knee sockets overlap inside the limb geometry. Molten seams are evaluated from an explicitly stored bind-pose `rest_position` attribute so the pattern follows deformed geometry rather than sliding in object space. Forward/backward foot targets have separate direction and a 62% stance interval with linear ground-relative travel and a smooth Hermite swing path. Timing is authored; it is not captured motion or a physically simulated body.

Generate from the repository root:

1. `python3 ci/heatblast-model/prepare.py` (Pillow).
2. `blender --background --python ci/heatblast-model/build.py`, or run the same script with Python 3.11 plus the `bpy==4.3.0` wheel with `numpy<2`. This writes 256 transparent renders and a packed-texture `heatblast.blend` checkpoint under `tmp/heatblast-model/`.
3. `python3 ci/heatblast-model/pack.py` (Pillow).
4. `node ci/check-heatblast-model.cjs` (`@napi-rs/canvas`).

Output: 8 idle, 48 forward, 48 backward, 16 jump/landing, 12 guard, 8 hit, 16 knockdown, 20 normal, 20 fireball, 20 jet, 16 eruption and 24 ultimate frames. All use the same camera, model, scale and floor. The renders are losslessly encoded into four 1536 × 1536 WebP atlases after a 224-to-192-pixel antialiased size reduction to keep phone memory lower. The atlas is the phone runtime asset; Blender and a live 3D engine are not required in the APK. Hand-emitter positions are projected from the animated wrist/hand bone.

The pilot is classic-inspired and is not an exact recreation of television animation or studio-quality Shadow Fight animation. Device performance still needs measurement. The 1.9 menus and other aliens are preserved.
