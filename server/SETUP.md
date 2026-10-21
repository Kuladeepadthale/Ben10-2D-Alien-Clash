# Deploy the real online battle server

Android 7.7 includes the owner-deployed default endpoint `wss://omnitrix-ranked-arena.kuladeepadthale.workers.dev/arena`; players do not need to enter a server address. The service health check responded with protocol 1 during configuration. Real two-account fight/sync verification is still required before public distribution. Bot practice remains available. The setup instructions below also cover redeployment or migration to another address.

## From a phone using Cloudflare's GitHub integration

1. Open Cloudflare Dashboard. Use Chrome's Desktop site if needed.
2. Open **Workers & Pages → Create application → Import a repository / Continue with GitHub**. Choose **Workers**, not Pages.
3. Authorize access to `Kuladeepadthale/Ben10-2D-Alien-Clash` and select it. Branch: `main`.
4. Keep the repository root as the build root. Build command: `node server/build-engine.cjs`. Deploy command: `npx wrangler deploy --config server/wrangler.jsonc`.
5. Publish the Worker. Its configuration creates the SQLite-backed `ARENA` Durable Object binding and supplies the public Firebase project identifiers. No Firebase Admin private key is required.
6. Open `https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/health`. It should return `{"service":"Omnitrix Ranked Arena","protocol":1}`.
7. Send that HTTPS address back in chat. The APK's final shared endpoint will be `wss://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/arena`.
8. For immediate testing on each phone, go to **Settings → Online server setup** and paste that `wss://.../arena` address. Once the owner supplies the live address, set `web/multiplayer-config.js` to that URL and rebuild; ordinary players then need no setup.

If the dashboard offers only a template editor, create/import a Worker from the Git integration rather than pasting worker.mjs by itself: it imports the generated engine and shared rank rules. Review the account's current Workers/Durable Objects limits in Cloudflare. This repository does not purchase a plan or enable billing.

## Verify before sharing

1. Enable Firebase Email/Password and publish `firebase/firestore.rules` as described in `firebase/SETUP.md`.
2. On **two phones with different email accounts**, unlock an alien, sync Account progress, choose Multiplayer and search at the same time. Both must show the same match with opposite seats and synchronized HP, cooldowns and round wins.
3. Finish a match. Confirm the winner gains RP and the loser loses RP. Reopen the app and reconnect to confirm the server returns the same rank. Ordinary Hero XP remains separate.
4. Search on one phone alone: remain queued for 30 seconds, then fight a clearly labelled bot. Confirm RP is unchanged.
5. Cancel a search before 30 seconds: no match, reward or rank change. A second device using the same account is rejected, not paired against itself.
6. During a real-player fight, leave or disconnect for 10 seconds. The connected opponent wins; the disconnected player receives the loss and additional 5 RP forfeit penalty, floored at zero. Reconnect to read the server's result.

## Protocol and rank authority

- A WebSocket authenticates with a Firebase ID token in its first JSON message, never in a URL. Firebase verifies it; project/audience, expiry and password-provider guards reject unrelated accounts. Email addresses and tokens are never sent to opponents.
- Each UID has only one active socket. Queue messages include alien ID and two distinct ability IDs; the server reads that UID's Firestore save for ownership. Sync first after unlocking an alien.
- This is a single-lobby initial deployment, capped at 64 sockets and 16 simultaneous matches. At capacity, matchmaking can take longer; it does not create a fake human opponent. Active fights and waiting queues are transient. Server restarts cancel them without claiming a completed result.
- The server runs the existing damage, attack budgets, cooldowns, hitboxes, projectiles, guard, dash and ability code at 120 physics steps per second, in 30 updates per second. Clients send only movement, guard and ability inputs; snapshots control both fighters. Ranked upgrade levels are normalized to zero; rarity still affects health/power. Server projectile origins use body geometry so no image assets are required.
- Match length: best of three rounds, 90 seconds per round, capped at five rounds to avoid endless draws. Timeout winner uses remaining HP percentage. Draws change neither player's RP.
- Rank points start at 0. Elo expectation uses a 400-point scale and K=32, with a minimum 5 RP decisive change. Winning against a stronger rival earns more; losing to a weaker one costs more. Forfeits cost an extra 5 RP. All losses are floored at zero.
- Rank writes for both players and a match receipt use one Durable Object transaction. Duplicate settlement cannot award twice. Clients cannot submit a winning score or write ranked storage through Firestore.
- Bot fallback starts after 30 seconds. Bots give local coins/Hero XP on completion but never competitive RP. Guest bot practice uses the original Quick Match engine without a fake online search.
- The Plumber Recruit → Cadet → Agent → Elite Plumber → Magister ladder is a game adaptation inspired by Ben 10, not a claim that the original cartoon defined these tiers or numeric thresholds.

The existing collection/economy is client-owned cloud progress; checking it prevents accidental locked picks, but it is not a tamper-proof inventory. This server secures combat outcomes and ranked points, not the entire existing economy. Single-lobby global hosting is an initial version: test latency on actual devices before public distribution. Receipts and ranked records persist in the Worker; deleting its Durable Object data resets them.

## Developer checks

Run `node server/build-engine.cjs` then `node ci/check-multiplayer-server.mjs`. Android CI also runs the four-viewport WebSocket client tests. The generated engine is rebuilt from repository sources during deployment. These automated checks use mocked authentication/storage and browsers; they do not replace the live two-phone test.

References: https://developers.cloudflare.com/durable-objects/examples/websocket-server/ and https://firebase.google.com/docs/reference/rest/auth#section-get-account-info


## v10.5 squad protocol

Deploy the matching Worker using `npx wrangler deploy --config server/wrangler.jsonc` from the repository root. The build command regenerates the shared combat engine. This version advertises protocol 2 and rejects old clients through the client handshake. An APK update alone does not deploy the Worker.

Ranked: choose three owned aliens during the first ten seconds of the thirty-second search; matching cannot start sooner. Players with fewer than three unlocked aliens repeat owned aliens in spare slots. At match start, choose a starter for five seconds, followed by a three-second start countdown. Knockouts freeze combat for a three-second reserve choice, followed by a one-second restart. Missing reserve choices pick a random remaining slot. The surviving fighter keeps HP. Eliminate three alien slots to win; only genuine ranked matches change RP.

Friend rooms: six-character code, authenticated players, host-controlled one round / best-of-three / best-of-five. 1v1 uses the ranked squad rules. 2v2 is a relay: seats 1 and 3 vs 2 and 4, three aliens per person, alternate to the teammate after a knockout while available. The inactive teammate watches. Eliminate six opposing slots to win a squad round. Coin rewards use normal match completion; friend rooms never change RP. Leaving counts as a team forfeit. Host departure before a match transfers host to the next player. Waiting rooms expire after fifteen minutes.
