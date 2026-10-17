# Original Diamondhead artwork — version 1.5

Diamondhead now renders from the existing bundled **`assets/classic/diamondhead/portrait.webp`**, the same original classic character illustration shown in the roster and original reference. No generated replacement head, uniform, boots, hands or torso is selected by this renderer. The character's existing art credits remain applicable.

At rest, the original image is drawn directly at the existing game height `226 × aliens[2].scale` (253.12 pixels at scale 1.12), with its native 300:480 aspect ratio (158.2 pixels wide). No reconstruction, stretching by separate body-axis scales, or color replacement is used for the resting character.

During movement, the original image is the single continuous texture on its existing anatomical joint mesh. The separate forward/backward human-motion curves introduced in 1.3 drive rotations in the original bind pose. The head, uniform, logo, crystal skin, hands and black boots retain their original pixels. Starts/stops and direction changes interpolate numeric joints. This is image-based skeletal animation; it cannot reveal unseen views or create hand-drawn television frames.

The same original texture remains active in jumping, guard, normal attacks, powers, recoil and KO. Those actions use the existing articulated combat poses instead of switching to generated pose sheets. Crystal projectiles use the animated original wrist as their emitter. The other nine aliens keep their previous rendering.

WebGL uses the existing shared texture renderer. If WebGL is unavailable, a Diamondhead-specific barycentric texture rasterizer writes interpolated source pixels into a cached Canvas buffer. It avoids clipped-triangle seams and avoids padded clips leaking neighboring limb pixels. The source texture is read once; buffers are reused. Canvas-only performance still requires testing on the user's phone.

Validation: exact original image object and native aspect at rest, identity bind geometry, continuous forward/backward rig execution, original-texture combat routing, finite wrist emitters, delegation for other aliens, script checks, and rendered Canvas frame inspection. Source attribution for the recorded locomotion remains in `MOTION.md` and in-game Credits.

The generated `walk-parts-v1.png` and earlier 1.2–1.4 notes are historical artifacts. They are no longer loaded or used by Diamondhead's active renderer.
