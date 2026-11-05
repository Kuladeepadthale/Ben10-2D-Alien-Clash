# Combat timing batch 14.9

Eight additional aliens: Blitzwolfer, Frankenstrike, Ditto, Eye Guy, Way Big,
Buzzshock, Swampfire and Echo Echo. Details show
**Animation 14.9 · combat timing**. Earlier batch identifiers remain intact.

This updates existing native cel playback; it adds no newly drawn frames.
Forty-eight aliens now have timing profiles. The remaining roster and villains
have not received this pass.

Preparation, contact and recovery follow simulation timing, and repeated melee
uses the ability's own poses. Ditto's clone deployments, Echo Echo's resonance
field, rushes, pounces and airborne slams preserve dedicated sequencing.
Walking, designs, targeting, damage and saved progress remain unchanged.

Validation: `node ci/check-animation149.cjs` runs after
`python ci/build-cels.py --skip-bundle --through-id 23` and samples 6,480 poses
from actual exported metadata, checks source assets, both directions, native
clip ownership, phase boundaries, defensive states, dedicated moves,
simulation immutability and all six batch labels. An additional 90,600 timing
samples matched the prior source for the previous forty profiles.

The exporter adds an optional upper ID bound for focused validation. Partial
exports require --skip-bundle, so they cannot package a release accidentally.
Without the new option, production export behavior is unchanged.

The 14.8 test counts its own eight profiles rather than assuming the total
stays forty. Six timing suites run in CI. Physical Android visual testing
and a successful broader Android release build remain outstanding.
