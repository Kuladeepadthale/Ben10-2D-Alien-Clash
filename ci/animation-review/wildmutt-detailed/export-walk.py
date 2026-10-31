from PIL import Image
from scipy.ndimage import label,find_objects,binary_dilation
import numpy as np,json,pathlib,base64
root=pathlib.Path('stride-work');p=root/'web/wildmutt-detailed-data.js';d=json.loads(p.read_text().split('=',1)[1].strip().rstrip(';'));d['version']=5;d['frames']=d['frames'][:128];d['sheets']=d['sheets'][:8];d['sheetSizes']=d['sheetSizes'][:8]
for si,(name,uid) in enumerate([('walk-keys-v5','9e0f4924-59eb-497e-99ce-ed1e9569332d'),('walk-between-v5','89e22f27-a671-4e88-aecc-2e54794b306d')],8):
 a=np.array(Image.open('generated_images/exec-'+uid+'.png').convert('RGBA'));lab,n=label(a[:,:,3]>160);z=np.bincount(lab.ravel());boxes=find_objects(lab);q=[(i,boxes[i-1]) for i,s in enumerate(z) if i and s>1000];assert len(q)==8
 q.sort(key=lambda v:(v[1][0].start+v[1][0].stop)/2);order=[]
 for j in range(2):order+=sorted(q[j*4:j*4+4],key=lambda v:v[1][1].start)
 ref=order[0][1][0].stop-order[0][1][0].start;atlas=Image.new('RGBA',(2048,1024))
 for fi,(component,(y,x)) in enumerate(order):
  mask=binary_dilation(lab==component,iterations=2);piece=a[y,x].copy();piece[:,:,3]=np.where(mask[y,x],piece[:,:,3],0);h,w=piece.shape[:2];assert w<=508 and h<=508
  rgb=piece[:,:,:3].astype(float);mx=rgb.max(2);mn=rgb.min(2);yy,xx=np.indices((h,w));gray=((mx-mn)<32)&(mx>85)&(mx<246)&(piece[:,:,3]>180)&(xx<w*.49)&(yy<h*.64)&(yy>3);bx=float(np.median(xx[gray])) if gray.sum()>15 else w*.23
  cx=fi%4*512+(512-w)//2;cy=fi//4*512+508-h;atlas.alpha_composite(Image.fromarray(piece),(cx,cy));d['frames'].append({'sheet':si,'rect':[cx,cy,w,h],'origin':[round(bx+ref*.23,2),h-2],'referenceHeight':ref})
 path=root/'web/assets/wildmutt-detailed'/f'{name}.webp';atlas.save(path,'WEBP',lossless=True,method=6);path.with_suffix('.b64').write_text(base64.b64encode(path.read_bytes()).decode());d['sheets'].append('assets/wildmutt-detailed/'+path.name);d['sheetSizes'].append([2048,1024]);print(name,'ref',ref,'bytes',path.stat().st_size)
d['clips']['walk']=[v for i in range(8) for v in [128+i,136+i]]
d['gait']={'strideHeight':1.2,'stepsPerCycle':2,'phaseStops':[i/16 for i in range(16)],'description':'Two alternating forepaw steps per full stride; pose advances with ground displacement, never elapsed time.'}
p.write_text("'use strict';\nconst WILDMUTT_DETAILED="+json.dumps(d,separators=(',',':'))+';\n');(root/'ci/animation-review/wildmutt-detailed/atlas.json').write_text(json.dumps(d,indent=2))
