"""Merge the reviewed second chapter and close clips after restoring verified base artwork."""
from pathlib import Path
import json,shutil
R=Path(__file__).resolve().parents[1];W=R/'web';A=W/'assets/villains-expansion110';m=json.loads((A/'manifest.json').read_text())
def constant(path,name):return json.JSONDecoder().raw_decode(path.read_text().split('const '+name+'=',1)[1])[0]
data=constant(W/'villain-data.js','VILLAIN_DATA');data['characters']=data['characters'][:30]+m['new'];data['version']=110
for v in data['characters']:
 v['chapter']=1 if v['id']<30 else 2
 if v['kit']['skills'][0]['kind'] in ['projectile','beam','wave']:v['kit']['basicSkillIndex']=0
for clip in m['close']:
 v=data['characters'][clip['id']];v['closeSrc']=clip['src'];v['closeFrames']=clip['frames']
oldprofiles=constant(W/'power-profiles.js','POWER_PROFILES')['villains'][:30]
for villain,row in zip(data['characters'][:30],oldprofiles):
 for n,ability in enumerate(row):
  key='ultimate' if n==3 else 'skill'+str(n)
  for phase in ability['phases']:villain['frames'][phase['frame']].setdefault('emitters',{})[key]=phase['pixel']
(W/'villain-data.js').write_text("'use strict';\nconst VILLAIN_DATA="+json.dumps(data,separators=(',',':'))+';\n');(W/'assets/villains/manifest.json').write_text(json.dumps(data,indent=2))
p=constant(W/'power-profiles.js','POWER_PROFILES');p['villains']=p['villains'][:30]+m['profiles'];s=(W/'power-profiles.js').read_text();start=s.index('const POWER_PROFILES=')+len('const POWER_PROFILES=');_,end=json.JSONDecoder().raw_decode(s[start:]);s=s[:start]+json.dumps(p,separators=(',',':'))+s[start+end:];(W/'power-profiles.js').write_text(s)
b=R/'builds/web'
if b.exists():
 for name in ['villain-data.js','power-profiles.js']:shutil.copyfile(W/name,b/name)
 shutil.copytree(W/'assets/villains',b/'assets/villains',dirs_exist_ok=True);shutil.copytree(A,b/'assets/villains-expansion110',dirs_exist_ok=True)
print('Merged 50 opponents, 20 new action sets and',len(m['close']),'replacement close clips; original 30 stage IDs preserved.')
