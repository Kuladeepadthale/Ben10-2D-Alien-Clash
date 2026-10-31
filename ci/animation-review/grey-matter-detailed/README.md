# Grey Matter — detailed animation revision 1

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
