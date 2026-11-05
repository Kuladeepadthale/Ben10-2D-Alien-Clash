# Combat timing batch 14.7

Eight additional aliens: Shocksquatch, Feedback, Bloxx, Gravattack, Bullfrag,
Gutrot, Atomix and The Worst. Details show **Animation 14.7 · combat timing**.
The previous twenty-four retain their individual batch identifiers.

This refines playback using existing native artwork, without newly drawn
animation frames. Thirty-two aliens now have timing profiles. Villains and the
remaining roster have not received this pass.

Preparation, contact and recovery follow simulation timing. Repeated melee
uses the ability's own poses. Bullfrag's tongue snare, The Worst's belly-drive
attachment, rushes, pounces and airborne slams retain dedicated choreography.
Walking, hovering, damage, targeting and saved progress remain unchanged.

Validation: `node ci/check-animation147.cjs` checks 6,480 native pose samples
using eight actual reviewed metadata sets, both directions, clip ownership,
phase boundaries, defensive states, simulation immutability, dedicated moves
and four detail labels. An additional 54,360 timing samples matched the prior
source for the existing twenty-four profiles.

Previous timing suites now accept later cache versions, while requiring the
script and a version at least as new as their own batch. The 14.6 test checks
its own eight profiles rather than fixing the total roster size at twenty-four.

At the start of this batch, the preceding Android workflow had failed broader
release checks (including UI assertions and missing upgradeFactor141 in test
harnesses). Those issues are outside this playback batch; no successful APK
release or physical Android visual validation is claimed here.
