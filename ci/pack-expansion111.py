"""Extract complete source silhouettes and register new native cels and power landmarks."""
from pathlib import Path
import json,hashlib,sys,statistics
from io import BytesIO
import numpy as np
from PIL import Image
from full_poses import whole_poses,pack_poses
R=Path(__file__).resolve().parents[1];W=R/'web';records=json.loads(Path(sys.argv[1]).read_text());kits=json.loads((R/'ci/expansion111-kits.json').read_text());designs=json.loads((R/'ci/expansion111-specs.json').read_text())
def constant(path,name):return json.JSONDecoder().raw_decode(path.read_text().split('const '+name+'=',1)[1].lstrip())[0]
base=constant(W/'cel-data.js','CEL_DATA');old_characters=list(base['characters']);base['characters']=base['characters'][:72];selected=set(sys.argv[2].split(',')) if len(sys.argv)>2 else None
profiles=constant(W/'power-profiles.js','POWER_PROFILES');old_profiles=list(profiles['aliens']);profiles['aliens']=profiles['aliens'][:72];new=[]
standard_clips=dict(idle=[0],walk=list(range(1,9)),jump=list(range(9,13)),normal=[13,14,15],skill0=[16,17,18],skill1=[19,20,21],skill2=[22,23,24],ultimate=[25,26,27],guard=[28],hit=[29],ko=[30],dash=[31])
for i,r in enumerate(records):
 id=72+i;name=r['slug'];clips={k:list(v) for k,v in standard_clips.items()};folder=W/'assets/cels'/name;folder.mkdir(parents=True,exist_ok=True);a=kits[i]
 if selected and name not in selected:
  new.append(old_characters[id]);profiles['aliens'].append(old_profiles[id]);continue
 parts=[]
 for key in ['a','b']:
  if key=='b' and name=='rush':part=whole_poses(Image.open(r[key]),rows=5,row_counts=[3,3,3,3,4])
  elif key=='b' and name=='thornblade':
   raw=whole_poses(Image.open(r[key]),rows=5);part=[raw[n] for n in [0,1,3,4,5,7,8,9,11,12,13,15,16,17,18,19]]
  else:part=whole_poses(Image.open(r[key]),rows=4)
  parts.append(part)
 poses=parts[0]+parts[1];reference=poses[0][0].height;combatref=poses[28][0].height
 if name=='undertow':clips.update(skill2=[23,25,26],ultimate=[24,25,27])
 if name=='wreckingbolt':clips.update(skill1=[20,22,23],skill2=[24,25,26],ultimate=[19,20,23])

 c=dict(id=id,name=name,sheets=[],frames=[],clips=clips,referenceHeight=reference)
 for si in range(4):
  sheet,placements=pack_poses(poses[si*8:si*8+8]);path=folder/('movement-'+str(si)+'.webp' if si<2 else 'combat-'+str(si-2)+'.webp')
  # Lossless alpha preserves exact source pixels; high-quality color keeps native line detail.
  encoded=BytesIO();sheet.save(encoded,'WEBP',quality=96,method=2,exact=True)
  if len(encoded.getvalue())>650000:
   encoded=BytesIO();sheet.save(encoded,'WEBP',quality=92,method=2,exact=True)
  Image.open(BytesIO(encoded.getvalue())).load();temp=path.with_suffix('.packing');temp.write_bytes(encoded.getvalue());temp.replace(path)
  assert path.stat().st_size<4000000,(name,path.stat().st_size)
  c['sheets'].append(dict(src=str(path.relative_to(W)),width=sheet.width,height=sheet.height,sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
  for j,(x,y,w,h,meta) in enumerate(placements):
   image=sheet.crop((x,y,x+w,y+h));pixels=np.array(image)[:,:,3];yy,xx=np.indices(pixels.shape);band=(pixels>180)&(yy>h*.48)&(yy<h*.72);anchor=float(np.median(xx[band])) if band.any() else w/2
   f=dict(sheet=si,rect=[x-8,y-8,w+16,h+16],origin=[round(anchor+8,2),h+8],source='movement' if si<2 else 'combat',cell=j,bounds=[0,0,w,h],**meta)
   if si>=2:f['referenceHeight']=combatref
   c['frames'].append(f)
  print(name,si,path.stat().st_size,flush=True)
 alpha=[np.array(Image.open(W/s['src']))[:,:,3] for s in c['sheets']]
 for key in ['normal','skill0','skill1','skill2','ultimate']:
  u,v=a.get('powerOrigins',{}).get(key,a['powerOrigin'])
  if (i,key) in [(0,'skill2'),(12,'skill1')]:u,v=.95,.55
  if i==16 and key=='skill1':u,v=.95,.35
  if i==1 and key=='skill0':u,v=.86,.35
  if i==3 and key in ['skill0','skill1','ultimate']:u,v=.95,.14
  if i==15 and key in ['skill0','skill1','ultimate']:u,v=.89,.30
  for fi in clips[key]:
   f=c['frames'][fi];x,y,w,h=f['rect'];yy,xx=np.where(alpha[f['sheet']][y:y+h,x:x+w]>180);near=int(np.argmin((xx-w*u)**2+(yy-h*v)**2));f.setdefault('emitters',{})[key]=[int(xx[near]),int(yy[near])]
 portrait=poses[0][0];portrait.save(folder/'portrait.webp','WEBP',quality=98,method=2,exact=True);c['portrait']=str((folder/'portrait.webp').relative_to(W))
 sources=[designs[i][4]]*4
 if i in [0,12]:sources[2 if i==0 else 1]='tail'
 if i==1:sources=['mouth','hands','spider-legs','hands']
 if i==3:sources=['shoulders','shoulders','hands','shoulders']
 if i==6:sources=['forehead','hands','weapon','forehead']
 if i==8:sources=['eye','hands','hands','eye']
 if i==15:sources=['mouth','mouth','body','mouth']
 if i==16:sources=['hands','vines','hands','vines']
 row=[]
 for n,spec in enumerate(a['skills']+[a['ultimate']]):
  key='ultimate' if n==3 else 'skill'+str(n);phases=[]
  for fi in clips[key]:
   f=c['frames'][fi];px,py=f['emitters'][key];scale=226*a['scale']/f.get('referenceHeight',reference);phases.append(dict(frame=fi,pixel=[px,py],offset=[round((px-f['origin'][0])*scale,3),round((py-f['origin'][1])*scale,3)]))
  theme=a['effectTheme'];theme='crystal' if i==10 and n in [1,3] else theme
  p=dict(name=spec['name'],source=sources[n],theme=theme,color=a['light'],phases=phases,kind=spec['kind'],ticks=spec.get('ticks',1))
  if spec['kind']=='melee' and spec.get('ticks',1)>1 and sources[n] in ['hands','claws']:
   combo=[]
   for fi in clips['normal'][1:]:
    f=c['frames'][fi];px,py=f['emitters']['normal'];scale=226*a['scale']/reference;combo.append(dict(frame=fi,pixel=[px,py],offset=[round((px-f['origin'][0])*scale,3),round((py-f['origin'][1])*scale,3)]))
   p['comboPhases']=combo
  if i==3 and n==3:p['twin']=True
  row.append(p)
 profiles['aliens'].append(row)
 if designs[i][3]=='hover':profiles['hover'][str(id)]=3
 new.append(c)
base['characters']+=new
(W/'cel-data.js').write_text("'use strict';\nconst CEL_DATA="+json.dumps(base,separators=(',',':'))+';\n');(W/'assets/cels/manifest.json').write_text(json.dumps(base,indent=2))
(R/'ci/expansion111-cels.json').write_text(json.dumps(new,separators=(',',':'))+'\n')
p=W/'power-profiles.js';t=p.read_text();start=t.index('const POWER_PROFILES=')+len('const POWER_PROFILES=');_,end=json.JSONDecoder().raw_decode(t[start:]);t=t[:start]+json.dumps(profiles,separators=(',',':'))+t[start+end:];p.write_text(t)
print('Packed',len(new),'new native fighters with640 complete source poses.')
