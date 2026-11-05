"""Extract native test metadata from the already-pinned development APK."""
import argparse, hashlib, json, zipfile
from pathlib import Path
EXPECTED = "1fda897b48bdbf83465cfa9f26707bf7a6d1ae0a4e214bcb166b3e3a0eb5364e"
parser = argparse.ArgumentParser()
parser.add_argument("apk", type=Path)
parser.add_argument("output", type=Path)
args = parser.parse_args()
with args.apk.open("rb") as source:
    digest = hashlib.file_digest(source, "sha256").hexdigest()
if digest != EXPECTED:
    raise SystemExit("Pinned APK hash mismatch")
with zipfile.ZipFile(args.apk) as archive:
    manifest = json.loads(archive.read("assets/assets/cels/manifest.json"))
if [c["id"] for c in manifest["characters"]] != list(range(72)):
    raise SystemExit("Expected the pinned 72-character manifest")
manifest["sourceSha256"] = digest
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(json.dumps(manifest, separators=(",", ":")) + "\n")
print("Verified pinned APK; extracted 72-character native timing metadata")
