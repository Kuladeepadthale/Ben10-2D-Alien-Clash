# Movement review — version 0.6

## Source limitation
The supplied art consists of one classic illustration per alien. No original cartoon animation sequences have been supplied or extracted. The motions below are newly authored gameplay animation using those same pixels. They cannot reproduce the show's frame-by-frame character acting, changing viewpoints, hidden limbs or mouth shapes. An authentic TV-animation asset pass still requires source animation sequences.

## Every fighting control
- Left/right: continuous gait, opposing arm swing and character-specific stride. Airborne movement preserves the jump pose.
- Jump: ascent, tuck, descent and a short landing compression. Stinkfly and Ghostfreak keep a hovering stance.
- Guard: blend into a stable defensive pose; blend out on release. Guard cannot interrupt an active cast.
- HIT: normal attack uses anticipation, extension at the actual hit time, hold and recovery. The three-hit chain changes the arm/body emphasis.
- P1/P2: pose selected from the actual equipped ability, not the button number. Swapping loadout therefore changes the corresponding button's movement correctly.
- ULT: uses the ultimate's own wind-up, active duration, ticks and recovery. No separate unsynchronized visual countdown.
- Incoming hit: blend to recoil; ordinary casts can be interrupted under the existing rules.
- KO: blend into a fallen pose. Pause freezes movement; resume continues the same cast.

## Character / ability coverage

| Alien | Locomotion / normal | All three selectable powers | Ultimate |
|---|---|---|---|
| Heatblast | Measured stride; alternating arm emphasis | Fireball: hand thrust; Flame jet: sustained beam brace; Eruption: raise and ground release | Inferno storm: raised arms through rain ticks |
| Four Arms | Heavy stride; extra opposing arm movement | Thunderclap: two-arm wave; Ground pound: raise and slam; Four-fist barrage: alternating pulse | Titan impact: lift, aerial slam and landing |
| Diamondhead | Restrained armored gait | Crystal volley: repeated launch; Crystal spikes: ground release; Crystal blade: melee extension | Crystal cascade: grounded repeated release |
| XLR8 | Fast low gait with short stride | Velocity strike: forward rush; Cyclone: rotating body pulse; Ricochet rush: sustained rush stance | Mach-speed barrage: rapid multi-hit rush stance |
| Wildmutt | Low quadruped stride; forward body strike | Predator pounce: coiled leap; Claw flurry: melee pulses; Savage lunge: low rush | Apex hunt: sustained low rush |
| Grey Matter | Short quick steps; compact strike | Shock gadget: hand launch; Proximity trap: crouch and place; Scrap grenade: throwing motion | Overclocked arsenal: raised gadget release |
| Upgrade | Soft stride with subtle body ripple | Optic beam: upright beam brace; Liquid-metal strike: limb extension; Tech pulse: body pulse | Overload beam: sustained beam stance |
| Stinkfly | Hover and continuous wing motion | Goo shot: directed launch; Acid volley: arcing throw; Stinger dive: diving rush | Swarm of slime: sustained aerial release |
| Ripjaws | Weighty gait; forward bite emphasis | Crushing bite: head/body lunge; Raking claws: pulsed melee; Predator leap: pounce | Deep-sea frenzy: multi-hit rush |
| Ghostfreak | Hover with a restrained lower-body ripple | Phantom lunge: phased rush; Tentacle lash: extension and ripple; Spectral pulse: two-arm release | Nightmare sweep: repeated spectral-wave stance |

## Rendering and timing changes
- Removed sixteen-pose quantization and expensive on-demand bitmap frame generation from combat.
- Continuous mesh vertices use a WebGL texture renderer where available. Canvas rendering is the fallback.
- Smooth transition channels for locomotion, casts, guard, recoil and KO; no ghosted frame crossfade.
- One reusable renderer and a bounded ten-texture collection; no animation bitmap cache churn.
- Combat simulation uses 1/120-second steps, independent of the presentation frame rate, with a 0.1-second catch-up limit.

## Validation
Automated tests cover all ten aliens, every control state, all 30 selectable powers and ten ultimates, attack envelopes, navigation, mode progression, saved settings, damage caps, collision travel and fixed simulation consistency at 30/60/120 render updates. Canvas output is visually inspected. Physical Android performance and WebGL output need device testing; a fixed simulation does not guarantee a particular display frame rate.

## Version 0.7: hierarchical skinning
The animation now runs through real parent-child joint matrices and inverse-bind skinning in `web/skeleton.js`. Neutral transforms reconstruct the source illustration exactly. Per-vertex distance weights blend the nearest bones; head, spine, waist, shoulder, elbow, wrist, hip, knee and ankle nodes animate independently. No joint markers are rendered. There are no separate cutout edges: the original texture stays on a single continuous mesh. Extra branches cover Four Arms' lower arms, XLR8's tail, Stinkfly's wings and Ghostfreak's spectral tail. Source Wildmutt faces left, so the fight renderer corrects its facing. GPU skin geometry uses 18×28 cells; the Canvas fallback uses 10×18 cells. Skinning cannot expose unseen drawing angles or recreate original TV motion from one illustration.

Additional checks validate neutral-bind identity, normalized skin weights, acyclic parent chains, finite animated vertices, all four Tetramand arm chains and the spectral tail.
