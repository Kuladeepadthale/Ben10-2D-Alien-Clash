'use strict';
// All-classic drawn key-pose playback uses the registered, quiet Heatblast approach.
const allAlienAtlases={},alienPosePlayback=new WeakMap(),alienPoseRender=new WeakMap();
let allAlienPosesLoaded=false,allAlienPoseError='';
const allAlienPosesReady=Promise.all([heatblastPoseReady,...Object.entries(ALIEN_DRAWN_DATA.characters).map(async([id,data])=>{const image=await loadClassicImage(data.src);if(image.width!==data.width||image.height!==data.height||data.frames.length!==48)throw Error('Invalid pose atlas: '+data.name);allAlienAtlases[id]=image;return true})]).then(results=>{if(results.some(x=>x!==true))throw Error('Some character artwork failed to load.');for(const id of Object.keys(ALIEN_DRAWN_DATA.characters))cleanRegisteredAlienFrame(Number(id),0);allAlienPosesLoaded=true;return true}).catch(e=>{allAlienPoseError=e.message;return false});
const allAlienBlend=document.createElement('canvas');allAlienBlend.width=896;allAlienBlend.height=640;
const previousAlienDraw=drawAlien;
function hasDrawnAlien(id){return id===0?!!heatblastAtlas:!!allAlienAtlases[id];}
function drawnCastFrame(v){const cfg=v.cfg,e=v.elapsed,w=cfg.windup,d=['rush','pounce'].includes(cfg.kind)?Math.max(.42,cfg.duration||.08):cfg.duration||.08,r=Math.max(.01,cfg.recovery),pre=Math.max(0,Math.min(.999,e/Math.max(.01,w))),active=e-w,recovery=Math.max(0,(active-d)/r);
 if(v.ultimate||v.key==='ultimate'){if(e<w)return pre<.3?0:45;if(active<d)return cfg.kind==='leapslam'&&active/d>.985?47:46;return recovery<.7?47:0;}
 if(v.key==='skill2'){if(e<w)return pre<.25?42:43;if(active<d)return 44;return recovery<.35?44:0;}
 const base=v.key==='normal'?24:v.key==='skill0'?30:36;if(e<w)return base+Math.min(2,Math.floor(pre*3));if(active<d)return base+3;return recovery<.45?base+4:base+5;
}
function drawnAlienFrame(f,t){if(f.id===0)return heatblastPoseFrame(f,t);let s=alienPosePlayback.get(f);if(!s){s={airborne:f.y<floor-2,landUntil:0,lastBlock:false,guardAt:0,guardRelease:0};alienPosePlayback.set(f,s)}if(f.y<floor-2)s.airborne=true;if(s.airborne&&f.y>=floor-1){s.landUntil=t+.12;s.airborne=false}if(f.block&&!s.lastBlock)s.guardAt=t;if(!f.block&&s.lastBlock)s.guardRelease=t+.06;s.lastBlock=!!f.block;
 if(f.hp<=0)return 23;if(f.stun>0)return f.stun>.1?21:22;if(f.block)return t-s.guardAt<.08?19:20;if(f.cast)return drawnCastFrame(f.cast);if(f.jumpWindup>0)return 12;if(f.y<floor-3){if(f.vy< -180)return 14;if(f.vy<140)return 15;return 16}if(t<s.landUntil)return 17;if(t<s.guardRelease)return 19;if(f.moving)return locomotionSample(f).frame;return 0;
}
function drawnAlienScale(id){const data=ALIEN_DRAWN_DATA.characters[id];return (id===4?142:226)*aliens[id].scale/data.standingHeight;}
function drawnAlienEmitter(f,v=f.cast){if(!hasDrawnAlien(f.id))return null;if(f.id===0)return heatblastHand(f);const data=ALIEN_DRAWN_DATA.characters[f.id],frame=v?drawnCastFrame({...v,elapsed:v.cfg.windup+.001}):33,m=data.frames[frame],scale=drawnAlienScale(f.id);let x=.95,y=.45;
 if(f.id===6){x=.85;y=.14} // Optic beam exits the eye.
 else if(f.id===7){x=.91;y=.50} // Goo exits the mouth/eyestalk region.
 else if(f.id===5){x=.96;y=.55} // Gadget barrel / throwing hand.
 else if(f.id===9){x=.96;y=.44}
 else if(f.id===8&&(v?.key==='normal'||v?.key==='skill0')){x=.94;y=.17}
 else if(f.id===4){x=.94;y=v?.key==='normal'?.43:.76}
 const hover=f.id===7||f.id===9?6:0;return {x:f.x+(f.dir||1)*(m[2]*x-m[4])*scale,y:f.y-hover+(m[3]*y-m[5])*scale};
}
const cleanAlienFrames=new Map();let cleanAlienFrameUse=0;
function cleanRegisteredAlienFrame(id,frame){const key=id+':'+frame,cached=cleanAlienFrames.get(key);if(cached){cached.used=++cleanAlienFrameUse;return cached.canvas}const data=ALIEN_DRAWN_DATA.characters[id],m=data.frames[frame],cv=document.createElement('canvas');cv.width=m[2];cv.height=m[3];const ctx=cv.getContext('2d');ctx.drawImage(allAlienAtlases[id],m[0],m[1],m[2],m[3],0,0,m[2],m[3]);const runs=data.masks?.[frame];if(runs){const image=ctx.getImageData(0,0,m[2],m[3]),pixels=image.data;let cursor=0;for(let n=0;n<runs.length;n+=2){for(let p=cursor;p<runs[n];p++)pixels[p*4+3]=0;cursor=runs[n]+runs[n+1]}for(let p=cursor;p<m[2]*m[3];p++)pixels[p*4+3]=0;ctx.putImageData(image,0,0)}cleanAlienFrames.set(key,{canvas:cv,used:++cleanAlienFrameUse});if(cleanAlienFrames.size>96){const oldest=[...cleanAlienFrames].reduce((a,b)=>a[1].used<b[1].used?a:b);cleanAlienFrames.delete(oldest[0])}return cv;}
function drawRegisteredAlien(ctx,id,frame,alpha,breath=1){const m=ALIEN_DRAWN_DATA.characters[id].frames[frame],scale=drawnAlienScale(id);ctx.save();ctx.globalAlpha*=alpha;ctx.scale(1,breath);ctx.drawImage(cleanRegisteredAlienFrame(id,frame),0,0,m[2],m[3],-m[4]*scale,-m[5]*scale,m[2]*scale,m[3]*scale);ctx.restore();}
drawAlien=function(ctx,f,t,portrait=false){if(f.id===0||portrait||!allAlienAtlases[f.id]){previousAlienDraw(ctx,f,t,portrait);return}const frame=drawnAlienFrame(f,t);let record=alienPoseRender.get(f);if(!record){record={frame,from:frame,changed:t};alienPoseRender.set(f,record)}if(record.frame!==frame){record.from=record.frame;record.frame=frame;record.changed=t}
 const gait=isLocomotionPose(f,frame)?locomotionSample(f):null;
 const impact=!!f.cast&&f.cast.elapsed>=f.cast.cfg.windup&&f.cast.elapsed<f.cast.cfg.windup+.045,blend=impact?1:Math.max(0,Math.min(1,(t-record.changed)/.035)),quiet=frame===0&&!f.cast&&!f.moving&&!f.block&&f.y>=floor-1,breath=quiet?1+Math.sin(t*Math.PI*2/4.4+f.id*.3)*.0012:1,hover=f.id===7||f.id===9?6:0;
 ctx.save();ctx.beginPath();ctx.rect(f.x-650,f.y-700,1300,700);ctx.clip();ctx.translate(f.x,f.y-hover);ctx.scale(f.dir||1,1);if(f.id===9&&f.inv>0)ctx.globalAlpha*=.28;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 if(gait||blend<1&&record.from!==frame){const mix=allAlienBlend.getContext('2d');mix.setTransform(1,0,0,1,0,0);mix.clearRect(0,0,896,640);mix.save();mix.translate(384,500);mix.globalCompositeOperation='source-over';drawRegisteredAlien(mix,f.id,gait?gait.frame:record.from,1-(gait?gait.blend:blend),breath);mix.globalCompositeOperation='lighter';drawRegisteredAlien(mix,f.id,gait?gait.next:frame,gait?gait.blend:blend,breath);mix.restore();ctx.drawImage(allAlienBlend,-384,-500);}else drawRegisteredAlien(ctx,f.id,frame,1,breath);ctx.restore();};
