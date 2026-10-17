'use strict';
// Preserve the actual classic Diamondhead illustration: no generated replacement art.
const diamondheadPuppetReady=classicReady.then(()=>!!classicPortraits[2]).catch(()=>false);
const diamondheadPuppetMotion=new WeakMap(),diamondheadOriginalRecords=new WeakMap();
const diamondheadPreviousDraw=drawAlien,diamondheadPreviousEmitter=drawnAlienEmitter;
const diamondheadGaitIndex=Object.fromEntries(DIAMONDHEAD_GAIT.keys.map((name,i)=>[name,i]));
const diamondheadClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function diamondheadGaitSample(clip,phase){const a=DIAMONDHEAD_GAIT.clips[clip].values,n=a.length,p=((phase%1)+1)%1*n,i=Math.floor(p),u=p-i;return a[i].map((v,j)=>{const p0=a[(i+n-1)%n][j],p2=a[(i+1)%n][j],p3=a[(i+2)%n][j];return .5*((2*v)+(-p0+p2)*u+(2*p0-5*v+4*p2-p3)*u*u+(-p0+3*v-3*p2+p3)*u*u*u)});}
function diamondheadMovement(f,t){let s=diamondheadPuppetMotion.get(f);if(!s){s={last:t,weight:0,travel:f.walk||0,phase:0,clip:'forward',pose:null};diamondheadPuppetMotion.set(f,s)}const dt=Math.max(0,Math.min(.05,t-s.last)),delta=(f.walk||0)-s.travel,walking=!!f.moving,ease=1-Math.exp(-dt*13);s.weight+=((walking?1:0)-s.weight)*ease;
 if(walking&&Math.abs(delta)>1e-8){const next=delta<0?'backward':'forward';if(next!==s.clip){const current=diamondheadGaitSample(s.clip,s.phase);let best=Infinity,bestPhase=s.phase;for(let i=0;i<96;i++){const candidate=diamondheadGaitSample(next,i/96);let cost=0;for(const name of ['RightThigh','RightShin','LeftThigh','LeftShin']){const k=diamondheadGaitIndex[name];cost+=(candidate[k]-current[k])**2}if(cost<best){best=cost;bestPhase=i/96}}s.phase=bestPhase;s.clip=next}const stride=DIAMONDHEAD_GAIT.clips[s.clip].stride*(226*aliens[2].scale/240)/.90;s.phase=(s.phase+Math.abs(delta)*20/stride)%1;}
 const target=diamondheadGaitSample(s.clip,s.phase),follow=1-Math.exp(-dt*48);if(!s.pose)s.pose=target;else for(let i=0;i<target.length;i++)s.pose[i]+=(target[i]-s.pose[i])*follow;s.travel=f.walk||0;s.last=t;return s;
}
function diamondheadNeutral(f){return f.hp>0&&!(f.stun>0)&&!f.block&&!f.cast&&!(f.jumpWindup>0)&&f.y>=floor-1;}
function diamondheadRig(){if(rigGPU===undefined)rigGPU=initRigGPU();return buildJointRig(2,rigGPU&&!rigGPULost?18:10,rigGPU&&!rigGPULost?28:18);}
function diamondheadRigAngles(f,t,rig){const neutral=diamondheadNeutral(f),pose=movementPose(f,t);let angles=jointTargets(f,pose,t),motion=null;
 if(neutral){motion=diamondheadMovement(f,t);angles=Object.fromEntries(rig.bones.map(b=>[b.name,0]));const w=motion.weight,means=DIAMONDHEAD_GAIT.clips[motion.clip].means,get=name=>motion.pose[diamondheadGaitIndex[name]],variation=name=>get(name)-means[diamondheadGaitIndex[name]];
  angles.waist=(variation('torso')*.4+variation('pelvisYaw')*.12)*w;angles.chest=(variation('torso')*.6+variation('chestYaw')*.12)*w;angles.head=-angles.waist-angles.chest+variation('head')*.4*w;
  for(const group of rig.bones.filter(b=>b.name.startsWith('leg_')&&b.name.endsWith('0'))){const side=group.name.includes('left')?'Right':'Left',prefix=group.name.slice(0,-1),bones=[0,1,2].map(n=>rig.bones.find(b=>b.name===prefix+n)),bind=b=>Math.atan2(b.tip[0]-b.at[0],b.tip[1]-b.at[1]),thighDelta=(get(side+'Thigh')-bind(bones[0]))*w,shinDelta=(get(side+'Shin')-bind(bones[1]))*w;
   angles[prefix+'0']=thighDelta-angles.waist;angles[prefix+'1']=shinDelta-thighDelta;angles[prefix+'2']=diamondheadClamp(get(side+'Foot'),-.35,.65)*w-shinDelta;
  }
  for(const sideName of ['left','right']){const side=sideName==='left'?'Right':'Left',prefix='arm_'+sideName,upper=variation(side+'Upper')*w,fore=variation(side+'Fore')*w,hand=variation(side+'Hand')*.6*w;angles[prefix+'0']=upper-angles.waist-angles.chest;angles[prefix+'1']=fore-upper;angles[prefix+'2']=hand-fore;}
 }else diamondheadPuppetMotion.delete(f);
 return {angles,pose,motion,neutral};
}
function diamondheadSamplePoint(points,u,v){const rows=points.length-1,cols=points[0].length-1,x=u*cols,y=v*rows,ix=Math.min(cols-1,Math.floor(x)),iy=Math.min(rows-1,Math.floor(y)),fx=x-ix,fy=y-iy;return [0,1].map(k=>(points[iy][ix][k]*(1-fx)+points[iy][ix+1][k]*fx)*(1-fy)+(points[iy+1][ix][k]*(1-fx)+points[iy+1][ix+1][k]*fx)*fy);}
function diamondheadFloorOffset(points){return Math.max(...[[.24,.998],[.35,.998],[.75,.965],[.86,.965]].map(([u,v])=>diamondheadSamplePoint(points,u,v)[1]))-366;}
function diamondheadWorldBones(rig,angles){const world=[];for(const b of rig.bones){const parent=b.parent<0?null:rig.bones[b.parent],local=jointMatrix(b.at[0]-(parent?parent.at[0]:0),b.at[1]-(parent?parent.at[1]:0),angles[b.name]||0);world[b.index]=parent?matrixMultiply(world[b.parent],local):local;}return world;}
// Gap-free CPU fallback. Rasterize the continuous original texture without padded clips.
const diamondheadCanvas=document.createElement('canvas');diamondheadCanvas.width=diamondheadCanvas.height=384;
let diamondheadTexture=null,diamondheadPixels=null;
function diamondheadRenderFrame(rig,points){if(rigGPU&&!rigGPULost){const frame=drawRigImage(2,points,rig.cols,rig.rows);if(rigGPU&&!rigGPULost)return frame;}const ctx=diamondheadCanvas.getContext('2d'),img=classicPortraits[2];
 if(!diamondheadTexture){const source=document.createElement('canvas');source.width=img.width;source.height=img.height;const sc=source.getContext('2d');sc.drawImage(img,0,0);diamondheadTexture=sc.getImageData(0,0,img.width,img.height);diamondheadPixels=ctx.createImageData(384,384);}
 const out=diamondheadPixels.data,src=diamondheadTexture.data,iw=img.width,ih=img.height;out.fill(0);
 function triangle(s0,s1,s2,a,b,c){const den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(den)<1e-7)return;const x0=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),x1=Math.min(383,Math.ceil(Math.max(a[0],b[0],c[0]))),y0=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),y1=Math.min(383,Math.ceil(Math.max(a[1],b[1],c[1]))),dx0=(b[1]-c[1])/den,dx1=(c[1]-a[1])/den;
  for(let y=y0;y<=y1;y++){let w0=((b[1]-c[1])*(x0+.5-c[0])+(c[0]-b[0])*(y+.5-c[1]))/den,w1=((c[1]-a[1])*(x0+.5-c[0])+(a[0]-c[0])*(y+.5-c[1]))/den;for(let x=x0;x<=x1;x++,w0+=dx0,w1+=dx1){const w2=1-w0-w1;if(w0< -1e-7||w1< -1e-7||w2< -1e-7)continue;
   const u=Math.max(0,Math.min(iw-1,s0[0]*w0+s1[0]*w1+s2[0]*w2-.5)),v=Math.max(0,Math.min(ih-1,s0[1]*w0+s1[1]*w1+s2[1]*w2-.5)),ix=Math.floor(u),iy=Math.floor(v),fx=u-ix,fy=v-iy,p00=(iy*iw+ix)*4,p10=(iy*iw+Math.min(iw-1,ix+1))*4,p01=(Math.min(ih-1,iy+1)*iw+ix)*4,p11=(Math.min(ih-1,iy+1)*iw+Math.min(iw-1,ix+1))*4,k0=(1-fx)*(1-fy),k1=fx*(1-fy),k2=(1-fx)*fy,k3=fx*fy,a0=src[p00+3]*k0,a1=src[p10+3]*k1,a2=src[p01+3]*k2,a3=src[p11+3]*k3,alpha=a0+a1+a2+a3;if(alpha<.01)continue;const dest=(y*384+x)*4,remaining=1-alpha/255,oldAlpha=out[dest+3]*remaining,total=alpha+oldAlpha;for(let ch=0;ch<3;ch++)out[dest+ch]=(src[p00+ch]*a0+src[p10+ch]*a1+src[p01+ch]*a2+src[p11+ch]*a3+out[dest+ch]*oldAlpha)/total;out[dest+3]=total;
  }}
 }
 for(let y=0;y<rig.rows;y++)for(let x=0;x<rig.cols;x++){const a=[x/rig.cols*iw,y/rig.rows*ih],b=[(x+1)/rig.cols*iw,y/rig.rows*ih],d=[x/rig.cols*iw,(y+1)/rig.rows*ih],e=[(x+1)/rig.cols*iw,(y+1)/rig.rows*ih];triangle(a,b,d,points[y][x],points[y][x+1],points[y+1][x]);triangle(b,e,d,points[y][x+1],points[y+1][x+1],points[y+1][x]);}
 ctx.putImageData(diamondheadPixels,0,0);return diamondheadCanvas;
}
function diamondheadExactArtwork(ctx,f){const image=classicPortraits[2],height=226*aliens[2].scale,width=height*image.width/image.height;ctx.save();ctx.translate(f.x,f.y);ctx.scale(f.dir||1,1);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(image,-width/2,-height,width,height);ctx.restore();}
function drawOriginalDiamondhead(ctx,f,t){const rig=diamondheadRig(),state=diamondheadRigAngles(f,t,rig);if(state.neutral&&state.motion.weight<.001){diamondheadExactArtwork(ctx,f);diamondheadOriginalRecords.delete(f);return}
 let record=diamondheadOriginalRecords.get(f);if(!record){record={angles:{...state.angles},last:t};diamondheadOriginalRecords.set(f,record)}const dt=Math.max(0,Math.min(.05,t-record.last)),blend=1-Math.exp(-dt*(state.neutral?40:30));for(const name in state.angles)record.angles[name]+=(state.angles[name]-record.angles[name])*blend;record.last=t;
 const points=skinJointRig(rig,record.angles),frame=diamondheadRenderFrame(rig,points),scale=226*aliens[2].scale/rig.h,ground=f.y>=floor-1&&!state.pose.ko?diamondheadFloorOffset(points):0;
 ctx.save();ctx.beginPath();ctx.rect(f.x-500,f.y-650,1000,650);ctx.clip();ctx.translate(f.x+(f.dir||1)*state.pose.shift,f.y-ground*scale);ctx.scale(f.dir||1,1);if(state.pose.ko)ctx.rotate(-1.42);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(frame,-192*scale,-366*scale,384*scale,384*scale);ctx.restore();
}
drawAlien=function(ctx,f,t,portrait=false){if(f.id!==2||portrait||!classicPortraits[2]){diamondheadPreviousDraw(ctx,f,t,portrait);return}drawOriginalDiamondhead(ctx,f,t);};
drawnAlienEmitter=function(f,v=f.cast){if(f.id!==2||!classicPortraits[2])return diamondheadPreviousEmitter(f,v);const rig=diamondheadRig(),source=v?{...f,cast:{...v,elapsed:v.cfg.windup+.001}}:f,state=diamondheadRigAngles(source,typeof time==='number'?time:0,rig),record=diamondheadOriginalRecords.get(f),angles=record?.angles||state.angles,bone=rig.bones.find(b=>b.name==='arm_right2'),world=diamondheadWorldBones(rig,angles)[bone.index],dx=bone.tip[0]-bone.at[0],dy=bone.tip[1]-bone.at[1],x=world[0]*dx+world[2]*dy+world[4],y=world[1]*dx+world[3]*dy+world[5],scale=226*aliens[2].scale/rig.h,ground=f.y>=floor-1?diamondheadFloorOffset(skinJointRig(rig,angles)):0;return {x:f.x+(f.dir||1)*((x-192)*scale+state.pose.shift),y:f.y+(y-366-ground)*scale};};
