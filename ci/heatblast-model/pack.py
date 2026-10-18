"""Pack the Blender renders without inventing or interpolating character pixels."""
from pathlib import Path
import json, math, hashlib
from PIL import Image
src=Path('tmp/heatblast-model');dst=Path('web/assets/heatblast-model');dst.mkdir(parents=True,exist_ok=True)
m=json.loads((src/'animation.json').read_text());render_cell=m['cell'];cell=192;ratio=cell/render_cell;m['renderCell']=render_cell;m['cell']=cell
for key in ['ground','originX','pixelsPerUnit','stride']:m[key]*=ratio
for frame in m['frames']:
 frame['hand']=[v*ratio for v in frame['hand']]
 if 'feet' in frame:frame['feet']=[[v*ratio for v in point] for point in frame['feet']]
count=len(m['frames']);rows=math.ceil(count/m['columns']);atlas=Image.new('RGBA',(m['columns']*cell,rows*cell));problems=[]
for i in range(count):
 im=Image.open(src/f'{i:04d}.png').convert('RGBA');assert im.size==(render_cell,render_cell);im=im.resize((cell,cell),Image.Resampling.LANCZOS);bounds=im.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox();assert bounds is not None
 if bounds[0]<2 or bounds[1]<2 or bounds[2]>cell-2 or bounds[3]>cell-2:problems.append((i,bounds))
 m['frames'][i]['bounds']=list(bounds);atlas.paste(im,((i%m['columns'])*cell,(i//m['columns'])*cell))
assert not problems,('Clipped animation frames',problems)
m['width']=m['height']=m['columns']*cell;m['sheetFrames']=64;m['sources']=[f'assets/heatblast-model/atlas-v20-{i}.webp' for i in range(math.ceil(count/64))];m['standingHeight']=m['ground']-m['frames'][0]['bounds'][1];m['frameCount']=count;m['headReferenceSha256']=hashlib.sha256(Path('web/assets/classic/heatblast/portrait.webp').read_bytes()).hexdigest();m['source']='Blender skeletal body, original classic portrait head decal, authored key poses and planted-foot IK; no Nekki assets or Cascadeur output.'
for i in range(len(m['sources'])):atlas.crop((0,i*m['height'],m['width'],(i+1)*m['height'])).save(dst/f'atlas-v20-{i}.webp',lossless=True,quality=85,method=4,exact=True)
(dst/'animation.json').write_text(json.dumps(m,separators=(',',':')));Path('web/heatblast-model-data.js').write_text("'use strict';\nconst HEATBLAST_MODEL="+json.dumps(m,separators=(',',':'))+';\n');print('Packed',count,'frames,',atlas.size,'standing height',m['standingHeight'])
