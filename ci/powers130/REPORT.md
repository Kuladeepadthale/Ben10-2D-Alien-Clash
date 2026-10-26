# Higher-category native combat review — v13.0

Scope: all60 Epic/Heroic/Legendary aliens (34/13/13), five attacks each: basic, three powers and ultimate. Common/Rare categories are excluded. These are improvements to the existing game artwork and animation sequences, not copies of television footage or newly drawn frames for every attack. Game-specific ability names are retained; identical TV choreography is not claimed.

## Changes

- Each power uses its canonical species-native preparation, contact and recovery body cels instead of silently borrowing the generic basic-punch clip. Multi-hit hands/claws, pounces and rushes use the existing hit cadence. The shared `powerPoseIndex` now selects both the visible body and the corresponding source registration for client and authoritative simulation.
- Projectile heads for these60 aliens use the existing animated fire, water, crystal, web, electrical and other species geometry. Ability-card pictures remain in the menu but no longer become static thrown sprites for these categories.
- Dark Matter recovery and Bashmouth ultimate preparation had source crops containing two vertically stacked bodies. Clean existing native preparation/retraction cels replace those visible uses. No native image pixels are resized or regenerated.
- Native tail contact cels replace the added generic whole-body tilt for these categories. Existing ball spinning, slam jump silhouettes, walking/flight, and approved Heatblast/Big Chill/Humungousaur/Rath choreography are preserved.

Damage, prices, card categories, upgrades, progression, cooldowns, mission/reward rules, movement, facing and captured targets remain unchanged. Canonical marker timing is shared by server source and client. The live Worker still needs deployment with the owner's configured credentials.

## Evidence and resuming

`roster.json` lists all60 aliens. `verify.cjs` checks600 directional casts,4800 native draws, immutable combat state, correct category scope, actual rendered pose/source agreement and image-free combat projectiles. Canonical eye/mouth/tail marker pixels take precedence over older generic contact markers. The native-pixel checker evaluates runtime profile overrides, including the two corrected crops, instead of parsing only the base profile literal.

`audit.cjs` steps each real cast at120Hz and saves six timeline samples for every attack. The `powers-review-130` branch retains before/after sheets and ten six-alien batch JSON checkpoints; each batch is committed independently. These are QA screenshots, never gameplay projectile art. Overviews cover all60 aliens. `tracker.json` records per-attack native verification, and the release checkpoint records visual review and final build evidence separately. Resume from fresh main; do not overwrite v12.8 walking or v12.9 repairs from an older branch.

Physical Android phone testing and live Worker deployment remain pending. Six legacy full-art reviews from earlier versions remain separate from this targeted attack/rendering audit.

## Visual review result

All ten overview batches were inspected, covering all60 aliens and300 attacks. Comparing six sampled real-cast poses per attack found40 changed native sequences across24 aliens. Other existing good sequences were retained; animated projectile geometry applies to the selected categories. Approved jump/slam flight silhouettes and ball rolling are intentional exceptions to a power's on-ground contact clip.

Way Big now uses pale-blue cosmic energy to match the existing Ultimate Alien-style body; NRG uses red-orange vent energy. Reference checks: https://ben10.fandom.com/wiki/Way_Big_(Classic) (the notes distinguish Ultimate Alien pale blue from Omniverse green) and https://ben10.fandom.com/wiki/NRG (red radioactive energy through containment-suit vents). These references guide palette choice, not a claim that this game reproduces exact episode footage.

Review source: `powers-review-130` commit175a3b45582e8229199fee523c651236fb5b1d86; latest colour review rerendered only batches0 and3, and retained the eight unchanged reviewed batches. The full before/after character sheets remain on that branch. The final palette-only build must prove all other game/server implementation is byte-for-byte equal to the passed78-command baseline and rerun native/origin/palette checks.
