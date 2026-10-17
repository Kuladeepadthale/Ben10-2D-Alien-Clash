'use strict';
// Newly drawn pilot animation. The remaining aliens retain their existing joint rigs.
let heatblastAtlas=null;
const heatblastPoseReady=loadClassicImage('assets/heatblast-poses/atlas-v8.png').then(image=>{if(image.width%6||image.height%8||image.width/6!==image.height/8)throw Error('Invalid Heatblast atlas grid');heatblastAtlas=image;return true}).catch(()=>false);
const heatblastPlayback=new WeakMap(),heatblastRigDraw=drawAlien;
function heatblastCastFrame(v){const s=v.cfg,e=v.elapsed,w=s.windup,d=s.duration||.08,r=Math.max(.01,s.recovery),active=e-w,recovery=Math.max(0,(active-d)/r),pre=Math.max(0,Math.min(.999,e/Math.max(.01,w)));
 if(v.key==='normal'){if(e<w)return 24+Math.min(2,Math.floor(pre*3));if(active<d)return 27;return recovery<.45?28:29;}
 if(v.key==='skill0'){if(e<w)return 30+Math.min(2,Math.floor(pre*3));if(active<d)return 33;return recovery<.45?34:35;}
 if(v.key==='skill1'){if(e<w)return 36+Math.min(2,Math.floor(pre*3));if(active<d)return 39;return recovery<.35?40:41;}
 if(v.key==='skill2'){if(e<w)return pre<.2?0:pre<.65?42:43;if(active<d)return 44;return recovery<.55?45:0;}
 if(v.ultimate||v.key==='ultimate'){if(e<w)return pre<.3?45:pre<.7?46:47;if(active<d)return 47;return recovery<.35?46:recovery<.7?45:0;}
 return 0;
}
function heatblastPoseFrame(f,t){let state=heatblastPlayback.get(f);if(!state){state={lastY:f.y,airborne:f.y<floor-2,landUntil:0,lastBlock:false,guardAt:0,guardRelease:0};heatblastPlayback.set(f,state)}if(f.y<floor-2)state.airborne=true;if(state.airborne&&f.y>=floor-1){state.landUntil=t+.12;state.airborne=false}state.lastY=f.y;if(f.block&&!state.lastBlock)state.guardAt=t;if(!f.block&&state.lastBlock)state.guardRelease=t+.06;state.lastBlock=!!f.block;
 if(f.hp<=0)return 23;if(f.stun>0)return f.stun>.10?21:22;if(f.block)return t-state.guardAt<.08?19:20;
 if(f.cast)return heatblastCastFrame(f.cast);if(f.jumpWindup>0)return 12;
 if(f.y<floor-3){if(f.vy< -180)return 14;if(f.vy<140)return 15;return 16;}
 if(t<state.landUntil)return 17;if(t<state.guardRelease)return 19;if(f.moving)return locomotionSample(f).frame;return 0;
}
// Primary silhouette bounds, torso pivots and foot baselines measured on the 181px cells.
// The varying cell padding must not move the fighter or draw neighboring-row fragments.
const heatblastRegistration=[
 [46,12,159,176,104,177],[41,13,162,176,100,177],[37,13,150,176,101,177],[33,14,151,176,92,177],[30,13,144,176,90,177],[26,13,138,176,84,177],
 [34,7,170,174,99,175],[38,9,166,171,103,172],[29,8,147,174,93,175],[16,7,142,174,81,175],[20,10,141,174,88,175],[10,7,139,174,74,175],
 [36,34,164,179,101,180],[21,20,166,178,107,179],[44,13,135,155,103,156],[32,6,168,158,109,159],[22,13,158,178,106,179],[27,56,149,179,86,180],
 [32,10,148,167,94,168],[27,15,163,167,100,168],[29,18,155,167,98,168],[42,20,171,170,135,171],[21,18,147,168,92,169],[0,103,160,163,89,164],
 [32,3,148,165,95,166],[22,6,159,166,101,167],[13,6,180,165,85,166],[13,4,176,166,77,167],[23,7,151,166,92,167],[22,4,143,165,88,166],
 [32,1,148,161,97,162],[19,5,160,159,98,160],[10,4,150,159,86,160],[1,14,173,159,81,160],[15,12,174,160,89,161],[23,3,142,161,90,162],
 [36,0,147,155,99,156],[15,0,169,148,102,149],[19,2,163,149,93,150],[0,5,163,150,84,151],[7,5,163,153,91,154],[20,3,138,155,85,156],
 [33,46,172,154,112,155],[40,37,154,158,111,159],[13,43,171,154,92,155],[32,15,152,155,87,156],[32,0,147,159,91,160],[31,0,144,161,95,162]
];
// Sample the complete interval, including 11 -> 6 and negative/backward phases.
// Smoothstep gives zero blend velocity at each authored key; no short snap/hold.
function locomotionSample(f){const stride=f.id===3?1.05:f.id===4?1:1.1,phase=((f.walk||0)/stride%6+6)%6,index=Math.floor(phase),u=phase-index;return {frame:6+index,next:6+(index+1)%6,blend:u*u*(3-2*u)};}
function isLocomotionPose(f,frame){return frame>=6&&frame<=11&&!!f.moving&&f.hp>0&&!(f.stun>0)&&!f.block&&!f.cast&&!(f.jumpWindup>0)&&f.y>=floor-1;}
const heatblastRenderState=new WeakMap();
const heatblastBlendCanvas=document.createElement('canvas');heatblastBlendCanvas.width=heatblastBlendCanvas.height=512;
function heatblastScale(){return 226*aliens[0].scale/165;}
function heatblastHand(f){const beam=f.cast?.key==='skill1',meta=heatblastRegistration[beam?39:33],hand=beam?[155,74]:[160,80],scale=heatblastScale();return {x:f.x+(f.dir||1)*(hand[0]-meta[4])*scale,y:f.y+(hand[1]-meta[5])*scale};}
function drawRegisteredHeatblast(ctx,frame,alpha,breath=1){const m=heatblastRegistration[frame],cell=181,scale=heatblastScale(),x0=Math.max(0,m[0]-1),y0=Math.max(0,m[1]-1),sw=Math.min(181,m[2]+2)-x0,sh=m[5]-y0;
 ctx.save();ctx.globalAlpha*=alpha;ctx.scale(1,breath);ctx.drawImage(heatblastAtlas,(frame%6)*cell+x0,Math.floor(frame/6)*cell+y0,sw,sh,(x0-m[4])*scale,(y0-m[5])*scale,sw*scale,sh*scale);ctx.restore();}
drawAlien=function(ctx,f,t,portrait=false){if(f.id!==0||portrait||!heatblastAtlas){heatblastRigDraw(ctx,f,t,portrait);return}const frame=heatblastPoseFrame(f,t);let record=heatblastRenderState.get(f);if(!record){record={frame,from:frame,changed:t};heatblastRenderState.set(f,record)}if(frame!==record.frame){record.from=record.frame;record.frame=frame;record.changed=t;}
 const gait=isLocomotionPose(f,frame)?locomotionSample(f):null;
 const impact=!!f.cast&&f.cast.elapsed>=f.cast.cfg.windup&&f.cast.elapsed<f.cast.cfg.windup+.045,transition=impact?1:Math.max(0,Math.min(1,(t-record.changed)/.035)),quiet=frame===0&&!f.cast&&!f.moving&&!f.block&&f.y>=floor-1,breath=quiet?1+Math.sin(t*Math.PI*2/4.4)*.0012:1;
 ctx.save();ctx.beginPath();ctx.rect(f.x-600,f.y-650,1200,650);ctx.clip();ctx.translate(f.x,f.y);ctx.scale(f.dir||1,1);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';if(gait||transition<1&&record.from!==frame){const mix=heatblastBlendCanvas.getContext('2d');mix.setTransform(1,0,0,1,0,0);mix.clearRect(0,0,512,512);mix.save();mix.translate(256,400);mix.globalCompositeOperation='source-over';drawRegisteredHeatblast(mix,gait?gait.frame:record.from,1-(gait?gait.blend:transition),breath);mix.globalCompositeOperation='lighter';drawRegisteredHeatblast(mix,gait?gait.next:frame,gait?gait.blend:transition,breath);mix.restore();ctx.drawImage(heatblastBlendCanvas,-256,-400);}else drawRegisteredHeatblast(ctx,frame,1,breath);ctx.restore();};
