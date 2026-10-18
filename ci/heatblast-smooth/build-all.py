"""Bake all nine aliens using the approved Heatblast flow, retaining source pixels."""
from pathlib import Path
import json, math
import numpy as np
from PIL import Image
from interpolate import flows, between
manifest=json.loads(Path('web/assets/drawn-aliens/manifest.json').read_text())
all_data={}
for alien_id,data in manifest['characters'].items():
 atlas=Image.open(Path('web')/data['src']).convert('RGBA')
 dst=Path('web/assets/alien-smooth')/data['name'];dst.mkdir(parents=True,exist_ok=True)
 images=[];arrays=[];meta=[];CELL=256;ratio=1
 def add(im,provenance):
  bounds=im.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox()
  lift=max(0,bounds[3]-240) if bounds else 0
  if lift:
   registered=Image.new('RGBA',(CELL,CELL));registered.paste(im,(0,-lift));im=registered
  a=np.asarray(im).copy();a[a[:,:,3]==0,:3]=0
  index=len(images);images.append(Image.fromarray(a));meta.append(provenance);return index
 for i,m in enumerate(data['frames']):
  x,y,w,h,ox,oy=m
  cut=atlas.crop((x,y,x+w,y+h))
  runs=data.get('masks',[])
  if runs:
   a=np.asarray(cut).copy();mask=np.zeros(w*h,dtype=np.uint8)
   for offset,length in zip(runs[i][::2],runs[i][1::2]):mask[offset:offset+length]=255
   a[:,:,3]=np.minimum(a[:,:,3],mask.reshape(h,w));cut=Image.fromarray(a)
  im=Image.new('RGBA',(256,256));im.paste(cut,(128-ox,240-oy))
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
 count=len(images);sources=[]
 for sheet in range(math.ceil(count/16)):
  im=Image.new('RGBA',(CELL*4,CELL*4))
  for j,frame in enumerate(images[sheet*16:(sheet+1)*16]):im.paste(frame,(j%4*CELL,j//4*CELL))
  filename=f'atlas-{sheet}.webp';im.save(dst/filename,lossless=True,method=4,exact=True);sources.append(str(dst.relative_to('web')/filename))
 all_data[alien_id]={'cell':CELL,'columns':4,'width':1024,'height':1024,'sheetFrames':16,'frameCount':count,'originX':128,'ground':240,'standingHeight':data['standingHeight'],'sources':sources,'clips':clips,'frames':meta}
 print('BAKED',data['name'],count,flush=True)
Path('web/alien-smooth-data.js').write_text("'use strict';\nconst ALIEN_SMOOTH="+json.dumps(all_data,separators=(',',':'))+';\n')
