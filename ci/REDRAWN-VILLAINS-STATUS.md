# Newly drawn villain animations

Status: integration and verification in progress. The enabled list records completed individual uploads.

Scope: all **50 villains** in the existing Classic and Galactic campaign roster. Each receives **32 newly drawn poses** (1,600 drawings total): eight movement poses, four basic attack phases, four phases for each of three powers, four ultimate phases, guard, two hit reactions and ready idle. Floating villains use hover movement. Existing jump, dash and knockout drawings remain in use.

Identification on the villain detail page: `New drawings · Villain upgrade · 32 poses`.

| ID | Villain | New asset |
|---|---|---|
| 0 | Phil Billings | [32 poses](../web/redrawn-villains/phil-billings.js) |
| 1 | Sublimino | [32 poses](../web/redrawn-villains/sublimino.js) |
| 2 | Acid Breath | [32 poses](../web/redrawn-villains/acid-breath.js) |
| 3 | Frightwig | [32 poses](../web/redrawn-villains/frightwig.js) |
| 4 | Thumbskull | [32 poses](../web/redrawn-villains/thumbskull.js) |
| 5 | Clancy | [32 poses](../web/redrawn-villains/clancy.js) |
| 6 | Rojo | [32 poses](../web/redrawn-villains/rojo.js) |
| 7 | Dr. Animo | [32 poses](../web/redrawn-villains/dr-animo.js) |
| 8 | Zombozo | [32 poses](../web/redrawn-villains/zombozo.js) |
| 9 | Limax | [32 poses](../web/redrawn-villains/limax.js) |
| 10 | Mycelium | [32 poses](../web/redrawn-villains/mycelium.js) |
| 11 | Jonah Melville | [32 poses](../web/redrawn-villains/jonah-melville.js) |
| 12 | Forever King | [32 poses](../web/redrawn-villains/forever-king.js) |
| 13 | Enoch | [32 poses](../web/redrawn-villains/enoch.js) |
| 14 | Forever Ninja | [32 poses](../web/redrawn-villains/forever-ninja.js) |
| 15 | Sixsix | [32 poses](../web/redrawn-villains/sixsix.js) |
| 16 | Kraab | [32 poses](../web/redrawn-villains/kraab.js) |
| 17 | Megawatt | [32 poses](../web/redrawn-villains/megawatt.js) |
| 18 | Yenaldooshi | [32 poses](../web/redrawn-villains/werewolf.js) |
| 19 | The Mummy | [32 poses](../web/redrawn-villains/mummy.js) |
| 20 | Dr. Viktor | [32 poses](../web/redrawn-villains/dr-viktor.js) |
| 21 | Vulkanus | [32 poses](../web/redrawn-villains/vulkanus.js) |
| 22 | Slix Vigma | [32 poses](../web/redrawn-villains/slix-vigma.js) |
| 23 | S.A.M. | [32 poses](../web/redrawn-villains/sam.js) |
| 24 | Hex | [32 poses](../web/redrawn-villains/hex.js) |
| 25 | Charmcaster | [32 poses](../web/redrawn-villains/charmcaster.js) |
| 26 | The Great One | [32 poses](../web/redrawn-villains/great-one.js) |
| 27 | Kevin 11 | [32 poses](../web/redrawn-villains/kevin-11.js) |
| 28 | Zs'Skayr | [32 poses](../web/redrawn-villains/zs-skayr.js) |
| 29 | Vilgax | [32 poses](../web/redrawn-villains/vilgax.js) |
| 30 | Argit | [32 poses](../web/redrawn-villains/argit.js) |
| 31 | Fistrick | [32 poses](../web/redrawn-villains/fistrick.js) |
| 32 | Billy Billions | [32 poses](../web/redrawn-villains/billy-billions.js) |
| 33 | Ssserpent | [32 poses](../web/redrawn-villains/ssserpent.js) |
| 34 | SevenSeven | [32 poses](../web/redrawn-villains/sevenseven.js) |
| 35 | EightEight | [32 poses](../web/redrawn-villains/eighteight.js) |
| 36 | Sunder | [32 poses](../web/redrawn-villains/sunder.js) |
| 37 | Psyphon | [32 poses](../web/redrawn-villains/psyphon.js) |
| 38 | Darkstar | [32 poses](../web/redrawn-villains/darkstar.js) |
| 39 | D'Void | [32 poses](../web/redrawn-villains/d-void.js) |
| 40 | Highbreed Commander | [32 poses](../web/redrawn-villains/highbreed.js) |
| 41 | Princess Attea | [32 poses](../web/redrawn-villains/attea.js) |
| 42 | Looma Red Wind | [32 poses](../web/redrawn-villains/looma.js) |
| 43 | Fistina | [32 poses](../web/redrawn-villains/fistina.js) |
| 44 | Dr. Psychobos | [32 poses](../web/redrawn-villains/dr-psychobos.js) |
| 45 | Khyber | [32 poses](../web/redrawn-villains/khyber.js) |
| 46 | Albedo | [32 poses](../web/redrawn-villains/albedo.js) |
| 47 | Aggregor | [32 poses](../web/redrawn-villains/aggregor.js) |
| 48 | Eon | [32 poses](../web/redrawn-villains/eon.js) |
| 49 | Malware | [32 poses](../web/redrawn-villains/malware.js) |

[Enabled sets](../web/redrawn-villains-list.js) · [Generation specifications](REDRAWN-VILLAINS-PROMPTS.json) · [Rendering workflow](../.github/workflows/redrawn-villains.yml).

The runtime is isolated from alien sprites, preloads the selected villain before battle, limits decoded villain atlases to four, advances walking by distance, keeps emitter direction aligned with facing, and separates airborne versus landed leap impacts. Portrait cards retain their existing artwork. Newly drawn animation is series-inspired, not television footage; rendering checks verify technical integration, not exact television equivalence.

GitHub source updates are separate from a downloadable Android build. No new APK/AAB is delivered by this animation task.
