# Resume the character animation review

Canonical branch: `animation-review`. Read progress.json, STATUS.md and individual character JSON before editing.

All92 characters have analysis records. 86 characters approved,6 queued repairs remain. The v12.4 requested batch repairs Wildmutt4, Ripjaws8, Wildvine11, Snare-oh13, Upchuck15, Spitter20 and The Worst60. See requests124/REPORT.md and per-character records. Their original standing images, physical heights and origins remain exact. Preserve all prior batch1–5 fixes, manual facing, captured targets, native predator ultimates, growing/fading root collision, hit-only bindings,460-range tongue strike, forward Spitter tail contact and bounded belly presentation drive.

Next repair batch: **Crashhopper49, BallWeevil50, Astrodactyl51, Buzzshock21**. Final queued repairs: Spidermonkey29, DarkMatter82.

For each character: use identity reference; save exact prompts and raw accepted sources; pack 32 body-only native cels plus matching portrait; register actual species emitters and correct physical reference sizes. Reject clipped poses. Run native source-pixel, margin, hash and emitter checks; 240 actual native draws in both facings; inspect browser. Mark verified only after all checks pass, regenerate progress and commit the checkpoint to animation-review before beginning another character. Do not erase intentional forms such as Cannonbolt rolling, Goop stretching or Brainstorm shell opening.

Release data is in last-release.json. Do not claim a new APK is available until the main build and release publication succeed. Live multiplayer Worker deployment needs owner Cloudflare credentials.


## v12.6 locomotion checkpoint

All92 alien and50 villain movement sequences now have saved native/runtime analysis in `ci/locomotion126/`. Release evidence and verified download links are in `ci/locomotion126/last-release.json`. The full-art review's six remaining issues are unchanged; do not confuse movement verification with complete new action art. Keep the v12.6 cadence/flight fixes from main when resuming the older animation-review branch. No new character drawings were generated for this movement pass.

## v12.7 requested power checkpoint

Published android-13ec642d1d59 from `13ec642d1d590fe53e36413e96fd8107247e6fc3`; run 40208350995/job 121214163822 succeeded. Download and SHA-256 evidence: `ci/powers127/last-release.json`. All 20 listed powers across Echo Echo, Brainstorm, Goop, Nanomech, Fasttrack, Crashhopper, Bullfrag and Surge have native render/collision verification; five visual timeline sheets and a resumable review workflow are saved in `ci/powers127/`. Four new native Crashhopper guard poses, corrected Bullfrag mouth markers, spaced native Xerge helpers, and captured-point combo stops are included. Goop Elastic Strike uses and advertises reach390. The full 75-check baseline at8dd43ce0e7a8 passed; final metadata-only correction has exact-diff guard and focused revalidation. Start future changes from fresh main, preserving the v12.6 gait improvements and v12.7 requested-powers127.js hooks. This targeted repair does not mark all remaining full-art reviews approved. Phone testing and live Worker deployment remain pending.
