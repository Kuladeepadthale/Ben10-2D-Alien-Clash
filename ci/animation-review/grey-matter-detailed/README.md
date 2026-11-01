# Grey Matter — detailed animation revision 1

> Current user preference: keep the existing APK walking animation. The generated walking cutout module is disabled and walking delegates to the original released renderer. Native movement speed is preserved. All new non-walking animations stay active. Historical walking notes below describe superseded implementations.


## Audit and scope

Grey Matter is alien id 5 (not Upgrade/id 6). Existing kit: Shock gadget, Proximity trap, Scrap grenade, Overclocked arsenal. These are game-specific gadget abilities, not claims that the cartoon character has innate energy powers. Existing damage, cooldowns, movement speed, attack direction, targeting, ads and economy remain unchanged. Wildmutt's accepted scripts and assets are untouched.

Before this pass the character used eight walking cels, four basic/jump poses and two/three poses for each power. Pose sources and attack origins were calibrated against those older drawings. This pass uses 80 newly generated drawings, including a sixteen-cel stride, short alternating palm strikes, six jump/landing poses, defensive and hit reactions, a two-stage defeated pose, and dedicated gadget sequences.

## Action review

| Action | Drawing sequence |
| --- | --- |
| Walk/dash | Sixteen foot-contact, load, push-off and swing poses; actual ground displacement advances the sequence; no timed stepping while blocked |
| Basic | Near-hand palm jab and far-hand palm strike, with knee preparation and retraction |
| Jump | Crouch, toe push-off, tucked rise, unfolding descent, feet-forward landing, compressed landing |
| Shock gadget | Draw device, raise, two-handed aim, trigger, recoil, lower and recover |
| Proximity trap | Crouch/kneel, place once, press remote, rise, settle; deployment does not loop during the trap's existing active duration |
| Scrap grenade | Lift, arm, shoulder wind-up, overhand release and follow-through |
| Unite | Open controller, six separate finger/thumb command beats, then close/lower it |
| Guard/hit/defeat | Separate guard compression, recoil/recovery, seated slump, then lying pose |

The body render draws one cel, without fading two bodies together. Character scale is constant per source sheet, set from a neutral standing pose. Crouches and KO poses are not scaled to standing height. The walking pivot follows the head model landmark; body size remains `renderHeight * scale` from the existing character configuration. Device emitter coordinates are recorded per frame, with the firing muzzle, palms and throw release hand manually reviewed. Captured facing controls the origin mirror, without enemy auto-turning.

## Art and prompts

Built-in image generation used `web/assets/classic/grey-matter/portrait.webp` as the identity reference. All prompts require Grey Matter's slim grey Galvan body, huge frog-like head, bulging yellow-green eyes with horizontal black pupils, black crown stripe, white short-sleeve suit with black center stripe/cuffs/shins, long grey fingers and flat feet; sharp cartoon ink/cel shading, constant model scale, right-facing side view, no blur or extra limbs, and isolated transparent figures. These are new game drawings rather than extracted cartoon footage.

Prompt set: (1) sixteen chronological biped walk cels across contact/load/push-off/swing; (2) six palm-strike poses, six jump poses, idle/guard/hit/KO; (3) eight shock-gadget aiming/recoil cels and eight crouch/place/remote trap cels; (4) eight overhand grenade poses and eight idle/guard/hit/defeat poses; (5) sixteen controller poses with six command beats. A background-cleanup generation was used for the walk. An overlapping grenade sheet was rejected and replaced with four isolated figures per row. Exact source filenames and neutral-frame selections are recorded in `export.py`.

Lossless atlas extraction retains source pixels and removes disconnected background noise; no creative redraw or vector substitute is used during export. Cropped figures fit into 512-pixel cells, with sheet dimensions and per-frame origins in `atlas.json`.

## Validation and limits

`test.cjs`: 80 frame bounds, uniform sheet calibration, 2,880 state/facing samples, exactly one body, finite and mirrored emitters, other-character/villain fallback.

`smooth.cjs`: equal-distance gait at 30/60/120 Hz, pause/repeated-query/knockback safeguards, fixed floor pixel row, bounded tile cache and no allocations during warm gait playback. Desktop timings are not Android performance results.

`browser.cjs`: loads the existing released engine with both the accepted Wildmutt scripts and new Grey Matter scripts; checks all actions in both directions. CI restores existing APK assets for review only, without building APK/AAB.

User visual approval and Android device testing remain pending. Preview is enlarged renderer playback, not an APK recording. No claim of exact television-frame fidelity or zero lag on every phone.

Runtime paths: `web/grey-matter-detailed.js`, `web/grey-matter-detailed-data.js`, `web/assets/grey-matter-detailed/*.webp`.

## Revision 2 — alternating articulated walking legs

The user correctly reported that the first walking sheet kept the same leg in front. Merely selecting those frames by distance did not fix the pose anatomy. Walking now uses two independently articulated legs and newly generated detailed cartoon cutouts. The existing eighty combat/state/gadget drawings, damage, cooldowns and attack code are unchanged.

The walking upper body is one generated Grey Matter cutout, retaining the original portrait design. Six separately generated leg textures form near/far white thighs, black shins and grey feet. Near/far shading is slightly different. A two-bone calculation keeps each thigh and shin at a constant length while the feet alternate ground contact and swing. The legs are half a cycle apart; each takes its turn in front. During stance, relative foot travel cancels character travel, keeping the planted foot at one world position. Swing follows a raised arc and passes the supporting leg. The cycle uses actual travelled distance, not a timer. No new full character copies are overlaid: walking draws six limb textures and exactly one upper body. Other states keep the approved single-cel body.

The stride spans .85 rendered body heights; support lasts 60% of each leg's cycle. The body has a small .8%-height weight bob, without changing scale. Textures use the existing bounded tile cache at display resolution. Existing Wildmutt and Grey Matter ability origins are not changed.

`walk-legs.cjs` verifies near/far identity exchanges, planted world-foot positions across three speeds, three frame rates and both directions; constant segment lengths; both swing phases; one upper body; and fallback to the original attack cels. Browser review explicitly advances the actor for walking and exercises the rig alongside the accepted Wildmutt scripts. Device performance and user visual approval remain pending.

Art prompt set: an exact-model upper-body Grey Matter cutout (head, torso, intact hands, no legs); a two-column/three-row set of isolated near/far white thigh textures, black shin textures and grey right-facing feet. Both specify the original portrait's eyes, suit colors, sharp cartoon ink/cel shading, transparent background, no scene, labels or blur. An eight-pose walking generation was examined but not integrated because it still did not reliably preserve alternating leg identity. `export-walk-parts.py` records the two accepted source filenames, alpha extraction, atlas packing and hip marker. Generated artwork is new game art, not extracted TV footage.

New runtime: `web/grey-matter-walk.js`, `web/assets/grey-matter-detailed/walk-upper.webp`, `walk-legs.webp`. The new walking script loads after the existing detailed character script. Preview shows slow movement, game-speed movement, left-facing movement and stop; it is renderer playback, not an APK capture. No APK/AAB built.
