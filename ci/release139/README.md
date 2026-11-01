# Compact game interface — 13.9

- Removes the duplicated lobby rail; the bottom navigation remains the main menu.
- Reserves a separate 42px Play action below the home portraits. Automated overlap checks use three occupied slots on 932×430, 667×375 and 360×800 layouts.
- Hides page-size headings and redundant instruction blocks while preserving character/mode names, actual form labels and error feedback.
- Gives each mode a sibling information button, with rules shown in a dismissible dialog. The information action cannot start the mode. Android/browser Back closes the dialog.
- Displays three larger full-body alien cards across in landscape, two columns in portrait, with category and ownership symbols. Portrait canvases are upgraded only when near view.
- Keeps the three-pack lane and 15-card result lane. Diamond prices use the same image icon as the wallet. All gem/ad/copy requirements and receipt handling are unchanged.
- Adds a selected-alien profile portrait, compact metrics and XP meter. Existing authentication and backup handlers remain intact.

Base assets come from signed 13.8. Reachability cleanup remains enabled; no discarded old art is reintroduced. Combat movement, walking, attack animations, native ads settings and saved-progress formats are unchanged.

Validation: phone/landscape screenshots and overlap checks; existing pack/receipt/reroll regression; info-dialog navigation checks; all alien/enemy/ability/home-pose assets; APK/AAB asset hashes and original-key signatures. Physical-device testing remains separate.
