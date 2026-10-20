"""Verify native ability atlas cells before bundling."""
from pathlib import Path
from PIL import Image
import numpy as np
root=Path(__file__).resolve().parents[1]
total=0
for i in range(8):
 p=root/'web/assets/ui/abilities'/('ability-atlas-'+str(i).zfill(2)+'-v83.png')
 image=Image.open(p).convert('RGBA');w,h=image.size
 assert w>=1000 and h>=800,(p,'insufficient native icon detail')
 alpha=np.asarray(image)[:,:,3]
 assert (alpha<10).any(),(p,'missing transparent background')
 for row in range(4):
  for col in range(5):
   cell=alpha[round(row*h/4):round((row+1)*h/4),round(col*w/5):round((col+1)*w/5)]
   assert (cell>100).sum()>cell.size*.03,(p,row,col,'empty ability artwork')
   total+=1
assert total==160
print('Passed: all 160 basic, skill and ultimate image cells across eight transparent native atlases.')
