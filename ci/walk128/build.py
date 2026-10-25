"""Calibrate native ground locomotion against Upgrade without redrawing any body pixels."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,subprocess,numpy as np
R=Path(__file__).resolve().parents[2];OUT=R/'ci/walk128';OUT.mkdir(exist_ok=True)
def constant(path,name):return json.JSONDecoder().raw_decode(path.read_text().split('const '+name+'=',1)[1].lstrip())[0]
characters=constant(R/'web/cel-data.js','CEL_DATA')['characters']
node=r"const fs=require('fs'),vm=require('vm'),b=vm.createContext({});vm.runInContext(fs.readFileSync('web/data.js','utf8')+fs.readFileSync('web/cartoon-gaits.js','utf8')+fs.readFileSync('web/species-animation-fixes.js','utf8').split('\n').filter(s=>/^CARTOON_GAITS\[/.test(s)).join('\n')+';this.out={aliens,gaits:CARTOON_GAITS,flight:LOCOMOTION126_FLIGHT}',b);console.log(JSON.stringify(b.out));"
meta=json.loads(subprocess.check_output(['node','-e',node],cwd=R));measurements={};tiles={}
for id,d in enumerate(characters):
 frames=[];centres=[];spreads=[];pictures={}
 for ix in d['clips']['walk']:
  fr=d['frames'][ix];src=d['sheets'][fr['sheet']]['src']
  if src not in pictures:pictures[src]=Image.open(R/'web'/src).convert('RGBA')
  x,y,w,h=fr['rect'];tile=pictures[src].crop((x,y,x+w,y+h));a=np.array(tile)[:,:,3];ys,xs=np.where(a>90)
  assert len(xs),(id,ix,'empty walk');top,bottom=int(ys.min()),int(ys.max());height=max(1,bottom-top)
  # Measure the torso, not the moving hands, head ornament or the tail near the floor.
  my,mx=np.where((a>150)&(np.indices(a.shape)[0]>=top+height*.22)&(np.indices(a.shape)[0]<=top+height*.58))
  centres.append((float(np.median(mx))-fr['origin'][0])/(fr.get('referenceHeight') or d['referenceHeight']))
  fy,fx=np.where((a>150)&(np.indices(a.shape)[0]>=top+height*.82))
  spread=float(np.percentile(fx,95)-np.percentile(fx,5)) if len(fx)>8 else 0
  spreads.append(spread/(fr.get('referenceHeight') or d['referenceHeight']));frames.append(tile)
 measurements[id]={'centres':centres,'spread':float(np.percentile(spreads,75))};tiles[id]=frames
 for im in pictures.values():im.close()
reference=measurements[6];reference_band=max(.012,float(np.max(np.abs(np.array(reference['centres'])-np.median(reference['centres'])))))
ratio=meta['gaits'][6]['stride']/max(.1,reference['spread']);output={};records=[]
for id,d in enumerate(characters):
 gait=meta['gaits'][id];m=measurements[id];old=float(gait['stride']);name=meta['aliens'][id]['name']
 approved=id in [0,1,2,4,10,19,24,26]
 excluded=approved or id==6 or str(id) in meta['flight'] or gait.get('hover') or gait.get('skate')
 record={'id':id,'name':name,'reference':'Upgrade','nativeFrames':len(d['clips']['walk']),'status':'preserved-approved-walk' if approved else 'preserved-flight-skate-or-reference' if excluded else 'calibrated-native-ground-walk'}
 if not excluded:
  # Retain species-specific crawl, waddle, fluid and running cadence. Calibrate ordinary
  # biped walking from its actual foot span; cap the change to protect previously good motion.
  special=any(s in gait.get('style','').lower() for s in ['four-legged','quadruped','gorilla','crawl','scuttle','fluid','elastic','gourmand','waddle','sprint','tiger','wolf','bounds','spring','segmented']) or id in [4,11,15,19,20,30,40,49,50,72,73,75,77,79,80,84]
  target=old if special else max(old*.85,min(old*1.18,m['spread']*ratio))
  if abs(target-old)/old<.06:target=old
  centre=float(np.median(m['centres']));offsets=[]
  for value in m['centres']:
   excess=max(0,abs(value-centre)-reference_band)
   offsets.append(round(float(-np.sign(value-centre)*min(.025,excess)),6))
  # Good existing registration receives exact zero corrections.
  output[str(id)]={'stride':round(target,6),'offsets':offsets}
  record.update(oldStride=old,stride=round(target,6),maxBodyCorrection=max(abs(x)for x in offsets),speciesCadencePreserved=special,changed=abs(target-old)>.00001 or any(offsets))
 records.append(record)
data={'version':128,'reference':6,'referenceTorsoBand':reference_band,'characters':output}
(R/'web/walk128-data.js').write_text("'use strict';\nconst WALK128_DATA="+json.dumps(data,separators=(',',':'))+';\n')
(OUT/'audit.json').write_text(json.dumps({'reference':'Upgrade native walk','scope':'native ground walking only','records':records},indent=2)+'\n')
# Review all eight native poses, with only the bounded root-registration correction applied.
for page in range((len(records)+7)//8):
 sheet=Image.new('RGB',(1160,8*136),(20,34,44));dr=ImageDraw.Draw(sheet)
 for row,rec in enumerate(records[page*8:page*8+8]):
  id=rec['id'];yy=row*136;dr.text((8,yy+12),f"{id:02} {rec['name']}",fill='white');dr.text((8,yy+34),rec['status'][:34],fill=(153,211,172))
  if 'stride' in rec:dr.text((8,yy+55),f"Stride {rec['oldStride']:.2f} -> {rec['stride']:.2f}",fill=(175,207,227))
  for col,tile in enumerate(tiles[id]):
   tile=tile.copy();tile.thumbnail((104,116),Image.Resampling.LANCZOS);delta=output.get(str(id),{}).get('offsets',[0]*8)[col]*116
   sheet.paste(tile,(int(255+col*112+(104-tile.width)/2+delta),yy+130-tile.height),tile)
 sheet.save(OUT/f'walk-{page:02}.webp',quality=87)
print(json.dumps({'groundWalkers':len(output),'changed':sum(bool(x.get('changed'))for x in records),'preserved':sum(not x.get('changed',False)for x in records),'reference':6}))
