# Version 3.1: collection, missions and readable menus

The approved character art, cel animation and combat mechanics are retained.

First launch offers three distinct random classic aliens. The offer saves immediately and does not reroll after closing the app. The player chooses one free alien, then buys others using earned coins. Existing coins and upgrade levels survive the update; existing installations also receive the one-time starter choice. Testing lets players use all ten aliens without spending coins, permanently unlocking them, or earning rewards.

| Alien | Unlock coins |
| --- | ---: |
| Heatblast | 600 |
| Four Arms | 900 |
| Diamondhead | 750 |
| XLR8 | 1,000 |
| Wildmutt | 500 |
| Grey Matter | 450 |
| Upgrade | 850 |
| Stinkfly | 650 |
| Ripjaws | 700 |
| Ghostfreak | 950 |

Battle rewards remain 120 coins for a win or 60 for finishing. Survival pays 40 coins per rival. Mission bonuses: finish 3 battles (120), win 2 battles (150), deal 2,000 damage (150), use powers 10 times (100), defeat 5 Survival rivals (200), own 3 aliens (250), buy 5 upgrades (150). The first five repeat in batches; collection and upgrade milestones are one-time. Mission rewards require an explicit Claim button and cannot be claimed twice for the same progress.

Ownership, saved starter choices, mission counters, claims and coin balance share the existing profile's single localStorage record. Combat entry checks ownership independently of menu buttons. Testing does not contribute damage or power mission progress. Upgrades require permanent ownership, even in Testing. Normal save/storage limitations remain visible in the profile panel.

The Upgrade tab opens a character picker first. Select for battle and Open upgrades are separate actions. The Missions tab exposes rewards, progress bars and coin balance. Menus use larger text and allow scrolling instead of shrinking content to fit short phones.

Validation: `node ci/check-progression.cjs` covers first entry/reload, purchases, ownership guards, Testing isolation, mission claims, picker navigation and legacy saves. `node ci/check-progression-layout.cjs` uses Chromium to check four viewport sizes, readable buttons, scrolling and horizontal text overflow. Existing combat, animation and interface tests remain in the APK workflow.
