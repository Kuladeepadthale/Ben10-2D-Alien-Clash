# Plumber Threat Ladder 11.0

The campaign now has 50 sequential opponents. Stages 1–30 retain their IDs and cleared-stage progress; 20 new opponents form stages 31–50. A save that completed the previous ladder can start stage 31 directly. Hero XP, first-clear/replay rewards, collection ownership and card thresholds stay separate and retain existing behavior.

New opponents, in stage order: Argit, Fistrick, Billy Billions, Ssserpent, SevenSeven, EightEight, Sunder, Psyphon, Darkstar, D’Void, Highbreed Commander, Princess Attea, Looma Red Wind, Fistina, Dr. Psychobos, Khyber, Albedo, Aggregor, Eon and Malware. These are fan-game combat adaptations, not extracted TV footage or a claim of identical canonical moves.

All 14 existing villains with melee abilities have new eight-pose character-specific clips: Frightwig, Thumbskull, Limax, Forever King, Enoch, Forever Ninja, Yenaldooshi, the Mummy, Vulkanus, Slix Vigma, the Great One, Kevin 11, Zs’Skayr and Vilgax. Multi-hit attacks use distinct strikes and retractions instead of repeatedly rewinding the whole wind-up. Feet stay registered, and hair, bandages, jaws and tentacles remain connected. Other actions now have explicit recovery. Frequent ranged villains use a lighter characteristic ranged power as their basic attack. New ranged poses exclude the large embedded beam artwork; live effects launch from opaque registered body/weapon markers.

## Art and build provenance

Production art lives in `web/assets/villains-expansion110/`: each new opponent has `actions.webp` and `portrait.webp`; each existing melee opponent has `close.webp`. `manifest.json` records metadata and SHA-256 checksums for every production image. The final prompt set and any correction prompts are in [villain-prompts110.json](villain-prompts110.json). All images were generated with the built-in imagegen tool, then isolated as whole figures and packed into atlases. D’Void’s recoil/KO pair was generated separately to prevent touching figures; Looma uses stronger segmentation seeds to separate antialias contact without cutting her body.

`extend-villains110.py` merges the reviewed assets after restoring the checksum-pinned original 72-alien/30-villain art. It is idempotent and preserves original stage IDs. Full builds also merge after regenerating base villains. New art cannot silently disappear when the verified base assets are restored.

Validation covers all 50 campaign combat kits, real rendering in both directions, registered emitters, melee strike/retraction contacts, saved progress at the old completion boundary, source-image checksums, stage-50 completion, and phone/desktop stage layouts. The existing full game regression suite remains required before APK publication.
