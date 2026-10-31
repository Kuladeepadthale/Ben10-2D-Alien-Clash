# Articulated alien animation pass

User-requested sequence: one named alien at a time. Commit each completed revision.
Do not build or publish APK/AAB releases until the user asks after the alien pass.

| Alien | Renderer | Coverage | Validation | Review status |
| --- | --- | --- | --- | --- |
| Wildmutt (4) | `web/wildmutt-rig.js` — continuous vector skeleton, not sprite-pose replacement | Idle/breath, distance-driven four-paw trot/run, jump/tuck/landing reach, dash, guard, recoil, defeat, three basic variants, Predator pounce, three-strike Claw flurry, Savage lunge, five-beat Apex hunt | 2,160 sampled poses; invariant two-bone lengths; world-planted stance; transition continuity; mirrored paw/jaw emitter; no sprite calls; isolation from other aliens/villains. CI also exercises 24 real-engine state/facing combinations. | Implemented and locally reviewed; CI run attached to commit. Phone/player visual review pending. |

## Wildmutt design and scale

- Reference: existing `web/assets/classic/wildmutt/portrait.webp`.
- Keep an eyeless orange quadruped, large head/jaw, neck gills, big clawed forepaws, small hind paws, short back tufts and left-shoulder Omnitrix brace. No added eyes, ears or tail.
- One fixed 170-unit skeleton reference multiplied by the existing alien `renderHeight * scale`. Never fit a different source-image box per action.
- Feet alternate in diagonal pairs. The stance moves opposite actual world displacement, including the character's scale; stationary and paused actors do not march in place.
- Continuous jaw, spine, shoulder, elbow, wrist, hip, knee and paw transforms. Blend action changes over 90ms without changing limb lengths.
- Attacks use the existing simulation's facing, wind-up, active duration, tick count and recovery. Each flurry beat reaches forward at the corresponding hit time, then recoils.
- Presentation only: damage, cooldowns, targeting, inventory, rewards and ads are unchanged. Custom imported atlases retain the existing explicit renderer precedence.
- Menu collection images remain existing artwork; the arena's neutral and action states share the new rig. This is newly drawn procedural animation, not footage or animation extracted from the cartoon.

## Resume

Next requested alien: awaiting user name. Do not mark any other alien complete.
Run `node ci/animation-review/rig-tests/wildmutt.cjs` with `@napi-rs/canvas` installed.
The review workflow validates the existing battle engine without building an Android package.
For the eventual release, copy every new rig script and the updated index into the packaged web root; do not restore an older index from an APK.
