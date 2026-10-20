from pathlib import Path
from PIL import Image,ImageDraw
import json,base64,io,sys
sys.path.insert(0,'ci')
from full_poses import whole_poses
import runpy
extract=runpy.run_path('ci/prepare-alien-force.py')['extract']
src=Path('ci/cel-sources');names=json.loads(Path('ci/roster.json').read_text())
for group in range(4):
 canvas=Image.new('RGB',(660,8*180),(18,35,29));draw=ImageDraw.Draw(canvas)
 for row,id in enumerate(range(group*8,min(32,group*8+8))):
  name=names[id]
  if id>=22:
   rows=extract(src/(name+'-master.png'));poses=[rows[3][3],rows[1][5],rows[2][1],rows[2][5]]
  else:
   def sheet(kind):
    paths=[src/(name+'-'+kind+'-v51.png'),src/(name+'-'+kind+'.webp'),src/(name+'-'+kind+'.png')]
    return [p[0] for p in whole_poses(Image.open(next(p for p in paths if p.exists())))]
   if id==0: poses=[sheet('powers-states')[6],sheet('strike-jet')[1],sheet('actions')[5],sheet('powers-states')[3]]
   else: poses=[sheet('states')[3],sheet('jump-strike')[5],sheet('powers')[1],sheet('powers')[5]]
  print('QUALITY',name,[(p.width,p.height) for p in poses])
  draw.text((4,row*180+3),str(id)+' '+name,fill='white')
  for col,pose in enumerate(poses):
   pose.thumbnail((152,150),Image.Resampling.LANCZOS);canvas.paste(pose,(col*165+(165-pose.width)//2,row*180+25+(150-pose.height)),pose)
 output=io.BytesIO();canvas.save(output,format='WEBP',quality=85)
 print('REVIEW'+str(group)+':'+base64.b64encode(output.getvalue()).decode())

# Visual review of source poses before changing artwork.
