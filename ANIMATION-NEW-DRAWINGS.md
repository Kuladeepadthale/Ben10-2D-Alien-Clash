# New drawings imported from November 5

Batch 01 integrates the saved FourArms-Diamondhead-Animation-Source.zip artwork:
Four Arms and Diamondhead, 32 full-body drawings each (64 total), four transparent
lossless WebP atlases. No image generation was run again for this import.

The final renderer selects the new drawings for idle, distance-based walk,
basic, three powers, ultimate, guard and hit. Each render draws one complete body;
the hand emitter uses the selected cel's registration and current facing.
The existing native jump, dodge and defeat sequences remain, since the preview
source's jump/KO labels reused attack or kneeling poses. Titan Impact uses its
airborne cel during flight. Training and battle share the same renderer.

Alien details identify these two as **New drawings · Batch 01 · 32 poses**.
Other aliens retain their prior identifiers. The 80 profiles in Animation
14.4 through 14.13 are existing-art combat timing changes, not 80 new artwork sets.
No additional replacement source packs for those batches were found among the
saved November 5 files. Heatblast is a separate earlier source pack and is not
counted as imported in this batch.

Validation: `node ci/check-redrawn-batch01.cjs` with @napi-rs/canvas renders
1,080 samples across all integrated actions in both directions and checks body
visibility, emitter direction, fixed scale, atlas bounds, distance-based walking,
native fallback states, villain isolation and the detail identifier. The Android
workflow explicitly copies these files into the packaged web assets.

This is limited generated cel artwork, not animation extracted from the series.
Source pose/design variation remains. Physical Android play-testing and a new
signed Play AAB have not been completed by this import.
