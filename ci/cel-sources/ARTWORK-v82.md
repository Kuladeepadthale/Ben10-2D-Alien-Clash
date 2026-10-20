# Alien Force artwork refresh — v8.2

Created with the built-in image generation tool, then reviewed as native transparent sprite sheets. The earlier 32-pose masters used approximately 147–213px-tall idle bodies; the replacement idle bodies are 361–471px tall. The 22 earlier aliens retain their existing action art. Portrait exports now preserve up to 640×800 native pixels, and saved-pose caching retains larger source crops.

## Saved source paths

- `ci/cel-sources/swampfire-walk-v82.png`
- `ci/cel-sources/swampfire-jump-strike-v82.png`
- `ci/cel-sources/swampfire-powers-v82.png`
- `ci/cel-sources/swampfire-states-v82.png`
- `ci/cel-sources/echo-echo-walk-v82.png`
- `ci/cel-sources/echo-echo-jump-strike-v82.png`
- `ci/cel-sources/echo-echo-powers-v82.png`
- `ci/cel-sources/echo-echo-states-v82.png`
- `ci/cel-sources/humungousaur-walk-v82.png`
- `ci/cel-sources/humungousaur-jump-strike-v82.png`
- `ci/cel-sources/humungousaur-powers-v82.png`
- `ci/cel-sources/humungousaur-states-v82.png`
- `ci/cel-sources/jetray-walk-v82.png`
- `ci/cel-sources/jetray-jump-strike-v82.png`
- `ci/cel-sources/jetray-powers-v82.png`
- `ci/cel-sources/jetray-states-v82.png`
- `ci/cel-sources/big-chill-walk-v82.png`
- `ci/cel-sources/big-chill-jump-strike-v82.png`
- `ci/cel-sources/big-chill-powers-v82.png`
- `ci/cel-sources/big-chill-states-v82.png`
- `ci/cel-sources/chromastone-walk-v82.png`
- `ci/cel-sources/chromastone-jump-strike-v82.png`
- `ci/cel-sources/chromastone-powers-v82.png`
- `ci/cel-sources/chromastone-states-v82.png`
- `ci/cel-sources/brainstorm-walk-v82.png`
- `ci/cel-sources/brainstorm-jump-strike-v82.png`
- `ci/cel-sources/brainstorm-powers-v82.png`
- `ci/cel-sources/brainstorm-states-v82.png`
- `ci/cel-sources/spidermonkey-walk-v82.png`
- `ci/cel-sources/spidermonkey-jump-strike-v82.png`
- `ci/cel-sources/spidermonkey-powers-v82.png`
- `ci/cel-sources/spidermonkey-states-v82.png`
- `ci/cel-sources/goop-walk-v82.png`
- `ci/cel-sources/goop-jump-strike-v82.png`
- `ci/cel-sources/goop-powers-v82.png`
- `ci/cel-sources/goop-states-v82.png`
- `ci/cel-sources/alien-x-walk-v82.png`
- `ci/cel-sources/alien-x-jump-strike-v82.png`
- `ci/cel-sources/alien-x-powers-v82.png`
- `ci/cel-sources/alien-x-states-v82.png`

## Prompt set

Each sheet was generated as eight transparent whole-body sprites, arranged four columns by two rows, with crisp black outlines, flat cartoon cel shading, consistent character proportions, 30px clear gutters, no captions, no clipping, no backdrop and no detached attack effects. Target landscape size was 2048×1024; delivered native sizes were validated without artificially enlarging frames. All sprites face right in three-quarter side view. Walking sheets establish the model reference for the other three groups.

Character model specifications:

- **Swampfire**: green living wood plant humanoid, black chest, bright red flame-petal head, green eyes and white hourglass chest badge. Abilities referenced: Fire seed, Vine lash, Root eruption, Wildfire bloom.
- **Echo Echo**: small white robot-like humanoid, round white helmet with black circular ear speakers, green eyes, black face and suit seams, green hourglass chest badge. Abilities referenced: sonic blast, sonic clap, echo pulse, sonic overload.
- **Humungousaur**: huge muscular brown dinosaur humanoid, tan chest and belly, thick brown tail, green eyes, broad reptile face, clawed hands and feet, green hourglass chest badge. Abilities referenced: heavy punch, ground slam, tail sweep, titan smash.
- **Jetray**: slender red manta-ray humanoid, yellow wing membranes from wrists to torso, yellow chest, yellow head horns, green eyes and chest badge, red tail. Abilities referenced: neuroshock beam, flying strike, aerial shot, neuroshock storm.
- **Big Chill**: slender blue and black moth humanoid, green eyes, dark face inside blue hood, long blue folded wing cloak, black limbs with cyan segments, green hourglass chest badge. Abilities referenced: ice breath, frost strike, freeze wave, absolute zero.
- **Chromastone**: purple rock humanoid with magenta crystal spikes on shoulders and head, single green eye, dark purple segmented limbs, green hourglass chest badge. Abilities referenced: energy beam, crystal strike, energy wave, prismatic burst.
- **Brainstorm**: orange crab alien with four pointed legs, two large orange claws, orange hinged skull shell revealing pink brain when open, green eyes, black-and-white chest stripe with hourglass badge. Abilities referenced: electric bolt, claw strike, brain storm, cerebral tempest.
- **Spidermonkey**: blue fur spider-monkey humanoid with FOUR arms, long curled blue tail, black torso and face markings, green multiple eyes, white hourglass chest badge. Abilities referenced: web shot, four-arm strike, web trap, web cyclone.
- **Goop**: lime green translucent elastic slime humanoid, long soft fluid arms and legs, green eyes, small silver antigravity UFO hovering closely above head, black-and-white hourglass torso badge. Abilities referenced: slime shot, elastic strike, acid splash, slime storm.
- **Alien X**: black cosmic humanoid body filled with tiny white stars, thin clean white silhouette outline, green eyes, two forehead horns, strong white jawline, green hourglass chest badge. Abilities referenced: cosmic orb, celestial strike, gravity wave, reality burst.

Required pose order:

- **walk**: 8 distinct sequential WALKING cycle keyframes. Alternate leading legs and arm swing over a full cycle, all grounded. No attack poses.
- **jump-strike**: Cell order left-to-right top-to-bottom: 1 crouch preparing jump, 2 takeoff spring with knees extending, 3 airborne tucked knees, 4 crouched landing, 5 basic punch windup, 6 strong forward basic strike fully extending limb to right, 7 strike follow-through, 8 strike recovery.
- **powers**: Cell order left-to-right top-to-bottom: 1 FIRST power preparation, 2 FIRST power casting/contact pose, 3 FIRST power recovery, 4 SECOND power windup, 5 SECOND power contact/casting, 6 SECOND power recovery, 7 THIRD power windup, 8 THIRD power release. No detached projectiles, beams, web strands or particles: character anatomy only; gameplay draws effects separately.
- **states**: Cell order left-to-right top-to-bottom: 1 ULTIMATE power windup, 2 ultimate maximum exertion pose, 3 ultimate recovery, 4 upright neutral HERO IDLE stance, 5 defensive GUARD blocking, 6 recoiling HIT reaction, 7 lying whole-body KNOCKOUT pose, 8 crouched forward DASH pose. No detached power effects; gameplay draws those separately.

Swampfire's walk sheet used the existing `swampfire-master.png` as its design reference. Other walking sheets used the model specifications above. Each remaining action group used that alien's new walk sheet as an identity and style reference, while explicitly requesting eight new action poses in the given order. Unselected trial images are not used by the game.

## Verification

All 40 source sheets were checked for eight separable whole poses; exported frame counts, transparent margins, source pixel preservation, source detail minimums and gameplay checks run in Android CI. Asset loading uses an artwork version key so updates cannot reuse the old cached images. Active battle textures remain limited to the two fighters; the pose cache holds at most eight crops.

