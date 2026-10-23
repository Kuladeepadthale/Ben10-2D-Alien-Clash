# Resumable character animation review

Start from `progress.json`, not from chat recollection. It lists all92 characters, their batch, status, findings, changed files and validation. Read the per-character record before resuming work.

- Batch size:4 characters. Water Hazard first; user-approved Humungousaur and Big Chill are reference checks, not automatic redraw targets.
- Save an individual Git checkpoint after each character's analysis and again after verified changes. `[art-audit]` commits intentionally skip APK builds until a batch is ready.
- Status meanings: `pending`, `in_progress`, `needs_revision`, `verified_unchanged`, `verified_updated`. Only the last two count as completed.
- A review must inspect every native frame, all12 action states, both facings, constant model identity/body registration, correct hurt vs KO, attack cadence, power sources and transition back to idle. Do not mark a character finished from a contact-sheet glance alone.
- Preserve character-specific movement (wings, tails, claws, rolling, hovering) rather than imposing a generic punch/walk. Do not silently replace approved art.
- New pose assets must use one consistent character reference, transparent full-body cels, enough native pixels, no limb cutting and separate gameplay effects. Keep original generation prompts in the character record.
- Validate actual in-game transitions and emitters, not only file dimensions. Save inspection images internally; save user-facing previews only when requested.
- When resuming after interruption, finish the current character, update its record and progress, then proceed to the next pending entry. Do not redo verified characters without a new finding.
