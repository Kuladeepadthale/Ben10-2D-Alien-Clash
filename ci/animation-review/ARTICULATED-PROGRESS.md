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

User accepted revision 4 powers; preserve them. New 8 walking key drawings + 8 in-betweens replace the earlier walking clip. One full cycle covers 1.2 times rendered body height, with two alternating forepaw steps; actual displacement chooses each pose. No timed gait advance at a wall/while stopped. Current model step = 80.94 world pixels, about .249 seconds at 325 px/s. Scale remains constant per source sheet. Local 2880-state renderer, cache/cadence, four-power choreography and multi-speed/direction stride checks passed. Browser CI passed: https://github.com/Kuladeepadthale/Ben10-2D-Alien-Clash/actions/runs/41234687728 . Ground-displacement guard also ignores a ticking input gait counter while blocked; local stride/cache/state/choreography checks pass. Generated art needs user visual approval, and phone performance remains unverified. No APK/AAB built.


## Grey Matter — detailed revision 1 (1 November 2026)

Analysed id 5's original portrait, existing cel clips, gadget kit, render scale, hit states, cast timing and emitter registration. Added 80 new detailed drawings across five lossless atlases: 16-cel distance gait; basic palm/jump poses; shock aim/recoil; trap placement/remote; grenade throw; six-command Unite; guard/hit/defeat. Constant per-sheet neutral scale and single-body rendering; origins follow reviewed muzzle/release coordinates. Damage, cooldowns, game movement, ads and other characters unchanged. Wildmutt approved revisions preserved.

Local 2,880 state/facing renders and cache/cadence/floor checks passed. Browser integration passed with Wildmutt and Grey Matter loaded together: https://github.com/Kuladeepadthale/Ben10-2D-Alien-Clash/actions/runs/41236231154 . Source revision aef20b9eb87776d0eb7255f2fa3c05bba57e8b88. Await user visual approval and Android test; no APK/AAB built. Resume the next named alien only after the user's instruction. Art/source review notes: `ci/animation-review/grey-matter-detailed/README.md`.


## Grey Matter revision 2 — walking leg alternation (1 November 2026)

User approved powers but rejected the walking sheet because one leg remained in front. Replaced walking presentation with newly generated detailed upper-body and leg cutout artwork. Near/far legs have independent hip/knee/ankle motion, half-cycle offset, constant segment lengths and planted-foot world registration. Six limb textures plus one upper body; no full-body duplicate. Actual distance drives phase, with a raised passing-foot arc and subtle weight shift. Approved attack, gadget and other-state atlases/code untouched. Existing Wildmutt unchanged.

Local tests passed: anatomical near/far exchange, fixed world-foot stance at 3 speeds × 3 frame rates × 2 directions, constant bone lengths, independent swing, single upper body and approved attack fallback. Existing state/cadence/cache tests also pass. Browser integration passed: https://github.com/Kuladeepadthale/Ben10-2D-Alien-Clash/actions/runs/41237621755 . Source revision be2876fc961dbc6842903d386aac113f4f0817ae. New preview shows slow/game-speed/left-facing motion and stop. Await user visual approval and phone performance test; no APK/AAB built.
