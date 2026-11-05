from PIL import Image
import numpy as np,json
from scipy.ndimage import label
from pathlib import Path
import os
os.chdir(Path(__file__).parent)
for slug in ['xlr8','upgrade','stinkfly','ghostfreak']:
 frames=[];sheets=[]
 for si,part in enumerate(['motion','powers']):
  im=Image.open(Path(f'{slug}-{part}.png') if Path(f'{slug}-{part}.png').exists() else Path('source')/f'{slug}-{part}.png').convert('RGB');a=np.array(im);H,W=a.shape[:2];out=np.zeros((H,W,4),dtype='uint8')
  for i in range(16):
   x0=round(i%4*W/4);x1=round((i%4+1)*W/4);y0=round(i//4*H/4);y1=round((i//4+1)*H/4);p=a[y0:y1,x0:x1];mx=p.max(2).astype(float);mn=p.min(2).astype(float);white=(mn>225)&(mx-mn<22);lab,n=label(white);edge=np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]]));edge=edge[edge!=0];bg=np.isin(lab,edge);mask=~bg;yy,xx=np.where(mask);top=int(yy.min());bottom=int(yy.max());left=int(xx.min());right=int(xx.max());ax=(left+right)/2
   # Ground sole / body center registration; one constant body scale across all poses.
   out[y0:y1,x0:x1,:3]=p;out[y0:y1,x0:x1,3]=np.where(bg,0,255);frames.append({'sheet':si,'rect':[x0,y0,x1-x0,y1-y0],'origin':[ax,bottom],'bounds':[left,top,right,bottom]})
  Image.fromarray(out).save(f'{slug}-{part}.webp',quality=95,method=6);sheets.append({'src':f'{slug}-{part}.webp','width':W,'height':H})
 ref=frames[8]['bounds'][3]-frames[8]['bounds'][1]
 clips={'idle':[8],'walk':list(range(8)),'normal':[8,9,10,11,12,13,14,15],'skill0':[16,17,18,19],'skill1':[20,21,22,23],'skill2':[8,9,10,11,12,13,14,15],'ultimate':[24,25,26,27],'jump':[24,25,26,27],'guard':[28],'hit':[29,30],'ko':[31]}
 if slug=='upgrade':clips.update(normal=[8,9,10,11],skill0=[16,17,18,19],skill1=[8,9,10,11,12,13,14,15],skill2=[20,21,22,23])
 if slug=='stinkfly':clips.update(idle=list(range(8)),normal=[8,9,10,11],skill0=[8,9,10,11,12,13,14,15],skill1=[16,17,18,19],skill2=[20,21,22,23])
 if slug=='ghostfreak':clips.update(idle=list(range(8)),normal=[8,9,10,11,12,13,14,15],skill0=[8,9,10,11],skill1=[16,17,18,19],skill2=[20,21,22,23])
 if slug=='xlr8':clips.update(skill0=[8,9,10,11],skill1=[16,17,18,19],skill2=[20,21,22,23])
 # Center the torso rather than centering the whole outline during an arm/tail extension.
 for f in frames:
  si=f['sheet'];x0,y0,w,h=f['rect'];img=Image.open(f'{slug}-'+['motion','powers'][si]+'.webp').convert('RGBA');crop=np.array(img)[y0:y0+h,x0:x0+w];l,t,r,b=f['bounds'];ym=round(t+(b-t)*.56);ys,xs=np.where(crop[max(0,ym-4):ym+5,:,3]>150)
  if len(xs):f['origin'][0]=float(np.median(xs))
  if slug=='ghostfreak':f['origin'][1]=t+ref

 for f in frames:f['referenceHeight']=ref
 json.dump({'slug':slug,'status':'ART_UPLOADED_INTEGRATION_PENDING','referenceHeight':ref,'sheets':sheets,'frames':frames,'clips':clips},open(slug+'.json','w'),indent=2)
 print(slug,'32 frames','reference',ref)
