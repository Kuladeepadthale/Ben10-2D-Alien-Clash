# Combat timing batch 14.13

Eight additional aliens: Toepick, Pesky Dust, Kickin' Hawk, Whampire,
Mole-Stache, Gax, Ultimate Big Chill and Ultimate Swampfire. Details show
**Animation 14.13 · combat timing**. Earlier batch identifiers remain intact.

This refines existing native cel playback without adding newly drawn frames.
Eighty aliens now have timing profiles. The remaining roster and villains
have not received this pass.

Preparation, contact and recovery follow simulation timing. Repeated melee
uses the ability's own native clip. Pesky Dust's dream spiral/ultimate,
Mole-Stache's attached moustache attacks, rushes, pounces and airborne slams
preserve dedicated sequencing. Walking, designs, damage, targeting and saved
progress remain unchanged.

Validation: `node ci/check-animation153.cjs PATH_TO_PINNED_MANIFEST` samples
6,480 poses using native metadata extracted from the same SHA-verified pinned
72-character APK used by ci/restore-verified-art.py. The extractor verifies the
APK hash and complete ID range before writing metadata. CI caches only the
extracted metadata and runs geometry, identity, clip ownership, phase boundary,
defensive-state, preserved-move, immutability and ten batch-label checks.
An additional 163,080 timing samples matched the prior function for the
previous seventy-two profiles.

The 14.12 test counts its own eight profiles rather than fixing the total at 72.
All earlier timing suites continue to run. These checks do not inspect rendered
pixels or establish physical-device animation quality. A successful broader
Android release build remains outstanding.
