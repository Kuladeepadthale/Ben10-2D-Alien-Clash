# Resume the character animation review

Canonical branch: `animation-review`. Read `progress.json`, `STATUS.md` and the individual character JSON before changing anything.

All92 characters have individual analysis records. Batches1 and2 are integrated and approved. Keep Big Chill, Humungousaur and the other approved native models.

Next repair batch: **Armodrillo37, Terraspin38, NRG39, Fasttrack40**.

- Armodrillo: replace small shaded combat cels with a coherent high-detail drill-arm model.
- Terraspin: retain turtle head/shell/flippers; separate wind rings from body and preserve flipper spin.
- NRG: keep armored suit and grille emission origin; separate painted radiation and preserve corrected standing-hit/prone-defeat mapping.
- Fasttrack: remove the incorrect tail from every action pose; match the tailless standing feline model.

Remaining repairs and individual findings are in STATUS.md. Do not count needs_revision or in_progress entries as approved. Do not replace deliberate transforms such as Cannonbolt rolling, Goop stretching, Wildvine extending vines or Brainstorm opening his shell.

After each character: save exact prompts/source references, native sheets, portrait, per-frame origins and revision.json; run native-pixel/margin/hash checks, actual240-draw character check and full-browser review; update the individual record; regenerate progress; commit the character checkpoint. Keep review work on animation-review so progress commits do not cancel main APK CI.
