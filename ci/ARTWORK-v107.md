# v10.7 portrait and standing-pose refresh

The 72-character audit found that IDs 32–51 had approximately 150–230 pixel portraits, substantially smaller than other roster portraits. Their replacement native drawings are in `web/assets/portraits-v107/`; `manifest.json` pins their sizes and SHA-256 hashes. They are used by collection, squad cards, alien details, results, Home's Hero stance and the battle idle stance. Existing walk, attack, reaction and other pose clips remain intact. This is a portrait/standing-art improvement, not a full replacement of every animation frame.

Created with the built-in image-generation tool in four five-character atlases. Extraction retains full alpha-connected figures and nearby detached details without cutting at grid lines. WebP uses lossless encoding; figures are not enlarged to manufacture resolution. CI checks all 20 files, transparency and >1.8× prior source height.

## Final prompt set

Each atlas used the following prompt with its own group substituted:

> Use case identity-preserve. Production replacement game atlas, exactly FIVE crisp high detail full-body Ben 10 alien standing portraits. Input role: design and pose references. Characters in exact reference order: GROUP. Use precisely TWO COLUMNS and THREE ROWS of equal square cells; sixth bottom-right cell EMPTY. On genuine transparent alpha. Each figure faces right, relaxed pose exactly as its reference; keep its anatomy, iconic colors, head, hands, tail, wings and Omnitrix emblem. Redraw clean cel-shaded cartoon ink with sharp confident dark outlines, clean flat color regions and controlled bright highlights. Each figure should fill 75% of cell height, including small aliens, with at least 12% clear transparent margin ALL SIDES. All antennae, ears, wings, tails and feet must be COMPLETE, entirely inside individual cell. No clipping, no contact between cells, no shadow, no text, no grid, no scene. Large native canvas 1536x2304 requested. Important: increase figure detail, NOT merely upscale the input or retain its blurry texture. The generous transparent gutters are essential for precise cropping into five game assets.

Groups, in row-major order:

1. Rath, Lodestar, Nanomech, Water Hazard, AmpFibian.
2. Armodrillo, Terraspin, NRG, Fasttrack, Chamalien.
3. Eatle, Clockwork, Jury Rigg, Shocksquatch, Feedback.
4. Bloxx, Gravattack, Crashhopper, Ball Weevil, Astrodactyl.

Early 32-pose and 20-portrait atlas attempts were rejected during visual QA; only the four reviewed five-character atlases are shipped.
