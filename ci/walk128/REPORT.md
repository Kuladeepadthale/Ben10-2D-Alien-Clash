# Upgrade-reference ground walking — v12.8

Upgrade's existing native eight-pose cycle is the quality reference and remains unchanged. This update calibrates other ground walkers to the foot span present in their own artwork, rather than transplanting Upgrade's body or leg motion.

The audit measures native foot spread and torso registration in all92 aliens. Ordinary biped stride timing is calibrated against Upgrade's measured foot span, capped at a15% reduction or18% increase. Species-specific crawling, waddling, running and fluid stride timing stays intact. Torso-centering corrections remove only movement beyond Upgrade's native sway band and are capped at2.5% of physical height. These are root-position corrections; no limb deformation, frame blending, body rescaling or new artificial poses are introduced.

Previously approved walks (Heatblast, Four Arms, Diamondhead, Wildmutt, Cannonbolt, Arctiguana, Humungousaur and Big Chill), Upgrade itself, flyers and skaters remain unchanged. Good registration and cadence within tolerance receive exact zero corrections. The native body drawings, clip order, floor/sole registration, basic attacks, powers and input movement stay intact.

`build.py` saves per-character measurements in `audit.json`, produces12 contact sheets and generates `web/walk128-data.js` from the actual restored assets. `verify.cjs` draws all92 aliens in both directions, checks idle stops and transitions back to powers, confirms all native clip indices remain identical and forbids rendering mutations to gameplay. It also verifies Upgrade, flight and skating exclusions.

The release workflow proves all combat, power, server, save and source-art files match the verified v12.7 baseline before running the new real-native movement checks, the earlier142-character locomotion check, all20 recent power repairs, manual facing, dash, captured-target, hover and testing-flow checks. The only existing renderer change selects the calibrated walking stride. The separate outer drawing hook applies the bounded horizontal walking registration offset.

This improves pacing and body stability using the existing native animation library. It does not replace every walk with newly drawn keyframes or claim exact television animation. Physical phone testing remains pending.

The root-registration preview reads pending travel without consuming the shared movement observer. This preserves older multiplayer snapshots that omit the moving flag; the native renderer remains the sole observer update. A regression check covers stale movement flags in both directions for every calibrated walker.

## Verified release

Published [android-c5c9aaab0eb0](https://github.com/Kuladeepadthale/Ben10-2D-Alien-Clash/releases/tag/android-c5c9aaab0eb0) from `c5c9aaab0eb02f670ad5b2a62cf99e3027f58c50`. Run40210495882/job121220490857 completed successfully. All92 aliens were checked;66 ground walkers were measured against the reference,58 received pacing or registration corrections, and34 were preserved or already within tolerance. The final check passed7,676 native draws, including stale network movement flags; the earlier142-character locomotion check and all20 v12.7 power repairs also passed. The signer is unchanged. Exact APK digests and download links are in [last-release.json](last-release.json). Physical phone testing remains pending.
