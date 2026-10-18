'use strict';
// All actions use offline bidirectional interpolation, as approved for Heatblast.
const smoothAlienSheets={},smoothAlienPlayback=new WeakMap(),smoothAlienLoading=new Map();
let smoothAlienUse=0;const smoothAlienUsed={};
function loadSmoothAlien(id){
 if(smoothAlienLoading.has(id))return;
 const d=ALIEN_SMOOTH[id];
 smoothAlienLoading.set(id,Promise.all(d.sources.map(async src=>{const image=await loadClassicImage(src);if(image.width!==d.width||image.height!==d.height)throw Error('Invalid smooth alien sheet: '+src);return image})).then(sheets=>{
  smoothAlienSheets[id]=sheets;smoothAlienUsed[id]=++smoothAlienUse;
  const ids=Object.keys(smoothAlienSheets);if(ids.length>2){const oldest=ids.sort((a,b)=>smoothAlienUsed[a]-smoothAlienUsed[b])[0];delete smoothAlienSheets[oldest];smoothAlienLoading.delete(Number(oldest));}
 }).catch(e=>{allAlienPoseError=e.message;}));
}
function smoothAlienClipFrame(id,name,phase,loop=false){const frames=ALIEN_SMOOTH[id].clips[name].frames,p=loop?((phase%1)+1)%1:heatblastUnit(phase);return frames[Math.min(frames.length-1,loop?Math.floor(p*frames.length):Math.round(p*(frames.length-1)))];}
function smoothAlienCastFrame(v,id){const name=v.ultimate||v.key==='ultimate'?'ultimate':v.key==='normal'?'normal':v.key==='skill2'?'eruption':v.key==='skill1'?'jet':'fireball',cfg=v.cfg,e=v.elapsed,w=Math.max(.001,cfg.windup),d=Math.max(.001,['rush','pounce'].includes(cfg.kind)?Math.max(.42,cfg.duration||.08):cfg.duration||.08),r=Math.max(.001,cfg.recovery);return e<w?smoothAlienClipFrame(id,name+'Windup',e/w):e<w+d?smoothAlienClipFrame(id,name+'Windup',1):smoothAlienClipFrame(id,name+'Recovery',(e-w-d)/r);}
function smoothAlienPoseFrame(f,t){let s=smoothAlienPlayback.get(f);if(!s){s={lastTime:t,guard:0,hitUntil:0,hitAt:t,wasHit:false,dead:false,koAt:t,airborne:f.y<floor-2,landUntil:0,jumpAt:t,preparing:false,walking:false,walkAt:t,walkOrigin:f.walk||0,phase:0,exitAt:-100,exitKey:6,lastFrame:0};smoothAlienPlayback.set(f,s)}
 const dt=Math.max(0,Math.min(.1,t-s.lastTime));s.lastTime=t;s.guard=heatblastUnit(s.guard+(f.block?1:-1)*dt/.12);
 if(f.stun>0&&!s.wasHit){s.hitAt=t;s.hitUntil=t+.28;}s.wasHit=f.stun>0;
 if(f.hp<=0&&!s.dead)s.koAt=t;s.dead=f.hp<=0;
 if(f.jumpWindup>0&&!s.preparing)s.jumpAt=t;s.preparing=f.jumpWindup>0;
 if(f.y<floor-2)s.airborne=true;if(s.airborne&&f.y>=floor-1){s.landUntil=t+.14;s.airborne=false;}
 const walking=!!f.moving&&f.y>=floor-1&&f.hp>0&&!f.stun&&!f.block&&!f.cast&&!f.jumpWindup;
 if(walking&&!s.walking){s.walkAt=t;s.walkOrigin=f.walk||0;s.phase=0;s.exitAt=-100;}
 if(walking){if(t-s.walkAt<.07)s.walkOrigin=f.walk||0;else s.phase=(((f.walk||0)-s.walkOrigin)/1.1/6%1+1)%1;}
 if(!walking&&s.walking){s.exitAt=t;s.exitKey=6+(Math.round(s.phase*6)%6);}s.walking=walking;
 let frame=0;
 if(f.hp<=0)frame=smoothAlienClipFrame(f.id,'ko',(t-s.koAt)/.4);
 else if(f.block)frame=smoothAlienClipFrame(f.id,'guard',s.guard);
 else if(f.stun>0||t<s.hitUntil)frame=smoothAlienClipFrame(f.id,'hit',t-s.hitAt<.04?(t-s.hitAt)/.04/3:1/3+(t-s.hitAt-.04)/.24*2/3);
 else if(f.cast)frame=smoothAlienCastFrame(f.cast,f.id);
 else if(f.jumpWindup>0)frame=smoothAlienClipFrame(f.id,'jumpPrepare',(t-s.jumpAt)/.07);
 else if(f.y<floor-3)frame=f.vy<0?smoothAlienClipFrame(f.id,'jumpRise',((f.vy||0)+520)/520):smoothAlienClipFrame(f.id,'jumpFall',(f.vy||0)/520);
 else if(t<s.landUntil)frame=smoothAlienClipFrame(f.id,'land',1-(s.landUntil-t)/.14);
 else if(s.guard>0)frame=smoothAlienClipFrame(f.id,'guard',s.guard);
 else if(walking)frame=t-s.walkAt<.07?smoothAlienClipFrame(f.id,'walkEnter',(t-s.walkAt)/.07):smoothAlienClipFrame(f.id,'walk',s.phase,true);
 else if(t-s.exitAt<.1)frame=smoothAlienClipFrame(f.id,'walkExit'+s.exitKey,(t-s.exitAt)/.1);
 s.lastFrame=frame;return frame;
}

const smoothAlienPreviousDraw=drawAlien;
drawAlien=function(ctx,f,t,portrait=false){const d=ALIEN_SMOOTH[f.id],sheets=smoothAlienSheets[f.id];if(d&&!portrait){smoothAlienUsed[f.id]=++smoothAlienUse;if(!sheets)loadSmoothAlien(f.id);}if(portrait||!d||!sheets||sheets.length!==d.sources.length){smoothAlienPreviousDraw(ctx,f,t,portrait);return;}
 const frame=smoothAlienPoseFrame(f,t),local=frame%d.sheetFrames,scale=(f.id===4?142:226)*aliens[f.id].scale/d.standingHeight,hover=f.id===7||f.id===9?6:0;
 const quiet=frame===0&&!f.cast&&!f.moving&&!f.block&&!f.stun&&f.y>=floor-1,breath=quiet?1+Math.sin(t*Math.PI*2/4.4+f.id*.3)*.0012:1;
 ctx.save();ctx.translate(f.x,f.y-hover);ctx.scale(f.dir||1,breath);if(f.id===9&&f.inv>0)ctx.globalAlpha*=.28;
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 const sheet=sheets[Math.floor(frame/d.sheetFrames)],sharp=alienClarityCell(f.id,frame,sheet,d);
 ctx.drawImage(sharp||sheet,sharp?0:local%d.columns*d.cell,sharp?0:Math.floor(local/d.columns)*d.cell,d.cell,d.cell,-d.originX*scale,-d.ground*scale,d.cell*scale,d.cell*scale);ctx.restore();
};

