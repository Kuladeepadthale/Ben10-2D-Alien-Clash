# Alien cartoon animation progress

One alien at a time. Save each revision to GitHub. Do not build APK/AAB until requested.

## Required art approach

The user rejected the simplified procedural/vector Wildmutt redesign on 31 October 2026. That renderer is no longer loaded. Future aliens must preserve the detailed existing cartoon identity using generated animation drawings, enough distinct poses and careful registration/timing. Do not repeat the simplified rig approach.

| Alien | Current revision | Coverage | Status |
| --- | --- | --- | --- |
| Wildmutt (4) | `web/wildmutt-detailed.js`, data script, four lossless atlases under `web/assets/wildmutt-detailed/` | 64 generated drawings: 16 gait; 8 basic combo; 8 Claw flurry; 8 pounce; 8 lunge; 8 Apex Hunt; 8 breathing, guard, recoil and defeat. Jump/dash use the matching movement drawings. | Detailed replacement implemented. Local 2,880-sample renderer checks passed. GitHub browser integration checks passed in all 24 action/facing combinations. Player visual approval pending. |

Use `ci/animation-review/wildmutt-detailed/README.md` for source, calibration and resume details. The previous 2,160-pose rig checks describe a rejected historical implementation, not the active renderer.

Fixed sheet calibration preserves physical size across an action. Register shoulder and foot anchors; never enlarge a crouch or lying-down pose to fill an upright box. One body per frame, no ghost crossfade. Preserve simulation timing and facing. This is newly generated cartoon artwork, not TV footage.

Next alien: awaiting user name. No other alien is marked completed.

The eventual release must copy both detailed scripts, all four atlases and current index. Keep the rejected rig unloaded. Existing package/reward/ad settings are unchanged by this art revision.

[Passed detailed-frame and released-engine review](https://github.com/Kuladeepadthale/Ben10-2D-Alien-Clash/actions/runs/41230257851).
Active art implementation: `4f9876f3ab2eefba39bed8da00ad5de4ab047cfc`.

## Wildmutt playback refinement — 1 November 2026

Revision 3: corrected neutral scale calibration, one flat-floor pixel baseline, bounded display-resolution frame cache, physical-distance gait independent of render rate, and shorter recovery holds. Added smooth.cjs checks for 30/60/120 Hz cadence, no knockback-driven stepping, integer drawing coordinates, one floor row and no warm-gait surface allocation. Detailed generated art is retained. Phone/player visual approval remains pending. No APK/AAB requested or built.


## Wildmutt revision 4: unique power choreography

Earlier detailed 16-cel walk retained at the user's request. Four new 16-cel power sheets add 64 newly drawn poses: pounce launch/reach/landing; three different claw swings; ground-hugging jaw lunge; five-part Apex Hunt with rake, bite, hammer, double thrust and slam. 128 atlas entries, 96 currently used drawings; old power entries retained only for history/old jump references. One constant physical scale per sheet from its neutral pose, never per-pose fit-to-bounds scaling. Single-body pixel cache and facing preserved; damage, hit counts, cooldowns and movement simulation untouched.

Local renderer checks and CI engine integration passed: https://github.com/Kuladeepadthale/Ben10-2D-Alien-Clash/actions/runs/41233121126 . Source revision b529e1086b13471ab137776536e47ba606dd8495. User visual approval and real Android performance review remain pending. No APK/AAB produced.



## Wildmutt revision 5: walking stride (1 November 2026)

User accepted revision 4 powers; preserve them. New 8 walking key drawings + 8 in-betweens replace the earlier walking clip. One full cycle covers 1.2 times rendered body height, with two alternating forepaw steps; actual displacement chooses each pose. No timed gait advance at a wall/while stopped. Current model step = 80.94 world pixels, about .249 seconds at 325 px/s. Scale remains constant per source sheet. Local 2880-state renderer, cache/cadence, four-power choreography and multi-speed/direction stride checks passed. Browser CI pending. Generated art needs user visual approval, and phone performance remains unverified. No APK/AAB built.
