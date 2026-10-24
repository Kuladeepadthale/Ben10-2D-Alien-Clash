import sys,json,numpy as np
from PIL import Image
from scipy import ndimage
from pathlib import Path
sys.path.insert(0,'ci');from full_poses import whole_poses
r=json.loads(Path('ci/animation-review/characters/chamalien.json').read_text())
def metric(im):
 a=np.array(im);yy,xx=np.indices(a.shape[:2]);red=(a[:,:,3]>180)&(a[:,:,0]>160)&(a[:,:,1]<100)&(a[:,:,2]<100);l,n=ndimage.label(red);areas=np.bincount(l.ravel());rid=np.argmax(areas[1:])+1;ry,rx=np.where(l==rid);cy=float(ry.mean())
 purple=(a[:,:,3]>180)&(a[:,:,0]>55)&(a[:,:,2]>a[:,:,0].astype(float)*1.08)&(a[:,:,1]<a[:,:,0].astype(float)*.9)&(yy<=cy)
 labels,n=ndimage.label(purple);near=ndimage.binary_dilation(l==rid,iterations=8);ids,cts=np.unique(labels[near],return_counts=True);pairs=[(ct,lab) for ct,lab in zip(cts,ids) if lab>0];lab=max(pairs)[1];hy,hx=np.where(labels==lab);return int(hx.max()-hx.min()+1)
base=metric(whole_poses(Image.open(r['sources']['states']))[3][0]);print('base',base)
for si,k in enumerate(['walk','jump-strike','powers','states']):
 ps=whole_poses(Image.open(r['sources'][k]));ws=[metric(im) for im,_ in ps];print(k,ws);refs=[round(473*w/base,2) for w in ws];print('refs',refs)
 for i,ref in enumerate(refs):r['frameReferenceHeights'][str(si*8+i)]=ref if si*8+i!=30 else 473
r['registration_method']='Native per-frame physical reference heights calibrated from crest/upper-head width; no eye-size proxy or pixel deformation.';Path('ci/animation-review/characters/chamalien.json').write_text(json.dumps(r,indent=2)+'\n')
