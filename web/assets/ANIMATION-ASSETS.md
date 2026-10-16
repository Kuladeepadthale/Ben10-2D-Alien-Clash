# Original animation asset integration

This project does not include original Ben 10 production animation or game sprite sheets. The fighters now use matching classic character illustrations from Trixdex. Character pixels are preserved in image layers and animated with new puppet motion. This is not original TV animation. The prior custom-drawn fighters have been removed. The promotional reference image is not an animation sheet.

To replace an alien with original animation assets you supply:
1. Select the alien while no match is active.
2. Open Animation Lab; choose a PNG sprite atlas and the matching JSON map.
3. Click Load Animations and then Train With This Loadout.

The sample map expects 12 columns and 11 rows of 320 × 320 pixel frames (3840 × 3520 total). Update frame dimensions, columns, origin, fps, and frame numbers to match your actual atlas. Frame numbers are zero-based, left to right then top to bottom. Provide: idle, walk, normal, skill0, skill1, skill2, ultimate, hit, guard, jump, and ko. Skill indexes refer to the three abilities in roster order, not the equipped slot.

OriginX/OriginY define the feet anchor in each frame. renderHeight controls base rendered frame height before the alien's relative gameplay scale. All fighters share the same ground plane. impactFrame optionally synchronizes the attack wind-up to the chosen animation frame.

A press of J plays normal; K and L play the two equipped powers; I plays ultimate when charged. Imported animations are local to the current tab. No assets are uploaded to a server. This atlas replaces character animation; arena power effects remain the game's custom collision-driven effects.

True show-accurate relative sizes and motion require verified model sheets and original animation assets. The original image proportions are preserved; character scales are gameplay adaptations.
