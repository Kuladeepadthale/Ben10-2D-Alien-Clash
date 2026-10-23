# v11.6 — Home, battle cards and combat corrections

## Home
Filled portals show the alien and its name without an add button. Tap the alien to change its pose or character; tap its name to select it for battle. Empty portals retain the plus button. A small star beside each filled alien name uses the existing category color and exposes the category name to accessibility tools.

## Battle selection
Every main mode uses its own existing illustration with `object-fit: contain`, preserving the whole composition. Portrait keeps the five fitted choices. Landscape uses large horizontal cards with native swipe scrolling, scroll snapping, arrow-key support and a swipe hint. This avoids squeezing the full illustrations into small landscape tiles.

## Combat audit and fixes
Reviewed idle, normal, three skills, ultimate, hurt and defeat artwork across all92 aliens. Exercised all12 action states in both directions (15456 native cel draws), all460 normal/skill/ultimate paths and close combat strike/retraction cadence.

- NRG: source hurt and defeat poses were swapped. A surviving hit now uses the standing recoil; the prone pose is reserved for defeat.
- Eatle: the high resolution jump/strike sheet used the lower resolution state-sheet reference height, doubling its size. Both sheets now share consistent physical registration.
- Bashmouth and Dark Matter: corrected combat-sheet registration and oversized individual frames. This reduces unnecessary texture enlargement and size/clarity changes between attacks. Corresponding power origins use the same scale correction.
- Enemy AI: evaluates the selected attack's reach before committing, including ultimates. Close-range fighters use forward dashes to close large gaps instead of wasting time casting unreachable melee attacks. Player movement/facing stays under player control.

Native artwork is preserved; this update corrects pose selection and rendering registration rather than replacing the complete roster's animation artwork. Existing transforms, crouches, tail strikes and character-specific motions are retained.

Validation includes92 enemy pursuit/reachable-attack cases,33 melee users, corrected hurt/KO selection, body-size bounds, emitter checks, full combat/regression suite and four viewport UI checks. Existing home assignment tests now verify only empty slots have plus buttons and filled slots remain editable.
