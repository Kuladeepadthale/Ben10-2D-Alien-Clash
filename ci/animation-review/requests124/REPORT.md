# Requested seven-alien animation repairs — v12.4

Wildmutt4, Ripjaws8, Wildvine11, Snare-oh13, Upchuck15, Spitter20 and The Worst60 were reopened for the specific user report. All seven current standing poses retain identical visible pixels, origins and physical heights. Existing unrelated attacks remain intact; Spitter receives a coherent full action set except the preserved standing pose.

- Wildmutt: eight distinct four-paw gait cels with travel-based cadence; native crouch/lunge/recovery ultimate contacts instead of normal-claw substitution. The ultimate stops at its captured strike location.
- Ripjaws: native jaw-first frenzy anticipation, bite/lunge and recovery, with animated aquatic swirl/wake behind the same fish model. It stops at the captured strike position.
- Wildvine: planted-root gestures, growing tapered/thorny/leafy roots and a twisting Overgrowth forest centered on the captured position. Growing/fading geometry matches collision height. Overgrowth does not knock a stationary victim out of its own forest.
- Snare-oh: native wrist release/retraction, animated flat bandage strips in flight, hit-only binding coils and tapered/crisscrossed Royal Bind. Repeated hits extend one wrap without restarting or stacking duplicate wraps.
- Upchuck: eight short-legged waddle poses; Tongue Lash reaches460 game units with four flexible pink strands, extension/contact/retraction and narrow frozen-target collision. Existing spit, burp and ultimate body poses remain intact.
- Spitter: coherent belly, face, spines, tail and side suit throughout walking, jumping, attacks and states. Tail sweep uses actual coiled/forward-contact/recovery poses and a forward tail-tip landmark.
- The Worst: three belly-first anticipation/contact/recovery cels, captured-reach presentation drive and belly registration. Other actions, including the intentional ultimate form, are preserved.

New art uses built-in image_gen with the viewed current portraits as identity references. This is newly drawn cartoon-style game animation, not footage extracted from the TV series. Exact prompts, accepted raw source paths, selected source cells, original reference heights and emitter pixels are retained in ci/animation-review/characters/<slug>.json and <slug>/revision.json. Raw generated WebPs and assembled source atlases are in those character directories. Runtime atlases are in web/assets/reviewed-native/<slug>/.

Validation includes224 native frames, complete source pixels/margins/hashes, seven original standing-image hashes,240 actual native draws per character in both facings, all eight gait cells exercised during real travel, frozen-target tongue hits/dodges, visible root growth, hit-only binding and native tail contact. Browser battle scenes reported zero page errors. Previous manual facing, target capture, power origins, AI pursuit and136 rush/pounce checks pass locally. Final release checks and APK verification will be recorded in last-release.json.

The global review remains resumable. Six other queued repairs remain after this requested batch: Crashhopper49, BallWeevil50, Astrodactyl51, Buzzshock21, Spidermonkey29 and DarkMatter82. Live multiplayer Worker deployment needs owner credentials if those are not configured in releaseCI.
