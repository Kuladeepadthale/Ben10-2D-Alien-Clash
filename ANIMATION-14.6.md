# Combat timing batch 14.6

Eight additional aliens: Nanomech, AmpFibian, Terraspin, Fasttrack, Chamalien,
Eatle, Clockwork and Jury Rigg. Their details show
**Animation 14.6 · combat timing**. Previous batches retain 14.4 and 14.5.

This updates existing native cel playback. It does not add newly drawn frames.
Twenty-four aliens now have timing profiles; the remainder and villains have
not received this pass.

Preparation, contact and recovery follow simulation timing. Repeated melee
retracts using the ability's own poses, including two-frame clips. Terraspin's
rotating flippers, Fasttrack's cyclone kicks, Chamalien's tail sweep, Jury Rigg's
gear trap/ultimate assembly, rushes, pounces and airborne slams retain their
existing specialized sequences. Walking, hovering, targeting, damage and saved
progress remain unchanged.

Validation: `node ci/check-animation146.cjs` checks 6,480 native pose samples
using all eight reviewed metadata sets, both directions, native clip ownership,
phase boundaries, defensive fallbacks, preserved moves, simulation immutability,
and all three detail labels. An additional 36,240 timing samples were compared
against the preceding source for the previous sixteen profiles with no change.
Existing 14.4/14.5 checks and this suite run in the combat timing workflow.
Physical Android visual testing remains outstanding.
