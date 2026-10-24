# Native animation review — batch5, v12.3

Shocksquatch45, Feedback46, Bloxx47 and Gravattack48 have32 coherent body-only native cels and matching portraits. 85/92 characters approved;7 repairs remain.

Built-in image_gen generated the artwork from viewed shipped identity references and accepted native idle models. Exact prompts, the Feedback two-plug correction prompt, generation inputs, reference heights and registered emitter points are saved in each character JSON/revision.json. Accepted raw sheets and model references are in ci/animation-review/characters/<slug>/; five runtime WebPs per character are in web/assets/reviewed-native/<slug>/.

928 reviewed native frames passed complete source-pixel, margin, detail and hash checks. Each updated character passed240 actual draws over12 states and both facings. Four mobile browser battle previews reported zero page errors. Distinct gold finger versus upper head-plug origins, visible core registration and native Feedback rush are covered by batch5 regressions. Prior sonic deployment,136 rush/pounce combinations, all92 enemy pursuit and species origins passed locally. Final release CI/APK metadata will be recorded in last-release.json.

Next batch: Crashhopper49, BallWeevil50, Astrodactyl51, Ripjaws8. Remaining afterward:21,29,82. Preserve intentional alternate forms and all earlier repairs. Live multiplayer Worker deployment still needs owner Cloudflare credentials.

Final release:66 checks passed,0 failed. APK12.3/code123, pinned signer and launch activity verified; metadata and SHA256 digests are in last-release.json.

Saved runtime directories and exact prompts:
- `web/assets/reviewed-native/shocksquatch/`; `ci/animation-review/characters/shocksquatch.json`
- `web/assets/reviewed-native/feedback/`; `ci/animation-review/characters/feedback.json`
- `web/assets/reviewed-native/bloxx/`; `ci/animation-review/characters/bloxx.json`
- `web/assets/reviewed-native/gravattack/`; `ci/animation-review/characters/gravattack.json`
