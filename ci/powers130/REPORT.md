# Higher-category native combat review — v13.0

Scope: all60 Epic/Heroic/Legendary aliens (34/13/13), five attacks each: basic, three powers and ultimate. Common/Rare categories are excluded. These are improvements to the existing game artwork and animation sequences, not copies of television footage or newly drawn frames for every attack. Game-specific ability names are retained; identical TV choreography is not claimed.

## Changes

- Each power uses its canonical species-native preparation, contact and recovery body cels instead of silently borrowing the generic basic-punch clip. Multi-hit hands/claws, pounces and rushes use the existing hit cadence. The shared `powerPoseIndex` now selects both the visible body and the corresponding source registration for client and authoritative simulation.
- Projectile heads for these60 aliens use the existing animated fire, water, crystal, web, electrical and other species geometry. Ability-card pictures remain in the menu but no longer become static thrown sprites for these categories.
- Dark Matter recovery and Bashmouth ultimate preparation had source crops containing two vertically stacked bodies. Clean existing native preparation/retraction cels replace those visible uses. No native image pixels are resized or regenerated.
- Native tail contact cels replace the added generic whole-body tilt for these categories. Existing ball spinning, slam jump silhouettes, walking/flight, and approved Heatblast/Big Chill/Humungousaur/Rath choreography are preserved.

Damage, prices, card categories, upgrades, progression, cooldowns, mission/reward rules, movement, facing and captured targets remain unchanged. Canonical marker timing is shared by server source and client. The live Worker still needs deployment with the owner's configured credentials.

## Evidence and resuming

`roster.json` lists all60 aliens. `verify.cjs` checks600 directional casts,4800 native draws, immutable combat state, correct category scope, actual rendered pose/source agreement and image-free combat projectiles. Canonical eye/mouth/tail marker pixels take precedence over older generic contact markers. The native-pixel checker evaluates runtime profile overrides, including the two corrected crops, instead of parsing only the base profile literal.

`audit.cjs` steps each real cast at120Hz and saves six timeline samples for every attack. The `powers-review-130` branch retains before/after sheets and ten six-alien batch JSON checkpoints; each batch is committed independently. These are QA screenshots, never gameplay projectile art. Overviews cover all60 aliens. `tracker.json` records per-attack native verification, and the release checkpoint records visual review and final build evidence separately. Resume from fresh main; do not overwrite v12.8 walking or v12.9 repairs from an older branch.

Physical Android phone testing and live Worker deployment remain pending. Six legacy full-art reviews from earlier versions remain separate from this targeted attack/rendering audit.

## Visual review result

All ten overview batches were inspected, covering all60 aliens and300 attacks. Comparing six sampled real-cast poses per attack found40 changed native sequences across24 aliens. Other existing good sequences were retained; animated projectile geometry applies to the selected categories. Approved jump/slam flight silhouettes and ball rolling are intentional exceptions to a power's on-ground contact clip.

Way Big now uses pale-blue cosmic energy to match the existing Ultimate Alien-style body; NRG uses red-orange vent energy. Reference checks: https://ben10.fandom.com/wiki/Way_Big_(Classic) (the notes distinguish Ultimate Alien pale blue from Omniverse green) and https://ben10.fandom.com/wiki/NRG (red radioactive energy through containment-suit vents). These references guide palette choice, not a claim that this game reproduces exact episode footage.

Review source: `powers-review-130` commit175a3b45582e8229199fee523c651236fb5b1d86; latest colour review rerendered only batches0 and3, and retained the eight unchanged reviewed batches. The full before/after character sheets remain on that branch. The final palette-only build must prove all other game/server implementation is byte-for-byte equal to the passed78-command baseline and rerun native/origin/palette checks.

## Verified release

Published `android-7aeeb6b3bb08`, Android13.0/code130, source `7aeeb6b3bb08b68d25e6a356f05fa64de1954433`. Run40273924981/job121412508013 succeeded. All78 full regression commands passed in the exact-diff baseline; final600-cast/native-origin/palette checks passed again. Both APK labels, packaged assets, signatures and uploaded SHA256 digests verified. Exact files/hashes are in `last-release.json`. Physical phone testing and live Worker deployment remain pending.

## Character checklist

Every row includes basic, all three powers and ultimate, tested in both directions and visually reviewed in its overview. Labels are existing game labels.

| Alien | Category | Basic | Three powers | Unite move |
| --- | --- | --- | --- | --- |
| Heatblast | Epic | Fireball · basic | Fireball; Flame jet; Eruption | Inferno storm |
| Diamondhead | Epic | Crystal volley · basic | Crystal volley; Crystal spikes; Crystal blade | Crystal cascade |
| Ghostfreak | Epic | Normal strike | Phantom lunge; Tentacle lash; Spectral pulse | Nightmare sweep |
| Frankenstrike | Epic | Lightning discharge · basic | Lightning discharge; Charged fist; Shockwave | Thunderstorm |
| Eye Guy | Epic | Optic shot · basic | Optic shot; Chest beam; Omni pulse | All-seeing beam |
| Way Big | Legendary | Cosmic ray · basic | Cosmic ray; Titan stomp; Meteor strike | Cosmic judgement |
| Swampfire | Epic | Fire seed · basic | Fire seed; Vine lash; Root eruption | Wildfire bloom |
| Humungousaur | Heroic | Normal strike | Seismic stomp; Titan fist; Dinosaur charge | Colossal impact |
| Jetray | Epic | Neuroshock ray · basic | Neuroshock ray; Aerial blitz; Tail bolt | Hyperspeed barrage |
| Big Chill | Epic | Freezing breath · basic | Freezing breath; Phasing lunge; Ice wave | Deep freeze |
| Chromastone | Epic | Prismatic beam · basic | Prismatic beam; Crystal strike; Radiant wave | Spectrum overload |
| Spidermonkey | Epic | Web shot · basic | Web shot; Four-arm flurry; Acrobatic pounce | Webstorm rush |
| Alien X | Legendary | Cosmic orb · basic | Cosmic orb; Gravity pulse; Starstep | Celestial judgement |
| Rath | Epic | Normal strike | Claw flurry; Tiger pounce; Rage slam | Appoplexian fury |
| Lodestar | Epic | Magnetic pulse · basic | Magnetic pulse; Metal storm; Polarity field | Magnetic maelstrom |
| Water Hazard | Epic | Palm water jet · basic | Palm water jet; Pressure burst; Rising tide | Ocean deluge |
| AmpFibian | Epic | Tentacle bolt · basic | Tentacle bolt; Phasing current; Current field | Amperi thunderstorm |
| Armodrillo | Heroic | Normal strike | Piston drill; Seismic punch; Drill charge | Tectonic breaker |
| Terraspin | Epic | Vent blast · basic | Vent blast; Shell cyclone; Shell slam | Cyclonic tempest |
| NRG | Heroic | Vent heat ray · basic | Vent heat ray; Molten stomp; Radiation wave | Reactor flare |
| Eatle | Epic | Mouth blast · basic | Mouth blast; Beetle charge; Horn uppercut | Matter converter |
| Clockwork | Heroic | Temporal ray · basic | Temporal ray; Time field; Clockwork stomp | Temporal surge |
| Shocksquatch | Epic | Normal strike | Charged fist; Lightning arc; Electric stomp | Thunderous fury |
| Feedback | Heroic | Finger bolt · basic | Finger bolt; Plug discharge; Current rush | Conductoid overload |
| Bloxx | Epic | Normal strike | Block hammer; Brick volley; Construction slam | Megablock impact |
| Gravattack | Legendary | Gravity orb · basic | Gravity orb; Orbital field; Planetfall | Gravity singularity |
| Astrodactyl | Epic | Star bolt · basic | Energy whip; Jet blitz; Star bolt | Stellar overdrive |
| Toepick | Epic | Normal strike | Terrifying gaze; Dread aura; Heavy grasp | Nightmare exposure |
| Kickin' Hawk | Epic | Normal strike | Talon combination; Roundhouse kick; Aerial talon | Falcon flurry |
| Whampire | Heroic | Corruptura · basic | Corruptura; Vladat shriek; Nocturnal lunge | Nocturnal command |
| Gutrot | Epic | Sedative cloud · basic | Sedative cloud; Chemical cloud; Pressure vent | Reactor cloud |
| Atomix | Legendary | Atomic burst · basic | Atomic burst; Fusion beam; Nuclear shockwave | Fusion sun |
| Overflow | Epic | Water jet · basic | Water jet; Pressure shot; Water blade | Tidal barrage |
| Gax | Heroic | Laser vision · basic | Laser vision; Tentacle lash; Conqueror slam | Vilgaxian charge |
| Shock Rock | Heroic | Fulmini beam · basic | Energy blade; Fulmini beam; Rock discharge | Energy hammer |
| Slapback | Epic | Normal strike | Double trouble; Dense fist; Compact cannonball | Mass multiplicity |
| Ultimate Humungousaur | Legendary | Bio-missile volley · basic | Bio-missile volley; Armored stomp; Heavy tail | Missile saturation |
| Ultimate Big Chill | Legendary | Freezing flame · basic | Freezing flame; Ice-fire shard; Phasing flame | Subzero inferno |
| Ultimate Echo Echo | Legendary | Sonic discs · basic | Sonic discs; Focused resonance; Disc ring | Sonic doom |
| Ultimate Swampfire | Legendary | Blue fireball · basic | Blue fireball; Armored roots; Methane bomb | Blue-flame detonation |
| Ultimate Cannonbolt | Legendary | Normal strike | Spiked roller; Steel-shell slam; Spiked rebound | Wrecking orbit |
| Ultimate Wildmutt | Heroic | Normal strike | Apex claw flurry; Predator lunge; Tail sweep | Feral onslaught |
| Ultimate Spidermonkey | Heroic | Mouth web snare · basic | Mouth web snare; Gorilla ground smash; Spider-leg rake | Arachnid rampage |
| Ultimate Way Big | Legendary | Cosmic forearm ray · basic | Cosmic forearm ray; Colossal stomp; Giant uppercut | Ultimate cosmic ray |
| Ultimate Arctiguana | Heroic | Shoulder frost cannon · basic | Shoulder frost cannon; Ice cannon shell; Glacial field | Twin cannon blizzard |
| Ultimate Gravattack | Legendary | Gravity core pulse · basic | Gravity core pulse; Orbital gravity well; Moonfall | Planetary compression |
| Ultimate Rath | Heroic | Normal strike | Twin-claw frenzy; Appoplexian pounce; Savage uppercut | Ultimate claw rampage |
| Ultimate Grey Matter | Legendary | Third-eye beam · basic | Third-eye beam; Psychic barrier; Hoverchair cannon | Cerebral overload |
| Bashmouth | Epic | Normal strike | Metal-claw barrage; Steel-jaw bite; Wolf pounce | Armored wolf frenzy |
| Bootleg | Epic | Optic corruption beam · basic | Optic corruption beam; Liquid spike strike; Circuit pulse | Corruption overload |
| Crystalfist | Epic | Violet crystal shard · basic | Violet crystal shard; Crystalline eruption; Crystal-fist combo | Purple crystal cascade |
| Dark Matter | Epic | Crystallizing flame · basic | Crystallizing flame; Dark crystal trap; Crystalline claw | Matter crystallization |
| Hot Shot | Epic | Magma fireball · basic | Magma fireball; Flame stream; Volcanic eruption | Magma storm |
| Humungoraptor | Heroic | Normal strike | Raptor claw combo; Spiked tail sweep; Raptor stomp | Raptor stampede |
| Quad Smack | Epic | Normal strike | Four-fist barrage; Four-arm thunderclap; Quad ground pound | Four-arm fury |
| Skunkmoth | Epic | Mouth slime shot · basic | Mouth slime shot; Toxic goo arc; Armored moth dive | Slime bombardment |
| Thornblade | Epic | Thorn dart · basic | Thorn dart; Twin-vine lash; Thorn-root eruption | Thorn forest |
| Undertow | Epic | Forearm water jet · basic | Forearm water jet; Pressure globule; Undertow surge | Hydro-pressure torrent |
| Wreckingbolt | Epic | Normal strike | Spiked shell roll; Wrecking crash; Heavy shell strike | Wreckingbolt rampage |
| Alien V | Legendary | Cosmic hand blast · basic | Cosmic hand blast; Celestial crusher; Void gravity field | Celestial annihilation |
