# v11.5 — Battle artwork and Hero XP

The five main battle choices now each show a complete illustration. New Multiplayer, Survival and Testing art joins the existing Expedition and Plumber Missions illustrations. The grid retains all five choices in portrait and landscape.

Profile and results now show a line meter with current level XP, the level requirement and exact XP remaining. Results also display the battle XP gained and level-up indication. Existing awards, thresholds, ownership and saves are unchanged.

Validation: four viewport browser checks; all five images must load; XP boundaries at0,149,150,349,350; one completed loss awards30XP only once and crosses level1→2; profile/results show29/200 and171 remaining; multi-level gain and exact threshold reset. Existing Expedition, Plumber, progression, multiplayer and combat checks also run against the verified v11.4 baseline.

## Artwork
Built-in image generation was used. Final1200×800 WebP assets:
- `web/assets/modes-v112/multiplayer.webp`
- `web/assets/modes-v112/survival.webp`
- `web/assets/modes-v112/testing.webp`

Final prompts:

Multiplayer: Landscape3:2 premium crisp cartoon illustration for a Ben10 fighting game Multiplayer mode card. Heatblast on left and Diamondhead on right, recognizable original alien designs, facing off in a futuristic Plumber arena. Orange fire on left versus luminous green crystals on right, dynamic heroic poses, beautiful cel shading, strong readable silhouettes, cinematic lighting. Keep main figures upper center and bottom quarter dark for later UI text. No words, no letters, no watermark.

Survival: Use case: stylized-concept. Asset type: landscape battle mode card illustration for Ben10 fan game. Four Arms standing strong on a broken arena platform with waves of alien enemy silhouettes approaching in the distance, crimson muscles, green Omnitrix emblem, orange sunset and emerald energy. Premium crisp cartoon illustration with strong silhouettes, dynamic perspective, polished cel shading, luminous lighting. Main characters in upper center, leave bottom quarter darker and less detailed for UI text overlay. Full bleed landscape3:2 composition. No text, no lettering, no logos, no watermark.

Testing: Landscape3:2 premium crisp cartoon illustration for a Ben10 game Testing mode card. Recognizable XLR8 blue and black velociraptor-like speed alien with sleek helmet and wheels on feet, and Upgrade black alien with luminous green circuit lines, training together inside a beautiful futuristic Plumber holographic simulation room. Cyan speed trails, green holographic target rings, polished cel shading, dynamic lively poses, readable silhouettes. Upper center main characters, bottom quarter darker for later UI overlay. No text, no words, no watermark.
