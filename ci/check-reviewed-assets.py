from pathlib import Path
import json,hashlib,runpy
import numpy as np
from PIL import Image
R=Path(__file__).resolve().parents[1];check=runpy.run_path(str(R/'ci/check-full-poses.py'))['check_character'];total=0
for file in sorted((R/'ci/animation-review/characters').glob('*/revision.json')):
 rev=json.loads(file.read_text());c=rev['character'];assert len(c['frames'])==32 and len(c['clips'])==12
 assert c['reviewedRevision']>=1
 for s in c['sheets']:
  p=R/'web'/s['src'];assert hashlib.sha256(p.read_bytes()).hexdigest()==s['sha256'];im=Image.open(p);assert im.size==(s['width'],s['height']);assert im.mode=='RGBA'
 total+=check(c)
 idle=c['frames'][c['clips']['idle'][0]]
 if c['id']==86 and c.get('requestedRepair129'):
  # Rush retains the original 246px movement body; new art is native 224px, never upscaled.
  base=json.loads((R/'ci/powers129/rush-baseline.json').read_text())
  assert c['frames'][:16]==base['frames'][:16] and c['sheets'][:2]==base['sheets'][:2]
  assert all(f['referenceHeight']==224 and f['sourcePixels']>4000 for f in c['frames'][16:])
 else: assert idle['rect'][3]-16>=300
 for key in ([] if c['id']==86 and c.get('requestedRepair129') else ['walk','normal','skill0','skill1','ultimate']):
  # A quadruped stretches horizontally: preserve native pixels rather than enlarging crouched poses.
  assert max(max(c['frames'][i]['rect'][2]-16,c['frames'][i]['rect'][3]-16) if c['id'] in [4,19] else c['frames'][i]['rect'][3]-16 for i in c['clips'][key])>=300
 portrait=Image.open(R/'web'/c['portrait']);assert portrait.mode=='RGBA' and portrait.height>=300 and portrait.getchannel('A').getextrema()[0]==0
 if c['name']=='water-hazard':
  for key in ['normal','skill0','skill1','skill2','ultimate']:
   for fi in c['clips'][key]:
    f=c['frames'][fi];x,y,w,h=f['rect'];a=np.array(Image.open(R/'web'/c['sheets'][f['sheet']]['src']))[y:y+h,x:x+w];rgb=a[:,:,:3].astype(float);blue=(a[:,:,3]>180)&(rgb[:,:,2]>140)&(rgb[:,:,2]>rgb[:,:,0]*1.3)&(rgb[:,:,2]>rgb[:,:,1]*1.12);assert blue.sum()/(a[:,:,3]>100).sum()<.06,'Water is baked over body instead of separate emitter'
print('Passed:',total,'reviewed native frames; complete source pixels, transparent margins, native detail, portrait consistency and separate power effects.')

