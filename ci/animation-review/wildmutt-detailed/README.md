# Wildmutt detailed cartoon revision

User rejected the simplified procedural/vector redesign. It is superseded and removed from index.html. Do not use it as the quality reference for future aliens.

Use generated drawings grounded in the existing original Wildmutt portrait. Preserve detailed organic musculature, face, teeth, gills, claws, fur and shoulder badge. Generate enough distinct anticipation, contact, follow-through and recovery drawings rather than moving a static picture.

This revision contains 64 isolated detailed cartoon cels in four lossless WebP atlases:
- 16 movement drawings
- 8 basic claw/bite combo drawings
- 8 Claw flurry drawings
- 8 Predator pounce drawings
- 8 Savage lunge drawings
- 8 Apex Hunt drawings
- 8 neutral, breathing, guard, recoil and defeat drawings

Ordinary jumps use the takeoff, airborne and landing drawings from the pounce sequence. Dash uses the running portion of the movement cycle.

Generated with the built-in image generation tool, using `web/assets/classic/wildmutt/portrait.webp` as the identity reference. No TV footage was extracted. Prompts specified exact eyeless original anatomy, consistent physical dimensions, true alpha, separate complete right-facing figures, four-leg gait, attack sequences, and no effects baked into bodies. Atlas source metadata is in atlas.json; export.py records the pixel extraction procedure. Generated native sheet size is 1254x1254, not the larger size requested in the prompt; do not advertise a higher native resolution. Frame sizes are retained without upscaling.

Registration uses the shoulder badge and common foot baseline, with one neutral-model calibration per sheet. KO and crouch poses are not enlarged to fill a standing box. Exactly one body is drawn per render: no opacity crossfades or ghost bodies. The existing simulation's windup, hit ticks, active time, recovery and facing choose the frame. Damage and rewards are unchanged.

Checks: 64 frame rectangles, no atlas cropping, fixed per-sheet calibration, 2,880 action/facing samples, single-body draw, mirrored attack origin and other-character isolation. Browser CI tests all actions in both directions against released engine. Phone and player visual review pending.

Do not create APK/AAB until the user asks. The eventual package must copy both detailed scripts, all four atlases and the latest index. Keep the rejected rig unloaded.
