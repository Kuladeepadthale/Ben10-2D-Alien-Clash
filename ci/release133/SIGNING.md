# Play release signing

The earlier detached-signature 13.3 AAB was rejected by Play Console despite passing basic JAR verification. The old 13.2/13.3 custom-signature publishing jobs are retired.

Sign AAB files using the JDK jarsigner command and APK files using Android apksigner. Preserve the existing upload keystore and certificate; never create a replacement key for updates. The standard-signature repair workflow verifies the original upload certificate, signs unchanged staged packages, validates both outputs and publishes new filenames under playstore-13.3-fixed.

Private keystores and passwords must never be committed. The signing worker publishes an ephemeral recipient certificate on a run-specific handoff branch; only a CMS-encrypted key archive is committed to that branch. The recipient private key exists only on the worker and is removed after the job. A new run requires a new encrypted handoff to its own certificate. Do not reuse a previous run's ciphertext or restart an old custom-signature publisher.

Play Console acceptance must still be checked by uploading the corrected AAB. Local signature validation is not a substitute for that check.
