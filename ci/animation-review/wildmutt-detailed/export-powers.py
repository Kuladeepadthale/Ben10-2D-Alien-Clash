# Preserve original generated pixels; extract isolated cels into lossless atlases.
from PIL import Image
from scipy.ndimage import label,find_objects,binary_dilation
import numpy as np,json,pathlib,base64
root=pathlib.Path('unique-work');out=root/'web/assets/wildmutt-detailed'
src=(root/'web/wildmutt-detailed-data.js').read_text();data=json.loads(src.split('=',1)[1].strip().rstrip(';'));data['version']=4
data['frames']=data['frames'][:64];data['sheets']=data['sheets'][:4]
spec=[('pounce-v4','c48b2b79-f3e1-46c4-8ecf-3964ff547430','skill0'),('claws-v4','55f67a9b-88a6-47e0-a504-750ea6f7ee24','skill1'),('lunge-v4','abb09044-cdbf-49bc-a1ae-9512fb56e4e4','skill2'),('apex-v4','e92ab491-5273-4164-a149-282081850593','ultimate')]
data['sheetSizes']=[[1536,1536]]*4
for key,uid,clip in spec:
 a=np.array(Image.open('generated_images/exec-'+uid+'.png').convert('RGBA'));lab,n=label(a[:,:,3]>160);sizes=np.bincount(lab.ravel());objs=find_objects(lab)
 found=[(i,objs[i-1]) for i,s in enumerate(sizes) if i and s>1000];assert len(found)==16
 found.sort(key=lambda q:(q[1][0].start+q[1][0].stop)/2);ordered=[]
 for r in range(4):ordered+=sorted(found[r*4:r*4+4],key=lambda q:(q[1][1].start+q[1][1].stop)/2)
 # Neutral frame physical height establishes one constant scale for the entire sheet.
 ref=ordered[0][1][0].stop-ordered[0][1][0].start
 si=len(data['sheets']);start=len(data['frames']);atlas=Image.new('RGBA',(2048,2048))
 for fi,(component,box) in enumerate(ordered):
  y,x=box;mask=binary_dilation(lab==component,iterations=2);piece=a[y,x].copy();piece[:,:,3]=np.where(mask[y,x],piece[:,:,3],0);im=Image.fromarray(piece);w,h=im.size;assert w<508 and h<508
  rgb=piece[:,:,:3].astype(float);mx=rgb.max(2);mn=rgb.min(2);gray=((mx-mn)<32)&(mx>85)&(mx<246)&(piece[:,:,3]>180);yy,xx=np.indices((h,w));gray&=(xx<w*.49)&(yy<h*.64)&(yy>3)
  bx=float(np.median(xx[gray])) if gray.sum()>15 else w*.23
  ox=bx+ref*.23;oy=h-2;cx=fi%4*512+(512-w)//2;cy=fi//4*512+508-h;atlas.alpha_composite(im,(cx,cy))
  data['frames'].append({'sheet':si,'rect':[cx,cy,w,h],'origin':[round(ox,2),oy],'referenceHeight':ref})
 p=out/(key+'.webp');atlas.save(p,'WEBP',lossless=True,method=6);p.with_suffix('.b64').write_text(base64.b64encode(p.read_bytes()).decode());data['sheets'].append('assets/wildmutt-detailed/'+p.name);data['sheetSizes'].append([2048,2048]);data['clips'][clip]=list(range(start,start+16));print(key,'reference',ref,'bytes',p.stat().st_size)
(root/'web/wildmutt-detailed-data.js').write_text("'use strict';\nconst WILDMUTT_DETAILED="+json.dumps(data,separators=(',',':'))+';\n');(root/'ci/animation-review/wildmutt-detailed/atlas.json').write_text(json.dumps(data,indent=2))
