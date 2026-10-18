# Diamondhead active renderer — 1.8

The joint puppet experiments in 1.2–1.7 are retired. Diamondhead now uses the existing registered drawn-aliens/diamondhead.png atlas and the common alien-poses.js action system, like the other nine aliens. diamondhead-puppet.js only provides the existing startup-ready promise; it installs no draw or emitter overrides.

Diamondhead alone holds six walking poses at a phase divisor of 1.35 instead of 1.1, reducing pose-change frequency by about 19%. It draws a single fully opaque pose without overlapping crossfades, for a clearer silhouette. Standing uses the existing quiet breathing and registered source size. All image-based jump, guard, normal, skill, ultimate, hit and KO paths remain available. Other alien playback is unchanged.

Reviewed 540 rendered frames across 18 seconds of actions. check-diamondhead-poses.cjs verifies six walking frames in both directions, all attack image paths, guard/jump/hit/KO, finite image-based emitters and the absence of the joint renderer.
