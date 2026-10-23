from pathlib import Path
import json,hashlib
import numpy as np
from PIL import Image
from full_poses import whole_poses,pack_poses
R=Path(__file__).resolve().parents[1];root=R/'ci/animation-review/characters/rath';rev=json.loads((root/'revision.json').read_text());poses=whole_poses(Image.open(root/'source-close.webp'));sheet,places=pack_poses(poses,padding=24);dest=R/'web/assets/reviewed-native/rath/close.webp';sheet.save(dest,lossless=True,quality=100,method=4,exact=True);frames=[]
for i,(x,y,w,h,meta) in enumerate(places):
 a=np.array(poses[i][0]);yy,xx=np.indices(a.shape[:2]);torso=(a[:,:,3]>180)&(yy>h*.48)&(yy<h*.72);anchor=float(np.median(xx[torso]));mask=(a[:,:,3]>180)&(a[:,:,:3].min(axis=2)>150)&(yy<h*.65)&(yy>h*.15);ys,xs=np.where(mask);target=[.82,.31] if i in [1,3] else [.72,.31] if i==5 else [.82,.45];n=int(np.argmin((xs-w*target[0])**2+(ys-h*target[1])**2));frames.append({'sheet':4,'rect':[x-8,y-8,w+16,h+16],'origin':[round(anchor+8,2),h+8],'referenceHeight':435,'closeCombat':True,'hand':[int(xs[n])+8,int(ys[n])+8],**meta})
rev['close_combat']={'src':'assets/reviewed-native/rath/close.webp','frames':frames,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()};(root/'revision.json').write_text(json.dumps(rev,indent=2)+'\n');print('Saved eight distinct classic Rath close-combat frames')
