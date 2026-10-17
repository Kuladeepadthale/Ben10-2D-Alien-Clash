"""Derive Diamondhead gait curves from 100STYLE Neutral_FW/BW.bvh (CC BY 4.0).
Offline generation only; requires Python + NumPy. The APK needs no Python or network.
Usage: python ci/build-diamondhead-gait.py Neutral_FW.bvh Neutral_BW.bvh
Source and attribution: web/assets/diamondhead-puppet/MOTION.md.
"""
import re,numpy as np,json
from pathlib import Path

def parse(path):
 s=Path(path).read_text();hier,motion=s.split('MOTION');tokens=re.findall(r'[{}]|[^\s{}]+',hier);i=1;joints=[];chan=0
 def node(parent):
  nonlocal i,chan
  kind=tokens[i];i+=1
  if kind=='End':i+=1;name=joints[parent]['name']+'_End'
  else:name=tokens[i];i+=1
  assert tokens[i]=='{';i+=1
  index=len(joints);j={'name':name,'parent':parent,'offset':None,'channels':[],'start':chan};joints.append(j)
  while tokens[i]!='}':
   t=tokens[i]
   if t=='OFFSET':j['offset']=list(map(float,tokens[i+1:i+4]));i+=4
   elif t=='CHANNELS':
    n=int(tokens[i+1]);j['channels']=tokens[i+2:i+2+n];j['start']=chan;chan+=n;i+=2+n
   elif t in ('JOINT','End'):node(index)
   else:raise ValueError(t)
  i+=1
 node(-1)
 lines=motion.strip().splitlines();frames=int(lines[0].split(':')[1]);dt=float(lines[1].split(':')[1]);data=np.array([list(map(float,l.split())) for l in lines[2:] if l.strip()]);assert data.shape==(frames,chan),(data.shape,frames,chan)
 positions=[];rots=[]
 for j in joints:
  local=np.broadcast_to(np.eye(3),(frames,3,3)).copy();pos=np.broadcast_to(j['offset'],(frames,3)).copy()
  for k,c in enumerate(j['channels']):
   a=data[:,j['start']+k];axis='XYZ'.index(c[0])
   if c.endswith('position'):pos[:,axis]+=a
   else:
    a=np.deg2rad(a);v=np.zeros((frames,3,3));v[:,axis,axis]=1;z=(axis+1)%3;w=(axis+2)%3;v[:,z,z]=np.cos(a);v[:,w,w]=np.cos(a);v[:,z,w]=-np.sin(a);v[:,w,z]=np.sin(a);local=local@v
  parent=j['parent']
  if parent>=0:pos=positions[parent]+np.einsum('fij,fj->fi',rots[parent],pos);local=rots[parent]@local
  positions.append(pos);rots.append(local)
 return joints,data,np.stack(positions,axis=1),np.stack(rots,axis=1),dt

import argparse,hashlib
cli=argparse.ArgumentParser()
cli.add_argument('forward');cli.add_argument('backward');cli.add_argument('--output',default='web/diamondhead-gait-data.js')
args=cli.parse_args();inputs={'FW':args.forward,'BW':args.backward}
out={'source':'The 100STYLE Dataset - Ian Mason','license':'CC BY 4.0','url':'https://www.ianxmason.com/100style/','samples':96,'clips':{}}
for key,act,start,end in [('forward','FW',532,612),('backward','BW',1464,1539)]:
 path=inputs[act];joints,channels,positions,rotations,dt=parse(path);z={'p':positions,'data':channels,'dt':dt,'names':np.array([j['name'] for j in joints])};p=z['p'][start:end];names=list(z['names']);root=p[:,0];travel=z['p'][end,0]-z['p'][start,0];front=travel.copy();front[1]=0;front/=np.linalg.norm(front);front*=1 if act=='FW' else -1;side=np.array([front[2],0,-front[0]])
 local=p-root[:,None,:];x=local@front;y=-local[:,:,1]
 features=[]
 def angle(a,b):
  i=names.index(a);j=names.index(b);return np.arctan2(x[:,j]-x[:,i],y[:,j]-y[:,i])
 def yaw(a,b):
  v=p[:,names.index(b)]-p[:,names.index(a)];return np.arctan2(v@front,v@side)
 torso=angle('Hips','Neck') # near pi for upward vector: convert to small chest tilt
 torso=np.unwrap(torso)-np.pi
 head=np.unwrap(angle('Neck','Head'))-np.pi
 features=[(root[:,1]-root[:,1].mean())*1.2,torso,head,yaw('RightHip','LeftHip'),yaw('RightShoulder','LeftShoulder')]
 keys=['bob','torso','head','pelvisYaw','chestYaw']
 for sideName in ['Right','Left']:
  for suffix,a,b in [('Thigh','Hip','Knee'),('Shin','Knee','Ankle'),('Upper','Shoulder','Elbow'),('Fore','Elbow','Wrist'),('Hand','Wrist','Wrist_End')]:features.append(angle(sideName+a,sideName+b));keys.append(sideName+suffix)
  toe=p[:,names.index(sideName+'Toe')]-p[:,names.index(sideName+'Ankle')];pitch=np.arctan2(-toe[:,1],toe@front)-np.arctan2(9.69983,19.151588);features.append(pitch);keys.append(sideName+'Foot')
 a=np.unwrap(np.stack(features,axis=1),axis=0)
 # Remove small end-to-start drift; low-pass circular Fourier fit gives C-infinity loop seams.
 a-=np.linspace(0,1,len(a),endpoint=False)[:,None]*(a[-1]-a[0])*.7
 spectrum=np.fft.rfft(a,axis=0)/len(a);theta=np.arange(96)/96*2*np.pi;res=np.broadcast_to(spectrum[0].real,(96,a.shape[1])).copy()
 for k in range(1,9):res+=2*np.real(np.exp(1j*k*theta[:,None])*spectrum[k])
 if key=='forward':out['keys']=keys
 dist=np.linalg.norm(travel[[0,2]])*1.2*.90
 out['clips'][key]={'recording':'Neutral_'+act+'.bvh','frames':[start,end],'sourceSha256':hashlib.sha256(Path(path).read_bytes()).hexdigest(),'means':np.round(res.mean(axis=0),6).tolist(),'duration':round((end-start)*float(z['dt']),6),'stride':round(float(dist),4),'values':np.round(res,6).tolist()}
 print(key,'stride',dist,'bob',res[:,0].min(),res[:,0].max())
 print([(k,np.rad2deg(res[:,i]).round(0).min(),np.rad2deg(res[:,i]).round(0).max()) for i,k in enumerate(keys) if i])
Path(args.output).write_text("'use strict';\n// Derived 100STYLE forward and backward walking cycles. Attribution: assets/diamondhead-puppet/MOTION.md\nconst DIAMONDHEAD_GAIT="+json.dumps(out,separators=(',',':'))+';\n')
