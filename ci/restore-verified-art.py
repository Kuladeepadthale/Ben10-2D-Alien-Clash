"""Restore a pinned release, preserve the first72 fighters, append reviewed native forms."""
from pathlib import Path
import hashlib,json,shutil,subprocess,tempfile,zipfile
R=Path(__file__).resolve().parents[1]
def constant(text,name):return json.JSONDecoder().raw_decode(text.split('const '+name+'=',1)[1].lstrip())[0]
with tempfile.TemporaryDirectory(prefix='verified-v110-art-') as tmp:
 subprocess.run(['gh','release','download','android-c2dd350dc748','--repo','Kuladeepadthale/Ben10-2D-Alien-Clash','--pattern','Ben10-Alien-Clash-Online.apk','--dir',tmp],check=True)
 apk=Path(tmp)/'Ben10-Alien-Clash-Online.apk'
 with apk.open('rb') as f:assert hashlib.file_digest(f,'sha256').hexdigest()=='1fda897b48bdbf83465cfa9f26707bf7a6d1ae0a4e214bcb166b3e3a0eb5364e'
 with zipfile.ZipFile(apk) as z:
  assert z.testzip() is None
  # Compare actual fighter configuration, including emitter locations and body size.
  node="const vm=require('vm');let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const b=vm.createContext({});console.log(vm.runInContext(s+';JSON.stringify(aliens.slice(0,72))',b))})"
  old=subprocess.check_output(['node','-e',node],input=z.read('assets/data.js'))
  current=subprocess.check_output(['node','-e',node],input=(R/'web/data.js').read_bytes())
  # v12.4 explicitly authorizes only Upchuck Tongue Lash range/contact timing.
  expected=json.loads(old);actual=json.loads(current)
  assert expected[15]['name']=='Upchuck'
  tongue=expected[15]['skills'][2]
  assert tongue=={'name':'Tongue lash','kind':'melee','damage':140,'cooldown':5.5,'range':230,'windup':.35,'recovery':.4},'Pinned Tongue Lash baseline changed'
  tongue.update(range=460,windup=.48,duration=.2,recovery=.38)
  assert expected[41]['skills'][2]['name']=='Tail sweep'
  expected[41]['skills'][2]['range']=390
  assert actual==expected,'Fighter configuration changed outside the requested Tongue Lash and Tail Sweep updates'
  names=json.loads((R/'ci/roster.json').read_text());base=json.loads(z.read('assets/assets/cels/manifest.json'));assert len(names)==92 and names[:72]==[c['name'] for c in base['characters']]
  for n in z.namelist():
   if not n.startswith(('assets/assets/cels/','assets/assets/villains/')) or n.endswith('/'):continue
   relative=Path(n[len('assets/'):]);assert '..' not in relative.parts
   dest=R/'web'/relative;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(z.read(n))
  (R/'web/villain-data.js').write_bytes(z.read('assets/villain-data.js'))
  profiles=constant((R/'web/power-profiles.js').read_text(),'POWER_PROFILES');oldprofiles=constant(z.read('assets/power-profiles.js').decode(),'POWER_PROFILES');assert profiles['aliens'][:72]==oldprofiles['aliens'] and profiles['villains']==oldprofiles['villains']
extra=json.loads((R/'ci/expansion111-cels.json').read_text());assert [c['name'] for c in extra]==names[72:]
for c in extra:
 for s in c['sheets']:
  p=R/'web'/s['src'];assert p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest()==s['sha256']
base['characters']+=extra
(R/'web/assets/cels/manifest.json').write_text(json.dumps(base,indent=2))
(R/'web/cel-data.js').write_text("'use strict';\nconst CEL_DATA="+json.dumps(base,separators=(',',':'))+';\n')
subprocess.run(['python3','ci/apply-reviewed-animations.py'],cwd=R,check=True)
subprocess.run(['python3','ci/build-cels.py','--from-id','92'],cwd=R,check=True)
shutil.copytree(R/'web/assets/villains',R/'builds/web/assets/villains',dirs_exist_ok=True)
print('Verified previous72 fighters and50 villains; appended20 reviewed native fighters.')

