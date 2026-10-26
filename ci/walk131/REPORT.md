# Walking and jump review — v13.1

Inspected native walk8/jump4 frames for all92 aliens in16 batches. No merged bodies found in native jump frames. The duplicate came from full-character afterimage effects drawn during ground dash/pounce and left visible when the owner jumped. These now render only three short speed strokes on the ground and nothing while airborne; explicit clone powers remain unchanged.

Ground profiles register torso alignment once and fit stride to native foot span with an18% maximum upward adjustment, preserving special species cadence. Approved native walks, Upgrade, flight and skating remain unchanged. All native source artwork is preserved. Readonly travel preview avoids consuming network movement observations.

Runtime verification checks one actor for552 airborne cases,7360 movement renders, native clip preservation, both facings and readonly movement preview. Full release regression runs before APK packaging. Phone testing remains pending.
