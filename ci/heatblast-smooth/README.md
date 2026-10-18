# Heatblast original-art smoothing

Version 2.1 restores the existing illustrated Heatblast character and action poses.
It uses the bidirectional image interpolation accepted in the original-actions
video, rather than the rejected Blender character/movement pilot.

`build.py` reads the existing `atlas-v8.png` and `registration.json`, removes cell
padding and neighboring-row content, then bakes intermediate images with
`interpolate.py`. Original key images are retained. Occlusion-aware compositing keeps one warped silhouette instead of blending unmatched limbs into transparent duplicates. Intermediate frames are re-registered if flow carries a foot below the source ground baseline. Reverse edges reuse the same
frames in reverse. The 450 frames are packed losslessly into eight WebP atlases
of 192px cells (72 walk frames plus guard, hit, knockdown, jump, landing, walk
entry/exit and all five combat actions).

Generate with Python plus Pillow, numpy and opencv-python-headless:

```
python3 ci/heatblast-smooth/build.py
node ci/check-heatblast-smooth.cjs
```

The runtime selects precomputed sprites only. The original attack timing,
damage, cooldowns, jump physics and other aliens are unchanged. Windup reaches
the original active key at the configured hit time; active beams/ultimate hold
that pose; recovery returns to the original idle. Idle breathing remains tiny.
Each facing direction uses the same artwork mirrored, with matching emitters.

This is an image interpolation implementation, not Shadow Fight/Cascadeur
technology or motion capture. Different source silhouettes and occluded details
can still cause localized deformation between keys. Automated frame/state tests
do not establish studio animation quality; visual review and phone play-testing
remain necessary. Existing character artwork credits continue to apply.
