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
 elif (int(ident) in [23,42] and index>=12) or (int(ident)==26 and (12<=index<16 or 20<=index<28)):
  fr['emitter']=[round(ox+ref*.25,1),round(oy-ref*.72,1)]
 elif int(ident)==25 and (12<=index<16 or 24<=index<28):
  fr['emitter']=[round(ox+ref*.20,1),round(oy-ref*.82,1)]
 elif int(ident)==28 and index>=12:
  fr['emitter']=[round(ox+ref*.12,1),round(oy-ref*.88,1)]
 elif int(ident)==38 and index>=12:
  fr['emitter']=[round(ox+ref*.15,1),round(oy-ref*.48,1)]
 elif int(ident)==39 and (12<=index<16 or 24<=index<28):
  fr['emitter']=[round(ox+ref*.18,1),round(oy-ref*.83,1)]
 elif int(ident)==43 and index>=12:
  fr['emitter']=[round(ox+ref*.15,1),round(oy-ref*.50,1)]
 elif int(ident) in [52,56] and index>=12:
  fr['emitter']=[round(ox+ref*.20,1),round(oy-ref*.78,1)]
 elif int(ident)==50 and index>=12:
  fr['emitter']=[round(ox+ref*.25,1),round(oy-ref*.38,1)]
 elif int(ident)==46 and 16<=index<20:
  l,t,r,bottomalpha=fr['bounds'];fr['emitter']=[round(l+(r-l)*.88,1),round(t+(bottomalpha-t)*.20,1)]
 elif int(ident)==57 and index>=12:
  fr['emitter']=[round(ox+ref*.30,1),round(oy-ref*.55,1)]
 elif (int(ident)==63 and 12<=index<16) or (int(ident)==80 and (12<=index<16 or 24<=index<28)):
  fr['emitter']=[round(ox+ref*.20,1),round(oy-ref*.80,1)]
 elif (int(ident)==68 and (12<=index<20 or 24<=index<28)) or (int(ident)==73 and 12<=index<16):
  fr['emitter']=[round(ox+ref*.25,1),round(oy-ref*.74,1)]
 elif int(ident)==75 and index>=12:
  l,t,r,bottomalpha=fr['bounds'];fr['emitter']=[round(l+(r-l)*.85,1),round(t+(bottomalpha-t)*.25,1)]
 elif int(ident)==76 and index>=12:
  fr['emitter']=[round(ox+ref*.15,1),round(oy-ref*.50,1)]
 elif int(ident)==78 and 20<=index<24:
  l,t,r,bottomalpha=fr['bounds'];fr['emitter']=[round(l+(r-l)*.90,1),round(bottomalpha-ref*.20,1)]
 elif int(ident)==78 and index>=12:
  fr['emitter']=[round(ox+ref*.15,1),round(oy-ref*.80,1)]
 elif int(ident)==82 and index>=12:
  l,t,r,bottomalpha=fr['bounds'];fr['emitter']=[round(l+(r-l)*.88,1),round(oy-ref*.38,1)]
 elif int(ident)==87 and (8<=index<20 or 24<=index<28):
  fr['emitter']=[round(ox+ref*.28,1),round(oy-ref*.75,1)]
 elif int(ident)==89 and index>=8:
  l,t,r,bottomalpha=fr['bounds'];fr['emitter']=[round(l+(r-l)*.90,1),round(t+(bottomalpha-t)*.45,1)]
 elif int(ident)==17 and (16<=index<20 or 24<=index<28):
  fr['emitter']=[round(ox+ref*.12,1),round(oy-ref*.55,1)]
if slug=='xlr8':
 clips={'idle':[7],'walk':[0,1,2,3],'normal':[4,5,6,7],'skill0':[16,17,18,19],'skill1':[20,21,22,23],'skill2':[24,25,26,27],'ultimate':[28,29,30,31],'guard':[14],'hit':[15]}
else:
 clips={'idle':[0],'walk':list(range(0,8)),'normal':list(range(8,12)),'skill0':list(range(12,16)),'skill1':list(range(16,20)),'skill2':list(range(20,24)),'ultimate':list(range(24,28)),'guard':[28],'hit':[29,30]}
hover=int(ident) in [25,26,34,36,51,53,56,66,68,69,76,78,87]
if int(ident)>=23:
 clips['idle']=list(range(8)) if hover else [31]
if hover:
 for fr in frames:fr['origin'][1]=round(fr['rect'][3]*.94,1)
if int(ident)==49:
 # Preserve authored lift in the hopping cycle instead of grounding every airborne foot.
 for fr in frames[:8]:fr['origin'][1]=round(fr['rect'][3]*.94,1)
d={'batchLabel':'Remaining 9 · Batch 05' if int(ident)>=83 else 'Next 20 · Batch 04' if int(ident)>=63 else 'Next 20 · Batch 03' if int(ident)>=43 else 'Next 20 · Batch 02' if int(ident)>=23 else '20-alien batch','idleFps':8 if hover else 3,'id':int(ident),'slug':slug,'status':'new-drawings-integrated','date':'2026-11-06','referenceHeight':round(statistics.median(heights[:8])),'stride':.9,'frames':frames,'clips':clips,'sheets':sheets}
out=Path('web/redrawn20')/(slug+'.js');out.parent.mkdir(exist_ok=True,parents=True);out.write_text("'use strict';\nregisterRedrawn20("+json.dumps(d,separators=(',',':'))+");\n")
print(json.dumps({'file':str(out),'poses':len(frames),'bytes':out.stat().st_size,'referenceHeight':d['referenceHeight']}))
