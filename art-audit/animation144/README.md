# Character animation overhaul

Status: production pending. No replacement release has been built.

Baseline source is preserved on `waste-before-all-character-animation-2026-11-05`. The signed 14.3 release remains unchanged at `playstore-14.3`. Its saved AAB is named `waste-Ben10-Omniverse-14.3-rollback.aab`.

The actual roster contains 92 aliens and 50 villains. `progress.json` records every existing power and ultimate separately. Pending means no new completed animation or review is claimed.

The approved Heatblast preview is a design/walk target, not a complete game animation pack. The game uses ranged Fireball for Heatblast's basic, plus Fireball, Flame jet, Eruption and Inferno storm; the preview punch combo and lift do not replace the existing move semantics.

Before a signed AAB is published, each new character pack needs consistent model/scale registration, species-appropriate locomotion and emitters, animation aligned to simulation hit timing, guard/jump/hit/KO clips, both-facing-direction checks, and visual review. Existing progression, save compatibility and child-directed ad configuration must be preserved. A generic timing or effects patch is not equivalent to completing 142 character-specific animation packs.
