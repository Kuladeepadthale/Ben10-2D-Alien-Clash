"""Encode newly generated villain atlases without changing the artwork."""
from PIL import Image
from pathlib import Path
import sys,io,base64,json,statistics
slug,ident,path=sys.argv[1:];ident=int(ident)
im=Image.open(path).convert('RGBA');im.thumbnail((1024,2048),Image.Resampling.LANCZOS);w,h=im.size
assert im.getextrema()[3][0]<64,'Transparent background required'
b=io.BytesIO();im.save(b,format='WEBP',quality=82,method=6)
frames=[];heights=[]
for row in range(8):
 for col in range(4):
  x,y=round(col*w/4),round(row*h/8);r,bot=round((col+1)*w/4),round((row+1)*h/8)
  cell=im.crop((x,y,r,bot));bounds=cell.getchannel('A').point(lambda a:255 if a>64 else 0).getbbox()
  assert bounds and (bounds[2]-bounds[0])*(bounds[3]-bounds[1])>500
  l,t,rr,bb=bounds;heights.append(bb-t);ox=cell.width*.5
  frames.append({'sheet':0,'rect':[x,y,r-x,bot-y],'origin':[ox,bb],'bounds':list(bounds),'emitter':[round(l+(rr-l)*.9,1),round(t+(bb-t)*.43,1)]})
ref=round(statistics.median(heights[:8]))
for i,fr in enumerate(frames):
 ox,oy=fr['origin'];l,t,r,b=fr['bounds']
 if ident in [2,18,33] and i>=8:
  fr['emitter']=[round(ox+ref*.22,1),round(oy-ref*.8,1)]
 elif ident==10 and i>=8:
  fr['emitter']=[round(ox+ref*.18,1),round(oy-ref*.84,1)]
 elif ident==44 and 12<=i<16:
  fr['emitter']=[round(ox+ref*.15,1),round(oy-ref*.86,1)]
 elif ident==30 and i>=8:
  fr['emitter']=[round(ox+ref*.15,1),round(oy-ref*.75,1)]
 elif ident in [3,19,28] and i>=8:
  fr['emitter']=[round(l+(r-l)*.94,1),round(t+(b-t)*.42,1)]
hover=ident in [17,28]
if hover:
 for fr in frames:fr['origin'][1]=round(fr['rect'][3]*.94,1)
clips={'idle':list(range(8)) if hover else [31],'walk':list(range(8)),'normal':list(range(8,12)),'skill0':list(range(12,16)),'skill1':list(range(16,20)),'skill2':list(range(20,24)),'ultimate':list(range(24,28)),'guard':[28],'hit':[29,30]}
d={'id':ident,'slug':slug,'status':'new-drawings-integrated','date':'2026-11-06','referenceHeight':ref,'stride':.9,'idleFps':8,'frames':frames,'clips':clips,'sheets':['data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()]}
out=Path('web/redrawn-villains')/(slug+'.js');out.parent.mkdir(parents=True,exist_ok=True);out.write_text("'use strict';\nregisterRedrawnVillain("+json.dumps(d,separators=(',',':'))+");\n")
print(json.dumps({'file':str(out),'poses':32,'bytes':out.stat().st_size}))
