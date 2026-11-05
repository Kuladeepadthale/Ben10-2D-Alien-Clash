# Combat timing batch 14.5

Eight additional aliens: Snare-oh, Upchuck, Arctiguana, Spitter, Lodestar,
Water Hazard, Armodrillo and NRG. Their details show
**Animation 14.5 · combat timing**. The previous eight retain their 14.4 marker.

This pass uses existing reviewed native artwork. It refines preparation,
contact and recovery playback; it does not add newly drawn animation frames.
Sixteen aliens now have combat timing profiles. Other aliens and villains
have not received this timing pass.

Sustained beams retain their contact pose. Repeated melee strikes retract
between contacts, including two-frame clips, using each ability's own poses.
Upchuck's tongue, Spitter's tail sweep, Arctiguana's ultimate, rushes, pounces
and airborne slams retain their existing dedicated choreography. Walking,
designs, damage, targeting and saved progress remain unchanged.

Validation: `node ci/check-animation144.cjs` and
`node ci/check-animation145.cjs`. The latter loads all eight actual reviewed
metadata sets and samples every attack in both directions, checks native clip
ownership and phase boundaries, verifies defensive fallbacks and simulation
immutability, and checks both batch labels and unmarked-character behavior.
Physical Android visual testing is still outstanding.
