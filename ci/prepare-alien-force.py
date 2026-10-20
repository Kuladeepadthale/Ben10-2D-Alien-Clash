"""Isolate whole connected poses before atlas packing, including extended hands/tails.

Source grid positions only identify poses. They never clip the character silhouette.
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'ci/cel-sources'
NAMES=json.loads((ROOT/'ci/roster.json').read_text())[22:]

def extract(source):
    a=np.array(Image.open(source).convert('RGBA'));h,w=a.shape[:2]
    labels,_=ndimage.label(a[:,:,3]>100,structure=np.ones((3,3)))
    areas=np.bincount(labels.ravel());boxes=ndimage.find_objects(labels)
    rows=[[] for _ in range(4)]
    for label,box in enumerate(boxes,1):
        if box is None or areas[label]<1500:continue
        yy,xx=np.where(labels[box]==label)
        cy=float(np.median(yy))+box[0].start
        cx=float(np.median(xx))+box[1].start
        rows[min(3,int(cy/h*4))].append((cx,label))
    assert [len(row) for row in rows]==[8]*4,(source,[len(r) for r in rows])
    result=[]
    for row in rows:
        frames=[]
        for _,label in sorted(row):
            # A two-pixel alpha fringe preserves antialiasing, not neighboring bodies.
            mask=ndimage.binary_dilation(labels==label,iterations=2)
            rgba=a.copy();rgba[:,:,3]=np.where(mask,rgba[:,:,3],0)
            im=Image.fromarray(rgba);bounds=im.getchannel('A').getbbox()
            assert bounds
            frame=im.crop(bounds)
            frames.append(frame)
        result.append(frames)
    return result

if __name__=='__main__':
    for name in NAMES:
        if all((SRC/(name+'-'+kind+'-v82.png')).exists() for kind in ['walk','jump-strike','powers','states']):
            print(name+': use four high-detail native sheets');continue
        rows=extract(SRC/(name+'-master.png'))
        for kind,frames in zip(['walk','jump-strike','powers','states'],rows):
            cw=max(im.width for im in frames)+32;ch=max(im.height for im in frames)+32
            # Retain a 2:1 source sheet for the existing exporter, with square cells.
            side=max(cw,ch);sheet=Image.new('RGBA',(side*4,side*2))
            for i,im in enumerate(frames):
                sheet.paste(im,(i%4*side+(side-im.width)//2,i//4*side+side-16-im.height))
            sheet.save(SRC/(name+'-'+kind+'.png'),compress_level=3)
        print(name+': 32 whole poses isolated and packed with transparent padding')

