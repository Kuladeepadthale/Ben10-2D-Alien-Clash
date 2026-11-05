# Batch 02 — character pose artwork

128 new whole-body drawings: XLR8 (AN144-A003), Upgrade (AN144-A006), Stinkfly (AN144-A007), Ghostfreak (AN144-A009). Each has two 16-cell atlases and a 32-frame map.

This batch is uploaded artwork, not completed game integration. Native damage, emitter tracking, move timing and power effects must be wired and tested before enabling it. No AAB or release changed. Existing Grey Matter and Ripjaws walks remain untouched.

Reference: each character's existing classic game portrait. Generation used the built-in image generator. Shared prompt constraints: full-body equal 4x4 cell grid, right-facing, same anatomy and scale, crisp flat classic television cel art, white source background, no duplicate bodies or baked projectiles. XLR8: wheel-foot run, velocity/cyclone/ricochet/Mach-speed body poses. Upgrade: liquid walk, elastic strike, optic beam, tech pulse, overload. Stinkfly: eight wing-beat flight poses, goo/acid aim and release, stinger dive, swarm. Ghostfreak: tail/arm hover, phantom lunge, tentacle lash, spectral pulse, nightmare sweep. Each includes jump/guard/hit/KO artwork.

Source PNGs accompany transparent WebP atlases. `prepare.py` removes edge-connected white backgrounds, records bounds and torso/sole registration. `finalize.py` maps jump/guard/reaction rows and validates frame indices, bounds, constant reference height and SHA256. Some generated pose/model variation remains; exact original-series motion and studio-quality animation are not claimed.

See ../STATUS.md for all 142 characters and resume identifiers. No preview video was made for this batch, as requested.
