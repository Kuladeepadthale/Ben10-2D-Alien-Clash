# Version 10.0: 72-character roster

Adds stable character IDs 52–71: Toepick, Pesky Dust, Bullfrag, Kickin’ Hawk, Whampire, Gutrot, Atomix, Walkatrout, The Worst, Mole-Stache, Overflow, Gax, Shock Rock, Slapback, Surge, Ultimate Humungousaur, Ultimate Big Chill, Ultimate Echo Echo, Ultimate Swampfire, and Ultimate Cannonbolt.

The 15 new species and five Ultimate forms have 640 complete native poses across 80 sheets, plus 100 transparent power illustrations. Walk, jump, basic strike, three skills, ultimate, idle, guard, hit, defeat and dash states are mapped explicitly. Hovering aliens use their own flight cadence. Ultimate Cannonbolt rolls during rushes; Ultimate Swampfire uses blue fire.

Native source textures are lossless WebP. The exporter packs whole connected poses with transparent margins, preserving source pixels and placing attack origins on opaque character pixels. These are custom game illustrations and game animations, not frames extracted from television episodes.

The existing 52 IDs, unlocks, levels, loadouts, currencies and mission claims remain stable. The previous 20-character mission stays limited to IDs 32–51. A separate mission rewards collecting IDs 52–71. Old cloud payloads remain valid and the new limit is 72 entries.

## Rebuild

Run the Android GitHub Actions workflow. It prepares the stored source textures, exports all cel metadata, runs rendering, collision, progression, account, multiplayer and browser-layout checks, and builds both Android package variants with the existing pinned signing identity.

## Verification

Local checks passed: 2,312 complete native frames with transparent margins and pixel preservation; 12,096 cel renders; 2,160 animated power-art renders; 2,160 damaging casts at 30/60 fps against three opponent sizes; 360 server attack cases; 52-to-72 save migration; collection, purchase and account-payload regressions. The Android workflow additionally validates the packaged assets, certificate and responsive layouts before release.

## Multiplayer availability

The Worker source includes the 72-character combat engine. The running ranked service must be deployed with that updated source before it accepts new IDs. The client checks the server roster and guides unsupported selections to Practice vs Bot. All new characters work in Testing, Survival, Threat Ladder and local bot practice without a Worker update.
