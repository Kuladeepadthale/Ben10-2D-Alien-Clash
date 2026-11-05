# Combat timing batch 14.8

Eight additional aliens: Walkatrout, Overflow, Shock Rock, Slapback, Surge,
Ultimate Humungousaur, Ultimate Echo Echo and Rush. Their details show
**Animation 14.8 · combat timing**. Earlier batch identifiers are retained.

This refines existing native cel playback; it does not add newly drawn frames.
Forty aliens now have timing profiles. The remaining roster and villains have
not received this pass.

Preparation, contact and recovery follow simulation timing. Repeated melee
uses each ability's own poses. Surge's cross-slice and formation, Ultimate
Humungousaur's tail, Ultimate Echo Echo's disc ring, Rush's wheel cyclone and
high-speed kick retain their dedicated sequencing. Rushes, pounces and airborne
slams also retain their existing choreography. Walking, hovering, designs,
damage, targeting and saved progress remain unchanged.

Validation: `node ci/check-animation148.cjs` samples 6,480 native poses using all
eight actual reviewed metadata sets, both directions, native clip ownership,
phase boundaries, defensive states, dedicated moves, simulation immutability
and five batch labels. An additional 72,480 samples matched the prior timing
function for the previous thirty-two profiles.

The 14.7 test now counts its own eight profiles rather than assuming the total
profile count remains thirty-two. All five timing suites run in CI. Physical
Android visual testing remains outstanding, and the broader Android release
workflow has unresolved failures outside these timing checks.
