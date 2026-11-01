# Ripjaws — detailed animation revision 1

> Current user preference: keep the existing APK walking animation. The generated walking cutout module is disabled and walking delegates to the original released renderer. Native movement speed is preserved. All new non-walking animations stay active. Historical walking notes below describe superseded implementations.


## Audit

Ripjaws is alien id 8. Existing game kit: Crushing bite (single melee contact), Raking claws (three contacts), Predator leap (pounce), Deep-sea frenzy (five-hit rush). Reference is the existing `web/assets/classic/ripjaws/portrait.webp`: pale fish skin, green dorsal fins, gills/scales, small round eye, pointed ivory/yellow teeth, angler lure, black segmented abdominal suit, shoulder badge, clawed hands and webbed feet.

The old cel bank offered eight walk drawings, four jump/basic drawings and two/three drawings per power. The new bank contains 64 newly generated full-body drawings, plus a detailed upper-body cutout and six leg/foot textures for walking. Damage, cooldowns, movement speed, targeting, facing rules, ads/economy and other characters are unchanged. Wildmutt and Grey Matter's accepted files remain intact.

## Action review

| Action | New presentation |
| --- | --- |
| Walk | Independently articulated near/far legs, opposite half-cycle phases, fixed-length hip/knee/ankle segments; planted foot remains at a fixed world position while the body moves |
| Basic | Near and far claw rakes with shoulder preparation and recovery |
| Crushing bite | Neck coil, jaw opening, forward jaw snap, neck recoil and recovery |
| Raking claws | Three distinct horizontal, descending and low-upward swings with intervening preparation |
| Predator leap | Crouch, launch, airborne reach, descent, landing and compression; existing simulation supplies the actual vertical motion |
| Deep-sea frenzy | Near claw rake, bite, descending claw rake, double-claw thrust, final bite; preparation/recovery between contacts |
| Jump/defense/hit/defeat | Six jump poses; separate idle/guard/compressed-guard, recoil/recovery, seated slump and lying pose |

All full-body cels use one common 285-pixel standing model calibration, anchored by the standing reference pose. Crouches are not enlarged to fill the standing box. A first bite sheet was rejected after previewing because its head was larger; the replacement was generated with the original portrait and the basic-action sheet as model references. The upper skull remains small while the lower jaw opens. New drawings retain the existing character identity but are not extracted television frames.

The filled black abdominal suit anchors the full-body pelvis independently of arm reach. Bite contacts use mouth coordinates; extended claw contacts use the visible outer nail pixels. Those frame coordinates are recorded in `atlas.json`. Both origins mirror with captured facing; the character does not turn toward the enemy automatically.

Walking draws six limb textures plus exactly one upper body. It has no full-body ghost overlay. It uses actual distance, with a one-body-height stride, 60% support phase and raised swing arc. Thighs/shins keep their lengths; the feet swap front/back positions. The detailed fish fins, scales, lure, claws and palette are part of the generated texture artwork. Walking textures use the existing bounded display-size cache. Combat states draw one full-body cel.

## Art prompt set and assets

Built-in image generation used the existing portrait as the identity reference. Prompts require the exact pale/green fish anatomy, small round eye, yellow/ivory fang jaw, thin angler lure, green dorsal fin, gills/scales, black abdominal suit and shoulder badge; sharp cartoon ink/cel shading, full right-facing side/three-quarter figures, consistent model scale, transparent spacing, no text/scene/blur/extra limbs.

Prompt groups: (1) upper-body-only cutout including complete hands and lure, ending at the black hipline; (2) six isolated near/far thigh, finned shin and webbed-foot textures; (3) six basic claw poses, six jump poses and idle/guard/hit/KO; (4) eight bite poses and eight three-strike claw poses; (5) eight leap poses and eight defensive/reaction poses; (6) sixteen five-hit Unite poses. The bite group was refined once to match the smaller original skull and basic-action model. `export.py` records accepted source filenames, row layout, alpha extraction, atlas packing, model calibration and contacts.

Lossless extraction preserves generated drawing pixels and removes disconnected background noise. Four 2048-square full-body atlases use 512-pixel cells. The upper-body image and six-part walking atlas are separate. Runtime paths: `web/ripjaws-detailed-data.js`, `web/ripjaws-detailed.js`, `web/ripjaws-walk.js`, `web/assets/ripjaws-detailed/*.webp`.

## Validation and limits

* `test.cjs`: 64 frame bounds, shared scale, 2,880 state/facing samples, one body per combat draw, finite and mirrored origins, other-character/villain fallback.
* `smooth.cjs`: equal travel selects equal fallback poses at 30/60/120 Hz; pauses and knockback do not add steps; fixed floor row and bounded cache. Desktop timings are not Android benchmarks.
* `walk-legs.cjs`: identity-aware front/back leg exchange; planted world-foot positions at three speeds/frame rates in both directions; fixed segment lengths; independent swing; six limb textures plus one upper body; combat fallback.
* `contacts.cjs`: common model calibration, mouth/claw registration roles, five Unite contact roles, both facings and anticipation/contact/recovery.
* `browser.cjs`: existing released engine with Wildmutt, Grey Matter and Ripjaws scripts loaded together; every state in both directions. Restoring existing APK assets for review does not build an APK/AAB.

The 25-second video is enlarged renderer playback, not an APK screen recording. It previews the body and action sequences; game hit effects remain the existing engine effects. User visual approval and real Android device testing remain pending. No guarantee of exact television-frame fidelity or zero lag on every device. No APK/AAB built.
