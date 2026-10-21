# Power registration review — v10.4

Reviewed every existing ability icon and active native pose across 72 aliens and 30 battle villains. The runtime table in `web/power-profiles.js` records all 1,035 windup/active/recovery landmarks. Normal attacks retain their previous animation.

The colour column follows the visible ability artwork; Jetray and Astrodactyl green-power icons are corrected with the same hue adjustment used for their one-shot artwork. Native close combat has no additional attack illustration; tail strikes retain distinct native poses and follow-through. A single thrown attack may draw its exact icon once. Continuous beams and repeated volleys use procedural effects.

| Fighter | Ability | Source | Colour | Native pose registrations |
| --- | --- | --- | --- | --- |
| Heatblast | Fireball | hands | #fc5219 | 4 |
| Heatblast | Flame jet | hands | #fc5219 | 4 |
| Heatblast | Eruption | ground | #cc2414 | 3 |
| Heatblast | Inferno storm | hands | #db4716 | 3 |
| Four Arms | Thunderclap | hands | #e64839 | 3 |
| Four Arms | Ground pound | feet | #cc3d30 | 3 |
| Four Arms | Four-fist barrage | hands | #cc1726 | 2 |
| Four Arms | Titan impact | feet | #cc623e | 3 |
| Diamondhead | Crystal volley | hands | #18cc9f | 3 |
| Diamondhead | Crystal spikes | ground | #14cc9e | 3 |
| Diamondhead | Crystal blade | blade | #14cc9e | 2 |
| Diamondhead | Crystal cascade | ground | #1acc9f | 3 |
| XLR8 | Velocity strike | body | #1480cc | 3 |
| XLR8 | Cyclone | body | #2db4e2 | 3 |
| XLR8 | Ricochet rush | body | #1680cc | 2 |
| XLR8 | Mach-speed barrage | body | #35bae6 | 3 |
| Wildmutt | Predator pounce | jaw | #cc6114 | 3 |
| Wildmutt | Claw flurry | claws | #d26415 | 3 |
| Wildmutt | Savage lunge | jaw | #cf6215 | 2 |
| Wildmutt | Apex hunt | body | #cc6114 | 3 |
| Grey Matter | Shock gadget | weapon | #6fde1f | 3 |
| Grey Matter | Proximity trap | ground | #84e73d | 3 |
| Grey Matter | Scrap grenade | weapon | #a6cc33 | 2 |
| Grey Matter | Overclocked arsenal | weapon | #a2cc24 | 3 |
| Upgrade | Optic beam | eye | #24cc14 | 3 |
| Upgrade | Liquid-metal strike | hands | #80cc14 | 3 |
| Upgrade | Tech pulse | hands | #74e027 | 2 |
| Upgrade | Overload beam | eye | #4acd1e | 3 |
| Stinkfly | Goo shot | eyes | #9ecc14 | 3 |
| Stinkfly | Acid volley | eyes | #9ecc14 | 3 |
| Stinkfly | Stinger dive | tail | #a7cc36 | 2 |
| Stinkfly | Swarm of slime | eyes | #9ecc14 | 3 |
| Ripjaws | Crushing bite | jaw | #29becc | 3 |
| Ripjaws | Raking claws | claws | #22becc | 3 |
| Ripjaws | Predator leap | body | #22becc | 2 |
| Ripjaws | Deep-sea frenzy | body | #1ebecc | 3 |
| Ghostfreak | Phantom lunge | body | #cc3aa8 | 3 |
| Ghostfreak | Tentacle lash | tentacles | #cc8e61 | 3 |
| Ghostfreak | Spectral pulse | hands | #cc4f98 | 2 |
| Ghostfreak | Nightmare sweep | hands | #cc48ab | 3 |
| Cannonbolt | Rolling strike | body | #e3b11b | 3 |
| Cannonbolt | Shell slam | feet | #e9b822 | 3 |
| Cannonbolt | Rebound rush | body | #e9b723 | 2 |
| Cannonbolt | Orbit breaker | body | #e7b724 | 3 |
| Wildvine | Vine lash | vines | #61cc14 | 3 |
| Wildvine | Seed bomb | hands | #afde21 | 3 |
| Wildvine | Root eruption | ground | #80cc14 | 2 |
| Wildvine | Overgrowth | ground | #80cc14 | 3 |
| Blitzwolfer | Sonic howl | mouth | #77b7cc | 3 |
| Blitzwolfer | Claw flurry | claws | #76a8cc | 3 |
| Blitzwolfer | Predator pounce | body | #cca875 | 2 |
| Blitzwolfer | Moonlit howl | mouth | #dff5ef | 3 |
| Snare-oh | Bandage lash | bandages | #cc9d5c | 3 |
| Snare-oh | Binding wrap | bandages | #cc9b56 | 3 |
| Snare-oh | Sand rush | body | #cc9c58 | 2 |
| Snare-oh | Royal bind | bandages | #cc974c | 3 |
| Frankenstrike | Lightning discharge | hands | #43a7ee | 3 |
| Frankenstrike | Charged fist | hands | #4292cc | 3 |
| Frankenstrike | Shockwave | feet | #3976cc | 2 |
| Frankenstrike | Thunderstorm | hands | #3d79cc | 3 |
| Upchuck | Plasma spit | mouth | #80cc14 | 3 |
| Upchuck | Explosive burp | mouth | #80cc14 | 3 |
| Upchuck | Tongue lash | tongue | #a0cc1a | 2 |
| Upchuck | Digestive barrage | mouth | #80cc14 | 3 |
| Ditto | Double trouble | body | #65ccb2 | 3 |
| Ditto | Clone flurry | hands | #6cccb4 | 3 |
| Ditto | Tag-team rush | body | #6ecfa7 | 2 |
| Ditto | Multiplicity | body | #64ccb2 | 3 |
| Eye Guy | Optic shot | body-eyes | #8ad620 | 3 |
| Eye Guy | Chest beam | chest | #61cc14 | 3 |
| Eye Guy | Omni pulse | chest | #93d930 | 2 |
| Eye Guy | All-seeing beam | chest | #8fe21b | 3 |
| Way Big | Cosmic ray | wrists | #e91729 | 3 |
| Way Big | Titan stomp | feet | #cc3021 | 3 |
| Way Big | Meteor strike | hands | #cc3022 | 2 |
| Way Big | Cosmic judgement | wrists | #e12434 | 3 |
| Arctiguana | Frost breath | mouth | #62b9f7 | 3 |
| Arctiguana | Ice shard | mouth | #3ea8f3 | 3 |
| Arctiguana | Glacial slam | feet | #2c90d7 | 2 |
| Arctiguana | Absolute zero | mouth | #50abeb | 3 |
| Spitter | Pressure spit | mouth | #9ecc14 | 3 |
| Spitter | Inflation blast | mouth | #a5cc32 | 3 |
| Spitter | Tail sweep | tail | #becc1f | 2 |
| Spitter | Pressure deluge | mouth | #9ecc14 | 3 |
| Buzzshock | Spark bolt | hands | #a3d119 | 3 |
| Buzzshock | Battery discharge | hands | #9ecc14 | 3 |
| Buzzshock | Live-wire rush | body | #9ecc15 | 2 |
| Buzzshock | Voltage overload | body | #9fcc18 | 3 |
| Swampfire | Fire seed | hands | #eb6f17 | 3 |
| Swampfire | Vine lash | vines | #cc9f17 | 3 |
| Swampfire | Root eruption | ground | #cc6d2a | 2 |
| Swampfire | Wildfire bloom | hands | #d56515 | 3 |
| Echo Echo | Sonic shout | mouth | #dff5ef | 3 |
| Echo Echo | Echo barrage | mouth | #b6cc76 | 3 |
| Echo Echo | Resonance pulse | body | #79ccc5 | 2 |
| Echo Echo | Sonic overload | mouth | #72ccc5 | 3 |
| Humungousaur | Seismic stomp | feet | #cc641a | 3 |
| Humungousaur | Titan fist | hands | #cc6e2a | 3 |
| Humungousaur | Dinosaur charge | body | #cc6e2b | 2 |
| Humungousaur | Colossal impact | feet | #cc671f | 3 |
| Jetray | Neuroshock ray | eyes | #91ff45 | 3 |
| Jetray | Aerial blitz | body | #cc2819 | 3 |
| Jetray | Tail bolt | tail | #91ff45 | 2 |
| Jetray | Hyperspeed barrage | eyes | #91ff45 | 3 |
| Big Chill | Freezing breath | mouth | #48a4e6 | 3 |
| Big Chill | Phasing lunge | body | #328ccc | 3 |
| Big Chill | Ice wave | mouth | #1480cc | 2 |
| Big Chill | Deep freeze | mouth | #1a88d6 | 3 |
| Chromastone | Prismatic beam | hands | #8117cc | 3 |
| Chromastone | Crystal strike | hands | #7f14cc | 3 |
| Chromastone | Radiant wave | hands | #a11fcc | 2 |
| Chromastone | Spectrum overload | hands | #7f14cc | 3 |
| Brainstorm | Neural bolt | brain | #f9a837 | 3 |
| Brainstorm | Cerebral discharge | brain | #f9ad41 | 3 |
| Brainstorm | Static field | body | #e17426 | 2 |
| Brainstorm | Brainstorm surge | brain | #dd7e3b | 3 |
| Spidermonkey | Web shot | tail | #7eadef | 3 |
| Spidermonkey | Four-arm flurry | hands | #357de2 | 3 |
| Spidermonkey | Acrobatic pounce | body | #3c7dd9 | 2 |
| Spidermonkey | Webstorm rush | body | #5875cc | 3 |
| Goop | Acid glob | hands | #80cc14 | 3 |
| Goop | Elastic strike | hands | #80cc14 | 3 |
| Goop | Liquid rush | body | #80cc14 | 2 |
| Goop | Acid deluge | hands | #a5d517 | 3 |
| Alien X | Cosmic orb | hands | #3d60cc | 3 |
| Alien X | Gravity pulse | body | #5371cc | 3 |
| Alien X | Starstep | body | #5963cc | 2 |
| Alien X | Celestial judgement | hands | #516fcc | 3 |
| Rath | Claw flurry | claws | #ed4d18 | 3 |
| Rath | Tiger pounce | body | #df6a16 | 3 |
| Rath | Rage slam | feet | #cc8420 | 2 |
| Rath | Appoplexian fury | body | #ea6f17 | 3 |
| Lodestar | Magnetic pulse | hands | #e6b92f | 3 |
| Lodestar | Metal storm | hands | #d0aa3a | 3 |
| Lodestar | Polarity field | body | #cca42b | 2 |
| Lodestar | Magnetic maelstrom | hands | #cca222 | 3 |
| Nanomech | Nano laser | hands | #2ad41a | 3 |
| Nanomech | Micro blitz | body | #24cc14 | 3 |
| Nanomech | Nano discharge | hands | #38e328 | 2 |
| Nanomech | Nano overload | hands | #24cf15 | 3 |
| Water Hazard | Palm water jet | palms | #1791e8 | 3 |
| Water Hazard | Pressure burst | palms | #1792ea | 3 |
| Water Hazard | Rising tide | feet | #1585d5 | 2 |
| Water Hazard | Ocean deluge | palms | #178fe5 | 3 |
| AmpFibian | Tentacle bolt | tentacles | #199af7 | 3 |
| AmpFibian | Phasing current | body | #1896ef | 3 |
| AmpFibian | Current field | body | #1896f0 | 2 |
| AmpFibian | Amperi thunderstorm | tentacles | #1964cc | 3 |
| Armodrillo | Piston drill | hands | #cca121 | 3 |
| Armodrillo | Seismic punch | feet | #cc9549 | 3 |
| Armodrillo | Drill charge | body | #cca530 | 2 |
| Armodrillo | Tectonic breaker | feet | #cc913e | 3 |
| Terraspin | Vent blast | vents | #9bcc57 | 3 |
| Terraspin | Shell cyclone | body | #c1cc46 | 3 |
| Terraspin | Shell slam | feet | #cc974e | 2 |
| Terraspin | Cyclonic tempest | body | #cc8450 | 3 |
| NRG | Vent heat ray | vents | #42cc14 | 3 |
| NRG | Molten stomp | feet | #cc4214 | 3 |
| NRG | Radiation wave | palms | #61cc14 | 2 |
| NRG | Reactor flare | vents | #cc2414 | 3 |
| Fasttrack | Velocity rush | body | #1461cc | 3 |
| Fasttrack | Claw combo | claws | #1461cc | 3 |
| Fasttrack | Cyclone kick | feet | #1461cc | 2 |
| Fasttrack | Citrakayah blitz | body | #1793eb | 3 |
| Chamalien | Cloaked lunge | body | #a96ff9 | 3 |
| Chamalien | Claw swipe | claws | #6917db | 3 |
| Chamalien | Tail sweep | tail | #831dcc | 2 |
| Chamalien | Invisible ambush | body | #6115cc | 3 |
| Eatle | Mouth blast | mouth | #24cc14 | 3 |
| Eatle | Beetle charge | body | #86cc23 | 3 |
| Eatle | Horn uppercut | horn | #83cc1d | 2 |
| Eatle | Matter converter | mouth | #24d015 | 3 |
| Clockwork | Temporal ray | chest | #48de16 | 3 |
| Clockwork | Time field | body | #24cc14 | 3 |
| Clockwork | Clockwork stomp | feet | #cc8119 | 2 |
| Clockwork | Temporal surge | chest | #1ecc2c | 3 |
| Jury Rigg | Scrap launcher | weapon | #db8916 | 3 |
| Jury Rigg | Junk bomb | weapon | #db8916 | 3 |
| Jury Rigg | Gear trap | ground | #cc8420 | 2 |
| Jury Rigg | Junkyard arsenal | weapon | #d28415 | 3 |
| Shocksquatch | Charged fist | hands | #ead91e | 3 |
| Shocksquatch | Lightning arc | hands | #fae81c | 3 |
| Shocksquatch | Electric stomp | feet | #f6e41d | 2 |
| Shocksquatch | Thunderous fury | hands | #f4e21d | 3 |
| Feedback | Finger bolt | fingers | #f5e421 | 3 |
| Feedback | Plug discharge | plugs | #f4e327 | 3 |
| Feedback | Current rush | body | #d6c826 | 2 |
| Feedback | Conductoid overload | fingers | #f2e124 | 3 |
| Bloxx | Block hammer | hands | #1461cc | 3 |
| Bloxx | Brick volley | hands | #1461cc | 3 |
| Bloxx | Construction slam | feet | #cc1424 | 2 |
| Bloxx | Megablock impact | feet | #cc1424 | 3 |
| Gravattack | Gravity orb | core | #cc4214 | 3 |
| Gravattack | Orbital field | body | #d3681c | 3 |
| Gravattack | Planetfall | feet | #cc532b | 2 |
| Gravattack | Gravity singularity | body | #cc4214 | 3 |
| Crashhopper | Spring pounce | legs | #abd03e | 3 |
| Crashhopper | Headlong rush | head | #81cc18 | 3 |
| Crashhopper | Landing shock | feet | #85cc22 | 2 |
| Crashhopper | Meteor hopper | feet | #83cc1c | 3 |
| Ball Weevil | Plasma ball | mouth | #61cc14 | 3 |
| Ball Weevil | Sticky lob | hands | #61cc14 | 3 |
| Ball Weevil | Plasma trap | ground | #61cc14 | 2 |
| Ball Weevil | Giant plasma burst | mouth | #61cc14 | 3 |
| Astrodactyl | Energy whip | wrists | #91ff45 | 3 |
| Astrodactyl | Jet blitz | body | #f89b19 | 3 |
| Astrodactyl | Star bolt | hands | #91ff45 | 2 |
| Astrodactyl | Stellar overdrive | mouth | #91ff45 | 3 |
| Toepick | Terrifying gaze | face | #8117cc | 3 |
| Toepick | Dread aura | body | #8117cc | 3 |
| Toepick | Heavy grasp | hands | #8520cc | 2 |
| Toepick | Nightmare exposure | face | #a224cc | 3 |
| Pesky Dust | Sleep dust | hands | #f862eb | 3 |
| Pesky Dust | Dream spiral | body | #9430dc | 3 |
| Pesky Dust | Fairy flutter | body | #ec6bf8 | 2 |
| Pesky Dust | Dreamscape | hands | #a941f3 | 3 |
| Bullfrag | Tongue snare | tongue | #df4485 | 3 |
| Bullfrag | Frog spring | legs | #9fcc18 | 3 |
| Bullfrag | Amphibian rush | body | #80cc16 | 2 |
| Bullfrag | Incursean combination | body | #80cc14 | 3 |
| Kickin' Hawk | Talon combination | claws | #cc6419 | 3 |
| Kickin' Hawk | Roundhouse kick | feet | #cc6114 | 3 |
| Kickin' Hawk | Aerial talon | feet | #cc641a | 2 |
| Kickin' Hawk | Falcon flurry | body | #cc641a | 3 |
| Whampire | Corruptura | mouth | #24cc14 | 3 |
| Whampire | Vladat shriek | mouth | #913ecc | 3 |
| Whampire | Nocturnal lunge | body | #8623cc | 2 |
| Whampire | Nocturnal command | mouth | #963ed5 | 3 |
| Gutrot | Sedative cloud | vents | #6bde18 | 3 |
| Gutrot | Chemical cloud | vents | #68dc16 | 3 |
| Gutrot | Pressure vent | vents | #67d717 | 2 |
| Gutrot | Reactor cloud | body | #48cc1c | 3 |
| Atomix | Atomic burst | hands | #24cc14 | 3 |
| Atomix | Fusion beam | hands | #4ceb17 | 3 |
| Atomix | Nuclear shockwave | feet | #61cc14 | 2 |
| Atomix | Fusion sun | core | #75f619 | 3 |
| Walkatrout | Slippery escape | body | #1b82cc | 3 |
| Walkatrout | Fin slap | fins | #2e8acc | 3 |
| Walkatrout | Fish flop | feet | #2787cc | 2 |
| Walkatrout | Slipstream scramble | body | #3794d7 | 3 |
| The Worst | Stubborn charge | body | #daad28 | 3 |
| The Worst | Belly bump | belly | #e3b429 | 3 |
| The Worst | Unyielding landing | feet | #d4a825 | 2 |
| The Worst | Unbreakable impact | body | #ebc03e | 3 |
| Mole-Stache | Moustache lash | moustache | #cc8a2c | 3 |
| Mole-Stache | Whisker uppercut | moustache | #cc841f | 3 |
| Mole-Stache | Propeller hop | body | #e7bd40 | 2 |
| Mole-Stache | Moustache cyclone | moustache | #cc882a | 3 |
| Overflow | Water jet | palms | #1895ef | 3 |
| Overflow | Pressure shot | palms | #199cf9 | 3 |
| Overflow | Water blade | blade | #199af7 | 2 |
| Overflow | Tidal barrage | palms | #1b99f2 | 3 |
| Gax | Laser vision | eyes | #f52234 | 3 |
| Gax | Tentacle lash | tentacles | #a1cc64 | 3 |
| Gax | Conqueror slam | feet | #9fcc60 | 2 |
| Gax | Vilgaxian charge | body | #6dcc2a | 3 |
| Shock Rock | Energy blade | blade | #19c0f8 | 3 |
| Shock Rock | Fulmini beam | hands | #178de2 | 3 |
| Shock Rock | Rock discharge | feet | #1b88d6 | 2 |
| Shock Rock | Energy hammer | hands | #1a82cc | 3 |
| Slapback | Double trouble | body | #71cc30 | 3 |
| Slapback | Dense fist | hands | #76cc38 | 3 |
| Slapback | Compact cannonball | body | #6ecc2a | 2 |
| Slapback | Mass multiplicity | body | #78cc3b | 3 |
| Surge | Linked charge | body | #841ecc | 3 |
| Surge | Cross slice | claws | #821acc | 3 |
| Surge | Xerge formation | body | #b834e4 | 2 |
| Surge | Swarm convergence | body | #8420cc | 3 |
| Ultimate Humungousaur | Bio-missile volley | weapon | #cc1424 | 3 |
| Ultimate Humungousaur | Armored stomp | feet | #c2cc4f | 3 |
| Ultimate Humungousaur | Heavy tail | tail | #cc1625 | 2 |
| Ultimate Humungousaur | Missile saturation | weapon | #cc7638 | 3 |
| Ultimate Big Chill | Freezing flame | mouth | #ff792b | 3 |
| Ultimate Big Chill | Ice-fire shard | mouth | #ff792b | 3 |
| Ultimate Big Chill | Phasing flame | body | #ff792b | 2 |
| Ultimate Big Chill | Subzero inferno | mouth | #ff792b | 3 |
| Ultimate Echo Echo | Sonic discs | hands | #367bdc | 3 |
| Ultimate Echo Echo | Focused resonance | mouth | #579bfb | 3 |
| Ultimate Echo Echo | Disc ring | body | #4c8be3 | 2 |
| Ultimate Echo Echo | Sonic doom | hands | #317ae0 | 3 |
| Ultimate Swampfire | Blue fireball | hands | #70d5ff | 3 |
| Ultimate Swampfire | Armored roots | ground | #1684d3 | 3 |
| Ultimate Swampfire | Methane bomb | hands | #70d5ff | 2 |
| Ultimate Swampfire | Blue-flame detonation | hands | #70d5ff | 3 |
| Ultimate Cannonbolt | Spiked roller | body | #3876cc | 3 |
| Ultimate Cannonbolt | Steel-shell slam | feet | #3071cc | 3 |
| Ultimate Cannonbolt | Spiked rebound | body | #5389d5 | 2 |
| Ultimate Cannonbolt | Wrecking orbit | body | #5184cc | 3 |
| Phil Billings | Null ray | weapon | #ace7c1 | 2 |
| Phil Billings | Containment net | hands | #ace7c1 | 2 |
| Phil Billings | Plumber grenade | hands | #ace7c1 | 2 |
| Phil Billings | Null barrage | weapon | #ace7c1 | 2 |
| Sublimino | Hypnotic wave | watch | #c4a1f5 | 2 |
| Sublimino | Trance ray | watch | #c4a1f5 | 2 |
| Sublimino | Pocketwatch trap | watch | #c4a1f5 | 2 |
| Sublimino | Mass hypnosis | watch | #c4a1f5 | 2 |
| Acid Breath | Acid spit | mouth | #b5ef45 | 2 |
| Acid Breath | Corrosive breath | mouth | #b5ef45 | 2 |
| Acid Breath | Toxic cloud | body | #b5ef45 | 2 |
| Acid Breath | Acid torrent | mouth | #b5ef45 | 2 |
| Frightwig | Hair whip | hair | #e2c990 | 2 |
| Frightwig | Acrobatic dive | body | #e2c990 | 2 |
| Frightwig | Hair sweep | hair | #e2c990 | 2 |
| Frightwig | Hair barrage | hair | #e2c990 | 2 |
| Thumbskull | Heavy fist | hands | #eeb383 | 2 |
| Thumbskull | Ground shock | feet | #eeb383 | 2 |
| Thumbskull | Brutal charge | body | #eeb383 | 2 |
| Thumbskull | Titan crash | feet | #eeb383 | 2 |
| Clancy | Insect swarm | hands | #c4bf65 | 2 |
| Clancy | Swarm cloud | body | #c4bf65 | 2 |
| Clancy | Beetle trap | ground | #c4bf65 | 2 |
| Clancy | Insect storm | hands | #c4bf65 | 2 |
| Rojo | Cannon bolt | weapon | #a6e8ff | 2 |
| Rojo | Laser sweep | weapon | #a6e8ff | 2 |
| Rojo | Cyber charge | body | #a6e8ff | 2 |
| Rojo | Drone barrage | weapon | #a6e8ff | 2 |
| Dr. Animo | Mutation ray | weapon | #ace7c1 | 2 |
| Dr. Animo | Mutant grenade | hands | #ace7c1 | 2 |
| Dr. Animo | DNA trap | ground | #ace7c1 | 2 |
| Dr. Animo | Mutation storm | weapon | #ace7c1 | 2 |
| Zombozo | Fear wave | hands | #c4a1f5 | 2 |
| Zombozo | Nightmare cloud | body | #c4a1f5 | 2 |
| Zombozo | Clown rush | body | #c4a1f5 | 2 |
| Zombozo | Terror wave | hands | #c4a1f5 | 2 |
| Limax | Elastic strike | hands | #b5dc6b | 2 |
| Limax | Slime shot | hands | #b5dc6b | 2 |
| Limax | Liquid lunge | body | #b5dc6b | 2 |
| Limax | Slime flood | hands | #b5dc6b | 2 |
| Mycelium | Spore shot | hands | #9bd88e | 2 |
| Mycelium | Spore trap | ground | #9bd88e | 2 |
| Mycelium | Fungal roots | ground | #9bd88e | 2 |
| Mycelium | Fungal eruption | ground | #9bd88e | 2 |
| Jonah Melville | Blaster bolt | weapon | #dfeaf3 | 2 |
| Jonah Melville | Explosive charge | weapon | #dfeaf3 | 2 |
| Jonah Melville | Hunter rush | body | #dfeaf3 | 2 |
| Jonah Melville | Hunter barrage | weapon | #dfeaf3 | 2 |
| Forever King | Energy slash | blade | #a6e3d5 | 2 |
| Forever King | Knight wave | hands | #a6e3d5 | 2 |
| Forever King | Shield charge | body | #a6e3d5 | 2 |
| Forever King | Royal strike | blade | #a6e3d5 | 2 |
| Enoch | Energy slash | blade | #a6e3d5 | 2 |
| Enoch | Knight wave | hands | #a6e3d5 | 2 |
| Enoch | Shield charge | body | #a6e3d5 | 2 |
| Enoch | Royal strike | blade | #a6e3d5 | 2 |
| Forever Ninja | Ninja rush | body | #d6bccf | 2 |
| Forever Ninja | Energy shuriken | hands | #d6bccf | 2 |
| Forever Ninja | Blade flurry | blade | #d6bccf | 2 |
| Forever Ninja | Ninja blitz | body | #d6bccf | 2 |
| Sixsix | Blaster bolt | weapon | #ace7c1 | 2 |
| Sixsix | Explosive charge | weapon | #ace7c1 | 2 |
| Sixsix | Hunter rush | body | #ace7c1 | 2 |
| Sixsix | Hunter barrage | weapon | #ace7c1 | 2 |
| Kraab | Blaster bolt | weapon | #ace7c1 | 2 |
| Kraab | Explosive charge | weapon | #ace7c1 | 2 |
| Kraab | Hunter rush | body | #ace7c1 | 2 |
| Kraab | Hunter barrage | weapon | #ace7c1 | 2 |
| Megawatt | Electric bolt | hands | #a6e8ff | 2 |
| Megawatt | Static field | body | #a6e8ff | 2 |
| Megawatt | Charged rush | body | #a6e8ff | 2 |
| Megawatt | Electric storm | hands | #a6e8ff | 2 |
| Yenaldooshi | Sonic howl | mouth | #c8eaf0 | 2 |
| Yenaldooshi | Claw flurry | claws | #c8eaf0 | 2 |
| Yenaldooshi | Predator pounce | body | #c8eaf0 | 2 |
| Yenaldooshi | Full-moon howl | mouth | #c8eaf0 | 2 |
| The Mummy | Bandage lash | bandages | #e2c990 | 2 |
| The Mummy | Binding wave | bandages | #e2c990 | 2 |
| The Mummy | Sand rush | body | #e2c990 | 2 |
| The Mummy | Royal bind | bandages | #e2c990 | 2 |
| Dr. Viktor | Electric bolt | hands | #a6e8ff | 2 |
| Dr. Viktor | Static field | body | #a6e8ff | 2 |
| Dr. Viktor | Charged rush | body | #a6e8ff | 2 |
| Dr. Viktor | Electric storm | hands | #a6e8ff | 2 |
| Vulkanus | Heavy fist | hands | #eeb383 | 2 |
| Vulkanus | Ground shock | feet | #eeb383 | 2 |
| Vulkanus | Brutal charge | body | #eeb383 | 2 |
| Vulkanus | Titan crash | feet | #eeb383 | 2 |
| Slix Vigma | Arena beam | hands | #a6e8ff | 2 |
| Slix Vigma | Laser bolt | hands | #a6e8ff | 2 |
| Slix Vigma | Metal strike | hands | #a6e8ff | 2 |
| Slix Vigma | System overload | hands | #a6e8ff | 2 |
| S.A.M. | Frost ray | weapon | #b7e6ff | 2 |
| S.A.M. | Storm wave | weapon | #b7e6ff | 2 |
| S.A.M. | Weather grenade | weapon | #b7e6ff | 2 |
| S.A.M. | Weather disaster | body | #b7e6ff | 2 |
| Hex | Magic bolt | staff | #e95b4c | 2 |
| Hex | Binding spell | staff | #e95b4c | 2 |
| Hex | Mystic wave | staff | #e95b4c | 2 |
| Hex | Arcane storm | staff | #e95b4c | 2 |
| Charmcaster | Magic bolt | hands | #e55cff | 2 |
| Charmcaster | Binding spell | hands | #e55cff | 2 |
| Charmcaster | Mystic wave | hands | #e55cff | 2 |
| Charmcaster | Arcane storm | hands | #e55cff | 2 |
| The Great One | Crushing bite | mouth | #e4c89a | 2 |
| The Great One | Parasite charge | body | #e4c89a | 2 |
| The Great One | Draining field | body | #e4c89a | 2 |
| The Great One | Great impact | feet | #e4c89a | 2 |
| Kevin 11 | Crystal blast | hands | #a6e3d5 | 2 |
| Kevin 11 | Four-arm strike | hands | #a6e3d5 | 2 |
| Kevin 11 | Energy beam | hands | #80ff6c | 2 |
| Kevin 11 | Amalgam rampage | body | #a6e3d5 | 2 |
| Zs'Skayr | Phantom lunge | body | #c4a1f5 | 2 |
| Zs'Skayr | Tentacle lash | tentacles | #c4a1f5 | 2 |
| Zs'Skayr | Spectral wave | hands | #c4a1f5 | 2 |
| Zs'Skayr | Nightmare sweep | hands | #c4a1f5 | 2 |
| Vilgax | Cyber fist | hands | #eeb383 | 2 |
| Vilgax | Shock slam | feet | #eeb383 | 2 |
| Vilgax | Warlord beam | weapon | #ff3b43 | 2 |
| Vilgax | Conqueror impact | feet | #eeb383 | 2 |
