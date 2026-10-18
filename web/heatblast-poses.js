'use strict';
// Original illustrated poses with the approved offline image interpolation.
let heatblastAtlas=null;const heatblastAtlases=[];
const heatblastPoseReady=Promise.all(HEATBLAST_SMOOTH.sources.map(async(src,i)=>{const image=await loadClassicImage(src);if(image.width!==HEATBLAST_SMOOTH.width||image.height!==HEATBLAST_SMOOTH.height)throw Error('Invalid Heatblast smooth atlas');heatblastAtlases[i]=image;return true})).then(()=>{heatblastAtlas=heatblastAtlases[0];return true}).catch(()=>false);
const heatblastRigDraw=drawAlien,heatblastPlayback=new WeakMap();
const heatblastUnit=v=>Math.max(0,Math.min(1,v));
function heatblastScale(){return 226*aliens[0].scale/HEATBLAST_SMOOTH.standingHeight;}
function heatblastClipFrame(name,phase,loop=false){const frames=HEATBLAST_SMOOTH.clips[name].frames,p=loop?((phase%1)+1)%1:heatblastUnit(phase);return frames[Math.min(frames.length-1,loop?Math.floor(p*frames.length):Math.round(p*(frames.length-1)))];}
function heatblastActionName(v){return v.ultimate||v.key==='ultimate'?'ultimate':v.key==='normal'?'normal':v.cfg.kind==='beam'||v.key==='skill1'?'jet':v.cfg.kind==='eruption'||v.key==='skill2'?'eruption':'fireball';}
function heatblastCastFrame(v){const name=heatblastActionName(v),cfg=v.cfg,e=v.elapsed,w=Math.max(.001,cfg.windup),d=Math.max(.001,cfg.duration||.08),r=Math.max(.001,cfg.recovery);return e<w?heatblastClipFrame(name+'Windup',e/w):e<w+d?heatblastClipFrame(name+'Windup',1):heatblastClipFrame(name+'Recovery',(e-w-d)/r);}
function heatblastPoseFrame(f,t){let s=heatblastPlayback.get(f);if(!s){s={lastTime:t,guard:0,hitUntil:0,hitAt:t,wasHit:false,dead:false,koAt:t,airborne:f.y<floor-2,landUntil:0,jumpAt:t,preparing:false,walking:false,walkAt:t,walkOrigin:f.walk||0,phase:0,exitAt:-100,exitKey:6,lastFrame:0};heatblastPlayback.set(f,s)}
 const dt=Math.max(0,Math.min(.1,t-s.lastTime));s.lastTime=t;s.guard=heatblastUnit(s.guard+(f.block?1:-1)*dt/.12);
 if(f.stun>0&&!s.wasHit){s.hitAt=t;s.hitUntil=t+.28;}s.wasHit=f.stun>0;
 if(f.hp<=0&&!s.dead)s.koAt=t;s.dead=f.hp<=0;
 if(f.jumpWindup>0&&!s.preparing)s.jumpAt=t;s.preparing=f.jumpWindup>0;
 if(f.y<floor-2)s.airborne=true;if(s.airborne&&f.y>=floor-1){s.landUntil=t+.14;s.airborne=false;}
 const walking=!!f.moving&&f.y>=floor-1&&f.hp>0&&!f.stun&&!f.block&&!f.cast&&!f.jumpWindup;
 if(walking&&!s.walking){s.walkAt=t;s.walkOrigin=f.walk||0;s.phase=0;s.exitAt=-100;}
 if(typeof cartoonGaitPhase==='function')s.phase=cartoonGaitPhase(f,s,t,walking);else if(walking){if(t-s.walkAt<.07)s.walkOrigin=f.walk||0;else s.phase=(((f.walk||0)-s.walkOrigin)/1.1/6%1+1)%1;}
 if(!walking&&s.walking){s.exitAt=t;s.exitKey=6+(Math.round(s.phase*6)%6);}s.walking=walking;
 let frame=0;
 if(f.hp<=0)frame=heatblastClipFrame('ko',(t-s.koAt)/.4);
 else if(f.block)frame=heatblastClipFrame('guard',s.guard);
 else if(f.stun>0||t<s.hitUntil)frame=heatblastClipFrame('hit',t-s.hitAt<.04?(t-s.hitAt)/.04/3:1/3+(t-s.hitAt-.04)/.24*2/3);
 else if(f.cast)frame=heatblastCastFrame(f.cast);
 else if(f.jumpWindup>0)frame=heatblastClipFrame('jumpPrepare',(t-s.jumpAt)/.07);
 else if(f.y<floor-3)frame=f.vy<0?heatblastClipFrame('jumpRise',((f.vy||0)+520)/520):heatblastClipFrame('jumpFall',(f.vy||0)/520);
 else if(t<s.landUntil)frame=heatblastClipFrame('land',1-(s.landUntil-t)/.14);
 else if(s.guard>0)frame=heatblastClipFrame('guard',s.guard);
 else if(walking)frame=t-s.walkAt<.07?heatblastClipFrame('walkEnter',(t-s.walkAt)/.07):heatblastClipFrame('walk',s.phase,true);
 else if(t-s.exitAt<.1)frame=heatblastClipFrame('walkExit'+s.exitKey,(t-s.exitAt)/.1);
 s.lastFrame=frame;return frame;
}
function heatblastHand(f){const name=f.cast?heatblastActionName(f.cast):'fireball',hand=HEATBLAST_SMOOTH.emitters[name],scale=heatblastScale();return {x:f.x+(f.dir||1)*(hand[0]-HEATBLAST_SMOOTH.originX)*scale,y:f.y+(hand[1]-HEATBLAST_SMOOTH.ground)*scale};}
// These shared helpers remain unchanged for the other aliens.
function locomotionSample(f){const stride=f.id===3?1.05:f.id===4?1:1.1,phase=((f.walk||0)/stride%6+6)%6,index=Math.floor(phase),u=phase-index;return {frame:6+index,next:6+(index+1)%6,blend:u*u*(3-2*u)};}
function isLocomotionPose(f,frame){return frame>=6&&frame<=11&&!!f.moving&&f.hp>0&&!(f.stun>0)&&!f.block&&!f.cast&&!(f.jumpWindup>0)&&f.y>=floor-1;}
// Cache only recently used sharpened cells: bounded memory on Android.
// RGB sharpening preserves the original alpha silhouette and frame registration.
const heatblastSharpFrames=new Map(),HEATBLAST_SHARP_LIMIT=32;
function heatblastSharpCell(frame){
 if(typeof document==='undefined')return null;
 if(heatblastSharpFrames.has(frame)){const cell=heatblastSharpFrames.get(frame);heatblastSharpFrames.delete(frame);heatblastSharpFrames.set(frame,cell);return cell;}
 const d=HEATBLAST_SMOOTH,n=d.cell,j=frame%d.sheetFrames,cv=document.createElement('canvas');cv.width=cv.height=n;
 const cx=cv.getContext('2d',{willReadFrequently:true});if(!cx)return null;
 cx.drawImage(heatblastAtlases[Math.floor(frame/d.sheetFrames)],j%d.columns*n,Math.floor(j/d.columns)*n,n,n,0,0,n,n);
 try{
 const pixels=cx.getImageData(0,0,n,n),src=new Uint8ClampedArray(pixels.data),out=pixels.data;
 for(let y=1;y<n-1;y++)for(let x=1;x<n-1;x++){
  const k=(y*n+x)*4;
  // Leave translucent edges alone to prevent dark outlines or bright halos.
  if(src[k+3]<240||src[k-4+3]<240||src[k+4+3]<240||src[k-n*4+3]<240||src[k+n*4+3]<240)continue;
  for(let channel=0;channel<3;channel++){
   const i=k+channel,blur=(src[i-4]+src[i+4]+src[i-n*4]+src[i+n*4])/4;
   out[i]=src[i]+Math.max(-16,Math.min(16,(src[i]-blur)*.65));
  }
 }
 cx.putImageData(pixels,0,0);
 }catch{return null;}
 heatblastSharpFrames.set(frame,cv);
 if(heatblastSharpFrames.size>HEATBLAST_SHARP_LIMIT)heatblastSharpFrames.delete(heatblastSharpFrames.keys().next().value);
 return cv;
}
function drawRegisteredHeatblast(ctx,frame,breath=1){const data=HEATBLAST_SMOOTH,cell=data.cell,scale=heatblastScale(),local=frame%data.sheetFrames;ctx.save();ctx.scale(1,breath);const balanced=typeof settings!=='undefined'&&settings.quality==='balanced',sharp=balanced?null:heatblastSharpCell(frame);ctx.drawImage(sharp||heatblastAtlases[Math.floor(frame/data.sheetFrames)],sharp?0:(local%data.columns)*cell,sharp?0:Math.floor(local/data.columns)*cell,cell,cell,-data.originX*scale,-data.ground*scale,cell*scale,cell*scale);ctx.restore();}
drawAlien=function(ctx,f,t,portrait=false){if(f.id!==0||portrait||!heatblastAtlas){heatblastRigDraw(ctx,f,t,portrait);return}const frame=heatblastPoseFrame(f,t),quiet=frame===0&&!f.cast&&!f.moving&&!f.block&&!f.stun&&f.hp>0&&f.y>=floor-1,breath=quiet?1+Math.sin(t*Math.PI*2/4.4)*.0012:1;ctx.save();ctx.beginPath();ctx.rect(f.x-650,f.y-650,1300,f.y<floor-1?780:650);ctx.clip();ctx.translate(f.x,f.y);ctx.scale(f.dir||1,1);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';drawRegisteredHeatblast(ctx,frame,breath);ctx.restore();};

