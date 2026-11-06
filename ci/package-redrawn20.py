"""Encode generated transparent atlases and register authored cel clips without changing artwork."""
from PIL import Image
from pathlib import Path
import sys,json,base64,io,statistics
slug,ident,*paths=sys.argv[1:]
frames=[];sheets=[];heights=[]
for si,path in enumerate(paths):
 im=Image.open(path).convert('RGBA');im.thumbnail((1024,2048),Image.Resampling.LANCZOS);w,h=im.size
 rows=4 if slug=='xlr8' else 8
 assert im.getextrema()[3][0]<64,'transparent background required'
 b=io.BytesIO();im.save(b,format='WEBP',quality=82,method=6)
 sheets.append('data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode())
 for row in range(rows):
  for col in range(4):
   x,y=round(col*w/4),round(row*h/rows);right,bottom=round((col+1)*w/4),round((row+1)*h/rows)
   cell=im.crop((x,y,right,bottom));alpha=cell.getchannel('A');bounds=alpha.point(lambda a:255 if a>64 else 0).getbbox()
   assert bounds and (bounds[2]-bounds[0])*(bounds[3]-bounds[1])>500
   l,t,r,bottomalpha=bounds;heights.append(bottomalpha-t)
   # Fixed body axis per atlas, foot origin per pose; tails do not move the body axis.
   ox=cell.width*.56 if slug=='xlr8' else cell.width*.5
   emitter=[l+(r-l)*.88,t+(bottomalpha-t)*.42]
   frames.append({'sheet':si,'rect':[x,y,right-x,bottom-y],'origin':[round(ox,1),bottomalpha],'bounds':list(bounds),'emitter':[round(v,1) for v in emitter]})
# Register species-specific emission points instead of treating every power as a hand shot.
ref=round(statistics.median(heights[:8]))
for index,fr in enumerate(frames):
 ox,oy=fr['origin']
 if (int(ident)==6 and (12<=index<16 or 24<=index<28)):
  fr['emitter']=[round(ox+ref*.18,1),round(oy-ref*.85,1)]
 elif int(ident) in [7,15,19,20] and index>=12:
  fr['emitter']=[round(ox+ref*.35,1),round(oy-ref*.65,1)]
 elif int(ident)==17 and (16<=index<20 or 24<=index<28):
  fr['emitter']=[round(ox+ref*.12,1),round(oy-ref*.55,1)]
if slug=='xlr8':
 clips={'idle':[7],'walk':[0,1,2,3],'normal':[4,5,6,7],'skill0':[16,17,18,19],'skill1':[20,21,22,23],'skill2':[24,25,26,27],'ultimate':[28,29,30,31],'guard':[14],'hit':[15]}
else:
 clips={'idle':[0],'walk':list(range(0,8)),'normal':list(range(8,12)),'skill0':list(range(12,16)),'skill1':list(range(16,20)),'skill2':list(range(20,24)),'ultimate':list(range(24,28)),'guard':[28],'hit':[29,30]}
d={'id':int(ident),'slug':slug,'status':'new-drawings-integrated','date':'2026-11-06','referenceHeight':round(statistics.median(heights[:8])),'stride':.9,'frames':frames,'clips':clips,'sheets':sheets}
out=Path('web/redrawn20')/(slug+'.js');out.parent.mkdir(exist_ok=True,parents=True);out.write_text("'use strict';\nregisterRedrawn20("+json.dumps(d,separators=(',',':'))+");\n")
print(json.dumps({'file':str(out),'poses':len(frames),'bytes':out.stat().st_size,'referenceHeight':d['referenceHeight']}))
