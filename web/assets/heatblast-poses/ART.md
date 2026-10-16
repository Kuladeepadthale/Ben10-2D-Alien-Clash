# Heatblast drawn-pose pilot

`atlas-v8.png` is a 1086×1448 RGBA atlas with 6 columns and 8 rows (181×181 pixels per cell). Generated with the built-in image-generation tool using the existing classic Heatblast illustration as identity reference. It contains new artwork, not frames extracted from the Ben 10 cartoon. Ben 10 belongs to its respective owners.

Rows: idle; walk; jump; guard/hit/KO; punch; fireball; flame jet; eruption/ultimate. Runtime frame mapping and impact synchronization are in `web/heatblast-poses.js`. PNG encoding was normalized without changing decoded RGBA pixels. The original generated sheet contained glow particles; a requested cleanup pass was blocked by the image service, so that pass was not used.

## Generation brief
A transparent 6-column × 8-row sprite atlas with exactly 48 separate full-body classic Heatblast poses. Preserve the reference's red magma-rock body, yellow fissures, flame head, pale hands/feet and chest Omnitrix badge. Create newly drawn poses rather than distorted copies. Face right in a three-quarter fighting stance with consistent scale, camera and outlines. Animate clear elbow/knee bends, waist rotation, anticipation, release and recovery. Row 1: breathing ready stance loop. Row 2: contact/down/passing/opposite-contact/down/passing walk cycle. Row 3: crouch/takeoff/ascent/apex/descent/landing. Row 4: ready/guard/full guard/recoil/recovery/side-lying KO. Row 5: ready/wind-up/jab/extension/follow-through/recovery. Row 6: ready/hand drawn back/torso turn/palm thrust/follow-through/recovery. Row 7: ready/wide stance/aim/palms extended/sustained release/recovery. Row 8: crouch/ground palm/slam/rise/raised arms/ultimate release. Transparent background; no text, labels or grid lines.

## Limits
This is an initial key-pose pilot, with six keys per major row and limited in-between drawings. It is not yet a full production animation set. Motion quality and frame pacing require review on the user's Android device.
