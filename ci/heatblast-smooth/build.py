"""Bake the approved original-art interpolation into phone-ready action sheets.
PYTHONPATH=/tmp/heatblast-flow python3.11 ci/heatblast-smooth/build.py
Requires Pillow, numpy and opencv-python-headless. No new character art is made.
"""
from pathlib import Path
import json,hashlib,math
import numpy as np
from PIL import Image
from interpolate import flows,between
root=Path(__file__).parent
reg=json.loads((root/'registration.json').read_text())
source=Path('web/assets/heatblast-poses/atlas-v8.png');atlas=Image.open(source).convert('RGBA')
dst=Path('web/assets/heatblast-smooth');dst.mkdir(parents=True,exist_ok=True)
tmp=Path('tmp/heatblast-smooth');tmp.mkdir(parents=True,exist_ok=True)
images=[];arrays=[];meta=[];CELL=192;ratio=CELL/256
def add(im,provenance):
 im=im.resize((CELL,CELL),Image.Resampling.LANCZOS)
 # Flow inversion can carry a heel below both registered source baselines.
 # Re-register that whole intermediate image instead of cutting off the foot.
 bounds=im.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox()
 lift=max(0,bounds[3]-int(240*ratio)) if bounds else 0
 if lift:
  registered=Image.new('RGBA',(CELL,CELL));registered.paste(im,(0,-lift));im=registered
  provenance={**provenance,'floorLift':lift}

 # Transparent RGB is irrelevant to rendering; clear it for compact atlases.
 a=np.asarray(im).copy();a[a[:,:,3]==0,:3]=0;im=Image.fromarray(a)
 bounds=im.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox()
 assert bounds and bounds[0]>=2 and bounds[1]>=2 and bounds[2]<=CELL-2 and bounds[3]<=CELL-2,(provenance,bounds)
 index=len(images);images.append(im);meta.append({'bounds':list(bounds),**provenance});return index
for i,m in enumerate(reg):
 x0,y0,x1,y1,px,py=m;x0=max(0,x0-1);y0=max(0,y0-1)
 cell=atlas.crop((i%6*181,i//6*181,(i%6+1)*181,(i//6+1)*181))
 cut=cell.crop((x0,y0,min(181,x1+2),py));im=Image.new('RGBA',(256,256));im.paste(cut,(128+x0-px,240+y0-py))
 arrays.append(np.asarray(im).astype(np.float32)/255);add(im,{'key':i})
cache={}
def edge(a,b,steps=8):
 if a==b:return [a]
 lo,hi=sorted((a,b));key=(lo,hi,steps)
 if key not in cache:
  ab,ba=flows(arrays[lo],arrays[hi]);frames=[lo]
  for j in range(1,steps):frames.append(add(between(arrays[lo],arrays[hi],ab,ba,j/steps),{'from':lo,'to':hi,'mix':j/steps}))
  frames.append(hi);cache[key]=frames;print('PAIR',lo,hi,steps,flush=True)
 return cache[key] if a==lo else list(reversed(cache[key]))
clips={}
def clip(name,keys,steps=8,loop=False):
 frames=[keys[0]]
 for a,b in zip(keys,keys[1:]):frames.extend(edge(a,b,steps)[1:])
 if loop:frames.pop()
 clips[name]={'frames':frames,'sourceKeys':keys,'loop':loop}
clip('idle',[0]);clip('walk',[6,7,8,9,10,11,6],12,True)
clip('walkEnter',[0,6])
for i in range(6,12):clip('walkExit'+str(i),[i,0])
clip('guard',[0,19,20]);clip('hit',[0,21,22,0]);clip('ko',[0,21,22,23])
clip('jumpPrepare',[0,12]);clip('jumpRise',[12,13,14,15]);clip('jumpFall',[15,16]);clip('land',[16,17,18,0])
for name,keys in [('normal',[0,24,25,26,27,28,29,0]),('fireball',[0,30,31,32,33,34,35,0]),('jet',[0,36,37,38,39,40,41,0])]:
 clip(name+'Windup',keys[:5]);clip(name+'Recovery',keys[4:])
clip('eruptionWindup',[0,42,43,44]);clip('eruptionRecovery',[44,45,0])
clip('ultimateWindup',[0,45,46,47]);clip('ultimateRecovery',[47,46,45,0])
emitters={}
for name,key,point in [('normal',27,[165,78]),('fireball',33,[160,80]),('jet',39,[155,74]),('eruption',44,[90,140]),('ultimate',47,[95,15])]:
 m=reg[key];emitters[name]=[(128+point[0]-m[4])*ratio,(240+point[1]-m[5])*ratio]
count=len(images);sources=[]
for sheet in range(math.ceil(count/64)):
 im=Image.new('RGBA',(CELL*8,CELL*8))
 for j,frame in enumerate(images[sheet*64:(sheet+1)*64]):im.paste(frame,(j%8*CELL,j//8*CELL))
 filename=f'atlas-v21-{sheet}.webp';im.save(dst/filename,lossless=True,method=5,exact=True);sources.append('assets/heatblast-smooth/'+filename)
m={'version':21,'cell':CELL,'columns':8,'width':CELL*8,'height':CELL*8,'sheetFrames':64,'frameCount':count,'originX':128*ratio,'ground':240*ratio,'standingHeight':165*ratio,'sources':sources,'clips':clips,'frames':meta,'emitters':emitters,'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'source':'Existing original Heatblast atlas-v8 artwork; offline bidirectional image interpolation from the approved preview. No live rig or runtime crossfades.'}
(dst/'animation.json').write_text(json.dumps(m,separators=(',',':'))+'\n');Path('web/heatblast-smooth-data.js').write_text("'use strict';\nconst HEATBLAST_SMOOTH="+json.dumps(m,separators=(',',':'))+';\n')
print('DONE',count,'frames',len(sources),'sheets',sum((dst/Path(s).name).stat().st_size for s in sources),'bytes',flush=True)
