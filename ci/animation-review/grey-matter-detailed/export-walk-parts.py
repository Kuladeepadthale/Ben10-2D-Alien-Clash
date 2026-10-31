# Technical extraction only; source drawings are generated cartoon cutout artwork.
from PIL import Image
from scipy.ndimage import label,find_objects,binary_dilation
import numpy as np,pathlib,json,base64
root=pathlib.Path('grey-walk-work');out=root/'web/assets/grey-matter-detailed'
def extract(uid,expected,rows):
 a=np.array(Image.open('generated_images/exec-'+uid+'.png').convert('RGBA'));l,n=label(a[:,:,3]>160);z=np.bincount(l.ravel());o=find_objects(l);q=[(i,o[i-1]) for i,s in enumerate(z) if i and s>1000];assert len(q)==expected;q.sort(key=lambda v:v[1][0].start);ordered=[];j=0
 for count in rows:ordered+=sorted(q[j:j+count],key=lambda v:v[1][1].start);j+=count
 result=[]
 for i,(y,x) in ordered:
  mask=binary_dilation(l==i,iterations=2);piece=a[y,x].copy();piece[:,:,3]=np.where(mask[y,x],piece[:,:,3],0);result.append((Image.fromarray(piece),[x.start,y.start]))
 return result
upper,offset=extract('d8258566-133a-4f4e-801c-4339315d0f0a',1,[1])[0];upper.save(out/'walk-upper.webp','WEBP',lossless=True,method=6)
parts=extract('5c538f4a-6cff-4ffd-bbce-f4e56b04767b',6,[2,2,2]);atlas=Image.new('RGBA',(1280,1920));rects=[]
for i,(im,_) in enumerate(parts):
 w,h=im.size;x=i%2*640+(640-w)//2;y=i//2*640+(640-h)//2;atlas.alpha_composite(im,(x,y));rects.append([x,y,w,h])
atlas.save(out/'walk-legs.webp','WEBP',lossless=True,method=6)
data={'upperSrc':'assets/grey-matter-detailed/walk-upper.webp','legsSrc':'assets/grey-matter-detailed/walk-legs.webp','upperSize':list(upper.size),'hip':[525-offset[0],1040-offset[1]],'parts':rects,'strideHeight':.85,'stanceFraction':.6}
(root/'ci/animation-review/grey-matter-detailed/walk-parts.json').write_text(json.dumps(data,indent=2))
for name in ['walk-upper','walk-legs']:
 p=out/(name+'.webp');p.with_suffix('.b64').write_text(base64.b64encode(p.read_bytes()).decode());print(name,p.stat().st_size)
print(json.dumps(data))
