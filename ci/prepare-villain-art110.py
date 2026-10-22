"""Prepare generated whole figures into reviewed production atlases (offline art step)."""
from pathlib import Path
from PIL import Image
from io import BytesIO
import json,ast,hashlib
import numpy as np
from full_poses import whole_poses
R=Path(__file__).resolve().parents[1];OUT=R/'web/assets/villains-expansion110';OUT.mkdir(exist_ok=True)
def constant(path,name):return json.JSONDecoder().raw_decode(path.read_text().split('const '+name+'=',1)[1])[0]
base=constant(R/'web/villain-data.js','VILLAIN_DATA')['characters'][:30]
profiles=constant(R/'web/power-profiles.js','POWER_PROFILES')
defs=json.loads((R/'ci/villain-expansion110.json').read_text());sources=json.loads((R/'ci/villain-art-sources110.json').read_text())
# Reuse the established numerical kit budgets, then give each new villain their own names.
module=ast.parse((R/'ci/build-villains.py').read_text());ns={};exec(compile(ast.Module(body=[n for n in module.body if isinstance(n,ast.FunctionDef) and n.name in ['kit','power']],type_ignores=[]),'kit-budgets','exec'),ns)
colors={tag:base[next(i for i,v in enumerate(base) if v['type']==ns['kit'](tag)[0])]['color'] for tag in set(d[3] for d in defs)}
def save(im,path):
 for quality in [98,96,94,92]:
  buf=BytesIO();im.save(buf,'WEBP',quality=quality,method=2,exact=True);raw=buf.getvalue()
  if len(raw)<560000:break
 assert len(raw)<650000,(path,len(raw));Image.open(BytesIO(raw)).load();path.write_bytes(raw)
 return hashlib.sha256(raw).hexdigest()
def pack(path,cols,rows):
 if str(path)==sources['new'].get('d-void'):
  poses=whole_poses(Image.open(path),cols,rows,row_counts=[4,4,4,3]);patch=whole_poses(Image.open(sources['dvoid_patch']),2,1);ratio=poses[13][0].height/patch[0][0].height
  fixed=[]
  for im,meta in patch:
   im=im.resize((round(im.width*ratio),round(im.height*ratio)),Image.Resampling.LANCZOS);fixed.append((im,{**meta,'sourcePixels':int((np.array(im)[:,:,3]>100).sum())}))
  poses=poses[:13]+fixed+poses[14:]
 else:poses=whole_poses(Image.open(path),cols,rows,threshold=180 if str(path)==sources['new'].get('looma') else 100)
 assert len(poses)==cols*rows
 side=max(max(im.size) for im,_ in poses)+40
 atlas=Image.new('RGBA',(side*cols,side*rows));frames=[]
 for i,(im,meta) in enumerate(poses):
  x=i%cols*side+(side-im.width)//2;y=i//cols*side+side-20-im.height;atlas.paste(im,(x,y));a=np.array(im);yy,xx=np.indices(a.shape[:2]);band=(a[:,:,3]>180)&(yy>im.height*.5)&(yy<im.height*.7);anchor=float(np.median(xx[band])) if band.any() else im.width/2
  if rows==2 and str(path)!=sources.get('close',{}).get('zs-skayr'):
   soles=(a[:,:,3]>180)&(yy>im.height*.91)
   if soles.any():anchor=float(np.median(xx[soles]))
  frames.append(dict(rect=[x-8,y-8,im.width+16,im.height+16],origin=[round(anchor+8,2),im.height+8],**meta))
 return atlas,frames,poses
# A marker touches opaque artwork near the intended body part, not transparent atlas padding.
def marker(atlas,frame,source):
 x,y,w,h=frame['rect'];a=np.array(atlas.crop((x,y,x+w,y+h)));ys,xs=np.where(a[:,:,3]>180)
 u,v={'mouth':(.7,.23),'eyes':(.65,.15),'feet':(.65,.9),'body':(.55,.5),'chest':(.5,.4),'head':(.55,.15),'staff':(.85,.35),'weapon':(.87,.4),'hands':(.87,.4),'claws':(.87,.4),'hair':(.9,.4),'bandages':(.9,.4),'tentacles':(.9,.4),'tail':(.85,.7)}.get(source,(.85,.4))
 distance=(xs-w*u)**2+(ys-h*v)**2;k=int(np.argmin(distance));return [int(xs[k]),int(ys[k])]
source_by_slug={'argit':'hands','ssserpent':'mouth','sunder':'weapon','sevenseven':'weapon','eighteight':'weapon','attea':'weapon','billy-billions':'weapon','albedo':'hands','dr-psychobos':'claws','khyber':'weapon','malware':'hands'}
new=[];newprofiles=[];replacements=[];hashes={}
for j,d in enumerate(defs):
 slug,name,description,tag,*names=d;atlas,frames,poses=pack(sources['new'][slug],4,4);typ,kit=ns['kit'](tag)
 for a,name0 in zip(kit['skills']+[kit['ultimate']],names):a['name']=name0
 # Ranged villains fire a lighter version of their characteristic first power for basic attacks.
 if tag in ['Hunter','Tech','Acid','Magic','Robot']:kit['basicSkillIndex']=0
 folder=OUT/slug;folder.mkdir(exist_ok=True);hashes[slug+'/actions.webp']=save(atlas,folder/'actions.webp');portrait=poses[0][0].copy();portrait.thumbnail((300,380),Image.Resampling.LANCZOS);hashes[slug+'/portrait.webp']=save(portrait,folder/'portrait.webp')
 height=245 if slug in ['highbreed','looma','d-void','malware','fistina'] else 165 if slug in ['billy-billions','dr-psychobos'] else 215
 ref=poses[0][0].height;row=[]
 for n,a in enumerate(kit['skills']+[kit['ultimate']]):
  source=source_by_slug.get(slug,'hands')
  if a['kind'] in ['ground','leapslam']:source='feet'
  if a['kind'] in ['rush','pounce','vortex']:source='body'
  phases=[]
  for ix in [6,8+n]:
   pix=marker(atlas,frames[ix],source);ox,oy=frames[ix]['origin'];phases.append(dict(frame=ix,pixel=pix,offset=[round((pix[0]-ox)*height/ref,3),round((pix[1]-oy)*height/ref,3)]))
  row.append(dict(name=a['name'],source=source,theme={'phase':'phase','electric':'electric','slime':'slime','crystal':'crystal','slam':'physical','dash':'physical','pulse':'energy'}.get(typ,'energy'),color=colors[tag],phases=phases,kind=a['kind'],ticks=a.get('ticks',1)))
  key='ultimate' if n==3 else 'skill'+str(n)
  for phase in phases:frames[phase['frame']].setdefault('emitters',{})[key]=phase['pixel']
 for n,ability in enumerate(row):frames[7].setdefault('emitters',{})['ultimate' if n==3 else 'skill'+str(n)]=marker(atlas,frames[7],ability['source'])
 for ix in [7,12]:frames[ix].setdefault('emitters',{})['normal']=marker(atlas,frames[ix],'hands')
 new.append(dict(id=30+j,slug=slug,name=name,description=name+' uses '+names[0].lower()+' and '+names[1].lower()+'. Watch the wind-up, dodge, then counter.',type=typ,color=colors[tag],height=height,bodyHeight=height*.9,src='assets/villains-expansion110/'+slug+'/actions.webp',portrait='assets/villains-expansion110/'+slug+'/portrait.webp',referenceHeight=ref,frames=frames,kit=kit,chapter=2))
 if any(a['kind']=='melee' for a in kit['skills']+[kit['ultimate']]):
  primary=next(n for n,a in enumerate(kit['skills']+[kit['ultimate']]) if a['kind']=='melee');contact=8+primary;close=[]
  for ix in [6,7,6,contact,6,contact,6,12]:
   frame=json.loads(json.dumps(frames[ix]));frame.update(referenceHeight=ref,closeCombat=True,contact=marker(atlas,frame,row[primary]['source']));close.append(frame)
  new[-1].update(closeSrc=new[-1]['src'],closeFrames=close)
 new[-1]['rangedPose']=7
 newprofiles.append(row);print('Packed',slug)
for slug,path in sources.get('close',{}).items():
 villain=next(v for v in base if v['slug']==slug);atlas,frames,poses=pack(path,4,2);folder=OUT/slug;folder.mkdir(exist_ok=True);hashes[slug+'/close.webp']=save(atlas,folder/'close.webp')
 for frame in frames:frame['referenceHeight']=poses[0][0].height;frame['closeCombat']=True;frame['contact']=marker(atlas,frame,'mouth' if slug=='great-one' else 'hands')
 replacements.append(dict(id=villain['id'],src='assets/villains-expansion110/'+slug+'/close.webp',frames=frames));print('Packed replacement',slug)
manifest=dict(version=110,new=new,profiles=newprofiles,close=replacements,sha256=hashes)
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2));print('Saved',len(new),'new opponents and',len(replacements),'replacement close clips')
