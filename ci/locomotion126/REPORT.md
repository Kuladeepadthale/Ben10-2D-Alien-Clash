# v12.6: full locomotion review

Scope: all 92 playable aliens and all 50 battle villains. This is a movement-only review; it does not erase the earlier full-action review's six remaining character-art issues.

Inspected every native movement sequence (886 registered walk entries) in the 18 internal sheets, and the existing flight-ready poses before choosing replacements. Every character has distinct movement art; no image generation or replacement of approved standing/attack artwork was needed.

## Fixed

- First-sample movement loss could discard every small isolated tap, leaving a fighter sliding on one pose. The simulation now records actual normal-movement distance, and rendering consumes each increment once. Older online snapshots and preview actors retain a measured-position fallback. Movement still stops at blocked arena edges, and dash/teleport displacement does not accelerate a walk cycle.
- Actual position movement is recognized if a snapshot's movement flag is stale. Standstill does not run a time-based walk loop.
- Jetray and Astrodactyl use their native airborne glide poses in movement, Lodestar levitates in his native upright pose, and Ultimate Echo Echo uses a native airborne pose. Idle/portrait/attack cels remain separate. No new body art, limb warping or crossfade was introduced.
- All villains use real travel and physical size for native step cadence. Their distinct source steps are preserved. Zs'Skayr retains spectral hovering; human hypnotists/magicians no longer float simply because their power type is `phase`. Crab scuttles, fluid movement and Ssserpent's slither retain their native body drawings.
- Flyers, ghosts, fluid bodies and slithering bodies do not emit generic walking dust. Hovering body offsets and power origins share the same source correction. Server source includes the same helpers for matching ranged origins.

## Preserved

All original native sprite/standing pixels, palettes, combat move definitions, manual facing, directional dashes, captured attack targets, existing progression and saves. Big Chill, Humungousaur, Four Arms, Cannonbolt, Wildmutt and the other approved walk sequences keep their existing drawings and stride styles. The six earlier full-art revisions still queued remain explicitly recorded in ci/animation-review/progress.json.

## Evidence

- ci/locomotion126/characters/: individual saved analysis and runtime result for all 142 characters.
- audit.json: raw native pose counts, silhouette/foot variation and review scope.
- runtime.json: 12,784 actual native draws across 92 aliens and 50 villains, short taps, standstill, facings and attack transitions. The final release also checks stale movement flags.
- Flight options inspected in previews/flight-options.webp before selecting existing poses.
- Full existing release checks remain enabled. No physical Android device playtest is available. This is game animation inspired by the series, not extracted television footage or a claim of identical series animation.

Keep checkpoints and change only characters with a new demonstrated issue. Run python3 ci/locomotion126/audit.py then node ci/locomotion126/verify.cjs after restoring actual verified assets. Release publication must succeed before announcing a new APK link.
