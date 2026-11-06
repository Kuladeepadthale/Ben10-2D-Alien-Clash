# Remaining aliens-page animation drawings — batch 05

Status: final verification in progress.

Nine remaining characters receive 32 newly drawn series-inspired poses each: **288 drawings**. Each set is enabled individually after its 720-sample local rendering check passes.

| ID | Character | New set |
|---|---|---|
| 83 | Hot Shot | [32 poses](../web/redrawn20/hot-shot.js) |
| 84 | Humungoraptor | [32 poses](../web/redrawn20/humungoraptor.js) |
| 85 | Quad Smack | [32 poses](../web/redrawn20/quad-smack.js) |
| 86 | Rush | [32 poses](../web/redrawn20/rush.js) |
| 87 | Skunkmoth | [32 poses](../web/redrawn20/skunkmoth.js) |
| 88 | Thornblade | [32 poses](../web/redrawn20/thornblade.js) |
| 89 | Undertow | [32 poses](../web/redrawn20/undertow.js) |
| 90 | Wreckingbolt | [32 poses](../web/redrawn20/wreckingbolt.js) |
| 91 | Alien V | [32 poses](../web/redrawn20/alien-v.js) |

Identification in game: `New drawings · Remaining 9 · Batch 05 · 32 poses`.

The current aliens-page roster has 92 entries. The five redraw batches cover IDs 3–91 (89 characters, 2,848 drawings); Heatblast, Four Arms and Diamondhead retain their earlier upgrades. No roster entries remain outside these groups. This is coverage of movement, basic, three powers, ultimate, guard, hit and ready idle; jump, dash and knockout retain the existing game animation.

The inspected artwork has species-specific clip mappings for Skunkmoth's mouth shot/arc/dive, Thornblade's dart/vines/roots and Undertow's jet/globule. Skunkmoth wing framing was corrected before integration. Wreckingbolt has explicit airborne-versus-landed shell checks. Rush uses a fixed atlas reference scale across movement and attacks.

[Generation specifications](REDRAWN-BATCH05-PROMPTS.json). Source assets embed generated images; all sets are packaged at `web/redrawn20/<slug>.js`. Newly drawn artwork is series-inspired, not television footage. Rendering checks verify technical integration, not frame-for-frame television equivalence.

GitHub source completion is separate from a downloadable Android build. No new APK/AAB is delivered by this batch.
