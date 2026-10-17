# Diamondhead movement review — 1.6

The 1.5 rendered sequence exposed leg folding, stretched boots and excessive root movement despite passing script tests. Those tests did not establish visual quality.

## Change

The renderer now cuts rigid articulated layers from the bundled original portrait. It preserves the original resting image and 300:480 proportions. It does not generate a replacement design. Rigid transforms prevent triangle inversion and texture stretching. A forward/backward stance and swing trajectory drives two-bone leg IK; foot pitch, upper-body and arm variations retain the separate 100STYLE motion curves. Stance occupies 60% of each cycle; swing has continuous endpoint velocity and a smooth lift. Starts, stops, changes of direction and combat transitions interpolate numeric joints. Art layers are cached canvases, avoiding the previous per-frame CPU texture rasterizer. Other aliens delegate unchanged.

## Review and checks

Rendered 540 frames at 30 fps with a 120 Hz simulation: 18 seconds covering idle, forward/backward walking, stops, guard, jump/landing and five attacks. Inspected the contact sheet and alpha-component analysis. Largest secondary opaque component: 49 pixels; no large detached limb component was found. Numeric contact checks cover 558 forward and 553 backward consecutive stance intervals after settling, with maximum foot displacement below 0.000001 arena pixels per 120 Hz interval. Rigid transform length/determinant errors remain below 1e-10. These numerical checks do not establish artistic quality.

The reviewed sequence no longer shows the previous mesh-fold and stretched-boot defect. Some knee joins and overlapping outlines remain visible at stronger bends. The single three-quarter illustration cannot supply unseen views, changing hand silhouettes or drawn-through television anatomy. This is an improved test build, not a claim of perfect television animation. Mobile device performance has not been measured here.

The captured recordings, author and CC BY 4.0 attribution remain documented in MOTION.md and the in-game credits. Earlier generated walk-parts assets are historical and not used by the active Diamondhead renderer.
