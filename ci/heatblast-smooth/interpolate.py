"""Bidirectional image interpolation used in the user-approved original-art preview."""
import numpy as np, cv2
from PIL import Image
xx,yy=np.meshgrid(np.arange(256,dtype=np.float32),np.arange(256,dtype=np.float32))
grid=np.stack((xx,yy),axis=-1)
def remap(a,p):return cv2.remap(a,p[:,:,0],p[:,:,1],cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)
def gray(a):
 rgba=a.copy();rgb=rgba[:,:,:3]*rgba[:,:,3:4];g=cv2.cvtColor((rgb*255).astype(np.uint8),cv2.COLOR_RGB2GRAY)
 return g
def premul(a):return np.concatenate((a[:,:,:3]*a[:,:,3:4],a[:,:,3:4]),axis=2)
def image(a):
 alpha=a[:,:,3:4];rgb=np.divide(a[:,:,:3],np.maximum(alpha,1/255));out=np.concatenate((rgb,alpha),axis=2)
 return Image.fromarray(np.uint8(np.clip(out,0,1)*255),'RGBA')
def flows(a,b):
 dis=cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM);dis.setUseSpatialPropagation(True)
 return dis.calc(gray(a),gray(b),None),dis.calc(gray(b),gray(a),None)
def between(a,b,ab,ba,t):
 if t==0:return image(premul(a))
 pa=grid-t*ab;pb=grid-(1-t)*ba
 for _ in range(5):pa=grid-t*remap(ab,pa);pb=grid-(1-t)*remap(ba,pb)
 aw=remap(premul(a),pa);bw=remap(premul(b),pb)
 # Occluded limbs may have no valid correspondence. Keep one warped
 # silhouette rather than exposing both as semi-transparent ghost limbs.
 dominant=aw if t<.5 else bw
 blend=aw*(1-t)+bw*t
 shared=(aw[:,:,3]>.8)&(bw[:,:,3]>.8)
 result=dominant.copy()
 result[shared,:3]=blend[shared,:3]/np.maximum(blend[shared,3:4],1/255)*dominant[shared,3:4]
 return image(result)
