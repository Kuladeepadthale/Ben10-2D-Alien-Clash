# Rewards and native actor repairs 14.3

Apply the 14.2 material-effects overlay and these three files to the exact signed 14.1 web assets: `index.html`, `rewards-actors143.js`, `rewards-actors143.css`. Do not overwrite the native character asset catalog with older repository art.

- Element labels occupy a reserved reward-card header row beside rarity, above artwork.
- Ready-to-claim packs and character offers sort first within their own groups. Ready missions sort first in each Daily, Weekly, Monthly and Career tab; claimed missions sort last.
- Fixed source cells containing stacked poses: Ultimate Way Big, Ultimate Grey Matter, Bashmouth, Crystalfist and Dark Matter. Existing native body artwork is retained.
- Calibrated fixed per-sheet body scale for Ultimate Wildmutt, Ultimate Way Big, Ultimate Grey Matter, Bootleg, Crystalfist, Dark Matter and Thornblade. Walks are unchanged. Cropped cells are registered at their own floor anchor, and emission markers follow corrected body scale.
- Old cast renderers cannot draw clone actors during KO/hit/guard. Ditto and Surge formations are suppressed during ordinary jumps; intended living ground clone powers remain available. Flattened living hurt poses use each alien's own braced guard cell.

The review workflow checks reward sorting and badge placement at three viewport sizes, every alien in idle/jump/hit/KO in both directions, airborne clone attacks, existing power rendering, enemy timing and type/mastery behavior. No APK is built by this workflow.
