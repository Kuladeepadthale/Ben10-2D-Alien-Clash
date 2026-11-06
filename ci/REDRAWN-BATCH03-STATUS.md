# Alien drawing batch 03 — 6 November 2026

20 of 20 characters integrated and enabled in the game source. Each character received an individual artwork commit and enable commit after its rendering checks passed.

| Character | New drawings | Status |
|---|---:|---|
| Clockwork | 32 | Integrated |
| Jury Rigg | 32 | Integrated |
| Shocksquatch | 32 | Integrated |
| Feedback | 32 | Integrated |
| Bloxx | 32 | Integrated |
| Gravattack | 32 | Integrated |
| Crashhopper | 32 | Integrated |
| Ball Weevil | 32 | Integrated |
| Astrodactyl | 32 | Integrated |
| Toepick | 32 | Integrated |
| Pesky Dust | 32 | Integrated |
| Bullfrag | 32 | Integrated |
| Kickin' Hawk | 32 | Integrated |
| Whampire | 32 | Integrated |
| Gutrot | 32 | Integrated |
| Atomix | 32 | Integrated |
| Walkatrout | 32 | Integrated |
| The Worst | 32 | Integrated |
| Mole-Stache | 32 | Integrated |
| Overflow | 32 | Integrated |

This batch adds **640 newly generated drawings**. Three batches now cover **60 characters and 1,920 new drawings**, in addition to the earlier Heatblast, Four Arms and Diamondhead upgrades.

Validation: 720 rendered action/facing/time samples per character, 14,400 for this batch. Every one of the 60 uploaded animation source files matches its local Git blob checksum. The four-character decoded image cache remains enabled. Astrodactyl's sheet was revised to keep its wings, tail and crest within cell boundaries. Crashhopper's source registration preserves airborne lift in its movement cycle.

New movement, basic attack, three powers, ultimate, idle, guard and hit clips are registered. Astrodactyl, Pesky Dust and Whampire have animated flying idle clips. Jump, dash and knockout continue to use existing native animations. These are newly authored, series-inspired game assets, not television footage.

Detail marker: **New drawings · Next 20 · Batch 03 · 32 poses** when the character atlas is active. APK/AAB builds are separate from source integration.

[Prompt set](REDRAWN-BATCH03-PROMPTS.json) · [Animation source files](../web/redrawn20/)

Combined verification: **60 characters and 43,200 rendered samples passed together** in [GitHub Actions run 42172311188](https://github.com/Kuladeepadthale/Ben10-2D-Alien-Clash/actions/runs/42172311188). This also validates native-state fallback and the bounded decoded-image cache.
