"""Reuse unchanged, checksum-pinned v10.0 character art when the roster and native art are unchanged."""
from pathlib import Path
import hashlib,json,shutil,subprocess,tempfile,zipfile
R=Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(prefix='verified-72-art-') as tmp:
    subprocess.run(['gh','release','download','android-142199378163','--repo','Kuladeepadthale/Ben10-2D-Alien-Clash','--pattern','Ben10-Alien-Clash-Online.apk','--dir',tmp],check=True)
    apk=Path(tmp)/'Ben10-Alien-Clash-Online.apk'
    with apk.open('rb') as stream: assert hashlib.file_digest(stream,'sha256').hexdigest()=='912c4959e581cd634063adb74c2b0532e635618c2999ca7e4b0159a3dc4ab816'
    with zipfile.ZipFile(apk) as z:
        assert z.testzip() is None
        assert z.read('assets/data.js').decode().strip()==(R/'web/data.js').read_text().strip(),'Combat roster changed: use full art export'
        names=json.loads((R/'ci/roster.json').read_text())
        manifest=json.loads(z.read('assets/assets/cels/manifest.json'))
        assert [c['name'] for c in manifest['characters']]==names and len(names)==72
        for folder in ['cels','villains']:
            target=R/'web/assets'/folder
            if target.exists(): shutil.rmtree(target)
            prefix='assets/assets/'+folder+'/'
            for entry in z.namelist():
                if not entry.startswith(prefix) or entry.endswith('/'): continue
                relative=Path(entry[len(prefix):]);assert not relative.is_absolute() and '..' not in relative.parts
                dest=target/relative;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(z.read(entry))
        for file in ['cel-data.js','villain-data.js']:
            (R/'web'/file).write_bytes(z.read('assets/'+file))
subprocess.run(['python3','ci/build-cels.py','--from-id','72'],cwd=R,check=True)
shutil.copytree(R/'web/assets/villains',R/'builds/web/assets/villains',dirs_exist_ok=True)
print('Reused verified, unchanged 72-character/30-villain art; current renderer bundled. Full regression suite still required.')
