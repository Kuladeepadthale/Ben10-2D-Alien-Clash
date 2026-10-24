# v12.5 — requested mechanic, shell and reptile repairs

This request repairs Jury Rigg, Four Arms, Cannonbolt and Arctiguana. The original standing artwork, physical scale and standing registration are preserved for all four. No television footage or ability-card picture is used as the moving attack; new native cartoon poses and separate procedural effects drive combat.

| Character | Repair |
| --- | --- |
| [Jury Rigg](../characters/jury-rigg.json) | Connected glove-and-tool Gear Trap assembly, visible thrown gear deployment, delayed arming, short placement/recovery independent of the three-second trap lifetime, mechanical triggered fragments; held scrap-launcher build/fire/recovery and actual ballistic muzzle-launched arsenal rockets. |
| [Four Arms](../characters/four-arms.json) | Eight linked full-body gait cels with alternating foot contacts, shoulder articulation and coordinated four-arm swings; attacks retained. |
| [Cannonbolt](../characters/cannonbolt.json) | Eight uncurled walking cels; native curl, fully closed shell, downward Shell Slam contact, uncurl and recovery. Rebound Rush and Orbit Breaker rotate and bounce at the captured forward location, preserving manual facing and damage budgets. |
| [Arctiguana](../characters/arctiguana.json) | Low four-paw reptile crawl with tail balance, forepaw Glacial Slam anticipation/contact/recovery, mouth-braced Absolute Zero inhale/exhale/recovery, animated ice fronts and mouth-attached freezing gusts. |

Local validation passed:128 complete native frames with transparent margins and source-pixel preservation; all four original standing-image hashes, anchors and heights;960 rendered poses in both facings;10 full-browser battle scenes with zero page errors; new travel/arming, free movement after placement with retained trap lifetime, muzzle, frozen-target, shell budget, pose/emitter synchronization and pure-render checks. Existing checks also passed:2760 damaging casts at30/60fps,3408 origin registrations/432 ranged launches,1656 manual-facing trajectories,736 captured-target cases,136 native rush/pounce combinations, previous seven requested repairs and batch4 regressions.

The complete release suite and signed Android packages are verified in the release workflow before publication. Final build/download evidence is recorded in `ci/animation-review/last-release.json` after success.

Every character has a saved checkpoint record in `ci/animation-review/characters/<slug>.json`. Exact character inputs are `model-reference125.webp`; accepted built-in image_gen output sheets are `generated-*125.webp`; selected source cells, prompt set, original origins and reference heights are in the record. Final integrated source atlases and `revision.json` are alongside them; runtime atlases are in `web/assets/reviewed-native/<slug>/`. These are project assets rather than extracted television frames.

Overall review remains86 of92 approved;6 unrelated queued repairs remain. This request reopens and repairs four already-reviewed characters.

The updated authoritative engine is generated from the same combat code. Live multiplayer deployment still needs owner Cloudflare credentials; offline/training uses the new behavior immediately.

The native-detail guard accepts the longer axis for Arctiguana’s original low quadruped cels, preserving the existing286px-high, wide crouched basic attack without artificial enlargement. All other native detail, pixel, hash and margin checks remain active.
