# Native animation review — batch4, v12.2

Chamalien41, Eatle42, Clockwork43 and Jury Rigg44 now use coherent32-pose native models and matching portraits. 81/92 characters are approved;11 still need repairs.

Preserves three-eye Chamalien identity, readable cloak and connected tail; Eatle horn charge/uppercut recovery and mouth origins; Clockwork winding-key head and chest-clock origins; Jury Rigg goggles, vest, connected gadget gestures and weapon markers. All power effects remain separate from body artwork.

Built-in image_gen was used. Exact prompts, generation inputs, sources, reference heights and emitter pixels are saved in characters/<slug>.json and characters/<slug>/revision.json. Original accepted sheets and model references remain in those character directories; runtime atlases and portraits are in web/assets/reviewed-native/<slug>/.

Validation:800 reviewed native frames passed source-pixel, margin, detail and hash checks. Each updated model passed240 actual draws across12 states and both facings. Mobile browser review reported zero page errors. Batch4 and earlier choreography, launch, pursuit, manual-facing and frozen-target checks passed. Final release CI:64 passed,0 failed. APK version12.2/code122, pinned signature and launch activity verified. Release metadata, asset sizes and SHA256 digests are recorded in last-release.json.

Next repair batch: Shocksquatch45, Feedback46, Bloxx47, Gravattack48. Preserve all previous repairs and intentional alternate forms. Updated multiplayer engine source was bundled and dry-run checked; live Worker deployment requires owner Cloudflare credentials.
