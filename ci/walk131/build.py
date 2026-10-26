"""Fit native ground cycles to actual foot span; register the torso without changing source pixels."""
from pathlib import Path
import json,subprocess,numpy as np
from PIL import Image
R=Path(__file__).resolve().parents[2];O=R/'ci/walk131'
def const(p,n):return json.JSONDecoder().raw_decode(p.read_text().split('const '+n+'=',1)[1].lstrip())[0]
chars=const(R/'web/cel-data.js','CEL_DATA')['characters'];old=const(R/'web/walk128-data.js','WALK128_DATA')['characters']
node="const fs=require('fs'),vm=require('vm'),b=vm.createContext({});vm.runInContext(fs.readFileSync('web/data.js','utf8')+fs.readFileSync('web/cartoon-gaits.js','utf8')+fs.readFileSync('web/species-animation-fixes.js','utf8').split('\\n').filter(l=>/^CARTOON_GAITS\\[/.test(l)).join('\\n')+';this.out={aliens,gaits:CARTOON_GAITS,flight:LOCOMOTION126_FLIGHT}',b);console.log(JSON.stringify(b.out));"
meta=json.loads(subprocess.check_output(['node','-e',node],cwd=R));profiles={};records=[]
for c in chars:
 id=c['id'];g=meta['gaits'][id];record={'id':id,'name':meta['aliens'][id]['name']}
 if str(id) not in old:records.append(dict(record,status='preserved-approved-flight-skate-or-reference'));continue
 centres=[];footspans=[];ref=c['referenceHeight'];cache={}
 for fi in c['clips']['walk']:
  f=c['frames'][fi];path=c['sheets'][f['sheet']]['src']
  if path not in cache:cache[path]=np.array(Image.open(R/'web'/path).convert('RGBA'))[:,:,3]
  x,y,w,h=f['rect'];a=cache[path][y:y+h,x:x+w];ys,xs=np.where(a>150);top,bottom=ys.min(),ys.max();height=bottom-top;rr=f.get('referenceHeight',ref);oy,ox=np.indices(a.shape)
  # Ignore outstretched arms/tails: a central torso band owns root registration.
  mask=(a>150)&(oy>=top+height*.26)&(oy<=top+height*.58)&(abs(ox-f['origin'][0])<rr*.28)
  cy,cx=np.where(mask);centres.append((float(np.median(cx))-f['origin'][0])/rr if len(cx)>8 else 0)
  mask=(a>150)&(oy>=top+height*.82)&(abs(ox-f['origin'][0])<rr*.6)
  fy,fx=np.where(mask);footspans.append((float(np.percentile(fx,95)-np.percentile(fx,5))/rr) if len(fx)>8 else .3)
 current=old[str(id)]['stride'];special=id in [11,28,50,72,73,75,79,80,84] or any(v in g.get('style','').lower() for v in ['quadruped','four-legged','scuttle','gorilla','fluid','segmented'])
 measured=max(.44,min(1.15,2*float(np.percentile(footspans,75))))
 target=current if special else round(max(current*.68,min(current*1.18,measured)),6)
 if abs(target-current)/current<.06:target=current
 centre=float(np.median(centres));offsets=[round(max(-.06,min(.06,centre-v)),6) for v in centres]
 profiles[str(id)]={'stride':target,'offsets':offsets,'nativeFrames':len(c['clips']['walk'])}
 records.append(dict(record,status='native-ground-refit',oldStride=current,stride=target,changedStride=abs(target-current)>1e-6,torsoCorrections=offsets,speciesStridePreserved=special))
data={'version':131,'characters':profiles,'sourcePixelsChanged':False}
(R/'web/walk131-data.js').write_text("'use strict';\nconst WALK131_DATA="+json.dumps(data,separators=(',',':'))+';\n');(O/'calibration.json').write_text(json.dumps({'records':records,'profiles':len(profiles),'strideChanges':sum(r.get('changedStride',False)for r in records)},indent=2)+'\n');print(json.dumps({'profiles':len(profiles),'strideChanges':sum(r.get('changedStride',False)for r in records)}))
