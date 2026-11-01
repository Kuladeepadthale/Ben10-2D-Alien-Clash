# Lossless package cleanup — 13.8

Baseline: signed 13.7 APK, SHA-256 `569e0a4f9cd2cd59dc5faa1f15f1768c76dec2bf6b2a48c7c835bf256a53afad`.

The cleanup follows references from the deployed `index.html`, including scripts loaded later, inline animation registries, CSS/SVG references and dynamic asset directory prefixes. Unknown unbounded asset prefixes stop the build. Historical repository sources remain available; unreachable files are excluded from the APK/AAB.

The initial plan excludes 158 files / 63,954,519 uncompressed bytes. Most are replaced native animation sheets, disabled walk modules and build-only manifests. No retained image, animation data, runtime script or style is recompressed or modified. SHA-256 checks before pruning and inside both packages prove retained bytes are identical. Download size savings are measured separately after signing.

Validation includes reachability edge cases, existing phone layout and pack economy tests, all 92 alien sheet sets, all 50 enemy sheet sets, all 23 ability atlases and 460 home pose requests. Native package name, signing identity, ad implementation and saved-progress format remain unchanged. Version code increases to 138. Physical device testing is not performed by the browser checks.

The build release includes a machine-readable list of every removed path, retained-file hashes, browser results, signatures and bundle validation.
