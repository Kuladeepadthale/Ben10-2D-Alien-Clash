# Batch 01: Four Arms and Diamondhead

New limited cel-animation artwork using each existing game portrait as the design reference. 32 whole-body drawings per alien (64 total). Walk, basic/combo, three powers, ultimate and reaction poses are mapped in the JSON files. Registration uses a single reference height per character; crouches are not stretched to standing height. Preview renderer draws one body at a time, without crossfades or cutout limbs.

Status: artwork/preview only, not integrated into the game and not live-combat verified. The video is a 32-second silent art review at 1280x720/24fps, with fewer unique character drawings per second. Generated cel variation remains; a series-accurate studio animation claim is not made. Four Arms clap/ground-pound poses and Diamondhead body/uniform continuity need further review before release. No new AAB has been built.

Run `node preview.cjs` with @napi-rs/canvas and FFmpeg installed. JSON points at WebP atlases in the same folder. `prepare.py` regenerates transparent registered WebP sheets from source PNGs.

Generation prompts: Four Arms four-arm heavy walk and alternating four-fist barrage; clap/ground pound/Titan Impact and reactions. Diamondhead grounded walk and shard-release/crystal-blade; spikes/blade/Diamond Tempest and reactions. Existing character portrait is authoritative reference. Flat classic television inked colors, equal 4x4 cells, right-facing, constant scale, full-body, pure white source background. Built-in image generation used.
