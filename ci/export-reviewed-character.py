"""Pack reviewed native artwork, retain source pixels and register body-only power origins."""
from pathlib import Path
import json,sys,hashlib,io,os,subprocess
import numpy as np
from PIL import Image
from scipy import ndimage
from full_poses import whole_poses,pack_poses
R=Path(__file__).resolve().parents[1];slug=sys.argv[1];recpath=R/'ci/animation-review/characters'/f'{slug}.json';rec=json.loads(recpath.read_text());id=rec['id'];out=R/'web/assets/reviewed-native'/slug;out.mkdir(parents=True,exist_ok=True)
def save_native(image,path):
 buffer=io.BytesIO();image.save(buffer,format='WEBP',lossless=True,quality=100,method=4,exact=True);data=buffer.getvalue();assert len(data)>100;temp=path.with_suffix('.writing');temp.write_bytes(data);os.replace(temp,path);assert path.read_bytes()==data
cfg=json.loads(subprocess.check_output(['node','-e',"const fs=require('fs'),vm=require('vm'),b=vm.createContext({});vm.runInContext(fs.readFileSync('web/data.js','utf8'),b);console.log(vm.runInContext('JSON.stringify(aliens["+str(id)+"])',b))"],cwd=R))
assert rec['renderHeight']==cfg['renderHeight'] and rec['scale']==cfg['scale'],'Exporter must use configured body size'
c={'id':id,'name':slug,'sheets':[],'frames':[],'clips':{},'reviewedRevision':rec.get('revision',1),'requestedRepair124':rec.get('requestedRepair124',False)}
images=[]
for si,kind in enumerate(['walk','jump-strike','powers','states']):
 src=R/rec['sources'][kind];poses=whole_poses(Image.open(src),attachment_ratio=rec.get('attachmentRatio',.05));assert len(poses)==8
 if kind in rec.get('poseSelections',{}):poses=[poses[i] for i in rec['poseSelections'][kind]]
 sheet,places=pack_poses(poses,padding=24);dest=out/(kind+'.webp');save_native(sheet,dest);images.append(sheet)
 c['sheets'].append({'src':str(dest.relative_to(R/'web')),'width':sheet.width,'height':sheet.height,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
 for cell,(x,y,w,h,meta) in enumerate(places):
  im=poses[cell][0];a=np.array(im);yy,xx=np.indices(a.shape[:2]);mask=(a[:,:,3]>180)&(yy>h*.48)&(yy<h*.72);anchor=float(np.median(xx[mask])) if mask.any() else w/2
  ground=h+(h*.15 if kind=='jump-strike' and cell==2 else 0)
  c['frames'].append({'sheet':si,'rect':[x-8,y-8,w+16,h+16],'origin':[round(anchor+8,2),round(ground+8,2)],'source':kind,'cell':cell,'bounds':[0,0,w,h],**meta,'referenceHeight':rec.get('frameReferenceHeights',{}).get(str(si*8+cell),rec['referenceHeightBySource'][kind])})
for fi,f in enumerate(c['frames']):
 if str(fi) in rec.get('frameOrigins',{}):f['origin']=rec['frameOrigins'][str(fi)]
c['clips']={'walk':list(range(8)),'jump':list(range(8,12)),'normal':list(range(12,16)),'skill0':[16,17,18],'skill1':[19,20,21],'skill2':[22,23],'ultimate':[24,25,26],'idle':[27],'guard':[28],'hit':[29],'ko':[30],'dash':[31]}
if slug in ['eatle','spitter']:c['clips']['skill2']=[22,23,21]
c['referenceHeight']=rec['referenceHeightBySource']['states']
for key in ['normal','skill0','skill1','skill2','ultimate']:
 for fi in c['clips'][key]:
  f=c['frames'][fi];x,y,w,h=f['rect'];a=np.array(images[f['sheet']])[y:y+h,x:x+w];rgb=a[:,:,:3].astype(float)
  if str(fi) in rec.get('preservedEmitters',{}) and key in rec['preservedEmitters'][str(fi)]:
   f.setdefault('emitters',{})[key]=rec['preservedEmitters'][str(fi)][key];continue
  if slug=='water-hazard':
   mask=(a[:,:,3]>180)&(rgb[:,:,2]>140)&(rgb[:,:,2]>rgb[:,:,0]*1.3)&(rgb[:,:,2]>rgb[:,:,1]*1.12)
  elif slug=='lodestar':
   mask=(a[:,:,3]>180)&(rgb.min(axis=2)>35)&(rgb.max(axis=2)-rgb.min(axis=2)<40)&(rgb.max(axis=2)<220)
  elif slug=='nanomech':
   yy,xx=np.indices(a.shape[:2]);target=rec['emitterTargets'][str(fi)];mask=(a[:,:,3]>180)&(rgb[:,:,1]>80)&(rgb[:,:,1]>rgb[:,:,0]*1.05)&(rgb[:,:,1]>rgb[:,:,2]*1.05)
   ys,xs=np.where(mask);assert len(xs)>0;near=int(np.argmin((xs-w*target[0])**2+(ys-h*target[1])**2));f.setdefault('emitters',{})[key]=[int(xs[near]),int(ys[near])];continue
  elif slug=='ampfibian':
   yy,xx=np.indices(a.shape[:2]);target=rec['emitterTargets'][str(fi)];mask=(a[:,:,3]>180)&(rgb[:,:,2]>100)&(rgb[:,:,2]>rgb[:,:,0]*1.2)
   ys,xs=np.where(mask);assert len(xs)>0;near=int(np.argmin((xs-w*target[0])**2+(ys-h*target[1])**2));f.setdefault('emitters',{})[key]=[int(xs[near]),int(ys[near])];continue
  elif slug in ['shocksquatch','feedback','bloxx','gravattack']:
   yy,xx=np.indices(a.shape[:2]);target=rec['emitterTargets'][str(fi)];mask=(a[:,:,3]>180)
   if slug=='shocksquatch':mask=mask&(rgb.min(axis=2)>85)&(rgb.max(axis=2)-rgb.min(axis=2)<65)
   elif slug=='feedback':
    if key!='skill2':
     mask=mask&(rgb[:,:,0]>140)&(rgb[:,:,1]>75)&(rgb[:,:,1]>rgb[:,:,2]*1.45)&(rgb[:,:,0]>rgb[:,:,2]*1.5)
     if key=='skill1':mask=mask&(yy<h*.43)
   elif slug=='bloxx':
    if key not in ['skill2','ultimate']:mask=mask&(rgb[:,:,0]>100)&(rgb[:,:,0]>rgb[:,:,1]*1.35)&(rgb[:,:,0]>rgb[:,:,2]*1.15)
   elif slug=='gravattack' and key not in ['normal','skill2']:
    mask=mask&(rgb[:,:,0]>180)&(rgb[:,:,1]>75)&(rgb[:,:,1]>rgb[:,:,2]*1.5)&(rgb[:,:,0]>rgb[:,:,1]*1.04)&(yy>h*.35)&(yy<h*.82);target=[.58,.57]
   ys,xs=np.where(mask);assert len(xs)>0,(slug,key,fi);near=int(np.argmin((xs-w*target[0])**2+(ys-h*target[1])**2));f.setdefault('emitters',{})[key]=[int(xs[near]),int(ys[near])];continue
  elif slug in ['wildmutt','ripjaws','wildvine','snare-oh','upchuck','spitter','the-worst']:
   target=rec['emitterTargets'][str(fi)];yy,xx=np.indices(a.shape[:2]);mask=(a[:,:,3]>180)
   if slug=='spitter' and key=='skill2':
    if fi==21:target=[.12,.65]
    mask=mask&(rgb[:,:,0]<180)&(rgb[:,:,1]>45)&(rgb[:,:,1]>rgb[:,:,2]*1.15)
   elif slug in ['upchuck','spitter'] and key!='normal':
    if not(slug=='spitter' and key=='skill2'):mask=mask&(rgb[:,:,0]>rgb[:,:,1]*1.1)&(rgb[:,:,0]>rgb[:,:,2]*1.1)&(yy<h*.65)
   ys,xs=np.where(mask)
   if len(xs)==0:ys,xs=np.where(a[:,:,3]>180)
   near=int(np.argmin((xs-w*target[0])**2+(ys-h*target[1])**2));f.setdefault('emitters',{})[key]=[int(xs[near]),int(ys[near])];continue
  elif slug=='clockwork':
   yy,xx=np.indices(a.shape[:2]);mask=(a[:,:,3]>180)
   if fi in [22,23]:
    target=rec['emitterTargets'][str(fi)];ys,xs=np.where(mask);near=int(np.argmin((xs-w*target[0])**2+(ys-h*target[1])**2));point=[int(xs[near]),int(ys[near])]
   else:
    green=mask&(rgb[:,:,1]>100)&(rgb[:,:,1]>rgb[:,:,0]*1.12)&(rgb[:,:,1]>rgb[:,:,2]*1.12)&(yy>h*.25)&(yy<h*.70);gy,gx=np.where(green);assert len(gx)>0;ys,xs=np.where(mask);near=int(np.argmin((xs-gx.mean())**2+(ys-gy.mean())**2));point=[int(xs[near]),int(ys[near])]
   f.setdefault('emitters',{})[key]=point;continue
  elif slug=='jury-rigg':
   yy,xx=np.indices(a.shape[:2]);target=rec['emitterTargets'][str(fi)];mask=(a[:,:,3]>180)
   if fi in [16,17,18,19,22,23,24,25,26]:mask=mask&(rgb[:,:,1]>100)&(rgb[:,:,1]>rgb[:,:,0]*1.15)&(rgb[:,:,1]>rgb[:,:,2]*1.05)
   ys,xs=np.where(mask);assert len(xs)>0;near=int(np.argmin((xs-w*target[0])**2+(ys-h*target[1])**2));f.setdefault('emitters',{})[key]=[int(xs[near]),int(ys[near])];continue
  elif slug=='eatle':
   yy,xx=np.indices(a.shape[:2]);target=rec['emitterTargets'][str(fi)];mask=(a[:,:,3]>180)
   if fi in [19,20,21] and key!='skill2':target=[.55,.55]
   elif key=='skill2':mask=mask&(yy<h*.45)&~((rgb[:,:,1]>rgb[:,:,0]*1.2)&(rgb[:,:,1]>rgb[:,:,2]*1.1))
   else:mask=mask&(rgb[:,:,1]>120)&(rgb[:,:,1]>rgb[:,:,0]*1.2)&(rgb[:,:,1]>rgb[:,:,2]*1.1)&(yy<h*.68)
   ys,xs=np.where(mask);assert len(xs)>0;near=int(np.argmin((xs-w*target[0])**2+(ys-h*target[1])**2));f.setdefault('emitters',{})[key]=[int(xs[near]),int(ys[near])];continue
  elif slug=='chamalien':
   yy,xx=np.indices(a.shape[:2]);target=rec['emitterTargets'][str(fi)];mask=(a[:,:,3]>180)
   if fi in [16,17,18,24,25,26]:target=[.55,.5]
   else:mask=mask&(rgb[:,:,0]>55)&(rgb[:,:,2]>rgb[:,:,0]*1.1)&(rgb[:,:,1]<rgb[:,:,0]*.8)
   ys,xs=np.where(mask);assert len(xs)>0;near=int(np.argmin((xs-w*target[0])**2+(ys-h*target[1])**2));f.setdefault('emitters',{})[key]=[int(xs[near]),int(ys[near])];continue
  elif slug=='fasttrack':
   yy,xx=np.indices(a.shape[:2]);target=rec['emitterTargets'][str(fi)];mask=(a[:,:,3]>180)
   if fi not in [16,17,18,24,25,26]:mask=mask&(rgb[:,:,2]>90)&(rgb[:,:,2]>rgb[:,:,0]*1.5)&(rgb[:,:,2]>rgb[:,:,1]*1.2)
   else:target=[.55,.5]
   ys,xs=np.where(mask);assert len(xs)>0;near=int(np.argmin((xs-w*target[0])**2+(ys-h*target[1])**2));f.setdefault('emitters',{})[key]=[int(xs[near]),int(ys[near])];continue
  elif slug=='nrg':
   yy,xx=np.indices(a.shape[:2]);target=rec['emitterTargets'][str(fi)];mask=(a[:,:,3]>180)&(rgb[:,:,1]>120)&(rgb[:,:,1]>rgb[:,:,0]*1.35)&(rgb[:,:,1]>rgb[:,:,2]*1.3)&(yy<h*.36)
   ys,xs=np.where(mask);assert len(xs)>0,(fi,'missing grille');near=int(np.argmin((xs-w*target[0])**2+(ys-h*target[1])**2));f.setdefault('emitters',{})[key]=[int(xs[near]),int(ys[near])];continue
  elif slug=='terraspin':
   yy,xx=np.indices(a.shape[:2]);target=rec['emitterTargets'][str(fi)];mask=(a[:,:,3]>180)&(rgb.max(axis=2)<75)&(yy>h*.22)&(yy<h*.78)
   ys,xs=np.where(mask);assert len(xs)>0;near=int(np.argmin((xs-w*target[0])**2+(ys-h*target[1])**2));f.setdefault('emitters',{})[key]=[int(xs[near]),int(ys[near])];continue
  elif slug=='armodrillo':
   yy,xx=np.indices(a.shape[:2]);target=rec['emitterTargets'][str(fi)];mask=(a[:,:,3]>180)&(rgb.max(axis=2)-rgb.min(axis=2)<38)&(rgb.min(axis=2)>45)&(rgb.max(axis=2)<220)
   ys,xs=np.where(mask);assert len(xs)>0;near=int(np.argmin((xs-w*target[0])**2+(ys-h*target[1])**2));f.setdefault('emitters',{})[key]=[int(xs[near]),int(ys[near])];continue
  elif slug=='rath':
   yy,xx=np.indices(a.shape[:2]);target=rec.get('emitterTargets',{}).get(str(fi),[.8,.45]);mask=(a[:,:,3]>180)&(rgb.min(axis=2)>150)&(yy<h*.78)
   ys,xs=np.where(mask);assert len(xs)>0
   near=int(np.argmin((xs-w*target[0])**2+(ys-h*target[1])**2));f.setdefault('emitters',{})[key]=[int(xs[near]),int(ys[near])];continue
  else:raise ValueError('Species-specific emitter registration required: '+slug)
  labels,n=ndimage.label(mask);objects=ndimage.find_objects(labels);candidates=[]
  for label,box in enumerate(objects,1):
   if box is None:continue
   yy,xx=np.where(labels==label)
   if len(xx)>=12:candidates.append((float(xx.mean()),float(yy.mean()),label))
  assert candidates,(slug,key,fi,'no visible blue gauntlet port')
  ex,ey,label=max(candidates);yy,xx=np.where(labels==label);nearest=int(np.argmin((xx-ex)**2+(yy-ey)**2));point=[int(xx[nearest]),int(yy[nearest])];f.setdefault('emitters',{})[key]=point
idle=c['frames'][27];x,y,w,h=idle['rect'];portrait=images[idle['sheet']].crop((x+8,y+8,x+w-8,y+h-8));save_native(portrait,out/'portrait.webp');c['portrait']=str((out/'portrait.webp').relative_to(R/'web'))
# Actual emitter points are supplied to the same browser/server power-profile code.
physical=rec['renderHeight']*rec['scale'];phases=[]
for key in ['skill0','skill1','skill2','ultimate']:
 row=[]
 for fi in c['clips'][key]:
  f=c['frames'][fi];point=f['emitters'][key];s=physical/f['referenceHeight'];row.append({'frame':fi,'pixel':point,'offset':[round((point[0]-f['origin'][0])*s,3),round((point[1]-f['origin'][1])*s,3)]})
 phases.append(row)
rev={'id':id,'slug':slug,'character':c,'power_phases':phases,'sources':rec['sources'],'prompts':rec['prompts'],'generated_with':'built-in image_gen'}
p=R/'ci/animation-review/characters'/slug/'revision.json';p.write_text(json.dumps(rev,indent=2)+'\n');print(json.dumps({'id':id,'slug':slug,'frames':len(c['frames']),'revision':str(p.relative_to(R)),'portrait_size':portrait.size,'reference_heights':rec['referenceHeightBySource']}))
