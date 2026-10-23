from pathlib import Path
from PIL import Image
import json,sys,hashlib
R=Path(__file__).resolve().parents[1];W=R/'web';folder=W/'assets/ui/abilities';paths=json.loads(Path(sys.argv[1]).read_text());kits=json.loads((R/'ci/expansion111-kits.json').read_text());m=json.loads((folder/'manifest.json').read_text());m['entries']=[e for e in m['entries'] if e['alien']<72];m['version']=111
for i,path in enumerate(paths):
 image=Image.open(path);dest=folder/('ability-atlas-'+str(i+18).zfill(2)+'-v111.webp');
 image.save(dest,'WEBP',quality=96,method=2,exact=True)
 for row in range(4):
  id=72+i*4+row;a=kits[id-72];keys=['normal','skill0','skill1','skill2','ultimate'];names=[a['skills'][a['basicSkillIndex']]['name']+' basic' if 'basicSkillIndex' in a else 'Basic strike']+[s['name'] for s in a['skills']]+[a['ultimate']['name']]
  for col,(key,name) in enumerate(zip(keys,names)):m['entries'].append(dict(alien=id,alienName=a['name'],key=key,name=name,atlas=dest.name,row=row,col=col))
 print(dest.name,image.size,dest.stat().st_size)
(folder/'manifest.json').write_text(json.dumps(m,indent=2)+'\n')
p=W/'power-icons.js';s=p.read_text();old="'-v100.webp')]);";new="'-v100.webp'),...Array.from({length:5},(_,i)=>'assets/ui/abilities/ability-atlas-'+String(i+18).padStart(2,'0')+'-v111.webp')]);";assert old in s or '-v111.webp' in s
if old in s:s=s.replace(old,new);p.write_text(s)
