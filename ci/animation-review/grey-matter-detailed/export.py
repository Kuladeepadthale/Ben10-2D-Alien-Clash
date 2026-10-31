# Extract generated pixels only; one neutral scale per source sheet, never per-pose fitting.
from PIL import Image
from scipy.ndimage import label,find_objects,binary_dilation
import numpy as np,json,pathlib,base64
root=pathlib.Path('grey-work');out=root/'web/assets/grey-matter-detailed'
spec=[('walk','377cba7b-f58e-4c10-a0d4-fae8d0d3d41b',[4,4,4,4],0),('body','0ada0f36-1817-4ee6-9bfd-1d2eeb997de4',[6,6,4],12),('gadgets','ee16f551-f723-47a2-b185-974be5924759',[8,8],0),('throw-states','9272518a-c1cb-4b87-9443-265de340a13d',[4,4,4,4],0),('arsenal','e3f712ac-9ae2-48a8-a630-369e7af2f68b',[4,4,4,4],0)]
d={'version':1,'sheets':[],'sheetSizes':[],'frames':[],'gait':{'strideHeight':.95,'stepsPerCycle':2},'clips':{'walk':list(range(16)),'dash':list(range(16)),'normal':list(range(16,22)),'jump':list(range(22,28)),'idle':[56,57],'guard':[58,59],'hit':[60,61],'ko':[62,63],'skill0':list(range(32,40)),'skill1':list(range(40,48)),'skill2':list(range(48,56)),'ultimate':list(range(64,80))}}
for si,(name,uid,rows,neutral) in enumerate(spec):
 a=np.array(Image.open('generated_images/exec-'+uid+'.png').convert('RGBA'));lab,n=label(a[:,:,3]>160);z=np.bincount(lab.ravel());objs=find_objects(lab);q=[(i,objs[i-1]) for i,s in enumerate(z) if i and s>1000];assert len(q)==16,(name,len(q));q.sort(key=lambda v:v[1][0].start);order=[];j=0
 for count in rows:order+=sorted(q[j:j+count],key=lambda v:v[1][1].start);j+=count
 ref=order[neutral][1][0].stop-order[neutral][1][0].start;atlas=Image.new('RGBA',(2048,2048))
 for fi,(component,(y,x)) in enumerate(order):
  mask=binary_dilation(lab==component,iterations=2);piece=a[y,x].copy();piece[:,:,3]=np.where(mask[y,x],piece[:,:,3],0);h,w=piece.shape[:2];assert w<508 and h<508
  rgb=piece[:,:,:3].astype(float);yy,xx=np.indices((h,w));green=(rgb[:,:,1]>rgb[:,:,0]*1.05)&(rgb[:,:,1]>rgb[:,:,2]*1.1)&(rgb[:,:,1]>110)&(piece[:,:,3]>160)
  eyes=green&(yy<h*.35);headx=float(np.median(xx[eyes])) if eyes.sum()>12 else w*.5
  ox=headx-ref*.04;oy=h-2;device=green&(yy>h*.32)
  if device.sum()>8:
   ex=float(np.percentile(xx[device],95));ey=float(np.median(yy[device&(xx>ex-8)]))
  else:ex=w*.92;ey=h*.47
  # Release hand is above the head during the overhand throw, after the grenade leaves.
  if si==3 and fi==4:ex=w*.94;ey=h*.08
  reviewed={(1,2):(345,60),(1,4):(260,78),(2,3):(201,94),(2,11):(177,230)}
  if (si,fi) in reviewed:ex,ey=reviewed[si,fi]
  cx=fi%4*512+(512-w)//2;cy=fi//4*512+508-h;atlas.alpha_composite(Image.fromarray(piece),(cx,cy))
  d['frames'].append({'sheet':si,'rect':[cx,cy,w,h],'origin':[round(ox,2),oy],'referenceHeight':ref,'emitter':[round(ex,2),round(ey,2)]})
 p=out/(name+'.webp');atlas.save(p,'WEBP',lossless=True,method=6);p.with_suffix('.b64').write_text(base64.b64encode(p.read_bytes()).decode());d['sheets'].append('assets/grey-matter-detailed/'+p.name);d['sheetSizes'].append([2048,2048]);print(name,'neutral',ref,'bytes',p.stat().st_size)
(root/'web/grey-matter-detailed-data.js').write_text("'use strict';\nconst GREYMATTER_DETAILED="+json.dumps(d,separators=(',',':'))+';\n');(root/'ci/animation-review/grey-matter-detailed/atlas.json').write_text(json.dumps(d,indent=2))
