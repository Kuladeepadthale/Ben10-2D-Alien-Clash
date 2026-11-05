# Combat timing batch 14.10

Eight additional aliens: Humungousaur, Jetray, Big Chill, Chromastone,
Brainstorm, Spidermonkey, Goop and Alien X. Their details show
**Animation 14.10 · combat timing**. Earlier batch identifiers remain intact.

This updates existing native cel playback without adding newly drawn frames.
Fifty-six aliens now have timing profiles. The remaining roster and villains
have not received this pass.

Preparation, contact and recovery follow simulation timing. Repeated melee
uses the ability's own poses. Goop's attached elastic strike, Brainstorm's
static field, rushes, pounces and airborne slams retain dedicated sequencing.
Walking, designs, targeting, damage and saved progress remain unchanged.

Validation: `node ci/check-animation150.cjs` samples 6,480 poses from actual
exported metadata, checking source assets, both directions, native clip
ownership, phase boundaries, defensive states, dedicated moves, simulation
immutability and all seven batch labels. An additional 108,720 timing samples
matched the prior timing function for the previous forty-eight profiles.

The exporter now supports --only-ids for focused metadata validation. It is
permitted only with --skip-bundle and validates every ID against the selected
roster range. With no selection option, normal production export is unchanged.
CI exports the sixteen IDs used by batches 14.9 and 14.10 once, then runs
both native metadata suites. All earlier timing suites still run beforehand.
The 14.9 test now counts its own profiles rather than fixing the total at 48.

Batch 14.10 has an explicit display label so it is not displayed as 15.0.
Physical Android visual testing and a successful broader Android release
build remain outstanding.
