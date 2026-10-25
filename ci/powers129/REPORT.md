# Requested species powers — v12.9

22 powers across XLR8, Upgrade, Blitzwolfer, Ditto, Chamalien, Pesky Dust, Mole-Stache and Rush. These are newly made game animations and species effects; exact television footage is not claimed.

XLR8 uses native wheel/cyclone/ricochet and ultimate poses with compact speed arcs. Upgrade Tech Pulse uses green circuit fronts. Blitzwolfer's howl and ultimate use mouth-launched sonic fronts. Ditto uses solid animated native clone actors for all four powers instead of transparent ghost stamps. Chamalien uses native cloaked ambush poses and an attached longer tail strike, with reach390 shown in the ability card and shared simulation. Pesky Dust uses moving dust motes and dream spirals. Mole-Stache uses native moustache contact poses, connected whisker extensions, uppercut curls and propeller/cyclone motion. Rush's mismatched red-stripe combat design is replaced with a newly generated native set matching the existing olive/charcoal walking body and wheel design; all new combat frames share one standing-based registration scale.

All selected rushes retain their own native attack clips. Selected multi-hit ultimates stop at the captured contact location and complete their combo there. Manual facing, dash direction, captured targets, damage budgets, progression, approved v12.8 walking and unrelated powers remain intact. The native render, both facings, narrow tail collision, cloak, scale registration and full release suites gate publication. Physical phone testing and live Worker deployment remain pending.

## Reviewed power coverage

| Alien | Powers |
| --- | --- |
| XLR8 | Cyclone, Ricochet Rush, Mach-speed Barrage ultimate |
| Upgrade | Tech Pulse |
| Blitzwolfer | Sonic Howl, Moonlit Howl ultimate |
| Ditto | Double Trouble, Clone Flurry, Tag-team Rush, Multiplicity ultimate |
| Chamalien | Tail Sweep (reach390), Invisible Ambush ultimate |
| Pesky Dust | Dream Spiral, Dreamscape ultimate |
| Mole-Stache | Moustache Lash, Whisker Uppercut, Propeller Hop, Moustache Cyclone ultimate |
| Rush | Velocity Tackle, Wheel Cyclone, High-speed Kick, Maximum Velocity ultimate |

## Native timeline review

Six contact sheets show real casts stepped at120Hz: all22 powers facing right and eight representative casts facing left. The reviewed colour revision is recorded on branch `powers-review-129`, commit `a076cf1347c51651234958e8fe29fb1375deb502`. Every row samples anticipation, execution and recovery; contact images are QA artifacts, not attack sprites. Chamalien's extension was corrected from grey/green to purple to match its native tail.

The first full run found transparent-gutter and opaque-emitter defects in the new Rush assets. The corrected sheets add blank padding without resampling their body pixels, and every marker is snapped to an opaque native body pixel. Rush's retained original movement is246px reference height; new combat uses224px standing reference height. The reviewed asset check explicitly validates preserved original16 frames/two sheets and native combat detail instead of inflating this small source to satisfy a300px frame-height rule. All other characters retain that detail rule.

Physical Android device performance and live multiplayer Worker deployment require separate validation. No claim of exact original television footage or identical hand-drawn frame counts is made.

The restored-build review additionally caught stale `revision.json` emitter phases overriding the corrected JavaScript registry and missing local crop records. Canonical revision metadata now stores the final opaque emitter pixels and offsets, so restoration recreates the same runtime registry. The final build uses an exact-diff guard against the74-passed/3-failed regression run, reruns all three failed native asset checks and the affected cast/expansion/body/origin checks, and allows only those metadata records plus the three Chamalien palette literals to differ. Source art, simulation, server, saves and animation timing are identical to that regression baseline.

## Published verification

Release `android-a27a4e543b47`, version12.9/code129, source `a27a4e543b47f0e0d42967d752c05894cf275d4e`: run40223006978/job121258448079 completed successfully. All three corrected asset checks passed, including1248 reviewed frames,2952 whole-body frames and1440 opaque emitter pixels. Final requested-power validation passed44 casts/264 draws; expansion rendering passed2880 draws; Rush passed240 draws; general cel checks passed15456 draws. Native origins passed3408 registrations and432 actual ranged launches. The original Rush portrait303x246 is retained and verified by exact SHA256, while all other portrait detail rules remain intact. Both APKs passed packaged-asset and signature checks; their uploaded sizes and SHA256 digests are recorded in `last-release.json`. Physical phone validation and live Worker deployment remain pending.
