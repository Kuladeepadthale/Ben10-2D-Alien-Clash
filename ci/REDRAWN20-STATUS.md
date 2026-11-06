# New alien drawing batch — 6 November 2026

20 of 20 characters integrated in the game source. Each character was committed and enabled separately after its rendering checks passed.

| Character | New drawings | Source status |
|---|---:|---|
| XLR8 | 32 | Integrated |
| Wildmutt | 32 | Integrated |
| Grey Matter | 32 | Integrated |
| Upgrade | 32 | Integrated |
| Stinkfly | 32 | Integrated |
| Ripjaws | 32 | Integrated |
| Ghostfreak | 32 | Integrated |
| Cannonbolt | 32 | Integrated |
| Wildvine | 32 | Integrated |
| Blitzwolfer | 32 | Integrated |
| Snare-oh | 32 | Integrated |
| Frankenstrike | 32 | Integrated |
| Upchuck | 32 | Integrated |
| Ditto | 32 | Integrated |
| Eye Guy | 32 | Integrated |
| Way Big | 32 | Integrated |
| Arctiguana | 32 | Integrated |
| Spitter | 32 | Integrated |
| Buzzshock | 32 | Integrated |
| Swampfire | 32 | Integrated |

Total: **640 newly generated drawings**. New movement, basic attack, three powers, ultimate, guard and hit clips use the cel player. Jump, dash and knockout keep the existing native animation. These are newly authored, series-inspired assets, not animation extracted from television footage.

Validation: **14,400 rendered action/facing/time samples passed** across all 20 together. Checks cover nonempty drawings, frame bounds, action progression, both facings, emission direction, distance-based walking and native-state fallback. Decoded atlas cache is limited to four characters. All 20 uploaded asset files match their validated local Git blob checksums.

In the character detail view, the animation revision marker reads **New drawings · 20-alien batch · 32 poses** when its new atlas is active. Android package builds are tracked separately from this artwork/source integration.
