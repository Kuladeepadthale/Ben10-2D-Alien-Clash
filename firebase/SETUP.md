# Activate email accounts and cloud progress

Version 7.4 includes the finished welcome/account screens, guest mode and Firebase REST integration. **The shipped configuration is disabled. Email login and cloud restoration are not live until you connect your own Firebase project.** Guest play works offline and existing progress is preserved.

## Firebase console

1. Open https://console.firebase.google.com/ and create a project. Register a **Web app** in Project settings to obtain its public client configuration. The Android game uses REST from its bundled WebView; it does not require a service-account file or a server secret.
2. Open **Authentication → Sign-in method → Email/Password** and enable it. Review the verification/password-reset email templates. Choose a password policy consistent with the app's minimum of 8 characters.
3. Open **Firestore Database**, create a **Standard / Native mode `(default)` database**, and choose a region. Start in **production mode**.
4. In **Firestore → Rules**, replace the rules with the exact contents of [firestore.rules](firestore.rules) and publish. These rules allow a signed-in UID to access only its own `gameSaves/{uid}` document; listing every player's save is denied. Keep these owner checks. Do not use public read/write or test-mode rules.
5. In the repository file `web/account-config.js`, set:

   ```js
   window.OMNI_ACCOUNT_CONFIG = Object.freeze({
     enabled: true,
     apiKey: 'YOUR_PUBLIC_FIREBASE_WEB_API_KEY',
     projectId: 'YOUR_FIREBASE_PROJECT_ID'
   });
   ```

   These are Firebase's **public client identifiers**. Never add a Google password, Firebase Admin key, service-account JSON/private key or GitHub token to this file or send them in chat.
6. Commit that change to `main`; the Android workflow builds a new APK. Install the new APK over the existing app. Do not uninstall if you need to keep a guest save.
7. Test with two devices: sign up on the first device, finish a battle, open **Account → Sync Progress**, then log in on the second device. Confirm coins, diamonds, aliens, poses, Hero XP, missions and Threat Ladder progress restore. Verify password reset using an email address you own. The build tests use mocked Firebase responses; only this live-project test verifies your deployed rules/provider/configuration.

## What the app does

- Guest mode keeps progress only on that installation. It does not promise cross-device guest recovery.
- Signup can link the current guest save. A separate guest backup remains when a player logs out.
- Login uses the Firebase UID, not an email-address document path, to isolate saves.
- Passwords are sent only to Firebase Authentication over HTTPS; the app never saves passwords in profiles, local storage or cloud save documents.
- Android session tokens are encrypted using an app-specific Android Keystore AES-GCM key. The browser preview uses private-origin local storage for its test session.
- Cloud writes are debounced to at most one scheduled upload every 15 seconds while playing. Local progress is saved immediately even without a connection. Manual Sync is available in Account.
- Token refresh rotates the stored session. An expired/revoked login keeps local progress and asks the player to sign in again.
- Writes use Firestore `updateTime` preconditions and revision checks. A stale phone cannot silently overwrite a newer cloud save. If saves differ, the player chooses Cloud Save or Device Save; an account-specific device backup is retained. Saves are not combined, and currency is not duplicated.
- No email is sent by merely opening the game. Verification/reset email requests occur only when the player invokes those actions after configuration.
- Existing installations see the welcome choice once after this update; choosing Guest preserves their current save.

## Before distributing an account-enabled build

The app is an offline-capable game with client-owned progress. The rules protect one player's save from other accounts; this is not a server-authoritative anti-cheat/economy backend. Do not use these balances for real-money rewards or a trusted competitive leaderboard without a separate server-authoritative design.

Configure your Firebase project policies and quota/budget alerts in its console. No billing account, project, user or cloud database has been created by this repository change.

## Sources

- Firebase Auth REST endpoints: https://firebase.google.com/docs/reference/rest/auth
- Firebase-authenticated Firestore REST requests: https://firebase.google.com/docs/firestore/use-rest-api
- Atomic writes/preconditions: https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/commit
- UID-based rules: https://firebase.google.com/docs/firestore/security/rules-conditions

## Welcome art

The welcome background is embedded in `web/account.css`, generated with the built-in imagegen tool and optimized as WebP for offline display. The prompt requested classic Heatblast, Diamondhead, Four Arms and XLR8 in a neon-green Plumber outpost, characters on the left and quiet dark space for the account panel on the right. The game title is rendered as selectable interface text.
