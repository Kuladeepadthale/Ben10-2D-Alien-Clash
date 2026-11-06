# Next 20 alien drawing upgrades — 6 November 2026

20 of 20 next-batch characters integrated and enabled. Every character received its own artwork commit and enable commit after its individual rendering checks passed.

| Character | New drawings | Status |
|---|---:|---|
| Echo Echo | 32 | Integrated |
| Humungousaur | 32 | Integrated |
| Jetray | 32 | Integrated |
| Big Chill | 32 | Integrated |
| Chromastone | 32 | Integrated |
| Brainstorm | 32 | Integrated |
| Spidermonkey | 32 | Integrated |
| Goop | 32 | Integrated |
| Alien X | 32 | Integrated |
| Rath | 32 | Integrated |
| Lodestar | 32 | Integrated |
| Nanomech | 32 | Integrated |
| Water Hazard | 32 | Integrated |
| AmpFibian | 32 | Integrated |
| Armodrillo | 32 | Integrated |
| Terraspin | 32 | Integrated |
| NRG | 32 | Integrated |
| Fasttrack | 32 | Integrated |
| Chamalien | 32 | Integrated |
| Eatle | 32 | Integrated |

**This batch: 640 newly generated drawings.** Together with the previous 20-alien batch, 40 characters have 1,280 new drawings. Heatblast, Four Arms and Diamondhead are separate earlier upgrades.

New movement, basic attack, three powers, ultimate, idle, guard and hit clips are registered. Jetray, Big Chill, Nanomech and AmpFibian use animated hovering idle clips. Humungousaur and Armodrillo retain the airborne slam cel until landing. Jump, dash and knockout continue to use existing native animations.

Individual validation: 720 rendered action/facing/time samples per character, 14,400 for this batch. Checks cover nonempty drawings, frame bounds, action progression, both facings, emission direction, distance-based movement and native-state fallback. The decoded image cache remains limited to four characters. All 40 source files were compared against their uploaded Git blob checksums with no mismatches.

The detail marker for this batch reads **New drawings · Next 20 · Batch 02 · 32 poses** when its atlas is active. These are newly authored, series-inspired game assets rather than footage extracted from television. APK/AAB builds are separate from source integration.

[Generation prompt set](REDRAWN-NEXT20-PROMPTS.json) · [Animation source folder](../web/redrawn20/)
