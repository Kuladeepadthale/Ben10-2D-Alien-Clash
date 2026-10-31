# Wildmutt detailed animation review — revision 4

The user's earlier detailed 16-cel walk remains unchanged. Revision 4 replaces generic eight-cel power playback with four dedicated sixteen-cel sequences:

* Predator pounce: crouch, launch, reach, forepaw landing, compression, recovery.
* Claw flurry: near rake, far descending rake, low sweep, with weight shifts.
* Savage lunge: low shoulder launch, jaw opening/snap, second bound, braking paws.
* Apex Hunt: near rake, bite, far hammer claw, double-paw thrust, final slam.

All art was newly generated using the built-in image-generation tool with the existing Wildmutt portrait as the exact character reference. Prompts specify original cartoon ink and cel shading; a right-facing quadruped with no eyes or tail, consistent proportions, shoulder brace, full-body isolated poses and transparent backgrounds. These are new game drawings, not footage extracted from the series. The four prompts specify every chronological pose; the semantic sequences above document those directions.

Each sheet uses its neutral pose to establish a single physical scale. Crouches and airborne stretches are not individually resized to a bounding box. Alpha extraction removes disconnected noise and retains original drawing pixels; lossless WebP atlases use 512 px cells. Existing walk/basic/reaction atlases keep 384 px cells. `atlas.json` records exact crop, pivot, scale and sheet dimensions. `export-powers.py` records source filenames and extraction.

128 atlas entries are retained, with 96 distinct drawings used by the current clips (including the earlier jump/guard/normal/reaction artwork). Original power entries remain for old jump references and provenance. No damage, timing, hit-count, movement, ads or other-alien changes.

Run `node ci/animation-review/wildmutt-detailed/test.cjs`, `smooth.cjs`, `choreography.cjs` and, with the existing release assets restored to review-web, `browser.cjs`. CI restores the latest existing APK assets solely to run browser integration; it does not build an APK/AAB. Desktop render timing is not an Android performance claim. Visual approval remains pending.

## Revision 5: distance-matched walking

Walking alone now uses eight newly generated key drawings plus eight companion in-betweens. Both prompts preserve the original portrait design and specify a complete right-facing quadruped stride, alternating load/push-off/swing/contact, fixed model scale and transparent gutters. Each of the two sheets has a constant neutral-height calibration (328 and 330 native pixels), with no per-pose rescaling. Existing power cels, timings and clips are unchanged.

The full gait covers `renderHeight * scale * 1.2` world pixels and contains two forepaw steps. For the current Wildmutt model (142 * .95) this is 161.88 pixels per stride, or 80.94 per step. At 325 pixels/second that is 0.249 seconds per step. Pose selection uses accumulated actual travel, not an independent clock. Faster travel advances poses faster; slower travel holds each position longer. Held direction without displacement selects idle. A new full stride reuses the cycle; the limbs do not perform extra loops while covering the same step distance.

`stride.cjs` checks travel at 80, 180 and 325 pixels/second, both facings, at 30/60/120 Hz; idle input cannot advance gait. Other renderer, cache and choreography checks also pass locally. The new preview shows three speeds at an enlarged model scale and is a renderer preview, not a phone recording. Art remains generated cartoon artwork and needs user visual approval; the tests do not certify biomechanical or exact TV-frame fidelity.

Runtime files: `web/wildmutt-detailed.js`, `web/wildmutt-detailed-data.js`, and `web/assets/wildmutt-detailed/walk-{keys,between}-v5.webp`. `export-walk.py` retains exact extracted pixels and records source filenames. No APK/AAB produced.
