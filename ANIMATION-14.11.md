# Combat timing batch 14.11

Eight additional aliens: Ultimate Wildmutt, Ultimate Spidermonkey, Ultimate
Way Big, Ultimate Arctiguana, Ultimate Gravattack, Ultimate Rath, Ultimate
Grey Matter and Bashmouth. Details show **Animation 14.11 · combat timing**.
Earlier batch identifiers remain intact.

This updates existing native cel playback without adding newly drawn frames.
Sixty-four aliens now have timing profiles; the remaining roster and villains
have not received this pass.

Preparation, contact and recovery follow simulation timing. Repeated melee
uses the ability's own native clip. Ultimate Wildmutt's tail, sustained gravity
and psychic fields, rushes, pounces and airborne slams preserve their dedicated
sequencing. Walking, designs, targeting, damage and saved progress are unchanged.

Validation: `node ci/check-animation151.cjs` samples 6,480 poses from the actual
committed expansion metadata, checking frame geometry, both directions, native
clip ownership, phase boundaries, defensive states, dedicated moves, simulation
immutability and all eight batch labels. It does not inspect rendered pixels
or claim physical-device visual validation. An additional 126,840 timing
samples matched the prior function for the previous fifty-six profiles.

The 14.10 test counts its own eight profiles rather than fixing the total at 56.
All timing suites still run in CI. The unchanged classic export is cached by
source-art, exporter, roster and data hashes; a miss rebuilds it before the two
classic metadata suites run. The new expansion check runs before that export.

A successful broader Android release build remains outstanding.
