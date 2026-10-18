# Heatblast cel-clip visual pilot

These new raster test assets were generated with the built-in image-generation tool using the existing Heatblast design as reference. They are not extracted TV animation. The approved pilot drawings are now integrated in version 3.0.

- `assets/walk-source.png`: eight upright full-body contact, down, passing and up poses in a 4×2 grid; alternating left/right steps and opposing arm swing; red magma body, yellow fissures, flaming head and chest emblem; transparent background, consistent scale, clean cel contours, no motion blur or blended limbs.
- `assets/actions-source.png`: matching 4×2 sheet; four jump poses (anticipation, takeoff, tucked apex, landing) and four fireball poses (preparation, windup, open-palm release, recovery); full connected anatomy, transparent background, same design and no detached projectile. The preview supplies the projectile as a separate effect.

The final targeted walk revision requested an upright side-view gait instead of the reference's crouched fighting guard, visibly swapped front/back contact poses, and supporting feet moving backward relative to the torso. The action prompt requested the same design and rendering style as that revised walk sheet.

`prepare.py` slices the source cells, removes detached alpha noise, registers the chest badge and soles, and writes the clip manifest. `player.cjs` selects discrete frames on input without optical flow, crossfades or pose blending. `render.cjs` records the three independently triggered sequences. `pack.py` decodes and validates every deliverable before packaging.

This tests clarity and per-action playback. More authored in-between drawings and animation review are needed before production use or claiming film-like smoothness.
