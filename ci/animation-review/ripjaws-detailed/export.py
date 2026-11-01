from PIL import Image
from scipy.ndimage import label,find_objects,binary_dilation
import numpy as np,json,pathlib,base64
root=pathlib.Path('rip-work');out=root/'web/assets/ripjaws-detailed'
def pieces(uid,count,rows):
 a=np.array(Image.open('generated_images/exec-'+uid+'.png').convert('RGBA'));l,n=label(a[:,:,3]>160);z=np.bincount(l.ravel());o=find_objects(l);q=[(i,o[i-1]) for i,s in enumerate(z) if i and s>1000];assert len(q)==count,(uid,len(q));q.sort(key=lambda v:v[1][0].start);ordered=[];j=0
 for c in rows:ordered+=sorted(q[j:j+c],key=lambda v:v[1][1].start);j+=c
 result=[]
 for i,(y,x) in ordered:
  mask=binary_dilation(l==i,iterations=2);piece=a[y,x].copy();piece[:,:,3]=np.where(mask[y,x],piece[:,:,3],0);result.append((Image.fromarray(piece),[x.start,y.start]))
 return result
spec=[('body','0b5cc5b4-7fb9-4aae-afd1-52ef7a3117c8',12,None),('bite-claws','41c78ee7-0942-4d6e-8b44-818140975009',0,285),('leap-states','26be2a0d-3259-46c0-9dfc-f73383cf6d77',8,285),('frenzy','ed9b7ac0-99ed-4015-9193-44aed6a9d3d3',0,285)]
d={'version':1,'sheets':[],'sheetSizes':[],'frames':[],'gait':{'strideHeight':1},'clips':{'walk':[40,41],'dash':[7,8,9,10],'normal':list(range(6)),'jump':list(range(6,12)),'idle':[40,41],'guard':[42,43],'hit':[44,45],'ko':[46,47],'skill0':list(range(16,24)),'skill1':list(range(24,32)),'skill2':list(range(32,40)),'ultimate':list(range(48,64))}}
for si,(name,uid,neutral,override) in enumerate(spec):
 ps=pieces(uid,16,[4,4,4,4]);ref=override or ps[neutral][0].height;atlas=Image.new('RGBA',(2048,2048))
 for fi,(im,_) in enumerate(ps):
  a=np.array(im);h,w=a.shape[:2];assert w<508 and h<508;yy,xx=np.indices((h,w));dark=(a[:,:,:3].astype(int).sum(2)<110)&(a[:,:,3]>180)&(yy>h*.35)&(yy<h*.85)
  # The filled black abdominal suit anchors the pelvis, independent of arm reach.
  ox=float(np.median(xx[dark])) if dark.sum()>60 else w*.43;oy=h-2
  ex,ey=w*.93,h*.43;role='claw'
  if si==1 and fi<8:ex,ey=w*.93,h*(.26 if fi==2 else .17);role='mouth'
  if si==1 and fi in [9,11,13]:ex,ey=w*.96,h*({9:.23,11:.69,13:.43}[fi])
  if si==0 and fi in [2,4]:ex,ey=w*.96,h*({2:.34,4:.18}[fi])
  if si==3:
   if fi in [6,14]:ex,ey=w*.94,h*.23;role='mouth'
   elif fi in [3,9,12]:ex,ey=w*.96,h*({3:.22,9:.83,12:.27}[fi])
  if (si,fi) in [(0,2),(0,4),(1,9),(1,11),(1,13),(3,3),(3,9),(3,12)]:
   rgb=a[:,:,:3].astype(int);nail=(rgb[:,:,0]>120)&(rgb[:,:,1]>110)&(rgb[:,:,2]<rgb[:,:,0]*.8)&(rgb[:,:,1]>rgb[:,:,0]*.75)&(rgb[:,:,1]<rgb[:,:,0]*1.2)&(a[:,:,3]>200)
   if nail.sum()>5:ex=int(xx[nail].max());ey=float(np.mean(yy[nail&(xx>=ex-2)]))
  cx=fi%4*512+(512-w)//2;cy=fi//4*512+508-h;atlas.alpha_composite(im,(cx,cy));d['frames'].append({'sheet':si,'rect':[cx,cy,w,h],'origin':[round(ox,2),oy],'referenceHeight':ref,'emitter':[round(ex,2),round(ey,2)],'contact':role})
 p=out/(name+'.webp');atlas.save(p,'WEBP',lossless=True,method=6);d['sheets'].append('assets/ripjaws-detailed/'+p.name);d['sheetSizes'].append([2048,2048]);print(name,'model height',ref,'bytes',p.stat().st_size)
(root/'web/ripjaws-detailed-data.js').write_text("'use strict';\nconst RIPJAWS_DETAILED="+json.dumps(d,separators=(',',':'))+';\n');(root/'ci/animation-review/ripjaws-detailed/atlas.json').write_text(json.dumps(d,indent=2))
upper,offset=pieces('e49b9288-841e-47ed-be7d-c4a2425bbcb8',1,[1])[0];upper.save(out/'walk-upper.webp','WEBP',lossless=True,method=6)
parts=pieces('c1dffcf0-5ad7-40f3-8bab-65ba4263b227',6,[2,2,2]);atlas=Image.new('RGBA',(1280,1920));rects=[]
for i,(im,_) in enumerate(parts):
 w,h=im.size;x=i%2*640+(640-w)//2;y=i//2*640+(640-h)//2;atlas.alpha_composite(im,(x,y));rects.append([x,y,w,h])
atlas.save(out/'walk-legs.webp','WEBP',lossless=True,method=6)
meta={'upperSrc':'assets/ripjaws-detailed/walk-upper.webp','legsSrc':'assets/ripjaws-detailed/walk-legs.webp','upperSize':list(upper.size),'hip':[550-offset[0],1200-offset[1]],'parts':rects,'strideHeight':1,'stanceFraction':.6}
(root/'ci/animation-review/ripjaws-detailed/walk-parts.json').write_text(json.dumps(meta,indent=2))
for p in out.glob('*.webp'):p.with_suffix('.b64').write_text(base64.b64encode(p.read_bytes()).decode())
print('walk',meta)
