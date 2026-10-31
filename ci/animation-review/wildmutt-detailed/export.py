# Technical atlas extraction: retain the generated pixels, remove only disconnected noise.
from PIL import Image
from scipy.ndimage import label,find_objects,binary_dilation
import numpy as np,json,pathlib
root=pathlib.Path('wild-frames');out=root/'web/assets/wildmutt-detailed'
sheets=[('walk','exec-8e63830b-7160-4e51-a56c-3b05066bfe25.png',259),('claws','exec-0eab7d65-4b4d-43dd-bb69-cf054971ffde.png',248),('pounce','exec-b7077fb7-685b-4cd9-8933-ed8ca9439571.png',220),('states','exec-fbb3e222-582d-4f7b-99de-54d688dc2aec.png',216)]
data={'version':2,'cell':384,'sheets':[],'frames':[],'clips':{'walk':list(range(16)),'normal':list(range(16,24)),'skill1':list(range(24,32)),'skill0':list(range(32,40)),'skill2':list(range(40,48)),'ultimate':list(range(48,56)),'idle':[56,57],'guard':[58,59],'hit':[61,57],'ko':[62,63],'jump':[34,35,36,37,38],'dash':[3,4,5,6,7,8,9,10,11,12]}}
for si,(key,name,ref) in enumerate(sheets):
 a=np.array(Image.open(pathlib.Path('generated_images')/name).convert('RGBA'));lab,n=label(a[:,:,3]>160);sizes=np.bincount(lab.ravel());objs=find_objects(lab)
 found=[(i,objs[i-1]) for i,s in enumerate(sizes) if i and s>1000];assert len(found)==16,(key,len(found))
 found.sort(key=lambda q:(q[1][0].start+q[1][0].stop)/2)
 ordered=[]
 for r in range(4):ordered+=sorted(found[r*4:r*4+4],key=lambda q:(q[1][1].start+q[1][1].stop)/2)
 atlas=Image.new('RGBA',(1536,1536))
 for fi,(component,box) in enumerate(ordered):
  y,x=box;mask=binary_dilation(lab==component,iterations=2);alpha=np.where(mask,a[:,:,3],0).astype('uint8');piece=a[y,x].copy();piece[:,:,3]=alpha[y,x];im=Image.fromarray(piece);w,h=im.size;assert w<380 and h<380
  rgb=piece[:,:,:3].astype(float);mx=rgb.max(2);mn=rgb.min(2);gray=((mx-mn)<32)&(mx>85)&(mx<246)&(piece[:,:,3]>180)
  yy,xx=np.indices((h,w));gray&=(xx<w*.49)&(yy<h*.64)&(yy>3)
  bx=float(np.median(xx[gray])) if gray.sum()>15 else w*.23
  # Stable shoulder landmark; equal physical scale per sheet from neutral reference.
  ox=bx+ref*.23;oy=h-2
  cx=fi%4*384+(384-w)//2;cy=fi//4*384+380-h
  atlas.alpha_composite(im,(cx,cy))
  data['frames'].append({'sheet':si,'rect':[cx,cy,w,h],'origin':[round(ox,2),oy],'referenceHeight':ref})
 path=out/(key+'.webp');atlas.save(path,'WEBP',lossless=True,method=6)
 data['sheets'].append('assets/wildmutt-detailed/'+key+'.webp')
 print(key,path.stat().st_size)
(root/'web/wildmutt-detailed-data.js').write_text("'use strict';\nconst WILDMUTT_DETAILED="+json.dumps(data,separators=(',',':'))+';\n')
(root/'ci/animation-review/wildmutt-detailed/atlas.json').write_text(json.dumps(data,indent=2))
