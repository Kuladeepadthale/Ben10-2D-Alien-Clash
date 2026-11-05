# Combat timing batch 14.12

Eight additional aliens: Bootleg, Crystalfist, Dark Matter, Hot Shot,
Humungoraptor, Quad Smack, Skunkmoth and Thornblade. Details show
**Animation 14.12 · combat timing**. Earlier batch identifiers remain intact.

This updates existing native cel playback without adding newly drawn frames.
Seventy-two aliens now have timing profiles. The remaining roster and villains
have not received this pass.

Preparation, contact and recovery follow simulation timing. Repeated melee
uses the ability's own native clip. Humungoraptor's tail sweep, Thornblade's
vine lash, rushes, pounces/dives and airborne slams preserve dedicated
sequencing. Walking, designs, damage, targeting and saved progress are unchanged.

Validation: `node ci/check-animation152.cjs` samples 6,480 poses from committed
expansion metadata, checking frame geometry, both directions, clip ownership,
phase boundaries, defensive states, preserved moves, simulation immutability,
and all nine batch labels. The prior 14.11 suite also passed locally after
changing its total-profile assertion to count only its eight profiles.
Another 144,960 samples matched the prior timing function for the existing
sixty-four profiles. All timing suites continue to run in CI.

These checks validate metadata and playback logic, not rendered pixels or
physical-device visual quality. A successful broader Android release build
remains outstanding.
