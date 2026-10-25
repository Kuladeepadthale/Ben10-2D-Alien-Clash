"""Audit the actual restored battle cels; record locomotion only, without rewriting existing art."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib,subprocess,numpy as np
R=Path(__file__).resolve().parents[2];OUT=R/'ci/locomotion126';(OUT/'characters').mkdir(parents=True,exist_ok=True);(OUT/'previews').mkdir(exist_ok=True)
def constant(path,name):return json.JSONDecoder().raw_decode(path.read_text().split('const '+name+'=',1)[1].lstrip())[0]
cels=constant(R/'web/cel-data.js','CEL_DATA')['characters'];villains=constant(R/'web/villain-data.js','VILLAIN_DATA')['characters']
js="const fs=require('fs'),vm=require('vm'),b=vm.createContext({});vm.runInContext(fs.readFileSync('web/data.js','utf8')+fs.readFileSync('web/cartoon-gaits.js','utf8')+';this.out={aliens,gaits:CARTOON_GAITS}',b);console.log(JSON.stringify(b.out));"
meta=json.loads(subprocess.check_output(['node','-e',js],cwd=R));rows=[];records=[]
for kind,roster in [('alien',cels),('villain',villains)]:
 for id,d in enumerate(roster):
  indices=d['clips']['walk'] if kind=='alien' else [1,2,3];sheets=d.get('sheets',[{'src':d.get('src')}]);images={};frames=[];hashes=[];masks=[];sizes=[]
  for ix in indices:
   f=d['frames'][ix];src=sheets[f.get('sheet',0)]['src']
   if src not in images:images[src]=Image.open(R/'web'/src).convert('RGBA')
   x,y,w,h=f['rect'];tile=images[src].crop((x,y,x+w,y+h));bbox=tile.getchannel('A').point(lambda v:255 if v>90 else 0).getbbox()
   if not bbox:raise ValueError(f'{kind}:{id}: empty walking cel')
   tight=tile.crop(bbox);frames.append(tight);hashes.append(hashlib.sha256(tight.tobytes()).hexdigest());masks.append(np.array(tight.getchannel('A').resize((96,96)))>90);sizes.append([bbox[2]-bbox[0],bbox[3]-bbox[1]])
  diffs=[np.mean(a!=b)for a,b in zip(masks,masks[1:]+masks[:1])];feet=[np.mean(a[62:]!=b[62:])for a,b in zip(masks,masks[1:]+masks[:1])]
  gait=meta['gaits'][id] if kind=='alien' else {};flags=[]
  if len(set(hashes))<(4 if kind=='alien' else 3):flags.append('few-distinct-native-poses')
  if not gait.get('hover') and np.mean(feet)<.02:flags.append('low-foot-pose-variation')
  rec=dict(kind=kind,id=id,name=meta['aliens'][id]['name'] if kind=='alien' else d['name'],slug=d.get('slug',d.get('name')),nativeWalkIndices=indices,nativeUnique=len(set(hashes)),silhouetteVariation=round(float(np.mean(diffs)),4),footVariation=round(float(np.mean(feet)),4),sizes=sizes,existingGait=gait,flags=flags,status='native-metrics-complete-visual-review-pending',source='restored verified release plus existing reviewed revisions')
  (OUT/'characters'/f'{kind}-{id:02}.json').write_text(json.dumps(rec,indent=2)+'\n');records.append(rec);rows.append((rec,frames))
  for im in images.values():im.close()
for page in range((len(rows)+7)//8):
 sheet=Image.new('RGB',(1160,8*136),(20,34,44));draw=ImageDraw.Draw(sheet)
 for row,(rec,frames)in enumerate(rows[page*8:page*8+8]):
  yy=row*136;draw.text((8,yy+15),f"{rec['kind']} {rec['id']:02} {rec['name']}",fill='white');draw.text((8,yy+35),f"Unique {rec['nativeUnique']} / {len(rec['nativeWalkIndices'])}",fill=(153,211,172));draw.text((8,yy+55),' / '.join(rec['flags'])[:34],fill=(255,192,126))
  seq=frames if len(frames)==8 else [frames[i]for i in [0,1,2,1,0,1,2,1]]
  for col,im in enumerate(seq):
   im=im.copy();im.thumbnail((108,118),Image.Resampling.LANCZOS);sheet.paste(im,(255+col*112+(108-im.width)//2,yy+130-im.height),im)
 sheet.save(OUT/'previews'/f'walk-{page:02}.webp',quality=85)
(OUT/'audit.json').write_text(json.dumps(dict(scope='locomotion-only',aliens=len(cels),villains=len(villains),characters=records),indent=2)+'\n')
print(json.dumps(dict(aliens=len(cels),villains=len(villains),flagged=[dict(kind=r['kind'],id=r['id'],name=r['name'],flags=r['flags'])for r in records if r['flags']])))
# Inspect already drawn flight-ready alternatives before selecting glider poses.
flight=Image.new('RGB',(1340,4*180),(20,34,44));dr=ImageDraw.Draw(flight)
for row,id in enumerate([25,33,51,69]):
 d=cels[id];choices=[('idle',d['clips']['idle'][0])]+[('walk'+str(i),d['clips']['walk'][i])for i in [0,4]]+[('jump'+str(i),j)for i,j in enumerate(d['clips']['jump'])]+[('guard',d['clips']['guard'][0])]
 dr.text((5,row*180+15),meta['aliens'][id]['name'],fill='white')
 for col,(name,ix)in enumerate(choices):
  f=d['frames'][ix];im=Image.open(R/'web'/d['sheets'][f['sheet']]['src']).convert('RGBA');x,y,w,h=f['rect'];tile=im.crop((x,y,x+w,y+h));tile=tile.crop(tile.getbbox());tile.thumbnail((130,145),Image.Resampling.LANCZOS);flight.paste(tile,(200+col*142+(130-tile.width)//2,row*180+168-tile.height),tile);dr.text((200+col*142,row*180+4),name,fill='white');im.close()
flight.save(OUT/'previews'/'flight-options.webp',quality=90)
