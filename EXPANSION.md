# Version 4.0: twenty Classic aliens

Adds ten aliens to the approved original ten without changing their stable IDs, character art or action clips. Each new alien has 32 new native cel drawings covering walk, jump, normal attack, three powers, ultimate, idle, guard, hit, knockdown and dash. Whole-body discrete playback, distance-based movement timing and the two-fighter texture cache are retained.

| ID | Alien | Coins | Power kit |
| --- | --- | ---: | --- |
| 10 | Cannonbolt | 850 | Rolling strike, Shell slam, Rebound rush; Orbit breaker |
| 11 | Wildvine | 750 | Vine lash, Seed bomb, Root eruption; Overgrowth |
| 12 | Blitzwolfer | 900 | Sonic howl, Claw flurry, Predator pounce; Moonlit howl |
| 13 | Snare-oh | 800 | Bandage lash, Binding wrap, Sand rush; Royal bind |
| 14 | Frankenstrike | 1,000 | Lightning discharge, Charged fist, Shockwave; Thunderstorm |
| 15 | Upchuck | 650 | Plasma spit, Explosive burp, Tongue lash; Digestive barrage |
| 16 | Ditto | 700 | Double trouble, Clone flurry, Tag-team rush; Multiplicity |
| 17 | Eye Guy | 950 | Optic shot, Chest beam, Omni pulse; All-seeing beam |
| 18 | Way Big | 1,800 | Cosmic ray, Titan stomp, Meteor strike; Cosmic judgement |
| 19 | Arctiguana | 850 | Frost breath, Ice shard, Glacial slam; Absolute zero |

The existing combat engine handles actual hits, damage budgets, cooldowns and upgrades. Bandage and frost attacks use the established slow mechanic. Ditto's clone assists accompany budgeted multihit attacks. New effect rendering adds vines, sonic rings, bandage waves, electrical discharges, ice shards and cosmic beams. Cannonbolt's active rolling ball rotates according to traveled distance. Way Big is scaled for arena visibility; this is not a canonical height chart.

New and old aliens are available in Testing. Coin unlocks, character-first upgrades, random opponents and starter offers use the roster size instead of a ten-character limit. Existing owned aliens, selected alien, coins, mission claims, upgrade levels and saved three-character starter offers are preserved. New players can receive any three distinct choices from the expanded roster. New one-time collection missions reward owning ten aliens (+400 coins) and all twenty (+800 coins). Existing mission claims remain claimed.

The roster pager shows a moving window of five page numbers, with Previous/Next controls reaching every alien on narrow phones. Existing readable menu styling is retained.

New source sheets are in `ci/cel-sources/`; recovered character design and action briefs are in `ci/cel-sources/expansion-designs.json`. The built-in ImageGen tool created new game artwork matching the approved cel style and original-series character designs; these are not extracted TV animation. `ci/roster.json` defines the export order. Full builds run `python3 ci/build-cels.py`. For a local workspace containing only the new art plus the old manifest, `--new-only --skip-bundle` exports the new sheets and combined metadata; APK CI always rebuilds the complete roster.

Validation covers all 20 × 12 action states and both facings, 100 actual cast/effect/collision updates and damage caps, all twenty dash checks, save migration from ten records, high-ID unlock persistence, paged access to every alien, Testing isolation, missions, and real Chromium menu geometry. Physical Android play-testing remains separate from these automated checks.

## Version 4.1: remaining original-series forms

Adds Spitter (ID 20, 800 coins) and Buzzshock (ID 21, 900 coins). Each has the same 32-cel/12-action pipeline as the other expanded aliens. Their powers, ultimate, upgrades, coin ownership and free Testing access use the existing systems. All old IDs and the 20-alien collection mission remain unchanged. A separate 22-alien milestone awards 300 coins. The roster remains limited to original-series Omnitrix forms.
