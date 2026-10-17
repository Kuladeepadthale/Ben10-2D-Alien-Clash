# Diamondhead motion study — 1.3

This revision keeps the generated classic-style artwork from 1.2 and replaces its procedural walk with coordinated motion derived from recorded human walking. It is a humanoid retargeting study for Diamondhead, not original Ben 10 television animation or a claim of studio-level animation quality.

## Motion data and attribution

**The 100STYLE Dataset — Ian Mason**, licensed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).

Source: [100STYLE](https://www.ianxmason.com/100style/), Ian Mason, Sebastian Starke and Taku Komura, *Real-Time Style Modelling of Human Locomotion via Feature-Wise Transformations and Local Motion Phases* (2022).

The source provides separate forward walking and backward walking recordings at 60 fps. This project derives a continuous loop from each; backward walking is not forward walking played in reverse. `diamondhead-gait-data.js` includes the recording names, selected frame ranges, source SHA-256 hashes, measured stride distances, original cycle durations and the extracted curves.

Changes to the source data: hierarchical BVH forward kinematics; projection onto the direction of travel and vertical plane; removal of horizontal root translation; selection of a recurring gait cycle; small cycle-drift correction; an eight-harmonic periodic Fourier fit; 96 numeric samples per loop; Catmull-Rom interpolation at runtime; retargeted proportions, neutral posture and modest body motion for the crystal character. The artwork is unchanged. The original BVH recordings are not bundled in the APK.

To regenerate, download `Neutral_FW.bvh` and `Neutral_BW.bvh` from the dataset page and run:

```
python ci/build-diamondhead-gait.py Neutral_FW.bvh Neutral_BW.bvh
```

NumPy is required only for this offline conversion. The game runs offline with ordinary Canvas 2D.

## Movement research

The study considered contact, loading, midstance, push-off and swing; knee/ankle interaction; pelvic rotation and weight transfer; trunk/shoulder coordination; and head stabilization. Primary university references:

- [University of Oklahoma: gait kinematics and center-of-gravity motion](https://www.ouhsc.edu/bserdac/dthompso/web/gait/knmatics/gait.htm)
- [Pelvic rotation](https://www.ouhsc.edu/bserdac/dthompso/web/gait/knmatics/pelbase.htm)
- [Coordinated proximal movement and shoulder/pelvis counter-rotation](https://www.ouhsc.edu/bserdac/dthompso/web/namics/labs/proxmove.htm)
- [Muscle activity and gait-phase timing](https://www.ouhsc.edu/bserdac/dthompso/web/gait/kinetics/mmactsum.htm)

Ben 10 visual reference: [April Amezquita's production storyboard portfolio](https://www.aprilgen.com/ben10/) and its Diamondhead transformation panels were reviewed for angular design and connected posing. Those are transformation storyboards for the 2016 series, not a classic walking cycle. The official Classic Diamondhead compilation was located but could not be played through the research tool; no claim is made that its motion was analyzed frame by frame.

## Implementation and limits

All limb endpoints come from connected, constant-length chains. Chest anchors carry the shoulders and neck; the head has its own stabilized response. Pelvis and chest curves influence their own attachments rather than swinging arms around unrelated fixed points. Wrist and boot angles follow the captured motion. The actual boot silhouette, rather than an axis-aligned sprite rectangle, defines floor support. A smooth support change avoids a root-height kink when the supporting foot changes. Starts/stops blend joint motion; direction switches match leg configurations and ease numeric joints, without fading between full-body images.

The 3D human motion is adapted to a 2D crystal rig with existing game movement speed. This is not a physics simulation, a full 3D character, or hand-drawn television inbetweens. The 2D art cannot reveal newly drawn surfaces during large turns. Game hitboxes, movement speed, attacks and the other aliens are unchanged. Real Android performance and the user's aesthetic assessment remain the final checks.

## Version 1.4 — reference size and proportions

The movement artwork is calibrated to the original classic Diamondhead reference at the game's existing height of `226 × 1.12 = 253.12` arena pixels. Its approximately 300:480 reference silhouette implies a target width of 158.2 pixels. A Canvas alpha-bounds measurement of the revised neutral rig gives 253 × 157 pixels (threshold 140), within one pixel of that target.

The revision reduces the oversized head, broadens the torso/shoulders, increases arm length and mass, and thickens the legs. The torso's attachment points move with the resized artwork. Continuous joint timing is retained; arms remain fixed-length connected chains (43 and 48 local pixels), and the source-stride playback is compensated for the corrected horizontal display scale. The existing character scale still applies to both axes. No hitboxes, movement speeds, combat poses or other characters are changed.
