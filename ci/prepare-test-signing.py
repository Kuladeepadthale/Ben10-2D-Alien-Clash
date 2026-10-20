"""Restore the repository's development-only signer; never generate a new one in CI."""
from pathlib import Path
import base64, hashlib, subprocess
root=Path(__file__).resolve().parent.parent
signing=root/'ci'/'signing'
key=root/'android'/'ci-signing'/'alien-clash-test.jks'
key.parent.mkdir(parents=True,exist_ok=True)
key.write_bytes(base64.b64decode((signing/'test-keystore.b64').read_text(),validate=False))
cert=subprocess.check_output(['keytool','-exportcert','-keystore',str(key),'-storepass','android','-alias','androiddebugkey'],stderr=subprocess.DEVNULL)
actual=hashlib.sha256(cert).hexdigest()
assert actual==(signing/'certificate.sha256').read_text().strip(), 'Test signer changed: do not publish an incompatible update'
print('Restored pinned development signer SHA-256:',actual)
