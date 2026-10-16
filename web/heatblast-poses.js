'use strict';
// Newly drawn pilot animation. The remaining aliens retain their existing joint rigs.
let heatblastAtlas=null;
const heatblastPoseReady=loadClassicImage('assets/heatblast-poses/atlas-v8.png').then(image=>{if(image.width%6||image.height%8||image.width/6!==image.height/8)throw Error('Invalid Heatblast atlas grid');heatblastAtlas=image;return true}).catch(()=>false);
const heatblastPlayback=new WeakMap(),heatblastRigDraw=drawAlien;
function heatblastCastFrame(v){const s=v.cfg,e=v.elapsed,w=s.windup,d=s.duration||.08,r=Math.max(.01,s.recovery),active=e-w,recovery=Math.max(0,(active-d)/r),pre=Math.max(0,Math.min(.999,e/Math.max(.01,w)));
 if(v.key==='normal'){if(e<w)return 24+Math.min(2,Math.floor(pre*3));if(active<d)return 27;return recovery<.45?28:29;}
 if(v.key==='skill0'){if(e<w)return 30+Math.min(2,Math.floor(pre*3));if(active<d)return 33;return recovery<.45?34:35;}
 if(v.key==='skill1'){if(e<w)return 36+Math.min(2,Math.floor(pre*3));if(active<d)return 39+(Math.floor(active*10)%2);return recovery<.35?40:41;}
 if(v.key==='skill2'){if(e<w)return pre<.2?0:pre<.65?42:43;if(active<d)return 44;return recovery<.55?45:0;}
 if(v.ultimate||v.key==='ultimate'){if(e<w)return pre<.3?45:pre<.7?46:47;if(active<d)return 47-(Math.floor(active*7)%2);return recovery<.35?46:recovery<.7?45:0;}
 return 0;
}
function heatblastPoseFrame(f,t){let state=heatblastPlayback.get(f);if(!state){state={lastY:f.y,airborne:f.y<floor-2,landUntil:0,lastBlock:false,guardAt:0,guardRelease:0};heatblastPlayback.set(f,state)}if(f.y<floor-2)state.airborne=true;if(state.airborne&&f.y>=floor-1){state.landUntil=t+.12;state.airborne=false}state.lastY=f.y;if(f.block&&!state.lastBlock)state.guardAt=t;if(!f.block&&state.lastBlock)state.guardRelease=t+.06;state.lastBlock=!!f.block;
 if(f.hp<=0)return 23;if(f.stun>0)return f.stun>.10?21:22;if(f.block)return t-state.guardAt<.08?19:20;
 if(f.cast)return heatblastCastFrame(f.cast);if(f.jumpWindup>0)return 12;
 if(f.y<floor-3){if(f.vy< -330)return 13;if(f.vy< -85)return 14;if(f.vy<110)return 15;return 16;}
 if(t<state.landUntil)return 17;if(t<state.guardRelease)return 19;if(f.moving)return 6+(Math.floor((f.walk||0)/1.1)%6);return Math.floor(t*7)%6;
}
function heatblastHand(f){return {x:f.x+(f.dir||1)*98*aliens[0].scale,y:f.y-110*aliens[0].scale};}
drawAlien=function(ctx,f,t,portrait=false){if(f.id!==0||portrait||!heatblastAtlas){heatblastRigDraw(ctx,f,t,portrait);return}const frame=heatblastPoseFrame(f,t),cell=heatblastAtlas.width/6,scale=226*aliens[0].scale/(cell*.94),w=cell*scale;
 ctx.save();ctx.translate(f.x,f.y);ctx.scale(f.dir||1,1);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(heatblastAtlas,(frame%6)*cell,Math.floor(frame/6)*cell,cell,cell,-w*.5,-w*.965,w,w);ctx.restore();};
