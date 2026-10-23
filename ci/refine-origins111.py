"""Register reviewed mouth/eye/forehead landmarks and native close-combat surfaces."""
from pathlib import Path
import json
import numpy as np
from PIL import Image
R=Path(__file__).resolve().parents[1];W=R/'web'
def constant(p,n):return json.JSONDecoder().raw_decode(p.read_text().split('const '+n+'=',1)[1])[0]
def write(p,n,data):
 t=p.read_text();start=t.index('const '+n+'=')+len('const '+n+'=');_,end=json.JSONDecoder().raw_decode(t[start:]);p.write_text(t[:start]+json.dumps(data,separators=(',',':'))+t[start+end:])
m=constant(W/'cel-data.js','CEL_DATA');profiles=constant(W/'power-profiles.js','POWER_PROFILES');kits=json.loads((R/'ci/expansion111-kits.json').read_text())
updates={0:{'base':[.94,.7]},1:{'skill0':[.97,.38]},6:{'skill0':[.65,.35],'ultimate':[.65,.35]},8:{'skill0':[.78,.18],'ultimate':[.78,.18]}}
for i,changes in updates.items():
 a=kits[i]
 for key,point in changes.items():
  if key=='base':a['powerOrigin']=point
  else:a.setdefault('powerOrigins',{})[key]=point
 c=m['characters'][72+i];arrays=[np.array(Image.open(W/s['src']))[:,:,3] for s in c['sheets']]
 for key in ['normal','skill0','skill1','skill2','ultimate']:
  u,v=a.get('powerOrigins',{}).get(key,a['powerOrigin'])
  for fi in c['clips'][key]:
   uu,vv=({13:(.50,.15),14:(.97,.70),15:(.85,.5)}.get(fi,(u,v)) if i==0 and key=='normal' else (u,v))
   if i==0 and key=='skill2':uu,vv=.95,.55
   f=c['frames'][fi];x,y,w,h=f['rect'];yy,xx=np.where(arrays[f['sheet']][y:y+h,x:x+w]>180);near=int(np.argmin((xx-w*uu)**2+(yy-h*vv)**2));f['emitters'][key]=[int(xx[near]),int(yy[near])]
 for n,p in enumerate(profiles['aliens'][72+i]):
  key='ultimate' if n==3 else 'skill'+str(n)
  for phase,fi in zip(p['phases'],c['clips'][key]):
   f=c['frames'][fi];px,py=f['emitters'][key];scale=226*kits[i]['scale']/f.get('referenceHeight',c['referenceHeight']);phase.update(frame=fi,pixel=[px,py],offset=[round((px-f['origin'][0])*scale,3),round((py-f['origin'][1])*scale,3)])
  for phase in p.get('comboPhases',[]):
   f=c['frames'][phase['frame']];px,py=f['emitters']['normal'];scale=226/c['referenceHeight'];phase.update(pixel=[px,py],offset=[round((px-f['origin'][0])*scale,3),round((py-f['origin'][1])*scale,3)])
profiles['aliens'][84][0]['source']='claws';profiles['aliens'][84][2]['source']='feet';profiles['aliens'][84][3]['source']='body'
profiles['aliens'][86][0]['source']='body';profiles['aliens'][86][1]['source']='body';profiles['aliens'][86][3]['source']='body'
for i in range(20):
 c=m['characters'][72+i]
 for ability in profiles['aliens'][72+i]:
  if ability['kind']!='melee' or ability['ticks']<2 or ability['source'] not in ['hands','claws']:continue
  ability['comboPhases']=[]
  for fi in c['clips']['normal'][1:]:
   f=c['frames'][fi];px,py=f['emitters']['normal'];scale=226/c['referenceHeight'];ability['comboPhases'].append(dict(frame=fi,pixel=[px,py],offset=[round((px-f['origin'][0])*scale,3),round((py-f['origin'][1])*scale,3)]))
write(W/'cel-data.js','CEL_DATA',m);write(W/'power-profiles.js','POWER_PROFILES',profiles);(W/'assets/cels/manifest.json').write_text(json.dumps(m,indent=2));(R/'ci/expansion111-cels.json').write_text(json.dumps(m['characters'][72:],separators=(',',':'))+'\n');(R/'ci/expansion111-kits.json').write_text(json.dumps(kits,indent=2)+'\n')
p=W/'data.js';t=p.read_text();start=t.index('aliens.push(...',t.index('// expansion111:'))+len('aliens.push(...');_,end=json.JSONDecoder().raw_decode(t[start:]);p.write_text(t[:start]+json.dumps(kits,separators=(',',':'))+t[start+end:])
print('Refined reviewed eye, mouth, third-eye, claw and tail registrations.')
