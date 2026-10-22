"""Reuse unchanged, checksum-pinned v10.6 character art when the roster and native art are unchanged."""
from pathlib import Path
import hashlib,json,shutil,subprocess,tempfile,zipfile
R=Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(prefix='verified-72-art-') as tmp:
    subprocess.run(['gh','release','download','android-6052f6e69dca','--repo','Kuladeepadthale/Ben10-2D-Alien-Clash','--pattern','Ben10-Alien-Clash-Online.apk','--dir',tmp],check=True)
    apk=Path(tmp)/'Ben10-Alien-Clash-Online.apk'
    with apk.open('rb') as stream: assert hashlib.file_digest(stream,'sha256').hexdigest()=='c579f6ce69c024f07e6b6d3c9822fb9658ffe02b24c118f60d8773eda77f81ff'
    with zipfile.ZipFile(apk) as z:
        assert z.testzip() is None
        # The only data change is a runtime basic-attack mapping. It does not change
        # artwork, roster identity, rendering size or any emitter geometry.
        current=(R/'web/data.js').read_text()
        marker='\n// Frequent ranged users keep their characteristic emitter and pose for a lighter basic shot.'
        unchanged,separator,addition=current.partition(marker)
        assert separator and addition.strip().startswith('for(const [id,index] of Object.entries(')
        assert addition.strip().endswith('aliens[Number(id)].basicSkillIndex=index;')
        assert len(addition.strip().splitlines())==1,'Unexpected extra data mutation'
        assert z.read('assets/data.js').decode().strip()==unchanged.strip(),'Art-affecting roster source changed: use full art export'
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

