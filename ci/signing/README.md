# Stable development APK identity

This repository contains a **development-only test signer**, with the standard Android debug alias/password. This is intentionally not a secret or a production/Play signing identity. Do not replace it between test APK releases. Use a securely managed production signer and a planned migration for a production distribution.

The old workflow tried to cache ~/.android/debug.keystore, but the cache restore missed and the post-job save reported a missing path. New runner-generated signing keys consequently broke Android update compatibility. A successful APK signature verification alone does not prove that it matches an older installation.

ci/prepare-test-signing.py restores the exact checked-in test keystore to android/ci-signing/alien-clash-test.jks and verifies its pinned certificate. Gradle explicitly uses that file. Missing/corrupt material must fail; do not silently generate another key. ci/check-apk-signing.py checks both APK certificates, application IDs, version codes and launch activities.

## Installation choices in 7.8

- Ben10-Alien-Clash-Online.apk installs as **Ben 10 Alien Clash Online**, package org.alienclash.twod.online. It can coexist with the old org.alienclash.twod app and leaves its private data untouched. This is the recommended route when an older build reports a signing conflict.
- Ben10-2D-Alien-Clash.apk retains org.alienclash.twod. It is for a fresh installation or a future update already using this pinned signer. It cannot update an older differently signed installation merely because its version number is larger.
- Both variants include the same game, Firebase project and default multiplayer endpoint. Subsequent Online APKs must retain both the .online package ID and the pinned signer so ordinary updates work.
- The old private signing keys were not persisted by the failed cache mechanism. They cannot be recovered from an APK certificate. No claim is made that 7.8 updates an old differently signed app in place.
- App-private data does not migrate between package IDs. A guest save stays in the old app. A cloud-synced email account can be signed into in the new app to restore its cloud save. Open the old app and Sync Progress first if it supports accounts; otherwise keep it installed for access to its guest progress. Do not uninstall or clear its data as part of this workaround.

Pinned test certificate SHA-256: a52a570180898607ffdf736b6189244b73b2c1666ba5a63b34cd7015773c8a94
