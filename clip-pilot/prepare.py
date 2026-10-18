from pathlib import Path
import json
import cv2
import numpy as np
from PIL import Image

root=Path(__file__).parent
frames=[]
for source in ['walk-source.png','actions-source.png']:
 atlas=Image.open(root/'assets'/source).convert('RGBA')
 for i in range(8):
  x0=round(i%4*atlas.width/4);x1=round((i%4+1)*atlas.width/4)
  y0=round(i//4*atlas.height/2);y1=round((i//4+1)*atlas.height/2)
  im=atlas.crop((x0,y0,x1,y1));a=np.asarray(im).copy()
  mask=np.uint8(a[:,:,3]>=180)
  count,labels,stats,centroids=cv2.connectedComponentsWithStats(mask,8)
  main=1+np.argmax(stats[1:,cv2.CC_STAT_AREA]);a[:,:,3]=np.where(labels==main,255,0)
  im=Image.fromarray(a);bounds=im.getchannel('A').getbbox();assert bounds
  # Register the torso from the chest badge rather than the changing foot silhouette.
  yy,xx=np.indices(a.shape[:2]);dark=(a[:,:,:3].max(axis=2)<100)&(a[:,:,3]>0)&(yy>im.height*.27)&(yy<im.height*.78)&(xx>im.width*.24)&(xx<im.width*.78)
  n,l,s,c=cv2.connectedComponentsWithStats(np.uint8(dark),8)
  candidates=[j for j in range(1,n) if s[j,cv2.CC_STAT_AREA]>20 and s[j,cv2.CC_STAT_WIDTH]>6 and .4<s[j,cv2.CC_STAT_WIDTH]/max(1,s[j,cv2.CC_STAT_HEIGHT])<2]
  badge=min(candidates,key=lambda j:((c[j,0]/im.width-.56)**2+(c[j,1]/im.height-.49)**2)) if candidates else None
  anchor=float(c[badge,0]) if badge is not None else im.width/2
  # Apex keeps its drawn foot lift; contact poses register to their actual soles.
  ground=im.height-2 if source=='actions-source.png' and i==2 else bounds[3]
  out=Image.new('RGBA',(640,560));out.paste(im,(round(320-anchor),500-ground))
  name=('walk-' if source=='walk-source.png' else 'action-')+str(i)+'.png';out.save(root/'frames'/name)
  frames.append({'source':source,'index':i,'file':'frames/'+name,'origin':[320,500],'sourceBounds':bounds,'badgeX':anchor})
clips={
 'walk':{'frames':['frames/walk-'+str(i)+'.png' for i in range(8)],'fps':12,'loop':True},
 'jump':{'frames':['frames/action-'+str(i)+'.png' for i in range(4)],'durations':[.14,.16,.40,.16],'loop':False},
 'fireball':{'frames':['frames/action-'+str(i)+'.png' for i in range(4,8)],'durations':[.17,.17,.16,.22],'loop':False}
}
(root/'clips.json').write_text(json.dumps({'version':1,'origin':[320,500],'cell':[640,560],'clips':clips,'frames':frames,'rendering':'Discrete cel frames; no interpolation, crossfade, optical flow or frame blending.'},indent=2))
print('Prepared 16 native-resolution cel frames and 3 independent clips.')
