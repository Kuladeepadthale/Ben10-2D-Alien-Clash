# Enemy combat animation audit

Revision: combat timing pass, 2026-11-01.

Scope: all 50 Plumber Mission enemies, including Boss Rush selections. Walking, flying, jumping, dash, guard, hit and KO poses are unchanged. No APK/AAB build.

Changes: staged anticipation/recovery; existing per-power firing poses preferred when an emitter landmark exists; long melee combos cycle three contacts; visual clock respects castDuration instead of persistent trap lifetime. Fixed reference-height scaling and emitter data retained.

Validation: 2,000 sampled combat states in both facings; all non-cast state frame identities checked. This is a code/timing audit using existing artwork, not a new frame-by-frame redraw or a device visual/performance certification. Further character art work remains a separate task.

| Enemy | Combat timeline | Walk | New artwork |
|---|---|---|---|
| Phil Billings | Timing checks passed | Unchanged | None |
| Sublimino | Timing checks passed | Unchanged | None |
| Acid Breath | Timing checks passed | Unchanged | None |
| Frightwig | Timing checks passed | Unchanged | None |
| Thumbskull | Timing checks passed | Unchanged | None |
| Clancy | Timing checks passed | Unchanged | None |
| Rojo | Timing checks passed | Unchanged | None |
| Dr. Animo | Timing checks passed | Unchanged | None |
| Zombozo | Timing checks passed | Unchanged | None |
| Limax | Timing checks passed | Unchanged | None |
| Mycelium | Timing checks passed | Unchanged | None |
| Jonah Melville | Timing checks passed | Unchanged | None |
| Forever King | Timing checks passed | Unchanged | None |
| Enoch | Timing checks passed | Unchanged | None |
| Forever Ninja | Timing checks passed | Unchanged | None |
| Sixsix | Timing checks passed | Unchanged | None |
| Kraab | Timing checks passed | Unchanged | None |
| Megawatt | Timing checks passed | Unchanged | None |
| Yenaldooshi | Timing checks passed | Unchanged | None |
| The Mummy | Timing checks passed | Unchanged | None |
| Dr. Viktor | Timing checks passed | Unchanged | None |
| Vulkanus | Timing checks passed | Unchanged | None |
| Slix Vigma | Timing checks passed | Unchanged | None |
| S.A.M. | Timing checks passed | Unchanged | None |
| Hex | Timing checks passed | Unchanged | None |
| Charmcaster | Timing checks passed | Unchanged | None |
| The Great One | Timing checks passed | Unchanged | None |
| Kevin 11 | Timing checks passed | Unchanged | None |
| Zs'Skayr | Timing checks passed | Unchanged | None |
| Vilgax | Timing checks passed | Unchanged | None |
| Argit | Timing checks passed | Unchanged | None |
| Fistrick | Timing checks passed | Unchanged | None |
| Billy Billions | Timing checks passed | Unchanged | None |
| Ssserpent | Timing checks passed | Unchanged | None |
| SevenSeven | Timing checks passed | Unchanged | None |
| EightEight | Timing checks passed | Unchanged | None |
| Sunder | Timing checks passed | Unchanged | None |
| Psyphon | Timing checks passed | Unchanged | None |
| Darkstar | Timing checks passed | Unchanged | None |
| D'Void | Timing checks passed | Unchanged | None |
| Highbreed Commander | Timing checks passed | Unchanged | None |
| Princess Attea | Timing checks passed | Unchanged | None |
| Looma Red Wind | Timing checks passed | Unchanged | None |
| Fistina | Timing checks passed | Unchanged | None |
| Dr. Psychobos | Timing checks passed | Unchanged | None |
| Khyber | Timing checks passed | Unchanged | None |
| Albedo | Timing checks passed | Unchanged | None |
| Aggregor | Timing checks passed | Unchanged | None |
| Eon | Timing checks passed | Unchanged | None |
| Malware | Timing checks passed | Unchanged | None |
