from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import json,math
out=Path('store-assets');out.mkdir(exist_ok=True)
im=Image.new('RGBA',(512,512),'#10221a');d=ImageDraw.Draw(im)
s=512/108
d.polygon([(int(x*s),int(y*s)) for x,y in [(20,20),(88,20),(62,54),(88,88),(20,88),(46,54)]],fill='#aff554')
im.save(out/'app-icon-512.png',optimize=True)
w,h=1024,500
im=Image.new('RGB',(w,h));px=im.load()
for y in range(h):
 for x in range(w):
  light=max(0,1-math.hypot((x-770)/750,(y-240)/450))
  px[x,y]=(int(5+10*light),int(16+42*light),int(16+16*light))
d=ImageDraw.Draw(im)
for radius in [170,210,250]:d.ellipse((770-radius,250-radius,770+radius,250+radius),outline=(36,83,48),width=2)
f='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
big=ImageFont.truetype(f,68);mid=ImageFont.truetype(f,40);small=ImageFont.truetype(f,19)
d.rounded_rectangle((54,67,200,101),radius=8,fill='#aff554')
d.text((70,74),'2D BATTLES',font=ImageFont.truetype(f,17),fill='#10221a')
d.text((50,130),'BEN 10',font=big,fill='white')
d.text((52,216),'OMNIVERSE',font=mid,fill='#aff554')
d.line((54,280,430,280),fill='#3d5e47',width=2)
d.text((54,311),'CHOOSE. TRANSFORM. FIGHT.',font=small,fill='#d4e7d7')
root=Path('preview-web');m=json.loads((root/'assets/cels/manifest.json').read_text())
for idx,x,target_h,y in [(2,570,275,155),(1,805,335,112),(0,700,390,75)]:
 p=root/m['characters'][idx]['portrait'];a=Image.open(p).convert('RGBA');a=a.crop(a.getbbox())
 a.thumbnail((240,target_h),Image.Resampling.LANCZOS);im.paste(a,(x-a.width//2,y+target_h-a.height),a)
im.save(out/'feature-graphic-1024x500.png',optimize=True)
for name,size in [('app-icon-512.png',(512,512)),('feature-graphic-1024x500.png',(1024,500))]:
 assert Image.open(out/name).size==size
