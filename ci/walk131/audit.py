from pathlib import Path
import json,sys
import numpy as np
from PIL import Image,ImageDraw
from scipy.ndimage import label,find_objects
R=Path(__file__).resolve().parents[2];O=R/'ci/walk131';batch=int(sys.argv[1]) if len(sys.argv)>1 else 0
s=(R/'web/cel-data.js').read_text().split('const CEL_DATA=',1)[1];chars=json.JSONDecoder().raw_decode(s)[0]['characters']
page=Image.new('RGB',(1580,6*156),(20,34,44));dr=ImageDraw.Draw(page);records=[]
for row,c in enumerate(chars[batch*6:batch*6+6]):
 id=c['id'];items=[];cache={};yy=row*156;dr.text((6,yy+7),f"{id:02} {c['name']}",fill='white');dr.text((6,yy+29),'walk 1-8 | jump 1-4',fill=(160,210,200))
 for col,(state,fi) in enumerate([(k,i) for k in ['walk','jump'] for i in c['clips'][k]]):
  f=c['frames'][fi];src=c['sheets'][f['sheet']]['src']
  if src not in cache:cache[src]=Image.open(R/'web'/src).convert('RGBA')
  x,y,w,h=f['rect'];im=cache[src].crop((x,y,x+w,y+h));a=np.array(im)[:,:,3];mask=a>100;labs,n=label(mask);blobs=[];total=int(mask.sum())
  for z,sl in enumerate(find_objects(labs),1):
   if sl is None:continue
   area=int((labs[sl]==z).sum());by,bx=sl
   if area>total*.12:blobs.append({'area':area,'bbox':[bx.start,by.start,bx.stop,by.stop]})
  bounds=im.getchannel('A').point(lambda v:255 if v>100 else 0).getbbox();bh=bounds[3]-bounds[1];bw=bounds[2]-bounds[0]
  multi=len([b for b in blobs if b['bbox'][3]-b['bbox'][1]>bh*.3])>=2
  tall=bh/c['referenceHeight']>1.6
  record={'state':state,'frame':fi,'rect':f['rect'],'origin':f['origin'],'reference':f.get('referenceHeight',c['referenceHeight']),'standingReference':c['referenceHeight'],'bounds':bounds,'sourcePixels':total,'largeComponents':blobs,'suspect':multi or tall,'reason':'multiple substantial bodies/components' if multi else 'taller than1.6 standing source height' if tall else ''}
  items.append(record);thumb=im.copy();thumb.thumbnail((108,124),Image.Resampling.LANCZOS);xx=250+col*110;page.paste(thumb,(xx+(108-thumb.width)//2,yy+148-thumb.height),thumb);dr.text((xx+2,yy+7),f'{state[0]}:{fi}',fill=(255,130,110) if record['suspect'] else (170,205,220))
 records.append({'id':id,'name':c['name'],'clips':c['clips'],'frames':items})
 for im in cache.values():im.close()
page.save(O/f'before-{batch:02}.webp',quality=90);(O/f'before-{batch:02}.json').write_text(json.dumps(records,indent=2)+'\n');print(json.dumps({'batch':batch,'suspects':[(r['id'],f['state'],f['frame'],f['reason']) for r in records for f in r['frames'] if f['suspect']]}))
