# Plumber Threat Ladder

Version 6.0 adds 30 sequential one-on-one Classic villain stages. The campaign appears in mode selection. Choose an owned alien, view the villain's picture and stats, and fight. A win unlocks only the next stage; losses and quitting keep existing progress. Completed stages can be replayed. Enemy health and damage increase with the stage.

Hero Level is independent of campaign stages and starts at 1. Its XP bar and reward history appear on the Hero Rank screen. A completed battle awards 30 XP, with bonuses for winning (50), damage dealt (up to 25), guarded damage (up to 15), and winning with at least 60% health (20). First stage clears add 75 XP; mission claims add 20, alien unlocks 25, and upgrades 10. Testing and quitting award no battle XP. Completion payouts are guarded against duplicate calls.

Both tracks extend the existing local save while preserving coins, unlocked aliens, upgrades and the 32-character roster. Campaign stage labels and Hero Level labels stay separate throughout the interface.

Each villain has a dedicated transparent 16-pose atlas and portrait. `ci/build-villains.py` extracts whole connected poses, packs padded frames and generates combat data. Run it after `ci/build-cels.py`. The Android workflow checks all 30 atlases and their presence inside the APK before publishing.

Validation: `node ci/check-threat-ladder.cjs` covers sequential unlocks, rewards, migration, independent XP, final-stage completion, every villain combat kit and atlas bounds. `node ci/check-threat-layout.cjs` checks all stage detail screens at four viewport sizes using Playwright.
