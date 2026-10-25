# Eight-character requested power repair — v12.7

Scope: 20 powers across eight aliens. These are new fan-game animations and effects, not extracted television footage or a claim of an exact canonical move catalogue.

| Alien | Requested powers | Change |
|---|---|---|
| Echo Echo | Echo barrage, Resonance pulse | Mouth-launched compact sonic fronts; expanding circular resonance pulses replace the generic tornado. |
| Brainstorm | Static field | Branching cerebral arcs and a circular electrical perimeter replace the generic tornado. |
| Goop | Elastic strike, Liquid rush, Acid deluge | Cast reach increased to 390 only for Elastic Strike; connected elastic limb and narrow captured-point collision; own native liquid-rush poses, droplets and a connected liquid ultimate wave. |
| Nanomech | Micro blitz | Own native rush cels, short electric flight wake and pulse. |
| Fasttrack | Cyclone kick, Citrakayah blitz | Native leg retraction/extension follows each kick tick; own ultimate cels and six strike/retraction beats replace generic punch fallback. |
| Crashhopper | Spring pounce, Headlong rush, Landing shock, Meteor hopper | Own native attack poses, ascent/dive/landing selection, short headlong wakes and ground impact accents. Four newly generated native guard poses replace the lower-resolution guard. |
| Bullfrag | Tongue snare, Amphibian rush, Incursean combination | Attached extending/retracting tongue with narrow captured-point collision; own native rush and combination cels. |
| Surge | Linked charge, Cross slice, Xerge formation, Swarm convergence | Linked native Xerge copies, readable formation, timed crossing slash and own native ultimate cels. |

Preserved: normal attacks, unrelated animation, manual facing, dash direction, captured enemy position, progression, unlocks and original standing artwork. Effects never award damage; the shared combat engine owns attached-strike collision and the existing per-cast damage budget. Rendering does not mutate the fighter's gameplay state.

Guard asset: `web/assets/cels/crashhopper/guard127.webp`. Generated using the built-in image tool, referenced to `ci/cel-sources/crashhopper-master.webp`; four guard/braced/recoil/recovery poses in a horizontal transparent sheet. Existing native source remains intact. Cropped and packed without generating additional poses or rescaling original pixels. Source prompt and checksum are saved alongside this report.

Verification: JavaScript syntax and server generation checked locally. The release workflow runs all existing checks plus `ci/powers127/verify.cjs` against the restored real native assets before publication. The focused check covers all 20 powers, both directions, native pose changes, immutable target snapshots, render purity, attached-strike collisions and four guard frames. Physical phone verification and live Worker deployment are separate, pending owner environment access.
